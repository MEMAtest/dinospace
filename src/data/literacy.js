export const LITERACY_PROFILE_KEY = 'amari_child_learning_profile_v1';
export const WRITING_SAMPLES_KEY = 'amari_writing_samples_v1';

export const PHASE_GROUPS = [
  { id: 'phase2-start', label: 'Phase 2 · Starting sounds', graphemes: ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k'] },
  { id: 'phase2-more', label: 'Phase 2 · More sounds', graphemes: ['ck', 'e', 'u', 'r', 'h', 'b', 'f', 'ff', 'l', 'll', 'ss'] },
  { id: 'phase3', label: 'Phase 3', graphemes: ['j', 'v', 'w', 'x', 'y', 'z', 'zz', 'qu', 'ch', 'sh', 'th', 'ng', 'ai', 'ee', 'igh', 'oa', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'er'] },
];

export const DEFAULT_TAUGHT_GRAPHEMES = PHASE_GROUPS[0].graphemes;

export const getTaughtGraphemes = () => {
  let profile = {};
  try {
    profile = JSON.parse(globalThis.localStorage?.getItem(LITERACY_PROFILE_KEY) || '{}');
  } catch { /* use the safe default */ }
  const taught = Array.isArray(profile.selectedSounds)
    ? profile.selectedSounds
    : Array.isArray(profile.taughtGraphemes) ? profile.taughtGraphemes : DEFAULT_TAUGHT_GRAPHEMES;
  return new Set(taught.map((item) => String(item).toLowerCase()));
};

export const isDecodableWith = (word, taught = getTaughtGraphemes()) => {
  const graphemes = (word.graphemes || word.word.toLowerCase().split('')).map((item) => item.toLowerCase());
  return graphemes.every((item) => taught.has(item));
};

export const PHASE_WORDS = [
  { word: 'SAT', graphemes: ['s', 'a', 't'], family: '-at', phase: 2, emoji: '🪑', hint: 'To sit down on a chair' },
  { word: 'PAT', graphemes: ['p', 'a', 't'], family: '-at', phase: 2, emoji: '🫳', hint: 'A gentle tap with your hand' },
  { word: 'PIN', graphemes: ['p', 'i', 'n'], family: '-in', phase: 2, emoji: '📌', hint: 'A tiny point that holds paper' },
  { word: 'TIN', graphemes: ['t', 'i', 'n'], family: '-in', phase: 2, emoji: '🥫', hint: 'A small metal can' },
  { word: 'MAP', graphemes: ['m', 'a', 'p'], family: '-ap', phase: 2, emoji: '🗺️', hint: 'It shows where to go' },
  { word: 'TAP', graphemes: ['t', 'a', 'p'], family: '-ap', phase: 2, emoji: '🚰', hint: 'Water comes out of it' },
  { word: 'DOG', graphemes: ['d', 'o', 'g'], family: '-og', phase: 2, emoji: '🐶', hint: 'A pet that barks' },
  { word: 'LOG', graphemes: ['l', 'o', 'g'], family: '-og', phase: 2, emoji: '🪵', hint: 'A thick piece of a tree' },
  { word: 'CAT', graphemes: ['c', 'a', 't'], family: '-at', phase: 2, emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'KID', graphemes: ['k', 'i', 'd'], family: '-id', phase: 2, emoji: '🧒', hint: 'Another word for a child' },
  { word: 'HEN', graphemes: ['h', 'e', 'n'], family: '-en', phase: 2, emoji: '🐔', hint: 'A chicken that lays eggs' },
  { word: 'RED', graphemes: ['r', 'e', 'd'], family: '-ed', phase: 2, emoji: '🔴', hint: 'The colour of this circle' },
  { word: 'FISH', graphemes: ['f', 'i', 'sh'], family: 'sh', phase: 3, emoji: '🐟', hint: 'It swims in water' },
  { word: 'CHIP', graphemes: ['ch', 'i', 'p'], family: 'ch', phase: 3, emoji: '🍟', hint: 'A small piece of potato' },
  { word: 'SHIP', graphemes: ['sh', 'i', 'p'], family: 'sh', phase: 3, emoji: '🚢', hint: 'A big boat' },
  { word: 'RAIN', graphemes: ['r', 'ai', 'n'], family: 'ai', phase: 3, emoji: '🌧️', hint: 'Water that falls from clouds' },
  { word: 'FEET', graphemes: ['f', 'ee', 't'], family: 'ee', phase: 3, emoji: '🦶', hint: 'You stand on these' },
  { word: 'BOAT', graphemes: ['b', 'oa', 't'], family: 'oa', phase: 3, emoji: '⛵', hint: 'It travels on water' },
  { word: 'MOON', graphemes: ['m', 'oo', 'n'], family: 'oo', phase: 3, emoji: '🌙', hint: 'It shines in the night sky' },
];

export const TRICKY_WORDS = [
  { word: 'I', phase: 2 }, { word: 'THE', phase: 2 }, { word: 'NO', phase: 2 },
  { word: 'GO', phase: 2 }, { word: 'TO', phase: 2 }, { word: 'INTO', phase: 2 },
  { word: 'HE', phase: 3 }, { word: 'SHE', phase: 3 }, { word: 'WE', phase: 3 },
  { word: 'ME', phase: 3 }, { word: 'BE', phase: 3 }, { word: 'WAS', phase: 3 },
];

export const DECODABLE_CAPTIONS = [
  { text: 'A CAT SAT.', needs: ['a', 'c', 's', 't'], phase: 2 },
  { text: 'PAT A DOG.', needs: ['p', 'a', 't', 'd', 'o', 'g'], phase: 2 },
  { text: 'A HEN IN A PEN.', needs: ['a', 'h', 'e', 'n', 'i', 'p'], phase: 2 },
  { text: 'THE FISH IS IN THE SHIP.', needs: ['th', 'f', 'i', 'sh', 's', 'n', 'p'], phase: 3 },
  { text: 'THE BOAT IS IN THE RAIN.', needs: ['th', 'b', 'oa', 't', 'i', 's', 'n', 'r', 'ai'], phase: 3 },
];

export const getAvailableWords = () => {
  const taught = getTaughtGraphemes();
  const available = PHASE_WORDS.filter((word) => isDecodableWith(word, taught));
  return available.length >= 3 ? available : PHASE_WORDS.slice(0, 3);
};

export const getAvailableTrickyWords = () => {
  let activePhase = 2;
  try {
    activePhase = Number(JSON.parse(globalThis.localStorage?.getItem(LITERACY_PROFILE_KEY) || '{}').activePhase) === 3 ? 3 : 2;
  } catch { /* use Phase 2 */ }
  return TRICKY_WORDS.filter((item) => item.phase <= activePhase).map((item) => ({
    ...item,
    graphemes: item.word.toLowerCase().split(''),
    family: 'tricky',
    emoji: '⭐',
    hint: 'A tricky word to remember by heart',
  }));
};

export const makeLearningEvent = ({ skill, item, response, correct, firstTry, hints = 0, difficulty = 'starter', extra = {} }) => ({
  skill, item, response, correct, firstAttempt: firstTry, firstTry, hints, difficulty,
  independent: Boolean(correct && firstTry && hints === 0),
  timestamp: new Date().toISOString(),
  ...extra,
});
