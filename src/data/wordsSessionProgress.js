export const WORDS_SESSION_PROGRESS_KEY = 'amari_words_session_progress_v1';
const LEVEL_COUNT = 6;
const ZERO_RECEIPT_LIMIT = 16;
const safePlayer = (playerId) => String(playerId || 'amari').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'amari';
const canonicalKey = (playerId) => `${WORDS_SESSION_PROGRESS_KEY}:${safePlayer(playerId)}`;
const legacyKey = (playerId) => `${safePlayer(playerId)}_game_levels_v1`;
const plainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const validLevel = (value) => Number.isInteger(value) && value >= 0 && value < LEVEL_COUNT;
const validPoints = (value) => value === 2 || value === 4 || value === 6;
const emptyProgress = () => ({
  version: 1,
  currentLevel: 0,
  unlockedLevel: 0,
  completedLevels: [],
  bestPointsByLevel: Object.fromEntries(Array.from({ length: LEVEL_COUNT }, (_, index) => [index, 0])),
  legacyRewardThrough: -1,
  transactions: {},
  unknownCanonical: {},
});

function getStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

function parseRaw(raw) {
  if (raw === null) return { ok: true, value: {} };
  if (typeof raw !== 'string') return { ok: false, value: {} };
  try {
    const value = JSON.parse(raw);
    return plainRecord(value) ? { ok: true, value } : { ok: false, value: {} };
  } catch {
    return { ok: false, value: {} };
  }
}

function validCompletedPrefix(levels) {
  if (!Array.isArray(levels) || levels.some((level) => !validLevel(level)) || new Set(levels).size !== levels.length) return false;
  const sorted = [...levels].sort((a, b) => a - b);
  return sorted.every((level, index) => level === index);
}

function normalizeTransactions(value, completedLevels, bestPointsByLevel) {
  if (!plainRecord(value)) return null;
  const entries = Object.entries(value);
  const totalsByLevel = Array(LEVEL_COUNT).fill(0);
  for (const [transactionId, entry] of entries) {
    if (!/^[a-zA-Z0-9:_-]{1,120}$/.test(transactionId) || !plainRecord(entry)
      || !validLevel(entry.levelIndex) || !validPoints(entry.points)
      || ![0, 2, 4, 6].includes(entry.rewardDelta)
      || entry.rewardDelta > entry.points
      || typeof entry.newlyCompleted !== 'boolean'
      || !completedLevels.includes(entry.levelIndex)
      || bestPointsByLevel[entry.levelIndex] < entry.points) return null;
    totalsByLevel[entry.levelIndex] += entry.rewardDelta;
    if (totalsByLevel[entry.levelIndex] > 6) return null;
  }
  const positive = entries.filter(([, entry]) => entry.rewardDelta > 0);
  const zero = entries.filter(([, entry]) => entry.rewardDelta === 0).slice(-ZERO_RECEIPT_LIMIT);
  return Object.fromEntries([...positive, ...zero]);
}

function normalizeCanonical(value) {
  if (!plainRecord(value) || value.version !== 1 || !validLevel(value.currentLevel) || !validLevel(value.unlockedLevel)
    || value.currentLevel > value.unlockedLevel || !validCompletedPrefix(value.completedLevels)
    || value.unlockedLevel !== Math.min(LEVEL_COUNT - 1, value.completedLevels.length)
    || value.completedLevels.some((level) => level > value.unlockedLevel)
    || !plainRecord(value.bestPointsByLevel)
    || !Number.isInteger(value.legacyRewardThrough) || value.legacyRewardThrough < -1 || value.legacyRewardThrough >= LEVEL_COUNT
    || !Object.keys(value.bestPointsByLevel).every((key) => /^[0-5]$/.test(key) && Number.isInteger(Number(key)))) return null;

  const bestPointsByLevel = Object.fromEntries(Array.from({ length: LEVEL_COUNT }, (_, index) => {
    const score = Object.hasOwn(value.bestPointsByLevel, index) ? value.bestPointsByLevel[index] : 0;
    return [index, [0, 2, 4, 6].includes(score) ? score : null];
  }));
  if (Object.values(bestPointsByLevel).some((score) => score === null)) return null;
  for (let index = 0; index < LEVEL_COUNT; index += 1) {
    if (bestPointsByLevel[index] > 0 && !value.completedLevels.includes(index)) return null;
  }

  const transactions = normalizeTransactions(value.transactions, value.completedLevels, bestPointsByLevel);
  if (!transactions) return null;
  const knownKeys = new Set(['version', 'currentLevel', 'unlockedLevel', 'completedLevels', 'bestPointsByLevel', 'legacyRewardThrough', 'transactions']);
  return {
    version: 1,
    currentLevel: value.currentLevel,
    unlockedLevel: value.unlockedLevel,
    completedLevels: [...value.completedLevels],
    bestPointsByLevel,
    legacyRewardThrough: value.legacyRewardThrough,
    transactions,
    unknownCanonical: Object.fromEntries(Object.entries(value).filter(([key]) => !knownKeys.has(key))),
  };
}

