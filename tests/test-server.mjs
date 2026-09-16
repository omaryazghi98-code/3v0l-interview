import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';

// --- Test helpers ---

let serverProcess = null;
let baseUrl = '';
const TEST_PORT = 13871;

async function fetchJson(path, options = {}) {
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  const resp = await fetch(url, { cache: 'no-store', ...options });
  const body = await resp.json();
  return { status: resp.status, body };
}

async function postJson(path, payload) {
  return fetchJson(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// --- Server lifecycle ---

before(async () => {
  process.env.COPILOT_PORT = String(TEST_PORT);
  process.env.COPILOT_HOST = '127.0.0.1';
  process.env.NODE_STT_SERVER = '0'; // Use external Python mode
  // Provide dummy LLM keys so config is non-empty
  process.env.REQUESTY_API_KEY = process.env.REQUESTY_API_KEY || 'test-key';
  // Import the server module (it self-starts on listen)
  await import('../copilot/server.mjs');
  baseUrl = `http://127.0.0.1:${TEST_PORT}`;
  // Give the server a moment to be ready
  await new Promise(r => setTimeout(r, 300));
});

after(async () => {
  // Node doesn't expose the server handle; tests rely on process exit.
});

// --- Tests ---

describe('Server /health endpoint', () => {
  it('returns ok with audio provider info', async () => {
    const { status, body } = await fetchJson('/health');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.ok(body.llm, 'should include llm status');
    assert.ok(body.audioProvider, 'should include audioProvider');
    assert.equal(body.audioProvider, 'external-python');
    assert.ok(body.sseUrl, 'should include SSE URL');
    assert.equal(body.audioPort, 38472);
  });
});

describe('Server /audio-status endpoint', () => {
  it('returns audio bridge configuration', async () => {
    const { status, body } = await fetchJson('/audio-status');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.provider, 'external-python');
    assert.equal(body.audioPort, 38472);
    assert.ok(body.sseUrl, 'should include SSE URL');
    assert.equal(body.nodeSttEnabled, false);
  });
});

describe('Server /state endpoint', () => {
  it('returns initial state with idle intent', async () => {
    const { status, body } = await fetchJson('/state');
    assert.equal(status, 200);
    assert.equal(body.intent, 'idle');
    assert.equal(body.transcript, '');
    assert.equal(body.provider, 'none');
  });
});

describe('Server /event endpoint', () => {
  it('processes a transcript and returns updated state', async () => {
    const { status, body } = await postJson('/event', {
      transcript: 'Parlez-moi de votre expérience.',
      speaker: 'interviewer',
      final: false,
    });
    assert.equal(status, 200);
    assert.ok(body.transcript, 'should have transcript');
    assert.equal(body.speaker, 'interviewer');
    assert.ok(body.lastEventAt, 'should have lastEventAt');
  });

  it('detects introduction intent for self-presentation', async () => {
    const { body } = await postJson('/event', {
      transcript: 'Présentez-vous.',
      speaker: 'interviewer',
      final: false,
    });
    assert.equal(body.intent, 'introduction');
    assert.ok(body.bestReference, 'should have a best reference');
  });

  it('detects difficult customer intent for angry keywords', async () => {
    const { body } = await postJson('/event', {
      transcript: 'Comment gérez-vous un client angry et frustré?',
      speaker: 'interviewer',
      final: false,
    });
    assert.equal(body.intent, 'difficult_customer');
  });

  it('returns unknown intent for unrecognised text', async () => {
    const { body } = await postJson('/event', {
      transcript: 'Quel temps fait-il aujourd hui?',
      speaker: 'interviewer',
      final: false,
    });
    assert.equal(body.intent, 'unknown');
    assert.equal(body.final, false);
  });

  it('handles empty transcript gracefully', async () => {
    // Clear state first to avoid interference from previous tests
    await postJson('/clear', {});
    const { status, body } = await postJson('/event', {
      transcript: '',
      speaker: 'interviewer',
      final: false,
    });
    assert.equal(status, 200);
    assert.equal(body.intent, 'idle');
  });
});

describe('Server /clear endpoint', () => {
  it('resets state to idle', async () => {
    // First send an event to populate state
    await postJson('/event', {
      transcript: 'Test question.',
      speaker: 'interviewer',
      final: false,
    });
    // Then clear
    const { status, body } = await postJson('/clear', {});
    assert.equal(status, 200);
    assert.equal(body.intent, 'idle');
    assert.equal(body.transcript, '');
    assert.equal(body.lastEventAt, null);
  });
});

describe('Server /config endpoints', () => {
  it('GET /config returns llm status', async () => {
    const { status, body } = await fetchJson('/config');
    assert.equal(status, 200);
    assert.ok(body.llm, 'should include llm config');
    assert.equal(body.llm.enabled, true);
    assert.equal(body.requestyConfigured, true);
  });

  it('POST /config toggles LLM enabled state', async () => {
    const { body: disableBody } = await postJson('/config', { llm: false });
    assert.equal(disableBody.llm.enabled, false);

    const { body: enableBody } = await postJson('/config', { llm: true });
    assert.equal(enableBody.llm.enabled, true);
  });
});

describe('Server /remote/info endpoint', () => {
  it('returns remote configuration', async () => {
    const { status, body } = await fetchJson('/remote/info');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.port, TEST_PORT);
    assert.ok(body.audioPort, 'should include audio port');
  });
});

describe('Server /remote/commands endpoint', () => {
  it('returns empty commands initially', async () => {
    const { status, body } = await fetchJson('/remote/commands?after=0');
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.commands));
  });
});

describe('Server /remote/action endpoint', () => {
  it('rejects invalid PIN', async () => {
    const { status, body } = await postJson('/remote/action', {
      pin: 'wrong-pin',
      action: 'ping',
    });
    assert.equal(status, 401);
    assert.ok(body.error, 'should return error');
  });

  it('accepts valid PIN and enqueues command', async () => {
    const { status, body } = await postJson('/remote/action', {
      pin: '3060',
      action: 'ping',
    });
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.ok(body.command, 'should return command');
    assert.ok(body.command.id, 'command should have id');
    assert.equal(body.command.action, 'ping');
  });
});

describe('Server 404 handling', () => {
  it('returns 404 for unknown paths', async () => {
    const { status, body } = await fetchJson('/unknown-path');
    assert.equal(status, 404);
    assert.ok(body.error, 'should return error');
  });
});
