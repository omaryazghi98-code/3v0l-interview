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
})();
