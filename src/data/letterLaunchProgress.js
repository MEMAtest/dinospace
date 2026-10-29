import { CHAPTER_BADGE_STORAGE_KEY, LETTER_LAUNCH_CHAPTER_BADGES } from './chapterBadges.js';
import { playerStorageKey } from './players.js';

export const LETTER_LAUNCH_PROGRESS_KEY = 'letter_launch_progress_v1';
export const LETTER_LAUNCH_REWARD_DELTA = 1;
export const LETTER_LAUNCH_CHAPTER_IDS = Object.freeze(LETTER_LAUNCH_CHAPTER_BADGES.map(({ id }) => id));

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value);
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const selectStorage = (storage) => storage === undefined ? defaultStorage() : storage;
const keyFor = (playerId) => playerStorageKey(playerId, LETTER_LAUNCH_PROGRESS_KEY);
const levelsKeyFor = (playerId) => playerStorageKey(playerId, 'game_levels_v1');
const badgePlayerId = (playerId) => typeof playerId === 'string' && playerId.trim() ? playerId.trim() : 'amari';
const validChapter = (id) => LETTER_LAUNCH_CHAPTER_IDS.includes(id);

const blankProgress = () => ({ version: 1, unlockedChapterIndex: 0, completedChapterIds: [], chapterReceipts: [] });

function validateProgress(value) {
  if (!isRecord(value) || value.version !== 1
    || !Number.isInteger(value.unlockedChapterIndex) || value.unlockedChapterIndex < 0
    || value.unlockedChapterIndex >= LETTER_LAUNCH_CHAPTER_IDS.length
    || !Array.isArray(value.completedChapterIds)
    || value.completedChapterIds.some((id) => !validChapter(id))
    || new Set(value.completedChapterIds).size !== value.completedChapterIds.length
    || !Array.isArray(value.chapterReceipts) || value.chapterReceipts.length > LETTER_LAUNCH_CHAPTER_IDS.length) return null;
  const transactionIds = new Set();
  const chapterIds = new Set();
  for (const receipt of value.chapterReceipts) {
    if (!isRecord(receipt) || !safeId(receipt.transactionId) || !validChapter(receipt.chapterId)
      || receipt.rewardDelta !== LETTER_LAUNCH_REWARD_DELTA
      || typeof receipt.parentClaimed !== 'boolean'
      || !value.completedChapterIds.includes(receipt.chapterId)
      || transactionIds.has(receipt.transactionId) || chapterIds.has(receipt.chapterId)) return null;
    transactionIds.add(receipt.transactionId);
    chapterIds.add(receipt.chapterId);
  }
  if (value.completedChapterIds.some((id) => LETTER_LAUNCH_CHAPTER_IDS.indexOf(id) > value.unlockedChapterIndex)) return null;
  return { ...value, completedChapterIds: [...value.completedChapterIds], chapterReceipts: value.chapterReceipts.map((receipt) => ({ ...receipt })) };
}

function readCanonical(playerId, storage) {
  let raw;
  try { raw = storage.getItem(keyFor(playerId)); }
  catch { return { ok: false, error: 'Saved Letter Launch progress could not be read.' }; }
  if (raw === null) return { ok: true, fresh: true, progress: blankProgress() };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, error: 'Saved Letter Launch progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, error: 'Saved Letter Launch progress is invalid.' }; }
  const progress = validateProgress(parsed);
  return progress ? { ok: true, fresh: false, progress } : { ok: false, error: 'Saved Letter Launch progress is invalid.' };
}

function readLegacyLevels(playerId, storage) {
  let raw;
  try { raw = storage.getItem(levelsKeyFor(playerId)); }
  catch { return { ok: false, error: 'Older Letter Launch progress could not be read.' }; }
  if (raw === null) return { ok: true, present: false, current: 0, unlocked: 0 };
  let root;
  try { root = JSON.parse(raw); } catch { return { ok: false, error: 'Older Letter Launch progress is invalid.' }; }
  if (!isRecord(root)) return { ok: false, error: 'Older Letter Launch progress is invalid.' };
  const saved = root.letters;
  if (saved === undefined) return { ok: true, present: false, current: 0, unlocked: 0 };
  if (!isRecord(saved) || !Number.isInteger(saved.current) || !Number.isInteger(saved.unlocked)
    || saved.current < 0 || saved.current >= LETTER_LAUNCH_CHAPTER_IDS.length
    || saved.unlocked < 0 || saved.unlocked >= LETTER_LAUNCH_CHAPTER_IDS.length
    || saved.current > saved.unlocked) return { ok: false, error: 'Older Letter Launch progress is invalid.' };
  return { ok: true, present: true, current: saved.current, unlocked: saved.unlocked };
}

