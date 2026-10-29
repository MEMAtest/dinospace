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
export const CASE_CONFUSABLES = Object.freeze({
  A: ['H'], B: ['D', 'P'], C: ['G', 'O'], D: ['B', 'P'], E: ['F'], F: ['E', 'P'],
  G: ['C', 'Q'], H: ['N', 'M'], I: ['L', 'J'], J: ['I', 'L'], K: ['R'], L: ['I', 'J'],
  M: ['N', 'W'], N: ['M', 'H'], O: ['C', 'Q'], P: ['B', 'D'], R: ['K'], S: ['Z'],
  T: ['I', 'F'], U: ['V'], V: ['U', 'Y'], W: ['M'], Y: ['V'], Z: ['S'],
});
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
export const decodableLetterLaunchWords = (taught = getTaughtGraphemes()) => PHASE_WORDS.filter((word) => (
  isDecodableWith(word, taught)
  && [3, 4].includes(word.word.length)
  && word.graphemes?.length === 3
  && new Set(word.graphemes.map((sound) => sound.toLowerCase())).size === 3
));

export const buildLetterLaunchRound = (level = 0, recentKeys = [], random = Math.random, roundIndex = 0, taughtOverride) => {
  const taught = taughtOverride instanceof Set ? taughtOverride : getTaughtGraphemes();
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
    const candidates = pool.filter((entry) => entry.letter !== targetLetter.letter);
    const preferred = letterLevel === 2
      ? (CASE_CONFUSABLES[targetLetter.letter] || []).map((letter) => candidates.find((entry) => entry.letter === letter)).filter(Boolean)
      : [];
    const orderedDistractors = [...preferred, ...shuffleWith(candidates.filter((entry) => !preferred.includes(entry)), random)];
    const otherLetters = orderedDistractors.slice(0, desiredCount - 1);
    const options = shuffleWith([targetLetter, ...otherLetters], random);
    return {
      kind: letterLevel === 2 ? 'case-match' : letterLevel === 0 ? 'letter-sound' : 'first-sound',
      key: targetLetter.letter,
      target: targetLetter,
      options,
    };
  };
  if (level === 3) {
    const words = decodableLetterLaunchWords(taught);
    // A child may have only a few selected sounds. Keep the round answerable
    // with taught graphemes until the profile contains a decodable CVC word.
    if (!words.length) return soundRound(1);
    // The final transfer deliberately begins with familiar CVC words. When
    // Phase 3 graphemes are taught, later rounds can include words such as
    // FISH and SHIP; each tile is one taught grapheme, not necessarily one
    // printed letter.
    const freshWords = words.filter((entry) => !recentKeys.includes(entry.word));
    const cvcPool = freshWords.filter((entry) => entry.word.length === 3);
    const fourLetterPool = freshWords.filter((entry) => entry.word.length === 4);
    const transferAfter = 3;
    const preferFourLetter = roundIndex >= transferAfter && fourLetterPool.length > 0;
    const targetPool = preferFourLetter ? fourLetterPool : cvcPool.length ? cvcPool : fourLetterPool.length ? fourLetterPool : words;
    const word = chooseFresh(targetPool.map((entry) => ({ ...entry, key: entry.word })), recentKeys, random);
    const distractors = shuffleWith([...taught].filter((sound) => !word.graphemes.includes(sound.toLowerCase())), random)
      .slice(0, 3);
    const tiles = shuffleWith([...word.graphemes, ...distractors].map((grapheme, index) => ({ id: `${word.word}-${index}-${grapheme}`, grapheme })), random);
    return { kind: 'build-word', key: word.word, target: word, tiles };
  }

  if (level === 1) {
    const words = decodableLetterLaunchWords(taught).map((word) => ({ ...word, key: word.word }));
    if (!words.length) return soundRound(1);
    const target = chooseFresh(words, recentKeys, random);
    const answer = target.graphemes[0].toLowerCase();
    const otherSounds = shuffleWith([...taught].filter((sound) => sound !== answer), random).slice(0, 2);
    const options = shuffleWith([answer, ...otherSounds].map((letter) => ({ letter: letter.toUpperCase(), sound: letter })), random);
    return { kind: 'first-sound', key: target.word, target: { letter: answer.toUpperCase(), grapheme: answer, word: target.word, emoji: target.emoji, hint: target.hint }, options };
  }

  return soundRound(level);
};

export const letterLaunchExplanation = (round) => {
  if (round.kind === 'case-match') return `Big ${round.target.letter} and little ${round.target.letter.toLowerCase()} are the same letter.`;
  if (round.kind === 'build-word') return `You blended ${round.target.graphemes.map((sound) => `/${sound.toLowerCase()}/`).join(' ')} to read ${round.target.word.toLowerCase()}.`;
  const sound = (round.target.grapheme || round.target.letter).toLowerCase();
  const soundText = sound === 'qu' ? 'the kw sound, written qu' : `the ${sound} sound`;
  if (round.kind === 'letter-sound') return `${round.target.word} starts with ${soundText}. The letter is called ${round.target.letter}.`;
  return `${round.target.word} starts with ${soundText}.`;
};

// SAT is an action, so a chair by itself is an ambiguous picture clue. Keep
// this clarification local to Letter Launch rather than changing shared book
// and literacy content.
export const letterLaunchClueCaption = (round) => round?.target?.word === 'SAT'
  ? 'She sat down on the chair.'
  : '';

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

export const letterLaunchTargetForPlayer = (level = 0, littleMode = false) => {
  const targets = littleMode ? [4, 4, 5, 5] : [6, 6, 7, 8];
  return targets[level] || targets[0];
};
