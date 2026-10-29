import { COUNT_CONSTELLATION_PAGES, COUNT_THE_STARS_EPISODES } from './countTheStarsBatch3.js';

export const COUNT_STARS_PROGRESS_VERSION = 1;
export const COUNT_STARS_PROGRESS_KEY = 'amari_count_the_stars_batch3_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${COUNT_STARS_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
};
const validEpisodeIds = new Set(COUNT_THE_STARS_EPISODES.map(({ id }) => id));
const validQuestionIdsByEpisode = COUNT_THE_STARS_EPISODES.map((episode) => new Set(episode.scenes.flatMap((scene) => Array.from({ length: episode.max - episode.min + 1 }, (_, offset) => {
  const count = episode.min + offset;
  return [`${scene.id}:${count}:orbit`, `${scene.id}:${count}:grouped`];
}).flat())));
const emptyProgress = () => ({ version: COUNT_STARS_PROGRESS_VERSION, unlockedEpisode: 0, completedEpisodeIds: [], bestStars: {}, earnedConstellationPageIds: [], recentQuestionIds: {}, rewardReceipts: [] });

const strictValidShape = (value) => {
  if (!isRecord(value) || value.version !== COUNT_STARS_PROGRESS_VERSION) return false;
  if (value.completedEpisodeIds !== undefined && !Array.isArray(value.completedEpisodeIds)) return false;
  if (value.bestStars !== undefined && !isRecord(value.bestStars)) return false;
  if (value.earnedConstellationPageIds !== undefined && !Array.isArray(value.earnedConstellationPageIds)) return false;
  if (value.recentQuestionIds !== undefined && !isRecord(value.recentQuestionIds)) return false;
  if (value.rewardReceipts !== undefined && !Array.isArray(value.rewardReceipts)) return false;
  const completed = value.completedEpisodeIds || [];
  const canonicalCompleted = COUNT_THE_STARS_EPISODES.slice(0, completed.length).map(({ id }) => id);
  if (completed.length > COUNT_THE_STARS_EPISODES.length || completed.some((id) => !validEpisodeIds.has(id))
    || new Set(completed).size !== completed.length || completed.some((id, index) => id !== canonicalCompleted[index])) return false;
  const derivedUnlocked = Math.min(completed.length, COUNT_THE_STARS_EPISODES.length - 1);
  if (value.unlockedEpisode !== undefined && (!Number.isInteger(value.unlockedEpisode) || value.unlockedEpisode < 0 || value.unlockedEpisode >= COUNT_THE_STARS_EPISODES.length || value.unlockedEpisode !== derivedUnlocked)) return false;
  const bestStars = value.bestStars || {};
  if (Object.entries(bestStars).some(([id, stars]) => !completed.includes(id) || !Number.isInteger(stars) || stars < 0 || stars > 3)) return false;
  const pages = value.earnedConstellationPageIds || [];
  if (new Set(pages).size !== pages.length || pages.some((id) => {
    const page = COUNT_CONSTELLATION_PAGES.find((entry) => entry.id === id);
    return !page || !completed.includes(page.episodeId);
  })) return false;
  const recent = value.recentQuestionIds || {};
  if (Object.entries(recent).some(([index, ids]) => !/^[0-2]$/.test(index) || !Array.isArray(ids) || ids.some((id) => !validQuestionIdsByEpisode[Number(index)].has(id)))) return false;
  const receipts = value.rewardReceipts || [];
  const receiptIds = new Set();
  for (const receipt of receipts) {
    if (!isRecord(receipt) || typeof receipt.id !== 'string' || !Number.isInteger(receipt.rewardDelta) || receipt.rewardDelta < 1 || receipt.rewardDelta > 3 || typeof receipt.claimed !== 'boolean' || receiptIds.has(receipt.id)) return false;
    const match = receipt.id.match(/^(.+):best:([1-3])$/);
    const episode = match && COUNT_THE_STARS_EPISODES.find(({ id }) => id === match[1]);
    const stars = match ? Number(match[2]) : 0;
    if (!episode || !completed.includes(episode.id) || !bestStars[episode.id] || stars > bestStars[episode.id] || receipt.rewardDelta > stars) return false;
    receiptIds.add(receipt.id);
  }
  for (const episode of COUNT_THE_STARS_EPISODES) {
    const totalReceiptDelta = receipts.filter((receipt) => receipt.id.startsWith(`${episode.id}:best:`)).reduce((total, receipt) => total + receipt.rewardDelta, 0);
    if (totalReceiptDelta > (bestStars[episode.id] || 0)) return false;
  }
  return true;
};

