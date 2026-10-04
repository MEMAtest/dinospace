// Defines the event that completes a named level. Games with their own board
// progression (Memory Match, Puzzle Pop, Sky Shapes, Monster Math and
// Spot the Difference) and menus stay outside this wrapper.
export const GAME_SESSIONS = Object.freeze({
  addition: { event: 'answer_correct', target: 8, how: 'Add the two groups together.' },
  subtraction: { event: 'answer_correct', target: 8, how: 'Take some away. How many are left?' },
  counting: { event: 'answer_correct', target: 8, little: 5, how: 'Tap each one, then pick how many.' },
  numberline: { event: 'answer_correct', target: 8, how: 'Jump along the line to the answer.' },
  timeteller: { event: 'answer_correct', target: 8, how: 'Read the clock and pick the time.' },
  oddoneout: { event: 'answer_correct', target: 6, how: 'Find the one that does not belong.' },
  letters: { event: 'answer_correct', target: 8, how: 'Find the letter you hear.' },
  phonics: { event: 'answer_correct', target: 8, how: 'Match the sounds.' },
  german: { event: 'answer_correct', target: 8, how: 'Hear the German word and tap the match.' },
  colormix: { event: 'answer_correct', target: 6, how: 'Mix two colours. What do you get?' },
  pattern: { event: 'answer_correct', target: 8, little: 5, how: 'What comes next in the pattern?' },
  words: { event: 'answer_correct', target: 6, how: 'Build the word with the sounds.' },
  trace: { event: 'answer_correct', target: 4, how: 'Trace the letter with your finger.' },
  hangman: { event: 'word_completed', target: 5, how: 'Guess the letters to rescue the word.' },
  tictactoe: { event: 'round_completed', target: 3, how: 'Get three in a row to win the round.' },
  dino: { event: 'level_completed', target: 1, how: 'Tap the leaves to find the hidden dinosaurs.' },
});

export const sessionTarget = (rule, little) => (little && rule.little ? rule.little : rule.target);

// These games own their finite chapter/results flow. Wrapping them again would
// end a run at the old answer count and hide the game's held explanation.
// Askia keeps his existing counting/tracing sessions and separate Dino shell.
export const ownsGameProgression = (gameId, little = false) =>
  ['memory', 'puzzle', 'jet', 'math', 'spot', 'dino'].includes(gameId)
  || (!little && ['counting', 'trace', 'tictactoe', 'phonics', 'words', 'colormix', 'oddoneout'].includes(gameId));

// First-try answers → 1–3 stars. Games that do not report retries count
// every answer as first try.
export const sessionStars = (firstTries, total) => {
  if (!total) return 1;
  const ratio = firstTries / total;
  return ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
};
