import { LETTERS } from './index.js';
import { getTaughtGraphemes, isDecodableWith, PHASE_WORDS } from './literacy.js';

const shuffleWith = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

// Derive each round from the run seed and cursor. Re-rendering never consumes
// random state or changes the question that is already on screen.
export const letterLaunchRandomFor = (seed, cursor = 0) => {
  let state = (Number(seed) + Math.imul(Number(cursor) + 1, 0x9e3779b9)) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const chooseFresh = (items, history, random) => {
  const seen = new Set(history);
  const fresh = items.filter((item) => !seen.has(item.key));
  const pool = fresh.length ? fresh : items;
  return pool[Math.floor(random() * pool.length)];
};

const eligibleLetters = (taught) => LETTERS.filter((item) => taught.has(item.letter.toLowerCase()));
export const FIRST_SOUND_EXAMPLES = Object.freeze({
  A: ['Apple', '🍎'], B: ['Ball', '⚽'], C: ['Cat', '🐱'], D: ['Dog', '🐶'], E: ['Egg', '🥚'],
  F: ['Fish', '🐟'], G: ['Goat', '🐐'], H: ['Hat', '🎩'], I: ['Insect', '🐞'], J: ['Jam', '🍓'],
  K: ['Kite', '🪁'], L: ['Lion', '🦁'], M: ['Moon', '🌙'], N: ['Net', '🥅'], O: ['Octopus', '🐙'],
  P: ['Pig', '🐷'], Q: ['Queen', '👑'], R: ['Red', '🔴'], S: ['Sun', '☀️'], T: ['Top', '🪀'],
  U: ['Up', '⬆️'], V: ['Van', '🚐'], W: ['Web', '🕸️'], Y: ['Yak', '🐃'], Z: ['Zip', '🤐'],
});
const FIRST_SOUND_GRAPHEMES = Object.freeze({ Q: 'qu' });
const regularInitialWords = (letters) => letters
  .filter(({ letter }) => letter.toUpperCase() !== 'X' && FIRST_SOUND_EXAMPLES[letter.toUpperCase()])
  .map((item) => {
    const [word, emoji] = FIRST_SOUND_EXAMPLES[item.letter.toUpperCase()];
    return { ...item, word, emoji, key: item.letter };
  });
const decodableWords = (taught) => PHASE_WORDS.filter((word) => (
  isDecodableWith(word, taught)
  && word.graphemes?.length === 3
  && word.graphemes.every((sound) => sound.length === 1)
  && new Set(word.graphemes.map((sound) => sound.toLowerCase())).size === 3
));

export const buildLetterLaunchRound = (level = 0, recentKeys = [], random = Math.random) => {
  const taught = getTaughtGraphemes();
  const letters = eligibleLetters(taught);
  if (!letters.length) return { kind: 'unavailable', key: `level-${level}-needs-taught-single-letter`, target: null, options: [] };
  const initialWords = regularInitialWords(letters);
  const soundRound = (letterLevel) => {
    const pool = letterLevel === 2 ? letters.map((entry) => ({ ...entry, key: entry.letter }))
      : letterLevel === 0 ? initialWords
        : initialWords;
    if (!pool.length) return { kind: 'unavailable', key: `level-${level}-needs-taught-initial-sound`, target: null, options: [] };
    const targetLetter = chooseFresh(pool, recentKeys, random);
    const desiredCount = letterLevel === 2 ? 4 : 2;
    const otherLetters = shuffleWith(pool.filter((entry) => entry.letter !== targetLetter.letter), random).slice(0, desiredCount - 1);
    const options = shuffleWith([targetLetter, ...otherLetters], random);
    return {
      kind: letterLevel === 2 ? 'case-match' : letterLevel === 0 ? 'letter-sound' : 'first-sound',
      key: targetLetter.letter,
      target: targetLetter,
      options,
    };
  };
  if (level === 3) {
    const words = decodableWords(taught);
    // A child may have only a few selected sounds. Keep the round answerable
    // with taught graphemes until the profile contains a decodable CVC word.
    if (!words.length) return soundRound(1);
    const word = chooseFresh(words.map((entry) => ({ ...entry, key: entry.word })), recentKeys, random);
    const distractors = shuffleWith([...taught].filter((sound) => sound.length === 1 && !word.graphemes.includes(sound)), random)
      .slice(0, 3);
    const tiles = shuffleWith([...word.graphemes, ...distractors].map((grapheme, index) => ({ id: `${word.word}-${index}-${grapheme}`, grapheme })), random);
    return { kind: 'build-word', key: word.word, target: word, tiles };
  }

  if (level === 1) {
    const words = decodableWords(taught).map((word) => ({ ...word, key: word.word }));
    if (!words.length) return soundRound(1);
    const target = chooseFresh(words, recentKeys, random);
    const answer = target.graphemes[0].toLowerCase();
    const otherSounds = shuffleWith([...taught].filter((sound) => sound !== answer), random).slice(0, 2);
    const options = shuffleWith([answer, ...otherSounds].map((letter) => ({ letter: letter.toUpperCase(), sound: letter })), random);
    return { kind: 'first-sound', key: target.word, target: { letter: answer.toUpperCase(), word: target.word, emoji: target.emoji, hint: target.hint }, options };
  }

  return soundRound(level);
};

export const letterLaunchExplanation = (round) => {
  if (round.kind === 'case-match') return `Big ${round.target.letter} and little ${round.target.letter.toLowerCase()} are the same letter.`;
  if (round.kind === 'build-word') return `You blended ${round.target.graphemes.map((sound) => `/${sound.toLowerCase()}/`).join(' ')} to read ${round.target.word.toLowerCase()}.`;
  if (round.kind === 'letter-sound') return `${round.target.word} starts with ${round.target.letter === 'Q' ? 'the /kw/ sound, written with qu' : `the ${round.target.letter.toLowerCase()} sound`}.`;
  if (round.target.letter === 'Q') return `${round.target.word} starts with the /kw/ sound, written with qu.`;
  const sound = round.target.letter.toLowerCase();
  return `${round.target.word} starts with the ${sound} sound.`;
};

export const letterLaunchPromptFor = (round) => round.kind === 'case-match'
  ? `Find the capital letter that matches little ${round.target.letter.toLowerCase()}.`
  : round.kind === 'build-word'
    ? 'Build the word for this picture. Listen to each sound.'
    : round.kind === 'letter-sound'
      ? `Listen to ${round.target.word.toLowerCase()}. Tap the letter for its first sound${FIRST_SOUND_GRAPHEMES[round.target.letter] ? `, written ${FIRST_SOUND_GRAPHEMES[round.target.letter]}` : ''}.`
      : `Which sound starts ${round.target.word}? Say the word slowly, then choose its first sound.`;
export const letterLaunchNextSoundPrompt = (grapheme) => {
  const example = FIRST_SOUND_EXAMPLES[grapheme.toUpperCase()];
  return example ? `The next sound is the first sound in ${example[0].toLowerCase()}.` : '';
};

const exampleWordsForVoice = Object.values(FIRST_SOUND_EXAMPLES).map(([word]) => word);
const possibleInitialWords = [...new Set([
  ...exampleWordsForVoice,
  ...PHASE_WORDS.map(({ word }) => word),
])];
const possibleCvcSounds = [...new Set(PHASE_WORDS.flatMap(({ graphemes = [] }) => graphemes).filter((grapheme) => grapheme.length === 1))];
export const LETTER_LAUNCH_PROMPT_CORPUS = Object.freeze([
  ...Object.entries(FIRST_SOUND_EXAMPLES).map(([letter, [word]]) => `Listen to ${word.toLowerCase()}. Tap the letter for its first sound${FIRST_SOUND_GRAPHEMES[letter] ? `, written ${FIRST_SOUND_GRAPHEMES[letter]}` : ''}.`),
  ...possibleInitialWords.map((word) => `Which sound starts ${word}? Say the word slowly, then choose its first sound.`),
  ...LETTERS.map(({ letter }) => `Find the capital letter that matches little ${letter.toLowerCase()}.`),
  ...possibleCvcSounds.map(letterLaunchNextSoundPrompt),
  'Good. Now choose the next sound.',
  'Build the word for this picture. Listen to each sound.',
]);

export const letterLaunchSessionTarget = (level = 0) => [6, 6, 7, 8][level] || 6;
