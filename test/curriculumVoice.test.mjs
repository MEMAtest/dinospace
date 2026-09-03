import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  CURRICULUM_VOICE_TEXTS,
  getCurriculumVoiceClip,
  getMissingCurriculumVoiceAssets,
  getMissingCurriculumVoiceTexts,
} from '../src/data/curriculumVoice.js';
import { CURRICULUM_MODULES } from '../src/data/curriculumModules.js';

test('Curriculum Quest voice text is generated from the module registry', () => {
  assert.ok(CURRICULUM_VOICE_TEXTS.length > 0);
  assert.equal(new Set(CURRICULUM_VOICE_TEXTS).size, CURRICULUM_VOICE_TEXTS.length);
  assert.equal(getMissingCurriculumVoiceTexts().filter((text) => !CURRICULUM_VOICE_TEXTS.includes(text)).length, 0);
  getMissingCurriculumVoiceAssets().forEach(({ key, path, text }) => {
    assert.match(key, /^[a-f0-9]{8}$/);
    assert.equal(path, `/audio/en/${key}-matilda.mp3`);
    assert.ok(text);
  });
});

test('every interactive answer label is included in the narration corpus', () => {
  const voiceText = new Set(CURRICULUM_VOICE_TEXTS);
  CURRICULUM_MODULES.forEach((module) => Object.values(module.rounds).flat().forEach((round) => {
    [...(round.options || []), ...(round.items || []), ...(round.predictions || [])]
      .forEach((item) => assert.ok(voiceText.has(item.label), `Missing answer narration text: ${module.id}/${round.id}/${item.label}`));
  }));
});

test('Curriculum Quest audio controls only resolve existing manifest clips', () => {
  CURRICULUM_VOICE_TEXTS.forEach((text) => {
    const clip = getCurriculumVoiceClip(text);
    if (clip) assert.equal(existsSync(`public${clip}`), true, `Missing packaged clip for: ${text}`);
  });
});

test('Curriculum Quest ships every required narration clip for offline use', () => {
  assert.deepEqual(getMissingCurriculumVoiceTexts(), []);
  assert.deepEqual(getMissingCurriculumVoiceAssets(), []);
});
