import { BATCH5_SPELLING_WORDS } from './batch5Literacy.js';
import { PHASE_SOUNDS } from './learningProgress.js';

const soundOnly = (id, word, graphemes, phonemes, clue, artSubject, phase = 2) => Object.freeze({
  id: `safari-${id}`,
  word,
  graphemes: Object.freeze(graphemes.split(' ')),
  phonemes: Object.freeze(phonemes.split(' ')),
  clue,
  artSubject,
  phase,
  soundSafariOnly: true,
});

const additions = [
  soundOnly('ant', 'ant', 'a n t', 'a n t', 'A small insect with six legs.', 'One friendly ant, clearly showing six legs.'),
  soundOnly('bag', 'bag', 'b a g', 'b a g', 'A bag can carry things.', 'One small handled bag, with its shape clearly visible.'),
  soundOnly('bat', 'bat', 'b a t', 'b a t', 'A bat is a flying animal.', 'One small flying bat with visible wings; depict the animal sense.'),
  soundOnly('cab', 'cab', 'c a b', 'c a b', 'A cab is a taxi car.', 'One small yellow taxi cab, with no road or people.'),
  soundOnly('mug', 'mug', 'm u g', 'm u g', 'A mug holds a drink.', 'One handled ceramic mug, empty and viewed from the side.'),
  soundOnly('net', 'net', 'n e t', 'n e t', 'A net has many little holes.', 'One small fishing net, shown as a single object.'),
  soundOnly('pen', 'pen', 'p e n', 'p e n', 'A pen makes marks with ink.', 'One capped pen, clearly separate from a pencil.'),
  soundOnly('pig', 'pig', 'p i g', 'p i g', 'A pig is a farm animal with a round nose.', 'One friendly pink pig, shown alone.'),
  soundOnly('rag', 'rag', 'r a g', 'r a g', 'A rag is an old cloth used for wiping.', 'One folded cleaning cloth, visibly soft and frayed.'),
  soundOnly('rat', 'rat', 'r a t', 'r a t', 'A rat is a small animal with a long tail.', 'One friendly rat, distinct from a mouse and with a long tail.'),
  soundOnly('tag', 'tag', 't a g', 't a g', 'A tag is a small label attached to something.', 'One blank paper tag with a string loop; no letters or numbers.'),
  soundOnly('tub', 'tub', 't u b', 't u b', 'A tub holds water for a bath.', 'One small child bath tub, empty and isolated.'),
  soundOnly('truck', 'truck', 't r u ck', 't r u ck', 'A truck carries things on the road.', 'One friendly delivery truck, no driver, road or cargo text.'),
  soundOnly('brick', 'brick', 'b r i ck', 'b r i ck', 'A brick is a block used to build walls.', 'One red building brick, viewed clearly from the front.'),
  soundOnly('crab', 'crab', 'c r a b', 'c r a b', 'A crab has claws and walks sideways.', 'One cheerful crab with two claws and eight walking legs.'),
  soundOnly('flag', 'flag', 'f l a g', 'f l a g', 'A flag is cloth on a pole.', 'One plain bright flag on a short pole; no symbols or words.'),
  soundOnly('frog', 'frog', 'f r o g', 'f r o g', 'A frog is an animal that can hop.', 'One friendly green frog, with four legs and no pond.'),
  soundOnly('drum', 'drum', 'd r u m', 'd r u m', 'A drum is an instrument you can tap.', 'One small toy hand drum with two drumsticks beside it.'),
  soundOnly('clock', 'clock', 'c l o ck', 'c l o ck', 'A clock shows the time.', 'One round clock with simple hands and no numerals or words.'),
  soundOnly('plant', 'plant', 'p l a n t', 'p l a n t', 'A plant grows from roots and has leaves.', 'One small leafy plant with visible stem and leaves in a plain pot.'),
  soundOnly('sack', 'sack', 's a ck', 's a ck', 'A sack is a large bag made from cloth.', 'One tied cloth sack; no printed mark or contents visible.'),
  soundOnly('tent', 'tent', 't e n t', 't e n t', 'A tent is a fabric shelter.', 'One small camping tent, closed, with no people or landscape.'),
  soundOnly('belt', 'belt', 'b e l t', 'b e l t', 'A belt goes around your waist.', 'One simple belt with a visible buckle.'),
  soundOnly('pond', 'pond', 'p o n d', 'p o n d', 'A pond is a small pool of water.', 'One small oval pond with a clear water edge; no animals.'),
  soundOnly('nest', 'nest', 'n e s t', 'n e s t', 'A nest is a bird’s home.', 'One woven bird nest with two eggs; no bird or tree scene.'),
  soundOnly('raft', 'raft', 'r a f t', 'r a f t', 'A raft floats on water.', 'One simple wooden raft, isolated with no people or water scene.'),
  soundOnly('plank', 'plank', 'p l a n k', 'p l a n k', 'A plank is a long flat piece of wood.', 'One long, flat wooden plank, shown by itself.'),
  soundOnly('crust', 'crust', 'c r u s t', 'c r u s t', 'Crust is the firm outside edge of bread.', 'One slice of bread with the crust clearly visible.'),
  soundOnly('stump', 'stump', 's t u m p', 's t u m p', 'A stump is the short base left when a tree is cut.', 'One short tree stump with visible cut rings; no forest scene.'),
  soundOnly('chain', 'chain', 'ch ai n', 'ch ai n', 'A chain is made from linked metal loops.', 'One short metal chain with a few clearly linked loops.', 3),
  soundOnly('chess', 'chess', 'ch e ss', 'ch e ss', 'Chess is a board game played with pieces.', 'One small chessboard with contrasting pieces; no letters or numbers.', 3),
  soundOnly('tooth', 'tooth', 't oo th', 't oo-long th-unvoiced', 'A tooth helps you bite and chew.', 'One friendly clean tooth, clearly a single tooth.', 3),
  soundOnly('brush', 'brush', 'b r u sh', 'b r u sh', 'A brush has bristles on a handle.', 'One simple handled brush with a clear bristle head.', 3),
  soundOnly('snail', 'snail', 's n ai l', 's n ai l', 'A snail has a shell and moves slowly.', 'One small friendly snail with shell and eye stalks.', 3),
  soundOnly('sheep', 'sheep', 'sh ee p', 'sh ee p', 'A sheep has a woolly coat.', 'One fluffy sheep standing alone.', 3),
  soundOnly('shell', 'shell', 'sh e ll', 'sh e ll', 'A shell is a hard outer covering.', 'One ridged seashell, isolated with no beach scene.', 3),
  soundOnly('spoon', 'spoon', 's p oo n', 's p oo-long n', 'A spoon is used for eating or stirring.', 'One metal spoon viewed from above.', 3),
  soundOnly('shark', 'shark', 'sh ar k', 'sh ar k', 'A shark is a large fish with fins.', 'One friendly small shark, clear side view and no water scene.', 3),
  soundOnly('star', 'star', 's t ar', 's t ar', 'A star shines in the night sky.', 'One simple five-point star, without a face or trail.', 3),
  soundOnly('train', 'train', 't r ai n', 't r ai n', 'A train carries people or things on tracks.', 'One friendly passenger train with several connected cars.', 3),
  soundOnly('wheel', 'wheel', 'w ee l', 'w ee l', 'A wheel is a round part that helps something roll.', 'One round rubber wheel with a clear hub.', 3),
  soundOnly('branch', 'branch', 'b r a n ch', 'b r ar n ch', 'A branch grows out from a tree trunk.', 'One leafy tree branch, shown by itself.', 3),
  soundOnly('grass', 'grass', 'g r a ss', 'g r ar ss', 'Grass is a short green plant that covers the ground.', 'One small tuft of grass, isolated with clear blades.', 3),
  soundOnly('teeth', 'teeth', 't ee th', 't ee th-unvoiced', 'Teeth are the hard parts inside your mouth.', 'A small friendly row of several teeth, clearly plural.', 3),
];

