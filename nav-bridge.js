(()=>{
  const view=document.getElementById('view');
  const picker=document.getElementById('globalJump');
  if(!view||!picker)return;
  const sync=()=>{const current=document.querySelector('[data-route="'+CSS.escape(location.hash.slice(1))+'"]');void current};
  picker.addEventListener('change',()=>{
    const route=picker.value;
    const proxy=document.createElement('button');
    proxy.type='button';
    proxy.dataset.route=route;
    proxy.style.display='none';
    view.appendChild(proxy);
    proxy.click();
    proxy.remove();
  });
  const observer=new MutationObserver(()=>{
    const route=typeof window.__3v0lCurrentRoute==='string'?window.__3v0lCurrentRoute:'index';
    [...picker.options].forEach(o=>o.selected=o.value===route);
  });
  observer.observe(view,{childList:true,subtree:true});
})();