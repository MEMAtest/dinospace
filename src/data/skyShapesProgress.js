import { SKY_SHAPE_EPISODES, SKY_SHAPE_MISSION_BY_ID } from './skyShapes.js';

export const SKY_SHAPES_PROGRESS_VERSION = 1;
export const SKY_SHAPES_PROGRESS_KEY = 'sky_shapes_progress_v1';
// App converts these callback units to global stars by dividing by four.
export const skyRewardCallbackUnits = (stars) => stars * 4;
export const SKY_CHAPTER_BONUS_STARS = 2;
const keyFor = (playerId) => `${playerId || 'amari'}_${SKY_SHAPES_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;

const emptyProgress = () => ({
  version: SKY_SHAPES_PROGRESS_VERSION,
  unlockedEpisode: 0,
  completedMissionIds: [],
  completedEpisodeIds: [],
  bestAccuracy: {},
  bestMissionStars: {},
  bestStars: {},
  recentMissionIds: [],
});

const normalizeProgress = (value) => {
  const empty = emptyProgress();
  if (!isRecord(value) || value.version !== SKY_SHAPES_PROGRESS_VERSION) return empty;
  const validMissions = new Set(Object.keys(SKY_SHAPE_MISSION_BY_ID));
  const validEpisodes = new Set(SKY_SHAPE_EPISODES.map((episode) => episode.id));
  return {
    ...empty,
    unlockedEpisode: Math.max(0, Math.min(SKY_SHAPE_EPISODES.length - 1, Number.isInteger(value.unlockedEpisode) ? value.unlockedEpisode : 0)),
    completedMissionIds: [...new Set((Array.isArray(value.completedMissionIds) ? value.completedMissionIds : []).filter((id) => validMissions.has(id)))],
    completedEpisodeIds: [...new Set((Array.isArray(value.completedEpisodeIds) ? value.completedEpisodeIds : []).filter((id) => validEpisodes.has(id)))],
    bestAccuracy: isRecord(value.bestAccuracy) ? Object.fromEntries(Object.entries(value.bestAccuracy).filter(([id, accuracy]) => validMissions.has(id) && Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 100)) : {},
    bestMissionStars: isRecord(value.bestMissionStars) ? Object.fromEntries(Object.entries(value.bestMissionStars).filter(([id, stars]) => validMissions.has(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {},
    bestStars: isRecord(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => validEpisodes.has(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {},
    recentMissionIds: (Array.isArray(value.recentMissionIds) ? value.recentMissionIds : []).filter((id) => validMissions.has(id)).slice(-8),
  };
};

export const getSkyShapesProgress = (playerId, storage = browserStorage()) => {
  try {
    return normalizeProgress(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null'));
  } catch {
    return emptyProgress();
  }
};

const saveProgress = (playerId, progress, storage) => {
  try { storage?.setItem(keyFor(playerId), JSON.stringify(progress)); } catch { /* Local progress is optional in private browsing. */ }
};

export const rememberSkyMissionQueue = (playerId, missionIds, storage = browserStorage()) => {
  const progress = getSkyShapesProgress(playerId, storage);
  const recentMissionIds = [...progress.recentMissionIds, ...missionIds.filter((id) => SKY_SHAPE_MISSION_BY_ID[id])].slice(-8);
  const next = { ...progress, recentMissionIds };
  saveProgress(playerId, next, storage);
  return next;
};

export const recordSkyMissionCompletion = (playerId, missionId, accuracy, stars, storage = browserStorage()) => {
  const mission = SKY_SHAPE_MISSION_BY_ID[missionId];
  if (!mission || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100 || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const progress = getSkyShapesProgress(playerId, storage);
  const awardedStars = Math.max(0, stars - (progress.bestMissionStars[missionId] || 0));
  const completedMissionIds = progress.completedMissionIds.includes(missionId)
    ? progress.completedMissionIds : [...progress.completedMissionIds, missionId];
  const bestAccuracy = { ...progress.bestAccuracy, [missionId]: Math.max(progress.bestAccuracy[missionId] || 0, accuracy) };
  const bestMissionStars = { ...progress.bestMissionStars, [missionId]: Math.max(progress.bestMissionStars[missionId] || 0, stars) };
  const episode = SKY_SHAPE_EPISODES[mission.episodeIndex];
  const episodeIsComplete = episode.missions.every((entry) => completedMissionIds.includes(entry.id));
  const wasComplete = progress.completedEpisodeIds.includes(episode.id);
  const completedEpisodeIds = episodeIsComplete && !wasComplete ? [...progress.completedEpisodeIds, episode.id] : progress.completedEpisodeIds;
  const unlockedEpisode = episodeIsComplete ? Math.max(progress.unlockedEpisode, Math.min(SKY_SHAPE_EPISODES.length - 1, mission.episodeIndex + 1)) : progress.unlockedEpisode;
  const next = { ...progress, completedMissionIds, completedEpisodeIds, bestAccuracy, bestMissionStars, unlockedEpisode };
  saveProgress(playerId, next, storage);
  return { progress: next, episodeComplete: episodeIsComplete, newlyCompletedMission: !progress.completedMissionIds.includes(missionId), awardedStars, bestStars: bestMissionStars[missionId], newlyCompletedEpisode: episodeIsComplete && !wasComplete };
};

export const recordSkyEpisodeReward = (playerId, episodeId, stars, storage = browserStorage()) => {
  if (!SKY_SHAPE_EPISODES.some((episode) => episode.id === episodeId) || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const progress = getSkyShapesProgress(playerId, storage);
  const previous = progress.bestStars[episodeId] || 0;
  const next = { ...progress, bestStars: { ...progress.bestStars, [episodeId]: Math.max(previous, stars) } };
  saveProgress(playerId, next, storage);
  return { progress: next, bestStars: Math.max(previous, stars), improved: stars > previous };
};
