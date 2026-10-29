import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNT_THE_STARS_EPISODES, countQuestionPool } from '../src/data/countTheStarsBatch3.js';
import {
  COUNT_STARS_PROGRESS_KEY, getCountTheStarsPendingReceiptsStrict, getCountTheStarsProgressStrict,
  markCountTheStarsReceiptClaimedStrict, recordCountTheStarsCompletionStrict, rememberCountTheStarsRunStrict,
} from '../src/data/countTheStarsProgress.js';

const makeStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { values, getItem(key) { return values.has(key) ? values.get(key) : null; }, setItem(key, value) { values.set(key, value); } };
};
const key = `amari_${COUNT_STARS_PROGRESS_KEY}`;
const ids = (episodeIndex) => countQuestionPool(episodeIndex).slice(0, 6).map(({ id }) => id);
const outsideFirstBand = () => countQuestionPool(1).filter(({ count }) => count > COUNT_THE_STARS_EPISODES[0].max).slice(0, 6).map(({ id }) => id);

test('strict reads distinguish a genuinely missing key from unavailable, malformed and invalid data', () => {
  assert.equal(getCountTheStarsProgressStrict('amari', null).ok, false);
  assert.equal(getCountTheStarsProgressStrict('amari', { getItem: () => undefined }).ok, false);
  assert.equal(getCountTheStarsProgressStrict('amari', { getItem: () => '{bad' }).ok, false);
  assert.equal(getCountTheStarsProgressStrict('amari', { getItem: () => JSON.stringify({ version: 2 }) }).ok, false);
  assert.equal(getCountTheStarsProgressStrict('amari', { getItem: () => JSON.stringify({ version: 1, completedEpisodeIds: 'not-an-array' }) }).ok, false);
  const fresh = getCountTheStarsProgressStrict('amari', makeStorage());
  assert.equal(fresh.ok, true);
  assert.equal(fresh.progress.unlockedEpisode, 0);
});

test('strict read rejects future high-water and unsupported or unbacked reward receipts before any write', () => {
  const episode = COUNT_THE_STARS_EPISODES[0];
  for (const progress of [
    { version: 1, completedEpisodeIds: [COUNT_THE_STARS_EPISODES[2].id], unlockedEpisode: 2 },
    { version: 1, completedEpisodeIds: [episode.id], unlockedEpisode: 1, bestStars: { [episode.id]: 2 }, rewardReceipts: [{ id: `${episode.id}:best:3`, rewardDelta: 1, claimed: false }] },
    { version: 1, completedEpisodeIds: [episode.id], unlockedEpisode: 1, bestStars: { [episode.id]: 2 }, rewardReceipts: [{ id: `${episode.id}:best:2`, rewardDelta: 1, claimed: false }, { id: `${episode.id}:best:2`, rewardDelta: 1, claimed: false }] },
    { version: 1, completedEpisodeIds: [episode.id], unlockedEpisode: 1, bestStars: { [episode.id]: 3 }, rewardReceipts: [{ id: `${episode.id}:best:2`, rewardDelta: 2, claimed: false }, { id: `${episode.id}:best:3`, rewardDelta: 3, claimed: false }] },
  ]) {
    const store = makeStorage({ [key]: JSON.stringify(progress) });
    assert.equal(getCountTheStarsProgressStrict('amari', store).ok, false);
    assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store).ok, false);
    assert.equal(store.values.get(key), JSON.stringify(progress));
  }
});

test('strict queue and result writes require exact readback and reject locked or invalid queues without writing', () => {
  let writes = 0;
  const storage = { getItem: () => null, setItem: () => { writes += 1; } };
  assert.equal(rememberCountTheStarsRunStrict('amari', 0, ids(0), null).ok, false);
  assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), null).ok, false);
  assert.equal(rememberCountTheStarsRunStrict('amari', 3, ids(2), storage).ok, false);
  assert.equal(rememberCountTheStarsRunStrict('amari', 0, [...ids(0).slice(1), ids(0)[0], ids(0)[0]], storage).ok, false);
  assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 3, outsideFirstBand(), storage).ok, false);
  assert.equal(writes, 0);
  const getOnly = { getItem: () => null };
  assert.equal(rememberCountTheStarsRunStrict('amari', 0, ids(0), getOnly).ok, false);
  assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), getOnly).ok, false);
  const throwingStorage = { getItem: () => null, setItem() { throw new Error('quota'); } };
  assert.equal(rememberCountTheStarsRunStrict('amari', 0, ids(0), throwingStorage).ok, false);
  assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), throwingStorage).ok, false);
  const wrongReadback = makeStorage();
  wrongReadback.setItem = () => {};
  assert.equal(rememberCountTheStarsRunStrict('amari', 0, ids(0), wrongReadback).ok, false);
});

