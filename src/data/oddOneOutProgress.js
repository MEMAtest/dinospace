import { ODD_ONE_OUT_CHAPTERS, ODD_ONE_OUT_ROUNDS_BY_CHAPTER } from './oddOneOutAdventure.js';

export const ODD_ONE_OUT_PROGRESS_VERSION = 2;
export const oddOneOutProgressKey = (playerId = 'default') => `${playerId || 'default'}_oddoneout_progress_v1`;

const emptyProgress = () => ({
  version: ODD_ONE_OUT_PROGRESS_VERSION,
  unlockedChapter: ODD_ONE_OUT_CHAPTERS[0].id,
  completedRoundIds: [],
  completedChapterIds: [],
  recentRoundIdsByChapter: {},
  bestRoundStars: {},
  bestStars: {},
});

const validIds = (ids, valid) => Array.isArray(ids)
  ? [...new Set(ids.filter((id) => typeof id === 'string' && valid.has(id)))].slice(-100)
  : [];
const validRecentIds = (ids, valid) => Array.isArray(ids)
  ? ids.filter((id) => typeof id === 'string' && valid.has(id)).slice(-6)
  : [];

export function normalizeOddOneOutProgress(value) {
  const blank = emptyProgress();
  if (!value || typeof value !== 'object' || value.version !== ODD_ONE_OUT_PROGRESS_VERSION) return blank;
  const allRoundIds = new Set(Object.values(ODD_ONE_OUT_ROUNDS_BY_CHAPTER).flat().map(({ id }) => id));
  const chapterIds = new Set(ODD_ONE_OUT_CHAPTERS.map(({ id }) => id));
  const completedRoundIds = validIds(value.completedRoundIds, allRoundIds);
  const suppliedCompletedChapters = validIds(value.completedChapterIds, chapterIds);
  const completedChapterIds = suppliedCompletedChapters.filter((id) =>
    ODD_ONE_OUT_ROUNDS_BY_CHAPTER[id].every(({ id: roundId }) => completedRoundIds.includes(roundId)),
  );
  let unlockedIndex = 0;
  while (unlockedIndex < ODD_ONE_OUT_CHAPTERS.length - 1 && completedChapterIds.includes(ODD_ONE_OUT_CHAPTERS[unlockedIndex].id)) unlockedIndex += 1;
  const suppliedUnlockedIndex = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === value.unlockedChapter);
  if (suppliedUnlockedIndex >= 0) unlockedIndex = Math.min(unlockedIndex, Math.max(0, suppliedUnlockedIndex));
  const unlockedChapter = ODD_ONE_OUT_CHAPTERS[unlockedIndex].id;
  const recentRoundIdsByChapter = {};
  for (const chapter of ODD_ONE_OUT_CHAPTERS) {
    const chapterRoundIds = new Set(ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapter.id].map(({ id }) => id));
    recentRoundIdsByChapter[chapter.id] = validRecentIds(value.recentRoundIdsByChapter?.[chapter.id], chapterRoundIds);
  }
  const bestRoundStars = {};
  for (const id of allRoundIds) {
    const stars = Number(value.bestRoundStars?.[id]);
    if (Number.isInteger(stars) && stars >= 1 && stars <= 3 && completedRoundIds.includes(id)) bestRoundStars[id] = stars;
  }
  const bestStars = {};
  for (const chapter of ODD_ONE_OUT_CHAPTERS) {
    const rounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapter.id];
    if (completedChapterIds.includes(chapter.id) && rounds.every(({ id }) => bestRoundStars[id])) {
      bestStars[chapter.id] = Math.min(...rounds.map(({ id }) => bestRoundStars[id]));
    }
  }
  return { version: ODD_ONE_OUT_PROGRESS_VERSION, unlockedChapter, completedRoundIds, completedChapterIds, recentRoundIdsByChapter, bestRoundStars, bestStars };
}

function getStorage() {
  try { return globalThis.window?.localStorage || null; } catch { return null; }
}

export function readOddOneOutProgress(playerId = 'default', storage = getStorage()) {
  try { return normalizeOddOneOutProgress(JSON.parse(storage?.getItem(oddOneOutProgressKey(playerId)) || 'null')); }
  catch { return emptyProgress(); }
}

export function recentOddOneOutRoundIds(chapterId, playerId = 'default', storage = getStorage()) {
  if (!ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapterId]) return [];
  return readOddOneOutProgress(playerId, storage).recentRoundIdsByChapter[chapterId] || [];
}

/** Record only a validated correct round. `persisted:false` prevents the UI
 * from claiming a chapter was saved when local storage is unavailable. */
export function recordOddOneOutRound(playerId, chapterId, roundId, storage = getStorage(), { independent = false } = {}) {
  const round = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapterId]?.find((entry) => entry.id === roundId);
  if (!round) return { ...readOddOneOutProgress(playerId, storage), persisted: false, newlyCompletedChapter: false };
  const previous = readOddOneOutProgress(playerId, storage);
  const chapterPosition = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === chapterId);
  const unlockedPosition = ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === previous.unlockedChapter);
  if (chapterPosition < 0 || chapterPosition > unlockedPosition) return { ...previous, persisted: false, newlyCompletedChapter: false };
  const completedRoundIds = [...new Set([...previous.completedRoundIds, roundId])];
  const starsForRound = independent ? 3 : 2;
  const bestRoundStars = { ...previous.bestRoundStars, [roundId]: Math.max(previous.bestRoundStars[roundId] || 0, starsForRound) };
  const recentRoundIds = [...(previous.recentRoundIdsByChapter[chapterId] || []), roundId].slice(-6);
  const chapterRounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapterId];
  const chapterComplete = chapterRounds.every(({ id }) => completedRoundIds.includes(id));
  const newlyCompletedChapter = chapterComplete && !previous.completedChapterIds.includes(chapterId);
  const completedChapterIds = chapterComplete
    ? [...new Set([...previous.completedChapterIds, chapterId])]
    : previous.completedChapterIds;
  const nextChapter = chapterComplete ? ODD_ONE_OUT_CHAPTERS[Math.min(chapterPosition + 1, ODD_ONE_OUT_CHAPTERS.length - 1)] : null;
  const unlockedChapter = nextChapter
    ? ODD_ONE_OUT_CHAPTERS[Math.max(ODD_ONE_OUT_CHAPTERS.findIndex(({ id }) => id === previous.unlockedChapter), chapterPosition + 1)]?.id || previous.unlockedChapter
    : previous.unlockedChapter;
  const allRoundScores = chapterRounds.map(({ id }) => bestRoundStars[id]);
  const chapterStars = chapterComplete && allRoundScores.every(Boolean) ? Math.min(...allRoundScores) : 0;
  const bestStars = chapterStars > (previous.bestStars[chapterId] || 0)
    ? { ...previous.bestStars, [chapterId]: chapterStars }
    : previous.bestStars;
  const next = normalizeOddOneOutProgress({
    ...previous,
    completedRoundIds,
    completedChapterIds,
    bestRoundStars,
    recentRoundIdsByChapter: { ...previous.recentRoundIdsByChapter, [chapterId]: recentRoundIds },
    unlockedChapter,
    bestStars,
  });
  try {
    storage?.setItem(oddOneOutProgressKey(playerId), JSON.stringify(next));
    if (!storage) return { ...previous, persisted: false, newlyCompletedChapter: false };
    return { ...next, persisted: true, newlyCompletedChapter };
  } catch {
    return { ...previous, persisted: false, newlyCompletedChapter: false };
  }
}
