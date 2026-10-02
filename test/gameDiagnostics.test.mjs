import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_DIAGNOSTICS_KEY, GAME_LIFECYCLE_DIAGNOSTICS_KEY, readGameDiagnostics, recordGameDiagnostic } from '../src/data/gameDiagnostics.js';

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

test('run milestones retain seeds after frequent gameplay evicts the recent-event window', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  recordGameDiagnostic('puzzle', 'start', { seed: 123, level: 2, childName: 'private' }, storage);
  for (let round = 0; round < 350; round += 1) recordGameDiagnostic('puzzle', 'answer_correct', { round, seed: 123 }, storage);
  recordGameDiagnostic('puzzle', 'level_completed', { seed: 123, level: 2 }, storage);
  const exported = readGameDiagnostics(storage);
  assert.equal(exported.events.length, 300);
  assert.equal(exported.events.some((event) => event.event === 'start'), false);
  assert.deepEqual(exported.runMilestones.map(({ event, seed }) => ({ event, seed })), [
    { event: 'start', seed: 123 }, { event: 'level_completed', seed: 123 },
  ]);
  assert.equal(JSON.stringify(exported).includes('private'), false);
  recordGameDiagnostic('jet', 'level_complete', { seed: 456, level: 0 }, storage);
  assert.equal(readGameDiagnostics(storage).runMilestones.at(-1).event, 'level_complete');
  for (let seed = 0; seed < 105; seed += 1) recordGameDiagnostic('jet', 'start', { seed }, storage);
  const bounded = readGameDiagnostics(storage);
  assert.equal(bounded.runMilestones.length, 100);
  assert.equal(bounded.runMilestones[0].seed, 5);
  assert.equal(bounded.runMilestones.at(-1).seed, 104);
});

test('Puzzle and Spot hint types retain only their authored enum identifiers', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  recordGameDiagnostic('puzzle', 'hint', { hintType: 'next_piece', prompt: 'private' }, storage);
  recordGameDiagnostic('spot', 'hint', { hintType: 'magnifier', target: 'private' }, storage);
  assert.deepEqual(readGameDiagnostics(storage).events.map(({ hintType }) => hintType), ['next_piece', 'magnifier']);
  assert.equal(JSON.stringify(readGameDiagnostics(storage)).includes('private'), false);
});

test('exports sanitize legacy storage and tolerate missing or damaged milestone data', () => {
  const values = new Map([[GAME_DIAGNOSTICS_KEY, JSON.stringify([
    { game: 'letters', event: 'start', seed: 45, prompt: 'private prompt', childName: 'private name', at: 'private date' },
    null, { game: 'invalid game', event: 'start' },
  ])], [GAME_LIFECYCLE_DIAGNOSTICS_KEY, 'not json']]);
  const storage = { getItem: (key) => values.get(key) };
  assert.deepEqual(readGameDiagnostics(storage), {
    version: 2, retention: { recentEvents: 300, runMilestones: 100 },
    events: [{ game: 'letters', event: 'start', seed: 45 }], runMilestones: [],
  });
  assert.deepEqual(readGameDiagnostics({ getItem: () => { throw Error('blocked'); } }).events, []);
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
