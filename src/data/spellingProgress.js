import { WRITING_SAMPLES_KEY } from './literacy.js';

export const SPELLING_PROGRESS_KEY = 'amari_spelling_progress_v1';
const TRANSACTION_FIELD = 'spellingTransactionIds';
const TRANSACTION_LIMIT = 16;

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function getStorage() {
  try { return globalThis.window?.localStorage || null; } catch { return null; }
}

function readRawProgress(storage) {
  if (!storage) return { ok: false, progress: {}, reason: 'unavailable' };
  let raw;
  try { raw = storage.getItem(SPELLING_PROGRESS_KEY); } catch { return { ok: false, progress: {}, reason: 'unreadable' }; }
  if (raw === null) return { ok: true, progress: {} };
  if (typeof raw !== 'string') return { ok: false, progress: {}, reason: 'invalid' };
  try {
    const progress = JSON.parse(raw);
    return isRecord(progress)
      ? { ok: true, progress }
      : { ok: false, progress: {}, reason: 'invalid' };
  } catch {
    return { ok: false, progress: {}, reason: 'invalid' };
  }
}

export function readSpellingProgress(storage = getStorage()) {
  const result = readRawProgress(storage);
  return { ok: result.ok, progress: result.progress, reason: result.reason || null };
}

function readCounter(record, key) {
  if (!Object.hasOwn(record, key)) return { ok: true, value: 0 };
  return Number.isSafeInteger(record[key]) && record[key] >= 0
    ? { ok: true, value: record[key] }
    : { ok: false, value: 0 };
}

/**
 * Commit one completed spelling attempt. The transaction id is kept on that
 * word row so a Retry after a successful write but failed readback is a no-op.
 * Existing top-level and per-word fields are merged and preserved.
 */
export function commitSpellingAttempt(storage = getStorage(), {
  word,
  transactionId,
  independent = false,
  hadMistake = false,
  mode = 'spell',
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  const previousResult = readRawProgress(storage);
  if (!previousResult.ok) return { ok: false, progress: previousResult.progress, reason: previousResult.reason };
  if (typeof word !== 'string' || !word || typeof transactionId !== 'string' || !transactionId) {
    return { ok: false, progress: previousResult.progress, reason: 'invalid' };
  }

  const previousProgress = previousResult.progress;
  const previousWord = Object.hasOwn(previousProgress, word) ? previousProgress[word] : {};
  if (!isRecord(previousWord)) return { ok: false, progress: previousProgress, reason: 'invalid' };
  const priorTransactions = Object.hasOwn(previousWord, TRANSACTION_FIELD) ? previousWord[TRANSACTION_FIELD] : [];
  if (!Array.isArray(priorTransactions) || priorTransactions.some((id) => typeof id !== 'string')) {
    return { ok: false, progress: previousProgress, reason: 'invalid' };
  }
  if (priorTransactions.includes(transactionId)) return { ok: true, progress: previousProgress, duplicate: true };

  const attempts = readCounter(previousWord, 'attempts');
  const independentFirstTry = readCounter(previousWord, 'independentFirstTry');
  const needsPractice = readCounter(previousWord, 'needsPractice');
  const independentDays = Object.hasOwn(previousWord, 'independentDays') ? previousWord.independentDays : [];
  if (!attempts.ok || !independentFirstTry.ok || !needsPractice.ok
    || !Array.isArray(independentDays) || independentDays.some((day) => typeof day !== 'string')) {
    return { ok: false, progress: previousProgress, reason: 'invalid' };
  }

  const nextWord = {
    ...previousWord,
    attempts: attempts.value + 1,
    independentFirstTry: independentFirstTry.value + (independent ? 1 : 0),
    independentDays: independent && !independentDays.includes(today)
      ? [...independentDays, today]
      : independentDays,
    needsPractice: needsPractice.value + (hadMistake ? 1 : 0),
    lastMode: mode,
    lastSeen: today,
    [TRANSACTION_FIELD]: [...priorTransactions, transactionId].slice(-TRANSACTION_LIMIT),
  };
  const nextProgress = { ...previousProgress, [word]: nextWord };
  let serialized;
  try { serialized = JSON.stringify(nextProgress); } catch { return { ok: false, progress: previousProgress, reason: 'invalid' }; }
  try { storage.setItem(SPELLING_PROGRESS_KEY, serialized); } catch { return { ok: false, progress: previousProgress, reason: 'write-failed' }; }

  const verified = readRawProgress(storage);
  if (!verified.ok) return { ok: false, progress: previousProgress, reason: 'readback-failed' };
  const savedWord = verified.progress[word];
  if (!isRecord(savedWord) || !Array.isArray(savedWord[TRANSACTION_FIELD]) || !savedWord[TRANSACTION_FIELD].includes(transactionId)) {
    return { ok: false, progress: previousProgress, reason: 'readback-mismatch' };
  }
  return { ok: true, progress: verified.progress, duplicate: false };
}

/** Save an ungraded caption draft without discarding existing learner samples. */
export function commitSpellingWritingSample(storage = getStorage(), sample) {
  if (!storage || !isRecord(sample) || typeof sample.id !== 'string' || !sample.id) {
    return { ok: false, samples: [], reason: 'unavailable' };
  }
  let raw;
  try { raw = storage.getItem(WRITING_SAMPLES_KEY); } catch { return { ok: false, samples: [], reason: 'unreadable' }; }
  let previous;
  if (raw === null) previous = [];
  else {
    try { previous = JSON.parse(raw); } catch { return { ok: false, samples: [], reason: 'invalid' }; }
    if (!Array.isArray(previous)) return { ok: false, samples: [], reason: 'invalid' };
  }
  if (previous.some((entry) => entry?.id === sample.id)) return { ok: true, samples: previous, duplicate: true };
  const next = [...previous.slice(-19), sample];
  let serialized;
  try { serialized = JSON.stringify(next); } catch { return { ok: false, samples: previous, reason: 'invalid' }; }
  try { storage.setItem(WRITING_SAMPLES_KEY, serialized); } catch { return { ok: false, samples: previous, reason: 'write-failed' }; }
  let readback;
  try { readback = storage.getItem(WRITING_SAMPLES_KEY); } catch { return { ok: false, samples: previous, reason: 'readback-failed' }; }
  let verified;
  try { verified = JSON.parse(readback); } catch { return { ok: false, samples: previous, reason: 'readback-failed' }; }
  if (!Array.isArray(verified) || !verified.some((entry) => entry?.id === sample.id)) {
    return { ok: false, samples: previous, reason: 'readback-mismatch' };
  }
  return { ok: true, samples: verified, duplicate: false };
}
