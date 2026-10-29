import { playerStorageKey } from './players.js';

export const GERMAN_CHAPTER_PROGRESS_KEY = 'german_chapter_progress_v1';
export const GERMAN_CHAPTER_IDS = Object.freeze(['colour-painter', 'vehicle-workshop', 'direction-driver']);
export const GERMAN_CHAPTER_REWARD_DELTA = 1;

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const selectStorage = (storage) => storage === undefined ? defaultStorage() : storage;
const progressKey = (playerId) => playerStorageKey(playerId, GERMAN_CHAPTER_PROGRESS_KEY);
const legacyLevelsKey = (playerId) => playerStorageKey(playerId, 'game_levels_v1');

const blankProgress = () => ({
  version: 1,
  unlockedChapterIndex: 0,
  completedChapterIds: [],
  chapterReceipts: [],
});

function validateProgress(value) {
  if (!isRecord(value) || value.version !== 1
    || !Number.isInteger(value.unlockedChapterIndex) || value.unlockedChapterIndex < 0
    || value.unlockedChapterIndex >= GERMAN_CHAPTER_IDS.length
    || !Array.isArray(value.completedChapterIds)
    || value.completedChapterIds.some((id) => !GERMAN_CHAPTER_IDS.includes(id))
    || new Set(value.completedChapterIds).size !== value.completedChapterIds.length
    || !Array.isArray(value.chapterReceipts) || value.chapterReceipts.length > GERMAN_CHAPTER_IDS.length) return null;

  const seenIds = new Set();
  const seenChapters = new Set();
  const chapterReceipts = [];
  for (const receipt of value.chapterReceipts) {
    if (!isRecord(receipt) || !safeId(receipt.transactionId)
      || !GERMAN_CHAPTER_IDS.includes(receipt.chapterId)
      || receipt.rewardDelta !== GERMAN_CHAPTER_REWARD_DELTA
      || typeof receipt.parentClaimed !== 'boolean'
      || (receipt.attemptId !== undefined && !safeId(receipt.attemptId))
      || seenIds.has(receipt.transactionId) || seenChapters.has(receipt.chapterId)
      || !value.completedChapterIds.includes(receipt.chapterId)) return null;
    seenIds.add(receipt.transactionId);
    seenChapters.add(receipt.chapterId);
    chapterReceipts.push({ ...receipt });
  }
  if (value.completedChapterIds.some((id) => GERMAN_CHAPTER_IDS.indexOf(id) > value.unlockedChapterIndex)) return null;
  return {
    ...value,
    version: 1,
    completedChapterIds: [...value.completedChapterIds],
    chapterReceipts,
  };
}

function readLegacyLevels(playerId, storage) {
  let raw;
  try { raw = storage.getItem(legacyLevelsKey(playerId)); }
  catch { return { ok: false, error: 'Saved German chapter history could not be read.' }; }
  if (raw === null) return { ok: true, present: false, current: 0, unlocked: 0, error: null };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, error: 'Saved German chapter history is unreadable.' };
  let root;
  try { root = JSON.parse(raw); }
  catch { return { ok: false, error: 'Saved German chapter history is invalid.' }; }
  if (!isRecord(root)) return { ok: false, error: 'Saved German chapter history is invalid.' };
  const saved = root.german;
  if (saved === undefined) return { ok: true, present: false, current: 0, unlocked: 0, error: null };
  if (!isRecord(saved) || !Number.isInteger(saved.current) || !Number.isInteger(saved.unlocked)
    || saved.current < 0 || saved.current >= GERMAN_CHAPTER_IDS.length
    || saved.unlocked < 0 || saved.unlocked >= GERMAN_CHAPTER_IDS.length
    || saved.current > saved.unlocked) return { ok: false, error: 'Saved German chapter history is invalid.' };
  return { ok: true, present: true, current: saved.current, unlocked: saved.unlocked, error: null };
}

