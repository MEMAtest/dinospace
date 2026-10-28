import test from 'node:test';
import assert from 'node:assert/strict';
import { LITTLE_LEVELS } from '../src/data/littleGames.js';
import { buildFuelTargetOrder } from '../src/components/little/games/fuelUpLogic.js';
import { commitPairLittleResult, pairLittleProgressKey, readPairLittleProgress } from '../src/data/pairLittleProgress.js';

test('Fuel Up targets stay stable within a play and cover every target before the next round', () => {
  for (const [levelIndex, config] of LITTLE_LEVELS.fuelup.entries()) {
    const first = buildFuelTargetOrder(config.numbers, config.rounds, 4, 9182);
    const replayRead = buildFuelTargetOrder(config.numbers, config.rounds, 4, 9182);
    assert.deepEqual(first, replayRead, `level ${levelIndex + 1} is stable for the mounted play`);
    assert.equal(first.length, config.rounds, `level ${levelIndex + 1} has the configured number of targets`);
    assert.equal(new Set(first).size, Math.min(config.rounds, config.numbers.length), `level ${levelIndex + 1} uses every distinct target before repeating`);
    assert.ok(first.every((target) => config.numbers.includes(target)), `level ${levelIndex + 1} uses only authored target values`);
  }
});

test('Fuel Up level five omits a different target on each of six consecutive play ids', () => {
  const { numbers, rounds } = LITTLE_LEVELS.fuelup[4];
  const omitted = Array.from({ length: numbers.length }, (_, playId) => {
    const order = buildFuelTargetOrder(numbers, rounds, playId, 83);
    assert.equal(order.length, rounds);
    return numbers.find((number) => !order.includes(number));
  });
  assert.equal(new Set(omitted).size, numbers.length);
  assert.deepEqual(new Set(omitted), new Set(numbers));
});

test('a normally saved Level 5 play rotates the next visit to a different omitted target', () => {
  const values = new Map([[pairLittleProgressKey('askia'), JSON.stringify({ fuelup: { level: 4, plays: 0, best: 3 } })]]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  const { numbers, rounds } = LITTLE_LEVELS.fuelup[4];
  const first = readPairLittleProgress('askia', 'fuelup', false, storage);
  const firstOrder = buildFuelTargetOrder(numbers, rounds, first.gameRecord.plays, 91);
  const firstOmitted = numbers.find((number) => !firstOrder.includes(number));

  const saved = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 4, playedLevel: 4,
    transactionId: 'normal-level-five-replay', storage,
  });
  assert.equal(saved.ok, true);
  const reopened = readPairLittleProgress('askia', 'fuelup', false, storage);
  const nextOrder = buildFuelTargetOrder(numbers, rounds, reopened.gameRecord.plays, 91);
  const nextOmitted = numbers.find((number) => !nextOrder.includes(number));
  assert.notEqual(nextOmitted, firstOmitted);
});

test('Fuel Up target helper bounds round counts and tolerates missing target data', () => {
  assert.deepEqual(buildFuelTargetOrder([1, 2], 8, 0, 0), buildFuelTargetOrder([1, 2], 8, 0, 0));
  assert.equal(buildFuelTargetOrder([1, 2], 8, 0, 0).length, 8);
  assert.deepEqual(buildFuelTargetOrder([1, 2], 0, 0, 0), []);
  assert.deepEqual(buildFuelTargetOrder([], 5, 0, 0), []);
});
