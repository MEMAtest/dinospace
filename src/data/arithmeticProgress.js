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
