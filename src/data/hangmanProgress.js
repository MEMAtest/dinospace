export const HANGMAN_PROGRESS_KEY = 'amari_hangman_progress_v1';
const LEVEL_COUNT = 4;
const safePlayer = (playerId) => String(playerId || 'amari').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'amari';
const canonicalKey = (playerId) => `${HANGMAN_PROGRESS_KEY}:${safePlayer(playerId)}`;
const legacyKey = (playerId) => `${safePlayer(playerId)}_game_levels_v1`;
const clampLevel = (value) => Number.isInteger(value) ? Math.max(0, Math.min(LEVEL_COUNT - 1, value)) : 0;
const empty = (persisted = false, persistenceSafe = false) => ({ version: 1, completedLevels: [], bestPointsByLevel: {}, recentWordsByLevel: {}, transactions: {}, unknownCanonical: {}, currentLevel: 0, unlockedLevel: 0, legacyUnlockedLevel: 0, persisted, persistenceSafe, newlyCompleted: false, rewardDelta: 0 });
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const integerScore = (value) => Number.isInteger(value) && value >= 0 && value <= 6 ? value : null;

function parseObject(raw) {
  if (raw === null) return { value: {}, valid: true };
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? { value, valid: true } : { value: {}, valid: false };
  } catch { return { value: {}, valid: false }; }
}

const plainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const indexRecord = (value, validate) => plainRecord(value) && ['0', '1', '2', '3'].every((key) => Object.hasOwn(value, key) && validate(value[key])) && Object.keys(value).every((key) => /^(0|[1-3])$/.test(key));
function validTransactionMap(value) {
  return plainRecord(value) && Object.entries(value).every(([id, item]) => /^[a-z0-9-]{1,100}$/i.test(id)
    && plainRecord(item) && Number.isInteger(item.levelIndex) && item.levelIndex >= 0 && item.levelIndex < LEVEL_COUNT
    && integerScore(item.points) !== null && integerScore(item.rewardDelta) !== null && typeof item.newlyCompleted === 'boolean');
}
function validCanonical(value) {
  return plainRecord(value) && value.version === 1
    && Array.isArray(value.completedLevels) && value.completedLevels.every((index) => Number.isInteger(index) && index >= 0 && index < LEVEL_COUNT)
    && new Set(value.completedLevels).size === value.completedLevels.length
    && indexRecord(value.bestPointsByLevel, (score) => integerScore(score) !== null)
    && indexRecord(value.recentWordsByLevel, (words) => Array.isArray(words) && words.every((word) => typeof word === 'string' && /^[A-Z]{3,7}$/.test(word)))
    && validTransactionMap(value.transactions)
    && Number.isInteger(value.currentLevel) && value.currentLevel >= 0 && value.currentLevel < LEVEL_COUNT
    && Number.isInteger(value.unlockedLevel) && value.unlockedLevel >= 0 && value.unlockedLevel < LEVEL_COUNT
    && value.currentLevel <= value.unlockedLevel && value.completedLevels.every((index) => index <= value.unlockedLevel);
}
function validLegacyHangman(legacy) {
  if (!Object.hasOwn(legacy || {}, 'hangman')) return true;
  const record = legacy.hangman;
  return plainRecord(record)
    && Number.isInteger(record.current) && record.current >= 0 && record.current < LEVEL_COUNT
    && Number.isInteger(record.unlocked) && record.unlocked >= 0 && record.unlocked < LEVEL_COUNT
    && record.current <= record.unlocked;
}

