import { readFile,writeFile,stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { COLOUR_LAB_NARRATION } from '../../../src/data/colourLabAdventure.js';
import { SOUND_SAFARI_NARRATION_INVENTORY } from '../../../src/data/soundSafariAdventure.js';
import { OFFLINE_VOICE_MANIFEST as existing } from '../../../src/data/offlineVoiceManifest.js';
import { voiceClipKey } from '../../../src/data/voiceKey.js';
if(!process.argv.includes('--approved-fixed-cap-100'))throw Error('Explicit approved fixed cap required');
const dir='docs/qa-evidence/safari-colour-20261025';
const manifest={...existing};
const lines=[...new Set([...COLOUR_LAB_NARRATION.map(i=>i.text),...SOUND_SAFARI_NARRATION_INVENTORY])];
const inventory=[];
for(const text of lines){const key=voiceClipKey(text);const path=manifest[key]||`/audio/en/${key}-matilda.mp3`;let present=false;try{present=(await stat('public'+path)).size>1000;}catch{}inventory.push({text,key,path,existing:present?path:null});}
await writeFile(dir+'/narration-inventory.json',JSON.stringify(inventory,null,2)+'\n');
const ledgerPath=dir+'/narration-generation.json';let ledger;
try{ledger=JSON.parse(await readFile(ledgerPath));}catch{ledger={approval:'Human approved up to 100 fixed narration requests plus separate six-clip British phoneme trial, no automatic retries',cap:100,requests:[]};}
const pending=inventory.filter(i=>!i.existing&&!ledger.requests.some(r=>r.key===i.key));
if(ledger.requests.length+pending.length>100)throw Error('Cap exceeded');
console.log(JSON.stringify({unique:inventory.length,reused:inventory.length-pending.length,pending:pending.length,characters:pending.reduce((n,r)=>n+r.text.length,0)}));
const persist=()=>writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
for(const item of pending){
 const row={key:item.key,text:item.text,path:item.path,requestedAt:new Date().toISOString(),status:'requested'};ledger.requests.push(row);await persist();
 try{
  const response=await fetch('https://dinospace.netlify.app/api/voice',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://dinospace.netlify.app'},body:JSON.stringify({text:item.text,language:'en'}),signal:AbortSignal.timeout(60000)});
  row.httpStatus=response.status;row.provider=response.headers.get('x-amari-voice-provider');
  if(response.status!==200||row.provider!=='elevenlabs')throw Error('Provider response '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000)throw Error('Short audio');
  await writeFile('public'+item.path,bytes);row.bytes=bytes.length;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status='saved';manifest[item.key]=item.path;
  await writeFile('src/data/offlineVoiceManifest.js','// Generated packaged voice inventory.\nexport const OFFLINE_VOICE_MANIFEST = '+JSON.stringify(manifest,null,2)+';\n');
  await persist();console.log(JSON.stringify({completed:ledger.requests.filter(r=>r.status==='saved').length,total:pending.length,key:item.key}));
 }catch(error){row.status='failed-no-retry';row.error=String(error.message);await persist();throw error;}
 await new Promise(resolve=>setTimeout(resolve,8200));
}
ledger.finishedAt=new Date().toISOString();await persist();
