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
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

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

export const getEarnedChapterBadgeIds = (playerId, gameId, storage = defaultStorage()) => {
  const root = readRoot(storage);
  const earned = new Set(readEarnedIds(root, playerId, gameId));
  return (BADGES_BY_GAME[gameId] || []).filter((badge) => earned.has(badge.id)).map((badge) => badge.id);
};

// Call only from the shared level-completion handler. Unlocking a level does
// not grant its badge; each id is added after that chapter is actually finished.
export const awardChapterBadge = (playerId, gameId, levelIndex, storage = defaultStorage()) => {
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

const inspectStrictRoot = (storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  let raw;
  try { raw = storage.getItem(CHAPTER_BADGE_STORAGE_KEY); } catch { return { status: 'unavailable' }; }
  if (raw === null) return { status: 'empty', root: { version: 1, players: {} }, raw };
  if (typeof raw !== 'string') return { status: 'invalid' };
  try {
    const root = JSON.parse(raw);
    return isRecord(root) && root.version === 1 && isRecord(root.players)
      ? { status: 'record', root, raw } : { status: 'invalid' };
  } catch { return { status: 'invalid' }; }
};

const inspectStrictGame = (root, playerId, gameId) => {
  if (typeof gameId !== 'string' || !Object.hasOwn(BADGES_BY_GAME, gameId)) return null;
  const player = Object.hasOwn(root.players, childKey(playerId)) ? root.players[childKey(playerId)] : {};
  if (!isRecord(player) || (player.games !== undefined && !isRecord(player.games))) return null;
  const games = player.games || {};
  const game = Object.hasOwn(games, gameId) ? games[gameId] : {};
  if (!isRecord(game) || (game.earnedChapterIds !== undefined
    && (!Array.isArray(game.earnedChapterIds) || game.earnedChapterIds.some((id) => typeof id !== 'string')))) return null;
  return { player, games, game, ids: game.earnedChapterIds || [] };
};

// New finite lessons must distinguish unreadable storage from a fresh shelf.
// The historical API above remains compatible with already-shipped callers.
export const inspectChapterBadges = (playerId, gameId, storage = defaultStorage()) => {
  const result = inspectStrictRoot(storage);
  if (!['empty', 'record'].includes(result.status)) return { status: result.status, earnedChapterIds: [] };
  if (!inspectStrictGame(result.root, playerId, gameId)) return { status: 'invalid', earnedChapterIds: [] };
  return { status: result.status, earnedChapterIds: readEarnedIds(result.root, playerId, gameId) };
};

export const saveChapterBadgeStrict = (playerId, gameId, levelIndex, storage = defaultStorage()) => {
  const badge = typeof gameId === 'string' && Object.hasOwn(BADGES_BY_GAME, gameId)
    ? BADGES_BY_GAME[gameId].find((item) => item.levelIndex === levelIndex) : null;
  if (!badge) return { status: 'invalid' };
  const result = inspectStrictRoot(storage);
  if (!['empty', 'record'].includes(result.status)) return { status: result.status };
  const current = inspectStrictGame(result.root, playerId, gameId);
  if (!current) return { status: 'invalid' };
  if (!storage || typeof storage.setItem !== 'function') return { status: 'unavailable' };
  const wasEarned = current.ids.includes(badge.id);
  const ids = wasEarned ? current.ids : [...current.ids, badge.id];
  const next = {
    ...result.root,
    players: {
      ...result.root.players,
      [childKey(playerId)]: {
        ...current.player,
        games: { ...current.games, [gameId]: { ...current.game, earnedChapterIds: ids } },
      },
    },
  };
  // Confirm an existing badge without rewriting unrelated data or whitespace.
  const encoded = wasEarned ? result.raw : JSON.stringify(next);
  try {
    if (!wasEarned) storage.setItem(CHAPTER_BADGE_STORAGE_KEY, encoded);
    if (storage.getItem(CHAPTER_BADGE_STORAGE_KEY) !== encoded) throw Error('Badge readback failed');
    return { status: 'saved', badge, earnedChapterIds: readEarnedIds(next, playerId, gameId), newlyEarned: !wasEarned };
  } catch {
    return { status: 'unconfirmed', badge, earnedChapterIds: readEarnedIds(result.root, playerId, gameId), newlyEarned: false };
  }
};
