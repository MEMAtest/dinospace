import test from 'node:test';
import assert from 'node:assert/strict';
import {
  commitPairLittleResult, getPendingPairLittleRewardReceipts, markPairLittleRewardReceiptClaimed,
  pairLittleProgressKey, readPairLittleProgress,
} from '../src/data/pairLittleProgress.js';

const storageWith = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
};

const commit = (storage, { stars, id, level = 0, expectedLevel = level }) => commitPairLittleResult({
  playerId: 'amari', gameId: 'shadowmatch', bigKid: false, stars, transactionId: id,
  playedLevel: level, expectedLevel, storage,
});

test('Shadow Match stores one stable positive best delta, recovers readback, and marks the parent claim', () => {
  const key = pairLittleProgressKey('amari');
  const storage = storageWith({ [key]: JSON.stringify({ familyNote: 'preserve', rocketbuilder: { level: 1, plays: 4, best: 2 } }) });
  let failReadback = true;
  const flaky = {
    getItem(k) {
      if (failReadback && storage.values.get(k)?.includes('pairRewardReceipts')) {
        failReadback = false;
        throw new DOMException('readback unavailable', 'SecurityError');
      }
      return storage.getItem(k);
    },
    setItem: (k, value) => storage.setItem(k, value),
  };

  const uncertain = commit(flaky, { stars: 2, id: 'shadow-run-1' });
  assert.equal(uncertain.ok, false);
  const recovered = commit(storage, { stars: 2, id: 'shadow-run-1' });
  assert.equal(recovered.ok, true);
  assert.equal(recovered.recovered, true);
  assert.deepEqual(recovered.rewardReceipt, { id: 'shadowmatch:level-1:best-2', level: 0, points: 6, claimed: false });
  assert.equal(getPendingPairLittleRewardReceipts('amari', 'shadowmatch', false, storage).receipts.length, 1);
  const withUnknownReceiptMetadata = JSON.parse(storage.getItem(key));
  withUnknownReceiptMetadata.shadowmatch.pairRewardReceipts[0].futureNote = 'preserve this';
  storage.setItem(key, JSON.stringify(withUnknownReceiptMetadata));

  let failMarkerReadback = true;
  const flakyMarker = {
    getItem(k) {
      if (failMarkerReadback && storage.values.get(k)?.includes('"claimed":true')) {
        failMarkerReadback = false;
        throw new DOMException('marker readback unavailable', 'SecurityError');
      }
      return storage.getItem(k);
    },
    setItem: (k, value) => storage.setItem(k, value),
  };
  const unconfirmedMarker = markPairLittleRewardReceiptClaimed('amari', 'shadowmatch', false, recovered.rewardReceipt.id, flakyMarker);
  assert.equal(unconfirmedMarker.ok, false);
  const marker = markPairLittleRewardReceiptClaimed('amari', 'shadowmatch', false, recovered.rewardReceipt.id, storage);
  assert.equal(marker.ok, true);
  assert.deepEqual(getPendingPairLittleRewardReceipts('amari', 'shadowmatch', false, storage).receipts, []);
  assert.equal(JSON.parse(storage.getItem(key)).shadowmatch.pairRewardReceipts[0].futureNote, 'preserve this');

  const equalReplay = commit(storage, { stars: 2, id: 'shadow-run-2' });
  assert.equal(equalReplay.rewardPoints, 0);
  assert.equal(equalReplay.rewardReceipt, null);
  const improvement = commit(storage, { stars: 3, id: 'shadow-run-3' });
  assert.equal(improvement.level, 1);
  assert.deepEqual(improvement.rewardReceipt, { id: 'shadowmatch:level-1:best-3', level: 0, points: 2, claimed: false });
  assert.equal(getPendingPairLittleRewardReceipts('amari', 'shadowmatch', false, storage).receipts.length, 1);
  const saved = JSON.parse(storage.getItem(key));
  assert.equal(saved.familyNote, 'preserve');
  assert.deepEqual(saved.rocketbuilder, { level: 1, plays: 4, best: 2 });
});

test('Shadow Match legacy high-water earns no backpay and locked levels are rejected before writes', () => {
  const key = pairLittleProgressKey('askia');
  const storage = storageWith({ [key]: JSON.stringify({ shadowmatch: { level: 2, plays: 5, best: 3 }, siblingNote: 'kept' }) });
  const before = storage.getItem(key);
  const locked = commitPairLittleResult({ playerId: 'askia', gameId: 'shadowmatch', bigKid: false, stars: 3, transactionId: 'locked-run', playedLevel: 3, expectedLevel: 2, storage });
  assert.equal(locked.ok, false);
  assert.equal(storage.getItem(key), before);

  const legacyReplay = commitPairLittleResult({ playerId: 'askia', gameId: 'shadowmatch', bigKid: false, stars: 3, transactionId: 'legacy-run', playedLevel: 2, expectedLevel: 2, storage });
  assert.equal(legacyReplay.ok, true);
  assert.equal(legacyReplay.rewardPoints, 0);
  assert.equal(legacyReplay.rewardReceipt, null);
  assert.equal(JSON.parse(storage.getItem(key)).shadowmatch.pairLegacyRewardThrough, 2);
  assert.equal(JSON.parse(storage.getItem(key)).siblingNote, 'kept');
});

