(() => {
  const SSE_URL = localStorage.getItem('3v0l-audio-sse') || 'http://127.0.0.1:38473/events';
  const COPILOT_URL = localStorage.getItem('3v0l-copilot-url') || 'http://127.0.0.1:38471';
  const BASE_RETRY = 1000;
  const MAX_RETRY = 15000;
  const RETRY_FACTOR = 1.7;
  const JITTER = 0.2;
  const MAX_ATTEMPTS = 50;

  let source = null;
  let retry = BASE_RETRY;
  let attempts = 0;
  let current = '';
  let lastAnalyzed = '';
  let fallbackTimer = 0;
  let reconnectTimer = 0;
  let connected = false;

  function jitteredDelay(base) {
    const jitter = base * JITTER * (Math.random() * 2 - 1);
    return Math.min(Math.round(base + jitter), MAX_RETRY);
  }

  function emitStatus(detail) {
    window.dispatchEvent(new CustomEvent('nexq-transcript-status', { detail }));
  }

  function render() {
    const target = document.getElementById('cpTranscript');
    if (!target) return;
    target.textContent = current || 'Waiting for audio / transcript…';
  }

  async function sendToCopilot(text) {
    const clean = String(text || '').trim();
    if (!clean || clean === lastAnalyzed) return;
    lastAnalyzed = clean;
    try {
      if (window.__3v0lCopilot?.analyze) {
        await window.__3v0lCopilot.analyze(clean);
        return;
      }
    } catch {}
    try {
      await fetch(`${COPILOT_URL}/event`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript: clean, speaker: 'interviewer', final: true })
      });
    } catch {}
  }

  function commitUtterance(text) {
    const clean = String(text || '').trim();
    if (!clean) return;
    current = clean;
    render();
    window.__3v0lLastInterviewerTranscript = clean;
    window.dispatchEvent(new CustomEvent('nexq-speaker-transcript', {
      detail: { type: 'speaker_transcript', text: clean, speaker: 'Them', is_final: true, speech_final: true }
    }));
    void sendToCopilot(clean);
  }

  function connect() {
    clearTimeout(reconnectTimer);
    try {
      source = new EventSource(SSE_URL);
      source.onopen = () => {
        retry = BASE_RETRY;
        attempts = 0;
        connected = true;
        emitStatus({ connected: true, source: 'audio-bridge' });
      };
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'status') {
            emitStatus(payload);
            return;
          }
          if (payload.type !== 'speaker_transcript') return;

          const text = String(payload.text || '').trim();
          if (!text) return;

          if (payload.is_final) {
            current = text;
            render();
            if (payload.speech_final) {
              clearTimeout(fallbackTimer);
              commitUtterance(text);
            } else {
              clearTimeout(fallbackTimer);
              fallbackTimer = setTimeout(() => commitUtterance(current), 900);
            }
          } else {
            current = text;
            render();
          }

          window.__3v0lLastInterviewerTranscript = text;
          window.dispatchEvent(new CustomEvent('nexq-speaker-transcript', { detail: payload }));
        } catch {}
      };
      source.onerror = () => {
        connected = false;
        emitStatus({ connected: false, source: 'audio-bridge' });
        try { source.close(); } catch {}
        source = null;

        attempts++;
        if (attempts > MAX_ATTEMPTS) {
          emitStatus({
            connected: false,
            source: 'audio-bridge',
            retryExhausted: true,
            attempts
          });
          return;
        }

        const delay = jitteredDelay(retry);
        emitStatus({
          connected: false,
          source: 'audio-bridge',
          reconnectAttempt: attempts,
          nextRetryIn: delay
        });
        reconnectTimer = setTimeout(connect, delay);
        retry = Math.min(Math.round(retry * RETRY_FACTOR), MAX_RETRY);
      };
    } catch {
      connected = false;
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        emitStatus({
          connected: false,
          source: 'audio-bridge',
          retryExhausted: true,
          attempts
        });
        return;
      }
      const delay = jitteredDelay(retry);
      emitStatus({
        connected: false,
        source: 'audio-bridge',
        reconnectAttempt: attempts,
        nextRetryIn: delay
      });
      reconnectTimer = setTimeout(connect, delay);
      retry = Math.min(Math.round(retry * RETRY_FACTOR), MAX_RETRY);
    }
  }

  window.__3v0lAudioTranscript = {
    reconnect: () => {
      clearTimeout(reconnectTimer);
      clearTimeout(fallbackTimer);
      try { source?.close(); } catch {}
      source = null;
      attempts = 0;
      retry = BASE_RETRY;
      connect();
    },
    url: SSE_URL,
    copilotUrl: COPILOT_URL,
    getStatus: () => ({
      connected,
      source: 'audio-bridge',
      attempts,
      retryExhausted: attempts > MAX_ATTEMPTS
    })
  };

  const renderTimer = setInterval(render, 500);
  window.addEventListener('beforeunload', () => {
    clearInterval(renderTimer);
    clearTimeout(fallbackTimer);
    clearTimeout(reconnectTimer);
    try { source?.close(); } catch {}
  });
  connect();
})();
