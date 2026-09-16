import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- Mock browser environment ---

class MockEventTarget {
  constructor() {
    this._listeners = new Map();
  }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    const arr = this._listeners.get(type);
    if (arr) {
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    }
  }
  dispatchEvent(event) {
    const arr = this._listeners.get(event.type) || [];
    for (const fn of arr) {
      try { fn(event); } catch {}
    }
    return true;
  }
}

class MockCustomEvent extends MockEventTarget {
  constructor(type, options = {}) {
    super();
    this.type = type;
    this.detail = options.detail || {};
  }
}

class MockEvent extends MockEventTarget {
  constructor(type, options = {}) {
    super();
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }
}

class MockKeyboardEvent extends MockEventTarget {
  constructor(type, options = {}) {
    super();
    this.type = type;
    this.code = options.code || '';
    this.key = options.key || '';
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }
}

class MockEventSource extends MockEventTarget {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this._shouldFail = MockEventSource.failNext;
    MockEventSource.failNext = false;
    // Simulate async connection
    setTimeout(() => {
      if (this._shouldFail) {
        this.readyState = 2;
        const errEvt = new MockCustomEvent('error');
        this.dispatchEvent(errEvt);
        if (this.onerror) this.onerror(errEvt);
      } else {
        this.readyState = 1;
        const openEvt = new MockCustomEvent('open');
        this.dispatchEvent(openEvt);
        if (this.onopen) this.onopen(openEvt);
      }
    }, 10);
  }
  close() { this.readyState = 2; }
}
MockEventSource.failNext = false;

class MockWebSocket extends MockEventTarget {
  static OPEN = 1;
  static CLOSED = 3;
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    setTimeout(() => {
      this.readyState = 1;
      const openEvt = new MockCustomEvent('open');
      this.dispatchEvent(openEvt);
      if (this.onopen) this.onopen(openEvt);
    }, 10);
  }
  send(data) {
    // Track sent messages for testing
    this._sent = this._sent || [];
    this._sent.push(data);
  }
  close() {
    this.readyState = 3;
    const closeEvt = new MockCustomEvent('close');
    this.dispatchEvent(closeEvt);
    if (this.onclose) this.onclose(closeEvt);
  }
}

class MockElement {
  constructor(id) {
    this.id = id;
    this.textContent = '';
    this.innerHTML = '';
    this.dataset = {};
    this.scrollTop = 0;
    this.scrollHeight = 1000;
    this.clientHeight = 500;
    this.style = {};
    this.classList = {
      _classes: new Set(),
      toggle(c, force) {
        if (force === true || (force === undefined && !this._classes.has(c))) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      },
      contains(c) { return this._classes.has(c); },
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
    };
  }
  addEventListener() {}
  removeEventListener() {}
  click() {}
  scrollBy() {}
  scrollIntoView() {}
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  dispatchEvent() { return true; }
}

class MockDocument extends MockEventTarget {
  constructor() {
    super();
    this._elements = new Map();
    this.documentElement = new MockElement('html');
    this.body = new MockElement('body');
  }
  getElementById(id) {
    if (!this._elements.has(id)) {
      this._elements.set(id, new MockElement(id));
    }
    return this._elements.get(id);
  }
  querySelector(sel) {
    if (sel === 'html') return this.documentElement;
    if (sel === 'body') return this.body;
    return null;
  }
  querySelectorAll() { return []; }
  createElement(tag) {
    return new MockElement(tag);
  }
  addEventListener(type, fn, opts) {
    super.addEventListener(type, fn);
  }
}

// Reusable EventTarget mixin so globalThis can act as window
const _globalListeners = new Map();
const _globalDispatch = (event) => {
  const arr = _globalListeners.get(event.type) || [];
  for (const fn of arr) {
    try { fn(event); } catch {}
  }
  return true;
};
const _globalAddEventListener = (type, fn) => {
  if (!_globalListeners.has(type)) _globalListeners.set(type, []);
  _globalListeners.get(type).push(fn);
};
const _globalRemoveEventListener = (type, fn) => {
  const arr = _globalListeners.get(type);
  if (arr) {
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }
};

