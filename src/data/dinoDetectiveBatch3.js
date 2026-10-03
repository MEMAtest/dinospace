import { DINO_LEVELS, DINO_SPECIES } from './index.js';

const freeze = (value) => Object.freeze(value);

const WORLD_FACTS = {
  jungle: { fact: 'Ferns make spores instead of flowers or seeds.', ambientId: 'jungle', mark: '🌿', hint: 'Look for the creature hiding in this leafy place.' },
  volcano: { fact: 'Rock beneath Earth’s surface is called magma. Once it erupts, it is called lava.', ambientId: 'volcano', mark: '🌋', hint: 'Follow the warm, winding clue near the rocky ground.' },
  river: { fact: 'A river is flowing water that can wear a path through the land.', ambientId: 'river', mark: '💧', hint: 'Look where the water path bends through the scene.' },
  moonlight: { fact: 'Moonlight is sunlight reflected from the Moon.', ambientId: 'moonlight', mark: '🌙', hint: 'Search under the quiet night sky.' },
  desert: { fact: 'Deserts get very little rain. Some deserts are cold, not hot.', ambientId: 'desert', mark: '☀️', hint: 'Look near the shapes made by wind and sand.' },
  rainbow: { fact: 'Raindrops bend and reflect sunlight, spreading it into rainbow colours.', ambientId: 'rainbow', mark: '🌈', hint: 'Look along the bright colours in the sky.' },
  swamp: { fact: 'A wetland is land saturated with water, though it may not stay wet all year.', ambientId: 'swamp', mark: '🪷', hint: 'Look near the shallow water and reeds.' },
  snow: { fact: 'Snowflakes are groups of ice crystals that grow inside cold clouds.', ambientId: 'snow', mark: '❄️', hint: 'Search around the snowy tracks.' },
  cave: { fact: 'Water can slowly dissolve limestone and help form caves.', ambientId: 'cave', mark: '💎', hint: 'Follow the glimmer beside the cave wall.' },
  'fern-forest': { fact: 'A new fern frond often uncurls from a tight spiral.', ambientId: 'fern', mark: '🍃', hint: 'Search between the tall fern fronds.' },
  'claw-cliffs': { fact: 'Fossil footprints are clues that show where an animal walked.', ambientId: 'cliffs', mark: '👣', hint: 'Follow the footprints near the rocky ledge.' },
  'ancient-shores': { fact: 'Plesiosaurs were marine reptiles, not dinosaurs.', ambientId: 'shore', mark: '🐚', hint: 'Look close to the ancient shoreline.' },
};

const TARGET_FACTS = {
  trex: 'T. rex had short arms and powerful jaws.',
  spino: 'Spinosaurus had a tall sail on its back. Scientists still study what it was for.',
  para: 'Parasaurolophus had a long hollow head crest. It may have helped make sounds.',
  brachio: 'Brachiosaurus had front legs longer than its back legs.',
  stego: 'Stegosaurus had bony plates along its back. Their exact purpose is still being studied.',
  dillo: 'Dilophosaurus had two bony crests on its head.',
  ankyl: 'Ankylosaurus had bony armor and a heavy club at the end of its tail.',
  trike: 'Triceratops had three horns and a large bony frill.',
  raptor: 'Velociraptor had a curved claw on each foot.',
  allo: 'Allosaurus was a meat-eating dinosaur with small horns above its eyes.',
  carno: 'Carnotaurus had two horns on top of its head and very small arms.',
  cory: 'Corythosaurus was a duck-billed dinosaur with a helmet-shaped head crest.',
};
const NON_DINOSAUR_SPECIES = new Set(['ptero', 'elasmo', 'mosa']);

export const DINO_DETECTIVE_BANDS = freeze([
  freeze({ id: 'starter', name: 'Starter', firstWorld: 0, lastWorld: 3, clueStyle: 'bright-footprints' }),
  freeze({ id: 'growing', name: 'Growing', firstWorld: 4, lastWorld: 7, clueStyle: 'turning-trail' }),
  freeze({ id: 'challenge', name: 'Challenge', firstWorld: 8, lastWorld: 11, clueStyle: 'faint-trail' }),
]);

