/**
 * Odd One Out is a small classification adventure. Each card has one stated
 * property, and exactly one item fails it. Keep the property visible before
 * the child chooses so a surprising but defensible alternative rule is never
 * required to guess the author's intent.
 */
export const ODD_ONE_OUT_CHAPTERS = Object.freeze([
  Object.freeze({
    id: 'things-and-places', title: 'Things & Places', accent: '#337d72',
    lesson: 'Sort by what things are used for or where they belong. Three pictures share the named group; one does not.',
    shortLesson: 'Find the item outside the named group.',
  }),
  Object.freeze({
    id: 'look-and-notice', title: 'Look & Notice', accent: '#b66b4d',
    lesson: 'Look carefully at a picture feature such as sides, colour, or marks. Say the rule in your head before you choose.',
    shortLesson: 'Compare the picture feature in every card.',
  }),
  Object.freeze({
    id: 'little-rules', title: 'Little Rules', accent: '#656bb0',
    lesson: 'Use a simple rule to compare shapes, counts, and patterns. Count or check each card before you choose.',
    shortLesson: 'Check which card breaks the simple rule.',
  }),
]);

const item = (id, label, art, detail = {}) => Object.freeze({ id, label, art, ...detail });
const round = (id, chapterId, title, property, items, oddItemId, because, fact, clue, alternativeReasons) => {
  if (!Array.isArray(alternativeReasons) || alternativeReasons.length !== 2) throw new Error(`Round ${id} needs two specific alternative reasons.`);
  const choices = Object.freeze([
    Object.freeze({ id: 'because-correct', text: `Because ${because}`, correct: true }),
    ...alternativeReasons.map((text, index) => Object.freeze({ id: `because-alternative-${index + 1}`, text: `Because ${text}`, correct: false })),
  ]);
  return Object.freeze({
    id, chapterId, title, property, items: Object.freeze(items), oddItemId,
    because, choices, fact, clue,
    prompt: property,
    explanation: `${because} ${fact}`,
  });
};

