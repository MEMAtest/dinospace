import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commitLetterLaunchChapter,
  drainPendingLetterLaunchRewards,
  letterLaunchProgressKey,
  markLetterLaunchRewardClaimed,
  pendingLetterLaunchRewards,
  readLetterLaunchProgress,
} from '../src/data/letterLaunchProgress.js';
import { CHAPTER_BADGE_STORAGE_KEY, LETTER_LAUNCH_CHAPTER_BADGES } from '../src/data/chapterBadges.js';

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

test('Letter Launch progress is child-scoped and a chapter creates one durable claim receipt', () => {
  const storage = memoryStorage({ askia_game_levels_v1: JSON.stringify({ letters: { current: 0, unlocked: 0 }, other: { current: 2 }, meta: 'keep' }) });
  assert.equal(letterLaunchProgressKey('amari'), 'amari_letter_launch_progress_v1');
  const saved = commitLetterLaunchChapter('amari', 0, 'attempt_001', storage);
  assert.equal(saved.ok, true);
  assert.equal(saved.rewardDelta, 1);
  assert.deepEqual(pendingLetterLaunchRewards(saved.progress).map(({ transactionId }) => transactionId), ['attempt_001']);
  assert.equal(readLetterLaunchProgress('askia', storage).progress.unlockedChapterIndex, 0);
  assert.deepEqual(JSON.parse(storage.getItem('askia_game_levels_v1')), { letters: { current: 0, unlocked: 0 }, other: { current: 2 }, meta: 'keep' });
  const askia = commitLetterLaunchChapter('askia', 0, 'askia_attempt', storage);
  assert.equal(askia.ok, true);
  assert.equal(storage.getItem('askia_letter_launch_progress_v1') !== null, true);
  assert.equal(storage.getItem('amari_letter_launch_progress_v1') !== null, true);
  assert.equal(readLetterLaunchProgress('askia', storage).progress.unlockedChapterIndex, 1);

  const retry = commitLetterLaunchChapter('amari', 0, 'attempt_retry', storage);
  assert.equal(retry.receipt.transactionId, 'attempt_001');
  assert.equal(retry.rewardDelta, 1);
  const marked = markLetterLaunchRewardClaimed('amari', 'attempt_001', storage);
  assert.equal(marked.ok, true);
  assert.deepEqual(pendingLetterLaunchRewards(marked.progress), []);
  assert.equal(commitLetterLaunchChapter('amari', 0, 'attempt_again', storage).rewardDelta, 0);
});

test('legacy high-water unlock remains playable but does not fabricate earned badges', () => {
  const storage = memoryStorage({
    amari_game_levels_v1: JSON.stringify({ letters: { current: 2, unlocked: 2 }, otherGame: { current: 3, unlocked: 4 }, ownerNote: 'untouched' }),
    [CHAPTER_BADGE_STORAGE_KEY]: JSON.stringify({ version: 1, players: {} }),
  });
  const read = readLetterLaunchProgress('amari', storage);
  assert.equal(read.ok, true);
  assert.equal(read.progress.unlockedChapterIndex, 2);
  assert.deepEqual(read.progress.completedChapterIds, []);
  const legacyReplay = commitLetterLaunchChapter('amari', 0, 'attempt_old', storage);
  assert.equal(legacyReplay.ok, true);
  assert.equal(legacyReplay.rewardDelta, 0);
  assert.equal(legacyReplay.receipt, null);
  assert.deepEqual(legacyReplay.progress.completedChapterIds, [LETTER_LAUNCH_CHAPTER_BADGES[0].id]);
  assert.deepEqual(JSON.parse(storage.getItem('amari_game_levels_v1')), { letters: { current: 2, unlocked: 2 }, otherGame: { current: 3, unlocked: 4 }, ownerNote: 'untouched' });
});

test('a new chapter after a sparse legacy unlock can save without fabricating earlier badges', () => {
  const storage = memoryStorage({ amari_game_levels_v1: JSON.stringify({ letters: { current: 1, unlocked: 1 } }) });
  const completed = commitLetterLaunchChapter('amari', 1, 'attempt_chapter_2', storage);
  assert.equal(completed.ok, true);
  assert.equal(completed.rewardDelta, 1);
  assert.deepEqual(completed.progress.completedChapterIds, [LETTER_LAUNCH_CHAPTER_BADGES[1].id]);
  assert.equal(completed.progress.unlockedChapterIndex, 2);
  assert.equal(readLetterLaunchProgress('amari', storage).ok, true);
});

test('existing chapter badges are read as complete and prevent duplicate rewards', () => {
  const badgeId = LETTER_LAUNCH_CHAPTER_BADGES[1].id;
  const storage = memoryStorage({
    [CHAPTER_BADGE_STORAGE_KEY]: JSON.stringify({ version: 1, unknown: 'keep', players: { amari: { games: { letters: { earnedChapterIds: [badgeId], future: 8 } } } } }),
  });
  const read = readLetterLaunchProgress('amari', storage);
  assert.deepEqual(read.progress.completedChapterIds, [badgeId]);
  assert.equal(read.progress.unlockedChapterIndex, 2);
  assert.equal(commitLetterLaunchChapter('amari', 1, 'attempt', storage).rewardDelta, 0);
  assert.equal(JSON.parse(storage.getItem(CHAPTER_BADGE_STORAGE_KEY)).unknown, 'keep');
});

