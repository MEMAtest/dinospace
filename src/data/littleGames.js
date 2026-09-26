// Content and narration for the little-explorer games (ages 3–5). Every line
// a game speaks is listed here so the offline voice generator packages it.

export const DINO_NAMES = Object.freeze({
  trex: 'T-rex',
  trike: 'Triceratops',
  stego: 'Stegosaurus',
  bronto: 'Brachiosaurus',
  ptero: 'Pterodactyl',
  ankylo: 'Ankylosaurus',
});

export const JIGSAW_SCENES = Object.freeze([
  { id: 'volcano', dino: 'trex', prompt: 'Let’s build the T-rex picture!' },
  { id: 'lake', dino: 'bronto', prompt: 'Let’s build the Brachiosaurus picture!' },
  { id: 'meadow', dino: 'trike', prompt: 'Let’s build the Triceratops picture!' },
  { id: 'sky', dino: 'ptero', prompt: 'Let’s build the Pterodactyl picture!' },
  { id: 'forest', dino: 'stego', prompt: 'Let’s build the Stegosaurus picture!' },
  { id: 'eggs', dino: 'ankylo', prompt: 'Let’s build the Ankylosaurus picture!' },
]);

// [columns, rows] per round. Little explorers start with two big halves.
export const JIGSAW_GRIDS = Object.freeze({
  little: [[2, 1], [2, 2], [2, 2], [3, 2], [3, 2]],
  big: [[2, 2], [3, 2], [3, 3], [3, 3], [4, 3]],
});

export const SHADOW_CHOICES = Object.freeze({
  little: [2, 2, 3, 3, 3],
  big: [3, 3, 4, 4, 4],
});

export const ROCKET_COLOURS = Object.freeze([
  { id: 'red', hex: '#ef4444', name: 'red' },
  { id: 'purple', hex: '#8b5cf6', name: 'purple' },
  { id: 'green', hex: '#22c55e', name: 'green' },
  { id: 'blue', hex: '#3b82f6', name: 'blue' },
  { id: 'orange', hex: '#f97316', name: 'orange' },
]);

// Parts the child adds each round; everything else starts already built.
export const ROCKET_BUILD_ROUNDS = Object.freeze({
  little: [['nose', 'fins'], ['nose', 'window', 'fins'], ['nose', 'window', 'fins', 'flame']],
  big: [['nose', 'window', 'fins', 'flame'], ['body', 'nose', 'window', 'fins', 'flame'], ['body', 'nose', 'window', 'fins', 'flame']],
});

export const FUEL_NUMBERS = Object.freeze({
  little: [1, 2, 3, 4, 5],
  big: [3, 4, 5, 6, 7, 8, 9, 10],
});

export const FIRE_COUNTS = Object.freeze({
  little: [1, 2, 2, 3, 3],
  big: [3, 3, 4, 5, 6],
});

export const RESCUE_ANIMALS = Object.freeze([
  { id: 'kitten', emoji: '🐱', name: 'kitten' },
  { id: 'puppy', emoji: '🐶', name: 'puppy' },
  { id: 'bunny', emoji: '🐰', name: 'bunny' },
  { id: 'chick', emoji: '🐥', name: 'chick' },
  { id: 'panda', emoji: '🐼', name: 'panda' },
]);

export const LADDER_FLOORS = Object.freeze({ little: 3, big: 5 });

export const NUMBER_NAMES = Object.freeze(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);

export const LITTLE_LINES = Object.freeze({
  welcome: 'Welcome Amari or Askia! Who is playing today?',
  jigsawIntro: 'Dino Jigsaw! Drag the pieces to build the picture.',
  jigsawWrong: 'Try another spot!',
  shadowIntro: 'Shadow Match! Drag the dinosaur to its shadow.',
  shadowWrong: 'Hmm, try another shadow!',
  rocketIntro: 'Rocket Builder! Drag the parts to build your rocket.',
  countdown: ['Three!', 'Two!', 'One!', 'Blast off!'],
  fuelIntro: 'Fuel Up! Count the fuel into the rocket.',
  fuelFull: 'The tank is full! Blast off!',
  fireIntro: 'Fire Truck Rescue! Spray water on the fires.',
  fireStart: 'Oh no, fire! Spray the water!',
  fireDone: 'All the fires are out! Hooray!',
  ladderIntro: 'Ladder Rescue! Tap the window to save the animal.',
  ladderWrong: 'Not that one. Listen again!',
  finish: 'Hooray! You did it!',
});

export const fuelPrompt = (n) => `Put ${NUMBER_NAMES[n]} fuel ${n === 1 ? 'can' : 'cans'} in the rocket.`;
export const shadowFound = (kind) => `You found the ${DINO_NAMES[kind]}!`;
export const rescuePrompt = (animal) => `Rescue the ${animal.name}!`;
export const rescueFloorPrompt = (floor) => `Rescue the animal on floor ${NUMBER_NAMES[floor]}!`;
export const rescueDone = (animal) => `You saved the ${animal.name}!`;
export const rocketColourPrompt = (colour) => `Build the ${colour.name} rocket!`;

export const LITTLE_VOICE_LINES = Object.freeze([
  ...Object.values(LITTLE_LINES).flat(),
  ...JIGSAW_SCENES.map((scene) => scene.prompt),
  ...Object.keys(DINO_NAMES).map(shadowFound),
  ...Object.values(DINO_NAMES),
  ...Array.from({ length: 10 }, (_, index) => fuelPrompt(index + 1)),
  ...RESCUE_ANIMALS.flatMap((animal) => [rescuePrompt(animal), rescueDone(animal)]),
  ...Array.from({ length: 5 }, (_, index) => rescueFloorPrompt(index + 1)),
  ...ROCKET_COLOURS.map(rocketColourPrompt),
  ...Array.from({ length: 10 }, (_, index) => String(index + 1)),
  'Hi Amari! Let’s explore!',
  'Hi Askia! Let’s play!',
]);
