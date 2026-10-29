export const SPELLING_WORD_ART = Object.freeze({
  SAT: { src: '/art/spelling-v1/sat.webp', alt: 'A child sitting on a wooden chair.' },
  PAT: { src: '/art/spelling-v1/pat.webp', alt: 'A child gently patting a happy puppy.' },
  MAT: { src: '/art/spelling-v1/mat.webp', alt: 'A soft rectangular exercise mat.' },
  RAG: { src: '/art/spelling-v1/rag.webp', alt: 'A folded cleaning cloth with a frayed corner.' },
});

// Reviewed, spelling-specific word cues. Graphemes are explicit so digraphs
// and repeated letters stay as separate, correctly buildable sound tiles.
export const SPELLING_WORDS = [
  { word: 'SAT', graphemes: ['s', 'a', 't'], phase: 2, family: '-at', emoji: '🪑', hint: 'He sat on a chair. Sat tells us he was sitting.' },
  { word: 'PAT', graphemes: ['p', 'a', 't'], phase: 2, family: '-at', emoji: '🫳', hint: 'Pat means to tap gently with your hand.' },
  { word: 'PIN', graphemes: ['p', 'i', 'n'], phase: 2, family: '-in', emoji: '📌', hint: 'A small sharp pin can hold paper.' },
  { word: 'TIN', graphemes: ['t', 'i', 'n'], phase: 2, family: '-in', emoji: '🥫', hint: 'Food can be kept in a tin can.' },
  { word: 'MAP', graphemes: ['m', 'a', 'p'], phase: 2, family: '-ap', emoji: '🗺️', hint: 'A map shows places and roads.' },
  { word: 'TAP', graphemes: ['t', 'a', 'p'], phase: 2, family: '-ap', emoji: '🚰', hint: 'Turn this to let water flow.' },
  { word: 'DOG', graphemes: ['d', 'o', 'g'], phase: 2, family: '-og', emoji: '🐕', hint: 'A dog is a pet that can bark.' },
  { word: 'LOG', graphemes: ['l', 'o', 'g'], phase: 2, family: '-og', emoji: '🪵', hint: 'A log is a thick piece of a tree trunk.' },
  { word: 'CAT', graphemes: ['c', 'a', 't'], phase: 2, family: '-at', emoji: '🐈', hint: 'A cat is a furry pet that may purr.' },
  { word: 'KID', graphemes: ['k', 'i', 'd'], phase: 2, family: '-id', emoji: '🧒', hint: 'A kid is another word for a child.' },
  { word: 'HEN', graphemes: ['h', 'e', 'n'], phase: 2, family: '-en', emoji: '🐔', hint: 'A hen is a grown-up chicken that lays eggs.' },
  { word: 'RED', graphemes: ['r', 'e', 'd'], phase: 2, family: '-ed', emoji: '🔴', hint: 'This circle is red.' },
  { word: 'SAD', graphemes: ['s', 'a', 'd'], phase: 2, family: '-ad', emoji: '🙁', hint: 'A sad face shows someone feeling unhappy.' },
  { word: 'MAD', graphemes: ['m', 'a', 'd'], phase: 2, family: '-ad', emoji: '😠', hint: 'A mad face can show someone feeling cross.' },
  { word: 'MAT', graphemes: ['m', 'a', 't'], phase: 2, family: '-at', emoji: '🧘', hint: 'Stand or sit on a mat.' },
  { word: 'PAN', graphemes: ['p', 'a', 'n'], phase: 2, family: '-an', emoji: '🍳', hint: 'A pan is used to cook food.' },
  { word: 'TAN', graphemes: ['t', 'a', 'n'], phase: 2, family: '-an', emoji: '🟤', hint: 'Tan is a light brown colour.' },
  { word: 'MAN', graphemes: ['m', 'a', 'n'], phase: 2, family: '-an', emoji: '🧔', hint: 'A man is a grown-up male person.' },
  { word: 'NAP', graphemes: ['n', 'a', 'p'], phase: 2, family: '-ap', emoji: '😴', hint: 'A nap is a short sleep.' },
  { word: 'GAP', graphemes: ['g', 'a', 'p'], phase: 2, family: '-ap', emoji: '↔️', hint: 'A gap is an empty space between things.' },
  { word: 'TAG', graphemes: ['t', 'a', 'g'], phase: 2, family: '-ag', emoji: '🏷️', hint: 'A tag is a small label on something.' },
  { word: 'RAG', graphemes: ['r', 'a', 'g'], phase: 2, family: '-ag', emoji: '🧽', hint: 'A rag is a small cloth for wiping.' },
  { word: 'DIP', graphemes: ['d', 'i', 'p'], phase: 2, family: '-ip', emoji: '🥣', hint: 'Dip a crisp into a bowl of sauce.' },
  { word: 'SIP', graphemes: ['s', 'i', 'p'], phase: 2, family: '-ip', emoji: '🥤', hint: 'Take a small sip from a cup.' },
  { word: 'FISH', graphemes: ['f', 'i', 'sh'], phase: 3, family: 'sh', emoji: '🐟', hint: 'A fish swims in water using its fins.' },
  { word: 'SHIP', graphemes: ['sh', 'i', 'p'], phase: 3, family: 'sh', emoji: '🚢', hint: 'A ship is a large boat that sails on water.' },
  { word: 'SHOP', graphemes: ['sh', 'o', 'p'], phase: 3, family: 'sh', emoji: '🏪', hint: 'A shop is a place where people buy things.' },
  { word: 'CHIP', graphemes: ['ch', 'i', 'p'], phase: 3, family: 'ch', emoji: '🍟', hint: 'A chip is a long piece of cooked potato.' },
  { word: 'CHOP', graphemes: ['ch', 'o', 'p'], phase: 3, family: 'ch', emoji: '🔪', hint: 'Chop means to cut food into small pieces.' },
  { word: 'CHAT', graphemes: ['ch', 'a', 't'], phase: 3, family: 'ch', emoji: '💬', hint: 'A chat is a friendly talk.' },
  { word: 'CHIN', graphemes: ['ch', 'i', 'n'], phase: 3, family: 'ch', emoji: '🙂', hint: 'Your chin is the part below your mouth.' },
  { word: 'THIN', graphemes: ['th', 'i', 'n'], phase: 3, family: 'th', emoji: '📏', hint: 'Thin means not very wide.' },
  { word: 'THAT', graphemes: ['th', 'a', 't'], phase: 3, family: 'th', emoji: '👉', hint: 'That points to a thing farther away.' },
  { word: 'RAIN', graphemes: ['r', 'ai', 'n'], phase: 3, family: 'ai', emoji: '🌧️', hint: 'Rain is water that falls from clouds.' },
  { word: 'PAIN', graphemes: ['p', 'ai', 'n'], phase: 3, family: 'ai', emoji: '🩹', hint: 'Pain is an uncomfortable feeling in your body.' },
  { word: 'TAIL', graphemes: ['t', 'ai', 'l'], phase: 3, family: 'ai', emoji: '🐈', hint: 'An animal has a tail at the back of its body.' },
  { word: 'WAIT', graphemes: ['w', 'ai', 't'], phase: 3, family: 'ai', emoji: '⏳', hint: 'Wait means stay until something is ready.' },
  { word: 'FEET', graphemes: ['f', 'ee', 't'], phase: 3, family: 'ee', emoji: '🦶', hint: 'Feet are at the ends of your legs.' },
  { word: 'SEEN', graphemes: ['s', 'ee', 'n'], phase: 3, family: 'ee', emoji: '👀', hint: 'Seen means noticed with your eyes.' },
  { word: 'DEEP', graphemes: ['d', 'ee', 'p'], phase: 3, family: 'ee', emoji: '🌊', hint: 'Deep water reaches far down.' },
  { word: 'BOAT', graphemes: ['b', 'oa', 't'], phase: 3, family: 'oa', emoji: '⛵', hint: 'A boat carries people across water.' },
  { word: 'COAT', graphemes: ['c', 'oa', 't'], phase: 3, family: 'oa', emoji: '🧥', hint: 'Wear a coat to keep warm outside.' },
  { word: 'GOAT', graphemes: ['g', 'oa', 't'], phase: 3, family: 'oa', emoji: '🐐', hint: 'A goat is a farm animal with hooves.' },
  { word: 'MOON', graphemes: ['m', 'oo', 'n'], phase: 3, family: 'oo', emoji: '🌙', hint: 'The moon can be seen in the night sky.' },
  { word: 'FOOD', graphemes: ['f', 'oo', 'd'], phase: 3, family: 'oo', emoji: '🍲', hint: 'Food is what people and animals eat.' },
  { word: 'LOOK', graphemes: ['l', 'oo', 'k'], phase: 3, family: 'oo', emoji: '👀', hint: 'Look means use your eyes to see.' },
];