test('unknown canonical progress metadata and sibling records survive chapter commits', () => {
  const storage = memoryStorage({
    amari_letter_launch_progress_v1: JSON.stringify({ version: 1, unlockedChapterIndex: 0, completedChapterIds: [], chapterReceipts: [], futureField: { keep: true } }),
    askia_game_levels_v1: JSON.stringify({ letters: { current: 1, unlocked: 1 }, preserved: 'sibling' }),
  });
  const result = commitLetterLaunchChapter('amari', 0, 'attempt_meta', storage);
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(storage.getItem('amari_letter_launch_progress_v1')).futureField, { keep: true });
  assert.deepEqual(JSON.parse(storage.getItem('askia_game_levels_v1')), { letters: { current: 1, unlocked: 1 }, preserved: 'sibling' });
});

test('malformed or blocked old records fail closed and are never replaced with fresh progress', () => {
  for (const raw of ['{bad', JSON.stringify({ letters: { current: 2, unlocked: 1 } })]) {
    const storage = memoryStorage({ amari_game_levels_v1: raw });
    const result = readLetterLaunchProgress('amari', storage);
    assert.equal(result.ok, false);
    assert.equal(commitLetterLaunchChapter('amari', 0, 'attempt', storage).ok, false);
    assert.equal(storage.getItem(letterLaunchProgressKey('amari')), null);
  }
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readLetterLaunchProgress('amari', blocked).status, 'unavailable');
  assert.equal(commitLetterLaunchChapter('amari', 0, 'attempt', blocked).ok, false);
  const malformedBadges = memoryStorage({ [CHAPTER_BADGE_STORAGE_KEY]: JSON.stringify({ version: 1, players: { amari: 'invalid-player' } }) });
  assert.equal(readLetterLaunchProgress('amari', malformedBadges).ok, false);
  assert.equal(commitLetterLaunchChapter('amari', 0, 'attempt_badge', malformedBadges).ok, false);
  assert.equal(malformedBadges.getItem(letterLaunchProgressKey('amari')), null);
});

test('failed write and failed readback retain the same retry transaction without progress claims', () => {
  const failing = {
    data: new Map(), failWrite: true,
    getItem(key) { return this.data.has(key) ? this.data.get(key) : null; },
    setItem(key, value) { if (this.failWrite) throw Error('write failed'); this.data.set(key, String(value)); },
  };
  const failed = commitLetterLaunchChapter('amari', 0, 'attempt_same', failing);
  assert.equal(failed.ok, false);
  assert.equal(failing.getItem(letterLaunchProgressKey('amari')), null);
  failing.failWrite = false;
  const retry = commitLetterLaunchChapter('amari', 0, 'attempt_same', failing);
  assert.equal(retry.ok, true);
  assert.equal(retry.receipt.transactionId, 'attempt_same');

  const mismatch = {
    getItem: () => null,
    setItem: () => {},
  };
  assert.equal(commitLetterLaunchChapter('amari', 0, 'attempt_readback', mismatch).ok, false);
});

test('parent confirmation write failure keeps a pending receipt that recovers idempotently', () => {
  const storage = memoryStorage();
  const saved = commitLetterLaunchChapter('amari', 0, 'attempt_parent', storage);
  assert.equal(saved.ok, true);
  const originalSet = storage.setItem;
  storage.setItem = () => { throw Error('blocked after parent claim'); };
  const failedMark = markLetterLaunchRewardClaimed('amari', 'attempt_parent', storage);
  assert.equal(failedMark.ok, false);
  assert.equal(pendingLetterLaunchRewards(readLetterLaunchProgress('amari', storage).storedProgress).length, 1);
  storage.setItem = originalSet;
  const recovered = commitLetterLaunchChapter('amari', 0, 'new-attempt-must-not-replace', storage);
  assert.equal(recovered.receipt.transactionId, 'attempt_parent');
  assert.equal(recovered.rewardDelta, 1);
  assert.equal(markLetterLaunchRewardClaimed('amari', 'attempt_parent', storage).ok, true);
  assert.deepEqual(pendingLetterLaunchRewards(readLetterLaunchProgress('amari', storage).storedProgress), []);
});

test('pending reward reconciliation stops at first failure and retries remaining receipts in order', async () => {
  const storage = memoryStorage();
  for (let index = 0; index < 3; index += 1) {
    const saved = commitLetterLaunchChapter('amari', index, `attempt_${index}`, storage);
    assert.equal(saved.ok, true);
  }
  const progress = readLetterLaunchProgress('amari', storage).storedProgress;
  const calls = [];
  const first = await drainPendingLetterLaunchRewards(progress, async (receipt) => {
    calls.push(receipt.transactionId);
    return receipt.transactionId !== 'attempt_1';
  });
  assert.deepEqual(calls, ['attempt_0', 'attempt_1']);
  assert.equal(first.ok, false);
  assert.deepEqual(first.remaining.map(({ transactionId }) => transactionId), ['attempt_1', 'attempt_2']);
  const secondCalls = [];
  const second = await drainPendingLetterLaunchRewards({ chapterReceipts: first.remaining }, async (receipt) => {
    secondCalls.push(receipt.transactionId);
    return true;
  });
  assert.deepEqual(secondCalls, ['attempt_1', 'attempt_2']);
  assert.equal(second.ok, true);
});
