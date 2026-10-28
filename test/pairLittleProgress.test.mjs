import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activePairLevelAfterResult, commitPairLittleResult, getPairLittleStorage, pairLittleProgressKey, pairRunActionLabel, readPairLittleProgress,
} from '../src/data/pairLittleProgress.js';

const mapStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
};

test('Pair 5 progress fails closed on storage getters, unreadable and malformed shared maps', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: Object.defineProperty({}, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }) });
    assert.equal(getPairLittleStorage(), null);
    assert.equal(readPairLittleProgress('askia', 'fuelup', false).ok, false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else delete globalThis.window;
  }

  let writes = 0;
  const blocked = { getItem() { throw new DOMException('blocked', 'SecurityError'); }, setItem() { writes += 1; } };
  assert.equal(commitPairLittleResult({ playerId: 'askia', gameId: 'rocketbuilder', bigKid: false, stars: 3, transactionId: 'run-a', storage: blocked }).ok, false);
  assert.equal(writes, 0);

  const malformed = mapStorage({ askia_little_progress: '{bad json' });
  assert.equal(commitPairLittleResult({ playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'run-b', storage: malformed }).ok, false);
  assert.equal(malformed.values.get('askia_little_progress'), '{bad json');

  const empty = mapStorage({ askia_little_progress: '' });
  assert.equal(commitPairLittleResult({ playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'run-empty', storage: empty }).ok, false);
  assert.equal(empty.values.get('askia_little_progress'), '');
});