export const SPELLING_RECENT_KEY = 'amari_spelling_recent_v1';
export const SPELLING_TRICKY_WORDS = [
  { word: 'I', phase: 2, emoji: '🙋', hint: 'I is the word we use when we talk about ourselves.' },
  { word: 'THE', phase: 2, emoji: '👉', hint: 'The points to a particular person, place or thing.' },
  { word: 'NO', phase: 2, emoji: '🙅', hint: 'No is a word for saying something is not allowed or wanted.' },
  { word: 'GO', phase: 2, emoji: '🚶', hint: 'Go means move or travel somewhere.' },
  { word: 'TO', phase: 2, emoji: '➡️', hint: 'To can show where someone or something is going.' },
  { word: 'INTO', phase: 2, emoji: '📥', hint: 'Into means moving from outside to inside.' },
  { word: 'HE', phase: 3, emoji: '👦', hint: 'He is a word used for a boy or a man.' },
  { word: 'SHE', phase: 3, emoji: '👧', hint: 'She is a word used for a girl or a woman.' },
  { word: 'WE', phase: 3, emoji: '👥', hint: 'We means me and one or more other people.' },
  { word: 'ME', phase: 3, emoji: '🙋', hint: 'Me is the word for yourself when someone acts on you.' },
  { word: 'BE', phase: 3, emoji: '🌱', hint: 'Be is a word we use in a phrase like be kind.' },
  { word: 'WAS', phase: 3, emoji: '🕰️', hint: 'Was tells that something happened before now.' },
];