// Track timers so we can clean them up after each test
const _nativeSetInterval = globalThis.setInterval.bind(globalThis);
const _nativeSetTimeout = globalThis.setTimeout.bind(globalThis);
const _nativeClearInterval = globalThis.clearInterval.bind(globalThis);
const _nativeClearTimeout = globalThis.clearTimeout.bind(globalThis);
const _activeTimers = new Set();
const _trackedSetInterval = (...args) => {
  const id = _nativeSetInterval(...args);
  _activeTimers.add(id);
  return id;
};
const _trackedSetTimeout = (...args) => {
  const id = _nativeSetTimeout(...args);
  _activeTimers.add(id);
  return id;
};
const _trackedClearInterval = (id) => {
  _activeTimers.delete(id);
  _nativeClearInterval(id);
};
const _trackedClearTimeout = (id) => {
  _activeTimers.delete(id);
  _nativeClearTimeout(id);
};

function setupMockEnv() {
  const events = [];
  const store = {};

  // Make globalThis behave as a window (EventTarget)
  _globalListeners.clear();
  globalThis.window = globalThis;
  globalThis.addEventListener = _globalAddEventListener;
  globalThis.removeEventListener = _globalRemoveEventListener;
  // Preserve external dispatchEvent capability while also notifying internal listeners
  globalThis.dispatchEvent = (event) => {
    events.push(event);
    _globalDispatch(event);
    return true;
  };
  globalThis.__testEvents = events;

  globalThis.document = new MockDocument();
  globalThis.localStorage = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
  };
  globalThis.EventSource = MockEventSource;
  globalThis.WebSocket = MockWebSocket;
  globalThis.CustomEvent = MockCustomEvent;
  globalThis.Event = MockEvent;
  globalThis.KeyboardEvent = MockKeyboardEvent;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });

  // Override timers so we can clean them up between tests
  globalThis.setInterval = _trackedSetInterval;
  globalThis.setTimeout = _trackedSetTimeout;
  globalThis.clearInterval = _trackedClearInterval;
  globalThis.clearTimeout = _trackedClearTimeout;

  return { events, store };
}

function loadScript(relPath) {
  const code = readFileSync(join(root, relPath), 'utf-8');
  // IIFE scripts are self-executing; eval in the current context
  // eslint-disable-next-line no-eval
  eval(code);
}

function cleanupMockEnv() {
  // Clear all tracked timers to prevent hanging event loop
  for (const id of _activeTimers) {
    clearInterval(id);
    clearTimeout(id);
  }
  _activeTimers.clear();

  _globalListeners.clear();
  delete globalThis.window;
  delete globalThis.addEventListener;
  delete globalThis.removeEventListener;
  delete globalThis.dispatchEvent;
  delete globalThis.document;
  delete globalThis.localStorage;
  delete globalThis.EventSource;
  delete globalThis.WebSocket;
  delete globalThis.CustomEvent;
  delete globalThis.Event;
  delete globalThis.KeyboardEvent;
  delete globalThis.__3v0lAudioTranscript;
  delete globalThis.__3v0lNexQTranscript;
  delete globalThis.__3v0lRemote;
  delete globalThis.__testEvents;
  // Restore native timers
  globalThis.setInterval = _nativeSetInterval;
  globalThis.setTimeout = _nativeSetTimeout;
  globalThis.clearInterval = _nativeClearInterval;
  globalThis.clearTimeout = _nativeClearTimeout;
}

// --- Tests ---

