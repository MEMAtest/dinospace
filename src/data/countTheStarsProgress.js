import { COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES } from './countTheStarsBatch3.js';

export const COUNT_STARS_PROGRESS_VERSION = 1;
export const COUNT_STARS_PROGRESS_KEY = 'amari_count_the_stars_batch3_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${COUNT_STARS_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;
const validEpisodeIds = new Set(COUNT_THE_STARS_EPISODES.map(({ id }) => id));
const validQuestionIdsByEpisode = COUNT_THE_STARS_EPISODES.map((episode) => new Set(episode.scenes.flatMap((scene) => Array.from({ length: episode.max - episode.min + 1 }, (_, offset) => {
    const count = episode.min + offset;
    return [`${scene.id}:${count}:orbit`, `${scene.id}:${count}:grouped`];
  }).flat())));

const emptyProgress = () => ({
  version: COUNT_STARS_PROGRESS_VERSION,
  unlockedEpisode: 0,
  completedEpisodeIds: [],
  bestStars: {},
  earnedConstellationPageIds: [],
  recentQuestionIds: {},
});

const normalizeProgress = (value) => {
  const empty = emptyProgress();
  if (!isRecord(value) || value.version !== COUNT_STARS_PROGRESS_VERSION) return empty;
  const storedCompleted = new Set((Array.isArray(value.completedEpisodeIds) ? value.completedEpisodeIds : []).filter((id) => validEpisodeIds.has(id)));
  let unlockedEpisode = 0;
  const completedEpisodeIds = [];
  while (completedEpisodeIds.length < COUNT_THE_STARS_EPISODES.length && storedCompleted.has(COUNT_THE_STARS_EPISODES[completedEpisodeIds.length].id)) {
    completedEpisodeIds.push(COUNT_THE_STARS_EPISODES[completedEpisodeIds.length].id);
    unlockedEpisode = Math.min(completedEpisodeIds.length, COUNT_THE_STARS_EPISODES.length - 1);
  }
  const recentQuestionIds = {};
  if (isRecord(value.recentQuestionIds)) {
    for (const [index, ids] of Object.entries(value.recentQuestionIds)) {
      const episodeIndex = Number(index);
      if (Number.isInteger(episodeIndex) && episodeIndex >= 0 && episodeIndex < COUNT_THE_STARS_EPISODES.length && Array.isArray(ids)) {
        recentQuestionIds[episodeIndex] = ids.filter((id) => validQuestionIdsByEpisode[episodeIndex].has(id)).slice(-8);
      }
    }
  }
  const validPageIds = new Set(COUNT_CONSTELLATION_PAGES.map(({ id }) => id));
  return {
    ...empty,
    unlockedEpisode,
    completedEpisodeIds,
    bestStars: isRecord(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => completedEpisodeIds.includes(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {},
    earnedConstellationPageIds: [...new Set((Array.isArray(value.earnedConstellationPageIds) ? value.earnedConstellationPageIds : []).filter((id) => {
      const page = COUNT_CONSTELLATION_PAGES.find((entry) => entry.id === id);
      return validPageIds.has(id) && completedEpisodeIds.includes(page.episodeId);
    }))],
    recentQuestionIds,
  };
};

export const getCountTheStarsProgress = (playerId, storage = browserStorage()) => {
  try { return normalizeProgress(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')); } catch { return emptyProgress(); }
};

const saveProgress = (playerId, progress, storage) => {
  try { storage?.setItem(keyFor(playerId), JSON.stringify(progress)); } catch { /* Progress is optional when browser storage is unavailable. */ }
};

export const recentCountQuestionIds = (playerId, episodeIndex, storage = browserStorage()) => getCountTheStarsProgress(playerId, storage).recentQuestionIds[episodeIndex] || [];

export const rememberCountTheStarsRun = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  if (!Number.isInteger(episodeIndex) || episodeIndex < 0 || episodeIndex >= COUNT_THE_STARS_EPISODES.length
    || !Array.isArray(questionIds) || questionIds.length !== 6 || questionIds.some((id) => !validQuestionIdsByEpisode[episodeIndex].has(id)) || new Set(questionIds).size !== 6) return null;
  const progress = getCountTheStarsProgress(playerId, storage);
  if (episodeIndex > progress.unlockedEpisode) return null;
  const recent = progress.recentQuestionIds[episodeIndex] || [];
  const updated = [...recent, ...questionIds.filter((id) => !recent.includes(id))].slice(-8);
  const next = { ...progress, recentQuestionIds: { ...progress.recentQuestionIds, [episodeIndex]: updated } };
  saveProgress(playerId, next, storage);
  return next;
};

export const recordCountTheStarsCompletion = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  if (!Number.isInteger(episodeIndex) || episodeIndex < 0 || episodeIndex >= COUNT_THE_STARS_EPISODES.length
    || !Number.isInteger(stars) || stars < 1 || stars > 3
    || !Array.isArray(questionIds) || questionIds.length !== 6 || questionIds.some((id) => !validQuestionIdsByEpisode[episodeIndex].has(id)) || new Set(questionIds).size !== 6) return null;
  const progress = getCountTheStarsProgress(playerId, storage);
  if (episodeIndex > progress.unlockedEpisode) return null;
  const episode = COUNT_THE_STARS_EPISODES[episodeIndex];
  const completedEpisodeIds = progress.completedEpisodeIds.includes(episode.id) ? progress.completedEpisodeIds : [...progress.completedEpisodeIds, episode.id];
  const bestStars = { ...progress.bestStars, [episode.id]: Math.max(progress.bestStars[episode.id] || 0, stars) };
  const newlyCompleted = !progress.completedEpisodeIds.includes(episode.id);
  const newlyEarnedPage = newlyCompleted && !progress.earnedConstellationPageIds.includes(episode.pageId);
  const earnedConstellationPageIds = newlyEarnedPage ? [...progress.earnedConstellationPageIds, episode.pageId] : progress.earnedConstellationPageIds;
  let unlockedEpisode = progress.unlockedEpisode;
  if (episodeIndex === unlockedEpisode && episodeIndex < COUNT_THE_STARS_EPISODES.length - 1) unlockedEpisode += 1;
  const recent = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = { ...progress.recentQuestionIds, [episodeIndex]: [...recent, ...questionIds.filter((id) => !recent.includes(id))].slice(-8) };
  const next = { ...progress, completedEpisodeIds, bestStars, earnedConstellationPageIds, unlockedEpisode, recentQuestionIds };
  saveProgress(playerId, next, storage);
  return {
    progress: next,
    newlyCompleted,
    newlyEarnedPage,
    awardedStars: Math.max(0, stars - (progress.bestStars[episode.id] || 0)),
    bestStars: bestStars[episode.id],
  };
};
