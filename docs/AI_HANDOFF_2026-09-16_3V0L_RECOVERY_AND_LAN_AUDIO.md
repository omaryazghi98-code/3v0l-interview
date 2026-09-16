# AI Handoff: 3V0L Recovery and LAN Audio

**Date:** 2026-09-16  
**Author:** AI agent (codebase analysis)  
**Branch:** `test/3v0l-recovery-and-lan-audio`  
**Base:** `main` (SHA `2137e23`)

---

## 1. Project Context

**3V0L Interview Command Center** is a local-first, French-first live interview
reference tool built for Omar Yazghi's job interviews at TransPerfect Gaming and
TapTap Send.

### Architecture overview

```
Interview PC (HP)
  Windows system speaker output
    -> 3v0l-listener.exe --system  (C++ WASAPI loopback)
    -> TCP PCM16 48 kHz mono  ->  LAN :38472

PC3 (Acer)
  audio-bridge/receiver.py
    -> Deepgram Nova-3 realtime STT
    -> SSE :38473/events  ->  EV0L browser sidebar

  copilot/server.mjs  (HTTP :38471)
    -> Requesty / Cerebras LLM
    -> grounded reference matching from data/content.js
    -> iPhone remote control (/remote)
```

### Key files

| Layer | File | Purpose |
|-------|------|---------|
| Frontend | `index.html` | Entry point, loads all scripts |
| Frontend | `app-v3.js` | Main app: routing, live mode, call lab, search, panic |
| Frontend | `runtime-fixes.js` | Route definitions, category views, call lab UI |
| Frontend | `boot-fixes.js` | Theme, font, keyboard hotkeys, auto-scroll |
| Frontend | `copilot-ui.js` | AI copilot sidebar: poll state, render results |
| Frontend | `lan-audio-transcript.js` | SSE client for audio bridge transcripts |
| Frontend | `nexq-transcript-bridge.js` | WebSocket fallback transcript path (NexQ) |
| Frontend | `remote-bridge.js` | HTTP polling for iPhone remote commands |
| Frontend | `copilot-reference-fix.js` | Fixed reference navigation from copilot rail |
| Frontend | `copilot-call-suggestion.js` | Detect telephone simulation in transcript |
| Frontend | `copilot-reference-accuracy.js` | Interview fact accuracy corrections |
| Server | `copilot/server.mjs` | HTTP relay: LLM, references, remote commands |
| Server | `copilot/stt.mjs` | Node STT (Deepgram/Azure) TCP server |
| Server | `copilot/start.mjs` | Env-aware entry point |
| Audio | `audio-bridge/receiver.py` | Python: PCM receiver, Deepgram STT, SSE |
| Audio | `audio-bridge/src/system_main.cpp` | C++ system speaker loopback capture |
| Audio | `audio-bridge/src/main.cpp` | C++ process-loopback capture (legacy) |
| Data | `data/content.js` | Interview answers, stories, scenarios, etc. |
| Data | `data/phonecalls.js` | French phone call scenarios |

### Branch naming convention

- `test/<topic>` for test/feature branches (this branch: `test/3v0l-recovery-and-lan-audio`)
- `feature/<topic>` for feature branches (existing: `feature/gpt41-v2-training`)
- Commit messages: `type: description` (e.g., `fix:`, `feat:`, `docs:`, `test:`)

### Coding standards

- Frontend: vanilla JS IIFEs, no build step, no dependencies
- Server: Node.js ESM (`import`), no framework
- Python: stdlib + `websocket-client`, no async framework
- `.gitignore` excludes `copilot/.env` and `copilot/node_modules/`
- Credentials never committed; `.env` files loaded locally

---

## 2. Current State

### What works

- French-first interview UI with live mode, call lab, search, panic mode
- Copilot rail with LLM-powered answer generation (Requesty primary, Cerebras fallback)
- LAN audio bridge: C++ system loopback -> Python receiver -> Deepgram -> SSE -> browser
- NexQ WebSocket bridge as fallback transcript path
- iPhone remote control via HTTP polling
- Reference accuracy corrections for interview facts
- Telephone simulation detection in copilot

### Identified issues (from codebase analysis)

1. **`lan-audio-transcript.js`**: SSE reconnection uses fixed exponential backoff
   with no jitter, no max-retry cap, no structured status reporting to UI.
   Fallback timer cleanup is incomplete on error.

2. **`nexq-transcript-bridge.js`**: WebSocket has basic reconnection but no
   heartbeat/health check, no ping-pong, no structured status events.

