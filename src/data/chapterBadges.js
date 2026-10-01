export const CHAPTER_BADGE_STORAGE_KEY = 'amari_chapter_badges_v1';

export const LETTER_LAUNCH_CHAPTER_BADGES = Object.freeze([
  Object.freeze({
    id: 'letters-sound-scout',
    gameId: 'letters',
    levelIndex: 0,
    name: 'Sound Scout',
    description: 'You listened for the first sound and found its letter.',
    mark: 'S',
    accent: 'from-cyan-300 to-sky-500',
  }),
  Object.freeze({
    id: 'letters-first-sound-finder',
    gameId: 'letters',
    levelIndex: 1,
    name: 'First Sound Finder',
    description: 'You found the first sound in a new word.',
    mark: '🔎',
    accent: 'from-lime-300 to-emerald-500',
  }),
  Object.freeze({
    id: 'letters-letter-match-maker',
    gameId: 'letters',
    levelIndex: 2,
    name: 'Letter Match Maker',
    description: 'You matched little letters with their capitals.',
    mark: 'Aa',
    accent: 'from-amber-300 to-orange-500',
  }),
  Object.freeze({
    id: 'letters-cvc-blender',
    gameId: 'letters',
    levelIndex: 3,
    name: 'CVC Word Builder',
    description: 'You blended three sounds to build a word.',
    mark: 'CAT',
    accent: 'from-fuchsia-300 to-violet-500',
  }),
]);

const BADGES_BY_GAME = Object.freeze({
  letters: LETTER_LAUNCH_CHAPTER_BADGES,
});

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const childKey = (playerId) => typeof playerId === 'string' && playerId.trim() ? playerId.trim() : 'amari';

const readRoot = (storage) => {
  try {
    const value = JSON.parse(storage?.getItem(CHAPTER_BADGE_STORAGE_KEY) || 'null');
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.players)) return { version: 1, players: {} };
    return value;
  } catch {
    return { version: 1, players: {} };
  }
};

const readEarnedIds = (root, playerId, gameId) => {
  const validIds = new Set((BADGES_BY_GAME[gameId] || []).map((badge) => badge.id));
  const game = root.players?.[childKey(playerId)]?.games?.[gameId];
  const stored = isRecord(game) && Array.isArray(game.earnedChapterIds) ? game.earnedChapterIds : [];
  return [...new Set(stored.filter((id) => typeof id === 'string' && validIds.has(id)))];
};

export const getEarnedChapterBadgeIds = (playerId, gameId, storage = globalThis.localStorage) => {
  const root = readRoot(storage);
  const earned = new Set(readEarnedIds(root, playerId, gameId));
  return (BADGES_BY_GAME[gameId] || []).filter((badge) => earned.has(badge.id)).map((badge) => badge.id);
};

// Call only from the shared level-completion handler. Unlocking a level does
// not grant its badge; each id is added after that chapter is actually finished.
export const awardChapterBadge = (playerId, gameId, levelIndex, storage = globalThis.localStorage) => {
  const badge = (BADGES_BY_GAME[gameId] || []).find((entry) => entry.levelIndex === levelIndex);
  if (!badge) return null;

  const root = readRoot(storage);
  const playerIdKey = childKey(playerId);
  const currentIds = readEarnedIds(root, playerIdKey, gameId);
  const wasEarned = currentIds.includes(badge.id);
  const earnedChapterIds = wasEarned ? currentIds : [...currentIds, badge.id];
  const players = { ...root.players };
  const player = isRecord(players[playerIdKey]) ? players[playerIdKey] : {};
  const games = isRecord(player.games) ? player.games : {};

  players[playerIdKey] = {
    ...player,
    games: {
      ...games,
      [gameId]: { earnedChapterIds },
    },
  };

  try {
    storage?.setItem(CHAPTER_BADGE_STORAGE_KEY, JSON.stringify({ version: 1, players }));
  } catch {
    // The reward still appears in this completion screen if storage is blocked.
  }

  const orderedIds = new Set(earnedChapterIds);
  return {
    badge,
    earnedChapterIds: (BADGES_BY_GAME[gameId] || []).filter((entry) => orderedIds.has(entry.id)).map((entry) => entry.id),
    newlyEarned: !wasEarned,
  };
};

export const getChapterBadgesForGame = (gameId) => BADGES_BY_GAME[gameId] || [];
