import http from 'node:http';

const HOST='127.0.0.1';
const PORT=38471;
const MODEL=process.env.REQUESTY_MODEL||'google/gemma-4-31b-it';
const REQUESTY_URL=process.env.REQUESTY_URL||'https://router.requesty.ai/v1/chat/completions';
const REQUESTY_KEY=process.env.REQUESTY_API_KEY||'';

let state={
  connectedAt:new Date().toISOString(),
  lastEventAt:null,
  speaker:null,
  transcript:'',
  final:false,
  intent:'idle',
  direction:[],
  sayThis:'',
  bestReference:null,
  confidence:0,
  provider:'none',
  error:null
};

const json=(res,status,payload)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(payload));};
const readBody=req=>new Promise((resolve,reject)=>{const chunks=[];req.on('data',c=>chunks.push(c));req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject)});

function heuristic(text,context=[]){
  const t=text.toLowerCase();
  const rules=[
    {terms:['frustr','angry','énerv','insult','agress'],ref:'angry-player',intent:'difficult_customer',dir:['Reconnaître la frustration','Ne pas prendre l’agressivité personnellement','Reformuler le problème','Vérifier avant de promettre une solution']},
    {terms:['v-buck','vbucks','fortnite','wrong account','mauvais compte','achat'],ref:'epic-wrong-account',intent:'gaming_account',dir:['Vérifier le compte et la transaction','Identifier la plateforme','Ne pas promettre de remboursement avant vérification']},
    {terms:['student','étudiant','spotify'],ref:'spotify-student',intent:'account_verification',dir:['Identifier le bon compte','Vérifier la situation','Expliquer la résolution sans improviser']},
    {terms:['transfer','transfert','argent','mother','mère','recipient','destinataire'],ref:'call-taptap-not-received',intent:'transfer_support',dir:['Vérifier le statut du transfert','Confirmer les informations nécessaires','Donner une prochaine étape claire','Ne pas inventer de délai']},
    {terms:['phone','téléphone','call','appel','channel','canal'],ref:'channels-fr',intent:'support_channels',dir:['Donner un exemple concret','Montrer ton expérience multi-canaux']}
  ];
  let best={score:0};
  for(const r of rules){const score=r.terms.reduce((n,w)=>n+(t.includes(w)?1:0),0);if(score>best.score)best={score,...r};}
  const contextHit=context.find(x=>best.ref===x.id)||null;
  if(!best.score) return {intent:'unknown',direction:['Écouter la question jusqu’au bout','Identifier le sujet principal','Répondre avec un exemple réel','Demander une précision si nécessaire'],bestReference:context[0]?.id||null,confidence:.25,sayThis:''};
  return {intent:best.intent,direction:best.dir,bestReference:contextHit?.id||best.ref,confidence:Math.min(.96,.45+best.score*.15),sayThis:''};
}

async function callRequesty(body){
  if(!REQUESTY_KEY) return null;
  const resp=await fetch(REQUESTY_URL,{method:'POST',headers:{authorization:`Bearer ${REQUESTY_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:MODEL,messages:[{role:'system',content:'You are the realtime interview assistant for 3V0L. Return strict JSON only with keys intent, direction (array of 2-5 short French action cues), say_this (short natural French answer, max 3 sentences), best_reference (id or null), confidence (0-1). Never invent experience. Prefer the provided reference context. The user is Omar.'},{role:'user',content:JSON.stringify(body)}],temperature:.15,max_tokens:500})});
  if(!resp.ok) throw new Error(`Requesty ${resp.status}: ${await resp.text()}`);
  const data=await resp.json();
  const text=data?.choices?.[0]?.message?.content||'';
  try{return JSON.parse(text)}catch{
    const start=text.indexOf('{'),end=text.lastIndexOf('}');
    if(start>=0&&end>start)return JSON.parse(text.slice(start,end+1));
    throw new Error('Requesty returned non-JSON output');
  }
}

async function handleEvent(payload){
  const transcript=String(payload.transcript||payload.text||'').trim();
  if(!transcript)return state;
  const context=Array.isArray(payload.context)?payload.context.slice(0,8):[];
  const base=heuristic(transcript,context);
  let ai=null;
  if(payload.final!==false){
    try{ai=await callRequesty({transcript, speaker:payload.speaker||'interviewer', context});}
    catch(err){state.error=String(err.message||err);}
  }
  const merged=ai||base;
  state={...state,lastEventAt:new Date().toISOString(),speaker:payload.speaker||'interviewer',transcript,final:payload.final!==false,intent:merged.intent||base.intent,direction:Array.isArray(merged.direction)?merged.direction:base.direction,sayThis:String(merged.say_this||base.sayThis||''),bestReference:merged.best_reference??base.bestReference,confidence:Number.isFinite(+merged.confidence)?+merged.confidence:base.confidence,provider:ai?'requesty':'local',error:state.error};
  return state;
}

const server=http.createServer(async(req,res)=>{
  try{
    if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});return res.end();}
    if(req.url==='/health'&&req.method==='GET')return json(res,200,{ok:true,model:MODEL,requestyConfigured:!!REQUESTY_KEY,state});
    if(req.url==='/state'&&req.method==='GET')return json(res,200,state);
    if(req.url==='/event'&&req.method==='POST'){const body=JSON.parse((await readBody(req)).toString('utf8')||'{}');return json(res,200,await handleEvent(body));}
    if(req.url==='/clear'&&req.method==='POST'){state={...state,lastEventAt:null,speaker:null,transcript:'',final:false,intent:'idle',direction:[],sayThis:'',bestReference:null,confidence:0,provider:'none',error:null};return json(res,200,state);}
    return json(res,404,{error:'not found'});
  }catch(err){return json(res,500,{error:String(err.message||err)});}
});
server.listen(PORT,HOST,()=>console.log(`3V0L Copilot relay listening on http://${HOST}:${PORT}`));
