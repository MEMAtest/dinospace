import { isDecodableWith } from './literacy.js';

export const BATCH6_BANDS = Object.freeze([
  { id: 'starter', name: 'Warm-up', badge: 'First steps' },
  { id: 'growing', name: 'Try a new rule', badge: 'Curious thinker' },
  { id: 'challenge', name: 'Big discoveries', badge: 'Discovery star' },
]);
export const BATCH6_QUESTION_COUNTS = Object.freeze({ pattern: 6, hangman: 6, chess: 5, astronaut: 6 });
export const distinctBatch6FactLines = (explanation, fact) => {
  const lines = [];
  if (typeof explanation === 'string' && explanation.trim()) lines.push({ text: explanation, kind:'explanation' });
  const normalize = (value) => String(value || '').trim().replace(/\s+/g,' ').toLowerCase();
  if (typeof fact === 'string' && fact.trim() && normalize(fact) !== normalize(explanation)) lines.push({ text: fact, kind:'fact' });
  return lines;
};
const stableContentId = (kind, content) => {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < content.length; index += 1) {
    const code = content.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ code, 0x85ebca6b) >>> 0;
  }
  return `${kind}-${first.toString(16).padStart(8,'0')}${second.toString(16).padStart(8,'0')}`;
};

export const seededRandom = (seed) => {
  let state = (Number(seed) >>> 0) || 1;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
};
export const seededShuffle = (items, random) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
export const makeSeed = () => Math.floor(Math.random() * 0x7fffffff) + 1;
export const makeQueue = (items, count, seed) => seededShuffle(items, seededRandom(seed)).slice(0, count);
export const makeFreshQueue = (gameId, playerId, items, count, seed, signature = (item) => item.id) => {
  const key = `amari_batch6_recent_${gameId}_${playerId}_v1`;
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(key) || '[]'); } catch { recent = []; }
  const seenSignatures = new Set();
  const uniqueItems = items.filter((item) => {
    const itemSignature = signature(item);
    if (seenSignatures.has(itemSignature)) return false;
    seenSignatures.add(itemSignature);
    return true;
  });
  const unseen = uniqueItems.filter((item) => !recent.includes(signature(item)));
  const eligible = unseen.length >= count ? unseen : uniqueItems;
  const queue = makeQueue(eligible, count, seed);
  try { localStorage.setItem(key, JSON.stringify([...recent, ...queue.map(signature)].slice(-Math.max(8, items.length)))); } catch { /* private mode keeps the run usable */ }
  return queue;
};

export const BATCH6_PROGRESS_KEY = 'amari_batch6_progress_v1';
const VALID_GAME_IDS = new Set(['pattern','hangman','chess','astronaut']);
const VALID_CHAPTERS = new Set(BATCH6_BANDS.map((band) => band.id));
const validStars = (stars) => Number.isInteger(stars) && stars >= 1 && stars <= 3;
const safeList = (value, maximum = 400) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string' && item.length > 0 && item.length <= 160))].slice(0, maximum) : [];
const isKnownBadge = (gameId, badge) => BATCH6_BANDS.some((band) => badge === `${gameId}_${band.id}_badge_v1`);
export const readBatch6Progress = (gameId, playerId) => {
  if (!VALID_GAME_IDS.has(gameId) || typeof playerId !== 'string' || !playerId) return { completed: [], bestStars: {}, facts: [], missed: [] };
  try {
    const root = JSON.parse(localStorage.getItem(BATCH6_PROGRESS_KEY) || '{}');
    const saved = root?.[playerId]?.[gameId] || {};
    const bestStars = Object.fromEntries(Object.entries(saved.bestStars || {}).filter(([chapter, stars]) => VALID_CHAPTERS.has(chapter) && validStars(stars)));
    return {
      completed: safeList(saved.completed, BATCH6_BANDS.length).filter((chapter) => VALID_CHAPTERS.has(chapter)),
      bestStars,
      facts: safeList(saved.facts).filter((fact) => BATCH6_GAME_FACTS[gameId]?.has(fact)),
      missed: safeList(saved.missed, 400).filter((id) => isKnownItemId(gameId, id)),
      badges: safeList(saved.badges, BATCH6_BANDS.length).filter((badge) => isKnownBadge(gameId, badge)),
    };
  } catch { return { completed: [], bestStars: {}, facts: [], missed: [] }; }
};
export const saveBatch6Run = (gameId, playerId, chapter, stars, facts, missed = [], resolved = [], completion = {}) => {
  const expectedCount = BATCH6_QUESTION_COUNTS[gameId];
  const itemIds = safeList(completion.itemIds, expectedCount);
  if (!VALID_GAME_IDS.has(gameId) || typeof playerId !== 'string' || !playerId || !VALID_CHAPTERS.has(chapter) || !validStars(stars)
    || completion.queueLength !== expectedCount || completion.completedCount !== expectedCount || itemIds.length !== expectedCount
    || itemIds.some((id) => !isKnownItemId(gameId, id))) return { saved: false, delta: 0 };
  try {
    const root = JSON.parse(localStorage.getItem(BATCH6_PROGRESS_KEY) || '{}');
    const profile = root[playerId] || {};
    const previous = profile[gameId] || { completed: [], bestStars: {}, facts: [], missed: [] };
    const bestStars = Object.fromEntries(Object.entries(previous.bestStars || {}).filter(([key, value]) => VALID_CHAPTERS.has(key) && validStars(value)));
    const delta = Math.max(0, stars - (bestStars[chapter] || 0));
    bestStars[chapter] = Math.max(bestStars[chapter] || 0, stars);
    profile[gameId] = {
      ...previous,
      completed: [...new Set([...safeList(previous.completed, BATCH6_BANDS.length), chapter])].filter((item) => VALID_CHAPTERS.has(item)),
      badges: [...new Set([...safeList(previous.badges, BATCH6_BANDS.length).filter((badge) => isKnownBadge(gameId, badge)), `${gameId}_${chapter}_badge_v1`])],
      bestStars,
      facts: [...new Set([...safeList(previous.facts).filter((fact) => BATCH6_GAME_FACTS[gameId]?.has(fact)), ...safeList(facts, expectedCount).filter((fact) => BATCH6_GAME_FACTS[gameId]?.has(fact))])].slice(-400),
      missed: [...new Set([...safeList(previous.missed).filter((id) => isKnownItemId(gameId, id)), ...safeList(missed, expectedCount).filter((id) => isKnownItemId(gameId, id))])].filter((id) => !safeList(resolved, expectedCount).includes(id)).slice(-400),
    };
    root[playerId] = profile;
    localStorage.setItem(BATCH6_PROGRESS_KEY, JSON.stringify(root));
    return { saved: true, delta };
  } catch { return { saved: false, delta: 0 }; }
};

