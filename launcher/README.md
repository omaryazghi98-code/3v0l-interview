# 3V0L Mega Launcher

The launcher suite is the control plane for the three-PC interview setup:

- **HP — 192.168.11.113:** interview source + NexQ core.
- **Acer — 192.168.11.103:** 3V0L AI command center, receiver, Deepgram, Copilot relay.
- **Lenovo — 192.168.11.106:** large-screen NexQ teleprompter.

## Design goals

1. One dashboard instead of many PowerShell windows.
2. Health/status checks for every PC and service.
3. Start/stop/restart controls for allowlisted services only.
4. Deepgram is **off by default** and only starts when the audio receiver is started.
5. API keys remain local; nothing secret belongs in this repository.
6. A local launcher agent runs on each PC and exposes only the configured service names.

## Agent

Copy `launcher.example.json` to `launcher.local.json` on each PC and edit the machine name, working directories and allowed commands. Then run:

```powershell
node launcher\agent.mjs
```

Default agent port: `38500`.

For Windows startup, the agent can later be registered as a scheduled task or packaged as a small executable. Keep the first rollout as a normal Node process until all three machines are tested.

## Dashboard

The dashboard is `launcher/dashboard.html`. It is intentionally a plain local web UI so it can be hosted by any small static server without another framework or build chain.

The first version focuses on orchestration. The next pass can add presets such as **START INTERVIEW**, **QUIET MODE**, **TEST AUDIO**, **AI ONLY**, and **SHUT DOWN INTERVIEW SERVICES**, plus richer health diagnostics and per-machine logs.

## Important

Do not put `.env`, API keys, or machine-specific `launcher.local.json` files into Git.
