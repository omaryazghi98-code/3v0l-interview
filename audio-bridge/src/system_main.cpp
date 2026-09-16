// 3V0L system speaker audio listener
// Captures the Windows default render endpoint (speaker/headphone output),
// excludes microphone input, and optionally streams mono PCM16 over TCP.

#include <windows.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <ksmedia.h>
#include <winsock2.h>
#include <ws2tcpip.h>

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "ws2_32.lib")

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

bool convertToMonoPcm16(const BYTE* src, UINT32 frames, const WAVEFORMATEX* fmt, std::vector<int16_t>& mono) {
    if (!src || !fmt || fmt->nChannels == 0) return false;
    const size_t samples = static_cast<size_t>(frames) * fmt->nChannels;
    mono.resize(frames);

    auto clamp16 = [](float v) -> int16_t {
        v = std::max(-1.0f, std::min(1.0f, v));
        return static_cast<int16_t>(v * 32767.0f);
    };

    if (fmt->wFormatTag == WAVE_FORMAT_PCM && fmt->wBitsPerSample == 16) {
        const auto* in = reinterpret_cast<const int16_t*>(src);
        for (UINT32 f = 0; f < frames; ++f) {
            int64_t sum = 0;
            for (UINT16 c = 0; c < fmt->nChannels; ++c) sum += in[static_cast<size_t>(f) * fmt->nChannels + c];
            mono[f] = static_cast<int16_t>(sum / fmt->nChannels);
        }
        return true;
    }

    if (fmt->wFormatTag == WAVE_FORMAT_IEEE_FLOAT && fmt->wBitsPerSample == 32) {
        const auto* in = reinterpret_cast<const float*>(src);
        for (UINT32 f = 0; f < frames; ++f) {
            float sum = 0.0f;
            for (UINT16 c = 0; c < fmt->nChannels; ++c) sum += in[static_cast<size_t>(f) * fmt->nChannels + c];
            mono[f] = clamp16(sum / fmt->nChannels);
        }
        return true;
    }

    if (fmt->wFormatTag == WAVE_FORMAT_EXTENSIBLE && fmt->cbSize >= 22) {
        const auto* ext = reinterpret_cast<const WAVEFORMATEXTENSIBLE*>(fmt);
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_PCM) && fmt->wBitsPerSample == 16) {
            const auto* in = reinterpret_cast<const int16_t*>(src);
            for (UINT32 f = 0; f < frames; ++f) {
                int64_t sum = 0;
                for (UINT16 c = 0; c < fmt->nChannels; ++c) sum += in[static_cast<size_t>(f) * fmt->nChannels + c];
                mono[f] = static_cast<int16_t>(sum / fmt->nChannels);
            }
            return true;
        }
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_IEEE_FLOAT) && fmt->wBitsPerSample == 32) {
            const auto* in = reinterpret_cast<const float*>(src);
            for (UINT32 f = 0; f < frames; ++f) {
                float sum = 0.0f;
                for (UINT16 c = 0; c < fmt->nChannels; ++c) sum += in[static_cast<size_t>(f) * fmt->nChannels + c];
                mono[f] = clamp16(sum / fmt->nChannels);
            }
            return true;
        }
    }

    return false;
}

bool writeHeader(std::ofstream& out, const WavHeader& h) {
    out.seekp(0, std::ios::beg);
    out.write(reinterpret_cast<const char*>(&h), sizeof(h));
    return static_cast<bool>(out);
}

void printHr(const char* label, HRESULT hr) {
    std::cerr << label << ": 0x" << std::hex << static_cast<unsigned long>(hr) << std::dec << "\n";
}

