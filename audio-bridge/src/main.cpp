// 3V0L Audio Bridge
// Windows process-loopback capture with optional system render-loopback and LAN PCM transport.
// System mode captures audio rendered by the default Windows playback device; microphone
// input is not included unless it is itself being played through the speakers.

#include <windows.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <avrt.h>
#include <wrl.h>
#include <wrl/implements.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <ksmedia.h>

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#pragma comment(lib, "ws2_32.lib")
using Microsoft::WRL::ComPtr;
using Microsoft::WRL::RuntimeClass;
using Microsoft::WRL::RuntimeClassFlags;
using Microsoft::WRL::ClassicCom;
using Microsoft::WRL::FtmBase;

namespace {

struct WavHeader {
    char riff[4] = {'R','I','F','F'};
    uint32_t fileSize = 0;
    char wave[4] = {'W','A','V','E'};
    char fmt[4] = {'f','m','t',' '};
    uint32_t fmtSize = 16;
    uint16_t audioFormat = 1;
    uint16_t channels = 1;
    uint32_t sampleRate = 48000;
    uint32_t byteRate = 96000;
    uint16_t blockAlign = 2;
    uint16_t bitsPerSample = 16;
    char data[4] = {'d','a','t','a'};
    uint32_t dataSize = 0;
};

uint32_t parseUint(const char* s, uint32_t fallback) {
    if (!s) return fallback;
    char* end = nullptr;
    unsigned long v = std::strtoul(s, &end, 10);
    return (end && *end == '\0') ? static_cast<uint32_t>(v) : fallback;
}

bool isSystemMode(int argc, char** argv) {
    return argc >= 2 && argv[1] && std::strcmp(argv[1], "--system") == 0;
}

// ActivateAudioInterfaceAsync requires the completion handler to be agile.
// FtmBase aggregates the free-threaded marshaler, matching Microsoft's
// Application Loopback sample and other production WASAPI implementations.
class ActivationHandler final : public RuntimeClass<
    RuntimeClassFlags<ClassicCom>, FtmBase, IActivateAudioInterfaceCompletionHandler> {
public:
    HRESULT STDMETHODCALLTYPE ActivateCompleted(IActivateAudioInterfaceAsyncOperation* operation) override {
        HRESULT activationHr = E_FAIL;
        ComPtr<IUnknown> activated;

        if (!operation) {
            resultHr_ = E_POINTER;
            SetEvent(event_);
            return S_OK;
        }

        HRESULT getHr = operation->GetActivateResult(&activationHr, &activated);
        if (FAILED(getHr)) activationHr = getHr;

        resultHr_ = activationHr;
        activated_ = activated;
        SetEvent(event_);
        return S_OK;
    }

    HANDLE event() const { return event_; }
    HRESULT resultHr() const { return resultHr_; }
    ComPtr<IUnknown> activated() const { return activated_; }

    ActivationHandler() : event_(CreateEventW(nullptr, TRUE, FALSE, nullptr)) {}
    ~ActivationHandler() override { if (event_) CloseHandle(event_); }

private:
    HANDLE event_ = nullptr;
    HRESULT resultHr_ = E_FAIL;
    ComPtr<IUnknown> activated_;
};

bool convertToPcm16(const BYTE* src, UINT32 frames, const WAVEFORMATEX* fmt, std::vector<int16_t>& dst) {
    if (!src || !fmt) return false;
    const size_t samples = static_cast<size_t>(frames) * fmt->nChannels;
    dst.resize(samples);
    if (fmt->wFormatTag == WAVE_FORMAT_PCM && fmt->wBitsPerSample == 16) {
        std::memcpy(dst.data(), src, samples * sizeof(int16_t));
        return true;
    }
    if (fmt->wFormatTag == WAVE_FORMAT_IEEE_FLOAT && fmt->wBitsPerSample == 32) {
        const float* in = reinterpret_cast<const float*>(src);
        for (size_t i = 0; i < samples; ++i) {
            float v = in[i];
            if (v > 1.f) v = 1.f;
            if (v < -1.f) v = -1.f;
            dst[i] = static_cast<int16_t>(v * 32767.f);
        }
        return true;
    }
    if (fmt->wFormatTag == WAVE_FORMAT_EXTENSIBLE && fmt->cbSize >= 22) {
        const auto* ext = reinterpret_cast<const WAVEFORMATEXTENSIBLE*>(fmt);
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_PCM) && fmt->wBitsPerSample == 16) {
            std::memcpy(dst.data(), src, samples * sizeof(int16_t));
            return true;
        }
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_IEEE_FLOAT) && fmt->wBitsPerSample == 32) {
            const float* in = reinterpret_cast<const float*>(src);
            for (size_t i = 0; i < samples; ++i) {
                float v = in[i];
                if (v > 1.f) v = 1.f;
                if (v < -1.f) v = -1.f;
                dst[i] = static_cast<int16_t>(v * 32767.f);
            }
            return true;
        }
    }
    return false;
}

