import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMonsterMathRun, isValidMonsterRun, MONSTER_MATH_EPISODES, MONSTER_QUESTION_POOLS,
  monsterCountResultText, monsterCounterPhrase, numberLineInstruction, tenFrameAccessibleLabel, tenFrameCellModel, tenFrameExplanation,
} from '../src/data/monsterMathEpisodes.js';
import {
  getMonsterMathProgress, monsterMathRewardCallbackUnits, recordMonsterEpisodeCompletion, rememberMonsterMathRun, recentMonsterQuestionIds,
} from '../src/data/monsterMathProgress.js';

const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('Monster Math has three distinct age-appropriate episodes and broad question pools', () => {
  assert.deepEqual(MONSTER_MATH_EPISODES.map((episode) => episode.title), ['Count to 10', 'Add and Take Away', 'Monster Story Problems']);
  assert.equal(MONSTER_QUESTION_POOLS.length, 3);
  assert.ok(MONSTER_QUESTION_POOLS[0].length >= 100);
  assert.ok(MONSTER_QUESTION_POOLS[1].length > 250);
  assert.ok(MONSTER_QUESTION_POOLS[2].length > 2000);
  assert.ok(MONSTER_QUESTION_POOLS.every((pool) => new Set(pool.map((question) => question.id)).size === pool.length));
});

test('each seed produces six stable unique questions with four distinct options and valid visual maths', () => {
  for (let episodeIndex = 0; episodeIndex < 3; episodeIndex += 1) {
    for (let seed = 1; seed <= 80; seed += 1) {
      const runA = createMonsterMathRun({ episodeIndex, seed });
      const runB = createMonsterMathRun({ episodeIndex, seed });
      assert.equal(isValidMonsterRun(runA, episodeIndex), true, `episode ${episodeIndex} seed ${seed}`);
      assert.deepEqual(runA, runB);
      assert.equal(new Set(runA.map((question) => question.id)).size, 6);
      for (const question of runA) {
        assert.equal(question.options.filter((option) => option === question.answer).length, 1);
        assert.ok(question.options.every((option) => option >= (episodeIndex === 0 ? 1 : 0) && option <= (episodeIndex === 0 ? 10 : 20)));
        if (episodeIndex === 2) {
          assert.ok(question.prompt.split(/\s+/).length <= 25);
          assert.ok(question.prompt.includes('How many'));
        }
      }
    }
  }
});

test('answer positions are balanced over seeded runs instead of fixed to one button', () => {
  const positions = [0, 0, 0, 0];
  for (let seed = 1; seed <= 500; seed += 1) {
    const run = createMonsterMathRun({ episodeIndex: 1, seed });
    for (const question of run) positions[question.options.indexOf(question.answer)] += 1;
  }
  const total = positions.reduce((sum, count) => sum + count, 0);
  assert.ok(positions.every((count) => count / total >= 0.21 && count / total <= 0.29), positions.join(', '));
});

test('twenty-space ten-frame shows both groups correctly when the first addend is over ten', () => {
  const question = MONSTER_QUESTION_POOLS[1].find((item) => item.id === 'add:11:2');
  const initial = tenFrameCellModel(question);
  assert.equal(initial.length, 20);
  assert.equal(initial.filter((cell) => cell.visible).length, 13);
  assert.equal(initial.filter((cell) => cell.visible && cell.group === 'first').length, 11);
  assert.equal(initial.filter((cell) => cell.visible && cell.group === 'more').length, 2);
  assert.equal(initial.filter((cell) => !cell.visible).length, 7);

  const completed = tenFrameCellModel(question, { locked: true, animationCount: 13 });
  assert.equal(completed.filter((cell) => cell.visible && cell.counted).length, 13);
  assert.equal(question.model.first + question.model.second, question.answer);
  assert.equal(question.answer, 13);
});

test('count questions ask children to count without disclosing quantity', () => {
  for (const question of MONSTER_QUESTION_POOLS[0]) {
    assert.match(question.prompt, /^How many .+ can you see\?$/);
    assert.doesNotMatch(question.prompt, /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i);
    assert.equal(question.model.count, question.answer);
  }
});

