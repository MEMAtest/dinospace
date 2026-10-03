import { reasoningShuffle } from './batch5Reasoning.js';

const freeze = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
// A deliberately discrete classroom colour model. These authored swatches are
// illustrative: real pigments vary. Never present RGB averaging as paint physics.
export const COLOUR_SWATCHES = freeze({
  red: { label: 'Red', hex: '#ef3340' }, yellow: { label: 'Yellow', hex: '#ffd43b' }, blue: { label: 'Blue', hex: '#2675eb' },
  orange: { label: 'Orange', hex: '#ff8a24' }, green: { label: 'Green', hex: '#34a853' }, purple: { label: 'Purple', hex: '#9159cc' },
  white: { label: 'White', hex: '#ffffff' }, black: { label: 'Black', hex: '#202633' },
  pink: { label: 'Light red', hex: '#f79aa3' }, sky: { label: 'Light blue', hex: '#9bcaf5' }, mint: { label: 'Light green', hex: '#a0d9ad' },
  darkRed: { label: 'Dark red', hex: '#8e2634' }, darkBlue: { label: 'Dark blue', hex: '#193e79' }, darkGreen: { label: 'Dark green', hex: '#235b39' },
});
const recipe = (id, first, second, result, fact) => ({ id, first, second, result, fact });
export const COLOUR_RECIPES = freeze([
  recipe('orange', 'red', 'yellow', 'orange', 'Red and yellow make orange in our colour lab.'),
  recipe('green', 'yellow', 'blue', 'green', 'Yellow and blue make green in our colour lab.'),
  recipe('purple', 'red', 'blue', 'purple', 'Red and blue make purple in our colour lab.'),
  recipe('pink', 'red', 'white', 'pink', 'Adding white makes a colour lighter. This is called a tint.'),
  recipe('sky', 'blue', 'white', 'sky', 'Adding white makes blue lighter. This is a tint.'),
  recipe('mint', 'green', 'white', 'mint', 'Adding white makes green lighter. This is a tint.'),
  recipe('darkRed', 'red', 'black', 'darkRed', 'Adding black makes a colour darker. This is called a shade.'),
  recipe('darkBlue', 'blue', 'black', 'darkBlue', 'Adding black makes blue darker. This is a shade.'),
  recipe('darkGreen', 'green', 'black', 'darkGreen', 'Adding black makes green darker. This is a shade.'),
]);
export const mixClassroomColours = (first, second) => COLOUR_RECIPES.find((entry) =>
  (entry.first === first && entry.second === second) || (entry.first === second && entry.second === first))?.result ?? null;
export const COLOUR_CHAPTERS = freeze([
  { id: 'mix', title: 'Discover Colour', skill: 'Match named colours and predict secondary colours' },
  { id: 'light-dark', title: 'Light and Dark', skill: 'Use white for tints and black for shades' },
  { id: 'design', title: 'Colour Designer', skill: 'Choose a recipe for a named design target' },
]);
const task = (id, chapter, prompt, answer, choices, fact, target = null) => ({ id, chapter, prompt, answer, choices, fact, target });
const secondary = COLOUR_RECIPES.slice(0, 3).map((entry) => task(`predict:${entry.id}`, 0,
  `What will ${entry.first} and ${entry.second} make in our lab?`, entry.result, ['orange', 'green', 'purple'], entry.fact));
const matches = ['red', 'yellow', 'blue'].map((colour) => task(`match:${colour}`, 0,
  `Find the colour named ${colour}.`, colour, ['red', 'yellow', 'blue'], `This swatch is ${colour}. Colours also have names, so you can read or hear them.`));
const reverses = ['orange', 'green'].map((id) => {
  const entry = COLOUR_RECIPES.find((candidate) => candidate.id === id);
  return task(`ingredient:${id}`, 0, `You have ${entry.first}. What should you add to make ${entry.result}?`, entry.second,
    ['red', 'yellow', 'blue'].filter((colour) => colour !== entry.first), entry.fact);
});
const changes = COLOUR_RECIPES.slice(3).map((entry) => task(`change:${entry.id}`, 1,
  `Make ${COLOUR_SWATCHES[entry.result].label.toLowerCase()} from ${entry.first}. What should you add?`, entry.second,
  ['white', 'black', 'yellow'], entry.fact, entry.result));
const tintFacts = [
  task('rule:tint', 1, 'Which colour makes a tint lighter in our lab?', 'white', ['white', 'black', 'blue'], 'A tint is made by adding white.'),
  task('rule:shade', 1, 'Which colour makes a shade darker in our lab?', 'black', ['white', 'black', 'yellow'], 'A shade is made by adding black.'),
];
const objects = [ ['sunset', 'orange'], ['leaf', 'green'], ['kite', 'purple'], ['flower', 'pink'], ['sky mural', 'sky'], ['garden gate', 'mint'], ['night boat', 'darkBlue'], ['forest sign', 'darkGreen'] ];
const designs = objects.map(([object, colour]) => {
  const entry = COLOUR_RECIPES.find((candidate) => candidate.result === colour);
  return task(`design:${object}`, 2, `Our design brief asks for a ${COLOUR_SWATCHES[colour].label.toLowerCase()} ${object}. Choose its recipe.`, entry.id,
    COLOUR_RECIPES.map((candidate) => candidate.id), entry.fact, colour);
});
export const COLOUR_TASKS = freeze([...secondary, ...matches, ...reverses, ...changes, ...tintFacts, ...designs]);
export const colourChoiceLabel = (mission, choice) => mission.chapter === 2
  ? (() => { const entry = COLOUR_RECIPES.find((candidate) => candidate.id === choice); return entry ? `${COLOUR_SWATCHES[entry.first].label} + ${COLOUR_SWATCHES[entry.second].label}` : null; })()
  : COLOUR_SWATCHES[choice]?.label ?? null;
export const makeColourRun = ({ chapter, seed, recentTaskIds = [] }) => {
  const pool = COLOUR_TASKS.filter((entry) => entry.chapter === chapter);
  if (pool.length < 6) return null;
  const queue = [...reasoningShuffle(pool.filter((entry) => !recentTaskIds.includes(entry.id)), seed),
    ...reasoningShuffle(pool.filter((entry) => recentTaskIds.includes(entry.id)), seed ^ 0x27d4eb2f)].slice(0, 6);
  return freeze({ chapter, seed: seed >>> 0, missions: queue.map((entry, index) => ({ ...entry,
    choices: reasoningShuffle(entry.choices, seed + index * 7919).slice(0, entry.chapter === 2 ? 3 : entry.choices.length)
      .filter((choice) => choice !== entry.answer).concat(entry.answer)
      .filter((choice, position, all) => all.indexOf(choice) === position),
  })).map((entry, index) => ({ ...entry, choices: reasoningShuffle(entry.choices, seed ^ (index + 121)) })) });
};
export const validateColourMission = (mission) => {
  const canonical = COLOUR_TASKS.find((entry) => entry.id === mission?.id);
  return Boolean(canonical && ['chapter', 'prompt', 'answer', 'fact', 'target'].every((key) => mission[key] === canonical[key])
    && Array.isArray(mission.choices) && mission.choices.length >= 2 && mission.choices.length <= 4
    && new Set(mission.choices).size === mission.choices.length && mission.choices.includes(canonical.answer)
    && mission.choices.every((choice) => canonical.choices.includes(choice)));
};
export const markColourAnswer = (mission, choice) => ({ valid: validateColourMission(mission) && mission.choices.includes(choice),
  correct: validateColourMission(mission) && choice === mission.answer });
