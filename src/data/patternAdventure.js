// Authored pattern missions. A run selects six missions from the chosen
// chapter, then freezes their order and option positions until it ends.
export const PATTERN_CHAPTERS = [
  { id: 'colour-courtyard', title: 'Colour Courtyard', subtitle: 'Spot the colours that repeat', skill: 'AB and growing colour patterns', badge: 'colour-badge' },
  { id: 'festival-friends', title: 'Festival Friends', subtitle: 'Follow the parade groups', skill: 'AAB, ABB and ABC patterns', badge: 'parade-badge' },
  { id: 'grand-finale', title: 'Grand Finale', subtitle: 'Notice longer and growing rules', skill: 'Longer repeats and growing groups', badge: 'finale-badge' },
];
export const PATTERN_RUN_LENGTH = 6;
export const PATTERN_INTRO_RULE = 'A pattern follows a rule. Look for a group of shapes that comes back in the same order.';

export const PATTERN_SHAPES = {
  coral: { name: 'coral circle', color: '#ef715f', shape: 'circle' },
  blue: { name: 'blue square', color: '#4d8fd4', shape: 'square' },
  gold: { name: 'gold star', color: '#efb83f', shape: 'star' },
  leaf: { name: 'green leaf', color: '#62a66a', shape: 'leaf' },
  plum: { name: 'purple diamond', color: '#9467bd', shape: 'diamond' },
  sun: { name: 'sun', color: '#f39a38', shape: 'sun' },
  drum: { name: 'festival drum', color: '#d96b87', shape: 'drum' },
};

const repeat = (cycle, turns = 2) => Array.from({ length: cycle.length * turns }, (_, index) => cycle[index % cycle.length]);
const repeatMission = (id, chapterId, cycle, rule, clue, turns = 2) => {
  const repeated = repeat(cycle, turns);
  // Preserve two whole examples, then vary how far the next cycle has begun.
  // That makes the missing answer land at different positions within its rule.
  const offset = id === 'plum-plum-sun' ? 2 : Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % cycle.length;
  const sequence = [...repeated, ...cycle.slice(0, offset)];
  return {
    id, chapterId, kind: 'repeat', cycle, sequence, answer: cycle[sequence.length % cycle.length], rule, clue,
    signature: `repeat:${cycle.join('-')}:${sequence.join('-')}`,
  };
};
const growingMission = (id, chapterId, token, rule, clue, start = 1) => ({
  id, chapterId, kind: 'growing', token, sequence: [start, start + 1, start + 2], answer: start + 3,
  rule, clue, signature: `grow:${token}:${start}`,
});