const PATTERN_RECOLOR_TOKENS = ['🟣','🟠','🟢','🟡','🌙','⭐','🔵','🟤','🐶','🐱','🐭','🐰','🍎','🍐','🍊','🍇','🔺','🔷','⬟','⚫','🦕','🦖','🥚','🌋','🧡','💚','💙','💜','🍓','🍋','🥝','🍉','🐢','🦋','🐝','🐞','🥕','🍌','🍍','⚽','🏀','🎾','🎱','🧩','🎈','🎁','🛸','🪐','☀️','☁️','🌈','❄️','🔥','💧','🍄','🌵','🌻','🐠','🐙','🐬','🦀','🦉','🦊','🐻','🐸','🐧','🐥','🦄','🐳','🍪','🍰','🧁','🍦','🧸','🎨','🪁','🛶','🌠'];
const PATTERN_SOUND_CHOICES = ['👏','🥁','🔔','🪇','🎺','🪈','🎹','🎸','🪘','🪕','📯','🪗'];
const PATTERN_MOVEMENT_CHOICES = ['⬆️','➡️','⬇️','⬅️','↗️','↘️','↙️','↖️','⤴️','⤵️','↔️','↕️'];
const BASE_PATTERN_TOKENS = [...new Set(['🔴','🔵','🟡','🟢','⭐','🌙','🚀','🦖','⬟','▲','●','🦕','🥚','🌋',...PATTERN_RECOLOR_TOKENS,...PATTERN_SOUND_CHOICES,...PATTERN_MOVEMENT_CHOICES])].sort((a,b)=>b.length-a.length);
const tokenizePatternTerm = (value) => {
  const remaining = String(value);
  const result = [];
  let cursor = 0;
  while (cursor < remaining.length) {
    const token = BASE_PATTERN_TOKENS.find((candidate) => remaining.startsWith(candidate, cursor));
    if (!token) return [];
    result.push(token);
    cursor += token.length;
  }
  return result;
};
const pattern = (rule, tokens, answer, label, fact) => {
  const sequence = [...tokens, '?'];
  const candidates = [...new Set(['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🚀', '🦖', '⬟', '▲', '●'])].filter((v) => v !== answer);
  const modality = /beat|rhythm/i.test(label) ? 'sound rule' : rule === 'growing' || /step|walk/i.test(label) ? 'movement rule' : 'picture rule';
  const options = [answer, ...candidates.slice(0, 3)];
  const symbolTokens = [...new Set([...tokens, answer, ...options].flatMap(tokenizePatternTerm))];
  const growthRule = rule !== 'growing' ? null : symbolTokens.filter((symbol) => tokenizePatternTerm(answer).includes(symbol)).length > 1 ? 'alternate' : 'repeat';
  const signature = `${rule}|${sequence.join('')}>${answer}|${options.join(',')}`;
  return { id: stableContentId('pattern', signature), rule, sequence, answer, label, fact, signature, modality, options, symbolTokens, growthRule };
};
const addPatternVariations = (missions) => {
  const symbols = PATTERN_RECOLOR_TOKENS;
  return [...missions, ...Array.from({length: missions.length * 8}, (_, variant) => {
    const missionIndex = Math.floor(variant / 8);
    const variantIndex = variant % 8;
    const mission = missions[missionIndex];
    const palette = symbols.slice(variant, variant + mission.symbolTokens.length);
    const mapping = new Map(mission.symbolTokens.map((symbol,position)=>[symbol,palette[position]]));
    const recolour = (value) => tokenizePatternTerm(value).map((symbol)=>mapping.get(symbol)).join('');
    const sequence=mission.sequence.map((term)=>term==='?'?'?':recolour(term));
    const answer=recolour(mission.answer);
    const options=[...new Set(mission.options.map(recolour))];
    const fact = { AB:'Two different parts take turns in an AB pattern.', AAB:'An AAB pattern repeats two matching parts, then one different part.', ABB:'An ABB pattern repeats one part, then two matching parts.', ABC:'An ABC pattern repeats three different parts in the same order.', growing:mission.growthRule === 'alternate' ? 'Each step adds one symbol, alternating the first and second symbols.' : 'Each step adds one more copy of the same symbol.' }[mission.rule];
    const signature=`${mission.rule}|${sequence.join('')}>${answer}|${options.join(',')}`;
    return {...mission,id:stableContentId('pattern',signature),sequence,answer,options,symbolTokens:palette.slice(0,mission.symbolTokens.length),fact,signature,label:`${mission.rule} pattern ${variantIndex+1}`};
  })];
};
export const PATTERN_MISSIONS = Object.freeze({
  starter: addPatternVariations([
    pattern('AB', ['🔴','🔵','🔴','🔵'], '🔴', 'Red, blue, repeat', 'An AB pattern has two parts that take turns.'),
    pattern('AB', ['⭐','🌙','⭐','🌙'], '⭐', 'Star, moon, repeat', 'Look for the two pictures that take turns.'),
    pattern('AAB', ['🦖','🦖','🚀','🦖','🦖'], '🚀', 'Two dinos, one rocket', 'AAB means two of one thing, then one of another.'),
    pattern('ABB', ['🔴','🔵','🔵','🔴','🔵'], '🔵', 'One red, two blue', 'ABB means one red, then two blue.'),
    pattern('AB', ['▲','●','▲','●'], '▲', 'Shape steps', 'Shapes can make a repeating pattern too.'),
    pattern('AAB', ['🌙','🌙','⭐','🌙','🌙'], '⭐', 'Moon, moon, star', 'Say the pattern aloud to hear its repeat.'),
  ]),
  growing: addPatternVariations([
    pattern('ABC', ['🔴','🔵','🟡','🔴','🔵','🟡'], '🔴', 'Three-colour parade', 'ABC uses three parts before the repeat begins.'),
    pattern('AAB', ['🚀','🚀','🦖','🚀','🚀'], '🦖', 'Two rockets, one dino', 'The pair stays together before the single dino.'),
    pattern('ABB', ['⭐','🌙','🌙','⭐','🌙'], '🌙', 'Star, moon, moon', 'ABB repeats one star and then two moons.'),
    pattern('ABC', ['▲','●','⬟','▲','●'], '⬟', 'Shape parade', 'Track all three shapes in the same order.'),
    pattern('growing', ['🔴','🔴🔵','🔴🔵🔴'], '🔴🔵🔴🔵', 'Add one each time', 'A growing pattern adds one more colour-step each turn.'),
    pattern('ABC', ['🦖','🚀','⭐','🦖','🚀'], '⭐', 'Dino, rocket, star', 'The whole three-picture unit repeats.'),
  ]),
  challenge: addPatternVariations([
    pattern('growing', ['⭐','⭐⭐','⭐⭐⭐'], '⭐⭐⭐⭐', 'Growing star trail', 'Each step adds one more star.'),
    pattern('growing', ['🔴','🔴🔵','🔴🔵🔴'], '🔴🔵🔴🔵', 'Growing alternating walk', 'Each step adds one symbol, alternating red and blue.'),
    pattern('ABC', ['🦖','⭐','🚀','🦖','⭐','🚀'], '🦖', 'Three-scene repeat', 'The complete dino, star, rocket unit repeats.'),
    pattern('AAB', ['●','●','▲','●','●'], '▲', 'Double beat', 'Listen for two matching beats and one different beat.'),
    pattern('ABB', ['🌙','🚀','🚀','🌙','🚀'], '🚀', 'Moon, double rocket', 'One moon is followed by two rockets.'),
    pattern('ABC', ['🟢','🟡','🔵','🟢','🟡'], '🔵', 'Three-step rhythm', 'Keep the same order across all three parts.'),
  ]),
});

