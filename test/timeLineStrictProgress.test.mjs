import test from 'node:test';
import assert from 'node:assert/strict';
import { createNumberLineRun, createTimeRun, NUMBER_LINE_CHAPTERS, TIME_CHAPTERS } from '../src/data/timeLineAdventure.js';
import {
  getPendingTimeLineRewardReceiptsStrict, markTimeLineRewardReceiptClaimedStrict,
  readTimeLineProgressStrict, recordTimeLineRunCompletionStrict, rememberTimeLineRunStrict,
  timeLineProgressKey,
} from '../src/data/timeLineProgress.js';

const storageWith = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { values, getItem(key) { return values.has(key) ? values.get(key) : null; }, setItem(key, value) { values.set(key, value); } };
};
const key = timeLineProgressKey('numberline', 'amari');
const run = (chapter = 0, seed = 17) => createNumberLineRun({ chapter, seed });

test('strict reads treat only a missing key as fresh and reject malformed known fields', () => {
  assert.equal(readTimeLineProgressStrict('numberline', 'amari', null).ok, false);
  assert.equal(readTimeLineProgressStrict('numberline', 'amari', { getItem: () => undefined }).ok, false);
  assert.equal(readTimeLineProgressStrict('numberline', 'amari', { getItem: () => '{bad' }).ok, false);
  for (const value of [
    { version: 1, rewardReceipts: null },
    { version: 1, completedChapterIds: null },
    { version: 1, completedChapterIds: [NUMBER_LINE_CHAPTERS[2].id], unlockedChapter: 2 },
  ]) assert.equal(readTimeLineProgressStrict('numberline', 'amari', storageWith({ [key]: JSON.stringify(value) })).ok, false);
  const fresh = readTimeLineProgressStrict('numberline', 'amari', storageWith());
  assert.equal(fresh.ok, true);
  assert.deepEqual(fresh.progress.completedChapterIds, []);
});

test('Number Line queue and result writes reject locks, bad runs, unavailable storage and failed confirmation', () => {
  let writes = 0;
  const lockedStore = { getItem: () => null, setItem: () => { writes += 1; } };
  assert.equal(rememberTimeLineRunStrict('numberline', 'amari', 3, run(2), lockedStore).ok, false);
  assert.equal(rememberTimeLineRunStrict('numberline', 'amari', 1, run(1), lockedStore).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0), 3, null).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('numberline', 'amari', 1, run(1), 3, lockedStore).ok, false);
  assert.equal(writes, 0);
  const brokenReadback = storageWith();
  brokenReadback.setItem = () => {};
  assert.equal(rememberTimeLineRunStrict('numberline', 'amari', 0, run(0), brokenReadback).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0), 3, brokenReadback).ok, false);
});

test('strict writes preserve unknown metadata and retain the Number Line legacy v1 key', () => {
  const store = storageWith({ [key]: JSON.stringify({ version: 1, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0, familyNote: 'retain' }) });
  const saved = rememberTimeLineRunStrict('numberline', 'amari', 0, run(0), store);
  assert.equal(saved.ok, true);
  assert.equal(store.values.has('amari_numberline_progress_v1'), true);
  assert.equal(JSON.parse(store.values.get(key)).familyNote, 'retain');
});

test('new completion and best improvement create deterministic receipts, then replay earns nothing', () => {
  const store = storageWith();
  const first = recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0), 2, store);
  assert.equal(first.ok, true);
  assert.deepEqual(first.receipt, { id: `${NUMBER_LINE_CHAPTERS[0].id}:best:2`, chapterId: NUMBER_LINE_CHAPTERS[0].id, bestStars: 2, rewardDelta: 2, claimed: false });
  const claimed = markTimeLineRewardReceiptClaimedStrict('numberline', 'amari', first.receipt.id, store);
  assert.equal(claimed.ok, true);
  assert.equal(getPendingTimeLineRewardReceiptsStrict('numberline', 'amari', store).receipts.length, 0);
  const improved = recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0, 18), 3, store);
  assert.equal(improved.awardedStars, 1);
  assert.equal(improved.receipt.id, `${NUMBER_LINE_CHAPTERS[0].id}:best:3`);
  assert.equal(recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0, 19), 2, store).awardedStars, 0);
});

test('legacy completed zero or missing rating seeds stars but cannot earn replay backpay', () => {
  const chapter = NUMBER_LINE_CHAPTERS[0];
  for (const bestStars of [{ [chapter.id]: 0 }, {}]) {
    const legacy = { version: 1, completedChapterIds: [chapter.id], bestStars, recentQuestionIds: {}, unlockedChapter: 1, familyNote: 9 };
    const store = storageWith({ [key]: JSON.stringify(legacy) });
    const replay = recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(0, bestStars[chapter.id] === 0 ? 20 : 21), 3, store);
    assert.equal(replay.ok, true);
    assert.equal(replay.awardedStars, 0);
    assert.equal(replay.receipt, null);
    assert.equal(replay.progress.bestStars[chapter.id], 3);
    assert.equal(JSON.parse(store.values.get(key)).familyNote, 9);
  }
});

test('receipt validation rejects unbacked, duplicate and over-total rewards before a write', () => {
  const chapter = NUMBER_LINE_CHAPTERS[0];
  const invalid = {
    version: 1, completedChapterIds: [chapter.id], unlockedChapter: 1, bestStars: { [chapter.id]: 3 }, recentQuestionIds: {},
    rewardReceipts: {
      [`${chapter.id}:best:2`]: { id: `${chapter.id}:best:2`, chapterId: chapter.id, bestStars: 2, rewardDelta: 2, claimed: false },
      [`${chapter.id}:best:3`]: { id: `${chapter.id}:best:3`, chapterId: chapter.id, bestStars: 3, rewardDelta: 3, claimed: false },
    },
  };
  const store = storageWith({ [key]: JSON.stringify(invalid) });
  assert.equal(readTimeLineProgressStrict('numberline', 'amari', store).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('numberline', 'amari', 0, run(), 3, store).ok, false);
  assert.equal(store.values.get(key), JSON.stringify(invalid));
});

test('strict APIs also validate Time Teller while its legacy wrappers remain available', () => {
  const tellerKey = timeLineProgressKey('timeteller', 'amari');
  const store = storageWith();
  const tellerRun = createTimeRun({ chapter: 0, seed: 41 });
  assert.equal(rememberTimeLineRunStrict('timeteller', 'amari', 0, tellerRun, store).ok, true);
  assert.equal(recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, tellerRun, 2, store).ok, true);
  assert.equal(readTimeLineProgressStrict('timeteller', 'amari', store).progress.bestStars[TIME_CHAPTERS[0].id], 2);
  assert.equal(store.values.has(tellerKey), true);
});
