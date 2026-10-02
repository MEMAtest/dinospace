import { MONSTER_MATH_EPISODES, MONSTER_QUESTION_POOLS } from './monsterMathEpisodes.js';

export const MONSTER_MATH_PROGRESS_VERSION = 1;
export const MONSTER_MATH_PROGRESS_KEY = 'monster_math_progress_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${MONSTER_MATH_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;

const emptyProgress = () => ({ version: MONSTER_MATH_PROGRESS_VERSION, unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, recentQuestionIds: {} });
const validIdsByEpisode = MONSTER_QUESTION_POOLS.map((pool) => new Set(pool.map((question) => question.id)));

const normalizeProgress = (value) => {
  const empty = emptyProgress();
  if (!isRecord(value) || value.version !== MONSTER_MATH_PROGRESS_VERSION) return empty;
  const validEpisodeIds = new Set(MONSTER_MATH_EPISODES.map((episode) => episode.id));
  const recentQuestionIds = {};
  if (isRecord(value.recentQuestionIds)) {
    Object.entries(value.recentQuestionIds).forEach(([index, ids]) => {
      const episodeIndex = Number(index);
      if (Number.isInteger(episodeIndex) && episodeIndex >= 0 && episodeIndex < validIdsByEpisode.length && Array.isArray(ids)) {
        recentQuestionIds[episodeIndex] = ids.filter((id) => validIdsByEpisode[episodeIndex].has(id)).slice(-8);
      }
    });
  }
  return {
    ...empty,
    unlockedEpisode: Math.max(0, Math.min(MONSTER_MATH_EPISODES.length - 1, Number.isInteger(value.unlockedEpisode) ? value.unlockedEpisode : 0)),
    completedEpisodeIds: [...new Set((Array.isArray(value.completedEpisodeIds) ? value.completedEpisodeIds : []).filter((id) => validEpisodeIds.has(id)))],
    bestStars: isRecord(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => validEpisodeIds.has(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {},
    recentQuestionIds,
  };
};

export const getMonsterMathProgress = (playerId, storage = browserStorage()) => {
  try { return normalizeProgress(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')); } catch { return emptyProgress(); }
};

export const recentMonsterQuestionIds = (playerId, episodeIndex, storage = browserStorage()) => getMonsterMathProgress(playerId, storage).recentQuestionIds[episodeIndex] || [];


export const rememberMonsterMathRun = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  if (!Number.isInteger(episodeIndex) || episodeIndex < 0 || episodeIndex >= MONSTER_MATH_EPISODES.length) return null;
  const validIds = validIdsByEpisode[episodeIndex];
  if (!Array.isArray(questionIds) || questionIds.length !== 6 || questionIds.some((id) => !validIds.has(id)) || new Set(questionIds).size !== 6) return null;
  const progress = getMonsterMathProgress(playerId, storage);
  const current = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = [...current, ...questionIds.filter((id) => !current.includes(id))].slice(-8);
  const next = { ...progress, recentQuestionIds: { ...progress.recentQuestionIds, [episodeIndex]: recentQuestionIds } };
  try { storage?.setItem(keyFor(playerId), JSON.stringify(next)); } catch { /* Session remains playable without local storage. */ }
  return next;
};

export const recordMonsterEpisodeCompletion = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  if (!Number.isInteger(episodeIndex) || episodeIndex < 0 || episodeIndex >= MONSTER_MATH_EPISODES.length || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const validIds = validIdsByEpisode[episodeIndex];
  if (!Array.isArray(questionIds) || questionIds.length !== 6 || questionIds.some((id) => !validIds.has(id)) || new Set(questionIds).size !== 6) return null;
  const progress = getMonsterMathProgress(playerId, storage);
  const episodeId = MONSTER_MATH_EPISODES[episodeIndex].id;
  const completedEpisodeIds = progress.completedEpisodeIds.includes(episodeId) ? progress.completedEpisodeIds : [...progress.completedEpisodeIds, episodeId];
  const bestStars = { ...progress.bestStars, [episodeId]: Math.max(progress.bestStars[episodeId] || 0, stars) };
  const existingRecent = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = { ...progress.recentQuestionIds, [episodeIndex]: [...existingRecent, ...questionIds.filter((id) => !existingRecent.includes(id))].slice(-8) };
  const next = {
    ...progress,
    completedEpisodeIds,
    bestStars,
    recentQuestionIds,
    unlockedEpisode: Math.max(progress.unlockedEpisode, Math.min(MONSTER_MATH_EPISODES.length - 1, episodeIndex + 1)),
  };
  try { storage?.setItem(keyFor(playerId), JSON.stringify(next)); } catch { /* Keep the current run playable if storage is unavailable. */ }
  return { progress: next, newlyCompleted: !progress.completedEpisodeIds.includes(episodeId), improved: stars > (progress.bestStars[episodeId] || 0) };
};
