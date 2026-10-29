import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdditionRun, createSubtractionRun } from '../src/data/arithmeticAdventure.js';
import {
  arithmeticProgressKey, readArithmeticProgressStrict, rememberStartedArithmeticRunStrict,
  recordArithmeticRunCompletionStrict, getPendingArithmeticRewardReceiptsStrict,
  markArithmeticRewardReceiptClaimedStrict,
} from '../src/data/arithmeticProgress.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
};
const complete = (game, index, stars, player = 'amari', storage = memoryStorage()) => {
  const run = (game === 'addition' ? createAdditionRun : createSubtractionRun)({ chapter: index, seed: 101 + index });
  for (let prior = 0; prior < index; prior += 1) {
    const earlier = (game === 'addition' ? createAdditionRun : createSubtractionRun)({ chapter: prior, seed: 101 + prior });
    const result = recordArithmeticRunCompletionStrict(game, player, prior, earlier, 1, storage);
    assert.equal(result.ok, true);
    if (result.receipt) markArithmeticRewardReceiptClaimedStrict(game, player, result.receipt.id, storage);
  }
  return { storage, run, result: recordArithmeticRunCompletionStrict(game, player, index, run, stars, storage) };
};

test('strict progress distinguishes fresh, malformed and unavailable without overwriting bytes', () => {
  const storage = memoryStorage();
  assert.equal(readArithmeticProgressStrict('addition', 'amari', storage).status, 'fresh');
  const key = arithmeticProgressKey('addition', 'amari');
  storage.setItem(key, '{broken');
  const bad = readArithmeticProgressStrict('addition', 'amari', storage);
  assert.equal(bad.ok, false);
  assert.equal(bad.status, 'invalid');
  assert.equal(storage.getItem(key), '{broken');
  assert.equal(readArithmeticProgressStrict('addition', 'amari', { getItem() { throw Error('blocked'); } }).status, 'unavailable');
});

test('strict records preserve unknown metadata and isolate child and effective legacy keys', () => {
  const storage = memoryStorage();
  const key = arithmeticProgressKey('addition', 'amari');
  storage.setItem(key, JSON.stringify({ version: 1, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, rewardReceipts: {}, familyNote: { keep: true } }));
  const run = createAdditionRun({ chapter: 0, seed: 22 });
  assert.equal(rememberStartedArithmeticRunStrict('addition', 'amari', 0, run, storage).ok, true);
  assert.deepEqual(JSON.parse(storage.getItem(key)).familyNote, { keep: true });
  assert.equal(storage.getItem(arithmeticProgressKey('addition', 'askia')), null);
});

test('locked and malformed starts are rejected before any write', () => {
  const storage = memoryStorage();
  const run = createAdditionRun({ chapter: 1, seed: 23 });
  assert.equal(rememberStartedArithmeticRunStrict('addition', 'amari', 1, run, storage).status, 'locked');
  assert.equal(storage.values.size, 0);
  assert.equal(rememberStartedArithmeticRunStrict('addition', 'amari', 0, run, storage).status, 'invalid');
  assert.equal(storage.values.size, 0);
});

test('write then readback failure is held; retry recovers the deterministic receipt without another award', () => {
  const base = memoryStorage();
  let hideReads = 0;
  let failFirstReadback = true;
  const storage = {
    getItem(key) {
      const value = base.getItem(key);
      if (hideReads > 0 && value && JSON.parse(value).completedChapterIds?.includes('groups')) {
        hideReads -= 1;
        return '{not-the-committed-record';
      }
      return value;
    },
    setItem(key, value) { base.setItem(key, value); if (failFirstReadback) { hideReads = 1; failFirstReadback = false; } },
  };
  const run = createAdditionRun({ chapter: 0, seed: 24 });
  const first = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, storage);
  assert.equal(first.ok, false);
  assert.equal(base.values.size, 1);
  const retry = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.receipt.id, 'groups:best:2');
  assert.equal(retry.awardedStars, 0); // The first write committed; its durable receipt carries the original delta.
  const duplicate = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, base);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.awardedStars, 0);
  assert.equal(duplicate.receipt.id, retry.receipt.id);
  assert.deepEqual(getPendingArithmeticRewardReceiptsStrict('addition', 'amari', base).receipts.map(({ id }) => id), ['groups:best:2']);
});

