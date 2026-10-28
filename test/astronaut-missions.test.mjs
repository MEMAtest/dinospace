import test from 'node:test';
import assert from 'node:assert/strict';
import { ASTRONAUT_CATEGORIES, ASTRONAUT_PROFILES } from '../src/data/index.js';
import { ASTRONAUT_MISSION_GROUPS, buildAstronautMissions, createAstronautOptions, createAstronautRun, createSeededRandom, createAstronautSeed } from '../src/components/games/astronautMissions.js';
import { completeAstronautChapter, readAstronautProgress, recordAstronautResult, saveAstronautRun, ASTRONAUT_PROGRESS_KEY } from '../src/data/astronautProgress.js';

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

test('each mission has five unique balanced questions plus its forced transfer project', () => {
  const missions = buildAstronautMissions(ASTRONAUT_CATEGORIES);
  const stableRandom = () => 0.37;

  for (const mission of missions) {
    const firstRun = createAstronautRun(mission, [], stableRandom);
    const nextRun = createAstronautRun(mission, firstRun.map((question) => question.questionId), stableRandom);
    const categoryCounts = new Map();
    for (const question of firstRun) {
      categoryCounts.set(question.sourceCategory.id, (categoryCounts.get(question.sourceCategory.id) ?? 0) + 1);
    }

    assert.equal(firstRun.length, 6, `${mission.id} first run length`);
    assert.equal(new Set(firstRun.map((question) => question.questionId)).size, 6, `${mission.id} unique first run`);
    assert.equal(nextRun.length, 6, `${mission.id} next run length`);
    assert.equal(new Set(nextRun.map((question) => question.questionId)).size, 6, `${mission.id} unique next run`);
    assert.ok(Math.max(...categoryCounts.values()) - Math.min(...categoryCounts.values()) <= 1, `${mission.id} balanced categories`);
    assert.equal(firstRun[5].questionId, mission.transferProject.questionId, `${mission.id} transfer project is last`);
    assert.equal(firstRun[5].transferProject.id, mission.transferProject.id);
    assert.equal(new Set(firstRun.slice(0, 5).map((question) => question.questionId)).size, 5, `${mission.id} ordinary questions are unique`);
    assert.equal(firstRun.slice(0, 5).some((question) => question.questionId === mission.transferProject.questionId), false, `${mission.id} project is not duplicated before its final slot`);
    assert.ok(nextRun.slice(0, 5).every((question) => !firstRun.slice(0, 5).some((previous) => previous.questionId === question.questionId)), `${mission.id} ordinary questions avoid recent repeats`);
    const missed = mission.questions.find((item) => item.questionId !== mission.transferProject.questionId).conceptId;
    const review = createAstronautRun(mission, [missed], stableRandom, [missed]);
    assert.ok(review.some((item) => item.conceptId === mission.questions[0].conceptId), `${mission.id} includes missed concept in later run`);
  }
});

