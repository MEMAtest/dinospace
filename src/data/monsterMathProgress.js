import { MONSTER_MATH_EPISODES, MONSTER_QUESTION_POOLS } from './monsterMathEpisodes.js';

export const MONSTER_MATH_PROGRESS_VERSION = 1;
export const MONSTER_MATH_PROGRESS_KEY = 'monster_math_progress_v1';
// App's legacy scaledCelebrate callback converts callback units to awarded
// stars by dividing by four. Keep the Monster Math run rating and award equal.
export const monsterMathRewardCallbackUnits = (stars) => stars * 4;
const keyFor = (playerId) => `${playerId || 'amari'}_${MONSTER_MATH_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

const emptyProgress = () => ({ version: MONSTER_MATH_PROGRESS_VERSION, unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, recentQuestionIds: {}, rewardReceipts: {} });
const validIdsByEpisode = MONSTER_QUESTION_POOLS.map((pool) => new Set(pool.map((question) => question.id)));
const episodeIds = new Set(MONSTER_MATH_EPISODES.map(({ id }) => id));
const episodeIndexById = new Map(MONSTER_MATH_EPISODES.map(({ id }, index) => [id, index]));

const validRewardReceipts = (receipts, progress) => receipts === undefined || (isRecord(receipts)
  && Object.entries(receipts).every(([transactionId, receipt]) => {
    const index = episodeIndexById.get(receipt?.episodeId);
    return index !== undefined && isRecord(receipt)
      && receipt.id === transactionId
      && transactionId === `${receipt.episodeId}:best:${receipt.bestStars}`
      && Number.isInteger(receipt.bestStars) && receipt.bestStars >= 1 && receipt.bestStars <= 3
      && Number.isInteger(receipt.rewardDelta) && receipt.rewardDelta >= 1 && receipt.rewardDelta <= 3
      && typeof receipt.claimed === 'boolean'
      && (progress.completedEpisodeIds || []).includes(receipt.episodeId)
      && (progress.bestStars?.[receipt.episodeId] || 0) >= receipt.bestStars;
  }));

const validProgress = (value) => isRecord(value)
  && value.version === MONSTER_MATH_PROGRESS_VERSION
  && (value.unlockedEpisode === undefined || (Number.isInteger(value.unlockedEpisode) && value.unlockedEpisode >= 0 && value.unlockedEpisode < MONSTER_MATH_EPISODES.length))
  && (value.completedEpisodeIds === undefined || (Array.isArray(value.completedEpisodeIds) && value.completedEpisodeIds.every((id) => episodeIds.has(id)) && new Set(value.completedEpisodeIds).size === value.completedEpisodeIds.length))
  && (value.bestStars === undefined || (isRecord(value.bestStars) && Object.entries(value.bestStars).every(([id, stars]) => episodeIds.has(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)))
  && (value.recentQuestionIds === undefined || (isRecord(value.recentQuestionIds) && Object.entries(value.recentQuestionIds).every(([episodeIndex, ids]) => {
    const index = Number(episodeIndex);
    return Number.isInteger(index) && index >= 0 && index < MONSTER_MATH_EPISODES.length
      && Array.isArray(ids) && ids.every((id) => validIdsByEpisode[index].has(id)) && new Set(ids).size === ids.length;
  })))
  && (value.rewardReceipts === undefined || validRewardReceipts(value.rewardReceipts, value));

const normalizedProgress = (value = emptyProgress()) => ({
  ...emptyProgress(),
  ...value,
  unlockedEpisode: value.unlockedEpisode ?? 0,
  completedEpisodeIds: [...(value.completedEpisodeIds || [])],
  bestStars: { ...(value.bestStars || {}) },
  recentQuestionIds: Object.fromEntries(Object.entries(value.recentQuestionIds || {}).map(([index, ids]) => [index, [...ids].slice(-8)])),
  rewardReceipts: { ...(value.rewardReceipts || {}) },
});

const readStrict = (playerId, storage) => {
  let raw;
  try {
    if (!storage || typeof storage.getItem !== 'function') return { ok: false, error: 'unavailable' };
    raw = storage.getItem(keyFor(playerId));
  } catch { return { ok: false, error: 'unavailable' }; }
  if (raw === null) return { ok: true, progress: emptyProgress(), raw: null };
  if (typeof raw !== 'string') return { ok: false, error: 'invalid' };
  let value;
  try { value = JSON.parse(raw); } catch { return { ok: false, error: 'invalid' }; }
  if (!validProgress(value)) return { ok: false, error: 'invalid' };
  return { ok: true, progress: normalizedProgress(value), raw };
};

const writeStrict = (playerId, next, storage) => {
  let encoded;
  try {
    if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { ok: false, error: 'unavailable' };
    encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    if (storage.getItem(keyFor(playerId)) !== encoded) return { ok: false, error: 'readback' };
    return { ok: true };
  } catch {
    try { return storage?.getItem(keyFor(playerId)) === encoded ? { ok: true } : { ok: false, error: 'write' }; }
    catch { return { ok: false, error: 'write' }; }
  }
};

export const getMonsterMathProgressStrict = (playerId, storage = browserStorage()) => {
  const loaded = readStrict(playerId, storage);
  return loaded.ok ? { ok: true, progress: loaded.progress } : loaded;
};

// Compatibility projection. New completion/reward UI must use the strict API.
export const getMonsterMathProgress = (playerId, storage = browserStorage()) => {
  const loaded = readStrict(playerId, storage);
  return loaded.ok ? loaded.progress : emptyProgress();
};

export const recentMonsterQuestionIds = (playerId, episodeIndex, storage = browserStorage()) => getMonsterMathProgress(playerId, storage).recentQuestionIds[episodeIndex] || [];

const validRun = (episodeIndex, questionIds) => Number.isInteger(episodeIndex)
  && episodeIndex >= 0 && episodeIndex < MONSTER_MATH_EPISODES.length
  && Array.isArray(questionIds) && questionIds.length === 6
  && questionIds.every((id) => validIdsByEpisode[episodeIndex].has(id))
  && new Set(questionIds).size === 6;

export const rememberMonsterMathRunStrict = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  if (!validRun(episodeIndex, questionIds)) return { ok: false, error: 'invalid' };
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  const progress = loaded.progress;
  if (episodeIndex > progress.unlockedEpisode) return { ok: false, error: 'locked' };
  const current = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = [...current, ...questionIds.filter((id) => !current.includes(id))].slice(-8);
  const next = { ...progress, recentQuestionIds: { ...progress.recentQuestionIds, [episodeIndex]: recentQuestionIds } };
  const saved = writeStrict(playerId, next, storage);
  return saved.ok ? { ok: true, progress: normalizedProgress(next) } : saved;
};

export const rememberMonsterMathRun = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  const result = rememberMonsterMathRunStrict(playerId, episodeIndex, questionIds, storage);
  return result.ok ? result.progress : null;
};

export const recordMonsterEpisodeCompletionStrict = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  if (!validRun(episodeIndex, questionIds) || !Number.isInteger(stars) || stars < 1 || stars > 3) return { ok: false, error: 'invalid' };
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  const progress = loaded.progress;
  if (episodeIndex > progress.unlockedEpisode) return { ok: false, error: 'locked' };
  const episodeId = MONSTER_MATH_EPISODES[episodeIndex].id;
  const wasCompleted = progress.completedEpisodeIds.includes(episodeId);
  const oldBest = progress.bestStars[episodeId] || 0;
  const bestStars = Math.max(oldBest, stars);
  // A completed legacy episode with no recorded rating has unknown prior
  // earnings. Seed its first post-upgrade rating without paying it retroactively.
  const awardedStars = wasCompleted && oldBest === 0 ? 0 : Math.max(0, bestStars - oldBest);
  const completedEpisodeIds = wasCompleted ? progress.completedEpisodeIds : [...progress.completedEpisodeIds, episodeId];
  const recent = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = { ...progress.recentQuestionIds, [episodeIndex]: [...recent, ...questionIds.filter((id) => !recent.includes(id))].slice(-8) };
  const rewardReceipts = { ...progress.rewardReceipts };
  const transactionId = `${episodeId}:best:${bestStars}`;
  if (awardedStars > 0 && !rewardReceipts[transactionId]) {
    rewardReceipts[transactionId] = { id: transactionId, episodeId, bestStars, rewardDelta: awardedStars, claimed: false };
  }
  const next = {
    ...progress,
    completedEpisodeIds,
    bestStars: { ...progress.bestStars, [episodeId]: bestStars },
    recentQuestionIds,
    rewardReceipts,
    unlockedEpisode: Math.max(progress.unlockedEpisode, Math.min(MONSTER_MATH_EPISODES.length - 1, episodeIndex + 1)),
  };
  const saved = writeStrict(playerId, next, storage);
  if (!saved.ok) return saved;
  const receipt = rewardReceipts[transactionId]?.claimed === false ? rewardReceipts[transactionId] : null;
  return { ok: true, progress: normalizedProgress(next), awardedStars, newlyCompleted: !wasCompleted, improved: bestStars > oldBest, receipt };
};

// Compatibility shape for older callers. New UI must not award from this
// projection because it intentionally contains no persistence failure signal.
export const recordMonsterEpisodeCompletion = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  const result = recordMonsterEpisodeCompletionStrict(playerId, episodeIndex, stars, questionIds, storage);
  return result.ok ? { ...result, progress: result.progress } : null;
};

export const getMonsterMathPendingRewardReceiptsStrict = (playerId, storage = browserStorage()) => {
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  return { ok: true, receipts: Object.values(loaded.progress.rewardReceipts).filter((receipt) => !receipt.claimed) };
};

export const markMonsterMathRewardReceiptClaimedStrict = (playerId, receiptId, storage = browserStorage()) => {
  if (typeof receiptId !== 'string') return { ok: false, error: 'invalid' };
  const loaded = readStrict(playerId, storage);
  if (!loaded.ok) return loaded;
  const progress = loaded.progress;
  const receipt = progress.rewardReceipts[receiptId];
  if (!receipt) return { ok: false, error: 'missing' };
  if (receipt.claimed) return { ok: true, progress };
  const next = { ...progress, rewardReceipts: { ...progress.rewardReceipts, [receiptId]: { ...receipt, claimed: true } } };
  const saved = writeStrict(playerId, next, storage);
  return saved.ok ? { ok: true, progress: normalizedProgress(next) } : saved;
};