export const PATTERN_MISSIONS = [
  repeatMission('coral-blue', 'colour-courtyard', ['coral', 'blue'], 'Coral, blue; coral, blue. The two colours repeat in that order.', 'Look at the first two colours. Do they come back in the same order?'),
  repeatMission('gold-leaf', 'colour-courtyard', ['gold', 'leaf'], 'Gold, leaf; gold, leaf. The two shapes repeat in that order.', 'Watch which shape comes after the gold star.'),
  repeatMission('plum-sun', 'colour-courtyard', ['plum', 'sun'], 'Purple diamond, sun; purple diamond, sun.', 'Find the two-shape part that keeps coming back.'),
  repeatMission('leaf-coral', 'colour-courtyard', ['leaf', 'coral'], 'Leaf, coral; leaf, coral. The order stays the same.', 'Start at the first shape and follow the same two-step order.'),
  repeatMission('blue-gold', 'colour-courtyard', ['blue', 'gold'], 'Blue square, gold star; blue square, gold star.', 'What shape follows the blue square each time?'),
  repeatMission('sun-plum', 'colour-courtyard', ['sun', 'plum'], 'Sun, purple diamond; sun, purple diamond.', 'Look for the pair that repeats.'),
  growingMission('growing-coral', 'colour-courtyard', 'coral', 'The coral group grows by one each time: one, two, three, then four.', 'Count the circles in each group. How many are added?', 1),
  growingMission('growing-gold', 'colour-courtyard', 'gold', 'The star groups grow by one: two, three, four, then five.', 'Count each group and notice how much it grows.', 2),

  repeatMission('leaf-leaf-drum', 'festival-friends', ['leaf', 'leaf', 'drum'], 'Two leaves, then one drum. That three-shape group repeats.', 'Find the short group: two matching leaves, then a drum.'),
  repeatMission('gold-gold-blue', 'festival-friends', ['gold', 'gold', 'blue'], 'Two gold stars, then a blue square. Repeat that group.', 'Which shape comes after the two gold stars?'),
  repeatMission('plum-drum-drum', 'festival-friends', ['plum', 'drum', 'drum'], 'One purple diamond, then two drums. Repeat that group.', 'Look for one diamond followed by two drums.'),
  repeatMission('sun-sun-leaf', 'festival-friends', ['sun', 'sun', 'leaf'], 'Two suns, then one leaf. The three-part group repeats.', 'Notice the two suns together before the leaf.'),
  repeatMission('coral-blue-leaf', 'festival-friends', ['coral', 'blue', 'leaf'], 'Coral, blue, leaf; then coral, blue, leaf. Three shapes repeat.', 'Look for the three shapes that return in the same order.'),
  repeatMission('gold-plum-drum', 'festival-friends', ['gold', 'plum', 'drum'], 'Star, diamond, drum; then the same three shapes again.', 'The repeating part has three different shapes. Which comes first?'),
  repeatMission('blue-leaf-sun', 'festival-friends', ['blue', 'leaf', 'sun'], 'Square, leaf, sun; square, leaf, sun. The order repeats.', 'Follow the first three shapes, then follow them again.'),
  repeatMission('drum-coral-plum', 'festival-friends', ['drum', 'coral', 'plum'], 'Drum, circle, diamond; then drum, circle, diamond.', 'Which three-shape group starts with a drum?'),

  repeatMission('coral-coral-blue', 'grand-finale', ['coral', 'coral', 'blue'], 'Two coral circles, then a blue square. That group repeats.', 'Look for two matching circles before the square.'),
  repeatMission('leaf-blue-blue', 'grand-finale', ['leaf', 'blue', 'blue'], 'One leaf, then two blue squares. Repeat that group.', 'Find one leaf followed by a pair of squares.'),
  repeatMission('plum-plum-sun', 'grand-finale', ['plum', 'plum', 'sun'], 'Two purple diamonds, then a sun. Repeat the group.', 'Which shape ends the group of two purple diamonds?'),
  repeatMission('drum-gold-gold', 'grand-finale', ['drum', 'gold', 'gold'], 'One drum, then two gold stars. The group repeats.', 'Look for a drum followed by two matching stars.'),
  repeatMission('leaf-coral-blue-sun', 'grand-finale', ['leaf', 'coral', 'blue', 'sun'], 'Leaf, circle, square, sun; then the same four shapes.', 'This rule has four steps. Follow each one in order.'),
  repeatMission('blue-plum-sun-drum', 'grand-finale', ['blue', 'plum', 'sun', 'drum'], 'Square, diamond, sun, drum; then that four-shape group again.', 'Trace the four different shapes in order.'),
  growingMission('growing-drum', 'grand-finale', 'drum', 'Each drum group has one more drum: one, two, three, then four.', 'Count the drums. Each new group adds one.', 1),
  growingMission('growing-leaf', 'grand-finale', 'leaf', 'The leaf groups grow by one: two, three, four, then five.', 'Compare the group sizes. What is added each time?', 2),
];

export const PATTERN_NARRATION_STRINGS = [
  'What comes next? Look for the rule.',
  PATTERN_INTRO_RULE,
  ...PATTERN_MISSIONS.flatMap(({ rule, clue }) => [rule, clue]),
];
export const PATTERN_AUDIO_ASSET_INVENTORY = {
  available: PATTERN_NARRATION_STRINGS.filter((text) => Boolean(getOfflineVoiceClip(text))),
  missing: PATTERN_NARRATION_STRINGS.filter((text) => !getOfflineVoiceClip(text)),
};

const hashSeed = (value) => {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
};
export function normalizePatternSeed(seed) {
  if (typeof seed === 'number' && Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff) return seed >>> 0;
  if (typeof seed === 'string' && /^\d+$/.test(seed)) {
    const numeric = Number(seed);
    if (Number.isSafeInteger(numeric) && numeric <= 0xffffffff) return numeric >>> 0;
  }
  return hashSeed(seed);
}
const makeRandom = (seed) => {
  let value = (seed >>> 0) || 1;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 0x100000000; };
};
const shuffled = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

