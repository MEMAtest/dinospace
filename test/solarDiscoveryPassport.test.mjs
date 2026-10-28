import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANETS } from '../src/data/index.js';
import {
  discoveredPlanetBadges,
  readDiscoveryPassport,
  saveDiscoveryPassport,
  seededPlanetOptions,
  solarPassportAwardTransitions,
} from '../src/data/solarDiscoveryPassport.js';

test('Solar discovery passport persists only valid completed facts and quizzes per child', () => {
  const map = new Map();
  const storage = { getItem: (key) => map.get(key), setItem: (key, value) => map.set(key, value) };
  const value = { facts: { 'Earth-0': true, 'Earth-99': true, 'MadeUp-0': true }, quizzes: { Earth: true, MadeUp: true } };
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, storage).persisted, true);
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), { facts: { 'Earth-0': true }, quizzes: { Earth: true } });
  assert.deepEqual(readDiscoveryPassport('askia', PLANETS, storage), { facts: {}, quizzes: {} });
  assert.equal(saveDiscoveryPassport('askia', PLANETS, { facts: { 'Mars-1': true }, quizzes: { Mars: true } }, storage).persisted, true);
  assert.deepEqual(readDiscoveryPassport('askia', PLANETS, storage), { facts: { 'Mars-1': true }, quizzes: { Mars: true } });
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), { facts: { 'Earth-0': true }, quizzes: { Earth: true } });
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, { setItem: () => { throw Error('Full'); } }), false);
});

test('Solar passport saves are monotonic and verify the write before reporting success', () => {
  const map = new Map([['amari_discovery_passport_v1', JSON.stringify({ facts: { 'Mars-0': true }, quizzes: { Mars: true } })]]);
  const storage = { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, value) };
  const committed = saveDiscoveryPassport('amari', PLANETS, { facts: { 'Earth-0': true }, quizzes: {} }, storage);
  assert.equal(committed.persisted, true);
  assert.deepEqual(committed.passport, { facts: { 'Earth-0': true, 'Mars-0': true }, quizzes: { Mars: true } });
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), {
    facts: { 'Earth-0': true, 'Mars-0': true }, quizzes: { Mars: true },
  });
  assert.equal(saveDiscoveryPassport('amari', PLANETS, { facts: {}, quizzes: {} }, { getItem: () => null, setItem: () => {} }), false);
});

test('Solar passport saves fail closed when the existing record cannot be read or parsed', () => {
  let writesAfterReadFailure = 0;
  const blockedRead = {
    getItem: () => { throw new Error('Storage read blocked'); },
    setItem: () => { writesAfterReadFailure += 1; },
  };
  assert.equal(saveDiscoveryPassport('amari', PLANETS, { facts: { 'Earth-0': true }, quizzes: {} }, blockedRead), false);
  assert.equal(writesAfterReadFailure, 0);

  const malformed = new Map([['amari_discovery_passport_v1', '{not-json']]);
  let malformedWrites = 0;
  const malformedStorage = {
    getItem: (key) => malformed.get(key) ?? null,
    setItem: (key, value) => { malformedWrites += 1; malformed.set(key, value); },
  };
  assert.equal(saveDiscoveryPassport('amari', PLANETS, { facts: { 'Earth-0': true }, quizzes: {} }, malformedStorage), false);
  assert.equal(malformedWrites, 0);
  assert.equal(malformed.get('amari_discovery_passport_v1'), '{not-json');
});

test('missing or empty player ids never read or write the Amari passport', () => {
  const map = new Map([['amari_discovery_passport_v1', JSON.stringify({ facts: { 'Earth-0': true }, quizzes: {} })]]);
  const storage = { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, value) };
  const before = map.get('amari_discovery_passport_v1');
  for (const playerId of [undefined, null, '', '   ']) {
    assert.deepEqual(readDiscoveryPassport(playerId, PLANETS, storage), { facts: {}, quizzes: {} });
    assert.equal(saveDiscoveryPassport(playerId, PLANETS, { facts: { 'Mars-0': true }, quizzes: {} }, storage), false);
  }
  assert.equal(map.get('amari_discovery_passport_v1'), before);
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), { facts: { 'Earth-0': true }, quizzes: {} });
});

test('blocked browser localStorage fails closed without throwing or claiming a save', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const blockedWindow = {};
  Object.defineProperty(blockedWindow, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: blockedWindow });
  try {
    assert.deepEqual(readDiscoveryPassport('amari', PLANETS), { facts: {}, quizzes: {} });
    assert.equal(saveDiscoveryPassport('amari', PLANETS, { facts: { 'Earth-0': true }, quizzes: {} }), false);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
  }
});

test('Every Solar badge requires three distinct discoveries per world', () => {
  assert.equal(PLANETS.length, 9);
  assert.equal(PLANETS.at(-1).name, 'Pluto');
  assert.match(PLANETS.at(-1).subtitle, /dwarf planet/i);
  for (const planet of PLANETS) {
    assert.ok(planet.facts.length >= 3);
    const facts = { [`${planet.name}-0`]: true, [`${planet.name}-1`]: true };
    assert.deepEqual(discoveredPlanetBadges(PLANETS, facts), []);
    facts[`${planet.name}-2`] = true;
    assert.deepEqual(discoveredPlanetBadges(PLANETS, facts), [planet.name]);
  }
});

test('Solar passport reward transitions are based on the committed before/after records', () => {
  const before = { facts: { 'Earth-0': true, 'Earth-1': true }, quizzes: {} };
  const completed = { facts: { ...before.facts, 'Earth-2': true }, quizzes: { Earth: true } };
  assert.deepEqual(solarPassportAwardTransitions(PLANETS, before, completed, 'Earth'), {
    planetBadgeEarned: true,
    challengeEarned: true,
  });
  assert.deepEqual(solarPassportAwardTransitions(PLANETS, completed, completed, 'Earth'), {
    planetBadgeEarned: false,
    challengeEarned: false,
  });
});

test('Solar challenge options are deterministic and contain one option per planet', () => {
  const choices = ['Mercury', 'Venus', 'Earth'];
  for (let seed = 1; seed <= 12; seed += 1) {
    const first = seededPlanetOptions(choices, seed);
    assert.deepEqual(seededPlanetOptions(choices, seed), first);
    assert.equal(new Set(first).size, choices.length);
    assert.deepEqual([...first].sort(), [...choices].sort());
  }
});

test('Solar answer order is a seeded permutation of the unique authored options', () => {
  const choices = ['Ice and rock', 'Fire', 'Clouds only', 'Fire'];
  const first = seededPlanetOptions(choices, 42);
  assert.deepEqual(first, seededPlanetOptions(choices, 42));
  assert.equal(first.length, 3);
  assert.deepEqual([...first].sort(), ['Clouds only', 'Fire', 'Ice and rock']);
  assert.notDeepEqual(first, seededPlanetOptions(choices, 43));
});
