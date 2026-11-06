import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SOUND_SAFARI_WORDS, SOUND_SAFARI_BLEND_PROMPT } from '../../../src/data/soundSafariAdventure.js';
const file='docs/qa-evidence/safari-daniel-20261106/ledger.json';
const entries=[...SOUND_SAFARI_WORDS.map(w=>({id:w.id,text:w.word.toLowerCase()})),{id:'blend-instruction',text:SOUND_SAFARI_BLEND_PROMPT}];
if(entries.length!==19||new Set(entries.map(e=>e.id)).size!==19)throw Error('Fixed inventory changed');
const ledger=JSON.parse(await readFile(file,'utf8'));if(ledger.cap!==19)throw Error('Unexpected approval cap');
const token=(await readFile('/tmp/dinosafari-batch-token','utf8')).trim();const base=process.env.SAFARI_BATCH_URL;if(!/^https:\/\/dinospace-[a-z0-9]+-memas-projects-23a0001d\.vercel\.app$/.test(base||''))throw Error('Wrong job deployment');
const save=async()=>writeFile(file,JSON.stringify(ledger,null,2)+'\n');
for(const item of entries){
 if(ledger.requests.some(r=>r.id===item.id))continue;
 if(ledger.requests.length>=19)throw Error('Initial request cap reached');
 const row={...item,requestedAt:new Date().toISOString(),status:'requested',via:'restricted-server-job'};ledger.requests.push(row);await save();
 try {const r=await fetch(`${base}/api/safari-voice-batch-20261106`,{method:'POST',headers:{'content-type':'application/json','x-safari-token':token},body:JSON.stringify({id:item.id}),signal:AbortSignal.timeout(70000)});row.httpStatus=r.status;row.providerStatus=r.headers.get('x-provider-status');row.contentType=r.headers.get('content-type');if(!r.ok)throw Error(`Job HTTP ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||!row.contentType?.includes('audio'))throw Error('Invalid audio response');const path=`public/audio/sound-safari/daniel/${item.id}.mp3`;await writeFile(path,bytes);row.path='/'+path.slice(7);row.bytes=bytes.length;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status='saved';await save();console.log(JSON.stringify({id:item.id,status:'saved',bytes:row.bytes}));}
 catch(e){row.status='failed-or-unknown-no-retry';row.error=String(e.message);await save();throw e;}
}
console.log(JSON.stringify({saved:ledger.requests.filter(r=>r.status==='saved').length,totalAttempts:ledger.requests.length,failed:ledger.requests.filter(r=>r.status!=='saved').map(r=>r.id)}));
