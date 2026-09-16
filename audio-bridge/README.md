# 3V0L Audio Bridge

The audio bridge captures audio rendered by the interview application's Windows process tree and can stream it to another PC as raw mono PCM16 over TCP.

## Architecture

```text
Interview PC / HP
Windows process loopback
        ↓
3v0l-listener.exe
        ↓ TCP PCM16, 48 kHz, mono
LAN :38472
        ↓
3V0L PC3 / Acer
receiver.py
        ↓
Deepgram Nova-3 realtime STT
        ↓ SSE :38473
3V0L EV0L sidebar
```

The sender does not use a microphone. It targets the interview application's process tree.

## Build sender

Open **Developer PowerShell for VS 2022** in this directory:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

Executable:

```text
build\Release\3v0l-listener.exe
```

## Local capture test

Find Discord's root PID:

```powershell
.\find-discord.ps1
```

Capture 10 seconds to WAV:

```powershell
.\build\Release\3v0l-listener.exe <PID> 10 discord-test.wav
```

## LAN mode

The sender already supports live TCP streaming:

```powershell
.\build\Release\3v0l-listener.exe <PID> 0 bridge.wav <ACER_IP> 38472
```

Example for the current LAN:

```powershell
.\build\Release\3v0l-listener.exe <PID> 0 bridge.wav 192.168.11.103 38472
```

`0` means stream until interrupted. The sender transmits raw mono PCM16 at 48 kHz.

## Acer receiver

From `audio-bridge` on the Acer:

```powershell
python -m pip install -r requirements.txt
```

Create a local `.env` from `.env.example` and set `DEEPGRAM_API_KEY`. Do not commit the key.

Start the receiver:

```powershell
python receiver.py
```

You should see:

```text
LAN audio receiver listening on 0.0.0.0:38472
EV0L transcript SSE: http://127.0.0.1:38473/events
```

The receiver forwards the 48 kHz mono PCM stream to Deepgram Nova-3 using raw `linear16` streaming and emits interim/final interviewer transcripts to EV0L. Deepgram's current streaming documentation supports raw linear16 with explicit sample rate and Nova-3; `language=multi` can be used for multilingual streaming. citeturn865667search4turn865667search2

## Windows Firewall

The Acer must accept inbound TCP `38472` from the HP. Run PowerShell as Administrator if Windows Firewall blocks the connection:

```powershell
New-NetFirewallRule -DisplayName "3V0L Audio Bridge 38472" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 38472
```

The EV0L SSE endpoint stays bound to `127.0.0.1:38473` and is not exposed to the LAN.

## EV0L

`index.html` loads `lan-audio-transcript.js`, which listens to the local SSE endpoint and puts the interviewer transcript into the existing live transcript area. The existing NexQ WebSocket bridge remains untouched as a separate fallback path.

Credentials stay local and must not be committed to the repository.
