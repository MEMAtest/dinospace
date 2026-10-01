import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_DIAGNOSTICS_KEY, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';

test('diagnostics retain bounded outcomes without authored or personal content', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  for (let round = 0; round < 305; round += 1) {
    assert.equal(recordGameDiagnostic('letters', 'answer_correct', { round, firstAttempt: true, prompt: 'private text', childName: 'child', level: 2 }, storage), true);
  }
  const entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY));
  assert.equal(entries.length, 300);
  assert.equal(entries[0].round, 5);
  assert.equal(entries.at(-1).level, 2);
  assert.equal(entries.at(-1).firstAttempt, true);
  assert.equal('prompt' in entries[0], false);
  assert.equal('childName' in entries[0], false);
});

test('unavailable storage cannot break gameplay', () => {
  assert.equal(recordGameDiagnostic('letters', 'answer_correct', {}, { getItem: () => { throw Error('blocked'); } }), false);
});

test('diagnostic hint types keep audio help measurable without storing its authored text', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  recordGameDiagnostic('worldmap-continents', 'hint', {
    level: 1,
    round: 2,
    seed: 1234,
    difficulty: 'growing',
    hintType: 'explanation',
    prompt: 'A private authored prompt',
  }, storage);
  recordGameDiagnostic('german', 'hint', { hintType: 'A private authored prompt' }, storage);
  const entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY));
  assert.deepEqual(entries[0], {
    at: entries[0].at,
    game: 'worldmap-continents',
    event: 'hint',
    level: 1,
    round: 2,
    seed: 1234,
    difficulty: 'growing',
    hintType: 'explanation',
  });
  assert.equal('hintType' in entries[1], false);
  assert.equal('prompt' in entries[0], false);
});

test('diagnostics retain only numeric Storybook page positions including the cover sentinel', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  recordGameDiagnostic('storybooks', 'scene', { seed: 99, round: 0, pageIndex: -1, title: 'child-authored title' }, storage);
  recordGameDiagnostic('storybooks', 'scene', { pageIndex: 'page one' }, storage);
  const entries = JSON.parse(storage.getItem(GAME_DIAGNOSTICS_KEY));
  assert.equal(entries[0].pageIndex, -1);
  assert.equal(entries[0].seed, 99);
  assert.equal('title' in entries[0], false);
  assert.equal('pageIndex' in entries[1], false);
});
