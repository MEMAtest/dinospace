/**
 * Colour Lab adventure recipes use a deliberately simplified classroom paint model.
 * Ratios describe scoops in this activity; real paints vary by pigment and brand.
 */
export const COLOUR_LABS = Object.freeze([
  { id: 'mix', title: 'Paint Mixer', subtitle: 'Make a new colour from two paints', accent: '#d94f91', lesson: 'A little paint from each pot can blend into a new colour. Our recipes use the same scoop sizes every time.' },
  { id: 'light', title: 'Light & Shade', subtitle: 'Change a colour with white or black', accent: '#4387c5', lesson: 'White can make a paint blend look lighter. A tiny touch of black can make it look darker. This is a simple paint model.' },
  { id: 'make', title: 'Colour Makers', subtitle: 'Mix a colour, then use it in a picture', accent: '#4a9b78', lesson: 'Artists mix paints to choose colours for objects. A recipe is a helpful starting point; real paint can look different.' },
]);

const mission = (id, lab, title, prompt, ingredients, answer, proportions, explanation, object, options, clue) => Object.freeze({
  id, lab, title, prompt, ingredients: Object.freeze(ingredients), answer, resultColor: lab === 'light' ? ({ 'light-pink':'Pink', 'light-sky':'Sky Blue', 'light-grey':'Pale Grey', 'light-coral':'Dark Red', 'light-peach':'Navy', 'light-charcoal':'Grey' }[id] || answer) : answer, proportions: Object.freeze(proportions),
  explanation, object, options: Object.freeze(options), clue,
});

