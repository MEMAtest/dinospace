export const STORYBOOK_PROFILE_KEY = 'amari_storybook_active_child_v1';
export const STORYBOOK_PROGRESS_KEY = 'amari_storybook_progress_v1';
export const STORYBOOK_COMPLETION_RECEIPT_VERSION = 1;

const canUseStorage = (storage) => storage && typeof storage.getItem === 'function';
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const plainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const validKey = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const unsafeMetadataKeys = new Set(['__proto__', 'prototype', 'constructor']);
const validJson = (value, seen = new Set()) => {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  const valid = Array.isArray(value)
    ? value.every((item) => validJson(item, seen))
    : plainRecord(value) && Object.entries(value).every(([key, item]) => !unsafeMetadataKeys.has(key) && validJson(item, seen));
  seen.delete(value);
  return valid;
};
const completionMarker = (slug) => `amari_storybook_complete_${slug}`;
const makeReceiptId = (childId, slug) => {
  let nonce;
  try { nonce = globalThis.crypto?.randomUUID?.(); } catch { nonce = null; }
  nonce ||= `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const scope = `${childId}-${slug}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 68);
  return `storybook-${scope}-${nonce}`.slice(0, 120);
};
const readRawState = (storage) => {
  if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', progress: {}, error: 'Story progress storage is unavailable.' };
  let raw;
  try { raw = storage.getItem(STORYBOOK_PROGRESS_KEY); } catch {
    return { ok: false, status: 'unreadable', progress: {}, error: 'Story progress could not be read safely.' };
  }
  if (raw === null) return { ok: true, status: 'fresh', progress: {} };
  if (typeof raw !== 'string' || raw.length === 0) return { ok: false, status: 'invalid', progress: {}, error: 'Saved story progress is malformed.' };
  let progress;
  try { progress = JSON.parse(raw); } catch { progress = null; }
  if (!plainRecord(progress) || !validJson(progress)) return { ok: false, status: 'invalid', progress: {}, error: 'Saved story progress is malformed.' };
  for (const [childId, childBooks] of Object.entries(progress)) {
    if (!validKey(childId) || !plainRecord(childBooks)) return { ok: false, status: 'invalid', progress: {}, error: 'Saved story progress is malformed.' };
    for (const [slug, entry] of Object.entries(childBooks)) {
      if (!validKey(slug) || !plainRecord(entry)) return { ok: false, status: 'invalid', progress: {}, error: 'Saved story progress is malformed.' };
      if ((Object.hasOwn(entry, 'completed') && typeof entry.completed !== 'boolean')
        || (Object.hasOwn(entry, 'favourite') && typeof entry.favourite !== 'boolean')
        || (Object.hasOwn(entry, 'pageIndex') && (!Number.isInteger(entry.pageIndex) || entry.pageIndex < -1))) {
        return { ok: false, status: 'invalid', progress: {}, error: 'Saved story progress fields are malformed.' };
      }
      if (entry.completionReceipt !== undefined) {
        const receipt = entry.completionReceipt;
        if (!plainRecord(receipt) || typeof receipt.id !== 'string' || !/^[a-zA-Z0-9:_-]{1,120}$/.test(receipt.id)
          || receipt.points !== 1 || receipt.version !== STORYBOOK_COMPLETION_RECEIPT_VERSION || entry.completed !== true
          || (Object.hasOwn(receipt, 'rewardPlayerId') && !validKey(receipt.rewardPlayerId))) {
          return { ok: false, status: 'invalid', progress: {}, error: 'Saved story completion receipt is malformed.' };
        }
      }
    }
  }
  return { ok: true, status: 'ready', progress };
};

export const readActiveChildId = (storage = defaultStorage()) => {
  try { return storage?.getItem(STORYBOOK_PROFILE_KEY) || 'amari'; } catch { return 'amari'; }
};

export const saveActiveChildId = (id, storage = defaultStorage()) => {
  try { storage?.setItem(STORYBOOK_PROFILE_KEY, id); } catch { /* optional storage */ }
};

