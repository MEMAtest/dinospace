import assert from 'node:assert/strict';
import test from 'node:test';
import { createMonsterMathRun, MONSTER_MATH_EPISODES } from '../src/data/monsterMathEpisodes.js';
import {
  getMonsterMathPendingRewardReceiptsStrict,
  getMonsterMathProgressStrict,
  markMonsterMathRewardReceiptClaimedStrict,
  MONSTER_MATH_PROGRESS_KEY,
  recordMonsterEpisodeCompletionStrict,
  rememberMonsterMathRunStrict,
} from '../src/data/monsterMathProgress.js';

const storageKey = (playerId) => `${playerId}_${MONSTER_MATH_PROGRESS_KEY}`;
const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    raw: (key) => values.get(key),
  };
};
const runIds = (episodeIndex = 0, seed = 1) => createMonsterMathRun({ episodeIndex, seed }).map(({ id }) => id);

test('strict progress treats only null as fresh and preserves corrupt/unavailable bytes', () => {
  const malformed = memoryStorage({ [storageKey('amari')]: '{broken' });
  assert.deepEqual(getMonsterMathProgressStrict('amari', memoryStorage()).progress.completedEpisodeIds, []);
  assert.equal(getMonsterMathProgressStrict('amari', malformed).error, 'invalid');
  assert.equal(rememberMonsterMathRunStrict('amari', 0, runIds(), malformed).ok, false);
  assert.equal(malformed.raw(storageKey('amari')), '{broken');
  assert.equal(getMonsterMathProgressStrict('amari', { getItem: () => { throw Error('blocked'); } }).error, 'unavailable');
});

test('strict writes preserve unknown metadata and isolate player-prefixed records', () => {
  const storage = memoryStorage({
    [storageKey('amari')]: JSON.stringify({ version: 1, familyNote: { keep: true }, unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, recentQuestionIds: {}, rewardReceipts: {} }),
    [storageKey('askia')]: JSON.stringify({ version: 1, note: 'sibling', unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, recentQuestionIds: {}, rewardReceipts: {} }),
  });
  const result = rememberMonsterMathRunStrict('amari', 0, runIds(), storage);
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(storage.raw(storageKey('amari'))).familyNote, { keep: true });
  assert.equal(JSON.parse(storage.raw(storageKey('askia'))).note, 'sibling');
  assert.deepEqual(getMonsterMathProgressStrict('amari', storage).progress.recentQuestionIds[0], runIds().slice(-8));
});

test('strict completion atomically saves completion, best rating, and a stable positive receipt', () => {
  const storage = memoryStorage();
  const ids = runIds(0, 21);
  const first = recordMonsterEpisodeCompletionStrict('amari', 0, 2, ids, storage);
  assert.equal(first.ok, true);
  assert.equal(first.awardedStars, 2);
  assert.deepEqual(first.receipt, { id: `${MONSTER_MATH_EPISODES[0].id}:best:2`, episodeId: MONSTER_MATH_EPISODES[0].id, bestStars: 2, rewardDelta: 2, claimed: false });
  assert.equal(first.progress.completedEpisodeIds.includes(MONSTER_MATH_EPISODES[0].id), true);
  assert.equal(first.progress.unlockedEpisode, 1);
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', storage).receipts, [first.receipt]);

  const retry = recordMonsterEpisodeCompletionStrict('amari', 0, 2, ids, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.awardedStars, 0);
  assert.deepEqual(retry.receipt, first.receipt);
  assert.equal(markMonsterMathRewardReceiptClaimedStrict('amari', first.receipt.id, storage).ok, true);
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', storage).receipts, []);
  assert.equal(recordMonsterEpisodeCompletionStrict('amari', 0, 2, ids, storage).receipt, null);

  const improved = recordMonsterEpisodeCompletionStrict('amari', 0, 3, runIds(0, 22), storage);
  assert.equal(improved.awardedStars, 1);
  assert.equal(improved.receipt.id, `${MONSTER_MATH_EPISODES[0].id}:best:3`);
  assert.equal(improved.receipt.rewardDelta, 1);
  assert.equal(recordMonsterEpisodeCompletionStrict('amari', 0, 1, ids, storage).awardedStars, 0);
});

test('legacy-completed episode with unknown prior best seeds a baseline without backpay', () => {
  const episodeId = MONSTER_MATH_EPISODES[0].id;
  const storage = memoryStorage({ [storageKey('amari')]: JSON.stringify({ version: 1, unlockedEpisode: 1, completedEpisodeIds: [episodeId], bestStars: {}, recentQuestionIds: {}, legacy: 'keep' }) });
  const result = recordMonsterEpisodeCompletionStrict('amari', 0, 3, runIds(), storage);
  assert.equal(result.ok, true);
  assert.equal(result.awardedStars, 0);
  assert.equal(result.receipt, null);
  assert.equal(result.progress.bestStars[episodeId], 3);
  assert.equal(result.progress.legacy, 'keep');
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', storage).receipts, []);
});

test('invalid run, locked episode, and mismatched write readback cannot confirm completion', () => {
  const storage = memoryStorage();
  assert.equal(recordMonsterEpisodeCompletionStrict('amari', 1, 3, runIds(1), storage).error, 'locked');
  assert.equal(recordMonsterEpisodeCompletionStrict('amari', 0, 3, [...runIds().slice(1), runIds()[1]], storage).error, 'invalid');
  const badReadback = {
    getItem: () => null,
    setItem: () => {},
  };
  assert.equal(recordMonsterEpisodeCompletionStrict('amari', 0, 3, runIds(), badReadback).error, 'readback');
});

test('a committed write followed by an exception is accepted only when exact readback succeeds', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); throw Error('interrupted after commit'); },
  };
  const saved = recordMonsterEpisodeCompletionStrict('amari', 0, 1, runIds(), storage);
  assert.equal(saved.ok, true);
  assert.equal(saved.receipt.rewardDelta, 1);
});

test('unconfirmed local claim marker stays pending and can be recovered without changing its transaction', () => {
  const normal = memoryStorage();
  const completed = recordMonsterEpisodeCompletionStrict('amari', 0, 2, runIds(), normal);
  const rawBeforeMarker = normal.raw(storageKey('amari'));
  const failedMarker = {
    getItem: (key) => key === storageKey('amari') ? rawBeforeMarker : null,
    setItem: () => { throw Error('blocked'); },
  };
  assert.equal(markMonsterMathRewardReceiptClaimedStrict('amari', completed.receipt.id, failedMarker).ok, false);
  assert.equal(failedMarker.getItem(storageKey('amari')), rawBeforeMarker);
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', normal).receipts, [completed.receipt]);
  assert.equal(markMonsterMathRewardReceiptClaimedStrict('amari', completed.receipt.id, normal).ok, true);
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', normal).receipts, []);
});

test('pending receipts from multiple completed episodes remain individually recoverable', () => {
  const storage = memoryStorage();
  const first = recordMonsterEpisodeCompletionStrict('amari', 0, 1, runIds(0, 31), storage);
  assert.equal(first.ok, true);
  const second = recordMonsterEpisodeCompletionStrict('amari', 1, 2, runIds(1, 32), storage);
  assert.equal(second.ok, true);
  assert.deepEqual(getMonsterMathPendingRewardReceiptsStrict('amari', storage).receipts.map(({ id }) => id), [first.receipt.id, second.receipt.id]);
});
