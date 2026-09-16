import http from 'node:http';
import net from 'node:net';
import { spawn, execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CONFIG_PATH = process.env.LAUNCHER_CONFIG || new URL('./launcher.local.json', import.meta.url);
const PORT = Number(process.env.LAUNCHER_AGENT_PORT || 38500);
const PIN = process.env.LAUNCHER_PIN || '3060';

function loadConfig(){
  try{
    const path = CONFIG_PATH instanceof URL ? CONFIG_PATH.pathname : CONFIG_PATH;
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

function checkTcp(host,port,timeout=1200){
  return new Promise(resolve=>{
    const s=net.createConnection({host,port,timeout},()=>{s.destroy();resolve(true)});
    s.on('error',()=>resolve(false));
    s.on('timeout',()=>{s.destroy();resolve(false)});
  });
}

function checkHttp(url,timeout=1500){
  return (async()=>{
    try{
      const c=new AbortController();
      const t=setTimeout(()=>c.abort(),timeout);
      const r=await fetch(url,{signal:c.signal,cache:'no-store'});
      clearTimeout(t);
      return r.ok;
    }catch{return false}
  })();
}

function checkProcess(image){
  return new Promise(resolve=>{
    execFile('tasklist.exe',['/FI',`IMAGENAME eq ${image}`,'/FO','CSV','/NH'],{windowsHide:true},(err,stdout)=>{
      if(err)return resolve(false);
      resolve(stdout.split(/\r?\n/).some(line=>line.toLowerCase().includes(`"${image.toLowerCase()}"`)));
    });
  });
}

async function detect(s){
  const d=s?.detect;
  if(!d||d.type==='none')return false;
  if(d.type==='tcp')return checkTcp(d.host,d.port,d.timeout);
  if(d.type==='http')return checkHttp(d.url,d.timeout);
  if(d.type==='process')return checkProcess(d.image);
  return false;
}

async function serviceView([id,s]){
  const managed=running.get(id);
  const external=managed?false:await detect(s);
  return {
    id,
    name:s.name||id,
    description:s.description||'',
    running:Boolean(managed||external),
    source:managed?'launcher':(external?'external':'stopped'),
    pid:managed?.pid||null,
    kind:s.kind||'process'
  };
}

async function list(){
  return Promise.all(Object.entries(config.services||{}).map(serviceView));
}

function start(id){
  const s=config.services?.[id];
  if(!s)throw new Error('Unknown service');
  if(running.has(id))return running.get(id);
  const child=spawn(s.command,{cwd:s.cwd||process.cwd(),shell:true,windowsHide:true,detached:false,env:{...process.env,...(s.env||{})}});
  const record={pid:child.pid,startedAt:new Date().toISOString(),child};
  running.set(id,record);
  child.on('exit',()=>running.delete(id));
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
      out.ok=await checkTcp(item.host,item.port,item.timeout||1200);
      if(!out.ok)throw new Error('connection failed');
    }else{
      const c=new AbortController();const t=setTimeout(()=>c.abort(),item.timeout||1500);const r=await fetch(item.url,{signal:c.signal,cache:'no-store'});clearTimeout(t);if(!r.ok)throw new Error(`HTTP ${r.status}`);out.ok=true;
    }
  }catch(e){out.error=e.message||String(e)}
  out.latencyMs=Date.now()-started;return out;
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
    if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});return res.end()}
    if(url.pathname==='/health')return json(res,200,{ok:true,machine:config.machine||{},services:await list(),configError:config.error||null});
    if(url.pathname==='/status')return json(res,200,{machine:config.machine||{},services:await list(),health:await Promise.all((config.health||[]).map(health))});
    if(url.pathname==='/config')return json(res,200,{machine:config.machine||{},services:Object.fromEntries(Object.entries(config.services||{}).map(([id,s])=>[id,{name:s.name||id,description:s.description||'',kind:s.kind||'process',detect:s.detect||null}]))});
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