describe('lan-audio-transcript.js', () => {
  let env;

  beforeEach(() => { env = setupMockEnv(); });
  afterEach(() => { cleanupMockEnv(); });

  it('exposes __3v0lAudioTranscript with expected API', () => {
    loadScript('lan-audio-transcript.js');
    const api = globalThis.__3v0lAudioTranscript;
    assert.ok(api, 'should expose __3v0lAudioTranscript');
    assert.equal(typeof api.reconnect, 'function');
    assert.equal(typeof api.getStatus, 'function');
    assert.ok(api.url, 'should expose SSE URL');
    assert.ok(api.copilotUrl, 'should expose copilot URL');
  });

  it('getStatus returns connection state', () => {
    loadScript('lan-audio-transcript.js');
    const status = globalThis.__3v0lAudioTranscript.getStatus();
    assert.ok('connected' in status, 'should have connected field');
    assert.ok('attempts' in status, 'should have attempts field');
    assert.equal(status.retryExhausted, false);
  });

  it('dispatches status event on connection', async () => {
    loadScript('lan-audio-transcript.js');
    await new Promise(r => setTimeout(r, 50));
    const statusEvents = env.events.filter(
      e => e.type === 'nexq-transcript-status' && e.detail.connected === true
    );
    assert.ok(statusEvents.length > 0, 'should dispatch connected status');
  });

  it('dispatches status event with reconnectAttempt on failure', async () => {
    MockEventSource.failNext = true;
    loadScript('lan-audio-transcript.js');
    await new Promise(r => setTimeout(r, 50));
    const failEvents = env.events.filter(
      e => e.type === 'nexq-transcript-status' && e.detail.connected === false
    );
    assert.ok(failEvents.length > 0, 'should dispatch disconnected status');
    assert.ok(
      failEvents.some(e => 'reconnectAttempt' in e.detail),
      'should include reconnectAttempt'
    );
  });
});

describe('nexq-transcript-bridge.js', () => {
  let env;

  beforeEach(() => { env = setupMockEnv(); });
  afterEach(() => { cleanupMockEnv(); });

  it('exposes __3v0lNexQTranscript with expected API', () => {
    loadScript('nexq-transcript-bridge.js');
    const api = globalThis.__3v0lNexQTranscript;
    assert.ok(api, 'should expose __3v0lNexQTranscript');
    assert.equal(typeof api.reconnect, 'function');
    assert.equal(typeof api.getStatus, 'function');
    assert.ok(api.nexqWs, 'should expose WebSocket URL');
    assert.ok(api.relay, 'should expose relay URL');
  });

  it('getStatus returns connection state', () => {
    loadScript('nexq-transcript-bridge.js');
    const status = globalThis.__3v0lNexQTranscript.getStatus();
    assert.ok('connected' in status, 'should have connected field');
    assert.ok('attempts' in status, 'should have attempts field');
  });

  it('dispatches connected status on open', async () => {
    loadScript('nexq-transcript-bridge.js');
    await new Promise(r => setTimeout(r, 50));
    const openEvents = env.events.filter(
      e => e.type === 'nexq-transcript-status' && e.detail.connected === true
    );
    assert.ok(openEvents.length > 0, 'should dispatch connected status');
  });
});

describe('remote-bridge.js', () => {
  let env;

  beforeEach(() => { env = setupMockEnv(); });
  afterEach(() => {
    cleanupMockEnv();
    delete globalThis.__3v0lRemote;
  });

  it('exposes __3v0lRemote with expected API', () => {
    loadScript('remote-bridge.js');
    const api = globalThis.__3v0lRemote;
    assert.ok(api, 'should expose __3v0lRemote');
    assert.ok(api.api, 'should expose API URL');
    assert.equal(typeof api.resetCursor, 'function');
    assert.equal(typeof api.getStatus, 'function');
  });

  it('getStatus returns connection state', () => {
    loadScript('remote-bridge.js');
    const status = globalThis.__3v0lRemote.getStatus();
    assert.ok('connected' in status, 'should have connected field');
    assert.ok('api' in status, 'should have api field');
    assert.ok('interval' in status, 'should have interval field');
  });

  it('dispatches nexq-remote-status event on failure', async () => {
    // Override fetch to fail
    globalThis.fetch = async () => { throw new Error('network error'); };
    loadScript('remote-bridge.js');
    await new Promise(r => setTimeout(r, 50));
    const statusEvents = env.events.filter(
      e => e.type === 'nexq-remote-status' && e.detail.connected === false
    );
    assert.ok(statusEvents.length > 0, 'should dispatch offline status');
    assert.ok(statusEvents[0].detail.error, 'should include error message');
  });
});
