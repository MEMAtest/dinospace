// Saved level per child per little-explorer game.
import { LITTLE_LEVELS, LITTLE_START_LEVEL } from './littleGames.js';

const storageKey = (playerId) => `${playerId || 'askia'}_little_progress`;

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

const read = (storage, playerId) => {
  try {
    const raw = storage?.getItem(storageKey(playerId));
    const value = raw ? JSON.parse(raw) : {};
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
};

export const startLevelFor = (bigKid) => (bigKid ? LITTLE_START_LEVEL.big : LITTLE_START_LEVEL.little);

const clampLevel = (gameId, level, floor) => {
  const max = (LITTLE_LEVELS[gameId]?.length || 1) - 1;
  return Math.min(max, Math.max(floor, Number.isInteger(level) ? level : floor));
};

export const getLittleLevel = (playerId, gameId, bigKid, storage = canUseStorage()) => {
  const floor = startLevelFor(bigKid);
  return clampLevel(gameId, read(storage, playerId)[gameId]?.level ?? floor, floor);
};

// Three stars opens the next level. A difficult play never erases a level the
// child has already reached; they can practise and try again.
export const recordLittleResult = (playerId, gameId, bigKid, stars, storage = canUseStorage()) => {
  const floor = startLevelFor(bigKid);
  const all = read(storage, playerId);
  const current = clampLevel(gameId, all[gameId]?.level ?? floor, floor);
  const next = clampLevel(gameId, stars >= 3 ? current + 1 : current, floor);
  const entry = { level: next, plays: (all[gameId]?.plays || 0) + 1, best: Math.max(all[gameId]?.best || 0, stars) };
  try {
    storage?.setItem(storageKey(playerId), JSON.stringify({ ...all, [gameId]: entry }));
  } catch {
    // Progress is a nicety; private browsing may block storage.
  }
  return { previous: current, level: next, levelUp: next > current, levelDown: next < current };
};
