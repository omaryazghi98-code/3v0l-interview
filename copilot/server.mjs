import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// The Python audio bridge owns 38472/38473. This server owns the copilot/LLM relay on 38471.
globalThis.window = globalThis;
try { await import('../data/content.js'); } catch (err) { console.error('Could not load interview data:', err.message); }
const D = globalThis.INTERVIEW_DATA || {};
const HOST = process.env.COPILOT_HOST || '0.0.0.0';
const PORT = Number(process.env.COPILOT_PORT || 38471);

const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';
const CEREBRAS_URL = process.env.CEREBRAS_URL || 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_KEY = process.env.CEREBRAS_API_KEY || '';
const REQUESTY_MODEL = process.env.REQUESTY_MODEL || 'openai/gpt-4o-mini';
const REQUESTY_URL = process.env.REQUESTY_URL || 'https://router.requesty.ai/v1/chat/completions';
const REQUESTY_KEY = process.env.REQUESTY_API_KEY || '';
const LLM_PRIMARY = String(process.env.LLM_PRIMARY || 'requesty').toLowerCase();
const REMOTE_PIN = process.env.REMOTE_PIN || '3060';
const ANSWER_LANGUAGE = process.env.ANSWER_LANGUAGE || 'fr';
let llmEnabled = true;
let state = {
  connectedAt: new Date().toISOString(), lastEventAt: null, speaker: null, transcript: '', final: false,
  intent: 'idle', direction: [], sayThis: '', bestReference: null, confidence: 0, provider: 'none', error: null
};
const commands = []; let commandSeq = 0;
const json = (res, status, payload) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'}); res.end(JSON.stringify(payload)); };
const readBody = req => new Promise((resolve, reject) => { const chunks=[]; req.on('data', c=>chunks.push(c)); req.on('end',()=>resolve(Buffer.concat(chunks))); req.on('error',reject); });
const parseBody = async req => JSON.parse((await readBody(req)).toString('utf8') || '{}');
const auth = body => String(body?.pin || '') === REMOTE_PIN;
function lanAddresses(){ const out=[]; for(const list of Object.values(networkInterfaces())) for(const n of list||[]) if(n.family==='IPv4'&&!n.internal) out.push(n.address); return out; }
function enqueue(action,payload={}){ const cmd={id:++commandSeq,action,...payload,at:new Date().toISOString()}; commands.push(cmd); if(commands.length>100) commands.splice(0,commands.length-100); return cmd; }