// Longer-word practice reuses existing reviewed recordings; no provider call is needed.
export const LONGER_SPELLING_WORDS = [
  ['ROCK', ['r','o','ck'], '🪨', 'A hard lump of stone.'],
  ['FROG', ['f','r','o','g'], '🐸', 'A small hopping animal that lives near ponds.'],
  ['STEM', ['s','t','e','m'], '🌱', 'The stalk that holds up a flower.'],
  ['BRICK', ['b','r','i','ck'], '🧱', 'A small block used to build a wall.'],
  ['GLASS', ['g','l','a','ss'], '🥛', 'A see-through material used for windows.'],
  ['HANDS', ['h','a','n','d','s'], '👐', 'The body parts at the ends of your arms.'],
  ['PLANT', ['p','l','a','n','t'], '🪴', 'A living thing with roots and leaves.'],
  ['METAL', ['m','e','t','a','l'], '🥄', 'A strong material used to make many spoons.'],
  ['PETAL', ['p','e','t','a','l'], '🌸', 'One of the colourful parts around a flower’s centre.'],
  ['RABBIT', ['r','a','b','b','i','t'], '🐇', 'A furry animal with long ears that hops.'],
  ['SUMMER', ['s','u','m','m','e','r'], '☀️', 'The warm season after spring.'],
  ['CANDLE', ['c','a','n','d','l','e'], '🕯️', 'A wax stick with a wick that gives light.'],
  ['PLASTIC', ['p','l','a','s','t','i','c'], '🧴', 'A material used for many bottles and toys.'],
].map(([word, graphemes, emoji, cue]) => ({ word, graphemes, emoji, cue, hint: cue, phase: 2, family: 'longer words' }));

export const spellingLevelWords = (level, taught) => {
  if (level < 3) return decodableSpellingWords(taught);
  return LONGER_SPELLING_WORDS.filter((item) =>
    (level === 3 ? item.word.length === 4 : level === 4 ? item.word.length === 5 : item.word.length >= 6)
    && item.graphemes.every((sound) => taught.has(sound)));
};

