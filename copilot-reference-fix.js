(()=>{
  const D=window.INTERVIEW_DATA||{};
  const view=()=>document.getElementById('view');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function findRef(id){
    const pools=[
      ['answer',D.answers||[]],
      ['story',D.stories||[]],
      ['scenario',D.scenarios||[]],
      ['phone',D.phoneCalls||[]],
      ['phrase',D.french||[]],
      ['curveball',D.curveballs||[]],
      ['english',D.english||[]]
    ];
    for(const [type,items] of pools){
      const x=items.find(item=>item.id===id);
      if(x)return {type,x};
    }
    return null;
  }

  function openReferenceFixed(){
    const b=document.getElementById('cpReference');
    const id=b?.dataset.ref;
    if(!id)return;
    const found=findRef(id);
    if(!found)return;

    // app-v3 already exposes its route navigator. Use Search because its
    // result buttons carry the canonical data-open="type:id" identifier.
    if(typeof window.__3v0lGo==='function') window.__3v0lGo('search');
    else document.querySelector('[data-action="search"]')?.click();

    const target=`${found.type}:${id}`;
    let attempts=0;
    const locate=()=>{
      const root=view();
      const input=document.getElementById('search');
      const result=root?.querySelector(`.result[data-open="${CSS.escape(target)}"]`);
      if(result){
        result.scrollIntoView({behavior:'smooth',block:'center'});
        result.click();
        return;
      }
      if(input){
        input.value=found.x.title||id;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
      if(++attempts<20) setTimeout(locate,50);
    };
    setTimeout(locate,50);
  }

  // Capture before copilot-ui's normal bubble handler so the broken
  // data-open-id path cannot run.
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element ? event.target.closest('#cpReference') : null;
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openReferenceFixed();
  },true);

  // Also make the provider badge correctly show Cerebras when the backend
  // returns provider="cerebras".
  const label=()=>{
    const el=document.getElementById('cpModel');
    const s=window.__3v0lLastState;
    if(el&&s?.provider){
      el.textContent=s.provider==='cerebras'?'CEREBRAS':s.provider==='requesty'?'REQUESTY':s.provider==='local'?'LOCAL':'NO AI';
    }
  };
  const observer=new MutationObserver(label);
  observer.observe(document.body,{childList:true,subtree:true});
  window.__3v0lReferenceFix={openReferenceFixed};
})();
