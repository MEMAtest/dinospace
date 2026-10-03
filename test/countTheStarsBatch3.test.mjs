import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNT_THE_STARS_EPISODES, buildCountObjects, countCentersAreSafe,
  countQuestionPool, createCountTheStarsRun,
} from '../src/data/countTheStarsBatch3.js';

test('count episodes provide six stable unique questions and safe visible object sets', () => {
  for (let episode = 0; episode < COUNT_THE_STARS_EPISODES.length; episode += 1) {
    const first = createCountTheStarsRun(episode, 2718);
    const second = createCountTheStarsRun(episode, 2718);
    assert.deepEqual(first.rounds.map(({ id }) => id), second.rounds.map(({ id }) => id));
    assert.equal(new Set(first.rounds.map(({ id }) => id)).size, 6);
    for (const round of first.rounds) {
      assert.equal(round.objects.length, round.count);
      assert.equal(new Set(round.options).size, 4);
      assert.ok(round.options.includes(round.count));
      assert.ok(countCentersAreSafe(round.objects));
      assert.deepEqual(round.objects, buildCountObjects(round.count, 2718, round.id));
    }
  }
});

test('count question pools support an eight-question recent window without cross-episode IDs', () => {
  const pools = COUNT_THE_STARS_EPISODES.map((_, index) => new Set(countQuestionPool(index).map(({ id }) => id)));
  assert.ok(pools.every((pool) => pool.size >= 8));
  pools.forEach((pool, index) => pools.forEach((other, otherIndex) => {
    if (index !== otherIndex) assert.equal([...pool].some((id) => other.has(id)), false);
  }));
  const run = createCountTheStarsRun(1, 19, [...pools[1]].slice(0, 8));
  assert.ok(run.rounds.every(({ id }) => pools[1].has(id)));
});
