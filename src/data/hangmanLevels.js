import { HANGMAN_WORDS } from './index.js';
import { decodableSpellingWords, LONGER_SPELLING_WORDS, makeSpellingQueue, SPELLING_PREANSWER_CUES } from './spellingStudio.js';

export const HANGMAN_LEVELS = Object.freeze([
  { id: 'first-words', name: 'First words', description: 'Rescue three-letter words with familiar sounds.', lengthLabel: '3 letters', target: 3, minimumLength: 3, maximumLength: 3 },
  { id: 'four-letter-rescue', name: 'Four-letter rescue', description: 'Blend familiar sounds in longer beginning and ending clusters.', lengthLabel: '4 letters', target: 3, minimumLength: 4, maximumLength: 4 },
  { id: 'five-letter-rescue', name: 'Five-letter rescue', description: 'Use more letters to uncover a five-letter word.', lengthLabel: '5 letters', target: 6, minimumLength: 5, maximumLength: 5 },
  { id: 'long-word-rescue', name: 'Long-word rescue', description: 'Tackle six- and seven-letter words with the full alphabet.', lengthLabel: '6–7 letters', target: 4, minimumLength: 6, maximumLength: 7 },
]);

// Explicit grapheme spellings for the existing themed Hangman bank. Each entry
// is filtered against the child's selected taught sounds before it can appear.
export const HANGMAN_WORD_GRAPHEMES = Object.freeze({
  MOON: ['m', 'oo', 'n'], STAR: ['s', 't', 'ar'], RAINBOW: ['r', 'ai', 'n', 'b', 'ow'],
});

// Regular short-vowel clusters extend the four-letter route using only the
// taught single-letter sounds. Words with silent or alternate vowel spellings
// remain gated by their reviewed spelling-bank grapheme records.
export const HANGMAN_REGULAR_WORDS = Object.freeze([
  ['DRUM', ['d', 'r', 'u', 'm'], '🥁', 'A musical instrument you hit with sticks.'],
  ['NEST', ['n', 'e', 's', 't'], '🪺', 'A bird makes this home for eggs and chicks.'],
  ['MILK', ['m', 'i', 'l', 'k'], '🥛', 'A drink that comes from cows.'],
  ['HELP', ['h', 'e', 'l', 'p'], '🆘', 'Give a hand when someone needs this.'],
  ['SAND', ['s', 'a', 'n', 'd'], '🏖️', 'Tiny grains cover a beach.'],
  ['DESK', ['d', 'e', 's', 'k'], '🪑', 'A table where someone can read or write.'],
  ['TENT', ['t', 'e', 'n', 't'], '⛺', 'A cloth shelter used for camping.'],
  ['MASK', ['m', 'a', 's', 'k'], '🎭', 'Wear this over your face for a costume.'],
  ['HAND', ['h', 'a', 'n', 'd'], '✋', 'The body part at the end of your arm.'],
  ['FAST', ['f', 'a', 's', 't'], '🏃', 'Moving quickly.'],
  ['LIFT', ['l', 'i', 'f', 't'], '🏋️', 'Raise something up.'],
  ['LEFT', ['l', 'e', 'f', 't'], '⬅️', 'The side opposite right.'],
  ['SOFT', ['s', 'o', 'f', 't'], '🧸', 'A pillow feels like this.'],
  ['CAMP', ['c', 'a', 'm', 'p'], '🏕️', 'Sleep outdoors in a tent at this place.'],
  ['BENT', ['b', 'e', 'n', 't'], '↪️', 'Not straight; curved or folded.'],
  ['SWIM', ['s', 'w', 'i', 'm'], '🏊', 'Move through water using your arms and legs.'],
].map(([word, graphemes, emoji, clue]) => Object.freeze({ word, graphemes, emoji, clue, hint: clue, family: 'short-vowel clusters', category: 'short-vowel clusters' })));

