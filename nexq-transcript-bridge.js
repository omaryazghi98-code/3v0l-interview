(()=>{
  // NexQ publishes only the system/interviewer STT stream as speaker_transcript.
  // Acer's EV0L page receives that text directly; when a copilot relay is
  // reachable it also forwards the same interviewer text for reasoning.
  const NEXQ_WS = localStorage.getItem('nexq-ws') || 'ws://192.168.11.113:17321/ws?v=4';
  const RELAY = localStorage.getItem('3v0l-relay') || 'http://192.168.11.113:38471';
  let ws = null;
  let retry = 1000;

  function showInEV0L(payload){
    const text = String(payload?.text || '').trim();
    if(!text) return;

    // The live copilot rail is present after copilot-ui.js initializes.
    const target = document.getElementById('cpTranscript');
    if(target) target.textContent = text;

    // Keep the latest interviewer text available to other EV0L components.
    window.__3v0lLastInterviewerTranscript = text;

    // Feed the same interviewer text into the existing EV0L copilot pipeline
    // when its relay is available. This is best-effort and never blocks the UI.
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

  function connect(){
    try{
      ws = new WebSocket(NEXQ_WS);
      ws.onopen = ()=>{
        retry = 1000;
        window.dispatchEvent(new CustomEvent('nexq-transcript-status',{detail:{connected:true}}));
      };
      ws.onclose = ()=>{
        window.dispatchEvent(new CustomEvent('nexq-transcript-status',{detail:{connected:false}}));
        setTimeout(connect,retry);
        retry=Math.min(retry*1.7,10000);
      };
      ws.onerror = ()=>{};
      ws.onmessage = event=>{
        try{
          const msg=JSON.parse(event.data);
          if(msg?.type==='speaker_transcript') handle(msg.payload||{});
        }catch{}
      };
    }catch{
      setTimeout(connect,retry);
      retry=Math.min(retry*1.7,10000);
    }
  }

  window.__3v0lNexQTranscript={
    reconnect:()=>{try{ws?.close()}catch{}},
    nexqWs:NEXQ_WS,
    relay:RELAY
  };
  connect();
})();
