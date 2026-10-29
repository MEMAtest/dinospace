import { playerStorageKey } from './players.js';
import { inspectCurriculumBadges, saveCurriculumBadge } from './curriculumBadges.js';
import { rewardClaimToken } from './playerRewards.js';

const HISTORY_KEY = (playerId, moduleId, difficulty) => playerStorageKey(playerId, `curriculum_recent_v1_${moduleId}_${difficulty}`);
const HISTORY_TX_KEY = (playerId, moduleId, difficulty) => playerStorageKey(playerId, `curriculum_history_transaction_v1_${moduleId}_${difficulty}`);
const COMPLETION_KEY = (playerId) => playerStorageKey(playerId, 'curriculum_completion_receipts_v1');
const RECORD_VERSION = 1;
const MODULE_IDS = new Set(['continents', 'time-detectives', 'nature-lab']);
const BANDS = new Set(['starter', 'growing', 'challenge']);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const readJSON = (storage, key) => {
  if (!storage || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  let raw;
  try {
    raw = storage.getItem(key);
  } catch { return { status: 'unavailable' }; }
  if (raw === null) return { status: 'empty', raw: null };
  if (typeof raw !== 'string') return { status: 'invalid', raw };
  try { return { status: 'value', raw, value: JSON.parse(raw) }; }
  catch { return { status: 'invalid', raw }; }
};
const setConfirmed = (storage, key, value) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  try {
    const encoded = JSON.stringify(value);
    storage.setItem(key, encoded);
    if (storage.getItem(key) !== encoded) return { status: 'unconfirmed' };
    return { status: 'saved', value };
  } catch { return { status: 'unconfirmed' }; }
};

const decodeHistory = (result) => {
  if (result.status === 'empty') return { status: 'empty', ids: [] };
  if (result.status !== 'value') return result;
  if (!Array.isArray(result.value) || result.value.length > 8 || result.value.some((id) => typeof id !== 'string')) return { status: 'invalid' };
  return { status: 'record', ids: result.value };
};

export const inspectCurriculumHistory = (storage, playerId, moduleId, difficulty) => decodeHistory(readJSON(storage, HISTORY_KEY(playerId, moduleId, difficulty)));

export const loadCurriculumHistory = (storage, playerId, moduleId, difficulty) => {
  const result = inspectCurriculumHistory(storage, playerId, moduleId, difficulty);
  return result.status === 'record' || result.status === 'empty' ? [...result.ids] : null;
};

const validHistoryTransaction = (value) => isRecord(value) && value.version === RECORD_VERSION
  && typeof value.transactionId === 'string' && value.transactionId.length <= 180
  && MODULE_IDS.has(value.moduleId) && BANDS.has(value.difficulty)
  && typeof value.roundId === 'string' && Array.isArray(value.historyNext)
  && value.historyNext.length <= 8 && value.historyNext.every((id) => typeof id === 'string')
  && ['pending', 'applied'].includes(value.status);

export const commitCurriculumHistory = (storage, playerId, moduleId, difficulty, transactionId, roundId) => {
  if (!MODULE_IDS.has(moduleId) || !BANDS.has(difficulty) || typeof transactionId !== 'string' || !transactionId || typeof roundId !== 'string') return { status: 'invalid' };
  const transactionKey = HISTORY_TX_KEY(playerId, moduleId, difficulty);
  const oldTx = readJSON(storage, transactionKey);
  if (!['empty', 'value'].includes(oldTx.status)) return { status: oldTx.status };
  let transaction;
  if (oldTx.status === 'value') {
    if (!validHistoryTransaction(oldTx.value)) return { status: 'invalid' };
    if (oldTx.value.transactionId === transactionId) transaction = oldTx.value;
  }
  if (!transaction) {
    const history = inspectCurriculumHistory(storage, playerId, moduleId, difficulty);
    if (!['empty', 'record'].includes(history.status)) return { status: history.status };
    transaction = {
      ...(oldTx.status === 'value' ? oldTx.value : {}),
      version: RECORD_VERSION,
      transactionId,
      moduleId,
      difficulty,
      roundId,
      historyNext: [...history.ids, roundId].slice(-8),
      status: 'pending',
    };
    const held = setConfirmed(storage, transactionKey, transaction);
    if (held.status !== 'saved') return held;
  } else if (transaction.moduleId !== moduleId || transaction.difficulty !== difficulty || transaction.roundId !== roundId) {
    return { status: 'invalid' };
  }
  if (transaction.status === 'applied') return { status: 'saved', history: [...transaction.historyNext], alreadyApplied: true };
  const wrote = setConfirmed(storage, HISTORY_KEY(playerId, moduleId, difficulty), transaction.historyNext);
  if (wrote.status !== 'saved') return wrote;
  transaction = { ...transaction, status: 'applied' };
  const marked = setConfirmed(storage, transactionKey, transaction);
  return marked.status === 'saved' ? { status: 'saved', history: [...transaction.historyNext], alreadyApplied: false } : marked;
};

