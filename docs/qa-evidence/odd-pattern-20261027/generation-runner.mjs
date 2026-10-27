import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {OFFLINE_VOICE_MANIFEST as existing} from '../../../src/data/offlineVoiceManifest.js';
if(!process.argv.includes('--approved-fixed-104'))throw Error('Explicit approval flag required');
const root='docs/qa-evidence/odd-pattern-20261027';const inventory=JSON.parse(await fs.readFile(root+'/narration-inventory.json','utf8'));const manifest={...existing};const ledgerPath=root+'/narration-generation.json';let ledger;
try{ledger=JSON.parse(await fs.readFile(ledgerPath));}catch{ledger={cap:104,automaticRetries:0,requests:[]};}
if(inventory.length!==104)throw Error('Approved set changed');
for(const item of inventory){
 let ready=false;try{ready=(await fs.stat('public'+(manifest[item.key]||item.path))).size>1000;}catch{}
 if(ready)continue;if(ledger.requests.some(r=>r.key===item.key))throw Error('Already attempted; no automatic retry');if(ledger.requests.length>=104)throw Error('Cap exceeded');
 const row={key:item.key,text:item.text,path:item.path,requestedAt:new Date().toISOString(),status:'requested'};ledger.requests.push(row);await fs.writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
 try{const response=await fetch('https://dinospace.netlify.app/api/voice',{method:'POST',headers:{Origin:'https://dinospace.netlify.app','Content-Type':'application/json'},body:JSON.stringify({text:item.text,language:'en'}),signal:AbortSignal.timeout(60000)});row.httpStatus=response.status;row.provider=response.headers.get('x-amari-voice-provider');if(response.status!==200||row.provider!=='elevenlabs')throw Error('Voice response '+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000)throw Error('Short audio');await fs.writeFile('public'+item.path,bytes);row.bytes=bytes.length;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status='saved';manifest[item.key]=item.path;await fs.writeFile('src/data/offlineVoiceManifest.js','// Generated packaged voice inventory.\nexport const OFFLINE_VOICE_MANIFEST = '+JSON.stringify(manifest,null,2)+';\n');}
 catch(error){row.status='failed-no-retry';row.error=error.message;await fs.writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');throw error;}
 await fs.writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({completed:ledger.requests.filter(x=>x.status==='saved').length,cap:104,key:item.key}));await new Promise(r=>setTimeout(r,8200));
}
ledger.finishedAt=new Date().toISOString();await fs.writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
