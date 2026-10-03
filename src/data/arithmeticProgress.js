import { ARITHMETIC_CHAPTERS, SUBTRACTION_CHAPTERS, isValidArithmeticRun } from './arithmeticAdventure.js';
const VERSION = 1;
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
export const arithmeticProgressKey = (game, playerId = 'amari') => `${playerId || 'amari'}_${game}_progress_v1`;
const blank = () => ({ version: VERSION, completedChapterIds: [], bestStars: {}, recentQuestionIds: {}, unlockedChapter: 0 });
export const normalizeArithmeticProgress = (value, game) => {
  const out = blank(); const chapters = game === 'addition' ? ARITHMETIC_CHAPTERS : SUBTRACTION_CHAPTERS;
  if (!isObject(value) || value.version !== VERSION) return out;
  const valid = new Set(chapters.map(ch => ch.id));
  const requested = new Set((Array.isArray(value.completedChapterIds) ? value.completedChapterIds : []).filter(id => valid.has(id)));
  const completed = [];
  while (completed.length < chapters.length && requested.has(chapters[completed.length].id)) completed.push(chapters[completed.length].id);
  const unlocked = Math.min(completed.length, chapters.length - 1);
  const bestStars = isObject(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, n]) => valid.has(id) && Number.isInteger(n) && n >= 0 && n <= 3 && completed.includes(id))) : {};
  const recentQuestionIds = isObject(value.recentQuestionIds) ? Object.fromEntries(Object.entries(value.recentQuestionIds).filter(([i, ids]) => Number.isInteger(Number(i)) && Number(i) >= 0 && Number(i) < chapters.length && Array.isArray(ids)).map(([i, ids]) => [i, [...new Set(ids.filter(id => typeof id === 'string'))].slice(-8)])) : {};
  return { version: VERSION, completedChapterIds: completed, bestStars, recentQuestionIds, unlockedChapter: unlocked };
};
export const getArithmeticProgress = (game, playerId = 'amari', storage = globalThis.window?.localStorage) => { try { return normalizeArithmeticProgress(JSON.parse(storage?.getItem(arithmeticProgressKey(game, playerId)) || 'null'), game); } catch { return blank(); } };
export const saveArithmeticRun = (game, playerId, chapterIndex, run, stars, storage = globalThis.window?.localStorage) => {
  const chapters = game === 'addition' ? ARITHMETIC_CHAPTERS : SUBTRACTION_CHAPTERS;
  if (!Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapters.length || !isValidArithmeticRun(run, game, chapterIndex) || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const progress = getArithmeticProgress(game, playerId, storage); if (chapterIndex > progress.unlockedChapter) return null;
  const id = chapters[chapterIndex].id; const oldStars = progress.bestStars[id] || 0;
  const recent = progress.recentQuestionIds[chapterIndex] || [];
  const completedChapterIds = progress.completedChapterIds.includes(id) ? progress.completedChapterIds : [...progress.completedChapterIds, id];
  const next = normalizeArithmeticProgress({ ...progress, completedChapterIds, bestStars: { ...progress.bestStars, [id]: Math.max(oldStars, stars) }, recentQuestionIds: { ...progress.recentQuestionIds, [chapterIndex]: [...recent, ...run.map(q => q.id).filter(qid => !recent.includes(qid))].slice(-8) } }, game);
  try { storage?.setItem(arithmeticProgressKey(game, playerId), JSON.stringify(next)); } catch { /* play remains available without persistence */ }
  return { progress: next, awardedStars: Math.max(0, stars - oldStars), newlyCompleted: !progress.completedChapterIds.includes(id) };
};
