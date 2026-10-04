// Authored rules use an explicit property. The named property, rather than any
// incidental colour or alternate grouping, determines the odd item.
const freeze = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const item = (id, label, kind, attributes = {}) => ({ id, label, kind, ...attributes });
const semanticGroups = {
  fruit: ['Apple', 'Banana', 'Orange', 'Pear', 'Grapes', 'Strawberry'],
  animal: ['Dog', 'Cat', 'Fish', 'Rabbit', 'Horse', 'Duck'],
  vehicle: ['Car', 'Bus', 'Train', 'Bicycle', 'Boat', 'Rocket'],
  instrument: ['Drum', 'Guitar', 'Piano', 'Trumpet', 'Violin', 'Flute'],
  clothing: ['Hat', 'Sock', 'Shirt', 'Coat', 'Shoe', 'Scarf'],
  plant: ['Tree', 'Grass', 'Fern', 'Cactus', 'Sunflower', 'Rose'],
  tool: ['Hammer', 'Saw', 'Wrench', 'Screwdriver', 'Spade', 'Rake'],
  tableware: ['Plate', 'Cup', 'Spoon', 'Fork', 'Bowl', 'Jug'],
};
const categoryItems = Object.entries(semanticGroups).flatMap(([category, names]) => names.map((label) => item(`${category}:${label.toLowerCase()}`, label, 'object', { category })));
const colours = ['red', 'blue', 'green', 'yellow'];
const shapes = ['circle', 'square', 'triangle', 'star'];
const shapeItems = colours.flatMap((colour) => shapes.map((shape) => item(`${colour}:${shape}`, `${colour} ${shape}`, 'shape', { colour, shape })));
const numberItems = Array.from({ length: 21 }, (_, number) => item(`number:${number}`, String(number), 'number', { number }));
const rule = (id, chapter, property, explanation, predicate, candidates, reasons) => ({
  id, chapter, property, explanation, predicate, candidates, reasons,
});
const semanticRules = Object.keys(semanticGroups).map((category) => rule(
  `category:${category}`, 0, `Three pictures show ${category === 'clothing' || category === 'tableware' ? category : `${category}s`}. Find the one that does not belong to that group.`,
  `Use the named group. Three items belong to it and one does not.`,
  (entry) => entry.category === category, categoryItems,
  [`It does not belong to the named ${category} group.`, `It belongs to the named ${category} group.`, `All four belong to the named ${category} group.`],
));
const visualRules = [
  ...colours.map((colour) => rule(`colour:${colour}`, 1, `Three shapes are ${colour}. Find the shape that is not ${colour}.`,
    `Look at colour for this rule. Shapes can be different and still share one colour.`, (entry) => entry.colour === colour, shapeItems,
    [`It is not ${colour}.`, `It is ${colour}.`, `All four are ${colour}.`])),
  ...shapes.map((shape) => rule(`shape:${shape}`, 1, `Three pictures are ${shape}s. Find the picture that is not a ${shape}.`,
    `Look at shape for this rule. Different colours can have the same shape.`, (entry) => entry.shape === shape, shapeItems,
    [`It is not a ${shape}.`, `It is a ${shape}.`, `All four are ${shape}s.`])),
];
const numericalRules = [
  ['even', 'Three numbers are even. Find the number that is not even.', 'Even numbers can be paired with none left over.', (entry) => entry.number % 2 === 0],
  ['odd', 'Three numbers are odd. Find the number that is not odd.', 'Odd numbers have one left over when we make pairs.', (entry) => entry.number % 2 === 1],
  ['less-five', 'Three numbers are less than 5. Find the number that is not less than 5.', 'Less than 5 means smaller than 5.', (entry) => entry.number < 5],
  ['more-five', 'Three numbers are greater than 5. Find the number that is not greater than 5.', 'Greater than 5 means bigger than 5.', (entry) => entry.number > 5],
  ['less-ten', 'Three numbers are less than 10. Find the number that is not less than 10.', 'Less than 10 means smaller than 10.', (entry) => entry.number < 10],
  ['more-ten', 'Three numbers are greater than 10. Find the number that is not greater than 10.', 'Greater than 10 means bigger than 10.', (entry) => entry.number > 10],
  ['tens', 'Three numbers are 0, 10 or 20. Find the number that is not one of those full tens.', 'Ten ones make one full ten; zero has no ones left over.', (entry) => entry.number % 10 === 0],
  ['one-digit', 'Three numbers have one digit. Find the number that does not have one digit.', 'Numbers 0 to 9 have one digit. Numbers 10 to 20 here have two digits.', (entry) => entry.number < 10],
].map(([id, property, explanation, predicate]) => rule(`number:${id}`, 2, property, explanation, predicate, numberItems,
  ['It does not follow the named number rule.', 'It follows the named number rule.', 'All four follow the named number rule.']));