function normalize(saved, legacy, persisted = true, persistenceSafe = true) {
  const old = legacy?.hangman && typeof legacy.hangman === 'object' && !Array.isArray(legacy.hangman) ? legacy.hangman : {};
  if (!validLegacyHangman(legacy) || (saved && !validCanonical(saved))) persistenceSafe = false;
  const legacyUnlockedLevel = clampLevel(old.unlocked);
  const completedSet = new Set(Array.isArray(saved?.completedLevels) ? saved.completedLevels.filter((index) => Number.isInteger(index) && index >= 0 && index < LEVEL_COUNT) : []);
  for (let index = 0; index < legacyUnlockedLevel; index += 1) completedSet.add(index);
  const completedLevels = [...completedSet].sort((a, b) => a - b);
  const bestPointsByLevel = {};
  const recentWordsByLevel = {};
  for (let index = 0; index < LEVEL_COUNT; index += 1) {
    bestPointsByLevel[index] = integerScore(saved?.bestPointsByLevel?.[index]) ?? 0;
    recentWordsByLevel[index] = Array.isArray(saved?.recentWordsByLevel?.[index])
      ? [...new Set(saved.recentWordsByLevel[index].filter((word) => typeof word === 'string' && /^[A-Z]{3,7}$/.test(word)))].slice(-8)
      : [];
    // Legacy records have no reward receipt. Cap the highest unlocked level as
    // well as its completed prefix so migration cannot pay for old progress.
    if (Object.hasOwn(legacy || {}, 'hangman') && index <= legacyUnlockedLevel) bestPointsByLevel[index] = 6;
  }
  const transactions = Object.fromEntries(Object.entries(saved?.transactions || {}).slice(-20));
  const unlockedLevel = Math.min(LEVEL_COUNT - 1, Math.max(clampLevel(saved?.unlockedLevel), legacyUnlockedLevel, ...completedLevels.map((index) => Math.min(LEVEL_COUNT - 1, index + 1))));
  const requestedCurrent = Number.isInteger(saved?.currentLevel) ? clampLevel(saved.currentLevel) : Number.isInteger(old.current) ? clampLevel(old.current) : 0;
  return {
    ...empty(persisted, persistenceSafe), unknownCanonical: saved ? Object.fromEntries(Object.entries(saved).filter(([key]) => !['version', 'completedLevels', 'bestPointsByLevel', 'recentWordsByLevel', 'transactions', 'currentLevel', 'unlockedLevel'].includes(key))) : {}, completedLevels, bestPointsByLevel, recentWordsByLevel, transactions,
    currentLevel: Math.min(requestedCurrent, unlockedLevel), unlockedLevel, legacyUnlockedLevel,
  };
}

export function readHangmanProgress(playerId = 'amari', storage = defaultStorage()) {
  if (!storage) return empty(false, false);
  try {
    const canonicalRaw = storage.getItem(canonicalKey(playerId));
    const legacyRaw = storage.getItem(legacyKey(playerId));
    const canonical = parseObject(canonicalRaw);
    const legacy = parseObject(legacyRaw);
    const canonicalValid = canonicalRaw === null || validCanonical(canonical.value);
    const safe = canonical.valid && legacy.valid && canonicalValid && validLegacyHangman(legacy.value);
    const normalized = normalize(canonicalRaw === null ? null : canonical.value, legacy.value, true, safe);
    if (!safe) return { ...empty(true, false), error: 'Saved progress could not be checked safely. Only first-level practice is available.' };
    return normalized;
  } catch { return { ...empty(false, false), error: 'Saved progress could not be read safely.' }; }
}

export function isHangmanLevelUnlocked(progress, levelIndex) {
  return Number.isInteger(levelIndex) && levelIndex >= 0 && levelIndex < LEVEL_COUNT && levelIndex <= (progress?.unlockedLevel ?? 0);
}

export function hangmanPointsForRun(firstTryRescues, target) {
  if (!Number.isInteger(target) || target <= 0) return 0;
  const ratio = Math.max(0, Math.min(target, Number(firstTryRescues) || 0)) / target;
  return ratio >= 0.8 ? 6 : ratio >= 0.5 ? 4 : 2;
}