3. **`remote-bridge.js`**: HTTP polling has no error handling at all — fetch
   failures are silently swallowed, no backoff, no offline detection.

4. **`copilot-ui.js`**: Polling interval is fixed at 450ms with no backoff on
   failure; bridge-offline state is detected but recovery is immediate (no
   ramp-up).

5. **`audio-bridge/receiver.py`**: Deepgram WebSocket has keepalive but no
   automatic reconnection if the connection drops mid-session. A broken
   Deepgram link kills the entire transcriber thread with no recovery.

6. **`copilot/server.mjs`**: `/health` endpoint exists but does not report
   audio bridge connection status or STT provider state when using the external
   Python receiver.

7. **No tests**: The repository has zero automated tests. No test runner, no
   test files, no CI configuration.

8. **No `.gitignore` for Python artifacts**: `__pycache__/`, `*.pyc`, `.venv/`
   are not excluded.

---

## 3. Work Items

### WI-1: SSE connection recovery with health checks
**File:** `lan-audio-transcript.js`  
- Add jittered exponential backoff (base 1000ms, factor 1.7, jitter +/-20%, max 15s)
- Add max retry count (50) before showing persistent "disconnected" status
- Emit structured `nexq-transcript-status` events with `reconnectAttempt` and `retryExhausted`
- Clear all timers properly on reconnect and on `beforeunload`
- Expose `getStatus()` on `window.__3v0lAudioTranscript`

### WI-2: WebSocket health check and reconnection
**File:** `nexq-transcript-bridge.js`  
- Add 25-second heartbeat ping; if no pong within 10s, force reconnect
- Add jittered backoff matching the SSE client
- Emit structured `nexq-transcript-status` events with `reconnectAttempt`
- Expose `getStatus()` on `window.__3v0lNexQTranscript`

### WI-3: Remote bridge error handling and backoff
**File:** `remote-bridge.js`  
- Wrap fetch in try/catch with exponential backoff on failure (1000ms -> 10s)
- Detect offline state and emit `nexq-remote-status` events
- Reset backoff on successful poll
- Expose `getStatus()` on `window.__3v0lRemote`

### WI-4: Copilot polling backoff and recovery ramp-up
**File:** `copilot-ui.js`  
- Add exponential backoff on poll failure (450ms -> 5000ms)
- Reset to 450ms on first successful poll after failures
- Add `cpOffline` CSS class to copilot rail when bridge is unreachable
- Show "RECONNECTING…" text in `cpState` during backoff

### WI-5: Python receiver Deepgram auto-reconnect
**File:** `audio-bridge/receiver.py`  
- Add Deepgram reconnection logic: if the reader thread exits unexpectedly,
  attempt to reconnect up to 5 times with 3-second backoff before giving up
- Emit `status` SSE events with `reconnecting` and `reconnect_failed`
- Clean up threads properly on reconnection

### WI-6: Copilot server audio bridge health endpoint
**File:** `copilot/server.mjs`  
- Extend `/health` to include audio bridge configuration (external Python mode)
- Add `/audio-status` endpoint that reports whether the external receiver
  is expected and its known SSE URL
- Report `audioProvider: 'external-python'` in health response

### WI-7: Automated tests for bridge modules
**Files:** `tests/test-lan-audio-transcript.js`, `tests/test-nexq-bridge.js`, `tests/test-remote-bridge.js`, `tests/test-copilot-ui.js`, `tests/test-server.mjs`, `tests/README.md`  
- Set up Node.js test runner (`node:test` + `node:assert`)
- Test SSE reconnection logic, backoff calculation, status events
- Test WebSocket health check, reconnection, status events
- Test remote bridge backoff, offline detection, cursor persistence
- Test copilot polling backoff, recovery ramp-up
- Test server endpoints: `/health`, `/state`, `/event`, `/clear`, `/config`
- Document how to run tests in `tests/README.md`

### WI-8: Python artifacts in .gitignore
**File:** `.gitignore`  
- Add `__pycache__/`, `*.pyc`, `.venv/`, `*.egg-info/`

---

## 4. Testing Requirements

- All JavaScript bridge modules must have unit tests covering reconnection
  logic, backoff calculation, and status event emission.
- Server endpoints must have integration tests that verify response shape and
  error handling.
- Python receiver changes must not break the existing SSE contract.
- Run tests with: `node --test tests/` from the repository root.
- No new external dependencies should be added to the frontend.
