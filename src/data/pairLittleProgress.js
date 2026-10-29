import { LITTLE_LEVELS } from './littleGames.js';
import { startLevelFor } from './littleProgress.js';

const progressKey = (playerId) => `${playerId || 'askia'}_little_progress`;
const isPlainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

// Access the browser storage getter only inside the guarded function. This is
// passed explicitly to every pair-scoped read/write so a SecurityError cannot
// escape through a default parameter before our error handling runs.
export const getPairLittleStorage = () => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

const readRawRecord = (playerId, gameId, bigKid, storage) => {
  const floor = startLevelFor(bigKid);
  const max = Math.max(0, (LITTLE_LEVELS[gameId]?.length || 1) - 1);
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, reason: 'storage-unavailable', level: floor };
  try {
    const raw = storage.getItem(progressKey(playerId));
    const record = raw == null ? {} : JSON.parse(raw);
    if (!isPlainRecord(record)) return { ok: false, reason: 'record-invalid', level: floor };
    const entry = record[gameId];
    if (entry !== undefined && (!isPlainRecord(entry)
      || !Number.isInteger(entry.level) || entry.level < 0 || entry.level > max
      || !Number.isInteger(entry.plays) || entry.plays < 0
      || !Number.isInteger(entry.best) || entry.best < 0 || entry.best > 3)) {
      return { ok: false, reason: 'game-record-invalid', level: floor };
    }
    const pairMetadata = ['pairBestByLevel', 'pairTransactionId', 'pairPreviousLevel', 'pairLevelUp', 'pairRewardPoints', 'pairLegacyRewardThrough'];
    const hasPairMetadata = entry && pairMetadata.some((key) => Object.hasOwn(entry, key));
    if (hasPairMetadata && (!isPlainRecord(entry.pairBestByLevel)
      || Object.entries(entry.pairBestByLevel).some(([index, best]) => !/^\d+$/.test(index)
        || Number(index) > max || !Number.isInteger(best) || best < 0 || best > 3))) {
      return { ok: false, reason: 'game-record-invalid', level: floor };
    }
    if (hasPairMetadata && (typeof entry.pairTransactionId !== 'string' || !entry.pairTransactionId
      || !Number.isInteger(entry.pairPreviousLevel) || entry.pairPreviousLevel < 0 || entry.pairPreviousLevel > max
      || !Number.isInteger(entry.pairPlayedLevel) || entry.pairPlayedLevel < 0 || entry.pairPlayedLevel > entry.pairPreviousLevel
      || typeof entry.pairLevelUp !== 'boolean'
      || !Number.isInteger(entry.pairRewardPoints) || entry.pairRewardPoints < 0 || entry.pairRewardPoints > 8
      || (entry.pairLegacyRewardThrough !== undefined
        && (!Number.isInteger(entry.pairLegacyRewardThrough) || entry.pairLegacyRewardThrough < -1 || entry.pairLegacyRewardThrough > max)))) {
      return { ok: false, reason: 'game-record-invalid', level: floor };
    }
    return {
      ok: true,
      record,
      gameRecord: entry || null,
      level: entry?.level ?? floor,
    };
  } catch {
    return { ok: false, reason: 'record-unreadable', level: floor };
  }
};

export const readPairLittleProgress = (playerId, gameId, bigKid, storage = getPairLittleStorage()) => (
  readRawRecord(playerId, gameId, bigKid, storage)
);