function readCanonicalProgress(playerId, storage) {
  let raw;
  try { raw = storage.getItem(progressKey(playerId)); }
  catch { return { ok: false, fresh: false, progress: null, error: 'German progress storage could not be read.' }; }
  if (raw === null) return { ok: true, fresh: true, progress: blankProgress(), error: null };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, fresh: false, progress: null, error: 'Saved German progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { return { ok: false, fresh: false, progress: null, error: 'Saved German progress is invalid.' }; }
  const progress = validateProgress(parsed);
  if (!progress) return { ok: false, fresh: false, progress: null, error: 'Saved German progress is invalid.' };
  return { ok: true, fresh: false, progress, error: null };
}

function readState(playerId, storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'unavailable', fresh: false, progress: null, error: 'German progress storage is unavailable.' };
  }
  const canonical = readCanonicalProgress(playerId, storage);
  if (!canonical.ok) return { ...canonical, status: 'unavailable', legacy: null };
  const legacy = readLegacyLevels(playerId, storage);
  if (!legacy.ok) return { ok: false, status: 'unavailable', fresh: false, progress: null, legacy: null, error: legacy.error };

  const progress = canonical.progress;
  const completedChapterIds = new Set(progress.completedChapterIds);
  // The legacy level stores the next/current level. Only chapters before it
  // are visibly known complete; the current/unlocked chapter remains uncertain.
  for (let index = 0; index < legacy.current; index += 1) completedChapterIds.add(GERMAN_CHAPTER_IDS[index]);
  const legacyRewardCeiling = legacy.present ? Math.max(legacy.current, legacy.unlocked) : -1;
  return {
    ok: true,
    status: canonical.fresh && !legacy.present ? 'fresh' : 'ready',
    fresh: canonical.fresh,
    storedProgress: progress,
    progress: {
      ...progress,
      completedChapterIds: [...completedChapterIds],
      unlockedChapterIndex: Math.max(progress.unlockedChapterIndex, legacy.unlocked),
    },
    legacy: { ...legacy, rewardCeiling: legacyRewardCeiling },
    error: null,
  };
}

function commit(playerId, next, storage, previous) {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'unavailable', progress: previous, error: 'German progress storage is unavailable.' };
  }
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(progressKey(playerId), encoded);
    const readback = storage.getItem(progressKey(playerId));
    if (readback !== encoded) throw new Error('German progress readback did not match.');
    const validated = validateProgress(JSON.parse(readback));
    if (!validated) throw new Error('German progress readback is invalid.');
    return { ok: true, status: 'saved', progress: validated, error: null };
  } catch {
    return { ok: false, status: 'save-failed', progress: previous, error: 'German progress could not be confirmed. Retry this chapter result.' };
  }
}

export function germanChapterProgressKey(playerId) {
  return progressKey(playerId);
}

export function readGermanChapterProgress(playerId, storageOverride) {
  return readState(playerId, selectStorage(storageOverride));
}