export const readStoryProgress = (storage = defaultStorage()) => {
  if (!canUseStorage(storage)) return {};
  try {
    const parsed = JSON.parse(storage.getItem(STORYBOOK_PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
};

export const updateStoryProgress = (childId, slug, patch, storage = defaultStorage()) => {
  const all = readStoryProgress(storage);
  const current = all[childId]?.[slug] || {};
  const next = { ...all, [childId]: { ...(all[childId] || {}), [slug]: { ...current, ...patch, updatedAt: new Date().toISOString() } } };
  try { storage?.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify(next)); } catch { /* optional storage */ }
  return next[childId][slug];
};

export const readStoryProgressState = (storage = defaultStorage()) => readRawState(storage);

export const commitStoryProgress = (childId, slug, patch, storage = defaultStorage()) => {
  const read = readRawState(storage);
  if (!read.ok) return { ...read, entry: null };
  if (!validKey(childId) || !validKey(slug) || !plainRecord(patch) || !validJson(patch)) {
    return { ok: false, status: 'invalid', progress: read.progress, entry: null, error: 'Story progress update is invalid.' };
  }
  const previous = read.progress;
  const oldEntry = previous[childId]?.[slug] || {};
  const updatedAt = new Date().toISOString();
  const entry = { ...oldEntry, ...patch, updatedAt };
  const progress = { ...previous, [childId]: { ...(previous[childId] || {}), [slug]: entry } };
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, status: 'unavailable', progress: previous, entry: oldEntry, error: 'Story progress storage is unavailable.' };
  try { storage.setItem(STORYBOOK_PROGRESS_KEY, JSON.stringify(progress)); } catch {
    return { ok: false, status: 'write-failed', progress: previous, entry: oldEntry, error: 'Story progress could not be saved. Please retry.' };
  }
  const verified = readRawState(storage);
  const verifiedEntry = verified.ok ? verified.progress[childId]?.[slug] : null;
  if (!verified.ok || !verifiedEntry || JSON.stringify(verifiedEntry) !== JSON.stringify(entry)) {
    return { ok: false, status: 'readback-failed', progress: previous, entry: oldEntry, error: 'Story progress could not be verified. Please retry.' };
  }
  return { ok: true, status: 'saved', progress: verified.progress, entry: verifiedEntry, error: null };
};

export const commitStoryCompletion = (childId, slug, storage = defaultStorage(), { rewardPlayerId = childId } = {}) => {
  const read = readRawState(storage);
  if (!read.ok) return { ...read, entry: null, receipt: null };
  if (!validKey(childId) || !validKey(slug) || !validKey(rewardPlayerId)) return { ok: false, status: 'invalid', progress: read.progress, entry: null, receipt: null, error: 'Story completion identity is invalid.' };
  let legacyCompleted = false;
  const existing = read.progress[childId]?.[slug] || {};
  const oldReceipt = existing.completionReceipt;
  if (oldReceipt) {
    if (childId === 'amari') {
      try { storage.setItem(completionMarker(slug), '1'); } catch { /* canonical receipt is authoritative */ }
    }
    return { ok: true, status: 'recovered', progress: read.progress, entry: existing, receipt: oldReceipt, alreadyCompleted: true, error: null };
  }
  if (childId === 'amari') {
    if (!storage || typeof storage.getItem !== 'function') return { ok: false, status: 'unavailable', progress: read.progress, entry: null, receipt: null, error: 'Story completion could not be checked safely.' };
    try { legacyCompleted = storage.getItem(completionMarker(slug)) === '1'; } catch {
      return { ok: false, status: 'unreadable', progress: read.progress, entry: null, receipt: null, error: 'Story completion could not be checked safely.' };
    }
  }
  if (existing.completed === true || legacyCompleted) return { ok: true, status: 'legacy-complete', progress: read.progress, entry: existing, receipt: null, alreadyCompleted: true, error: null };

  const receipt = { id: makeReceiptId(childId, slug), points: 1, version: STORYBOOK_COMPLETION_RECEIPT_VERSION, rewardPlayerId };
  const saved = commitStoryProgress(childId, slug, { completed: true, completedAt: new Date().toISOString(), completionReceipt: receipt }, storage);
  if (!saved.ok) return { ...saved, receipt: null };
  if (childId === 'amari') {
    try { storage.setItem(completionMarker(slug), '1'); } catch { /* canonical receipt is authoritative */ }
  }
  return { ...saved, status: 'completed', receipt, alreadyCompleted: false };
};

export const getBookProgress = (all, childId, slug) => all?.[childId]?.[slug] || {};