const patternPresentationMap = (mission) => {
  const symbols = mission.symbolTokens || [];
  const palette = mission.modality === 'sound rule' ? PATTERN_SOUND_CHOICES : PATTERN_MOVEMENT_CHOICES;
  if (symbols.length > palette.length) return new Map();
  const seed = Number.parseInt(stableContentId('pattern-display', mission.signature).slice(-8), 16) || 1;
  const labels = seededShuffle(palette, seededRandom(seed));
  return new Map(symbols.map((symbol, index) => [symbol, labels[index]]));
};
export const patternDisplayTerm = (mission, value) => {
  if (!mission || mission.modality === 'picture rule') return value;
  const presentation = patternPresentationMap(mission);
  return tokenizePatternTerm(value).map((symbol) => presentation.get(symbol) || '').join('');
};

// Recolored variants that present the same visible pattern share an opaque key.
// Choice order is excluded because it is shuffled independently; answer text stays local to this computation.
export const patternContentSignature = (mission) => stableContentId('pattern-content', JSON.stringify({
  modality: mission.modality,
  rule: mission.rule,
  sequence: mission.sequence.map((term) => term === '?' ? '?' : patternDisplayTerm(mission, term)),
  answer: patternDisplayTerm(mission, mission.answer),
}));

const MOVEMENT_NAMES = { '⬆️':'up arrow', '➡️':'right arrow', '⬇️':'down arrow', '⬅️':'left arrow', '↗️':'up-right arrow', '↘️':'down-right arrow', '↙️':'down-left arrow', '↖️':'up-left arrow', '⤴️':'turning-up arrow', '⤵️':'turning-down arrow', '↔️':'side-to-side arrow', '↕️':'up-and-down arrow' };
export const patternMovementCue = (mission) => {
  if (mission?.rule === 'growing' && mission.growthRule === 'alternate') {
    const [first, second] = tokenizePatternTerm(mission.sequence[1] || '');
    const firstName = MOVEMENT_NAMES[patternDisplayTerm(mission, first)] || 'first arrow';
    const secondName = MOVEMENT_NAMES[patternDisplayTerm(mission, second)] || 'second arrow';
    return `Each step adds one arrow, alternating ${firstName} then ${secondName}.`;
  }
  if (mission?.rule === 'growing') return 'Each step adds one more copy of the same arrow.';
  if (mission?.rule === 'AAB') return 'Two matching arrows, then one different arrow, make the repeating group.';
  if (mission?.rule === 'ABB') return 'One arrow, then two matching arrows, make the repeating group.';
  if (mission?.rule === 'ABC') return 'Watch the same three arrows repeat in order.';
  return 'Watch the two arrows take turns.';
};

