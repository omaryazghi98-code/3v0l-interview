# 3V0L Test Suite

Automated tests for the 3V0L Interview Command Center, covering server endpoints
and frontend bridge module recovery logic.

## Running tests

From the repository root:

```bash
node --test --test-force-exit tests/
```

Node.js 18+ is required (uses the built-in `node:test` runner — no dependencies).

> `--test-force-exit` is needed because the server test starts an HTTP listener
> that keeps the event loop alive after tests finish.

## Test files

| File | Coverage |
|------|----------|
| `test-server.mjs` | Copilot relay HTTP endpoints: `/health`, `/audio-status`, `/state`, `/event`, `/clear`, `/config`, `/remote/info`, `/remote/commands`, `/remote/action`, 404 handling |
| `test-bridges.mjs` | Frontend bridge modules: `lan-audio-transcript.js` (SSE recovery, getStatus, status events), `nexq-transcript-bridge.js` (WebSocket recovery, heartbeat, getStatus), `remote-bridge.js` (HTTP polling backoff, offline detection, getStatus) |

## What the tests verify

### Server tests

- `/health` returns `audioProvider`, `audioPort`, and `sseUrl` in external-Python mode
- `/audio-status` reports the external receiver configuration
- `/state` returns the initial idle state
- `/event` processes transcripts, detects intents (introduction, difficult_customer, unknown)
- `/clear` resets state to idle
- `/config` GET returns LLM status; POST toggles LLM enabled
- `/remote/info` and `/remote/commands` return expected shapes
- `/remote/action` enforces PIN authentication
- Unknown paths return 404

### Bridge tests

- Each bridge module exposes `getStatus()` and `reconnect()`
- `lan-audio-transcript.js` dispatches `nexq-transcript-status` events with
  `connected: true` on open and `reconnectAttempt` on failure
- `nexq-transcript-bridge.js` dispatches connected status on WebSocket open
  and includes `source: 'nexq'` in status events
- `remote-bridge.js` dispatches `nexq-remote-status` events with error details
  on fetch failure and backoff is applied via adaptive interval
