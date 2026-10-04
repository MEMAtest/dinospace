// Authored strictly decodable word pools for the Batch 5 Amari literacy routes.
// `graphemes` records the intended phonics segmentation; no letter names are used as phoneme audio.
const word = (id, text, graphemes, emoji, clue, phase = 2, phonemes = graphemes.split(' ')) => Object.freeze({ id, word: text, graphemes: Object.freeze(graphemes.split(' ')), phonemes: Object.freeze(phonemes), emoji, clue, phase });

export const BATCH5_SPELLING_BANDS = Object.freeze([
  Object.freeze({ id: 'phase2-first', title: 'First sounds', skill: 'Build short words with the first taught sounds', phase: 2 }),
  Object.freeze({ id: 'phase2-more', title: 'More Phase 2 sounds', skill: 'Use the new Phase 2 sounds in short words', phase: 2 }),
  Object.freeze({ id: 'phase3', title: 'Longer sounds', skill: 'Use digraphs and long vowel sounds', phase: 3 }),
]);

export const BATCH5_SPELLING_WORDS = Object.freeze([
  word('sat','sat','s a t','🪑','To sit down on a chair'), word('pat','pat','p a t','🫳','A gentle tap with your hand'),
  word('pin','pin','p i n','📌','A tiny point that holds paper'), word('tin','tin','t i n','🥫','A small metal can'),
  word('map','map','m a p','🗺️','It shows where to go'), word('tap','tap','t a p','🚰','Water comes out of it'),
  word('dog','dog','d o g','🐶','A pet that barks'), word('log','log','l o g','🪵','A thick piece of a tree'),
  word('cat','cat','c a t','🐱','A furry pet that says meow'), word('kid','kid','k i d','🧒','Another word for a child'),
  word('hen','hen','h e n','🐔','A chicken that lays eggs'), word('red','red','r e d','🔴','The colour of a stop sign'),
  word('mat','mat','m a t','🧘','A soft floor covering'), word('man','man','m a n','🧍','An adult person'),
  word('tan','tan','t a n','🏖️','A light brown colour'), word('pan','pan','p a n','🍳','A pot used for frying'),
  word('nap','nap','n a p','😴','A short sleep'), word('sap','sap','s a p','🌳','Sticky tree liquid'),
  word('sip','sip','s i p','🥤','A small drink'), word('sit','sit','s i t','🪑','Rest on a chair'),
  word('pit','pit','p i t','🕳️','A small hole in the ground'), word('kit','kit','k i t','🧰','A small set of useful things'), word('tip','tip','t i p','🫗','The very end of something'),
  word('dip','dip','d i p','🥕','Put food into a sauce'), word('dim','dim','d i m','💡','Not very bright'),
  word('mad','mad','m a d','😠','Feeling cross'), word('sad','sad','s a d','😢','Feeling unhappy'),
  word('dad','dad','d a d','👨','A father'), word('gap','gap','g a p','↔️','An open space between things'),
  word('got','got','g o t','🎁','Received something'), word('pot','pot','p o t','🪴','A container for a plant'),
  word('top','top','t o p','🔝','The highest part'), word('mop','mop','m o p','🧹','A tool for cleaning a floor'),
  word('nod','nod','n o d','🙂','Move your head to say yes'), word('not','not','n o t','🚫','A word that means no'),
  word('cot','cot','c o t','🛏️','A small bed'), word('cop','cop','c o p','👮','A police officer'),
  word('cap','cap','c a p','🧢','A kind of hat'), word('can','can','c a n','🥫','A metal container'),

  word('duck','duck','d u ck','🦆','A bird that swims'), word('dock','dock','d o ck','⚓','A place where boats stop'),
  word('back','back','b a ck','🔙','The part behind you'), word('neck','neck','n e ck','🦒','The part joining head and body'),
  word('peck','peck','p e ck','🐦','A quick little bird tap'), word('sick','sick','s i ck','🤒','Not feeling well'),
  word('tick','tick','t i ck','✅','A small mark beside a choice'), word('rock','rock','r o ck','🪨','A hard piece of stone'),
  word('sock','sock','s o ck','🧦','Clothing for a foot'), word('lock','lock','l o ck','🔒','It keeps a door shut'),
  word('luck','luck','l u ck','🍀','Something good that happens by chance'), word('bell','bell','b e ll','🔔','It rings to make a sound'),
  word('fell','fell','f e ll','🍂','Dropped down'), word('tell','tell','t e ll','🗣️','Say something to someone'),
  word('sell','sell','s e ll','🏷️','Give something for money'), word('hill','hill','h i ll','⛰️','A small raised piece of land'),
  word('fill','fill','f i ll','🥛','Make something full'), word('miss','miss','m i ss','❌','Fail to catch or hit'),
  word('hiss','hiss','h i ss','🐍','A snake-like s sound'), word('less','less','l e ss','⬇️','A smaller amount'),
  word('mess','mess','m e ss','🧸','Things left untidy'), word('fuss','fuss','f u ss','😣','A lot of bother'),
  word('puff','puff','p u ff','💨','A little burst of air'), word('huff','huff','h u ff','😤','Breathe out in a cross way'),
  word('run','run','r u n','🏃','Move quickly on your feet'), word('fed','fed','f e d','🥣','Gave someone food'),
  word('hit','hit','h i t','⚾','Strike something'), word('but','but','b u t','↔️','A word that joins two ideas'),

  word('fish','fish','f i sh','🐟','It swims in water',3), word('ship','ship','sh i p','🚢','A big boat',3),
  word('shop','shop','sh o p','🏪','A place to buy things',3), word('shut','shut','sh u t','🚪','Close a door',3),
  word('thin','thin','th i n','🧵','Not thick',3,['th-unvoiced','i','n']), word('this','this','th i s','👆','A word for something nearby',3,['th-voiced','i','s']),
  word('that','that','th a t','👉','A word for something over there',3,['th-voiced','a','t']), word('chat','chat','ch a t','💬','Talk together',3),
  word('chin','chin','ch i n','🙂','The part below your mouth',3), word('chip','chip','ch i p','🍟','A small piece of potato',3),
  word('rich','rich','r i ch','💰','Having lots of money',3), word('much','much','m u ch','📦','A large amount',3),
  word('sing','sing','s i ng','🎤','Make music with your voice',3), word('ring','ring','r i ng','💍','A circle worn on a finger',3),
  word('song','song','s o ng','🎵','Words and music together',3), word('long','long','l o ng','📏','Not short',3),
  word('rain','rain','r ai n','🌧️','Water drops from clouds',3), word('tail','tail','t ai l','🐈','A part at the back of an animal',3),
  word('wait','wait','w ai t','⏳','Stay until something happens',3), word('pain','pain','p ai n','🩹','An ache in your body',3),
  word('sail','sail','s ai l','⛵','Travel in a boat with wind',3), word('seed','seed','s ee d','🌱','A tiny part that can grow',3),
  word('feet','feet','f ee t','🦶','You stand on these',3), word('green','green','g r ee n','🟢','The colour of grass',3),
  word('boat','boat','b oa t','⛵','It travels on water',3), word('coat','coat','c oa t','🧥','Clothing worn outdoors',3),
  word('road','road','r oa d','🛣️','A path for cars',3), word('moon','moon','m oo n','🌙','It shines in the night sky',3,['m','oo-long','n']),
  word('food','food','f oo d','🍲','Things people eat',3,['f','oo-long','d']), word('book','book','b oo k','📘','A story or facts to read',3,['b','oo-short','k']),
  word('look','look','l oo k','👀','Use your eyes to see',3,['l','oo-short','k']), word('farm','farm','f ar m','🚜','A place where food is grown',3),
  word('fork','fork','f or k','🍴','A tool with points for eating',3), word('turn','turn','t ur n','↩️','Change the way you face',3),
]);

