import { SOUND_SAFARI_CHAPTERS, SOUND_SAFARI_PHONEME_KEYS, SOUND_SAFARI_WORDS } from './soundSafariAdventure.js';

export const SOUND_SAFARI_PROGRESS_KEY = 'sound_safari_adventure_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${SOUND_SAFARI_PROGRESS_KEY}`;
const empty = () => ({ version: 1, unlockedChapter: 0, completedChapterIds: [], earnedChapterIds: [], recentRoundIds: [] });
const browserStorage = () => {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
};
const chapterIds = SOUND_SAFARI_CHAPTERS.map(({ id }) => id);
const validRoundIds = new Map([
  ['listen', new Set(SOUND_SAFARI_PHONEME_KEYS.map((sound) => `listen-${sound}`))],
  ['blend', new Set(SOUND_SAFARI_WORDS.filter((word) => !word.listeningOnly).map((word) => `blend-${word.id}`))],
  ['segment', new Set(SOUND_SAFARI_WORDS.filter((word) => !word.listeningOnly).map((word) => `segment-${word.id}`))],
]);
const contiguousEarned = (ids = []) => {
  const valid = new Set(Array.isArray(ids) ? ids.filter((id) => chapterIds.includes(id)) : []);
  const earned = [];
  for (const id of chapterIds) {
    if (!valid.has(id)) break;
    earned.push(id);
  }
  return earned;
};

export function getSoundSafariProgress(playerId, storage = browserStorage()) {
  try {
    const saved = JSON.parse(storage?.getItem(keyFor(playerId)) || 'null');
    if (saved?.version !== 1) return empty();
    const recordedEarned = new Set(Array.isArray(saved.earnedChapterIds) ? saved.earnedChapterIds : []);
    const recordedCompleted = new Set(Array.isArray(saved.completedChapterIds) ? saved.completedChapterIds : []);
    const earnedChapterIds = contiguousEarned(chapterIds.filter((id) => recordedEarned.has(id) && recordedCompleted.has(id)));
    const completedChapterIds = [...earnedChapterIds];
    const allowedRecent = new Set([...validRoundIds.values()].flatMap((ids) => [...ids]));
    return {
      ...empty(),
      unlockedChapter: Math.min(2, earnedChapterIds.length),
      completedChapterIds,
      earnedChapterIds,
      recentRoundIds: Array.isArray(saved.recentRoundIds) ? saved.recentRoundIds.filter((id) => allowedRecent.has(id)).slice(-18) : [],
    };
  } catch { return empty(); }
}

export function recordSoundSafariChapterCompletion(playerId, chapterId, roundIds, storage = browserStorage()) {
  const chapterOrder = chapterIds.indexOf(chapterId);
  const validIds = validRoundIds.get(chapterId);
  if (chapterOrder < 0 || !Array.isArray(roundIds) || roundIds.length !== 6 || new Set(roundIds).size !== 6 || roundIds.some((id) => !validIds?.has(id))) return null;
  const progress = getSoundSafariProgress(playerId, storage);
  if (chapterOrder > progress.unlockedChapter || (chapterOrder > 0 && !progress.earnedChapterIds.includes(chapterIds[chapterOrder - 1]))) return null;
  const completedChapterIds = progress.completedChapterIds.includes(chapterId) ? progress.completedChapterIds : [...progress.completedChapterIds, chapterId];
  const earnedChapterIds = progress.earnedChapterIds.includes(chapterId) ? progress.earnedChapterIds : [...progress.earnedChapterIds, chapterId];
  const next = {
    ...progress,
    completedChapterIds,
    earnedChapterIds,
    unlockedChapter: Math.max(progress.unlockedChapter, Math.min(2, chapterOrder + 1)),
    recentRoundIds: [...progress.recentRoundIds, ...roundIds.filter((id) => !progress.recentRoundIds.includes(id))].slice(-18),
  };
  let persisted = false;
  try {
    if (storage && typeof storage.setItem === 'function') {
      storage.setItem(keyFor(playerId), JSON.stringify(next));
      const saved = JSON.parse(storage.getItem(keyFor(playerId)) || 'null');
      persisted = saved?.version === next.version
        && saved.completedChapterIds?.includes(chapterId)
        && saved.earnedChapterIds?.includes(chapterId);
    }
  } catch { /* Surface a recoverable save error to the game. */ }
  const wasAlreadySaved = progress.completedChapterIds.includes(chapterId) && progress.earnedChapterIds.includes(chapterId);
  return {
    progress: persisted ? next : progress,
    newlyEarned: persisted && !wasAlreadySaved,
    persisted: persisted || wasAlreadySaved,
    storageError: !persisted && !wasAlreadySaved,
  };
}