export const HANGMAN_WORDS_BY_BAND = Object.freeze({
  starter: [
    { word:'CAT', graphemes:['c','a','t'], family:'at', emoji:'🐱', clue:'A pet that can purr.', fact:'Cats use whiskers to help sense nearby spaces.' },
    { word:'MAT', graphemes:['m','a','t'], family:'at', emoji:'🧺', clue:'A small rug on the floor.', fact:'A mat can keep muddy footprints by the door.' },
    { word:'SAT', graphemes:['s','a','t'], family:'at', emoji:'🪑', clue:'What you did when you rested on a chair.', fact:'Dinosaurs lived millions of years before chairs.' },
    { word:'MAP', graphemes:['m','a','p'], family:'ap', emoji:'🗺️', clue:'A picture that helps you find a place.', fact:'Maps use symbols to show places and paths.' },
    { word:'TAP', graphemes:['t','a','p'], family:'ap', emoji:'🚰', clue:'Turn this to let water flow.', fact:'A tap brings clean water through pipes.' },
    { word:'PAT', graphemes:['p','a','t'], family:'at', emoji:'🦕', clue:'A gentle little touch on a dino’s back.', fact:'Some fossil footprints show how dinosaurs walked.' },
    { word:'SUN', graphemes:['s','u','n'], family:'un', emoji:'☀️', clue:'The bright star that lights our daytime sky.', fact:'The Sun is a star at the centre of our solar system.' },
    { word:'RUN', graphemes:['r','u','n'], family:'un', emoji:'🏃', clue:'Move quickly on your feet.', fact:'Many dinosaurs walked on two legs; some walked on four.' },
    { word:'FUN', graphemes:['f','u','n'], family:'un', emoji:'🎈', clue:'A happy time playing a game.', fact:'Play helps children practise new ideas.' },
    { word:'PIN', graphemes:['p','i','n'], family:'in', emoji:'📌', clue:'A small sharp fastener for a noticeboard.', fact:'A pin has a point, so grown-ups handle it carefully.' },
    { word:'TIN', graphemes:['t','i','n'], family:'in', emoji:'🥫', clue:'A metal container for food.', fact:'Metal can be shaped into useful containers.' },
    { word:'SIT', graphemes:['s','i','t'], family:'it', emoji:'🪑', clue:'Rest on a chair with your bottom down.', fact:'A chair supports your body when you sit.' },
  ],
  growing: [
    { word:'BUG', graphemes:['b','u','g'], family:'ug', emoji:'🐛', clue:'A tiny creature that might crawl through grass.', fact:'Many bugs have six legs and belong to the insect group.' },
    { word:'CUP', graphemes:['c','u','p'], family:'up', emoji:'🥤', clue:'A small container you can drink from.', fact:'A cup holds a drink so it is easier to carry.' },
    { word:'PIG', graphemes:['p','i','g'], family:'ig', emoji:'🐷', clue:'A farm animal with a curly tail.', fact:'Pigs are clever mammals with a strong sense of smell.' },
    { word:'BED', graphemes:['b','e','d'], family:'ed', emoji:'🛏️', clue:'A cosy place to sleep at night.', fact:'Sleep gives growing bodies time to rest.' },
    { word:'HAT', graphemes:['h','a','t'], family:'at', emoji:'🎩', clue:'Something you can wear on your head.', fact:'A hat can help shade your head from the Sun.' },
    { word:'HEN', graphemes:['h','e','n'], family:'en', emoji:'🐔', clue:'A grown-up chicken that lays eggs.', fact:'A hen uses her beak to peck at food.' },
    { word:'JAM', graphemes:['j','a','m'], family:'am', emoji:'🫙', clue:'A sweet fruit spread for toast.', fact:'Fruit contains seeds that can grow into new plants.' },
    { word:'NET', graphemes:['n','e','t'], family:'et', emoji:'🥅', clue:'A mesh that can catch a ball or fish.', fact:'A net is made from linked strands with holes between them.' },
    { word:'BUS', graphemes:['b','u','s'], family:'us', emoji:'🚌', clue:'A large vehicle that carries many people.', fact:'Buses can carry lots of passengers on one trip.' },
    { word:'PEN', graphemes:['p','e','n'], family:'en', emoji:'🖊️', clue:'A tool that writes with ink.', fact:'A pen moves ink onto paper to make marks and letters.' },
    { word:'TOP', graphemes:['t','o','p'], family:'op', emoji:'🌀', clue:'A toy that spins around on a point.', fact:'A spinning top stays upright while it moves quickly.' },
    { word:'MUD', graphemes:['m','u','d'], family:'ud', emoji:'🟤', clue:'Wet soft earth after rain.', fact:'Soil and water together can make sticky mud.' },
  ],
  challenge: [
    { word:'CLAP', graphemes:['c','l','a','p'], family:'cl', emoji:'👏', clue:'Bring your hands together to make this sound.', fact:'The first two consonants in clap blend together: /c/ then /l/.' },
    { word:'CRAB', graphemes:['c','r','a','b'], family:'cr', emoji:'🦀', clue:'A sea animal that walks sideways.', fact:'A crab has a hard outer shell and two claws.' },
    { word:'TRIP', graphemes:['t','r','i','p'], family:'tr', emoji:'🧳', clue:'A short journey to another place.', fact:'The first two consonants in trip blend together: /t/ then /r/.' },
    { word:'STAMP', graphemes:['s','t','a','m','p'], family:'st', emoji:'📮', clue:'A little picture you stick on a letter before posting it.', fact:'In stamp, /s/ and /t/ blend at the start; /m/ and /p/ are the last two sounds.' },
    { word:'FROG', graphemes:['f','r','o','g'], family:'fr', emoji:'🐸', clue:'A green animal that can hop and croak.', fact:'A frog is an amphibian: it can live in water and on land.' },
    { word:'CLIP', graphemes:['c','l','i','p'], family:'cl', emoji:'📎', clue:'A small metal loop that holds papers together.', fact:'The two sounds at the start of clip can be heard separately.' },
    { word:'DRUM', graphemes:['d','r','u','m'], family:'dr', emoji:'🥁', clue:'A musical instrument you hit to make a beat.', fact:'The first two consonants in drum blend together: /d/ then /r/.' },
    { word:'GRAB', graphemes:['g','r','a','b'], family:'gr', emoji:'🤲', clue:'Take hold of something with your hand.', fact:'A consonant blend keeps both sounds when you say the word.' },
    { word:'GRIN', graphemes:['g','r','i','n'], family:'gr', emoji:'😁', clue:'A wide happy smile.', fact:'The /g/ and /r/ sounds both stay clear at the start of grin.' },
    { word:'STOP', graphemes:['s','t','o','p'], family:'st', emoji:'🛑', clue:'A word that tells someone not to go on.', fact:'The /s/ and /t/ sounds both stay clear at the start of stop.' },
    { word:'SPIN', graphemes:['s','p','i','n'], family:'sp', emoji:'🌀', clue:'Turn around and around in a circle.', fact:'The /s/ and /p/ sounds both stay clear at the start of spin.' },
    { word:'CRUST', graphemes:['c','r','u','s','t'], family:'cr', emoji:'🍞', clue:'The outside edge of a loaf of bread.', fact:'The blend /cr/ begins crust, and /st/ ends it.' },
  ],
});
for (const words of Object.values(HANGMAN_WORDS_BY_BAND)) {
  words.forEach((entry) => {
    entry.id = stableContentId('word', entry.word);
    entry.signature = entry.word;
  });
}