function parseLegacy(legacyValue) {
  if (!plainRecord(legacyValue)) return null;
  if (!Object.hasOwn(legacyValue, 'words')) return { current: 0, unlocked: 0, exists: false };
  const words = legacyValue.words;
  if (!plainRecord(words) || !validLevel(words.current) || !validLevel(words.unlocked) || words.current > words.unlocked) return null;
  return { current: words.current, unlocked: words.unlocked, exists: true };
}

function fromLegacy(legacy, canonical) {
  const progress = canonical || emptyProgress();
  if (!legacy.exists) return progress;
  const completedLevels = [...new Set([...progress.completedLevels, ...Array.from({ length: legacy.unlocked }, (_, index) => index)])].sort((a, b) => a - b);
  const unlockedLevel = Math.min(LEVEL_COUNT - 1, Math.max(progress.unlockedLevel, legacy.unlocked, completedLevels.length));
  return {
    ...progress,
    currentLevel: canonical ? Math.min(progress.currentLevel, unlockedLevel) : Math.min(legacy.current, unlockedLevel),
    unlockedLevel,
    completedLevels,
    legacyRewardThrough: Math.max(progress.legacyRewardThrough, legacy.unlocked),
  };
}

function result(ok, status, progress, error = null) {
  return { ok, status, progress, error };
}

export function readWordsSessionProgress(playerId = 'amari', storage = getStorage()) {
  const blank = emptyProgress();
  if (!storage) return result(false, 'unavailable', blank, 'Saved spelling stage progress is unavailable.');
  let canonicalRaw;
  let legacyRaw;
  try {
    canonicalRaw = storage.getItem(canonicalKey(playerId));
    legacyRaw = storage.getItem(legacyKey(playerId));
  } catch {
    return result(false, 'unreadable', blank, 'Saved spelling stage progress could not be read safely.');
  }
  const canonicalParsed = parseRaw(canonicalRaw);
  const legacyParsed = parseRaw(legacyRaw);
  if (!canonicalParsed.ok || !legacyParsed.ok) return result(false, 'invalid', blank, 'Saved spelling stage progress could not be checked safely.');
  const legacy = parseLegacy(legacyParsed.value);
  if (!legacy) return result(false, 'invalid', blank, 'Saved legacy spelling stage progress is malformed.');
  const canonical = canonicalRaw === null ? null : normalizeCanonical(canonicalParsed.value);
  if (canonicalRaw !== null && !canonical) return result(false, 'invalid', blank, 'Saved spelling stage progress is malformed.');
  const progress = fromLegacy(legacy, canonical);
  const status = canonical ? 'ready' : legacy.exists ? 'legacy' : 'fresh';
  return result(true, status, progress);
}

