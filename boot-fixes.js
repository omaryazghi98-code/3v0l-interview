(()=>{
  const root=document.documentElement;
  const sendKey=(key,code)=>document.dispatchEvent(new KeyboardEvent('keydown',{key,code:code||key,bubbles:true,cancelable:true}));
  const applyTheme=()=>{
    const saved=localStorage.getItem('3v0l-theme')||'dark';
    root.dataset.theme=saved;
    const b=document.querySelector('[data-action="theme"]');
    if(b)b.textContent=saved==='dark'?'☼':'☾';
  };
  const theme=()=>{
    const next=(root.dataset.theme||localStorage.getItem('3v0l-theme')||'dark')==='light'?'dark':'light';
    localStorage.setItem('3v0l-theme',next);
    root.dataset.theme=next;
    const b=document.querySelector('[data-action="theme"]');
    if(b)b.textContent=next==='dark'?'☼':'☾';
  };
  const font=delta=>{
    const current=parseInt(getComputedStyle(root).getPropertyValue('--reader'))||19;
    const next=Math.max(16,Math.min(30,current+delta));
    root.style.setProperty('--reader',next+'px');
    localStorage.setItem('3v0l-font',next);
  };

  applyTheme();
  document.querySelector('.brand')?.addEventListener('click',()=>sendKey('h','KeyH'));
  document.querySelector('[data-action="theme"]')?.addEventListener('click',theme,{capture:true});
  document.querySelectorAll('.top-actions [data-action="font-up"]').forEach(b=>b.addEventListener('click',()=>font(1)));
  document.querySelectorAll('.top-actions [data-action="font-down"]').forEach(b=>b.addEventListener('click',()=>font(-1)));

  let raf=0,last=0,watching=false;
  const autoTarget=()=>document.getElementById('teleprompter')||document.querySelector('.call-steps');
  const stopReinforced=()=>{if(raf){cancelAnimationFrame(raf);raf=0}watching=false;last=0};
  const reinforced=ts=>{
    const t=autoTarget();
    if(!watching||!t){stopReinforced();return;}
    if(!last)last=ts;
    const dt=Math.min(80,ts-last);last=ts;
    t.scrollTop += dt*0.035;
    if(t.scrollTop+t.clientHeight>=t.scrollHeight-2){stopReinforced();return}
    raf=requestAnimationFrame(reinforced);
  };
  const startReinforced=()=>{stopReinforced();watching=true;last=0;raf=requestAnimationFrame(reinforced)};

  document.addEventListener('keydown',e=>{
    const typing=['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
    if(typing)return;
    const target=autoTarget();
    if((e.code==='Space'||e.key===' ')&&document.getElementById('teleprompter')){e.preventDefault();document.querySelector('[data-action="next-live"]')?.click();return}
    if((e.code==='KeyT'||e.key.toLowerCase()==='t')&&target){
      e.preventDefault();
      const b=document.querySelector('[data-action="toggle-auto"]');
      if(b)b.click();
      setTimeout(()=>{
        const active=document.querySelector('[data-action="toggle-auto"]');
        if(active&&/Stop|⏸/.test(active.textContent||''))startReinforced();else stopReinforced();
      },30);
    }
  },true);

  const mo=new MutationObserver(()=>{
    applyTheme();
    const b=document.querySelector('[data-action="toggle-auto"]');
    if(b&&/Stop|⏸/.test(b.textContent||'')){
      if(!watching)startReinforced();
    }else if(watching){stopReinforced()}
  });
  mo.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
})();