const chessPuzzle = (id, band, piece, from, target, objective, board = []) => ({ id, band, piece, from, target, objective, board, signature:`${band}:${piece}:${from.join(',')}>${target.join(',')}:${board.map((x)=>`${x.piece}${x.color}${x.at.join('')}`).join('|')}`, fact:'In this mini-chess world, pieces move in their usual way. Pawns move forward and capture one square diagonally. There is no castling or promotion.' });
export const CHESS_PUZZLES = Object.freeze({
  starter: [
    chessPuzzle('rook-east','starter','rook',[4,0],[4,3],'Move the rook along its clear row to the star square.'),
    chessPuzzle('rook-up','starter','rook',[4,1],[1,1],'Move the rook straight up to the star square.'),
    chessPuzzle('bishop-diagonal','starter','bishop',[4,0],[1,3],'Move the bishop along the clear diagonal.'),
    chessPuzzle('knight-l','starter','knight',[4,1],[2,2],'Move the knight in its L-shape to the star square.'),
    chessPuzzle('king-step','starter','king',[3,2],[2,2],'Move the king one square to the star.'),
    chessPuzzle('queen-file','starter','queen',[4,4],[1,4],'Move the queen straight up the clear file.'),
    chessPuzzle('knight-jump','starter','knight',[3,0],[1,1],'Jump the knight in an L-shape over the blocker.' ,[{piece:'pawn',color:'black',at:[2,0]}]),
    chessPuzzle('rook-around','starter','rook',[4,2],[4,0],'Move the rook left along the clear row.' ,[{piece:'pawn',color:'black',at:[3,2]}]),
    chessPuzzle('bishop-other','starter','bishop',[0,0],[2,2],'Move the bishop along a clear diagonal.'),
    chessPuzzle('king-neighbour','starter','king',[2,3],[3,3],'Move the king one square down.'),
  ],
  growing: [
    chessPuzzle('safe-rook-a','growing','rook',[4,0],[4,3],'Capture the marked pawn with the rook, then check that its landing square is safe.',[{piece:'pawn',color:'black',at:[4,3]}]),
    chessPuzzle('safe-knight-a','growing','knight',[4,0],[2,1],'Capture the marked pawn with the knight safely.',[{piece:'pawn',color:'black',at:[2,1]}]),
    chessPuzzle('safe-bishop-a','growing','bishop',[4,0],[2,2],'Capture the marked pawn along the diagonal, if it is safe.',[{piece:'pawn',color:'black',at:[2,2]}]),
    chessPuzzle('safe-queen-a','growing','queen',[4,4],[1,4],'Capture the marked pawn with the queen safely.',[{piece:'pawn',color:'black',at:[1,4]}]),
    chessPuzzle('safe-rook-b','growing','rook',[0,0],[0,3],'Capture the marked pawn along the row safely.',[{piece:'pawn',color:'black',at:[0,3]}]),
    chessPuzzle('safe-knight-b','growing','knight',[0,4],[2,3],'Capture the marked pawn with the knight safely.',[{piece:'pawn',color:'black',at:[2,3]}]),
    chessPuzzle('safe-bishop-b','growing','bishop',[0,4],[2,2],'Capture the marked pawn along the diagonal safely.',[{piece:'pawn',color:'black',at:[2,2]}]),
    chessPuzzle('safe-queen-b','growing','queen',[0,0],[0,4],'Capture the marked pawn with the queen safely.',[{piece:'pawn',color:'black',at:[0,4]}]),
    chessPuzzle('safe-rook-c','growing','rook',[4,4],[1,4],'Capture the marked pawn up the file safely.',[{piece:'pawn',color:'black',at:[1,4]}]),
    chessPuzzle('safe-knight-c','growing','knight',[4,4],[2,3],'Capture the marked pawn with the knight safely.',[{piece:'pawn',color:'black',at:[2,3]}]),
  ],
  challenge: [
    chessPuzzle('mini-rook-block','challenge','rook',[4,0],[4,4],'Move along the clear row to the goal; a pawn blocks the rook’s upward path.',[{piece:'pawn',color:'black',at:[2,0]}]),
    chessPuzzle('mini-bishop-block','challenge','bishop',[4,0],[1,3],'Slide the bishop diagonally to the goal.',[{piece:'pawn',color:'black',at:[2,0]}]),
    chessPuzzle('mini-knight-block','challenge','knight',[4,2],[2,3],'The knight jumps over pieces to land on the star.',[{piece:'pawn',color:'black',at:[3,2]}]),
    chessPuzzle('mini-king-step','challenge','king',[4,4],[3,3],'Move the king one square diagonally to the goal.'),
    chessPuzzle('mini-queen-path','challenge','queen',[4,0],[1,3],'Use the queen’s diagonal path to reach the goal.'),
    chessPuzzle('mini-rook-row','challenge','rook',[2,4],[2,0],'Move across the clear row to the goal; leave the friendly pawn alone.',[{piece:'pawn',color:'white',at:[1,2]}]),
    chessPuzzle('mini-knight-alt','challenge','knight',[0,0],[2,1],'Jump in an L-shape to reach the goal.'),
    chessPuzzle('mini-bishop-alt','challenge','bishop',[0,4],[3,1],'Move diagonally to the marked square.'),
    chessPuzzle('mini-queen-file','challenge','queen',[0,2],[4,2],'Move straight down the open file.'),
    chessPuzzle('mini-king-safe','challenge','king',[2,2],[1,2],'Move the king one square up to the goal.'),
  ],
});

const insideBoard = ([row,col], size) => Number.isInteger(row) && Number.isInteger(col) && row >= 0 && col >= 0 && row < size && col < size;
const sign = (value) => value === 0 ? 0 : value > 0 ? 1 : -1;
const sameSquare = (a,b) => a[0] === b[0] && a[1] === b[1];
export const chessPieceAttacks = (piece, from, to, board = [], size = 5, color = 'white') => {
  const [dr,dc] = [to[0]-from[0],to[1]-from[1]];
  const ar=Math.abs(dr), ac=Math.abs(dc);
  if (!insideBoard(from,size)||!insideBoard(to,size)||sameSquare(from,to)) return false;
  let allowed=false;
  if (piece==='rook') allowed=(dr===0||dc===0);
  if (piece==='bishop') allowed=ar===ac;
  if (piece==='queen') allowed=ar===ac||dr===0||dc===0;
  if (piece==='king') allowed=Math.max(ar,ac)===1;
  if (piece==='knight') allowed=(ar===2&&ac===1)||(ar===1&&ac===2);
  if (piece==='pawn') allowed=(color==='black' ? dr===1 : dr===-1)&&ac===1;
  if (!allowed) return false;
  if (['rook','bishop','queen'].includes(piece)) {
    let row=from[0]+sign(dr), col=from[1]+sign(dc);
    while(row!==to[0]||col!==to[1]) { if(board.some((item)=>sameSquare(item.at,[row,col]))) return false; row+=sign(dr); col+=sign(dc); }
  }
  return true;
};
export const chessLegalMoves = (puzzle, size = 5) => {
  const occupied = puzzle.board || [];
  const own = occupied.filter((item)=>item.color==='white');
  const enemies = occupied.filter((item)=>item.color==='black');
  const moves=[];
  for(let row=0;row<size;row+=1) for(let col=0;col<size;col+=1) {
    const to=[row,col];
    if(own.some((item)=>sameSquare(item.at,to))) continue;
    const target=enemies.find((item)=>sameSquare(item.at,to));
    const attackType=puzzle.piece==='pawn' && target ? 'pawn' : puzzle.piece;
    if(chessPieceAttacks(attackType,puzzle.from,to,occupied.filter((item)=>!target||item!==target),size,'white')) moves.push(to);
  }
  return moves;
};
export const getChessMoveTransition = (puzzle, pieceSelected, square, size = 5) => {
  if (!Array.isArray(square) || !insideBoard(square, size)) return { kind:'ignore', selected:pieceSelected, attempted:false, clearFeedback:false };
  if (sameSquare(square, puzzle.from)) return { kind:pieceSelected ? 'deselect' : 'select', selected:!pieceSelected, attempted:false, clearFeedback:true };
  if (!pieceSelected) return { kind:'ignore', selected:false, attempted:false, clearFeedback:false };
  const legal = chessLegalMoves(puzzle, size).some((move) => sameSquare(move, square));
  const target = sameSquare(square, puzzle.target);
  if (legal && target) return { kind:'correct', selected:false, attempted:true, legal:true, clearFeedback:true };
  return { kind:'wrong', selected:true, attempted:true, legal, clearFeedback:false };
};
export const isSafeChessCapture = (puzzle, target = puzzle.target, size = 5) => {
  const targetPiece=(puzzle.board||[]).find((item)=>item.color==='black'&&sameSquare(item.at,target));
  if(!targetPiece) return false;
  const remaining=(puzzle.board||[]).filter((item)=>item!==targetPiece);
  return !(puzzle.board||[]).filter((item)=>item.color==='black'&&item!==targetPiece).some((enemy)=>chessPieceAttacks(enemy.piece,enemy.at,target,remaining,size,enemy.color));
};
export const validateChessPuzzle = (puzzle, size = 5) => {
  if(!puzzle?.id||!insideBoard(puzzle.from,size)||!insideBoard(puzzle.target,size)||!puzzle.objective) return false;
  if((puzzle.board||[]).some((item)=>!insideBoard(item.at,size)||!['white','black'].includes(item.color))) return false;
  if(!chessLegalMoves(puzzle,size).some((move)=>sameSquare(move,puzzle.target))) return false;
  if(puzzle.band==='growing') return (puzzle.board||[]).some((item)=>item.color==='black'&&sameSquare(item.at,puzzle.target))&&isSafeChessCapture(puzzle);
  return !(puzzle.board||[]).some((item)=>item.color==='white'&&sameSquare(item.at,puzzle.target));
};

