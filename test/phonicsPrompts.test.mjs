import test from 'node:test';
import assert from 'node:assert/strict';
import { PHONICS_ITEMS } from '../src/data/index.js';
import { FIRST_SOUND_EXAMPLES, firstSoundPrompt } from '../src/data/phonicsPrompts.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('first-sound audio models a different word from every answer picture', () => {
  for (const item of PHONICS_ITEMS.filter(({ letter }) => letter !== 'X')) {
    const example = FIRST_SOUND_EXAMPLES[item.sound];
    assert.ok(example, `Missing example for ${item.sound}`);
    assert.notEqual(example, item.word.toLowerCase());
    const prompt = firstSoundPrompt(item.sound);
    assert.ok(prompt.includes(example));
    assert.ok(getOfflineVoiceClip(prompt), `Missing offline audio for ${prompt}`);
  }
  assert.equal(FIRST_SOUND_EXAMPLES.x, undefined);
  assert.ok(getOfflineVoiceClip('The short red hand shows the hour. The long blue hand shows the minutes.'));
});