test('missed recent concepts override recent avoidance and clear only after an independent later solve', () => {
  const mission = buildAstronautMissions(ASTRONAUT_CATEGORIES)[0];
  const concept = mission.questions.find((question) => question.questionId === 'numbers:0');
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  recordAstronautResult('review-child', mission.id, concept.conceptId, false, storage);
  recordAstronautResult('review-child', mission.id, concept.conceptId, false, storage);
  assert.ok(readAstronautProgress('review-child', storage).missedConceptIdsByChapter[mission.id].includes(concept.conceptId), 'wrong then correct remains pending');
  const run = createAstronautRun(mission, [concept.questionId], createSeededRandom(45), readAstronautProgress('review-child', storage).missedConceptIdsByChapter[mission.id]);
  assert.ok(run.some((question) => question.conceptId === concept.conceptId), 'recent missed item is reviewed next despite the repeat-avoid list');
  recordAstronautResult('review-child', mission.id, concept.conceptId, true, storage);
  assert.equal(readAstronautProgress('review-child', storage).missedConceptIdsByChapter[mission.id].includes(concept.conceptId), false, 'later independent correct clears pending review');
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

test('numeric seed independently freezes question and choice order', () => {
  const mission = buildAstronautMissions(ASTRONAUT_CATEGORIES)[0];
  const make = (seed) => createAstronautRun(mission, [], createSeededRandom(seed)).map((question, index) => [question.questionId, createAstronautOptions(question, 'growing', createSeededRandom(seed ^ ((index + 1) * 0x9e3779b9))).map((option) => option.text)]);
  assert.deepEqual(make(87231), make(87231));
  assert.notDeepEqual(make(87231), make(87232));
});

test('each Start can use a fresh numeric uint32 seed', () => {
  for (let index = 0; index < 10; index += 1) {
    const seed = createAstronautSeed();
    assert.equal(Number.isInteger(seed), true);
    assert.ok(seed > 0 && seed <= 0xffffffff);
  }
});

test('progress is child scoped, validated, unlocks in order and grants each chapter reward once', () => {
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  const initial = readAstronautProgress('child-a', storage);
  assert.equal(initial.unlockedChapterIndex, 0);
  assert.equal(completeAstronautChapter('child-a', 'space-explorers', storage).persisted, false);
  const mission = buildAstronautMissions(ASTRONAUT_CATEGORIES)[0];
  const queue = createAstronautRun(mission, [], () => 0.5).map((question) => question.questionId);
  assert.equal(saveAstronautRun('child-a', mission.id, queue, storage).persisted, true);
  recordAstronautResult('child-a', mission.id, queue[0], false, storage);
  assert.ok(readAstronautProgress('child-a', storage).missedConceptIdsByChapter[mission.id].includes(queue[0]));
  const completed = completeAstronautChapter('child-a', mission.id, storage);
  assert.equal(completed.newlyEarnedReward, true);
  assert.equal(completeAstronautChapter('child-a', mission.id, storage).newlyEarnedReward, false);
  assert.equal(readAstronautProgress('child-a', storage).unlockedChapterIndex, 1);
  assert.equal(readAstronautProgress('child-b', storage).completedChapterIds.length, 0);
  store.set(ASTRONAUT_PROGRESS_KEY, JSON.stringify({ version: 1, players: { 'child-a': { completedChapterIds: ['space-explorers', 'unknown'], missedConceptIdsByChapter: { 'launch-lab': ['shapes:999', 'shapes:0'] } } } }));
  const validated = readAstronautProgress('child-a', storage);
  assert.deepEqual(validated.completedChapterIds, []);
  assert.deepEqual(validated.missedConceptIdsByChapter['launch-lab'], ['shapes:0']);
});

test('failed persistence withholds badge and reward, and retry can complete it', () => {
  let blocked = true;
  const storage = { getItem: () => null, setItem: () => { if (blocked) throw new Error('quota'); } };
  const failed = completeAstronautChapter('child', 'launch-lab', storage);
  assert.equal(failed.persisted, false);
  assert.equal(failed.newlyEarnedReward, false);
  blocked = false;
  const retried = completeAstronautChapter('child', 'launch-lab', storage);
  assert.equal(retried.persisted, true);
  assert.equal(retried.newlyEarnedReward, true);
});

test('missing or read-only storage never claims a saved run, result, badge, unlock or reward', () => {
  const mission = buildAstronautMissions(ASTRONAUT_CATEGORIES)[0];
  const queue = createAstronautRun(mission, [], () => 0.5).map((question) => question.questionId);
  for (const storage of [null, { getItem: () => null }]) {
    assert.equal(saveAstronautRun('offline-child', mission.id, queue, storage).persisted, false);
    assert.equal(recordAstronautResult('offline-child', mission.id, queue[0], false, storage).persisted, false);
    const completion = completeAstronautChapter('offline-child', mission.id, storage);
    assert.equal(completion.persisted, false);
    assert.equal(completion.newlyEarnedReward, false);
    assert.deepEqual(completion.completedChapterIds, []);
    assert.equal(completion.unlockedChapterIndex, 0);
  }
});

test('progress writes reject locked chapter queues and missed results', () => {
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  const locked = buildAstronautMissions(ASTRONAUT_CATEGORIES)[1];
  const queue = createAstronautRun(locked, [], () => 0.5).map((question) => question.questionId);
  assert.equal(saveAstronautRun('child', locked.id, queue, storage).persisted, false);
  assert.equal(recordAstronautResult('child', locked.id, queue[0], false, storage).persisted, false);
  assert.deepEqual(readAstronautProgress('child', storage).recentQuestionIdsByChapter[locked.id], []);
});

// Repeated play exhausts the wider history window. Older seen questions remain
// preferable to the preceding run, apart from the authored final project.
test('sustained replay exhausts oldest history before repeating the preceding ordinary questions', () => {
  for (const mission of buildAstronautMissions(ASTRONAUT_CATEGORIES)) {
    let history = [], previous = [];
    for (let seed = 1; seed <= 80; seed += 1) {
      const run = createAstronautRun(mission, history, createSeededRandom(seed));
      for (const categoryId of mission.categoryIds) {
        const ordinary = run.slice(0, 5).filter(q => q.sourceCategory.id === categoryId);
        const eligibleFresh = mission.questions.filter(q => q.sourceCategory.id === categoryId && q.questionId !== mission.transferProject.questionId && !previous.includes(q.questionId));
        assert.equal(ordinary.filter(q => !previous.includes(q.questionId)).length, Math.min(ordinary.length, eligibleFresh.length), mission.id + ' run ' + seed);
      }
      const ids = run.map(q => q.questionId);
      history = [...history.filter(id => !ids.includes(id)), ...ids].slice(-12);
      previous = ids;
    }
  }
});
