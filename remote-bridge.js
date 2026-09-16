(()=>{
  const API=localStorage.getItem('3v0l-relay')||'http://127.0.0.1:38471';
  let last=Number(localStorage.getItem('3v0l-remote-cursor')||0);
  const click=s=>{
    const el=document.querySelector(s);
    if(!el)return false;
    el.click();
    return true;
  };
  const key=(code,keyValue=code)=>document.dispatchEvent(new KeyboardEvent('keydown',{code,key:keyValue,bubbles:true,cancelable:true}));
  let autoRaf=0;
  let autoActive=false;

  const isScrollable=el=>{
    if(!el)return false;
    const cs=getComputedStyle(el);
    return (el.scrollHeight>el.clientHeight+2) && /(auto|scroll)/.test(cs.overflowY);
  };

  const scrollTarget=()=>{
    const tele=document.querySelector('#teleprompter');
    if(isScrollable(tele))return tele;
    const calls=document.querySelector('.call-steps');
    if(isScrollable(calls))return calls;
    const view=document.querySelector('.view');
    if(isScrollable(view))return view;
    return null;
  };

  const scrollContainerFor=el=>{
    let node=el?.parentElement;
    while(node){
      if(isScrollable(node))return node;
      node=node.parentElement;
    }
    return scrollTarget();
  };

  const keepSelectedCallInView=()=>{
    const selected=document.querySelector('.call-step.selected');
    if(!selected)return;
    const container=scrollContainerFor(selected);
    if(!container)return;
    const s=selected.getBoundingClientRect();
    const c=container.getBoundingClientRect();
    const margin=32;
    let delta=0;
    if(s.top<c.top+margin)delta=s.top-(c.top+margin);
    else if(s.bottom>c.bottom-margin)delta=s.bottom-(c.bottom-margin);
    if(delta!==0)container.scrollBy({top:delta,behavior:'smooth'});
  };

  const afterCallNavigation=()=>{
    requestAnimationFrame(()=>requestAnimationFrame(keepSelectedCallInView));
  };

  const stopRemoteAuto=()=>{
    autoActive=false;
    if(autoRaf){cancelAnimationFrame(autoRaf);autoRaf=0;}
  };

  const startRemoteAuto=()=>{
    stopRemoteAuto();
    autoActive=true;
    let lastTime=performance.now();
    const loop=now=>{
      if(!autoActive){autoRaf=0;return;}
      const t=scrollTarget();
      if(!t){autoRaf=0;return;}
      const dt=Math.min(80,now-lastTime);
      lastTime=now;
      const speed=Number(document.querySelector('#speed')?.value||16)*3;
      t.scrollTop+=(speed*dt)/1000;
      if(t.scrollTop+t.clientHeight>=t.scrollHeight-2){autoActive=false;autoRaf=0;return;}
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
      if(click('[data-action="next-live"]'))return;
      key('Space',' ');return;
    }
    if(a==='prev-live'){
      if(click('[data-action="prev-live"]'))return;
      key('ArrowLeft','ArrowLeft');return;
    }
    if(a==='next-call'){
      if(click('[data-action="next-call"]'))afterCallNavigation();return;
    }
    if(a==='prev-call'){
      if(click('[data-action="prev-call"]'))afterCallNavigation();return;
    }
    if(a==='call-next-step'){
      if(click('[data-action="call-next-step"]'))afterCallNavigation();return;
    }
    if(a==='best-reference'){
      if(click('#cpReference'))return;
      return;
    }
    if(a==='scroll-down'){
      const t=scrollTarget();
      if(t)t.scrollBy({top:220,behavior:'smooth'});return;
    }
    if(a==='scroll-up'){
      const t=scrollTarget();
      if(t)t.scrollBy({top:-220,behavior:'smooth'});return;
    }
    if(a==='toggle-auto'){
      if(autoActive)stopRemoteAuto();else startRemoteAuto();return;
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
      for(const cmd of data.commands||[]){
        last=Math.max(last,Number(cmd.id)||0);
        run(cmd);
      }
      localStorage.setItem('3v0l-remote-cursor',String(last));
    }catch{}
  }

  setInterval(poll,250);
  poll();
  window.__3v0lRemote={
    api:API,
    resetCursor:()=>{last=0;localStorage.setItem('3v0l-remote-cursor','0');}
  };
  window.addEventListener('beforeunload',stopRemoteAuto);
})();
