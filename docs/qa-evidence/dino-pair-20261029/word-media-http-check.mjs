import fs from 'node:fs';
import assert from 'node:assert/strict';
import {hangmanWordsForLevel} from '../../../src/data/hangmanLevels.js';
import {DEFAULT_TAUGHT_GRAPHEMES} from '../../../src/data/literacy.js';
import {getOfflineVoiceClip} from '../../../src/data/offlineVoice.js';
const [origin,out]=process.argv.slice(2),sounds=new Set(DEFAULT_TAUGHT_GRAPHEMES),targets=new Map();
for(let i=0;i<4;i++)for(const word of hangmanWordsForLevel(i,sounds)){
  const clip=getOfflineVoiceClip(word.word,'en-US');
  if(clip)targets.set(clip,{word:word.word,path:clip,kind:'word audio'});
}
for(const file of fs.readdirSync('dist/assets'))if(/(?:more-dino-character|dino-character-stickers|dino-park).*\.(?:png|jpe?g|webp)$/.test(file))targets.set('/assets/'+file,{path:'/assets/'+file,kind:'existing dinosaur art'});
const items=[...targets.values()],rows=[];
for(let start=0;start<items.length;start+=4){
  const group=await Promise.all(items.slice(start,start+4).map(async item=>{
    const r=await fetch(new URL(item.path,origin),{method:'HEAD',signal:AbortSignal.timeout(30000)});
    assert.equal(r.status,200,item.path);
    const contentType=r.headers.get('content-type')||'';
    assert.match(contentType,item.kind==='word audio'?/audio|octet-stream/:/image\//,item.path);
    return{...item,status:r.status,contentType,bytes:r.headers.get('content-length')===null?null:Number(r.headers.get('content-length'))};
  }));rows.push(...group);
}
fs.writeFileSync(out,JSON.stringify({at:new Date().toISOString(),origin,passed:true,method:'HEAD availability; playback is separately tested in the browser',rows},null,2)+'\n');
console.log(JSON.stringify({passed:true,audio:rows.filter(r=>r.kind==='word audio').length,art:rows.filter(r=>r.kind==='existing dinosaur art').length}));
