import { ASTRONAUT_MISSIONS, CHESS_PUZZLES, HANGMAN_WORDS_BY_BAND, PATTERN_MISSIONS } from './batch6Games.js';

const phrases = [
  'Good try. Look at the whole repeating part, then try again.',
  'Look at the first two places. What part repeats?',
  'Look at the first three places. What part repeats?',
  'Good try. Use the picture clues, then try another answer.',
  'That is a legal move, but the puzzle asks for the marked goal. Try again.',
  'That move does not follow this piece’s rule. Look for a green destination.',
  'A safe capture lands on a square the other pieces do not attack. Try again.',
  'Look at the space science clue. Which choice matches it?',
  'Look at the mission tool clue. Which choice matches it?',
  'The Sun is a star at the centre of our solar system. Its light and heat reach Earth.',
];

for (const missions of Object.values(PATTERN_MISSIONS)) for (const mission of missions) {
  phrases.push(`Pattern mission. ${mission.label}. What comes next?`);
  phrases.push(`Yes. ${mission.label}. ${mission.fact}`);
}
for (const words of Object.values(HANGMAN_WORDS_BY_BAND)) for (const word of words) {
  phrases.push(`Dinosaur word rescue. ${word.clue}`);
}
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') phrases.push(`Listen for ${letter.toLowerCase()}.`);
for (const puzzles of Object.values(CHESS_PUZZLES)) for (const puzzle of puzzles) {
  phrases.push(puzzle.objective);
  phrases.push(`${puzzle.piece[0].toUpperCase()}${puzzle.piece.slice(1)} move solved. ${puzzle.objective}`);
  phrases.push(`The ${puzzle.piece} starts on the blue square. Find its legal path to the gold star.`);
}
for (const missions of Object.values(ASTRONAUT_MISSIONS)) for (const mission of missions) {
  phrases.push(mission.q, mission.fact, `You remembered this from before. ${mission.fact}`);
}

export const BATCH6_SPOKEN_PHRASES = Object.freeze([...new Set(phrases)]);
const inventory = new Set(BATCH6_SPOKEN_PHRASES);

export const speakBatch6 = (speak, phrase) => {
  if (!inventory.has(phrase)) return false;
  speak?.(phrase, { premium: false });
  return true;
};