const decodeCompletions = (result) => {
  if (result.status === 'empty') return { status: 'empty', value: { version: RECORD_VERSION, completions: [] } };
  if (result.status !== 'value') return result;
  const value = result.value;
  if (!isRecord(value) || value.version !== RECORD_VERSION || !Array.isArray(value.completions) || value.completions.length > 9) return { status: 'invalid' };
  const ids = new Set();
  for (const row of value.completions) {
    if (!isRecord(row) || !MODULE_IDS.has(row.moduleId) || !BANDS.has(row.difficulty)
      || !['pending', 'confirmed', 'legacy'].includes(row.status)
      || row.token !== rewardClaimToken('worldmap', `${row.moduleId}:${row.difficulty}`)
      || typeof row.praise !== 'string' || row.praise.length > 160) return { status: 'invalid' };
    const id = `${row.moduleId}:${row.difficulty}`;
    if (ids.has(id)) return { status: 'invalid' };
    ids.add(id);
  }
  return { status: 'record', value };
};

export const inspectCurriculumCompletions = (storage, playerId) => decodeCompletions(readJSON(storage, COMPLETION_KEY(playerId)));

export const saveCurriculumCompletion = (storage, playerId, moduleId, difficulty, row) => {
  if (!MODULE_IDS.has(moduleId) || !BANDS.has(difficulty)) return { status: 'invalid' };
  if (!isRecord(row) || row.token !== rewardClaimToken('worldmap', `${moduleId}:${difficulty}`)
    || !['pending', 'confirmed', 'legacy'].includes(row.status)
    || typeof row.praise !== 'string' || row.praise.length > 160) return { status: 'invalid' };
  const current = inspectCurriculumCompletions(storage, playerId);
  if (!['empty', 'record'].includes(current.status)) return { status: current.status };
  const value = current.value;
  const id = `${moduleId}:${difficulty}`;
  const existing = value.completions.find((entry) => `${entry.moduleId}:${entry.difficulty}` === id);
  if (existing && (existing.token !== row.token || existing.praise !== row.praise)) return { status: 'conflict' };
  if (existing && existing.status !== row.status
    && !(existing.status === 'pending' && row.status === 'confirmed')) return { status: 'conflict' };
  const completions = existing ? value.completions.map((entry) => entry === existing ? { ...existing, ...row } : entry) : [...value.completions, { moduleId, difficulty, ...row }];
  if (completions.length > 9) return { status: 'invalid' };
  const next = { ...value, version: RECORD_VERSION, completions };
  const saved = setConfirmed(storage, COMPLETION_KEY(playerId), next);
  return saved.status === 'saved' ? { ...saved, receipt: next.completions.find((entry) => `${entry.moduleId}:${entry.difficulty}` === id) } : saved;
};

export const finishCurriculumPath = (storage, playerId, moduleId, difficulty, praise, onCelebrate) => {
  const badges = inspectCurriculumBadges(playerId, storage);
  if (!['record', 'empty'].includes(badges.status)) return { status: 'badge-read-failed', detail: badges.status };
  const completionState = inspectCurriculumCompletions(storage, playerId);
  if (!['record', 'empty'].includes(completionState.status)) return { status: 'receipt-read-failed', detail: completionState.status };
  const badgeId = `${moduleId}:${difficulty}`;
  const alreadyEarned = badges.status === 'record' && badges.badges.includes(badgeId);
  let receipt = completionState.value.completions.find((entry) => entry.moduleId === moduleId && entry.difficulty === difficulty);
  if (!receipt) {
    const nextReceipt = {
      status: alreadyEarned ? 'legacy' : 'pending',
      token: rewardClaimToken('worldmap', `${moduleId}:${difficulty}`),
      praise,
    };
    const created = saveCurriculumCompletion(storage, playerId, moduleId, difficulty, nextReceipt);
    if (created.status !== 'saved') return { status: 'receipt-write-failed', detail: created.status };
    receipt = created.receipt;
  }
  const badge = saveCurriculumBadge(playerId, moduleId, difficulty, storage);
  if (badge.status !== 'saved') return { status: 'badge-write-failed', detail: badge.status, receipt };
  if (receipt.status === 'pending') {
    let parentResult;
    try { parentResult = onCelebrate(receipt.praise, 4, 0, 'worldmap', { rewardToken: receipt.token }); }
    catch { return { status: 'parent-reward-failed', receipt, badge: badge.badges }; }
    if (!parentResult || parentResult.persisted !== true) return { status: 'parent-reward-failed', receipt, badge: badge.badges };
    const confirmed = saveCurriculumCompletion(storage, playerId, moduleId, difficulty, { ...receipt, status: 'confirmed' });
    if (confirmed.status !== 'saved') return { status: 'receipt-confirm-failed', detail: confirmed.status, receipt, badge: badge.badges };
    return { status: 'saved', receipt: confirmed.receipt, badges: badge.badges, parentResult };
  }
  return { status: 'saved', receipt, badges: badge.badges, parentResult: null };
};

export const curriculumHistoryStorageKey = HISTORY_KEY;
export const curriculumHistoryTransactionKey = HISTORY_TX_KEY;
export const curriculumCompletionStorageKey = COMPLETION_KEY;
