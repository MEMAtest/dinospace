import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANETS } from '../src/data/index.js';
import {
  discoveredPlanetBadges,
  readDiscoveryPassport,
  saveDiscoveryPassport,
  seededPlanetOptions,
} from '../src/data/solarDiscoveryPassport.js';

test('Solar discovery passport persists only valid completed facts and quizzes for Amari', () => {
  const map = new Map();
  const storage = { getItem: (key) => map.get(key), setItem: (key, value) => map.set(key, value) };
  const value = { facts: { 'Earth-0': true, 'Earth-99': true, 'MadeUp-0': true }, quizzes: { Earth: true, MadeUp: true } };
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, storage), true);
  assert.deepEqual(readDiscoveryPassport('amari', PLANETS, storage), { facts: { 'Earth-0': true }, quizzes: { Earth: true } });
  assert.deepEqual(readDiscoveryPassport('askia', PLANETS, storage), { facts: {}, quizzes: {} });
  assert.equal(saveDiscoveryPassport('askia', PLANETS, value, storage), false);
  assert.equal(saveDiscoveryPassport('amari', PLANETS, value, { setItem: () => { throw Error('Full'); } }), false);
});

test('Every Solar badge requires three distinct discoveries per planet', () => {
  assert.equal(PLANETS.length, 9);
  for (const planet of PLANETS) {
    assert.ok(planet.facts.length >= 3);
    const facts = { [`${planet.name}-0`]: true, [`${planet.name}-1`]: true };
    assert.deepEqual(discoveredPlanetBadges(PLANETS, facts), []);
    facts[`${planet.name}-2`] = true;
    assert.deepEqual(discoveredPlanetBadges(PLANETS, facts), [planet.name]);
  }
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
