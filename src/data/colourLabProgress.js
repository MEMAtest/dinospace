import { COLOUR_LABS, COLOUR_LAB_MISSIONS } from './colourLabAdventure.js';

export const COLOUR_LAB_PROGRESS_KEY = 'amari_colour_lab_adventure_v1';
const MISSION_IDS = new Set(COLOUR_LAB_MISSIONS.map(({ id }) => id));
const CHAPTER_IDS = new Set(COLOUR_LABS.map(({ id }) => id));
const childKey = (childId) => String(childId || 'default').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'default';
const getStorage = () => { try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; } };
const emptyProgress = () => ({ version: 1, completed: [], chapters: [], recentMissionIds: [], persisted: false, newlyCompleted: false });

export function readColourLabProgress(playerId = 'default', storage = getStorage()) {
  try {
    const serialized = storage?.getItem(`${COLOUR_LAB_PROGRESS_KEY}:${childKey(playerId)}`);
    const parsed = JSON.parse(serialized || 'null');
    if (!parsed || parsed.version !== 1) return emptyProgress();
    const completed = Array.isArray(parsed?.completed) ? [...new Set(parsed.completed.filter((id) => MISSION_IDS.has(id)))] : [];
    const chapters = COLOUR_LABS.filter(({ id }) => COLOUR_LAB_MISSIONS.filter((item) => item.lab === id).every(({ id: missionId }) => completed.includes(missionId))).map(({ id }) => id);
    const recentMissionIds = Array.isArray(parsed?.recentMissionIds) ? [...new Set(parsed.recentMissionIds.filter((id) => MISSION_IDS.has(id)))].slice(-6) : [];
    return { version: 1, completed, chapters, recentMissionIds, persisted: true, newlyCompleted: false };
  } catch { return emptyProgress(); }
}

export function completeColourMission(playerId, missionId, chapterId, chapterMissionIds = [], storage = getStorage()) {
  if (!MISSION_IDS.has(missionId) || !CHAPTER_IDS.has(chapterId)) return readColourLabProgress(playerId, storage);
  const mission = COLOUR_LAB_MISSIONS.find((item) => item.id === missionId);
  if (mission.lab !== chapterId) return readColourLabProgress(playerId, storage);
  const expectedChapterIds = COLOUR_LAB_MISSIONS.filter((item) => item.lab === chapterId).map(({ id }) => id);
  if (chapterMissionIds.length && expectedChapterIds.some((id) => !chapterMissionIds.includes(id))) return readColourLabProgress(playerId, storage);
  const previous = readColourLabProgress(playerId, storage);
  if (previous.completed.includes(missionId)) return { ...previous, newlyCompleted: false };
  const completed = previous.completed.includes(missionId) ? previous.completed : [...previous.completed, missionId];
  const chapters = COLOUR_LABS.filter(({ id }) => COLOUR_LAB_MISSIONS.filter((item) => item.lab === id).every(({ id: itemId }) => completed.includes(itemId))).map(({ id }) => id);
  const recentMissionIds = [...previous.recentMissionIds.filter((id) => id !== missionId), missionId].slice(-6);
  const next = { version: 1, completed, chapters, recentMissionIds };
  try {
    if (!storage) return { ...previous, persisted: false };
    storage.setItem(`${COLOUR_LAB_PROGRESS_KEY}:${childKey(playerId)}`, JSON.stringify(next));
    return { ...next, persisted: true, newlyCompleted: true };
  } catch { return { ...previous, persisted: false }; }
}

export function isColourMissionComplete(progress, missionId) { return Boolean(progress?.completed?.includes(missionId)); }
