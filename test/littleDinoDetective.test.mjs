import test from 'node:test';
import assert from 'node:assert/strict';
import { LITTLE_LEVELS, chooseLittleDinoRound } from '../src/data/littleGames.js';
import { DETECTIVE_HABITATS, DETECTIVE_ROSTER, detectiveFieldActivities, littleDinoAttribution, littleDinoCanAskForClearerTrail, littleDinoTrailStrength } from '../src/data/littleDinoDetective.js';

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


test('Detective tours all three habitats without repeating a creature in one level', () => {
  assert.equal(DETECTIVE_ROSTER.length, 12);
  assert.equal(new Set(DETECTIVE_ROSTER.map(({ id }) => id)).size, 12);
  for (const config of LITTLE_LEVELS.dino) {
    for (const seed of [1, 12, 21, 99]) {
      const finds = Array.from({ length: config.rounds }, (_, round) => {
        const { speciesIndex } = chooseLittleDinoRound(round, 1, config.spots, DETECTIVE_ROSTER.length, seed);
        return DETECTIVE_ROSTER[speciesIndex];
      });
      assert.equal(new Set(finds.map(({ id }) => id)).size, config.rounds);
      assert.deepEqual(new Set(finds.map(({ habitat }) => habitat)), new Set(Object.keys(DETECTIVE_HABITATS)));
    }
  }
});

test('each field activity has two distinct answers and alternates the answer position', () => {
  const ids = DETECTIVE_ROSTER.map(({ id }) => id);
  for (const spotCount of [2, 3]) {
    for (let start = 0; start < ids.length; start += 1) {
      const answerPositions = new Set();
      for (let round = 0; round < 5; round += 1) {
        const { tracks, counts, clue, pictures } = detectiveFieldActivities((round + start) % ids.length, round, spotCount);
        assert.ok(tracks >= 1 && tracks <= (spotCount === 2 ? 3 : 4));
        assert.equal(new Set(counts).size, 2);
        assert.ok(counts.includes(tracks));
        assert.equal(new Set(pictures).size, 2);
        assert.ok(pictures.every(id => ids.includes(id)));
        answerPositions.add(pictures.indexOf(clue.answer));
      }
      assert.deepEqual(answerPositions, new Set([0, 1]));
    }
  }
});
