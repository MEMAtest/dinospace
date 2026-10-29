import test from 'node:test';
import assert from 'node:assert/strict';
import { DINO_DETECTIVE_WORLDS, createDinoDetectiveRun } from '../src/data/dinoDetectiveBatch3.js';
import {
  DINO_DETECTIVE_PROGRESS_KEY,
  DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS,
  DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS,
  commitDinoDetectiveCompletion,
  dinoRewardReceiptsToReconcile,
  getDinoDetectiveProgress,
  readDinoDetectiveProgress,
  recordDinoDetectiveCompletion,
  rememberDinoDetectiveRun,
} from '../src/data/dinoDetectiveProgress.js';

const memoryStorage = (initial = new Map()) => ({
  values: initial,
  getItem(key) { return this.values.get(key) ?? null; },
  setItem(key, value) { this.values.set(key, value); },
});
const roundIds = (worldId) => Array.from({ length: 5 }, (_, index) => `${worldId}:round-${index + 1}`);
const complete = (playerId, worldIndex, stars, storage) => commitDinoDetectiveCompletion(
  playerId, DINO_DETECTIVE_WORLDS[worldIndex].id, stars, roundIds(DINO_DETECTIVE_WORLDS[worldIndex].id), storage,
);

test('world rewards unlock sequentially, use the legacy per-player key and only award improved best stars', () => {
  const store = memoryStorage();
  const run = createDinoDetectiveRun(0, 17);
  assert.equal(rememberDinoDetectiveRun('one', DINO_DETECTIVE_WORLDS[1].id, run.signature, store), null);
  assert.equal(recordDinoDetectiveCompletion('one', DINO_DETECTIVE_WORLDS[1].id, 3, roundIds(DINO_DETECTIVE_WORLDS[1].id), store), null);
  const first = complete('one', 0, 1, store);
  assert.equal(first.ok, true);
  assert.equal(first.awardedStars, 1);
  assert.equal(first.newlyEarnedSticker, true);
  assert.equal(first.progress.unlockedWorldIndex, 1);
  assert.deepEqual(first.progress.earnedWorldStickerIds, [DINO_DETECTIVE_WORLDS[0].stickerId]);
  const key = [...store.values.keys()][0];
  assert.equal(key, `one_${DINO_DETECTIVE_PROGRESS_KEY}`);
  const improved = complete('one', 0, 3, store);
  assert.equal(improved.awardedStars, 2);
  assert.equal(improved.newlyEarnedSticker, false);
  assert.equal(complete('one', 0, 3, store).awardedStars, 0);
  assert.equal(complete('one', 1, 3, store).progress.unlockedWorldIndex, 2);
});

test('progress is isolated by child and recent-run history is read back after save', () => {
  const store = memoryStorage();
  const run = createDinoDetectiveRun(0, 93);
  const saved = rememberDinoDetectiveRun('amari', 'jungle', run.signature, store);
  assert.equal(saved.ok, true);
  assert.deepEqual(readDinoDetectiveProgress('amari', store).progress.recentRunSignatures.jungle, [run.signature]);
  assert.deepEqual(getDinoDetectiveProgress('askia', store).completedWorldIds, []);
  assert.equal([...store.values.keys()][0], `amari_${DINO_DETECTIVE_PROGRESS_KEY}`);
  const amariStore = memoryStorage();
  assert.equal(complete('amari', 0, 3, amariStore).ok, true);
  assert.equal([...amariStore.values.keys()][0], `amari_${DINO_DETECTIVE_PROGRESS_KEY}`);
});

