import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';
import {ODD_ONE_OUT_NARRATION} from '../src/data/oddOneOutAdventure.js';
import {PATTERN_NARRATION_STRINGS} from '../src/data/patternAdventure.js';
import {getOfflineVoiceClip} from '../src/data/offlineVoice.js';

test('every sorting and pattern prompt, clue and explanation has a physical packaged Matilda clip', () => {
  const texts=new Set([...ODD_ONE_OUT_NARRATION.map(({text})=>text),...PATTERN_NARRATION_STRINGS]);
  assert.equal(texts.size,103);
  for(const text of texts){
    const path=getOfflineVoiceClip(text);
    assert.match(path||'',/^\/audio\/en\/[a-f0-9]{8}-matilda\.mp3$/,text);
    assert.ok(statSync(new URL('../public'+path,import.meta.url)).size>1000,text);
  }
});
