import test from 'node:test';
import assert from 'node:assert/strict';
import { ASTRONAUT_CATEGORIES, ASTRONAUT_PROFILES } from '../src/data/index.js';
import { ASTRONAUT_MISSION_GROUPS, buildAstronautMissions, createAstronautOptions, createAstronautRun } from '../src/components/games/astronautMissions.js';

test('the three astronaut missions preserve every reviewed question and its source category', () => {
  const missions = buildAstronautMissions(ASTRONAUT_CATEGORIES);
  const bundledQuestions = missions.flatMap((mission) => mission.questions);
  const sourceQuestions = ASTRONAUT_CATEGORIES.flatMap((category) => category.items);

  assert.equal(missions.length, 3);
  assert.equal(bundledQuestions.length, sourceQuestions.length);
  assert.equal(new Set(bundledQuestions.map((item) => item.q)).size, sourceQuestions.length);

  for (const category of ASTRONAUT_CATEGORIES) {
    const bundledCategoryItems = bundledQuestions.filter((item) => item.sourceCategory.id === category.id);
    assert.equal(bundledCategoryItems.length, category.items.length, `${category.id} question count`);
    assert.deepEqual(bundledCategoryItems.map((item) => item.q), category.items.map((item) => item.q));
  }
});

test('Launch Lab is the single recommended first mission', () => {
  const recommended = ASTRONAUT_MISSION_GROUPS.filter((mission) => mission.recommended);
  assert.deepEqual(recommended.map((mission) => mission.id), ['launch-lab']);
  assert.deepEqual(recommended[0].categoryIds, ['numbers', 'shapes', 'body']);
});

test('every retained question has an age-appropriate learning fact', () => {
  const questions = buildAstronautMissions(ASTRONAUT_CATEGORIES).flatMap((mission) => mission.questions);
  for (const question of questions) {
    if (question.astronaut) {
      const profile = ASTRONAUT_PROFILES.find((person) => person.id === question.astronaut);
      assert.ok(profile?.funFact, `${question.q} hero fact`);
    } else {
      assert.ok(question.learningFact?.length > 20, `${question.q} learning fact`);
    }
  }
});

test('each mission starts a balanced five-question run and its next run avoids immediate repeats', () => {
  const missions = buildAstronautMissions(ASTRONAUT_CATEGORIES);
  const stableRandom = () => 0.37;

  for (const mission of missions) {
    const firstRun = createAstronautRun(mission, [], stableRandom);
    const nextRun = createAstronautRun(mission, firstRun.map((question) => question.questionId), stableRandom);
    const categoryCounts = new Map();
    for (const question of firstRun) {
      categoryCounts.set(question.sourceCategory.id, (categoryCounts.get(question.sourceCategory.id) ?? 0) + 1);
    }

    assert.equal(firstRun.length, 5, `${mission.id} first run length`);
    assert.equal(new Set(firstRun.map((question) => question.questionId)).size, 5, `${mission.id} unique first run`);
    assert.equal(nextRun.length, 5, `${mission.id} next run length`);
    assert.equal(new Set(nextRun.map((question) => question.questionId)).size, 5, `${mission.id} unique next run`);
    assert.equal(nextRun.some((question) => firstRun.some((previous) => previous.questionId === question.questionId)), false, `${mission.id} no immediate question repeats`);
    assert.ok(Math.max(...categoryCounts.values()) - Math.min(...categoryCounts.values()) <= 1, `${mission.id} balanced categories`);
  }
});

test('answer options shuffle at every difficulty while retaining exactly one correct answer', () => {
  const question = ASTRONAUT_CATEGORIES.find((category) => category.id === 'space').items[0];
  for (const difficulty of ['starter', 'growing', 'challenge']) {
    const answerPositions = new Set();
    for (let seed = 1; seed <= 80; seed += 1) {
      let state = seed;
      const random = () => {
        state = (state * 48271) % 2147483647;
        return (state - 1) / 2147483646;
      };
      const options = createAstronautOptions(question, difficulty, random);
      assert.equal(options.filter((option) => option.text === question.answer).length, 1);
      assert.equal(options.length, difficulty === 'starter' ? 3 : question.options.length);
      answerPositions.add(options.findIndex((option) => option.text === question.answer));
    }
    assert.ok(answerPositions.size > 1, `${difficulty} answer position changes`);
  }
});
