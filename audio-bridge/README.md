# 3V0L Audio Bridge

First milestone for the multi-PC live interview assistant.

## Goal

Capture audio rendered by the interview application's Windows process tree on the interview PC, without using a microphone pointed at speakers.

Windows process loopback can include audio rendered by a target process and its child processes. This project currently writes a short WAV file so we can verify capture before adding LAN transport and Deepgram streaming.

## Build

Open **Developer PowerShell for VS 2022** in this directory:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

The executable will be:

```text
build\Release\3v0l-listener.exe
```

## Test Discord capture

1. Start Discord and make sure the interview voice/audio you want to test is playing through Discord.
2. Find the root Discord PID:

```powershell
.\find-discord.ps1
```

3. Run a 10 second capture:

```powershell
.\build\Release\3v0l-listener.exe <PID> 10 discord-test.wav
```

4. Play `discord-test.wav`.

Expected result: the WAV contains rendered audio from the target Discord process tree, not microphone audio.

## Next milestone

After the capture is confirmed:

```text
Windows process loopback
        ↓
PCM framing
        ↓
LAN transport
        ↓
PC3
        ↓
Deepgram realtime STT
        ↓
Requesty reasoning
        ↓
3V0L live sidebar
```

Credentials stay local and must not be committed to the repository.
