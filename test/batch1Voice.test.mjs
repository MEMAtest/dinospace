import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { LETTER_LAUNCH_PROMPT_CORPUS } from '../src/data/letterLaunch.js';
import { STORYBOOK_LEARNING_VOICE_CORPUS } from '../src/data/storybookLearning.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('all new literacy replay controls have packaged nonempty narration', () => {
  const lines = [...LETTER_LAUNCH_PROMPT_CORPUS, ...STORYBOOK_LEARNING_VOICE_CORPUS.map(({ text }) => text),
    'Use the outlines and position of each land shape on the world map. Which one is the clue asking for?',
    'Look at where the ocean sits around the continents, then try again.',
    'A country is a place inside a continent. Look at where it sits on the world map, then try again.',
  ];
  for (const text of lines) {
    const clip = getOfflineVoiceClip(text);
    assert.ok(clip, `Missing packaged clip: ${text}`);
    assert.ok(statSync(`public${clip}`).size > 1000, `Empty packaged clip: ${text}`);
  }
});
