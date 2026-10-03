export const MONSTER_MATH_EPISODES = Object.freeze([
  Object.freeze({ id: 'count-garden', title: 'Count to 10', subtitle: 'Count each monster snack or space treasure once.', band: 'starter', skill: 'counting' }),
  Object.freeze({ id: 'number-workshop', title: 'Add and Take Away', subtitle: 'Use counters and a ten frame to solve sums to 20.', band: 'growing', skill: 'addition-subtraction' }),
  Object.freeze({ id: 'story-bridge', title: 'Monster Story Problems', subtitle: 'Listen to a short story and show what changed.', band: 'challenge', skill: 'word-problems' }),
]);

const COUNT_OBJECTS = Object.freeze([
  { id: 'stars', one: 'star', many: 'stars', emoji: '⭐' },
  { id: 'apples', one: 'apple', many: 'apples', emoji: '🍎' },
  { id: 'balloons', one: 'balloon', many: 'balloons', emoji: '🎈' },
  { id: 'gems', one: 'gem', many: 'gems', emoji: '💎' },
  { id: 'shells', one: 'shell', many: 'shells', emoji: '🐚' },
  { id: 'oranges', one: 'orange', many: 'oranges', emoji: '🍊' },
  { id: 'planets', one: 'planet', many: 'planets', emoji: '🪐' },
  { id: 'cookies', one: 'cookie', many: 'cookies', emoji: '🍪' },
  { id: 'flowers', one: 'flower', many: 'flowers', emoji: '🌼' },
  { id: 'kites', one: 'kite', many: 'kites', emoji: '🪁' },
  { id: 'crystals', one: 'crystal', many: 'crystals', emoji: '🔷' },
  { id: 'moons', one: 'moon', many: 'moons', emoji: '🌙' },
]);

export const monsterCounterPhrase = (count) => `${count} ${count === 1 ? 'counter' : 'counters'}`;
export const monsterCountVisualLabels = (model) => ({ group: 'Counting pictures', picture: model.objectName });
const QUANTITY = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
export const monsterCountResultText = (count) => `There ${count === 1 ? 'is' : 'are'} ${monsterCounterPhrase(count)}.`;
export const numberLineInstruction = (model, locked = false) => `Start at ${model.first}, then jump ${model.operation === 'add' ? 'forward' : 'back'} ${model.second} ${model.second === 1 ? 'step' : 'steps'}${locked ? ` to ${model.answer}` : ''}.`;
export const monsterNumberLineValues = (model) => {
  const low = Math.max(0, Math.min(model.first, model.answer) - 2);
  const high = Math.min(20, Math.max(model.first, model.answer) + 2);
  return Array.from({ length: high - low + 1 }, (_, index) => low + index);
};
export const tenFrameAccessibleLabel = (model, answered = false) => {
  if (model.operation === 'add') {
    const groups = `${monsterCounterPhrase(model.first)}; add ${model.second} more`;
    return answered ? `${groups}; ${monsterCounterPhrase(model.answer)} total` : `${groups}. Put both groups together, then count them.`;
  }
  const operation = `${monsterCounterPhrase(model.first)}, take away ${monsterCounterPhrase(model.second)}`;
  return answered
    ? `${operation}; ${monsterCounterPhrase(model.answer)} ${model.answer === 1 ? 'stays' : 'stay'}`
    : `${operation}. Count what is left.`;
};
export const tenFrameExplanation = (model) => model.operation === 'add'
  ? `${monsterCounterPhrase(model.first)} and ${model.second} more make ${monsterCounterPhrase(model.answer)}.`
  : `${monsterCounterPhrase(model.second)} moved away; ${monsterCounterPhrase(model.answer)} ${model.answer === 1 ? 'stays' : 'stay'}.`;
export const tenFrameModelTeaching = (model, answered) => {
  if (answered) return null;
  return model.operation === 'add'
    ? 'Put the two groups together, then count every counter.'
    : 'Start with the counters, take away the second group, then count what is left.';
};

