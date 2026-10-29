import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChessMove, createChessGame, serializeChessGame } from '../src/data/chessGameRules.js';
import {
  chessGameProgressKey,
  completeChessGameMatch,
  markChessGameRewardClaimed,
  pendingChessGameRewards,
  readChessGameProgress,
  saveChessGameMatch,
} from '../src/data/chessGameProgress.js';
import { drainChessRewardReceipts } from '../src/data/chessRewardRecovery.js';

const makeStore = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    raw: (key) => values.get(key),
    values,
  };
};

const makeMatch = (game, id, difficulty = 'beginner', overrides = {}) => ({
  id,
  humanColor: 'white',
  difficulty,
  ...serializeChessGame(game),
  result: null,
  updatedAt: 10,
  ...overrides,
});

const finishFoolsMate = () => {
  const game = createChessGame();
  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) {
    const result = applyChessMove(game, { from, to });
    assert.equal(result.ok, true);
  }
  return game;
};

const saveFoolsMateStart = (storage, id, difficulty = 'beginner', player = 'amari') => {
  const previous = readChessGameProgress(player, storage);
  const saved = saveChessGameMatch(player, makeMatch(createChessGame(), id, difficulty), storage, {
    intent: 'start', expected: previous.progress?.match ?? null, replace: Boolean(previous.progress?.match),
  });
  assert.equal(saved.ok, true);
};

test('per-child progress uses null-only fresh state and malformed or unreadable records fail closed', () => {
  const storage = makeStore();
  assert.equal(readChessGameProgress('amari', storage).fresh, true);
  const key = chessGameProgressKey('amari');
  storage.setItem(key, '');
  assert.equal(readChessGameProgress('amari', storage).ok, false);
  assert.equal(storage.raw(key), '');
  let writes = 0;
  const blockedRead = { getItem() { throw new Error('SecurityError'); }, setItem() { writes += 1; } };
  assert.equal(readChessGameProgress('askia', blockedRead).ok, false);
  assert.equal(saveChessGameMatch('askia', makeMatch(createChessGame(), 'blocked'), blockedRead, { intent: 'start', expected: null }).ok, false);
  assert.equal(writes, 0);
});

test('each child has an independent match record and valid unknown metadata survives writes', () => {
  const storage = makeStore();
  const initial = { ...readChessGameProgress('amari', storage).progress, future: { 'future.note': 'keep me' } };
  storage.setItem(chessGameProgressKey('amari'), JSON.stringify(initial));
  const game = createChessGame();
  applyChessMove(game, { from: 'e2', to: 'e4' });
  const result = saveChessGameMatch('amari', makeMatch(game, 'match-a', 'growing', { engineMetadata: { source: 'future' } }), storage, { intent: 'start', expected: null });
  assert.equal(result.ok, true);
  assert.equal(result.progress.future['future.note'], 'keep me');
  assert.equal(result.progress.match.engineMetadata.source, 'future');
  assert.equal(readChessGameProgress('askia', storage).progress.match, null);
  assert.notEqual(chessGameProgressKey('amari'), chessGameProgressKey('askia'));
});

test('illegal move histories and forged FEN are not saved', () => {
  const storage = makeStore();
  const invalid = makeMatch(createChessGame(), 'invalid', 'beginner', { history: [{ from: 'e2', to: 'e5' }] });
  assert.equal(saveChessGameMatch('amari', invalid, storage, { intent: 'start', expected: null }).ok, false);
  assert.equal(storage.raw(chessGameProgressKey('amari')), undefined);
});

test('explicit undo restores the black-human opening without parity assumptions', () => {
  const storage = makeStore();
  const opening = createChessGame();
  assert.equal(applyChessMove(opening, { from: 'e2', to: 'e4' }).ok, true);
  const started = saveChessGameMatch('askia', { ...makeMatch(opening, 'black-opening'), humanColor: 'black' }, storage, { intent: 'start', expected: null });
  assert.equal(started.ok, true);
  const afterOpening = started.progress.match;
  const afterReply = createChessGame();
  applyChessMove(afterReply, { from: 'e2', to: 'e4' });
  applyChessMove(afterReply, { from: 'e7', to: 'e5' });
  const advanced = saveChessGameMatch('askia', { ...makeMatch(afterReply, 'black-opening'), humanColor: 'black' }, storage, { intent: 'advance', expected: afterOpening });
  assert.equal(advanced.ok, true);
  const undone = saveChessGameMatch('askia', { ...makeMatch(opening, 'black-opening'), humanColor: 'black' }, storage, { intent: 'undo', expected: advanced.progress.match });
  assert.equal(undone.ok, true);
  assert.equal(undone.progress.match.history.length, 1);
});

