import { WRITING_PROJECTS, checkWritingProject } from './writingProjects.js';

export const WRITING_DRAFT_PREFIX = 'amari_writing_desk_projects_v1';
export const WRITING_PROGRESS_PREFIX = 'amari_writing_desk_progress_v1';
export const LEGACY_WRITING_KEY = (playerId) => `discovery_digital_rehearsal_v1:${safePlayerId(playerId)}:writing`;
export const MAX_WRITING_RECORD_CHARS = 280_000;
export const MAX_LEGACY_WRITING_CHARS = 400_000;
const projectIds = new Set(WRITING_PROJECTS.map(({ id }) => id));
const browserStorage = () => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };
const safePlayerId = (value) => String(value || 'amari').trim().replace(/[^a-zA-Z0-9_-]/gu, '_').slice(0, 80) || 'amari';
const draftKey = (playerId, projectId) => `${WRITING_DRAFT_PREFIX}:${safePlayerId(playerId)}:${projectId}`;
const recoveryKey = (playerId, projectId) => `${draftKey(playerId, projectId)}:last-good`;
const progressKey = (playerId) => `${WRITING_PROGRESS_PREFIX}:${safePlayerId(playerId)}`;
const safeRead = (storage, key) => { try { return storage?.getItem(key) ?? null; } catch { return null; } };
const stringify = (value) => { try { return JSON.stringify(value); } catch { return null; } };
const blankProgress = () => ({ version: 1, completedProjectIds: [], unlockedProjectIndex: 0 });

function validDocument(document, maxChars = MAX_WRITING_RECORD_CHARS, maxImageChars = 210_000) {
  if (!document || document.type !== 'doc' || !Array.isArray(document.content) || document.content.length > 100) return false;
  const text = stringify(document);
  if (!text || text.length > maxChars) return false;
  const allowedNodes = new Set(['doc', 'heading', 'paragraph', 'text', 'image', 'hardBreak']);
  const allowedAlignments = new Set(['left', 'center', 'right', 'justify']);
  const inspect = (node, depth = 0, topLevel = false) => {
    if (!node || typeof node !== 'object') return false;
    if (depth > 8 || !allowedNodes.has(node.type)) return false;
    if (topLevel && !['heading', 'paragraph', 'image'].includes(node.type)) return false;
    if (!topLevel && node.type === 'doc') return false;
    if (node.type === 'heading' && !topLevel || node.type === 'paragraph' && !topLevel) return false;
    if (['text', 'hardBreak', 'image'].includes(node.type) && Array.isArray(node.content) && node.content.length > 0) return false;
    if (node.type === 'heading' && node.attrs?.level !== 1) return false;
    if (['heading', 'paragraph'].includes(node.type) && Array.isArray(node.content) && node.content.some((child) => !['text', 'hardBreak'].includes(child.type))) return false;
    if (['heading', 'paragraph'].includes(node.type) && node.attrs?.textAlign && !allowedAlignments.has(node.attrs.textAlign)) return false;
    if (node.type === 'text' && node.marks !== undefined && (!Array.isArray(node.marks) || node.marks.some((mark) => !mark || !['bold', 'italic'].includes(mark.type)))) return false;
    if (node.type === 'image') {
      const src = node.attrs?.src || '';
      if (!/^data:image\/png;base64,/u.test(src) || src.length > maxImageChars || typeof node.attrs?.alt !== 'string') return false;
    }
    if (node.type === 'text' && (typeof node.text !== 'string' || node.text.length > maxChars)) return false;
    return !Array.isArray(node.content) || node.content.every((child) => inspect(child, depth + 1));
  };
  return document.content.every((node) => inspect(node, 1, true));
}

function validDraft(record, playerId, projectId) {
  return Boolean(record && record.version === 1 && record.playerId === safePlayerId(playerId)
    && record.projectId === projectId && projectIds.has(projectId)
    && typeof record.title === 'string' && record.title.length <= 100
    && validDocument(record.document) && typeof record.planet === 'string'
    && record.milestones && typeof record.milestones === 'object');
}

