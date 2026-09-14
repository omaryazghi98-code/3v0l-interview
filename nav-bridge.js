(()=>{
  const view=document.getElementById('view');
  if(!view)return;

  const navigate=route=>{
    const proxy=document.createElement('button');
    proxy.type='button';
    proxy.dataset.route=route;
    proxy.style.display='none';
    view.appendChild(proxy);
    proxy.click();
    proxy.remove();
  };

  // Delegated listener so the picker keeps working after app-v3 rerenders the topbar.
  document.addEventListener('change',event=>{
    const target=event.target;
    if(!(target instanceof HTMLSelectElement) || target.id!=='globalJump')return;
    navigate(target.value);
  });

  const observer=new MutationObserver(()=>{
    const picker=document.getElementById('globalJump');
    if(!picker)return;
    const route=typeof window.__3v0lCurrentRoute==='string'?window.__3v0lCurrentRoute:'index';
    [...picker.options].forEach(o=>o.selected=o.value===route);
  });
  observer.observe(view,{childList:true,subtree:true});
})();