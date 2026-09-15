// 3V0L Audio Bridge
// Windows process-loopback capture with optional LAN PCM transport.
// Diagnostic build: emits unbuffered runtime checkpoints to stderr.

#include <windows.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <avrt.h>
#include <wrl.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <ksmedia.h>

#include <algorithm>
#include <atomic>
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

namespace {
struct WavHeader {
    char riff[4] = {'R','I','F','F'}; uint32_t fileSize = 0;
    char wave[4] = {'W','A','V','E'}; char fmt[4] = {'f','m','t',' '};
    uint32_t fmtSize = 16; uint16_t audioFormat = 1; uint16_t channels = 1;
    uint32_t sampleRate = 48000; uint32_t byteRate = 96000; uint16_t blockAlign = 2;
    uint16_t bitsPerSample = 16; char data[4] = {'d','a','t','a'}; uint32_t dataSize = 0;
};
uint32_t parseUint(const char* s, uint32_t fallback) {
    if (!s) return fallback; char* end = nullptr; unsigned long v = std::strtoul(s, &end, 10);
    return (end && *end == '\0') ? static_cast<uint32_t>(v) : fallback;
}
class ActivationHandler final : public IActivateAudioInterfaceCompletionHandler {
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER; *ppvObject = nullptr;
        if (riid == __uuidof(IUnknown) || riid == __uuidof(IActivateAudioInterfaceCompletionHandler)) {
            *ppvObject = static_cast<IActivateAudioInterfaceCompletionHandler*>(this); AddRef(); return S_OK;
        }
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return ++refs_; }
    ULONG STDMETHODCALLTYPE Release() override { ULONG v = --refs_; if (!v) delete this; return v; }
    HRESULT STDMETHODCALLTYPE ActivateCompleted(IActivateAudioInterfaceAsyncOperation* operation) override {
        std::fprintf(stderr, "[3V0L] ActivateCompleted entered\n"); std::fflush(stderr);
        HRESULT activationHr = E_FAIL; ComPtr<IUnknown> activated;
        if (!operation) { resultHr_ = E_POINTER; SetEvent(event_); return S_OK; }
        HRESULT getHr = operation->GetActivateResult(&activationHr, &activated);
        std::fprintf(stderr, "[3V0L] GetActivateResult getHr=0x%08lX activationHr=0x%08lX\n",
                     static_cast<unsigned long>(getHr), static_cast<unsigned long>(activationHr)); std::fflush(stderr);
        if (FAILED(getHr)) activationHr = getHr;
        resultHr_ = activationHr; activated_ = activated; SetEvent(event_); return S_OK;
    }
    HANDLE event() const { return event_; }
    HRESULT resultHr() const { return resultHr_; }
    ComPtr<IUnknown> activated() const { return activated_; }
    ActivationHandler() : event_(CreateEventW(nullptr, TRUE, FALSE, nullptr)) {}
private:
    ~ActivationHandler() { if (event_) CloseHandle(event_); }
    std::atomic<ULONG> refs_{1}; HANDLE event_ = nullptr; HRESULT resultHr_ = E_FAIL; ComPtr<IUnknown> activated_;
};
bool convertToPcm16(const BYTE* src, UINT32 frames, const WAVEFORMATEX* fmt, std::vector<int16_t>& dst) {
    if (!src || !fmt) return false; const size_t samples = static_cast<size_t>(frames) * fmt->nChannels; dst.resize(samples);
    if (fmt->wFormatTag == WAVE_FORMAT_PCM && fmt->wBitsPerSample == 16) { std::memcpy(dst.data(), src, samples * sizeof(int16_t)); return true; }
    if (fmt->wFormatTag == WAVE_FORMAT_IEEE_FLOAT && fmt->wBitsPerSample == 32) {
        const float* in = reinterpret_cast<const float*>(src); for (size_t i=0;i<samples;++i) { float v=in[i]; if(v>1.f)v=1.f; if(v<-1.f)v=-1.f; dst[i]=static_cast<int16_t>(v*32767.f); } return true;
    }
    if (fmt->wFormatTag == WAVE_FORMAT_EXTENSIBLE && fmt->cbSize >= 22) {
        const auto* ext = reinterpret_cast<const WAVEFORMATEXTENSIBLE*>(fmt);
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_PCM) && fmt->wBitsPerSample == 16) { std::memcpy(dst.data(),src,samples*sizeof(int16_t)); return true; }
        if (IsEqualGUID(ext->SubFormat, KSDATAFORMAT_SUBTYPE_IEEE_FLOAT) && fmt->wBitsPerSample == 32) {
            const float* in=reinterpret_cast<const float*>(src); for(size_t i=0;i<samples;++i){float v=in[i];if(v>1.f)v=1.f;if(v<-1.f)v=-1.f;dst[i]=static_cast<int16_t>(v*32767.f);} return true;
        }
    }
    return false;
}
void downmixToMono(const std::vector<int16_t>& in, uint16_t channels, std::vector<int16_t>& mono) {
    if (channels <= 1) { mono=in; return; } const size_t frames=in.size()/channels; mono.resize(frames);
    for(size_t f=0;f<frames;++f){int64_t sum=0;for(uint16_t c=0;c<channels;++c)sum+=in[f*channels+c];mono[f]=static_cast<int16_t>(sum/channels);}
}
bool writeHeader(std::ofstream& out, const WavHeader& h){out.seekp(0,std::ios::beg);out.write(reinterpret_cast<const char*>(&h),sizeof(h));return static_cast<bool>(out);}
SOCKET connectTcp(const std::string& host,uint16_t port){addrinfo hints{};hints.ai_family=AF_UNSPEC;hints.ai_socktype=SOCK_STREAM;hints.ai_protocol=IPPROTO_TCP;addrinfo* result=nullptr;const std::string portText=std::to_string(port);if(getaddrinfo(host.c_str(),portText.c_str(),&hints,&result)!=0)return INVALID_SOCKET;SOCKET s=INVALID_SOCKET;for(addrinfo* p=result;p;p=p->ai_next){s=socket(p->ai_family,p->ai_socktype,p->ai_protocol);if(s==INVALID_SOCKET)continue;if(connect(s,p->ai_addr,static_cast<int>(p->ai_addrlen))==0)break;closesocket(s);s=INVALID_SOCKET;}freeaddrinfo(result);return s;}
bool sendAll(SOCKET s,const BYTE* data,size_t bytes){while(bytes){int n=send(s,reinterpret_cast<const char*>(data),static_cast<int>(std::min<size_t>(bytes,1<<20)),0);if(n<=0)return false;data+=n;bytes-=static_cast<size_t>(n);}return true;}
void usage(){std::cout<<"3V0L listener\n\n"<<"WAV only:       3v0l-listener.exe <PID> [seconds] [output.wav]\n"<<"Live to PC3:    3v0l-listener.exe <PID> 0 [output.wav] <PC3_IP> [audioPort]\n\n"<<"Example:\n"<<"  3v0l-listener.exe 12345 0 capture.wav 192.168.11.113 38472\n";}
}
int main(int argc,char** argv){
    std::fprintf(stderr,"[3V0L] main entered argc=%d\n",argc);std::fflush(stderr);
    if(argc<2){usage();return 2;} const DWORD pid=static_cast<DWORD>(parseUint(argv[1],0)); const uint32_t seconds=parseUint(argc>2?argv[2]:nullptr,10);
    const std::string output=argc>3?argv[3]:"discord-test.wav"; const std::string remoteHost=argc>4?argv[4]:""; const uint16_t remotePort=static_cast<uint16_t>(parseUint(argc>5?argv[5]:nullptr,38472)); const bool streamMode=!remoteHost.empty();
    std::fprintf(stderr,"[3V0L] args pid=%lu seconds=%lu output=%s\n",static_cast<unsigned long>(pid),static_cast<unsigned long>(seconds),output.c_str());std::fflush(stderr);
    if(!pid||(argc>2&&seconds==0&&!streamMode)){std::fprintf(stderr,"[3V0L] invalid arguments\n");return 2;}
    WSADATA wsa{}; if(streamMode&&WSAStartup(MAKEWORD(2,2),&wsa)!=0){std::fprintf(stderr,"[3V0L] WSAStartup failed\n");return 1;}
    std::fprintf(stderr,"[3V0L] before CoInitializeEx\n");std::fflush(stderr); HRESULT hr=CoInitializeEx(nullptr,COINIT_MULTITHREADED);
    std::fprintf(stderr,"[3V0L] CoInitializeEx=0x%08lX\n",static_cast<unsigned long>(hr));std::fflush(stderr); if(FAILED(hr)){if(streamMode)WSACleanup();return 1;}
    AUDIOCLIENT_ACTIVATION_PARAMS params{};params.ActivationType=AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;params.ProcessLoopbackParams.TargetProcessId=pid;params.ProcessLoopbackParams.ProcessLoopbackMode=PROCESS_LOOPBACK_MODE_INCLUDE_TARGET_PROCESS_TREE;
    PROPVARIANT activationParams{};activationParams.vt=VT_BLOB;activationParams.blob.cbSize=sizeof(params);activationParams.blob.pBlobData=reinterpret_cast<BYTE*>(&params);
    std::fprintf(stderr,"[3V0L] before new ActivationHandler\n");std::fflush(stderr); ActivationHandler* handler=new ActivationHandler();
    std::fprintf(stderr,"[3V0L] handler=%p event=%p\n",static_cast<void*>(handler),handler->event());std::fflush(stderr);
    if(!handler->event()){std::fprintf(stderr,"[3V0L] CreateEventW failed=%lu\n",static_cast<unsigned long>(GetLastError()));handler->Release();CoUninitialize();if(streamMode)WSACleanup();return 1;}
    std::fprintf(stderr,"[3V0L] before ActivateAudioInterfaceAsync\n");std::fflush(stderr);IActivateAudioInterfaceAsyncOperation* asyncOp=nullptr;
    hr=ActivateAudioInterfaceAsync(VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK,__uuidof(IAudioClient),&activationParams,handler,&asyncOp);
    std::fprintf(stderr,"[3V0L] ActivateAudioInterfaceAsync=0x%08lX op=%p\n",static_cast<unsigned long>(hr),static_cast<void*>(asyncOp));std::fflush(stderr);
    if(FAILED(hr)){handler->Release();CoUninitialize();if(streamMode)WSACleanup();return 1;} if(asyncOp)asyncOp->Release();
    std::fprintf(stderr,"[3V0L] waiting for activation\n");std::fflush(stderr);const DWORD wait=WaitForSingleObject(handler->event(),5000);std::fprintf(stderr,"[3V0L] wait=%lu\n",static_cast<unsigned long>(wait));std::fflush(stderr);
    if(wait!=WAIT_OBJECT_0){handler->Release();CoUninitialize();if(streamMode)WSACleanup();return 1;} const HRESULT activationResult=handler->resultHr();std::fprintf(stderr,"[3V0L] activationResult=0x%08lX\n",static_cast<unsigned long>(activationResult));std::fflush(stderr);
    if(FAILED(activationResult)){handler->Release();CoUninitialize();if(streamMode)WSACleanup();return 1;}
    ComPtr<IUnknown> activated=handler->activated();handler->Release();handler=nullptr;ComPtr<IAudioClient> client;hr=activated.As(&client);std::fprintf(stderr,"[3V0L] IAudioClient=0x%08lX\n",static_cast<unsigned long>(hr));std::fflush(stderr);
    if(FAILED(hr)){CoUninitialize();if(streamMode)WSACleanup();return 1;} WAVEFORMATEX* mix=nullptr;hr=client->GetMixFormat(&mix);std::fprintf(stderr,"[3V0L] GetMixFormat=0x%08lX fmt=%p\n",static_cast<unsigned long>(hr),static_cast<void*>(mix));std::fflush(stderr);if(FAILED(hr)||!mix){CoUninitialize();if(streamMode)WSACleanup();return 1;}
    hr=client->Initialize(AUDCLNT_SHAREMODE_SHARED,AUDCLNT_STREAMFLAGS_LOOPBACK|AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,1000000,0,mix,nullptr);std::fprintf(stderr,"[3V0L] Initialize=0x%08lX\n",static_cast<unsigned long>(hr));std::fflush(stderr);if(FAILED(hr)){CoTaskMemFree(mix);CoUninitialize();if(streamMode)WSACleanup();return 1;}
    ComPtr<IAudioCaptureClient> capture;hr=client->GetService(IID_PPV_ARGS(&capture));std::fprintf(stderr,"[3V0L] GetService=0x%08lX\n",static_cast<unsigned long>(hr));std::fflush(stderr);if(FAILED(hr)){CoTaskMemFree(mix);CoUninitialize();if(streamMode)WSACleanup();return 1;}
    std::ofstream wav(output,std::ios::binary|std::ios::trunc);WavHeader header;header.channels=1;header.sampleRate=mix->nSamplesPerSec;header.byteRate=header.sampleRate*2;if(wav)writeHeader(wav,header);
    SOCKET sock=INVALID_SOCKET;if(streamMode){sock=connectTcp(remoteHost,remotePort);if(sock==INVALID_SOCKET)std::fprintf(stderr,"[3V0L] warning: PC3 connection failed\n");else std::fprintf(stderr,"[3V0L] streaming to %s:%u\n",remoteHost.c_str(),remotePort);std::fflush(stderr);}
    hr=client->Start();std::fprintf(stderr,"[3V0L] Start=0x%08lX\n",static_cast<unsigned long>(hr));std::fflush(stderr);if(FAILED(hr)){if(sock!=INVALID_SOCKET)closesocket(sock);if(wav)wav.close();CoTaskMemFree(mix);CoUninitialize();if(streamMode)WSACleanup();return 1;}
    std::fprintf(stderr,"[3V0L] Capturing...\n");std::fflush(stderr);const auto deadline=seconds?std::chrono::steady_clock::now()+std::chrono::seconds(seconds):std::chrono::steady_clock::time_point::max();uint64_t writtenBytes=0;std::vector<int16_t> pcm,mono;bool connected=sock!=INVALID_SOCKET;
    while(std::chrono::steady_clock::now()<deadline||seconds==0){UINT32 packet=0;hr=capture->GetNextPacketSize(&packet);if(FAILED(hr)){std::fprintf(stderr,"[3V0L] GetNextPacketSize failed=0x%08lX\n",static_cast<unsigned long>(hr));break;}if(!packet){Sleep(5);continue;}while(packet){BYTE* data=nullptr;UINT32 frames=0;DWORD flags=0;hr=capture->GetBuffer(&data,&frames,&flags,nullptr,nullptr);if(FAILED(hr)){std::fprintf(stderr,"[3V0L] GetBuffer failed=0x%08lX\n",static_cast<unsigned long>(hr));break;}if(flags&AUDCLNT_BUFFERFLAGS_SILENT)mono.assign(frames,0);else if(!convertToPcm16(data,frames,mix,pcm)){std::fprintf(stderr,"[3V0L] unsupported audio format\n");capture->ReleaseBuffer(frames);client->Stop();if(sock!=INVALID_SOCKET)closesocket(sock);if(wav)wav.close();CoTaskMemFree(mix);CoUninitialize();if(streamMode)WSACleanup();return 1;}if(!(flags&AUDCLNT_BUFFERFLAGS_SILENT))downmixToMono(pcm,mix->nChannels,mono);const BYTE* bytes=reinterpret_cast<const BYTE*>(mono.data());const size_t byteCount=mono.size()*sizeof(int16_t);if(wav){wav.write(reinterpret_cast<const char*>(bytes),static_cast<std::streamsize>(byteCount));writtenBytes+=byteCount;}if(connected&&!sendAll(sock,bytes,byteCount)){std::fprintf(stderr,"[3V0L] PC3 connection lost\n");closesocket(sock);sock=INVALID_SOCKET;connected=false;}capture->ReleaseBuffer(frames);hr=capture->GetNextPacketSize(&packet);if(FAILED(hr))break;}}
    client->Stop();if(wav){header.dataSize=static_cast<uint32_t>(std::min<uint64_t>(writtenBytes,0xffffffffULL));header.fileSize=sizeof(WavHeader)-8+header.dataSize;writeHeader(wav,header);wav.close();}if(sock!=INVALID_SOCKET)closesocket(sock);CoTaskMemFree(mix);CoUninitialize();if(streamMode)WSACleanup();std::fprintf(stderr,"[3V0L] Done. WAV bytes: %llu\n",static_cast<unsigned long long>(writtenBytes));std::fflush(stderr);return 0;
}
