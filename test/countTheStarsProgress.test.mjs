import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNT_THE_STARS_EPISODES, countQuestionPool } from '../src/data/countTheStarsBatch3.js';
import { COUNT_STARS_PROGRESS_KEY, getCountTheStarsProgress, recordCountTheStarsCompletion, rememberCountTheStarsRun } from '../src/data/countTheStarsProgress.js';

const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};
const ids = (index) => countQuestionPool(index).slice(0, 6).map(({ id }) => id);

test('count progress is player scoped and Askia storage remains isolated', () => {
  const store = storage();
  assert.equal(COUNT_STARS_PROGRESS_KEY, 'amari_count_the_stars_batch3_v1');
  assert.equal(rememberCountTheStarsRun('child-a', 0, ids(0), store).unlockedEpisode, 0);
  assert.deepEqual(getCountTheStarsProgress('child-b', store).recentQuestionIds, {});
  assert.ok([...store.values.keys()].every((key) => !key.includes('askia_little_progress')));
});

test('count persistence rejects cross-band and locked IDs and strips orphan reward records', () => {
  const store = storage();
  assert.equal(rememberCountTheStarsRun('a', 1, ids(1), store), null);
  assert.equal(recordCountTheStarsCompletion('a', 1, 3, ids(1), store), null);
  assert.equal(recordCountTheStarsCompletion('a', 0, 3, ids(1), store), null);
  const first = recordCountTheStarsCompletion('a', 0, 3, ids(0), store);
  assert.equal(first.progress.unlockedEpisode, 1);
  assert.equal(recordCountTheStarsCompletion('a', 1, 2, ids(1), store).progress.unlockedEpisode, 2);
  const last = recordCountTheStarsCompletion('a', 2, 1, ids(2), store);
  assert.equal(last.progress.completedEpisodeIds.length, 3);
  assert.equal(last.progress.earnedConstellationPageIds.length, 3);
  const key = [...store.values.keys()][0];
  store.values.set(key, JSON.stringify({ version: 1, completedEpisodeIds: [], earnedConstellationPageIds: COUNT_THE_STARS_EPISODES.map(({ pageId }) => pageId), recentQuestionIds: { 0: ids(1), 1: ids(0) } }));
  const loaded = getCountTheStarsProgress('a', store);
  assert.deepEqual(loaded.earnedConstellationPageIds, []);
  assert.deepEqual(loaded.recentQuestionIds[0], []);
  assert.deepEqual(loaded.recentQuestionIds[1], []);
});