const assignedSpecies = new Set();
export const DINO_DETECTIVE_WORLDS = freeze(DINO_LEVELS.map((world, index) => {
  const bandIndex = Math.floor(index / 4);
  const featured = world.dinos.find(({ species }) => !assignedSpecies.has(species) && !NON_DINOSAUR_SPECIES.has(species))
    || DINO_LEVELS.flatMap(({ dinos }) => dinos).find(({ species }) => !assignedSpecies.has(species) && !NON_DINOSAUR_SPECIES.has(species));
  if (!featured) throw new Error(`No unique dinosaur remains for ${world.id}`);
  assignedSpecies.add(featured.species);
  const species = DINO_SPECIES[featured.species];
  const details = WORLD_FACTS[world.id];
  return freeze({
    id: world.id,
    index,
    bandId: DINO_DETECTIVE_BANDS[bandIndex].id,
    bandIndex,
    name: world.name,
    targetSpecies: featured.species,
    targetName: species.name,
    targetFact: TARGET_FACTS[featured.species] || species.fact,
    sceneFact: details.fact,
    ambientId: details.ambientId,
    stickerId: `dino-world-${world.id}`,
    stickerName: `${world.name} Finder`,
    mark: details.mark,
    hint: details.hint,
  });
}));

export const DINO_WORLD_STICKERS = freeze(DINO_DETECTIVE_WORLDS.map((world) => freeze({
  id: world.stickerId, worldId: world.id, name: world.stickerName, mark: world.mark,
})));

export const DINO_DETECTIVE_NARRATION = freeze({
  instruction: 'Find the featured creature. Open a numbered cover to look underneath.',
  wrong: 'Not this cover. Try another spot, or choose Show a clue.',
  found: 'You found the creature. Read its fact and the world fact, then choose Next.',
  complete: 'You finished all five search rounds and earned this world sticker.',
  clueDirections: freeze(['upper left', 'upper middle', 'upper right', 'lower left', 'lower right']),
  worldLines: freeze(DINO_DETECTIVE_WORLDS.flatMap((world) => [world.hint, world.targetFact, world.sceneFact])),
});

const makeRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const permutationAt = (rank) => {
  const available = [0, 1, 2, 3, 4];
  const factorials = [24, 6, 2, 1, 1];
  const order = [];
  let remainder = rank;
  factorials.forEach((factorial) => {
    const index = Math.floor(remainder / factorial);
    remainder %= factorial;
    order.push(available.splice(index, 1)[0]);
  });
  return order;
};

export const DINO_SEARCH_SPOTS = freeze([
  freeze({ id: 'fern-left', label: 'left fern', x: 20, y: 23 }),
  freeze({ id: 'stone-center', label: 'middle stones', x: 50, y: 23 }),
  freeze({ id: 'water-right', label: 'right water reeds', x: 80, y: 23 }),
  freeze({ id: 'fern-low-left', label: 'lower left clearing', x: 35, y: 76 }),
  freeze({ id: 'stone-low-right', label: 'lower right rocks', x: 65, y: 76 }),
]);

export const dinoSearchTargetsAreSafe = (spots = DINO_SEARCH_SPOTS, width = 330, height = 340, targetSize = 64) => {
  if (!Array.isArray(spots) || spots.length !== 5) return false;
  const centers = spots.map(({ x, y }) => ({ x: (x / 100) * width, y: (y / 100) * height }));
  const half = targetSize / 2;
  return centers.every(({ x, y }) => x >= half && x <= width - half && y >= half && y <= height - half)
    && centers.every((center, index) => centers.slice(index + 1).every((other) => (
      Math.abs(center.x - other.x) >= targetSize || Math.abs(center.y - other.y) >= targetSize
    )));
};

export const createDinoDetectiveRun = (worldIndex, requestedSeed, recentSignatures = []) => {
  const world = DINO_DETECTIVE_WORLDS[worldIndex];
  if (!world || !Number.isSafeInteger(requestedSeed) || requestedSeed < 0 || !dinoSearchTargetsAreSafe()) return null;
  const seed = requestedSeed || 1;
  const initialRank = Math.floor(makeRandom(seed)() * 120);
  const recent = new Set(recentSignatures);
  let layoutRank = initialRank;
  let targets;
  for (let offset = 0; offset < 120; offset += 1) {
    layoutRank = (initialRank + offset) % 120;
    targets = permutationAt(layoutRank).map((index) => DINO_SEARCH_SPOTS[index].id);
    if (!recent.has(targets.join('|'))) break;
  }
  const rounds = targets.map((spotId, index) => {
    const direction = DINO_SEARCH_SPOTS.findIndex(({ id }) => id === spotId);
    return freeze({
      id: `${world.id}:round-${index + 1}`,
      number: index + 1,
      targetSpotId: spotId,
      clueDirection: DINO_DETECTIVE_NARRATION.clueDirections[direction],
      hintText: `Look in the ${DINO_DETECTIVE_NARRATION.clueDirections[direction]} spot.`,
    });
  });
  return freeze({ worldId: world.id, worldIndex, seed, layoutRank, signature: targets.join('|'), rounds: freeze(rounds) });
};

export const createDinoRunSeed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const words = new Uint32Array(1);
    globalThis.crypto.getRandomValues(words);
    return words[0] || 1;
  }
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
};
