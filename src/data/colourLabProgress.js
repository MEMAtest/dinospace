import { COLOUR_LABS, COLOUR_LAB_MISSIONS } from './colourLabAdventure.js';

export const COLOUR_LAB_PROGRESS_KEY = 'amari_colour_lab_adventure_v1';
const VERSION = 1;
const MISSION_IDS = new Set(COLOUR_LAB_MISSIONS.map(({ id }) => id));
const CHAPTER_IDS = new Set(COLOUR_LABS.map(({ id }) => id));
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const childKey = (childId) => String(childId || 'default').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'default';
const keyFor = (playerId) => `${COLOUR_LAB_PROGRESS_KEY}:${childKey(playerId)}`;
const defaultStorage = () => { try { return globalThis.window?.localStorage || null; } catch { return null; } };
const chapterMissionIds = (chapterId) => COLOUR_LAB_MISSIONS.filter(({ lab }) => lab === chapterId).map(({ id }) => id);
const completeChapters = (completed) => {
  const prefix = [];
  for (const { id } of COLOUR_LABS) {
    if (!chapterMissionIds(id).every((missionId) => completed.includes(missionId))) break;
    prefix.push(id);
  }
  return prefix;
};
const emptyProgress = () => ({ version: VERSION, completed: [], chapters: [], recentMissionIds: [], rewardReceipts: {} });

const validateProgress = (value) => {
  if (!isRecord(value) || value.version !== VERSION) return null;
  const completed = value.completed === undefined ? [] : value.completed;
  const chapters = value.chapters === undefined ? undefined : value.chapters;
  const recent = value.recentMissionIds === undefined ? [] : value.recentMissionIds;
  const receipts = value.rewardReceipts === undefined ? {} : value.rewardReceipts;
  if (!Array.isArray(completed) || completed.some((id) => !MISSION_IDS.has(id)) || new Set(completed).size !== completed.length
    || !Array.isArray(recent) || recent.some((id) => !MISSION_IDS.has(id)) || new Set(recent).size !== recent.length
    || recent.length > COLOUR_LAB_MISSIONS.length || !isRecord(receipts)) return null;
  const normalizedChapters = completeChapters(completed);
  if (chapters !== undefined && (!Array.isArray(chapters) || chapters.length !== normalizedChapters.length
    || chapters.some((id, index) => id !== normalizedChapters[index]))) return null;
  const unlockedLab = normalizedChapters.length;
  for (const id of completed) {
    const mission = COLOUR_LAB_MISSIONS.find((item) => item.id === id);
    const labIndex = COLOUR_LABS.findIndex((lab) => lab.id === mission.lab);
    if (labIndex > unlockedLab) return null;
  }
  for (const [id, receipt] of Object.entries(receipts)) {
    const mission = COLOUR_LAB_MISSIONS.find((item) => item.id === receipt?.missionId);
    if (!isRecord(receipt) || !mission || !MISSION_IDS.has(receipt.missionId) || id !== `${receipt.missionId}:complete`
      || receipt.id !== id || receipt.chapterId !== mission.lab || receipt.rewardDelta !== 1
      || typeof receipt.claimed !== 'boolean' || !completed.includes(receipt.missionId)) return null;
  }
  return {
    ...emptyProgress(),
    ...value,
    completed: [...completed],
    chapters: normalizedChapters,
    recentMissionIds: [...recent].slice(-COLOUR_LAB_MISSIONS.length),
    rewardReceipts: Object.fromEntries(Object.entries(receipts).map(([id, receipt]) => [id, { ...receipt }])),
  };
};

const strictRead = (playerId, storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', error: 'Saved paint progress is unavailable.' };
  let raw;
  try { raw = storage.getItem(keyFor(playerId)); }
  catch { return { ok: false, status: 'unavailable', error: 'Saved paint progress could not be read.' }; }
  if (raw === null) return { ok: true, status: 'fresh', progress: emptyProgress() };
  if (typeof raw !== 'string' || !raw) return { ok: false, status: 'invalid', error: 'Saved paint progress is unreadable.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, status: 'invalid', error: 'Saved paint progress is invalid.' }; }
  const progress = validateProgress(parsed);
  return progress ? { ok: true, status: 'ready', progress } : { ok: false, status: 'invalid', error: 'Saved paint progress is invalid.' };
};

const strictWrite = (playerId, next, storage, previous) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Progress could not be saved. Check storage and retry.' };
  }
  try {
    const encoded = JSON.stringify(next);
    storage.setItem(keyFor(playerId), encoded);
    const raw = storage.getItem(keyFor(playerId));
    if (raw !== encoded || !validateProgress(JSON.parse(raw))) throw new Error('Paint progress readback mismatch');
    return { ok: true, status: 'saved', progress: validateProgress(JSON.parse(raw)), error: null };
  } catch {
    return { ok: false, status: 'save-failed', progress: previous, error: 'Progress could not be confirmed. Retry this same result.' };
  }
};