export const ODD_ONE_OUT_ROUNDS = Object.freeze([
  // Chapter 1: semantic sorting. Items use clearly distinct, named objects.
  round('semantic-fruit', 'things-and-places', 'Fruit basket', 'Three are fruits. Which picture does not fit?', [item('apple', 'Apple', 'apple'), item('pear', 'Pear', 'pear'), item('plum', 'Plum', 'plum'), item('carrot', 'Carrot', 'carrot')], 'carrot', 'a carrot is a root vegetable, not a fruit.', 'Carrots grow as roots underground; apples, pears, and plums are fruits.', 'Look for the one that grows as a vegetable root.', ['it grows on a tree.', 'its inside is red.']),
  round('semantic-vehicles', 'things-and-places', 'Ways to travel', 'Three carry people from place to place. Which picture does not fit?', [item('bus', 'Bus', 'bus'), item('train', 'Train', 'train'), item('boat', 'Boat', 'boat'), item('tulip', 'Tulip', 'tulip')], 'tulip', 'a tulip is a flower, not a way to travel.', 'A bus, train, and boat carry people; a tulip grows in a garden.', 'Which picture can carry a traveller?', ['it carries people from place to place.', 'it has wheels.']),
  round('semantic-clothing', 'things-and-places', 'Getting dressed', 'Three are clothes you can wear. Which picture does not fit?', [item('hat', 'Hat', 'hat'), item('sock', 'Sock', 'sock'), item('coat', 'Coat', 'coat'), item('plate', 'Plate', 'plate')], 'plate', 'a plate is used for food, not worn as clothing.', 'A hat, sock, and coat are clothes; a plate holds food.', 'Find the thing that belongs at the table.', ['you can wear it on your foot.', 'it is made of warm fabric.']),
  round('semantic-weather', 'things-and-places', 'Weather watch', 'Three describe weather in the sky. Which picture does not fit?', [item('sunshine', 'Sunshine', 'sun'), item('rain', 'Rain', 'rain'), item('snow', 'Snow', 'snow'), item('sandwich', 'Sandwich', 'sandwich')], 'sandwich', 'a sandwich is food, not weather.', 'Sunshine, rain, and snow describe weather; a sandwich is something to eat.', 'Which picture could you pack for lunch?', ['it tells us what the weather is like.', 'it falls from clouds.']),
  round('semantic-tools', 'things-and-places', 'Helpful tools', 'Three help people build or fix things. Which picture does not fit?', [item('hammer', 'Hammer', 'hammer'), item('saw', 'Saw', 'saw'), item('spanner', 'Spanner', 'spanner'), item('balloon', 'Balloon', 'balloon')], 'balloon', 'a balloon is for play, not for making or fixing things.', 'A hammer, saw, and spanner help people build or repair; a balloon is a toy.', 'Look for the toy instead of a workshop tool.', ['it cuts wood.', 'it tightens a bolt.']),
  round('semantic-habitat', 'things-and-places', 'Animal homes', 'Three animals live in the sea. Which animal does not fit?', [item('dolphin', 'Dolphin', 'dolphin'), item('octopus', 'Octopus', 'octopus'), item('turtle', 'Sea turtle', 'turtle'), item('rabbit', 'Rabbit', 'rabbit')], 'rabbit', 'a rabbit lives on land, not in the sea.', 'Dolphins, octopuses, and sea turtles live in the ocean; rabbits live on land.', 'Which animal needs a burrow rather than the ocean?', ['it breathes underwater.', 'it has fins.']),

  // Chapter 2: visual classification. Each prompt names the visible feature.
  round('visual-sides', 'look-and-notice', 'Count the sides', 'Three shapes have four straight sides. Which shape has only three?', [item('square', 'Square', 'square'), item('rectangle', 'Rectangle', 'rectangle'), item('rhombus', 'Rhombus', 'rhombus'), item('triangle', 'Triangle', 'triangle')], 'triangle', 'a triangle has three straight sides.', 'A square, rectangle, and rhombus each have four straight sides; a triangle has three.', 'Count the straight sides, one at a time.', ['it has four straight sides.', 'it has a curved edge.']),
  round('visual-colour', 'look-and-notice', 'Colour clues', 'Three pictures are blue. Which picture is a different colour?', [item('bluebird', 'Blue bird', 'bird', { color: 'blue' }), item('bluefish', 'Blue fish', 'fish', { color: 'blue' }), item('bluekite', 'Blue kite', 'kite', { color: 'blue' }), item('redball', 'Red ball', 'ball', { color: 'red' })], 'redball', 'the ball is red; the other three pictures are blue.', 'A colour can be shared by different things: a bird, fish, and kite can all be blue.', 'Check the colour, not what the object is.', ['it is blue like the other three.', 'it is a fish.']),
  round('visual-parts', 'look-and-notice', 'Wheels or no wheels', 'Three pictures have wheels. Which picture has none?', [item('bicycle', 'Bicycle', 'bicycle'), item('car', 'Car', 'car'), item('pushchair', 'Pushchair', 'pushchair'), item('kite', 'Kite', 'kite')], 'kite', 'a kite has no wheels.', 'A bicycle, car, and pushchair roll on wheels; a kite flies on a string.', 'Look underneath each thing for round wheels.', ['it has wheels.', 'it rolls along the ground.']),
  round('visual-markings', 'look-and-notice', 'Spot the stripes', 'Three animals have stripes. Which animal has spots instead?', [item('tiger', 'Tiger', 'tiger'), item('zebra', 'Zebra', 'zebra'), item('bumblebee', 'Bumblebee', 'bee'), item('ladybird', 'Ladybird', 'ladybird')], 'ladybird', 'a ladybird has spots, not stripes.', 'Tigers, zebras, and many bees have stripes; a ladybird has round spots.', 'Look for spots instead of long bands.', ['it has stripes.', 'its back has long bands.']),
  round('visual-sky', 'look-and-notice', 'Up in the sky', 'Three pictures can be seen in the daytime sky. Which picture belongs on a person?', [item('sun', 'Sun', 'sun'), item('cloud', 'Cloud', 'cloud'), item('rainbow', 'Rainbow', 'rainbow'), item('boot', 'Boot', 'boot')], 'boot', 'a boot belongs on a foot, not in the sky.', 'The sun, clouds, and rainbows can be seen in the sky; a boot is worn on a foot.', 'Look for the picture that belongs on a person.', ['it floats among the clouds.', 'it shines like the sun.']),
  round('visual-shape', 'look-and-notice', 'Corners and curves', 'Three shapes have straight sides. Which one has only a curved edge?', [item('circle', 'Circle', 'circle'), item('triangle', 'Triangle', 'triangle'), item('square', 'Square', 'square'), item('rectangle', 'Rectangle', 'rectangle')], 'circle', 'a circle has no straight sides.', 'A triangle, square, and rectangle have straight sides; a circle has only a curved edge.', 'Trace the outside edge with your finger.', ['it has four straight sides.', 'it is blue.']),

  // Chapter 3: simple, observable rules. Numbered counts are drawn explicitly.
  round('rule-dots', 'little-rules', 'Count the dots', 'Three cards show an even number of dots. Which card does not fit?', [item('two-dots', 'Two dots', 'dots', { count: 2 }), item('four-dots', 'Four dots', 'dots', { count: 4 }), item('six-dots', 'Six dots', 'dots', { count: 6 }), item('three-dots', 'Three dots', 'dots', { count: 3 })], 'three-dots', 'it has three dots, so one dot is left when you try to make pairs.', 'An even number can be arranged into pairs with none left over.', 'Touch each dot once, then try making pairs.', ['it has an even number of dots.', 'all its dots pair with none left over.']),
  round('rule-letters', 'little-rules', 'Find the first letter', 'Three words start with B. Which word starts with a different letter?', [item('ball', 'Ball', 'word', { text: 'BALL' }), item('boat', 'Boat', 'word', { text: 'BOAT' }), item('bird', 'Bird', 'word', { text: 'BIRD' }), item('cat', 'Cat', 'word', { text: 'CAT' })], 'cat', 'cat starts with C; the other three words start with B.', 'The first letter is the one at the left of a word.', 'Look at the very first letter in each word.', ['it starts with B.', 'its first letter is at the end of the word.']),
  round('rule-shapes', 'little-rules', 'Three corners', 'Three shapes have more than three corners. Which shape has exactly three?', [item('triangle', 'Triangle', 'triangle'), item('square', 'Square', 'square'), item('pentagon', 'Pentagon', 'pentagon'), item('hexagon', 'Hexagon', 'hexagon')], 'triangle', 'a triangle has exactly three corners.', 'A triangle has three sides and three corners. The other shapes have more.', 'Tap each corner as you count.', ['it has six corners.', 'it has more corners than a hexagon.']),
  round('rule-pattern', 'little-rules', 'Pattern shapes', 'The repeating set uses circles and squares. Which shape is outside that set?', [item('circle', 'Circle', 'circle'), item('square', 'Square', 'square'), item('circle-again', 'Circle', 'circle'), item('triangle', 'Triangle', 'triangle')], 'triangle', 'a triangle is outside the circle-and-square set.', 'A repeating set can use two shapes in a pattern. This one uses circles and squares.', 'Check whether each shape is a circle or a square.', ['it is a circle.', 'it is a square.']),
  round('rule-size', 'little-rules', 'Big and small', 'Three pictures are large. Which picture is small?', [item('big-star', 'Big star', 'star', { size: 'large' }), item('large-star', 'Large star', 'star', { size: 'large' }), item('small-star', 'Small star', 'star', { size: 'small' }), item('big-moon', 'Big moon', 'moon', { size: 'large' })], 'small-star', 'the small star is smaller than the other three pictures.', 'Comparing size means looking at how much space each picture takes up.', 'Compare each picture with the others, not its name.', ['it is larger than every other picture.', 'all four pictures are small.']),
  round('rule-even', 'little-rules', 'Count an even number', 'Three numbers are even. Which number is odd?', [item('two', '2', 'number', { value: 2 }), item('four', '4', 'number', { value: 4 }), item('six', '6', 'number', { value: 6 }), item('five', '5', 'number', { value: 5 })], 'five', 'five is odd; it cannot be split into two equal groups.', 'Two, four, and six can be paired with none left over. Five leaves one extra.', 'Try making pairs. Which number has one left over?', ['it can be paired with none left over.', 'it is an even number.']),
]);

