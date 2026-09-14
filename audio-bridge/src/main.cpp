// 3V0L Audio Bridge prototype
// Captures rendered audio from a target Windows process tree using
// the Windows Application Loopback API. This first milestone writes
// a WAV file so we can prove Discord-only capture works before adding
// LAN streaming and Deepgram.

#include <windows.h>
#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <mmdeviceapi.h>
#include <avrt.h>
#include <wrl.h>
#include <functiondiscoverykeys_devpkey.h>

#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <vector>

using Microsoft::WRL::ComPtr;

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

class ActivationHandler final : public IActivateAudioInterfaceCompletionHandler {
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        *ppvObject = nullptr;
        if (riid == __uuidof(IUnknown) || riid == __uuidof(IActivateAudioInterfaceCompletionHandler)) {
            *ppvObject = static_cast<IActivateAudioInterfaceCompletionHandler*>(this);
            AddRef();
            return S_OK;
        }
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override { return ++refCount_; }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG v = --refCount_;
        if (!v) delete this;
        return v;
    }

    HRESULT STDMETHODCALLTYPE ActivateCompleted(IActivateAudioInterfaceAsyncOperation* operation) override {
        HRESULT hr = E_FAIL;
        ComPtr<IUnknown> activated;
        if (operation) {
            hr = operation->GetActivateResult(&hr, &activated);
        }
        resultHr_ = hr;
        activated_ = activated;
        completed_.store(true);
        SetEvent(event_);
        return S_OK;
    }

    HANDLE event() const { return event_; }
    HRESULT resultHr() const { return resultHr_; }
    ComPtr<IUnknown> activated() const { return activated_; }

    ActivationHandler() : event_(CreateEventW(nullptr, TRUE, FALSE, nullptr)) {}
    ~ActivationHandler() override { if (event_) CloseHandle(event_); }

private:
    std::atomic<ULONG> refCount_{1};
    HANDLE event_ = nullptr;
    std::atomic<bool> completed_{false};
    HRESULT resultHr_ = E_FAIL;
    ComPtr<IUnknown> activated_;
};

bool writeHeader(std::ofstream& out, const WavHeader& h) {
    out.seekp(0, std::ios::beg);
    out.write(reinterpret_cast<const char*>(&h), sizeof(h));
    return static_cast<bool>(out);
}