const normalizeProgress = (value) => {
  if (!isRecord(value) || value.version !== COUNT_STARS_PROGRESS_VERSION) return null;
  if (value.completedEpisodeIds !== undefined && !Array.isArray(value.completedEpisodeIds)) return null;
  if (value.bestStars !== undefined && !isRecord(value.bestStars)) return null;
  if (value.earnedConstellationPageIds !== undefined && !Array.isArray(value.earnedConstellationPageIds)) return null;
  if (value.recentQuestionIds !== undefined && !isRecord(value.recentQuestionIds)) return null;
  if (value.rewardReceipts !== undefined && !Array.isArray(value.rewardReceipts)) return null;
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
  const bestStars = isRecord(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => completedEpisodeIds.includes(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {};
  const earnedConstellationPageIds = [...new Set((Array.isArray(value.earnedConstellationPageIds) ? value.earnedConstellationPageIds : []).filter((id) => {
    const page = COUNT_CONSTELLATION_PAGES.find((entry) => entry.id === id);
    return validPageIds.has(id) && completedEpisodeIds.includes(page.episodeId);
  }))];
  const rewardReceipts = Array.isArray(value.rewardReceipts) ? value.rewardReceipts.filter((receipt) => isRecord(receipt)
    && typeof receipt.id === 'string' && /^[-a-z0-9]+:best:[1-3]$/.test(receipt.id)
    && Number.isInteger(receipt.rewardDelta) && receipt.rewardDelta > 0 && receipt.rewardDelta <= 3
    && typeof receipt.claimed === 'boolean'
    && COUNT_THE_STARS_EPISODES.some((entry) => receipt.id.startsWith(`${entry.id}:best:`))) : [];
  return {
    ...value,
    version: COUNT_STARS_PROGRESS_VERSION,
    unlockedEpisode,
    completedEpisodeIds,
    bestStars,
    earnedConstellationPageIds,
    recentQuestionIds,
    rewardReceipts,
  };
};

const strictRead = (playerId, storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, error: 'Progress storage is unavailable.' };
  try {
    const raw = storage.getItem(keyFor(playerId));
    if (raw === null) return { ok: true, progress: emptyProgress(), raw: null };
    if (typeof raw !== 'string') return { ok: false, error: 'Saved progress could not be read.' };
    const parsed = JSON.parse(raw);
    if (!strictValidShape(parsed)) return { ok: false, error: 'Saved progress has an unsupported format.' };
    const progress = normalizeProgress(parsed);
    return progress ? { ok: true, progress, raw } : { ok: false, error: 'Saved progress has an unsupported format.' };
  } catch { return { ok: false, error: 'Saved progress could not be read.' }; }
};

const strictWrite = (playerId, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { ok: false, progress: previous, error: 'Progress storage is unavailable.' };
  try {
    const serialized = JSON.stringify(next);
    storage.setItem(keyFor(playerId), serialized);
    if (storage.getItem(keyFor(playerId)) !== serialized) return { ok: false, progress: previous, error: 'The saved progress could not be confirmed.' };
    return { ok: true, progress: next };
  } catch { return { ok: false, progress: previous, error: 'The saved progress could not be confirmed.' }; }
};

export const getCountTheStarsProgressStrict = (playerId, storage = browserStorage()) => {
  const result = strictRead(playerId, storage);
  return result.ok ? { ok: true, progress: result.progress } : result;
};

const validRun = (episodeIndex, questionIds) => Number.isInteger(episodeIndex) && episodeIndex >= 0 && episodeIndex < COUNT_THE_STARS_EPISODES.length
  && Array.isArray(questionIds) && questionIds.length === 6 && new Set(questionIds).size === 6
  && questionIds.every((id) => validQuestionIdsByEpisode[episodeIndex].has(id));

export const rememberCountTheStarsRunStrict = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  if (!validRun(episodeIndex, questionIds)) return { ok: false, progress: null, error: 'This survey queue is not valid.' };
  const read = strictRead(playerId, storage);
  if (!read.ok) return { ok: false, progress: null, error: read.error };
  const progress = read.progress;
  if (episodeIndex > progress.unlockedEpisode) return { ok: false, progress, error: 'This survey is still locked.' };
  const recent = progress.recentQuestionIds[episodeIndex] || [];
  const updated = [...recent, ...questionIds.filter((id) => !recent.includes(id))].slice(-8);
  const next = { ...progress, recentQuestionIds: { ...progress.recentQuestionIds, [episodeIndex]: updated } };
  return strictWrite(playerId, next, storage, progress);
};