export function commitGermanChapter(playerId, chapterIndex, attemptId, storageOverride) {
  const storage = selectStorage(storageOverride);
  const previousRead = readState(playerId, storage);
  if (!previousRead.ok) return { ...previousRead, receipt: null, rewardDelta: 0, alreadyCompleted: false };
  if (!Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= GERMAN_CHAPTER_IDS.length) {
    return { ok: false, status: 'invalid', progress: previousRead.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'German chapter is invalid.' };
  }
  if (chapterIndex > previousRead.progress.unlockedChapterIndex) {
    return { ok: false, status: 'locked', progress: previousRead.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'Finish the earlier German chapter first.' };
  }
  const chapterId = GERMAN_CHAPTER_IDS[chapterIndex];
  const current = previousRead.storedProgress;
  const savedReceipt = current.chapterReceipts.find((receipt) => receipt.chapterId === chapterId) || null;
  if (savedReceipt) {
    return { ok: true, status: 'recovered', progress: previousRead.progress, receipt: { ...savedReceipt }, rewardDelta: savedReceipt.parentClaimed ? 0 : savedReceipt.rewardDelta, alreadyCompleted: true, recovered: true, error: null };
  }
  if (previousRead.progress.completedChapterIds.includes(chapterId)) {
    return { ok: true, status: 'already-completed', progress: previousRead.progress, receipt: null, rewardDelta: 0, alreadyCompleted: true, recovered: false, error: null };
  }
  if (!safeId(attemptId)) {
    return { ok: false, status: 'invalid', progress: previousRead.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'This German chapter attempt could not be identified.' };
  }

  const completedChapterIds = [...current.completedChapterIds, chapterId];
  const next = {
    ...current,
    unlockedChapterIndex: Math.max(current.unlockedChapterIndex, Math.min(GERMAN_CHAPTER_IDS.length - 1, chapterIndex + 1)),
    completedChapterIds,
  };
  const suppressedByLegacy = previousRead.legacy.present && chapterIndex <= previousRead.legacy.rewardCeiling;
  let receipt = null;
  if (!suppressedByLegacy) {
    receipt = {
      transactionId: attemptId,
      attemptId,
      chapterId,
      rewardDelta: GERMAN_CHAPTER_REWARD_DELTA,
      parentClaimed: false,
    };
    next.chapterReceipts = [...current.chapterReceipts, receipt];
  }
  const saved = commit(playerId, next, storage, previousRead.progress);
  if (!saved.ok) return { ...saved, receipt, rewardDelta: receipt?.rewardDelta || 0, alreadyCompleted: false, recovered: false };
  const effectiveProgress = {
    ...saved.progress,
    unlockedChapterIndex: Math.max(saved.progress.unlockedChapterIndex, previousRead.legacy.unlocked),
    completedChapterIds: [...new Set([...saved.progress.completedChapterIds, ...previousRead.progress.completedChapterIds])],
  };
  return { ...saved, progress: effectiveProgress, receipt, rewardDelta: receipt?.rewardDelta || 0, alreadyCompleted: false, recovered: false, status: suppressedByLegacy ? 'legacy-complete' : saved.status };
}

export function markGermanChapterRewardClaimed(playerId, transactionId, storageOverride) {
  const storage = selectStorage(storageOverride);
  const previousRead = readState(playerId, storage);
  if (!previousRead.ok) return { ...previousRead, error: previousRead.error };
  const current = previousRead.storedProgress;
  const receipt = current.chapterReceipts.find((entry) => entry.transactionId === transactionId);
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: previousRead.progress, error: 'German reward receipt was not found.' };
  if (receipt.parentClaimed) return { ok: true, status: 'already-claimed', progress: previousRead.progress, error: null };
  const next = {
    ...current,
    chapterReceipts: current.chapterReceipts.map((entry) => entry.transactionId === transactionId ? { ...entry, parentClaimed: true } : entry),
  };
  const saved = commit(playerId, next, storage, previousRead.progress);
  if (!saved.ok) return saved;
  return {
    ...saved,
    progress: {
      ...saved.progress,
      unlockedChapterIndex: Math.max(saved.progress.unlockedChapterIndex, previousRead.legacy.unlocked),
      completedChapterIds: [...new Set([...saved.progress.completedChapterIds, ...previousRead.progress.completedChapterIds])],
    },
  };
}

export function pendingGermanChapterRewards(progress) {
  if (!progress || !Array.isArray(progress.chapterReceipts)) return [];
  return progress.chapterReceipts.filter((receipt) => receipt.rewardDelta === GERMAN_CHAPTER_REWARD_DELTA && !receipt.parentClaimed).map((receipt) => ({ ...receipt }));
}

export async function drainPendingGermanChapterRewards(progress, confirmReceipt) {
  const pending = pendingGermanChapterRewards(progress);
  let confirmed = 0;
  for (const receipt of pending) {
    if (await confirmReceipt(receipt) !== true) {
      return { ok: false, confirmed, remaining: pending.slice(confirmed).map((entry) => ({ ...entry })) };
    }
    confirmed += 1;
  }
  return { ok: true, confirmed, remaining: [] };
}

