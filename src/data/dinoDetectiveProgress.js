import { DINO_DETECTIVE_WORLDS } from './dinoDetectiveBatch3.js';

export const DINO_DETECTIVE_PROGRESS_VERSION = 1;
export const DINO_DETECTIVE_PROGRESS_KEY = 'amari_dino_detective_batch3_v1';
const keyFor = (playerId) => `${playerId || 'amari'}_${DINO_DETECTIVE_PROGRESS_KEY}`;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;
const worldById = new Map(DINO_DETECTIVE_WORLDS.map((world) => [world.id, world]));
const validWorldIds = new Set(worldById.keys());
const validStickerIds = new Set(DINO_DETECTIVE_WORLDS.map(({ stickerId }) => stickerId));
const validSignature = (signature) => typeof signature === 'string' && signature.split('|').length === 5
  && new Set(signature.split('|')).size === 5
  && signature.split('|').every((id) => ['fern-left', 'stone-center', 'water-right', 'fern-low-left', 'stone-low-right'].includes(id));

const emptyProgress = () => ({
  version: DINO_DETECTIVE_PROGRESS_VERSION,
  unlockedWorldIndex: 0,
  completedWorldIds: [],
  bestStars: {},
  earnedWorldStickerIds: [],
  recentRunSignatures: {},
});

const normalizeProgress = (value) => {
  const empty = emptyProgress();
  if (!isRecord(value) || value.version !== DINO_DETECTIVE_PROGRESS_VERSION) return empty;
  const storedCompleted = new Set((Array.isArray(value.completedWorldIds) ? value.completedWorldIds : []).filter((id) => validWorldIds.has(id)));
  let unlockedWorldIndex = 0;
  const completedWorldIds = [];
  while (completedWorldIds.length < DINO_DETECTIVE_WORLDS.length && storedCompleted.has(DINO_DETECTIVE_WORLDS[completedWorldIds.length].id)) {
    completedWorldIds.push(DINO_DETECTIVE_WORLDS[completedWorldIds.length].id);
    unlockedWorldIndex = Math.min(completedWorldIds.length, DINO_DETECTIVE_WORLDS.length - 1);
  }
  const recentRunSignatures = {};
  if (isRecord(value.recentRunSignatures)) {
    for (const [id, signatures] of Object.entries(value.recentRunSignatures)) {
      if (validWorldIds.has(id) && Array.isArray(signatures)) recentRunSignatures[id] = signatures.filter(validSignature).slice(-8);
    }
  }
  return {
    ...empty,
    unlockedWorldIndex,
    completedWorldIds,
    bestStars: isRecord(value.bestStars) ? Object.fromEntries(Object.entries(value.bestStars).filter(([id, stars]) => completedWorldIds.includes(id) && Number.isInteger(stars) && stars >= 0 && stars <= 3)) : {},
    earnedWorldStickerIds: [...new Set((Array.isArray(value.earnedWorldStickerIds) ? value.earnedWorldStickerIds : []).filter((id) => {
      const sticker = DINO_DETECTIVE_WORLDS.find((world) => world.stickerId === id);
      return validStickerIds.has(id) && completedWorldIds.includes(sticker.id);
    }))],
    recentRunSignatures,
  };
};

export const getDinoDetectiveProgress = (playerId, storage = browserStorage()) => {
  try { return normalizeProgress(JSON.parse(storage?.getItem(keyFor(playerId)) || 'null')); } catch { return emptyProgress(); }
};

const saveProgress = (playerId, progress, storage) => {
  try { storage?.setItem(keyFor(playerId), JSON.stringify(progress)); } catch { /* Progress is optional when browser storage is unavailable. */ }
};

export const recentDinoRunSignatures = (playerId, worldId, storage = browserStorage()) => getDinoDetectiveProgress(playerId, storage).recentRunSignatures[worldId] || [];

export const rememberDinoDetectiveRun = (playerId, worldId, signature, storage = browserStorage()) => {
  if (!validWorldIds.has(worldId) || !validSignature(signature)) return null;
  const progress = getDinoDetectiveProgress(playerId, storage);
  const world = worldById.get(worldId);
  if (world.index > progress.unlockedWorldIndex) return null;
  const current = progress.recentRunSignatures[worldId] || [];
  const nextSignatures = [...current, signature].slice(-8);
  const next = { ...progress, recentRunSignatures: { ...progress.recentRunSignatures, [worldId]: nextSignatures } };
  saveProgress(playerId, next, storage);
  return next;
};

export const recordDinoDetectiveCompletion = (playerId, worldId, stars, roundIds, storage = browserStorage()) => {
  const world = worldById.get(worldId);
  if (!world || !Number.isInteger(stars) || stars < 1 || stars > 3
    || !Array.isArray(roundIds) || roundIds.length !== 5
    || new Set(roundIds).size !== 5
    || roundIds.some((id, index) => id !== `${worldId}:round-${index + 1}`)) return null;
  const progress = getDinoDetectiveProgress(playerId, storage);
  if (world.index > progress.unlockedWorldIndex) return null;
  const completedWorldIds = progress.completedWorldIds.includes(worldId) ? progress.completedWorldIds : [...progress.completedWorldIds, worldId];
  const previousBest = progress.bestStars[worldId] || 0;
  const bestStars = { ...progress.bestStars, [worldId]: Math.max(previousBest, stars) };
  const newlyCompleted = !progress.completedWorldIds.includes(worldId);
  const newlyEarnedSticker = newlyCompleted && !progress.earnedWorldStickerIds.includes(world.stickerId);
  const earnedWorldStickerIds = newlyEarnedSticker ? [...progress.earnedWorldStickerIds, world.stickerId] : progress.earnedWorldStickerIds;
  const unlockedWorldIndex = world.index === progress.unlockedWorldIndex && world.index < DINO_DETECTIVE_WORLDS.length - 1
    ? world.index + 1 : progress.unlockedWorldIndex;
  const next = { ...progress, completedWorldIds, bestStars, earnedWorldStickerIds, unlockedWorldIndex };
  saveProgress(playerId, next, storage);
  return {
    progress: next,
    newlyCompleted,
    newlyEarnedSticker,
    awardedStars: Math.max(0, stars - previousBest),
    bestStars: bestStars[worldId],
  };
};