test('Shadow Match malformed reward metadata fails closed without changing stored bytes', () => {
  const key = pairLittleProgressKey('amari');
  const bytes = JSON.stringify({ shadowmatch: {
    level: 0, plays: 1, best: 1, pairBestByLevel: { 0: 1 }, pairTransactionId: 'old', pairPreviousLevel: 0,
    pairPlayedLevel: 0, pairLevelUp: false, pairRewardPoints: 4, pairLegacyRewardThrough: -1,
    pairRewardReceipts: null,
  } });
  const storage = storageWith({ [key]: bytes });
  assert.equal(readPairLittleProgress('amari', 'shadowmatch', false, storage).ok, false);
  const result = commit(storage, { stars: 3, id: 'should-not-write' });
  assert.equal(result.ok, false);
  assert.equal(storage.getItem(key), bytes);

  const aggregateBytes = JSON.stringify({ shadowmatch: {
    level: 0, plays: 3, best: 3, pairBestByLevel: { 0: 3 }, pairTransactionId: 'old', pairPreviousLevel: 0,
    pairPlayedLevel: 0, pairLevelUp: false, pairRewardPoints: 8, pairLegacyRewardThrough: -1,
    pairRewardReceipts: [
      { id: 'shadowmatch:level-1:best-1', level: 0, points: 4, claimed: false },
      { id: 'shadowmatch:level-1:best-2', level: 0, points: 6, claimed: false },
      { id: 'shadowmatch:level-1:best-3', level: 0, points: 8, claimed: false },
    ],
  } });
  const aggregate = storageWith({ [key]: aggregateBytes });
  assert.equal(readPairLittleProgress('amari', 'shadowmatch', false, aggregate).ok, false);
  assert.equal(commit(aggregate, { stars: 3, id: 'must-not-write' }).ok, false);
  assert.equal(aggregate.getItem(key), aggregateBytes);

  const legacyReceiptBytes = JSON.stringify({ shadowmatch: {
    level: 1, plays: 2, best: 3, pairBestByLevel: { 0: 3, 1: 1 }, pairTransactionId: 'old', pairPreviousLevel: 1,
    pairPlayedLevel: 1, pairLevelUp: false, pairRewardPoints: 4, pairLegacyRewardThrough: 0,
    pairRewardReceipts: [{ id: 'shadowmatch:level-1:best-3', level: 0, points: 2, claimed: false }],
  } });
  const legacyReceipt = storageWith({ [key]: legacyReceiptBytes });
  assert.equal(readPairLittleProgress('amari', 'shadowmatch', false, legacyReceipt).ok, false);
  assert.equal(legacyReceipt.getItem(key), legacyReceiptBytes);
});

test('Shadow Match treats undefined storage reads as unavailable rather than an empty save', () => {
  const undefinedStorage = { getItem() { return undefined; }, setItem() { throw new Error('must not write'); } };
  assert.equal(readPairLittleProgress('amari', 'shadowmatch', false, undefinedStorage).ok, false);
  assert.equal(commitPairLittleResult({ playerId: 'amari', gameId: 'shadowmatch', bigKid: false, stars: 3, transactionId: 'undefined-read', storage: undefinedStorage }).ok, false);
});

test('Shadow Match receipt metadata remains opaque and preserved on other little-game rows', () => {
  const key = pairLittleProgressKey('amari');
  for (const gameId of ['rocketbuilder', 'fuelup', 'dinojigsaw']) {
    const storage = storageWith();
    const first = commitPairLittleResult({ playerId: 'amari', gameId, bigKid: false, stars: 3, transactionId: `${gameId}-first`, storage });
    assert.equal(first.ok, true, `${gameId} initial result persists`);
    const withOpaqueField = JSON.parse(storage.getItem(key));
    withOpaqueField[gameId].pairRewardReceipts = { futureFeature: ['keep', 'as-is'] };
    storage.setItem(key, JSON.stringify(withOpaqueField));
    assert.equal(readPairLittleProgress('amari', gameId, false, storage).ok, true, `${gameId} treats the field as opaque metadata`);

    const replay = commitPairLittleResult({ playerId: 'amari', gameId, bigKid: false, stars: 2, transactionId: `${gameId}-replay`, expectedLevel: 1, playedLevel: 0, storage });
    assert.equal(replay.ok, true, `${gameId} updates its own progress`);
    assert.deepEqual(JSON.parse(storage.getItem(key))[gameId].pairRewardReceipts, { futureFeature: ['keep', 'as-is'] }, `${gameId} preserves the field on write`);
    const recovered = commitPairLittleResult({ playerId: 'amari', gameId, bigKid: false, stars: 2, transactionId: `${gameId}-replay`, expectedLevel: 1, playedLevel: 0, storage });
    assert.equal(recovered.ok, true, `${gameId} recovers the same transaction without interpreting the field`);
    assert.equal(recovered.recovered, true);
    assert.deepEqual(recovered.rewardReceipt, null);
  }
});