const STORY_CONTEXTS = Object.freeze([
  { id: 'mira-shells', name: 'Mira', one: 'shell', many: 'shells', emoji: '🐚' },
  { id: 'leo-apples', name: 'Leo', one: 'apple', many: 'apples', emoji: '🍎' },
  { id: 'tess-stars', name: 'Tess', one: 'star', many: 'stars', emoji: '⭐' },
  { id: 'bo-balloons', name: 'Bo', one: 'balloon', many: 'balloons', emoji: '🎈' },
  { id: 'nia-gems', name: 'Nia', one: 'gem', many: 'gems', emoji: '💎' },
  { id: 'max-cookies', name: 'Max', one: 'cookie', many: 'cookies', emoji: '🍪' },
  { id: 'ava-flowers', name: 'Ava', one: 'flower', many: 'flowers', emoji: '🌼' },
  { id: 'kai-oranges', name: 'Kai', one: 'orange', many: 'oranges', emoji: '🍊' },
]);

const createCountPool = () => COUNT_OBJECTS.flatMap((object) => Array.from({ length: 10 }, (_, index) => {
  const answer = index + 1;
  return {
    id: `count:${object.id}:${answer}`,
    kind: 'count',
    answer,
    prompt: `How many ${object.many} can you see?`,
    clue: 'Touch or point to each picture once. Keep a steady count.',
    explanation: `There ${answer === 1 ? 'is' : 'are'} ${answer} ${answer === 1 ? object.one : object.many}.`,
    model: { type: 'count', count: answer, emoji: object.emoji, objectName: object.one },
  };
}));

const createOperationPool = () => {
  const questions = [];
  for (let first = 1; first < 20; first += 1) {
    for (let second = 1; first + second <= 20; second += 1) {
      questions.push({
        id: `add:${first}:${second}`,
        kind: 'add', answer: first + second,
        prompt: `What is ${first} plus ${second}?`,
        clue: 'Put the two groups together, then count every counter.',
        explanation: `${monsterCounterPhrase(first)}. Add ${second} more. That makes ${monsterCounterPhrase(first + second)}.`,
        model: { type: 'ten-frame', operation: 'add', first, second, answer: first + second },
      });
    }
  }
  for (let start = 2; start <= 20; start += 1) {
    for (let take = 1; take < start; take += 1) {
      questions.push({
        id: `subtract:${start}:${take}`,
        kind: 'subtract', answer: start - take,
        prompt: `What is ${start} take away ${take}?`,
        clue: `Start with ${monsterCounterPhrase(start)}. Slide ${take} away, then count what stays.`,
        explanation: `Start with ${monsterCounterPhrase(start)}. Take ${take} away. ${monsterCounterPhrase(start - take)} ${start - take === 1 ? 'stays' : 'stay'}.`,
        model: { type: 'ten-frame', operation: 'subtract', first: start, second: take, answer: start - take },
      });
    }
  }
  return questions;
};

const createStoryPool = () => {
  const questions = [];
  STORY_CONTEXTS.forEach((context) => {
    for (let first = 1; first <= 12; first += 1) {
      for (let second = 1; first + second <= 20; second += 1) {
        questions.push({
          id: `story:add:${context.id}:${first}:${second}`,
          kind: 'word-add', answer: first + second,
          prompt: `${context.name} has ${QUANTITY(first, context.one, context.many)}. ${context.name} finds ${second} more. How many ${context.many} are there now?`,
          clue: 'Look for the words “more” and “now.” Put both groups together.',
          explanation: `${context.name} had ${QUANTITY(first, context.one, context.many)}. ${context.name} found ${second} more. Now there ${first + second === 1 ? 'is' : 'are'} ${QUANTITY(first + second, context.one, context.many)}.`,
          model: { type: 'number-line', operation: 'add', first, second, answer: first + second, emoji: context.emoji },
        });
      }
    }
    for (let start = 2; start <= 20; start += 1) {
      for (let take = 1; take < start; take += 1) {
        questions.push({
          id: `story:subtract:${context.id}:${start}:${take}`,
          kind: 'word-subtract', answer: start - take,
          prompt: `${context.name} has ${QUANTITY(start, context.one, context.many)}. ${context.name} gives ${QUANTITY(take, context.one, context.many)} away. How many are left?`,
          clue: 'Look for the words “gives away” and “left.” Take some from the first group.',
          explanation: `${context.name} starts with ${QUANTITY(start, context.one, context.many)}. ${context.name} gives ${QUANTITY(take, context.one, context.many)} away. ${start - take === 1 ? 'One' : start - take} ${start - take === 1 ? context.one : context.many} ${start - take === 1 ? 'is' : 'are'} left.`,
          model: { type: 'number-line', operation: 'subtract', first: start, second: take, answer: start - take, emoji: context.emoji },
        });
      }
    }
  });
  return questions;
};