function readRecord(storage, key, playerId, projectId) {
  let raw;
  try { if (!storage || typeof storage.getItem !== 'function') return { failed: true }; raw = storage.getItem(key); } catch { return { failed: true }; }
  if (!raw) return null;
  if (raw.length > MAX_WRITING_RECORD_CHARS) return { invalid: true };
  try {
    const record = JSON.parse(raw);
    return validDraft(record, playerId, projectId) ? { record: { ...record, milestones: { saved: record.milestones.saved === true, reopened: record.milestones.reopened === true, exported: record.milestones.exported === true } }, raw } : { invalid: true };
  } catch { return { invalid: true }; }
}

export function loadWritingDraft(playerId = 'amari', projectId, storage = browserStorage(), { preferRecovery = false } = {}) {
  if (!projectIds.has(projectId)) return { ok: false, record: null, recovered: false, source: 'missing' };
  const primary = readRecord(storage, draftKey(playerId, projectId), playerId, projectId);
  const recovery = readRecord(storage, recoveryKey(playerId, projectId), playerId, projectId);
  if (primary?.failed || recovery?.failed) return { ok: false, record: null, recovered: false, source: 'unavailable', reason: 'storage-read-failed' };
  const chosen = preferRecovery ? (recovery?.record ? recovery : null) : primary?.record ? primary : recovery?.record ? recovery : null;
  if (!chosen || !chosen.record) return { ok: false, record: null, recovered: false, source: primary?.invalid || recovery?.invalid ? 'damaged' : 'missing', reason: primary?.invalid || recovery?.invalid ? 'draft-corrupt' : 'missing', hasRecovery: Boolean(recovery?.record) };
  const recovered = chosen === recovery;
  return { ok: true, record: chosen.record, recovered, source: recovered ? 'last-good' : 'current', hasRecovery: Boolean(recovery?.record) };
}

export function hasWritingRecovery(playerId = 'amari', projectId, storage = browserStorage()) {
  if (!projectIds.has(projectId)) return false;
  return Boolean(readRecord(storage, recoveryKey(playerId, projectId), playerId, projectId)?.record);
}

export function saveWritingDraft({ playerId = 'amari', projectId, title, document, planet = 'Earth', milestones = {}, legacyImported = false }, storage = browserStorage()) {
  const safeId = safePlayerId(playerId);
  const cleanTitle = String(title || 'My writing project').trim().slice(0, 100) || 'My writing project';
  if (!projectIds.has(projectId)) return { ok: false, reason: 'invalid-draft', record: null };
  if (!validDocument(document)) {
    const largeValid = validDocument(document, MAX_LEGACY_WRITING_CHARS, MAX_LEGACY_WRITING_CHARS);
    return { ok: false, reason: largeValid ? 'draft-too-large' : 'invalid-draft', record: null };
  }
  if (!storage || typeof storage.setItem !== 'function') return { ok: false, reason: 'storage-unavailable', record: null };
  const existing = loadWritingDraft(safeId, projectId, storage);
  if (existing.reason === 'storage-read-failed') return { ok: false, reason: 'storage-read-failed', record: null };
  if (existing.reason === 'draft-corrupt') return { ok: false, reason: 'draft-corrupt', record: null };
  const prior = existing.ok ? existing.record : null;
  const next = {
    version: 1, playerId: safeId, projectId, title: cleanTitle, document, planet: String(planet || 'Earth').slice(0, 32),
    milestones: { saved: true, reopened: (milestones.reopened ?? prior?.milestones?.reopened) === true, exported: (milestones.exported ?? prior?.milestones?.exported) === true },
    legacyImported: Boolean(legacyImported || prior?.legacyImported), updatedAt: new Date().toISOString(),
  };
  const raw = stringify(next);
  if (!raw || raw.length > MAX_WRITING_RECORD_CHARS) return { ok: false, reason: 'draft-too-large', record: null };
  try {
    // Keep the preceding authored revision. Save/reopen/export metadata must
    // not replace it with an identical document, and restoring a damaged
    // primary must not destroy the only readable recovery copy.
    const contentChanged = prior && stringify([prior.title, prior.document, prior.planet]) !== stringify([next.title, next.document, next.planet]);
    if (prior && !existing.recovered && (contentChanged || !readRecord(storage, recoveryKey(safeId, projectId), safeId, projectId)?.record)) {
      const priorRaw = stringify(prior);
      if (!priorRaw || priorRaw.length > MAX_WRITING_RECORD_CHARS) return { ok: false, reason: 'recovery-too-large', record: null };
      // Keep the last confirmed project state before replacing the current one.
      storage.setItem(recoveryKey(safeId, projectId), priorRaw);
    }
    storage.setItem(draftKey(safeId, projectId), raw);
    return { ok: true, reason: null, record: next };
  } catch { return { ok: false, reason: 'write-failed', record: null }; }
}

