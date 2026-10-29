import { TIME_CHAPTERS, NUMBER_LINE_CHAPTERS, isKnownTimeQuestionId, isKnownNumberQuestionId, isValidTimeRun, isValidNumberLineRun } from './timeLineAdventure.js';
const VERSION = 1;
const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const chaptersFor = (game) => game === 'timeteller' ? TIME_CHAPTERS : game === 'numberline' ? NUMBER_LINE_CHAPTERS : [];
export const timeLineProgressKey = (game, child = 'amari') => `${child || 'amari'}_${game}_progress_v1`;
const blank = () => ({ version: VERSION, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0 });
export const normalizeTimeLineProgress = (value, game) => {
  const out = blank(); const chapters = chaptersFor(game); if (!chapters.length || !object(value) || value.version !== VERSION) return out;
  const valid = new Set(chapters.map((c) => c.id)); const wanted = new Set((Array.isArray(value.completedChapterIds) ? value.completedChapterIds : []).filter((id) => valid.has(id)));
  while (out.completedChapterIds.length < chapters.length && wanted.has(chapters[out.completedChapterIds.length].id)) out.completedChapterIds.push(chapters[out.completedChapterIds.length].id);
  out.unlockedChapter = Math.min(out.completedChapterIds.length, chapters.length - 1);
  out.bestStars = object(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, n]) => valid.has(id) && out.completedChapterIds.includes(id) && Number.isInteger(n) && n >= 1 && n <= 3)) : {};
  const validRecentId = game === 'timeteller' ? isKnownTimeQuestionId : isKnownNumberQuestionId;
  out.recentQuestionIds = object(value.recentQuestionIds) ? Object.fromEntries(Object.entries(value.recentQuestionIds).filter(([i, ids]) => Number.isInteger(+i) && +i >= 0 && +i < chapters.length && Array.isArray(ids)).map(([i, ids]) => [i, [...new Set(ids.filter((id) => validRecentId(id, Number(i))))].slice(-8)]).filter(([, ids]) => ids.length)) : {};
  return out;
};
export const getTimeLineProgress = (game, child, storage = globalThis.window?.localStorage) => { try { return normalizeTimeLineProgress(JSON.parse(storage?.getItem(timeLineProgressKey(game, child)) || 'null'), game); } catch { return blank(); } };
export const rememberTimeLineRun = (game, child, chapterIndex, run, storage = globalThis.window?.localStorage) => {
  const chapters = chaptersFor(game); const valid = game === 'timeteller' ? isValidTimeRun(run, chapterIndex) : isValidNumberLineRun(run, chapterIndex);
  if (!chapters.length || !valid || chapterIndex > getTimeLineProgress(game, child, storage).unlockedChapter) return null;
  const progress = getTimeLineProgress(game, child, storage); const old = progress.recentQuestionIds[chapterIndex] || [];
  const recentQuestionIds = { ...progress.recentQuestionIds, [chapterIndex]: [...old, ...run.map((q) => q.id).filter((id) => !old.includes(id))].slice(-8) };
  const next = normalizeTimeLineProgress({ ...progress, recentQuestionIds }, game);
  try { storage?.setItem(timeLineProgressKey(game, child), JSON.stringify(next)); } catch { /* Local progress is optional. */ }
  return next;
};
export const saveTimeLineRun = (game, child, chapterIndex, run, stars, storage = globalThis.window?.localStorage) => {
  const chapters = chaptersFor(game); const valid = game === 'timeteller' ? isValidTimeRun(run, chapterIndex) : isValidNumberLineRun(run, chapterIndex);
  if (!chapters.length || !Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapters.length || !valid || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const progress = getTimeLineProgress(game, child, storage); if (chapterIndex > progress.unlockedChapter) return null;
  const id = chapters[chapterIndex].id; const oldStars = progress.bestStars[id] || 0; const completedChapterIds = progress.completedChapterIds.includes(id) ? progress.completedChapterIds : [...progress.completedChapterIds, id];
  const recent = progress.recentQuestionIds[chapterIndex] || []; const next = normalizeTimeLineProgress({ ...progress, completedChapterIds, bestStars: { ...progress.bestStars, [id]: Math.max(oldStars, stars) }, recentQuestionIds: { ...progress.recentQuestionIds, [chapterIndex]: [...recent, ...run.map((q) => q.id).filter((qid) => !recent.includes(qid))].slice(-8) } }, game);
  try { storage?.setItem(timeLineProgressKey(game, child), JSON.stringify(next)); } catch { /* Local progress is optional. */ }
  return { progress: next, awardedStars: Math.max(0, stars - oldStars), newlyCompleted: !progress.completedChapterIds.includes(id) };
};

// New strict APIs are shared by Number Line and Time Teller. The historical
// wrappers above remain unchanged until the Time Teller component is uplifted.
const strictBlank = () => ({ ...blank(), rewardReceipts: {} });
const strictValidate = (value, game) => {
  const chapters = chaptersFor(game);
  if (!chapters.length || !object(value) || value.version !== VERSION) return null;
  if (value.completedChapterIds !== undefined && !Array.isArray(value.completedChapterIds)) return null;
  if (value.bestStars !== undefined && !object(value.bestStars)) return null;
  if (value.recentQuestionIds !== undefined && !object(value.recentQuestionIds)) return null;
  if (value.rewardReceipts !== undefined && !object(value.rewardReceipts)) return null;
  const chapterIds = new Set(chapters.map(({ id }) => id));
  const completed = value.completedChapterIds || [];
  const canonical = chapters.slice(0, completed.length).map(({ id }) => id);
  if (completed.length > chapters.length || completed.some((id, index) => !chapterIds.has(id) || id !== canonical[index]) || new Set(completed).size !== completed.length) return null;
  const unlockedChapter = Math.min(completed.length, chapters.length - 1);
  if (value.unlockedChapter !== undefined && (!Number.isInteger(value.unlockedChapter) || value.unlockedChapter < 0 || value.unlockedChapter >= chapters.length || value.unlockedChapter !== unlockedChapter)) return null;
  const bestStars = value.bestStars || {};
  if (Object.entries(bestStars).some(([id, stars]) => !completed.includes(id) || !Number.isInteger(stars) || stars < 0 || stars > 3)) return null;
  const isKnownId = game === 'timeteller' ? isKnownTimeQuestionId : isKnownNumberQuestionId;
  const recent = value.recentQuestionIds || {};
  if (Object.entries(recent).some(([rawIndex, ids]) => {
    const index = Number(rawIndex);
    return !Number.isInteger(index) || index < 0 || index >= chapters.length || !Array.isArray(ids)
      || ids.some((id) => !isKnownId(id, index)) || new Set(ids).size !== ids.length;
  })) return null;
  const receipts = value.rewardReceipts || {};
  const totals = {};
  for (const [id, receipt] of Object.entries(receipts)) {
    const chapter = chapters.find(({ id: chapterId }) => chapterId === receipt?.chapterId);
    if (!object(receipt) || !chapter || receipt.id !== id || id !== `${chapter.id}:best:${receipt.bestStars}`
      || !Number.isInteger(receipt.bestStars) || receipt.bestStars < 1 || receipt.bestStars > 3
      || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1 || receipt.rewardDelta > receipt.bestStars
      || typeof receipt.claimed !== 'boolean' || !completed.includes(chapter.id)
      || (bestStars[chapter.id] || 0) < receipt.bestStars) return null;
    totals[chapter.id] = (totals[chapter.id] || 0) + receipt.rewardDelta;
  }
  if (Object.entries(totals).some(([id, total]) => total > (bestStars[id] || 0))) return null;
  return { ...strictBlank(), ...value, completedChapterIds: [...completed], bestStars: { ...bestStars }, recentQuestionIds: Object.fromEntries(Object.entries(recent).map(([i, ids]) => [i, [...ids].slice(-8)])), unlockedChapter, rewardReceipts: Object.fromEntries(Object.entries(receipts).map(([id, receipt]) => [id, { ...receipt }])) };
};
const strictStorage = () => { try { return globalThis.window?.localStorage || null; } catch { return null; } };
const strictRead = (game, child, storage) => {
  if (!chaptersFor(game).length) return { ok: false, error: 'The selected timeline is invalid.' };
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, error: 'Saved timeline progress is unavailable.' };
  try {
    const raw = storage.getItem(timeLineProgressKey(game, child));
    if (raw === null) return { ok: true, progress: strictBlank(), raw: null };
    if (typeof raw !== 'string' || !raw) return { ok: false, error: 'Saved timeline progress is unreadable.' };
    const parsed = JSON.parse(raw); const progress = strictValidate(parsed, game);
    return progress ? { ok: true, progress, raw } : { ok: false, error: 'Saved timeline progress is invalid.' };
  } catch { return { ok: false, error: 'Saved timeline progress could not be read.' }; }
};
const strictWrite = (game, child, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { ok: false, progress: previous, error: 'Progress could not be saved. Check storage and retry.' };
  try {
    const encoded = JSON.stringify(next); storage.setItem(timeLineProgressKey(game, child), encoded);
    const readback = storage.getItem(timeLineProgressKey(game, child));
    if (readback !== encoded || !strictValidate(JSON.parse(readback), game)) throw new Error('timeline progress readback mismatch');
    return { ok: true, progress: strictValidate(JSON.parse(readback), game) };
  } catch { return { ok: false, progress: previous, error: 'Progress could not be confirmed. Retry this same result.' }; }
};
export const readTimeLineProgressStrict = (game, child = 'amari', storage = strictStorage()) => {
  const read = strictRead(game, child, storage);
  return read.ok ? { ok: true, progress: read.progress } : read;
};
const validTimelineRun = (game, chapterIndex, run) => Number.isInteger(chapterIndex) && chapterIndex >= 0 && chapterIndex < chaptersFor(game).length
  && (game === 'timeteller' ? isValidTimeRun(run, chapterIndex) : game === 'numberline' && isValidNumberLineRun(run, chapterIndex));
