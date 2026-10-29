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
    const record = raw === null ? {} : JSON.parse(raw);
    if (!isPlainRecord(record)) return { ok: false, reason: 'record-invalid', level: floor };
    const entry = record[gameId];
    if (entry !== undefined && (!isPlainRecord(entry)
      || !Number.isInteger(entry.level) || entry.level < 0 || entry.level > max
      || !Number.isInteger(entry.plays) || entry.plays < 0
      || !Number.isInteger(entry.best) || entry.best < 0 || entry.best > 3)) {
      return { ok: false, reason: 'game-record-invalid', level: floor };
    }
    const pairMetadata = ['pairBestByLevel', 'pairTransactionId', 'pairPreviousLevel', 'pairLevelUp', 'pairRewardPoints', 'pairLegacyRewardThrough', 'pairRewardReceipts'];
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
    if (hasPairMetadata && entry.pairRewardReceipts !== undefined && (gameId !== 'shadowmatch' || !Array.isArray(entry.pairRewardReceipts)
      || entry.pairRewardReceipts.some((receipt) => {
        const match = isPlainRecord(receipt) && typeof receipt.id === 'string'
          ? /^shadowmatch:level-(\d+):best-([1-3])$/.exec(receipt.id)
          : null;
        return !isPlainRecord(receipt) || !match
          || !Number.isInteger(receipt.level) || receipt.level < 0 || receipt.level > max
          || Number(match[1]) - 1 !== receipt.level || receipt.level > entry.level
          || receipt.level <= (entry.pairLegacyRewardThrough ?? -1)
          || (entry.pairBestByLevel?.[receipt.level] || 0) < Number(match[2])
          || !Number.isInteger(receipt.points) || receipt.points < 2 || receipt.points > (Number(match[2]) * 2 + 2) || receipt.points % 2 !== 0
          || typeof receipt.claimed !== 'boolean';
      })
      || new Set(entry.pairRewardReceipts.map((receipt) => receipt.id)).size !== entry.pairRewardReceipts.length
      || Object.entries(entry.pairRewardReceipts.reduce((totals, receipt) => {
        totals[receipt.level] = (totals[receipt.level] || 0) + receipt.points;
        return totals;
      }, {})).some(([index, points]) => points > 2 * (entry.pairBestByLevel[index] || 0) + 2))) {
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
  if (!['rocketbuilder', 'fuelup', 'firerescue', 'ladder', 'dino', 'dinojigsaw', 'shadowmatch'].includes(gameId)) return { ok: false, reason: 'game-not-in-pair' };
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
    const recoveredReceipt = oldEntry.pairRewardReceipts?.find((receipt) => receipt.id === `${gameId}:level-${oldEntry.pairPlayedLevel + 1}:best-${oldEntry.pairBestByLevel?.[oldEntry.pairPlayedLevel]}`) || null;
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
      rewardReceipt: recoveredReceipt,
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
  const receiptId = `${gameId}:level-${runLevel + 1}:best-${stars}`;
  const receipts = Array.isArray(oldEntry.pairRewardReceipts) ? oldEntry.pairRewardReceipts : [];
  const rewardReceipt = gameId === 'shadowmatch' && rewardPoints > 0
    ? (receipts.find((receipt) => receipt.id === receiptId) || { id: receiptId, level: runLevel, points: rewardPoints, claimed: false })
    : null;
  const nextReceipts = rewardReceipt && !receipts.some((receipt) => receipt.id === receiptId) ? [...receipts, rewardReceipt] : receipts;
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
    ...(gameId === 'shadowmatch' ? { pairRewardReceipts: nextReceipts } : {}),
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
  return { ok: true, recovered: false, previous, level, playedLevel: runLevel, levelUp: level > previous, plays: entry.plays, best: entry.best, rewardPoints, rewardReceipt };
};

export const getPendingPairLittleRewardReceipts = (playerId, gameId, bigKid, storage = getPairLittleStorage()) => {
  const loaded = readPairLittleProgress(playerId, gameId, bigKid, storage);
  if (!loaded.ok) return { ...loaded, receipts: [] };
  return { ...loaded, receipts: (loaded.gameRecord?.pairRewardReceipts || []).filter((receipt) => !receipt.claimed) };
};

export const markPairLittleRewardReceiptClaimed = (playerId, gameId, bigKid, receiptId, storage = getPairLittleStorage()) => {
  if (gameId !== 'shadowmatch' || typeof receiptId !== 'string' || !receiptId) return { ok: false, reason: 'receipt-invalid' };
  const before = readPairLittleProgress(playerId, gameId, bigKid, storage);
  if (!before.ok) return before;
  const entry = before.gameRecord;
  const index = entry?.pairRewardReceipts?.findIndex((receipt) => receipt.id === receiptId) ?? -1;
  if (index < 0) return { ok: false, reason: 'receipt-missing' };
  const receipts = entry.pairRewardReceipts.map((receipt) => receipt.id === receiptId ? { ...receipt, claimed: true } : receipt);
  const nextRecord = { ...before.record, [gameId]: { ...entry, pairRewardReceipts: receipts } };
  let encoded;
  try { encoded = JSON.stringify(nextRecord); storage.setItem(progressKey(playerId), encoded); }
  catch { return { ok: false, reason: 'write-failed' }; }
  const after = readPairLittleProgress(playerId, gameId, bigKid, storage);
  if (!after.ok || JSON.stringify(after.record) !== encoded || !after.gameRecord?.pairRewardReceipts?.some((receipt) => receipt.id === receiptId && receipt.claimed)) {
    return { ok: false, reason: 'readback-failed' };
  }
  return { ok: true, gameRecord: after.gameRecord, record: after.record };
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