test('stale writes cannot replace a newer match and replacement requires explicit confirmation', () => {
  const storage = makeStore();
  saveFoolsMateStart(storage, 'older');
  const older = readChessGameProgress('amari', storage).progress.match;
  const replacement = saveChessGameMatch('amari', makeMatch(createChessGame(), 'newer'), storage, { intent: 'start', expected: older, replace: true });
  assert.equal(replacement.ok, true);
  const staleGame = createChessGame();
  applyChessMove(staleGame, { from: 'e2', to: 'e4' });
  const stale = saveChessGameMatch('amari', makeMatch(staleGame, 'older'), storage, { intent: 'advance', expected: older });
  assert.equal(stale.ok, false);
  assert.equal(readChessGameProgress('amari', storage).progress.match.id, 'newer');
  const unconfirmed = saveChessGameMatch('amari', makeMatch(createChessGame(), 'third'), storage, { intent: 'start', expected: replacement.progress.match });
  assert.equal(unconfirmed.ok, false);
  assert.equal(readChessGameProgress('amari', storage).progress.match.id, 'newer');
});

test('one-ply advance is idempotently recovered after readback failure and preserves match metadata', () => {
  const backing = makeStore();
  const started = saveChessGameMatch('amari', { ...makeMatch(createChessGame(), 'one-ply'), futureMatchField: { 'v2.note': 'preserve' } }, backing, { intent: 'start', expected: null });
  const expected = started.progress.match;
  const next = createChessGame();
  applyChessMove(next, { from: 'e2', to: 'e4' });
  const input = makeMatch(next, 'one-ply');
  let failAfterWrite = false;
  const storage = {
    getItem(key) {
      if (failAfterWrite) { failAfterWrite = false; throw new Error('readback failed'); }
      return backing.getItem(key);
    },
    setItem(key, value) { backing.setItem(key, value); failAfterWrite = true; },
  };
  const first = saveChessGameMatch('amari', input, storage, { intent: 'advance', expected });
  assert.equal(first.ok, false);
  const retry = saveChessGameMatch('amari', input, storage, { intent: 'advance', expected });
  assert.equal(retry.ok, true);
  assert.equal(retry.recovered, true);
  assert.equal(retry.progress.match.history.length, 1);
  assert.equal(retry.progress.match.futureMatchField['v2.note'], 'preserve');
  const duplicateAdvance = saveChessGameMatch('amari', input, storage, { intent: 'advance', expected });
  assert.equal(duplicateAdvance.ok, true);
  assert.equal(duplicateAdvance.recovered, true);
  assert.equal(duplicateAdvance.progress.match.history.length, 1);
});

test('a completed first game earns one stable receipt; replay at that difficulty earns zero', () => {
  const storage = makeStore();
  saveFoolsMateStart(storage, 'first-game');
  const first = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), 'first-game', 'beginner', { finishedAt: 20 }), storage);
  assert.equal(first.ok, true);
  assert.equal(first.receipt.rewardDelta, 1);
  assert.equal(first.receipt.outcome, 'loss');
  assert.deepEqual(pendingChessGameRewards(first.progress).map(({ id }) => id), ['first-game']);
  const claimed = markChessGameRewardClaimed('amari', 'first-game', storage);
  assert.equal(claimed.ok, true);
  assert.equal(pendingChessGameRewards(claimed.progress).length, 0);

  saveFoolsMateStart(storage, 'second-game');
  const replay = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), 'second-game', 'beginner', { finishedAt: 30 }), storage);
  assert.equal(replay.ok, true);
  assert.equal(replay.rewardDelta, 0);
  assert.equal(replay.receipt, null);
  const duplicate = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), 'second-game', 'beginner', { finishedAt: 31 }), storage);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.rewardDelta, 0);
});

test('write then readback failure recovers the same positive receipt without changing its token', () => {
  const backing = makeStore();
  saveFoolsMateStart(backing, 'recover-this', 'challenge');
  const key = chessGameProgressKey('amari');
  let failReadback = true;
  const storage = {
    getItem(storageKey) {
      if (storageKey === key && failReadback && backing.raw(storageKey)?.includes('recover-this') && JSON.parse(backing.raw(storageKey)).match?.result) {
        failReadback = false;
        throw new Error('readback temporarily unavailable');
      }
      return backing.getItem(storageKey);
    },
    setItem: (storageKey, value) => backing.setItem(storageKey, value),
  };
  const input = makeMatch(finishFoolsMate(), 'recover-this', 'challenge', { finishedAt: 40 });
  const first = completeChessGameMatch('amari', input, storage);
  assert.equal(first.ok, false);
  assert.equal(first.receipt.id, 'recover-this');
  const retry = completeChessGameMatch('amari', input, storage);
  assert.equal(retry.ok, true);
  assert.equal(retry.recovered, true);
  assert.equal(retry.receipt.id, first.receipt.id);
  assert.equal(retry.rewardDelta, 1);
});

