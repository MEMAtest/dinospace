import { SKY_SHAPE_EPISODES, SKY_SHAPE_MISSION_BY_ID, skyAccuracyStars } from './skyShapes.js';

export const SKY_SHAPES_PROGRESS_VERSION = 1;
export const SKY_SHAPES_PROGRESS_KEY = 'sky_shapes_progress_v1';
// App converts these callback units to global stars by dividing by four.
export const skyRewardCallbackUnits = (stars) => stars * 4;
export const SKY_CHAPTER_BONUS_STARS = 2;
const keyFor = (playerId) => `${playerId || 'amari'}_${SKY_SHAPES_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const knownMissionIds = new Set(Object.keys(SKY_SHAPE_MISSION_BY_ID));
const knownEpisodeIds = new Set(SKY_SHAPE_EPISODES.map(({ id }) => id));
const episodeIndexForMission = (missionId) => SKY_SHAPE_EPISODES.findIndex(({ id }) => id === SKY_SHAPE_MISSION_BY_ID[missionId]?.episodeId);

const emptyProgress = () => ({
  version: SKY_SHAPES_PROGRESS_VERSION,
  unlockedEpisode: 0,
  completedMissionIds: [],
  completedEpisodeIds: [],
  bestAccuracy: {},
  bestMissionStars: {},
  bestStars: {},
  recentMissionIds: [],
  rewardReceipts: [],
});

const validNumberMap = (value, keys, validate) => value === undefined || (isRecord(value)
  && Object.entries(value).every(([id, entry]) => keys.has(id) && validate(entry)));
const validReceipt = (receipt, progress) => {
  if (!isRecord(receipt) || typeof receipt.id !== 'string' || typeof receipt.parentClaimed !== 'boolean'
    || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1 || receipt.rewardDelta > 5) return false;
  if (receipt.kind === 'mission') {
    const mission = SKY_SHAPE_MISSION_BY_ID[receipt.missionId];
    return Boolean(mission && receipt.episodeId === mission.episodeId
      && Number.isSafeInteger(receipt.seed) && receipt.seed > 0 && receipt.seed <= 0xffffffff
      && receipt.id === `mission:${receipt.missionId}:${receipt.seed}`
      && progress.completedMissionIds.includes(receipt.missionId)
      && receipt.rewardDelta <= (progress.bestMissionStars[receipt.missionId] || 0));
  }
  if (receipt.kind === 'episode') {
    return knownEpisodeIds.has(receipt.episodeId)
      && receipt.id === `episode:${receipt.episodeId}:complete`
      && receipt.rewardDelta === SKY_CHAPTER_BONUS_STARS
      && (receipt.createdBySeed === undefined || (Number.isSafeInteger(receipt.createdBySeed) && receipt.createdBySeed > 0 && receipt.createdBySeed <= 0xffffffff))
      && progress.completedEpisodeIds.includes(receipt.episodeId);
  }
  return false;
};

const validateProgress = (value) => {
  if (!isRecord(value) || value.version !== SKY_SHAPES_PROGRESS_VERSION) return null;
  const defaults = emptyProgress();
  const unlockedEpisode = value.unlockedEpisode === undefined ? 0 : value.unlockedEpisode;
  const completedMissionIds = value.completedMissionIds === undefined ? [] : value.completedMissionIds;
  const completedEpisodeIds = value.completedEpisodeIds === undefined ? [] : value.completedEpisodeIds;
  const bestAccuracy = value.bestAccuracy === undefined ? {} : value.bestAccuracy;
  const bestMissionStars = value.bestMissionStars === undefined ? {} : value.bestMissionStars;
  const bestStars = value.bestStars === undefined ? {} : value.bestStars;
  const recentMissionIds = value.recentMissionIds === undefined ? [] : value.recentMissionIds;
  const rewardReceipts = value.rewardReceipts === undefined ? [] : value.rewardReceipts;
  if (!Number.isInteger(unlockedEpisode) || unlockedEpisode < 0 || unlockedEpisode >= SKY_SHAPE_EPISODES.length
    || !Array.isArray(completedMissionIds) || completedMissionIds.some((id) => !knownMissionIds.has(id))
    || new Set(completedMissionIds).size !== completedMissionIds.length
    || !Array.isArray(completedEpisodeIds) || completedEpisodeIds.some((id) => !knownEpisodeIds.has(id))
    || new Set(completedEpisodeIds).size !== completedEpisodeIds.length
    || !Array.isArray(recentMissionIds) || recentMissionIds.some((id) => !knownMissionIds.has(id))
    || !Array.isArray(rewardReceipts) || rewardReceipts.length > 40
    || !validNumberMap(bestAccuracy, knownMissionIds, (n) => Number.isFinite(n) && n >= 0 && n <= 100)
    || !validNumberMap(bestMissionStars, knownMissionIds, (n) => Number.isInteger(n) && n >= 0 && n <= 3)
    || !validNumberMap(bestStars, knownEpisodeIds, (n) => Number.isInteger(n) && n >= 0 && n <= 3)) return null;
  const normalized = {
    ...defaults,
    ...value,
    unlockedEpisode,
    completedMissionIds: [...completedMissionIds],
    completedEpisodeIds: [...completedEpisodeIds],
    bestAccuracy: { ...bestAccuracy },
    bestMissionStars: { ...bestMissionStars },
    bestStars: { ...bestStars },
    recentMissionIds: recentMissionIds.slice(-8),
    rewardReceipts: rewardReceipts.map((receipt) => ({ ...receipt })),
  };
  const receiptIds = new Set();
  if (normalized.rewardReceipts.some((receipt) => !validReceipt(receipt, normalized) || receiptIds.has(receipt.id) || (receiptIds.add(receipt.id), false))) return null;
  for (const episodeId of normalized.completedEpisodeIds) {
    const episode = SKY_SHAPE_EPISODES.find(({ id }) => id === episodeId);
    if (!episode.missions.every(({ id }) => normalized.completedMissionIds.includes(id))) return null;
  }
  return normalized;
};

const readStrict = (playerId, storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', error: 'Sky Shapes saved progress is unavailable.' };
  let raw;
  try { raw = storage.getItem(keyFor(playerId)); }
  catch { return { ok: false, status: 'unavailable', error: 'Sky Shapes saved progress could not be read.' }; }
  if (raw === null) return { ok: true, status: 'fresh', progress: emptyProgress() };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, status: 'invalid', error: 'Sky Shapes saved progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { return { ok: false, status: 'invalid', error: 'Sky Shapes saved progress is invalid.' }; }
  const progress = validateProgress(parsed);
  return progress ? { ok: true, status: 'ready', progress } : { ok: false, status: 'invalid', error: 'Sky Shapes saved progress is invalid.' };
};

const writeStrict = (playerId, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Sky Shapes progress could not be saved. Check storage and retry this result.' };
  }
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    const raw = storage.getItem(keyFor(playerId));
    if (raw !== encoded || !validateProgress(JSON.parse(raw))) throw new Error('readback mismatch');
    return { ok: true, status: 'saved', progress: validateProgress(JSON.parse(raw)), error: null };
  } catch {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Sky Shapes progress could not be confirmed. Retry this same result.' };
  }
};

export const skyShapesProgressKey = keyFor;
export const readSkyShapesProgressStrict = (playerId, storage = defaultStorage()) => readStrict(playerId, storage);
export const getSkyShapesProgressStrict = readSkyShapesProgressStrict;
// Legacy read callers get a projection, while the game itself uses strict state.
export const getSkyShapesProgress = (playerId, storage = defaultStorage()) => {
  const result = readStrict(playerId, storage);
  return result.ok ? result.progress : emptyProgress();
};

export const rememberSkyMissionQueueStrict = (playerId, missionIds, storage = defaultStorage()) => {
  if (!Array.isArray(missionIds) || missionIds.length < 1 || missionIds.length > 12
    || missionIds.some((id) => !knownMissionIds.has(id)) || new Set(missionIds).size !== missionIds.length) {
    return { ok: false, status: 'invalid', error: 'The selected Sky Shapes flight list is invalid.' };
  }
  const before = readStrict(playerId, storage);
  if (!before.ok) return { ...before, progress: null };
  if (missionIds.some((id) => episodeIndexForMission(id) > before.progress.unlockedEpisode)) {
    return { ok: false, status: 'locked', progress: before.progress, error: 'Finish the previous sky before saving this flight list.' };
  }
  const next = { ...before.progress, recentMissionIds: [...before.progress.recentMissionIds, ...missionIds].slice(-8) };
  return writeStrict(playerId, next, storage, before.progress);
};

export const rememberSkyMissionQueue = (playerId, missionIds, storage = defaultStorage()) => {
  const before = readStrict(playerId, storage);
  if (!before.ok) throw new Error(before.error || 'Sky Shapes progress could not be read.');
  const safeIds = [...new Set((Array.isArray(missionIds) ? missionIds : []).filter((id) => knownMissionIds.has(id)))].slice(-12);
  const saved = writeStrict(playerId, { ...before.progress, recentMissionIds: [...before.progress.recentMissionIds, ...safeIds].slice(-8) }, storage, before.progress);
  if (!saved.ok) throw new Error(saved.error || 'Sky Shapes queue could not be saved.');
  return saved.progress;
};

export const pendingSkyShapesRewards = (progress) => Array.isArray(progress?.rewardReceipts)
  ? progress.rewardReceipts.filter((receipt) => !receipt.parentClaimed).map((receipt) => ({ ...receipt }))
  : [];
export const getSkyShapesPendingRewardsStrict = (playerId, storage = defaultStorage()) => {
  const state = readStrict(playerId, storage);
  return state.ok ? { ...state, receipts: pendingSkyShapesRewards(state.progress) } : state;
};

export const markSkyShapesRewardClaimedStrict = (playerId, receiptId, storage = defaultStorage()) => {
  const before = readStrict(playerId, storage);
  if (!before.ok) return { ...before, progress: null };
  const receipt = before.progress.rewardReceipts.find((entry) => entry.id === receiptId);
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: before.progress, error: 'The saved Sky Shapes reward receipt was not found.' };
  if (receipt.parentClaimed) return { ok: true, status: 'already-claimed', progress: before.progress, receipt: { ...receipt }, error: null };
  const next = {
    ...before.progress,
    ...(receipt.kind === 'episode' ? {
      unlockedEpisode: Math.max(before.progress.unlockedEpisode, Math.min(SKY_SHAPE_EPISODES.length - 1, SKY_SHAPE_EPISODES.findIndex(({ id }) => id === receipt.episodeId) + 1)),
    } : {}),
    rewardReceipts: before.progress.rewardReceipts.map((entry) => entry.id === receiptId ? { ...entry, parentClaimed: true } : entry),
  };
  return { ...writeStrict(playerId, next, storage, before.progress), receipt: { ...receipt, parentClaimed: true } };
};

const invalidFlight = (error) => ({ ok: false, status: 'invalid', progress: null, error });
export const recordSkyFlightCompletionStrict = (playerId, missionId, accuracy, stars, seed, storage = defaultStorage()) => {
  const mission = SKY_SHAPE_MISSION_BY_ID[missionId];
  if (!mission || (accuracy !== null && (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100))
    || !Number.isInteger(stars) || stars < 1 || stars > 3 || !Number.isSafeInteger(seed) || seed <= 0 || seed > 0xffffffff
    || (accuracy === null && stars !== 1) || (accuracy !== null && skyAccuracyStars(accuracy) !== stars)) return invalidFlight('This Sky Shapes result is invalid.');
  const before = readStrict(playerId, storage);
  if (!before.ok) return { ...before, progress: null };
  const current = before.progress;
  const missionEpisodeIndex = episodeIndexForMission(missionId);
  if (missionEpisodeIndex > current.unlockedEpisode) {
    return { ok: false, status: 'locked', progress: current, error: 'Finish the previous sky before saving this flight.' };
  }
  const flightReceiptId = `mission:${missionId}:${seed}`;
  const existingFlightReceipt = current.rewardReceipts.find((receipt) => receipt.id === flightReceiptId);
  if (existingFlightReceipt) {
    const episodeReceipt = current.rewardReceipts.find((receipt) => receipt.kind === 'episode' && receipt.createdBySeed === seed && receipt.episodeId === mission.episodeId);
    return {
      ok: true, status: 'recovered', progress: current, episodeComplete: current.completedEpisodeIds.includes(mission.episodeId),
      newlyCompletedMission: false, attemptStars: stars, awardedStars: existingFlightReceipt.parentClaimed ? 0 : existingFlightReceipt.rewardDelta, bestStars: current.bestMissionStars[missionId] || stars,
      newlyCompletedEpisode: Boolean(episodeReceipt && !episodeReceipt.parentClaimed), chapterStars: current.bestStars[mission.episodeId] || 0,
      chapterBonusStars: episodeReceipt && !episodeReceipt.parentClaimed ? episodeReceipt.rewardDelta : 0, receipts: pendingSkyShapesRewards(current), receipt: { ...existingFlightReceipt }, error: null,
    };
  }

  const priorMissionDone = current.completedMissionIds.includes(missionId);
  const priorMissionStars = current.bestMissionStars[missionId] || 0;
  // A legacy completion with no recorded rating is still earned; do not turn
  // a replay into retroactive star credit.
  const awardedStars = priorMissionDone ? (priorMissionStars > 0 ? Math.max(0, stars - priorMissionStars) : 0) : stars;
  const completedMissionIds = priorMissionDone ? [...current.completedMissionIds] : [...current.completedMissionIds, missionId];
  const bestAccuracy = accuracy === null ? { ...current.bestAccuracy } : { ...current.bestAccuracy, [missionId]: Math.max(current.bestAccuracy[missionId] || 0, accuracy) };
  const bestMissionStars = { ...current.bestMissionStars, [missionId]: Math.max(priorMissionStars, stars) };
  const episode = SKY_SHAPE_EPISODES[mission.episodeIndex];
  const episodeIsComplete = episode.missions.every((entry) => completedMissionIds.includes(entry.id));
  const legacyComplete = episode.missions.every((entry) => current.completedMissionIds.includes(entry.id));
  const wasComplete = current.completedEpisodeIds.includes(episode.id) || legacyComplete;
  const newlyCompletedEpisode = episodeIsComplete && !wasComplete;
  const completedEpisodeIds = episodeIsComplete && !current.completedEpisodeIds.includes(episode.id)
    ? [...current.completedEpisodeIds, episode.id] : [...current.completedEpisodeIds];
  const alreadyUnlocked = current.completedEpisodeIds.includes(episode.id);
  const pendingEpisodeReceipt = current.rewardReceipts.some((entry) => entry.kind === 'episode' && entry.episodeId === episode.id && !entry.parentClaimed);
  // A newly earned sky stays locked until its parent reward receipt is
  // confirmed and read back by markSkyShapesRewardClaimedStrict.
  const unlockedEpisode = episodeIsComplete && (alreadyUnlocked || legacyComplete) && !pendingEpisodeReceipt
    ? Math.max(current.unlockedEpisode, Math.min(SKY_SHAPE_EPISODES.length - 1, mission.episodeIndex + 1))
    : current.unlockedEpisode;
  const rewardReceipts = [...current.rewardReceipts];
  const receipt = awardedStars > 0 ? {
    id: flightReceiptId, kind: 'mission', missionId, episodeId: episode.id, seed,
    rewardDelta: awardedStars, parentClaimed: false,
  } : null;
  if (receipt) rewardReceipts.push(receipt);
  const chapterBonusStars = newlyCompletedEpisode ? SKY_CHAPTER_BONUS_STARS : 0;
  if (chapterBonusStars) rewardReceipts.push({ id: `episode:${episode.id}:complete`, kind: 'episode', episodeId: episode.id, createdBySeed: seed, rewardDelta: chapterBonusStars, parentClaimed: false });
  const ratings = episode.missions.map((entry) => bestMissionStars[entry.id] || 0);
  const chapterStars = episodeIsComplete ? Math.max(1, Math.min(3, Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length))) : (current.bestStars[episode.id] || 0);
  const next = {
    ...current,
    unlockedEpisode,
    completedMissionIds,
    completedEpisodeIds,
    bestAccuracy,
    bestMissionStars,
    bestStars: episodeIsComplete ? { ...current.bestStars, [episode.id]: Math.max(current.bestStars[episode.id] || 0, chapterStars) } : { ...current.bestStars },
    rewardReceipts,
  };
  const saved = writeStrict(playerId, next, storage, current);
  if (!saved.ok) return { ...saved, episodeComplete: episodeIsComplete, newlyCompletedMission: !priorMissionDone, attemptStars: stars, awardedStars, bestStars: bestMissionStars[missionId], newlyCompletedEpisode, chapterStars, chapterBonusStars, receipt, receipts: pendingSkyShapesRewards(current) };
  return {
    ...saved, episodeComplete: episodeIsComplete, newlyCompletedMission: !priorMissionDone,
    attemptStars: stars, awardedStars, bestStars: bestMissionStars[missionId], newlyCompletedEpisode, chapterStars,
    chapterBonusStars, receipt, receipts: pendingSkyShapesRewards(saved.progress),
  };
};

// Existing unit callers retain their original helper shapes, but failures now throw instead of pretending saved.
let compatibilitySeed = 0;
const nextCompatibilitySeed = () => {
  compatibilitySeed = (compatibilitySeed + 1) >>> 0;
  return compatibilitySeed || 1;
};

export const recordSkyMissionCompletion = (playerId, missionId, accuracy, stars, storage = defaultStorage()) => {
  const result = recordSkyFlightCompletionStrict(playerId, missionId, accuracy, stars, nextCompatibilitySeed(), storage);
  if (!result.ok) return null;
  return result;
};

export const recordSkyEpisodeReward = (playerId, episodeId, stars, storage = defaultStorage()) => {
  if (!knownEpisodeIds.has(episodeId) || !Number.isInteger(stars) || stars < 1 || stars > 3) return null;
  const before = readStrict(playerId, storage);
  if (!before.ok) return null;
  const previous = before.progress.bestStars[episodeId] || 0;
  const next = { ...before.progress, bestStars: { ...before.progress.bestStars, [episodeId]: Math.max(previous, stars) } };
  const saved = writeStrict(playerId, next, storage, before.progress);
  return saved.ok ? { progress: saved.progress, bestStars: next.bestStars[episodeId], improved: stars > previous } : null;
};

export const recordSkyFlightCompletion = (playerId, missionId, accuracy, stars, storage = defaultStorage()) => {
  const seed = nextCompatibilitySeed();
  const result = recordSkyFlightCompletionStrict(playerId, missionId, accuracy, stars, seed, storage);
  if (!result.ok) return null;
  return result;
};
