import {
  ADDITION_LEVELS, ADVANCED_NUMBER_PATTERN_ROUNDS, ADVANCED_PATTERN_ROUNDS, ASTRONAUT_CATEGORIES, ASTRONAUT_PROFILES,
  BLEND_WORDS, CHESS_PIECES, CHESS_PUZZLES, COLOR_MIX_ROUNDS, DINO_LEVELS,
  ENGLISH_PRAISE, GERMAN_PRAISE, HANGMAN_WORDS, LETTERS, MEMORY_LEVELS, MOVE_PRAISE,
  NUMBER_PATTERN_ROUNDS, ODD_ONE_OUT_ROUNDS, PATTERN_ROUNDS, PHONICS_ITEMS,
  PLANETS, SHAPES, SUBTRACTION_LEVELS, TRACE_LETTERS, WORD_BUILDER_WORDS,
} from '../src/data/index.js';
import { DECODABLE_CAPTIONS, PHASE_WORDS, TRICKY_WORDS } from '../src/data/literacy.js';
import { SPOT_DIFFERENCE_ROUNDS } from '../src/data/spotDifference.js';
import { normalizeVoiceText, voiceClipKey } from '../src/data/voiceKey.js';

const corpus = new Map();
const skyPraise = ['Brilliant flying!', 'Beautiful shape!', 'Fantastic tracing!', 'You nailed it!'];
const add = (text, lang = 'en-US') => {
  const normalized = normalizeVoiceText(text);
  if (!normalized) return;
  corpus.set(`${String(lang).toLowerCase().split('-')[0]}:${normalized.toLowerCase()}`, {
    text: normalized,
    lang,
    key: voiceClipKey(normalized, lang),
  });
};

[
  'Welcome Amari! Your next learning adventure is ready.',
  'Hello explorer! Your next learning adventure is ready.',
  'A brilliant draw. You both played well!',
  'Dino wins the round!', 'Rocket wins the round!', 'Nova Bot wins the round!',
  'You can win this turn!', 'Try the glowing square.',
  'Spot the difference. Compare the two superhero city pictures carefully.',
  'Build the dinosaur park picture. Choose a piece, then tap its matching place.',
  'Amazing! You built the whole dinosaur park picture.',
  'Tap each star to count them!', 'How many did you count?', 'Not quite, try again!',
  'A star has revealed a letter.', 'Mix!',
  'You matched them all. Fantastic memory!', 'Find the matching pairs.',
  'Quiz time!', 'Explore the heroes!',
  "Let's learn chess!", 'Amazing! You made five moves!', 'Meet the chess pieces!',
  'Find where the piece can move!', 'Move the pieces! Tap the glowing squares!',
  'Not quite. Check the discoveries and try again.',
  'All six shapes are complete. You are a sky shape superstar!',
].forEach((text) => add(text));

GERMAN_PRAISE.forEach((praise) => add(praise, 'de-DE'));

ENGLISH_PRAISE.forEach((praise) => add(praise));
['Super!'].forEach((praise) => {
  SHAPES.forEach((shape) => add(`${praise} You traced the ${shape.toLowerCase()}.`));
  add(`${praise} You found all three differences.`);
  for (let hour = 1; hour <= 12; hour += 1) add(`${praise} That's ${hour} o'clock!`);
});
add('Du hast alle gefunden. Super!', 'de-DE');

Object.values(SPOT_DIFFERENCE_ROUNDS).forEach((round) => {
  add(`Spot the difference. Compare the two ${round.title} pictures carefully. Find ${round.differences.length} changes.`);
});

SHAPES.forEach((shape) => add(`Trace the ${shape.toLowerCase()}. Follow the glowing flight path.`));
skyPraise.forEach((praise) => SHAPES.forEach((shape) => add(`${praise} You traced the ${shape}.`)));
for (let piece = 1; piece <= 16; piece += 1) add(`Piece ${piece} goes in the glowing space.`);
for (let number = 1; number <= 15; number += 1) add(`${number}`);

LETTERS.forEach(({ letter, word }) => add(`Find the letter ${letter}. ${letter} is for ${word}.`));
TRACE_LETTERS.forEach(({ upper, lower, word }) => {
  add(`Trace the big ${upper}. ${word}.`);
  add(`Trace the small ${lower}. ${word}.`);
});
PHONICS_ITEMS.forEach(({ word }) => add(`Listen to ${word}. Which picture starts with the same sound as ${word}?`));
add('Say each sound, then blend the word. What word does this make?');
BLEND_WORDS.forEach(({ letters, word }) => {
  add(`Blend the sounds: ${letters.join(' - ')}. What word does it make?`);
  letters.forEach((letter) => add(letter));
  add(`${word}!`);
});

