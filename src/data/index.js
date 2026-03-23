// Game data constants

export const THEME = {
  bg: 'bg-gradient-to-b from-sky-100 via-blue-100 to-blue-200',
  card: 'bg-orange-50',
  primary: 'bg-blue-500',
  secondary: 'bg-orange-400',
  accent: 'bg-green-400',
  text: 'text-slate-700',
  font: 'font-sans',
  button:
    'shadow-[0_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all rounded-3xl',
};

export const GERMAN_PRAISE = ['Super!', 'Gut gemacht!', 'Sehr gut!', 'Toll gemacht!', 'Fantastisch!', 'Klasse!'];

export const BURST_EMOJIS = ['✨', '⭐️', '🎆', '🎇', '🌟'];

export const PLANETS = [
  {
    name: 'Mercury',
    surface: '#9ca3af',
    size: 70,
    subtitle: 'The speedy little planet',
    facts: [
      'Smallest planet in our solar system.',
      'Closest to the Sun and very speedy.',
      'A day there is longer than a year!',
      'No air to breathe, so it is quiet.',
    ],
    stats: [
      { label: 'Order', value: '1st from Sun', emoji: '☀️' },
      { label: 'Day', value: '59 Earth days', emoji: '🕒' },
      { label: 'Year', value: '88 Earth days', emoji: '🗓️' },
      { label: 'Moons', value: '0', emoji: '🌙' },
    ],
  },
  {
    name: 'Venus',
    surface: '#f59e0b',
    size: 76,
    subtitle: 'The hottest planet',
    facts: [
      'Hottest planet in the whole solar system.',
      'Spins backwards compared to most planets.',
      'Thick clouds trap heat like a blanket.',
      'Looks like a bright evening star.',
    ],
    stats: [
      { label: 'Order', value: '2nd from Sun', emoji: '☀️' },
      { label: 'Day', value: '243 Earth days', emoji: '🕒' },
      { label: 'Year', value: '225 Earth days', emoji: '🗓️' },
      { label: 'Moons', value: '0', emoji: '🌙' },
    ],
  },
  {
    name: 'Earth',
    surface: '#3b82f6',
    size: 82,
    subtitle: 'Our bright blue home',
    facts: [
      'Home to plants, animals, and you!',
      'Lots of water makes it look blue.',
      'Only planet we know with life.',
      'One big Moon lights up our night sky.',
    ],
    stats: [
      { label: 'Order', value: '3rd from Sun', emoji: '☀️' },
      { label: 'Day', value: '24 hours', emoji: '🕒' },
      { label: 'Year', value: '365 days', emoji: '🗓️' },
      { label: 'Moons', value: '1', emoji: '🌙' },
    ],
  },
  {
    name: 'Mars',
    surface: '#ef4444',
    size: 74,
    subtitle: 'The red explorer',
    facts: [
      'Dusty and rocky with huge volcanoes.',
      'Robots explore Mars for us!',
      'Home to the biggest volcano: Olympus Mons.',
      'Looks red because of rusty dust.',
    ],
    stats: [
      { label: 'Order', value: '4th from Sun', emoji: '☀️' },
      { label: 'Day', value: '24.6 hours', emoji: '🕒' },
      { label: 'Year', value: '687 days', emoji: '🗓️' },
      { label: 'Moons', value: '2', emoji: '🌙' },
    ],
  },
  {
    name: 'Jupiter',
    surface: '#fb923c',
    size: 110,
    subtitle: 'The giant gas planet',
    facts: [
      'Largest planet in our solar system.',
      'Bigger than all the other planets combined.',
      'Has a giant storm called the Great Red Spot.',
      'Made of gas, so there is no solid ground.',
    ],
    stats: [
      { label: 'Order', value: '5th from Sun', emoji: '☀️' },
      { label: 'Day', value: '10 hours', emoji: '🕒' },
      { label: 'Year', value: '12 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '95', emoji: '🌙' },
    ],
  },
  {
    name: 'Saturn',
    surface: '#fde68a',
    ring: true,
    ringColor: '#fef3c7',
    size: 100,
    subtitle: 'The ringed planet',
    facts: [
      'Rings are made of ice and rock chunks.',
      'Has lots of moons to discover.',
      'Could float in water because it is light.',
      'Spins so fast it looks squished.',
    ],
    stats: [
      { label: 'Order', value: '6th from Sun', emoji: '☀️' },
      { label: 'Day', value: '10.7 hours', emoji: '🕒' },
      { label: 'Year', value: '29 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '145', emoji: '🌙' },
    ],
  },
  {
    name: 'Uranus',
    surface: '#7dd3fc',
    size: 84,
    subtitle: 'The sideways spinner',
    facts: [
      'Spins on its side like a rolling ball.',
      'Pale blue-green color from methane gas.',
      'Very cold and far from the Sun.',
      'Has faint rings around it.',
    ],
    stats: [
      { label: 'Order', value: '7th from Sun', emoji: '☀️' },
      { label: 'Day', value: '17 hours', emoji: '🕒' },
      { label: 'Year', value: '84 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '27', emoji: '🌙' },
    ],
  },
  {
    name: 'Neptune',
    surface: '#2563eb',
    size: 84,
    subtitle: 'The windy blue world',
    facts: [
      'Farthest planet from the Sun.',
      'Super windy with giant storms.',
      'Deep blue color is very special.',
      'A year there is very, very long.',
    ],
    stats: [
      { label: 'Order', value: '8th from Sun', emoji: '☀️' },
      { label: 'Day', value: '16 hours', emoji: '🕒' },
      { label: 'Year', value: '165 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '14', emoji: '🌙' },
    ],
  },
  {
    name: 'Pluto',
    surface: '#cbd5f5',
    size: 60,
    subtitle: 'The tiny icy dwarf planet',
    facts: [
      'Small, icy world far from the Sun.',
      'Used to be called the 9th planet.',
      'Has a heart-shaped ice spot.',
      'Takes 248 years to go around the Sun.',
    ],
    stats: [
      { label: 'Type', value: 'Dwarf planet', emoji: '❄️' },
      { label: 'Day', value: '6.4 Earth days', emoji: '🕒' },
      { label: 'Year', value: '248 Earth years', emoji: '🗓️' },
      { label: 'Moons', value: '5', emoji: '🌙' },
    ],
  },
];

export const DINO_SPECIES = {
  trex: {
    name: 'T-Rex',
    emoji: '🦖',
    fact: 'Tiny arms but a huge bite! ROAR!',
  },
  brachio: {
    name: 'Brachiosaurus',
    emoji: '🦕',
    fact: 'Looks like a giraffe dinosaur with a long neck!',
  },
  trike: {
    name: 'Triceratops',
    emoji: '🦕',
    fact: 'Three horns help protect my nose.',
  },
  stego: {
    name: 'Stegosaurus',
    emoji: '🦕',
    fact: 'Back plates work like solar panels.',
  },
  raptor: {
    name: 'Velociraptor',
    emoji: '🦖',
    fact: 'Fast runner with super sharp claws.',
  },
  ankyl: {
    name: 'Ankylosaurus',
    emoji: '🦖',
    fact: 'Armored body and a club tail!',
  },
  para: {
    name: 'Parasaurolophus',
    emoji: '🦕',
    fact: 'Crest on my head makes sounds.',
  },
  spino: {
    name: 'Spinosaurus',
    emoji: '🦖',
    fact: 'Big sail on my back like a fin.',
  },
  ptero: {
    name: 'Pterodactyl',
    emoji: '🦖',
    fact: 'Flying reptile, not a dinosaur!',
  },
  dillo: {
    name: 'Dilophosaurus',
    emoji: '🦖',
    fact: 'Two crests on my head.',
  },
};

export const makeDino = (levelId, key, x, y) => ({
  id: `${levelId}-${key}-${x}-${y}`,
  ...DINO_SPECIES[key],
  x,
  y,
});

export const DINO_LEVELS = [
  {
    id: 'jungle',
    name: 'Jungle Jive',
    hint: 'Look behind the big leaves!',
    dinos: [
      makeDino('jungle', 'trex', 18, 42),
      makeDino('jungle', 'brachio', 8, 70),
      makeDino('jungle', 'trike', 45, 78),
      makeDino('jungle', 'stego', 68, 56),
      makeDino('jungle', 'ptero', 82, 26),
    ],
  },
  {
    id: 'volcano',
    name: 'Volcano Valley',
    hint: 'Check the steamy bushes!',
    dinos: [
      makeDino('volcano', 'spino', 20, 30),
      makeDino('volcano', 'ankyl', 60, 70),
      makeDino('volcano', 'raptor', 35, 60),
      makeDino('volcano', 'trike', 75, 40),
      makeDino('volcano', 'brachio', 10, 55),
    ],
  },
  {
    id: 'river',
    name: 'River Run',
    hint: 'Follow the splashy path!',
    dinos: [
      makeDino('river', 'para', 22, 68),
      makeDino('river', 'trex', 55, 30),
      makeDino('river', 'stego', 72, 60),
      makeDino('river', 'ptero', 80, 18),
      makeDino('river', 'dillo', 35, 40),
    ],
  },
  {
    id: 'moonlight',
    name: 'Moonlight Meadow',
    hint: 'Look for glowing eyes!',
    dinos: [
      makeDino('moonlight', 'brachio', 14, 64),
      makeDino('moonlight', 'raptor', 55, 65),
      makeDino('moonlight', 'ankyl', 75, 40),
      makeDino('moonlight', 'spino', 30, 28),
      makeDino('moonlight', 'trike', 45, 80),
    ],
  },
  {
    id: 'desert',
    name: 'Desert Dash',
    hint: 'Check the sandy dunes!',
    dinos: [
      makeDino('desert', 'stego', 18, 55),
      makeDino('desert', 'para', 60, 70),
      makeDino('desert', 'trex', 42, 32),
      makeDino('desert', 'ptero', 80, 20),
      makeDino('desert', 'ankyl', 68, 40),
    ],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Ridge',
    hint: 'Look for bright shapes!',
    dinos: [
      makeDino('rainbow', 'dillo', 20, 72),
      makeDino('rainbow', 'brachio', 8, 45),
      makeDino('rainbow', 'spino', 50, 25),
      makeDino('rainbow', 'raptor', 72, 62),
      makeDino('rainbow', 'trike', 40, 80),
    ],
  },
  {
    id: 'swamp',
    name: 'Misty Swamp',
    hint: 'Check the murky water!',
    dinos: [
      makeDino('swamp', 'spino', 15, 60),
      makeDino('swamp', 'para', 55, 35),
      makeDino('swamp', 'trex', 75, 70),
      makeDino('swamp', 'stego', 35, 75),
      makeDino('swamp', 'ptero', 80, 20),
      makeDino('swamp', 'ankyl', 25, 40),
    ],
  },
  {
    id: 'snow',
    name: 'Ice Age',
    hint: 'Look under the snowdrifts!',
    dinos: [
      makeDino('snow', 'brachio', 12, 50),
      makeDino('snow', 'trike', 45, 65),
      makeDino('snow', 'raptor', 70, 35),
      makeDino('snow', 'dillo', 30, 30),
      makeDino('snow', 'ankyl', 60, 80),
      makeDino('snow', 'spino', 85, 55),
    ],
  },
  {
    id: 'cave',
    name: 'Crystal Cave',
    hint: 'Search the glowing crystals!',
    dinos: [
      makeDino('cave', 'trex', 20, 45),
      makeDino('cave', 'para', 50, 70),
      makeDino('cave', 'stego', 75, 30),
      makeDino('cave', 'ptero', 40, 20),
      makeDino('cave', 'raptor', 65, 60),
      makeDino('cave', 'brachio', 10, 75),
      makeDino('cave', 'dillo', 85, 50),
    ],
  },
];

export const GERMAN_COLORS = [
  { name: 'Rot', color: 'red', hex: '#ef4444' },
  { name: 'Blau', color: 'blue', hex: '#3b82f6' },
  { name: 'Grün', color: 'green', hex: '#22c55e' },
  { name: 'Gelb', color: 'yellow', hex: '#eab308' },
  { name: 'Orange', color: 'orange', hex: '#fb923c' },
  { name: 'Lila', color: 'purple', hex: '#a855f7' },
  { name: 'Rosa', color: 'pink', hex: '#ec4899' },
  { name: 'Braun', color: 'brown', hex: '#a16207' },
  { name: 'Schwarz', color: 'black', hex: '#111827' },
  { name: 'Weiß', color: 'white', hex: '#f8fafc' },
];

export const GERMAN_NUMBERS = [
  { name: 'Eins', emoji: '1️⃣' },
  { name: 'Zwei', emoji: '2️⃣' },
  { name: 'Drei', emoji: '3️⃣' },
  { name: 'Vier', emoji: '4️⃣' },
  { name: 'Fünf', emoji: '5️⃣' },
  { name: 'Sechs', emoji: '6️⃣' },
  { name: 'Sieben', emoji: '7️⃣' },
  { name: 'Acht', emoji: '8️⃣' },
  { name: 'Neun', emoji: '9️⃣' },
  { name: 'Zehn', emoji: '🔟' },
];

export const GERMAN_ANIMALS = [
  { name: 'Hund', emoji: '🐶' },
  { name: 'Katze', emoji: '🐱' },
  { name: 'Vogel', emoji: '🐦' },
  { name: 'Fisch', emoji: '🐠' },
  { name: 'Löwe', emoji: '🦁' },
  { name: 'Pferd', emoji: '🐴' },
  { name: 'Kuh', emoji: '🐮' },
  { name: 'Hase', emoji: '🐰' },
];

export const GERMAN_SHAPES = [
  { name: 'Kreis', emoji: '⚪️' },
  { name: 'Quadrat', emoji: '🟦' },
  { name: 'Dreieck', emoji: '🔺' },
  { name: 'Stern', emoji: '⭐️' },
  { name: 'Herz', emoji: '❤️' },
  { name: 'Diamant', emoji: '🔷' },
];

export const GERMAN_FOODS = [
  { name: 'Apfel', emoji: '🍎' },
  { name: 'Banane', emoji: '🍌' },
  { name: 'Brot', emoji: '🍞' },
  { name: 'Käse', emoji: '🧀' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Eis', emoji: '🍦' },
];

export const GERMAN_VEHICLES = [
  { name: 'Auto', emoji: '🚗' },
  { name: 'Bus', emoji: '🚌' },
  { name: 'Zug', emoji: '🚆' },
  { name: 'Flugzeug', emoji: '✈️' },
  { name: 'Fahrrad', emoji: '🚲' },
  { name: 'Rakete', emoji: '🚀' },
];

export const GERMAN_BODY_PARTS = [
  { name: 'Kopf', emoji: '🗣️' },
  { name: 'Hand', emoji: '✋' },
  { name: 'Fuß', emoji: '🦶' },
  { name: 'Auge', emoji: '👁️' },
  { name: 'Nase', emoji: '👃' },
  { name: 'Ohr', emoji: '👂' },
  { name: 'Mund', emoji: '👄' },
  { name: 'Arm', emoji: '💪' },
];

export const GERMAN_GREETINGS = [
  { name: 'Hallo', emoji: '👋' },
  { name: 'Tschüss', emoji: '👋' },
  { name: 'Danke', emoji: '🙏' },
  { name: 'Bitte', emoji: '😊' },
  { name: 'Ja', emoji: '✅' },
  { name: 'Nein', emoji: '❌' },
];

export const GERMAN_MATCH_MODES = [
  { id: 'numbers', label: 'Zahlen', items: GERMAN_NUMBERS, prompt: 'Finde' },
  { id: 'animals', label: 'Tiere', items: GERMAN_ANIMALS, prompt: 'Finde' },
  { id: 'shapes', label: 'Formen', items: GERMAN_SHAPES, prompt: 'Finde' },
  { id: 'foods', label: 'Essen', items: GERMAN_FOODS, prompt: 'Finde' },
  { id: 'vehicles', label: 'Fahrzeuge', items: GERMAN_VEHICLES, prompt: 'Finde' },
  { id: 'body', label: 'Körper', items: GERMAN_BODY_PARTS, prompt: 'Finde' },
  { id: 'greetings', label: 'Grüße', items: GERMAN_GREETINGS, prompt: 'Finde' },
];

export const LETTERS = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽️' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐠' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Octopus', emoji: '🐙' },
  { letter: 'P', word: 'Pizza', emoji: '🍕' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rocket', emoji: '🚀' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'Xylophone', emoji: '🎶' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

export const TRACE_LETTERS = LETTERS.map((item) => ({
  upper: item.letter,
  lower: item.letter.toLowerCase(),
  word: item.word,
  emoji: item.emoji,
}));

export const PHONICS_ITEMS = [
  { letter: 'A', word: 'Apple', emoji: '🍎', sound: 'ah' },
  { letter: 'B', word: 'Ball', emoji: '⚽️', sound: 'buh' },
  { letter: 'C', word: 'Cat', emoji: '🐱', sound: 'kuh' },
  { letter: 'D', word: 'Dog', emoji: '🐶', sound: 'duh' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', sound: 'eh' },
  { letter: 'F', word: 'Fish', emoji: '🐠', sound: 'fff' },
  { letter: 'G', word: 'Goat', emoji: '🐐', sound: 'guh' },
  { letter: 'H', word: 'Hat', emoji: '🎩', sound: 'huh' },
  { letter: 'I', word: 'Igloo', emoji: '🏠', sound: 'ih' },
  { letter: 'J', word: 'Juice', emoji: '🧃', sound: 'juh' },
  { letter: 'K', word: 'Kite', emoji: '🪁', sound: 'kuh' },
  { letter: 'L', word: 'Lion', emoji: '🦁', sound: 'lll' },
  { letter: 'M', word: 'Moon', emoji: '🌙', sound: 'mmm' },
  { letter: 'N', word: 'Nest', emoji: '🪺', sound: 'nnn' },
  { letter: 'O', word: 'Octopus', emoji: '🐙', sound: 'oh' },
  { letter: 'P', word: 'Pizza', emoji: '🍕', sound: 'puh' },
  { letter: 'Q', word: 'Queen', emoji: '👑', sound: 'kwuh' },
  { letter: 'R', word: 'Rocket', emoji: '🚀', sound: 'rrr' },
  { letter: 'S', word: 'Sun', emoji: '☀️', sound: 'sss' },
  { letter: 'T', word: 'Tiger', emoji: '🐯', sound: 'tuh' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', sound: 'uh' },
  { letter: 'V', word: 'Violin', emoji: '🎻', sound: 'vvv' },
  { letter: 'W', word: 'Whale', emoji: '🐳', sound: 'wuh' },
  { letter: 'X', word: 'Xylophone', emoji: '🎶', sound: 'ks' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀', sound: 'yuh' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', sound: 'zzz' },
];

export const BLEND_WORDS = [
  { letters: ['c', 'a', 't'], word: 'Cat', emoji: '🐱' },
  { letters: ['d', 'o', 'g'], word: 'Dog', emoji: '🐶' },
  { letters: ['s', 'u', 'n'], word: 'Sun', emoji: '☀️' },
  { letters: ['h', 'a', 't'], word: 'Hat', emoji: '🎩' },
  { letters: ['b', 'u', 'g'], word: 'Bug', emoji: '🐛' },
  { letters: ['c', 'u', 'p'], word: 'Cup', emoji: '🥤' },
  { letters: ['m', 'a', 'p'], word: 'Map', emoji: '🗺️' },
  { letters: ['p', 'i', 'g'], word: 'Pig', emoji: '🐷' },
  { letters: ['r', 'e', 'd'], word: 'Red', emoji: '🔴' },
  { letters: ['b', 'e', 'd'], word: 'Bed', emoji: '🛏️' },
];

export const MEMORY_LEVELS = [
  {
    id: 'forest',
    name: 'Forest Friends',
    emojis: ['🐶', '🦊', '🐸', '🐵', '🦄', '🐙'],
    columns: 4,
  },
  {
    id: 'ocean',
    name: 'Ocean Splash',
    emojis: ['🐳', '🐬', '🦈', '🐢', '🪼', '🦀', '🦑', '🐟'],
    columns: 4,
  },
  {
    id: 'space',
    name: 'Space Sparkle',
    emojis: ['🚀', '🛸', '🌟', '🌙', '🪐', '☄️', '⭐️', '🛰️', '👽', '🌌'],
    columns: 5,
  },
  {
    id: 'party',
    name: 'Party Mix',
    emojis: ['🎈', '🎉', '🥳', '🎂', '🍭', '🍩', '🧁', '🍓', '🍕', '🍟', '🍉', '🍬'],
    columns: 6,
  },
  {
    id: 'dinos',
    name: 'Dino World',
    emojis: ['🦕', '🦖', '🦴', '🌋', '🥚', '🪨', '🌿'],
    columns: 4,
  },
  {
    id: 'vehicles',
    name: 'Vroom Vroom',
    emojis: ['🚗', '🚀', '✈️', '🚂', '🚁', '🏎️', '🛸', '🚒'],
    columns: 4,
  },
  {
    id: 'food',
    name: 'Yummy Feast',
    emojis: ['🍎', '🍌', '🍇', '🥕', '🧀', '🍪', '🍩', '🥤', '🍕', '🌽'],
    columns: 5,
  },
  {
    id: 'astronaut',
    name: 'Astronaut Mission',
    emojis: ['👨‍🚀', '🌍', '🌙', '🛰️', '🔭', '🪐', '☄️', '🌟', '🛸', '👽', '🚀', '🌌'],
    columns: 6,
  },
];

export const PATTERN_TOKENS = ['🔴', '🔵', '🟡', '🟢', '⭐️', '🌙', '🟣', '🟠', '☀️'];

export const PATTERN_ROUNDS = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', label: 'Red, Blue pattern' },
  { sequence: ['🟡', '🟡', '🔵', '🟡', '🟡'], answer: '🔵', label: 'Yellow, Yellow, Blue' },
  { sequence: ['⭐️', '🌙', '☀️', '⭐️', '🌙'], answer: '☀️', label: 'Star, Moon, Sun' },
  { sequence: ['🟢', '🟣', '🟢', '🟣', '🟢'], answer: '🟣', label: 'Green, Purple' },
  { sequence: ['🟠', '🟠', '🔵', '🟠'], answer: '🟠', label: 'Orange, Orange, Blue' },
  { sequence: ['🔵', '🟢', '🟡', '🔵', '🟢'], answer: '🟡', label: 'Blue, Green, Yellow' },
  { sequence: ['🌙', '🌙', '⭐️', '🌙', '🌙'], answer: '⭐️', label: 'Moon, Moon, Star' },
  { sequence: ['🟣', '🟣', '🟣', '🟢'], answer: '🟢', label: 'Purple then Green' },
];

export const SHAPES = ['Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Diamond'];

export const SPOT_LEVELS = [
  {
    id: 'heroes',
    name: 'Superhero City',
    hint: 'Find 3 differences!',
    base: ['🦸‍♂️', '🦸‍♀️', '🏙️', '⚡️', '🦹‍♂️', '🛡️', '🏢', '🚓', '⭐️'],
    badge: '⭐️',
    diffs: {
      1: '💥',
      3: '⚡️',
      7: '🚒',
    },
  },
  {
    id: 'dinos',
    name: 'Dino Valley',
    hint: 'Find 3 differences!',
    base: ['🦕', '🦖', '🦴', '🌋', '🌿', '🥚', '🪨', '🦕', '🦖'],
    badge: '🌿',
    diffs: {
      2: '🪵',
      7: '🦒',
      8: '🦎',
    },
  },
  {
    id: 'trucks',
    name: 'Monster Trucks',
    hint: 'Find 3 differences!',
    base: ['🛻', '🏁', '⛽️', '🛻', '🔧', '🏆', '🚧', '🛞', '🌟'],
    badge: '⭐️',
    diffs: {
      0: '🚙',
      4: '🔩',
      8: '✨',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Deep',
    hint: 'Find 4 differences!',
    base: ['🐳', '🐠', '🪸', '🦈', '🐙', '🌊', '🐢', '🦀', '🐚'],
    badge: '🌊',
    diffs: { 0: '🐋', 3: '🐟', 6: '🦑', 8: '🐡' },
  },
  {
    id: 'space',
    name: 'Space Station',
    hint: 'Find 4 differences!',
    base: ['🚀', '🌍', '⭐', '🛸', '🌙', '👨‍🚀', '🪐', '☄️', '🌟'],
    badge: '⭐',
    diffs: { 1: '🌎', 4: '🌝', 5: '👩‍🚀', 7: '💫' },
  },
  {
    id: 'farm',
    name: 'Farm Fun',
    hint: 'Find 5 differences!',
    base: ['🐄', '🐔', '🐷', '🌻', '🏠', '🐴', '🐑', '🌾', '🚜'],
    badge: '🌻',
    diffs: { 0: '🐮', 2: '🐽', 4: '🏡', 6: '🐐', 8: '🚗' },
  },
];

export const PUZZLE_TILES = ['🦕', '🌈', '🚀', '⭐️', '🐯', '🍓', '🧁', '🎈', '🪐'];

export const ADVANCED_PATTERN_ROUNDS = [
  { sequence: ['🔴', '🔵', '🟡', '🔴', '🔵'], answer: '🟡', label: 'Red, Blue, Yellow repeat' },
  { sequence: ['⭐️', '⭐️', '🌙', '🌙', '⭐️', '⭐️'], answer: '🌙', label: 'Star Star Moon Moon' },
  { sequence: ['🟢', '🟣', '🟠', '🟢', '🟣'], answer: '🟠', label: 'Green Purple Orange' },
  { sequence: ['🔵', '🔵', '🟡', '🔵', '🔵', '🟡', '🔵', '🔵'], answer: '🟡', label: 'Blue Blue Yellow' },
  { sequence: ['🟠', '🟢', '🟠', '🟢', '🟠', '🟠', '🟢'], answer: '🟠', label: 'Tricky orange green' },
];

export const NUMBER_PATTERN_ROUNDS = [
  { sequence: [2, 4, 6, 8], answer: 10, options: [9, 10, 11, 12], label: 'Count by 2s' },
  { sequence: [5, 10, 15, 20], answer: 25, options: [22, 24, 25, 30], label: 'Count by 5s' },
  { sequence: [1, 2, 3, 4, 5], answer: 6, options: [5, 6, 7, 8], label: 'Count up by 1' },
  { sequence: [10, 8, 6, 4], answer: 2, options: [1, 2, 3, 0], label: 'Count down by 2' },
  { sequence: [1, 3, 5, 7], answer: 9, options: [8, 9, 10, 11], label: 'Odd numbers' },
  { sequence: [10, 20, 30, 40], answer: 50, options: [45, 50, 55, 60], label: 'Count by 10s' },
];

export const WORD_BUILDER_WORDS = [
  { word: 'CAT', emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'DOG', emoji: '🐶', hint: 'A pet that barks and wags its tail' },
  { word: 'SUN', emoji: '☀️', hint: 'It shines bright in the sky' },
  { word: 'HAT', emoji: '🎩', hint: 'You wear it on your head' },
  { word: 'BUG', emoji: '🐛', hint: 'A tiny crawling creature' },
  { word: 'CUP', emoji: '🥤', hint: 'You drink from it' },
  { word: 'PIG', emoji: '🐷', hint: 'A pink farm animal' },
  { word: 'BED', emoji: '🛏️', hint: 'You sleep in it' },
  { word: 'FOX', emoji: '🦊', hint: 'A clever orange animal' },
  { word: 'BUS', emoji: '🚌', hint: 'A big yellow vehicle' },
  { word: 'JAM', emoji: '🫙', hint: 'Sweet and fruity on toast' },
  { word: 'MAP', emoji: '🗺️', hint: 'Shows you where to go' },
  { word: 'HEN', emoji: '🐔', hint: 'A chicken that lays eggs' },
  { word: 'NET', emoji: '🥅', hint: 'Catch things with it' },
  { word: 'VAN', emoji: '🚐', hint: 'A big car for moving things' },
];

export const COLOR_MIX_ROUNDS = [
  { color1: '🔴', color2: '🟡', name1: 'Red', name2: 'Yellow', answer: 'Orange', answerEmoji: '🟠', options: ['Orange', 'Green', 'Purple', 'Brown'] },
  { color1: '🔴', color2: '🔵', name1: 'Red', name2: 'Blue', answer: 'Purple', answerEmoji: '🟣', options: ['Orange', 'Green', 'Purple', 'Pink'] },
  { color1: '🔵', color2: '🟡', name1: 'Blue', name2: 'Yellow', answer: 'Green', answerEmoji: '🟢', options: ['Orange', 'Green', 'Purple', 'Brown'] },
  { color1: '🔴', color2: '⬜', name1: 'Red', name2: 'White', answer: 'Pink', answerEmoji: '🩷', options: ['Pink', 'Orange', 'Purple', 'Brown'] },
  { color1: '🔵', color2: '⬜', name1: 'Blue', name2: 'White', answer: 'Light Blue', answerEmoji: '🩵', options: ['Light Blue', 'Green', 'Purple', 'Grey'] },
  { color1: '🔴', color2: '🟢', name1: 'Red', name2: 'Green', answer: 'Brown', answerEmoji: '🟤', options: ['Orange', 'Brown', 'Purple', 'Grey'] },
  { color1: '⬛', color2: '⬜', name1: 'Black', name2: 'White', answer: 'Grey', answerEmoji: '🩶', options: ['Grey', 'Brown', 'Silver', 'Blue'] },
];

export const ODD_ONE_OUT_ROUNDS = [
  { items: ['🍎', '🍌', '🍇', '🚗'], odd: '🚗', category: 'Fruits', hint: 'Three are fruits!' },
  { items: ['🐶', '🐱', '🐠', '🌳'], odd: '🌳', category: 'Animals', hint: 'Three are animals!' },
  { items: ['✈️', '🚂', '🚗', '🍕'], odd: '🍕', category: 'Vehicles', hint: 'Three can move you around!' },
  { items: ['🔴', '🔵', '🟢', '⭐'], odd: '⭐', category: 'Circles', hint: 'Three are round!' },
  { items: ['☀️', '🌙', '⭐', '🌊'], odd: '🌊', category: 'Sky', hint: 'Three are in the sky!' },
  { items: ['👟', '🧦', '🥾', '🎩'], odd: '🎩', category: 'Feet', hint: 'Three go on your feet!' },
  { items: ['🎹', '🎸', '🥁', '📚'], odd: '📚', category: 'Music', hint: 'Three make music!' },
  { items: ['🍕', '🍔', '🌭', '🐘'], odd: '🐘', category: 'Food', hint: 'Three are yummy food!' },
  { items: ['🦁', '🐯', '🐻', '🐟'], odd: '🐟', category: 'Land animals', hint: 'Three walk on land!' },
  { items: ['2', '4', '6', '7'], odd: '7', category: 'Even numbers', hint: 'Three are even numbers!' },
  { items: ['🟦', '🟥', '🟢', '⚽'], odd: '⚽', category: 'Shapes', hint: 'Three are flat shapes!' },
  { items: ['🌧️', '❄️', '🌈', '🪨'], odd: '🪨', category: 'Weather', hint: 'Three come from the sky!' },
];

export const ACHIEVEMENTS = [
  { id: 'first_game', name: 'First Steps', emoji: '👣', desc: 'Play your first game', check: (g) => Object.values(g).some((v) => v > 0) },
  { id: 'math_wiz', name: 'Math Wizard', emoji: '🧙', desc: 'Answer 50 maths questions', check: (g) => (g.addition || 0) + (g.subtraction || 0) + (g.math || 0) >= 50 },
  { id: 'memory_pro', name: 'Memory Pro', emoji: '🧠', desc: 'Play Memory Match 10 times', check: (g) => (g.memory || 0) >= 10 },
  { id: 'dino_hunter', name: 'Dino Hunter', emoji: '🦖', desc: 'Find 20 dinosaurs', check: (g) => (g.dino || 0) >= 20 },
  { id: 'word_smith', name: 'Word Smith', emoji: '📝', desc: 'Build 10 words', check: (g) => (g.words || 0) >= 10 },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', desc: 'Try 8 different games', check: (g) => Object.keys(g).filter((k) => g[k] > 0).length >= 8 },
  { id: 'star_100', name: 'Star Collector', emoji: '💯', desc: 'Earn 100 stars', check: (_, p) => p >= 100 },
  { id: 'star_300', name: 'Superstar', emoji: '🌟', desc: 'Earn 300 stars', check: (_, p) => p >= 300 },
  { id: 'streak_5', name: 'On Fire', emoji: '🔥', desc: 'Get a 5-day streak', check: (_, _p, s) => s >= 5 },
  { id: 'streak_10', name: 'Unstoppable', emoji: '⚡', desc: 'Get a 10-day streak', check: (_, _p, s) => s >= 10 },
  { id: 'color_mixer', name: 'Color Scientist', emoji: '🎨', desc: 'Mix 10 colors', check: (g) => (g.colormix || 0) >= 10 },
  { id: 'odd_master', name: 'Sharp Eye', emoji: '👁️', desc: 'Find 15 odd ones out', check: (g) => (g.oddoneout || 0) >= 15 },
  { id: 'astro_grad', name: 'Space Graduate', emoji: '🎓', desc: 'Complete all Astronaut missions', check: (g) => (g.astronaut || 0) >= 38 },
  { id: 'puzzle_king', name: 'Puzzle King', emoji: '👑', desc: 'Complete 10 puzzles', check: (g) => (g.puzzle || 0) >= 10 },
  { id: 'all_rounder', name: 'All Rounder', emoji: '🏅', desc: 'Try every game', check: (g) => Object.keys(g).filter((k) => g[k] > 0).length >= 14 },
];

export const VISUAL_EMOJIS = ['🍎', '🌟', '🐟', '🦋', '🍪', '🎈', '🌸', '💎', '🍬', '🚀'];

export const GAME_LABELS = {
  solar: 'Solar System',
  dino: 'Dino Detective',
  jet: 'Sky Shapes',
  german: 'German Garage',
  math: 'Monster Math',
  letters: 'Letter Launch',
  memory: 'Memory Match',
  pattern: 'Pattern Parade',
  trace: 'Letter Trace',
  phonics: 'Sound Safari',
  spot: 'Spot the Difference',
  puzzle: 'Puzzle Pop',
  addition: 'Addition Adventure',
  subtraction: 'Subtraction Station',
  astronaut: 'Astronaut Academy',
  counting: 'Count the Stars',
  words: 'Word Builder',
  colormix: 'Color Mixing Lab',
  oddoneout: 'Odd One Out',
  timeteller: 'Time Teller',
  numberline: 'Number Line Jump',
  chess: 'Chess Explorers',
  progress: 'Progress Dashboard',
};

export const ADDITION_LEVELS = [
  { id: 'easy', name: 'Launch Pad', maxNum: 5, rounds: 8, emoji: '🚀' },
  { id: 'medium', name: 'Orbit', maxNum: 10, rounds: 10, emoji: '🛸' },
  { id: 'hard', name: 'Deep Space', maxNum: 20, rounds: 12, emoji: '🌟' },
];

export const SUBTRACTION_LEVELS = [
  { id: 'easy', name: 'Gentle Glide', maxNum: 5, rounds: 8, emoji: '🪂' },
  { id: 'medium', name: 'Meteor Dodge', maxNum: 10, rounds: 10, emoji: '☄️' },
  { id: 'hard', name: 'Black Hole', maxNum: 20, rounds: 12, emoji: '🕳️' },
];

export const ASTRONAUT_PROFILES = [
  {
    id: 'neil',
    name: 'Neil Armstrong',
    emoji: '🌕',
    flag: '🇺🇸',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Neil_Armstrong_pose.jpg/200px-Neil_Armstrong_pose.jpg',
    funFact: 'He was the very first person to walk on the Moon!',
    achievement: 'First on the Moon',
    achievementEmoji: '🌕',
    year: 1969,
  },
  {
    id: 'buzz',
    name: 'Buzz Aldrin',
    emoji: '🚀',
    flag: '🇺🇸',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Buzz_Aldrin.jpg/200px-Buzz_Aldrin.jpg',
    funFact: 'He went to the Moon with Neil and took a selfie in space!',
    achievement: 'Moon Selfie',
    achievementEmoji: '🤳',
    year: 1969,
  },
  {
    id: 'yuri',
    name: 'Yuri Gagarin',
    emoji: '🛰️',
    flag: '🇷🇺',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Yuri_Gagarin_%281961%29_-_Restoration.jpg/200px-Yuri_Gagarin_%281961%29_-_Restoration.jpg',
    funFact: 'He was the first person ever to fly to space!',
    achievement: 'First in Space',
    achievementEmoji: '🛰️',
    year: 1961,
  },
  {
    id: 'mae',
    name: 'Mae Jemison',
    emoji: '👩‍🚀',
    flag: '🇺🇸',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mae_Carol_Jemison.jpg/200px-Mae_Carol_Jemison.jpg',
    funFact: 'She was the first Black woman to travel to space!',
    achievement: 'Trailblazer',
    achievementEmoji: '✨',
    year: 1992,
  },
  {
    id: 'sally',
    name: 'Sally Ride',
    emoji: '🇺🇸',
    flag: '🇺🇸',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sally_Ride%2C_America%27s_first_woman_astronaut_commmunicates_with_ground_controllers_from_the_flight_deck_-_NARA_-_541940.jpg/200px-Sally_Ride%2C_America%27s_first_woman_astronaut_commmunicates_with_ground_controllers_from_the_flight_deck_-_NARA_-_541940.jpg',
    funFact: 'She was the first American girl to go to space!',
    achievement: 'First US Woman',
    achievementEmoji: '🌟',
    year: 1983,
  },
  {
    id: 'chris',
    name: 'Chris Hadfield',
    emoji: '🎸',
    flag: '🇨🇦',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Chris_Hadfield_2011.jpg/200px-Chris_Hadfield_2011.jpg',
    funFact: 'He played guitar and sang a song while floating in space!',
    achievement: 'Space Musician',
    achievementEmoji: '🎸',
    year: 2013,
  },
  {
    id: 'laika',
    name: 'Laika',
    emoji: '🐕',
    flag: '🐕',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Laika_%28Soviet_dog%29.jpg/200px-Laika_%28Soviet_dog%29.jpg',
    funFact: 'She was a brave little dog who flew around the Earth!',
    achievement: 'First Space Dog',
    achievementEmoji: '🐕',
    year: 1957,
  },
  {
    id: 'tim',
    name: 'Tim Peake',
    emoji: '🇬🇧',
    flag: '🇬🇧',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tim_Peake_official_portrait.jpg/200px-Tim_Peake_official_portrait.jpg',
    funFact: 'He ran a race on a treadmill while flying through space!',
    achievement: 'Space Runner',
    achievementEmoji: '🏃',
    year: 2016,
  },
];

export const ASTRONAUT_CATEGORIES = [
  {
    id: 'numbers',
    name: 'Count the Stars',
    emoji: '🔢',
    items: [
      { q: 'How many fingers on one hand?', visual: '🖐️', answer: '5', options: [{ text: '3', visual: '3️⃣' }, { text: '5', visual: '5️⃣' }, { text: '7', visual: '7️⃣' }, { text: '10', visual: '🔟' }] },
      { q: 'How many days in a week?', visual: '📅', answer: '7', options: [{ text: '5', visual: '5️⃣' }, { text: '6', visual: '6️⃣' }, { text: '7', visual: '7️⃣' }, { text: '8', visual: '8️⃣' }] },
      { q: 'How many legs does a spider have?', visual: '🕷️', answer: '8', options: [{ text: '4', visual: '4️⃣' }, { text: '6', visual: '6️⃣' }, { text: '8', visual: '8️⃣' }, { text: '10', visual: '🔟' }] },
      { q: 'How many wheels on a car?', visual: '🚗', answer: '4', options: [{ text: '2', visual: '2️⃣' }, { text: '3', visual: '3️⃣' }, { text: '4', visual: '4️⃣' }, { text: '6', visual: '6️⃣' }] },
      { q: 'How many months in a year?', visual: '🗓️', answer: '12', options: [{ text: '10', visual: '🔟' }, { text: '11', visual: '1️⃣1️⃣' }, { text: '12', visual: '1️⃣2️⃣' }, { text: '14', visual: '1️⃣4️⃣' }] },
      { q: 'How many eyes do you have?', visual: '👀', answer: '2', options: [{ text: '1', visual: '1️⃣' }, { text: '2', visual: '2️⃣' }, { text: '3', visual: '3️⃣' }, { text: '4', visual: '4️⃣' }] },
    ],
  },
  {
    id: 'shapes',
    name: 'Shape Galaxy',
    emoji: '🔷',
    items: [
      { q: 'Which shape has 3 sides?', visual: '❓', answer: 'Triangle', options: [{ text: 'Circle', visual: '⚫' }, { text: 'Triangle', visual: '🔺' }, { text: 'Square', visual: '🟧' }, { text: 'Star', visual: '⭐' }] },
      { q: 'Which shape is round?', visual: '❓', answer: 'Circle', options: [{ text: 'Circle', visual: '⚫' }, { text: 'Square', visual: '🟧' }, { text: 'Rectangle', visual: '🟫' }, { text: 'Diamond', visual: '🔷' }] },
      { q: 'Which shape has 4 equal sides?', visual: '❓', answer: 'Square', options: [{ text: 'Triangle', visual: '🔺' }, { text: 'Circle', visual: '⚫' }, { text: 'Square', visual: '🟧' }, { text: 'Oval', visual: '🥚' }] },
      { q: 'A football is shaped like a...', visual: '⚽', answer: 'Sphere', options: [{ text: 'Cube', visual: '🧊' }, { text: 'Sphere', visual: '🔮' }, { text: 'Cone', visual: '🔺' }, { text: 'Cylinder', visual: '🧪' }] },
      { q: 'What shape is a dice?', visual: '🎲', answer: 'Cube', options: [{ text: 'Sphere', visual: '🔮' }, { text: 'Cube', visual: '🧊' }, { text: 'Pyramid', visual: '🔺' }, { text: 'Cylinder', visual: '🧪' }] },
      { q: 'Which shape has 5 points?', visual: '❓', answer: 'Star', options: [{ text: 'Heart', visual: '❤️' }, { text: 'Star', visual: '⭐' }, { text: 'Circle', visual: '⚫' }, { text: 'Diamond', visual: '🔷' }] },
    ],
  },
  {
    id: 'animals',
    name: 'Space Zoo',
    emoji: '🦁',
    items: [
      { q: 'Which animal is the King of the Jungle?', visual: '👑', answer: 'Lion', options: [{ text: 'Tiger', visual: '🐯' }, { text: 'Lion', visual: '🦁' }, { text: 'Bear', visual: '🐻' }, { text: 'Wolf', visual: '🐺' }] },
      { q: 'Which animal has a long trunk?', visual: '❓', answer: 'Elephant', options: [{ text: 'Giraffe', visual: '🦒' }, { text: 'Elephant', visual: '🐘' }, { text: 'Hippo', visual: '🦛' }, { text: 'Rhino', visual: '🦏' }] },
      { q: 'Which animal says "Moo"?', visual: '🔊', answer: 'Cow', options: [{ text: 'Dog', visual: '🐶' }, { text: 'Cat', visual: '🐱' }, { text: 'Cow', visual: '🐄' }, { text: 'Sheep', visual: '🐑' }] },
      { q: 'Which animal can fly?', visual: '🌤️', answer: 'Eagle', options: [{ text: 'Fish', visual: '🐟' }, { text: 'Snake', visual: '🐍' }, { text: 'Eagle', visual: '🦅' }, { text: 'Frog', visual: '🐸' }] },
      { q: 'Which is the tallest animal?', visual: '📏', answer: 'Giraffe', options: [{ text: 'Elephant', visual: '🐘' }, { text: 'Giraffe', visual: '🦒' }, { text: 'Horse', visual: '🐴' }, { text: 'Camel', visual: '🐪' }] },
      { q: 'Which animal lives in the sea?', visual: '🌊', answer: 'Dolphin', options: [{ text: 'Rabbit', visual: '🐰' }, { text: 'Dolphin', visual: '🐬' }, { text: 'Parrot', visual: '🦜' }, { text: 'Monkey', visual: '🐒' }] },
      { q: 'Which animal is the fastest on land?', visual: '💨', answer: 'Cheetah', options: [{ text: 'Cheetah', visual: '🐆' }, { text: 'Horse', visual: '🐴' }, { text: 'Dog', visual: '🐶' }, { text: 'Rabbit', visual: '🐰' }] },
    ],
  },
  {
    id: 'body',
    name: 'Body Mission',
    emoji: '🧠',
    items: [
      { q: 'What organ pumps blood around your body?', visual: '💓', answer: 'Heart', options: [{ text: 'Brain', visual: '🧠' }, { text: 'Heart', visual: '❤️' }, { text: 'Lungs', visual: '🫁' }, { text: 'Stomach', visual: '🤢' }] },
      { q: 'What do you use to breathe?', visual: '😤', answer: 'Lungs', options: [{ text: 'Heart', visual: '❤️' }, { text: 'Lungs', visual: '🫁' }, { text: 'Liver', visual: '🫀' }, { text: 'Kidneys', visual: '🫘' }] },
      { q: 'What do you think with?', visual: '💭', answer: 'Brain', options: [{ text: 'Heart', visual: '❤️' }, { text: 'Brain', visual: '🧠' }, { text: 'Stomach', visual: '🤢' }, { text: 'Bones', visual: '🦴' }] },
      { q: 'What covers your whole body?', visual: '🤔', answer: 'Skin', options: [{ text: 'Hair', visual: '💇' }, { text: 'Skin', visual: '🖐️' }, { text: 'Nails', visual: '💅' }, { text: 'Muscles', visual: '💪' }] },
      { q: 'What helps you chew food?', visual: '🍎', answer: 'Teeth', options: [{ text: 'Tongue', visual: '👅' }, { text: 'Teeth', visual: '🦷' }, { text: 'Lips', visual: '👄' }, { text: 'Nose', visual: '👃' }] },
      { q: 'What do you use to hear sounds?', visual: '🔊', answer: 'Ears', options: [{ text: 'Eyes', visual: '👀' }, { text: 'Ears', visual: '👂' }, { text: 'Nose', visual: '👃' }, { text: 'Mouth', visual: '👄' }] },
    ],
  },
  {
    id: 'space',
    name: 'Space Facts',
    emoji: '🪐',
    items: [
      { q: 'What is the closest star to Earth?', visual: '✨', answer: 'The Sun', options: [{ text: 'The Moon', visual: '🌙' }, { text: 'The Sun', visual: '☀️' }, { text: 'Mars', visual: '🔴' }, { text: 'Jupiter', visual: '🟠' }] },
      { q: 'How many planets in our solar system?', visual: '🌌', answer: '8', options: [{ text: '6', visual: '6️⃣' }, { text: '7', visual: '7️⃣' }, { text: '8', visual: '8️⃣' }, { text: '9', visual: '9️⃣' }] },
      { q: 'What planet are we on?', visual: '🏠', answer: 'Earth', options: [{ text: 'Mars', visual: '🔴' }, { text: 'Earth', visual: '🌍' }, { text: 'Venus', visual: '🟡' }, { text: 'Mercury', visual: '⚪' }] },
      { q: 'Which planet has beautiful rings?', visual: '💍', answer: 'Saturn', options: [{ text: 'Jupiter', visual: '🟠' }, { text: 'Mars', visual: '🔴' }, { text: 'Saturn', visual: '🪐' }, { text: 'Neptune', visual: '🔵' }] },
      { q: 'What do astronauts wear in space?', visual: '👨‍🚀', answer: 'Space suit', options: [{ text: 'Raincoat', visual: '🧥' }, { text: 'Space suit', visual: '🥼' }, { text: 'Swimsuit', visual: '👙' }, { text: 'Armour', visual: '🛡️' }] },
      { q: 'Which planet is called the Red Planet?', visual: '❓', answer: 'Mars', options: [{ text: 'Earth', visual: '🌍' }, { text: 'Mars', visual: '🔴' }, { text: 'Venus', visual: '🟡' }, { text: 'Neptune', visual: '🔵' }] },
      { q: 'What pulls things down to the ground?', visual: '🍎⬇️', answer: 'Gravity', options: [{ text: 'Wind', visual: '💨' }, { text: 'Gravity', visual: '⬇️' }, { text: 'Magnets', visual: '🧲' }, { text: 'Rain', visual: '🌧️' }] },
    ],
  },
  {
    id: 'dinosaurs',
    name: 'Dino Facts',
    emoji: '🦕',
    items: [
      { q: 'Which dinosaur had tiny arms?', visual: '💪❓', answer: 'T-Rex', options: [{ text: 'T-Rex', visual: '🦖' }, { text: 'Stegosaurus', visual: '🦕' }, { text: 'Triceratops', visual: '🦏' }, { text: 'Brachiosaurus', visual: '🦒' }] },
      { q: 'Which dinosaur had 3 horns?', visual: '❓', answer: 'Triceratops', options: [{ text: 'T-Rex', visual: '🦖' }, { text: 'Triceratops', visual: '🦏' }, { text: 'Stegosaurus', visual: '🦕' }, { text: 'Raptor', visual: '🦅' }] },
      { q: 'Which dinosaur had plates on its back?', visual: '❓', answer: 'Stegosaurus', options: [{ text: 'Stegosaurus', visual: '🦕' }, { text: 'T-Rex', visual: '🦖' }, { text: 'Pterodactyl', visual: '🦅' }, { text: 'Raptor', visual: '🐾' }] },
      { q: 'Which dinosaur could fly?', visual: '🌤️', answer: 'Pterodactyl', options: [{ text: 'T-Rex', visual: '🦖' }, { text: 'Pterodactyl', visual: '🦅' }, { text: 'Triceratops', visual: '🦏' }, { text: 'Stegosaurus', visual: '🦕' }] },
      { q: 'What did dinosaurs hatch from?', visual: '❓', answer: 'Eggs', options: [{ text: 'Eggs', visual: '🥚' }, { text: 'Rocks', visual: '🪨' }, { text: 'Trees', visual: '🌳' }, { text: 'Clouds', visual: '☁️' }] },
      { q: 'Are dinosaurs still alive today?', visual: '🤔', answer: 'No', options: [{ text: 'Yes', visual: '✅' }, { text: 'No', visual: '❌' }, { text: 'Maybe', visual: '🤷' }, { text: 'Only small ones', visual: '🐊' }] },
    ],
  },
  {
    id: 'heroes',
    name: 'Space Heroes',
    emoji: '👨‍🚀',
    items: [
      { q: 'Who was the first person to walk on the Moon?', visual: '🌕', answer: 'Neil Armstrong', astronaut: 'neil', options: [{ text: 'Buzz Aldrin', visual: '🚀' }, { text: 'Neil Armstrong', visual: '🌕' }, { text: 'Yuri Gagarin', visual: '🛰️' }, { text: 'Tim Peake', visual: '🇬🇧' }] },
      { q: 'Who was the first person ever to go to space?', visual: '🛰️', answer: 'Yuri Gagarin', astronaut: 'yuri', options: [{ text: 'Neil Armstrong', visual: '🌕' }, { text: 'Mae Jemison', visual: '👩‍🚀' }, { text: 'Yuri Gagarin', visual: '🛰️' }, { text: 'Sally Ride', visual: '🇺🇸' }] },
      { q: 'Who went to the Moon with Neil Armstrong?', visual: '👯', answer: 'Buzz Aldrin', astronaut: 'buzz', options: [{ text: 'Buzz Aldrin', visual: '🚀' }, { text: 'Chris Hadfield', visual: '🎸' }, { text: 'Tim Peake', visual: '🇬🇧' }, { text: 'Yuri Gagarin', visual: '🛰️' }] },
      { q: 'Who was the first Black woman to travel to space?', visual: '👩‍🚀', answer: 'Mae Jemison', astronaut: 'mae', options: [{ text: 'Sally Ride', visual: '🇺🇸' }, { text: 'Mae Jemison', visual: '👩‍🚀' }, { text: 'Neil Armstrong', visual: '🌕' }, { text: 'Laika', visual: '🐕' }] },
      { q: 'Who was the first American woman in space?', visual: '🇺🇸', answer: 'Sally Ride', astronaut: 'sally', options: [{ text: 'Mae Jemison', visual: '👩‍🚀' }, { text: 'Sally Ride', visual: '🇺🇸' }, { text: 'Buzz Aldrin', visual: '🚀' }, { text: 'Chris Hadfield', visual: '🎸' }] },
      { q: 'Which astronaut sang a song from space?', visual: '🎸', answer: 'Chris Hadfield', astronaut: 'chris', options: [{ text: 'Tim Peake', visual: '🇬🇧' }, { text: 'Neil Armstrong', visual: '🌕' }, { text: 'Chris Hadfield', visual: '🎸' }, { text: 'Buzz Aldrin', visual: '🚀' }] },
      { q: 'What was the name of the first dog sent to orbit Earth?', visual: '🐕', answer: 'Laika', astronaut: 'laika', options: [{ text: 'Buddy', visual: '🐶' }, { text: 'Rex', visual: '🐕‍🦺' }, { text: 'Laika', visual: '🐕' }, { text: 'Spot', visual: '🐾' }] },
      { q: 'Which British astronaut ran a marathon in space?', visual: '🏃', answer: 'Tim Peake', astronaut: 'tim', options: [{ text: 'Chris Hadfield', visual: '🎸' }, { text: 'Neil Armstrong', visual: '🌕' }, { text: 'Tim Peake', visual: '🇬🇧' }, { text: 'Sally Ride', visual: '🇺🇸' }] },
    ],
  },
];

export const STICKERS = [
  { id: 'rocket', name: 'Bronze Rocket', emoji: '🚀', points: 10 },
  { id: 'dino', name: 'Silver Dino', emoji: '🦕', points: 25 },
  { id: 'star', name: 'Gold Star', emoji: '⭐️', points: 40 },
  { id: 'truck', name: 'Speed Truck', emoji: '🛻', points: 60 },
  { id: 'heart', name: 'Super Heart', emoji: '💖', points: 80 },
  { id: 'planet', name: 'Planet Master', emoji: '🪐', points: 100 },
  { id: 'hero', name: 'Mega Hero', emoji: '🦸‍♀️', points: 130 },
  { id: 'trophy', name: 'Trophy Winner', emoji: '🏆', points: 170 },
  { id: 'diamond', name: 'Diamond Brain', emoji: '💎', points: 220 },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', points: 280 },
  { id: 'legend', name: 'Legend Badge', emoji: '🏅', points: 350 },
  { id: 'galaxy', name: 'Galaxy King', emoji: '🌌', points: 450 },
];

export const PLAYER_RANKS = [
  { title: 'Space Cadet', emoji: '👶', minPoints: 0 },
  { title: 'Star Collector', emoji: '⭐', minPoints: 25 },
  { title: 'Moon Walker', emoji: '🌙', minPoints: 60 },
  { title: 'Rocket Pilot', emoji: '🚀', minPoints: 100 },
  { title: 'Planet Explorer', emoji: '🪐', minPoints: 170 },
  { title: 'Galaxy Ranger', emoji: '🌌', minPoints: 280 },
  { title: 'Space Commander', emoji: '👨‍🚀', minPoints: 400 },
  { title: 'Universe Legend', emoji: '🏆', minPoints: 600 },
];

export const DAILY_CHALLENGES = [
  { id: 'memory3', game: 'memory', desc: 'Complete a Memory Match level', target: 1, emoji: '🧩' },
  { id: 'math5', game: 'math', desc: 'Solve 5 maths problems', target: 5, emoji: '🛻' },
  { id: 'addition5', game: 'addition', desc: 'Answer 5 addition questions', target: 5, emoji: '➕' },
  { id: 'sub5', game: 'subtraction', desc: 'Answer 5 subtraction questions', target: 5, emoji: '➖' },
  { id: 'dino1', game: 'dino', desc: 'Find all dinos in a level', target: 1, emoji: '🦕' },
  { id: 'astro3', game: 'astronaut', desc: 'Complete an Astronaut mission', target: 1, emoji: '👨‍🚀' },
  { id: 'pattern3', game: 'pattern', desc: 'Solve 3 patterns', target: 3, emoji: '🔷' },
  { id: 'count5', game: 'counting', desc: 'Count 5 groups of stars', target: 5, emoji: '🔢' },
  { id: 'puzzle1', game: 'puzzle', desc: 'Complete a jigsaw puzzle', target: 1, emoji: '🧩' },
  { id: 'letters3', game: 'letters', desc: 'Match 3 letters', target: 3, emoji: '🚀' },
];

export const COUNT_LEVELS = [
  { id: 'easy', name: 'Tiny Stars', max: 5, emoji: '⭐' },
  { id: 'medium', name: 'Star Cluster', max: 10, emoji: '🌟' },
  { id: 'hard', name: 'Super Nova', max: 15, emoji: '💫' },
];

export const CONFETTI_COLORS = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#ec4899', '#a855f7', '#f97316'];

export const JIGSAW_PUZZLES = [
  { id: 'dino', name: 'Dino Park', grid: 3, pieces: ['🦕', '🌿', '🦖', '🌋', '🥚', '☀️', '🪨', '🦴', '🌴'] },
  { id: 'space', name: 'Space Walk', grid: 3, pieces: ['🚀', '🌍', '⭐', '🛸', '🌙', '👨‍🚀', '🪐', '☄️', '🌟'] },
  { id: 'ocean', name: 'Under the Sea', grid: 3, pieces: ['🐳', '🐠', '🪸', '🦈', '🐙', '🌊', '🐢', '🦀', '🐚'] },
  { id: 'farm', name: 'Happy Farm', grid: 4, pieces: ['🐄', '🐔', '🐷', '🌻', '🏠', '🐴', '🐑', '🌾', '🚜', '🐶', '🌳', '🐱', '🥕', '🐰', '🌈', '🌞'] },
  { id: 'city', name: 'Busy City', grid: 4, pieces: ['🏙️', '🚗', '🏫', '🌳', '🚌', '🏪', '🚶', '🌤️', '🚓', '🏗️', '🛻', '🏠', '🚲', '🌺', '⛲', '🏢'] },
  { id: 'jungle', name: 'Wild Jungle', grid: 5, pieces: ['🦁', '🐵', '🦜', '🌴', '🐍', '🦋', '🌺', '🐘', '🦎', '🌿', '🐆', '🦩', '🍌', '🌸', '🦧', '🪲', '🌻', '🐾', '🦥', '🍃', '🦔', '🌳', '🐢', '🪺', '🌈'] },
];

export const CHESS_PIECES = [
  { id: 'king', name: 'King', emoji: '♚', white: '♔', desc: 'The most important piece!', move: 'One step any direction', moveEmoji: '👑', color: '#eab308' },
  { id: 'queen', name: 'Queen', emoji: '♛', white: '♕', desc: 'The most powerful piece!', move: 'Any direction, any distance', moveEmoji: '💪', color: '#a855f7' },
  { id: 'rook', name: 'Rook', emoji: '♜', white: '♖', desc: 'Looks like a castle tower!', move: 'Straight lines only', moveEmoji: '🏰', color: '#3b82f6' },
  { id: 'bishop', name: 'Bishop', emoji: '♝', white: '♗', desc: 'Wears a pointy hat!', move: 'Diagonal lines only', moveEmoji: '↗️', color: '#22c55e' },
  { id: 'knight', name: 'Knight', emoji: '♞', white: '♘', desc: 'A brave horse!', move: 'L-shape jump', moveEmoji: '🐴', color: '#f97316' },
  { id: 'pawn', name: 'Pawn', emoji: '♟', white: '♙', desc: 'The little soldier!', move: 'One step forward', moveEmoji: '🪖', color: '#ef4444' },
];

// Tiered chess puzzles — 3 difficulty levels
export const CHESS_PUZZLES = [
  // Level 1 — Beginner (easy pieces, corner/edge = fewer moves)
  { piece: 'pawn', pos: [4, 2], validMoves: [[3, 2]], q: 'Where can the Pawn go?', level: 1 },
  { piece: 'king', pos: [0, 0], validMoves: [[0, 1], [1, 0], [1, 1]], q: 'Where can the King go?', level: 1 },
  { piece: 'rook', pos: [0, 3], validMoves: [[0,0],[0,1],[0,2],[0,4],[0,5],[1,3],[2,3],[3,3],[4,3],[5,3]], q: 'Where can the Rook go?', level: 1 },
  // Level 2 — Explorer (center positions, moderate)
  { piece: 'bishop', pos: [3, 3], validMoves: [[0,0],[1,1],[2,2],[4,4],[5,5],[2,4],[1,5],[4,2],[5,1]], q: 'Where can the Bishop go?', level: 2 },
  { piece: 'knight', pos: [3, 3], validMoves: [[1,2],[1,4],[2,1],[2,5],[4,1],[4,5],[5,2],[5,4]], q: 'Where can the Knight jump?', level: 2 },
  { piece: 'pawn', pos: [3, 1], validMoves: [[2, 1]], q: 'Where can the Pawn go?', level: 2 },
  // Level 3 — Champion (hardest, max valid moves)
  { piece: 'king', pos: [3, 3], validMoves: [[2,2],[2,3],[2,4],[3,2],[3,4],[4,2],[4,3],[4,4]], q: 'Where can the King go?', level: 3 },
  { piece: 'queen', pos: [3, 3], validMoves: [[0,0],[1,1],[2,2],[4,4],[5,5],[2,4],[1,5],[4,2],[5,1],[0,3],[1,3],[2,3],[4,3],[5,3],[3,0],[3,1],[3,2],[3,4],[3,5]], q: 'Where can the Queen go?', level: 3 },
  { piece: 'rook', pos: [2, 2], validMoves: [[0,2],[1,2],[3,2],[4,2],[5,2],[2,0],[2,1],[2,3],[2,4],[2,5]], q: 'Where can the Rook go?', level: 3 },
];

// Demo move paths for animated Learn mode — 3-4 example moves per piece
export const PIECE_DEMO_MOVES = {
  king:   [[1, 1], [1, 2], [2, 2], [2, 1]],
  queen:  [[0, 2], [2, 0], [2, 2], [0, 0]],
  rook:   [[2, 0], [0, 0], [0, 2], [2, 2]],
  bishop: [[0, 0], [2, 2], [0, 2], [2, 0]],
  knight: [[0, 1], [2, 2], [0, 3], [2, 0]],
  pawn:   [[1, 1], [0, 1]],
};

export const MOVE_PRAISE = [
  'Nice move!',
  'Great job!',
  'You got it!',
  'Awesome!',
  'Way to go!',
  'Perfect!',
  'Well done!',
  'Brilliant!',
];