test('singular story, counter, explanation and number-line text uses singular nouns and verbs', () => {
  const oneStar = MONSTER_QUESTION_POOLS[0].find((item) => item.id === 'count:stars:1');
  assert.equal(oneStar.prompt, 'How many stars can you see?');
  assert.equal(oneStar.explanation, 'There is 1 star.');
  assert.equal(monsterCountResultText(1), 'There is 1 counter.');
  assert.equal(monsterCountResultText(10), 'There are 10 counters.');
  assert.equal(monsterCounterPhrase(1), '1 counter');

  const addOne = MONSTER_QUESTION_POOLS[2].find((item) => item.id === 'story:add:mira-shells:1:1');
  assert.match(addOne.prompt, /Mira has 1 shell\./);
  assert.match(addOne.explanation, /Mira had 1 shell, then found 1 more\./);
  assert.match(addOne.explanation, /Now there are 2 shells\./);

  const takeOne = MONSTER_QUESTION_POOLS[2].find((item) => item.id === 'story:subtract:mira-shells:2:1');
  assert.match(takeOne.prompt, /Mira gives 1 shell away\./);
  assert.match(takeOne.explanation, /gives 1 shell away\. One shell is left\./);

  const operationAddOne = MONSTER_QUESTION_POOLS[1].find((item) => item.id === 'add:1:1');
  assert.equal(operationAddOne.explanation, '1 counter and 1 more make 2 counters.');
  const operationTakeOne = MONSTER_QUESTION_POOLS[1].find((item) => item.id === 'subtract:2:1');
  assert.equal(operationTakeOne.clue, 'Start with 2 counters. Slide 1 away, then count what stays.');
  assert.equal(operationTakeOne.explanation, 'Take 1 away from 2. 1 counter stays.');
  assert.equal(tenFrameAccessibleLabel(operationTakeOne.model), '2 counters, take away 1 counter, 1 counter stays');
  assert.equal(tenFrameExplanation(operationTakeOne.model), '1 counter moved away; 1 counter stays.');
  assert.equal(numberLineInstruction({ first: 2, second: 1, answer: 1, operation: 'subtract' }), 'Start at 2, then jump back 1 step.');
});

test('eight recent question ids are avoided on the next run and history persists on start', () => {
  const first = createMonsterMathRun({ episodeIndex: 0, seed: 881 });
  const recent = first.map((question) => question.id).slice(-8);
  const next = createMonsterMathRun({ episodeIndex: 0, seed: 882, recentQuestionIds: recent });
  assert.equal(next.some((question) => recent.includes(question.id)), false);
  const storage = memoryStorage();
  rememberMonsterMathRun('amari', 0, first.map((question) => question.id), storage);
  assert.deepEqual(recentMonsterQuestionIds('amari', 0, storage), first.map((question) => question.id).slice(-8));
});

test('episode completion saves best stars and unlocks the next episode per child', () => {
  const storage = memoryStorage();
  assert.equal(getMonsterMathProgress('amari', storage).unlockedEpisode, 0);
  const firstRun = createMonsterMathRun({ episodeIndex: 0, seed: 7 });
  rememberMonsterMathRun('amari', 0, firstRun.map((question) => question.id), storage);
  const completion = recordMonsterEpisodeCompletion('amari', 0, 2, firstRun.map((question) => question.id), storage);
  assert.equal(completion.newlyCompleted, true);
  assert.equal(completion.improved, true);
  assert.equal(completion.progress.unlockedEpisode, 1);
  assert.equal(completion.progress.bestStars['count-garden'], 2);
  assert.equal(getMonsterMathProgress('askia', storage).unlockedEpisode, 0);
  assert.equal(recordMonsterEpisodeCompletion('amari', 0, 4, firstRun.map((question) => question.id), storage), null);
  const repeatRun = createMonsterMathRun({ episodeIndex: 0, seed: 8, recentQuestionIds: recentMonsterQuestionIds('amari', 0, storage) });
  assert.equal(repeatRun.some((question) => firstRun.some((previous) => previous.id === question.id)), false);
});

test('Monster Math reward callback awards exactly the run stars saved to progress', () => {
  const storage = memoryStorage();
  const questions = createMonsterMathRun({ episodeIndex: 0, seed: 90 });
  for (const runStars of [1, 2, 3]) {
    const completion = recordMonsterEpisodeCompletion('amari', 0, runStars, questions.map((question) => question.id), storage);
    assert.equal(completion.progress.bestStars['count-garden'], runStars);
    // App's scaledCelebrate maps these legacy callback units back to total stars.
    const awardedStars = Math.max(1, Math.round(monsterMathRewardCallbackUnits(runStars) / 4));
    assert.equal(awardedStars, runStars);
  }
});
