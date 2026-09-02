import {
  ADVANCED_NUMBER_PATTERN_ROUNDS,
  ADVANCED_PATTERN_ROUNDS,
  NUMBER_PATTERN_ROUNDS,
  PATTERN_ROUNDS,
} from './index.js';

export const patternPoolForDifficulty = (difficulty) => difficulty === 'starter'
  ? PATTERN_ROUNDS
  : difficulty === 'challenge' ? ADVANCED_PATTERN_ROUNDS : [...PATTERN_ROUNDS, ...ADVANCED_PATTERN_ROUNDS];

export const numberPatternPoolForDifficulty = (difficulty) => difficulty === 'starter'
  ? NUMBER_PATTERN_ROUNDS.slice(0, 3)
  : difficulty === 'challenge'
    ? ADVANCED_NUMBER_PATTERN_ROUNDS
    : NUMBER_PATTERN_ROUNDS;

export const oddOneOutRoundIndexes = (difficulty) => difficulty === 'starter'
  ? [0, 1, 2, 3] : difficulty === 'growing' ? [4, 5, 6, 7] : [8, 9, 10, 11];

export const colourRoundIndexes = (difficulty) => difficulty === 'starter'
  ? [0, 1, 2] : difficulty === 'growing' ? [0, 1, 2, 3, 4] : [3, 4, 5, 6];

// Keep the numerical bands inside the packaged ElevenLabs corpus. Challenge
// is still a meaningful step up, but it must never produce a silent fact
// offline.
export const MULTIPLICATION_LIMITS = Object.freeze({ starter: [2, 3], growing: [4, 4], challenge: [5, 4] });
export const NUMBER_LINE_LIMITS = Object.freeze({ starter: 10, growing: 15, challenge: 20 });
