import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commitWordsSessionReward,
  commitWordsSessionLevel,
  legacyWordsSessionProgressKey,
  positiveWordsRewardTransactions,
  readWordsSessionProgress,
  wordsSessionProgressStorageKey,
} from '../src/data/wordsSessionProgress.js';

function makeStorage(entries = []) {
  const values = new Map(entries);
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
  };
}

test('fresh child gets an isolated progress record and first completed level pays its actual score once', () => {
  const storage = makeStorage();
  assert.equal(wordsSessionProgressStorageKey('amari'), 'amari_words_session_progress_v1:amari');
  assert.equal(wordsSessionProgressStorageKey('askia'), 'amari_words_session_progress_v1:askia');
  const fresh = readWordsSessionProgress('amari', storage);
  assert.equal(fresh.ok, true);
  assert.equal(fresh.status, 'fresh');
  assert.equal(fresh.progress.legacyRewardThrough, -1);
  const saved = commitWordsSessionLevel('amari', 0, 2, 'run-a', storage);
  assert.equal(saved.ok, true);
  assert.equal(saved.rewardDelta, 2);
  assert.deepEqual(saved.progress.completedLevels, [0]);
  assert.equal(readWordsSessionProgress('askia', storage).status, 'fresh');
});

test('same attempt recovers after readback failure without paying twice', () => {
  const values = new Map();
  let reads = 0;
  const storage = {
    getItem(key) {
      reads += 1;
      if (reads === 3) throw new Error('readback unavailable');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) { values.set(key, value); },
  };
  const first = commitWordsSessionLevel('amari', 0, 4, 'retry-1', storage);
  assert.equal(first.ok, false);
  assert.equal(first.status, 'readback-failed');
  assert.equal(first.rewardDelta, 0);
  const retry = commitWordsSessionLevel('amari', 0, 4, 'retry-1', storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.status, 'recovered');
  assert.equal(retry.recovered, true);
  assert.equal(retry.rewardDelta, 4);
  assert.equal(retry.progress.bestPointsByLevel[0], 4);
  assert.equal(positiveWordsRewardTransactions(retry.progress).length, 1);
});

test('session completion keeps the same parent reward token across Retry and does not claim before local commit', () => {
  const storage = makeStorage();
  let parentCalls = 0;
  const tokens = [];
  const celebrate = (_message, amount, delay, gameId, options) => {
    parentCalls += 1;
    tokens.push(options.rewardToken);
    assert.equal(delay, 0);
    assert.equal(gameId, 'words');
    assert.equal(amount, 4);
    return parentCalls === 1 ? { persisted: false, awardedPoints: 0 } : { persisted: true, awardedPoints: 4 };
  };

  const held = commitWordsSessionReward('amari', 0, 4, 'level-1-attempt', celebrate, storage);
  assert.equal(held.ok, false);
  assert.equal(held.stage, 'reward');
  assert.deepEqual(held.progress.completedLevels, [0]);
  assert.equal(parentCalls, 1);

  const retry = commitWordsSessionReward('amari', 0, 4, 'level-1-attempt', celebrate, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.stage, 'complete');
  assert.equal(retry.rewardDelta, 4);
  assert.deepEqual(tokens, ['words:level-1-attempt', 'words:level-1-attempt']);

  let blockedCalls = 0;
  const blockedStorage = { getItem() { return null; }, setItem() { throw new Error('quota'); } };
  const blocked = commitWordsSessionReward('amari', 0, 4, 'blocked-attempt', () => { blockedCalls += 1; }, blockedStorage);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.stage, 'progress');
  assert.equal(blockedCalls, 0);
});

test('attempt id cannot be reused for a different result and no-op writes stay pending', () => {
  const storage = makeStorage();
  assert.equal(commitWordsSessionLevel('amari', 0, 2, 'same-id', storage).ok, true);
  const mismatch = commitWordsSessionLevel('amari', 0, 4, 'same-id', storage);
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.status, 'invalid');
  assert.equal(mismatch.rewardDelta, 0);

  const noOp = { getItem() { return null; }, setItem() {} };
  const blocked = commitWordsSessionLevel('amari', 0, 2, 'no-op', noOp);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.status, 'readback-failed');

  const writeBlocked = { getItem() { return null; }, setItem() { throw new Error('quota'); } };
  const writeError = commitWordsSessionLevel('amari', 0, 2, 'write-fail', writeBlocked);
  assert.equal(writeError.ok, false);
  assert.equal(writeError.status, 'write-failed');
});

test('only best-score improvements pay; every positive improvement receipt survives bounded zero replays', () => {
  const storage = makeStorage();
  const first = commitWordsSessionLevel('amari', 0, 2, 'first-2', storage);
  const replay = commitWordsSessionLevel('amari', 0, 2, 'replay-2', storage);
  const improve = commitWordsSessionLevel('amari', 0, 4, 'improve-4', storage);
  const finalImprove = commitWordsSessionLevel('amari', 0, 6, 'improve-6', storage);
  assert.deepEqual([first.rewardDelta, replay.rewardDelta, improve.rewardDelta, finalImprove.rewardDelta], [2, 0, 2, 2]);
  let progress = finalImprove.progress;
  for (let index = 0; index < 24; index += 1) {
    const result = commitWordsSessionLevel('amari', 0, 2, `zero-${index}`, storage);
    assert.equal(result.rewardDelta, 0);
    progress = result.progress;
  }
  assert.equal(positiveWordsRewardTransactions(progress).length, 3);
  assert.ok(positiveWordsRewardTransactions(progress).some(({ transactionId }) => transactionId === 'first-2'));
  assert.equal(Object.values(progress.transactions).filter((entry) => entry.rewardDelta === 0).length, 16);
  assert.equal(progress.bestPointsByLevel[0], 6);
});

