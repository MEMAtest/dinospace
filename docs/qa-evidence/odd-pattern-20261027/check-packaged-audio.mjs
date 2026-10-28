import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {ODD_ONE_OUT_NARRATION} from '../../../src/data/oddOneOutAdventure.js';
import {PATTERN_NARRATION_STRINGS} from '../../../src/data/patternAdventure.js';
import {getOfflineVoiceClip} from '../../../src/data/offlineVoice.js';
const root='docs/qa-evidence/odd-pattern-20261027';
const inventory=JSON.parse(fs.readFileSync(root+'/narration-inventory.json'));
const ledger=JSON.parse(fs.readFileSync(root+'/narration-generation.json'));
assert.equal(inventory.length,104);assert.equal(ledger.requests.length,104);assert.ok(ledger.finishedAt);
const expected=[...ODD_ONE_OUT_NARRATION.map(x=>x.text),...PATTERN_NARRATION_STRINGS];
const required=[...new Set(expected)];assert.equal(required.length,103);assert.ok(required.every(text=>inventory.some(item=>item.text===text)));const needed=inventory.filter(item=>required.includes(item.text));
const clips=[];
for(const item of needed){
 assert.equal(getOfflineVoiceClip(item.text),item.path,item.text);
 const row=ledger.requests.find(x=>x.key===item.key);assert.equal(row.status,'saved');assert.equal(row.provider,'elevenlabs');
 const path='public'+item.path;const bytes=fs.readFileSync(path);const sha256=createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,row.sha256);
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',path],{encoding:'utf8'}));
 const durationSeconds=Number(probe.format.duration);assert.ok(durationSeconds>0);
 execFileSync('ffmpeg',['-v','error','-i',path,'-f','null','-'],{stdio:['ignore','ignore','pipe']});
 clips.push({key:item.key,path:item.path,bytes:bytes.length,durationSeconds,sha256});
}
const report={at:new Date().toISOString(),decoded:clips.length,invalid:0,requests:ledger.requests.length,failedWithoutRetry:ledger.requests.filter(x=>x.status==='failed-no-retry').length,automaticRetries:0,totalBytes:clips.reduce((sum,c)=>sum+c.bytes,0),scope:'Exact text manifest, complete decoding and positive duration; browser playback is verified separately. No claim of human listening review.',clips};
fs.writeFileSync(root+'/packaged-audio.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({decoded:report.decoded,totalBytes:report.totalBytes}));
