import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTINENTS, CURRICULUM_MODULES, OCEANS, UK_SURROUNDING_SEAS, YEAR_ONE_JOURNEY, getCurriculumModule } from '../src/data/curriculumModules.js';

test('Curriculum Quest has three playable Year 1 modules at every difficulty', () => {
  assert.deepEqual(CONTINENTS.map((item) => item.id), ['africa', 'antarctica', 'asia', 'europe', 'north-america', 'south-america', 'australia']);
  assert.equal(OCEANS.length, 5);
  assert.deepEqual(YEAR_ONE_JOURNEY.map((item) => item.term), ['Autumn 1', 'Autumn 2', 'Spring 1', 'Spring 2', 'Summer 1', 'Summer 2']);
  assert.deepEqual(CURRICULUM_MODULES.map((module) => module.id), ['continents', 'time-detectives', 'nature-lab']);
  CURRICULUM_MODULES.forEach((module) => {
    ['starter', 'growing', 'challenge'].forEach((band) => {
      assert.ok(module.rounds[band].length > 0, `${module.id} has ${band} rounds`);
    });
  });
});

test('Curriculum Quest round answers refer to available choices', () => {
  const continentIds = new Set(CONTINENTS.map((item) => item.id));
  const oceanIds = new Set(OCEANS.map((item) => item.id));
  const choiceIds = new Set([...continentIds, ...oceanIds]);
  CURRICULUM_MODULES.forEach((module) => Object.values(module.rounds).flat().forEach((round) => {
    assert.ok(round.prompt && round.explanation, `${module.id}/${round.id} has learner-facing text`);
    if (round.answer) {
      const valid = round.type === 'ocean' ? oceanIds : round.type === 'country' || round.type === 'continent' ? continentIds : new Set((round.options || []).map((item) => item.id));
      assert.ok(valid.has(round.answer), `${module.id}/${round.id} answer is present`);
    }
    if (round.type === 'sequence') {
      assert.equal(new Set(round.items.map((item) => item.id)).size, round.items.length);
      assert.deepEqual([...round.items].sort((a, b) => a.order - b.order).map((item) => item.order), round.items.map((_, index) => index + 1));
    }
    if (round.type === 'route') {
      assert.ok(round.path.length >= 3);
      assert.ok(round.path.every((direction) => ['north', 'east', 'south', 'west'].includes(direction)));
    }
    if (round.type === 'investigation') {
      assert.ok(round.predictions.length >= 2);
      assert.ok(round.observation);
    }
    if (round.type === 'ocean' || round.type === 'continent' || round.type === 'country') assert.ok(choiceIds.size > 0);
  }));
  assert.equal(getCurriculumModule('missing').id, 'continents');
});

test('starter rounds give a full varied run before cycling', () => {
  CURRICULUM_MODULES.forEach((module) => {
    const starter = module.rounds.starter;
    assert.ok(starter.length >= 4, `${module.id} has enough starter variety`);
    assert.equal(new Set(starter.map((round) => round.id)).size, starter.length, `${module.id} starter ids are unique`);
    assert.equal(new Set(starter.map((round) => round.prompt)).size, starter.length, `${module.id} starter prompts are unique`);
  });
});

test('geography grows from place spotting into map enquiry and weather comparisons', () => {
  const geography = getCurriculumModule('continents');
  assert.equal(UK_SURROUNDING_SEAS.length, 4);
  assert.ok(geography.rounds.starter.every((round) => round.type !== 'uk-place'));
  assert.ok(geography.rounds.growing.some((round) => round.id === 'uk-england-capital'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'uk-sea-between'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'map-globe'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'map-aerial-view'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'map-plan-view'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'map-digital'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'weather-not-climate'));
  assert.ok(geography.rounds.challenge.some((round) => round.id === 'local-weather-boundary'));
});

test('history and science cover multi-step evidence and Year 1 statutory strands', () => {
  const history = getCurriculumModule('time-detectives');
  const science = getCurriculumModule('nature-lab');
  assert.ok(history.rounds.growing.some((round) => round.id === 'history-personal-sequence'));
  assert.ok(history.rounds.challenge.some((round) => round.id === 'history-compare-sources'));
  assert.ok(history.rounds.challenge.some((round) => round.id === 'history-local-change'));
  assert.ok(science.rounds.growing.some((round) => round.id === 'science-sense-eyes'));
  assert.ok(science.rounds.growing.some((round) => round.id === 'science-material-waterproof'));
  assert.ok(science.rounds.growing.some((round) => round.id === 'science-plant-evergreen'));
  assert.ok(science.rounds.growing.some((round) => round.id === 'science-season-record'));
  assert.ok(science.rounds.challenge.some((round) => round.type === 'investigation'));
  assert.ok(science.rounds.challenge.some((round) => round.id === 'science-fair-test'));
  [history, science].forEach((module) => {
    Object.values(module.rounds).forEach((rounds) => assert.equal(new Set(rounds.map((round) => round.id)).size, rounds.length, `${module.id} has unique round ids per band`));
  });
});
