import test from 'node:test';
import assert from 'node:assert/strict';
import { numberPatternPoolForDifficulty } from '../src/data/gameDifficulty.js';
import { SPOT_DIFFERENCE_ROUNDS, spotRoundForDifficulty } from '../src/data/spotDifference.js';

test('spot-the-difference bands have clear paired-scene targets', () => {
  assert.equal(spotRoundForDifficulty('starter').differences.length, 2);
  assert.equal(spotRoundForDifficulty('growing').differences.length, 3);
  assert.equal(spotRoundForDifficulty('challenge').differences.length, 4);
  for (const round of Object.values(SPOT_DIFFERENCE_ROUNDS)) {
    assert.ok(round.differences.every((difference) => difference.normalVisual && difference.visual));
    assert.ok(round.differences.every((difference) => difference.normalVisual !== difference.visual));
  }
});

test('number patterns scale by band and explain their rule', () => {
  const starter = numberPatternPoolForDifficulty('starter');
  const growing = numberPatternPoolForDifficulty('growing');
  const challenge = numberPatternPoolForDifficulty('challenge');
  assert.equal(starter.length, 3);
  assert.ok(growing.length > starter.length);
  assert.equal(challenge.length, 5);
  assert.ok([...starter, ...growing, ...challenge].every((round) => round.rule));
  assert.ok(challenge.some((round) => round.rule.includes('Double')));
});