void usage() {
    std::cout << "3V0L system speaker listener\n\n"
              << "Local WAV:  3v0l-listener.exe --system [seconds] [output.wav]\n"
              << "Live LAN:   3v0l-listener.exe --system 0 [output.wav] [ACER_IP] [audioPort]\n\n"
              << "Example:\n"
              << "  3v0l-listener.exe --system 0 bridge.wav 192.168.11.103 38472\n";
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2 || std::string(argv[1]) != "--system") {
        usage();
        return 2;
    }

    const uint32_t seconds = parseUint(argc > 2 ? argv[2] : nullptr, 10);
    const std::string output = argc > 3 ? argv[3] : "system-test.wav";
    const std::string remoteHost = argc > 4 ? argv[4] : "";
    const uint16_t remotePort = static_cast<uint16_t>(parseUint(argc > 5 ? argv[5] : nullptr, 38472));
    const bool streamMode = !remoteHost.empty();

    WSADATA wsa{};
    if (streamMode) {
        const int wsaHr = WSAStartup(MAKEWORD(2, 2), &wsa);
        if (wsaHr != 0) {
            std::cerr << "WSAStartup failed: " << wsaHr << "\n";
            return 1;
        }
    }

    HRESULT hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr)) {
        printHr("CoInitializeEx failed", hr);
        if (streamMode) WSACleanup();
        return 1;
    }

    IMMDeviceEnumerator* enumerator = nullptr;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, CLSCTX_ALL,
                          __uuidof(IMMDeviceEnumerator), reinterpret_cast<void**>(&enumerator));
    if (FAILED(hr)) {
        printHr("Could not create device enumerator", hr);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    IMMDevice* device = nullptr;
    hr = enumerator->GetDefaultAudioEndpoint(eRender, eConsole, &device);
    enumerator->Release();
    if (FAILED(hr)) {
        printHr("Could not get default playback endpoint", hr);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    IAudioClient* client = nullptr;
    hr = device->Activate(__uuidof(IAudioClient), CLSCTX_ALL, nullptr, reinterpret_cast<void**>(&client));
    device->Release();
    if (FAILED(hr)) {
        printHr("Could not activate audio client", hr);
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    WAVEFORMATEX* mixFormat = nullptr;
    hr = client->GetMixFormat(&mixFormat);
    if (FAILED(hr) || !mixFormat) {
        printHr("GetMixFormat failed", hr);
        if (client) client->Release();
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    std::cout << "Default playback device: " << mixFormat->nSamplesPerSec << " Hz, "
              << mixFormat->nChannels << " channels, "
              << mixFormat->wBitsPerSample << " bits\n";

    hr = client->Initialize(AUDCLNT_SHAREMODE_SHARED,
                            AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,
                            1000000, 0, mixFormat, nullptr);
    if (FAILED(hr)) {
        printHr("Audio Initialize failed", hr);
        CoTaskMemFree(mixFormat);
        client->Release();
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    IAudioCaptureClient* capture = nullptr;
    hr = client->GetService(__uuidof(IAudioCaptureClient), reinterpret_cast<void**>(&capture));
    if (FAILED(hr)) {
        printHr("GetService(IAudioCaptureClient) failed", hr);
        CoTaskMemFree(mixFormat);
        client->Release();
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    std::ofstream wav(output, std::ios::binary | std::ios::trunc);
    WavHeader header;
    header.sampleRate = mixFormat->nSamplesPerSec;
    header.byteRate = header.sampleRate * 2;
    if (wav) writeHeader(wav, header);

    SOCKET sock = INVALID_SOCKET;
    if (streamMode) {
        sock = connectTcp(remoteHost, remotePort);
        if (sock == INVALID_SOCKET) {
            std::cerr << "Warning: could not connect to Acer at " << remoteHost << ":" << remotePort << ". WAV capture will continue.\n";
        } else {
            std::cout << "Streaming PCM to " << remoteHost << ":" << remotePort << "\n";
        }
    }

    hr = client->Start();
    if (FAILED(hr)) {
        printHr("Audio Start failed", hr);
        if (sock != INVALID_SOCKET) closesocket(sock);
        if (wav) wav.close();
        capture->Release();
        CoTaskMemFree(mixFormat);
        client->Release();
        CoUninitialize();
        if (streamMode) WSACleanup();
        return 1;
    }

    std::cout << "System speaker loopback active.\n";
    std::cout << (seconds == 0 ? "Streaming until interrupted...\n" : "Capturing...\n");

    const auto deadline = seconds ? std::chrono::steady_clock::now() + std::chrono::seconds(seconds)
                                  : std::chrono::steady_clock::time_point::max();
    uint64_t writtenBytes = 0;
    bool connected = sock != INVALID_SOCKET;
    std::vector<int16_t> mono;

    while (seconds == 0 || std::chrono::steady_clock::now() < deadline) {
        UINT32 packetFrames = 0;
        hr = capture->GetNextPacketSize(&packetFrames);
        if (FAILED(hr)) break;
        if (!packetFrames) {
            Sleep(5);
            continue;
        }

        while (packetFrames) {
            BYTE* data = nullptr;
            UINT32 frames = 0;
            DWORD flags = 0;
            hr = capture->GetBuffer(&data, &frames, &flags, nullptr, nullptr);
            if (FAILED(hr)) break;

            if (flags & AUDCLNT_BUFFERFLAGS_SILENT) {
                mono.assign(frames, 0);
            } else if (!convertToMonoPcm16(data, frames, mixFormat, mono)) {
                std::cerr << "Unsupported playback format.\n";
                capture->ReleaseBuffer(frames);
                client->Stop();
                if (sock != INVALID_SOCKET) closesocket(sock);
                if (wav) wav.close();
                capture->Release();
                CoTaskMemFree(mixFormat);
                client->Release();
                CoUninitialize();
                if (streamMode) WSACleanup();
                return 1;
            }

            const BYTE* bytes = reinterpret_cast<const BYTE*>(mono.data());
            const size_t byteCount = mono.size() * sizeof(int16_t);
            if (wav) {
                wav.write(reinterpret_cast<const char*>(bytes), static_cast<std::streamsize>(byteCount));
                writtenBytes += byteCount;
            }
            if (connected && !sendAll(sock, bytes, byteCount)) {
                std::cerr << "Acer connection lost.\n";
                closesocket(sock);
                sock = INVALID_SOCKET;
                connected = false;
            }

            capture->ReleaseBuffer(frames);
            hr = capture->GetNextPacketSize(&packetFrames);
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
    capture->Release();
    CoTaskMemFree(mixFormat);
    client->Release();
    CoUninitialize();
    if (streamMode) WSACleanup();

    std::cout << "Done. WAV bytes: " << writtenBytes << "\n";
    return 0;
}