void downmixToMono(const std::vector<int16_t>& in, uint16_t channels, std::vector<int16_t>& mono) {
    if (channels <= 1) { mono = in; return; }
    const size_t frames = in.size() / channels;
    mono.resize(frames);
    for (size_t f = 0; f < frames; ++f) {
        int64_t sum = 0;
        for (uint16_t c = 0; c < channels; ++c) sum += in[f * channels + c];
        mono[f] = static_cast<int16_t>(sum / channels);
    }
}

bool writeHeader(std::ofstream& out, const WavHeader& h) {
    out.seekp(0, std::ios::beg);
    out.write(reinterpret_cast<const char*>(&h), sizeof(h));
    return static_cast<bool>(out);
}

SOCKET connectTcp(const std::string& host, uint16_t port) {
    addrinfo hints{};
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    addrinfo* result = nullptr;
    const std::string portText = std::to_string(port);
    if (getaddrinfo(host.c_str(), portText.c_str(), &hints, &result) != 0) return INVALID_SOCKET;
    SOCKET s = INVALID_SOCKET;
    for (addrinfo* p = result; p; p = p->ai_next) {
        s = socket(p->ai_family, p->ai_socktype, p->ai_protocol);
        if (s == INVALID_SOCKET) continue;
        if (connect(s, p->ai_addr, static_cast<int>(p->ai_addrlen)) == 0) break;
        closesocket(s);
        s = INVALID_SOCKET;
    }
    freeaddrinfo(result);
    return s;
}

bool sendAll(SOCKET s, const BYTE* data, size_t bytes) {
    while (bytes) {
        int n = send(s, reinterpret_cast<const char*>(data), static_cast<int>(std::min<size_t>(bytes, 1 << 20)), 0);
        if (n <= 0) return false;
        data += n;
        bytes -= static_cast<size_t>(n);
    }
    return true;
}

