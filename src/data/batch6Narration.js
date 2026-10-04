import { ASTRONAUT_MISSIONS, CHESS_PUZZLES, HANGMAN_WORDS_BY_BAND, PATTERN_MISSIONS } from './batch6Games.js';

export const patternClueNarration = (mission) => mission.rule === 'growing' ? mission.fact : `Look at the first ${mission.rule === 'AB' ? 'two' : 'three'} places. They make the ${mission.rule} repeating unit. Start that same unit again.`;
export const patternQuestionNarration = () => 'Pattern mission. What comes next?';
const chessMovementRules = Object.freeze({
  rook: 'The rook moves along a row or column. It cannot pass through a piece.',
  bishop: 'The bishop moves diagonally. It cannot pass through a piece.',
  knight: 'The knight moves in an L shape and can jump over pieces.',
  queen: 'The queen moves along rows, columns or diagonals. It cannot pass through a piece.',
  king: 'The king moves one square in any direction.',
  pawn: 'In this mini-board, a pawn moves one square forward and captures diagonally.',
});
export const chessMissionRule = (mission) => `${chessMovementRules[mission.piece] || ''}${mission.band === 'growing' ? ' Capture the marked pawn only if its square is safe.' : ''}`.trim();
export const chessMissionNarration = (mission) => `${chessMissionRule(mission)} ${mission.objective}`.trim();
export const chessOtherPieceRules = Object.freeze([
  'Rooks move along rows and columns. They cannot pass through pieces.',
  'Bishops move diagonally. They cannot pass through pieces.',
  'Queens move along rows, columns or diagonals. They cannot pass through pieces.',
  'Knights move in an L shape and can jump over pieces.',
  'Kings move one square in any direction.',
  'In this mini-board, pawns move one square forward and capture diagonally.',
]);
export const chessClueNarration = (mission) => `Start with the ${mission.piece} on ${String.fromCharCode(97 + mission.from[1])}${5 - mission.from[0]}. Trace its path to the star on ${String.fromCharCode(97 + mission.target[1])}${5 - mission.target[0]}, checking every square for a blocker.`;
export const astronautClueNarration = (mission) => `${mission.clueType === 'learn' ? 'Learn clue.' : 'Mission clue.'} ${mission.clue}`;

const phrases = [
  'Good try. Look at the whole repeating part, then try again.',
  'Look at the first two places. What part repeats?',
  'Look at the first three places. What part repeats?',
  patternQuestionNarration(),
  'Good try. Use the clue and try another answer.',
  'That square is a legal move, but the puzzle asks for the marked goal. Try again.',
  'That move does not follow this piece’s rule. Look for a green destination.',
  'A safe capture lands on a square the other pieces do not attack. Try again.',
  'Look at the space science clue. Which choice matches it?',
  'Look at the mission tool clue. Which choice matches it?',
  'The Sun is a star at the centre of our solar system. Its light and heat reach Earth.',
];

for (const missions of Object.values(PATTERN_MISSIONS)) for (const mission of missions) {
  phrases.push(patternClueNarration(mission));
  phrases.push(`Yes. ${mission.label}. ${mission.fact}`);
}
for (const words of Object.values(HANGMAN_WORDS_BY_BAND)) for (const word of words) {
  phrases.push(`Dinosaur word rescue. ${word.clue}`);
}
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') phrases.push(`Find the letter ${letter.toLowerCase()}.`);
for (const puzzles of Object.values(CHESS_PUZZLES)) for (const puzzle of puzzles) {
  phrases.push(chessMissionNarration(puzzle), chessClueNarration(puzzle));
  phrases.push(`${puzzle.piece[0].toUpperCase()}${puzzle.piece.slice(1)} move solved. ${puzzle.objective}`);
  phrases.push(`The ${puzzle.piece} starts on the blue square. Find its legal path to the gold star.`);
}
for (const missions of Object.values(ASTRONAUT_MISSIONS)) for (const mission of missions) {
  phrases.push(mission.q, mission.fact, astronautClueNarration(mission), `You remembered this from before. ${mission.fact}`);
}

export const BATCH6_SPOKEN_PHRASES = Object.freeze([...new Set(phrases)]);
const inventory = new Set(BATCH6_SPOKEN_PHRASES);

export const speakBatch6 = (speak, phrase) => {
  if (!inventory.has(phrase)) return false;
  speak?.(phrase, { premium: false });
  return true;
};