bool convertToPcm16(const BYTE* src, UINT32 frames, const WAVEFORMATEX* format, std::vector<int16_t>& dst) {
    if (!src || !format) return false;
    const size_t samples = static_cast<size_t>(frames) * format->nChannels;
    dst.resize(samples);

    if (format->wFormatTag == WAVE_FORMAT_PCM && format->wBitsPerSample == 16) {
        std::memcpy(dst.data(), src, samples * sizeof(int16_t));
        return true;
    }

    if (format->wFormatTag == WAVE_FORMAT_IEEE_FLOAT && format->wBitsPerSample == 32) {
        const float* in = reinterpret_cast<const float*>(src);
        for (size_t i = 0; i < samples; ++i) {
            float v = in[i];
            if (v > 1.f) v = 1.f;
            if (v < -1.f) v = -1.f;
            dst[i] = static_cast<int16_t>(v * 32767.f);
        }
        return true;
    }

    // Handle extensible formats that ultimately carry PCM16 or float32.
    if (format->wFormatTag == WAVE_FORMAT_EXTENSIBLE && format->cbSize >= 22) {
        auto* ext = reinterpret_cast<const WAVEFORMATEXTENSIBLE*>(format);
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_PCM) && format->wBitsPerSample == 16) {
            std::memcpy(dst.data(), src, samples * sizeof(int16_t));
            return true;
        }
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_IEEE_FLOAT) && format->wBitsPerSample == 32) {
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

bool downmixToMono(const std::vector<int16_t>& in, uint16_t channels, std::vector<int16_t>& mono) {
    if (channels == 0) return false;
    if (channels == 1) { mono = in; return true; }
    const size_t frames = in.size() / channels;
    mono.resize(frames);
    for (size_t f = 0; f < frames; ++f) {
        int64_t sum = 0;
        for (uint16_t c = 0; c < channels; ++c) sum += in[f * channels + c];
        int64_t avg = sum / channels;
        if (avg > 32767) avg = 32767;
        if (avg < -32768) avg = -32768;
        mono[f] = static_cast<int16_t>(avg);
    }
    return true;
}

void printUsage() {
    std::cout << "3V0L Audio Bridge prototype\n\n"
              << "Usage:\n"
              << "  3v0l-listener.exe <PID> [seconds] [output.wav]\n\n"
              << "Example:\n"
              << "  3v0l-listener.exe 12345 10 discord-test.wav\n";
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        printUsage();
        return 2;
    }

    const DWORD targetPid = static_cast<DWORD>(parseUint(argv[1], 0));
    const uint32_t seconds = parseUint(argc > 2 ? argv[2] : nullptr, 10);
    const std::string output = argc > 3 ? argv[3] : "discord-test.wav";

    if (!targetPid || !seconds) {
        std::cerr << "Invalid PID or duration.\n";
        return 2;
    }

    HRESULT hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr)) {
        std::cerr << "CoInitializeEx failed: 0x" << std::hex << hr << std::dec << "\n";
        return 1;
    }

    HANDLE mmcss = AvSetMmThreadCharacteristicsW(L"Audio", nullptr);
    if (!mmcss) std::cerr << "Warning: could not register MMCSS Audio task.\n";

    AUDIOCLIENT_ACTIVATION_PARAMS params{};
    params.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
    params.ProcessLoopbackParams.TargetProcessId = targetPid;
    params.ProcessLoopbackParams.ProcessLoopbackMode = PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE;

    ComPtr<ActivationHandler> handler = Microsoft::WRL::Make<ActivationHandler>();
    IActivateAudioInterfaceAsyncOperation* asyncOp = nullptr;

    hr = ActivateAudioInterfaceAsync(
        VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK,
        __uuidof(IAudioClient),
        &params,
        handler.Get(),
        &asyncOp
    );

    if (FAILED(hr)) {
        std::cerr << "ActivateAudioInterfaceAsync failed: 0x" << std::hex << hr << std::dec << "\n";
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    asyncOp->Release();

    WaitForSingleObject(handler->event(), 5000);
    hr = handler->resultHr();
    if (FAILED(hr)) {
        std::cerr << "Audio activation failed: 0x" << std::hex << hr << std::dec << "\n";
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    ComPtr<IUnknown> activated = handler->activated();
    ComPtr<IAudioClient> audioClient;
    hr = activated.As(&audioClient);
    if (FAILED(hr)) {
        std::cerr << "Could not obtain IAudioClient: 0x" << std::hex << hr << std::dec << "\n";
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    WAVEFORMATEX* mixFormat = nullptr;
    hr = audioClient->GetMixFormat(&mixFormat);
    if (FAILED(hr) || !mixFormat) {
        std::cerr << "GetMixFormat failed: 0x" << std::hex << hr << std::dec << "\n";
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    std::cout << "Captured process PID: " << targetPid << "\n"
              << "Source format: " << mixFormat->nSamplesPerSec << " Hz, "
              << mixFormat->nChannels << " ch, " << mixFormat->wBitsPerSample << " bit\n";

    REFERENCE_TIME bufferDuration = 1000000; // 100 ms
    hr = audioClient->Initialize(
        AUDCLNT_SHAREMODE_SHARED,
        AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,
        bufferDuration,
        0,
        mixFormat,
        nullptr
    );
    if (FAILED(hr)) {
        std::cerr << "IAudioClient::Initialize failed: 0x" << std::hex << hr << std::dec << "\n";
        CoTaskMemFree(mixFormat);
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    ComPtr<IAudioCaptureClient> capture;
    hr = audioClient->GetService(IID_PPV_ARGS(&capture));
    if (FAILED(hr)) {
        std::cerr << "GetService(IAudioCaptureClient) failed: 0x" << std::hex << hr << std::dec << "\n";
        CoTaskMemFree(mixFormat);
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    WavHeader header;
    header.channels = 1;
    header.sampleRate = mixFormat->nSamplesPerSec;
    header.byteRate = header.sampleRate * 2;
    header.blockAlign = 2;

    std::ofstream out(output, std::ios::binary | std::ios::trunc);
    if (!out) {
        std::cerr << "Cannot open output file: " << output << "\n";
        CoTaskMemFree(mixFormat);
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }
    writeHeader(out, header);

    hr = audioClient->Start();
    if (FAILED(hr)) {
        std::cerr << "Start failed: 0x" << std::hex << hr << std::dec << "\n";
        CoTaskMemFree(mixFormat);
        if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
        CoUninitialize();
        return 1;
    }

    std::cout << "Recording " << seconds << " seconds to " << output << "...\n";
    const auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(seconds);
    uint32_t writtenBytes = 0;
    std::vector<int16_t> pcm;
    std::vector<int16_t> mono;

    while (std::chrono::steady_clock::now() < deadline) {
        UINT32 packetLength = 0;
        hr = capture->GetNextPacketSize(&packetLength);
        if (FAILED(hr)) break;

        if (!packetLength) {
            Sleep(5);
            continue;
        }

        while (packetLength) {
            BYTE* data = nullptr;
            UINT32 numFrames = 0;
            DWORD flags = 0;
            hr = capture->GetBuffer(&data, &numFrames, &flags, nullptr, nullptr);
            if (FAILED(hr)) break;

            if (flags & AUDCLNT_BUFFERFLAGS_SILENT) {
                mono.assign(numFrames, 0);
            } else if (!convertToPcm16(data, numFrames, mixFormat, pcm) || !downmixToMono(pcm, mixFormat->nChannels, mono)) {
                std::cerr << "Unsupported capture format.\n";
                capture->ReleaseBuffer(numFrames);
                audioClient->Stop();
                out.close();
                CoTaskMemFree(mixFormat);
                if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
                CoUninitialize();
                return 1;
            }

            out.write(reinterpret_cast<const char*>(mono.data()), static_cast<std::streamsize>(mono.size() * sizeof(int16_t)));
            writtenBytes += static_cast<uint32_t>(mono.size() * sizeof(int16_t));
            capture->ReleaseBuffer(numFrames);

            hr = capture->GetNextPacketSize(&packetLength);
            if (FAILED(hr)) break;
        }
    }

    audioClient->Stop();

    header.dataSize = writtenBytes;
    header.fileSize = static_cast<uint32_t>(sizeof(WavHeader) - 8 + writtenBytes);
    writeHeader(out, header);
    out.close();

    std::cout << "Done. Wrote " << writtenBytes << " bytes.\n";

    CoTaskMemFree(mixFormat);
    if (mmcss) AvRevertMmThreadCharacteristics(mmcss);
    CoUninitialize();
    return 0;
}
