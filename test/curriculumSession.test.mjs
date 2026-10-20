import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurriculumModule } from '../src/data/curriculumModules.js';
import {
  clearCurriculumSession,
  loadCurriculumPreferences,
  loadCurriculumSession,
  saveCurriculumPreferences,
  saveCurriculumSession,
} from '../src/data/curriculumSession.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('Curriculum preferences keep the last module and per-module level', () => {
  const storage = memoryStorage();
  saveCurriculumPreferences(storage, 'child-1', 'time-detectives', 'growing');
  saveCurriculumPreferences(storage, 'child-1', 'continents', 'challenge');
  const preferences = loadCurriculumPreferences(storage, 'child-1');
  assert.equal(preferences.moduleId, 'continents');
  assert.deepEqual(preferences.difficulties, { 'time-detectives': 'growing', continents: 'challenge' });
});

test('an interrupted Curriculum round restores its exact question and held fact state', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('time-detectives').rounds.starter;
  const sequenceIndex = rounds.findIndex((round) => round.id === 'history-communication');
  const session = {
    difficulty: 'starter', seed: 921, order: [sequenceIndex, 0, 1, 3, 4], cursor: 0,
    complete: false, lessonOpen: false, locked: true, selected: 'smartphone',
    feedback: 'A handwritten letter is older than a landline telephone.',
    feedbackVoice: '', mistakes: 1, sequence: ['letter', 'telephone', 'smartphone'],
    routeStep: 0, prediction: '',
  };
  saveCurriculumSession(storage, 'child-1', 'time-detectives', session);
  assert.deepEqual(loadCurriculumSession(storage, 'child-1', 'time-detectives', rounds, 'starter'), session);
  assert.equal(loadCurriculumSession(storage, 'child-1', 'time-detectives', rounds, 'growing'), null);
});

test('invalid or obsolete Curriculum sessions are rejected and can be cleared', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('continents').rounds.starter;
  saveCurriculumSession(storage, 'child-1', 'continents', {
    difficulty: 'starter', seed: 3, order: [0, 0], cursor: 0, complete: false,
    lessonOpen: true, locked: false, selected: '', feedback: '', feedbackVoice: '',
    mistakes: 0, sequence: [], routeStep: 0, prediction: '',
  });
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds, 'starter'), null);
  assert.equal(clearCurriculumSession(storage, 'child-1', 'continents'), true);
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds, 'starter'), null);
});

test('sessions remain available independently for each saved level', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('continents').rounds;
  const baseSession = {
    seed: 3, order: [0, 1, 2, 3, 4], cursor: 1, complete: false,
    lessonOpen: false, locked: false, selected: '', feedback: '', feedbackVoice: '',
    mistakes: 0, sequence: [], routeStep: 0, prediction: '',
  };
  saveCurriculumSession(storage, 'child-1', 'continents', { ...baseSession, difficulty: 'starter' });
  saveCurriculumSession(storage, 'child-1', 'continents', { ...baseSession, difficulty: 'growing', cursor: 2 });
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds.starter, 'starter').cursor, 1);
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds.growing, 'growing').cursor, 2);
  clearCurriculumSession(storage, 'child-1', 'continents', 'starter');
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds.starter, 'starter'), null);
  assert.equal(loadCurriculumSession(storage, 'child-1', 'continents', rounds.growing, 'growing').cursor, 2);
});

test('storage failures degrade to empty preferences and unavailable writes', () => {
  const brokenStorage = {
    getItem() { throw new Error('storage blocked'); },
    setItem() { throw new Error('storage blocked'); },
    removeItem() { throw new Error('storage blocked'); },
  };
  assert.deepEqual(loadCurriculumPreferences(brokenStorage, 'child-1'), { moduleId: '', difficulties: {} });
  assert.equal(saveCurriculumPreferences(brokenStorage, 'child-1', 'continents', 'starter'), false);
  assert.equal(clearCurriculumSession(brokenStorage, 'child-1', 'continents'), false);
});
