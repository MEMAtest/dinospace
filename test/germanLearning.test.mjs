import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGermanModeRound, GERMAN_MODE_ITEMS, germanTranslation } from '../src/data/germanLearning.js';

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
