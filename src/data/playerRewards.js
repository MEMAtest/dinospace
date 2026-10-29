// One synchronous reward record prevents a stale open tab from replacing
// newer stars/stickers with its old React state. Legacy keys remain readable.
import { STICKERS } from './index.js';
import { playerStorageKey } from './players.js';

export const rewardKey = (playerId) => playerStorageKey(playerId, 'rewards_v2');
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const count = (value) => Number.isFinite(value) && value >= 0 ? value : 0;
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const plainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const validClaim = (key, amount) => typeof key === 'string' && /^(dino|hangman|words|storybooks|chess|dinojigsaw):[a-z0-9:_-]{1,160}$/i.test(key)
  && Number.isInteger(amount) && amount > 0 && amount <= 12;
// The previous public release preserves the dino namespace on ordinary writes.
// Keep these new game receipts inside reserved subnamespaces so an older open
// tab cannot discard them. Game counts and rewards remain attributed to the
// actual game. The short-lived unshipped token formats normalize on commit.
export const rewardClaimToken = (gameId, receiptId) => (
  gameId === 'chess' ? `dino:chess:${receiptId}`
    : gameId === 'dinojigsaw' ? `dino:jigsaw:${receiptId}`
      : gameId === 'german' ? `dino:german:${receiptId}`
        : gameId === 'worldmap' ? `dino:curriculum:${receiptId}`
          : gameId === 'letters' ? `dino:letters:${receiptId}` : `${gameId}:${receiptId}`
);
const normalizeClaimToken = (key) => {
  const alias = key.match(/^(chess|dinojigsaw):/i);
  if (alias) return rewardClaimToken(alias[1].toLowerCase(), key.slice(alias[0].length));
  const reserved = key.match(/^dino:(chess|jigsaw|german|curriculum|letters):/i);
  if (reserved) return `dino:${reserved[1].toLowerCase()}:${key.slice(reserved[0].length)}`;
  return key;
};
const claimGame = (key) => key.startsWith('dino:chess:') ? 'chess'
  : key.startsWith('dino:jigsaw:') ? 'dinojigsaw'
    : key.startsWith('dino:german:') ? 'german'
      : key.startsWith('dino:curriculum:') ? 'worldmap'
        : key.startsWith('dino:letters:') ? 'letters' : key.split(':')[0];
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
  const rewardClaims = {};
  for (const value of values) for (const [key, amount] of Object.entries(record(value?.rewardClaims))) {
    if (validClaim(key, amount)) {
      const compatibleKey = normalizeClaimToken(key);
      rewardClaims[compatibleKey] = Math.max(rewardClaims[compatibleKey] || 0, amount);
    }
  }
  return {
    version: 2, points, gamesPlayed,
    earnedStickerIds: [...new Set([...ids.filter((id) => validIds.has(id)), ...STICKERS.filter((sticker) => points >= sticker.points).map(({ id }) => id)])],
    ...(Object.keys(rewardClaims).length ? { rewardClaims } : {}),
  };
};
export const readPlayerRewards = (playerId, storage = defaultStorage()) => mergeRewards(
  read(storage, rewardKey(playerId), {}),
  {
    points: read(storage, playerStorageKey(playerId, 'points'), 0),
    earnedStickerIds: read(storage, playerStorageKey(playerId, 'earned_sticker_ids_v1'), []),
    gamesPlayed: read(storage, playerStorageKey(playerId, 'games_played'), {}),
  },
);

const writeMirrors = (playerId, next, storage) => {
  for (const [key, value] of [['points', next.points], ['earned_sticker_ids_v1', next.earnedStickerIds], ['games_played', next.gamesPlayed]]) {
    try { storage.setItem(playerStorageKey(playerId, key), JSON.stringify(value)); } catch { /* authoritative record is already saved */ }
  }
};