test('read-only collection getter recognizes the exact historical shelf shape while commits remain strict', () => {
  const world = DINO_DETECTIVE_WORLDS[0];
  const key = `one_${DINO_DETECTIVE_PROGRESS_KEY}`;
  const raw = JSON.stringify({
    version: 1,
    completedWorldIds: [world.id],
    earnedWorldStickerIds: [world.stickerId],
  });
  const values = new Map([[key, raw]]);
  let writes = 0;
  const store = memoryStorage(values);
  store.setItem = () => { writes += 1; };

  const shelfProgress = getDinoDetectiveProgress('one', store);
  assert.deepEqual(shelfProgress.completedWorldIds, [world.id]);
  assert.deepEqual(shelfProgress.earnedWorldStickerIds, [world.stickerId]);
  assert.equal(readDinoDetectiveProgress('one', store).ok, false);
  const commit = complete('one', 0, 3, store);
  assert.equal(commit.ok, false);
  assert.equal(commit.reason, 'invalid-record');
  assert.equal(writes, 0);
  assert.equal(values.get(key), raw);
});

test('storage getter and unreadable records fail closed without calling setItem', () => {
  let writes = 0;
  const storage = { getItem() { throw new Error('blocked read'); }, setItem() { writes += 1; } };
  const result = complete('one', 0, 3, storage);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unreadable');
  assert.equal(writes, 0);

  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, get() { throw new Error('SecurityError'); } });
    assert.equal(readDinoDetectiveProgress('one').ok, false);
    assert.equal(readDinoDetectiveProgress('one').reason, 'unavailable');
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
  }
});

test('empty, malformed and unsupported records are preserved byte-for-byte', () => {
  for (const raw of ['', '{broken', JSON.stringify({ version: 99, completedWorldIds: ['jungle'] })]) {
    const key = `one_${DINO_DETECTIVE_PROGRESS_KEY}`;
    const values = new Map([[key, raw]]);
    let writes = 0;
    const storage = { getItem: (name) => values.get(name) ?? null, setItem: () => { writes += 1; } };
    const result = complete('one', 0, 3, storage);
    assert.equal(result.ok, false);
    assert.equal(result.reason, raw === '' || raw === '{broken' ? 'malformed' : 'invalid-record');
    assert.equal(writes, 0);
    assert.equal(values.get(key), raw);
  }
});

test('blocked write and failed readback award nothing; retry commits one durable delta', () => {
  let allowWrite = false;
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) { if (allowWrite) values.set(key, value); },
  };
  const blocked = complete('one', 0, 3, storage);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'readback-failed');
  assert.deepEqual(getDinoDetectiveProgress('one', storage).completedWorldIds, []);
  allowWrite = true;
  const retry = complete('one', 0, 3, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.awardedStars, 3);
  assert.equal(retry.newlyEarnedSticker, true);
  const replay = complete('one', 0, 3, storage);
  assert.equal(replay.awardedStars, 0);
  assert.equal(replay.newlyEarnedSticker, false);
});

test('completion Retry recovers the same receipt after write succeeded but readback failed', () => {
  const values = new Map();
  let failNextRead = false;
  const storage = {
    getItem(key) {
      if (failNextRead) { failNextRead = false; throw new Error('temporary readback failure'); }
      return values.get(key) ?? null;
    },
    setItem(key, value) { values.set(key, value); failNextRead = true; },
  };
  const transactionId = 'dino-jungle-completion-1';
  const first = commitDinoDetectiveCompletion('one', 'jungle', 3, roundIds('jungle'), storage, transactionId);
  assert.equal(first.ok, false);
  assert.equal(first.reason, 'readback-failed');
  const retry = commitDinoDetectiveCompletion('one', 'jungle', 3, roundIds('jungle'), storage, transactionId);
  assert.equal(retry.ok, true);
  assert.equal(retry.recoveredTransaction, true);
  assert.equal(retry.transactionId, transactionId);
  assert.equal(retry.awardedStars, 3);
  assert.equal(retry.newlyEarnedSticker, true);
  assert.deepEqual(retry.progress.completedWorldIds, ['jungle']);
  assert.deepEqual(retry.progress.earnedWorldStickerIds, [DINO_DETECTIVE_WORLDS[0].stickerId]);
  assert.equal(commitDinoDetectiveCompletion('one', 'jungle', 2, roundIds('jungle'), storage, transactionId).reason, 'transaction-mismatch');
});

