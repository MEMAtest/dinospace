// One synchronous reward record prevents a stale open tab from replacing
// newer stars/stickers with its old React state. Legacy keys remain readable.
import { STICKERS } from './index.js';
import { playerStorageKey } from './players.js';

export const rewardKey = (playerId) => playerStorageKey(playerId, 'rewards_v2');
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const count = (value) => Number.isFinite(value) && value >= 0 ? value : 0;
const read = (storage, key, fallback) => {
  try { return JSON.parse(storage?.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
};
export const mergeRewards = (...values) => {
  const points = Math.max(0, ...values.map((value) => count(value?.points)));
  const gamesPlayed = {};
  for (const value of values) {
    for (const [id, plays] of Object.entries(record(value?.gamesPlayed))) {
      gamesPlayed[id] = Math.max(gamesPlayed[id] || 0, count(plays));
    }
  }
  const validIds = new Set(STICKERS.map(({ id }) => id));
  const ids = values.flatMap((value) => Array.isArray(value?.earnedStickerIds) ? value.earnedStickerIds : []);
  return {
    version: 2, points, gamesPlayed,
    earnedStickerIds: [...new Set([...ids.filter((id) => validIds.has(id)), ...STICKERS.filter((sticker) => points >= sticker.points).map(({ id }) => id)])],
  };
};
export const readPlayerRewards = (playerId, storage = globalThis.localStorage) => mergeRewards(
  read(storage, rewardKey(playerId), {}),
  {
    points: read(storage, playerStorageKey(playerId, 'points'), 0),
    earnedStickerIds: read(storage, playerStorageKey(playerId, 'earned_sticker_ids_v1'), []),
    gamesPlayed: read(storage, playerStorageKey(playerId, 'games_played'), {}),
  },
);

export const commitPlayerReward = (playerId, current, amount, gameId, storage = globalThis.localStorage) => {
  const before = mergeRewards(readPlayerRewards(playerId, storage), current);
  const next = mergeRewards({
    ...before,
    points: before.points + count(amount),
    gamesPlayed: gameId ? { ...before.gamesPlayed, [gameId]: (before.gamesPlayed[gameId] || 0) + 1 } : before.gamesPlayed,
  });
  let persisted = false;
  try {
    if (!storage) throw new Error('Storage unavailable');
    // This is authoritative: all reward fields are committed before React renders.
    storage.setItem(rewardKey(playerId), JSON.stringify(next));
    persisted = true;
  } catch { /* caller shows a save warning, never claims a failed write saved */ }
  if (persisted) {
    for (const [key, value] of [['points', next.points], ['earned_sticker_ids_v1', next.earnedStickerIds], ['games_played', next.gamesPlayed]]) {
      try { storage.setItem(playerStorageKey(playerId, key), JSON.stringify(value)); } catch { /* authoritative record is already saved */ }
    }
  }
  return { ...next, persisted };
};
