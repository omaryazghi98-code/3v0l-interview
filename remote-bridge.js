(()=>{
  const API=localStorage.getItem('3v0l-relay')||'http://127.0.0.1:38471';
  let last=Number(localStorage.getItem('3v0l-remote-cursor')||0);
  const click=s=>document.querySelector(s)?.click();
  const key=(code,keyValue=code)=>document.dispatchEvent(new KeyboardEvent('keydown',{code,key:keyValue,bubbles:true,cancelable:true}));
  let autoRaf=0;
  const scrollTarget=()=>{
    const tele=document.querySelector('#teleprompter');
    if(tele && tele.scrollHeight>tele.clientHeight+2)return tele;
    const calls=document.querySelector('.call-steps');
    if(calls && calls.scrollHeight>calls.clientHeight+2)return calls;
    const view=document.querySelector('.view');
    if(view && view.scrollHeight>view.clientHeight+2)return view;
    return null;
  };
  const stopRemoteAuto=()=>{
    if(autoRaf){cancelAnimationFrame(autoRaf);autoRaf=0;}
  };
  const startRemoteAuto=()=>{
    stopRemoteAuto();
    let lastTime=performance.now();
    const loop=now=>{
      const t=scrollTarget();
      if(!t){autoRaf=0;return;}
      const dt=Math.min(80,now-lastTime);lastTime=now;
      const speed=Number(document.querySelector('#speed')?.value||16)*3;
      t.scrollTop+=(speed*dt)/1000;
      if(t.scrollTop+t.clientHeight>=t.scrollHeight-2){autoRaf=0;return;}
      autoRaf=requestAnimationFrame(loop);
    };
    autoRaf=requestAnimationFrame(loop);
  };
  const jump=route=>{
    if(route==='index'){
      if(typeof window.__3v0lHome==='function'){window.__3v0lHome();return;}
      const home=document.querySelector('[data-action="home"]');
      if(home){home.click();return;}
    }
    if(typeof window.__3v0lGo==='function'){window.__3v0lGo(route);return;}
    const picker=document.getElementById('globalJump');
    if(picker){picker.value=route;picker.dispatchEvent(new Event('change',{bubbles:true}));}
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
    if(a==='scroll-down'){const t=scrollTarget();if(t)t.scrollBy({top:220,behavior:'smooth'});return;}
    if(a==='scroll-up'){const t=scrollTarget();if(t)t.scrollBy({top:-220,behavior:'smooth'});return;}
    if(a==='toggle-auto'){
      if(autoRaf)stopRemoteAuto();else startRemoteAuto();
      return;
    }
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
  async function poll(){
    try{
      const r=await fetch(`${API}/remote/commands?after=${last}`,{cache:'no-store'});
      if(!r.ok)return;
      const data=await r.json();
      for(const cmd of data.commands||[]){last=Math.max(last,Number(cmd.id)||0);run(cmd)}
      localStorage.setItem('3v0l-remote-cursor',String(last));
    }catch{}
  }
  setInterval(poll,250);poll();
  window.__3v0lRemote={api:API,resetCursor:()=>{last=0;localStorage.setItem('3v0l-remote-cursor','0')}};
  window.addEventListener('beforeunload',stopRemoteAuto);
})();