test('reward reconciliation enumerates only positive durable receipts and never legacy completion rows', () => {
  const progress = {
    completedWorldIds: ['jungle', 'river'],
    completionReceipts: [
      { id: 'positive-a', awardedStars: 2 },
      { id: 'no-delta', awardedStars: 0 },
      { id: '', awardedStars: 1 },
      { id: 'bad-delta', awardedStars: 1.5 },
    ],
  };
  assert.deepEqual(dinoRewardReceiptsToReconcile(progress), [{ id: 'positive-a', awardedStars: 2 }]);
  assert.deepEqual(dinoRewardReceiptsToReconcile({ ...progress, completionReceipts: undefined }), []);
  assert.deepEqual(dinoRewardReceiptsToReconcile(null), []);
});

test('positive award receipts survive all worlds while only the newest eight zero-delta receipts remain', () => {
  const store = memoryStorage();
  const positiveIds = [];
  for (let worldIndex = 0; worldIndex < DINO_DETECTIVE_WORLDS.length; worldIndex += 1) {
    const worldId = DINO_DETECTIVE_WORLDS[worldIndex].id;
    for (let stars = 1; stars <= 3; stars += 1) {
      const id = `all-worlds-${worldIndex}-${stars}`;
      positiveIds.push(id);
      const saved = commitDinoDetectiveCompletion('one', worldId, stars, roundIds(worldId), store, id);
      assert.equal(saved.ok, true);
      assert.equal(saved.awardedStars, 1);
    }
  }
  for (let index = 0; index < DINO_DETECTIVE_WORLDS.length; index += 1) {
    const worldId = DINO_DETECTIVE_WORLDS[index].id;
    assert.equal(commitDinoDetectiveCompletion('one', worldId, 3, roundIds(worldId), store, `zero-replay-${index}`).awardedStars, 0);
  }
  const saved = readDinoDetectiveProgress('one', store);
  const receipts = saved.progress.completionReceipts;
  const positive = receipts.filter(({ awardedStars }) => awardedStars > 0);
  const zero = receipts.filter(({ awardedStars }) => awardedStars === 0);
  assert.equal(DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS, 36);
  assert.equal(DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS, 8);
  assert.equal(positive.length, DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS);
  assert.equal(zero.length, DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS);
  assert.ok(positiveIds.every((id) => positive.some((receipt) => receipt.id === id)));
  assert.deepEqual(zero.map(({ id }) => id), Array.from({ length: 8 }, (_, index) => `zero-replay-${index + 4}`));
  assert.equal(dinoRewardReceiptsToReconcile(saved.progress).length, DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS);
});

test('valid unknown metadata survives game-specific progress commits', () => {
  const key = `one_${DINO_DETECTIVE_PROGRESS_KEY}`;
  const prior = {
    version: 1, unlockedWorldIndex: 0, completedWorldIds: [], bestStars: {},
    earnedWorldStickerIds: [], recentRunSignatures: {}, familyMeta: { marker: 'keep-this' },
  };
  const store = memoryStorage(new Map([[key, JSON.stringify(prior)]]));
  const result = complete('one', 0, 2, store);
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(store.values.get(key)).familyMeta, prior.familyMeta);
});

test('invalid, locked, and malformed completion payloads never mutate progress', () => {
  const store = memoryStorage();
  const before = complete('one', 0, 3, store);
  const snapshot = [...store.values.entries()];
  assert.equal(commitDinoDetectiveCompletion('one', 'jungle', 0, roundIds('jungle'), store).reason, 'invalid-completion');
  assert.equal(commitDinoDetectiveCompletion('one', 'river', 3, roundIds('river'), store).reason, 'locked-world');
  assert.deepEqual([...store.values.entries()], snapshot);
  assert.equal(before.ok, true);
});
