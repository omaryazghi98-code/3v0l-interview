(()=>{
  const API=localStorage.getItem('3v0l-relay')||'http://127.0.0.1:38471';
  let last=Number(localStorage.getItem('3v0l-remote-cursor')||0);
  const click=s=>document.querySelector(s)?.click();
  const key=(code,keyValue=code)=>document.dispatchEvent(new KeyboardEvent('keydown',{code,key:keyValue,bubbles:true,cancelable:true}));
  const jump=route=>{
    const picker=document.getElementById('globalJump');
    if(picker){
      picker.value=route;
      picker.dispatchEvent(new Event('change',{bubbles:true}));
      return;
    }
    if(route==='index'){
      const home=document.querySelector('[data-action="home"],[data-route="index"]');
      if(home){home.click();return;}
    }
    const b=document.createElement('button');
    b.type='button';b.dataset.route=route;b.hidden=true;
    document.getElementById('view')?.appendChild(b);b.click();b.remove();
  };
  const run=cmd=>{
    let a=String(cmd.action||'');
    let value=cmd.value??null;
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
  async function poll(){
    try{
      const r=await fetch(`${API}/remote/commands?after=${last}`,{cache:'no-store'});if(!r.ok)return;
      const data=await r.json();
      for(const cmd of data.commands||[]){last=Math.max(last,Number(cmd.id)||0);run(cmd)}
      localStorage.setItem('3v0l-remote-cursor',String(last));
    }catch{}
  }
  setInterval(poll,250);poll();
  window.__3v0lRemote={api:API,resetCursor:()=>{last=0;localStorage.setItem('3v0l-remote-cursor','0')}};
})();