import { PATTERN_CHAPTERS, PATTERN_MISSIONS } from './patternAdventure.js';

export const PATTERN_PROGRESS_KEY = 'amari_pattern_adventure_v2';
const validChapters = new Set(PATTERN_CHAPTERS.map(({ id }) => id));
const validMissionChapter = new Map(PATTERN_MISSIONS.map(({ id, chapterId }) => [id, chapterId]));
const safePlayerId = (playerId) => String(playerId || 'amari').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'amari';
const keyFor = (playerId) => `${PATTERN_PROGRESS_KEY}:${safePlayerId(playerId)}`;
const browserStorage = () => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };
const blank = (persisted = false) => ({ version: 2, completedChapterIds: [], recentMissionIds: [], unlockedChapterIndex: 0, persisted, newlyCompleted: false });

export function readPatternProgress(playerId = 'amari', storage = browserStorage()) {
  try {
    if (!storage) return blank(false);
    const saved = JSON.parse(storage.getItem(keyFor(playerId)) || 'null');
    if (!saved || saved.version !== 2) return blank(true);
    const completed = new Set(Array.isArray(saved.completedChapterIds) ? saved.completedChapterIds.filter((id) => validChapters.has(id)) : []);
    const contiguous = [];
    for (const { id } of PATTERN_CHAPTERS) { if (!completed.has(id)) break; contiguous.push(id); }
    const recentMissionIds = [...new Set(Array.isArray(saved.recentMissionIds) ? saved.recentMissionIds.filter((id) => validMissionChapter.has(id)) : [])].slice(-8);
    return { ...blank(true), completedChapterIds: contiguous, recentMissionIds, unlockedChapterIndex: contiguous.length };
  } catch { return blank(false); }
}

/** Remember a stable run at Start so a refresh/re-entry can avoid recent missions. */
export function rememberPatternRun(playerId, chapterId, missionIds, storage = browserStorage()) {
  if (!validChapters.has(chapterId) || !Array.isArray(missionIds) || missionIds.length !== 6 || new Set(missionIds).size !== 6 || missionIds.some((id) => validMissionChapter.get(id) !== chapterId)) return { ...readPatternProgress(playerId, storage), persisted: false };
  const previous = readPatternProgress(playerId, storage);
  const recentMissionIds = [...previous.recentMissionIds.filter((id) => !missionIds.includes(id)), ...missionIds].slice(-8);
  return write(playerId, { ...previous, recentMissionIds }, storage, false, previous);
}

/** Persist the chapter on its final correct answer, before the Finish screen. */
export function completePatternChapter(playerId, chapterId, missionIds, storage = browserStorage()) {
  const order = PATTERN_CHAPTERS.findIndex(({ id }) => id === chapterId);
  if (order < 0 || !Array.isArray(missionIds) || missionIds.length !== 6 || new Set(missionIds).size !== 6 || missionIds.some((id) => validMissionChapter.get(id) !== chapterId)) return null;
  const previous = readPatternProgress(playerId, storage);
  if (order > previous.unlockedChapterIndex) return { ...previous, newlyCompleted: false, persisted: false };
  if (previous.completedChapterIds.includes(chapterId)) return { ...previous, newlyCompleted: false };
  const completedChapterIds = [...previous.completedChapterIds, chapterId];
  const contiguous = [];
  for (const { id } of PATTERN_CHAPTERS) { if (!completedChapterIds.includes(id)) break; contiguous.push(id); }
  return write(playerId, { ...previous, completedChapterIds, unlockedChapterIndex: contiguous.length }, storage, true, previous);
}

const write = (playerId, progress, storage, newlyCompleted = false, previous = blank(false)) => {
  const { persisted: _persisted, newlyCompleted: _newlyCompleted, ...saved } = progress;
  try {
    if (!storage) return { ...previous, persisted: false, newlyCompleted: false };
    storage.setItem(keyFor(playerId), JSON.stringify({ version: 2, completedChapterIds: saved.completedChapterIds, recentMissionIds: saved.recentMissionIds, unlockedChapterIndex: saved.unlockedChapterIndex }));
    return { ...saved, version: 2, persisted: true, newlyCompleted };
  } catch { return { ...previous, persisted: false, newlyCompleted: false }; }
};

export function isPatternChapterUnlocked(progress, index) {
  return index >= 0 && index <= (progress?.unlockedChapterIndex ?? 0) && index < PATTERN_CHAPTERS.length;
}