const allById = new Map([...BATCH5_SPELLING_WORDS, ...additions].map((item) => [item.id, item]));
const idsToWords = (ids) => Object.freeze(ids.map((id) => {
  const item = allById.get(id);
  if (!item) throw new Error(`Unknown Sound Safari picture word: ${id}`);
  return item;
}));

// The picture-only target lexicon stays separate from the complete spelling bank.
// Existing spelling records are reused by their exact stable IDs; additions have
// `safari-` IDs and never enter spelling eligibility or its progress queues.
const stageOneWords = idsToWords([
  'safari-ant', 'safari-bag', 'safari-bat', 'safari-cab', 'can', 'cap', 'cat', 'cot', 'dog',
  'hen', 'log', 'mat', 'map', 'mop', 'safari-mug', 'safari-net', 'pan', 'safari-pen',
  'safari-pig', 'pin', 'pot', 'safari-rag', 'safari-rat', 'safari-tag', 'tap', 'safari-tub',
]);

const stageTwoWords = idsToWords([
  'duck', 'dock', 'rock', 'sock', 'lock', 'bell', 'hill',
  'safari-truck', 'safari-brick', 'safari-crab', 'safari-flag', 'safari-frog',
  'safari-drum', 'safari-clock', 'safari-plant', 'safari-sack', 'safari-tent',
  'safari-belt', 'safari-pond', 'safari-nest', 'safari-raft', 'safari-plank',
  'safari-crust', 'safari-stump',
]);

