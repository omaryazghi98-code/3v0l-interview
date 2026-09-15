(()=>{
  const API='http://127.0.0.1:38471';
  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const isTelephoneSimulation=text=>{
    const t=normalize(text);
    return (t.includes('simulation') && (t.includes('telephonique') || t.includes('telephone') || t.includes('appel'))) ||
      t.includes('mise en situation telephonique') || t.includes('simulation d\'appel');
  };

  function ensureSlot(){
    if(document.getElementById('cpLiveCallSuggestion')) return document.getElementById('cpLiveCallSuggestion');
    const ref=document.getElementById('cpReference');
    if(!ref?.closest('.cp-section')) return null;
    const section=document.createElement('section');
    section.className='cp-section cp-live-call-suggestion';
    section.innerHTML=`<div class="cp-label">SUGGESTED MODE</div><button id="cpLiveCallSuggestion" type="button" style="width:100%;text-align:left;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:rgba(183,255,68,.08);color:var(--text);font:inherit;cursor:pointer"><strong>☎ Ouvrir le Live Call Lab</strong><span style="display:block;font-size:11px;color:var(--muted);margin-top:4px">Simulation téléphonique détectée · passer directement au Phone Call Lab.</span></button>`;
    ref.closest('.cp-section').after(section);
    section.querySelector('button')?.addEventListener('click',()=>{
      if(typeof window.__3v0lGo==='function') window.__3v0lGo('calls');
      else document.querySelector('[data-route="calls"]')?.click();
    });
    return section.querySelector('button');
  }

  async function sync(){
    try{
      const r=await fetch(API+'/state',{cache:'no-store'});
      if(!r.ok) return;
      const s=await r.json();
      const host=ensureSlot();
      if(host) host.closest('.cp-live-call-suggestion').style.display=isTelephoneSimulation(s.transcript)?'block':'none';
      const model=document.getElementById('cpModel');
      if(model){
        model.textContent=s.provider==='cerebras'?'CEREBRAS':s.provider==='requesty'?'REQUESTY':s.provider==='local'?'LOCAL':'NO AI';
      }
    }catch{}
  }

  setInterval(sync,500);
  sync();
})();
