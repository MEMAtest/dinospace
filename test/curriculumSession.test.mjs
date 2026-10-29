import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurriculumModule } from '../src/data/curriculumModules.js';
import {
  clearCurriculumSession, curriculumPreferenceStorageKey, curriculumSessionStorageKey,
  inspectCurriculumPreferences, inspectCurriculumSession, loadCurriculumPreferences,
  loadCurriculumSession, saveCurriculumPreferences, saveCurriculumSession,
} from '../src/data/curriculumSession.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};
const session = (overrides = {}) => ({
  difficulty: 'starter', seed: 921, order: [0, 1, 2, 3, 4], cursor: 0,
  complete: false, lessonOpen: false, locked: false, selected: '',
  feedback: 'A handwritten letter is older than a landline telephone.', feedbackVoice: '',
  mistakes: 1, sequence: [], routeStep: 0, prediction: '', ...overrides,
});

test('Curriculum preferences keep per-module levels, player isolation, and unknown metadata', () => {
  const storage = memoryStorage();
  storage.setItem(curriculumPreferenceStorageKey('amari'), JSON.stringify({ version: 1, moduleId: 'time-detectives', difficulties: {}, futureField: { keep: true } }));
  assert.equal(saveCurriculumPreferences(storage, 'amari', 'time-detectives', 'growing').status, 'saved');
  assert.equal(saveCurriculumPreferences(storage, 'amari', 'continents', 'challenge').status, 'saved');
  const raw = JSON.parse(storage.getItem(curriculumPreferenceStorageKey('amari')));
  assert.deepEqual(raw.difficulties, { 'time-detectives': 'growing', continents: 'challenge' });
  assert.deepEqual(raw.futureField, { keep: true });
  assert.deepEqual(loadCurriculumPreferences(storage, 'amari'), { moduleId: 'continents', difficulties: { 'time-detectives': 'growing', continents: 'challenge' } });
  assert.deepEqual(loadCurriculumPreferences(storage, 'askia'), { moduleId: '', difficulties: {} });
});

test('Unreadable preferences are distinguished and never overwritten with defaults', () => {
  const storage = memoryStorage();
  const key = curriculumPreferenceStorageKey('amari');
  storage.setItem(key, '{broken');
  assert.equal(inspectCurriculumPreferences(storage, 'amari').status, 'invalid');
  assert.equal(saveCurriculumPreferences(storage, 'amari', 'continents', 'starter').status, 'invalid');
  assert.equal(storage.getItem(key), '{broken');
});

test('Interrupted Curriculum round restores held fact and unknown session metadata', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('time-detectives').rounds.starter;
  const sequenceIndex = rounds.findIndex((round) => round.id === 'history-communication');
  const order = [sequenceIndex, ...rounds.map((_, index) => index).filter((index) => index !== sequenceIndex).slice(0, 4)];
  const saved = session({ order, locked: true, selected: 'smartphone', sequence: ['letter', 'telephone', 'smartphone'] });
  storage.setItem(curriculumSessionStorageKey('amari', 'time-detectives', 'starter'), JSON.stringify({ version: 1, moduleId: 'time-detectives', ...saved, futureField: 'keep' }));
  const loaded = loadCurriculumSession(storage, 'amari', 'time-detectives', rounds, 'starter');
  assert.deepEqual(loaded, { ...saved });
  assert.equal(inspectCurriculumSession(storage, 'amari', 'time-detectives', rounds, 'starter').status, 'record');
  const updated = saveCurriculumSession(storage, 'amari', 'time-detectives', rounds, { ...saved, feedback: 'New held feedback' });
  assert.equal(updated.status, 'saved');
  assert.equal(JSON.parse(storage.getItem(curriculumSessionStorageKey('amari', 'time-detectives', 'starter'))).futureField, 'keep');
  assert.equal(loadCurriculumSession(storage, 'amari', 'time-detectives', rounds, 'growing'), null);
});

test('Malformed or obsolete sessions fail closed and cannot be overwritten', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('continents').rounds.starter;
  const key = curriculumSessionStorageKey('amari', 'continents', 'starter');
  storage.setItem(key, JSON.stringify({ ...session(), version: 1, moduleId: 'continents', order: [0, 0] }));
  assert.equal(inspectCurriculumSession(storage, 'amari', 'continents', rounds, 'starter').status, 'invalid');
  assert.equal(saveCurriculumSession(storage, 'amari', 'continents', rounds, session()).status, 'invalid');
  assert.equal(storage.getItem(key), JSON.stringify({ ...session(), version: 1, moduleId: 'continents', order: [0, 0] }));
  assert.equal(clearCurriculumSession(storage, 'amari', 'continents'), true);
  assert.equal(inspectCurriculumSession(storage, 'amari', 'continents', rounds, 'starter').status, 'empty');
});

test('Sessions stay separate by player/module/band and save confirms exact readback', () => {
  const storage = memoryStorage();
  const rounds = getCurriculumModule('continents').rounds;
  assert.equal(saveCurriculumSession(storage, 'amari', 'continents', rounds.starter, session()).status, 'saved');
  assert.equal(saveCurriculumSession(storage, 'amari', 'continents', rounds.growing, session({ difficulty: 'growing', cursor: 2, locked: false })).status, 'saved');
  assert.equal(saveCurriculumSession(storage, 'askia', 'continents', rounds.starter, session({ seed: 55 })).status, 'saved');
  assert.equal(loadCurriculumSession(storage, 'amari', 'continents', rounds.starter, 'starter').seed, 921);
  assert.equal(loadCurriculumSession(storage, 'amari', 'continents', rounds.growing, 'growing').cursor, 2);
  assert.equal(loadCurriculumSession(storage, 'askia', 'continents', rounds.starter, 'starter').seed, 55);
  const mismatch = { getItem: () => null, setItem() {} };
  assert.equal(saveCurriculumSession(mismatch, 'child', 'continents', rounds.starter, session()).status, 'unconfirmed');
});

test('Unavailable storage is explicit rather than treated as an empty writable profile', () => {
  const brokenStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.equal(inspectCurriculumPreferences(brokenStorage, 'amari').status, 'unavailable');
  assert.equal(saveCurriculumPreferences(brokenStorage, 'amari', 'continents', 'starter').status, 'unavailable');
  assert.equal(inspectCurriculumSession(brokenStorage, 'amari', 'continents', getCurriculumModule('continents').rounds.starter, 'starter').status, 'unavailable');
  assert.equal(clearCurriculumSession(brokenStorage, 'amari', 'continents'), false);
});
