import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const CONFIG_PATH = process.env.LAUNCHER_CONFIG || new URL('./launcher.local.json', import.meta.url);
const PORT = Number(process.env.LAUNCHER_AGENT_PORT || 38500);
const PIN = process.env.LAUNCHER_PIN || '3060';

function loadConfig(){
  try{
    const path=CONFIG_PATH instanceof URL?CONFIG_PATH.pathname:CONFIG_PATH;
    return JSON.parse(readFileSync(path,'utf8'));
  }catch(err){
    return {machine:{name:'Unconfigured PC'},services:{},health:[],error:err.message};
  }
}
let config=loadConfig();
const running=new Map();
const json=(res,status,payload)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(payload));};
const body=req=>new Promise((resolve,reject)=>{const chunks=[];req.on('data',c=>chunks.push(c));req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch(e){reject(e)}});req.on('error',reject)});
const authed=b=>String(b?.pin||'')===PIN;
function list(){
  return Object.entries(config.services||{}).map(([id,s])=>({id,name:s.name||id,description:s.description||'',running:running.has(id),pid:running.get(id)?.pid||null,kind:s.kind||'process'}));
}
function start(id){
  const s=config.services?.[id];
  if(!s)throw new Error('Unknown service');
  if(running.has(id))return running.get(id);
  const child=spawn(s.command,{cwd:s.cwd||process.cwd(),shell:true,windowsHide:true,detached:false,env:{...process.env,...(s.env||{})}});
  const record={pid:child.pid,startedAt:new Date().toISOString(),child};
  running.set(id,record);
  child.on('exit',(code,signal)=>running.delete(id));
  child.on('error',()=>running.delete(id));
  return record;
}
function stop(id){
  const r=running.get(id);if(!r)return false;
  if(process.platform==='win32')spawn('taskkill',['/PID',String(r.pid),'/T','/F'],{windowsHide:true});
  else r.child.kill('SIGTERM');
  running.delete(id);return true;
}
async function health(item){
  const out={...item,ok:false,latencyMs:null,error:null};
  const started=Date.now();
  try{
    if(item.type==='tcp'){
      await new Promise((resolve,reject)=>{const s=require('node:net').createConnection({host:item.host,port:item.port,timeout:item.timeout||1200},()=>{s.destroy();resolve()});s.on('error',reject);s.on('timeout',()=>{s.destroy();reject(new Error('timeout'))})});
    }else{
      const c=new AbortController();const t=setTimeout(()=>c.abort(),item.timeout||1500);const r=await fetch(item.url,{signal:c.signal,cache:'no-store'});clearTimeout(t);if(!r.ok)throw new Error(`HTTP ${r.status}`);
    }
    out.ok=true;
  }catch(e){out.error=e.message||String(e)}
  out.latencyMs=Date.now()-started;return out;
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
    if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});return res.end()}
    if(url.pathname==='/health')return json(res,200,{ok:true,machine:config.machine||{},services:list(),configError:config.error||null});
    if(url.pathname==='/status')return json(res,200,{machine:config.machine||{},services:list(),health:await Promise.all((config.health||[]).map(health))});
    if(url.pathname==='/config')return json(res,200,{machine:config.machine||{},services:Object.fromEntries(Object.entries(config.services||{}).map(([id,s])=>[id,{name:s.name||id,description:s.description||'',kind:s.kind||'process'}]))});
    if(req.method==='POST'&&url.pathname==='/action'){
      const b=await body(req);if(!authed(b))return json(res,401,{error:'invalid launcher PIN'});
      if(b.action==='reload'){config=loadConfig();return json(res,200,{ok:true,configLoaded:true})}
      if(b.action==='start'){const r=start(String(b.service));return json(res,200,{ok:true,service:b.service,pid:r.pid})}
      if(b.action==='stop'){return json(res,200,{ok:stop(String(b.service)),service:b.service})}
      if(b.action==='restart'){stop(String(b.service));const r=start(String(b.service));return json(res,200,{ok:true,service:b.service,pid:r.pid})}
      if(b.action==='start-all'){const ids=Object.entries(config.services||{}).filter(([,s])=>s.autostart).map(([id])=>id);const started=[];for(const id of ids){try{started.push({id,pid:start(id).pid})}catch(e){started.push({id,error:e.message})}}return json(res,200,{ok:true,started})}
      if(b.action==='stop-all'){const ids=[...running.keys()];ids.forEach(stop);return json(res,200,{ok:true,stopped:ids})}
      return json(res,400,{error:'unknown action'});
    }
    return json(res,404,{error:'not found'});
  }catch(e){return json(res,500,{error:e.message||String(e)})}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`3V0L Launcher Agent listening on ${PORT}`));