// Only opted-in lessons use claims. A claim is stored in the same authoritative
// record as its points, so a committed-but-unconfirmed award can be recovered
// after Back/reload without paying twice. Other callers keep their old API.
const commitClaimedReward = (playerId, current, amount, gameId, storage, rewardToken) => {
  const before = mergeRewards(readPlayerRewards(playerId, storage), current);
  const failed = (error) => ({ ...before, persisted: false, awardedPoints: 0, recovered: false, error });
  if (typeof rewardToken !== 'string') return failed('Reward claim is invalid.');
  rewardToken = normalizeClaimToken(rewardToken);
  if (!['dino', 'hangman', 'words', 'storybooks', 'chess', 'dinojigsaw', 'german', 'worldmap', 'letters'].includes(gameId) || claimGame(rewardToken) !== gameId || !validClaim(rewardToken, amount)) return failed('Reward claim is invalid.');
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return failed('Reward storage is unavailable.');
  let canonical, canonicalRaw;
  try {
    const raw = storage.getItem(rewardKey(playerId));
    canonicalRaw = raw;
    canonical = raw === null ? {} : JSON.parse(raw);
    if (!plainRecord(canonical) || (raw !== null && (canonical.version !== 2
      || !Number.isFinite(canonical.points) || canonical.points < 0
      || !plainRecord(canonical.gamesPlayed) || Object.values(canonical.gamesPlayed).some(value => !Number.isFinite(value) || value < 0)
      || !Array.isArray(canonical.earnedStickerIds) || canonical.earnedStickerIds.some(id => typeof id !== 'string')))) throw Error('Invalid reward record');
    if (canonical.rewardClaims !== undefined && (!plainRecord(canonical.rewardClaims)
      || Object.entries(canonical.rewardClaims).some(([key, value]) => !validClaim(key, value)))) throw Error('Invalid reward claims');
    for (const [name, valid] of [
      ['points', value => Number.isFinite(value) && value >= 0],
      ['earned_sticker_ids_v1', value => Array.isArray(value) && value.every(id => typeof id === 'string')],
      ['games_played', value => plainRecord(value) && Object.values(value).every(n => Number.isFinite(n) && n >= 0)],
    ]) {
      const legacy = storage.getItem(playerStorageKey(playerId, name));
      if (legacy !== null && !valid(JSON.parse(legacy))) throw Error('Invalid legacy reward record');
    }
  } catch { return failed('Saved rewards could not be read safely.'); }
  const claims = before.rewardClaims || {};
  if (claims[rewardToken] !== undefined) {
    if (claims[rewardToken] !== amount) return failed('Reward claim does not match the saved award.');
    try {
      const encoded = JSON.stringify({ ...canonical, ...before });
      if (canonicalRaw !== encoded) storage.setItem(rewardKey(playerId), encoded);
      if (storage.getItem(rewardKey(playerId)) !== encoded) throw Error('Reward recovery readback failed');
    } catch { return failed('Saved reward claim could not be confirmed.'); }
    writeMirrors(playerId, before, storage);
    return { ...before, persisted: true, awardedPoints: 0, recovered: true };
  }
  const next = { ...canonical, ...mergeRewards({ ...before,
    points: before.points + amount,
    gamesPlayed: { ...before.gamesPlayed, [gameId]: (before.gamesPlayed[gameId] || 0) + 1 },
    rewardClaims: { ...claims, [rewardToken]: amount },
  }) };
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(rewardKey(playerId), encoded);
    if (storage.getItem(rewardKey(playerId)) !== encoded) throw Error('Reward readback failed');
  } catch { return failed('Earned rewards could not be confirmed. Retry this result.'); }
  writeMirrors(playerId, next, storage);
  return { ...next, persisted: true, awardedPoints: amount, recovered: false };
};

export const commitPlayerReward = (playerId, current, amount, gameId, storage = defaultStorage(), { rewardToken } = {}) => {
  if (rewardToken !== undefined) return commitClaimedReward(playerId, current, amount, gameId, storage, rewardToken);
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
    writeMirrors(playerId, next, storage);
  }
  return { ...next, persisted };
};
