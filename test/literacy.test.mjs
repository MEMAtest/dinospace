import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_TAUGHT_GRAPHEMES,
  LITERACY_PROFILE_KEY,
  PHASE_WORDS,
  getAvailableWords,
  getTaughtGraphemes,
  isDecodableWith,
  makeLearningEvent,
} from '../src/data/literacy.js';

const makeStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('uses the canonical selectedSounds profile field', () => {
  globalThis.localStorage = makeStorage({
    [LITERACY_PROFILE_KEY]: JSON.stringify({ selectedSounds: ['s', 'a', 't', 'p'] }),
  });
  assert.deepEqual([...getTaughtGraphemes()], ['s', 'a', 't', 'p']);
  assert(getAvailableWords().every((word) => isDecodableWith(word)));
});

test('falls back safely when profile storage is unavailable or invalid', () => {
  globalThis.localStorage = makeStorage({ [LITERACY_PROFILE_KEY]: '{bad json' });
  assert.deepEqual([...getTaughtGraphemes()], DEFAULT_TAUGHT_GRAPHEMES);
});

test('Phase 3 words require their complete grapheme set', () => {
  const fish = PHASE_WORDS.find((word) => word.word === 'FISH');
  assert.equal(isDecodableWith(fish, new Set(['f', 'i', 's', 'h'])), false);
  assert.equal(isDecodableWith(fish, new Set(['f', 'i', 'sh'])), true);
});

test('learning events expose canonical firstAttempt and independence evidence', () => {
  const event = makeLearningEvent({ skill: 'spelling', item: 'SAT', response: 'SAT', correct: true, firstTry: true });
  assert.equal(event.firstAttempt, true);
  assert.equal(event.independent, true);
  assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});