export const commitPairLittleResult = ({ playerId, gameId, bigKid, stars, transactionId, expectedLevel, playedLevel, storage = getPairLittleStorage() }) => {
  if (!['rocketbuilder', 'fuelup', 'firerescue', 'ladder', 'dino'].includes(gameId)) return { ok: false, reason: 'game-not-in-pair' };
  if (!Number.isInteger(stars) || stars < 1 || stars > 3 || typeof transactionId !== 'string' || !transactionId) {
    return { ok: false, reason: 'result-invalid' };
  }
  const before = readRawRecord(playerId, gameId, bigKid, storage);
  if (!before.ok) return before;
  const previous = before.level;
  const oldEntry = before.gameRecord || { level: previous, plays: 0, best: 0 };

  // Recover the same pending result after a write succeeded but its readback
  // failed. The shell keeps the transaction id while showing Retry.
  if (oldEntry.pairTransactionId === transactionId) {
    return {
      ok: true,
      recovered: true,
      previous: oldEntry.pairPreviousLevel ?? previous,
      level: oldEntry.level,
      levelUp: oldEntry.pairLevelUp ?? false,
      plays: oldEntry.plays,
      best: oldEntry.best,
      rewardPoints: oldEntry.pairRewardPoints ?? 0,
      playedLevel: oldEntry.pairPlayedLevel,
    };
  }
  if (Number.isInteger(expectedLevel) && before.level < expectedLevel) {
    return { ok: false, reason: 'level-changed', level: before.level };
  }

  const max = Math.max(0, (LITTLE_LEVELS[gameId]?.length || 1) - 1);
  const runLevel = Number.isInteger(playedLevel) ? playedLevel : previous;
  if (runLevel < 0 || runLevel > previous || runLevel > max) return { ok: false, reason: 'level-locked', level: previous };
  const level = Math.min(max, stars >= 3 && runLevel === previous ? previous + 1 : previous);
  const levelBests = isPlainRecord(oldEntry.pairBestByLevel) ? oldEntry.pairBestByLevel : {};
  // Older saves have only a game-wide best and highest unlocked level. That
  // does not prove which legacy levels were individually mastered or paid,
  // so hold replay rewards through the saved high-water level. Carry this
  // ceiling forward permanently while allowing levels unlocked after this
  // migration to earn the normal per-level improvement delta.
  const legacyRewardThrough = Number.isInteger(oldEntry.pairLegacyRewardThrough)
    ? oldEntry.pairLegacyRewardThrough
    : (before.gameRecord && !isPlainRecord(oldEntry.pairBestByLevel) ? oldEntry.level : -1);
  const previousBestAtLevel = Number.isInteger(levelBests[runLevel]) ? levelBests[runLevel] : 0;
  const rewardBaseline = runLevel <= legacyRewardThrough ? 3 : previousBestAtLevel;
  const rewardPoints = Math.max(0, (stars * 2 + 2) - (rewardBaseline ? rewardBaseline * 2 + 2 : 0));
  const entry = {
    ...oldEntry,
    level,
    plays: oldEntry.plays + 1,
    best: Math.max(oldEntry.best, stars),
    pairBestByLevel: { ...levelBests, [runLevel]: Math.max(previousBestAtLevel, stars) },
    pairTransactionId: transactionId,
    pairPreviousLevel: previous,
    pairPlayedLevel: runLevel,
    pairLevelUp: level > previous,
    pairRewardPoints: rewardPoints,
    pairLegacyRewardThrough: legacyRewardThrough,
  };
  const nextRecord = { ...before.record, [gameId]: entry };
  let encoded;
  try {
    encoded = JSON.stringify(nextRecord);
    storage.setItem(progressKey(playerId), encoded);
  } catch {
    return { ok: false, reason: 'write-failed', level: previous };
  }

  const after = readRawRecord(playerId, gameId, bigKid, storage);
  if (!after.ok || JSON.stringify(after.record) !== encoded || after.gameRecord?.pairTransactionId !== transactionId) {
    return { ok: false, reason: 'readback-failed', level: previous };
  }
  return { ok: true, recovered: false, previous, level, playedLevel: runLevel, levelUp: level > previous, plays: entry.plays, best: entry.best, rewardPoints };
};

export const pairLittleProgressKey = progressKey;

export const activePairLevelAfterResult = (saved) => (
  !saved?.levelUp && Number.isInteger(saved?.playedLevel) ? saved.playedLevel : saved?.level
);

export const pairRunActionLabel = (selectedLevel, result) => (
  result?.levelUp && selectedLevel === result.level
    ? `Next level ${selectedLevel + 1}`
    : `Play level ${selectedLevel + 1}`
);
