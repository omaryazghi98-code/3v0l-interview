(()=>{
  const root=document.documentElement;
  const sendKey=key=>document.dispatchEvent(new KeyboardEvent('keydown',{key,code:key===' '?'Space':`Key${String(key).toUpperCase()}`,bubbles:true,cancelable:true}));
  const theme=()=>{const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;localStorage.setItem('3v0l-theme',next);const b=document.querySelector('[data-action="theme"]');if(b)b.textContent=next==='dark'?'☼':'☾'};
  const font=delta=>{const current=parseInt(getComputedStyle(root).getPropertyValue('--reader'))||19;const next=Math.max(16,Math.min(30,current+delta));root.style.setProperty('--reader',next+'px');localStorage.setItem('3v0l-font',next)};
  document.querySelector('.brand')?.addEventListener('click',()=>sendKey('h'));
  document.querySelector('[data-route="search"]')?.addEventListener('click',e=>{if(!document.getElementById('view')?.contains(e.currentTarget))sendKey('s')});
  document.querySelector('[data-action="theme"]')?.addEventListener('click',theme);
  document.querySelectorAll('.top-actions [data-action="font-up"]').forEach(b=>b.addEventListener('click',()=>font(1)));
  document.querySelectorAll('.top-actions [data-action="font-down"]').forEach(b=>b.addEventListener('click',()=>font(-1)));

  let raf=0,last=0,lastScroll=0,watching=false;
  const tele=()=>document.getElementById('teleprompter');
  const stopReinforced=()=>{if(raf){cancelAnimationFrame(raf);raf=0}watching=false};
  const reinforced=ts=>{
    const t=tele();
    if(!watching||!t){stopReinforced();return}
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
    if(document.getElementById('teleprompter')){
      if(e.code==='Space'||e.key===' '){e.preventDefault();document.querySelector('[data-action="next-live"]')?.click();return}
      if(e.code==='KeyT'||e.key.toLowerCase()==='t'){
        e.preventDefault();document.querySelector('[data-action="toggle-auto"]')?.click();setTimeout(()=>{
          const b=document.querySelector('[data-action="toggle-auto"]');
          if(b&&/Stop|⏸/.test(b.textContent||''))startReinforced();else stopReinforced();
        },30);return
      }
    }
  },true);

  const mo=new MutationObserver(()=>{
    const b=document.querySelector('[data-action="toggle-auto"]');
    if(b&&/Stop|⏸/.test(b.textContent||'')){
      if(!watching)startReinforced();
    }else if(watching){stopReinforced()}
  });
  mo.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
})();