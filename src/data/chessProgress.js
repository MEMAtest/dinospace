import { CHESS_CHAPTERS, CHESS_ADVENTURES } from './chessAdventure.js';

export const CHESS_PROGRESS_KEY = 'amari_chess_explorers_progress_v1';
const ids = new Set(CHESS_CHAPTERS.map((chapter) => chapter.id));
const puzzleIds = new Set(CHESS_ADVENTURES.map((puzzle) => puzzle.id));
const safeId = (id) => String(id || 'amari').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'amari';
const key = (id) => `${CHESS_PROGRESS_KEY}:${safeId(id)}`;
const blank = (persisted = false) => ({ version: 1, completedChapterIds: [], unlockedChapterIndex: 0, recentPuzzleIds: [], persisted, newlyCompleted: false });
const browserStorage = () => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };

export function readChessProgress(playerId = 'amari', storage = browserStorage()) {
  try {
    if (!storage) return blank(false);
    const saved = JSON.parse(storage.getItem(key(playerId)) || 'null');
    if (!saved || saved.version !== 1) return blank(true);
    const requested = new Set(Array.isArray(saved.completedChapterIds) ? saved.completedChapterIds.filter((id) => ids.has(id)) : []);
    const completedChapterIds = [];
    for (const chapter of CHESS_CHAPTERS) { if (!requested.has(chapter.id)) break; completedChapterIds.push(chapter.id); }
    const recentPuzzleIds = [...new Set(Array.isArray(saved.recentPuzzleIds) ? saved.recentPuzzleIds.filter((id) => puzzleIds.has(id)) : [])].slice(-10);
    return { ...blank(true), completedChapterIds, unlockedChapterIndex: completedChapterIds.length, recentPuzzleIds };
  } catch { return blank(false); }
}

function write(playerId, progress, storage, newlyCompleted = false, previous = blank(false)) {
  try {
    if (!storage) return { ...previous, persisted: false, newlyCompleted: false };
    storage.setItem(key(playerId), JSON.stringify({ version: 1, completedChapterIds: progress.completedChapterIds, recentPuzzleIds: progress.recentPuzzleIds }));
    return { ...progress, persisted: true, newlyCompleted };
  } catch { return { ...previous, persisted: false, newlyCompleted: false }; }
}

export function recordChessRun(playerId, chapterId, puzzleIdsInRun, storage = browserStorage()) {
  const chapterIndex = CHESS_CHAPTERS.findIndex(({ id }) => id === chapterId);
  if (chapterIndex < 0 || !Array.isArray(puzzleIdsInRun) || puzzleIdsInRun.length !== 5 || new Set(puzzleIdsInRun).size !== 5 || puzzleIdsInRun.some((id) => !puzzleIds.has(id) || CHESS_ADVENTURES.find((p) => p.id === id)?.chapterId !== chapterId)) return { ...readChessProgress(playerId, storage), persisted: false };
  const previous = readChessProgress(playerId, storage);
  const recentPuzzleIds = [...previous.recentPuzzleIds.filter((id) => !puzzleIdsInRun.includes(id)), ...puzzleIdsInRun].slice(-10);
  return write(playerId, { ...previous, recentPuzzleIds }, storage, false, previous);
}

/** Award the chapter only after all its authored puzzles have been completed and save before the finish view. */
export function completeChessChapter(playerId, chapterId, storage = browserStorage()) {
  const chapterIndex = CHESS_CHAPTERS.findIndex(({ id }) => id === chapterId);
  if (chapterIndex < 0) return null;
  const previous = readChessProgress(playerId, storage);
  if (chapterIndex > previous.unlockedChapterIndex) return { ...previous, persisted: false, newlyCompleted: false };
  if (previous.completedChapterIds.includes(chapterId)) return { ...previous, newlyCompleted: false };
  const completedChapterIds = [...previous.completedChapterIds, chapterId];
  const contiguous = [];
  for (const chapter of CHESS_CHAPTERS) { if (!completedChapterIds.includes(chapter.id)) break; contiguous.push(chapter.id); }
  return write(playerId, { ...previous, completedChapterIds: contiguous, unlockedChapterIndex: contiguous.length }, storage, true, previous);
}
