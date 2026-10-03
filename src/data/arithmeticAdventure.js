const OBJECTS = [
  ['apple', 'apples', 'red'], ['shell', 'shells', 'blue'], ['star', 'stars', 'gold'],
  ['flower', 'flowers', 'pink'], ['gem', 'gems', 'violet'], ['cookie', 'cookies', 'brown'],
];
const PEOPLE = ['Mia', 'Leo', 'Ava', 'Kai', 'Noah', 'Zoe'];
const QUANTITY = (n, one, many) => `${n} ${n === 1 ? one : many}`;

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

const rng = (seed) => { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
export const seededShuffle = (items, seed) => { const out = [...items]; const random = rng(seed); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
export const createArithmeticSeed = () => { const a = new Uint32Array(1); globalThis.crypto?.getRandomValues?.(a); return a[0] || ((Math.random() * 0xffffffff) >>> 0) || 1; };

const addPool = (chapter) => {
  const rows = [];
  if (chapter === 0) for (const [one, many, color] of OBJECTS) for (let a = 0; a <= 10; a++) for (let b = 0; a + b <= 10; b++) rows.push({ id: `groups:${one}:${a}:${b}`, type: 'groups', a, b, answer: a + b, one, many, color, prompt: `Put ${QUANTITY(a, one, many)} and ${QUANTITY(b, one, many)} together. How many altogether?`, clue: 'Count the first group, then count on through the second group.', explanation: `${QUANTITY(a, one, many)} and ${QUANTITY(b, one, many)} make ${a + b} altogether.` });
  if (chapter === 1) for (let total = 0; total <= 20; total++) for (let part = 0; part <= total; part++) rows.push({ id: `bond:${total}:${part}`, type: 'bond', a: part, b: total - part, answer: total - part, total, one: 'counter', many: 'counters', color: 'teal', prompt: `${part} and what number make ${total}?`, clue: 'The two parts fit together to make the whole.', explanation: `${part} and ${total - part} are the two parts. Together they make ${total}.` });
  if (chapter === 2) OBJECTS.forEach(([one, many, color], oi) => PEOPLE.forEach((person, pi) => { for (let a = 0; a <= 20; a++) for (let b = 0; a + b <= 20; b++) rows.push({ id: `story:${oi}:${pi}:${a}:${b}`, type: 'story', a, b, answer: a + b, one, many, color, prompt: `${person} has ${QUANTITY(a, one, many)} and gets ${b} more. How many now?`, clue: '“Gets more” means join the two groups.', explanation: `${person} had ${QUANTITY(a, one, many)} and got ${QUANTITY(b, one, many)} more. ${a + b} altogether.` }); }));
  return rows;
};
const subPool = (chapter) => {
  const rows = [];
  if (chapter === 0) for (const [one, many, color] of OBJECTS) for (let a = 0; a <= 10; a++) for (let b = 0; b <= a; b++) rows.push({ id: `take:${one}:${a}:${b}`, type: 'take', a, b, answer: a - b, one, many, color, prompt: `${a} ${many}. Take away ${b}. How many are left?`, clue: 'Look at the crossed objects. Count the ones that remain.', explanation: `Start with ${a}. Take ${b} away. ${a - b} remain.` });
  if (chapter === 1) for (let a = 0; a <= 20; a++) for (let b = 0; b <= 20; b++) rows.push({ id: `compare:${a}:${b}`, type: 'compare', a, b, answer: Math.abs(a - b), one: 'counter', many: 'counters', color: 'teal', greaterGroup: a >= b ? 'A' : 'B', prompt: `Group A has ${a}; Group B has ${b}. How many more are in the larger group?`, clue: 'Pair one from each group. Count the unpaired counters.', explanation: `Pair ${Math.min(a,b)} from each group. ${Math.abs(a-b)} ${Math.abs(a-b) === 1 ? 'counter is' : 'counters are'} left unpaired.` });
  if (chapter === 2) OBJECTS.forEach(([one, many, color], oi) => PEOPLE.forEach((person, pi) => { for (let a = 0; a <= 20; a++) for (let b = 0; b <= a; b++) rows.push({ id: `story:${oi}:${pi}:${a}:${b}`, type: 'story', a, b, answer: a - b, one, many, color, prompt: `${person} has ${QUANTITY(a, one, many)} and gives ${QUANTITY(b, one, many)} away. How many are left?`, clue: '“Gives away” means take the second amount from the first.', explanation: `${person} starts with ${a}, gives ${b} away, and has ${a-b} left.` }); }));
  return rows;
};
const makeOptions = (answer, max, seed) => { const values = [answer]; for (const delta of seededShuffle([-1,1,-2,2,-3,3,-4,4], seed)) { const n = answer + delta; if (n >= 0 && n <= max && !values.includes(n)) values.push(n); if (values.length === 4) break; } for (let n = 0; values.length < 4; n++) if (!values.includes(n)) values.push(n); return seededShuffle(values, seed ^ 0x45d9f3b); };
export const createAdditionRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => createRun(addPool(chapter), chapter, seed, recentIds, 'addition');
export const createSubtractionRun = ({ chapter = 0, seed = 1, recentIds = [] } = {}) => createRun(subPool(chapter), chapter, seed, recentIds, 'subtraction');
const createRun = (pool, chapter, seed, recentIds, game) => { if (!Number.isInteger(chapter) || chapter < 0 || chapter > 2 || !Number.isInteger(seed)) return []; const recent = new Set(recentIds); let eligible = pool.filter(q => !recent.has(q.id)); if (eligible.length < 6) eligible = pool; return seededShuffle(eligible, seed).slice(0, 6).map((q, i) => ({ ...q, game, chapter, options: makeOptions(q.answer, game === 'addition' ? (chapter === 0 ? 10 : 20) : (chapter === 0 ? 10 : 20), seed + i * 7919) })); };
export const isValidArithmeticRun = (run, game, chapter) => Array.isArray(run) && run.length === 6 && new Set(run.map(q => q.id)).size === 6 && run.every(q => q.game === game && q.chapter === chapter && q.answer >= 0 && q.answer <= (chapter === 0 ? 10 : 20) && q.options?.length === 4 && new Set(q.options).size === 4 && q.options.filter(n => n === q.answer).length === 1 && (game === 'addition' ? (q.type === 'bond' ? q.a + q.b === q.total && q.answer === q.b : q.a + q.b === q.answer) : (q.type === 'compare' ? Math.abs(q.a-q.b) === q.answer : q.a-q.b === q.answer)) && (game !== 'addition' || q.type !== 'groups' || q.a + q.b <= 10) && (game !== 'subtraction' || q.type !== 'take' || q.a <= 10 && q.b <= q.a));
export const arithmeticRewardUnits = (stars) => stars * 4;