test('a transient readback exception after set remains held until an explicit same-transaction retry', () => {
  const base = memoryStorage();
  let throwAfterSet = false;
  let failOnce = true;
  const storage = {
    getItem(key) {
      if (throwAfterSet) { throwAfterSet = false; throw new Error('one-shot readback failure'); }
      return base.getItem(key);
    },
    setItem(key, value) { base.setItem(key, value); if (failOnce) { throwAfterSet = true; failOnce = false; } },
  };
  const run = createAdditionRun({ chapter: 0, seed: 240 });
  const held = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, storage);
  assert.equal(held.ok, false);
  const retry = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.receipt.id, 'groups:best:2');
  assert.equal(retry.receipt.rewardDelta, 2);
  assert.equal(retry.awardedStars, 0);
});

test('strict schema rejects stale unlocks and unbacked receipt totals without rewriting source bytes', () => {
  const storage = memoryStorage();
  const key = arithmeticProgressKey('addition', 'amari');
  const malformed = { version: 1, completedChapterIds: ['groups'], bestStars: { groups: 2 }, recentQuestionIds: {}, unlockedChapter: 0, rewardReceipts: {} };
  storage.setItem(key, JSON.stringify(malformed));
  assert.equal(readArithmeticProgressStrict('addition', 'amari', storage).status, 'invalid');
  const bytes = storage.getItem(key);
  assert.equal(rememberStartedArithmeticRunStrict('addition', 'amari', 1, createAdditionRun({ chapter: 1, seed: 2 }), storage).ok, false);
  assert.equal(storage.getItem(key), bytes);
  storage.setItem(key, JSON.stringify({ ...malformed, unlockedChapter: 1, rewardReceipts: {
    'groups:best:1': { id: 'groups:best:1', chapterId: 'groups', bestStars: 1, rewardDelta: 2, claimed: false },
    'groups:best:2': { id: 'groups:best:2', chapterId: 'groups', bestStars: 2, rewardDelta: 2, claimed: false },
  } }));
  assert.equal(readArithmeticProgressStrict('addition', 'amari', storage).status, 'invalid');
});

test('best-star improvements are positive and idempotent; claim marker is read back', () => {
  const storage = memoryStorage();
  const run = createAdditionRun({ chapter: 0, seed: 25 });
  const first = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 1, storage);
  assert.equal(first.receipt.rewardDelta, 1);
  markArithmeticRewardReceiptClaimedStrict('addition', 'amari', first.receipt.id, storage);
  const improvement = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 3, storage);
  assert.equal(improvement.receipt.id, 'groups:best:3');
  assert.equal(improvement.receipt.rewardDelta, 2);
  const claimed = markArithmeticRewardReceiptClaimedStrict('addition', 'amari', improvement.receipt.id, storage);
  assert.equal(claimed.ok, true);
  assert.equal(claimed.progress.rewardReceipts['groups:best:3'].claimed, true);
  assert.equal(markArithmeticRewardReceiptClaimedStrict('addition', 'amari', improvement.receipt.id, storage).status, 'already-claimed');
  assert.deepEqual(getPendingArithmeticRewardReceiptsStrict('addition', 'amari', storage).receipts, []);
});

test('legacy completed zero-rating chapters receive no backpay and invalid writes fail closed', () => {
  const storage = memoryStorage();
  storage.setItem(arithmeticProgressKey('addition', 'amari'), JSON.stringify({ version: 1, completedChapterIds: ['groups'], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 1 }));
  const run = createAdditionRun({ chapter: 0, seed: 26 });
  const replay = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 2, storage);
  assert.equal(replay.ok, true);
  assert.equal(replay.awardedStars, 0);
  assert.equal(replay.receipt, null);
  const original = storage.getItem(arithmeticProgressKey('addition', 'amari'));
  storage.setItem(arithmeticProgressKey('addition', 'amari'), '{invalid');
  const failed = recordArithmeticRunCompletionStrict('addition', 'amari', 0, run, 3, storage);
  assert.equal(failed.ok, false);
  assert.equal(storage.getItem(arithmeticProgressKey('addition', 'amari')), '{invalid');
  assert.notEqual(original, storage.getItem(arithmeticProgressKey('addition', 'amari')));
});

test('strict helper retains subtraction compatibility under its existing key', () => {
  const storage = memoryStorage();
  const { result } = complete('subtraction', 0, 2, 'amari', storage);
  assert.equal(result.ok, true);
  assert.equal(result.receipt.id, 'take-away:best:2');
  assert.ok(storage.getItem(arithmeticProgressKey('subtraction', 'amari')));
});
