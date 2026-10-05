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
