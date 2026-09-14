# 3V0L Live Copilot

This folder contains the local relay for the future cross-PC interview assistant.

## Current flow

```text
PC1 audio bridge
   ↓ POST /event
localhost:38471
   ↓
local reference matching + optional Requesty reasoning
   ↓ GET /state
3V0L copilot side rail
```

The browser UI never stores provider secrets. Put them in `copilot/.env` on the machine running the relay.

## Start

1. Copy `.env.example` to `.env`.
2. Fill in provider keys locally.
3. Run `./start-relay.ps1` from PowerShell.
4. Open `index.html`.
5. The AI rail should show `READY` when the relay is reachable.
6. Use **Test question** to exercise the full local UI before the interview PC audio bridge exists.

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

## Planned providers

- Deepgram: primary realtime speech-to-text once the Windows audio bridge streams audio.
- Azure Speech: fallback or secondary speech path. The existing Azure Speech resource is configured in East US.
- Requesty: reasoning and grounded answer generation.

Keep credentials outside Git. `.gitignore` excludes `copilot/.env`.
