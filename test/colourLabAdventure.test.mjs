import test from 'node:test';
import assert from 'node:assert/strict';
import { COLOUR_LABS, COLOUR_LAB_MISSIONS, COLOUR_LAB_NARRATION, COLOUR_MAKE_RECIPE_CHOICES, seededColourMission, seededColourMissionOrder, colourRecipeCounts, colourRecipeMatches } from '../src/data/colourLabAdventure.js';
import { COLOUR_LAB_PROGRESS_KEY, completeColourMission, readColourLabProgress } from '../src/data/colourLabProgress.js';

test('Colour adventure has three six-mission chapters with answer choices that resolve to one recipe', () => {
  assert.deepEqual(COLOUR_LABS.map(({ id }) => id), ['mix', 'light', 'make']);
  for (const lab of COLOUR_LABS) {
    const missions = COLOUR_LAB_MISSIONS.filter((item) => item.lab === lab.id);
    assert.equal(missions.length, 6);
    for (const item of missions) {
      assert.ok(item.ingredients.length > 0, item.id);
      assert.equal(item.ingredients.length, item.proportions.length, item.id);
      assert.equal(item.options.filter((option) => option === item.answer).length, 1, item.id);
      assert.ok(item.resultColor);
      const recipe = colourRecipeCounts(item);
      assert.equal(colourRecipeMatches(item, recipe), true, item.id);
      assert.equal(colourRecipeMatches(item, { ...recipe, [item.ingredients[0]]: recipe[item.ingredients[0]] + 1 }), false, item.id);
      assert.equal(new Set(item.options).size, item.options.length, item.id);
      for (const proportion of item.proportions) assert.match(proportion, /^\d+ scoop(s)? (red|yellow|blue|white|black)$/i, item.id);
    }
  }
});

test('seeded recipe rotation is stable and skips the just-seen mission when alternatives exist', () => {
  for (const lab of COLOUR_LABS) {
    const orderA = seededColourMissionOrder(lab.id, 123, ['mix-orange']);
    assert.deepEqual(seededColourMissionOrder(lab.id, 123, ['mix-orange']).map(({ id }) => id), orderA.map(({ id }) => id));
    assert.equal(new Set(orderA.map(({ id }) => id)).size, 6);
    assert.notEqual(orderA[0].id, 'mix-orange');
    const first = seededColourMission(3, lab.id);
    assert.equal(seededColourMission(3, lab.id).id, first.id);
    const next = seededColourMission(4, lab.id, [first.id]);
    assert.notEqual(next.id, first.id);
  }
});

test('chapter progress is isolated by player and records a chapter on its final correct recipe', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const chapter = COLOUR_LAB_MISSIONS.filter((item) => item.lab === 'mix');
  for (const item of chapter.slice(0, -1)) {
    const saved = completeColourMission('player-a', item.id, 'mix', chapter.map(({ id }) => id), storage);
    assert.deepEqual(saved.chapters, []);
    assert.equal(saved.persisted, true);
    assert.equal(saved.newlyCompleted, true);
  }
  const saved = completeColourMission('player-a', chapter.at(-1).id, 'mix', chapter.map(({ id }) => id), storage);
  assert.deepEqual(saved.chapters, ['mix']);
  assert.equal(saved.newlyCompleted, true);
  assert.equal(readColourLabProgress('player-b', storage).completed.length, 0);
  const replay = completeColourMission('player-a', chapter.at(-1).id, 'mix', chapter.map(({ id }) => id), storage);
  assert.equal(replay.completed.length, 6);
  assert.equal(replay.newlyCompleted, false);
});

test('Narration inventory has one exact prompt, clue and worked explanation per mission', () => {
  assert.equal(COLOUR_LAB_NARRATION.length, 54);
  assert.equal(new Set(COLOUR_LAB_NARRATION.map(({ text }) => text)).size, 54);
  for (const purpose of ['prompt', 'clue', 'explanation']) {
    assert.equal(COLOUR_LAB_NARRATION.filter((line) => line.purpose === purpose).length, 18);
  }
  for (const line of COLOUR_LAB_NARRATION) assert.ok(COLOUR_LAB_MISSIONS.some((item) => item.id === line.missionId));
  assert.ok(COLOUR_LAB_MISSIONS.every(({ prompt }) => !/will .* make/i.test(prompt)));
});

test('Lightness questions have a visible blend name but test only the direction of the change', () => {
  const lightMissions = COLOUR_LAB_MISSIONS.filter(({ lab }) => lab === 'light');
  assert.equal(lightMissions.filter((item) => item.answer === 'Lighter').length, 3);
  assert.equal(lightMissions.filter((item) => item.answer === 'Darker').length, 3);
  for (const item of lightMissions) {
    assert.ok(['Lighter', 'Darker'].includes(item.answer));
    assert.ok(['Pink', 'Sky Blue', 'Pale Grey', 'Dark Red', 'Navy', 'Grey'].includes(item.resultColor));
    assert.deepEqual(item.options, ['Lighter', 'Darker', 'No change']);
  }
});

test('picture application offers three recipe cards with equal scoop totals and one target recipe', () => {
  for (const item of COLOUR_LAB_MISSIONS.filter(({ lab }) => lab === 'make')) {
    const choices = COLOUR_MAKE_RECIPE_CHOICES[item.id];
    assert.equal(choices.length, 3, item.id);
    const totals = choices.map(({ scoops }) => Object.values(scoops).reduce((sum, count) => sum + count, 0));
    assert.equal(new Set(totals).size, 1, item.id);
    assert.equal(choices.filter(({ color }) => color === item.answer).length, 1, item.id);
    for (const choice of choices) assert.ok(Object.values(choice.scoops).every((count) => count > 0), item.id);
  }
});

test('A saved chapter cannot be forged with unknown mission ids or a mismatched chapter', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  values.set(COLOUR_LAB_PROGRESS_KEY + ':player-a', JSON.stringify({ version: 1, completed: ['made-up-mission'], chapters: ['mix'], recentMissionIds: ['made-up-mission'] }));
  const clean = readColourLabProgress('player-a', storage);
  assert.deepEqual(clean.completed, []);
  assert.deepEqual(clean.chapters, []);
  assert.deepEqual(clean.recentMissionIds, []);
  assert.deepEqual(completeColourMission('player-a', 'mix-orange', 'light', [], storage).completed, []);
});

test('foreign progress schemas are rejected and failed writes cannot award progress', () => {
  const values = new Map([[`${COLOUR_LAB_PROGRESS_KEY}:player-a`, JSON.stringify({ version: 2, completed: ['mix-orange'] })]]);
  const storage = { getItem: (key) => values.get(key) || null, setItem: () => { throw new Error('quota exceeded'); } };
  assert.deepEqual(readColourLabProgress('player-a', storage).completed, []);
  const result = completeColourMission('player-a', 'mix-orange', 'mix', [], storage);
  assert.equal(result.persisted, false);
  assert.equal(result.newlyCompleted, false);
  assert.deepEqual(result.completed, []);
  assert.deepEqual(readColourLabProgress('player-a', storage).completed, []);
});
