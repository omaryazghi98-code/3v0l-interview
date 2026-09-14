(()=>{
  const root=document.documentElement;
  const sendKey=key=>document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
  const theme=()=>{const next=root.dataset.theme==='light'?'dark':'light';root.dataset.theme=next;localStorage.setItem('3v0l-theme',next);const b=document.querySelector('[data-action="theme"]');if(b)b.textContent=next==='dark'?'☼':'☾'};
  const font=delta=>{const current=parseInt(getComputedStyle(root).getPropertyValue('--reader'))||19;const next=Math.max(16,Math.min(30,current+delta));root.style.setProperty('--reader',next+'px');localStorage.setItem('3v0l-font',next)};
  document.querySelector('.brand')?.addEventListener('click',()=>sendKey('h'));
  document.querySelector('[data-route="search"]')?.addEventListener('click',e=>{if(!document.getElementById('view')?.contains(e.currentTarget))sendKey('s')});
  document.querySelector('[data-action="theme"]')?.addEventListener('click',theme);
  document.querySelectorAll('.top-actions [data-action="font-up"]').forEach(b=>b.addEventListener('click',()=>font(1)));
  document.querySelectorAll('.top-actions [data-action="font-down"]').forEach(b=>b.addEventListener('click',()=>font(-1)));
  document.querySelector('.panic-btn')?.addEventListener('click',()=>sendKey('F12'));
})();