export const COLOUR_LAB_MISSIONS = Object.freeze([
  mission('mix-orange', 'mix', 'Two primary paints', 'Mix red and yellow. Which colour did you make?', ['Red', 'Yellow'], 'Orange', ['1 scoop red', '1 scoop yellow'], 'Equal scoops of red and yellow make an orange blend in our simple paint recipe.', 'sun', ['Orange', 'Green', 'Purple'], 'The two primary paints are red and yellow.'),
  mission('mix-green', 'mix', 'Two primary paints', 'Mix blue and yellow. Which colour did you make?', ['Blue', 'Yellow'], 'Green', ['1 scoop blue', '1 scoop yellow'], 'Equal scoops of blue and yellow make a green blend in our simple paint recipe.', 'leaf', ['Green', 'Orange', 'Purple'], 'Try combining blue with yellow.'),
  mission('mix-purple', 'mix', 'Two primary paints', 'Mix red and blue. Which colour did you make?', ['Red', 'Blue'], 'Purple', ['1 scoop red', '1 scoop blue'], 'Equal scoops of red and blue make a purple blend in our simple paint recipe.', 'berry', ['Purple', 'Green', 'Orange'], 'Try combining red with blue.'),
  mission('mix-teal', 'mix', 'Change the proportions', 'Mix two scoops of blue and one scoop of yellow. Which colour did you make?', ['Blue', 'Yellow'], 'Teal', ['2 scoops blue', '1 scoop yellow'], 'More blue than yellow makes a blue-green blend. We call this recipe teal.', 'wave', ['Teal', 'Orange', 'Pink'], 'Use twice as much blue as yellow.'),
  mission('mix-brown', 'mix', 'Three primary paints', 'Mix equal scoops of the three primary paints. Which colour did you make?', ['Red', 'Yellow', 'Blue'], 'Brown', ['1 scoop red', '1 scoop yellow', '1 scoop blue'], 'In this simplified recipe, equal scoops of red, yellow and blue make a brown blend.', 'acorn', ['Brown', 'Pink', 'Light Blue'], 'Use one scoop of each primary paint.'),
  mission('mix-lime', 'mix', 'Change the proportions', 'Mix more yellow than blue. Which colour did you make?', ['Blue', 'Yellow'], 'Lime', ['1 scoop blue', '3 scoops yellow'], 'A larger share of yellow makes a bright yellow-green blend in our recipe.', 'sprout', ['Lime', 'Purple', 'Brown'], 'Use more yellow than blue.'),
  mission('light-pink', 'light', 'Test white with red', 'Mix these scoops, then look at the paint: did white make the red blend lighter or darker?', ['Red', 'White'], 'Lighter', ['1 scoop red', '2 scoops white'], 'Two scoops of white mixed with one red make a lighter pink blend in this activity.', 'flower', ['Lighter', 'Darker', 'No change'], 'Use more white than red.'),
  mission('light-sky', 'light', 'Test white with blue', 'Mix these scoops, then look at the paint: did white make the blue blend lighter or darker?', ['Blue', 'White'], 'Lighter', ['1 scoop blue', '3 scoops white'], 'More white than blue makes a pale sky-blue blend in our recipe.', 'cloud', ['Lighter', 'Darker', 'No change'], 'Use three scoops of white for one blue.'),
  mission('light-grey', 'light', 'Test white with black', 'Mix these scoops, then look at the paint: did white make the black blend lighter or darker?', ['Black', 'White'], 'Lighter', ['1 scoop black', '4 scoops white'], 'A small scoop of black with more white makes a pale grey blend in our simplified model.', 'moon', ['Lighter', 'Darker', 'No change'], 'Use much more white than black.'),
  mission('light-coral', 'light', 'Test a touch of black', 'Mix these scoops, then look at the paint: did black make the red blend lighter or darker?', ['Red', 'Black'], 'Darker', ['2 scoops red', '1 scoop black'], 'A little black makes a darker red blend in this simplified paint activity.', 'shell', ['Lighter', 'Darker', 'No change'], 'Add a little black to the red paint.'),
  mission('light-peach', 'light', 'Test a touch of black', 'Mix these scoops, then look at the paint: did black make the blue blend lighter or darker?', ['Blue', 'Black'], 'Darker', ['2 scoops blue', '1 scoop black'], 'A little black makes a darker blue blend in this simplified paint activity.', 'peach', ['Lighter', 'Darker', 'No change'], 'Add a little black to the blue paint.'),
  mission('light-charcoal', 'light', 'Test black with white', 'Mix these scoops, then look at the paint: did black make the white blend lighter or darker?', ['White', 'Black'], 'Darker', ['2 scoops white', '1 scoop black'], 'Black darkens white into a dark grey blend in our simplified paint recipe.', 'stone', ['Lighter', 'Darker', 'No change'], 'Use two scoops of white with one black.'),
  mission('make-sun', 'make', 'Paint a sunny badge', 'Choose a recipe, mix the paint, and match the sun badge.', ['Red', 'Yellow'], 'Orange', ['1 scoop red', '1 scoop yellow'], 'The sun badge uses our orange recipe: equal scoops of red and yellow.', 'sun', ['Orange', 'Green', 'Purple'], 'Red and yellow make the orange blend.'),
  mission('make-leaf', 'make', 'Paint a leaf', 'Choose a recipe, mix the paint, and match the leaf.', ['Blue', 'Yellow'], 'Green', ['1 scoop blue', '1 scoop yellow'], 'The leaf uses our green recipe: equal scoops of blue and yellow.', 'leaf', ['Green', 'Orange', 'Pink'], 'Blue and yellow make the green blend.'),
  mission('make-berry', 'make', 'Paint a berry', 'Choose a recipe, mix the paint, and match the berry.', ['Red', 'Blue'], 'Purple', ['1 scoop red', '1 scoop blue'], 'The berry uses our purple recipe: equal scoops of red and blue.', 'berry', ['Purple', 'Brown', 'Lime'], 'Red and blue make the purple blend.'),
  mission('make-cloud', 'make', 'Paint a soft cloud', 'Choose a recipe, mix the paint, and match the cloud.', ['Blue', 'White'], 'Sky Blue', ['1 scoop blue', '3 scoops white'], 'The cloud uses a pale blue recipe with three scoops of white for each blue scoop.', 'cloud', ['Sky Blue', 'Dark Grey', 'Orange'], 'More white than blue makes a pale blend.'),
  mission('make-flower', 'make', 'Paint a flower', 'Choose a recipe, mix the paint, and match the flower.', ['Red', 'White'], 'Pink', ['1 scoop red', '2 scoops white'], 'The flower uses our pink recipe: one red scoop and two white scoops.', 'flower', ['Pink', 'Teal', 'Brown'], 'Add more white than red.'),
  mission('make-wave', 'make', 'Paint a wave', 'Choose a recipe, mix the paint, and match the wave.', ['Blue', 'Yellow'], 'Teal', ['2 scoops blue', '1 scoop yellow'], 'The wave uses a blue-green teal recipe with twice as much blue as yellow.', 'wave', ['Teal', 'Coral', 'Pink'], 'Use two blue scoops and one yellow.'),
]);

export const COLOUR_PAINTS = Object.freeze({ Red: '#e45152', Yellow: '#f2c94c', Blue: '#4386cf', White: '#fffdf7', Black: '#303849' });

