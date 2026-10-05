import test from 'node:test';
import assert from 'node:assert/strict';
import { ODD_RULES, makeOddMission, makeOddRun, validateOddMission, markOddAnswer } from '../src/data/batch5Reasoning.js';

test('all authored rules have exactly one defensible odd item and one true named-rule reason across seeds', () => {
  assert.equal(ODD_RULES.length, 24);
  for (const rule of ODD_RULES) for (const seed of [1, 2, 13, 99, 0xffffffff]) {
    const mission = makeOddMission(rule.id, seed);
    assert.ok(validateOddMission(mission));
    assert.equal(mission.choices.filter((entry) => rule.predicate(entry)).length, 3);
    const answers = mission.choices.flatMap((entry) => mission.reasons.map((reason) => markOddAnswer(mission, entry.id, reason.id).correct));
    assert.equal(answers.filter(Boolean).length, 1);
    assert.equal(markOddAnswer(mission, 'not-a-rendered-item', 0).invalid, true);
  }
});
test('seeded runs freeze positions and six unique rules and avoid recent rules before finite-pool exhaustion', () => {
  for (const chapter of [0, 1, 2]) {
    const first = makeOddRun({ chapter, seed: 123 });
    assert.deepEqual(first, makeOddRun({ chapter, seed: 123 }));
    assert.equal(new Set(first.missions.map((entry) => entry.ruleId)).size, 6);
    assert.ok(Object.isFrozen(first.missions[0].choices));
    const recentRuleIds = first.missions.map((entry) => entry.ruleId);
    const replay = makeOddRun({ chapter, seed: 321, recentRuleIds });
    assert.ok(replay.missions.slice(0, 2).every((entry) => !recentRuleIds.includes(entry.ruleId)));
    assert.notDeepEqual(first.missions.map((entry) => entry.id), replay.missions.map((entry) => entry.id));
  }
});
test('tampered content, answer, grouping and reasons fail canonical validation', () => {
  const original = makeOddMission('colour:red', 17);
  for (const change of [
    { answerId: original.choices.find((entry) => entry.id !== original.answerId).id },
    { property: 'Find a different property.' },
    { reasonId: 2 },
    { choices: original.choices.map((entry, index) => index ? entry : { ...entry, colour: 'invented' }) },
    { reasons: original.reasons.map((entry) => entry.id ? entry : { ...entry, text: 'Anything different.' }) },
  ]) assert.equal(validateOddMission({ ...original, ...change }), false);
  assert.equal(makeOddRun({ chapter: 9, seed: 123 }).missions, undefined);
});