export const validateTaughtWord = (entry, taughtSounds) => {
  const word = typeof entry === 'string' ? { word: entry } : entry;
  if (!word?.word || !Array.isArray(word.graphemes) || !word.graphemes.length) return false;
  if (word.graphemes.join('').toLowerCase() !== word.word.toLowerCase()) return false;
  return isDecodableWith(word, new Set(taughtSounds || []));
};

export const ASTRONAUT_MISSIONS = Object.freeze({
  starter: [
    { id:'sun', kind:'science', icon:'☀️', q:'What gives Earth most of its light and warmth?', answer:'The Sun', options:['The Sun','The Moon','A comet'], fact:'The Sun is a star. Its light and heat reach Earth.', source:'https://science.nasa.gov/sun/facts/' },
    { id:'moon-orbit', kind:'science', icon:'🌙', q:'What does the Moon travel around?', answer:'Earth', options:['Earth','Mars','The Sun only'], fact:'The Moon travels around Earth, and sunlight lights its surface.', source:'https://science.nasa.gov/moon/facts/' },
    { id:'mars', kind:'science', icon:'🔴', q:'Which planet is called the Red Planet?', answer:'Mars', options:['Mars','Venus','Neptune'], fact:'Iron minerals in Martian dust give Mars much of its rusty red colour.', source:'https://science.nasa.gov/mars/facts/' },
    { id:'space-suit', kind:'engineering', icon:'🧑‍🚀', q:'What helps an astronaut breathe outside a spacecraft?', answer:'A spacesuit', options:['A spacesuit','A raincoat','A paper hat'], fact:'A spacesuit supplies oxygen and helps protect an astronaut.', source:'https://www.nasa.gov/humans-in-space/what-is-a-spacesuit/' },
    { id:'solar-power', kind:'engineering', icon:'🔋', q:'What can solar panels turn sunlight into?', answer:'Electricity', options:['Electricity','Sand','Sound'], fact:'Solar panels collect energy from sunlight and convert it to electricity for spacecraft systems.', source:'https://science.nasa.gov/mission/lucy/spacecraft/' },
    { id:'rover-wheel', kind:'engineering', icon:'🤖', q:'Why does a Mars rover have wheels?', answer:'To travel over the ground', options:['To travel over the ground','To swim in oceans','To flap like a bird'], fact:'Rover wheels help robot explorers cross rocky ground on Mars.', source:'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/' },
    { id:'moon-light', kind:'science', icon:'🌙', q:'Where does moonlight come from?', answer:'Sunlight reflected by the Moon', options:['Sunlight reflected by the Moon','A lamp inside the Moon','The Moon making its own light'], fact:'The Moon does not make its own light; it reflects sunlight.', source:'https://science.nasa.gov/moon/moonlight/' },
    { id:'earth-water', kind:'science', icon:'🌊', q:'What covers most of Earth’s surface?', answer:'Water', options:['Water','Sand','Ice'], fact:'Most of Earth’s surface is covered by liquid water.', source:'https://science.nasa.gov/earth/facts/' },
    { id:'space-robot', kind:'engineering', icon:'📷', q:'What can a rover camera help scientists do?', answer:'See pictures of the place it explores', options:['See pictures of the place it explores','Hear music on Mars','Make the rover float'], fact:'Rover cameras take images that help teams study terrain and plan drives.', source:'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/' },
    { id:'earth-shape', kind:'science', icon:'🌍', q:'Which shape is closest to Earth?', answer:'A ball', options:['A ball','A flat square','A long tube'], fact:'Earth is nearly spherical, a little wider around its middle.', source:'https://science.nasa.gov/earth/facts/' },
    { id:'rocket-fuel', kind:'engineering', icon:'🚀', q:'What pushes a rocket upward at launch?', answer:'Hot gas pushed downward', options:['Hot gas pushed downward','A large fan','A parachute'], fact:'A rocket engine pushes exhaust downward; that push moves the rocket upward.', source:'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-rocket-grades-5-8/' },
    { id:'air-layer', kind:'science', icon:'🌬️', q:'What is the blanket of gases around Earth called?', answer:'The atmosphere', options:['The atmosphere','A ring','An ocean'], fact:'Earth’s atmosphere is a layer of gases around our planet.', source:'https://science.nasa.gov/earth/facts/' },
  ],
  growing: [
    { id:'gravity', kind:'science', icon:'🍎', q:'What keeps us on the ground on Earth?', answer:'Gravity', options:['Gravity','Moonlight','Wind'], fact:'Gravity is a force that pulls objects toward one another and keeps our feet on the ground.', source:'https://science.nasa.gov/universe/overview/forces/' },
    { id:'earth-rotation', kind:'science', icon:'🌍', q:'What makes day and night on Earth?', answer:'Earth spinning', options:['Earth spinning','The Moon changing shape','Mars moving'], fact:'Earth spins once about every 24 hours. The side facing the Sun has day; the side turned away has night.', source:'https://science.nasa.gov/earth/facts/' },
    { id:'water-ice', kind:'science', icon:'🧊', q:'Where has NASA found water ice on Mars?', answer:'Near the poles and underground', options:['Near the poles and underground','Inside every cloud','Only in rivers'], fact:'Mars has water ice in polar caps and beneath parts of its surface.', source:'https://science.nasa.gov/mars/facts/' },
    { id:'heat-shield', kind:'engineering', icon:'🔥', q:'What protects a spacecraft from heat as it enters an atmosphere?', answer:'A heat shield', options:['A heat shield','A sail','A parachute alone'], fact:'A heat shield protects a spacecraft from the heat of atmospheric entry.', source:'https://science.nasa.gov/solar-system/skywatching/night-sky-network/landing-on-mars-a-tricky-feat/' },
    { id:'parachute', kind:'engineering', icon:'🪂', q:'What helps a lander slow down in a planet’s atmosphere?', answer:'A parachute', options:['A parachute','A paddle','A flag'], fact:'A parachute creates drag and helps slow a descending spacecraft.', source:'https://www.nasa.gov/ames/ames-contributions-to-mars-2020-mission/' },
    { id:'antenna', kind:'engineering', icon:'📡', q:'What sends a rover’s messages back to Earth?', answer:'An antenna', options:['An antenna','A wheel','A scoop'], fact:'Spacecraft antennas send radio signals to Earth-based receivers.', source:'https://science.nasa.gov/mission/lucy/spacecraft/' },
    { id:'earth-seasons', kind:'science', icon:'🍂', q:'What mostly causes Earth’s seasons?', answer:'Earth’s tilted axis as it orbits the Sun', options:['Earth’s tilted axis as it orbits the Sun','The Moon changing shape','Mars heating Earth'], fact:'Earth’s tilt changes how directly sunlight reaches each hemisphere during the year.', source:'https://science.nasa.gov/earth/facts/' },
    { id:'mars-moons', kind:'science', icon:'🌕', q:'How many small moons orbit Mars?', answer:'Two', options:['Two','One','Five'], fact:'Mars has two small moons, Phobos and Deimos.', source:'https://science.nasa.gov/mars/moons/' },
    { id:'rover-camera', kind:'engineering', icon:'📸', q:'How can a rover help avoid a rock in its path?', answer:'Use cameras to see the ground', options:['Use cameras to see the ground','Close its eyes','Turn off its wheels'], fact:'Rover cameras help teams and onboard software see hazards and plan a safe route.', source:'https://science.nasa.gov/resource/how-perseverance-drives-on-mars/' },
    { id:'landing-legs', kind:'engineering', icon:'🦿', q:'Why does a lander need strong legs?', answer:'To stand safely on the surface', options:['To stand safely on the surface','To fly back to Earth','To make sunlight'], fact:'Landing systems need a stable way to touch down and support their spacecraft.', source:'https://science.nasa.gov/solar-system/skywatching/night-sky-network/landing-on-mars-a-tricky-feat/' },
    { id:'planet-path', kind:'science', icon:'🪐', q:'What is the name for a path around a star or planet?', answer:'An orbit', options:['An orbit','A shadow','A crater'], fact:'An orbit is the path an object follows around another object in space.', source:'https://science.nasa.gov/eclips/resources/glossary/' },
    { id:'signal-plan', kind:'engineering', icon:'🧭', q:'Why are rover commands planned ahead?', answer:'Signals take time to reach Mars', options:['Signals take time to reach Mars','Rovers have no computers','Mars has no daylight'], fact:'Because radio signals take time to cross the distance, rovers carry out planned commands.', source:'https://nas.nasa.gov/SC22/research/project10.html' },
  ],
  challenge: [
    { id:'venus', kind:'science', icon:'🟡', q:'Which planet has an extremely thick, hot atmosphere?', answer:'Venus', options:['Venus','Mercury','Uranus'], fact:'Venus has a dense carbon-dioxide atmosphere that traps heat.', source:'https://science.nasa.gov/venus/venus-facts/' },
    { id:'jupiter', kind:'science', icon:'🪐', q:'Which planet is the largest in our solar system?', answer:'Jupiter', options:['Jupiter','Earth','Mars'], fact:'Jupiter is the biggest planet in our solar system.', source:'https://science.nasa.gov/jupiter/jupiter-facts/' },
    { id:'europa', kind:'science', icon:'🧊', q:'Which moon is covered by an icy shell and may hide an ocean?', answer:'Europa', options:['Europa','Earth’s Moon','Phobos'], fact:'Evidence suggests Jupiter’s moon Europa has a salty ocean beneath its ice.', source:'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/' },
    { id:'parachute-design', kind:'engineering', icon:'🪂', q:'A heavier lander needs a safer landing. What design change helps slow it?', answer:'Use a larger parachute', options:['Use a larger parachute','Remove its radio','Add a longer flag'], fact:'A larger parachute can help slow a larger lander, but engineers test the design carefully.', source:'https://www.jpl.nasa.gov/news/nasa-tests-future-mars-landing-technology/' },
    { id:'rover-power', kind:'engineering', icon:'🔌', q:'A rover works far from sunlight. Which power source can keep it running?', answer:'A nuclear battery', options:['A nuclear battery','A paper sail','A wind-up key'], fact:'Some Mars rovers use radioisotope power systems to make electricity when sunlight is limited.', source:'https://science.nasa.gov/resource/power-for-mars-2020-2/' },
    { id:'signal-delay', kind:'engineering', icon:'📡', q:'Why can’t a driver steer a Mars rover like a remote toy car?', answer:'Radio messages take time to travel', options:['Radio messages take time to travel','Mars has no rocks','Rovers cannot turn'], fact:'Radio signals take several minutes to travel between Earth and Mars, so rovers need onboard plans.', source:'https://nas.nasa.gov/SC22/research/project10.html' },
    { id:'saturn-rings', kind:'science', icon:'🪐', q:'Which planet is famous for its bright rings?', answer:'Saturn', options:['Saturn','Mercury','Mars'], fact:'Saturn’s rings are made mostly of pieces of ice and rock.', source:'https://science.nasa.gov/saturn/facts/' },
    { id:'mars-day', kind:'science', icon:'🔴', q:'A day on Mars is a little longer than a day on Earth. What is one Mars day called?', answer:'A sol', options:['A sol','A month','A season'], fact:'Mars scientists call one Martian day a sol; it lasts about 24 hours and 39 minutes.', source:'https://science.nasa.gov/mars/facts/' },
    { id:'sample-tube', kind:'engineering', icon:'🧪', q:'What does a rover use to keep a rock sample for study?', answer:'A sealed sample tube', options:['A sealed sample tube','A paper bag','An open cup'], fact:'Perseverance seals rock and soil samples in clean tubes for possible future return.', source:'https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/' },
    { id:'solar-or-nuclear', kind:'engineering', icon:'☀️', q:'A spacecraft is near the Sun. Which power source can gather lots of sunlight?', answer:'Solar panels', options:['Solar panels','A candle','A windmill'], fact:'Solar arrays turn sunlight into electricity; mission planners choose power for where a spacecraft travels.', source:'https://science.nasa.gov/mission/lucy/spacecraft/' },
    { id:'venus-rotation', kind:'science', icon:'🌀', q:'Which way does Venus spin compared with most planets?', answer:'The opposite direction', options:['The opposite direction','It does not spin','Only toward Earth'], fact:'Venus rotates in the opposite direction to most planets.', source:'https://science.nasa.gov/venus/venus-facts/' },
    { id:'rover-obstacle', kind:'engineering', icon:'🪨', q:'What helps an exploring rover choose a path around a rock?', answer:'A map of the ground from its cameras', options:['A map of the ground from its cameras','A longer antenna alone','A louder signal'], fact:'Perseverance can use onboard navigation to map nearby terrain and avoid hazards.', source:'https://science.nasa.gov/resource/how-perseverance-drives-on-mars/' },
  ],
});

