import {
  ARITHMETIC_CHAPTERS,
  SUBTRACTION_CHAPTERS,
  isCanonicalArithmeticId,
  isValidArithmeticRun,
} from './arithmeticAdventure.js';

const VERSION = 1;
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
export const arithmeticProgressKey = (game, playerId = 'amari') => `${playerId || 'amari'}_${game}_progress_v1`;
const blank = () => ({ version: VERSION, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0 });
const chaptersFor = (game) => (game === 'addition' ? ARITHMETIC_CHAPTERS : SUBTRACTION_CHAPTERS);
const browserStorage = () => { try { return globalThis.window?.localStorage || null; } catch { return null; } };

const emptyStrictProgress = () => ({ version: VERSION, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0, rewardReceipts: {} });
const validateStrictProgress = (value, game) => {
  if (!isObject(value) || value.version !== VERSION || !['addition', 'subtraction'].includes(game)) return null;
  const chapters = chaptersFor(game);
  const chapterIds = new Set(chapters.map(({ id }) => id));
  const completed = value.completedChapterIds === undefined ? [] : value.completedChapterIds;
  const bestStars = value.bestStars === undefined ? {} : value.bestStars;
  const recent = value.recentQuestionIds === undefined ? {} : value.recentQuestionIds;
  const receipts = value.rewardReceipts === undefined ? {} : value.rewardReceipts;
  if (!Array.isArray(completed) || completed.some((id) => !chapterIds.has(id)) || new Set(completed).size !== completed.length
    || !isObject(bestStars) || Object.entries(bestStars).some(([id, stars]) => !chapterIds.has(id) || !completed.includes(id) || !Number.isInteger(stars) || stars < 0 || stars > 3)
    || !isObject(recent) || Object.entries(recent).some(([rawIndex, ids]) => {
      const index = Number(rawIndex);
      return !Number.isInteger(index) || index < 0 || index >= chapters.length || !Array.isArray(ids)
        || ids.some((id) => typeof id !== 'string' || !isCanonicalArithmeticId(id, game, index))
        || new Set(ids).size !== ids.length;
    }) || !isObject(receipts)) return null;
  const contiguous = chapters.slice(0, completed.length).map(({ id }) => id);
  if (completed.some((id, index) => id !== contiguous[index])) return null;
  const derivedUnlock = Math.min(completed.length, chapters.length - 1);
  if (value.unlockedChapter !== undefined
    && (!Number.isInteger(value.unlockedChapter) || value.unlockedChapter < 0
      || value.unlockedChapter >= chapters.length || value.unlockedChapter !== derivedUnlock)) return null;
  const receiptTotals = {};
  for (const [id, receipt] of Object.entries(receipts)) {
    const chapter = chapters.find(({ id: chapterId }) => chapterId === receipt?.chapterId);
    if (!chapter || receipt.id !== id || id !== `${chapter.id}:best:${receipt.bestStars}`
      || !Number.isInteger(receipt.bestStars) || receipt.bestStars < 1 || receipt.bestStars > 3
      || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1 || receipt.rewardDelta > 3
      || receipt.rewardDelta > receipt.bestStars
      || typeof receipt.claimed !== 'boolean' || !completed.includes(chapter.id)
      || (bestStars[chapter.id] || 0) < receipt.bestStars) return null;
    receiptTotals[chapter.id] = (receiptTotals[chapter.id] || 0) + receipt.rewardDelta;
  }
  if (Object.entries(receiptTotals).some(([id, total]) => total > (bestStars[id] || 0))) return null;
  return {
    ...emptyStrictProgress(), ...value,
    completedChapterIds: [...completed],
    bestStars: { ...bestStars },
    unlockedChapter: derivedUnlock,
    recentQuestionIds: Object.fromEntries(Object.entries(recent).map(([index, ids]) => [index, [...ids].slice(-8)])),
    rewardReceipts: Object.fromEntries(Object.entries(receipts).map(([id, receipt]) => [id, { ...receipt }])),
  };
};