const FIRST_SOUND_SET = new Set('s a t p i n m d g o c k'.split(' '));
const MORE_SOUND_SET = new Set(['ck', 'e', 'u', 'r', 'h', 'b', 'f', 'ff', 'l', 'll', 'ss']);
export const SPELLING_WORDS_BY_BAND = Object.freeze(Object.fromEntries(BATCH5_SPELLING_BANDS.map((band) => [band.id, Object.freeze(BATCH5_SPELLING_WORDS.filter((item) => band.id === 'phase2-first'
  ? item.phase === 2 && item.graphemes.every((g) => FIRST_SOUND_SET.has(g))
  : band.id === 'phase2-more'
    ? item.phase === 2 && item.graphemes.some((g) => MORE_SOUND_SET.has(g))
    : item.phase === 3))])));

export const PURE_PHONEME_CLIP_PATHS = Object.freeze(Object.fromEntries([...new Set(BATCH5_SPELLING_WORDS.flatMap(({ phonemes }) => phonemes))].map((phoneme) => [phoneme, `/audio/phonemes/en/${encodeURIComponent(phoneme)}.mp3`])));
export const BATCH5_NARRATION = Object.freeze({
  instruction: Object.freeze(['Listen for the sound. Choose the picture that starts with it.', 'Say each sound. Blend them. Which picture shows the word?', 'Look at the picture. Which sound do you hear at this place?', 'Look, say each sound, and build the word.', 'One sound is missing. Choose the sound that completes the word.', 'Say the word slowly. Build it one sound at a time.']),
  prompts: Object.freeze(['Listen for the sound. Which picture begins with it?', 'Say each sound. Blend them. Which picture shows the word?', 'Which sound do you hear first?', 'Which sound do you hear in the middle?', 'Which sound do you hear at the end?', 'Build the word that matches the picture.']),
  praise: Object.freeze(['Good listening. You found the sound.', 'Well done. You built the word.', 'That is correct. Look at the word you made.', 'Great work. You heard the sounds in order.']),
  retry: Object.freeze(['Try again. Look closely at the clue.', 'Not quite. Say the word slowly and listen again.', 'Take your time. Choose one sound to try.']),
  hints: Object.freeze(['Listen to each sound and blend them together.', 'Look at the picture and say the word slowly.', 'Check the sound at the beginning of the word.']),
  next: 'Choose Next when you are ready for another word.',
});

export const BATCH5_SOUND_SAFARI_CHAPTERS = Object.freeze([
  Object.freeze({ id: 'hear-match', title: 'Hear and match', skill: 'Hear a taught first sound and match its picture' }),
  Object.freeze({ id: 'oral-blending', title: 'Blend the sounds', skill: 'Blend ordered taught sounds into a word' }),
  Object.freeze({ id: 'sound-positions', title: 'Find the sound', skill: 'Find a sound at the start, middle, or end' }),
]);
