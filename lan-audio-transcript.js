(() => {
  const SSE_URL = localStorage.getItem('3v0l-audio-sse') || 'http://127.0.0.1:38473/events';
  const COPILOT_URL = localStorage.getItem('3v0l-copilot-url') || 'http://127.0.0.1:38471';
  let source = null;
  let retry = 1000;
  let latestFinal = '';
  let interim = '';
  let lastAnalyzed = '';

  function render() {
    const target = document.getElementById('cpTranscript');
    if (!target) return;
    const text = interim || latestFinal;
    if (text) target.textContent = text;
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

  function connect() {
    try {
      source = new EventSource(SSE_URL);
      source.onopen = () => {
        retry = 1000;
        window.dispatchEvent(new CustomEvent('nexq-transcript-status', {
          detail: { connected: true, source: 'audio-bridge' }
        }));
      };
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'status') {
            window.dispatchEvent(new CustomEvent('nexq-transcript-status', { detail: payload }));
            return;
          }
          if (payload.type !== 'speaker_transcript') return;
          const text = String(payload.text || '').trim();
          if (!text) return;
          if (payload.is_final) {
            latestFinal = text;
            interim = '';
            void sendToCopilot(text);
          } else {
            interim = text;
          }
          window.__3v0lLastInterviewerTranscript = text;
          window.dispatchEvent(new CustomEvent('nexq-speaker-transcript', { detail: payload }));
          render();
        } catch {}
      };
      source.onerror = () => {
        window.dispatchEvent(new CustomEvent('nexq-transcript-status', {
          detail: { connected: false, source: 'audio-bridge' }
        }));
        try { source.close(); } catch {}
        setTimeout(connect, retry);
        retry = Math.min(Math.round(retry * 1.7), 10000);
      };
    } catch {
      setTimeout(connect, retry);
      retry = Math.min(Math.round(retry * 1.7), 10000);
    }
  }

  window.__3v0lAudioTranscript = {
    reconnect: () => { try { source?.close(); } catch {} connect(); },
    url: SSE_URL,
    copilotUrl: COPILOT_URL
  };

  const renderTimer = setInterval(render, 500);
  window.addEventListener('beforeunload', () => clearInterval(renderTimer));
  connect();
})();