const readStrict = (game, playerId, storage) => {
  if (!['addition', 'subtraction'].includes(game)) return { ok: false, status: 'invalid', error: 'The arithmetic game is invalid.' };
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', error: 'Saved arithmetic progress is unavailable.' };
  let raw;
  try { raw = storage.getItem(arithmeticProgressKey(game, playerId)); }
  catch { return { ok: false, status: 'unavailable', error: 'Saved arithmetic progress could not be read.' }; }
  if (raw === null) return { ok: true, status: 'fresh', progress: emptyStrictProgress(), raw: null };
  if (typeof raw !== 'string' || !raw) return { ok: false, status: 'invalid', error: 'Saved arithmetic progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, status: 'invalid', error: 'Saved arithmetic progress is invalid.' }; }
  const progress = validateStrictProgress(parsed, game);
  return progress ? { ok: true, status: 'ready', progress, raw } : { ok: false, status: 'invalid', error: 'Saved arithmetic progress is invalid.' };
};

const writeStrict = (game, playerId, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Progress could not be saved. Check storage and retry.' };
  }
  let encoded;
  try {
    encoded = JSON.stringify(next);
    storage.setItem(arithmeticProgressKey(game, playerId), encoded);
    const readback = storage.getItem(arithmeticProgressKey(game, playerId));
    if (readback !== encoded || !validateStrictProgress(JSON.parse(readback), game)) throw new Error('readback mismatch');
    return { ok: true, status: 'saved', progress: validateStrictProgress(JSON.parse(readback), game) };
  } catch {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Progress could not be confirmed. Retry this same result.' };
  }
};

export const readArithmeticProgressStrict = (game, playerId = 'amari', storage = browserStorage()) => readStrict(game, playerId, storage);
export const getArithmeticProgressStrict = readArithmeticProgressStrict;

export const rememberStartedArithmeticRunStrict = (game, playerId, chapterIndex, run, storage = browserStorage()) => {
  const chapters = chaptersFor(game);
  if (!['addition', 'subtraction'].includes(game) || !Number.isInteger(chapterIndex) || chapterIndex < 0
    || chapterIndex >= chapters.length || !isValidArithmeticRun(run, game, chapterIndex)) {
    return { ok: false, status: 'invalid', error: 'The selected arithmetic run is invalid.' };
  }
  const loaded = readStrict(game, playerId, storage);
  if (!loaded.ok) return loaded;
  const unlockedChapter = Math.min(loaded.progress.completedChapterIds.length, chapters.length - 1);
  if (chapterIndex > unlockedChapter) return { ok: false, status: 'locked', progress: loaded.progress, error: 'Finish the previous chapter first.' };
  const current = loaded.progress.recentQuestionIds[chapterIndex] || [];
  const runIds = run.map(({ id }) => id);
  const recentQuestionIds = { ...loaded.progress.recentQuestionIds, [chapterIndex]: [...current.filter((id) => !runIds.includes(id)), ...runIds].slice(-8) };
  const next = { ...loaded.progress, recentQuestionIds, unlockedChapter };
  return { ...writeStrict(game, playerId, next, storage, loaded.progress), runIds };
};

