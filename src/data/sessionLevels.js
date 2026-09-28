// A level changes the question pool or the way the child plays. Targets set
// the size of one level; they are not used as a substitute for new content.
const three = (names, descriptions, targets = [5, 6, 7]) => names.map((name, index) => ({
  name,
  description: descriptions[index],
  band: ['starter', 'growing', 'challenge'][index],
  target: targets[index],
}));

export const SESSION_LEVELS = Object.freeze({
  addition: three(['Count together', 'Bigger groups', 'Addition challenge'], ['Add small groups.', 'Add larger numbers.', 'Solve the trickiest sums.']),
  subtraction: three(['Take one away', 'Bigger takeaways', 'Subtraction challenge'], ['See what is left.', 'Subtract from larger groups.', 'Solve the trickiest takeaways.']),
  counting: three(['Little stars', 'More stars', 'Star explorer'], ['Count up to five.', 'Count up to ten.', 'Count up to fifteen.']),
  numberline: three(['Small jumps', 'Longer jumps', 'Forward and back'], ['Add on a short number line.', 'Add on a longer line.', 'Add and subtract on the line.']),
  timeteller: three(['O’clock', 'Half past', 'Quarter hours'], ['Find whole hours.', 'Find half hours.', 'Find quarter past and quarter to.']),
  math: three(['Two times', 'More tables', 'Table explorer'], ['Practice the two times table.', 'Try more times tables.', 'Mix the harder table facts.']),
  oddoneout: three(['Spot the difference', 'Look for the rule', 'Tricky groups'], ['Find the obvious odd one.', 'Compare a new set of objects.', 'Work out the trickier rule.']),
  letters: three(['Listen and launch', 'First sound detective', 'Big and little letters'], ['Hear a letter and choose from two.', 'Hear a word and find its first letter from three.', 'Match a lowercase letter to its capital among four.']),
  phonics: three(['Listen for sounds', 'Sound families', 'Blend the sounds'], ['Match simple sounds.', 'Explore more sound matches.', 'Listen for blended sounds.']),
  german: three(['First German words', 'More choices', 'German explorer'], ['Choose from three pictures.', 'Choose from four pictures.', 'Choose from six pictures.']),
  colormix: three(['First colour mixes', 'More colours', 'Colour challenge'], ['Mix familiar colours.', 'Explore more colour pairs.', 'Solve the trickier mixes.']),
  pattern: three(['Simple repeats', 'New pattern rules', 'Pattern detective'], ['Find a repeating pattern.', 'Compare more pattern rules.', 'Solve the advanced pattern.']),
  words: three(['Copy the word', 'Find the missing sound', 'Build the whole word'], ['Put the sounds in order.', 'Complete a word with a missing sound.', 'Spell the word from its sounds.']),
  trace: three(['Follow the letter', 'Steadier tracing', 'Careful letters'], ['Trace a letter with a wide trail.', 'Follow a narrower letter trail.', 'Trace the whole letter carefully.'], [3, 4, 4]),
  jet: three(['First flight', 'Narrow flight', 'Precision flight'], ['Fly around a forgiving shape.', 'Follow more of the outline.', 'Stay close to the full shape.'], [2, 3, 3]),
  spot: three(['First differences', 'Closer looking', 'Sharp eyes'], ['Find the easy change.', 'Compare more details.', 'Find the subtle change.'], [1, 1, 1]),
  dino: three(['First tracks', 'Follow the trail', 'Dino detective'], ['Find a hidden dinosaur.', 'Follow more clues.', 'Search the trickier scene.'], [1, 1, 1]),
  hangman: [
    { name: 'First words', description: 'Rescue familiar three-letter words.', target: 3 },
    { name: 'Word families', description: 'Rescue words from more sound families.', target: 4 },
    { name: 'All taught words', description: 'Rescue words using the sounds you have learned.', target: 5 },
  ],
  tictactoe: [
    { name: 'Rookie bot', description: 'Practice three in a row with the rookie bot.', target: 3 },
    { name: 'Space Ace bot', description: 'Try a stronger bot that plans ahead.', target: 3 },
  ],
});

export const ASKIA_SESSION_LEVELS = Object.freeze({
  counting: [
    { name: 'One to three', description: 'Count up to three stars.', target: 4, countMax: 3 },
    { name: 'One to five', description: 'Count up to five stars.', target: 5, countMax: 5 },
    { name: 'One to seven', description: 'Count up to seven stars.', target: 5, countMax: 7 },
  ],
  pattern: [
    { name: 'Two take turns', description: 'Find what comes next in a two-colour pattern.', target: 4 },
    { name: 'A little group', description: 'Look for a group that repeats.', target: 5 },
    { name: 'Three take turns', description: 'Follow a three-picture pattern.', target: 5 },
  ],
});

// Indices into the age-three picture patterns: AB, grouped repeats, ABC.
export const ASKIA_PATTERN_INDEXES = Object.freeze([[0, 3], [1, 4, 6, 7], [2, 5]]);

export const levelsForSession = (gameId, little) => little
  ? ASKIA_SESSION_LEVELS[gameId] || []
  : SESSION_LEVELS[gameId] || [];

const keyFor = (playerId) => `${playerId || 'amari'}_game_levels_v1`;
const read = (playerId, storage) => {
  try {
    const value = JSON.parse(storage?.getItem(keyFor(playerId)) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
};
const browserStorage = () => typeof window === 'undefined' ? null : window.localStorage;

export const getGameLevel = (playerId, gameId, total, storage = browserStorage()) => {
  const saved = read(playerId, storage)[gameId] || {};
  const clamp = (value) => Math.min(total - 1, Math.max(0, Number.isInteger(value) ? value : 0));
  const unlocked = clamp(saved.unlocked);
  return { current: Math.min(clamp(saved.current), unlocked), unlocked };
};

export const saveGameLevel = (playerId, gameId, current, unlocked, storage = browserStorage()) => {
  const all = read(playerId, storage);
  try { storage?.setItem(keyFor(playerId), JSON.stringify({ ...all, [gameId]: { current, unlocked } })); } catch { /* storage may be disabled */ }
};