const stageThreeWords = idsToWords([
  'fish', 'ship', 'shop', 'chip', 'ring', 'rain', 'seed', 'feet', 'green', 'boat',
  'coat', 'moon', 'book', 'fork', 'safari-chain', 'safari-chess', 'safari-tooth',
  'safari-brush', 'safari-snail', 'safari-sheep', 'safari-shell', 'safari-spoon',
  'safari-shark', 'safari-star', 'safari-train', 'safari-wheel', 'safari-branch',
  'safari-grass', 'safari-teeth',
]);

export const SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER = Object.freeze([
  stageOneWords,
  stageTwoWords,
  stageThreeWords,
]);

// Paths are source/provenance references only. The pre-art candidate deliberately
// does not import cross-worktree files or render emoji fallbacks. `packaged` is
// set only when an approved local derivative has actually been copied and wired.
const approvedReuse = (path, sourceWorktree) => Object.freeze({ status: 'reuse-approved', path, sourceWorktree });
const inspectReuse = (path, sourceWorktree, note) => Object.freeze({ status: 'reuse-inspected-candidate', path, sourceWorktree, note });
const needsOriginal = (visualDescription) => Object.freeze({ status: 'missing-original', visualDescription });

const ART_ENTRIES = {
  map: approvedReuse('src/assets/curriculum/continent-map.svg', 'B5 same repository'),
  duck: approvedReuse('src/assets/memory-match/duck-v1-card.webp', 'B7 approved Memory art'),
  rock: approvedReuse('src/assets/memory-match/fossil-rock-v1-card.webp', 'B7 approved Memory art'),
  fish: approvedReuse('src/assets/memory-match/pond-fish-v1-card.webp', 'B7 approved Memory art'),
  moon: approvedReuse('src/assets/memory-match/crescent-moon-v1-card.webp', 'B7 approved Memory art'),
  'safari-star': inspectReuse('src/assets/memory-match/star-v1-card.webp', 'B7 approved Memory art', 'Inspected at 82px; recognizable as a plain five-point star.'),
  'safari-snail': inspectReuse('src/assets/memory-match/garden-snail-v1-card.webp', 'B7 approved Memory art', 'Inspected at 82px; recognizable as a snail with shell and eye stalks.'),
};

for (const word of [...stageOneWords, ...stageTwoWords, ...stageThreeWords]) {
  ART_ENTRIES[word.id] ||= needsOriginal(word.artSubject || word.clue || `One clear, isolated picture of ${word.word}.`);
}

export const SOUND_SAFARI_PICTURE_ART_MANIFEST = Object.freeze(ART_ENTRIES);

export const getSoundSafariPictureWords = (chapterIndex, taughtInput) => {
  const authored = SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[chapterIndex];
  if (!authored) return [];
  const taught = taughtInput instanceof Set
    ? taughtInput
    : new Set((taughtInput || []).map((item) => String(item).toLowerCase()));
  return authored.filter((item) => item.graphemes.every((grapheme) => taught.has(grapheme)));
};

export const soundSafariChapterArtReady = (chapterIndex) => {
  const words = SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[chapterIndex];
  return Boolean(words?.length && words.every((item) => SOUND_SAFARI_PICTURE_ART_MANIFEST[item.id]?.status === 'packaged'));
};

export const SOUND_SAFARI_ART_REUSE_SOURCE_HASHES = Object.freeze({
  duck: 'c9757ab5f08889deadbdced454db71158a1f859290b08e558e6662e2ce9278ca',
  fish: '498f5a27ddccd8c2d037234bed47627dcf888675efd4dd54d7bdb48453ba7a45',
  moon: '15bdee6910ed17c180d39bee630da99038b65450970a89cb7b4c6b91bd4c1b3b',
  rock: '8512f5b929dd781e88e0a44e1bbc4332dcaa03d634e7ab20917357f7b37daf46',
  'safari-star': '751db3be916edeb4f468d1f2b15c889e96d82e288dc24f54046d9ae9b042827a',
  'safari-snail': '7f746f3c82559ab610af117b8dd590563ed921e8bbccf3daa7bb4f4d45157be1',
  map: 'f2cf031eea577a99c379e5d0a9afcd29757c23d1b13c0812ed29ac5621428a5f',
});

export const SOUND_SAFARI_DEFAULT_TAUGHT = Object.freeze({
  phase2: PHASE_SOUNDS[2],
  phase3: Object.freeze([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]),
});
