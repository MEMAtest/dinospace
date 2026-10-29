import { SOUND_SAFARI_CHAPTERS, SOUND_SAFARI_PHONEME_KEYS, SOUND_SAFARI_WORDS } from './soundSafariAdventure.js';

export const SOUND_SAFARI_PROGRESS_KEY = 'sound_safari_adventure_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${SOUND_SAFARI_PROGRESS_KEY}`;
const chapterIds = SOUND_SAFARI_CHAPTERS.map(({ id }) => id);
const empty = () => ({ version: 1, unlockedChapter: 0, completedChapterIds: [], earnedChapterIds: [], recentRoundIds: [], rewardReceipts: {} });
const browserStorage = () => { try { return globalThis.window?.localStorage || null; } catch { return null; } };
const validRoundIds = new Map([
  ['listen', new Set(SOUND_SAFARI_PHONEME_KEYS.map((sound) => `listen-${sound}`))],
  ['blend', new Set(SOUND_SAFARI_WORDS.filter((word) => !word.listeningOnly).map((word) => `blend-${word.id}`))],
  ['segment', new Set(SOUND_SAFARI_WORDS.filter((word) => !word.listeningOnly).map((word) => `segment-${word.id}`))],
]);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactOrderedIds = (ids) => ids.every((id, index) => id === chapterIds[index]);

const validate = (value) => {
  if (!isRecord(value) || value.version !== 1) return null;
  const completed = value.completedChapterIds === undefined ? [] : value.completedChapterIds;
  const earned = value.earnedChapterIds === undefined ? completed : value.earnedChapterIds;
  if (!Array.isArray(completed) || !Array.isArray(earned)) return null;
  const unlocked = value.unlockedChapter === undefined ? Math.min(completed.length, 2) : value.unlockedChapter;
  const recent = value.recentRoundIds === undefined ? [] : value.recentRoundIds;
  const receipts = value.rewardReceipts === undefined ? {} : value.rewardReceipts;
  if (!Array.isArray(completed) || !Array.isArray(earned)
    || completed.some((id) => !chapterIds.includes(id)) || earned.some((id) => !chapterIds.includes(id))
    || new Set(completed).size !== completed.length || new Set(earned).size !== earned.length
    || completed.length !== earned.length || !exactOrderedIds(completed) || !exactOrderedIds(earned)
    || !Number.isInteger(unlocked) || unlocked < 0 || unlocked > 2 || unlocked !== Math.min(completed.length, 2)
    || !Array.isArray(recent) || recent.length > 18 || recent.some((id) => ![...validRoundIds.values()].some((set) => set.has(id)))
    || new Set(recent).size !== recent.length || !isRecord(receipts)) return null;
  for (const [id, receipt] of Object.entries(receipts)) {
    if (!isRecord(receipt) || receipt.id !== id || !chapterIds.includes(receipt.chapterId)
      || id !== `${receipt.chapterId}:complete` || receipt.rewardDelta !== 2
      || typeof receipt.claimed !== 'boolean' || !completed.includes(receipt.chapterId)) return null;
  }
  return {
    ...empty(), ...value,
    completedChapterIds: [...completed], earnedChapterIds: [...earned], unlockedChapter: unlocked,
    recentRoundIds: [...recent], rewardReceipts: Object.fromEntries(Object.entries(receipts).map(([id, receipt]) => [id, { ...receipt }])),
  };
};

const readStrict = (playerId, storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', error: 'Saved sound progress is unavailable.' };
  let raw;
  try { raw = storage.getItem(keyFor(playerId)); } catch { return { ok: false, status: 'unavailable', error: 'Saved sound progress could not be read.' }; }
  if (raw === null) return { ok: true, status: 'empty', progress: empty(), raw: null };
  if (typeof raw !== 'string' || !raw) return { ok: false, status: 'invalid', error: 'Saved sound progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, status: 'invalid', error: 'Saved sound progress is invalid.' }; }
  const progress = validate(parsed);
  return progress ? { ok: true, status: 'record', progress, raw } : { ok: false, status: 'invalid', error: 'Saved sound progress is invalid.' };
};

const writeStrict = (playerId, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'unavailable', progress: previous, error: 'Progress could not be saved. Check storage and retry.' };
  }
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    const readback = storage.getItem(keyFor(playerId));
    if (readback !== encoded) throw new Error('Exact readback did not match.');
    const parsed = validate(JSON.parse(readback));
    if (!parsed) throw new Error('Saved progress failed validation.');
    return { ok: true, status: 'saved', progress: parsed };
  } catch {
    return { ok: false, status: 'unconfirmed', progress: previous, error: 'Progress could not be confirmed. Retry this same chapter.' };
  }
};

