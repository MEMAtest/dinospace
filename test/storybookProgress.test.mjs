import test from 'node:test';
import assert from 'node:assert/strict';
import { isStoryGenerationStepComplete } from '../src/data/storybookProgress.js';

test('cover narration does not claim illustrations or narration are complete', () => {
  const progress = { stage: 'narration', currentPage: 0, pageCount: 6, imagesReady: 1, audioReady: 1 };
  assert.equal(isStoryGenerationStepComplete('planning', progress), true);
  assert.equal(isStoryGenerationStepComplete('cover', progress), true);
  assert.equal(isStoryGenerationStepComplete('image', progress), false);
  assert.equal(isStoryGenerationStepComplete('narration', progress), false);
});

test('saved asset counts complete their own checklist steps independent of coarse stage', () => {
  const imagesFinished = { stage: 'narration', pageCount: 6, imagesReady: 7, audioReady: 3 };
  assert.equal(isStoryGenerationStepComplete('image', imagesFinished), true);
  assert.equal(isStoryGenerationStepComplete('narration', imagesFinished), false);
  assert.equal(isStoryGenerationStepComplete('narration', { ...imagesFinished, audioReady: 7 }), true);
});

test('outline-only state leaves asset steps visibly incomplete', () => {
  const progress = { stage: 'planning', pageCount: 10, title: 'A New Adventure', imagesReady: 0, audioReady: 0 };
  assert.equal(isStoryGenerationStepComplete('planning', progress), true);
  assert.equal(isStoryGenerationStepComplete('cover', progress), false);
  assert.equal(isStoryGenerationStepComplete('image', progress), false);
  assert.equal(isStoryGenerationStepComplete('narration', progress), false);
});
