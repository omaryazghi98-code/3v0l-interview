# 3V0L Audio Bridge

The audio bridge captures audio rendered by the interview PC and can stream it to another PC as raw mono PCM16 over TCP.

## Architecture

```text
Interview PC / HP
Windows speaker output
        ↓
3v0l-listener.exe --system
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

System mode uses Windows render-loopback on the default playback device. It captures audio being rendered to the speakers/headphones and does not capture the microphone as an input device. A microphone is only present if Windows or an application deliberately routes microphone monitoring back into the playback output.

The older process-loopback mode is still available when a specific application process needs to be targeted.

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

## System speaker capture — recommended interview mode

Capture everything rendered by the HP's default Windows playback device:

```powershell
.\build\Release\3v0l-listener.exe --system 10 system-test.wav
```

For the live interview bridge to the Acer:

```powershell
.\build\Release\3v0l-listener.exe --system 0 bridge.wav 192.168.11.103 38472
```

`0` means stream until interrupted. The sender converts the rendered audio to mono PCM16 at the playback device's sample rate and streams it over TCP.

This mode does **not** require a Discord PID, and it works regardless of whether the interviewer audio comes from Discord, Google Meet, Teams, Zoom, a browser, or another Windows application.

## Process loopback — optional legacy/test mode

Find Discord's root PID:

```powershell
.\find-discord.ps1
```

Capture 10 seconds to WAV:

```powershell
.\build\Release\3v0l-listener.exe <PID> 10 discord-test.wav
```

Or stream a specific process tree to the Acer:

```powershell
.\build\Release\3v0l-listener.exe <PID> 0 bridge.wav 192.168.11.103 38472
```

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

The receiver forwards the PCM stream to Deepgram Nova-3 and emits interim/final interviewer transcripts to EV0L.

## Windows Firewall

The Acer must accept inbound TCP `38472` from the HP. Run PowerShell as Administrator if Windows Firewall blocks the connection:

```powershell
New-NetFirewallRule -DisplayName "3V0L Audio Bridge 38472" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 38472
```

The EV0L SSE endpoint stays bound to `127.0.0.1:38473` and is not exposed to the LAN.

## EV0L

`index.html` loads `lan-audio-transcript.js`, which listens to the local SSE endpoint and puts the interviewer transcript into the existing live transcript area. The existing NexQ WebSocket bridge remains untouched as a separate fallback path.

Credentials stay local and must not be committed to the repository.
