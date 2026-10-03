const OBJECTS = [
  ['apple', 'apples', 'red', 'apple'],
  ['shell', 'shells', 'blue', 'shell'],
  ['star', 'stars', 'gold', 'star'],
  ['flower', 'flowers', 'pink', 'flower'],
  ['gem', 'gems', 'violet', 'gem'],
  ['cookie', 'cookies', 'brown', 'cookie'],
];
const PEOPLE = ['Mia', 'Leo', 'Ava', 'Kai', 'Noah', 'Zoe'];
const quantity = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const ARITHMETIC_CHAPTERS = Object.freeze([
  { id: 'groups', title: 'Put Groups Together', skill: 'combine groups', max: 10 },
  { id: 'bonds', title: 'Number Bonds', skill: 'find the missing part', max: 20 },
  { id: 'stories', title: 'Addition Stories', skill: 'solve a story', max: 20 },
]);
export const SUBTRACTION_CHAPTERS = Object.freeze([
  { id: 'take-away', title: 'Take Away', skill: 'take objects away', max: 10 },
  { id: 'compare', title: 'Compare Groups', skill: 'find how many more', max: 20 },
  { id: 'stories', title: 'Subtraction Stories', skill: 'solve a story', max: 20 },
]);

const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const seededShuffle = (items, seed) => {
  const out = [...items];
  const random = rng(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const createArithmeticSeed = () => {
  const values = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(values);
  return values[0] || ((Math.random() * 0xffffffff) >>> 0) || 1;
};

const additionPool = (chapter) => {
  const rows = [];
  if (chapter === 0) {
    for (const [one, many, color, object] of OBJECTS) {
      for (let a = 0; a <= 10; a += 1) {
        for (let b = 0; a + b <= 10; b += 1) {
          rows.push({
            id: `groups:${one}:${a}:${b}`, type: 'groups', a, b, answer: a + b,
            one, many, color, object,
            prompt: `Put ${quantity(a, one, many)} and ${quantity(b, one, many)} together. How many altogether?`,
            clue: 'Count the first group, then count on through the second group.',
            explanation: `${quantity(a, one, many)} and ${quantity(b, one, many)} make ${a + b} altogether.`,
          });
        }
      }
    }
  }
  if (chapter === 1) {
    for (let total = 0; total <= 20; total += 1) {
      for (let part = 0; part <= total; part += 1) {
        rows.push({
          id: `bond:${total}:${part}`, type: 'bond', a: part, b: total - part,
          answer: total - part, total, one: 'counter', many: 'counters', color: 'teal', object: 'counter',
          prompt: `${part} and what number make ${total}?`,
          clue: 'The two parts fit together to make the whole.',
          explanation: `${part} and ${total - part} are the two parts. Together they make ${total}.`,
        });
      }
    }
  }
  if (chapter === 2) {
    OBJECTS.forEach(([one, many, color, object], objectIndex) => {
      PEOPLE.forEach((person, personIndex) => {
        for (let a = 0; a <= 20; a += 1) {
          for (let b = 0; a + b <= 20; b += 1) {
            rows.push({
              id: `story:${objectIndex}:${personIndex}:${a}:${b}`, type: 'story', a, b,
              answer: a + b, one, many, color, object, person,
              prompt: `${person} has ${quantity(a, one, many)} and gets ${b} more. How many now?`,
              clue: '“Gets more” means join the two groups.',
              explanation: `${person} had ${quantity(a, one, many)} and got ${quantity(b, one, many)} more. ${a + b} altogether.`,
            });
          }
        }
      });
    });
  }
  return rows;
};

const subtractionPool = (chapter) => {
  const rows = [];
  if (chapter === 0) {
    for (const [one, many, color, object] of OBJECTS) {
      for (let a = 0; a <= 10; a += 1) {
        for (let b = 0; b <= a; b += 1) {
          rows.push({
            id: `take:${one}:${a}:${b}`, type: 'take', a, b, answer: a - b,
            one, many, color, object,
            prompt: `There are ${quantity(a, one, many)}. Take away ${b}. How many are left?`,
            clue: b === 0 ? 'Nothing is taken away. The starting group stays the same.' : 'Look at the marked objects. Count the ones that remain.',
            explanation: `Start with ${a}. Take ${b} away. ${a - b} remain.`,
          });
        }
      }
    }
  }
  if (chapter === 1) {
    for (let a = 0; a <= 20; a += 1) {
      for (let b = 0; b <= 20; b += 1) {
        const answer = Math.abs(a - b);
        const same = a === b;
        rows.push({
          id: `compare:${a}:${b}`, type: 'compare', a, b, answer,
          one: 'counter', many: 'counters', color: 'teal', object: 'counter',
          greaterGroup: same ? null : a > b ? 'A' : 'B',
          prompt: same
            ? `Group A has ${a} and Group B has ${b}. Do the groups have the same number, or how many are unpaired?`
            : `Group A has ${a}; Group B has ${b}. How many more are in the larger group?`,
          clue: same
            ? 'Pair one from each group. Are any counters left unpaired?'
            : 'Pair one from each group. Count the unpaired counters.',
          explanation: same
            ? `Pair ${a} from each group. The groups have the same number, with 0 unpaired.`
            : `Pair ${Math.min(a, b)} from each group. ${answer} ${answer === 1 ? 'counter is' : 'counters are'} left unpaired.`,
        });
      }
    }
  }
  if (chapter === 2) {
    OBJECTS.forEach(([one, many, color, object], objectIndex) => {
      PEOPLE.forEach((person, personIndex) => {
        for (let a = 0; a <= 20; a += 1) {
          for (let b = 0; b <= a; b += 1) {
            rows.push({
              id: `story:${objectIndex}:${personIndex}:${a}:${b}`, type: 'story', a, b,
              answer: a - b, one, many, color, object, person,
              prompt: `${person} has ${quantity(a, one, many)} and gives ${quantity(b, one, many)} away. How many are left?`,
              clue: '“Gives away” means take the second amount from the first.',
              explanation: `${person} starts with ${a}, gives ${b} away, and has ${a - b} left.`,
            });
          }
        }
      });
    });
  }
  return rows;
};

const optionValues = (answer, max, seed) => {
  const values = [answer];
  for (const offset of seededShuffle([-1, 1, -2, 2, -3, 3, -4, 4], seed)) {
    const value = answer + offset;
    if (value >= 0 && value <= max && !values.includes(value)) values.push(value);
    if (values.length === 4) break;
  }
  for (let value = 0; values.length < 4; value += 1) {
    if (!values.includes(value)) values.push(value);
  }
  return seededShuffle(values, seed ^ 0x45d9f3b);
};

const poolCache = new Map();
const canonicalIdCache = new Map();
const getPool = (game, chapter) => {
  const key = `${game}:${chapter}`;
  if (!poolCache.has(key)) poolCache.set(key, game === 'addition' ? additionPool(chapter) : subtractionPool(chapter));
  return poolCache.get(key);
};

export const canonicalArithmeticIds = (game, chapter) => {
  const key = `${game}:${chapter}`;
  if (!canonicalIdCache.has(key)) canonicalIdCache.set(key, new Set(getPool(game, chapter).map((question) => question.id)));
  return canonicalIdCache.get(key);
};
export const isCanonicalArithmeticId = (id, game, chapter) => canonicalArithmeticIds(game, chapter).has(id);

export const createAdditionRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => createRun('addition', chapter, seed, recentIds);
export const createSubtractionRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => createRun('subtraction', chapter, seed, recentIds);

function createRun(game, chapter, seed, recentIds) {
  if (!Number.isInteger(chapter) || chapter < 0 || chapter > 2 || !Number.isInteger(seed)) return [];
  const pool = getPool(game, chapter);
  const recent = new Set(recentIds.filter((id) => isCanonicalArithmeticId(id, game, chapter)));
  let eligible = pool.filter((question) => !recent.has(question.id));
  if (eligible.length < 6) eligible = pool;
  const max = chapter === 0 ? 10 : 20;
  return seededShuffle(eligible, seed).slice(0, 6).map((question, index) => ({
    ...question,
    game,
    chapter,
    options: optionValues(question.answer, max, seed + index * 7919),
  }));
}

const canonicalFields = [
  'id', 'type', 'a', 'b', 'answer', 'total', 'one', 'many', 'color', 'object',
  'person', 'greaterGroup', 'prompt', 'clue', 'explanation',
];
const fieldsMatchCanonicalQuestion = (candidate, canonical) => canonicalFields.every((key) => candidate[key] === canonical[key]);

export const isValidArithmeticRun = (run, game, chapter) => {
  if (!['addition', 'subtraction'].includes(game) || !Number.isInteger(chapter) || chapter < 0 || chapter > 2) return false;
  if (!Array.isArray(run) || run.length !== 6) return false;
  const poolById = new Map(getPool(game, chapter).map((question) => [question.id, question]));
  const max = chapter === 0 ? 10 : 20;
  const expectedType = game === 'addition' ? ['groups', 'bond', 'story'][chapter] : ['take', 'compare', 'story'][chapter];
  if (new Set(run.map((question) => question?.id)).size !== 6) return false;
  return run.every((question) => {
    if (!question || question.game !== game || question.chapter !== chapter) return false;
    const canonical = poolById.get(question.id);
    if (!canonical || !fieldsMatchCanonicalQuestion(question, canonical) || question.type !== expectedType) return false;
    if (![question.a, question.b, question.answer].every(Number.isInteger)) return false;
    if (question.a < 0 || question.b < 0 || question.answer < 0 || question.answer > max) return false;
    if (question.type === 'bond' && (!Number.isInteger(question.total) || question.total < 0 || question.total > 20)) return false;
    if (!Array.isArray(question.options) || question.options.length !== 4 || new Set(question.options).size !== 4) return false;
    if (!question.options.every((value) => Number.isInteger(value) && value >= 0 && value <= max)) return false;
    return question.options.filter((value) => value === question.answer).length === 1;
  });
};

export const arithmeticRewardUnits = (stars) => stars * 4;

export const scoreArithmeticResults = (results) => {
  const completed = Array.isArray(results) ? results : [];
  const clean = completed.filter((result) => result.correct && result.firstAttempt && result.hintCount === 0).length;
  const independent = completed.filter((result) => result.correct && !result.priorWrong && result.hintCount === 0).length;
  return {
    clean,
    independent,
    stars: independent >= 5 ? 3 : independent >= 3 ? 2 : 1,
  };
};

const narrationSegments = new Set();
for (const game of ['addition', 'subtraction']) {
  for (const chapter of [0, 1, 2]) {
    const pool = game === 'addition' ? additionPool(chapter) : subtractionPool(chapter);
    for (const question of pool) {
      for (const text of [question.prompt, question.clue, question.explanation]) {
        for (const segment of text.split(/\s+/).filter(Boolean)) narrationSegments.add(segment);
      }
    }
  }
}
export const ARITHMETIC_NARRATION_SEGMENTS = Object.freeze([...narrationSegments]);

export const ARITHMETIC_NARRATION = Object.freeze({
  counts: Object.freeze(Array.from({ length: 21 }, (_, value) => String(value))),
  starters: Object.freeze(['Put', 'There are', 'Group A has', 'Group B has']),
  actions: Object.freeze(['together', 'Take away', 'remain', 'more', 'unpaired']),
  objectNouns: Object.freeze(OBJECTS.flatMap(([one, many]) => [one, many])),
  people: Object.freeze([...PEOPLE]),
  reusableLines: Object.freeze([
    'How many altogether?', 'How many are left?', 'The two parts fit together to make the whole.',
    'Pair one from each group. Count the unpaired counters.', 'The groups have the same number, with 0 unpaired.',
    'Use one clue.', 'That is correct.', 'Try again.',
  ]),
});

export const arithmeticNarrationSegments = (questionOrText) => {
  const text = typeof questionOrText === 'string' ? questionOrText : questionOrText?.prompt || '';
  // Word-sized clips form a finite reusable vocabulary. The caller only asks
  // the packaged voice path to play exact segments; premium voice stays off.
  const segments = text.trim().split(/\s+/).filter(Boolean);
  return segments.every((segment) => ARITHMETIC_NARRATION_SEGMENTS.includes(segment)) ? segments : [];
};
