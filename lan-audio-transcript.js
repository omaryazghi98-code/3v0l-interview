(() => {
  const SSE_URL = localStorage.getItem('3v0l-audio-sse') || 'http://127.0.0.1:38473/events';
  let source = null;
  let retry = 1000;
  let finals = [];
  let interim = '';

  function render() {
    const target = document.getElementById('cpTranscript');
    if (!target) return;

    const parts = finals.slice(-6);
    if (interim) parts.push(interim);
    if (!parts.length) return;
    target.textContent = parts.join('\n');
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
            finals.push(text);
            finals = finals.slice(-6);
            interim = '';
          } else {
            interim = text;
          }

          window.__3v0lLastInterviewerTranscript = text;
          window.dispatchEvent(new CustomEvent('nexq-speaker-transcript', { detail: payload }));
          try { window.__3v0lCopilot?.analyze?.(text); } catch {}
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
    url: SSE_URL
  };

  // EV0L's copilot panel can be created after boot, so keep the latest text and
  // render again shortly after startup.
  const renderTimer = setInterval(render, 500);
  window.addEventListener('beforeunload', () => clearInterval(renderTimer));
  connect();
})();
