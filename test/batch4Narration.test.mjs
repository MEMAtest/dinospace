import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBatch4VoiceInventory } from '../scripts/batch4NarrationInventory.mjs';
import { arithmeticBatch4NarrationSegments, numberLineNarrationSegments, numberLineNarrationText, timeNarrationSegments } from '../src/data/batch4Narration.js';
import { getCanonicalArithmeticQuestionPool, createAdditionRun, createSubtractionRun } from '../src/data/arithmeticAdventure.js';
import { getCanonicalTimeQuestionPool, createTimeRun, createNumberLineRun } from '../src/data/timeLineAdventure.js';

const assertPhraseSequence = (segments, source, label) => {
  assert.ok(segments.length, `${label} has a phrase sequence`);
  assert.equal(segments.join(' '), source, `${label} joins exactly`);
  assert.ok(segments.every((part) => part.trim().split(/\s+/).length >= 2), `${label} chunks are phrase-sized`);
};

test('runtime arithmetic helper covers canonical questions without eager whole-pool maps', () => {
  let count = 0;
  for (const game of ['addition', 'subtraction']) for (let chapter = 0; chapter < 3; chapter += 1) {
    for (const q of getCanonicalArithmeticQuestionPool(game, chapter)) {
      count += 1;
      for (const field of ['prompt', 'clue', 'explanation']) assertPhraseSequence(arithmeticBatch4NarrationSegments(game, q, field), q[field], `${game}/${field}`);
    }
  }
  assert.equal(count, 18096);
});

test('runtime time and number-line helpers cover seeded questions with exact phrase joins', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    for (const q of getCanonicalTimeQuestionPool(chapter)) for (const field of ['prompt', 'clue', 'explanation']) assertPhraseSequence(timeNarrationSegments(q, field), q[field], `time/${field}`);
    for (const q of createTimeRun({ chapter, seed: 70 + chapter })) for (const field of ['prompt', 'clue', 'explanation']) assertPhraseSequence(timeNarrationSegments(q, field), q[field], `time run/${field}`);
    for (const q of createNumberLineRun({ chapter, seed: 190 + chapter })) {
      const prompt = numberLineNarrationText(q);
      assertPhraseSequence(numberLineNarrationSegments(q), prompt, `${q.type}/prompt`);
      for (const field of ['clue', 'explanation']) assertPhraseSequence(numberLineNarrationSegments(q, field), q[field], `${q.type}/${field}`);
    }
    for (const q of createAdditionRun({ chapter, seed: 27 + chapter })) for (const field of ['prompt', 'clue', 'explanation']) assertPhraseSequence(arithmeticBatch4NarrationSegments('addition', q, field), q[field], `addition run/${field}`);
    for (const q of createSubtractionRun({ chapter, seed: 41 + chapter })) for (const field of ['prompt', 'clue', 'explanation']) assertPhraseSequence(arithmeticBatch4NarrationSegments('subtraction', q, field), q[field], `subtraction run/${field}`);
  }
});

test('offline inventory exhaustively deduplicates finite phrases and keeps coverage outside runtime module', () => {
  const { coverage, corpusByGame, items } = buildBatch4VoiceInventory();
  assert.deepEqual(coverage, { arithmeticQuestions: 18096, timeQuestions: 120, numberLineQuestions: 88940, timeChapters: 3, numberLineChapters: 3 });
  assert.equal(new Set(items.map(({ text }) => text)).size, items.length);
  assert.ok(items.every(({ text, key, path }) => text.trim().split(/\s+/).length >= 2 && key && path === `/audio/en/${key}-matilda.mp3`));
  assert.ok(Object.values(corpusByGame).every((lines) => lines.length > 0));
});