const spellingRecords = (taught) => {
  const base = decodableSpellingWords(taught);
  const expanded = [...base, ...LONGER_SPELLING_WORDS].filter((entry) => entry.graphemes.every((sound) => taught.has(sound)));
  return expanded.map((entry) => ({
    word: entry.word,
    emoji: entry.emoji,
    clue: SPELLING_PREANSWER_CUES[entry.word] || entry.cue || entry.hint,
    family: entry.family || 'Sound explorers',
    category: entry.family || 'Sound explorers',
    graphemes: [...entry.graphemes],
  }));
};

const themedRecords = (taught) => HANGMAN_WORDS
  .filter((entry) => entry.word.length >= 4 && HANGMAN_WORD_GRAPHEMES[entry.word]?.every((sound) => taught.has(sound)))
  .map((entry) => ({ ...entry, graphemes: [...HANGMAN_WORD_GRAPHEMES[entry.word]], family: entry.category }));

export function hangmanWordsForLevel(levelIndex, taught) {
  const level = HANGMAN_LEVELS[levelIndex];
  if (!level || !(taught instanceof Set)) return [];
  const unique = new Map();
  const regularRecords = HANGMAN_REGULAR_WORDS.filter((entry) => entry.graphemes.every((sound) => taught.has(sound)));
  for (const entry of [...spellingRecords(taught), ...themedRecords(taught), ...regularRecords]) {
    if (entry.word.length < level.minimumLength || entry.word.length > level.maximumLength) continue;
    if (!entry.graphemes.every((sound) => taught.has(sound))) continue;
    if (!entry.clue) continue;
    if (!unique.has(entry.word)) unique.set(entry.word, { ...entry, word: entry.word.toUpperCase(), id: entry.word.toLowerCase() });
  }
  return [...unique.values()];
}

export function makeHangmanQueue(levelIndex, taught, { seed = 1, recent = [] } = {}) {
  return makeSpellingQueue(hangmanWordsForLevel(levelIndex, taught), { seed, recent, avoid: 8 });
}

export function markHangmanWordRescued(rescuedWordIds, wordId) {
  const next = new Set(rescuedWordIds instanceof Set ? rescuedWordIds : []);
  const id = String(wordId || '');
  if (!id) return { rescuedWordIds: next, alreadyRescued: false };
  const alreadyRescued = next.has(id);
  if (!alreadyRescued) next.add(id);
  return { rescuedWordIds: next, alreadyRescued };
}

export function nextHangmanWordIndex(queue, currentIndex, rescuedWordIds = new Set()) {
  if (!Array.isArray(queue) || queue.length === 0) return 0;
  const rescued = rescuedWordIds instanceof Set ? rescuedWordIds : new Set(rescuedWordIds || []);
  const current = Number.isInteger(currentIndex) ? (currentIndex + queue.length) % queue.length : -1;
  for (let offset = 1; offset <= queue.length; offset += 1) {
    const candidate = (current + offset + queue.length) % queue.length;
    if (!rescued.has(queue[candidate]?.id)) return candidate;
  }
  return (current + 1) % queue.length;
}

export const makeHangmanSeed = () => {
  const values = new Uint32Array(1);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(values);
  else values[0] = Math.floor(Math.random() * 0x100000000);
  return values[0] >>> 0;
};

export const hangmanLettersForLevel = (word, levelIndex, random = Math.random) => {
  const answer = [...new Set(String(word || '').toUpperCase().split(''))];
  const targetCount = levelIndex >= 3 ? 26 : levelIndex === 2 ? 18 : 12;
  const decoys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((letter) => !answer.includes(letter));
  for (let index = decoys.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [decoys[index], decoys[swap]] = [decoys[swap], decoys[index]];
  }
  const letters = [...answer, ...decoys.slice(0, Math.max(0, targetCount - answer.length))];
  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [letters[index], letters[swap]] = [letters[swap], letters[index]];
  }
  return letters;
};