// Meaning cues support spelling without printing the target. Keep the full
// reviewed hint above for the success explanation and for Copy mode.
export const SPELLING_PREANSWER_CUES = Object.freeze({
  SAT: 'A chair can hold someone after they sit down.',
  PAT: 'Give a puppy a gentle tap with your hand.',
  PIN: 'A tiny sharp fastener can hold papers together.',
  TIN: 'Food can come in a metal can.',
  MAP: 'A picture can show roads and places.',
  TAP: 'Turn this to make water flow.',
  DOG: 'A furry pet can bark and wag its tail.',
  LOG: 'A thick piece of a tree trunk can burn in a fire.',
  CAT: 'A furry pet may purr and meow.',
  KID: 'Another word for a child.',
  HEN: 'A grown-up chicken lays eggs.',
  RED: 'The colour of many stop signs.',
  SAD: 'A face may show this feeling after losing a toy.',
  MAD: 'A face may show this feeling when someone feels cross.',
  MAT: 'A soft rectangle can sit under someone doing stretches.',
  PAN: 'Cook food in a round metal pot with a handle.',
  TAN: 'A light brown shade.',
  MAN: 'An adult person.',
  NAP: 'A short daytime sleep.',
  GAP: 'An empty space between two things.',
  TAG: 'A small label attached to an item.',
  RAG: 'A frayed cloth used for wiping.',
  DIP: 'Put a crisp into a bowl of sauce.',
  SIP: 'Take a small drink from a cup.',
  FISH: 'A water animal swims with fins.',
  SHIP: 'A large boat sails across the sea.',
  SHOP: 'A place where people buy things.',
  CHIP: 'A thin piece of cooked potato.',
  CHOP: 'Cut food into smaller pieces with a knife.',
  CHAT: 'A friendly talk with another person.',
  CHIN: 'The part below your mouth.',
  THIN: 'Something that is not very wide.',
  THAT: 'A pointer word for something farther away.',
  RAIN: 'Water drops fall from clouds.',
  PAIN: 'An uncomfortable feeling in your body.',
  TAIL: 'The part at the back of an animal.',
  WAIT: 'Stay here until something is ready.',
  FEET: 'Body parts at the ends of legs.',
  SEEN: 'Noticed something with your eyes.',
  DEEP: 'Water may reach far down.',
  BOAT: 'A vehicle that carries people across water.',
  COAT: 'Wear this outside to keep warm.',
  GOAT: 'A farm animal with hooves and a beard.',
  MOON: 'A round object shines in the night sky.',
  FOOD: 'People and animals eat this.',
  LOOK: 'Use your eyes to see something.',
  I: 'Use this word when talking about yourself.',
  THE: 'This pointer word comes before a particular person, place, or thing.',
  NO: 'Say this to refuse something or show it is not wanted.',
  GO: 'Move from here to another place.',
  TO: 'This short word can show where someone is headed.',
  INTO: 'Use this for movement from outside to inside.',
  HE: 'A pronoun used for a boy or a man.',
  SHE: 'A pronoun used for a girl or a woman.',
  WE: 'Use this when you mean yourself and at least one other person.',
  ME: 'This word names yourself as the person receiving an action.',
  BE: 'A verb meaning exist or become.',
  WAS: 'Use this for something that happened before now.',
});

export const qualifiesForIndependentSpelling = ({ mode, hadMistake = false, usedTeachingHint = false }) => (
  ['spell', 'tricky'].includes(mode) && !hadMistake && !usedTeachingHint
);

const SPELLING_SESSION_MODES = Object.freeze(['copy', 'missing', 'spell']);
export const spellingSessionMode = (level) => SPELLING_SESSION_MODES[Math.min(Math.max(Number(level) || 0, 0), SPELLING_SESSION_MODES.length - 1)];

// Longer-word and tricky-word practice can be independent spelling without
// being evidence of a simple phase phoneme mastery item.
export const spellingAttemptMasteryEligible = ({ mode, word } = {}) => (
  mode !== 'tricky'
  && word?.family !== 'tricky'
  && word?.family !== 'longer words'
  && (word?.phase === 2 || word?.phase === 3)
);

export const spellingAttemptAttribution = ({ mode, word, hadMistake = false, usedTeachingHint = false } = {}) => ({
  firstAttempt: !hadMistake && !usedTeachingHint,
  independent: qualifiesForIndependentSpelling({ mode, hadMistake, usedTeachingHint }),
  masteryEligible: spellingAttemptMasteryEligible({ mode, word }),
});

// The speech hook accepts exact packaged segments. Keep punctuation on each
// displayed word so the spoken sequence corresponds to the caption as printed.
export const spellingCaptionSegments = (text, hasPackagedClip) => {
  if (typeof text !== 'string' || !text || typeof hasPackagedClip !== 'function') return null;
  const tokens = text.split(' ');
  if (tokens.join(' ') !== text) return null;
  const segments = tokens.map((token) => token.replace(/[.,!?;]+$/u, ''));
  if (segments.some((segment) => !segment || !hasPackagedClip(segment))) return null;
  return segments;
};

export const decodableSpellingWords = (taught) => SPELLING_WORDS.filter((item) => item.graphemes.every((grapheme) => taught.has(grapheme)));

export const spellingWordsForPhase = (phase, taught) => SPELLING_WORDS.filter((item) => item.phase === phase && item.graphemes.every((grapheme) => taught.has(grapheme)));
export const spellingTrickyWordsForPhase = (phase) => SPELLING_TRICKY_WORDS.filter((item) => item.phase <= phase).map((item) => ({ ...item, graphemes: item.word.toLowerCase().split(''), family: 'tricky' }));

const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const makeSpellingQueue = (items, { seed = 1, recent = [], avoid = 8 } = {}) => {
  const random = seededRandom(seed);
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  if (shuffled.length < 2) return shuffled;
  const recentSet = new Set(recent.slice(-avoid));
  const fresh = shuffled.filter((item) => !recentSet.has(item.word));
  const deferred = shuffled.filter((item) => recentSet.has(item.word));
  return [...fresh, ...deferred];
};

export const appendSpellingRecent = (recent, word, limit = 8) => [...recent.filter((item) => item !== word), word].slice(-limit);