// In the application chapter, each child chooses a taught recipe card, then
// measures and mixes the paint. Cards in each set use the same scoop total.
export const COLOUR_MAKE_RECIPE_CHOICES = Object.freeze({
  'make-sun': Object.freeze([
    Object.freeze({ id: 'orange', color: 'Orange', scoops: Object.freeze({ Red: 1, Yellow: 1 }) }),
    Object.freeze({ id: 'green', color: 'Green', scoops: Object.freeze({ Blue: 1, Yellow: 1 }) }),
    Object.freeze({ id: 'purple', color: 'Purple', scoops: Object.freeze({ Red: 1, Blue: 1 }) }),
  ]),
  'make-leaf': Object.freeze([
    Object.freeze({ id: 'green', color: 'Green', scoops: Object.freeze({ Blue: 1, Yellow: 1 }) }),
    Object.freeze({ id: 'orange', color: 'Orange', scoops: Object.freeze({ Red: 1, Yellow: 1 }) }),
    Object.freeze({ id: 'purple', color: 'Purple', scoops: Object.freeze({ Red: 1, Blue: 1 }) }),
  ]),
  'make-berry': Object.freeze([
    Object.freeze({ id: 'purple', color: 'Purple', scoops: Object.freeze({ Red: 1, Blue: 1 }) }),
    Object.freeze({ id: 'green', color: 'Green', scoops: Object.freeze({ Blue: 1, Yellow: 1 }) }),
    Object.freeze({ id: 'orange', color: 'Orange', scoops: Object.freeze({ Red: 1, Yellow: 1 }) }),
  ]),
  'make-cloud': Object.freeze([
    Object.freeze({ id: 'sky-blue', color: 'Sky Blue', scoops: Object.freeze({ Blue: 1, White: 3 }) }),
    Object.freeze({ id: 'pink', color: 'Pink', scoops: Object.freeze({ Red: 1, White: 3 }) }),
    Object.freeze({ id: 'pale-grey', color: 'Pale Grey', scoops: Object.freeze({ Black: 1, White: 3 }) }),
  ]),
  'make-flower': Object.freeze([
    Object.freeze({ id: 'pink', color: 'Pink', scoops: Object.freeze({ Red: 1, White: 2 }) }),
    Object.freeze({ id: 'teal', color: 'Teal', scoops: Object.freeze({ Blue: 2, Yellow: 1 }) }),
    Object.freeze({ id: 'dark-red', color: 'Dark Red', scoops: Object.freeze({ Red: 2, Black: 1 }) }),
  ]),
  'make-wave': Object.freeze([
    Object.freeze({ id: 'teal', color: 'Teal', scoops: Object.freeze({ Blue: 2, Yellow: 1 }) }),
    Object.freeze({ id: 'pink', color: 'Pink', scoops: Object.freeze({ Red: 1, White: 2 }) }),
    Object.freeze({ id: 'brown', color: 'Brown', scoops: Object.freeze({ Red: 1, Yellow: 1, Blue: 1 }) }),
  ]),
});


// Deterministic per-run permutation. It keeps every mission once and moves a
// just-completed recent mission away from the first position when possible.
export function seededColourMissionOrder(lab, seed = 1, recentIds = []) {
  const pool = COLOUR_LAB_MISSIONS.filter((item) => item.lab === lab);
  const state = { value: Math.abs(Math.floor(Number(seed) || 1)) || 1 };
  const random = () => {
    state.value = (state.value * 1664525 + 1013904223) >>> 0;
    return state.value / 0x100000000;
  };
  const ordered = [...pool];
  for (let i = ordered.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  if (ordered.length > 1 && ordered[0].id === recentIds.at(-1)) {
    const replacement = ordered.findIndex((item, index) => index > 0 && item.id !== recentIds.at(-1));
    if (replacement > 0) [ordered[0], ordered[replacement]] = [ordered[replacement], ordered[0]];
  }
  return ordered;
}

// Stable seeded choice.
export function seededColourMission(seed = 1, lab = null, recentIds = []) {
  const pool = COLOUR_LAB_MISSIONS.filter((item) => (!lab || item.lab === lab) && !recentIds.includes(item.id));
  const candidates = pool.length ? pool : COLOUR_LAB_MISSIONS.filter((item) => !lab || item.lab === lab);
  const n = Math.abs(Math.floor(Number(seed) || 1));
  return candidates[n % candidates.length];
}

// Exact, finite narration request inventory. The UI passes each line as its own
// required packaged segment so missing assets remain unavailable offline rather
// than falling through to newly generated or unreviewed speech.
export const COLOUR_LAB_NARRATION = Object.freeze(COLOUR_LAB_MISSIONS.flatMap((item) => [
  Object.freeze({ missionId: item.id, purpose: 'prompt', text: item.prompt }),
  Object.freeze({ missionId: item.id, purpose: 'clue', text: item.clue }),
  Object.freeze({ missionId: item.id, purpose: 'explanation', text: item.explanation }),
]));

export function colourRecipeCounts(missionOrId) {
  const item = typeof missionOrId === 'string' ? COLOUR_LAB_MISSIONS.find((entry) => entry.id === missionOrId) : missionOrId;
  if (!item) return {};
  return Object.fromEntries(item.ingredients.map((name, index) => [name, Number(item.proportions[index].match(/(\d+)/)?.[1] || 1)]));
}

export function colourRecipeMatches(missionOrId, added = {}) {
  const item = typeof missionOrId === 'string' ? COLOUR_LAB_MISSIONS.find((entry) => entry.id === missionOrId) : missionOrId;
  if (!item) return false;
  const expected = colourRecipeCounts(item);
  return [...new Set([...Object.keys(expected), ...Object.keys(added)])].every((name) => (Number(added[name]) || 0) === (expected[name] || 0));
}
