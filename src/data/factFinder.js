import { DINO_DETECTIVE_WORLDS } from './dinoDetectiveBatch3.js';
import { PLANETS } from './index.js';
import { getOfflineVoiceClip } from './offlineVoice.js';

const ART = Object.freeze({
  ant: new URL('../assets/memory-match/garden-ant-v1-card.webp', import.meta.url).href,
  bee: new URL('../assets/memory-match/garden-bee-v1-card.webp', import.meta.url).href,
  butterfly: new URL('../assets/memory-match/garden-butterfly-v1-card.webp', import.meta.url).href,
  ladybird: new URL('../assets/memory-match/garden-ladybird-v1-card.webp', import.meta.url).href,
  frog: new URL('../assets/memory-match/isolated-frog-v1-card.webp', import.meta.url).href,
  monkey: new URL('../assets/memory-match/isolated-monkey-v1-card.webp', import.meta.url).href,
  dolphin: new URL('../assets/memory-match/dolphin-v1-card.webp', import.meta.url).href,
  jellyfish: new URL('../assets/memory-match/jellyfish-v1-card.webp', import.meta.url).href,
  turtle: new URL('../assets/memory-match/turtle-v1-card.webp', import.meta.url).href,
  whale: new URL('../assets/memory-match/whale-v1-card.webp', import.meta.url).href,
  shark: new URL('../assets/memory-match/shark-v1-card.webp', import.meta.url).href,
  spider: new URL('../assets/memory-match/garden-spider-v1-card.webp', import.meta.url).href,
  snail: new URL('../assets/memory-match/garden-snail-v1-card.webp', import.meta.url).href,
  earthworm: '/art/fact-finder-v1/earthworm.webp',
  duck: new URL('../assets/memory-match/duck-v1-card.webp', import.meta.url).href,
  fox: new URL('../assets/memory-match/fox-v1.webp', import.meta.url).href,
  tulip: new URL('../assets/memory-match/tulip-v1-card.webp', import.meta.url).href,
  leaf: new URL('../assets/memory-match/leaf-sprig-v1-card.webp', import.meta.url).href,
  seedling: new URL('../assets/memory-match/seedling-v1-card.webp', import.meta.url).href,
  tree: new URL('../assets/memory-match/tree-v1-card.webp', import.meta.url).href,
});
const source = (title, url, publisher) => Object.freeze({ title, url, publisher });
const image = (path, alt, caption = 'Playful illustration; details are simplified.') => Object.freeze({ src: path, alt, caption });
const fact = (value) => Object.freeze({ text: value });
const entry = ({ id, name, category, aliases = [], facts, image: illustration, source: citation, exploreGameId, exploreLabel, exploreModule, artKind = null }) => Object.freeze({
  id, name, category, aliases: Object.freeze(aliases), facts: Object.freeze(facts.map(fact)), image: illustration,
  source: citation, exploreGameId, exploreLabel, exploreModule, artKind,
});

const ANIMAL_SOURCES = {
  zooArthropods: source('Ant', 'https://animals.sandiegozoo.org/animals/ant', 'San Diego Zoo Wildlife Alliance'),
  bee: source('Bee', 'https://animals.sandiegozoo.org/animals/bee', 'San Diego Zoo Wildlife Alliance'),
  butterfly: source('Butterfly, Moth, and Skipper', 'https://animals.sandiegozoo.org/animals/butterfly-moth-and-skipper', 'San Diego Zoo Wildlife Alliance'),
  ladybug: source('Ladybug', 'https://animals.sandiegozoo.org/animals/ladybug', 'San Diego Zoo Wildlife Alliance'),
  frog: source('Frog and Toad', 'https://animals.sandiegozoo.org/animals/frog-and-toad', 'San Diego Zoo Wildlife Alliance'),
  monkey: source('Monkey', 'https://animals.sandiegozoo.org/animals/monkey', 'San Diego Zoo Wildlife Alliance'),
  dolphin: source('Are dolphins fish?', 'https://oceanservice.noaa.gov/facts/dolphin.html', 'NOAA Ocean Service'),
  jellyfish: source('What are jellyfish made of?', 'https://oceanservice.noaa.gov/facts/jellyfish.html', 'NOAA Ocean Service'),
  turtle: source('Turtle and Tortoise', 'https://animals.sandiegozoo.org/animals/turtle-and-tortoise', 'San Diego Zoo Wildlife Alliance'),
  whale: source('Whale', 'https://animals.sandiegozoo.org/animals/whale', 'San Diego Zoo Wildlife Alliance'),
  fish: source('Fish', 'https://animals.sandiegozoo.org/animals/fish', 'San Diego Zoo Wildlife Alliance'),
  spider: source('Spider', 'https://animals.sandiegozoo.org/animals/spider', 'San Diego Zoo Wildlife Alliance'),
  snail: source('Slugs and snails', 'https://www.rhs.org.uk/biodiversity/slugs-and-snails', 'Royal Horticultural Society'),
  worm: source('Earthworms', 'https://www.rhs.org.uk/biodiversity/earthworms', 'Royal Horticultural Society'),
  birds: source('Birds', 'https://animals.sandiegozoo.org/animals/birds', 'San Diego Zoo Wildlife Alliance'),
  fox: source('Red Fox Biology', 'https://home.nps.gov/fiis/learn/nature/red-fox.htm', 'National Park Service'),
};

