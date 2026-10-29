import { playerStorageKey } from './players.js';
import { CHESS_COLORS, CHESS_DIFFICULTIES, getChessStatus, getComputerResult, restoreChessGame } from './chessGameRules.js';

export const CHESS_GAME_PROGRESS_KEY = 'chess_game_v1';
export const chessGameProgressKey = (playerId) => playerStorageKey(playerId, CHESS_GAME_PROGRESS_KEY);

const safeId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const blank = () => ({ version: 1, match: null, rewardedDifficulties: [], completionReceipts: [] });
const getDefaultStorage = () => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };
const selectStorage = (storage) => storage === undefined ? getDefaultStorage() : storage;
const validOutcome = (value) => ['win', 'loss', 'draw'].includes(value);

function validateMatch(match) {
  if (match === null) return { ok: true, match: null };
  if (!isRecord(match) || !safeId(match.id) || !CHESS_COLORS.includes(match.humanColor) || !CHESS_DIFFICULTIES.includes(match.difficulty)
    || !Number.isSafeInteger(match.updatedAt) || match.updatedAt < 0) return { ok: false };
  const restored = restoreChessGame({ history: match.history, fen: match.fen, turn: match.turn, status: match.status });
  if (!restored.ok) return { ok: false };
  const status = getChessStatus(restored.game);
  if (match.result === null) {
    if (status.gameOver) return { ok: false };
  } else if (!isRecord(match.result) || !validOutcome(match.result.outcome) || !status.gameOver
    || getComputerResult(restored.game, match.humanColor) !== match.result.outcome
    || !Number.isSafeInteger(match.result.finishedAt) || match.result.finishedAt < 0) return { ok: false };
  return {
    ok: true,
    match: { ...match, history: match.history.map((move) => ({ ...move })), status, result: match.result ? { ...match.result } : null },
  };
}

function validateProgress(value) {
  if (!isRecord(value) || value.version !== 1) return null;
  if (!Array.isArray(value.rewardedDifficulties) || value.rewardedDifficulties.some((difficulty) => !CHESS_DIFFICULTIES.includes(difficulty))
    || new Set(value.rewardedDifficulties).size !== value.rewardedDifficulties.length) return null;
  if (!Array.isArray(value.completionReceipts) || value.completionReceipts.length > CHESS_DIFFICULTIES.length) return null;
  const receiptIds = new Set();
  const receiptDifficulties = new Set();
  const completionReceipts = [];
  for (const receipt of value.completionReceipts) {
    if (!isRecord(receipt) || !safeId(receipt.id) || !CHESS_DIFFICULTIES.includes(receipt.difficulty) || !validOutcome(receipt.outcome)
      || receipt.rewardDelta !== 1 || typeof receipt.parentClaimed !== 'boolean' || receiptIds.has(receipt.id) || receiptDifficulties.has(receipt.difficulty)) return null;
    receiptIds.add(receipt.id);
    receiptDifficulties.add(receipt.difficulty);
    completionReceipts.push({ ...receipt });
  }
  if (completionReceipts.some((receipt) => !value.rewardedDifficulties.includes(receipt.difficulty))) return null;
  const validatedMatch = validateMatch(value.match);
  if (!validatedMatch.ok) return null;
  return {
    ...value,
    version: 1,
    match: validatedMatch.match,
    rewardedDifficulties: [...value.rewardedDifficulties],
    completionReceipts,
  };
}

export function readChessGameProgress(playerId, storageOverride) {
  const storage = selectStorage(storageOverride);
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, fresh: false, progress: null, error: 'Chess storage is unavailable.' };
  try {
    const raw = storage.getItem(chessGameProgressKey(playerId));
    if (raw === null) return { ok: true, fresh: true, progress: blank(), error: null };
    if (typeof raw !== 'string' || raw === '') return { ok: false, fresh: false, progress: null, error: 'Saved chess progress is unreadable.' };
    const parsed = JSON.parse(raw);
    const progress = validateProgress(parsed);
    if (!progress) return { ok: false, fresh: false, progress: null, error: 'Saved chess progress is invalid.' };
    return { ok: true, fresh: false, progress, error: null };
  } catch {
    return { ok: false, fresh: false, progress: null, error: 'Saved chess progress could not be read.' };
  }
}

