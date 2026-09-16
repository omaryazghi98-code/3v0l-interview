(()=>{
const D=window.INTERVIEW_DATA||{};
const API='http://127.0.0.1:38471';
const refs=[...(D.answers||[]),...(D.stories||[]),...(D.scenarios||[]),...(D.phoneCalls||[])];
let open=localStorage.getItem('3v0l-copilot-open')!=='0';
let running=false, poller=0, lastAt='';
let apiConfig={requesty:true,deepgram:true,azure:true};
let pollFailures=0;
let pollInterval=450;
const POLL_MIN=450, POLL_MAX=5000, POLL_FACTOR=1.5;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findRefs=text=>{
 const t=String(text||'').toLowerCase();
 return refs.map(x=>{const hay=[x.title,x.text,x.company,...(x.tags||[])].join(' ').toLowerCase();let score=0;for(const w of t.split(/\s+/)){if(w.length>2&&hay.includes(w))score++}return {x,score}}).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,6).map(({x})=>({id:x.id,title:x.title,company:x.company||'',tags:(x.tags||[]).slice(0,5)}));
};
function shell(){
 if(document.getElementById('copilotRail'))return;
 document.body.classList.toggle('copilot-open',open);
 const rail=document.createElement('aside');rail.id='copilotRail';rail.className='copilot-rail';
 rail.innerHTML=`<div class="copilot-head"><div><div class="eyebrow">3V0L Â· LIVE COPILOT</div><strong>AI interview rail</strong></div><div class="copilot-head-actions"><button class="copilot-icon" data-cp="mock" title="Inject a test question">â—‡</button><button class="copilot-icon" data-cp="toggle" title="Hide/show rail">${open?'â†’':'â†'}</button></div></div>
 <div class="copilot-status"><span class="cp-dot"></span><span id="cpState">OFFLINE</span><span class="cp-model" id="cpModel">LOCAL</span></div>
 <div class="copilot-body">
 <section class="cp-section"><div class="cp-label">INTERVIEWER</div><div id="cpTranscript" class="cp-transcript">Waiting for audio / transcriptâ€¦</div></section>
 <section class="cp-section"><div class="cp-label">DIRECTION</div><div id="cpDirection" class="cp-direction"><div class="cp-empty">No question detected yet.</div></div></section>
 <section class="cp-section cp-say"><div class="cp-label">SAY THIS</div><div id="cpSay" class="cp-say-text">â€”</div></section>
 <section class="cp-section"><div class="cp-label">BEST REFERENCE</div><button id="cpReference" class="cp-reference" disabled>Select a matching reference when one is detected.</button></section>
 <section class="cp-section"><div class="cp-label">CONFIDENCE</div><div class="cp-confidence"><span id="cpConfidenceBar"></span></div><div id="cpConfidence" class="cp-confidence-text">â€”</div></section>
 <section class="cp-section"><div class="cp-label">API CONTROLS</div><div id="cpApiControls" style="display:grid;gap:7px"></div><div id="cpApiNote" style="font-size:10px;color:var(--muted);margin-top:7px">Off = no new provider usage.</div></section>
 <section class="cp-section cp-tools"><button data-cp="clear">Clear</button><button data-cp="test">Test question</button><button data-cp="settings">Status</button></section>
 </div>`;
 document.body.appendChild(rail);bind();updateShell();renderApiControls();loadApiConfig();
}
function updateShell(){document.body.classList.toggle('copilot-open',open);const b=document.querySelector('[data-cp="toggle"]');if(b)b.textContent=open?'â†’':'â†';}
async function post(path,payload){const r=await fetch(API+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(await r.text());return r.json()}
async function get(path){const r=await fetch(API+path,{cache:'no-store'});if(!r.ok)throw new Error(await r.text());return r.json()}
async function poll(){
  try{
    const r=await fetch(API+'/state',{cache:'no-store'});
    if(!r.ok) throw new Error();
    const s=await r.json();
    if(s.lastEventAt&&s.lastEventAt!==lastAt){lastAt=s.lastEventAt;renderState(s)}
    document.getElementById('cpState').textContent=s.lastEventAt?'LISTENING':'READY';
    document.getElementById('cpModel').textContent=s.provider==='requesty'?'REQUESTY':s.provider==='local'?'LOCAL':'NO AI';
    running=true;
    document.querySelector('.cp-dot')?.classList.toggle('on',!!s.lastEventAt);
    if(s.apis&&JSON.stringify(apiConfig)!==JSON.stringify(s.apis)){}
    // Reset backoff on successful poll
    if(pollFailures>0){
      pollFailures=0;
      pollInterval=POLL_MIN;
      document.body.classList.remove('cpOffline');
    }
  }catch{
    running=false;
    pollFailures++;
    pollInterval=Math.min(Math.round(pollInterval*POLL_FACTOR),POLL_MAX);
    document.body.classList.add('cpOffline');
    const stateEl=document.getElementById('cpState');
    const modelEl=document.getElementById('cpModel');
    if(stateEl) stateEl.textContent=pollFailures>1?'RECONNECTINGâ€¦':'BRIDGE OFF';
    if(modelEl) modelEl.textContent=pollFailures>1?'RETRY':'START SERVER';
    document.querySelector('.cp-dot')?.classList.remove('on');
  }
  // Schedule next poll with adaptive interval
  clearInterval(poller);
  poller=setInterval(poll, pollFailures>0?pollInterval:POLL_MIN);
}
function renderState(s){document.getElementById('cpTranscript').textContent=s.transcript||'â€”';const dir=(s.direction||[]).map((x,i)=>`<div class="cp-direction-item"><b>${i+1}</b><span>${esc(x)}</span></div>`).join('');document.getElementById('cpDirection').innerHTML=dir||'<div class="cp-empty">No guidance.</div>';document.getElementById('cpSay').textContent=s.sayThis||'â€”';const c=Math.round((+s.confidence||0)*100);document.getElementById('cpConfidenceBar').style.width=c+'%';document.getElementById('cpConfidence').textContent=c?`${c}% match`:'â€”';const rb=document.getElementById('cpReference');const x=refs.find(r=>r.id===s.bestReference);rb.disabled=!x;rb.textContent=x?`${x.company?x.company+' Â· ':''}${x.title}`:'No strong reference yet';rb.dataset.ref=x?.id||'';rb.dataset.rtype=x?.id?.startsWith('call-')?'phone':x?.id?.startsWith('epic-')||x?.id?.startsWith('spotify-')||x?.id?.startsWith('beerwulf-')||x?.id?.startsWith('airalo-')?'story':'answer';}
function renderApiControls(){const box=document.getElementById('cpApiControls');if(!box)return;const items=[['requesty','Requesty'],['deepgram','Deepgram'],['azure','Azure Speech']];box.innerHTML=items.map(([key,label])=>`<button type="button" data-api-toggle="${key}" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:#0e141c;color:var(--text);font:inherit;cursor:pointer"><span>${label}</span><strong id="cpApi-${key}">${apiConfig[key]?'ON':'OFF'}</strong></button>`).join('');box.querySelectorAll('[data-api-toggle]').forEach(b=>b.addEventListener('click',()=>toggleApi(b.dataset.apiToggle)));updateApiLabels();}
function updateApiLabels(){for(const key of ['requesty','deepgram','azure']){const el=document.getElementById(`cpApi-${key}`);if(el)el.textContent=apiConfig[key]?'ON':'OFF';}}
async function loadApiConfig(){try{apiConfig=await get('/config');updateApiLabels();}catch{}}
async function toggleApi(key){const next=!apiConfig[key];try{const patch={[key]:next};apiConfig={...apiConfig,...await post('/config',patch)};updateApiLabels();const note=document.getElementById('cpApiNote');if(note){note.textContent=`${key[0].toUpperCase()+key.slice(1)} ${next?'enabled':'disabled'} Â· ${next?'provider may be used when active':'no new usage from this provider'}`;setTimeout(()=>note.textContent='Off = no new provider usage.',2200);}}catch(err){const note=document.getElementById('cpApiNote');if(note)note.textContent=`Control error: ${err.message}`;}}
function sampleContext(text){return findRefs(text)}
async function analyze(text){const context=sampleContext(text);await post('/event',{transcript:text,speaker:'interviewer',final:true,context});}
function openReference(){const b=document.getElementById('cpReference');const id=b?.dataset.ref,rtype=b?.dataset.rtype;if(!id)return;const route=rtype==='phone'?'calls':rtype==='story'?'stories':'french';const routeBtn=document.querySelector(`[data-route="${CSS.escape(route)}"]`);routeBtn?.click();setTimeout(()=>{const card=document.querySelector(`[data-open-id="${CSS.escape(id)}"]`);card?.click()},120);}
function bind(){
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cp]');
    if (el) {
      const a = el.dataset.cp;
      if (a === 'toggle') {
        open = !open;
        localStorage.setItem('3v0l-copilot-open', open ? '1' : '0');
        updateShell();
        return;
      }
      if (a === 'mock' || a === 'test') {
        analyze("Parlez-moi d'une situation difficile avec un client.");
        return;
      }
      if (a === 'clear') {
        post('/clear', {}).catch(() => {});
        return;
      }
      if (a === 'settings') {
        get('/config').then((c) => {
          alert(
            'Requesty: ' + (c.requestyEnabled ? 'ON' : 'OFF') + '\n' +
            'Deepgram: ' + (c.deepgram ? 'ON' : 'OFF') + '\n' +
            'Azure Speech: ' + (c.azure ? 'ON' : 'OFF')
          );
        }).catch(() => {
          alert('Copilot relay unavailable.');
        });
        return;
      }
    }
    if (e.target.id === 'cpReference') {
      openReference();
    }
  });
  poll();
  window.addEventListener('resize', () => {
    document.body.classList.toggle('copilot-open', open);
  });
}
shell();
window.__3v0lCopilot={analyze,openReference,loadApiConfig,toggleApi};
})();
