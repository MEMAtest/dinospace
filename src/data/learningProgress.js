export const LEARNING_STORAGE_KEYS = Object.freeze({
  profile: 'amari_child_learning_profile_v1',
  attempts: 'amari_learning_attempts_v1',
  mastery: 'amari_skill_mastery_v1',
  legacySpelling: 'amari_spelling_progress_v1',
  migration: 'amari_learning_migration_v1',
});

export const DIFFICULTY_BANDS = Object.freeze(['starter', 'growing', 'challenge']);

export const PHASE_SOUNDS = Object.freeze({
  2: Object.freeze(['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'ck', 'e', 'u', 'r', 'h', 'b', 'f', 'ff', 'l', 'll', 'ss']),
  3: Object.freeze(['j', 'v', 'w', 'x', 'y', 'z', 'zz', 'qu', 'ch', 'sh', 'th', 'ng', 'nk', 'ai', 'ee', 'igh', 'oa', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'er']),
});

export const BONUS_GAME_IDS = Object.freeze(['hangman', 'spot', 'tictactoe']);

const DEFAULT_PROFILE = Object.freeze({
  version: 1,
  ageBand: '5-6',
  activePhase: 2,
  selectedSounds: [...PHASE_SOUNDS[2]],
  difficultyOverrides: {},
  updatedAt: '',
});

const soundsThroughPhase = (phase) => phase === 3
  ? [...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]
  : [...PHASE_SOUNDS[2]];

const MAX_ATTEMPTS = 1200;

const canUseBrowserStorage = () => typeof window !== 'undefined' && window.localStorage;

const readJson = (storage, key, fallback) => {
  try {
    const value = storage?.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (storage, key, value) => {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const emitChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('amari-learning-progress'));
};

const isoDay = (value = new Date()) => new Date(value).toISOString().slice(0, 10);

const normaliseProfile = (value = {}) => {
  const activePhase = Number(value.activePhase) === 3 ? 3 : 2;
  const allowed = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]);
  const selectedSounds = Array.isArray(value.selectedSounds)
    ? [...new Set(value.selectedSounds.filter((sound) => allowed.has(sound)))]
    : soundsThroughPhase(activePhase);
  const difficultyOverrides = Object.fromEntries(
    Object.entries(value.difficultyOverrides || {}).filter(([, band]) => DIFFICULTY_BANDS.includes(band)),
  );
  return {
    ...DEFAULT_PROFILE,
    ...value,
    activePhase,
    selectedSounds: selectedSounds.length ? selectedSounds : soundsThroughPhase(activePhase),
    difficultyOverrides,
  };
};

export const getLearningProfile = (storage = canUseBrowserStorage()) => (
  normaliseProfile(readJson(storage, LEARNING_STORAGE_KEYS.profile, DEFAULT_PROFILE))
);

export const updateLearningProfile = (updates, storage = canUseBrowserStorage()) => {
  const previous = getLearningProfile(storage);
  const requested = typeof updates === 'function' ? updates(previous) : updates;
  const next = normaliseProfile({ ...previous, ...(requested || {}), updatedAt: new Date().toISOString() });
  writeJson(storage, LEARNING_STORAGE_KEYS.profile, next);
  emitChange();
  return next;
};

export const setActivePhase = (phase, storage = canUseBrowserStorage()) => {
  const activePhase = Number(phase) === 3 ? 3 : 2;
  return updateLearningProfile({ activePhase, selectedSounds: soundsThroughPhase(activePhase) }, storage);
};

export const toggleTaughtSound = (sound, storage = canUseBrowserStorage()) => updateLearningProfile((profile) => {
  const allowed = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]);
  if (!allowed.has(sound)) return profile;
  const selectedSounds = profile.selectedSounds.includes(sound)
    ? profile.selectedSounds.filter((item) => item !== sound)
    : [...profile.selectedSounds, sound];
  return { selectedSounds };
}, storage);

export const setDifficultyOverride = (gameId, band, storage = canUseBrowserStorage()) => updateLearningProfile((profile) => {
  const difficultyOverrides = { ...profile.difficultyOverrides };
  if (DIFFICULTY_BANDS.includes(band)) difficultyOverrides[gameId] = band;
  else delete difficultyOverrides[gameId];
  return { difficultyOverrides };
}, storage);