const allRefs = [
  ...(D.answers||[]).map(x=>({...x,type:'answer'})), ...(D.stories||[]).map(x=>({...x,type:'story'})),
  ...(D.scenarios||[]).map(x=>({...x,type:'scenario'})), ...(D.phoneCalls||[]).map(x=>({...x,type:'phone'})),
  ...(D.french||[]).map(x=>({...x,type:'phrase'})), ...(D.curveballs||[]).map(x=>({...x,type:'curveball'})),
  ...(D.english||[]).map(x=>({...x,type:'english'}))
];
const STOP = new Set('a au aux avec ce cette ces de des du en et est eu il ils je la le les leur leurs moi mon ma mes ne nos notre nous on ou par pas pour que quel quelle quelles quels qui se son sa ses sur te tes tu un une vos votre vous y dans d une'.split(' '));
function tokenize(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9à-ÿœ]+/i).filter(w=>w.length>2&&!STOP.has(w)); }
function relevance(text,x){
  const q=tokenize(text); const hay=tokenize([x.title,x.text,x.company,...(x.tags||[]),...(x.phrases||[])].join(' '));
  const set=new Set(hay); let hits=q.reduce((n,w)=>n+(set.has(w)?1:0),0);
  const t=String(text||'').toLowerCase(); const title=String(x.title||'').toLowerCase();
  if(/parlez?-moi.*expérience|parle.*expérience|présentez?-vous|présentation/.test(t) && ['Présentez-vous','Expérience multi-canaux'].some(v=>title.includes(v.toLowerCase()))) hits+=5;
  if(/pourquoi transperfect/.test(t) && title.includes('transperfect')) hits+=8;
  if(/pourquoi taptap/.test(t) && title.includes('taptap')) hits+=8;
  return hits;
}
function relevantRefs(text){
  const ranked=allRefs.map(x=>({x,hits:relevance(text,x)})).filter(r=>r.hits>0).sort((a,b)=>b.hits-a.hits).slice(0,6);
  if(ranked.length) return ranked.map(r=>({id:r.x.id,title:r.x.title,company:r.x.company||'',type:r.x.type,tags:(r.x.tags||[]).slice(0,8),text:r.x.text||'',phrases:r.x.phrases||[]}));
  return [];
}
function heuristic(text,context=[]){
  const t=String(text||'').toLowerCase();
  const rules=[
    {terms:['parlez-moi de votre expérience','parlez moi de votre expérience','présentez-vous','présentez vous','tell me about yourself'],ref:'self-fr',intent:'introduction',dir:['Présenter ton expérience globale','Citer gaming + support technique + cas complexes','Terminer par ce que tu recherches aujourd’hui']},
    {terms:['frustr','angry','énerv','insult','agress'],ref:'angry-player',intent:'difficult_customer',dir:['Reconnaître la frustration','Rester calme et professionnel','Reformuler puis vérifier','Proposer une prochaine étape claire']},
    {terms:['v-buck','vbucks','fortnite','wrong account','mauvais compte','achat'],ref:'epic-wrong-account',intent:'gaming_account',dir:['Vérifier le compte et la transaction','Identifier la plateforme','Ne rien promettre avant vérification']},
    {terms:['student','étudiant','spotify'],ref:'spotify-student',intent:'account_verification',dir:['Identifier le bon compte','Vérifier la situation','Expliquer la résolution sans improviser']},
    {terms:['transfer','transfert','argent','recipient','destinataire'],ref:'call-taptap-not-received',intent:'transfer_support',dir:['Vérifier le statut du transfert','Confirmer les informations nécessaires','Donner une prochaine étape claire','Ne pas inventer de délai']},
    {terms:['phone','téléphone','call','appel','channel','canal'],ref:'channels-fr',intent:'support_channels',dir:['Donner un exemple concret','Montrer ton expérience multi-canaux']}
  ];
  let best={score:0}; for(const r of rules){ const score=r.terms.reduce((n,w)=>n+(t.includes(w)?1:0),0); if(score>best.score) best={score,...r}; }
  const ctxHit=context.find(x=>best.ref===x.id);
  if(best.score) return {intent:best.intent,direction:best.dir,bestReference:ctxHit?.id||best.ref,confidence:Math.min(.96,.5+best.score*.15),sayThis: best.ref==='self-fr' ? 'J’ai plus de six ans d’expérience dans le support client et le support technique, avec une expérience en chat, téléphone, e-mail et back-office. J’ai travaillé dans différents environnements, notamment le gaming avec Epic Games, les services numériques avec Spotify et Airalo, ainsi que chez Comdata et Beerwulf. Je suis particulièrement à l’aise avec les situations complexes, la recherche de solutions et la communication avec les clients.': ''};
  return {intent:'unknown',direction:['Écouter la question jusqu’au bout','Identifier le sujet principal','Répondre avec un exemple réel','Demander une précision si nécessaire'],bestReference:context[0]?.id||null,confidence:.25,sayThis:''};
}
function providerConfig(name){
  if(name==='requesty') return {name:'requesty',label:`Requesty ${REQUESTY_MODEL}`,url:REQUESTY_URL,key:REQUESTY_KEY,model:REQUESTY_MODEL};
  if(name==='cerebras') return {name:'cerebras',label:'Cerebras GPT-OSS-120B',url:CEREBRAS_URL,key:CEREBRAS_KEY,model:CEREBRAS_MODEL};
  return null;
}
function providerOrder(){ const first=LLM_PRIMARY==='cerebras'?'cerebras':'requesty'; return [first, first==='cerebras'?'requesty':'cerebras']; }
function referenceText(context){ return (context||[]).map(x=>`[${x.id}] ${x.title}\n${x.text||x.phrases?.join(' ')||''}`).join('\n\n'); }
async function callProvider(name,body){
  const cfg=providerConfig(name); if(!cfg?.key) return null;
  const payload={model:cfg.model,messages:[
    {role:'system',content:`You are the realtime interview assistant for 3V0L. Answer in ${ANSWER_LANGUAGE==='en'?'English':'French'} only. Use ONLY the supplied interview references and Omar's verified experience. Never invent employers, tools, metrics, policies, timelines or responsibilities. Never mix employers. Return valid JSON only with exactly these keys: intent (string), direction (array of 2-5 short cues), say_this (short natural answer, maximum 4 sentences), best_reference (one supplied id or null), confidence (0-1).`},
    {role:'user',content:`Interview question:\n${body.transcript}\n\nVerified references:\n${referenceText(body.context)||'(none)'}\n\nGive the most useful speakable answer.`}
  ],temperature:.1,max_tokens:450};
  const resp=await fetch(cfg.url,{method:'POST',headers:{authorization:`Bearer ${cfg.key}`,'content-type':'application/json','HTTP-Referer':'http://3v0l.local','X-Title':'3V0L Interview Copilot'},body:JSON.stringify(payload)});
  if(!resp.ok) throw new Error(`${cfg.label} ${resp.status}: ${await resp.text()}`);
  const data=await resp.json(); const text=String(data?.choices?.[0]?.message?.content||'').trim();
  const cleaned=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  try { return {provider:name,result:JSON.parse(cleaned)}; } catch {}
  const start=cleaned.indexOf('{'), end=cleaned.lastIndexOf('}');
  if(start>=0&&end>start) { try { return {provider:name,result:JSON.parse(cleaned.slice(start,end+1))}; } catch {} }
  return {provider:name,result:{intent:'answer',direction:['Répondre naturellement avec ton expérience réelle'],say_this:cleaned,best_reference:body.context?.[0]?.id||null,confidence:.7}};
}
async function callLLM(body){
  if(!llmEnabled) return null;
  let lastError=null;
  for(const name of providerOrder()) { try { const out=await callProvider(name,body); if(out) return out; } catch(err){ lastError=err; console.error(`${name} backend failed:`,err.message); } }
  if(lastError) throw lastError;
  return null;
}
function llmStatus(){ return {enabled:llmEnabled,primary:LLM_PRIMARY,cerebras:{configured:!!CEREBRAS_KEY,model:CEREBRAS_MODEL},requesty:{configured:!!REQUESTY_KEY,model:REQUESTY_MODEL}}; }
async function handleEvent(payload){
  const transcript=String(payload.transcript||payload.text||'').trim(); if(!transcript) return state;
  // Always compute server-side references; the browser's coarse keyword matcher is not authoritative.
  const context=relevantRefs(transcript);
  const base=heuristic(transcript,context); let ai=null; state={...state,error:null};
  if(payload.final!==false&&llmEnabled){ try { ai=await callLLM({transcript,speaker:payload.speaker||'interviewer',context}); } catch(err){ state.error=String(err.message||err); } }
  const merged=ai?.result||base;
  state={...state,lastEventAt:new Date().toISOString(),speaker:payload.speaker||'interviewer',transcript,final:payload.final!==false,intent:merged.intent||base.intent,direction:Array.isArray(merged.direction)?merged.direction:base.direction,sayThis:String(merged.say_this||base.sayThis||''),bestReference:merged.best_reference??base.bestReference,confidence:Number.isFinite(+merged.confidence)?+merged.confidence:base.confidence,provider:ai?.provider||(payload.provider||'local')};
  return state;
}

