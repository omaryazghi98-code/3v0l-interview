(() => {
  const D = window.INTERVIEW_DATA;
  const view = document.getElementById('view');
  let route = 'index';
  let history = [];
  let fontSize = Number(localStorage.getItem('3v0l-font') || 18);
  let activeItems = [];
  let activeIndex = 0;
  let searchInput = null;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allItems = () => [
    ...D.answers.map(x => ({...x, type:'answer'})),
    ...D.stories.map(x => ({...x, type:'story'})),
    ...D.french.flatMap(x => [{...x, type:'french'}]),
    ...D.scenarios.map(x => ({...x, type:'scenario'})),
    ...D.curveballs.map(x => ({...x, type:'curveball'})),
    ...D.english.map(x => ({...x, type:'english'}))
  ];

  function setFont(n){ fontSize=Math.max(15,Math.min(28,n)); localStorage.setItem('3v0l-font',fontSize); document.documentElement.style.setProperty('--font',fontSize+'px'); }
  setFont(fontSize);

  function back(){ if(history.length){ route=history.pop(); render(); } else { route='index'; render(); } }
  function go(next, remember=true){ if(remember && route!==next) history.push(route); route=next; render(); }
  function card(c,i){ return `<button class="nav-card ${i===0?'wide':''}" data-route="${c.id}"><div class="num">${String(i+1).padStart(2,'0')}</div><div class="icon">${c.icon}</div><h2>${esc(c.title)}</h2><p>${esc(c.desc)}</p></button>`; }

  function renderIndex(){
    return `<section class="index">
      <div class="hero"><div><div class="eyebrow">LIVE INTERVIEW SYSTEM · V1</div><h1>Know where to look.<br>Before you need it.</h1><p>French-first, keyboard-driven, teleprompter-style interview reference. Built to stay out of your way when the interview starts.</p></div><button class="live-launch" data-route="live">ENTER LIVE MODE →</button></div>
      <div class="grid">${D.categories.map(card).join('')}</div>
      <div class="tiny-grid"><button class="nav-card" data-route="search"><div class="icon">⌕</div><h2>Smart Search</h2><p>Type two or three words. Search tags, synonyms, titles and content.</p></button><button class="nav-card" data-route="call"><div class="icon">☎</div><h2>French Call Mode</h2><p>A fast phrase bank for opening, empathy, verification, escalation and closing.</p></button></div>
    </section>`;
  }

  function renderCollection(kind, title, subtitle, items){
    activeItems = items;
    activeIndex = 0;
    return `<section class="tele"><button class="back" data-action="back">← Back to Index</button>
      <div class="tele-head"><div><div class="eyebrow">${esc(kind.toUpperCase())}</div><h1>${esc(title)}</h1></div><div class="meta">${items.length} entries · scroll or use ↑ ↓</div></div>
      <div class="answer-list">${items.map((x,i)=>`<article class="answer ${i===0?'active':''}" data-answer-index="${i}"><h3>${esc(x.title)}</h3><p>${esc(x.text || (x.phrases||[]).join('\n\n'))}</p></article>`).join('')}</div></section>`;
  }

  function renderLive(){
    const items=[...D.answers.filter(x=>x.cat==='french'), ...D.stories.slice(0,2), ...D.scenarios.slice(0,3), ...D.curveballs];
    activeItems=items; activeIndex=0;
    const x=items[0];
    return `<section class="tele"><button class="back" data-action="back">← Back to Index</button>
      <div class="tele-head"><div><div class="eyebrow">🇫🇷 LIVE INTERVIEW</div><h1>French-first teleprompter</h1></div><div class="meta">↑ ↓ scroll · Space next · S search · H home · Esc back</div></div>
      <article class="answer active" data-answer-index="0"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>
      <div class="tiny-grid" style="margin-top:14px"><button class="nav-card" data-route="call"><div class="icon">☎</div><h2>French Call Mode</h2><p>Jump to ready-made phrases without leaving Live Mode.</p></button><button class="nav-card" data-route="search"><div class="icon">⌕</div><h2>Question Search</h2><p>Describe the question with a few words and get ranked matches.</p></button></div>
    </section>`;
  }

  function score(q,item){
    q=q.toLowerCase().trim(); if(!q)return 0;
    const hay=[item.title,...(item.tags||[]),item.text||'',...(item.phrases||[])].join(' ').toLowerCase();
    const tokens=q.split(/\s+/).filter(Boolean); let s=0;
    for(const t of tokens){
      if(item.title.toLowerCase().includes(t)) s+=14;
      if((item.tags||[]).some(tag=>tag.toLowerCase().includes(t)||t.includes(tag.toLowerCase()))) s+=18;
      if(hay.includes(t)) s+=6;
    }
    const aliases={angry:['frustrated','mad','upset','furious'],trans:['transperfect','company','why'],money:['payment','transfer','taptap','refund'],phone:['call','appels','telephone'],account:['compte','profile','login']};
    for(const [k,vals] of Object.entries(aliases)) if(tokens.some(t=>t===k||vals.includes(t)) && vals.some(v=>hay.includes(v))) s+=9;
    return s;
  }

  function results(q){
    if(!q.trim()) return allItems().slice(0,8);
    return allItems().map(x=>({x,s:score(q,x)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).slice(0,10).map(o=>o.x);
  }

  function renderSearch(q=''){
    const items=results(q);
    return `<section class="search"><button class="back" data-action="back">← Back to Index</button><div class="eyebrow">SMART SEARCH</div><h1 style="font-size:36px;margin:6px 0 17px">What do you need?</h1><div class="searchbar"><input id="search" autocomplete="off" placeholder="Try: angry player, why company, wrong account…" value="${esc(q)}" autofocus><button class="live-launch" data-route="live">LIVE</button></div><div class="results">${items.length?items.map(x=>`<button class="result" data-open="${esc(x.type)}:${esc(x.id)}"><b>${esc(x.title)}</b><span>${esc(x.type)} · ${(x.tags||[]).slice(0,4).join(' · ')}</span></button>`).join(''):'<div class="result"><b>No strong match yet.</b><span>Try fewer words or a concept like “angry”, “Epic”, “French call”, “refund”, “account”.</span></div>'}</div></section>`;
  }

  function renderCall(){
    const items=D.french;
    activeItems=items;
    const selected=items[0];
    return `<section class="tele"><button class="back" data-action="back">← Back to Index</button><div class="eyebrow">🇫🇷 FRENCH CALL MODE</div><h1 style="font-size:36px;margin:6px 0 18px">Say this. Not that.</h1><div class="call-grid"><nav class="call-nav">${items.map((x,i)=>`<button data-call-index="${i}" class="${i===0?'active':''}">${esc(x.title)}</button>`).join('')}</nav><div id="call-body" class="call-card"><h2>${esc(selected.title)}</h2>${selected.phrases.map(p=>`<div class="phrase">${esc(p)}</div>`).join('')}</div></div></section>`;
  }

  function renderPanic(){
    return `<section class="panic"><div class="big">🫁</div><div class="eyebrow">PANIC MODE</div><h1>Breathe. Listen. Answer.</h1><p>You do not need the perfect answer. You need a clear next step.</p><div class="rules"><div class="rule"><b>1 · Reconnaître</b><br>« Je comprends tout à fait votre frustration. »</div><div class="rule"><b>2 · Clarifier</b><br>« Pour commencer, pouvez-vous me confirmer… »</div><div class="rule"><b>3 · Vérifier</b><br>« Je vais vérifier cela de mon côté. »</div><div class="rule"><b>4 · Ne pas inventer</b><br>« Je préfère vérifier cette information plutôt que de vous donner une mauvaise réponse. »</div><div class="rule"><b>5 · Résoudre</b><br>Donne la solution possible, ou explique la prochaine étape.</div></div><button class="live-launch" data-route="live">RETURN TO LIVE MODE</button></section>`;
  }

  function render(){
    let html='';
    if(route==='index')html=renderIndex();
    else if(route==='live')html=renderLive();
    else if(route==='search')html=renderSearch();
    else if(route==='call')html=renderCall();
    else if(route==='panic')html=renderPanic();
    else {
      const c=D.categories.find(x=>x.id===route);
      if(route==='french') html=renderCollection('French First','French answer bank','',D.answers.filter(x=>x.cat==='french'));
      else if(route==='gaming') html=renderCollection('Gaming','Gaming reference','',D.stories.filter(x=>x.tags?.includes('gaming')||x.id.includes('epic')).concat(D.scenarios.filter(x=>x.tags?.some(t=>['gaming','player','epic'].includes(t)))));
      else if(route==='stories') html=renderCollection('Real Stories','Reusable experience stories','',D.stories);
      else if(route==='taptap') html=renderCollection('TapTap Send','Customer experience reference','',D.answers.filter(x=>x.cat==='taptap').concat(D.english.filter(x=>x.tags?.includes('why taptap'))));
      else if(route==='curveballs') html=renderCollection('Curveballs','The questions you hate','',D.curveballs.concat(D.scenarios.filter(x=>x.id==='career-gap')));
      else if(route==='english') html=renderCollection('English Backup','Emergency reference','',D.english);
      else html=`<section class="tele"><button class="back" data-action="back">← Back to Index</button><h1>Not found</h1></section>`;
    }
    view.innerHTML=html; view.scrollTop=0; view.focus();
    searchInput=document.getElementById('search');
    if(searchInput){ searchInput.focus(); searchInput.setSelectionRange(searchInput.value.length,searchInput.value.length); }
  }

  function openItem(type,id){
    const source={answer:D.answers,story:D.stories,french:D.french,scenario:D.scenarios,curveball:D.curveballs,english:D.english}[type]||[];
    const x=source.find(i=>i.id===id); if(!x)return;
    history.push('search'); route='detail';
    activeItems=[x]; activeIndex=0;
    view.innerHTML=`<section class="tele"><button class="back" data-action="back">← Back to Index</button><div class="eyebrow">${esc(type.toUpperCase())}</div><h1 style="font-size:34px;margin:6px 0 18px">${esc(x.title)}</h1><article class="answer active"><p>${esc(x.text || (x.phrases||[]).join('\n\n'))}</p></article></section>`;
    view.scrollTop=0; view.focus();
  }

  view.addEventListener('click',e=>{
    const r=e.target.closest('[data-route]'); if(r){ go(r.dataset.route); return; }
    const b=e.target.closest('[data-action="back"]'); if(b){ back(); return; }
    const o=e.target.closest('[data-open]'); if(o){ const [type,id]=o.dataset.open.split(':'); openItem(type,id); return; }
    const ci=e.target.closest('[data-call-index]'); if(ci){ document.querySelectorAll('[data-call-index]').forEach(x=>x.classList.remove('active')); ci.classList.add('active'); const x=D.french[Number(ci.dataset.callIndex)]; document.getElementById('call-body').innerHTML=`<h2>${esc(x.title)}</h2>${x.phrases.map(p=>`<div class="phrase">${esc(p)}</div>`).join('')}`; return; }
    const a=e.target.closest('[data-answer-index]'); if(a){ document.querySelectorAll('[data-answer-index]').forEach(x=>x.classList.remove('active')); a.classList.add('active'); activeIndex=Number(a.dataset.answerIndex); a.scrollIntoView({behavior:'smooth',block:'center'}); return; }
  });

  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='font-up')setFont(fontSize+1); if(action==='font-down')setFont(fontSize-1);
  });

  document.addEventListener('input',e=>{
    if(e.target.id==='search'){ const s=e.target.selectionStart; view.querySelector('.results').outerHTML=renderSearch(e.target.value).match(/<div class="results">[\s\S]*<\/div><\/section>/)?.[0]?.split('<section class="search">')[0] || view.querySelector('.results').outerHTML; const fresh=renderSearch(e.target.value); const tmp=document.createElement('div'); tmp.innerHTML=fresh; view.querySelector('.results').replaceWith(tmp.querySelector('.results')); e.target.focus(); e.target.setSelectionRange(s,s); }
  });

  document.addEventListener('keydown',e=>{
    const tag=document.activeElement?.tagName;
    const typing=['INPUT','TEXTAREA'].includes(tag);
    if(e.key==='Escape'){e.preventDefault();back();return;}
    if(e.key.toLowerCase()==='h'&&!typing){e.preventDefault();route='index';history=[];render();return;}
    if(e.key.toLowerCase()==='s'&&!typing){e.preventDefault();go('search');return;}
    if(e.key==='F12'){e.preventDefault();go('panic');return;}
    if(e.key==='+'&&!typing){setFont(fontSize+1);}
    if(e.key==='-'&&!typing){setFont(fontSize-1);}
    if(e.key==='ArrowDown'&&!typing){e.preventDefault();view.scrollBy({top:120,behavior:'smooth'});}
    if(e.key==='ArrowUp'&&!typing){e.preventDefault();view.scrollBy({top:-120,behavior:'smooth'});}
    if(e.key==='PageDown'&&!typing){e.preventDefault();view.scrollBy({top:view.clientHeight*.78,behavior:'smooth'});}
    if(e.key==='PageUp'&&!typing){e.preventDefault();view.scrollBy({top:-view.clientHeight*.78,behavior:'smooth'});}
    if(e.code==='Space'&&!typing&&activeItems.length){e.preventDefault();activeIndex=Math.min(activeIndex+1,activeItems.length-1);const els=[...document.querySelectorAll('[data-answer-index]')];if(els[activeIndex]){els.forEach(x=>x.classList.remove('active'));els[activeIndex].classList.add('active');els[activeIndex].scrollIntoView({behavior:'smooth',block:'center'});}}
  });

  render();
})();