function commit(playerId, next, storage, previous) {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, progress: previous, error: 'Chess storage is unavailable.' };
  }
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(chessGameProgressKey(playerId), encoded);
    const readback = storage.getItem(chessGameProgressKey(playerId));
    if (readback !== encoded) throw new Error('Chess progress readback did not match.');
    const validated = validateProgress(JSON.parse(readback));
    if (!validated) throw new Error('Chess progress readback is invalid.');
    return { ok: true, progress: validated, error: null };
  } catch {
    return { ok: false, progress: previous, error: 'Chess progress could not be confirmed. Retry to save this board.' };
  }
}

function normalizeMatchInput(input, { allowTerminal = false } = {}) {
  if (!isRecord(input) || !safeId(input.id) || !CHESS_COLORS.includes(input.humanColor) || !CHESS_DIFFICULTIES.includes(input.difficulty)) return null;
  const restored = restoreChessGame({ history: input.history, fen: input.fen, turn: input.turn, status: input.status });
  if (!restored.ok) return null;
  const status = getChessStatus(restored.game);
  if (input.result === null ? (status.gameOver && !allowTerminal) : true) return null;
  return {
    ...input,
    id: input.id,
    humanColor: input.humanColor,
    difficulty: input.difficulty,
    history: restored.game.history({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) })),
    fen: restored.game.fen(),
    turn: restored.game.turn(),
    status,
    result: null,
    updatedAt: Number.isSafeInteger(input.updatedAt) && input.updatedAt >= 0 ? input.updatedAt : Date.now(),
  };
}

function sameMoves(left = [], right = []) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length
    && left.every((move, index) => JSON.stringify(move) === JSON.stringify(right[index]));
}

function matchesSnapshot(match, expected) {
  if (expected === null) return match === null;
  return !!match && !!expected && match.id === expected.id && match.updatedAt === expected.updatedAt
    && match.humanColor === expected.humanColor && match.difficulty === expected.difficulty
    && JSON.stringify(match.result) === JSON.stringify(expected.result)
    && sameMoves(match.history, expected.history) && match.fen === expected.fen;
}

function matchesSavedTarget(current, target) {
  return !!current && current.id === target.id && current.humanColor === target.humanColor
    && current.difficulty === target.difficulty && current.fen === target.fen && current.turn === target.turn
    && current.updatedAt === target.updatedAt && sameMoves(current.history, target.history) && JSON.stringify(current.status) === JSON.stringify(target.status)
    && current.result === null;
}

/**
 * Save a game snapshot with an explicit concurrency intent.
 * `start` may only create into an empty slot unless `replace: true` was confirmed by the UI.
 * `advance` appends exactly one legal ply to the exact expected saved snapshot.
 * `undo` restores an earlier snapshot only from the exact expected current snapshot.
 */
export function saveChessGameMatch(playerId, input, storageOverride, {
  intent = 'advance',
  expected = null,
  replace = false,
} = {}) {
  const storage = selectStorage(storageOverride);
  const previousRead = readChessGameProgress(playerId, storage);
  if (!previousRead.ok) return { ok: false, progress: null, error: previousRead.error };
  const match = normalizeMatchInput(input);
  if (!match) return { ok: false, progress: previousRead.progress, error: 'Chess match data is invalid.' };
  const old = previousRead.progress.match;
  // A retry after a committed write but failed readback recognizes the exact target before
  // checking a now-stale expected snapshot. It never replays a move or overwrites newer state.
  if (matchesSavedTarget(old, match)) return { ok: true, recovered: true, progress: previousRead.progress, error: null };
  if (intent === 'start') {
    if (old && !replace) return { ok: false, progress: previousRead.progress, error: 'Confirm New Game before replacing the saved match.' };
    if (!matchesSnapshot(old, expected)) return { ok: false, progress: previousRead.progress, error: 'The saved match changed. Reload it before starting another game.' };
  } else if (intent === 'advance' || intent === 'undo') {
    if (!old || old.result || old.id !== match.id || !matchesSnapshot(old, expected)) {
      return { ok: false, progress: previousRead.progress, error: 'The saved match changed. Reload before saving this board.' };
    }
    const continues = old.history.length < match.history.length
      && old.history.every((move, index) => JSON.stringify(move) === JSON.stringify(match.history[index]));
    const rewinds = match.history.length < old.history.length
      && match.history.every((move, index) => JSON.stringify(move) === JSON.stringify(old.history[index]));
    if (intent === 'advance' && (!continues || match.history.length !== old.history.length + 1)) {
      return { ok: false, progress: previousRead.progress, error: 'A chess turn must add exactly one legal move.' };
    }
    if (intent === 'undo' && !rewinds) {
      return { ok: false, progress: previousRead.progress, error: 'Undo must restore an earlier part of this saved game.' };
    }
  } else {
    return { ok: false, progress: previousRead.progress, error: 'Unknown chess save action.' };
  }
  const savedMatch = old?.id === match.id ? { ...old, ...match } : match;
  const next = { ...previousRead.progress, match: savedMatch };
  const saved = commit(playerId, next, storage, previousRead.progress);
  return { ...saved, recovered: false };
}