export function commitWordsSessionLevel(playerId, levelIndex, points, attemptId, storage = getStorage()) {
  const read = readWordsSessionProgress(playerId, storage);
  if (!validLevel(levelIndex)) return { ...read, ok: false, status: 'invalid', rewardDelta: 0, error: 'Unknown spelling stage.' };
  if (!validPoints(points)) return { ...read, ok: false, status: 'invalid', rewardDelta: 0, error: 'Spelling stage points must be 2, 4 or 6.' };
  if (typeof attemptId !== 'string' || !/^[a-zA-Z0-9:_-]{1,120}$/.test(attemptId)) return { ...read, ok: false, status: 'invalid', rewardDelta: 0, error: 'A stable spelling stage attempt id is required.' };
  if (!read.ok) return { ...read, rewardDelta: 0, transactionId: attemptId };
  const previous = read.progress;
  if (levelIndex > previous.unlockedLevel) return { ...read, ok: false, status: 'locked', rewardDelta: 0, transactionId: attemptId, error: 'Complete the earlier spelling stages first.' };

  const priorTransaction = previous.transactions[attemptId];
  if (priorTransaction) {
    if (priorTransaction.levelIndex !== levelIndex || priorTransaction.points !== points) {
      return { ...read, ok: false, status: 'invalid', rewardDelta: 0, transactionId: attemptId, error: 'This Retry does not match the saved spelling stage result.' };
    }
    return { ...read, ok: true, status: 'recovered', transactionId: attemptId, rewardDelta: priorTransaction.rewardDelta, recovered: true };
  }

  const oldBest = previous.bestPointsByLevel[levelIndex] || 0;
  const bestPointsByLevel = { ...previous.bestPointsByLevel, [levelIndex]: Math.max(oldBest, points) };
  const completedLevels = [...new Set([...previous.completedLevels, levelIndex])].sort((a, b) => a - b);
  const unlockedLevel = Math.min(LEVEL_COUNT - 1, Math.max(previous.unlockedLevel, completedLevels.length));
  const rewardDelta = levelIndex <= previous.legacyRewardThrough ? 0 : Math.max(0, bestPointsByLevel[levelIndex] - oldBest);
  const newlyCompleted = !previous.completedLevels.includes(levelIndex);
  const transactions = { ...previous.transactions, [attemptId]: { levelIndex, points, rewardDelta, newlyCompleted } };
  const positiveReceipts = Object.entries(transactions).filter(([, entry]) => entry.rewardDelta > 0);
  const zeroReceipts = Object.entries(transactions).filter(([, entry]) => entry.rewardDelta === 0).slice(-ZERO_RECEIPT_LIMIT);
  const next = {
    ...previous.unknownCanonical,
    version: 1,
    currentLevel: Math.min(LEVEL_COUNT - 1, Math.max(previous.currentLevel, levelIndex + 1)),
    unlockedLevel,
    completedLevels,
    bestPointsByLevel,
    legacyRewardThrough: previous.legacyRewardThrough,
    transactions: Object.fromEntries([...positiveReceipts, ...zeroReceipts]),
  };
  try { storage?.setItem(canonicalKey(playerId), JSON.stringify(next)); } catch {
    return { ...read, ok: false, status: 'write-failed', rewardDelta: 0, transactionId: attemptId, error: 'Spelling stage progress could not be saved. Retry this same result.' };
  }
  const verified = readWordsSessionProgress(playerId, storage);
  const receipt = verified.progress.transactions[attemptId];
  const persisted = verified.ok
    && verified.progress.completedLevels.includes(levelIndex)
    && verified.progress.bestPointsByLevel[levelIndex] >= bestPointsByLevel[levelIndex]
    && receipt?.levelIndex === levelIndex
    && receipt?.points === points
    && receipt?.rewardDelta === rewardDelta;
  if (!persisted) return { ...read, ok: false, status: 'readback-failed', rewardDelta: 0, transactionId: attemptId, error: 'Spelling stage progress could not be verified. Retry this same result.' };
  return { ...verified, ok: true, status: 'saved', transactionId: attemptId, rewardDelta, newlyCompleted, recovered: false };
}

export function positiveWordsRewardTransactions(progress) {
  return Object.entries(progress?.transactions || {}).filter(([, entry]) => entry.rewardDelta > 0)
    .map(([transactionId, entry]) => ({ ...entry, transactionId }));
}

// The session may move to its results screen only after both this verified
// local receipt and the parent reward claim are confirmed. Keeping the two
// steps together gives UI Retry the same attempt/token after either failure.
export function commitWordsSessionReward(playerId, levelIndex, points, attemptId, onCelebrate, storage = getStorage()) {
  const saved = commitWordsSessionLevel(playerId, levelIndex, points, attemptId, storage);
  if (!saved.ok) return { ...saved, stage: 'progress' };
  if (saved.rewardDelta <= 0) return { ...saved, stage: 'complete', parentReward: null };
  let parentReward;
  try {
    parentReward = onCelebrate?.('Level complete!', saved.rewardDelta, 0, 'words', { rewardToken: `words:${attemptId}` });
  } catch { parentReward = null; }
  if (!parentReward?.persisted) return {
    ...saved,
    ok: false,
    status: 'reward-pending',
    stage: 'reward',
    parentReward: null,
    error: parentReward?.error || 'The saved stage reward could not be confirmed. Retry this same result.',
  };
  return { ...saved, stage: 'complete', parentReward };
}

export function wordsSessionProgressStorageKey(playerId = 'amari') { return canonicalKey(playerId); }
export function legacyWordsSessionProgressKey(playerId = 'amari') { return legacyKey(playerId); }
