import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { COLOUR_LAB_NARRATION } from '../src/data/colourLabAdventure.js';
import { SOUND_SAFARI_NARRATION_INVENTORY,SOUND_SAFARI_PHONEME_AUDIO,SOUND_SAFARI_PHONEME_KEYS } from '../src/data/soundSafariAdventure.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
test('both finite lessons resolve all required narration to physical packaged clips',()=>{
 const lines=[...new Set([...COLOUR_LAB_NARRATION.map(i=>i.text),...SOUND_SAFARI_NARRATION_INVENTORY])];
 assert.equal(lines.length,73);
 for(const line of lines){const source=getOfflineVoiceClip(line);assert.ok(source,'Missing narration '+line);assert.ok(statSync('public'+source).size>1000,'Short narration '+line);}
});
test('the six sound controls reference distinct recorded phonemes, separate from letter-name narration',()=>{
 const hashes=new Set();
 for(const sound of SOUND_SAFARI_PHONEME_KEYS){const path=SOUND_SAFARI_PHONEME_AUDIO[sound];assert.match(path,/^\/audio\/phonemes\/en\//);assert.notEqual(path,getOfflineVoiceClip(sound));const bytes=readFileSync('public'+path);assert.ok(bytes.length>1000);hashes.add(createHash('sha256').update(bytes).digest('hex'));}
 assert.equal(hashes.size,6);
});
