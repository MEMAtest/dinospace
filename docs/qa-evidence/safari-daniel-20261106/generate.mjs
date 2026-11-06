import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SOUND_SAFARI_WORDS, SOUND_SAFARI_BLEND_PROMPT } from '../../../src/data/soundSafariAdventure.js';
const dir='docs/qa-evidence/safari-daniel-20261106', file=`${dir}/ledger.json`;
const entries=[...SOUND_SAFARI_WORDS.map(w=>({id:w.id,text:w.word.toLowerCase()})),{id:'blend-instruction',text:SOUND_SAFARI_BLEND_PROMPT}];
if(entries.length!==19||new Set(entries.map(e=>e.id)).size!==19)throw Error('Fixed 19-item inventory changed');
if(!process.env.ELEVENLABS_API_KEY)throw Error('Provider key unavailable');
let ledger;try{ledger=JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;ledger={approval:'User approved 19 Daniel recordings on 2026-11-06',cap:19,automaticRetries:0,voice:'Daniel',voiceId:'onwK4e9ZLuTAKqWW03F9',model:'eleven_flash_v2',requests:[]}}
const save=async()=>writeFile(file,JSON.stringify(ledger,null,2)+'\n');
if(ledger.requests.some(r=>r.status!=='saved'))throw Error('A prior request is uncertain or failed; manual reconciliation required, no retry');
await mkdir('public/audio/sound-safari/daniel',{recursive:true});
for(const item of entries){
 if(ledger.requests.some(r=>r.id===item.id))continue;
 if(ledger.requests.length>=19)throw Error('Approval cap reached');
 const row={...item,requestedAt:new Date().toISOString(),status:'requested'};ledger.requests.push(row);await save();
 try {
  const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/onwK4e9ZLuTAKqWW03F9?output_format=mp3_44100_128',{method:'POST',headers:{'Content-Type':'application/json','xi-api-key':process.env.ELEVENLABS_API_KEY},body:JSON.stringify({text:item.text,model_id:'eleven_flash_v2',voice_settings:{stability:0.5,similarity_boost:0.75,style:0,use_speaker_boost:true,speed:0.95}}),signal:AbortSignal.timeout(60000)});
  row.httpStatus=response.status;row.contentType=response.headers.get('content-type');if(!response.ok)throw Error(`Provider HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000||!row.contentType?.includes('audio'))throw Error('Invalid provider audio response');
  const path=`public/audio/sound-safari/daniel/${item.id}.mp3`;await writeFile(path,bytes);row.path='/'+path.slice(7);row.bytes=bytes.length;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status='saved';await save();console.log(JSON.stringify({id:item.id,status:'saved',bytes:row.bytes}));
 }catch(e){row.status='failed-or-unknown-no-retry';row.error=String(e.message);await save();throw e;}
}
console.log(JSON.stringify({complete:ledger.requests.length===19,requests:ledger.requests.length}));