/** Commit the held level result; callers may reward only its verified delta. */
export function commitHangmanLevel(playerId, levelIndex, points, storage = defaultStorage(), transactionId = '') {
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= LEVEL_COUNT) return { ...empty(false, false), valid: false, error: 'Unknown Hangman level.' };
  const score = integerScore(points);
  if (score === null) return { ...empty(false, false), valid: false, error: 'Hangman score is out of range.' };
  const previous = readHangmanProgress(playerId, storage);
  if (!isHangmanLevelUnlocked(previous, levelIndex)) return { ...previous, persisted: false, valid: false, rewardDelta: 0, error: 'Finish the earlier Hangman level first.' };
  if (!storage || !previous.persistenceSafe) return { ...previous, persisted: false, valid: true, rewardDelta: 0, error: previous.error || 'Saved progress could not be checked. Practice is available, but rewards are paused until progress can be verified.' };

  if (transactionId) {
    const priorTransaction = previous.transactions[transactionId];
    if (priorTransaction) {
      if (priorTransaction.levelIndex !== levelIndex || priorTransaction.points !== score) return { ...previous, persisted: false, valid: false, rewardDelta: 0, error: 'This retry does not match the saved level attempt.' };
      return { ...previous, persisted: true, valid: true, ...priorTransaction, transactionRecovered: true };
    }
  }

  const previousBest = previous.bestPointsByLevel[levelIndex] || 0;
  if (previous.completedLevels.includes(levelIndex) && score <= previousBest) {
    return { ...previous, persisted: true, valid: true, newlyCompleted: false, rewardDelta: 0 };
  }
  const bestPointsByLevel = { ...previous.bestPointsByLevel, [levelIndex]: Math.max(previousBest, score) };
  const completedLevels = [...new Set([...previous.completedLevels, levelIndex])].sort((a, b) => a - b);
  const rewardDelta = Math.max(0, bestPointsByLevel[levelIndex] - previousBest);
  const newlyCompleted = !previous.completedLevels.includes(levelIndex);
  const transactions = transactionId
    ? { ...previous.transactions, [transactionId]: { levelIndex, points: score, rewardDelta, newlyCompleted } }
    : previous.transactions;
  const transactionEntries = Object.entries(transactions).slice(-20);
  const next = {
    ...previous.unknownCanonical, version: 1, completedLevels, bestPointsByLevel, recentWordsByLevel: previous.recentWordsByLevel,
    transactions: Object.fromEntries(transactionEntries),
    currentLevel: Math.min(LEVEL_COUNT - 1, levelIndex + 1),
    unlockedLevel: Math.min(LEVEL_COUNT - 1, Math.max(previous.unlockedLevel, levelIndex + 1)),
  };
  try {
    storage.setItem(canonicalKey(playerId), JSON.stringify(next));
    const verified = readHangmanProgress(playerId, storage);
    const transactionVerified = !transactionId || (verified.transactions[transactionId]?.levelIndex === levelIndex && verified.transactions[transactionId]?.points === score && verified.transactions[transactionId]?.rewardDelta === rewardDelta);
    const persisted = verified.persistenceSafe && verified.completedLevels.includes(levelIndex) && verified.bestPointsByLevel[levelIndex] >= bestPointsByLevel[levelIndex] && transactionVerified;
    if (!persisted) return { ...previous, persisted: false, valid: true, rewardDelta: 0, error: 'Progress could not be verified. Retry this same level result.' };
    return { ...verified, persisted: true, valid: true, newlyCompleted, rewardDelta };
  } catch {
    return { ...previous, persisted: false, valid: true, newlyCompleted: false, rewardDelta: 0, error: 'Progress could not be saved. Retry this same level result.' };
  }
}

export function rememberHangmanWord(playerId, levelIndex, word, storage = defaultStorage()) {
  const normalizedWord = String(word || '').toUpperCase();
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= LEVEL_COUNT || !/^[A-Z]{3,7}$/.test(normalizedWord)) return { ...empty(false, false), valid: false };
  const previous = readHangmanProgress(playerId, storage);
  if (!storage || !previous.persistenceSafe) return { ...previous, persisted: false, valid: true };
  const recentWordsByLevel = { ...previous.recentWordsByLevel };
  recentWordsByLevel[levelIndex] = [...(recentWordsByLevel[levelIndex] || []).filter((item) => item !== normalizedWord), normalizedWord].slice(-8);
  const next = { ...previous.unknownCanonical, version: 1, completedLevels: previous.completedLevels, bestPointsByLevel: previous.bestPointsByLevel, recentWordsByLevel, transactions: previous.transactions, currentLevel: previous.currentLevel, unlockedLevel: previous.unlockedLevel };
  try {
    storage.setItem(canonicalKey(playerId), JSON.stringify(next));
    const verified = readHangmanProgress(playerId, storage);
    const persisted = verified.persistenceSafe && verified.recentWordsByLevel[levelIndex].at(-1) === normalizedWord;
    return { ...verified, persisted, valid: true };
  } catch { return { ...previous, persisted: false, valid: true }; }
}

export function hangmanProgressStorageKey(playerId = 'amari') { return canonicalKey(playerId); }
export function legacyHangmanProgressKey(playerId = 'amari') { return legacyKey(playerId); }
export function positiveHangmanRewardTransactions(progress) {
  return Object.entries(progress?.transactions || {}).filter(([, transaction]) => transaction.rewardDelta > 0).map(([transactionId, transaction]) => ({ transactionId, ...transaction }));
}