test('Pair 6 Fire and Ladder results persist, grant fresh rewards once, and migrate old progress conservatively', () => {
  for (const gameId of ['firerescue', 'ladder']) {
    let blockedWrites = 0;
    const unreadable = { getItem() { throw new DOMException('blocked read', 'SecurityError'); }, setItem() { blockedWrites += 1; } };
    const readFailure = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-blocked-read`, storage: unreadable,
    });
    assert.equal(readFailure.ok, false);
    assert.equal(blockedWrites, 0, `${gameId} must not write when the shared map cannot be read`);

    const key = pairLittleProgressKey('askia');
    const preserved = mapStorage({ [key]: JSON.stringify({ memory: { level: 1, plays: 2, best: 2 } }) });
    const original = preserved.getItem(key);
    const quota = { getItem: (k) => preserved.getItem(k), setItem() { throw new DOMException('quota', 'QuotaExceededError'); } };
    const writeFailure = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-blocked-write`, storage: quota,
    });
    assert.equal(writeFailure.ok, false);
    assert.equal(preserved.getItem(key), original, `${gameId} blocked write preserves siblings and old bytes`);

    const retryStore = mapStorage();
    let failReadback = true;
    const flaky = {
      getItem(k) {
        if (failReadback && retryStore.getItem(k)?.includes('pairTransactionId')) {
          failReadback = false;
          throw new DOMException('readback unavailable', 'SecurityError');
        }
        return retryStore.getItem(k);
      },
      setItem: (k, value) => retryStore.setItem(k, value),
    };
    const failedReadback = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-readback-retry`, storage: flaky,
    });
    assert.equal(failedReadback.ok, false);
    assert.equal(JSON.parse(retryStore.getItem(key))[gameId].plays, 1);
    const recovered = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-readback-retry`, storage: retryStore,
    });
    assert.equal(recovered.ok, true);
    assert.equal(recovered.recovered, true);
    assert.equal(recovered.rewardPoints, 8);
    assert.equal(JSON.parse(retryStore.getItem(key))[gameId].plays, 1, 'Retry recovers the same completion without adding another play');

    const fresh = mapStorage();
    const first = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-fresh`, storage: fresh,
    });
    assert.equal(first.ok, true, `${gameId} fresh first completion saves`);
    assert.equal(first.rewardPoints, 8);
    assert.equal(first.level, 1);
    const committed = fresh.getItem(pairLittleProgressKey('askia'));
    const retry = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0,
      transactionId: `${gameId}-fresh`, storage: fresh,
    });
    assert.equal(retry.recovered, true);
    assert.equal(retry.rewardPoints, 8);
    assert.equal(fresh.getItem(pairLittleProgressKey('askia')), committed, 'same transaction retry does not increment a second time');
    const replay = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 1, playedLevel: 0,
      transactionId: `${gameId}-replay`, storage: fresh,
    });
    assert.equal(replay.ok, true);
    assert.equal(replay.rewardPoints, 0);
    assert.equal(JSON.parse(fresh.getItem(pairLittleProgressKey('askia')))[gameId].plays, 2);
    const secondReplay = commitPairLittleResult({
      playerId: 'askia', gameId, bigKid: false, stars: 3, expectedLevel: 1, playedLevel: 0,
      transactionId: `${gameId}-second-replay`, storage: fresh,
    });
    assert.equal(secondReplay.ok, true);
    assert.equal(secondReplay.rewardPoints, 0);
    assert.equal(JSON.parse(fresh.getItem(pairLittleProgressKey('askia')))[gameId].pairBestByLevel[0], 3);

    const legacy = mapStorage({ [pairLittleProgressKey('amari')]: JSON.stringify({
      [gameId]: { level: 2, plays: 5, best: 2 },
    }) });
    const migrated = commitPairLittleResult({
      playerId: 'amari', gameId, bigKid: true, stars: 3, expectedLevel: 2, playedLevel: 2,
      transactionId: `${gameId}-legacy`, storage: legacy,
    });
    assert.equal(migrated.ok, true);
    assert.equal(migrated.rewardPoints, 0, 'an old earned/unscored row cannot farm a new pair reward');
    assert.equal(JSON.parse(legacy.getItem(pairLittleProgressKey('amari')))[gameId].pairLegacyRewardThrough, 2);
  }
});

test('Pair 5 save retries preserve a pending transaction without double-counting and isolate children', () => {
  const storage = mapStorage({
    askia_little_progress: JSON.stringify({ ladder: { level: 2, plays: 3, best: 2 }, fuelup: { level: 1, plays: 4, best: 2 } }),
  });
  const key = pairLittleProgressKey('askia');
  const original = storage.getItem(key);
  let failReadback = true;
  const flaky = {
    getItem(k) {
      if (failReadback && storage.values.get(k)?.includes('pairTransactionId')) {
        failReadback = false;
        throw new DOMException('readback unavailable', 'SecurityError');
      }
      return storage.getItem(k);
    },
    setItem: (k, v) => storage.setItem(k, v),
  };
  const first = commitPairLittleResult({ playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'run-c', storage: flaky });
  assert.equal(first.ok, false);
  const savedAfterReadbackError = JSON.parse(storage.getItem(key));
  assert.equal(savedAfterReadbackError.ladder.plays, 3);
  assert.equal(savedAfterReadbackError.fuelup.plays, 5);
  assert.equal(savedAfterReadbackError.fuelup.level, 2);
  assert.equal(savedAfterReadbackError.fuelup.pairTransactionId, 'run-c');

  const retry = commitPairLittleResult({ playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'run-c', storage });
  assert.deepEqual({ ok: retry.ok, recovered: retry.recovered, plays: retry.plays, level: retry.level, levelUp: retry.levelUp, playedLevel: retry.playedLevel }, {
    ok: true, recovered: true, plays: 5, level: 2, levelUp: true, playedLevel: 1,
  });
  assert.equal(JSON.parse(storage.getItem(key)).fuelup.plays, 5);
  assert.equal(storage.getItem('amari_little_progress'), null);
  assert.notEqual(storage.getItem(key), original);
});

test('Pair 5 write failure and corrupt target entry do not overwrite existing child data', () => {
  const key = pairLittleProgressKey('amari');
  const original = JSON.stringify({ rocketbuilder: { level: 3, plays: 6, best: 3 }, memory: { level: 4, plays: 2, best: 2 } });
  const store = mapStorage({ [key]: original });
  const failingWrite = { getItem: (k) => store.getItem(k), setItem() { throw new DOMException('quota', 'QuotaExceededError'); } };
  assert.equal(commitPairLittleResult({ playerId: 'amari', gameId: 'rocketbuilder', bigKid: true, stars: 2, transactionId: 'run-d', storage: failingWrite }).ok, false);
  assert.equal(store.getItem(key), original);

  const corruptTarget = mapStorage({ [key]: JSON.stringify({ rocketbuilder: { level: 99, plays: 1, best: 3 }, memory: { level: 4, plays: 2, best: 2 } }) });
  const before = corruptTarget.getItem(key);
  assert.equal(commitPairLittleResult({ playerId: 'amari', gameId: 'rocketbuilder', bigKid: true, stars: 3, transactionId: 'run-e', storage: corruptTarget }).ok, false);
  assert.equal(corruptTarget.getItem(key), before);
});

test('Pair 5 merges an older practice result without lowering a concurrent higher unlock', () => {
  const key = pairLittleProgressKey('askia');
  const original = JSON.stringify({ fuelup: { level: 4, plays: 8, best: 3 } });
  const storage = mapStorage({ [key]: original });
  const result = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'stale-run', expectedLevel: 2, playedLevel: 0, storage,
  });
  assert.equal(result.ok, true);
  assert.equal(result.previous, 4);
  assert.equal(result.level, 4);
  assert.equal(result.playedLevel, 0);
  assert.equal(result.levelUp, false);
  assert.equal(JSON.parse(storage.getItem(key)).fuelup.level, 4);
  assert.equal(JSON.parse(storage.getItem(key)).fuelup.pairBestByLevel[0], 3);

  const staleLower = mapStorage({ [key]: JSON.stringify({ fuelup: { level: 1, plays: 1, best: 1 } }) });
  const before = staleLower.getItem(key);
  const rejected = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, transactionId: 'stale-lower', expectedLevel: 2, playedLevel: 1, storage: staleLower,
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.reason, 'level-changed');
  assert.equal(staleLower.getItem(key), before);
});

test('Pair 5 can read existing completion rows from the shared per-child map without mutating them', () => {
  const key = pairLittleProgressKey('amari');
  const original = JSON.stringify({
    ladder: { level: 2, plays: 9, best: 2 },
    rocketbuilder: { level: 3, plays: 5, best: 2 },
  });
  const storage = mapStorage({ [key]: original });
  const result = readPairLittleProgress('amari', 'rocketbuilder', true, storage);
  assert.equal(result.ok, true);
  assert.equal(result.level, 3);
  assert.deepEqual(result.gameRecord, { level: 3, plays: 5, best: 2 });
  assert.equal(storage.getItem(key), original);
});

test('Pair 5 rewards only a newly earned per-level best and keeps replays idempotent', () => {
  const key = pairLittleProgressKey('askia');
  const storage = mapStorage({ [key]: JSON.stringify({ fuelup: {
    level: 4,
    plays: 8,
    best: 3,
    pairBestByLevel: { 4: 3 },
    pairTransactionId: 'previous-run',
    pairPreviousLevel: 4,
    pairPlayedLevel: 4,
    pairLevelUp: false,
    pairRewardPoints: 0,
  } }) });
  const replay = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 4, transactionId: 'same-best-replay', storage,
  });
  assert.equal(replay.ok, true);
  assert.equal(replay.rewardPoints, 0);
  const recoveredReplay = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 4, transactionId: 'same-best-replay', storage,
  });
  assert.equal(recoveredReplay.recovered, true);
  assert.equal(recoveredReplay.rewardPoints, 0);
  assert.equal(JSON.parse(storage.getItem(key)).fuelup.plays, 9);

  const improvedStore = mapStorage({ [key]: JSON.stringify({ fuelup: {
    level: 4,
    plays: 3,
    best: 2,
    pairBestByLevel: { 4: 2 },
    pairTransactionId: 'earlier-run',
    pairPreviousLevel: 4,
    pairPlayedLevel: 4,
    pairLevelUp: false,
    pairRewardPoints: 6,
  } }) });
  const improvement = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 4, transactionId: 'better-replay', storage: improvedStore,
  });
  assert.equal(improvement.ok, true);
  assert.equal(improvement.rewardPoints, 2);
  assert.equal(JSON.parse(improvedStore.getItem(key)).fuelup.pairBestByLevel[4], 3);
});

test('Pair 5 migrates legacy game-wide saves without replay rewards or invented per-level history', () => {
  const key = pairLittleProgressKey('askia');
  const storage = mapStorage({ [key]: JSON.stringify({
    fuelup: { level: 2, plays: 7, best: 2, unrelatedLegacyField: 'preserved' },
  }) });

  const currentReplay = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 2, playedLevel: 2, transactionId: 'legacy-current-replay', storage,
  });
  assert.equal(currentReplay.ok, true);
  assert.equal(currentReplay.rewardPoints, 0);
  let saved = JSON.parse(storage.getItem(key)).fuelup;
  assert.equal(saved.pairLegacyRewardThrough, 2);
  assert.deepEqual(saved.pairBestByLevel, { 2: 3 });
  assert.equal(saved.level, 3);
  assert.equal(saved.plays, 8);
  assert.equal(saved.best, 3);
  assert.equal(saved.unrelatedLegacyField, 'preserved');

  const practiceReplay = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 2, playedLevel: 0, transactionId: 'legacy-prior-practice', storage,
  });
  assert.equal(practiceReplay.ok, true);
  assert.equal(practiceReplay.rewardPoints, 0);
  saved = JSON.parse(storage.getItem(key)).fuelup;
  assert.equal(saved.pairLegacyRewardThrough, 2);
  assert.deepEqual(saved.pairBestByLevel, { 0: 3, 2: 3 });

  // Finishing the highest legacy level unlocks a genuinely new level; its
  // first result can earn points once, while repeated results cannot.
  const unlock = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 2, playedLevel: 2, transactionId: 'legacy-levelup', storage,
  });
  assert.equal(unlock.ok, true);
  assert.equal(unlock.rewardPoints, 0);
  assert.equal(unlock.level, 3);
  const newLevel = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 3, playedLevel: 3, transactionId: 'first-new-level', storage,
  });
  assert.equal(newLevel.ok, true);
  assert.equal(newLevel.rewardPoints, 8);
  const newLevelReplay = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 4, playedLevel: 3, transactionId: 'new-level-replay', storage,
  });
  assert.equal(newLevelReplay.ok, true);
  assert.equal(newLevelReplay.rewardPoints, 0);
  saved = JSON.parse(storage.getItem(key)).fuelup;
  assert.equal(saved.pairLegacyRewardThrough, 2);
  assert.equal(saved.pairBestByLevel[3], 3);
  assert.equal(saved.level, 4);
});

test('Pair 5 migrates earlier pair metadata without erasing known per-level history', () => {
  const key = pairLittleProgressKey('askia');
  const storage = mapStorage({ [key]: JSON.stringify({ fuelup: {
    level: 3,
    plays: 4,
    best: 3,
    pairBestByLevel: { 3: 3 },
    pairTransactionId: 'old-pair-run',
    pairPreviousLevel: 3,
    pairPlayedLevel: 3,
    pairLevelUp: false,
    pairRewardPoints: 8,
  } }) });
  const result = commitPairLittleResult({
    playerId: 'askia', gameId: 'fuelup', bigKid: false, stars: 3, expectedLevel: 3, playedLevel: 3, transactionId: 'old-pair-replay', storage,
  });
  assert.equal(result.ok, true);
  assert.equal(result.rewardPoints, 0);
  assert.equal(JSON.parse(storage.getItem(key)).fuelup.pairLegacyRewardThrough, -1);
});

test('Pair 5 fresh Askia and Amari saves earn first completion and new-level rewards exactly once', () => {
  for (const { playerId, bigKid } of [{ playerId: 'askia', bigKid: false }, { playerId: 'amari', bigKid: true }]) {
    const key = pairLittleProgressKey(playerId);
    const storage = mapStorage();
    const initialLevel = readPairLittleProgress(playerId, 'rocketbuilder', bigKid, storage).level;
    const first = commitPairLittleResult({
      playerId, gameId: 'rocketbuilder', bigKid, stars: 3, expectedLevel: initialLevel, playedLevel: initialLevel, transactionId: `${playerId}-first`, storage,
    });
    assert.equal(first.ok, true);
    assert.equal(first.rewardPoints, 8);
    assert.equal(first.level, initialLevel + 1);
    assert.equal(JSON.parse(storage.getItem(key)).rocketbuilder.pairLegacyRewardThrough, -1);

    const replay = commitPairLittleResult({
      playerId, gameId: 'rocketbuilder', bigKid, stars: 3, expectedLevel: first.level, playedLevel: initialLevel, transactionId: `${playerId}-replay`, storage,
    });
    assert.equal(replay.ok, true);
    assert.equal(replay.rewardPoints, 0);

    const nextLevel = commitPairLittleResult({
      playerId, gameId: 'rocketbuilder', bigKid, stars: 3, expectedLevel: first.level, playedLevel: first.level, transactionId: `${playerId}-new-level`, storage,
    });
    assert.equal(nextLevel.ok, true);
    assert.equal(nextLevel.rewardPoints, 8);
  }
});

test('Pair 5 keeps legacy rewards suppressed after a low-star replay while fresh saves may improve', () => {
  const legacyKey = pairLittleProgressKey('amari');
  const legacy = mapStorage({ [legacyKey]: JSON.stringify({ fuelup: { level: 2, plays: 5, best: 2 } }) });
  const lowLegacyReplay = commitPairLittleResult({
    playerId: 'amari', gameId: 'fuelup', bigKid: true, stars: 1, expectedLevel: 2, playedLevel: 2, transactionId: 'legacy-one-star', storage: legacy,
  });
  assert.equal(lowLegacyReplay.ok, true);
  assert.equal(lowLegacyReplay.rewardPoints, 0);
  const improvedLegacyReplay = commitPairLittleResult({
    playerId: 'amari', gameId: 'fuelup', bigKid: true, stars: 3, expectedLevel: 2, playedLevel: 2, transactionId: 'legacy-three-star', storage: legacy,
  });
  assert.equal(improvedLegacyReplay.ok, true);
  assert.equal(improvedLegacyReplay.rewardPoints, 0);
  assert.equal(JSON.parse(legacy.getItem(legacyKey)).fuelup.pairLegacyRewardThrough, 2);
  assert.equal(JSON.parse(legacy.getItem(legacyKey)).fuelup.pairBestByLevel[2], 3);

  const freshKey = pairLittleProgressKey('askia');
  const fresh = mapStorage();
  const first = commitPairLittleResult({
    playerId: 'askia', gameId: 'rocketbuilder', bigKid: false, stars: 1, playedLevel: 0, transactionId: 'fresh-one-star', storage: fresh,
  });
  assert.equal(first.rewardPoints, 4);
  const improvement = commitPairLittleResult({
    playerId: 'askia', gameId: 'rocketbuilder', bigKid: false, stars: 3, expectedLevel: 0, playedLevel: 0, transactionId: 'fresh-three-star', storage: fresh,
  });
  assert.equal(improvement.rewardPoints, 4);
  assert.equal(JSON.parse(fresh.getItem(freshKey)).rocketbuilder.pairLegacyRewardThrough, -1);
});

test('Pair 5 keeps an earlier practice level selected and names the actual next action', () => {
  const practice = { level: 4, playedLevel: 1, levelUp: false };
  assert.equal(activePairLevelAfterResult(practice), 1);
  assert.equal(pairRunActionLabel(1, practice), 'Play level 2');
  assert.equal(pairRunActionLabel(4, practice), 'Play level 5');

  const unlocked = { level: 3, playedLevel: 2, levelUp: true };
  assert.equal(activePairLevelAfterResult(unlocked), 3);
  assert.equal(pairRunActionLabel(3, unlocked), 'Next level 4');
  assert.equal(pairRunActionLabel(2, unlocked), 'Play level 3');
});
