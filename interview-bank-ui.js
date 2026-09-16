(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
const get=()=>Array.isArray(window.INTERVIEW_QUESTIONS)?window.INTERVIEW_QUESTIONS:[];
let bankSearch='',bankCategory='ALL',bankLang='ALL';
function injectStyle(){
 if(document.getElementById('interview-bank-style'))return;
 const s=document.createElement('style');s.id='interview-bank-style';s.textContent=`
 .ib-card{display:flex!important;flex-direction:column;align-items:flex-start;text-align:left;gap:6px}
 .ib-card .card-icon{font-size:24px}.ib-card strong{font-size:15px}.ib-card span:last-child{opacity:.7}
 .ib-page{padding:28px 30px 60px;max-width:1500px;margin:0 auto}
 .ib-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:22px}
 .ib-head h1{margin:5px 0 8px;font-size:clamp(28px,4vw,48px)}.ib-head p{margin:0;opacity:.7;max-width:800px}
 .ib-stats{display:flex;gap:10px;flex-wrap:wrap}.ib-stat{padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.03)}
 .ib-controls{display:grid;grid-template-columns:minmax(220px,1fr) 180px 150px auto;gap:10px;margin-bottom:18px;position:sticky;top:0;z-index:5;padding:10px 0;background:var(--bg,#0a0c10)}
 .ib-controls input,.ib-controls select{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:inherit}
 .ib-list{display:grid;gap:12px}.ib-item{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.035);overflow:hidden}
 .ib-q{padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.08)}.ib-qtop{display:flex;gap:10px;align-items:center;justify-content:space-between}.ib-id{font:700 12px/1 monospace;opacity:.55}.ib-cat{font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.65}.ib-q h2{font-size:19px;margin:10px 0 0;line-height:1.35}
 .ib-body{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.07)}.ib-pane{padding:18px 20px;background:rgba(10,12,16,.96)}.ib-pane h3{margin:0 0 8px;font-size:11px;letter-spacing:.1em;opacity:.65}.ib-pane p{margin:0;line-height:1.65;white-space:pre-wrap}.ib-pane.full{grid-column:1/-1}
 .ib-meta{display:flex;flex-wrap:wrap;gap:7px;padding:12px 20px}.ib-chip{font-size:11px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.06);opacity:.8}
 .ib-risk{padding:13px 20px;background:rgba(255,180,0,.06);border-top:1px solid rgba(255,180,0,.12)}.ib-risk b{font-size:11px;letter-spacing:.08em}.ib-risk ul{margin:7px 0 0;padding-left:18px}.ib-risk li{margin:3px 0}
 .ib-variants{padding:13px 20px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;opacity:.8}.ib-variants b{margin-right:8px}
 .ib-empty{padding:50px;text-align:center;opacity:.6}.ib-back{margin-bottom:18px}
 @media(max-width:900px){.ib-body{grid-template-columns:1fr}.ib-controls{grid-template-columns:1fr 1fr}.ib-controls input{grid-column:1/-1}.ib-head{align-items:flex-start;flex-direction:column}}
 `;document.head.appendChild(s);
}
function matches(x){const hay=norm([x.question,...(x.variants||[]),x.answer_fr,x.answer_en,x.category,x.company,...(x.tags||[]),...(x.verified_facts||[])].join(' '));return (!bankSearch||hay.includes(norm(bankSearch)))&&(bankCategory==='ALL'||String(x.category||'')===bankCategory)&&(bankLang==='ALL'||bankLang==='FR'&&x.answer_fr||bankLang==='EN'&&x.answer_en);}
function render(){
 const view=document.getElementById('view');if(!view)return;injectStyle();const all=get();const cats=['ALL',...new Set(all.map(x=>x.category).filter(Boolean))];const items=all.filter(matches);
 view.innerHTML=`<section class="page ib-page"><div class="ib-back"><button class="back-index" id="ib-back">← Index</button></div><div class="ib-head"><div><div class="eyebrow">3V0L · MASTER KNOWLEDGE BASE</div><h1>Interview Question Bank</h1><p>Every expanded question in one visible reference: variants, speakable French and English answers, evidence anchors and safety flags.</p></div><div class="ib-stats"><div class="ib-stat"><b>${all.length}</b><small> questions</small></div><div class="ib-stat"><b>${items.length}</b><small> shown</small></div></div></div><div class="ib-controls"><input id="ib-search" value="${esc(bankSearch)}" placeholder="Search questions, stories, tags…"><select id="ib-category">${cats.map(c=>`<option ${c===bankCategory?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="ib-lang"><option ${bankLang==='ALL'?'selected':''}>ALL</option><option ${bankLang==='FR'?'selected':''}>FR</option><option ${bankLang==='EN'?'selected':''}>EN</option></select><button class="mini-btn" id="ib-reset">Reset</button></div><div class="ib-list">${items.map((x,i)=>item(x,i)).join('')||'<div class="ib-empty">No matching interview questions.</div>'}</div></section>`;
 document.getElementById('ib-back')?.addEventListener('click',()=>window.__3v0lHome?window.__3v0lHome():location.reload());
 const q=document.getElementById('ib-search');q?.addEventListener('input',()=>{bankSearch=q.value;render()});
 document.getElementById('ib-category')?.addEventListener('change',e=>{bankCategory=e.target.value;render()});
 document.getElementById('ib-lang')?.addEventListener('change',e=>{bankLang=e.target.value;render()});
 document.getElementById('ib-reset')?.addEventListener('click',()=>{bankSearch='';bankCategory='ALL';bankLang='ALL';render()});
}
function item(x,i){return `<article class="ib-item"><div class="ib-q"><div class="ib-qtop"><span class="ib-id">${esc(x.id||`Q-${i+1}`)}</span><span class="ib-cat">${esc(x.category||'General')} · ${esc(x.company||'General')}</span></div><h2>${esc(x.question||'')}</h2></div>${(x.variants||[]).length?`<div class="ib-variants"><b>VARIANTS</b>${x.variants.map(v=>`<span>${esc(v)}</span>`).join(' · ')}</div>`:''}<div class="ib-body">${x.answer_fr?`<div class="ib-pane"><h3>🇫🇷 FRANÇAIS — À DIRE</h3><p>${esc(x.answer_fr)}</p></div>`:''}${x.answer_en?`<div class="ib-pane"><h3>🇬🇧 ENGLISH</h3><p>${esc(x.answer_en)}</p></div>`:''}</div>${(x.tags||[]).length?`<div class="ib-meta">${x.tags.map(t=>`<span class="ib-chip">${esc(t)}</span>`).join('')}</div>`:''}${(x.verified_facts||[]).length?`<div class="ib-meta"><span class="ib-chip">VERIFIED</span>${x.verified_facts.map(t=>`<span class="ib-chip">${esc(t)}</span>`).join('')}</div>`:''}${(x.risk_flags||[]).length?`<div class="ib-risk"><b>⚠ SAFETY / FACT FLAGS</b><ul>${x.risk_flags.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>`:''}</article>`}
function addIndexCard(){const grid=document.querySelector('.index-page .index-grid');if(!grid||grid.querySelector('[data-interview-bank]'))return;const b=document.createElement('button');b.className='index-card ib-card';b.setAttribute('data-interview-bank','1');b.innerHTML=`<span class="card-num">→</span><span class="card-icon">📚</span><strong>MASTER INTERVIEW BANK</strong><span>${get().length} expanded questions · FR + EN · answers, variants, evidence & safety flags.</span>`;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();render()});grid.appendChild(b)}
const obs=new MutationObserver(()=>{if(document.querySelector('.index-page'))addIndexCard()});obs.observe(document.body,{childList:true,subtree:true});
window.__3v0lInterviewBank={open:render,count:()=>get().length};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addIndexCard);else addIndexCard();
})();