export const ODD_RULES = freeze([...semanticRules, ...visualRules, ...numericalRules]);
export const ODD_CHAPTERS = freeze([
  { id: 'groups', title: 'Picture Groups', skill: 'semantic grouping' },
  { id: 'features', title: 'Look at the Feature', skill: 'visual classification' },
  { id: 'rules', title: 'Number Detectives', skill: 'apply a stated number rule' },
]);
export const reasoningShuffle = (items, seed) => {
  let value = seed >>> 0;
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const swap = value % (index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};
export const makeOddMission = (ruleId, seed) => {
  const authored = ODD_RULES.find((entry) => entry.id === ruleId);
  if (!authored) return null;
  const matching = reasoningShuffle(authored.candidates.filter(authored.predicate), seed).slice(0, 3);
  const odd = reasoningShuffle(authored.candidates.filter((entry) => !authored.predicate(entry)), seed ^ 0x9e3779b9)[0];
  if (matching.length !== 3 || !odd) return null;
  const choices = reasoningShuffle([...matching, odd], seed ^ 0x85ebca6b);
  const reasons = reasoningShuffle(authored.reasons.map((text, index) => ({ id: index, text })), seed ^ 0xc2b2ae35);
  return freeze({ id: `${authored.id}|${choices.map((entry) => entry.id).join('|')}`, ruleId, chapter: authored.chapter,
    property: authored.property, explanation: authored.explanation, choices, reasons, answerId: odd.id, reasonId: 0 });
};
export const validateOddMission = (mission) => {
  const authored = ODD_RULES.find((entry) => entry.id === mission?.ruleId);
  if (!authored || mission.chapter !== authored.chapter || mission.property !== authored.property || mission.explanation !== authored.explanation) return false;
  if (!Array.isArray(mission.choices) || mission.choices.length !== 4 || new Set(mission.choices.map((entry) => entry.id)).size !== 4) return false;
  const canonical = mission.choices.map((entry) => authored.candidates.find((candidate) => candidate.id === entry.id && JSON.stringify(candidate) === JSON.stringify(entry)));
  if (canonical.some((entry) => !entry)) return false;
  const odd = canonical.filter((entry) => !authored.predicate(entry));
  if (odd.length !== 1 || mission.answerId !== odd[0].id || mission.reasonId !== 0 || mission.id !== `${authored.id}|${canonical.map((entry) => entry.id).join('|')}`) return false;
  return Array.isArray(mission.reasons) && mission.reasons.length === 3 && new Set(mission.reasons.map((entry) => entry.id)).size === 3
    && mission.reasons.every((entry) => authored.reasons[entry.id] === entry.text);
};
export const makeOddRun = ({ chapter, seed, recentRuleIds = [] }) => {
  const pool = ODD_RULES.filter((entry) => entry.chapter === chapter);
  if (pool.length < 6) return { error: 'Choose a valid chapter.' };
  const queue = reasoningShuffle(pool.filter((entry) => !recentRuleIds.includes(entry.id)), seed);
  const remaining = reasoningShuffle(pool.filter((entry) => recentRuleIds.includes(entry.id)), seed ^ 0x27d4eb2f);
  const missions = [...queue, ...remaining].slice(0, 6).map((entry, index) => makeOddMission(entry.id, (seed + index * 7919) >>> 0));
  return freeze({ chapter, seed: seed >>> 0, missions });
};
export const markOddAnswer = (mission, itemId, reasonId) => {
  if (!validateOddMission(mission)) return { invalid: true, correct: false };
  if (!mission.choices.some((entry) => entry.id === itemId) || !mission.reasons.some((entry) => entry.id === reasonId)) return { invalid: true, correct: false };
  return { invalid: false, correct: itemId === mission.answerId && reasonId === mission.reasonId };
};
