import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commitGermanChapter,
  drainPendingGermanChapterRewards,
  germanChapterProgressKey,
  markGermanChapterRewardClaimed,
  pendingGermanChapterRewards,
  readGermanChapterProgress,
} from '../src/data/germanChapterProgress.js';

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

test('fresh chapter receipts are player-isolated, durable, and duplicate chapter clears do not award again', () => {
  const storage = memoryStorage({ askia_game_levels_v1: JSON.stringify({ spelling: { current: 2, unlocked: 2 }, siblingMeta: 'keep' }) });
  const amari = readGermanChapterProgress('amari', storage);
  assert.equal(amari.ok, true);
  assert.equal(amari.status, 'fresh');
  const saved = commitGermanChapter('amari', 0, 'attempt_a1', storage);
  assert.equal(saved.ok, true);
  assert.equal(saved.rewardDelta, 1);
  assert.equal(saved.receipt.parentClaimed, false);
  assert.equal(readGermanChapterProgress('askia', storage).progress.unlockedChapterIndex, 0);
  assert.deepEqual(JSON.parse(storage.getItem('askia_game_levels_v1')), { spelling: { current: 2, unlocked: 2 }, siblingMeta: 'keep' });

  const replay = commitGermanChapter('amari', 0, 'attempt_a2', storage);
  assert.equal(replay.rewardDelta, 1);
  assert.equal(replay.receipt.transactionId, 'attempt_a1');
  const claim = markGermanChapterRewardClaimed('amari', 'attempt_a1', storage);
  assert.equal(claim.ok, true);
  assert.deepEqual(pendingGermanChapterRewards(readGermanChapterProgress('amari', storage).storedProgress), []);
  assert.equal(markGermanChapterRewardClaimed('amari', 'attempt_a1', storage).status, 'already-claimed');
});

test('legacy high-water marks preserve raw map and suppress duplicate historical rewards', () => {
  const original = JSON.stringify({ german: { current: 1, unlocked: 2, unknown: 'retain' }, spelling: { current: 3, unlocked: 4 } });
  const storage = memoryStorage({ amari_game_levels_v1: original });
  const before = readGermanChapterProgress('amari', storage);
  assert.deepEqual(before.progress.completedChapterIds, ['colour-painter']);
  assert.equal(before.progress.unlockedChapterIndex, 2);
  const historical = commitGermanChapter('amari', 1, 'old_attempt', storage);
  assert.equal(historical.ok, true);
  assert.equal(historical.status, 'legacy-complete');
  assert.equal(historical.rewardDelta, 0);
  assert.equal(storage.getItem('amari_game_levels_v1'), original);
  assert.equal(storage.getItem('askia_game_levels_v1'), null);
});

test('malformed canonical or legacy data fails closed without rewriting either record', () => {
  const badCanonical = memoryStorage({ [germanChapterProgressKey('amari')]: JSON.stringify({ version: 1, unlockedChapterIndex: '2', completedChapterIds: [], chapterReceipts: [] }) });
  const result = commitGermanChapter('amari', 0, 'attempt_a1', badCanonical);
  assert.equal(result.ok, false);
  assert.equal(badCanonical.getItem(germanChapterProgressKey('amari')), '{"version":1,"unlockedChapterIndex":"2","completedChapterIds":[],"chapterReceipts":[]}');

  const legacyRaw = '{broken';
  const badLegacy = memoryStorage({ amari_game_levels_v1: legacyRaw });
  assert.equal(readGermanChapterProgress('amari', badLegacy).ok, false);
  assert.equal(commitGermanChapter('amari', 0, 'attempt_a1', badLegacy).ok, false);
  assert.equal(badLegacy.getItem('amari_game_levels_v1'), legacyRaw);
  assert.equal(badLegacy.getItem(germanChapterProgressKey('amari')), null);
});

test('failed write and failed readback hold completion, and retry recovers the same transaction', () => {
  const storage = memoryStorage();
  const baseSet = storage.setItem.bind(storage);
  let failWrite = true;
  storage.setItem = (key, value) => { if (failWrite) { failWrite = false; throw new Error('quota'); } baseSet(key, value); };
  const first = commitGermanChapter('amari', 0, 'attempt_retry1', storage);
  assert.equal(first.ok, false);
  assert.equal(readGermanChapterProgress('amari', storage).progress.completedChapterIds.length, 0);

  let failReadback = true;
  let justWrote = false;
  const get = storage.getItem.bind(storage);
  const set = storage.setItem.bind(storage);
  storage.setItem = (key, value) => { set(key, value); justWrote = true; };
  storage.getItem = (key) => {
    if (key === germanChapterProgressKey('amari') && justWrote && failReadback) { failReadback = false; justWrote = false; return null; }
    return get(key);
  };
  const second = commitGermanChapter('amari', 0, 'attempt_retry1', storage);
  assert.equal(second.ok, false);
  storage.getItem = get;
  const recovered = commitGermanChapter('amari', 0, 'attempt_retry2', storage);
  assert.equal(recovered.ok, true);
  assert.equal(recovered.receipt.transactionId, 'attempt_retry1');
  assert.equal(recovered.rewardDelta, 1);
});

