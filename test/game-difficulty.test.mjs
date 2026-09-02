import test from 'node:test';
import assert from 'node:assert/strict';
import {
  colourRoundIndexes,
  MULTIPLICATION_FACTS_BY_DIFFICULTY,
  MULTIPLICATION_LIMITS,
  NUMBER_LINE_LIMITS,
  oddOneOutRoundIndexes,
  patternPoolForDifficulty,
  TABLE_PRACTICE_FACTORS,
  TABLE_PRACTICE_TABLES,
} from '../src/data/gameDifficulty.js';
import { ADVANCED_PATTERN_ROUNDS, MEMORY_LEVELS, PATTERN_ROUNDS } from '../src/data/index.js';
import { getOfflineVoiceClip } from '../src/data/offlineVoice.js';

test('math bands increase real number ranges', () => {
  assert.deepEqual(MULTIPLICATION_LIMITS.starter, [2, 3]);
  assert.ok(MULTIPLICATION_LIMITS.challenge[0] > MULTIPLICATION_LIMITS.growing[0]);
  assert.ok(NUMBER_LINE_LIMITS.starter < NUMBER_LINE_LIMITS.growing);
  assert.ok(NUMBER_LINE_LIMITS.growing < NUMBER_LINE_LIMITS.challenge);
});

test('multiplication questions stay inside the packaged narration set', () => {
  assert.deepEqual(TABLE_PRACTICE_TABLES, [2, 3, 4, 5]);
  assert.deepEqual(TABLE_PRACTICE_FACTORS, [2, 3, 4]);
  for (const facts of Object.values(MULTIPLICATION_FACTS_BY_DIFFICULTY)) {
    for (const fact of facts) {
      assert.ok(getOfflineVoiceClip(`${fact.a} times ${fact.b} equals ${fact.ans}.`));
      assert.ok(getOfflineVoiceClip(`${fact.a} groups of ${fact.b}. Let us jump and count to ${fact.ans}.`));
    }
  }
});

test('thinking bands select progressively harder content', () => {
  assert.equal(patternPoolForDifficulty('starter'), PATTERN_ROUNDS);
  assert.equal(patternPoolForDifficulty('challenge'), ADVANCED_PATTERN_ROUNDS);
  assert.deepEqual(oddOneOutRoundIndexes('starter'), [0, 1, 2, 3]);
  assert.deepEqual(oddOneOutRoundIndexes('challenge'), [8, 9, 10, 11]);
});

test('colour mixing challenge removes primary-only rounds', () => {
  assert.deepEqual(colourRoundIndexes('starter'), [0, 1, 2]);
  assert.deepEqual(colourRoundIndexes('challenge'), [3, 4, 5, 6]);
});

test('memory starter is a manageable four-pair board', () => {
  assert.equal(MEMORY_LEVELS[0].id, 'forest');
  assert.equal(MEMORY_LEVELS[0].emojis.length, 4);
  assert.equal(MEMORY_LEVELS[0].emojis.length * 2, 8);
});