const attemptKey = (attempt) => `${attempt.skill || attempt.gameId}:${attempt.item || 'general'}`;

const deriveMastery = (attempts) => {
  const groups = attempts.reduce((result, attempt) => {
    if (!attempt.masteryEligible || typeof attempt.correct !== 'boolean') return result;
    const key = attemptKey(attempt);
    (result[key] ||= []).push(attempt);
    return result;
  }, {});

  return Object.fromEntries(Object.entries(groups).map(([key, items]) => {
    const sorted = [...items].sort((a, b) => a.at.localeCompare(b.at));
    const independentAttempts = sorted.filter((item) => item.correct && item.firstAttempt && item.independent && !item.hints);
    const firstTrySuccesses = independentAttempts.length;
    const independentDays = [...new Set(independentAttempts.map((item) => isoDay(item.at)))];
    const last = sorted.at(-1);
    const secure = sorted.length >= 5
      && firstTrySuccesses / sorted.length >= 0.8
      && independentDays.length >= 2
      && last.correct && last.firstAttempt && last.independent && !last.hints;
    return [key, {
      skill: last.skill || last.gameId,
      item: last.item || 'general',
      attempts: sorted.length,
      firstTrySuccesses,
      accuracy: sorted.filter((item) => item.correct).length / sorted.length,
      independentDays,
      lastSeen: last.at,
      nextReview: new Date(new Date(last.at).getTime() + (secure ? 7 : 2) * 86400000).toISOString(),
      status: secure ? 'secure' : firstTrySuccesses > 0 ? 'practising' : 'starting',
    }];
  }));
};

export const migrateLegacySpellingProgress = (storage = canUseBrowserStorage()) => {
  const alreadyMigrated = readJson(storage, LEARNING_STORAGE_KEYS.migration, {});
  const legacy = readJson(storage, LEARNING_STORAGE_KEYS.legacySpelling, {});
  const mastery = { ...readJson(storage, LEARNING_STORAGE_KEYS.mastery, {}) };

  Object.entries(legacy).forEach(([word, record]) => {
    const independentDays = Array.isArray(record?.independentDays) ? record.independentDays : [];
    const key = `spelling:${word}`;
    if (mastery[key] && mastery[key].source !== 'spelling-v1') return;
    mastery[key] = {
      skill: 'spelling',
      item: word,
      attempts: Math.max(0, Number(record?.attempts) || 0),
      firstTrySuccesses: Math.max(0, Number(record?.independentFirstTry) || independentDays.length),
      independentDays,
      lastSeen: record?.lastSeen || independentDays.at(-1) || '',
      nextReview: record?.lastSeen ? new Date(new Date(record.lastSeen).getTime() + 7 * 86400000).toISOString() : '',
      status: independentDays.length >= 2 ? 'secure' : independentDays.length ? 'practising' : 'starting',
      source: 'spelling-v1',
    };
  });

  writeJson(storage, LEARNING_STORAGE_KEYS.mastery, mastery);
  writeJson(storage, LEARNING_STORAGE_KEYS.migration, { ...alreadyMigrated, spellingV1: alreadyMigrated.spellingV1 || new Date().toISOString() });
  return mastery;
};

export const getLearningAttempts = (storage = canUseBrowserStorage()) => (
  readJson(storage, LEARNING_STORAGE_KEYS.attempts, [])
);

export const recordLearningAttempt = (input, storage = canUseBrowserStorage()) => {
  const now = new Date().toISOString();
  const correct = typeof input.correct === 'boolean' ? input.correct : null;
  const attempt = {
    id: input.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameId: input.gameId,
    skill: input.skill || input.gameId,
    item: input.item || 'general',
    response: input.response ?? null,
    expected: input.expected ?? null,
    correct,
    firstAttempt: input.firstAttempt === true,
    hints: Math.max(0, Number(input.hints) || 0),
    independent: input.independent === true,
    difficulty: DIFFICULTY_BANDS.includes(input.difficulty) ? input.difficulty : 'starter',
    masteryEligible: input.masteryEligible !== false && !BONUS_GAME_IDS.includes(input.gameId),
    at: input.at || now,
  };
  const attempts = [...getLearningAttempts(storage), attempt].slice(-MAX_ATTEMPTS);
  writeJson(storage, LEARNING_STORAGE_KEYS.attempts, attempts);
  const existing = migrateLegacySpellingProgress(storage);
  writeJson(storage, LEARNING_STORAGE_KEYS.mastery, { ...existing, ...deriveMastery(attempts) });
  emitChange();
  return attempt;
};

