import { ASTRONAUT_MISSION_GROUPS } from '../components/games/astronautMissions.js';
import { ASTRONAUT_CATEGORIES } from './index.js';

export const ASTRONAUT_PROGRESS_KEY = 'amari_astronaut_academy_progress_v1';
const chapterIds = new Set(ASTRONAUT_MISSION_GROUPS.map(({ id }) => id));
const questionIdsByChapter = new Map(ASTRONAUT_MISSION_GROUPS.map((mission) => [mission.id, new Set(mission.categoryIds.flatMap((categoryId) => {
  const category = ASTRONAUT_CATEGORIES.find((entry) => entry.id === categoryId);
  return (category?.items || []).map((_, index) => `${categoryId}:${index}`);
}))]));
const browserStorage = () => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };
const cleanIds = (value, valid) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && valid.has(id)))].slice(-80) : [];
const blank = (playerId = 'amari') => ({ version: 1, playerId: String(playerId || 'amari'), completedChapterIds: [], recentQuestionIdsByChapter: {}, missedConceptIdsByChapter: {}, rewardChapterIds: [] });

function readRoot(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(ASTRONAUT_PROGRESS_KEY) || 'null');
    return parsed?.version === 1 && parsed.players && typeof parsed.players === 'object' ? parsed : { version: 1, players: {} };
  } catch { return { version: 1, players: {} }; }
}

function normalize(playerId, value) {
  const recent = {};
  const missed = {};
  for (const id of chapterIds) {
    recent[id] = cleanIds(value?.recentQuestionIdsByChapter?.[id], questionIdsByChapter.get(id));
    // Concept IDs use the same stable category:index vocabulary as question IDs.
    missed[id] = cleanIds(value?.missedConceptIdsByChapter?.[id], questionIdsByChapter.get(id));
  }
  const requestedCompleted = new Set(cleanIds(value?.completedChapterIds, chapterIds));
  const completedChapterIds = [];
  for (const { id } of ASTRONAUT_MISSION_GROUPS) { if (!requestedCompleted.has(id)) break; completedChapterIds.push(id); }
  const rewardChapterIds = cleanIds(value?.rewardChapterIds, new Set(completedChapterIds));
  return { ...blank(playerId), ...value, playerId: String(playerId || 'amari'), completedChapterIds, recentQuestionIdsByChapter: recent, missedConceptIdsByChapter: missed, rewardChapterIds };
}

export function readAstronautProgress(playerId = 'amari', storage = browserStorage()) {
  const id = String(playerId || 'amari');
  const record = normalize(id, readRoot(storage).players?.[id]);
  let unlockedChapterIndex = 0;
  while (unlockedChapterIndex < ASTRONAUT_MISSION_GROUPS.length - 1 && record.completedChapterIds.includes(ASTRONAUT_MISSION_GROUPS[unlockedChapterIndex].id)) unlockedChapterIndex += 1;
  return { ...record, unlockedChapterIndex };
}

function writePlayer(playerId, patch, storage) {
  const root = readRoot(storage);
  const previous = readAstronautProgress(playerId, storage);
  if (!storage || typeof storage.setItem !== 'function') return { ...previous, persisted: false };
  const next = normalize(playerId, { ...previous, ...patch });
  try {
    storage?.setItem(ASTRONAUT_PROGRESS_KEY, JSON.stringify({ ...root, version: 1, players: { ...root.players, [next.playerId]: next } }));
    return { ...readAstronautProgress(playerId, storage), persisted: true };
  } catch { return { ...previous, persisted: false }; }
}

export function saveAstronautRun(playerId, chapterId, questionIds, storage = browserStorage()) {
  const valid = questionIdsByChapter.get(chapterId);
  if (!valid || !Array.isArray(questionIds) || questionIds.length !== 6 || new Set(questionIds).size !== 6 || questionIds.some((id) => !valid.has(id))) return { ...readAstronautProgress(playerId, storage), persisted: false };
  const current = readAstronautProgress(playerId, storage);
  if (ASTRONAUT_MISSION_GROUPS.findIndex(({ id }) => id === chapterId) > current.unlockedChapterIndex) return { ...current, persisted: false };
  const recentQuestionIds = [...current.recentQuestionIdsByChapter[chapterId].filter((id) => !questionIds.includes(id)), ...questionIds].slice(-12);
  return writePlayer(playerId, { recentQuestionIdsByChapter: { ...current.recentQuestionIdsByChapter, [chapterId]: recentQuestionIds } }, storage);
}

export function recordAstronautResult(playerId, chapterId, conceptId, correct, storage = browserStorage()) {
  if (!questionIdsByChapter.get(chapterId)?.has(conceptId) || typeof correct !== 'boolean') return { ...readAstronautProgress(playerId, storage), persisted: false };
  const current = readAstronautProgress(playerId, storage);
  if (ASTRONAUT_MISSION_GROUPS.findIndex(({ id }) => id === chapterId) > current.unlockedChapterIndex) return { ...current, persisted: false };
  const missed = new Set(current.missedConceptIdsByChapter[chapterId]);
  if (correct) missed.delete(conceptId); else missed.add(conceptId);
  return writePlayer(playerId, { missedConceptIdsByChapter: { ...current.missedConceptIdsByChapter, [chapterId]: [...missed] } }, storage);
}

export function completeAstronautChapter(playerId, chapterId, storage = browserStorage()) {
  const current = readAstronautProgress(playerId, storage);
  const index = ASTRONAUT_MISSION_GROUPS.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0 || index > current.unlockedChapterIndex) return { ...current, persisted: false, newlyEarnedReward: false };
  if (current.completedChapterIds.includes(chapterId)) return { ...current, persisted: true, newlyEarnedReward: false };
  const completedChapterIds = [...new Set([...current.completedChapterIds, chapterId])];
  const newlyEarnedReward = !current.rewardChapterIds.includes(chapterId);
  const rewardChapterIds = [...new Set([...current.rewardChapterIds, chapterId])];
  const saved = writePlayer(playerId, { completedChapterIds, rewardChapterIds }, storage);
  return { ...saved, newlyEarnedReward: Boolean(saved.persisted && newlyEarnedReward) };
}