export const FACT_FINDER_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'all', label: 'Everything' }),
  Object.freeze({ id: 'animals', label: 'Animals' }),
  Object.freeze({ id: 'dinosaurs', label: 'Dinosaurs' }),
  Object.freeze({ id: 'space', label: 'Space' }),
  Object.freeze({ id: 'nature', label: 'Nature' }),
]);

const animalEntries = [
  entry({ id: 'ant', name: 'Ant', category: 'animals', aliases: ['ants', 'insect'], facts: ['An ant is a small insect with six legs and a hard outer skeleton. Ants use scent trails to guide nest-mates to food.'], image: image(ART.ant, 'An illustrated ant on a garden path.'), source: ANIMAL_SOURCES.zooArthropods, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'bee', name: 'Bee', category: 'animals', aliases: ['bees', 'pollinator'], facts: ['A bee is a flower-visiting insect that gathers nectar and pollen. Many native bees pollinate wild plants and food crops.'], image: image(ART.bee, 'An illustrated bee visiting a flower.'), source: ANIMAL_SOURCES.bee, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'butterfly', name: 'Butterfly', category: 'animals', aliases: ['butterflies', 'caterpillar', 'insect'], facts: ['A butterfly is an insect that grows from a caterpillar. It can taste with sensors on its feet.'], image: image(ART.butterfly, 'An illustrated butterfly resting on a leaf.'), source: ANIMAL_SOURCES.butterfly, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'ladybird', name: 'Ladybird', category: 'animals', aliases: ['ladybug', 'lady beetle', 'insect'], facts: ['A ladybird is a small beetle, often with a rounded body and spotted wing covers. Its hard outer wings open to let delicate flying wings unfold.'], image: image(ART.ladybird, 'An illustrated red ladybird with black spots.'), source: ANIMAL_SOURCES.ladybug, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'frog', name: 'Frog', category: 'animals', aliases: ['frogs', 'amphibian'], facts: ['A frog is an amphibian that may live in water, on land, or in trees. Many frogs use long legs to hop, and toe pads help some climb.'], image: image(ART.frog, 'An illustrated green frog.'), source: ANIMAL_SOURCES.frog, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'monkey', name: 'Monkey', category: 'animals', aliases: ['monkeys', 'primate'], facts: ['A monkey is a primate, and many kinds spend much of their time in trees. Some monkeys have gripping tails that can hold a branch or even pick up a peanut.'], image: image(ART.monkey, 'An illustrated monkey sitting on a branch.'), source: ANIMAL_SOURCES.monkey, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'dolphin', name: 'Dolphin', category: 'animals', aliases: ['dolphins', 'marine mammal'], facts: ['A dolphin is a sea mammal, not a fish. It breathes air with lungs through a blowhole on top of its head.'], image: image(ART.dolphin, 'An illustrated dolphin swimming underwater.'), source: ANIMAL_SOURCES.dolphin, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'jellyfish', name: 'Jellyfish', category: 'animals', aliases: ['jellies', 'ocean'], facts: ['A jellyfish is a soft-bodied sea animal with a simple nerve net. Its body is about 95% water.'], image: image(ART.jellyfish, 'An illustrated jellyfish drifting in the sea.'), source: ANIMAL_SOURCES.jellyfish, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'sea-turtle', name: 'Sea turtle', category: 'animals', aliases: ['turtles', 'ocean reptile'], facts: ['A sea turtle is a reptile adapted for life in the ocean. Its long flippers and streamlined body help it swim.'], image: image(ART.turtle, 'An illustrated sea turtle swimming.'), source: ANIMAL_SOURCES.turtle, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'blue-whale', name: 'Blue whale', category: 'animals', aliases: ['whale', 'ocean mammal'], facts: ['The blue whale is a huge sea mammal and the largest animal known to have lived on Earth. It uses baleen to strain tiny sea creatures from water.'], image: image(ART.whale, 'An illustrated blue whale swimming.'), source: ANIMAL_SOURCES.whale, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'shark', name: 'Shark', category: 'animals', aliases: ['sharks', 'fish', 'cartilage'], facts: ['A shark is a fish with gills and fins. Its skeleton is made of flexible cartilage, the same bendy material found in your nose and ears.'], image: image(ART.shark, 'An illustrated shark swimming.'), source: ANIMAL_SOURCES.fish, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'spider', name: 'Spider', category: 'animals', aliases: ['spiders', 'arachnid', 'web'], facts: ['A spider is an arachnid, not an insect. It has eight legs, while insects have six.'], image: image(ART.spider, 'An illustrated garden spider on its web.'), source: ANIMAL_SOURCES.spider, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'snail', name: 'Garden snail', category: 'animals', aliases: ['snail', 'snails', 'mollusc'], facts: ['A garden snail is a soft-bodied mollusc with a coiled shell. It helps recycle dead leaves and other rotting material.'], image: image(ART.snail, 'An illustrated garden snail with a shell.'), source: ANIMAL_SOURCES.snail, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'earthworm', name: 'Earthworm', category: 'animals', aliases: ['worm', 'worms', 'soil'], facts: ['An earthworm is a segmented worm that lives in soil. It eats decaying plant material, helping make healthy garden soil.'], image: image(ART.earthworm, 'An accurately illustrated segmented earthworm on soil beside a fallen leaf.'), source: ANIMAL_SOURCES.worm, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'duck', name: 'Duck', category: 'animals', aliases: ['ducks', 'bird'], facts: ['A duck is a bird with feathers and wings. Birds are the only animals with feathers, and they lay eggs.'], image: image(ART.duck, 'An illustrated duck swimming.'), source: ANIMAL_SOURCES.birds, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'fox', name: 'Red fox', category: 'animals', aliases: ['fox', 'foxes', 'kit', 'pup'], facts: ['A red fox is a medium-sized mammal with a reddish-orange coat. Its young are called kits.'], image: image(ART.fox, 'A playful reddish-orange red fox illustration.'), source: ANIMAL_SOURCES.fox, exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
];

const dinoSource = (slug, title) => source(title, `https://www.nhm.ac.uk/discover/dino-directory/${slug}.html`, 'Natural History Museum, London');
const dinoWorld = (species) => DINO_DETECTIVE_WORLDS.find((world) => world.targetSpecies === species);
const dinosaurEntries = [
  { id: 'trex', name: 'Tyrannosaurus rex', alias: 'T. rex', species: 'trex', source: source('Tyrannosaurus', 'https://www.nhm.ac.uk/discover/dino-directory/tyrannosaurus.html', 'Natural History Museum, London') },
  { id: 'brachiosaurus', name: 'Brachiosaurus', alias: 'long-neck dinosaur', species: 'brachio', source: dinoSource('Brachiosaurus', 'Brachiosaurus') },
  { id: 'triceratops', name: 'Triceratops', alias: 'three-horned dinosaur', species: 'trike', source: dinoSource('triceratops', 'Triceratops') },
  { id: 'stegosaurus', name: 'Stegosaurus', alias: 'plated dinosaur', species: 'stego', source: dinoSource('Stegosaurus', 'Stegosaurus') },
  { id: 'ankylosaurus', name: 'Ankylosaurus', alias: 'armoured dinosaur', species: 'ankyl', source: dinoSource('Ankylosaurus', 'Ankylosaurus') },
].map(({ id, name, alias, species, source: citation }) => {
  const world = dinoWorld(species);
  const portrait = `/art/shadow-match-v1/${({ trex: 'trex', brachiosaurus: 'bronto', triceratops: 'trike', stegosaurus: 'stego', ankylosaurus: 'ankylo' })[id]}.webp`;
  const introductions = {
    trex: 'Tyrannosaurus rex was a meat-eating dinosaur that lived near the end of the Cretaceous Period.',
    brachiosaurus: 'Brachiosaurus was a tall plant-eating sauropod from the Jurassic Period.',
    triceratops: 'Triceratops was a four-legged plant-eating dinosaur from the Late Cretaceous.',
    stegosaurus: 'Stegosaurus was a large, slow-moving plant-eating dinosaur from the Late Jurassic.',
    ankylosaurus: 'Ankylosaurus was a four-legged, armoured plant-eating dinosaur from the Late Cretaceous.',
  };
  return entry({ id: `dino-${id}`, name, category: 'dinosaurs', aliases: [alias], facts: [introductions[id], world.targetFact], image: image(portrait, `A playful illustrated ${name}.`, 'Playful dinosaur illustration; not a fossil reconstruction.'), source: citation, exploreGameId: 'dino', exploreLabel: 'Dino Detective' });
});

const planetSources = {
  Mercury: 'https://science.nasa.gov/mercury/', Venus: 'https://science.nasa.gov/venus/', Earth: 'https://science.nasa.gov/earth/',
  Mars: 'https://science.nasa.gov/mars/', Jupiter: 'https://science.nasa.gov/jupiter/', Saturn: 'https://science.nasa.gov/saturn/',
  Uranus: 'https://science.nasa.gov/uranus/', Neptune: 'https://science.nasa.gov/neptune/', Pluto: 'https://science.nasa.gov/dwarf-planets/pluto/',
};
const SPACE_FACT_INDEXES = Object.freeze({
  Mercury: [0, 1], Venus: [0, 1], Earth: [2, 3], Mars: [3, 4], Jupiter: [0, 2],
  Saturn: [0, 3], Uranus: [0, 4], Neptune: [0, 3], Pluto: [1, 3],
});
const spaceEntries = PLANETS.map((planet) => entry({
  id: `space-${planet.name.toLowerCase()}`, name: planet.name, category: 'space', aliases: [planet.name === 'Pluto' ? 'dwarf planet' : 'planet'],
  facts: SPACE_FACT_INDEXES[planet.name].map((factIndex) => planet.facts[factIndex]),
  image: image(`/models/solar-v1/${planet.name.toLowerCase()}.png`, `${planet.name}, shown as a computer-made planet model.`, 'Simplified computer-made illustration; planet sizes and colours are not to scale.'),
  source: source(`${planet.name} overview`, planetSources[planet.name], 'NASA Science'), exploreGameId: 'solar', exploreLabel: 'Solar System Explorer',
}));

const natureEntries = [
  entry({ id: 'tulip', name: 'Tulip', category: 'nature', aliases: ['bulb', 'spring flower', 'plants'], facts: ['A tulip is a spring-flowering plant that grows from a bulb. Its cup-shaped flowers come in many colours and forms.'], image: image(ART.tulip, 'An illustrated tulip flower.'), source: source('How to grow tulips', 'https://www.rhs.org.uk/plants/tulip/growing-guide', 'Royal Horticultural Society'), exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'seedling', name: 'Seedling', category: 'nature', aliases: ['seed', 'germination', 'plant'], facts: ['A seedling is a young plant that has just started to grow. Its first root anchors it in the soil, while its first shoot grows towards the light.'], image: image(ART.seedling, 'A young green seedling sprouting from soil.'), source: source('How plants reproduce', 'https://www.rhs.org.uk/advice/understanding-plants/how-plants-reproduce', 'Royal Horticultural Society'), exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'leaf', name: 'Leaf', category: 'nature', aliases: ['leaves', 'photosynthesis', 'plant'], facts: ['A leaf is a plant part that catches sunlight. Its green chlorophyll helps the plant use sunlight to make sugar for growth.'], image: image(ART.leaf, 'An illustrated leafy sprig.'), source: source('What can you spot on your tree?', 'https://www.kew.org/read-and-watch/what-can-you-spot-on-your-tree', 'Royal Botanic Gardens, Kew'), exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
  entry({ id: 'tree', name: 'Tree', category: 'nature', aliases: ['trees', 'roots', 'bark', 'chlorophyll'], facts: ['A tree has roots, a trunk, branches and leaves. Its roots anchor it and absorb water and nutrients from the soil.'], image: image(ART.tree, 'An illustrated leafy green tree.'), source: source('What can you spot on your tree?', 'https://www.kew.org/read-and-watch/what-can-you-spot-on-your-tree', 'Royal Botanic Gardens, Kew'), exploreGameId: 'worldmap', exploreLabel: 'Nature Lab', exploreModule: 'nature-lab' }),
];

export const FACT_FINDER_ENTRIES = Object.freeze([...animalEntries, ...dinosaurEntries, ...spaceEntries, ...natureEntries]);
const SEARCH_TEXT = new Map(FACT_FINDER_ENTRIES.map((item) => [item.id, [item.name, ...item.aliases, ...item.facts.map(({ text }) => text)].join(' ')]));
export const normalizeFactFinderQuery = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
export const filterFactFinderEntries = ({ query = '', category = 'all' } = {}) => {
  const normalizedQuery = normalizeFactFinderQuery(query);
  return FACT_FINDER_ENTRIES.filter((item) => (category === 'all' || item.category === category)
    && (!normalizedQuery || normalizeFactFinderQuery(SEARCH_TEXT.get(item.id)).includes(normalizedQuery)));
};
export const getFactFinderEntry = (id) => FACT_FINDER_ENTRIES.find((item) => item.id === id) || null;
export const getFactFinderAudio = (entryValue, text = null) => {
  if (!entryValue) return null;
  const candidates = [...new Set(text ? [text, entryValue.name] : [...entryValue.facts.map(({ text: line }) => line), entryValue.name])];
  for (const candidate of candidates) {
    const clip = getOfflineVoiceClip(candidate, 'en-US');
    if (clip) return Object.freeze({ text: candidate, src: clip });
  }
  return null;
};