export const recordArithmeticRunCompletionStrict = (game, playerId, chapterIndex, run, stars, storage = browserStorage()) => {
  const chapters = chaptersFor(game);
  if (!['addition', 'subtraction'].includes(game) || !Number.isInteger(chapterIndex) || chapterIndex < 0
    || chapterIndex >= chapters.length || !isValidArithmeticRun(run, game, chapterIndex)
    || !Number.isInteger(stars) || stars < 1 || stars > 3) {
    return { ok: false, status: 'invalid', error: 'This chapter result is invalid.' };
  }
  const loaded = readStrict(game, playerId, storage);
  if (!loaded.ok) return loaded;
  const progress = loaded.progress;
  const unlockedChapter = Math.min(progress.completedChapterIds.length, chapters.length - 1);
  if (chapterIndex > unlockedChapter) return { ok: false, status: 'locked', progress, error: 'Finish the previous chapter first.' };
  const chapterId = chapters[chapterIndex].id;
  const wasCompleted = progress.completedChapterIds.includes(chapterId);
  const oldStars = progress.bestStars[chapterId] || 0;
  const bestStars = Math.max(oldStars, stars);
  const awardedStars = wasCompleted && oldStars === 0 ? 0 : Math.max(0, bestStars - oldStars);
  const completedChapterIds = wasCompleted ? [...progress.completedChapterIds] : [...progress.completedChapterIds, chapterId];
  const priorRecent = progress.recentQuestionIds[chapterIndex] || [];
  const runIds = run.map(({ id }) => id);
  const recentQuestionIds = { ...progress.recentQuestionIds, [chapterIndex]: [...priorRecent.filter((id) => !runIds.includes(id)), ...runIds].slice(-8) };
  const transactionId = `${chapterId}:best:${bestStars}`;
  const rewardReceipts = { ...progress.rewardReceipts };
  if (awardedStars > 0 && !rewardReceipts[transactionId]) {
    rewardReceipts[transactionId] = { id: transactionId, chapterId, bestStars, rewardDelta: awardedStars, claimed: false };
  }
  const next = { ...progress, completedChapterIds, bestStars: { ...progress.bestStars, [chapterId]: bestStars }, recentQuestionIds, unlockedChapter: Math.min(completedChapterIds.length, chapters.length - 1), rewardReceipts };
  const saved = writeStrict(game, playerId, next, storage, progress);
  if (!saved.ok) return { ...saved, newlyCompleted: false, awardedStars: 0, receipt: rewardReceipts[transactionId] || null };
  return {
    ...saved, newlyCompleted: !wasCompleted, awardedStars,
    receipt: saved.progress.rewardReceipts[transactionId]?.claimed === false ? saved.progress.rewardReceipts[transactionId] : null,
  };
};

export const pendingArithmeticRewardReceipts = (progress) => Object.values(progress?.rewardReceipts || {}).filter((receipt) => !receipt.claimed).map((receipt) => ({ ...receipt }));
export const getPendingArithmeticRewardReceiptsStrict = (game, playerId = 'amari', storage = browserStorage()) => {
  const loaded = readStrict(game, playerId, storage);
  return loaded.ok ? { ...loaded, receipts: pendingArithmeticRewardReceipts(loaded.progress) } : loaded;
};

export const markArithmeticRewardReceiptClaimedStrict = (game, playerId, receiptId, storage = browserStorage()) => {
  const loaded = readStrict(game, playerId, storage);
  if (!loaded.ok) return loaded;
  const receipt = loaded.progress.rewardReceipts[receiptId];
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: loaded.progress, error: 'The saved reward receipt was not found.' };
  if (receipt.claimed) return { ok: true, status: 'already-claimed', progress: loaded.progress, receipt };
  const next = { ...loaded.progress, rewardReceipts: { ...loaded.progress.rewardReceipts, [receiptId]: { ...receipt, claimed: true } } };
  return { ...writeStrict(game, playerId, next, storage, loaded.progress), receipt: { ...receipt, claimed: true } };
};

