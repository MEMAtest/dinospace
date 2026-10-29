import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimeRun, TIME_CHAPTERS } from '../src/data/timeLineAdventure.js';
import {
  getPendingTimeLineRewardReceiptsStrict, markTimeLineRewardReceiptClaimedStrict,
  readTimeLineProgressStrict, recordTimeLineRunCompletionStrict, rememberTimeLineRunStrict,
  timeLineProgressKey,
} from '../src/data/timeLineProgress.js';

const key = timeLineProgressKey('timeteller', 'amari');
const store = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { values, getItem(k) { return values.has(k) ? values.get(k) : null; }, setItem(k, v) { values.set(k, v); } };
};
const run = (seed = 13) => createTimeRun({ chapter: 0, seed });

test('Time Teller strict progress distinguishes missing from unavailable and malformed records', () => {
  assert.equal(readTimeLineProgressStrict('timeteller', 'amari', null).ok, false);
  assert.equal(readTimeLineProgressStrict('timeteller', 'amari', { getItem: () => undefined }).ok, false);
  for (const value of [{ version: 1, bestStars: null }, { version: 1, rewardReceipts: null }, { version: 1, completedChapterIds: [TIME_CHAPTERS[2].id] }]) {
    assert.equal(readTimeLineProgressStrict('timeteller', 'amari', store({ [key]: JSON.stringify(value) })).ok, false);
  }
  assert.equal(readTimeLineProgressStrict('timeteller', 'amari', store()).ok, true);
});

test('Time Teller queue and result writes require a valid unlocked run and exact confirmation', () => {
  let writes = 0;
  const noWrite = { getItem: () => null, setItem: () => { writes += 1; } };
  assert.equal(rememberTimeLineRunStrict('timeteller', 'amari', 1, createTimeRun({ chapter: 1, seed: 7 }), noWrite).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('timeteller', 'amari', 1, createTimeRun({ chapter: 1, seed: 8 }), 3, noWrite).ok, false);
  assert.equal(writes, 0);
  const mismatch = store(); mismatch.setItem = () => {};
  assert.equal(rememberTimeLineRunStrict('timeteller', 'amari', 0, run(), mismatch).ok, false);
  assert.equal(recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, run(), 3, null).ok, false);
});

test('Time Teller preserves its v1 key and unknown metadata and grants only first/improved star receipts', () => {
  const data = { version: 1, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0, householdNote: 'preserve' };
  const storage = store({ [key]: JSON.stringify(data) });
  assert.equal(rememberTimeLineRunStrict('timeteller', 'amari', 0, run(), storage).ok, true);
  assert.equal(JSON.parse(storage.values.get(key)).householdNote, 'preserve');
  const first = recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, run(), 2, storage);
  assert.equal(first.ok, true);
  assert.deepEqual(first.receipt, { id: `${TIME_CHAPTERS[0].id}:best:2`, chapterId: TIME_CHAPTERS[0].id, bestStars: 2, rewardDelta: 2, claimed: false });
  assert.equal(markTimeLineRewardReceiptClaimedStrict('timeteller', 'amari', first.receipt.id, storage).ok, true);
  assert.equal(getPendingTimeLineRewardReceiptsStrict('timeteller', 'amari', storage).receipts.length, 0);
  const improved = recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, run(17), 3, storage);
  assert.equal(improved.awardedStars, 1);
  assert.equal(improved.receipt.id, `${TIME_CHAPTERS[0].id}:best:3`);
  assert.equal(recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, run(19), 2, storage).awardedStars, 0);
});

test('Time Teller legacy completed zero or missing best rating has no replay backpay', () => {
  const chapter = TIME_CHAPTERS[0];
  for (const bestStars of [{ [chapter.id]: 0 }, {}]) {
    const legacy = { version: 1, completedChapterIds: [chapter.id], bestStars, recentQuestionIds: {}, unlockedChapter: 1 };
    const storage = store({ [key]: JSON.stringify(legacy) });
    const replay = recordTimeLineRunCompletionStrict('timeteller', 'amari', 0, run(bestStars[chapter.id] === 0 ? 21 : 22), 3, storage);
    assert.equal(replay.ok, true);
    assert.equal(replay.awardedStars, 0);
    assert.equal(replay.receipt, null);
    assert.equal(replay.progress.bestStars[chapter.id], 3);
  }
});