const BATCH6_GAME_ITEM_IDS = {
  pattern: new Set(Object.values(PATTERN_MISSIONS).flat().map((mission) => mission.id)),
  hangman: new Set(Object.values(HANGMAN_WORDS_BY_BAND).flat().map((mission) => mission.id)),
  chess: new Set(Object.values(CHESS_PUZZLES).flat().map((mission) => mission.id)),
  astronaut: new Set(Object.values(ASTRONAUT_MISSIONS).flat().map((mission) => mission.id)),
};
const BATCH6_GAME_FACTS = {
  pattern: new Set(Object.values(PATTERN_MISSIONS).flat().map((mission) => mission.fact)),
  hangman: new Set(Object.values(HANGMAN_WORDS_BY_BAND).flat().map((mission) => mission.fact)),
  chess: new Set(Object.values(CHESS_PUZZLES).flat().map((mission) => mission.fact)),
  astronaut: new Set(Object.values(ASTRONAUT_MISSIONS).flat().map((mission) => mission.fact)),
};
const isKnownItemId = (gameId, id) => {
  const canonicalId = gameId === 'astronaut' && id.startsWith('review-') ? id.slice('review-'.length) : id;
  return Boolean(BATCH6_GAME_ITEM_IDS[gameId]?.has(canonicalId));
};

