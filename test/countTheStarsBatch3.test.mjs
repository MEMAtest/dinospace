import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNT_THE_STARS_EPISODES, buildCountObjects, countCentersAreSafe,
  countQuestionPool, createCountTheStarsRun,
} from '../src/data/countTheStarsBatch3.js';

test('each harder count survey reliably teaches its new range and organised grouping', () => {
  for (const level of [1, 2]) {
    const threshold = level === 1 ? 5 : 10;
    let recent = [];
    for (const seed of [36, 109, 171, 2577, 8177, ...Array.from({ length: 200 }, (_, index) => index + 1)]) {
      const run = createCountTheStarsRun(level, seed, recent);
      assert.equal(run.rounds.length, 6);
      assert.equal(new Set(run.rounds.map(({ id }) => id)).size, 6);
      assert.ok(run.rounds.filter(({ count }) => count > threshold).length >= 3);
      assert.ok(run.rounds.filter(({ count, layoutVariant }) => count > threshold && layoutVariant === 'grouped').length >= 2);
      assert.ok(run.rounds.some(({ count }) => count <= threshold), 'retain a review quantity');
      assert.ok(run.rounds.every(({ id }) => !recent.includes(id)), 'avoid recent question identities');
      assert.ok(new Set(run.rounds.map(({ count }) => count)).size >= 4, 'vary quantities within a run');
      recent = [...recent, ...run.rounds.map(({ id }) => id)].slice(-8);
    }
  }
});

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
      assert.deepEqual(round.objects, buildCountObjects(round.count, 2718, round.id, round.layoutVariant));
    }
  }
});

test('scene motifs and one-use layout modes provide distinct countable arrangements', () => {
  const motifs = COUNT_THE_STARS_EPISODES.flatMap(({ scenes }) => scenes.map(({ motif }) => motif));
  assert.equal(motifs.length, 15);
  assert.equal(new Set(motifs).size, 15);
  for (const count of Array.from({ length: 20 }, (_, index) => index + 1)) {
    const scattered = buildCountObjects(count, 22, `same-${count}`, 'orbit');
    const organized = buildCountObjects(count, 22, `same-${count}`, 'grouped');
    assert.ok(countCentersAreSafe(scattered, 330, 330, 56));
    assert.ok(countCentersAreSafe(organized, 330, 330, 56));
    if (count > 1) assert.notDeepEqual(scattered.map(({ x, y }) => [x, y]).sort(), organized.map(({ x, y }) => [x, y]).sort());
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