export function completeChessGameMatch(playerId, input, storageOverride) {
  const storage = selectStorage(storageOverride);
  const previousRead = readChessGameProgress(playerId, storage);
  if (!previousRead.ok) return { ok: false, progress: null, receipt: null, rewardDelta: 0, recovered: false, error: previousRead.error };
  const match = normalizeMatchInput({ ...input, result: null }, { allowTerminal: true });
  if (!match) return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'Chess match data is invalid.' };
  const restored = restoreChessGame(match);
  if (!restored.ok || !getChessStatus(restored.game).gameOver) return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'The chess match has not finished.' };
  const outcome = getComputerResult(restored.game, match.humanColor);
  const existingReceipt = previousRead.progress.completionReceipts.find((receipt) => receipt.id === match.id);
  if (existingReceipt) {
    if (existingReceipt.difficulty !== match.difficulty || existingReceipt.outcome !== outcome) return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'Saved completion receipt does not match this game.' };
    return { ok: true, progress: previousRead.progress, receipt: existingReceipt, rewardDelta: existingReceipt.rewardDelta, recovered: true, error: null };
  }
  const current = previousRead.progress.match;
  if (!current || current.id !== match.id) return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'This is not the saved active match.' };
  if (current && (current.difficulty !== match.difficulty || current.humanColor !== match.humanColor)) return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'Chess match settings do not match the saved game.' };
  if (match.history.length < current.history.length || !current.history.every((move, index) => JSON.stringify(move) === JSON.stringify(match.history[index]))) {
    return { ok: false, progress: previousRead.progress, receipt: null, rewardDelta: 0, recovered: false, error: 'Finished chess history does not continue the saved game.' };
  }

  const firstAtDifficulty = !previousRead.progress.rewardedDifficulties.includes(match.difficulty);
  const finishedAt = Number.isSafeInteger(input.finishedAt) && input.finishedAt >= 0 ? input.finishedAt : Date.now();
  const finalMatch = { ...current, ...match, result: { outcome, finishedAt }, updatedAt: finishedAt };
  const receipt = firstAtDifficulty ? {
    id: match.id,
    difficulty: match.difficulty,
    outcome,
    rewardDelta: 1,
    parentClaimed: false,
  } : null;
  const next = {
    ...previousRead.progress,
    match: finalMatch,
    rewardedDifficulties: firstAtDifficulty
      ? [...previousRead.progress.rewardedDifficulties, match.difficulty]
      : previousRead.progress.rewardedDifficulties,
    completionReceipts: receipt
      ? [...previousRead.progress.completionReceipts, receipt]
      : previousRead.progress.completionReceipts,
  };
  const saved = commit(playerId, next, storage, previousRead.progress);
  if (!saved.ok) return { ...saved, receipt, rewardDelta: receipt?.rewardDelta || 0, recovered: false };
  return { ...saved, receipt, rewardDelta: receipt?.rewardDelta || 0, recovered: false };
}

export function markChessGameRewardClaimed(playerId, receiptId, storageOverride) {
  const storage = selectStorage(storageOverride);
  const previousRead = readChessGameProgress(playerId, storage);
  if (!previousRead.ok) return { ok: false, progress: null, error: previousRead.error };
  const receipt = previousRead.progress.completionReceipts.find((entry) => entry.id === receiptId);
  if (!receipt) return { ok: false, progress: previousRead.progress, error: 'Chess reward receipt was not found.' };
  if (receipt.parentClaimed) return { ok: true, progress: previousRead.progress, error: null };
  const next = {
    ...previousRead.progress,
    completionReceipts: previousRead.progress.completionReceipts.map((entry) => entry.id === receiptId ? { ...entry, parentClaimed: true } : entry),
  };
  return commit(playerId, next, storage, previousRead.progress);
}

export function pendingChessGameRewards(progress) {
  if (!progress || !Array.isArray(progress.completionReceipts)) return [];
  return progress.completionReceipts.filter((receipt) => receipt.rewardDelta > 0 && !receipt.parentClaimed).map((receipt) => ({ ...receipt }));
}