test('strict writes preserve unknown metadata and the legacy double-prefix key', () => {
  const store = makeStorage({ [key]: JSON.stringify({ version: 1, completedEpisodeIds: [], bestStars: {}, earnedConstellationPageIds: [], recentQuestionIds: {}, familyNote: { untouched: true } }) });
  const saved = rememberCountTheStarsRunStrict('amari', 0, ids(0), store);
  assert.equal(saved.ok, true);
  assert.equal(store.values.has(key), true);
  assert.deepEqual(JSON.parse(store.values.get(key)).familyNote, { untouched: true });
});

test('first completion saves one deterministic positive receipt and marker retries are idempotent', () => {
  const store = makeStorage();
  const done = recordCountTheStarsCompletionStrict('amari', 0, 2, ids(0), store);
  assert.equal(done.ok, true);
  assert.deepEqual(done.receipt, { id: `${COUNT_THE_STARS_EPISODES[0].id}:best:2`, rewardDelta: 2, claimed: false });
  assert.equal(done.progress.unlockedEpisode, 1);
  assert.equal(getCountTheStarsPendingReceiptsStrict('amari', store).receipts.length, 1);
  assert.equal(markCountTheStarsReceiptClaimedStrict('amari', done.receipt.id, store).ok, true);
  assert.equal(markCountTheStarsReceiptClaimedStrict('amari', done.receipt.id, store).ok, true);
  assert.equal(getCountTheStarsPendingReceiptsStrict('amari', store).receipts.length, 0);
  const replay = recordCountTheStarsCompletionStrict('amari', 0, 1, ids(0), store);
  assert.equal(replay.awardedStars, 0);
  assert.equal(replay.receipt, null);
});

test('legacy high-water completion without a rating seeds current rating with no replay backpay', () => {
  const legacy = { version: 1, completedEpisodeIds: [COUNT_THE_STARS_EPISODES[0].id], earnedConstellationPageIds: [COUNT_THE_STARS_EPISODES[0].pageId], recentQuestionIds: {}, bestStars: {}, rewardReceipts: [], retained: 'yes' };
  const store = makeStorage({ [key]: JSON.stringify(legacy) });
  const result = recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store);
  assert.equal(result.ok, true);
  assert.equal(result.awardedStars, 0);
  assert.equal(result.receipt, null);
  assert.equal(result.progress.bestStars[COUNT_THE_STARS_EPISODES[0].id], 3);
  assert.equal(JSON.parse(store.values.get(key)).retained, 'yes');
});

test('legacy completed zero rating seeds the replay rating without backpay', () => {
  const episode = COUNT_THE_STARS_EPISODES[0];
  const legacy = { version: 1, completedEpisodeIds: [episode.id], bestStars: { [episode.id]: 0 }, earnedConstellationPageIds: [episode.pageId], recentQuestionIds: {}, rewardReceipts: [] };
  const store = makeStorage({ [key]: JSON.stringify(legacy) });
  const result = recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store);
  assert.equal(result.ok, true);
  assert.equal(result.awardedStars, 0);
  assert.equal(result.receipt, null);
  assert.equal(result.progress.bestStars[episode.id], 3);
});

test('only positive best-rating improvements create receipts', () => {
  const store = makeStorage();
  recordCountTheStarsCompletionStrict('amari', 0, 1, ids(0), store);
  const improved = recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store);
  assert.equal(improved.awardedStars, 2);
  assert.equal(improved.receipt.id, `${COUNT_THE_STARS_EPISODES[0].id}:best:3`);
  const equal = recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store);
  assert.equal(equal.awardedStars, 0);
  assert.equal(equal.receipt, null);
});

test('existing completed best-rating creates only its positive improvement receipt', () => {
  const episode = COUNT_THE_STARS_EPISODES[0];
  const legacy = { version: 1, completedEpisodeIds: [episode.id], bestStars: { [episode.id]: 2 }, earnedConstellationPageIds: [episode.pageId], recentQuestionIds: { 0: ids(0) }, rewardReceipts: [], customField: 'kept' };
  const store = makeStorage({ [key]: JSON.stringify(legacy) });
  const improved = recordCountTheStarsCompletionStrict('amari', 0, 3, ids(0), store);
  assert.equal(improved.awardedStars, 1);
  assert.deepEqual(improved.receipt, { id: `${episode.id}:best:3`, rewardDelta: 1, claimed: false });
  assert.deepEqual(improved.progress.earnedConstellationPageIds, [episode.pageId]);
  assert.equal(JSON.parse(store.values.get(key)).customField, 'kept');
  assert.equal(recordCountTheStarsCompletionStrict('amari', 0, 2, ids(0), store).awardedStars, 0);
});
