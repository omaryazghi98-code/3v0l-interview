(()=>{
  // NexQ publishes only the system/interviewer STT stream as speaker_transcript.
  // Acer's EV0L page receives that text directly; when a copilot relay is
  // reachable it also forwards the same interviewer text for reasoning.
  const NEXQ_WS = localStorage.getItem('nexq-ws') || 'ws://192.168.11.113:17321/ws?v=4';
  const RELAY = localStorage.getItem('3v0l-relay') || 'http://192.168.11.113:38471';
  const BASE_RETRY = 1000;
  const MAX_RETRY = 10000;
  const RETRY_FACTOR = 1.7;
  const JITTER = 0.2;
  const HEARTBEAT_INTERVAL = 25000;
  const PONG_TIMEOUT = 10000;

  let ws = null;
  let retry = BASE_RETRY;
  let attempts = 0;
  let connected = false;
  let heartbeatTimer = 0;
  let pongTimer = 0;
  let reconnectTimer = 0;
  let manualClose = false;

  function jitteredDelay(base) {
    const jitter = base * JITTER * (Math.random() * 2 - 1);
    return Math.min(Math.round(base + jitter), MAX_RETRY);
  }

  function emitStatus(detail) {
    window.dispatchEvent(new CustomEvent('nexq-transcript-status', { detail }));
  }

  function showInEV0L(payload){
    const text = String(payload?.text || '').trim();
    if(!text) return;

    const target = document.getElementById('cpTranscript');
    if(target) target.textContent = text;

    window.__3v0lLastInterviewerTranscript = text;

    try{
      window.__3v0lCopilot?.analyze?.(text);
    }catch{}
  }

  async function forward(payload){
    const text = String(payload?.text || '').trim();
    if(!text) return;
    try{
      await fetch(`${RELAY}/event`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          transcript:text,
          speaker:'interviewer',
          final:payload?.is_final !== false,
          provider:'nexq-system-stt'
        })
      });
    }catch{}
  }

  function handle(payload){
    showInEV0L(payload);
    void forward(payload);
    window.dispatchEvent(new CustomEvent('nexq-speaker-transcript',{detail:payload}));
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'ping' })); } catch {}
        pongTimer = setTimeout(() => {
          // No pong received within timeout — force reconnect
          if (connected) {
            connected = false;
            emitStatus({ connected: false, source: 'nexq', reason: 'pong_timeout' });
            try { ws.close(); } catch {}
          }
        }, PONG_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = 0;
    clearTimeout(pongTimer);
    pongTimer = 0;
  }

  function connect(){
    manualClose = false;
    clearTimeout(reconnectTimer);
    try{
      ws = new WebSocket(NEXQ_WS);
      ws.onopen = ()=>{
        retry = BASE_RETRY;
        attempts = 0;
        connected = true;
        emitStatus({ connected: true, source: 'nexq' });
        startHeartbeat();
      };
      ws.onclose = ()=>{
        stopHeartbeat();
        connected = false;
        if (manualClose) return;
        emitStatus({ connected: false, source: 'nexq' });

        attempts++;
        const delay = jitteredDelay(retry);
        emitStatus({
          connected: false,
          source: 'nexq',
          reconnectAttempt: attempts,
          nextRetryIn: delay
        });
        reconnectTimer = setTimeout(connect, delay);
        retry = Math.min(retry * RETRY_FACTOR, MAX_RETRY);
      };
      ws.onerror = ()=>{};
      ws.onmessage = event=>{
        try{
          const msg = JSON.parse(event.data);
          // Handle pong — clear the pong timeout
          if (msg?.type === 'pong') {
            clearTimeout(pongTimer);
            pongTimer = 0;
            return;
          }
          if (msg?.type === 'speaker_transcript') handle(msg.payload || {});
        }catch{}
      };
    }catch{
      connected = false;
      attempts++;
      const delay = jitteredDelay(retry);
      emitStatus({
        connected: false,
        source: 'nexq',
        reconnectAttempt: attempts,
        nextRetryIn: delay
      });
      reconnectTimer = setTimeout(connect, delay);
      retry = Math.min(retry * RETRY_FACTOR, MAX_RETRY);
    }
  }

  window.__3v0lNexQTranscript = {
    reconnect: () => {
      manualClose = true;
      stopHeartbeat();
      clearTimeout(reconnectTimer);
      try { ws?.close(); } catch {}
      attempts = 0;
      retry = BASE_RETRY;
      connect();
    },
    nexqWs: NEXQ_WS,
    relay: RELAY,
    getStatus: () => ({
      connected,
      source: 'nexq',
      attempts
    })
  };

  window.addEventListener('beforeunload', () => {
    manualClose = true;
    stopHeartbeat();
    clearTimeout(reconnectTimer);
    try { ws?.close(); } catch {}
  });

  connect();
})();
