import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubtractionRun } from '../src/data/arithmeticAdventure.js';
import {
  arithmeticProgressKey, readArithmeticProgressStrict, rememberStartedArithmeticRunStrict,
  recordArithmeticRunCompletionStrict, getPendingArithmeticRewardReceiptsStrict,
  markArithmeticRewardReceiptClaimedStrict,
} from '../src/data/arithmeticProgress.js';

const memory = () => {
  const values = new Map();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
};

test('subtraction strict completion issues one stable receipt per positive best and drains it idempotently', () => {
  const storage = memory();
  const run = createSubtractionRun({ chapter: 0, seed: 1616 });
  assert.equal(rememberStartedArithmeticRunStrict('subtraction', 'amari', 0, run, storage).ok, true);
  const first = recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, run, 1, storage);
  assert.equal(first.ok, true);
  assert.deepEqual(first.receipt, { id: 'take-away:best:1', chapterId: 'take-away', bestStars: 1, rewardDelta: 1, claimed: false });
  assert.equal(markArithmeticRewardReceiptClaimedStrict('subtraction', 'amari', first.receipt.id, storage).ok, true);
  const equal = recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, run, 1, storage);
  assert.equal(equal.awardedStars, 0);
  assert.equal(equal.receipt, null);
  const improved = recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, run, 3, storage);
  assert.deepEqual(improved.receipt, { id: 'take-away:best:3', chapterId: 'take-away', bestStars: 3, rewardDelta: 2, claimed: false });
  assert.equal(recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, run, 2, storage).awardedStars, 0);
  assert.deepEqual(getPendingArithmeticRewardReceiptsStrict('subtraction', 'amari', storage).receipts.map(({ id }) => id), ['take-away:best:3']);
});

test('completed legacy chapter with no rating does not gain replay backpay', () => {
  const storage = memory();
  const key = arithmeticProgressKey('subtraction', 'amari');
  storage.setItem(key, JSON.stringify({ version: 1, completedChapterIds: ['take-away'], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 1, familyMeta: { keep: true } }));
  const run = createSubtractionRun({ chapter: 0, seed: 1617 });
  const replay = recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, run, 3, storage);
  assert.equal(replay.ok, true);
  assert.equal(replay.awardedStars, 0);
  assert.equal(replay.receipt, null);
  assert.deepEqual(JSON.parse(storage.getItem(key)).familyMeta, { keep: true });
});

test('subtraction rejects locked start/result without writing and keeps each child separate', () => {
  const storage = memory();
  const locked = createSubtractionRun({ chapter: 1, seed: 1618 });
  assert.equal(rememberStartedArithmeticRunStrict('subtraction', 'amari', 1, locked, storage).status, 'locked');
  assert.equal(recordArithmeticRunCompletionStrict('subtraction', 'amari', 1, locked, 2, storage).status, 'locked');
  assert.equal(storage.values.size, 0);
  const first = createSubtractionRun({ chapter: 0, seed: 1619 });
  assert.equal(recordArithmeticRunCompletionStrict('subtraction', 'amari', 0, first, 2, storage).ok, true);
  assert.equal(readArithmeticProgressStrict('subtraction', 'askia', storage).progress.completedChapterIds.length, 0);
});