function optionsFor(mission, random) {
  let answers;
  if (mission.kind === 'growing') answers = [mission.answer, mission.answer - 1, mission.answer + 1];
  else {
    const used = new Set(mission.cycle);
    const wrongOrder = shuffled([...used].filter((id) => id !== mission.answer), random);
    const otherTokens = shuffled(Object.keys(PATTERN_SHAPES).filter((id) => !used.has(id)), random);
    answers = [mission.answer, ...[...wrongOrder, ...otherTokens].slice(0, 2)];
  }
  return shuffled(answers, random);
}

/** Creates a frozen six-question chapter run with independent question/choice shuffles. */
export function createPatternRun(chapterId, seed, recentMissionIds = [], length = 6) {
  const chapter = PATTERN_CHAPTERS.find((item) => item.id === chapterId);
  const pool = PATTERN_MISSIONS.filter((item) => item.chapterId === chapterId);
  if (!chapter || !Number.isInteger(length) || pool.length < length || length < 1) return null;
  const numericSeed = normalizePatternSeed(seed);
  const random = makeRandom(numericSeed);
  const recent = new Set(recentMissionIds);
  const fresh = pool.filter((item) => !recent.has(item.id));
  const used = new Set();
  const choose = (items) => {
    const item = shuffled(items.filter((candidate) => !used.has(candidate.id)), random)[0];
    if (item) used.add(item.id);
    return item;
  };
  const selected = [];
  const form = (item) => item.kind === 'growing' ? 'growing'
    : item.cycle.length === 2 ? 'AB'
      : item.cycle.length === 4 ? 'ABCD'
        : item.cycle[0] === item.cycle[1] ? 'AAB'
          : item.cycle[1] === item.cycle[2] ? 'ABB' : 'ABC';
  const requiredForms = chapterId === 'colour-courtyard' ? ['AB', 'growing']
    : chapterId === 'festival-friends' ? ['AAB', 'ABB', 'ABC'] : ['AAB', 'ABB', 'growing', 'ABCD'];
  for (const required of requiredForms.slice(0, length)) {
    const choices = pool.filter((item) => form(item) === required);
    selected.push(choose(choices.filter((item) => fresh.includes(item))) || choose(choices));
  }
  const remainingFresh = shuffled(fresh.filter((item) => !used.has(item.id)), random);
  const remainingPool = shuffled(pool.filter((item) => !used.has(item.id) && !fresh.includes(item)), random);
  selected.push(...remainingFresh.slice(0, Math.max(0, length - selected.length)));
  if (selected.length < length) selected.push(...remainingPool.slice(0, length - selected.length));
  const orderedSelection = shuffled(selected, random);
  const lastSeen = recentMissionIds.at(-1);
  if (orderedSelection.length > 1 && orderedSelection[0].id === lastSeen) {
    const different = orderedSelection.findIndex((mission) => mission.id !== lastSeen);
    [orderedSelection[0], orderedSelection[different]] = [orderedSelection[different], orderedSelection[0]];
  }
  const rounds = orderedSelection.map((mission) => ({ ...mission, options: optionsFor(mission, random) }));
  if (rounds.some(({ answer, options }) => options.filter((option) => option === answer).length !== 1 || new Set(options).size !== 3)) return null;
  return { chapterId, seed: numericSeed, rounds, signature: rounds.map(({ id }) => id).join('|') };
}

export function validatePatternMissions(missions = PATTERN_MISSIONS) {
  const ids = new Set();
  const signatures = new Set();
  return missions.every((mission) => {
    if (!mission.id || ids.has(mission.id) || signatures.has(mission.signature)) return false;
    ids.add(mission.id);
    signatures.add(mission.signature);
    if (mission.kind === 'growing') return mission.sequence.length === 3 && mission.answer === mission.sequence[2] + 1 && mission.sequence[0] > 0;
    const cycle = mission.cycle;
    if (!Array.isArray(cycle) || cycle.length < 2 || cycle.some((id) => !PATTERN_SHAPES[id])) return false;
    if (mission.sequence.length < cycle.length * 2 || mission.sequence.some((id, index) => id !== cycle[index % cycle.length])) return false;
    return mission.answer === cycle[mission.sequence.length % cycle.length] && mission.signature === `repeat:${cycle.join('-')}:${mission.sequence.join('-')}`;
  });
}

export function seededPatternRunSeed(random = Math.random) {
  return Math.floor(random() * 0x100000000) >>> 0;
}
import { getOfflineVoiceClip } from './offlineVoice.js';
