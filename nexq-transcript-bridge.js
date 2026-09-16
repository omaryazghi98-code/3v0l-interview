(()=>{
  // NexQ publishes only the system/interviewer STT stream as speaker_transcript.
  // 3V0L forwards that text to its existing copilot relay for reasoning.
  const NEXQ_WS = localStorage.getItem('nexq-ws') || 'ws://192.168.11.113:17321/ws?v=4';
  const RELAY = localStorage.getItem('3v0l-relay') || 'http://192.168.11.113:38471';
  let ws = null;
  let retry = 1000;

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

  function connect(){
    try{
      ws = new WebSocket(NEXQ_WS);
      ws.onopen = ()=>{ retry = 1000; window.dispatchEvent(new CustomEvent('nexq-transcript-status',{detail:{connected:true}})); };
      ws.onclose = ()=>{ window.dispatchEvent(new CustomEvent('nexq-transcript-status',{detail:{connected:false}})); setTimeout(connect,retry); retry=Math.min(retry*1.7,10000); };
      ws.onerror = ()=>{};
      ws.onmessage = event=>{
        try{
          const msg=JSON.parse(event.data);
          if(msg?.type==='speaker_transcript') void forward(msg.payload||{});
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
