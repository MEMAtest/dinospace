import { seededShuffle } from '../littleKit.js';

// Fuel Up's five-round cap skips one value on its six-number final level.
// Assign that omission to the play id so it is stable within a run and rotates
// through every target on deliberate replay.
export const buildFuelTargetOrder = (numbers, rounds, playId, seed = 0) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return [];
  const count = Number.isInteger(rounds) ? Math.max(0, rounds) : numbers.length;
  const currentPlay = Number.isInteger(playId) ? Math.abs(playId) : 0;
  const currentSeed = Number.isInteger(seed) ? Math.abs(seed) : 0;

  let sequence;
  if (numbers.length === 6 && count === 5) {
    const omittedIndex = currentPlay % numbers.length;
    const included = numbers.filter((_, index) => index !== omittedIndex);
    sequence = seededShuffle(included, currentSeed + currentPlay);
  } else {
    sequence = seededShuffle(numbers, currentSeed + currentPlay);
  }

  return Array.from({ length: count }, (_, index) => sequence[index % sequence.length]);
};
