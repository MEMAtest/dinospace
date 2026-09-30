import assert from 'node:assert/strict';
import test from 'node:test';
import { STORYBOOK_COMPREHENSION, STORYBOOK_LEARNING_VOICE_CORPUS, STORYBOOK_WORD_HELP, shuffledComprehension } from '../src/data/storybookLearning.js';

test('each shipped story has a three-step comprehension path and word help', () => {
  for (const slug of ['rex-missing-moon-map', 'luna-whispering-forest', 'nia-great-river-journey']) {
    assert.equal(STORYBOOK_COMPREHENSION[slug].length, 3);
    assert.ok(STORYBOOK_WORD_HELP[slug].length >= 3);
    for (const question of STORYBOOK_COMPREHENSION[slug]) {
      assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1);
      assert.ok(question.why && question.clue);
    }
  }
});

test('comprehension choices shuffle while retaining one correct answer', () => {
  const first = shuffledComprehension('rex-missing-moon-map', () => 0);
  const second = shuffledComprehension('rex-missing-moon-map', () => 0.99);
  assert.notDeepEqual(first[0].choices, second[0].choices);
  assert.notDeepEqual(first.map((question) => question.prompt), second.map((question) => question.prompt));
  for (const question of [...first, ...second]) assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1);
});

test('fixed Storybook replay text is exported for offline voice packaging', () => {
  const corpus = new Set(STORYBOOK_LEARNING_VOICE_CORPUS.map(({ text }) => text));
  for (const questions of Object.values(STORYBOOK_COMPREHENSION)) {
    for (const question of questions) {
      for (const text of [question.prompt, ...question.choices, question.clue, question.why]) assert.ok(corpus.has(text), `Missing voice line: ${text}`);
    }
  }
  for (const words of Object.values(STORYBOOK_WORD_HELP)) {
    for (const [, meaning] of words) assert.ok(corpus.has(meaning), `Missing voice line: ${meaning}`);
  }
  assert.equal(new Set(STORYBOOK_LEARNING_VOICE_CORPUS.map(({ key }) => key)).size, STORYBOOK_LEARNING_VOICE_CORPUS.length);
});