WORD_BUILDER_WORDS.forEach(({ word, hint }) => {
  add(`Spell the word: ${word}. ${hint}`);
  add(`Spell ${word}. ${hint}`);
  [...word].forEach((letter) => add(letter));
  add(`${word}! Super!`);
});

PHASE_WORDS.forEach(({ word, hint, family }) => {
  add(`Spell the word: ${word}. ${hint}`);
  add(`Spell ${word}. ${hint}`);
  add(`${word}! Super!`);
  add(`Dino Hangman. ${family} word family. ${hint}`);
  add(`Great rescue! The word is ${word}.`);
  add(`Perfect rescue! The word is ${word}.`);
  add(`That was a tricky one. The word was ${word}. Let us try another!`);
  [...new Set(word)].forEach((letter) => add(`Yes! ${letter} is in the word.`));
});
TRICKY_WORDS.forEach(({ word }) => {
  add(`Spell the word: ${word}. A tricky word to remember by heart`);
  add(`Spell ${word}. A tricky word to remember by heart`);
  add(`${word}! Super!`);
});
DECODABLE_CAPTIONS.forEach(({ text }) => {
  add(`Read and copy: ${text}`);
});

HANGMAN_WORDS.forEach(({ word, clue, category }) => {
  add(`Dino Hangman. ${category}. ${clue}`);
  add(`${category}. ${clue}`);
  add(`Great rescue! The word is ${word}.`);
  add(`Perfect rescue! The word is ${word}.`);
  add(`That was a tricky one. The word was ${word}. Let us try another!`);
  [...new Set(word)].forEach((letter) => add(`Yes! ${letter} is in the word.`));
});
for (let shields = 1; shields <= 5; shields += 1) add(`Not this time. You have ${shields} shields left.`);

const MEMORY_CARD_NAMES = {
  '🐶': 'dog', '🦊': 'fox', '🐸': 'frog', '🐵': 'monkey', '🦄': 'unicorn', '🐙': 'octopus',
  '🐳': 'whale', '🐬': 'dolphin', '🦈': 'shark', '🐢': 'turtle', '🪼': 'jellyfish', '🦀': 'crab',
  '🦑': 'squid', '🐟': 'fish', '🚀': 'rocket', '🛸': 'flying saucer', '🌟': 'glowing star',
  '🌙': 'moon', '🪐': 'ringed planet', '☄️': 'comet', '⭐️': 'star', '🛰️': 'satellite',
  '👽': 'alien', '🌌': 'galaxy', '🎈': 'balloon', '🎉': 'party popper', '🥳': 'party face',
  '🎂': 'cake', '🍭': 'lolly', '🍩': 'doughnut', '🧁': 'cupcake', '🍓': 'strawberry',
  '🍕': 'pizza', '🍟': 'chips', '🍉': 'watermelon', '🍬': 'sweet', '🦕': 'long-neck dinosaur',
  '🦖': 'T-rex', '🦴': 'bone', '🌋': 'volcano', '🥚': 'egg', '🪨': 'rock', '🌿': 'leaf',
  '🚗': 'car', '✈️': 'aeroplane', '🚂': 'train', '🚁': 'helicopter', '🏎️': 'racing car',
  '🚒': 'fire engine', '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🥕': 'carrot',
  '🧀': 'cheese', '🍪': 'biscuit', '🥤': 'drink', '🌽': 'corn', '👨‍🚀': 'astronaut',
  '🌍': 'Earth', '🔭': 'telescope',
};

MEMORY_LEVELS.forEach((level, index) => {
  add(`Memory level ${index + 1}. ${level.name}.`);
  level.emojis.forEach((emoji) => {
    const name = MEMORY_CARD_NAMES[emoji] || 'picture';
    add(`You found a ${name}. Remember where it is.`);
    add(`A pair of ${name}s!`);
  });
});
add('Those pictures are different. Try to remember where each one is.');
add('Find the matching pairs.');

