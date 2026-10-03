import test from 'node:test';
import assert from 'node:assert/strict';
import { COLOUR_TASKS, COLOUR_RECIPES, makeColourRun, mixClassroomColours, validateColourMission, markColourAnswer, colourChoiceLabel } from '../src/data/batch5Colour.js';

test('discrete colour model has symmetric authored recipes and rejects unsupported mixes', () => {
  for (const recipe of COLOUR_RECIPES) {
    assert.equal(mixClassroomColours(recipe.first, recipe.second), recipe.result);
    assert.equal(mixClassroomColours(recipe.second, recipe.first), recipe.result);
  }
  assert.equal(mixClassroomColours('orange', 'purple'), null);
});
test('three frozen chapters give six distinct missions, real labels and exactly one correct answer', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) for (let seed = 1; seed <= 100; seed += 1) {
    const run = makeColourRun({ chapter, seed });
    assert.equal(run.missions.length, 6);
    assert.equal(new Set(run.missions.map((entry) => entry.id)).size, 6);
    assert.ok(Object.isFrozen(run.missions));
    for (const mission of run.missions) {
      assert.ok(validateColourMission(mission));
      assert.equal(mission.choices.filter((choice) => markColourAnswer(mission, choice).correct).length, 1);
      assert.ok(mission.choices.every((choice) => colourChoiceLabel(mission, choice)));
      assert.deepEqual(markColourAnswer(mission, 'invented'), { valid: false, correct: false });
    }
  }
});
test('replay uses unseen tasks first, stays deterministic and rejects altered authored content', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const first = makeColourRun({ chapter, seed: 10 });
    assert.deepEqual(first, makeColourRun({ chapter, seed: 10 }));
    const recentTaskIds = first.missions.map((entry) => entry.id);
    const replay = makeColourRun({ chapter, seed: 20, recentTaskIds });
    const unseen = COLOUR_TASKS.filter((entry) => entry.chapter === chapter && !recentTaskIds.includes(entry.id));
    assert.ok(unseen.every((entry) => replay.missions.some((mission) => mission.id === entry.id)));
    assert.ok(!validateColourMission({ ...first.missions[0], fact: 'invented' }));
    assert.ok(!validateColourMission({ ...first.missions[0], answer: 'invented' }));
  }
  assert.equal(makeColourRun({ chapter: 4, seed: 1 }), null);
});
