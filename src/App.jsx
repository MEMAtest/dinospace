import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Cloud, Home, Palette, Volume2, VolumeX } from 'lucide-react';

const THEME = {
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

const FRIENDLY_VOICE_NAMES = [
  'Samantha',
  'Victoria',
  'Ava',
  'Allison',
  'Google US English',
  'Google UK English Female',
  'Karen',
  'Moira',
  'Zoe',
];

const GERMAN_PRAISE = ['Super!', 'Gut gemacht!', 'Sehr gut!', 'Toll gemacht!', 'Fantastisch!', 'Klasse!'];

const BURST_EMOJIS = ['✨', '⭐️', '🎆', '🎇', '🌟'];

const PLANETS = [
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

const DINO_SPECIES = {
  trex: {
    name: 'T-Rex',
    emoji: '🦖',
    fact: 'Tiny arms but a huge bite! ROAR!',
  },
  brachio: {
    name: 'Brachiosaurus',
    emoji: '🦒',
    fact: 'Looks like a giraffe dinosaur with a long neck!',
  },
  trike: {
    name: 'Triceratops',
    emoji: '🦏',
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
    emoji: '🦅',
    fact: 'Flying reptile, not a dinosaur!',
  },
  dillo: {
    name: 'Dilophosaurus',
    emoji: '🦖',
    fact: 'Two crests on my head.',
  },
};

const makeDino = (levelId, key, x, y) => ({
  id: `${levelId}-${key}-${x}-${y}`,
  ...DINO_SPECIES[key],
  x,
  y,
});

const DINO_LEVELS = [
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
];

const GERMAN_COLORS = [
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

const GERMAN_NUMBERS = [
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

const GERMAN_ANIMALS = [
  { name: 'Hund', emoji: '🐶' },
  { name: 'Katze', emoji: '🐱' },
  { name: 'Vogel', emoji: '🐦' },
  { name: 'Fisch', emoji: '🐠' },
  { name: 'Löwe', emoji: '🦁' },
  { name: 'Pferd', emoji: '🐴' },
  { name: 'Kuh', emoji: '🐮' },
  { name: 'Hase', emoji: '🐰' },
];

const GERMAN_SHAPES = [
  { name: 'Kreis', emoji: '⚪️' },
  { name: 'Quadrat', emoji: '🟦' },
  { name: 'Dreieck', emoji: '🔺' },
  { name: 'Stern', emoji: '⭐️' },
  { name: 'Herz', emoji: '❤️' },
  { name: 'Diamant', emoji: '🔷' },
];

const GERMAN_FOODS = [
  { name: 'Apfel', emoji: '🍎' },
  { name: 'Banane', emoji: '🍌' },
  { name: 'Brot', emoji: '🍞' },
  { name: 'Käse', emoji: '🧀' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Eis', emoji: '🍦' },
];

const GERMAN_VEHICLES = [
  { name: 'Auto', emoji: '🚗' },
  { name: 'Bus', emoji: '🚌' },
  { name: 'Zug', emoji: '🚆' },
  { name: 'Flugzeug', emoji: '✈️' },
  { name: 'Fahrrad', emoji: '🚲' },
  { name: 'Rakete', emoji: '🚀' },
];

const GERMAN_MATCH_MODES = [
  { id: 'numbers', label: 'Zahlen', items: GERMAN_NUMBERS, prompt: 'Finde' },
  { id: 'animals', label: 'Tiere', items: GERMAN_ANIMALS, prompt: 'Finde' },
  { id: 'shapes', label: 'Formen', items: GERMAN_SHAPES, prompt: 'Finde' },
  { id: 'foods', label: 'Essen', items: GERMAN_FOODS, prompt: 'Finde' },
  { id: 'vehicles', label: 'Fahrzeuge', items: GERMAN_VEHICLES, prompt: 'Finde' },
];

const LETTERS = [
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

const TRACE_LETTERS = LETTERS.map((item) => ({
  upper: item.letter,
  lower: item.letter.toLowerCase(),
  word: item.word,
  emoji: item.emoji,
}));

const PHONICS_ITEMS = [
  { letter: 'A', word: 'Apple', emoji: '🍎', sound: 'ah' },
  { letter: 'B', word: 'Ball', emoji: '⚽️', sound: 'buh' },
  { letter: 'C', word: 'Cat', emoji: '🐱', sound: 'kuh' },
  { letter: 'D', word: 'Dog', emoji: '🐶', sound: 'duh' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', sound: 'eh' },
  { letter: 'F', word: 'Fish', emoji: '🐠', sound: 'fff' },
  { letter: 'G', word: 'Goat', emoji: '🐐', sound: 'guh' },
  { letter: 'H', word: 'Hat', emoji: '🎩', sound: 'huh' },
  { letter: 'L', word: 'Lion', emoji: '🦁', sound: 'lll' },
  { letter: 'M', word: 'Moon', emoji: '🌙', sound: 'mmm' },
  { letter: 'P', word: 'Pizza', emoji: '🍕', sound: 'puh' },
  { letter: 'R', word: 'Rocket', emoji: '🚀', sound: 'rrr' },
  { letter: 'S', word: 'Sun', emoji: '☀️', sound: 'sss' },
  { letter: 'T', word: 'Tiger', emoji: '🐯', sound: 'tuh' },
];

const MEMORY_LEVELS = [
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

const PATTERN_TOKENS = ['🔴', '🔵', '🟡', '🟢', '⭐️', '🌙', '🟣', '🟠', '☀️'];

const PATTERN_ROUNDS = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', label: 'Red, Blue pattern' },
  { sequence: ['🟡', '🟡', '🔵', '🟡', '🟡'], answer: '🔵', label: 'Yellow, Yellow, Blue' },
  { sequence: ['⭐️', '🌙', '☀️', '⭐️', '🌙'], answer: '☀️', label: 'Star, Moon, Sun' },
  { sequence: ['🟢', '🟣', '🟢', '🟣', '🟢'], answer: '🟣', label: 'Green, Purple' },
  { sequence: ['🟠', '🟠', '🔵', '🟠'], answer: '🟠', label: 'Orange, Orange, Blue' },
  { sequence: ['🔵', '🟢', '🟡', '🔵', '🟢'], answer: '🟡', label: 'Blue, Green, Yellow' },
  { sequence: ['🌙', '🌙', '⭐️', '🌙', '🌙'], answer: '⭐️', label: 'Moon, Moon, Star' },
  { sequence: ['🟣', '🟣', '🟣', '🟢'], answer: '🟢', label: 'Purple then Green' },
];

const SHAPES = ['Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Diamond'];

const SPOT_LEVELS = [
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
];

const PUZZLE_TILES = ['🦕', '🌈', '🚀', '⭐️', '🐯', '🍓', '🧁', '🎈', '🪐'];

const GAME_LABELS = {
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
};

const ADDITION_LEVELS = [
  { id: 'easy', name: 'Launch Pad', maxNum: 5, rounds: 8, emoji: '🚀' },
  { id: 'medium', name: 'Orbit', maxNum: 10, rounds: 10, emoji: '🛸' },
  { id: 'hard', name: 'Deep Space', maxNum: 20, rounds: 12, emoji: '🌟' },
];

const SUBTRACTION_LEVELS = [
  { id: 'easy', name: 'Gentle Glide', maxNum: 5, rounds: 8, emoji: '🪂' },
  { id: 'medium', name: 'Meteor Dodge', maxNum: 10, rounds: 10, emoji: '☄️' },
  { id: 'hard', name: 'Black Hole', maxNum: 20, rounds: 12, emoji: '🕳️' },
];

const ASTRONAUT_CATEGORIES = [
  {
    id: 'numbers',
    name: 'Count the Stars',
    emoji: '🔢',
    items: [
      { q: 'How many fingers on one hand?', answer: '5', options: ['3', '5', '7', '10'] },
      { q: 'How many days in a week?', answer: '7', options: ['5', '6', '7', '8'] },
      { q: 'How many legs does a spider have?', answer: '8', options: ['4', '6', '8', '10'] },
      { q: 'How many wheels on a car?', answer: '4', options: ['2', '3', '4', '6'] },
      { q: 'How many months in a year?', answer: '12', options: ['10', '11', '12', '14'] },
      { q: 'How many eyes do you have?', answer: '2', options: ['1', '2', '3', '4'] },
    ],
  },
  {
    id: 'shapes',
    name: 'Shape Galaxy',
    emoji: '🔷',
    items: [
      { q: 'Which shape has 3 sides?', answer: 'Triangle', options: ['Circle', 'Triangle', 'Square', 'Star'] },
      { q: 'Which shape is round?', answer: 'Circle', options: ['Circle', 'Square', 'Rectangle', 'Diamond'] },
      { q: 'Which shape has 4 equal sides?', answer: 'Square', options: ['Triangle', 'Circle', 'Square', 'Oval'] },
      { q: 'A football is shaped like a...', answer: 'Sphere', options: ['Cube', 'Sphere', 'Cone', 'Cylinder'] },
      { q: 'What shape is a dice?', answer: 'Cube', options: ['Sphere', 'Cube', 'Pyramid', 'Cylinder'] },
    ],
  },
  {
    id: 'animals',
    name: 'Space Zoo',
    emoji: '🦁',
    items: [
      { q: 'Which animal is the King of the Jungle?', answer: 'Lion', options: ['Tiger', 'Lion', 'Bear', 'Wolf'] },
      { q: 'Which animal has a trunk?', answer: 'Elephant', options: ['Giraffe', 'Elephant', 'Hippo', 'Rhino'] },
      { q: 'Which animal says "Moo"?', answer: 'Cow', options: ['Dog', 'Cat', 'Cow', 'Sheep'] },
      { q: 'Which animal can fly?', answer: 'Eagle', options: ['Fish', 'Snake', 'Eagle', 'Frog'] },
      { q: 'Which is the tallest animal?', answer: 'Giraffe', options: ['Elephant', 'Giraffe', 'Horse', 'Camel'] },
      { q: 'Which animal lives in the sea?', answer: 'Dolphin', options: ['Rabbit', 'Dolphin', 'Parrot', 'Monkey'] },
    ],
  },
  {
    id: 'body',
    name: 'Body Mission',
    emoji: '🧠',
    items: [
      { q: 'What organ pumps blood?', answer: 'Heart', options: ['Brain', 'Heart', 'Lungs', 'Stomach'] },
      { q: 'What do you use to breathe?', answer: 'Lungs', options: ['Heart', 'Lungs', 'Liver', 'Kidneys'] },
      { q: 'What do you think with?', answer: 'Brain', options: ['Heart', 'Brain', 'Stomach', 'Bones'] },
      { q: 'How many bones does a grown-up have?', answer: '206', options: ['100', '150', '206', '300'] },
      { q: 'What covers your whole body?', answer: 'Skin', options: ['Hair', 'Skin', 'Nails', 'Muscles'] },
    ],
  },
  {
    id: 'space',
    name: 'Space Facts',
    emoji: '🪐',
    items: [
      { q: 'What is the closest star to Earth?', answer: 'The Sun', options: ['The Moon', 'The Sun', 'Mars', 'Jupiter'] },
      { q: 'How many planets in our solar system?', answer: '8', options: ['6', '7', '8', '9'] },
      { q: 'What planet are we on?', answer: 'Earth', options: ['Mars', 'Earth', 'Venus', 'Mercury'] },
      { q: 'Which planet has rings?', answer: 'Saturn', options: ['Jupiter', 'Mars', 'Saturn', 'Neptune'] },
      { q: 'What do astronauts wear?', answer: 'Space suit', options: ['Raincoat', 'Space suit', 'Swimsuit', 'Armour'] },
      { q: 'Which planet is red?', answer: 'Mars', options: ['Earth', 'Mars', 'Venus', 'Neptune'] },
    ],
  },
];

const STICKERS = [
  { id: 'rocket', name: 'Rocket', emoji: '🚀', points: 10 },
  { id: 'dino', name: 'Dino', emoji: '🦕', points: 20 },
  { id: 'star', name: 'Star', emoji: '⭐️', points: 30 },
  { id: 'truck', name: 'Truck', emoji: '🛻', points: 40 },
  { id: 'heart', name: 'Heart', emoji: '💖', points: 55 },
  { id: 'planet', name: 'Planet', emoji: '🪐', points: 75 },
  { id: 'hero', name: 'Hero', emoji: '🦸‍♀️', points: 95 },
  { id: 'crown', name: 'Crown', emoji: '👑', points: 120 },
];

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => list.slice().sort(() => Math.random() - 0.5);

const getPraise = () => pickRandom(GERMAN_PRAISE);

const createBursts = () =>
  Array.from({ length: 14 }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    emoji: pickRandom(BURST_EMOJIS),
    left: Math.random() * 90 + 5,
    top: Math.random() * 70 + 10,
    delay: Math.random() * 0.3,
    size: Math.random() > 0.7 ? 'text-4xl' : 'text-3xl',
  }));

const shadeColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const createPlanetStyle = (planet) => {
  const base = planet.surface;
  const highlight = shadeColor(base, 35);
  const shadow = shadeColor(base, -25);
  return {
    width: planet.size,
    height: planet.size,
    backgroundImage: `radial-gradient(circle at 30% 25%, ${highlight}, ${base} 45%, ${shadow} 100%)`,
    boxShadow: 'inset -10px -12px 0 rgba(0,0,0,0.2), 0 12px 25px rgba(0,0,0,0.25)',
  };
};

const buildDinos = (level) => level.dinos.map((dino) => ({ ...dino, hidden: true }));

const buildLetterRound = () => {
  const target = pickRandom(LETTERS);
  const options = shuffle([
    target,
    ...shuffle(LETTERS.filter((item) => item.letter !== target.letter)).slice(0, 3),
  ]);
  return { target, options };
};

const buildMemoryDeck = (level) =>
  shuffle(
    level.emojis.flatMap((emoji, index) => [
      { id: `${emoji}-${index}-a`, emoji, flipped: false, matched: false },
      { id: `${emoji}-${index}-b`, emoji, flipped: false, matched: false },
    ]),
  );

const buildParkRound = () => {
  const target = pickRandom(GERMAN_COLORS);
  let other = pickRandom(GERMAN_COLORS);
  while (other.name === target.name) other = pickRandom(GERMAN_COLORS);
  return { target, options: shuffle([target, other]) };
};

const buildPatternRound = () => {
  const round = pickRandom(PATTERN_ROUNDS);
  const decoys = shuffle(PATTERN_TOKENS.filter((token) => token !== round.answer)).slice(0, 2);
  return { ...round, options: shuffle([round.answer, ...decoys]) };
};

const buildPhonicsRound = () => {
  const target = pickRandom(PHONICS_ITEMS);
  const options = shuffle([
    target,
    ...shuffle(PHONICS_ITEMS.filter((item) => item.letter !== target.letter)).slice(0, 2),
  ]);
  return { target, options };
};

const buildMatchRound = (items, optionCount = 4) => {
  const target = pickRandom(items);
  const options = shuffle([
    target,
    ...shuffle(items.filter((item) => item.name !== target.name)).slice(0, optionCount - 1),
  ]);
  return { target, options };
};

const isPuzzleSolved = (tiles) =>
  tiles.every((tile, index) => tile.emoji === PUZZLE_TILES[index]);

const buildPuzzleTiles = () => {
  const tiles = PUZZLE_TILES.map((emoji, index) => ({ id: `tile-${index}`, emoji }));
  let shuffled = shuffle(tiles);
  while (isPuzzleSolved(shuffled)) {
    shuffled = shuffle(tiles);
  }
  return shuffled;
};

const pickFriendlyVoice = (voices, lang) => {
  if (!voices || voices.length === 0) return null;
  const langPrefix = lang?.split('-')[0]?.toLowerCase();
  const matching = langPrefix
    ? voices.filter((voice) => voice.lang?.toLowerCase().startsWith(langPrefix))
    : voices;
  const pool = matching.length ? matching : voices;
  const friendly = pool.find((voice) =>
    FRIENDLY_VOICE_NAMES.some((name) => voice.name.toLowerCase().includes(name.toLowerCase())),
  );
  const gentle = pool.find((voice) => /female|child|junior/i.test(voice.name));
  return friendly || gentle || pool[0];
};

const getUnlockedStickers = (points) => STICKERS.filter((sticker) => points >= sticker.points);

const useSfx = (enabled) => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playTone = useCallback((ctx, { freq, duration, start = 0, type = 'sine', gain = 0.18 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0.0001;

    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  }, []);

  const playSweep = useCallback((ctx, { from, to, duration, start = 0, type = 'triangle', gain = 0.14 }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, now + start);
    osc.frequency.exponentialRampToValueAtTime(to, now + start + duration);

    amp.gain.value = 0.0001;
    osc.connect(amp);
    amp.connect(ctx.destination);

    const startAt = now + start;
    osc.start(startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  }, []);

  return useCallback(
    (name) => {
      if (!enabledRef.current) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }

      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (name === 'click') {
        playTone(ctx, { freq: 520, duration: 0.12, gain: 0.12, type: 'triangle' });
      }

      if (name === 'pop') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.18, type: 'square' });
        playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12, start: 0.04, type: 'square' });
      }

      if (name === 'chime') {
        playTone(ctx, { freq: 784, duration: 0.18, gain: 0.16 });
        playTone(ctx, { freq: 1046, duration: 0.18, gain: 0.14, start: 0.12 });
      }

      if (name === 'success') {
        playTone(ctx, { freq: 523, duration: 0.12, gain: 0.16 });
        playTone(ctx, { freq: 659, duration: 0.12, gain: 0.16, start: 0.12 });
        playTone(ctx, { freq: 784, duration: 0.16, gain: 0.16, start: 0.24 });
      }

      if (name === 'oops') {
        playTone(ctx, { freq: 220, duration: 0.18, gain: 0.12, type: 'sine' });
      }

      if (name === 'swish') {
        playSweep(ctx, { from: 900, to: 320, duration: 0.25, gain: 0.14 });
      }

      if (name === 'flip') {
        playTone(ctx, { freq: 620, duration: 0.08, gain: 0.12, type: 'triangle' });
      }

      if (name === 'sparkle') {
        playTone(ctx, { freq: 880, duration: 0.12, gain: 0.15, type: 'sine' });
        playTone(ctx, { freq: 1320, duration: 0.16, gain: 0.12, start: 0.08, type: 'triangle' });
      }

      if (name === 'launch') {
        playSweep(ctx, { from: 300, to: 1200, duration: 0.4, gain: 0.2, type: 'sawtooth' });
        playTone(ctx, { freq: 960, duration: 0.08, gain: 0.1, start: 0.2, type: 'square' });
      }

      if (name === 'whoosh') {
        playSweep(ctx, { from: 1400, to: 180, duration: 0.5, gain: 0.2, type: 'sine' });
      }
    },
    [playSweep, playTone],
  );
};

