// Picture clues use anatomy that children can look for on the illustration.
const creature = (id, name, feature, art = {}) => ({ id, name, feature, ...art });

export const DISCOVERY_HABITATS = [
  {
    id: 'land', name: 'Land', icon: '🌿', group: 'Dinosaurs',
    creatures: [
      creature('trex', 'T-Rex', 'Look at those tiny arms!', { shadow: 'trex', food: 'meat', spokenName: 'T. rex' }),
      creature('trike', 'Triceratops', 'Can you see three horns?', { shadow: 'trike', food: 'plants' }),
      creature('spino', 'Spinosaurus', 'That tall sail sticks up from my back!', { shadow: 'spino', food: 'fish' }),
      creature('stego', 'Stegosaurus', 'Big plates run along my back.', { shadow: 'stego' }),
      creature('brachio', 'Brachiosaurus', 'My long neck helped me reach leaves high up.', { shadow: 'bronto' }),
      creature('ankyl', 'Ankylosaurus', 'I had a heavy club on the end of my tail.', { shadow: 'ankylo' }),
      creature('para', 'Parasaurolophus', 'See the long crest curving back from my head?', { shadow: 'para' }),
      creature('raptor', 'Velociraptor', 'I had a big curved claw on each foot.'),
      creature('allo', 'Allosaurus', 'I walked on two strong back legs.', { shadow: 'allo' }),
      creature('dillo', 'Dilophosaurus', 'I had two crests on top of my head.', { shadow: 'dillo' }),
      creature('carno', 'Carnotaurus', 'Look at the two horns above my eyes.', { shadow: 'carno' }),
      creature('cory', 'Corythosaurus', 'My round crest looks a bit like a helmet.', { shadow: 'cory' }),
      creature('pachy', 'Pachycephalosaurus', 'The top of my head was thick and rounded.'),
      creature('iguano', 'Iguanodon', 'Look for the big spike on my thumb.'),
      creature('galli', 'Gallimimus', 'I had long legs for running.'),
      creature('compy', 'Compsognathus', 'I was small with a long tail.'),
      creature('theri', 'Therizinosaurus', 'My front claws were very long.'),
      creature('sauro', 'Sauropelta', 'I had bony armour on my body.'),
      creature('ovira', 'Oviraptor', 'I had a beak with no teeth.'),
    ],
  },
  {
    id: 'sea', name: 'Sea', icon: '🌊', group: 'Marine reptiles',
    creatures: [
      creature('elasmo', 'Elasmosaurus', 'My very long neck reached out in front of my flippers.', { food: 'fish' }),
      creature('mosa', 'Mosasaurus', 'My strong tail helped me swim.'),
      creature('ichthyosaurus', 'Ichthyosaurus', 'Wave hello to my flippers! I lived in the sea.', { image: '/art/dinosaur-discovery-v1/ichthyosaurus.webp' }),
    ],
  },
  {
    id: 'sky', name: 'Sky', icon: '☁️', group: 'Flying reptiles',
    creatures: [
      creature('ptero', 'Pterodactylus', 'My wings were made of skin stretched out like a kite.', { shadow: 'ptero' }),
      creature('pteranodon', 'Pteranodon', 'Spot the long crest behind my head and my pointed beak.', { image: '/art/dinosaur-discovery-v1/pteranodon.webp' }),
    ],
  },
];

export const DISCOVERY_CREATURES = DISCOVERY_HABITATS.flatMap(({ creatures }) => creatures);
const knownIds = new Set(DISCOVERY_CREATURES.map(({ id }) => id));
const storageKey = playerId => `${playerId}_dinosaur_discovery_v1`;

export function readDiscoveryStickers(storage, playerId) {
  const saved = JSON.parse(storage.getItem(storageKey(playerId)) ?? '[]');
  if (!Array.isArray(saved) || saved.some(id => typeof id !== 'string')) {
    throw new Error('Unreadable dinosaur sticker album');
  }
  return saved;
}

export function collectDiscoverySticker(storage, playerId, id) {
  if (!knownIds.has(id)) throw new Error('Unknown creature');
  const stickers = readDiscoveryStickers(storage, playerId);
  if (stickers.includes(id)) return stickers;
  const next = [...stickers, id];
  storage.setItem(storageKey(playerId), JSON.stringify(next));
  return next;
}