export const ODD_ONE_OUT_ROUNDS_BY_CHAPTER = Object.freeze(Object.fromEntries(
  ODD_ONE_OUT_CHAPTERS.map((chapter) => [chapter.id, Object.freeze(ODD_ONE_OUT_ROUNDS.filter((entry) => entry.chapterId === chapter.id))]),
));

// Seeded Fisher-Yates keeps a complete run stable. The most recent round is
// moved away from the first slot whenever another round is available.
export function seededOddOneOutRun(chapterId, seed = 1, recentRoundIds = []) {
  const chapterRounds = ODD_ONE_OUT_ROUNDS_BY_CHAPTER[chapterId] || [];
  const state = { value: Math.abs(Math.floor(Number(seed) || 1)) || 1 };
  const random = () => {
    state.value = (Math.imul(state.value, 1664525) + 1013904223) >>> 0;
    return state.value / 0x100000000;
  };
  const run = [...chapterRounds];
  for (let index = run.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [run[index], run[swap]] = [run[swap], run[index]];
  }
  if (run.length > 1 && recentRoundIds.includes(run[0].id)) {
    const replacement = run.findIndex((entry, index) => index > 0 && !recentRoundIds.includes(entry.id));
    if (replacement > 0) [run[0], run[replacement]] = [run[replacement], run[0]];
  }
  return run.map((entry) => {
    const options = [...entry.items];
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [options[index], options[swap]] = [options[swap], options[index]];
    }
    const reasons = [...entry.choices];
    for (let index = reasons.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [reasons[index], reasons[swap]] = [reasons[swap], reasons[index]];
    }
    return Object.freeze({ ...entry, options: Object.freeze(options), choices: Object.freeze(reasons) });
  });
}

const narrationEntries = ODD_ONE_OUT_ROUNDS.flatMap((entry) => [
  Object.freeze({ roundId: entry.id, purpose: 'prompt', text: entry.prompt }),
  Object.freeze({ roundId: entry.id, purpose: 'clue', text: entry.clue }),
  Object.freeze({ roundId: entry.id, purpose: 'explanation', text: entry.explanation }),
]);
export const ODD_ONE_OUT_NARRATION = Object.freeze([...new Map(narrationEntries.map((entry) => [entry.text, entry])).values()]);
