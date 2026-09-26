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

export const ROCKET_COLOURS = Object.freeze([
  { id: 'red', hex: '#ef4444', name: 'red' },
  { id: 'purple', hex: '#8b5cf6', name: 'purple' },
  { id: 'green', hex: '#22c55e', name: 'green' },
  { id: 'blue', hex: '#3b82f6', name: 'blue' },
  { id: 'orange', hex: '#f97316', name: 'orange' },
]);

export const RESCUE_ANIMALS = Object.freeze([
  { id: 'kitten', emoji: '🐱', name: 'kitten' },
  { id: 'puppy', emoji: '🐶', name: 'puppy' },
  { id: 'bunny', emoji: '🐰', name: 'bunny' },
  { id: 'chick', emoji: '🐥', name: 'chick' },
  { id: 'panda', emoji: '🐼', name: 'panda' },
]);


// Five levels per game. A child moves up a level after a three-star game and
// back down after a one-star game, never below their starting level. Each
// level lists what it unlocks, shown on the finish screen when reached.
const ALL_PARTS = ['nose', 'window', 'fins', 'flame'];
export const LITTLE_LEVELS = Object.freeze({
  dino: [
    { rounds: 3, spots: 2, trail: 'bright' },
    { rounds: 3, spots: 3, trail: 'bright', unlock: 'search' },
    { rounds: 4, spots: 3, trail: 'marks', unlock: 'dino' },
    { rounds: 4, spots: 3, trail: 'marks', unlock: 'dino' },
    { rounds: 5, spots: 3, trail: 'faint', unlock: 'challenge' },
  ],
  dinojigsaw: [
    { grids: [[2, 1], [2, 1], [2, 2]], scenes: 2 },
    { grids: [[2, 1], [2, 2], [2, 2], [2, 2]], scenes: 3, unlock: 'picture' },
    { grids: [[2, 2], [2, 2], [3, 2], [3, 2]], scenes: 4, unlock: 'picture' },
    { grids: [[2, 2], [3, 2], [3, 2], [3, 3]], scenes: 5, unlock: 'picture' },
    { grids: [[3, 2], [3, 3], [3, 3], [4, 3]], scenes: 6, unlock: 'picture' },
  ],
  shadowmatch: [
    { choices: [2, 2, 2, 2], kinds: 3 },
    { choices: [2, 2, 3, 3], kinds: 4, unlock: 'dino' },
    { choices: [3, 3, 3, 3, 3], kinds: 5, unlock: 'dino' },
    { choices: [3, 3, 4, 4, 4], kinds: 6, unlock: 'dino' },
    // Top level mirrors the shadows, so the child must really look at shapes.
    { choices: [4, 4, 4, 4, 4], kinds: 6, mirror: true, unlock: 'challenge' },
  ],
  rocketbuilder: [
    { rounds: [['nose'], ['nose', 'fins']], colours: 2 },
    { rounds: [['nose', 'fins'], ['nose', 'window', 'fins']], colours: 3, unlock: 'colour' },
    { rounds: [['nose', 'window', 'fins'], ALL_PARTS, ALL_PARTS], colours: 4, unlock: 'colour' },
    { rounds: [ALL_PARTS, ALL_PARTS, ['body', ...ALL_PARTS]], colours: 5, unlock: 'colour' },
    { rounds: [['body', ...ALL_PARTS], ['body', ...ALL_PARTS], ['body', ...ALL_PARTS]], colours: 5, unlock: 'challenge' },
  ],
  fuelup: [
    { numbers: [1, 2, 3], rounds: 3 },
    { numbers: [1, 2, 3, 4], rounds: 4, unlock: 'number' },
    { numbers: [2, 3, 4, 5], rounds: 5, unlock: 'number' },
    { numbers: [3, 4, 5, 6, 7], rounds: 5, unlock: 'number' },
    { numbers: [5, 6, 7, 8, 9, 10], rounds: 5, unlock: 'number' },
  ],
  firerescue: [
    { fires: [1, 1, 2] },
    { fires: [1, 2, 2, 3], unlock: 'fire' },
    { fires: [2, 2, 3, 3, 3], unlock: 'fire' },
    { fires: [3, 3, 4, 4, 5], unlock: 'fire' },
    { fires: [4, 4, 5, 5, 6], unlock: 'fire' },
  ],
  ladder: [
    { floors: 2, rounds: 3 },
    { floors: 3, rounds: 4, unlock: 'floor' },
    { floors: 3, rounds: 5, numbers: true, unlock: 'numbers' },
    { floors: 4, rounds: 5, numbers: true, unlock: 'floor' },
    { floors: 5, rounds: 5, numbers: true, unlock: 'floor' },
  ],
});

export const LITTLE_START_LEVEL = Object.freeze({ little: 0, big: 2 });

export const levelRounds = (gameId, config) => {
  switch (gameId) {
    case 'dinojigsaw': return config.grids.length;
    case 'shadowmatch': return config.choices.length;
    case 'rocketbuilder': return config.rounds.length;
    case 'firerescue': return config.fires.length;
    default: return config.rounds;
  }
};

// Mistakes in a whole game → 1–3 stars. Generous on purpose: small children
// should nearly always see two or three stars.
export const starsForMistakes = (mistakes) => (mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);

export const NUMBER_NAMES = Object.freeze(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);

export const LITTLE_LINES = Object.freeze({
  welcome: 'Welcome Amari or Askia! Who is playing today?',
  dinoIntro: 'Dino Detective! Tap the footprint, then follow the trail to find the hidden dinosaur.',
  dinoPrompt: 'Tap the footprint to see where the dinosaur went!',
  dinoTrail: 'Follow the footprints. Which leaves are hiding the dinosaur?',
  dinoWrong: 'Not here. Look where the footprints lead!',
  dinoFound: 'You found the dinosaur! Well done!',
  jigsawIntro: 'Dino Jigsaw! Drag the pieces to build the picture.',
  jigsawWrong: 'Try another spot!',
  shadowIntro: 'Shadow Match! Drag the dinosaur to its shadow.',
  shadowWrong: 'Hmm, try another shadow!',
  rocketIntro: 'Rocket Builder! Drag the parts to build your rocket.',
  countdown: ['Three!', 'Two!', 'One!', 'Blast off!'],
  fuelIntro: 'Fuel Up! Count the fuel into the rocket.',
  fuelFull: 'The tank is full! Blast off!',
  fuelRecount: 'Oops! Let’s count again.',
  fireIntro: 'Fire Truck Rescue! Spray water on the fires.',
  fireStart: 'Oh no, fire! Spray the water!',
  fireDone: 'All the fires are out! Hooray!',
  ladderIntro: 'Ladder Rescue! Tap the window to save the animal.',
  ladderWrong: 'Not that one. Listen again!',
  finish: 'Hooray! You did it!',
  levelUp: 'Level up! Something new is waiting!',
  newSticker: 'You got a new sticker!',
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