test('chapter order unlocks naturally and unknown valid canonical metadata survives updates', () => {
  const storage = memoryStorage({
    [germanChapterProgressKey('amari')]: JSON.stringify({ version: 1, unlockedChapterIndex: 0, completedChapterIds: [], chapterReceipts: [], importedNote: { source: 'old client' } }),
  });
  assert.equal(commitGermanChapter('amari', 1, 'blocked_try', storage).status, 'locked');
  const first = commitGermanChapter('amari', 0, 'first_ok', storage);
  assert.equal(first.progress.unlockedChapterIndex, 1);
  const raw = JSON.parse(storage.getItem(germanChapterProgressKey('amari')));
  assert.deepEqual(raw.importedNote, { source: 'old client' });
  assert.equal(commitGermanChapter('amari', 1, 'second_ok', storage).ok, true);
});

test('each of the three named chapters gets one pending receipt and each later clear is reward-free', () => {
  const storage = memoryStorage();
  const ids = ['first_a', 'second_a', 'third_a'];
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const result = commitGermanChapter('amari', chapter, ids[chapter], storage);
    assert.equal(result.ok, true);
    assert.equal(result.rewardDelta, 1);
  }
  const progress = readGermanChapterProgress('amari', storage);
  assert.deepEqual(progress.progress.completedChapterIds, ['colour-painter', 'vehicle-workshop', 'direction-driver']);
  assert.equal(pendingGermanChapterRewards(progress.storedProgress).length, 3);
  for (const transactionId of ids) assert.equal(markGermanChapterRewardClaimed('amari', transactionId, storage).ok, true);
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const replay = commitGermanChapter('amari', chapter, `replay_${chapter}`, storage);
    assert.equal(replay.rewardDelta, 0);
    assert.equal(replay.receipt.transactionId, ids[chapter]);
  }
});

test('marking a receipt keeps effective legacy unlocks in the returned progress', () => {
  const storage = memoryStorage({
    [germanChapterProgressKey('amari')]: JSON.stringify({
      version: 1,
      unlockedChapterIndex: 0,
      completedChapterIds: ['colour-painter'],
      chapterReceipts: [{ transactionId: 'old_pending', chapterId: 'colour-painter', rewardDelta: 1, parentClaimed: false }],
    }),
    amari_game_levels_v1: JSON.stringify({ german: { current: 0, unlocked: 2 } }),
  });
  const marked = markGermanChapterRewardClaimed('amari', 'old_pending', storage);
  assert.equal(marked.ok, true);
  assert.equal(marked.progress.unlockedChapterIndex, 2);
  assert.deepEqual(marked.progress.completedChapterIds, ['colour-painter']);
});

test('pending multi-chapter parent claims drain sequentially and keep later receipts retryable', async () => {
  const storage = memoryStorage();
  const ids = ['queue_first', 'queue_second', 'queue_third'];
  for (let chapter = 0; chapter < 3; chapter += 1) commitGermanChapter('amari', chapter, ids[chapter], storage);
  let active = 0;
  let maxActive = 0;
  const firstCalls = [];
  const partial = await drainPendingGermanChapterRewards(readGermanChapterProgress('amari', storage).storedProgress, async (receipt) => {
    active += 1; maxActive = Math.max(maxActive, active); firstCalls.push(receipt.transactionId);
    await new Promise((resolve) => setTimeout(resolve, 1));
    active -= 1;
    if (receipt.transactionId === 'queue_second') return false;
    return markGermanChapterRewardClaimed('amari', receipt.transactionId, storage).ok;
  });
  assert.deepEqual(firstCalls, ['queue_first', 'queue_second']);
  assert.equal(maxActive, 1);
  assert.equal(partial.ok, false);
  assert.equal(partial.confirmed, 1);
  assert.deepEqual(partial.remaining.map(({ transactionId }) => transactionId), ['queue_second', 'queue_third']);

  const retryCalls = [];
  const recovered = await drainPendingGermanChapterRewards(readGermanChapterProgress('amari', storage).storedProgress, async (receipt) => {
    retryCalls.push(receipt.transactionId);
    await new Promise((resolve) => setTimeout(resolve, 1));
    return markGermanChapterRewardClaimed('amari', receipt.transactionId, storage).ok;
  });
  assert.deepEqual(retryCalls, ['queue_second', 'queue_third']);
  assert.equal(recovered.ok, true);
  assert.deepEqual(pendingGermanChapterRewards(readGermanChapterProgress('amari', storage).storedProgress), []);
});