export const recordLegacyGameEvent = (gameId, event, amountOrPayload = 1, storage = canUseBrowserStorage()) => {
  const payload = typeof amountOrPayload === 'object' && amountOrPayload !== null ? amountOrPayload : {};
  const hasLearningEvidence = typeof payload.correct === 'boolean';
  if (!hasLearningEvidence) return null;
  return recordLearningAttempt({
    gameId,
    skill: payload.skill || gameId,
    item: payload.item || event,
    response: payload.response,
    expected: payload.expected,
    correct: typeof payload.correct === 'boolean' ? payload.correct : null,
    firstAttempt: payload.firstAttempt === true,
    hints: payload.hints,
    independent: payload.independent === true,
    difficulty: payload.difficulty,
    masteryEligible: hasLearningEvidence && payload.masteryEligible !== false,
  }, storage);
};

export const getRecommendedDifficulty = (gameId, storage = canUseBrowserStorage()) => {
  const profile = getLearningProfile(storage);
  if (profile.difficultyOverrides[gameId]) return profile.difficultyOverrides[gameId];
  const recent = getLearningAttempts(storage).filter((attempt) => attempt.gameId === gameId && typeof attempt.correct === 'boolean').slice(-10);
  if (recent.length < 3) return 'starter';
  const independentSuccess = recent.filter((attempt) => attempt.correct && attempt.firstAttempt && attempt.independent && !attempt.hints).length / recent.length;
  if (recent.length >= 5 && independentSuccess >= 0.8) return 'challenge';
  if (independentSuccess >= 0.55) return 'growing';
  return 'starter';
};

const spellingFamily = (word) => word.length >= 2 ? `-${word.slice(-2)}` : word;

export const getLearningSnapshot = (storage = canUseBrowserStorage()) => {
  const profile = getLearningProfile(storage);
  const attempts = getLearningAttempts(storage);
  const mastery = { ...migrateLegacySpellingProgress(storage), ...deriveMastery(attempts) };
  const records = Object.values(mastery);
  const selectedSoundSet = new Set(profile.selectedSounds);
  const recognisedSounds = new Set(records.filter((item) => item.skill === 'phoneme-recognition' && item.status === 'secure').map((item) => item.item));
  const blending = records.filter((item) => item.skill === 'blending');
  const secureBlending = blending.filter((item) => item.status === 'secure').length;
  const secureWords = records.filter((item) => item.skill === 'spelling' && item.status === 'secure');
  const familyCounts = secureWords.reduce((result, item) => {
    const family = spellingFamily(item.item);
    result[family] = (result[family] || 0) + 1;
    return result;
  }, {});
  const strongestFamily = Object.entries(familyCounts).sort(([, a], [, b]) => b - a)[0];
  const confusions = attempts.reduce((result, item) => {
    if (item.correct === false && item.expected && item.response && item.expected !== item.response) {
      const key = `${item.expected}/${item.response}`;
      result[key] = (result[key] || 0) + 1;
    }
    return result;
  }, {});
  const commonConfusion = Object.entries(confusions).sort(([, a], [, b]) => b - a)[0];

  const outcomes = [
    `Recognises ${[...recognisedSounds].filter((sound) => selectedSoundSet.has(sound)).length} of ${profile.selectedSounds.length} selected sounds.`,
    blending.length ? `Can blend ${secureBlending} of ${blending.length} practised words independently.` : 'Blending evidence will appear after the first practice.',
    strongestFamily ? `Spells the ${strongestFamily[0]} family independently (${strongestFamily[1]} secure).` : 'Independent spelling families will appear after two successful days.',
    commonConfusion ? `Needs more practice distinguishing ${commonConfusion[0].replace('/', ' and ')}.` : 'No repeated sound confusions recorded yet.',
  ];

  return { profile, attempts, mastery, outcomes };
};

export const subscribeLearningProgress = (listener) => {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event) => {
    if (!event.key || Object.values(LEARNING_STORAGE_KEYS).includes(event.key)) listener();
  };
  window.addEventListener('amari-learning-progress', listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('amari-learning-progress', listener);
    window.removeEventListener('storage', onStorage);
  };
};