export const recordCountTheStarsCompletionStrict = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  if (!validRun(episodeIndex, questionIds) || !Number.isInteger(stars) || stars < 1 || stars > 3) return { ok: false, progress: null, error: 'This survey result is not valid.' };
  const read = strictRead(playerId, storage);
  if (!read.ok) return { ok: false, progress: null, error: read.error };
  const progress = read.progress;
  if (episodeIndex > progress.unlockedEpisode) return { ok: false, progress, error: 'This survey is still locked.' };
  const episode = COUNT_THE_STARS_EPISODES[episodeIndex];
  const newlyCompleted = !progress.completedEpisodeIds.includes(episode.id);
  const oldBest = progress.bestStars[episode.id];
  const hasLegacyUnknownRating = !newlyCompleted && oldBest === 0;
  const improvement = oldBest === undefined || hasLegacyUnknownRating ? (newlyCompleted ? stars : 0) : Math.max(0, stars - oldBest);
  const completedEpisodeIds = newlyCompleted ? [...progress.completedEpisodeIds, episode.id] : progress.completedEpisodeIds;
  const bestStars = oldBest === undefined || hasLegacyUnknownRating || stars > oldBest ? { ...progress.bestStars, [episode.id]: stars } : progress.bestStars;
  const newlyEarnedPage = newlyCompleted && !progress.earnedConstellationPageIds.includes(episode.pageId);
  const earnedConstellationPageIds = newlyEarnedPage ? [...progress.earnedConstellationPageIds, episode.pageId] : progress.earnedConstellationPageIds;
  const unlockedEpisode = newlyCompleted && episodeIndex === progress.unlockedEpisode && episodeIndex < COUNT_THE_STARS_EPISODES.length - 1 ? episodeIndex + 1 : progress.unlockedEpisode;
  const recent = progress.recentQuestionIds[episodeIndex] || [];
  const recentQuestionIds = { ...progress.recentQuestionIds, [episodeIndex]: [...recent, ...questionIds.filter((id) => !recent.includes(id))].slice(-8) };
  const receipt = improvement > 0 ? { id: `${episode.id}:best:${stars}`, rewardDelta: improvement, claimed: false } : null;
  const rewardReceipts = receipt && !progress.rewardReceipts.some((item) => item.id === receipt.id)
    ? [...progress.rewardReceipts, receipt] : progress.rewardReceipts;
  const next = { ...progress, completedEpisodeIds, bestStars, earnedConstellationPageIds, unlockedEpisode, recentQuestionIds, rewardReceipts };
  const saved = strictWrite(playerId, next, storage, progress);
  return { ...saved, newlyCompleted, newlyEarnedPage, awardedStars: saved.ok ? improvement : 0, bestStars: next.bestStars[episode.id] || oldBest || 0, receipt: saved.ok ? receipt : null };
};

export const getCountTheStarsPendingReceiptsStrict = (playerId, storage = browserStorage()) => {
  const read = strictRead(playerId, storage);
  return read.ok ? { ok: true, progress: read.progress, receipts: read.progress.rewardReceipts.filter(({ claimed }) => !claimed) } : { ok: false, progress: null, receipts: [], error: read.error };
};

export const markCountTheStarsReceiptClaimedStrict = (playerId, receiptId, storage = browserStorage()) => {
  const read = strictRead(playerId, storage);
  if (!read.ok) return { ok: false, progress: null, error: read.error };
  const receipt = read.progress.rewardReceipts.find((item) => item.id === receiptId);
  if (!receipt) return { ok: false, progress: read.progress, error: 'The saved reward could not be found.' };
  if (receipt.claimed) return { ok: true, progress: read.progress };
  const next = { ...read.progress, rewardReceipts: read.progress.rewardReceipts.map((item) => item.id === receiptId ? { ...item, claimed: true } : item) };
  return strictWrite(playerId, next, storage, read.progress);
};

// Compatibility wrappers for existing readers and old tests. Strict callers should use the APIs above.
export const getCountTheStarsProgress = (playerId, storage = browserStorage()) => {
  try {
    if (!storage || typeof storage.getItem !== 'function') return emptyProgress();
    const raw = storage.getItem(keyFor(playerId));
    if (raw === null || typeof raw !== 'string') return emptyProgress();
    return normalizeProgress(JSON.parse(raw)) || emptyProgress();
  } catch { return emptyProgress(); }
};
export const recentCountQuestionIds = (playerId, episodeIndex, storage = browserStorage()) => getCountTheStarsProgress(playerId, storage).recentQuestionIds[episodeIndex] || [];
export const rememberCountTheStarsRun = (playerId, episodeIndex, questionIds, storage = browserStorage()) => {
  const result = rememberCountTheStarsRunStrict(playerId, episodeIndex, questionIds, storage);
  return result.ok ? result.progress : null;
};
export const recordCountTheStarsCompletion = (playerId, episodeIndex, stars, questionIds, storage = browserStorage()) => {
  const result = recordCountTheStarsCompletionStrict(playerId, episodeIndex, stars, questionIds, storage);
  if (!result.ok) return null;
  return { progress: result.progress, newlyCompleted: result.newlyCompleted, newlyEarnedPage: result.newlyEarnedPage, awardedStars: result.awardedStars, bestStars: result.bestStars, receipt: result.receipt };
};
