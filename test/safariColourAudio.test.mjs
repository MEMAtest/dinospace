import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { COLOUR_LAB_NARRATION } from '../src/data/colourLabAdventure.js';
import { SOUND_SAFARI_NARRATION_INVENTORY,SOUND_SAFARI_PHONEME_AUDIO,SOUND_SAFARI_PHONEME_KEYS,getSoundSafariVoiceClip } from '../src/data/soundSafariAdventure.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';
test('both finite lessons resolve all required narration to physical packaged clips',()=>{
 const lines=[...new Set([...COLOUR_LAB_NARRATION.map(i=>i.text),...SOUND_SAFARI_NARRATION_INVENTORY])];
 assert.equal(lines.length,73);
 for(const item of COLOUR_LAB_NARRATION){const source=getOfflineVoiceClip(item.text);assert.ok(source,'Missing colour narration '+item.text);assert.ok(statSync('public'+source).size>1000,'Short colour narration '+item.text);}
 const safariSources = new Set();
 for(const line of SOUND_SAFARI_NARRATION_INVENTORY){const source=getSoundSafariVoiceClip(line);assert.match(source,/^\/audio\/sound-safari\/daniel\//);assert.ok(statSync('public'+source).size>1000,'Missing or short Safari narration '+line);safariSources.add(source);}
 assert.equal(safariSources.size,19);assert.equal(getSoundSafariVoiceClip('unapproved phrase'),null);
});
test('the six sound controls reference distinct recorded phonemes, separate from letter-name narration',()=>{
 const hashes=new Set();
 for(const sound of SOUND_SAFARI_PHONEME_KEYS){const path=SOUND_SAFARI_PHONEME_AUDIO[sound];assert.match(path,/^\/audio\/phonemes\/en\//);assert.notEqual(path,getOfflineVoiceClip(sound));const bytes=readFileSync('public'+path);assert.ok(bytes.length>1000);hashes.add(createHash('sha256').update(bytes).digest('hex'));}
 assert.equal(hashes.size,6);
});
