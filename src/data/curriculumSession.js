const SESSION_VERSION = 1;
const PREFERENCE_KEY = (playerId) => `${playerId || 'amari'}_curriculum_preferences_v1`;
const SESSION_KEY = (playerId, moduleId, difficulty) => `${playerId || 'amari'}_curriculum_session_v1_${moduleId}_${difficulty}`;
const DIFFICULTIES = new Set(['starter', 'growing', 'challenge']);

const readJSON = (storage, key) => {
  try {
    const value = storage?.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeJSON = (storage, key, value) => {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return Boolean(storage);
  } catch {
    return false;
  }
};

export const loadCurriculumPreferences = (storage, playerId) => {
  const preferences = readJSON(storage, PREFERENCE_KEY(playerId));
  if (!preferences || preferences.version !== SESSION_VERSION) return { moduleId: '', difficulties: {} };
  const difficulties = Object.fromEntries(Object.entries(preferences.difficulties || {}).filter(([, value]) => DIFFICULTIES.has(value)));
  return {
    moduleId: typeof preferences.moduleId === 'string' ? preferences.moduleId : '',
    difficulties,
  };
};

export const saveCurriculumPreferences = (storage, playerId, moduleId, difficulty) => {
  const current = loadCurriculumPreferences(storage, playerId);
  const difficulties = { ...current.difficulties };
  if (moduleId && DIFFICULTIES.has(difficulty)) difficulties[moduleId] = difficulty;
  return writeJSON(storage, PREFERENCE_KEY(playerId), {
    version: SESSION_VERSION,
    moduleId: moduleId || current.moduleId,
    difficulties,
  });
};

export const loadCurriculumSession = (storage, playerId, moduleId, rounds, difficulty) => {
  const session = readJSON(storage, SESSION_KEY(playerId, moduleId, difficulty));
  if (!session || session.version !== SESSION_VERSION || session.moduleId !== moduleId) return null;
  if (!DIFFICULTIES.has(session.difficulty) || (difficulty && session.difficulty !== difficulty)) return null;
  if (!Number.isInteger(session.seed) || !Array.isArray(session.order) || !Array.isArray(session.sequence)) return null;
  const uniqueOrder = new Set(session.order);
  if (!session.order.length || session.order.length > Math.min(5, rounds.length)
    || uniqueOrder.size !== session.order.length
    || session.order.some((index) => !Number.isInteger(index) || index < 0 || index >= rounds.length)) return null;
  if (!Number.isInteger(session.cursor) || session.cursor < 0 || session.cursor >= session.order.length) return null;
  const selectedRound = rounds[session.order[session.cursor]];
  const validSequenceIds = new Set((selectedRound.items || []).map((item) => item.id));
  if (session.sequence.some((id) => typeof id !== 'string' || !validSequenceIds.has(id))) return null;
  return {
    difficulty: session.difficulty,
    seed: session.seed,
    order: [...session.order],
    cursor: session.cursor,
    complete: session.complete === true,
    lessonOpen: session.lessonOpen !== false,
    locked: session.locked === true,
    selected: typeof session.selected === 'string' ? session.selected : '',
    feedback: typeof session.feedback === 'string' ? session.feedback : '',
    feedbackVoice: typeof session.feedbackVoice === 'string' ? session.feedbackVoice : '',
    mistakes: Number.isInteger(session.mistakes) && session.mistakes > 0 ? session.mistakes : 0,
    sequence: [...session.sequence],
    routeStep: Number.isInteger(session.routeStep) && session.routeStep > 0 ? session.routeStep : 0,
    prediction: typeof session.prediction === 'string' ? session.prediction : '',
  };
};

export const saveCurriculumSession = (storage, playerId, moduleId, session) => writeJSON(storage, SESSION_KEY(playerId, moduleId, session.difficulty), {
  version: SESSION_VERSION,
  moduleId,
  difficulty: session.difficulty,
  seed: session.seed,
  order: session.order,
  cursor: session.cursor,
  complete: session.complete,
  lessonOpen: session.lessonOpen,
  locked: session.locked,
  selected: session.selected,
  feedback: session.feedback,
  feedbackVoice: session.feedbackVoice,
  mistakes: session.mistakes,
  sequence: session.sequence,
  routeStep: session.routeStep,
  prediction: session.prediction,
});

export const clearCurriculumSession = (storage, playerId, moduleId, difficulty) => {
  try {
    if (difficulty) storage?.removeItem(SESSION_KEY(playerId, moduleId, difficulty));
    else DIFFICULTIES.forEach((band) => storage?.removeItem(SESSION_KEY(playerId, moduleId, band)));
    return Boolean(storage);
  } catch {
    return false;
  }
};