export const validatePatternMission = (mission) => {
  if (!mission?.id || !mission.signature || mission.sequence.at(-1) !== '?') return false;
  if (!Array.isArray(mission.options) || mission.options.length !== 4 || new Set(mission.options).size !== 4 || !mission.options.includes(mission.answer)) return false;
  if (new Set(mission.options.map((option) => patternDisplayTerm(mission, option))).size !== 4
    || !mission.options.some((option) => patternDisplayTerm(mission, option) === patternDisplayTerm(mission, mission.answer))) return false;
  const signature = `${mission.rule}|${mission.sequence.join('')}>${mission.answer}|${mission.options.join(',')}`;
  if (mission.signature !== signature || mission.id !== stableContentId('pattern', signature)) return false;
  const allowed = new Set(mission.symbolTokens || []);
  const used = [...mission.sequence.slice(0,-1),mission.answer,...mission.options].flatMap(tokenizePatternTerm);
  if (!allowed.size || used.some((symbol)=>!allowed.has(symbol))) return false;
  const body = mission.sequence.slice(0, -1);
  if (mission.rule === 'AB') return body.length >= 4 && body.every((value, index) => value === body[index % 2]) && body[0] !== body[1] && mission.answer === body[0];
  if (mission.rule === 'AAB') return body.length >= 5 && body[0] === body[1] && body[2] !== body[0] && body[3] === body[0] && body[4] === body[0] && mission.answer === body[2];
  if (mission.rule === 'ABB') return body.length >= 5 && body[0] !== body[1] && body[1] === body[2] && body[3] === body[0] && body[4] === body[1] && mission.answer === body[2];
  if (mission.rule === 'ABC') return body.length >= 5 && body[0] !== body[1] && body[1] !== body[2] && body[2] !== body[0] && body.every((value,index)=>value===body[index%3]) && mission.answer===body[body.length%3];
  if (mission.rule === 'growing') {
    if (body.length < 3) return false;
    const terms = body.map(tokenizePatternTerm);
    const answer = tokenizePatternTerm(mission.answer);
    if (terms.some((term,index)=>term.length!==index+1)||!terms.every((term)=>term.length>0)||answer.length!==terms.at(-1).length+1) return false;
    if (mission.growthRule === 'repeat') {
      const symbol = terms[0][0];
      return terms.every((term,index)=>term.every((part)=>part===symbol)&&index===term.length-1)&&answer.every((part)=>part===symbol);
    }
    if (mission.growthRule === 'alternate') {
      const [first,second]=terms[1]||[];
      if(!first||!second||first===second)return false;
      const expected = (length) => Array.from({length},(_,index)=>index%2===0?first:second);
      return terms.every((term)=>term.join('|')===expected(term.length).join('|'))&&answer.join('|')===expected(answer.length).join('|');
    }
    return false;
  }
  return false;
};

export const validateAstronautMission = (mission) => Boolean(mission?.id && mission.q && mission.options.includes(mission.answer) && new Set(mission.options).size === mission.options.length && mission.fact && /^https:\/\/(science\.nasa\.gov|www\.nasa\.gov|mars\.nasa\.gov|spaceplace\.nasa\.gov|nas\.nasa\.gov|www\.jpl\.nasa\.gov|www\.esa\.int)\//.test(mission.source));
