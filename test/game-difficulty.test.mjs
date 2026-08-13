import test from 'node:test';
import assert from 'node:assert/strict';
import {
  colourRoundIndexes,
  MULTIPLICATION_LIMITS,
  NUMBER_LINE_LIMITS,
  oddOneOutRoundIndexes,
  patternPoolForDifficulty,
} from '../src/data/gameDifficulty.js';
import { ADVANCED_PATTERN_ROUNDS, PATTERN_ROUNDS } from '../src/data/index.js';

test('math bands increase real number ranges', () => {
  assert.deepEqual(MULTIPLICATION_LIMITS.starter, [2, 3]);
  assert.ok(MULTIPLICATION_LIMITS.challenge[0] > MULTIPLICATION_LIMITS.growing[0]);
  assert.ok(NUMBER_LINE_LIMITS.starter < NUMBER_LINE_LIMITS.growing);
  assert.ok(NUMBER_LINE_LIMITS.growing < NUMBER_LINE_LIMITS.challenge);
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