void usage() {
    std::cout << "3V0L listener\n\n"
              << "System speakers: 3v0l-listener.exe --system [seconds] [output.wav] [PC3_IP] [audioPort]\n"
              << "Process loopback: 3v0l-listener.exe <PID> [seconds] [output.wav]\n"
              << "Process to PC3:   3v0l-listener.exe <PID> 0 [output.wav] <PC3_IP> [audioPort]\n\n"
              << "Examples:\n"
              << "  3v0l-listener.exe --system 10 system-test.wav\n"
              << "  3v0l-listener.exe --system 0 bridge.wav 192.168.11.103 38472\n"
              << "  3v0l-listener.exe 12345 0 capture.wav 192.168.11.103 38472\n";
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2) { usage(); return 2; }

    const bool systemMode = isSystemMode(argc, argv);
    const int argOffset = systemMode ? 1 : 0;

    const DWORD pid = systemMode ? 0 : static_cast<DWORD>(parseUint(argv[1], 0));
    const uint32_t seconds = parseUint(argc > 1 + argOffset ? argv[1 + argOffset] : nullptr, 10);
    const std::string defaultOutput = systemMode ? "system-test.wav" : "discord-test.wav";
    const std::string output = argc > 2 + argOffset ? argv[2 + argOffset] : defaultOutput;
    const std::string remoteHost = argc > 3 + argOffset ? argv[3 + argOffset] : "";
    const uint16_t remotePort = static_cast<uint16_t>(parseUint(argc > 4 + argOffset ? argv[4 + argOffset] : nullptr, 38472));
    const bool streamMode = !remoteHost.empty();

    if ((!systemMode && !pid) || (argc > 1 + argOffset && seconds == 0 && !streamMode)) {
        std::cerr << "Invalid arguments.\n";
        usage();
        return 2;
    }

    WSADATA wsa{};
    if (streamMode && WSAStartup(MAKEWORD(2,2), &wsa) != 0) {
        std::cerr << "WSAStartup failed.\n";
        return 1;
    }

    HRESULT hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr)) {
        if (streamMode) WSACleanup();
        std::cerr << "CoInitializeEx failed.\n";
        return 1;
    }

    ComPtr<IAudioClient> client;
    WAVEFORMATEX explicitProcessFormat{};
    WAVEFORMATEX* captureFormat = nullptr;
    WAVEFORMATEX* systemMixFormat = nullptr;

    if (systemMode) {
        ComPtr<IMMDeviceEnumerator> enumerator;
        hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, CLSCTX_ALL,
                              IID_PPV_ARGS(&enumerator));
        if (FAILED(hr)) {
            std::cerr << "Could not create MMDeviceEnumerator: 0x" << std::hex << hr << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        ComPtr<IMMDevice> endpoint;
        hr = enumerator->GetDefaultAudioEndpoint(eRender, eConsole, &endpoint);
        if (FAILED(hr)) {
            std::cerr << "Could not open default speaker output: 0x" << std::hex << hr << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        hr = endpoint->Activate(__uuidof(IAudioClient), CLSCTX_ALL, nullptr,
                                reinterpret_cast<void**>(client.GetAddressOf()));
        if (FAILED(hr)) {
            std::cerr << "Could not activate speaker audio client: 0x" << std::hex << hr << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        hr = client->GetMixFormat(&systemMixFormat);
        if (FAILED(hr) || !systemMixFormat) {
            std::cerr << "Could not get speaker mix format: 0x" << std::hex << hr << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }
        captureFormat = systemMixFormat;
    } else {
        AUDIOCLIENT_ACTIVATION_PARAMS params{};
        params.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
        params.ProcessLoopbackParams.TargetProcessId = pid;
        params.ProcessLoopbackParams.ProcessLoopbackMode = PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE;

        PROPVARIANT activationParams{};
        activationParams.vt = VT_BLOB;
        activationParams.blob.cbSize = sizeof(params);
        activationParams.blob.pBlobData = reinterpret_cast<BYTE*>(&params);

        ComPtr<ActivationHandler> handler = Microsoft::WRL::Make<ActivationHandler>();
        if (!handler || !handler->event()) {
            std::cerr << "ActivationHandler initialization failed.\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        IActivateAudioInterfaceAsyncOperation* asyncOp = nullptr;
        hr = ActivateAudioInterfaceAsync(VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK, __uuidof(IAudioClient),
                                         &activationParams, handler.Get(), &asyncOp);
        if (FAILED(hr)) {
            std::cerr << "ActivateAudioInterfaceAsync failed: 0x" << std::hex << hr << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }
        if (asyncOp) asyncOp->Release();

        if (WaitForSingleObject(handler->event(), 5000) != WAIT_OBJECT_0 || FAILED(handler->resultHr())) {
            std::cerr << "Audio process-loopback activation failed: 0x" << std::hex
                      << handler->resultHr() << std::dec << "\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        ComPtr<IUnknown> activated = handler->activated();
        hr = activated.As(&client);
        if (FAILED(hr)) {
            std::cerr << "Could not get process-loopback IAudioClient.\n";
            CoUninitialize();
            if (streamMode) WSACleanup();
            return 1;
        }

        explicitProcessFormat.wFormatTag = WAVE_FORMAT_PCM;
        explicitProcessFormat.nChannels = 2;
        explicitProcessFormat.nSamplesPerSec = 48000;
        explicitProcessFormat.wBitsPerSample = 16;
        explicitProcessFormat.nBlockAlign = explicitProcessFormat.nChannels * explicitProcessFormat.wBitsPerSample / 8;
        explicitProcessFormat.nAvgBytesPerSec = explicitProcessFormat.nSamplesPerSec * explicitProcessFormat.nBlockAlign;
        explicitProcessFormat.cbSize = 0;
        captureFormat = &explicitProcessFormat;
    }

    const DWORD streamFlags = AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM;
    hr = client->Initialize(AUDCLNT_SHAREMODE_SHARED, streamFlags, 1000000, 0, captureFormat, nullptr);
    if (FAILED(hr)) {
        std::cerr << "Audio Initialize failed: 0x" << std::hex << hr << std::dec << "\n";
        if (systemMixFormat) CoTaskMemFree(systemMixFormat);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    ComPtr<IAudioCaptureClient> capture;
    hr = client->GetService(IID_PPV_ARGS(&capture));
    if (FAILED(hr)) {
        std::cerr << "GetService failed: 0x" << std::hex << hr << std::dec << "\n";
        if (systemMixFormat) CoTaskMemFree(systemMixFormat);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    std::ofstream wav(output, std::ios::binary | std::ios::trunc);
    WavHeader header;
    header.channels = 1;
    header.sampleRate = captureFormat->nSamplesPerSec;
    header.byteRate = header.sampleRate * 2;
    if (wav) writeHeader(wav, header);

    SOCKET sock = INVALID_SOCKET;
    if (streamMode) {
        sock = connectTcp(remoteHost, remotePort);
        if (sock == INVALID_SOCKET) {
            std::cerr << "Warning: could not connect to PC3 at " << remoteHost << ":" << remotePort
                      << ". WAV capture will continue.\n";
        } else {
            std::cout << "Streaming PCM to " << remoteHost << ":" << remotePort << "\n";
        }
    }

    hr = client->Start();
    if (FAILED(hr)) {
        std::cerr << "Start failed: 0x" << std::hex << hr << std::dec << "\n";
        if (sock != INVALID_SOCKET) closesocket(sock);
        if (wav) wav.close();
        if (systemMixFormat) CoTaskMemFree(systemMixFormat);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    if (systemMode) {
        std::cout << "System speaker loopback active — microphone input is not captured unless it is routed back to speakers.\n";
    } else {
        std::cout << "Process loopback active for PID " << pid << ".\n";
    }
    std::cout << (streamMode && seconds == 0 ? "Streaming until interrupted...\n" : "Capturing...\n");

    const auto deadline = seconds
        ? std::chrono::steady_clock::now() + std::chrono::seconds(seconds)
        : std::chrono::steady_clock::time_point::max();
    uint64_t writtenBytes = 0;
    std::vector<int16_t> pcm, mono;
    bool connected = sock != INVALID_SOCKET;

    while (std::chrono::steady_clock::now() < deadline || seconds == 0) {
        UINT32 packet = 0;
        hr = capture->GetNextPacketSize(&packet);
        if (FAILED(hr)) break;
        if (!packet) { Sleep(5); continue; }

        while (packet) {
            BYTE* data = nullptr;
            UINT32 frames = 0;
            DWORD flags = 0;
            hr = capture->GetBuffer(&data, &frames, &flags, nullptr, nullptr);
            if (FAILED(hr)) break;

            if (flags & AUDCLNT_BUFFERFLAGS_SILENT) {
                mono.assign(frames, 0);
            } else if (!convertToPcm16(data, frames, captureFormat, pcm)) {
                std::cerr << "Unsupported audio format.\n";
                capture->ReleaseBuffer(frames);
                client->Stop();
                if (sock != INVALID_SOCKET) closesocket(sock);
                if (wav) wav.close();
                if (systemMixFormat) CoTaskMemFree(systemMixFormat);
                CoUninitialize();
                if (streamMode) WSACleanup();
                return 1;
            }

            if (!(flags & AUDCLNT_BUFFERFLAGS_SILENT)) {
                downmixToMono(pcm, captureFormat->nChannels, mono);
            }

            const BYTE* bytes = reinterpret_cast<const BYTE*>(mono.data());
            const size_t byteCount = mono.size() * sizeof(int16_t);
            if (wav) {
                wav.write(reinterpret_cast<const char*>(bytes), static_cast<std::streamsize>(byteCount));
                writtenBytes += byteCount;
            }
            if (connected && !sendAll(sock, bytes, byteCount)) {
                std::cerr << "PC3 connection lost.\n";
                closesocket(sock);
                sock = INVALID_SOCKET;
                connected = false;
            }

            capture->ReleaseBuffer(frames);
            hr = capture->GetNextPacketSize(&packet);
            if (FAILED(hr)) break;
        }
    }

    client->Stop();
    if (wav) {
        header.dataSize = static_cast<uint32_t>(std::min<uint64_t>(writtenBytes, 0xffffffffULL));
        header.fileSize = sizeof(WavHeader) - 8 + header.dataSize;
        writeHeader(wav, header);
        wav.close();
    }
    if (sock != INVALID_SOCKET) closesocket(sock);
    if (systemMixFormat) CoTaskMemFree(systemMixFormat);
    CoUninitialize();
    if (streamMode) WSACleanup();

    std::cout << "Done. WAV bytes: " << writtenBytes << "\n";
    return 0;
}