export const readSoundSafariProgressStrict = (playerId = 'amari', storage = browserStorage()) => readStrict(playerId, storage);
export const getSoundSafariProgressStrict = readSoundSafariProgressStrict;

export const recordSoundSafariChapterCompletionStrict = (playerId, chapterId, roundIds, storage = browserStorage()) => {
  const chapterIndex = chapterIds.indexOf(chapterId);
  const validIds = validRoundIds.get(chapterId);
  if (chapterIndex < 0 || !Array.isArray(roundIds) || roundIds.length !== 6 || new Set(roundIds).size !== 6 || roundIds.some((id) => !validIds?.has(id))) {
    return { ok: false, status: 'invalid', error: 'This chapter result is invalid.' };
  }
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  const progress = loaded.progress;
  const unlockedChapter = Math.min(progress.completedChapterIds.length, 2);
  if (chapterIndex > unlockedChapter) return { ok: false, status: 'locked', progress, error: 'Finish the previous chapter first.' };
  const wasCompleted = progress.completedChapterIds.includes(chapterId);
  const completedChapterIds = wasCompleted ? [...progress.completedChapterIds] : [...progress.completedChapterIds, chapterId];
  const recentRoundIds = [...progress.recentRoundIds.filter((id) => !roundIds.includes(id)), ...roundIds].slice(-18);
  const rewardReceipts = { ...progress.rewardReceipts };
  const receiptId = `${chapterId}:complete`;
  if (!wasCompleted && !rewardReceipts[receiptId]) rewardReceipts[receiptId] = { id: receiptId, chapterId, rewardDelta: 2, claimed: false };
  const next = { ...progress, completedChapterIds, earnedChapterIds: completedChapterIds, unlockedChapter: Math.min(completedChapterIds.length, 2), recentRoundIds, rewardReceipts };
  const saved = writeStrict(playerId, next, storage, progress);
  const receipt = saved.ok ? saved.progress.rewardReceipts[receiptId] || null : rewardReceipts[receiptId] || null;
  return { ...saved, newlyCompleted: saved.ok && !wasCompleted, eligibleReward: !wasCompleted || receipt?.claimed === false, receipt: receipt?.claimed === false ? receipt : null };
};

export const pendingSoundSafariRewardReceipts = (progress) => Object.values(progress?.rewardReceipts || {}).filter((receipt) => !receipt.claimed).map((receipt) => ({ ...receipt }));
export const getPendingSoundSafariRewardReceiptsStrict = (playerId = 'amari', storage = browserStorage()) => {
  const loaded = readStrict(playerId, storage);
  return loaded.ok ? { ...loaded, receipts: pendingSoundSafariRewardReceipts(loaded.progress) } : loaded;
};

export const markSoundSafariRewardReceiptClaimedStrict = (playerId, receiptId, storage = browserStorage()) => {
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  const receipt = loaded.progress.rewardReceipts[receiptId];
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: loaded.progress, error: 'The saved sound reward was not found.' };
  if (receipt.claimed) return { ok: true, status: 'already-claimed', progress: loaded.progress, receipt };
  const next = { ...loaded.progress, rewardReceipts: { ...loaded.progress.rewardReceipts, [receiptId]: { ...receipt, claimed: true } } };
  return { ...writeStrict(playerId, next, storage, loaded.progress), receipt: { ...receipt, claimed: true } };
};

// Compatibility projections for older readers. New gameplay uses the strict APIs above.
export function getSoundSafariProgress(playerId, storage = browserStorage()) {
  const loaded = readStrict(playerId, storage);
  return loaded.ok ? loaded.progress : empty();
}

export function recordSoundSafariChapterCompletion(playerId, chapterId, roundIds, storage = browserStorage()) {
  const result = recordSoundSafariChapterCompletionStrict(playerId, chapterId, roundIds, storage);
  if (result.status === 'invalid' || result.status === 'locked') return null;
  return {
    progress: result.progress || getSoundSafariProgress(playerId, storage),
    newlyEarned: Boolean(result.ok && result.newlyCompleted),
    persisted: Boolean(result.ok),
    storageError: !result.ok,
  };
}