export const MONSTER_QUESTION_POOLS = Object.freeze([
  Object.freeze(createCountPool()),
  Object.freeze(createOperationPool()),
  Object.freeze(createStoryPool()),
]);

export const createMonsterRunSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const words = new Uint32Array(1);
    globalThis.crypto.getRandomValues(words);
    return words[0] || 1;
  }
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
};

const mulberry32 = (seed) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

export const seededShuffle = (items, seed) => {
  const result = [...items];
  const random = mulberry32(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

const optionsForQuestion = (question, seed, episodeIndex) => {
  const min = episodeIndex === 0 ? 1 : 0;
  const max = episodeIndex === 0 ? 10 : 20;
  const distractorOffsets = seededShuffle([-3, -2, -1, 1, 2, 3, -4, 4], seed);
  const values = [question.answer];
  for (const offset of distractorOffsets) {
    const value = question.answer + offset;
    if (value >= min && value <= max && !values.includes(value)) values.push(value);
    if (values.length === 4) break;
  }
  for (let value = min; values.length < 4 && value <= max; value += 1) {
    if (!values.includes(value)) values.push(value);
  }
  const optionSeed = (seed ^ 0x9e3779b9) >>> 0;
  return seededShuffle(values, optionSeed);
};

export const createMonsterMathRun = ({ episodeIndex = 0, seed = 1, recentQuestionIds = [], size = 6 } = {}) => {
  const index = Math.max(0, Math.min(MONSTER_QUESTION_POOLS.length - 1, episodeIndex));
  const pool = MONSTER_QUESTION_POOLS[index];
  const recent = new Set(recentQuestionIds);
  const unseen = pool.filter((question) => !recent.has(question.id));
  const source = unseen.length >= size ? unseen : pool;
  const questions = seededShuffle(source, seed).slice(0, Math.min(size, source.length));
  return questions.map((question, round) => Object.freeze({
    ...question,
    round,
    options: Object.freeze(optionsForQuestion(question, (seed + Math.imul(round + 1, 0x45d9f3b)) >>> 0, index)),
  }));
};

export const isValidMonsterRun = (rounds, episodeIndex) => {
  if (!Array.isArray(rounds) || rounds.length !== 6) return false;
  const ids = new Set();
  return rounds.every((question) => {
    if (!question || ids.has(question.id)) return false;
    ids.add(question.id);
    if (!Array.isArray(question.options) || question.options.length !== 4 || new Set(question.options).size !== 4) return false;
    if (question.options.filter((option) => option === question.answer).length !== 1) return false;
    if (question.answer < 0 || question.answer > 20) return false;
    if (episodeIndex === 0 && (question.answer < 1 || question.answer > 10 || question.model.count !== question.answer)) return false;
    if (episodeIndex > 0 && question.model.answer !== question.answer) return false;
    if (question.model.type === 'ten-frame') {
      if (question.model.operation === 'add' && question.model.first + question.model.second !== question.answer) return false;
      if (question.model.operation === 'subtract' && question.model.first - question.model.second !== question.answer) return false;
    }
    if (question.model.type === 'number-line') {
      if (question.model.operation === 'add' && question.model.first + question.model.second !== question.answer) return false;
      if (question.model.operation === 'subtract' && question.model.first - question.model.second !== question.answer) return false;
    }
    return true;
  });
};

// A twenty-space model is used rather than a single ten-space frame because
// the growing episode includes addends whose first group is already over ten.
export const tenFrameCellModel = (question, { locked = false, animationCount = 0 } = {}) => {
  if (question?.model?.type !== 'ten-frame') return [];
  const { operation, first, second, answer } = question.model;
  const total = operation === 'add' ? first + second : first;
  return Array.from({ length: 20 }, (_, index) => ({
    index,
    visible: index < total,
    group: operation === 'add' && index >= first ? 'more' : 'first',
    removed: locked && operation === 'subtract' && index >= answer && index < first,
    counted: locked && index < Math.min(animationCount, operation === 'add' ? answer : first),
  }));
};