export function readLegacyWritingDraft(playerId = 'amari', storage = browserStorage()) {
  const raw = safeRead(storage, LEGACY_WRITING_KEY(playerId));
  if (!raw || raw.length > MAX_LEGACY_WRITING_CHARS) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.title !== 'string' || !validDocument(value.document, MAX_LEGACY_WRITING_CHARS, MAX_LEGACY_WRITING_CHARS)) return null;
    const imageAlt = (value.document.content || []).find((node) => node.type === 'image')?.attrs?.alt || '';
    const planet = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].find((name) => imageAlt.toLowerCase().includes(name.toLowerCase())) || 'Earth';
    return { title: value.title.slice(0, 100), document: value.document, planet, legacyImported: true, size: raw.length, tooLargeToCopy: raw.length > MAX_WRITING_RECORD_CHARS };
  } catch { return null; }
}

export function readWritingProgress(playerId = 'amari', storage = browserStorage()) {
  if (!storage || typeof storage.getItem !== 'function') return { ...blankProgress(), persisted: false };
  let raw;
  try { raw = storage.getItem(progressKey(playerId)); } catch { return { ...blankProgress(), persisted: false }; }
  try {
    const saved = JSON.parse(raw || 'null');
    if (saved?.version !== 1) return { ...blankProgress(), persisted: raw == null || raw === '' };
    const completed = new Set(Array.isArray(saved.completedProjectIds) ? saved.completedProjectIds.filter((id) => projectIds.has(id)) : []);
    const completedProjectIds = [];
    for (const { id } of WRITING_PROJECTS) { if (!completed.has(id)) break; completedProjectIds.push(id); }
    return { ...blankProgress(), completedProjectIds, unlockedProjectIndex: completedProjectIds.length, persisted: true };
  } catch { return { ...blankProgress(), persisted: false }; }
}

export function completeWritingProject(playerId, projectId, storage = browserStorage()) {
  const progress = readWritingProgress(playerId, storage);
  const index = WRITING_PROJECTS.findIndex(({ id }) => id === projectId);
  if (!progress.persisted || index < 0 || index > progress.unlockedProjectIndex) return { ...progress, persisted: false, newlyCompleted: false, checks: [] };
  if (progress.completedProjectIds.includes(projectId)) return { ...progress, persisted: true, newlyCompleted: false, checks: [] };
  const draft = loadWritingDraft(playerId, projectId, storage);
  if (!draft.ok) return { ...progress, persisted: false, newlyCompleted: false, checks: [] };
  const review = checkWritingProject(projectId, draft.record, draft.record.milestones);
  if (!review.complete) return { ...progress, persisted: false, newlyCompleted: false, checks: review.checks };
  if (!storage || typeof storage.setItem !== 'function') return { ...progress, persisted: false, newlyCompleted: false, checks: review.checks };
  const completedProjectIds = [...progress.completedProjectIds, projectId];
  try {
    storage.setItem(progressKey(playerId), JSON.stringify({ version: 1, completedProjectIds }));
    return { ...readWritingProgress(playerId, storage), persisted: true, newlyCompleted: true, checks: review.checks };
  } catch { return { ...progress, persisted: false, newlyCompleted: false, checks: review.checks }; }
}