test('terminal completion retains unknown match metadata while adding its receipt', () => {
  const storage = makeStore();
  const started = saveChessGameMatch('amari', {
    ...makeMatch(createChessGame(), 'metadata-finish', 'challenge'), futureMatchField: { provider: 'offline-v2' },
  }, storage, { intent: 'start', expected: null });
  const completed = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), 'metadata-finish', 'challenge'), storage);
  assert.equal(completed.ok, true);
  assert.deepEqual(completed.progress.match.futureMatchField, { provider: 'offline-v2' });
  assert.equal(completed.receipt.id, 'metadata-finish');
  assert.ok(started.ok);
});

test('failed write preserves original bytes and does not claim saved completion', () => {
  const base = makeStore();
  saveFoolsMateStart(base, 'write-failure');
  const key = chessGameProgressKey('amari');
  const original = base.raw(key);
  const blocked = { getItem: base.getItem, setItem() { throw new Error('QuotaExceededError'); } };
  const result = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), 'write-failure'), blocked);
  assert.equal(result.ok, false);
  assert.equal(result.progress.match.result, null);
  assert.equal(base.raw(key), original);
});

function createThreePendingReceipts() {
  const storage = makeStore();
  for (const difficulty of ['beginner', 'growing', 'challenge']) {
    const id = `pending-${difficulty}`;
    saveFoolsMateStart(storage, id, difficulty);
    const completed = completeChessGameMatch('amari', makeMatch(finishFoolsMate(), id, difficulty, { finishedAt: 100 }), storage);
    assert.equal(completed.ok, true);
    assert.equal(completed.receipt.parentClaimed, false);
  }
  return storage;
}

test('async recovery drains three pending receipts while each durable progress update is published', async () => {
  const storage = createThreePendingReceipts();
  let latest = readChessGameProgress('amari', storage).progress;
  const calls = [];
  const result = await drainChessRewardReceipts({
    getPendingReceipts: () => pendingChessGameRewards(latest),
    claimReceipt: async (receipt) => {
      await new Promise((resolve) => setImmediate(resolve));
      calls.push(receipt.id);
      const saved = markChessGameRewardClaimed('amari', receipt.id, storage);
      if (saved.ok) latest = saved.progress;
      return { ok: saved.ok, error: saved.error };
    },
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.claimedIds, ['pending-beginner', 'pending-growing', 'pending-challenge']);
  assert.deepEqual(calls, result.claimedIds);
  assert.equal(pendingChessGameRewards(latest).length, 0);
  assert.ok(latest.completionReceipts.every((receipt) => receipt.parentClaimed));
});

test('failed recovery leaves the current and later receipts pending for Retry to drain', async () => {
  const storage = createThreePendingReceipts();
  let latest = readChessGameProgress('amari', storage).progress;
  let shouldFailGrowing = true;
  const claim = async (receipt) => {
    await new Promise((resolve) => setImmediate(resolve));
    if (receipt.id === 'pending-growing' && shouldFailGrowing) {
      shouldFailGrowing = false;
      return { ok: false, error: 'temporary parent write failure' };
    }
    const saved = markChessGameRewardClaimed('amari', receipt.id, storage);
    if (saved.ok) latest = saved.progress;
    return { ok: saved.ok, error: saved.error };
  };
  const getPendingReceipts = () => pendingChessGameRewards(latest);

  const first = await drainChessRewardReceipts({ getPendingReceipts, claimReceipt: claim });
  assert.equal(first.ok, false);
  assert.equal(first.receipt.id, 'pending-growing');
  assert.deepEqual(getPendingReceipts().map(({ id }) => id), ['pending-growing', 'pending-challenge']);

  const retry = await drainChessRewardReceipts({ getPendingReceipts, claimReceipt: claim });
  assert.equal(retry.ok, true);
  assert.deepEqual(retry.claimedIds, ['pending-growing', 'pending-challenge']);
  assert.equal(getPendingReceipts().length, 0);
});