const server=http.createServer(async(req,res)=>{ try {
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});return res.end();}
  if(url.pathname==='/health'&&req.method==='GET') return json(res,200,{ok:true,model:providerConfig(LLM_PRIMARY)?.model,llm:llmStatus(),remoteConfigured:true,state});
  if(url.pathname==='/state'&&req.method==='GET') return json(res,200,{...state,apis:{llm:llmStatus()}});
  if(url.pathname==='/config'&&req.method==='GET') return json(res,200,{llm:llmStatus(),requestyConfigured:!!REQUESTY_KEY,cerebrasConfigured:!!CEREBRAS_KEY});
  if(url.pathname==='/config'&&req.method==='POST'){const body=await parseBody(req);if(typeof body.llm==='boolean')llmEnabled=body.llm;return json(res,200,{llm:llmStatus()});}
  if(url.pathname==='/event'&&req.method==='POST') return json(res,200,await handleEvent(await parseBody(req)));
  if(url.pathname==='/clear'&&req.method==='POST'){state={...state,lastEventAt:null,speaker:null,transcript:'',final:false,intent:'idle',direction:[],sayThis:'',bestReference:null,confidence:0,provider:'none',error:null};return json(res,200,state);}
  if((url.pathname==='/remote'||url.pathname==='/remote.html')&&req.method==='GET') return serveFile('remote.html','text/html; charset=utf-8',res);
  if(url.pathname==='/remote.webmanifest'&&req.method==='GET') return serveFile('remote.webmanifest','application/manifest+json; charset=utf-8',res);
  if(url.pathname==='/remote-sw.js'&&req.method==='GET') return serveFile('remote-sw.js','application/javascript; charset=utf-8',res);
  if(url.pathname==='/remote/info'&&req.method==='GET'){const hosts=lanAddresses();return json(res,200,{ok:true,port:PORT,hosts,remoteUrl:hosts[0]?`http://${hosts[0]}:${PORT}/remote`:`http://localhost:${PORT}/remote`,audioPort:Number(process.env.AUDIO_PORT||38472)});}
  if(url.pathname==='/remote/action'&&req.method==='POST'){const body=await parseBody(req);if(!auth(body))return json(res,401,{error:'invalid remote PIN'});return json(res,200,{ok:true,command:enqueue(String(body.action||''),{value:body.value??null})});}
  if(url.pathname==='/remote/commands'&&req.method==='GET'){const after=Number(url.searchParams.get('after')||0);return json(res,200,{commands:commands.filter(c=>c.id>after)});}
  return json(res,404,{error:'not found'});
 } catch(err){ return json(res,500,{error:String(err.message||err)}); }});

async function serveFile(path,type,res){ try { const body=await readFile(join(dirname(fileURLToPath(import.meta.url)),path)); res.writeHead(200,{'content-type':type,'cache-control':'no-store'}); res.end(body); } catch { json(res,404,{error:'not found'}); } }
server.listen(PORT,HOST,()=>{const hosts=lanAddresses();console.log(`3V0L Copilot relay listening on http://${HOST}:${PORT}`);console.log(`3V0L Remote: ${hosts[0]?`http://${hosts[0]}:${PORT}/remote`:`http://localhost:${PORT}/remote`}`);console.log(`LLM primary: ${LLM_PRIMARY}`);console.log(`Cerebras: ${CEREBRAS_KEY?'configured':'not configured'}`);console.log(`Requesty: ${REQUESTY_KEY?'configured':'not configured'}`);});