export const rememberTimeLineRunStrict = (game, child, chapterIndex, run, storage = strictStorage()) => {
  if (!validTimelineRun(game, chapterIndex, run)) return { ok: false, progress: null, error: 'The selected timeline run is invalid.' };
  const read = strictRead(game, child, storage);
  if (!read.ok) return { ok: false, progress: null, error: read.error };
  if (chapterIndex > read.progress.unlockedChapter) return { ok: false, progress: read.progress, error: 'Finish the previous chapter first.' };
  const previous = read.progress.recentQuestionIds[chapterIndex] || [];
  const runIds = run.map(({ id }) => id);
  const recentQuestionIds = { ...read.progress.recentQuestionIds, [chapterIndex]: [...previous.filter((id) => !runIds.includes(id)), ...runIds].slice(-8) };
  return { ...strictWrite(game, child, { ...read.progress, recentQuestionIds }, storage, read.progress), runIds };
};
export const recordTimeLineRunCompletionStrict = (game, child, chapterIndex, run, stars, storage = strictStorage()) => {
  if (!validTimelineRun(game, chapterIndex, run) || !Number.isInteger(stars) || stars < 1 || stars > 3) return { ok: false, progress: null, error: 'This timeline result is invalid.' };
  const read = strictRead(game, child, storage);
  if (!read.ok) return { ok: false, progress: null, error: read.error };
  const progress = read.progress;
  if (chapterIndex > progress.unlockedChapter) return { ok: false, progress, error: 'Finish the previous chapter first.' };
  const chapter = chaptersFor(game)[chapterIndex];
  const wasCompleted = progress.completedChapterIds.includes(chapter.id);
  const oldStars = progress.bestStars[chapter.id];
  const unknownLegacyRating = wasCompleted && oldStars === 0;
  const awardedStars = oldStars === undefined ? (wasCompleted ? 0 : stars) : unknownLegacyRating ? 0 : Math.max(0, stars - oldStars);
  const bestStars = { ...progress.bestStars, [chapter.id]: Math.max(oldStars || 0, stars) };
  const completedChapterIds = wasCompleted ? [...progress.completedChapterIds] : [...progress.completedChapterIds, chapter.id];
  const priorRecent = progress.recentQuestionIds[chapterIndex] || [];
  const runIds = run.map(({ id }) => id);
  const recentQuestionIds = { ...progress.recentQuestionIds, [chapterIndex]: [...priorRecent.filter((id) => !runIds.includes(id)), ...runIds].slice(-8) };
  const receiptId = `${chapter.id}:best:${bestStars[chapter.id]}`;
  const rewardReceipts = { ...progress.rewardReceipts };
  if (awardedStars > 0 && !rewardReceipts[receiptId]) rewardReceipts[receiptId] = { id: receiptId, chapterId: chapter.id, bestStars: bestStars[chapter.id], rewardDelta: awardedStars, claimed: false };
  const next = { ...progress, completedChapterIds, bestStars, recentQuestionIds, unlockedChapter: Math.min(completedChapterIds.length, chaptersFor(game).length - 1), rewardReceipts };
  const saved = strictWrite(game, child, next, storage, progress);
  if (!saved.ok) return { ...saved, newlyCompleted: false, awardedStars: 0, receipt: null };
  return { ...saved, newlyCompleted: !wasCompleted, awardedStars, receipt: saved.progress.rewardReceipts[receiptId]?.claimed === false ? saved.progress.rewardReceipts[receiptId] : null };
};
export const pendingTimeLineRewardReceipts = (progress) => Object.values(progress?.rewardReceipts || {}).filter((receipt) => !receipt.claimed).map((receipt) => ({ ...receipt }));
export const getPendingTimeLineRewardReceiptsStrict = (game, child = 'amari', storage = strictStorage()) => {
  const loaded = strictRead(game, child, storage);
  return loaded.ok ? { ok: true, progress: loaded.progress, receipts: pendingTimeLineRewardReceipts(loaded.progress) } : loaded;
};
export const markTimeLineRewardReceiptClaimedStrict = (game, child, receiptId, storage = strictStorage()) => {
  const loaded = strictRead(game, child, storage);
  if (!loaded.ok) return loaded;
  const receipt = loaded.progress.rewardReceipts[receiptId];
  if (!receipt) return { ok: false, progress: loaded.progress, error: 'The saved reward receipt was not found.' };
  if (receipt.claimed) return { ok: true, progress: loaded.progress, receipt };
  const next = { ...loaded.progress, rewardReceipts: { ...loaded.progress.rewardReceipts, [receiptId]: { ...receipt, claimed: true } } };
  return { ...strictWrite(game, child, next, storage, loaded.progress), receipt: { ...receipt, claimed: true } };
};
