import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPendingSoundSafariRewardReceiptsStrict,
  getSoundSafariProgressStrict,
  markSoundSafariRewardReceiptClaimedStrict,
  recordSoundSafariChapterCompletionStrict,
} from '../src/data/soundSafariProgress.js';
import { SOUND_SAFARI_CHAPTERS, SOUND_SAFARI_PHONEME_KEYS, SOUND_SAFARI_WORDS } from '../src/data/soundSafariAdventure.js';
import { buildSoundSafariRun } from '../src/data/soundSafariAdventure.js';

const validRounds = {
  listen: SOUND_SAFARI_PHONEME_KEYS.map((sound) => `listen-${sound}`),
  blend: SOUND_SAFARI_WORDS.slice(0, 6).map(({ id }) => `blend-${id}`),
  segment: SOUND_SAFARI_WORDS.slice(6, 12).map(({ id }) => `segment-${id}`),
};
const memoryStorage = () => {
  const map = new Map();
  return {
    map,
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, value); },
  };
};

test('strict reader distinguishes empty, unavailable, malformed and explicit-null schema values', () => {
  const storage = memoryStorage();
  assert.equal(getSoundSafariProgressStrict('amari', storage).status, 'empty');
  assert.equal(getSoundSafariProgressStrict('amari', null).status, 'unavailable');
  const key = 'amari_sound_safari_adventure_v1';
  for (const invalid of [
    '{bad json',
    JSON.stringify({ version: 1, completedChapterIds: null }),
    JSON.stringify({ version: 1, completedChapterIds: ['segment'], earnedChapterIds: ['segment'], unlockedChapter: 2 }),
    JSON.stringify({ version: 1, completedChapterIds: ['listen'], earnedChapterIds: [], unlockedChapter: 1 }),
    JSON.stringify({ version: 1, completedChapterIds: [], earnedChapterIds: [], unlockedChapter: 0, recentRoundIds: ['unknown'] }),
  ]) {
    storage.setItem(key, invalid);
    assert.equal(getSoundSafariProgressStrict('amari', storage).status, 'invalid');
    const before = storage.getItem(key);
    assert.equal(recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage).ok, false);
    assert.equal(storage.getItem(key), before, 'invalid bytes are never overwritten');
  }
});

test('completion preserves unknown metadata and only accepts the next contiguous chapter with six valid IDs', () => {
  const storage = memoryStorage();
  const key = 'amari_sound_safari_adventure_v1';
  storage.setItem(key, JSON.stringify({ version: 1, unlockedChapter: 0, completedChapterIds: [], earnedChapterIds: [], recentRoundIds: [], familyMeta: { keep: true } }));
  const beforeWrites = storage.map.size;
  assert.equal(recordSoundSafariChapterCompletionStrict('amari', 'blend', validRounds.blend, storage).status, 'locked');
  assert.equal(storage.map.size, beforeWrites);
  assert.equal(recordSoundSafariChapterCompletionStrict('amari', 'listen', [...validRounds.listen.slice(0, 5), 'bad'], storage).status, 'invalid');
  const saved = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage);
  assert.equal(saved.ok, true);
  assert.equal(saved.newlyCompleted, true);
  assert.equal(saved.receipt.id, 'listen:complete');
  assert.equal(saved.receipt.rewardDelta, 2);
  assert.equal(getSoundSafariProgressStrict('amari', storage).progress.familyMeta.keep, true);
  assert.equal(recordSoundSafariChapterCompletionStrict('askia', 'listen', validRounds.listen, storage).ok, true);
  assert.deepEqual(getSoundSafariProgressStrict('amari', storage).progress.completedChapterIds, ['listen']);
  assert.deepEqual(getSoundSafariProgressStrict('askia', storage).progress.completedChapterIds, ['listen']);
});

test('legacy completed chapters replay without retroactive receipts', () => {
  const storage = memoryStorage();
  const key = 'amari_sound_safari_adventure_v1';
  storage.setItem(key, JSON.stringify({ version: 1, unlockedChapter: 1, completedChapterIds: ['listen'], earnedChapterIds: ['listen'], recentRoundIds: [] }));
  const replay = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage);
  assert.equal(replay.ok, true);
  assert.equal(replay.newlyCompleted, false);
  assert.equal(replay.receipt, null);
  assert.deepEqual(replay.progress.completedChapterIds, ['listen']);
});

test('committed but unconfirmed receipt retries with the same ID, then marker readback confirms once', () => {
  const backing = memoryStorage();
  const key = 'amari_sound_safari_adventure_v1';
  let failNextRead = false;
  const storage = {
    getItem(name) { if (failNextRead) { failNextRead = false; throw new Error('one-shot readback interruption'); } return backing.getItem(name); },
    setItem(name, value) { backing.setItem(name, value); failNextRead = true; },
  };
  const first = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage);
  assert.equal(first.ok, false);
  assert.equal(first.eligibleReward, true);
  const persistedPending = getPendingSoundSafariRewardReceiptsStrict('amari', backing);
  assert.equal(persistedPending.ok, true);
  assert.deepEqual(persistedPending.receipts.map(({ id, rewardDelta }) => [id, rewardDelta]), [['listen:complete', 2]]);
  const retry = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, backing);
  assert.equal(retry.ok, true);
  assert.equal(retry.newlyCompleted, false);
  assert.equal(retry.receipt.id, first.receipt.id);
  assert.equal(retry.receipt.rewardDelta, 2);
  const marked = markSoundSafariRewardReceiptClaimedStrict('amari', retry.receipt.id, backing);
  assert.equal(marked.ok, true);
  assert.equal(marked.progress.rewardReceipts['listen:complete'].claimed, true);
  assert.deepEqual(getPendingSoundSafariRewardReceiptsStrict('amari', backing).receipts, []);
  assert.equal(markSoundSafariRewardReceiptClaimedStrict('amari', retry.receipt.id, backing).status, 'already-claimed');
});

test('exact readback mismatch fails closed rather than accepting a later readable state', () => {
  const backing = memoryStorage();
  let mismatch = false;
  const storage = {
    getItem(key) {
      const raw = backing.getItem(key);
      if (mismatch && raw) return raw.replace('"unlockedChapter":1', '"unlockedChapter":0');
      return raw;
    },
    setItem(key, value) { backing.setItem(key, value); mismatch = true; },
  };
  const result = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage);
  assert.equal(result.ok, false);
  assert.equal(result.status, 'unconfirmed');
  assert.equal(getSoundSafariProgressStrict('amari', backing).progress.completedChapterIds[0], 'listen');
});

test('chapter IDs stay fixed to the established three missions', () => {
  assert.deepEqual(SOUND_SAFARI_CHAPTERS.map(({ id }) => id), ['listen', 'blend', 'segment']);
});

test('saving completion history never mutates a run snapshot already in progress', () => {
  const storage = memoryStorage();
  const taught = [...SOUND_SAFARI_PHONEME_KEYS];
  const active = buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught, seed: 27 });
  const activeBefore = JSON.stringify(active);
  const saved = recordSoundSafariChapterCompletionStrict('amari', 'listen', validRounds.listen, storage);
  assert.equal(saved.ok, true);
  assert.notDeepEqual(saved.progress.recentRoundIds, []);
  assert.equal(JSON.stringify(active), activeBefore);
  assert.equal(active.chapters[0].rounds.length, 6);
  assert.deepEqual(active.chapters[0].rounds.map(({ id }) => id).sort(), JSON.parse(activeBefore).chapters[0].rounds.map(({ id }) => id).sort());
});
