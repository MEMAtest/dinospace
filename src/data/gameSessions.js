// Turns the older, endless games into short sessions with a clear end.
// `event` is the game event that counts as progress; `target` is how many
// make a session (Askia's little sessions are shorter). Games with their own
// menus and endings (Solar System, Astronaut Academy, Curriculum Quest,
// Storybooks, Chess) are left as they are.
export const GAME_SESSIONS = Object.freeze({
  addition: { event: 'answer_correct', target: 8, how: 'Add the two groups together.' },
  subtraction: { event: 'answer_correct', target: 8, how: 'Take some away. How many are left?' },
  counting: { event: 'answer_correct', target: 8, little: 5, how: 'Tap each one, then pick how many.' },
  numberline: { event: 'answer_correct', target: 8, how: 'Jump along the line to the answer.' },
  timeteller: { event: 'answer_correct', target: 8, how: 'Read the clock and pick the time.' },
  math: { event: 'answer_correct', target: 8, how: 'Solve the sum and watch the truck jump.' },
  oddoneout: { event: 'answer_correct', target: 6, how: 'Find the one that does not belong.' },
  letters: { event: 'answer_correct', target: 8, how: 'Find the letter you hear.' },
  phonics: { event: 'answer_correct', target: 8, how: 'Match the sounds.' },
  german: { event: 'answer_correct', target: 8, how: 'Hear the German word and tap the match.' },
  colormix: { event: 'answer_correct', target: 6, how: 'Mix two colours. What do you get?' },
  pattern: { event: 'answer_correct', target: 8, little: 5, how: 'What comes next in the pattern?' },
  words: { event: 'answer_correct', target: 6, how: 'Build the word with the sounds.' },
  trace: { event: 'answer_correct', target: 4, how: 'Trace the letter with your finger.' },
  jet: { event: 'answer_correct', target: 3, how: 'Fly the jet around the shape.' },
  hangman: { event: 'word_completed', target: 5, how: 'Guess the letters to rescue the word.' },
  tictactoe: { event: 'round_completed', target: 3, how: 'Get three in a row to win the round.' },
  memory: { event: 'level_completed', target: 1, how: 'Flip cards and find the pairs.' },
  dino: { event: 'level_completed', target: 1, how: 'Tap the leaves to find the hidden dinosaurs.' },
  puzzle: { event: 'level_completed', target: 1, how: 'Put the picture pieces in place.' },
  spot: { event: 'level_completed', target: 1, how: 'Find what changed in the second picture.' },
});

export const sessionTarget = (rule, little) => (little && rule.little ? rule.little : rule.target);

// First-try answers → 1–3 stars. Games that do not report retries count
// every answer as first try.
export const sessionStars = (firstTries, total) => {
  if (!total) return 1;
  const ratio = firstTries / total;
  return ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
};
