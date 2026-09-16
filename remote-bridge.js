(()=>{
  const API=localStorage.getItem('3v0l-relay')||'http://127.0.0.1:38471';
  let last=Number(localStorage.getItem('3v0l-remote-cursor')||0);
  const BASE_INTERVAL=250;
  const MAX_INTERVAL=10000;
  const RETRY_FACTOR=1.7;
  const JITTER=0.2;

  let interval=BASE_INTERVAL;
  let offline=false;
  let pollTimer=0;

  const click=s=>document.querySelector(s)?.click();
  const key=(code,keyValue=code)=>document.dispatchEvent(new KeyboardEvent('keydown',{code,key:keyValue,bubbles:true,cancelable:true}));
  const jump=route=>{
    if(route==='index'){
      if(typeof window.__3v0lHome==='function'){window.__3v0lHome();return;}
      const home=document.querySelector('[data-action="home"]');
      if(home){home.click();return;}
    }
    if(typeof window.__3v0lGo==='function'){window.__3v0lGo(route);return;}
    const picker=document.getElementById('globalJump');
    if(picker){
      picker.value=route;
      picker.dispatchEvent(new Event('change',{bubbles:true}));
      return;
    }
  };
  const run=cmd=>{
    let a=String(cmd.action||'');
    let value=cmd.value;
    if(a.startsWith('jump:')){value=a.slice(5);a='jump';}
    if(a==='next-live'){
      const b=document.querySelector('[data-action="next-live"]');
      if(b)b.click(); else key('Space',' ');
      return;
    }
    if(a==='prev-live'){
      const b=document.querySelector('[data-action="prev-live"]');
      if(b)b.click(); else key('ArrowLeft','ArrowLeft');
      return;
    }
    if(a==='next-call')return click('[data-action="next-call"]')||key('ArrowRight','ArrowRight');
    if(a==='prev-call')return click('[data-action="prev-call"]')||key('ArrowLeft','ArrowLeft');
    if(a==='call-next-step')return key('Enter','Enter');
    if(a==='scroll-down')return document.querySelector('#teleprompter,.call-steps')?.scrollBy(0,220);
    if(a==='scroll-up')return document.querySelector('#teleprompter,.call-steps')?.scrollBy(0,-220);
    if(a==='toggle-auto')return click('[data-action="toggle-auto"]');
    if(a==='font-up')return click('[data-action="font-up"]');
    if(a==='font-down')return click('[data-action="font-down"]');
    if(a==='theme')return click('[data-action="theme"]');
    if(a==='panic')return jump('panic');
    if(a==='jump'&&value)return jump(String(value));
    if(a==='search')return click('[data-action="search"]');
    if(a==='toggle-copilot')return document.querySelector('[data-cp="toggle"]')?.click();
    if(a==='clear')return document.querySelector('[data-cp="clear"]')?.click();
    if(a==='ping')return;
  };

  function jitteredInterval(base) {
    const jitter = base * JITTER * (Math.random() * 2 - 1);
    return Math.min(Math.round(base + jitter), MAX_INTERVAL);
  }

  function emitStatus(detail) {
    window.dispatchEvent(new CustomEvent('nexq-remote-status', { detail }));
  }

  function schedulePoll() {
    clearTimeout(pollTimer);
    const delay = offline ? jitteredInterval(interval) : BASE_INTERVAL;
    pollTimer = setTimeout(poll, delay);
  }

  async function poll(){
    try{
      const r=await fetch(`${API}/remote/commands?after=${last}`,{cache:'no-store'});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data=await r.json();
      for(const cmd of data.commands||[]){last=Math.max(last,Number(cmd.id)||0);run(cmd)}
      localStorage.setItem('3v0l-remote-cursor',String(last));

      // Reset backoff on successful poll
      if (offline) {
        offline = false;
        interval = BASE_INTERVAL;
        emitStatus({ connected: true, api: API });
      }
    }catch(err){
      if (!offline) {
        offline = true;
        emitStatus({ connected: false, api: API, error: String(err.message || err) });
      }
      interval = Math.min(Math.round(interval * RETRY_FACTOR), MAX_INTERVAL);
      emitStatus({ connected: false, api: API, nextRetryIn: jitteredInterval(interval) });
    }
    schedulePoll();
  }

  window.__3v0lRemote={
    api:API,
    resetCursor:()=>{last=0;localStorage.setItem('3v0l-remote-cursor','0')},
    getStatus:()=>({ connected: !offline, api: API, interval })
  };

  window.addEventListener('beforeunload',()=>{clearTimeout(pollTimer)});

  poll();
})();