const useVoice = (enabled) => {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return useCallback((text, { lang = 'en-US', rate = 0.92, pitch = 1.18 } = {}) => {
    if (!enabledRef.current) return;
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const preferred = pickFriendlyVoice(voices, lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    if (preferred) utterance.voice = preferred;

    synth.cancel();
    synth.speak(utterance);
  }, []);
};

const useAmbientMusic = (enabled) => {
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);

  useEffect(() => {
    const stop = () => {
      if (!nodesRef.current) return;
      const { nodes, master, filter } = nodesRef.current;
      nodes.forEach((node) => {
        try {
          node.osc.stop();
          node.lfo.stop();
        } catch (err) {
          // ignore
        }
        node.osc.disconnect();
        node.lfo.disconnect();
        node.gain.disconnect();
        node.lfoGain.disconnect();
      });
      master.disconnect();
      filter.disconnect();
      nodesRef.current = null;
    };

    if (!enabled) {
      stop();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (nodesRef.current) return;

    const master = ctx.createGain();
    master.gain.value = 0.03;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    master.connect(filter);
    filter.connect(ctx.destination);

    const freqs = [220, 277.18, 329.63];
    const nodes = freqs.map((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.03 + index * 0.015;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(master);

      osc.start();
      lfo.start();

      return { osc, gain, lfo, lfoGain };
    });

    nodesRef.current = { nodes, master, filter };

    return stop;
  }, [enabled]);
};

const SoundToggle = ({ soundOn, onToggle, className = '' }) => (
  <button
    onClick={onToggle}
    className={`bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:scale-105 transition ${className}`}
    aria-label={soundOn ? 'Sound on' : 'Sound off'}
  >
    {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
  </button>
);

const CelebrationOverlay = ({ celebration }) => {
  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
      {celebration.bursts.map((burst) => (
        <span
          key={burst.id}
          className={`absolute ${burst.size} animate-float-up`}
          style={{ left: `${burst.left}%`, top: `${burst.top}%`, animationDelay: `${burst.delay}s` }}
        >
          {burst.emoji}
        </span>
      ))}
      <div className="relative z-10 bg-white/95 rounded-3xl px-10 py-8 text-center shadow-2xl border-4 border-yellow-200 animate-pop-in">
        <div className="text-5xl mb-2">🎉</div>
        <div className="text-3xl font-black text-amber-600">{celebration.message}</div>
        <div className="mt-2 text-lg font-semibold text-slate-700">+{celebration.points} Sterne</div>
        <div className="text-slate-500 font-bold">Gesamt: {celebration.total}</div>
      </div>
    </div>
  );
};

const RewardsShelf = ({ points }) => {
  return (
    <div className="mt-6 w-full max-w-5xl bg-white/70 rounded-3xl p-4 border-4 border-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-slate-700">Sticker Shelf</h3>
        <span className="text-sm font-semibold text-slate-500">Unlock more by earning stars!</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {STICKERS.map((sticker) => {
          const unlocked = points >= sticker.points;
          return (
            <div
              key={sticker.id}
              className={`rounded-2xl p-3 text-center border-2 transition ${
                unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className={`text-3xl ${unlocked ? '' : 'opacity-30'}`}>{sticker.emoji}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">{sticker.name}</div>
              <div className="text-[10px] text-slate-400">{sticker.points}⭐</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PointsSummaryScreen = ({ summary, totalPoints, onDone }) => {
  const unlockedNow = STICKERS.filter(
    (sticker) => totalPoints >= sticker.points && totalPoints - summary.points < sticker.points,
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-yellow-100 via-amber-100 to-yellow-200 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/60 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white/90 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 text-center max-w-lg w-full">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-3xl font-black text-amber-700">Gut gemacht!</h2>
        <p className="text-slate-600 font-semibold mt-2">{GAME_LABELS[summary.gameId]}</p>
        <div className="mt-4 text-2xl font-black text-amber-600">+{summary.points} Sterne</div>
        <div className="text-slate-500 font-semibold">Gesamt: {totalPoints}</div>

        {unlockedNow.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-amber-700">New Stickers!</div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {unlockedNow.map((sticker) => (
                <div
                  key={sticker.id}
                  className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2"
                >
                  <div className="text-3xl">{sticker.emoji}</div>
                  <div className="text-xs font-bold text-slate-600">{sticker.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onDone}
          className="mt-6 bg-blue-500 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          Zurueck zum Menu
        </button>
      </div>
    </div>
  );
};

const PlanetBall = ({ planet, onClick }) => {
  const style = createPlanetStyle(planet);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
    >
      <div className="relative rounded-full overflow-hidden" style={style}>
        <div className="absolute inset-0 rounded-full" />
        <div className="absolute top-2 left-4 w-3 h-3 bg-white/60 rounded-full" />
        {planet.ring && (
          <div
            className="absolute inset-[-12px] rounded-full border-4 opacity-70 skew-x-12 scale-x-150"
            style={{ borderColor: planet.ringColor || 'rgba(255,255,255,0.6)' }}
          />
        )}
      </div>
      <span className="font-bold text-sm text-white/90 group-hover:text-white">{planet.name}</span>
    </button>
  );
};

const SolarSystem = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [activeFact, setActiveFact] = useState(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() > 0.85 ? 3 : 2,
      })),
    [],
  );

  useEffect(() => {
    if (!selectedPlanet) {
      setActiveFact(null);
      return;
    }
    speak(
      `${selectedPlanet.name}. ${selectedPlanet.subtitle}. ${selectedPlanet.facts[0]} ${selectedPlanet.facts[1]}`,
    );
  }, [selectedPlanet, speak]);

  const handleFact = (fact) => {
    setActiveFact(fact);
    playSfx('sparkle');
    speak(`Fun fact. ${fact}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10">
        <button
          onClick={onBack}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"
        >
          <Home />
        </button>
        <h2 className="text-2xl font-bold text-yellow-300 font-comic">Space Explorer</h2>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="bg-white/20 text-white" />
      </div>

      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-[-20%] w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 blur-3xl rounded-full" />
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-6 px-8 no-scrollbar z-10 pb-8">
        <div className="flex-shrink-0 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold shadow-[0_0_80px_rgba(250,204,21,0.9)]">
          SUN
        </div>
        {PLANETS.map((planet) => (
          <PlanetBall
            key={planet.name}
            planet={planet}
            onClick={() => {
              playSfx('chime');
              setSelectedPlanet(planet);
            }}
          />
        ))}
      </div>

      {selectedPlanet && (
        <div className="absolute bottom-0 left-0 right-0 bg-white text-slate-900 p-6 rounded-t-3xl shadow-2xl animate-bounce-up z-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-indigo-600 mb-1">{selectedPlanet.name}</h3>
            <p className="text-slate-500 font-semibold mb-4">{selectedPlanet.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {selectedPlanet.stats.map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <div className="text-xl">{stat.emoji}</div>
                <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
                <div className="font-bold text-slate-700">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-slate-500 font-semibold mb-2">
            Tap a fact to hear it!
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPlanet.facts.map((fact) => (
              <button
                key={fact}
                onClick={() => handleFact(fact)}
                className={`px-3 py-2 rounded-2xl border-2 text-sm font-semibold transition ${
                  activeFact === fact
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {fact}
              </button>
            ))}
          </div>
          {activeFact && (
            <div className="text-center text-indigo-600 font-bold mb-4">✨ {activeFact}</div>
          )}
          <button
            onClick={() => {
              onCelebrate(undefined, 4);
              setSelectedPlanet(null);
            }}
            className={`${THEME.primary} text-white w-full py-3 rounded-full font-bold text-xl ${THEME.button} hover:bg-blue-600`}
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};

const DinoDetective = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = DINO_LEVELS[levelIndex];
  const [dinos, setDinos] = useState(() => buildDinos(level));
  const [foundDino, setFoundDino] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const foundCount = dinos.filter((dino) => !dino.hidden).length;

  useEffect(() => {
    setDinos(buildDinos(level));
    setFoundDino(null);
    setPendingReward(null);
    setShowLevelComplete(false);
  }, [level]);

  const handleFind = (index) => {
    setDinos((prev) => {
      if (!prev[index].hidden) return prev;
      const next = prev.map((dino, i) => (i === index ? { ...dino, hidden: false } : dino));
      setFoundDino(next[index]);
      setPendingReward(4);
      playSfx('pop');
      if (next.every((dino) => !dino.hidden)) {
        setTimeout(() => playSfx('success'), 250);
      }
      return next;
    });
  };

  const allFound = dinos.every((dino) => !dino.hidden);

  useEffect(() => {
    if (foundDino) {
      speak(`You found ${foundDino.name}. ${foundDino.fact}`);
    }
  }, [foundDino, speak]);

  useEffect(() => {
    if (allFound && !foundDino) {
      speak('Du hast alle gefunden. Super!', { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      setShowLevelComplete(true);
    }
  }, [allFound, foundDino, speak]);

  const handleNextLevel = () => {
    onCelebrate(getPraise(), 10, 200);
    if (levelIndex < DINO_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-200 via-green-200 to-green-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-70" />
        <div className="absolute top-0 right-0 w-52 h-40 bg-white/60 rounded-[50%] blur-2xl" />
        <div className="absolute top-16 left-1/2 w-40 h-28 bg-white/40 rounded-[50%] blur-xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-green-900 drop-shadow-sm">{level.name}</h2>
          <p className="text-green-900/80 font-semibold">
            Level {levelIndex + 1} / {DINO_LEVELS.length} · Found {foundCount} / {dinos.length}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="z-10 text-center mt-2 px-4">
        <p className="text-green-900 font-medium">{level.hint}</p>
      </div>

      <div className="flex-1 relative z-10">
        <div className="absolute bottom-0 w-full h-28 bg-emerald-700" />
        <div className="absolute bottom-12 left-[-10%] w-64 h-32 bg-emerald-600 rounded-full opacity-90" />
        <div className="absolute bottom-16 right-[-5%] w-72 h-36 bg-emerald-800 rounded-full opacity-90" />
        <div className="absolute bottom-8 left-1/3 w-52 h-24 bg-emerald-700 rounded-full opacity-90" />

        {dinos.map((dino, i) => (
          <button
            key={dino.id}
            onClick={() => handleFind(i)}
            className="absolute transition-all duration-500 focus:outline-none"
            style={{ left: `${dino.x}%`, top: `${dino.y}%` }}
          >
            {dino.hidden ? (
              <div className="relative w-28 h-24 animate-wiggle">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16 bg-emerald-700 rounded-full shadow-lg" />
                <div className="absolute bottom-6 left-1 w-14 h-12 bg-emerald-600 rounded-full" />
                <div className="absolute bottom-5 right-1 w-16 h-12 bg-emerald-500 rounded-full" />
                <div className="absolute bottom-2 left-8 w-10 h-10 bg-emerald-600 rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40">🌿</span>
              </div>
            ) : (
              <div className="text-6xl animate-pop-in drop-shadow-2xl transform hover:scale-110 transition-transform">
                {dino.emoji}
              </div>
            )}
          </button>
        ))}
      </div>

      {foundDino && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-orange-50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-orange-200 animate-scale-in">
            <div className="text-8xl mb-4">{foundDino.emoji}</div>
            <h3 className="text-3xl font-black text-orange-500 mb-2">{foundDino.name}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-orange-100 mb-6">
              <p className="text-lg text-slate-700 font-medium">"{foundDino.fact}"</p>
            </div>
            <button
              onClick={() => {
                if (pendingReward) {
                  onCelebrate(getPraise(), pendingReward, 200);
                }
                setPendingReward(null);
                setFoundDino(null);
              }}
              className="bg-blue-500 text-white w-full py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-600"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showLevelComplete && !foundDino && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 p-8 rounded-3xl text-center shadow-xl animate-bounce pointer-events-auto">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-3xl font-bold text-green-600">{getPraise()}</h2>
            <p className="text-slate-600 font-semibold mt-2">Level geschafft!</p>
            <button
              onClick={handleNextLevel}
              className="mt-4 text-blue-500 font-bold underline"
            >
              {levelIndex < DINO_LEVELS.length - 1 ? 'Next Level' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const JetSkyShapes = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState(SHAPES[0]);
  const [cleared, setCleared] = useState(false);
  const [completedShapes, setCompletedShapes] = useState([]);
  const drawDistanceRef = useRef(0);
  const autoCompleteRef = useRef(false);
  const allCompleteRef = useRef(false);

  useEffect(() => {
    speak(`Trace the ${shape}.`);
  }, [shape, speak]);

  useEffect(() => {
    drawDistanceRef.current = 0;
    autoCompleteRef.current = false;
  }, [shape, cleared, markComplete, playSfx, speak]);

  const markComplete = useCallback((praise) => {
    setCompletedShapes((prev) => {
      if (prev.includes(shape)) return prev;
      const next = [...prev, shape];
      const message = praise || getPraise();
      onCelebrate(message, 4, 200);
      return next;
    });
  }, [onCelebrate, shape]);

  useEffect(() => {
    if (completedShapes.length !== SHAPES.length) return;
    if (allCompleteRef.current) return;
    allCompleteRef.current = true;
    playSfx('whoosh');
    speak('Alle Formen geschafft!', { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
    onCelebrate(getPraise(), 12, 300);
  }, [completedShapes, onCelebrate, playSfx, speak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 0;

    const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
      let rotation = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i += 1) {
        x = cx + Math.cos(rotation) * outerRadius;
        y = cy + Math.sin(rotation) * outerRadius;
        ctx.lineTo(x, y);
        rotation += step;

        x = cx + Math.cos(rotation) * innerRadius;
        y = cy + Math.sin(rotation) * innerRadius;
        ctx.lineTo(x, y);
        rotation += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    const drawHeart = (cx, cy, size) => {
      const topCurveHeight = size * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.3);
      ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
      ctx.bezierCurveTo(
        cx - size / 2,
        cy + size * 0.8,
        cx,
        cy + size,
        cx,
        cy + size,
      );
      ctx.bezierCurveTo(
        cx,
        cy + size,
        cx + size / 2,
        cy + size * 0.8,
        cx + size / 2,
        cy + topCurveHeight,
      );
      ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + size * 0.3);
      ctx.closePath();
    };

    const drawGuide = () => {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 10;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (shape === 'Circle') ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      if (shape === 'Square') ctx.rect(cx - 110, cy - 110, 220, 220);
      if (shape === 'Triangle') {
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx + 130, cy + 90);
        ctx.lineTo(cx - 130, cy + 90);
        ctx.closePath();
      }
      if (shape === 'Diamond') {
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx + 130, cy);
        ctx.lineTo(cx, cy + 130);
        ctx.lineTo(cx - 130, cy);
        ctx.closePath();
      }
      if (shape === 'Star') {
        drawStar(cx, cy, 5, 130, 55);
      }
      if (shape === 'Heart') {
        drawHeart(cx, cy - 60, 180);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 100;
      drawGuide();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = (event) => {
      if (!isDrawing) return;
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const distance = Math.hypot(x - lastX, y - lastY);
      drawDistanceRef.current += distance;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsl(${hue}, 100%, 55%)`;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
      hue += 1;
    };

    const startDrawing = (event) => {
      isDrawing = true;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
    };

    const stopDrawing = () => {
      isDrawing = false;
      if (drawDistanceRef.current > 520 && !autoCompleteRef.current) {
        autoCompleteRef.current = true;
        const praise = getPraise();
        markComplete(praise);
        playSfx('sparkle');
        speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [shape, cleared]);

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      <div className="p-4 bg-sky-200 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80">
          <Home />
        </button>
        <div className="flex gap-2 flex-wrap">
          {SHAPES.map((option) => (
            <button
              key={option}
              onClick={() => {
                setShape(option);
                setCleared((prev) => !prev);
                playSfx('swish');
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                shape === option ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {completedShapes.includes(option) ? `✓ ${option}` : option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCleared((prev) => !prev);
              playSfx('swish');
            }}
            className="bg-red-400 text-white p-2 rounded-full hover:bg-red-500"
          >
            <Cloud />
          </button>
          <button
            onClick={() => {
              const praise = getPraise();
              markComplete(praise);
              playSfx('sparkle');
              speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
            }}
            className="bg-white text-sky-700 px-3 py-2 rounded-full font-bold shadow-lg"
          >
            Done!
          </button>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-4 left-0 w-full text-center text-sky-700 font-bold opacity-70 pointer-events-none">
          Trace the shape with your finger! ({completedShapes.length}/{SHAPES.length} complete)
        </div>
        <div className="absolute top-16 left-4 w-32 h-16 bg-white/70 rounded-full blur-lg animate-drift-left" />
        <div className="absolute top-24 right-10 w-40 h-20 bg-white/70 rounded-full blur-lg animate-drift-right" />
        <div className="absolute bottom-10 left-12 text-4xl animate-bounce-slow">✈️</div>
        <canvas ref={canvasRef} className="touch-none cursor-crosshair" />
      </div>
    </div>
  );
};

const GermanGarage = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [mode, setMode] = useState('paint');
  const [targetColor, setTargetColor] = useState(() => pickRandom(GERMAN_COLORS));
  const [painted, setPainted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [parkRound, setParkRound] = useState(buildParkRound);
  const [parkFeedback, setParkFeedback] = useState('');
  const [matchRound, setMatchRound] = useState(() => buildMatchRound(GERMAN_NUMBERS));
  const [matchFeedback, setMatchFeedback] = useState('');

  const matchMode = GERMAN_MATCH_MODES.find((entry) => entry.id === mode);
  const modeTabs = [
    { id: 'paint', label: 'Farben' },
    { id: 'park', label: 'Garage' },
    ...GERMAN_MATCH_MODES.map((entry) => ({ id: entry.id, label: entry.label })),
  ];

  useEffect(() => {
    if (mode === 'paint') {
      speak(`Finde ${targetColor.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
      return;
    }
    if (mode === 'park') {
      speak(`Parke in ${parkRound.target.name}`, { lang: 'de-DE', rate: 0.85, pitch: 1.05 });
      return;
    }
    if (matchMode) {
      speak(`${matchMode.prompt} ${matchRound.target.name}`, {
        lang: 'de-DE',
        rate: 0.85,
        pitch: 1.05,
      });
    }
  }, [mode, targetColor.name, parkRound.target.name, matchMode, matchRound.target?.name, speak]);

  useEffect(() => {
    if (!matchMode) return;
    setMatchRound(buildMatchRound(matchMode.items));
    setMatchFeedback('');
  }, [matchMode]);

  const nextPaint = () => {
    const next = pickRandom(GERMAN_COLORS);
    setTargetColor(next);
    setPainted(false);
    setFeedback('');
  };

  const nextPark = () => {
    setParkRound(buildParkRound());
    setParkFeedback('');
  };

  const nextMatch = () => {
    if (!matchMode) return;
    setMatchRound(buildMatchRound(matchMode.items));
    setMatchFeedback('');
  };

  const handlePaint = (colorObj) => {
    if (colorObj.name === targetColor.name) {
      const praise = getPraise();
      setPainted(true);
      setFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 5, 200);
      setTimeout(nextPaint, 1600);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  const handlePark = (colorObj) => {
    if (colorObj.name === parkRound.target.name) {
      const praise = getPraise();
      setParkFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 6, 200);
      setTimeout(nextPark, 1500);
    } else {
      setParkFeedback('Nope, try the other garage!');
      playSfx('oops');
    }
  };

  const handleMatchPick = (option) => {
    if (!matchMode) return;
    if (option.name === matchRound.target.name) {
      const praise = getPraise();
      setMatchFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 5, 200);
      setTimeout(nextMatch, 1400);
    } else {
      setMatchFeedback('Nochmal!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 via-slate-100 to-orange-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-10 w-52 h-52 bg-orange-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="flex gap-2 bg-white/80 p-1 rounded-full shadow-sm overflow-x-auto no-scrollbar">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                playSfx('click');
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                mode === tab.id ? 'bg-blue-500 text-white' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-200 text-center mb-8 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">
            {mode === 'paint' && 'Mechanic Mission'}
            {mode === 'park' && 'Garage Mission'}
            {matchMode && `${matchMode.label} Mission`}
          </p>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {mode === 'paint' && 'Paint the Car...'}
            {mode === 'park' && 'Park the Car...'}
            {matchMode && `Finde ${matchRound.target?.name}`}
          </h2>
          <div className="text-4xl font-black text-blue-600 mb-2">
            {mode === 'paint' && targetColor.name}
            {mode === 'park' && parkRound.target.name}
            {matchMode && matchRound.target?.emoji}
          </div>
          {mode === 'paint' && feedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{feedback}</div>
          )}
          {mode === 'park' && parkFeedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{parkFeedback}</div>
          )}
          {matchMode && matchFeedback && (
            <div className="text-xl font-bold text-green-500 animate-bounce">{matchFeedback}</div>
          )}
        </div>

        {mode === 'paint' && (
          <>
            <div className="relative w-72 h-36 mb-10">
              <div className="absolute inset-0 bg-slate-200 rounded-3xl border-4 border-slate-300 shadow-inner" />
              <div
                className="absolute bottom-4 left-6 right-6 h-20 rounded-2xl shadow-lg transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div
                className="absolute bottom-20 left-16 right-16 h-16 rounded-t-full transition-colors duration-500"
                style={{ backgroundColor: painted ? targetColor.hex : '#cbd5e1' }}
              />
              <div className="absolute -bottom-4 left-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-300" />
              <div className="absolute bottom-16 left-12 text-4xl animate-bounce-slow">🐯</div>
            </div>

            <div className="grid grid-cols-5 gap-3 w-full max-w-xl">
              {GERMAN_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handlePaint(color)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div
                    className="w-14 h-20 rounded-xl shadow-md border-b-4 border-black/10 group-active:scale-95 transition-transform relative overflow-hidden group-hover:brightness-110"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute top-0 w-full h-4 bg-white/20" />
                    <div className="absolute bottom-2 right-2 text-white/50">
                      <Palette size={14} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{color.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'park' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            <div className="text-6xl">🚗</div>
            <div
              className="w-60 h-20 rounded-3xl shadow-lg border-4 border-white"
              style={{ backgroundColor: parkRound.target.hex }}
            />
            <div className="grid grid-cols-2 gap-6 w-full">
              {parkRound.options.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handlePark(option)}
                  className="group relative bg-white rounded-3xl p-4 shadow-lg border-4 border-slate-200 hover:-translate-y-1 transition"
                >
                  <div className="text-sm font-bold text-slate-500 mb-2">Garage</div>
                  <div className="text-2xl font-black text-slate-700 mb-3">{option.name}</div>
                  <div className="h-24 rounded-2xl border-4 border-slate-200 overflow-hidden relative">
                    <div className="absolute inset-0" style={{ backgroundColor: option.hex }} />
                    <div className="absolute inset-x-4 top-4 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-10 h-2 bg-white/30 rounded-full" />
                    <div className="absolute inset-x-4 top-16 h-2 bg-white/30 rounded-full" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {matchMode && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {matchRound.options.map((option) => (
              <button
                key={`${mode}-${option.name}`}
                onClick={() => handleMatchPick(option)}
                className="bg-white rounded-3xl p-4 shadow-lg border-4 border-slate-200 hover:-translate-y-1 transition"
              >
                <div className="text-4xl mb-2">{option.emoji}</div>
                <div className="text-lg font-black text-slate-700">{option.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MonsterMath = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [problem, setProblem] = useState({ a: 2, b: 2, ans: 4 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const newProblem = () => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * 5);
    const b = Math.ceil(Math.random() * 3);
    setProblem({ a, b, ans: a * b });
  };

  useEffect(() => {
    speak(`What is ${problem.a} times ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const options = useMemo(() => {
    const optionsSet = new Set([problem.ans]);
    while (optionsSet.size < 3) {
      const delta = Math.ceil(Math.random() * 3);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(1, problem.ans + sign * delta);
      optionsSet.add(candidate);
    }
    return shuffle(Array.from(optionsSet));
  }, [problem.ans]);

  const check = (answer) => {
    if (answer === problem.ans) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setSuccess(true);
      setStreak((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      setTimeout(newProblem, 2000);
    } else {
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Stunt Jump Math</h2>
          <p className="text-orange-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="mt-12 text-center z-10 px-4">
        <div
          className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-10 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.a}
          </div>
          <div className="text-orange-400">×</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">
            {problem.b}
          </div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">
            ?
          </div>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => check(option)}
              className="w-20 h-20 bg-blue-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:shadow-none active:translate-y-2 transition-all hover:bg-blue-600"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${
          success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'
        }`}
      >
        🛻
      </div>
      <div className="absolute bottom-0 w-full h-14 bg-orange-900/20" />

      {success && (
        <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-green-500 animate-bounce">
          {successMessage}
        </div>
      )}
    </div>
  );
};

const LetterLaunch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildLetterRound);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);

  const promptText = `${round.target.letter}. ${round.target.letter} is for ${round.target.word}.`;

  const sayPrompt = useCallback(() => {
    speak(`Find the letter ${promptText}`);
  }, [promptText, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  const nextRound = () => {
    setRound(buildLetterRound());
    setLaunching(false);
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setLaunching(true);
      setFeedback(praise);
      setStars((prev) => prev + 1);
      playSfx('launch');
      playSfx('success');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      playSfx('oops');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-200 via-sky-100 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-44 h-24 bg-white/70 rounded-full blur-2xl animate-drift-left" />
        <div className="absolute top-24 right-6 w-52 h-28 bg-white/70 rounded-full blur-2xl animate-drift-right" />
        <div className="absolute bottom-20 left-6 w-64 h-32 bg-white/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-sky-700">Letter Launch</h2>
          <p className="text-sky-700/70 font-semibold">Stars: {stars}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="bg-white/90 p-6 rounded-3xl shadow-xl border-4 border-sky-200 text-center mb-6 w-full max-w-md">
          <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">Launch Mission</p>
          <div className="text-7xl font-black text-sky-700 mb-2">{round.target.letter}</div>
          <div className="text-2xl font-bold text-slate-700">
            {round.target.word} {round.target.emoji}
          </div>
          <button onClick={sayPrompt} className="mt-4 text-sky-600 font-semibold">
            🔊 Hear the letter
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {round.options.map((option) => (
            <button
              key={option.letter}
              onClick={() => handlePick(option)}
              className="bg-white text-slate-800 text-4xl font-black rounded-3xl py-6 shadow-lg border-4 border-sky-200 hover:-translate-y-1 transition"
            >
              {option.letter}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-500 animate-bounce">{feedback}</div>}

        <div className="relative w-full max-w-md h-40 mt-6">
          <div className="absolute bottom-0 w-full h-10 bg-sky-300/70 rounded-full" />
          <div
            className="absolute bottom-6 left-6 text-6xl transition-transform duration-1000"
            style={{
              transform: launching ? 'translate(220px, -120px) rotate(-10deg)' : 'translate(0, 0)',
            }}
          >
            🚀
          </div>
          <div
            className={`absolute bottom-24 right-12 text-3xl transition-opacity duration-500 ${
              launching ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ✨✨
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoryMatch = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = MEMORY_LEVELS[levelIndex];
  const [deck, setDeck] = useState(() => buildMemoryDeck(level));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const matches = deck.filter((card) => card.matched).length / 2;

  useEffect(() => {
    setDeck(buildMemoryDeck(level));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setShowLevelComplete(false);
  }, [level]);

  useEffect(() => {
    speak(`Memory level ${levelIndex + 1}. ${level.name}.`);
  }, [levelIndex, level.name, speak]);

  useEffect(() => {
    if (matches === level.emojis.length && !showLevelComplete) {
      const praise = getPraise();
      speak('You matched them all. Fantastic memory!');
      playSfx('success');
      setShowLevelComplete(true);
      onCelebrate(praise, 12, 300);
    }
  }, [matches, level.emojis.length, onCelebrate, playSfx, showLevelComplete, speak]);

  const handleFlip = (index) => {
    if (locked) return;
    setDeck((prev) => {
      if (prev[index].flipped || prev[index].matched) return prev;
      const next = prev.map((card, i) => (i === index ? { ...card, flipped: true } : card));
      return next;
    });
    setFlipped((prev) => (prev.includes(index) ? prev : [...prev, index]));
    playSfx('flip');
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped;
    setLocked(true);
    setMoves((prev) => prev + 1);

    if (deck[first].emoji === deck[second].emoji) {
      setDeck((prev) =>
        prev.map((card, i) =>
          i === first || i === second ? { ...card, matched: true } : card,
        ),
      );
      setFlipped([]);
      setLocked(false);
      playSfx('sparkle');
      onCelebrate(getPraise(), 4, 200);
    } else {
      setTimeout(() => {
        setDeck((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, flipped: false } : card,
          ),
        );
        setFlipped([]);
        setLocked(false);
        playSfx('oops');
      }, 700);
    }
  }, [deck, flipped, onCelebrate, playSfx]);

  const handleNextLevel = () => {
    const nextIndex = levelIndex < MEMORY_LEVELS.length - 1 ? levelIndex + 1 : 0;
    setLevelIndex(nextIndex);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-rose-600">Memory Match</h2>
          <p className="text-rose-600/70 font-semibold">
            Level {levelIndex + 1}/{MEMORY_LEVELS.length} · {level.name}
          </p>
          <p className="text-rose-600/70 font-semibold">
            Matches: {matches} · Moves: {moves}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button
          onClick={() => speak('Find the matching pairs.')}
          className="mb-4 text-rose-600 font-semibold"
        >
          🔊 Hear the mission
        </button>

        <div
          className="grid gap-4 w-full max-w-3xl"
          style={{ gridTemplateColumns: `repeat(${level.columns}, minmax(0, 1fr))` }}
        >
          {deck.map((card, index) => {
            const isFaceUp = card.flipped || card.matched;
            return (
              <div key={card.id} style={{ perspective: '900px' }}>
                <button onClick={() => handleFlip(index)} className="relative w-full aspect-square">
                  <div
                    className="absolute inset-0 transition-transform duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-3xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      🌈
                    </div>
                    <div
                      className="absolute inset-0 bg-rose-500 rounded-2xl border-4 border-rose-200 shadow-lg flex items-center justify-center text-4xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {showLevelComplete && (
          <div className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-rose-600">{getPraise()}</h3>
            <button onClick={handleNextLevel} className="mt-3 text-rose-600 font-semibold">
              {levelIndex < MEMORY_LEVELS.length - 1 ? 'Next level' : 'Play again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PatternParade = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildPatternRound);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);

  const nextRound = () => {
    setRound(buildPatternRound());
    setFeedback('');
  };

  useEffect(() => {
    speak(`What comes next? ${round.label}`);
  }, [round.label, speak]);

  const handlePick = (option) => {
    if (option === round.answer) {
      const praise = getPraise();
      setFeedback(praise);
      setStreak((prev) => prev + 1);
      playSfx('sparkle');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-52 h-32 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-amber-700">Pattern Parade</h2>
          <p className="text-amber-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <button
          onClick={() => speak(`What comes next? ${round.label}`)}
          className="mb-4 text-amber-700 font-semibold"
        >
          🔊 Hear the pattern
        </button>

        <div
          className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-amber-200 mb-6 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="flex items-center gap-4 text-4xl">
            {round.sequence.map((token, index) => (
              <div key={`${token}-${index}`} className="w-12 h-12 flex items-center justify-center">
                {token}
              </div>
            ))}
            <div className="w-12 h-12 rounded-2xl border-4 border-dashed border-amber-300 flex items-center justify-center text-2xl">
              ?
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap justify-center">
          {round.options.map((option) => (
            <button
              key={option}
              onClick={() => handlePick(option)}
              className="w-20 h-20 bg-white text-4xl rounded-3xl shadow-lg border-4 border-amber-200 hover:-translate-y-1 transition"
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-amber-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const LetterTrace = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caseMode, setCaseMode] = useState('upper');
  const [cleared, setCleared] = useState(false);
  const drawDistanceRef = useRef(0);
  const autoCompleteRef = useRef(false);

  const current = TRACE_LETTERS[currentIndex];
  const letterChar = caseMode === 'upper' ? current.upper : current.lower;

  useEffect(() => {
    speak(`Trace the ${caseMode === 'upper' ? 'big' : 'small'} ${letterChar}. ${current.word}.`);
  }, [caseMode, letterChar, current.word, speak]);

  useEffect(() => {
    drawDistanceRef.current = 0;
    autoCompleteRef.current = false;
  }, [letterChar, cleared, caseMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const drawGuide = () => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 220px "Fredoka", "Baloo 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 12;
      ctx.setLineDash([24, 16]);
      ctx.strokeText(letterChar, canvas.width / 2, canvas.height / 2 + 20);
      ctx.setLineDash([]);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight - 160;
      drawGuide();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = (event) => {
      if (!isDrawing) return;
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const distance = Math.hypot(x - lastX, y - lastY);
      drawDistanceRef.current += distance;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      [lastX, lastY] = [x, y];
    };

    const startDrawing = (event) => {
      isDrawing = true;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
    };

    const stopDrawing = () => {
      isDrawing = false;
      if (drawDistanceRef.current > 320 && !autoCompleteRef.current) {
        autoCompleteRef.current = true;
        const praise = getPraise();
        onCelebrate(praise, 8, 300);
        playSfx('sparkle');
        speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [letterChar, cleared, playSfx, speak]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-sky-100 to-indigo-100">
      <div className="p-4 bg-white/70 flex justify-between items-center shadow-md z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full hover:bg-white/80">
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-blue-700">Letter Trace</h2>
          <p className="text-blue-700/70 font-semibold">
            {letterChar} is for {current.word}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {TRACE_LETTERS.map((item, index) => (
            <button
              key={item.upper}
              onClick={() => {
                setCurrentIndex(index);
                setCleared((prev) => !prev);
                playSfx('swish');
              }}
              className={`w-12 h-12 rounded-2xl font-black text-xl shadow ${
                index === currentIndex ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {caseMode === 'upper' ? item.upper : item.lower}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setCaseMode('upper');
              setCleared((prev) => !prev);
            }}
            className={`px-4 py-2 rounded-full font-bold ${
              caseMode === 'upper' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
            }`}
          >
            ABC
          </button>
          <button
            onClick={() => {
              setCaseMode('lower');
              setCleared((prev) => !prev);
            }}
            className={`px-4 py-2 rounded-full font-bold ${
              caseMode === 'lower' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
            }`}
          >
            abc
          </button>
        </div>

        <div className="relative w-full max-w-3xl flex-1 bg-white/60 rounded-3xl shadow-inner border-4 border-blue-200 overflow-hidden">
          <canvas ref={canvasRef} className="touch-none cursor-crosshair w-full h-full" />
        </div>

        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button
            onClick={() => {
              setCleared((prev) => !prev);
              playSfx('swish');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Erase
          </button>
          <button
            onClick={() => {
              if (autoCompleteRef.current) return;
              autoCompleteRef.current = true;
              const praise = getPraise();
              onCelebrate(praise, 8, 250);
              playSfx('sparkle');
              speak(praise, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
            }}
            className="bg-blue-500 text-white font-bold px-6 py-2 rounded-full shadow"
          >
            I did it!
          </button>
          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % TRACE_LETTERS.length);
              setCleared((prev) => !prev);
              playSfx('click');
            }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow"
          >
            Next letter
          </button>
        </div>
      </div>
    </div>
  );
};

const SoundSafari = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [round, setRound] = useState(buildPhonicsRound);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const sayPrompt = useCallback(() => {
    speak(`Which one starts with ${round.target.letter}? ${round.target.letter} says ${round.target.sound}.`);
  }, [round.target.letter, round.target.sound, speak]);

  useEffect(() => {
    sayPrompt();
  }, [sayPrompt]);

  const nextRound = () => {
    setRound(buildPhonicsRound());
    setFeedback('');
  };

  const handlePick = (option) => {
    if (option.letter === round.target.letter) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      setTimeout(nextRound, 1400);
    } else {
      setFeedback('Try again!');
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-100 via-lime-100 to-emerald-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-48 h-32 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Sound Safari</h2>
          <p className="text-emerald-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div
          className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="text-slate-500 uppercase tracking-wide text-xs font-bold">Listen</div>
          <div className="text-5xl font-black text-emerald-700 mt-2">{round.target.letter}</div>
          <div className="text-lg font-semibold text-slate-600">says "{round.target.sound}"</div>
          <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">
            🔊 Hear the sound
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          {round.options.map((option) => (
            <button
              key={option.word}
              onClick={() => handlePick(option)}
              className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition"
            >
              <div className="text-4xl mb-2">{option.emoji}</div>
              <div className="text-lg font-black text-emerald-700">{option.word}</div>
            </button>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-emerald-700 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const SpotDifference = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = SPOT_LEVELS[levelIndex];
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const differenceIndices = useMemo(
    () => Object.keys(level.diffs).map((key) => Number(key)),
    [level.diffs],
  );

  useEffect(() => {
    setFound([]);
    setFeedback('');
    setShowComplete(false);
    speak(`Spot the differences. ${level.name}.`);
  }, [level, speak]);

  const handleTap = (index) => {
    if (showComplete) return;
    if (found.includes(index)) return;
    if (differenceIndices.includes(index)) {
      const nextFound = [...found, index];
      setFound(nextFound);
      playSfx('sparkle');
      setFeedback('Gefunden!');
      if (nextFound.length === differenceIndices.length) {
        const praise = getPraise();
        setShowComplete(true);
        onCelebrate(praise, 10, 250);
        speak(`${praise} Alle Unterschiede gefunden!`, { lang: 'de-DE', rate: 0.9, pitch: 1.05 });
      }
    } else {
      setFeedback('Nope!');
      playSfx('oops');
    }
  };

  const handleNext = () => {
    if (levelIndex < SPOT_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-100 via-slate-100 to-indigo-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 right-6 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button
          onClick={onBack}
          className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Home />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-700">Spot the Difference</h2>
          <p className="text-indigo-700/70 font-semibold">
            {level.name} · Found {found.length}/{differenceIndices.length}
          </p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <p className="text-indigo-700 font-semibold mb-4">{level.hint}</p>

        <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
          {[0, 1].map((sceneIndex) => (
            <div
              key={sceneIndex}
              className="bg-white/90 rounded-3xl border-4 border-indigo-200 shadow-xl p-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {level.base.map((item, index) => {
                  const isFound = found.includes(index) && sceneIndex === 1;
                  const badge =
                    sceneIndex === 0
                      ? level.badge
                      : level.diffs[index] || level.badge;
                  return (
                    <button
                      key={`${sceneIndex}-${index}`}
                      onClick={() => sceneIndex === 1 && handleTap(index)}
                      disabled={sceneIndex === 0}
                      className={`w-20 h-20 rounded-2xl text-3xl flex items-center justify-center border-4 transition ${
                        isFound ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="relative">
                        {item}
                        <span className="absolute -top-2 -right-3 text-xs">{badge}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {feedback && <div className="mt-4 text-xl font-bold text-indigo-700 animate-bounce">{feedback}</div>}

        {showComplete && (
          <div className="mt-6 bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-indigo-700">{getPraise()}</h3>
            <button onClick={handleNext} className="mt-3 text-indigo-600 font-semibold">
              Next scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const JIGSAW_PUZZLES = [
  { id: 'dino', name: 'Dino Park', grid: 3, pieces: ['🦕', '🌿', '🦖', '🌋', '🥚', '☀️', '🪨', '🦴', '🌴'] },
  { id: 'space', name: 'Space Walk', grid: 3, pieces: ['🚀', '🌍', '⭐', '🛸', '🌙', '👨‍🚀', '🪐', '☄️', '🌟'] },
  { id: 'ocean', name: 'Under the Sea', grid: 3, pieces: ['🐳', '🐠', '🪸', '🦈', '🐙', '🌊', '🐢', '🦀', '🐚'] },
  { id: 'farm', name: 'Happy Farm', grid: 4, pieces: ['🐄', '🐔', '🐷', '🌻', '🏠', '🐴', '🐑', '🌾', '🚜', '🐶', '🌳', '🐱', '🥕', '🐰', '🌈', '🌞'] },
  { id: 'city', name: 'Busy City', grid: 4, pieces: ['🏙️', '🚗', '🏫', '🌳', '🚌', '🏪', '🚶', '🌤️', '🚓', '🏗️', '🛻', '🏠', '🚲', '🌺', '⛲', '🏢'] },
];

const PuzzlePlay = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = JIGSAW_PUZZLES[puzzleIndex];
  const total = puzzle.grid * puzzle.grid;

  const initPieces = useCallback(() => {
    const placed = Array(total).fill(null);
    const tray = shuffle(puzzle.pieces.slice(0, total).map((emoji, i) => ({ id: `piece-${i}`, emoji, correctSlot: i })));
    return { placed, tray };
  }, [puzzle, total]);

  const [state, setState] = useState(initPieces);
  const [dragging, setDragging] = useState(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setState(initPieces());
    setSolved(false);
    setMoves(0);
    setDragging(null);
    speak(`Drag the pieces to build the ${puzzle.name} picture!`);
  }, [initPieces, puzzle.name, speak]);

  const checkSolved = (placed) => placed.every((p, i) => p && p.correctSlot === i);

  const handleDragStart = (piece, source) => {
    setDragging({ piece, source });
    playSfx('click');
  };

  const handleDrop = (slotIndex) => {
    if (!dragging) return;
    setState((prev) => {
      const next = { placed: [...prev.placed], tray: [...prev.tray] };
      const existingPiece = next.placed[slotIndex];

      if (dragging.source === 'tray') {
        next.tray = next.tray.filter((p) => p.id !== dragging.piece.id);
        if (existingPiece) next.tray.push(existingPiece);
      } else {
        next.placed[dragging.source] = existingPiece || null;
      }
      next.placed[slotIndex] = dragging.piece;

      if (dragging.piece.correctSlot === slotIndex) playSfx('sparkle');
      setMoves((m) => m + 1);

      if (checkSolved(next.placed)) {
        setSolved(true);
        playSfx('success');
        onCelebrate(getPraise(), 15, 300);
        speak('Amazing! You finished the puzzle!');
      }
      return next;
    });
    setDragging(null);
  };

  const handleDropBack = () => {
    if (!dragging || dragging.source === 'tray') { setDragging(null); return; }
    setState((prev) => {
      const next = { placed: [...prev.placed], tray: [...prev.tray] };
      next.placed[dragging.source] = null;
      next.tray.push(dragging.piece);
      return next;
    });
    setDragging(null);
  };

  const handleTouchStart = (piece, source, e) => {
    e.preventDefault();
    handleDragStart(piece, source);
  };

  const handleSlotClick = (slotIndex) => {
    if (dragging) {
      handleDrop(slotIndex);
    } else if (state.placed[slotIndex]) {
      handleDragStart(state.placed[slotIndex], slotIndex);
    }
  };

  const handleTrayPieceClick = (piece) => {
    if (dragging && dragging.source === 'tray' && dragging.piece.id === piece.id) {
      setDragging(null);
    } else {
      handleDragStart(piece, 'tray');
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % JIGSAW_PUZZLES.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-100 via-orange-100 to-yellow-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Puzzle Pop</h2>
          <p className="text-orange-700/70 font-semibold">{puzzle.name} · Moves: {moves}</p>
          <p className="text-orange-700/50 text-sm">{puzzleIndex + 1}/{JIGSAW_PUZZLES.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 relative z-10 gap-6">
        <p className="text-orange-700/70 font-semibold text-center">
          {dragging ? '🎯 Tap a slot to place the piece!' : 'Tap a piece, then tap where it goes!'}
        </p>

        <div className="grid gap-2 w-full max-w-sm mx-auto" style={{ gridTemplateColumns: `repeat(${puzzle.grid}, minmax(0, 1fr))` }}>
          {state.placed.map((piece, index) => {
            const isCorrect = piece && piece.correctSlot === index;
            return (
              <button
                key={`slot-${index}`}
                onClick={() => handleSlotClick(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={`aspect-square rounded-2xl text-4xl flex items-center justify-center border-4 transition-all ${
                  piece
                    ? isCorrect
                      ? 'border-green-400 bg-green-50 shadow-lg'
                      : 'border-orange-300 bg-orange-50 shadow-md'
                    : dragging
                      ? 'border-dashed border-orange-400 bg-orange-100/50 animate-pulse'
                      : 'border-dashed border-slate-300 bg-white/60'
                } ${!piece && dragging ? 'hover:bg-orange-200/60 hover:border-orange-500' : ''}`}
              >
                {piece ? piece.emoji : <span className="text-slate-300 text-lg">{index + 1}</span>}
              </button>
            );
          })}
        </div>

        <div
          className="bg-white/70 rounded-3xl p-4 w-full max-w-sm mx-auto min-h-[80px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropBack}
        >
          <p className="text-center text-sm font-semibold text-slate-500 mb-2">Pieces Tray</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {state.tray.map((piece) => (
              <button
                key={piece.id}
                draggable
                onDragStart={() => handleDragStart(piece, 'tray')}
                onTouchStart={(e) => handleTouchStart(piece, 'tray', e)}
                onClick={() => handleTrayPieceClick(piece)}
                className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center border-4 transition-all cursor-grab active:cursor-grabbing ${
                  dragging && dragging.piece.id === piece.id
                    ? 'border-orange-500 bg-orange-200 scale-110 shadow-xl'
                    : 'border-white bg-white shadow-md hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {piece.emoji}
              </button>
            ))}
            {state.tray.length === 0 && !solved && <p className="text-slate-400 text-sm">All pieces placed!</p>}
          </div>
        </div>

        {solved && (
          <div className="bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-orange-700">{getPraise()}</h3>
            <div className="flex gap-4 justify-center mt-3">
              <button onClick={handleNextPuzzle} className="text-orange-600 font-semibold">Next puzzle</button>
              <button onClick={() => { setPuzzleIndex(puzzleIndex); setState(initPieces()); setSolved(false); setMoves(0); }} className="text-orange-600 font-semibold">Replay</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdditionAdventure = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = ADDITION_LEVELS[levelIndex];
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState({ a: 1, b: 1 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const newProblem = useCallback(() => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * level.maxNum);
    const b = Math.ceil(Math.random() * level.maxNum);
    setProblem({ a, b });
  }, [level.maxNum]);

  useEffect(() => { newProblem(); }, [newProblem, levelIndex]);

  useEffect(() => {
    speak(`What is ${problem.a} plus ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const answer = problem.a + problem.b;

  const options = useMemo(() => {
    const set = new Set([answer]);
    while (set.size < 4) {
      const delta = Math.ceil(Math.random() * 4);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(0, answer + sign * delta);
      set.add(candidate);
    }
    return shuffle(Array.from(set));
  }, [answer]);

  const check = (pick) => {
    if (pick === answer) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setSuccess(true);
      setStreak((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      const nextRound = round + 1;
      if (nextRound >= level.rounds && levelIndex < ADDITION_LEVELS.length - 1) {
        setTimeout(() => { setLevelIndex((prev) => prev + 1); setRound(0); }, 2000);
      } else {
        setRound(nextRound);
        setTimeout(newProblem, 2000);
      }
    } else {
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 via-emerald-100 to-teal-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Addition Adventure</h2>
          <p className="text-emerald-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-emerald-700/50 text-sm font-semibold">Level {levelIndex + 1}/{ADDITION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="mt-12 text-center z-10 px-4">
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-10 ${shake ? 'animate-shake' : ''}`}>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.a}</div>
          <div className="text-emerald-500">+</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.b}</div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">?</div>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {options.map((option) => (
            <button key={option} onClick={() => check(option)} className="w-20 h-20 bg-emerald-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(5,150,105)] active:shadow-none active:translate-y-2 transition-all hover:bg-emerald-600">{option}</button>
          ))}
        </div>
      </div>
      <div className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'}`}>🚀</div>
      <div className="absolute bottom-0 w-full h-14 bg-emerald-900/20" />
      {success && <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-green-500 animate-bounce">{successMessage}</div>}
    </div>
  );
};

const SubtractionStation = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = SUBTRACTION_LEVELS[levelIndex];
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState({ a: 3, b: 1 });
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const newProblem = useCallback(() => {
    setSuccess(false);
    const a = Math.ceil(Math.random() * level.maxNum) + Math.ceil(Math.random() * 3);
    const b = Math.ceil(Math.random() * Math.min(a, level.maxNum));
    setProblem({ a, b });
  }, [level.maxNum]);

  useEffect(() => { newProblem(); }, [newProblem, levelIndex]);

  useEffect(() => {
    speak(`What is ${problem.a} minus ${problem.b}?`);
  }, [problem.a, problem.b, speak]);

  const answer = problem.a - problem.b;

  const options = useMemo(() => {
    const set = new Set([answer]);
    while (set.size < 4) {
      const delta = Math.ceil(Math.random() * 4);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(0, answer + sign * delta);
      set.add(candidate);
    }
    return shuffle(Array.from(set));
  }, [answer]);

  const check = (pick) => {
    if (pick === answer) {
      const praise = getPraise();
      setSuccessMessage(praise);
      setSuccess(true);
      setStreak((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 6, 250);
      const nextRound = round + 1;
      if (nextRound >= level.rounds && levelIndex < SUBTRACTION_LEVELS.length - 1) {
        setTimeout(() => { setLevelIndex((prev) => prev + 1); setRound(0); }, 2000);
      } else {
        setRound(nextRound);
        setTimeout(newProblem, 2000);
      }
    } else {
      setShake(true);
      playSfx('oops');
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 via-violet-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-purple-700">Subtraction Station</h2>
          <p className="text-purple-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-purple-700/50 text-sm font-semibold">Level {levelIndex + 1}/{SUBTRACTION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="mt-12 text-center z-10 px-4">
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-10 ${shake ? 'animate-shake' : ''}`}>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.a}</div>
          <div className="text-purple-500">−</div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border-b-8 border-slate-200">{problem.b}</div>
          <div>=</div>
          <div className="w-24 h-24 border-4 border-dashed border-slate-400 rounded-2xl flex items-center justify-center text-slate-400">?</div>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {options.map((option) => (
            <button key={option} onClick={() => check(option)} className="w-20 h-20 bg-purple-500 text-white text-3xl font-bold rounded-2xl shadow-[0_6px_0_rgb(126,34,206)] active:shadow-none active:translate-y-2 transition-all hover:bg-purple-600">{option}</button>
          ))}
        </div>
      </div>
      <div className={`absolute bottom-14 left-10 text-[80px] transition-transform duration-1000 ${success ? 'translate-x-[500px] -translate-y-[200px] rotate-[360deg]' : 'translate-x-0'}`}>🛸</div>
      <div className="absolute bottom-0 w-full h-14 bg-purple-900/20" />
      {success && <div className="absolute top-1/2 left-0 right-0 text-center text-5xl font-black text-purple-500 animate-bounce">{successMessage}</div>}
    </div>
  );
};

const AstronautAcademy = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [catIndex, setCatIndex] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const cat = catIndex !== null ? ASTRONAUT_CATEGORIES[catIndex] : null;
  const question = cat ? cat.items[qIndex] : null;

  useEffect(() => {
    if (question) speak(question.q);
  }, [question, speak]);

  const handlePick = (option) => {
    if (!question) return;
    if (option === question.answer) {
      const praise = getPraise();
      setFeedback(praise);
      playSfx('success');
      onCelebrate(praise, 6, 200);
      setScore((prev) => prev + 1);
      setTimeout(() => {
        setFeedback('');
        if (qIndex + 1 < cat.items.length) {
          setQIndex(qIndex + 1);
        } else {
          setDone(true);
        }
      }, 1500);
    } else {
      setShake(true);
      playSfx('oops');
      setFeedback('Try again!');
      setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  const handleReset = () => {
    setCatIndex(null);
    setQIndex(0);
    setScore(0);
    setDone(false);
    setFeedback('');
  };

  if (catIndex === null) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
          ))}
        </div>
        <div className="flex items-center justify-between px-4 pt-4 z-20">
          <button onClick={onBack} className="bg-white/20 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home className="text-white" /></button>
          <h2 className="text-3xl font-black text-white">👨‍🚀 Astronaut Academy</h2>
          <SoundToggle soundOn={soundOn} onToggle={onToggleSound} className="text-white" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
          <p className="text-white/80 text-xl font-semibold mb-8">Pick a mission, Space Cadet!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
            {ASTRONAUT_CATEGORIES.map((c, i) => (
              <button key={c.id} onClick={() => { setCatIndex(i); setQIndex(0); setScore(0); setDone(false); playSfx('click'); }} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-6 text-center hover:bg-white/20 transition-all hover:-translate-y-1">
                <div className="text-5xl mb-3">{c.emoji}</div>
                <h3 className="text-xl font-black text-white">{c.name}</h3>
                <p className="text-white/60 text-sm mt-1">{c.items.length} questions</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
          ))}
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 text-center z-10 max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-white mb-2">Mission Complete!</h2>
          <p className="text-white/80 text-xl mb-1">{cat.name}</p>
          <p className="text-yellow-300 text-2xl font-black mb-6">{score}/{cat.items.length} correct</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleReset} className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-600 transition">New Mission</button>
            <button onClick={onBack} className="bg-white/20 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/30 transition">Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={handleReset} className="bg-white/20 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home className="text-white" /></button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">{cat.emoji} {cat.name}</h2>
          <p className="text-white/60 font-semibold">Question {qIndex + 1}/{cat.items.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className={`bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-lg w-full text-center ${shake ? 'animate-shake' : ''}`}>
          <div className="text-5xl mb-4">👨‍🚀</div>
          <h3 className="text-2xl font-black text-white mb-8">{question.q}</h3>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => (
              <button key={opt} onClick={() => handlePick(opt)} className="bg-white/20 border-2 border-white/30 text-white text-xl font-bold py-4 rounded-2xl hover:bg-white/30 active:translate-y-1 transition-all">{opt}</button>
            ))}
          </div>
        </div>
        {feedback && <div className="mt-6 text-3xl font-black text-yellow-300 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const IntroScreen = ({ onStart, playSfx, soundOn, onToggleSound, speak }) => {
  useEffect(() => {
    speak('Welcome Amari! Ready to play?');
    playSfx('sparkle');
  }, [playSfx, speak]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-10 w-56 h-56 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute top-20 right-8 w-48 h-48 bg-blue-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="flex items-center justify-center gap-4 text-6xl animate-bounce-slow">
          <span>🐯</span>
          <span>🚀</span>
          <span>🌟</span>
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-black text-slate-800 drop-shadow-sm">
          Welcome Amari!
        </h1>
        <p className="mt-4 text-xl text-slate-600 font-semibold">
          Amari Discovery is ready. Tap start and let’s play!
        </p>
        <button
          onClick={() => {
            playSfx('launch');
            onStart();
          }}
          className="mt-8 bg-blue-500 text-white text-2xl font-black px-10 py-4 rounded-full shadow-[0_8px_0_rgba(29,78,216,0.4)] hover:bg-blue-600 active:translate-y-1 active:shadow-none transition"
        >
          Start Adventure
        </button>
        <button
          onClick={() => speak('Welcome Amari! Ready to play?')}
          className="mt-4 text-blue-600 font-semibold"
        >
          🔊 Hear the welcome
        </button>
      </div>

      <div className="absolute bottom-8 left-8 text-4xl animate-bounce-slow">🪐</div>
      <div className="absolute bottom-8 right-8 text-4xl animate-bounce-slow">✨</div>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [soundOn, setSoundOn] = useState(true);
  const [points, setPoints] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [sessionPoints, setSessionPoints] = useState({});
  const [summary, setSummary] = useState(null);
  const screenRef = useRef(screen);
  const playSfx = useSfx(soundOn);
  const speak = useVoice(soundOn);
  useAmbientMusic(soundOn);

  useEffect(() => {
    document.title = 'Amari Discovery';
  }, []);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const celebrate = useCallback((message, pointsEarned = 5, delayMs = 0, gameIdOverride) => {
    const finalMessage = message || getPraise();
    const gameIdAtCall = gameIdOverride || screenRef.current;
    const run = () => {
      setPoints((prev) => {
        const total = prev + pointsEarned;
        if (gameIdAtCall && !['menu', 'intro', 'summary'].includes(gameIdAtCall)) {
          setSessionPoints((prevSessions) => ({
            ...prevSessions,
            [gameIdAtCall]: (prevSessions[gameIdAtCall] || 0) + pointsEarned,
          }));
        }
        setCelebration({
          id: Date.now(),
          message: finalMessage,
          points: pointsEarned,
          total,
          bursts: createBursts(),
        });
        return total;
      });
    };
    if (delayMs > 0) {
      setTimeout(run, delayMs);
    } else {
      run();
    }
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 1600);
    return () => clearTimeout(timer);
  }, [celebration]);

  const handleBack = (gameId) => {
    const earned = sessionPoints[gameId] || 0;
    if (earned > 0) {
      setSummary({ gameId, points: earned });
      setScreen('summary');
    } else {
      setScreen('menu');
    }
  };

  const handleSummaryDone = () => {
    if (summary?.gameId) {
      setSessionPoints((prev) => ({ ...prev, [summary.gameId]: 0 }));
    }
    setSummary(null);
    setScreen('menu');
  };

  let content = null;

  if (screen === 'intro') {
    content = (
      <IntroScreen
        onStart={() => setScreen('menu')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
      />
    );
  } else if (screen === 'menu') {
    content = (
      <div
        className={`min-h-screen w-full ${THEME.bg} ${THEME.font} flex flex-col items-center p-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute top-32 right-8 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-green-200/60 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <SoundToggle soundOn={soundOn} onToggle={() => setSoundOn((prev) => !prev)} />
        </div>

        <div className="text-center mt-8 mb-10 animate-fade-in-down relative z-10">
          <div className="flex justify-center gap-4 text-5xl mb-4 animate-bounce-slow">
            <span>🐯</span>
            <span>🔧</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            Amari <span className="text-blue-500">Discovery</span>
          </h1>
          <p className="text-slate-600 font-bold text-xl mt-2 bg-white/60 inline-block px-6 py-2 rounded-full">
            Academy for Kids
          </p>
          <div className="mt-4 text-slate-600 font-semibold">⭐ Total Stars: {points}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl relative z-10">
          <MenuCard
            icon="🦕"
            title="Dino Detective"
            desc="Find hidden dinosaurs!"
            color="bg-green-400"
            onClick={() => {
              playSfx('click');
              setScreen('dino');
            }}
          />

          <MenuCard
            icon="✈️"
            title="Sky Shapes"
            desc="Draw with a Jet!"
            color="bg-sky-400"
            onClick={() => {
              playSfx('click');
              setScreen('jet');
            }}
          />

          <MenuCard
            icon="🪐"
            title="Solar System"
            desc="Visit the planets"
            color="bg-indigo-400"
            onClick={() => {
              playSfx('click');
              setScreen('solar');
            }}
          />

          <MenuCard
            icon="🎨"
            title="German Garage"
            desc="Learn colors in German"
            color="bg-red-400"
            onClick={() => {
              playSfx('click');
              setScreen('german');
            }}
          />

          <MenuCard
            icon="🛻"
            title="Monster Math"
            desc="Stunt Jump Counting"
            color="bg-orange-400"
            onClick={() => {
              playSfx('click');
              setScreen('math');
            }}
          />

          <MenuCard
            icon="🚀"
            title="Letter Launch"
            desc="Letters and sounds"
            color="bg-teal-400"
            onClick={() => {
              playSfx('click');
              setScreen('letters');
            }}
          />

          <MenuCard
            icon="🧩"
            title="Memory Match"
            desc="Find the pairs"
            color="bg-rose-400"
            onClick={() => {
              playSfx('click');
              setScreen('memory');
            }}
          />

          <MenuCard
            icon="🔷"
            title="Pattern Parade"
            desc="Finish the pattern"
            color="bg-amber-400"
            onClick={() => {
              playSfx('click');
              setScreen('pattern');
            }}
          />

          <MenuCard
            icon="🦸‍♂️"
            title="Spot the Difference"
            desc="Find what changed"
            color="bg-indigo-400"
            onClick={() => {
              playSfx('click');
              setScreen('spot');
            }}
          />

          <MenuCard
            icon="🧩"
            title="Puzzle Pop"
            desc="Swap tiles to win"
            color="bg-yellow-400"
            onClick={() => {
              playSfx('click');
              setScreen('puzzle');
            }}
          />

          <MenuCard
            icon="🖍️"
            title="Letter Trace"
            desc="Trace big & small letters"
            color="bg-blue-400"
            onClick={() => {
              playSfx('click');
              setScreen('trace');
            }}
          />

          <MenuCard
            icon="🦁"
            title="Sound Safari"
            desc="Match the sounds"
            color="bg-emerald-400"
            onClick={() => {
              playSfx('click');
              setScreen('phonics');
            }}
          />

          <MenuCard
            icon="➕"
            title="Addition Adventure"
            desc="Add it up!"
            color="bg-teal-500"
            onClick={() => {
              playSfx('click');
              setScreen('addition');
            }}
          />

          <MenuCard
            icon="➖"
            title="Subtraction Station"
            desc="Take it away!"
            color="bg-violet-500"
            onClick={() => {
              playSfx('click');
              setScreen('subtraction');
            }}
          />

          <MenuCard
            icon="👨‍🚀"
            title="Astronaut Academy"
            desc="Learn cool facts!"
            color="bg-slate-700"
            onClick={() => {
              playSfx('click');
              setScreen('astronaut');
            }}
          />
        </div>

        <div className="mt-10 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          Playful Learning Active
        </div>

        <RewardsShelf points={points} />
      </div>
    );
  } else if (screen === 'summary' && summary) {
    content = (
      <PointsSummaryScreen summary={summary} totalPoints={points} onDone={handleSummaryDone} />
    );
  } else if (screen === 'solar') {
    content = (
      <SolarSystem
        onBack={() => handleBack('solar')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'dino') {
    content = (
      <DinoDetective
        onBack={() => handleBack('dino')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'jet') {
    content = (
      <JetSkyShapes
        onBack={() => handleBack('jet')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'german') {
    content = (
      <GermanGarage
        onBack={() => handleBack('german')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'math') {
    content = (
      <MonsterMath
        onBack={() => handleBack('math')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'letters') {
    content = (
      <LetterLaunch
        onBack={() => handleBack('letters')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'memory') {
    content = (
      <MemoryMatch
        onBack={() => handleBack('memory')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'pattern') {
    content = (
      <PatternParade
        onBack={() => handleBack('pattern')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'spot') {
    content = (
      <SpotDifference
        onBack={() => handleBack('spot')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'puzzle') {
    content = (
      <PuzzlePlay
        onBack={() => handleBack('puzzle')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'trace') {
    content = (
      <LetterTrace
        onBack={() => handleBack('trace')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'phonics') {
    content = (
      <SoundSafari
        onBack={() => handleBack('phonics')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'addition') {
    content = (
      <AdditionAdventure
        onBack={() => handleBack('addition')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'subtraction') {
    content = (
      <SubtractionStation
        onBack={() => handleBack('subtraction')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'astronaut') {
    content = (
      <AstronautAcademy
        onBack={() => handleBack('astronaut')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  }

  return (
    <>
      {content}
      <CelebrationOverlay celebration={celebration} />
    </>
  );
}

const MenuCard = ({ icon, title, desc, color, onClick, span = '' }) => (
  <button
    onClick={onClick}
    className={`
      ${span} relative group overflow-hidden rounded-[2.5rem] p-8 text-left transition-all duration-300
      ${color} shadow-[0_10px_0_rgba(0,0,0,0.1)] hover:shadow-[0_15px_0_rgba(0,0,0,0.1)]
      hover:-translate-y-1 active:translate-y-2 active:shadow-none tap-highlight-none
    `}
  >
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 origin-left">
        {icon}
      </div>
      <div>
        <h2 className="text-3xl font-black text-white leading-tight mb-1 drop-shadow-md">{title}</h2>
        <p className="text-white/90 font-bold text-lg">{desc}</p>
      </div>
      <div className="absolute bottom-8 right-8 bg-white/30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="text-white" />
      </div>
    </div>
  </button>
);
