import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEARNING_STORAGE_KEYS,
  getLearningSnapshot,
  getLearningProfile,
  getRecommendedDifficulty,
  migrateLegacySpellingProgress,
  recordLegacyGameEvent,
  recordLearningAttempt,
  setActivePhase,
  setDifficultyOverride,
} from '../src/data/learningProgress.js';

const storage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    dump: () => Object.fromEntries(values),
  };
};

test('phase selection includes prior taught sounds and never stores a birth date', () => {
  const store = storage();
  const profile = setActivePhase(3, store);
  assert.equal(profile.activePhase, 3);
  assert(profile.selectedSounds.includes('s'));
  assert(profile.selectedSounds.includes('ch'));
  assert.equal(profile.ageBand, '5-6');
  assert.equal('birthDate' in getLearningProfile(store), false);
});

test('legacy spelling mastery is preserved and migration is idempotent', () => {
  const store = storage({
    [LEARNING_STORAGE_KEYS.legacySpelling]: JSON.stringify({
      cat: { attempts: 3, independentFirstTry: 2, independentDays: ['2026-08-10', '2026-08-12'], lastSeen: '2026-08-12' },
    }),
  });
  const first = migrateLegacySpellingProgress(store);
  const second = migrateLegacySpellingProgress(store);
  assert.equal(first['spelling:cat'].status, 'secure');
  assert.deepEqual(second, first);
  assert(store.getItem(LEARNING_STORAGE_KEYS.legacySpelling));
  store.setItem(LEARNING_STORAGE_KEYS.legacySpelling, JSON.stringify({
    cat: { attempts: 3, independentFirstTry: 2, independentDays: ['2026-08-10', '2026-08-12'], lastSeen: '2026-08-12' },
    dog: { attempts: 1, independentFirstTry: 1, independentDays: ['2026-08-13'], lastSeen: '2026-08-13' },
  }));
  assert.equal(migrateLegacySpellingProgress(store)['spelling:dog'].status, 'practising');
});

test('mastery needs five independent first tries across two days', () => {
  const store = storage();
  const base = { gameId: 'words', skill: 'spelling', item: 'sat', correct: true, firstAttempt: true, independent: true, difficulty: 'starter' };
  ['2026-08-10T09:00:00.000Z', '2026-08-10T09:02:00.000Z', '2026-08-10T09:04:00.000Z', '2026-08-12T09:00:00.000Z'].forEach((at) => recordLearningAttempt({ ...base, at }, store));
  assert.equal(getLearningSnapshot(store).mastery['spelling:sat'].status, 'practising');
  recordLearningAttempt({ ...base, at: '2026-08-12T09:02:00.000Z' }, store);
  assert.equal(getLearningSnapshot(store).mastery['spelling:sat'].status, 'secure');
});

test('hints, retries and bonus games cannot create mastery', () => {
  const store = storage();
  for (let index = 0; index < 8; index += 1) {
    recordLearningAttempt({ gameId: 'hangman', skill: 'spelling', item: 'cat', correct: true, firstAttempt: true, independent: true, at: `2026-08-${10 + index}T09:00:00.000Z` }, store);
    recordLearningAttempt({ gameId: 'words', skill: 'spelling', item: 'dog', correct: true, firstAttempt: index > 3, independent: true, hints: index > 3 ? 1 : 0, at: `2026-08-${10 + index}T10:00:00.000Z` }, store);
  }
  const mastery = getLearningSnapshot(store).mastery;
  assert.equal(mastery['spelling:cat'], undefined);
  assert.notEqual(mastery['spelling:dog'].status, 'secure');
});

test('automatic difficulty is evidence-based and can be overridden or reset', () => {
  const store = storage();
  for (let index = 0; index < 5; index += 1) {
    recordLearningAttempt({ gameId: 'addition', item: `${index}`, correct: true, firstAttempt: true, independent: true, at: `2026-08-${10 + index}T09:00:00.000Z` }, store);
  }
  assert.equal(getRecommendedDifficulty('addition', store), 'challenge');
  setDifficultyOverride('addition', 'starter', store);
  assert.equal(getRecommendedDifficulty('addition', store), 'starter');
  setDifficultyOverride('addition', null, store);
  assert.equal(getRecommendedDifficulty('addition', store), 'challenge');
});

test('legacy completion counters do not become learning evidence', () => {
  const store = storage();
  recordLegacyGameEvent('addition', 'answer_correct', 1, store);
  assert.equal(getLearningSnapshot(store).attempts.length, 0);
  recordLegacyGameEvent('words', 'learning_attempt', {
    skill: 'spelling', item: 'sat', correct: true, firstAttempt: true, independent: true,
  }, store);
  assert.equal(getLearningSnapshot(store).attempts.length, 1);
});
