# 3V0L Live Copilot

This folder contains the local relay for the cross-PC interview assistant and the iPhone remote control surface.

## Current flow

```text
PC1 interview app
   ↓ Windows process loopback
3V0L listener
   ↓ PCM16 mono over LAN
PC3 :38472
   ↓ Deepgram Nova-3 multilingual STT
transcript
   ↓ grounded reference matching from data/content.js
Requesty
   ↓ concise speakable answer
3V0L copilot side rail

                └── :38471 /remote
                     ↓
                  iPhone remote
```

The browser UI never stores provider secrets. Put them in `copilot/.env` on the machine running the relay.

## PC3 setup

From `copilot` on PC3:

```powershell
Copy-Item .env.example .env
npm install
.\start-relay.ps1
```

Fill `REQUESTY_API_KEY` and `DEEPGRAM_API_KEY`. Azure is already wired as the alternate STT provider. Set `STT_PROVIDER=azure` to use it instead of Deepgram.

The relay imports the repository interview dataset directly at startup, so Requesty receives only the most relevant references for the current transcript rather than the whole dataset. The prompt explicitly forbids inventing Omar's experience.

Check the service with:

```powershell
curl http://127.0.0.1:38471/health
```

The health response reports Requesty configuration, STT provider, sample rate and whether an audio session is connected.

## PC1 listener build

Open Developer PowerShell for VS 2022 in `audio-bridge`:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

The executable is:

```text
build\Release\3v0l-listener.exe
```

For the live interview path, supply the PC3 LAN address and audio port:

```powershell
.\build\Release\3v0l-listener.exe <PID> 0 capture.wav <PC3_IP> 38472
```

`0` means keep streaming until the listener process is stopped. The optional WAV file remains useful for later diagnostics.

The listener captures the target process tree rather than recording a microphone aimed at speakers. The current implementation converts the captured stream to PCM16 mono before sending it to PC3.

## Remote

On the iPhone, open the LAN URL printed by the relay, for example `http://192.168.1.20:38471/remote`, then enter the configured PIN. The phone can control live navigation, Call Lab navigation, scrolling, auto-scroll, font size, theme, panic mode, category jumps and the copilot rail.

On Windows, allow Node.js through the firewall on the **Private network** when prompted. The phone and command-center PC must be on the same LAN.

## Event contract

POST JSON to `/event`:

```json
{
  "speaker": "interviewer",
  "transcript": "Parlez-moi d'une situation difficile avec un client.",
  "final": true
}
```

`context` is optional. When it is omitted, the relay performs local matching against `data/content.js` and sends the best references to Requesty.

The relay stores a compact state containing `intent`, `direction`, `sayThis`, `bestReference`, `confidence`, and the provider used.

## STT providers

Deepgram is the default realtime provider. The current path uses Nova-3 with `language=multi`, which supports English and French code-switching and streaming PCM audio. citeturn400971search0turn400971search3

Azure Speech is wired through its Node.js SDK push-stream path, which accepts in-memory audio and continuous recognition. citeturn441531search3turn441531search8

## Requesty

Requesty is used as the reasoning and answer-generation layer through its OpenAI-compatible `/v1/chat/completions` endpoint. citeturn441531search10

Keep credentials outside Git. `.gitignore` excludes `copilot/.env`.
