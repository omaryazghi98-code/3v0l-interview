# 3V0L Live Copilot

This folder contains the local relay for the cross-PC interview assistant and the iPhone remote control surface.

## Current flow

```text
PC1 interview audio bridge
   ↓ POST /event later
3V0L relay on PC3 :38471
   ↓
reference matching + optional Requesty reasoning
   ↓ GET /state
3V0L copilot side rail

                └── /remote
                     ↓
                  iPhone remote
                     ↓ POST /remote/action
                  command queue
                     ↓ GET /remote/commands
                  PC3 command center
```

The browser UI never stores provider secrets. Put them in `copilot/.env` on the machine running the relay.

## Start

1. Copy `.env.example` to `.env`.
2. Fill in provider keys locally.
3. Run `./start-relay.ps1` from PowerShell.
4. Open `index.html` on the command-center PC.
5. On the iPhone, open the LAN URL printed by the relay, for example `http://192.168.1.20:38471/remote`.
6. Enter the printed remote PIN. The default development PIN is `3060`; set `REMOTE_PIN` in `.env` before real use.
7. The phone can control Live navigation, Call Lab navigation, scrolling, auto-scroll, font size, theme, panic mode, category jumps and the copilot rail.

On Windows, allow Node.js through the firewall on the **Private network** when prompted. The phone and command-center PC must be on the same LAN.

## Event contract

POST JSON to `/event`:

```json
{
  "speaker": "interviewer",
  "transcript": "Parlez-moi d'une situation difficile avec un client.",
  "final": true,
  "context": [
    {"id":"epic-wrong-account","title":"Epic — achat sur le mauvais compte","company":"5CA Epic Games","tags":["epic","gaming","account"]}
  ]
}
```

The relay returns and stores a compact state containing `intent`, `direction`, `sayThis`, `bestReference`, `confidence`, and the provider used.

## Remote contract

`POST /remote/action` requires `{ "pin": "...", "action": "next-live" }` and queues the action for the command-center browser.

`GET /remote/commands?after=N` returns queued commands newer than `N`.

`GET /remote` serves the iPhone-friendly remote web app. It includes an installable web-app manifest and a lightweight service-worker shell.

## Planned providers

- Deepgram: primary realtime speech-to-text once the Windows audio bridge streams audio.
- Azure Speech: fallback or secondary speech path. The existing Azure Speech resource is configured in East US.
- Requesty: reasoning and grounded answer generation.

Keep credentials outside Git. `.gitignore` excludes `copilot/.env`.