export const colourLabProgressKey = keyFor;
export const readColourLabProgressStrict = (playerId = 'default', storage = defaultStorage()) => strictRead(playerId, storage);
export const getColourLabPendingRewardsStrict = (playerId = 'default', storage = defaultStorage()) => {
  const loaded = strictRead(playerId, storage);
  return loaded.ok ? { ...loaded, receipts: Object.values(loaded.progress.rewardReceipts).filter(({ claimed }) => !claimed).map((receipt) => ({ ...receipt })) } : loaded;
};

export const completeColourMissionStrict = (playerId, missionId, chapterId, expectedMissionIds = [], storage = defaultStorage()) => {
  const mission = COLOUR_LAB_MISSIONS.find(({ id }) => id === missionId);
  if (!mission || !CHAPTER_IDS.has(chapterId) || mission.lab !== chapterId || !Array.isArray(expectedMissionIds)
    || (expectedMissionIds.length && (expectedMissionIds.length !== chapterMissionIds(chapterId).length
      || expectedMissionIds.some((id, index) => id !== chapterMissionIds(chapterId)[index])))) {
    return { ok: false, status: 'invalid', progress: null, error: 'This paint result is invalid.' };
  }
  const before = strictRead(playerId, storage);
  if (!before.ok) return { ...before, progress: null };
  const progress = before.progress;
  const labIndex = COLOUR_LABS.findIndex(({ id }) => id === chapterId);
  if (labIndex > progress.chapters.length) return { ok: false, status: 'locked', progress, error: 'Finish the earlier paint labs first.' };
  const receiptId = `${missionId}:complete`;
  if (progress.completed.includes(missionId)) {
    return { ok: true, status: 'replay', progress, newlyCompleted: false, receipt: progress.rewardReceipts[receiptId]?.claimed ? null : progress.rewardReceipts[receiptId] || null };
  }
  const completed = [...progress.completed, missionId];
  const rewardReceipts = { ...progress.rewardReceipts };
  const receipt = { id: receiptId, missionId, chapterId, rewardDelta: 1, claimed: false };
  rewardReceipts[receiptId] = receipt;
  const recentMissionIds = [...progress.recentMissionIds.filter((id) => id !== missionId), missionId].slice(-COLOUR_LAB_MISSIONS.length);
  const next = { ...progress, completed, chapters: completeChapters(completed), recentMissionIds, rewardReceipts };
  const saved = strictWrite(playerId, next, storage, progress);
  return saved.ok
    ? { ...saved, newlyCompleted: true, receipt: saved.progress.rewardReceipts[receiptId] }
    : { ...saved, newlyCompleted: false, receipt: null };
};

export const markColourMissionReceiptClaimedStrict = (playerId, receiptId, storage = defaultStorage()) => {
  const before = strictRead(playerId, storage);
  if (!before.ok) return { ...before, progress: null };
  const receipt = before.progress.rewardReceipts[receiptId];
  if (!receipt) return { ok: false, status: 'missing-receipt', progress: before.progress, error: 'The saved paint reward was not found.' };
  if (receipt.claimed) return { ok: true, status: 'already-claimed', progress: before.progress, receipt: { ...receipt } };
  const next = { ...before.progress, rewardReceipts: { ...before.progress.rewardReceipts, [receiptId]: { ...receipt, claimed: true } } };
  return { ...strictWrite(playerId, next, storage, before.progress), receipt: { ...receipt, claimed: true } };
};

// Compatibility projections retain the former function names and result fields.
export function readColourLabProgress(playerId = 'default', storage = defaultStorage()) {
  const result = strictRead(playerId, storage);
  return result.ok ? { ...result.progress, persisted: true, newlyCompleted: false } : { ...emptyProgress(), persisted: false, newlyCompleted: false };
}

export function completeColourMission(playerId, missionId, chapterId, chapterMissionIds = [], storage = defaultStorage()) {
  const result = completeColourMissionStrict(playerId, missionId, chapterId, chapterMissionIds, storage);
  return result.ok
    ? { ...result.progress, persisted: true, newlyCompleted: Boolean(result.newlyCompleted) }
    : { ...(result.progress || readColourLabProgress(playerId, storage)), persisted: false, newlyCompleted: false };
}

export function isColourMissionComplete(progress, missionId) { return Boolean(progress?.completed?.includes(missionId)); }
