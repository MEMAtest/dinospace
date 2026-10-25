import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir='docs/qa-evidence/safari-colour-20261025/phoneme-trial',log=dir+'/requests.json';
let ledger;try{ledger=JSON.parse(await readFile(log));}catch{ledger={cap:6,automaticRetries:0,model:'eleven_flash_v2',voice:'Daniel',voiceId:'onwK4e9ZLuTAKqWW03F9',requests:[]};}
for(const phoneme of ['s','a','t','p','i','n']){
 if(ledger.requests.some(r=>r.phoneme===phoneme))continue;
 if(ledger.requests.length>=6)throw Error('Cap');
 const row={phoneme,requestedAt:new Date().toISOString(),status:'requested'};ledger.requests.push(row);await writeFile(log,JSON.stringify(ledger,null,2)+'\n');
 try{const r=await fetch('https://dinospace-dwmd9tp3o-memas-projects-23a0001d.vercel.app/api/voice',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://dinospace.netlify.app'},body:JSON.stringify({phoneme}),signal:AbortSignal.timeout(60000)});row.httpStatus=r.status;row.profile=r.headers.get('x-amari-voice-profile');row.model=r.headers.get('x-amari-voice-model');if(r.status!==200||row.profile!=='british-phoneme-trial')throw Error('Voice trial response '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000)throw Error('Short trial');await writeFile(dir+'/'+phoneme+'.mp3',bytes);row.bytes=bytes.length;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status='saved';}
 catch(e){row.status='failed-no-retry';row.error=e.message;await writeFile(log,JSON.stringify(ledger,null,2)+'\n');throw e;}
 await writeFile(log,JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(row));
}
