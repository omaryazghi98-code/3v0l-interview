(()=>{
  if(typeof window.HTMLInput==='undefined'&&typeof window.HTMLInputElement!=='undefined')window.HTMLInput=window.HTMLInputElement;
  const D=window.INTERVIEW_DATA||{};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const routes={
    french:{icon:'🇫🇷',title:'FRENCH ANSWERS',items:(D.answers||[]).filter(x=>x.cat==='french').map(x=>({...x,type:'answer'}))},
    gaming:{icon:'🎮',title:'GAMING',items:[...(D.answers||[]).filter(x=>/gaming|epic|vbucks|fortnite|player/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'answer'})),...(D.stories||[]).filter(x=>/epic|gaming|vbucks|fortnite|player/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'story'})),...(D.scenarios||[]).filter(x=>/gaming|epic|vbucks|fortnite|player/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'scenario'}))]},
    taptap:{icon:'💸',title:'TAPTAP SEND',items:[...(D.answers||[]).filter(x=>x.cat==='taptap'||/taptap/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'answer'})),...(D.stories||[]).filter(x=>/taptap|transfer|money/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'story'})),...(D.scenarios||[]).filter(x=>/taptap|transfer|money/i.test(`${x.title} ${(x.tags||[]).join(' ')}`)).map(x=>({...x,type:'scenario'}))]},
    stories:{icon:'🧠',title:'REAL STORIES',items:(D.stories||[]).map(x=>({...x,type:'story'}))},
    questions:{icon:'🎯',title:'CURVEBALLS',items:(D.curveballs||[]).map(x=>({...x,type:'curveball'}))},
    'french-phrases':{icon:'💬',title:'FRENCH PHRASES',items:(D.french||[]).map(x=>({...x,type:'phrase'}))},
    english:{icon:'🇬🇧',title:'ENGLISH BACKUP',items:(D.english||[]).map(x=>({...x,type:'english'}))}
  };
  window.category=(id,icon,title)=>{
    const cfg=routes[id]||{icon,title,items:[]};
    const items=cfg.items||[];
    return `<section class="page collection-page"><div class="back-row"><button class="back-index" data-action="home">← Index</button><div class="eyebrow">${esc(cfg.icon||icon||'')} ${esc(cfg.title||title||'REFERENCE')}</div></div><div class="page-title"><div><div class="eyebrow">REFERENCE BANK</div><h1>${esc(cfg.title||title||id)}</h1><p>Reference material for quick interview recall.</p></div><span class="count-badge">${items.length} entries</span></div><div class="results-list collection">${items.map((x,i)=>`<article class="result-card category-entry"><span class="result-index">${String(i+1).padStart(2,'0')}</span><span class="result-main"><b>${esc(x.title||'Untitled')}</b><small>${esc(x.company||'')} ${(x.tags||[]).slice(0,6).map(t=>' · '+t).join('')}</small><p>${esc(x.text||((x.phrases||[]).join(' · ')))}</p></span></article>`).join('')||'<div class="empty">No entries loaded.</div>'}</div></section>`;
  };
  const callState={index:0,step:0};
  const phoneCalls=()=>D.phoneCalls||[];
  function callMarkup(){
    const all=phoneCalls();
    if(!all.length)return `<section class="page collection-page"><div class="back-row"><button class="back-index" data-action="home">← Index</button><div class="eyebrow">☎ FRENCH CALL LAB</div></div><div class="empty">No call scenarios loaded.</div></section>`;
    callState.index=Math.max(0,Math.min(callState.index,all.length-1));
    const c=all[callState.index];
    const steps=c.steps||[];
    callState.step=Math.max(0,Math.min(callState.step,Math.max(0,steps.length-1)));
    return `<section class="page call-page"><div class="back-row"><button class="back-index" data-action="home">← Index</button><div class="eyebrow">☎ FRENCH CALL LAB · ${all.length} SCENARIOS</div></div><div class="call-layout"><aside class="call-list"><div class="call-list-head"><b>SCENARIOS</b><span>${callState.index+1}/${all.length}</span></div>${all.map((x,i)=>`<button class="call-btn ${i===callState.index?'active':''}" data-runtime-call="${i}"><b>${String(i+1).padStart(2,'0')} · ${esc(x.title)}</b><small>${esc(x.company||'')} · ${esc(x.difficulty||'')}</small></button>`).join('')}</aside><main class="call-main"><div class="call-main-head"><div><div class="eyebrow">${esc(c.company||'')}</div><h1>${esc(c.title)}</h1><p>Customer roleplay. Use Enter or Space to advance without jumping to page top.</p></div><div class="call-nav-actions"><button data-action="prev-call">←</button><button data-action="next-call">→</button><button class="mini-btn" data-action="toggle-auto">▶ Auto-scroll</button></div></div><div class="call-progress"><span style="width:${steps.length?(((callState.step+1)/steps.length)*100):0}%"></span></div><div class="call-steps">${steps.map((s,i)=>`<button class="call-step ${esc(s.kind||'')} ${i===callState.step?'selected':''}" data-runtime-step="${i}"><span class="step-label">${esc(s.label)}</span><span class="step-text">${esc(s.text)}</span></button>`).join('')}</div><div class="call-footer"><b>OPEN → ACKNOWLEDGE → PROBE → VERIFY → RESOLVE / ESCALATE → CONFIRM → CLOSE</b><span>← → scenario · Enter / Space step · T auto-scroll · Home index</span></div></main></div></section>`;
  }
  window.calls=()=>callMarkup();
  function rerenderCalls(){
    const view=document.getElementById('view');
    if(!view)return;
    const old=document.querySelector('.call-steps')?.scrollTop||0;
    view.innerHTML=callMarkup();
    requestAnimationFrame(()=>{const box=document.querySelector('.call-steps');if(box)box.scrollTop=old;});
  }
  function onCallAction(type,n){
    const all=phoneCalls();if(!all.length)return;
    if(type==='call')callState.index=Math.max(0,Math.min(all.length-1,n));
    if(type==='step'){const steps=(all[callState.index]?.steps)||[];callState.step=Math.max(0,Math.min(Math.max(0,steps.length-1),n));}
    if(type==='next-call')callState.index=(callState.index+1)%all.length;
    if(type==='prev-call')callState.index=(callState.index-1+all.length)%all.length;
    if(type==='next-step'){const steps=(all[callState.index]?.steps)||[];if(steps.length)callState.step=(callState.step+1)%steps.length;}
    if(type==='prev-step'){const steps=(all[callState.index]?.steps)||[];if(steps.length)callState.step=(callState.step-1+steps.length)%steps.length;}
    rerenderCalls();
  }
  document.addEventListener('click',e=>{
    const target=e.target.closest?.('[data-runtime-call]');
    if(target){e.preventDefault();e.stopPropagation();onCallAction('call',Number(target.dataset.runtimeCall)||0);return;}
    const step=e.target.closest?.('[data-runtime-step]');
    if(step){e.preventDefault();e.stopPropagation();onCallAction('step',Number(step.dataset.runtimeStep)||0);return;}
    const action=e.target.closest?.('[data-action]')?.dataset.action;
    if(action==='next-call'){e.preventDefault();e.stopPropagation();onCallAction('next-call');return;}
    if(action==='prev-call'){e.preventDefault();e.stopPropagation();onCallAction('prev-call');return;}
    if(action==='call-next-step'){e.preventDefault();e.stopPropagation();onCallAction('next-step');return;}
  },true);
  document.addEventListener('keydown',e=>{
    const box=document.querySelector('.call-steps');
    if(!box)return;
    if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();onCallAction('next-step');}
    else if(e.key==='ArrowRight'){e.preventDefault();onCallAction('next-call');}
    else if(e.key==='ArrowLeft'){e.preventDefault();onCallAction('prev-call');}
  },true);
})();