test('legacy highest unlocked level permanently suppresses old rewards but new levels can earn', () => {
  const legacyKey = legacyWordsSessionProgressKey('amari');
  const legacyRaw = JSON.stringify({ addition: { current: 1, unlocked: 2 }, words: { current: 2, unlocked: 3 }, keep: { old: true } });
  const storage = makeStorage([[legacyKey, legacyRaw]]);
  const legacy = readWordsSessionProgress('amari', storage);
  assert.equal(legacy.status, 'legacy');
  assert.equal(legacy.progress.currentLevel, 2);
  assert.equal(legacy.progress.unlockedLevel, 3);
  assert.equal(legacy.progress.legacyRewardThrough, 3);
  assert.deepEqual(legacy.progress.completedLevels, [0, 1, 2]);

  const oldFirst = commitWordsSessionLevel('amari', 0, 2, 'old-2', storage);
  const oldImprovement = commitWordsSessionLevel('amari', 0, 4, 'old-4', storage);
  assert.equal(oldFirst.rewardDelta, 0);
  assert.equal(oldImprovement.rewardDelta, 0);
  assert.equal(oldImprovement.progress.bestPointsByLevel[0], 4);
  const oldTop = commitWordsSessionLevel('amari', 3, 6, 'old-top', storage);
  assert.equal(oldTop.rewardDelta, 0);
  const newLevel = commitWordsSessionLevel('amari', 4, 2, 'new-level', storage);
  assert.equal(newLevel.rewardDelta, 2);
  assert.equal(storage.getItem(legacyKey), legacyRaw);
});

test('a valid canonical record preserves unknown metadata on write', () => {
  const storage = makeStorage();
  const initial = commitWordsSessionLevel('amari', 0, 2, 'base', storage);
  const key = wordsSessionProgressStorageKey('amari');
  const raw = JSON.parse(storage.getItem(key));
  raw.migrationNote = { retained: true };
  storage.setItem(key, JSON.stringify(raw));
  const next = commitWordsSessionLevel('amari', 0, 4, 'higher', storage);
  assert.equal(next.ok, true);
  assert.deepEqual(JSON.parse(storage.getItem(key)).migrationNote, { retained: true });
  assert.equal(initial.ok, true);
});

test('all 18 possible positive improvement receipts survive more than the zero receipt limit', () => {
  const storage = makeStorage();
  const positiveIds = [];
  for (let level = 0; level < 6; level += 1) {
    for (const points of [2, 4, 6]) {
      const id = `positive-${level}-${points}`;
      const result = commitWordsSessionLevel('amari', level, points, id, storage);
      assert.equal(result.ok, true);
      assert.equal(result.rewardDelta, 2);
      positiveIds.push(id);
    }
  }
  for (let index = 0; index < 22; index += 1) {
    const result = commitWordsSessionLevel('amari', 5, 2, `later-zero-${index}`, storage);
    assert.equal(result.rewardDelta, 0);
  }
  const final = readWordsSessionProgress('amari', storage).progress;
  assert.equal(positiveWordsRewardTransactions(final).length, 18);
  assert.deepEqual(positiveWordsRewardTransactions(final).map(({ transactionId }) => transactionId).sort(), positiveIds.sort());
  assert.equal(Object.values(final.transactions).filter((entry) => entry.rewardDelta === 0).length, 16);
});

test('malformed, empty, blocked and unreadable records fail closed without overwriting bytes', () => {
  for (const raw of ['', '{broken', '[]']) {
    const key = wordsSessionProgressStorageKey('amari');
    const storage = makeStorage([[key, raw]]);
    const result = commitWordsSessionLevel('amari', 0, 2, 'no-write', storage);
    assert.equal(result.ok, false);
    assert.equal(storage.getItem(key), raw);
  }

  let writes = 0;
  const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { writes += 1; } };
  assert.equal(readWordsSessionProgress('amari', blocked).status, 'unreadable');
  assert.equal(commitWordsSessionLevel('amari', 0, 2, 'blocked', blocked).ok, false);
  assert.equal(writes, 0);

  const noStorage = readWordsSessionProgress('amari', null);
  assert.equal(noStorage.ok, false);
  assert.equal(noStorage.status, 'unavailable');
});

test('invalid unlocked prefix and out-of-order completion do not write', () => {
  const key = wordsSessionProgressStorageKey('amari');
  const malformed = {
    version: 1,
    currentLevel: 2,
    unlockedLevel: 2,
    completedLevels: [0, 2],
    bestPointsByLevel: { 0: 2, 1: 0, 2: 2, 3: 0, 4: 0, 5: 0 },
    legacyRewardThrough: -1,
    transactions: {},
  };
  const storage = makeStorage([[key, JSON.stringify(malformed)]]);
  const result = commitWordsSessionLevel('amari', 2, 4, 'gap', storage);
  assert.equal(result.ok, false);
  assert.equal(result.status, 'invalid');
  assert.deepEqual(JSON.parse(storage.getItem(key)), malformed);
  const fresh = makeStorage();
  assert.equal(commitWordsSessionLevel('amari', 1, 2, 'skip', fresh).status, 'locked');
  assert.equal(fresh.values.size, 0);
});