export const normalizeArithmeticProgress = (value, game) => {
  const out = blank();
  const chapters = chaptersFor(game);
  if (!isObject(value) || value.version !== VERSION || !['addition', 'subtraction'].includes(game)) return out;

  const validChapterIds = new Set(chapters.map((chapter) => chapter.id));
  const requested = new Set(
    (Array.isArray(value.completedChapterIds) ? value.completedChapterIds : [])
      .filter((id) => validChapterIds.has(id)),
  );
  const completedChapterIds = [];
  while (completedChapterIds.length < chapters.length
    && requested.has(chapters[completedChapterIds.length].id)) {
    completedChapterIds.push(chapters[completedChapterIds.length].id);
  }
  const unlockedChapter = Math.min(completedChapterIds.length, chapters.length - 1);
  const bestStars = isObject(value.bestStars)
    ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => (
      validChapterIds.has(id)
      && Number.isInteger(stars)
      && stars >= 0
      && stars <= 3
      && completedChapterIds.includes(id)
    )))
    : {};
  const recentQuestionIds = {};
  if (isObject(value.recentQuestionIds)) {
    for (const [rawIndex, ids] of Object.entries(value.recentQuestionIds)) {
      const chapterIndex = Number(rawIndex);
      if (!Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapters.length || !Array.isArray(ids)) continue;
      recentQuestionIds[chapterIndex] = [...new Set(ids.filter((id) => (
        typeof id === 'string' && isCanonicalArithmeticId(id, game, chapterIndex)
      )))].slice(-8);
    }
  }
  return { version: VERSION, completedChapterIds, bestStars, recentQuestionIds, unlockedChapter };
};

export const getArithmeticProgress = (game, playerId = 'amari', storage = globalThis.window?.localStorage) => {
  try {
    return normalizeArithmeticProgress(JSON.parse(storage?.getItem(arithmeticProgressKey(game, playerId)) || 'null'), game);
  } catch {
    return blank();
  }
};

const storeProgress = (game, playerId, progress, storage) => {
  try {
    storage?.setItem(arithmeticProgressKey(game, playerId), JSON.stringify(progress));
  } catch {
    // The run remains playable when browser storage is unavailable.
  }
};

export const rememberStartedArithmeticRun = (game, playerId, chapterIndex, run, storage = globalThis.window?.localStorage) => {
  const chapters = chaptersFor(game);
  if (!['addition', 'subtraction'].includes(game)
    || !Number.isInteger(chapterIndex)
    || chapterIndex < 0
    || chapterIndex >= chapters.length
    || !isValidArithmeticRun(run, game, chapterIndex)) return null;
  const progress = getArithmeticProgress(game, playerId, storage);
  if (chapterIndex > progress.unlockedChapter) return null;
  const previous = progress.recentQuestionIds[chapterIndex] || [];
  const next = normalizeArithmeticProgress({
    ...progress,
    recentQuestionIds: {
      ...progress.recentQuestionIds,
      [chapterIndex]: [...previous, ...run.map((question) => question.id).filter((id) => !previous.includes(id))].slice(-8),
    },
  }, game);
  storeProgress(game, playerId, next, storage);
  return next;
};

export const saveArithmeticRun = (game, playerId, chapterIndex, run, stars, storage = globalThis.window?.localStorage) => {
  const chapters = chaptersFor(game);
  if (!['addition', 'subtraction'].includes(game)
    || !Number.isInteger(chapterIndex)
    || chapterIndex < 0
    || chapterIndex >= chapters.length
    || !isValidArithmeticRun(run, game, chapterIndex)
    || !Number.isInteger(stars)
    || stars < 1
    || stars > 3) return null;
  const progress = getArithmeticProgress(game, playerId, storage);
  if (chapterIndex > progress.unlockedChapter) return null;

  const id = chapters[chapterIndex].id;
  const oldStars = progress.bestStars[id] || 0;
  const previous = progress.recentQuestionIds[chapterIndex] || [];
  const completedChapterIds = progress.completedChapterIds.includes(id)
    ? progress.completedChapterIds
    : [...progress.completedChapterIds, id];
  const next = normalizeArithmeticProgress({
    ...progress,
    completedChapterIds,
    bestStars: { ...progress.bestStars, [id]: Math.max(oldStars, stars) },
    recentQuestionIds: {
      ...progress.recentQuestionIds,
      [chapterIndex]: [...previous, ...run.map((question) => question.id).filter((questionId) => !previous.includes(questionId))].slice(-8),
    },
  }, game);
  storeProgress(game, playerId, next, storage);
  return {
    progress: next,
    awardedStars: Math.max(0, stars - oldStars),
    newlyCompleted: !progress.completedChapterIds.includes(id),
  };
};
