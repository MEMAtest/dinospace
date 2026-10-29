import test from 'node:test';
import assert from 'node:assert/strict';
import { LITTLE_LEVELS, chooseLittleDinoRound } from '../src/data/littleGames.js';
import { littleDinoAttribution, littleDinoCanAskForClearerTrail, littleDinoTrailStrength } from '../src/data/littleDinoDetective.js';

test('Askia Detective keeps its five authored levels and stable varied rounds', () => {
  const configs = LITTLE_LEVELS.dino;
  assert.deepEqual(configs.map(({ rounds }) => rounds), [5, 5, 6, 6, 7]);
  assert.deepEqual(configs.map(({ spots }) => spots), [2, 3, 3, 3, 3]);
  assert.deepEqual(configs.map(({ trail }) => trail), ['bright', 'bright', 'marks', 'short', 'faint-short']);
  for (const [levelIndex, config] of configs.entries()) {
    const first = Array.from({ length: config.rounds }, (_, round) => chooseLittleDinoRound(round, 0, config.spots, 6, 9271));
    const repeat = Array.from({ length: config.rounds }, (_, round) => chooseLittleDinoRound(round, 0, config.spots, 6, 9271));
    assert.deepEqual(first, repeat, `level ${levelIndex + 1} stays frozen for the same run`);
    assert.ok(first.every((choice) => choice.targetIndex >= 0 && choice.targetIndex < config.spots));
    assert.ok(first.every((choice, round) => round === 0 || choice.targetIndex !== first[round - 1].targetIndex));
    assert.ok(new Set(first.slice(0, Math.min(config.rounds, 6)).map(({ speciesIndex }) => speciesIndex)).size >= Math.min(config.rounds, 6));
  }
  const runA = Array.from({ length: configs[4].rounds }, (_, round) => chooseLittleDinoRound(round, 0, configs[4].spots, 6, 9271));
  const replay = Array.from({ length: configs[4].rounds }, (_, round) => chooseLittleDinoRound(round, 1, configs[4].spots, 6, 9271));
  assert.notDeepEqual(replay, runA, 'a normal replay varies at least one hidden choice');
});

test('required footprint trail is baseline; only the optional clearer trail counts as assistance', () => {
  const starter = LITTLE_LEVELS.dino[0];
  const growing = LITTLE_LEVELS.dino[2];
  const challenge = LITTLE_LEVELS.dino[4];
  assert.equal(littleDinoCanAskForClearerTrail(starter), false);
  assert.equal(littleDinoTrailStrength(starter), 'bright');
  assert.equal(littleDinoCanAskForClearerTrail(growing), true);
  assert.equal(littleDinoTrailStrength(growing), 'marks');
  assert.equal(littleDinoTrailStrength(growing, true), 'bright');
  assert.equal(littleDinoTrailStrength(challenge), 'faint-short');
  assert.equal(littleDinoTrailStrength(challenge, true), 'bright');
  assert.equal(littleDinoCanAskForClearerTrail(challenge, true), false);
  assert.deepEqual(littleDinoAttribution(), { firstAttempt: true, independent: true, hints: 0 });
  assert.deepEqual(littleDinoAttribution({ optionalClues: 1 }), { firstAttempt: true, independent: false, hints: 1 });
  assert.deepEqual(littleDinoAttribution({ wrongAttempts: 1 }), { firstAttempt: false, independent: false, hints: 0 });
  assert.deepEqual(littleDinoAttribution({ wrongAttempts: 2, optionalClues: 1 }), { firstAttempt: false, independent: false, hints: 1 });
});