function readLegacyBadges(playerId, storage) {
  let raw;
  try { raw = storage.getItem(CHAPTER_BADGE_STORAGE_KEY); }
  catch { return { ok: false, error: 'Older Letter Launch badges could not be read.' }; }
  if (raw === null) return { ok: true, present: false, ids: [] };
  let root;
  try { root = JSON.parse(raw); } catch { return { ok: false, error: 'Older Letter Launch badges are invalid.' }; }
  if (!isRecord(root) || root.version !== 1 || !isRecord(root.players)) return { ok: false, error: 'Older Letter Launch badges are invalid.' };
  const player = root.players[badgePlayerId(playerId)];
  if (player === undefined) return { ok: true, present: true, ids: [] };
  if (!isRecord(player) || (player.games !== undefined && !isRecord(player.games))) return { ok: false, error: 'Older Letter Launch badges are invalid.' };
  const game = player.games?.letters;
  if (game === undefined) return { ok: true, present: true, ids: [] };
  if (!isRecord(game) || (game.earnedChapterIds !== undefined
    && (!Array.isArray(game.earnedChapterIds) || game.earnedChapterIds.some((id) => typeof id !== 'string')))) return { ok: false, error: 'Older Letter Launch badges are invalid.' };
  const known = new Set(LETTER_LAUNCH_CHAPTER_IDS);
  return { ok: true, present: true, ids: [...new Set((game.earnedChapterIds || []).filter((id) => known.has(id)))] };
}

function readState(playerId, storage) {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', progress: null, error: 'Letter Launch progress storage is unavailable.' };
  const canonical = readCanonical(playerId, storage);
  if (!canonical.ok) return { ...canonical, status: 'unavailable', progress: null };
  const legacyLevels = readLegacyLevels(playerId, storage);
  if (!legacyLevels.ok) return { ...legacyLevels, status: 'unavailable', progress: null };
  const legacyBadges = readLegacyBadges(playerId, storage);
  if (!legacyBadges.ok) return { ...legacyBadges, status: 'unavailable', progress: null };
  const stored = canonical.progress;
  const completed = new Set([...stored.completedChapterIds, ...legacyBadges.ids]);
  const badgeIndexCeiling = legacyBadges.ids.reduce((max, id) => Math.max(max, LETTER_LAUNCH_CHAPTER_IDS.indexOf(id)), -1);
  const unlockedChapterIndex = Math.min(LETTER_LAUNCH_CHAPTER_IDS.length - 1,
    Math.max(stored.unlockedChapterIndex, legacyLevels.unlocked, badgeIndexCeiling + 1));
  const completedChapterIds = LETTER_LAUNCH_CHAPTER_IDS.filter((id) => completed.has(id));
  // An old unlocked level means all earlier chapters were completed, even if
  // an old badge write was lost. Do not award those chapters again.
  const legacyRewardCeiling = Math.max(legacyLevels.present ? legacyLevels.unlocked - 1 : -1, badgeIndexCeiling);
  return {
    ok: true,
    status: canonical.fresh && !legacyLevels.present && !legacyBadges.ids.length ? 'fresh' : 'ready',
    fresh: canonical.fresh,
    storedProgress: stored,
    progress: { ...stored, unlockedChapterIndex, completedChapterIds },
    legacy: { levels: legacyLevels, badges: legacyBadges, rewardCeiling: legacyRewardCeiling },
    error: null,
  };
}

function persist(playerId, next, storage, previous) {
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    const raw = storage.getItem(keyFor(playerId));
    if (raw !== encoded || !validateProgress(JSON.parse(raw))) throw new Error('Letter Launch readback failed');
    return { ok: true, status: 'saved', progress: JSON.parse(raw), error: null };
  } catch {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Letter Launch progress could not be confirmed. Retry this chapter result.' };
  }
}

export const letterLaunchProgressKey = (playerId) => keyFor(playerId);

export function readLetterLaunchProgress(playerId, storageOverride) {
  return readState(playerId, selectStorage(storageOverride));
}

