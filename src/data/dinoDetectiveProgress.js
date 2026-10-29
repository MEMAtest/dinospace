import { DINO_DETECTIVE_WORLDS } from './dinoDetectiveBatch3.js';

export const DINO_DETECTIVE_PROGRESS_VERSION = 1;
export const DINO_DETECTIVE_PROGRESS_KEY = 'amari_dino_detective_batch3_v1';
export const DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS = DINO_DETECTIVE_WORLDS.length * 3;
export const DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS = 8;
export const DINO_DETECTIVE_MAX_RECEIPTS = DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS + DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS;
const keyFor = (playerId) => `${playerId || 'amari'}_${DINO_DETECTIVE_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;
const worldById = new Map(DINO_DETECTIVE_WORLDS.map((world) => [world.id, world]));
const validWorldIds = new Set(worldById.keys());
const validSpotIds = new Set(['fern-left', 'stone-center', 'water-right', 'fern-low-left', 'stone-low-right']);
const validSignature = (signature) => typeof signature === 'string' && signature.split('|').length === 5
  && new Set(signature.split('|')).size === 5
  && signature.split('|').every((id) => validSpotIds.has(id));
const validRoundIds = (worldId, ids) => Array.isArray(ids) && ids.length === 5
  && new Set(ids).size === 5
  && ids.every((id, index) => id === `${worldId}:round-${index + 1}`);

const emptyProgress = () => ({
  version: DINO_DETECTIVE_PROGRESS_VERSION,
  unlockedWorldIndex: 0,
  completedWorldIds: [],
  bestStars: {},
  earnedWorldStickerIds: [],
  recentRunSignatures: {},
  completionReceipts: [],
});

const normalizeProgress = (value) => {
  const empty = emptyProgress();
  const storedCompleted = new Set(value.completedWorldIds);
  const completedWorldIds = [];
  let unlockedWorldIndex = 0;
  while (completedWorldIds.length < DINO_DETECTIVE_WORLDS.length && storedCompleted.has(DINO_DETECTIVE_WORLDS[completedWorldIds.length].id)) {
    completedWorldIds.push(DINO_DETECTIVE_WORLDS[completedWorldIds.length].id);
    unlockedWorldIndex = Math.min(completedWorldIds.length, DINO_DETECTIVE_WORLDS.length - 1);
  }
  const recentRunSignatures = Object.fromEntries(Object.entries(value.recentRunSignatures)
    .map(([id, signatures]) => [id, signatures.slice(-8)]));
  return {
    ...empty,
    unlockedWorldIndex,
    completedWorldIds,
    bestStars: { ...value.bestStars },
    earnedWorldStickerIds: [...value.earnedWorldStickerIds],
    recentRunSignatures,
    completionReceipts: [...(value.completionReceipts || [])],
  };
};

const validateStoredProgress = (value) => {
  if (!isRecord(value) || value.version !== DINO_DETECTIVE_PROGRESS_VERSION
    || !Array.isArray(value.completedWorldIds) || !isRecord(value.bestStars)
    || !Array.isArray(value.earnedWorldStickerIds) || !isRecord(value.recentRunSignatures)) return false;
  if (value.completedWorldIds.some((id) => !validWorldIds.has(id))
    || new Set(value.completedWorldIds).size !== value.completedWorldIds.length) return false;
  const prefix = DINO_DETECTIVE_WORLDS.slice(0, value.completedWorldIds.length).map(({ id }) => id);
  if (prefix.some((id, index) => id !== value.completedWorldIds[index])) return false;
  const expectedUnlocked = Math.min(value.completedWorldIds.length, DINO_DETECTIVE_WORLDS.length - 1);
  if (value.unlockedWorldIndex !== expectedUnlocked) return false;
  if (Object.entries(value.bestStars).some(([id, stars]) => (
    !value.completedWorldIds.includes(id) || !Number.isInteger(stars) || stars < 0 || stars > 3
  ))) return false;
  if (value.earnedWorldStickerIds.some((id) => {
    const world = DINO_DETECTIVE_WORLDS.find((entry) => entry.stickerId === id);
    return !world || !value.completedWorldIds.includes(world.id);
  }) || new Set(value.earnedWorldStickerIds).size !== value.earnedWorldStickerIds.length) return false;
  if (!Object.entries(value.recentRunSignatures).every(([id, signatures]) => (
    validWorldIds.has(id) && Array.isArray(signatures) && signatures.every(validSignature)
  ))) return false;
  const receipts = value.completionReceipts === undefined ? [] : value.completionReceipts;
  if (!Array.isArray(receipts) || receipts.length > DINO_DETECTIVE_MAX_RECEIPTS
    || receipts.filter((receipt) => receipt?.awardedStars > 0).length > DINO_DETECTIVE_MAX_POSITIVE_RECEIPTS
    || receipts.filter((receipt) => receipt?.awardedStars === 0).length > DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS
    || receipts.some((receipt) => (
    !isRecord(receipt) || typeof receipt.id !== 'string' || receipt.id.length < 1 || receipt.id.length > 128
    || !validWorldIds.has(receipt.worldId) || !Number.isInteger(receipt.stars) || receipt.stars < 1 || receipt.stars > 3
    || !validRoundIds(receipt.worldId, receipt.roundIds) || !Number.isInteger(receipt.awardedStars) || receipt.awardedStars < 0 || receipt.awardedStars > 3
    || !Number.isInteger(receipt.bestStars) || receipt.bestStars < 1 || receipt.bestStars > 3
    || typeof receipt.newlyCompleted !== 'boolean' || typeof receipt.newlyEarnedSticker !== 'boolean'
  )) || new Set(receipts.map(({ id }) => id)).size !== receipts.length) return false;
  return true;
};

const resolveStorage = (storage) => {
  if (storage !== undefined) return storage;
  try { return browserStorage(); } catch { return null; }
};

export const readDinoDetectiveProgress = (playerId, suppliedStorage) => {
  const storage = resolveStorage(suppliedStorage);
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, reason: 'unavailable', progress: emptyProgress() };
  let raw;
  try { raw = storage.getItem(keyFor(playerId)); } catch { return { ok: false, reason: 'unreadable', progress: emptyProgress() }; }
  if (raw === null || raw === undefined) return { ok: true, missing: true, raw: null, parsed: null, progress: emptyProgress() };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, reason: 'malformed', raw, progress: emptyProgress() };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, reason: 'malformed', raw, progress: emptyProgress() }; }
  if (!validateStoredProgress(parsed)) return { ok: false, reason: 'invalid-record', raw, progress: emptyProgress() };
  return { ok: true, missing: false, raw, parsed, progress: normalizeProgress(parsed) };
};

// Kept for read-only consumers such as the sticker shelf. UI that needs to
// distinguish unavailable storage should use readDinoDetectiveProgress.
export const getDinoDetectiveProgress = (playerId, suppliedStorage) => {
  const read = readDinoDetectiveProgress(playerId, suppliedStorage);
  if (read.ok) return read.progress;
  // The batch-3 sticker shelf historically read only this version-1 shape.
  // Keep that narrow compatibility read-only: transactional reads and every
  // commit still reject it, so a later write cannot replace incomplete data.
  if (read.reason !== 'invalid-record' || typeof read.raw !== 'string') return read.progress;
  let legacy;
  try { legacy = JSON.parse(read.raw); } catch { return read.progress; }
  const legacyKeys = ['version', 'completedWorldIds', 'earnedWorldStickerIds'];
  if (!isRecord(legacy) || Object.keys(legacy).length !== legacyKeys.length
    || !legacyKeys.every((key) => Object.prototype.hasOwnProperty.call(legacy, key))
    || legacy.version !== DINO_DETECTIVE_PROGRESS_VERSION
    || !Array.isArray(legacy.completedWorldIds) || !Array.isArray(legacy.earnedWorldStickerIds)) return read.progress;
  const completedWorldIds = legacy.completedWorldIds;
  if (completedWorldIds.some((id) => !validWorldIds.has(id))
    || new Set(completedWorldIds).size !== completedWorldIds.length
    || DINO_DETECTIVE_WORLDS.slice(0, completedWorldIds.length).some(({ id }, index) => id !== completedWorldIds[index])) return read.progress;
  const expectedStickers = completedWorldIds.map((id) => worldById.get(id).stickerId);
  if (legacy.earnedWorldStickerIds.some((id) => !expectedStickers.includes(id))
    || new Set(legacy.earnedWorldStickerIds).size !== legacy.earnedWorldStickerIds.length
    || expectedStickers.length !== legacy.earnedWorldStickerIds.length) return read.progress;
  return {
    ...emptyProgress(),
    unlockedWorldIndex: Math.min(completedWorldIds.length, DINO_DETECTIVE_WORLDS.length - 1),
    completedWorldIds: [...completedWorldIds],
    earnedWorldStickerIds: [...legacy.earnedWorldStickerIds],
  };
};

// Only positive, durable transaction receipts are eligible for parent reward
// reconciliation. Legacy completions without receipts never receive a replayed award.
export const dinoRewardReceiptsToReconcile = (progress) => (
  Array.isArray(progress?.completionReceipts)
    ? progress.completionReceipts.filter((receipt) => isRecord(receipt)
      && typeof receipt.id === 'string' && receipt.id.length > 0
      && Number.isInteger(receipt.awardedStars) && receipt.awardedStars > 0)
    : []
);

const retainCompletionReceipts = (receipts) => {
  const keepZeroIds = new Set(receipts.filter(({ awardedStars }) => awardedStars === 0)
    .slice(-DINO_DETECTIVE_MAX_ZERO_DELTA_RECEIPTS).map(({ id }) => id));
  return receipts.filter(({ awardedStars, id }) => awardedStars > 0 || keepZeroIds.has(id));
};

const sameProgress = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const persistAndVerify = (playerId, nextProgress, previousRead, storage) => {
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, reason: 'unavailable', progress: previousRead.progress };
  const merged = { ...(previousRead.parsed || {}), ...nextProgress };
  try { storage.setItem(keyFor(playerId), JSON.stringify(merged)); } catch {
    return { ok: false, reason: 'write-failed', progress: previousRead.progress };
  }
  const verified = readDinoDetectiveProgress(playerId, storage);
  if (!verified.ok || !sameProgress(verified.progress, nextProgress)) {
    return { ok: false, reason: 'readback-failed', progress: previousRead.progress };
  }
  return { ok: true, progress: verified.progress };
};

export const recentDinoRunSignatures = (playerId, worldId, suppliedStorage) => {
  const read = readDinoDetectiveProgress(playerId, suppliedStorage);
  return read.ok && validWorldIds.has(worldId) ? read.progress.recentRunSignatures[worldId] || [] : [];
};

export const rememberDinoDetectiveRun = (playerId, worldId, signature, suppliedStorage) => {
  if (!validWorldIds.has(worldId) || !validSignature(signature)) return null;
  const storage = resolveStorage(suppliedStorage);
  const read = readDinoDetectiveProgress(playerId, storage);
  if (!read.ok) return { ok: false, reason: read.reason, progress: read.progress };
  const world = worldById.get(worldId);
  if (world.index > read.progress.unlockedWorldIndex) return null;
  const current = read.progress.recentRunSignatures[worldId] || [];
  const nextSignatures = [...current, signature].slice(-8);
  const next = {
    ...read.progress,
    recentRunSignatures: { ...read.progress.recentRunSignatures, [worldId]: nextSignatures },
  };
  return persistAndVerify(playerId, next, read, storage);
};

let localTransactionSequence = 0;
export const createDinoDetectiveTransactionId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  localTransactionSequence += 1;
  return `dino-${Date.now()}-${localTransactionSequence}-${Math.random().toString(36).slice(2)}`;
};

export const commitDinoDetectiveCompletion = (playerId, worldId, stars, roundIds, suppliedStorage, transactionId = createDinoDetectiveTransactionId()) => {
  const world = worldById.get(worldId);
  if (!world || !Number.isInteger(stars) || stars < 1 || stars > 3
    || !validRoundIds(worldId, roundIds) || typeof transactionId !== 'string' || transactionId.length < 1 || transactionId.length > 128) {
    return { ok: false, reason: 'invalid-completion', progress: emptyProgress() };
  }
  const storage = resolveStorage(suppliedStorage);
  const read = readDinoDetectiveProgress(playerId, storage);
  if (!read.ok) return { ok: false, reason: read.reason, progress: read.progress };
  if (world.index > read.progress.unlockedWorldIndex) return { ok: false, reason: 'locked-world', progress: read.progress };
  const priorReceipt = read.progress.completionReceipts.find(({ id }) => id === transactionId);
  if (priorReceipt) {
    if (priorReceipt.worldId !== worldId || priorReceipt.stars !== stars || !validRoundIds(worldId, roundIds)
      || priorReceipt.roundIds.some((id, index) => id !== roundIds[index])) {
      return { ok: false, reason: 'transaction-mismatch', progress: read.progress };
    }
    return {
      ok: true,
      progress: read.progress,
      newlyCompleted: priorReceipt.newlyCompleted,
      newlyEarnedSticker: priorReceipt.newlyEarnedSticker,
      awardedStars: priorReceipt.awardedStars,
      bestStars: priorReceipt.bestStars,
      transactionId,
      recoveredTransaction: true,
    };
  }
  const previousBest = read.progress.bestStars[worldId] || 0;
  const completedWorldIds = read.progress.completedWorldIds.includes(worldId)
    ? read.progress.completedWorldIds : [...read.progress.completedWorldIds, worldId];
  const bestStars = { ...read.progress.bestStars, [worldId]: Math.max(previousBest, stars) };
  const newlyCompleted = !read.progress.completedWorldIds.includes(worldId);
  const newlyEarnedSticker = newlyCompleted && !read.progress.earnedWorldStickerIds.includes(world.stickerId);
  const earnedWorldStickerIds = newlyEarnedSticker
    ? [...read.progress.earnedWorldStickerIds, world.stickerId] : read.progress.earnedWorldStickerIds;
  const unlockedWorldIndex = world.index === read.progress.unlockedWorldIndex && world.index < DINO_DETECTIVE_WORLDS.length - 1
    ? world.index + 1 : read.progress.unlockedWorldIndex;
  const awardedStars = Math.max(0, stars - previousBest);
  const receipt = { id: transactionId, worldId, stars, roundIds: [...roundIds], awardedStars, bestStars: bestStars[worldId], newlyCompleted, newlyEarnedSticker };
  const completionReceipts = retainCompletionReceipts([...read.progress.completionReceipts, receipt]);
  const next = { ...read.progress, completedWorldIds, bestStars, earnedWorldStickerIds, unlockedWorldIndex, completionReceipts };
  const saved = persistAndVerify(playerId, next, read, storage);
  if (!saved.ok) return saved;
  return {
    ...saved,
    transactionId,
    recoveredTransaction: false,
    newlyCompleted,
    newlyEarnedSticker,
    awardedStars,
    bestStars: saved.progress.bestStars[worldId],
  };
};

// Compatibility for existing data-only callers. Completion UI should use the
// explicit result above so a failed write can stay held for Retry.
export const recordDinoDetectiveCompletion = (playerId, worldId, stars, roundIds, suppliedStorage) => {
  const result = commitDinoDetectiveCompletion(playerId, worldId, stars, roundIds, suppliedStorage);
  return result.ok ? result : null;
};
