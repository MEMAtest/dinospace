import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGermanModeRound, buildSeededGermanRound, loadGermanTargetHistory, saveGermanTargetHistory, germanHistoryMode, rememberGermanTarget, GERMAN_MODE_ITEMS, germanTranslation } from '../src/data/germanLearning.js';

test('every German Garage word has a clear English meaning', () => {
  Object.entries(GERMAN_MODE_ITEMS).forEach(([mode, items]) => {
    items.forEach((item) => assert.ok(germanTranslation(mode, item.name), `${mode}/${item.name} needs a translation`));
  });
});

test('German Garage rounds contain one valid answer and shuffled unique options', () => {
  Object.entries(GERMAN_MODE_ITEMS).forEach(([mode, items]) => {
    [3, 4, 6].forEach((count) => {
      const round = buildGermanModeRound(mode, [], count, () => 0.42);
      assert.ok(round.options.some((option) => option.name === round.target.name), `${mode} includes its answer`);
      assert.equal(new Set(round.options.map((option) => option.name)).size, round.options.length, `${mode} options are unique`);
      assert.equal(round.options.length, Math.min(count, items.length));
      assert.equal(round.translation, germanTranslation(mode, round.target.name));
    });
  });
});

test('German Garage avoids repeating targets until the mode word pool is exhausted', () => {
  Object.entries(GERMAN_MODE_ITEMS).forEach(([mode, items]) => {
    let recent = [];
    const seen = [];
    for (let index = 0; index < items.length; index += 1) {
      const round = buildGermanModeRound(mode, recent, 3, () => 0);
      seen.push(round.target.name);
      recent = [...recent, round.target.name].slice(-(items.length - 1));
    }
    assert.equal(new Set(seen).size, items.length, `${mode} completes a full no-repeat cycle`);
  });
});


test('German seeded questions are reproducible and vary targets and answer positions', () => {
  for (const mode of Object.keys(GERMAN_MODE_ITEMS)) {
    const signatures = new Set();
    const positions = new Set();
    for (let seed = 0; seed < 30; seed += 1) {
      const a = buildSeededGermanRound(mode, [], 4, seed, 0);
      assert.deepEqual(a, buildSeededGermanRound(mode, [], 4, seed, 0));
      signatures.add(`${a.target.name}:${a.options.map((item) => item.name).join(',')}`);
      positions.add(a.options.findIndex((item) => item.name === a.target.name));
    }
    assert.ok(signatures.size > 10, `${mode} varies across runs`);
    assert.equal(positions.size, 4, `${mode} can place its answer in each slot`);
  }
});

test('German completed history survives remounts, remains child-specific and excludes unavailable targets', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const mode = 'directions';
  const names = GERMAN_MODE_ITEMS[mode].map((item) => item.name);
  saveGermanTargetHistory('qa-child-a', { [mode]: [...names.slice(0, 3), 'not-a-term'] }, storage);
  const history = loadGermanTargetHistory('qa-child-a', storage);
  assert.deepEqual(history[mode], names.slice(0, 3));
  assert.deepEqual(loadGermanTargetHistory('qa-child-b', storage)[mode], []);
  for (let seed = 0; seed < 20; seed += 1) {
    assert.ok(!history[mode].includes(buildSeededGermanRound(mode, history[mode], 6, seed, 0).target.name));
  }
  saveGermanTargetHistory('qa-child-a', { [mode]: names }, storage);
  assert.equal(loadGermanTargetHistory('qa-child-a', storage)[mode].length, names.length - 1);
  assert.deepEqual(loadGermanTargetHistory('qa-child-a', { getItem: () => '{invalid' }), {});
  assert.doesNotThrow(() => saveGermanTargetHistory('qa-child-a', history, { setItem: () => { throw Error('unavailable'); } }));
});


test('alternating paint and parking avoid recent shared colours across reloads', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  for (let seed = 0; seed < 30; seed += 1) {
    let history = {};
    const seen = new Set();
    for (let cursor = 0; cursor < 8; cursor += 1) {
      const mode = cursor % 2 ? 'park' : 'paint';
      const round = buildSeededGermanRound(mode, history[germanHistoryMode(mode)] || [], 3, seed, cursor);
      assert.ok(!seen.has(round.target.name), `seed ${seed} repeated ${round.target.name} across colour scenes`);
      seen.add(round.target.name);
      history = rememberGermanTarget(history, mode, round.target.name);
      saveGermanTargetHistory('colour-child', history, storage);
      history = loadGermanTargetHistory('colour-child', storage);
    }
  }
  saveGermanTargetHistory('legacy-colour-child', { paint: ['Rot'], park: ['Blau'] }, storage);
  assert.deepEqual(loadGermanTargetHistory('legacy-colour-child', storage).colours, ['Rot', 'Blau']);
});
