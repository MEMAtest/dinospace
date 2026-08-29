import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStoryOutline,
  validateStoryRequest,
  wordCount,
} from '../src/data/storybookValidation.js';

const pageText = (count) => Array.from({ length: count }, (_, index) => `Word${index + 1}`).join(' ');

const outline = (ageBand = '5-6') => ({
  title: 'A Small Adventure',
  summary: 'A gentle story about friends solving a problem together.',
  characters: [{ name: 'Mia', visualDescription: 'A cheerful child explorer with a yellow satchel.' }],
  pages: Array.from({ length: 10 }, (_, index) => ({
    pageNumber: index + 1,
    text: pageText(ageBand === '3-4' ? 12 : ageBand === '7-8' ? 35 : 20),
    imagePrompt: 'A bright, child-friendly scene with the recurring character fully visible.',
  })),
});

test('storybook requests only permit the supported age bands and styles', () => {
  assert.deepEqual(validateStoryRequest({ topic: 'A friendly moon trip', ageBand: '5-6', style: '3d' }), {
    topic: 'A friendly moon trip', ageBand: '5-6', style: '3d',
  });
  assert.throws(() => validateStoryRequest({ topic: 'x', ageBand: '2-3', style: '3d' }), /Age band/);
  assert.throws(() => validateStoryRequest({ topic: 'x', ageBand: '5-6', style: 'photoreal' }), /Visual style/);
  assert.throws(() => validateStoryRequest({ topic: 'x'.repeat(501), ageBand: '5-6', style: '3d' }), /Topic/);
});

test('outline validation enforces ten pages and age-appropriate word ranges', () => {
  assert.equal(wordCount(pageText(20)), 20);
  assert.deepEqual(validateStoryOutline(outline()), outline());
  assert.throws(() => validateStoryOutline({ ...outline(), pages: outline().pages.slice(0, 9) }), /exactly 10/);
  const tooShort = outline();
  tooShort.pages[0].text = pageText(19);
  assert.throws(() => validateStoryOutline(tooShort), /Page 1 must contain 20-40/);
  assert.doesNotThrow(() => validateStoryOutline(outline('3-4'), { ageBand: '3-4' }));
  assert.doesNotThrow(() => validateStoryOutline(outline('7-8'), { ageBand: '7-8' }));
});
