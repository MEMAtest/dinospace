import { CHAPTERS, MISSION_ORDER, simulateProgram, validateMissionProgram, validateProgram } from './rover.js';

export const CODE_PROGRESS_KEY = 'amari_code_cadets_progress_v1';
const missionIds = new Set(MISSION_ORDER);
const safePlayer = (player) => String(player || 'amari').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'amari';
const keyFor = (player) => `${CODE_PROGRESS_KEY}:${safePlayer(player)}`;
const empty = (persisted = false) => ({ version: 1, completedMissionIds: [], completedChapterIds: [], unlockedMissionIndex: 0, unlockedChapterIndex: 0, currentMissionId: MISSION_ORDER[0], missionDrafts: {}, persisted, newlyCompleted: false, newlyCompletedChapterId: null });
const defaultStorage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

function normalize(value) {
  if (!value || value.version !== 1) return empty(true);
  const asked = new Set(Array.isArray(value.completedMissionIds) ? value.completedMissionIds.filter((id) => missionIds.has(id)) : []);
  const completedMissionIds = [];
  for (const id of MISSION_ORDER) { if (!asked.has(id)) break; completedMissionIds.push(id); }
  const completedSet = new Set(completedMissionIds);
  const completedChapterIds = CHAPTERS.filter((chapter) => chapter.missionIds.every((id) => completedSet.has(id))).map(({ id }) => id);
  const missionDrafts = {};
  if (value.missionDrafts && typeof value.missionDrafts === 'object' && !Array.isArray(value.missionDrafts)) {
    for (const [id, draft] of Object.entries(value.missionDrafts)) {
      if (!missionIds.has(id) || !draft || !validateProgram(draft.program) || typeof draft.title !== 'string' || draft.title.length > 60) continue;
      missionDrafts[id] = { program: [...draft.program], title: draft.title, helpUsed: draft.helpUsed === true, guidedUsed: draft.guidedUsed === true };
    }
  }
  const currentMissionId = missionIds.has(value.currentMissionId) && MISSION_ORDER.indexOf(value.currentMissionId) <= completedMissionIds.length ? value.currentMissionId : MISSION_ORDER[Math.min(completedMissionIds.length, MISSION_ORDER.length - 1)];
  return { ...empty(true), completedMissionIds, completedChapterIds, unlockedMissionIndex: completedMissionIds.length, unlockedChapterIndex: completedChapterIds.length, currentMissionId, missionDrafts };
}

export function readCodeProgress(playerId = 'amari', storage = defaultStorage()) {
  try { if (!storage) return empty(false); return normalize(JSON.parse(storage.getItem(keyFor(playerId)) || 'null')); }
  catch { return empty(false); }
}

function write(playerId, next, storage, previous, newlyCompleted = false, newlyCompletedChapterId = null) {
  try {
    if (!storage) return { ...previous, persisted: false, newlyCompleted: false, newlyCompletedChapterId: null };
    storage.setItem(keyFor(playerId), JSON.stringify({ version: 1, completedMissionIds: next.completedMissionIds, currentMissionId: next.currentMissionId, missionDrafts: next.missionDrafts }));
    return { ...next, persisted: true, newlyCompleted, newlyCompletedChapterId };
  } catch { return { ...previous, persisted: false, newlyCompleted: false, newlyCompletedChapterId: null }; }
}

export function saveCodeDraft(playerId, missionId, program, title = 'My rover mission', helpUsed = false, storage = defaultStorage(), options = {}) {
  const order = MISSION_ORDER.indexOf(missionId);
  const previous = readCodeProgress(playerId, storage);
  const allowLocked = options.allowLocked === true;
  if (order < 0 || (!allowLocked && order > previous.unlockedMissionIndex) || !validateMissionProgram(missionId, program) || typeof title !== 'string' || title.length > 60) return { ...previous, persisted: false };
  const guidedUsed = options.guidedUsed ?? previous.missionDrafts[missionId]?.guidedUsed === true;
  const missionDrafts = { ...previous.missionDrafts, [missionId]: { program: [...program], title, helpUsed: helpUsed === true, guidedUsed: guidedUsed === true } };
  return write(playerId, { ...previous, currentMissionId: missionId, missionDrafts }, storage, previous);
}

/** Persist the completed mission and its last draft before showing Next or a reward. */
export function completeCodeMission(playerId, missionId, program, title = 'My rover mission', helpUsed = false, storage = defaultStorage(), options = {}) {
  const order = MISSION_ORDER.indexOf(missionId);
  const previous = readCodeProgress(playerId, storage);
  if (order < 0 || order > previous.unlockedMissionIndex || !validateMissionProgram(missionId, program) || typeof title !== 'string' || title.length > 60) return { ...previous, persisted: false, valid: false, newlyCompleted: false };
  const judgment = simulateProgram(missionId, program);
  if (!judgment.complete) return { ...previous, persisted: false, valid: false, newlyCompleted: false, message: judgment.message };
  const wasComplete = previous.completedMissionIds.includes(missionId);
  const completedMissionIds = wasComplete ? previous.completedMissionIds : [...previous.completedMissionIds, missionId];
  const completedSet = new Set(completedMissionIds);
  const completedChapterIds = CHAPTERS.filter((chapter) => chapter.missionIds.every((id) => completedSet.has(id))).map(({ id }) => id);
  const newlyCompletedChapterId = completedChapterIds.find((id) => !previous.completedChapterIds.includes(id)) || null;
  const guidedUsed = options.guidedUsed ?? previous.missionDrafts[missionId]?.guidedUsed === true;
  const next = {
    ...previous,
    completedMissionIds,
    completedChapterIds,
    unlockedMissionIndex: completedMissionIds.length,
    unlockedChapterIndex: completedChapterIds.length,
    currentMissionId: missionId,
    missionDrafts: { ...previous.missionDrafts, [missionId]: { program: [...program], title, helpUsed: helpUsed === true, guidedUsed: guidedUsed === true } },
  };
  return { ...write(playerId, next, storage, previous, !wasComplete, newlyCompletedChapterId), valid: true };
}

export function isCodeMissionUnlocked(progress, missionId) {
  const index = MISSION_ORDER.indexOf(missionId);
  return index >= 0 && index <= (progress?.unlockedMissionIndex ?? 0);
}

export function codeAttemptAttribution({ helpUsed = false, guidedUsed = false } = {}) {
  const clue = helpUsed === true;
  const guided = guidedUsed === true;
  return { assisted: clue || guided, guidedUsed: guided, helpUsed: clue, mode: guided ? 'guided' : clue ? 'assisted' : 'independent' };
}

export function codeProgressStorageKey(playerId = 'amari') { return keyFor(playerId); }
