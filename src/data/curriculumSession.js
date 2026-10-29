import { CONTINENTS, CURRICULUM_MODULES, OCEANS } from './curriculumModules.js';
import { playerStorageKey } from './players.js';

const SESSION_VERSION = 1;
const PREFERENCE_KEY = (playerId) => playerStorageKey(playerId, 'curriculum_preferences_v1');
const SESSION_KEY = (playerId, moduleId, difficulty) => playerStorageKey(playerId, `curriculum_session_v1_${moduleId}_${difficulty}`);
const DIFFICULTIES = new Set(['starter', 'growing', 'challenge']);
const MODULES = new Set(CURRICULUM_MODULES.map(({ id }) => id));
const plainRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const readRecord = (storage, key) => {
  if (!storage || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  let raw;
  try {
    raw = storage.getItem(key);
  } catch { return { status: 'unavailable' }; }
  if (raw === null) return { status: 'empty', raw: null, record: null };
  if (typeof raw !== 'string') return { status: 'invalid', raw };
  try {
    const record = JSON.parse(raw);
    return plainRecord(record) ? { status: 'record', raw, record } : { status: 'invalid', raw };
  } catch { return { status: 'invalid', raw }; }
};

const writeConfirmed = (storage, key, record) => {
  if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') return { status: 'unavailable' };
  let encoded;
  try {
    encoded = JSON.stringify(record);
    storage.setItem(key, encoded);
    if (storage.getItem(key) !== encoded) return { status: 'unconfirmed' };
    return { status: 'saved', record };
  } catch { return { status: 'unconfirmed' }; }
};

export const inspectCurriculumPreferences = (storage, playerId) => {
  const read = readRecord(storage, PREFERENCE_KEY(playerId));
  if (read.status === 'empty') return { status: 'empty', value: { version: SESSION_VERSION, moduleId: '', difficulties: {} } };
  if (read.status !== 'record') return { status: read.status };
  const { record } = read;
  if (record.version !== SESSION_VERSION || !(record.moduleId === '' || MODULES.has(record.moduleId)) || !plainRecord(record.difficulties)
    || Object.entries(record.difficulties).some(([moduleId, value]) => !MODULES.has(moduleId) || !DIFFICULTIES.has(value))) return { status: 'invalid' };
  return { status: 'record', value: record };
};

export const loadCurriculumPreferences = (storage, playerId) => {
  const result = inspectCurriculumPreferences(storage, playerId);
  return result.status === 'record' || result.status === 'empty'
    ? { moduleId: result.value.moduleId, difficulties: { ...result.value.difficulties } }
    : { moduleId: '', difficulties: {} };
};

export const saveCurriculumPreferences = (storage, playerId, moduleId, difficulty) => {
  const current = inspectCurriculumPreferences(storage, playerId);
  if (!['empty', 'record'].includes(current.status)) return { status: current.status };
  if (moduleId && !DIFFICULTIES.has(difficulty)) return { status: 'invalid' };
  const prior = current.status === 'record' ? current.value : {};
  const difficulties = { ...(prior.difficulties || {}) };
  if (moduleId) difficulties[moduleId] = difficulty;
  return writeConfirmed(storage, PREFERENCE_KEY(playerId), {
    ...prior,
    version: SESSION_VERSION,
    moduleId: moduleId || prior.moduleId || '',
    difficulties,
  });
};

const isValidSession = (session, moduleId, rounds, difficulty) => {
  if (!plainRecord(session) || session.version !== SESSION_VERSION || session.moduleId !== moduleId) return false;
  if (!DIFFICULTIES.has(session.difficulty) || session.difficulty !== difficulty) return false;
  if (!Number.isInteger(session.seed) || !Array.isArray(session.order) || !Array.isArray(session.sequence)) return false;
  const uniqueOrder = new Set(session.order);
  if (session.order.length !== Math.min(5, rounds.length)
    || uniqueOrder.size !== session.order.length
    || session.order.some((index) => !Number.isInteger(index) || index < 0 || index >= rounds.length)) return false;
  if (!Number.isInteger(session.cursor) || session.cursor < 0 || session.cursor >= session.order.length) return false;
  if (typeof session.complete !== 'boolean' || typeof session.lessonOpen !== 'boolean'
    || typeof session.locked !== 'boolean' || typeof session.selected !== 'string'
    || typeof session.feedback !== 'string' || typeof session.feedbackVoice !== 'string'
    || !Number.isInteger(session.mistakes) || session.mistakes < 0
    || !Number.isInteger(session.routeStep) || session.routeStep < 0
    || typeof session.prediction !== 'string' || session.feedback.length > 2000
    || session.feedbackVoice.length > 2000 || session.selected.length > 100
    || (session.complete && (!session.locked || session.cursor !== session.order.length - 1))) return false;
  const selectedRound = rounds[session.order[session.cursor]];
  const sequenceItems = selectedRound.items || [];
  const validSequenceIds = new Set(sequenceItems.map((item) => item.id));
  if (session.sequence.length > sequenceItems.length || new Set(session.sequence).size !== session.sequence.length
    || session.sequence.some((id) => typeof id !== 'string' || !validSequenceIds.has(id))) return false;
  const answerItems = selectedRound.type === 'continent' || selectedRound.type === 'country' ? CONTINENTS
    : selectedRound.type === 'ocean' ? OCEANS
      : selectedRound.type === 'route' ? ['north', 'east', 'south', 'west'].map((id) => ({ id }))
        : selectedRound.options || sequenceItems;
  if (session.selected && !answerItems.some((item) => item.id === session.selected)) return false;
  if (session.locked && !session.selected) return false;
  if (session.routeStep > (selectedRound.path?.length || 0)) return false;
  if (session.prediction && !selectedRound.predictions?.some((item) => item.id === session.prediction)) return false;
  return true;
};

export const inspectCurriculumSession = (storage, playerId, moduleId, rounds, difficulty) => {
  const read = readRecord(storage, SESSION_KEY(playerId, moduleId, difficulty));
  if (read.status === 'empty') return { status: 'empty' };
  if (read.status !== 'record') return { status: read.status };
  if (!isValidSession(read.record, moduleId, rounds, difficulty)) return { status: 'invalid' };
  return { status: 'record', value: read.record };
};

export const loadCurriculumSession = (storage, playerId, moduleId, rounds, difficulty) => {
  const result = inspectCurriculumSession(storage, playerId, moduleId, rounds, difficulty);
  if (result.status !== 'record') return null;
  return {
    difficulty: result.value.difficulty,
    seed: result.value.seed,
    order: [...result.value.order],
    cursor: result.value.cursor,
    complete: result.value.complete,
    lessonOpen: result.value.lessonOpen,
    locked: result.value.locked,
    selected: result.value.selected,
    feedback: result.value.feedback,
    feedbackVoice: result.value.feedbackVoice,
    mistakes: result.value.mistakes,
    sequence: [...result.value.sequence],
    routeStep: result.value.routeStep,
    prediction: result.value.prediction,
  };
};

export const saveCurriculumSession = (storage, playerId, moduleId, rounds, session) => {
  const current = inspectCurriculumSession(storage, playerId, moduleId, rounds, session.difficulty);
  if (!['empty', 'record'].includes(current.status)) return { status: current.status };
  const previous = current.status === 'record' ? current.value : {};
  const candidate = {
    ...previous,
    version: SESSION_VERSION,
    moduleId,
    difficulty: session.difficulty,
    seed: session.seed,
    order: [...session.order],
    cursor: session.cursor,
    complete: session.complete,
    lessonOpen: session.lessonOpen,
    locked: session.locked,
    selected: session.selected,
    feedback: session.feedback,
    feedbackVoice: session.feedbackVoice,
    mistakes: session.mistakes,
    sequence: [...session.sequence],
    routeStep: session.routeStep,
    prediction: session.prediction,
  };
  if (!isValidSession(candidate, moduleId, rounds, session.difficulty)) return { status: 'invalid' };
  return writeConfirmed(storage, SESSION_KEY(playerId, moduleId, session.difficulty), candidate);
};

export const clearCurriculumSession = (storage, playerId, moduleId, difficulty) => {
  if (!storage || typeof storage.removeItem !== 'function' || typeof storage.getItem !== 'function') return false;
  try {
    const keys = difficulty ? [SESSION_KEY(playerId, moduleId, difficulty)] : [...DIFFICULTIES].map((band) => SESSION_KEY(playerId, moduleId, band));
    keys.forEach((key) => storage.removeItem(key));
    return keys.every((key) => storage.getItem(key) === null);
  } catch { return false; }
};

export const curriculumPreferenceStorageKey = PREFERENCE_KEY;
export const curriculumSessionStorageKey = SESSION_KEY;