[...PATTERN_ROUNDS, ...ADVANCED_PATTERN_ROUNDS, ...NUMBER_PATTERN_ROUNDS, ...ADVANCED_NUMBER_PATTERN_ROUNDS]
  .forEach(({ label, rule }) => {
    add(`What comes next? ${label}`);
    add(`The rule is ${rule}`);
  });

COLOR_MIX_ROUNDS.forEach((round) => {
  add(`What color do ${round.name1} and ${round.name2} make when mixed together?`);
  add(`It makes ${round.answer}`);
});
ODD_ONE_OUT_ROUNDS.forEach((round) => {
  add(`Which one does not belong? ${round.hint}`);
});

const maxAddition = Math.max(...ADDITION_LEVELS.map((level) => level.maxNum));
for (let a = 1; a <= maxAddition; a += 1) {
  for (let b = 1; b <= maxAddition; b += 1) add(`What is ${a} plus ${b}?`);
}
const maxSubtraction = Math.max(...SUBTRACTION_LEVELS.map((level) => level.maxNum));
for (let a = 2; a <= maxSubtraction + 3; a += 1) {
  for (let b = 1; b <= Math.min(a, maxSubtraction); b += 1) add(`What is ${a} minus ${b}?`);
}
for (let a = 2; a <= 5; a += 1) {
  for (let b = 2; b <= 4; b += 1) {
    const answer = a * b;
    add(`What is ${a} groups of ${b}? Count every obstacle.`);
    add(`Try again. Count ${a} groups of ${b}.`);
    add(`${a} groups of ${b}. Let us jump and count to ${answer}.`);
    add(`${a} times ${b} equals ${answer}.`);
    add(`${a} groups of ${b}. Count all ${answer} obstacles.`);
  }
}
for (let a = 1; a <= 15; a += 1) {
  for (let b = 1; b <= 15 - a; b += 1) {
    add(`What is ${a} plus ${b}?`);
  }
}
for (let answer = 0; answer <= maxAddition * 2; answer += 1) add(`The answer is ${answer}.`);
for (let hour = 1; hour <= 12; hour += 1) {
  add(`Show me ${hour} o'clock on the clock!`);
  add(`The clock shows ${hour} o'clock.`);
  [0, 15, 30, 45].forEach((minute) => {
    const label = minute === 0
      ? `${hour} o'clock`
      : minute === 30
        ? `half past ${hour}`
        : minute === 15
          ? `quarter past ${hour}`
          : `quarter to ${hour === 12 ? 1 : hour + 1}`;
    add(`The clock shows ${label}.`);
    add(`The time is ${label}.`);
  });
}

['Dino Park', 'River Valley', 'Moon Camp'].forEach((scene) => {
  add(`Build the ${scene} picture. Choose a piece, then tap its matching place.`);
});

DINO_LEVELS.forEach((level) => add(`Welcome to ${level.name}. ${level.hint}`));
Object.values(Object.fromEntries(DINO_LEVELS.flatMap((level) => level.dinos.map((dino) => [dino.name, dino]))))
  .forEach((dino) => add(`You found ${dino.name}. ${dino.fact}`));

PLANETS.forEach((planet) => {
  add(`${planet.name}. ${planet.subtitle}. ${planet.mission}`);
  planet.facts.forEach((fact, index) => {
    add(fact);
    add(`Discovery ${index + 1}. ${fact}`);
  });
  add(`Correct. ${planet.quiz.answer}.`);
});

ASTRONAUT_PROFILES.forEach((profile) => {
  add(profile.funFact);
  add(`Did you know? ${profile.funFact}`);
});
ASTRONAUT_CATEGORIES.forEach((category) => category.items.forEach((question) => {
  add(question.q);
  add(`The answer is ${question.answer}!`);
}));

CHESS_PIECES.forEach((piece) => {
  add(`The ${piece.name}. ${piece.desc} It moves ${piece.move}.`);
  add(`${piece.name}. ${piece.desc}`);
  add(`Try the ${piece.name}! ${piece.move}.`);
  add(`Try the ${piece.name}!`);
  add(`You found all the moves! The ${piece.name} is happy!`);
});
CHESS_PUZZLES.forEach((puzzle) => {
  const piece = CHESS_PIECES.find((item) => item.id === puzzle.piece);
  add(`${piece.name}! ${puzzle.q}`);
});
MOVE_PRAISE.forEach((praise) => add(praise));

export const OFFLINE_VOICE_CORPUS = [...corpus.values()].sort((a, b) => a.key.localeCompare(b.key));