export function commitLetterLaunchChapter(playerId, chapterIndex, attemptId, storageOverride) {
  const storage = selectStorage(storageOverride);
  const before = readState(playerId, storage);
  if (!before.ok) return { ...before, receipt: null, rewardDelta: 0, alreadyCompleted: false };
  if (!Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= LETTER_LAUNCH_CHAPTER_IDS.length) {
    return { ok: false, status: 'invalid', progress: before.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'Letter Launch chapter is invalid.' };
  }
  if (chapterIndex > before.progress.unlockedChapterIndex) return { ok: false, status: 'locked', progress: before.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'Finish the earlier Letter Launch chapter first.' };
  const chapterId = LETTER_LAUNCH_CHAPTER_IDS[chapterIndex];
  const current = before.storedProgress;
  const existing = current.chapterReceipts.find((receipt) => receipt.chapterId === chapterId);
  if (existing) return { ok: true, status: 'recovered', progress: before.progress, receipt: { ...existing }, rewardDelta: existing.parentClaimed ? 0 : existing.rewardDelta, alreadyCompleted: true, recovered: true, error: null };
  if (before.progress.completedChapterIds.includes(chapterId)) return { ok: true, status: 'already-completed', progress: before.progress, receipt: null, rewardDelta: 0, alreadyCompleted: true, recovered: false, error: null };
  if (!safeId(attemptId)) return { ok: false, status: 'invalid', progress: before.progress, receipt: null, rewardDelta: 0, alreadyCompleted: false, error: 'This chapter attempt could not be identified.' };
  const receipt = before.legacy.rewardCeiling >= chapterIndex ? null : {
    transactionId: attemptId,
    chapterId,
    rewardDelta: LETTER_LAUNCH_REWARD_DELTA,
    parentClaimed: false,
  };
  const next = {
    ...current,
    unlockedChapterIndex: Math.min(LETTER_LAUNCH_CHAPTER_IDS.length - 1, Math.max(current.unlockedChapterIndex, chapterIndex + 1)),
    completedChapterIds: [...current.completedChapterIds, chapterId],
    ...(receipt ? { chapterReceipts: [...current.chapterReceipts, receipt] } : {}),
  };
  const saved = persist(playerId, next, storage, before.progress);
  if (!saved.ok) return { ...saved, receipt, rewardDelta: receipt?.rewardDelta || 0, alreadyCompleted: false, recovered: false };
  return {
    ...saved,
    progress: { ...saved.progress, unlockedChapterIndex: before.progress.unlockedChapterIndex < chapterIndex + 1 ? Math.min(LETTER_LAUNCH_CHAPTER_IDS.length - 1, chapterIndex + 1) : before.progress.unlockedChapterIndex, completedChapterIds: LETTER_LAUNCH_CHAPTER_IDS.filter((id) => [...before.progress.completedChapterIds, chapterId].includes(id)) },
    receipt,
    rewardDelta: receipt?.rewardDelta || 0,
    alreadyCompleted: false,
    recovered: false,
    status: receipt ? 'saved' : 'legacy-complete',
  };
}

export function markLetterLaunchRewardClaimed(playerId, transactionId, storageOverride) {
  const storage = selectStorage(storageOverride);
  const before = readState(playerId, storage);
  if (!before.ok) return before;
  const current = before.storedProgress;
  const receipt = current.chapterReceipts.find((entry) => entry.transactionId === transactionId);
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: before.progress, error: 'The saved chapter receipt was not found.' };
  if (receipt.parentClaimed) return { ok: true, status: 'already-claimed', progress: before.progress, error: null };
  const next = { ...current, chapterReceipts: current.chapterReceipts.map((entry) => entry.transactionId === transactionId ? { ...entry, parentClaimed: true } : entry) };
  return persist(playerId, next, storage, before.progress);
}

export const pendingLetterLaunchRewards = (progress) => Array.isArray(progress?.chapterReceipts)
  ? progress.chapterReceipts.filter((receipt) => receipt.rewardDelta === LETTER_LAUNCH_REWARD_DELTA && !receipt.parentClaimed).map((receipt) => ({ ...receipt }))
  : [];

export async function drainPendingLetterLaunchRewards(progress, confirmReceipt) {
  const pending = pendingLetterLaunchRewards(progress);
  let confirmed = 0;
  for (const receipt of pending) {
    if (await confirmReceipt(receipt) !== true) {
      return { ok: false, confirmed, remaining: pending.slice(confirmed).map((entry) => ({ ...entry })) };
    }
    confirmed += 1;
  }
  return { ok: true, confirmed, remaining: [] };
}
