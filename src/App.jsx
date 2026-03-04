import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Cloud, Home, Palette, Pause, Play, Volume2, VolumeX } from 'lucide-react';

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

const GERMAN_BODY_PARTS = [
  { name: 'Kopf', emoji: '🗣️' },
  { name: 'Hand', emoji: '✋' },
  { name: 'Fuß', emoji: '🦶' },
  { name: 'Auge', emoji: '👁️' },
  { name: 'Nase', emoji: '👃' },
  { name: 'Ohr', emoji: '👂' },
  { name: 'Mund', emoji: '👄' },
  { name: 'Arm', emoji: '💪' },
];

const GERMAN_GREETINGS = [
  { name: 'Hallo', emoji: '👋' },
  { name: 'Tschüss', emoji: '👋' },
  { name: 'Danke', emoji: '🙏' },
  { name: 'Bitte', emoji: '😊' },
  { name: 'Ja', emoji: '✅' },
  { name: 'Nein', emoji: '❌' },
];

const GERMAN_MATCH_MODES = [
  { id: 'numbers', label: 'Zahlen', items: GERMAN_NUMBERS, prompt: 'Finde' },
  { id: 'animals', label: 'Tiere', items: GERMAN_ANIMALS, prompt: 'Finde' },
  { id: 'shapes', label: 'Formen', items: GERMAN_SHAPES, prompt: 'Finde' },
  { id: 'foods', label: 'Essen', items: GERMAN_FOODS, prompt: 'Finde' },
  { id: 'vehicles', label: 'Fahrzeuge', items: GERMAN_VEHICLES, prompt: 'Finde' },
  { id: 'body', label: 'Körper', items: GERMAN_BODY_PARTS, prompt: 'Finde' },
  { id: 'greetings', label: 'Grüße', items: GERMAN_GREETINGS, prompt: 'Finde' },
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

const BLEND_WORDS = [
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

const PUZZLE_TILES = ['🦕', '🌈', '🚀', '⭐️', '🐯', '🍓', '🧁', '🎈', '🪐'];

const ADVANCED_PATTERN_ROUNDS = [
  { sequence: ['🔴', '🔵', '🟡', '🔴', '🔵'], answer: '🟡', label: 'Red, Blue, Yellow repeat' },
  { sequence: ['⭐️', '⭐️', '🌙', '🌙', '⭐️', '⭐️'], answer: '🌙', label: 'Star Star Moon Moon' },
  { sequence: ['🟢', '🟣', '🟠', '🟢', '🟣'], answer: '🟠', label: 'Green Purple Orange' },
  { sequence: ['🔵', '🔵', '🟡', '🔵', '🔵', '🟡', '🔵', '🔵'], answer: '🟡', label: 'Blue Blue Yellow' },
  { sequence: ['🟠', '🟢', '🟠', '🟢', '🟠', '🟠', '🟢'], answer: '🟠', label: 'Tricky orange green' },
];

const NUMBER_PATTERN_ROUNDS = [
  { sequence: [2, 4, 6, 8], answer: 10, options: [9, 10, 11, 12], label: 'Count by 2s' },
  { sequence: [5, 10, 15, 20], answer: 25, options: [22, 24, 25, 30], label: 'Count by 5s' },
  { sequence: [1, 2, 3, 4, 5], answer: 6, options: [5, 6, 7, 8], label: 'Count up by 1' },
  { sequence: [10, 8, 6, 4], answer: 2, options: [1, 2, 3, 0], label: 'Count down by 2' },
  { sequence: [1, 3, 5, 7], answer: 9, options: [8, 9, 10, 11], label: 'Odd numbers' },
  { sequence: [10, 20, 30, 40], answer: 50, options: [45, 50, 55, 60], label: 'Count by 10s' },
];

const WORD_BUILDER_WORDS = [
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

const COLOR_MIX_ROUNDS = [
  { color1: '🔴', color2: '🟡', name1: 'Red', name2: 'Yellow', answer: 'Orange', answerEmoji: '🟠', options: ['Orange', 'Green', 'Purple', 'Brown'] },
  { color1: '🔴', color2: '🔵', name1: 'Red', name2: 'Blue', answer: 'Purple', answerEmoji: '🟣', options: ['Orange', 'Green', 'Purple', 'Pink'] },
  { color1: '🔵', color2: '🟡', name1: 'Blue', name2: 'Yellow', answer: 'Green', answerEmoji: '🟢', options: ['Orange', 'Green', 'Purple', 'Brown'] },
  { color1: '🔴', color2: '⬜', name1: 'Red', name2: 'White', answer: 'Pink', answerEmoji: '🩷', options: ['Pink', 'Orange', 'Purple', 'Brown'] },
  { color1: '🔵', color2: '⬜', name1: 'Blue', name2: 'White', answer: 'Light Blue', answerEmoji: '🩵', options: ['Light Blue', 'Green', 'Purple', 'Grey'] },
  { color1: '🔴', color2: '🟢', name1: 'Red', name2: 'Green', answer: 'Brown', answerEmoji: '🟤', options: ['Orange', 'Brown', 'Purple', 'Grey'] },
  { color1: '⬛', color2: '⬜', name1: 'Black', name2: 'White', answer: 'Grey', answerEmoji: '🩶', options: ['Grey', 'Brown', 'Silver', 'Blue'] },
];

const ODD_ONE_OUT_ROUNDS = [
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

const ACHIEVEMENTS = [
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
  { id: 'astro_grad', name: 'Space Graduate', emoji: '🎓', desc: 'Complete all Astronaut missions', check: (g) => (g.astronaut || 0) >= 30 },
  { id: 'puzzle_king', name: 'Puzzle King', emoji: '👑', desc: 'Complete 10 puzzles', check: (g) => (g.puzzle || 0) >= 10 },
  { id: 'all_rounder', name: 'All Rounder', emoji: '🏅', desc: 'Try every game', check: (g) => Object.keys(g).filter((k) => g[k] > 0).length >= 14 },
];

const VISUAL_EMOJIS = ['🍎', '🌟', '🐟', '🦋', '🍪', '🎈', '🌸', '💎', '🍬', '🚀'];

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
  counting: 'Count the Stars',
  words: 'Word Builder',
  colormix: 'Color Mixing Lab',
  oddoneout: 'Odd One Out',
  timeteller: 'Time Teller',
  numberline: 'Number Line Jump',
  progress: 'Progress Dashboard',
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
];

const STICKERS = [
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

const PLAYER_RANKS = [
  { title: 'Space Cadet', emoji: '👶', minPoints: 0 },
  { title: 'Star Collector', emoji: '⭐', minPoints: 25 },
  { title: 'Moon Walker', emoji: '🌙', minPoints: 60 },
  { title: 'Rocket Pilot', emoji: '🚀', minPoints: 100 },
  { title: 'Planet Explorer', emoji: '🪐', minPoints: 170 },
  { title: 'Galaxy Ranger', emoji: '🌌', minPoints: 280 },
  { title: 'Space Commander', emoji: '👨‍🚀', minPoints: 400 },
  { title: 'Universe Legend', emoji: '🏆', minPoints: 600 },
];

const getRank = (points) => {
  for (let i = PLAYER_RANKS.length - 1; i >= 0; i--) {
    if (points >= PLAYER_RANKS[i].minPoints) return PLAYER_RANKS[i];
  }
  return PLAYER_RANKS[0];
};

const getNextRank = (points) => {
  for (let i = 0; i < PLAYER_RANKS.length; i++) {
    if (points < PLAYER_RANKS[i].minPoints) return PLAYER_RANKS[i];
  }
  return null;
};

const DAILY_CHALLENGES = [
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

const getTodaysChallenge = () => {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[dayIndex];
};

const COUNT_LEVELS = [
  { id: 'easy', name: 'Tiny Stars', max: 5, emoji: '⭐' },
  { id: 'medium', name: 'Star Cluster', max: 10, emoji: '🌟' },
  { id: 'hard', name: 'Super Nova', max: 15, emoji: '💫' },
];

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

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

      if (name === 'levelup') {
        playTone(ctx, { freq: 523, duration: 0.1, gain: 0.15 });
        playTone(ctx, { freq: 659, duration: 0.1, gain: 0.15, start: 0.1 });
        playTone(ctx, { freq: 784, duration: 0.1, gain: 0.15, start: 0.2 });
        playTone(ctx, { freq: 1047, duration: 0.25, gain: 0.18, start: 0.3 });
      }

      if (name === 'streak') {
        playTone(ctx, { freq: 660, duration: 0.08, gain: 0.12 });
        playTone(ctx, { freq: 880, duration: 0.08, gain: 0.14, start: 0.06 });
        playTone(ctx, { freq: 1100, duration: 0.12, gain: 0.16, start: 0.12 });
        playSweep(ctx, { from: 1100, to: 1400, duration: 0.15, gain: 0.12, start: 0.2 });
      }

      if (name === 'tap') {
        playTone(ctx, { freq: 440, duration: 0.06, gain: 0.1, type: 'triangle' });
      }

      if (name === 'countdown') {
        playTone(ctx, { freq: 800, duration: 0.15, gain: 0.12, type: 'square' });
      }

      if (name === 'wrong') {
        playTone(ctx, { freq: 280, duration: 0.15, gain: 0.12, type: 'sine' });
        playTone(ctx, { freq: 220, duration: 0.2, gain: 0.1, start: 0.12, type: 'sine' });
      }

      if (name === 'complete') {
        playTone(ctx, { freq: 523, duration: 0.12, gain: 0.14 });
        playTone(ctx, { freq: 659, duration: 0.12, gain: 0.14, start: 0.1 });
        playTone(ctx, { freq: 784, duration: 0.12, gain: 0.14, start: 0.2 });
        playTone(ctx, { freq: 1047, duration: 0.3, gain: 0.18, start: 0.3 });
        playTone(ctx, { freq: 1318, duration: 0.35, gain: 0.16, start: 0.5 });
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
              <div className="text-sm font-bold text-slate-600 mt-1">{sticker.name}</div>
              <div className="text-xs text-slate-400">{sticker.points}⭐</div>
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
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState(() => loadSaved('amari_memory_best', {}));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [levelIndex]);

  const matches = deck.filter((card) => card.matched).length / 2;

  useEffect(() => {
    setDeck(buildMemoryDeck(level));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setShowLevelComplete(false);
    setTimer(0);
  }, [level]);

  useEffect(() => {
    speak(`Memory level ${levelIndex + 1}. ${level.name}.`);
  }, [levelIndex, level.name, speak]);

  useEffect(() => {
    if (matches === level.emojis.length && !showLevelComplete) {
      clearInterval(timerRef.current);
      const praise = getPraise();
      speak('You matched them all. Fantastic memory!');
      playSfx('success');
      setShowLevelComplete(true);
      onCelebrate(praise, 12, 300);
      const best = bestTimes[level.id];
      if (!best || timer < best) {
        setBestTimes((prev) => {
          const next = { ...prev, [level.id]: timer };
          saveSafe('amari_memory_best', next);
          return next;
        });
      }
    }
  }, [matches, level.emojis.length, level.id, onCelebrate, playSfx, showLevelComplete, speak, timer, bestTimes]);

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
            Matches: {matches} · Moves: {moves} · ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            {bestTimes[level.id] ? ` · Best: ${Math.floor(bestTimes[level.id] / 60)}:${String(bestTimes[level.id] % 60).padStart(2, '0')}` : ''}
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
  const [mode, setMode] = useState('emoji');
  const [round, setRound] = useState(buildPatternRound);
  const [numRound, setNumRound] = useState(() => pickRandom(NUMBER_PATTERN_ROUNDS));
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);

  const nextRound = () => {
    if (mode === 'emoji') {
      const allPatterns = [...PATTERN_ROUNDS, ...ADVANCED_PATTERN_ROUNDS];
      const r = pickRandom(allPatterns);
      const decoys = shuffle(PATTERN_TOKENS.filter((t) => t !== r.answer)).slice(0, 2);
      setRound({ ...r, options: shuffle([r.answer, ...decoys]) });
    } else {
      setNumRound(pickRandom(NUMBER_PATTERN_ROUNDS));
    }
    setFeedback('');
  };

  const currentLabel = mode === 'emoji' ? round.label : numRound.label;

  useEffect(() => {
    speak(`What comes next? ${currentLabel}`);
  }, [currentLabel, speak]);

  const handlePick = (option) => {
    const correctAnswer = mode === 'emoji' ? round.answer : numRound.answer;
    if (option === correctAnswer) {
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

  const currentOptions = mode === 'emoji' ? round.options : numRound.options;
  const currentSequence = mode === 'emoji' ? round.sequence : numRound.sequence;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-52 h-32 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-300/40 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-amber-700">Pattern Parade</h2>
          <p className="text-amber-700/70 font-semibold">Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="flex gap-2 mb-4">
          {[{ id: 'emoji', label: '🔷 Shapes' }, { id: 'number', label: '🔢 Numbers' }].map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); nextRound(); playSfx('click'); }}
              className={`px-4 py-2 rounded-full font-bold text-sm ${mode === m.id ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>{m.label}</button>
          ))}
        </div>

        <button onClick={() => speak(`What comes next? ${currentLabel}`)} className="mb-4 text-amber-700 font-semibold">🔊 Hear the pattern</button>

        <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-amber-200 mb-6 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center gap-4 text-4xl flex-wrap justify-center">
            {currentSequence.map((token, index) => (
              <div key={`${token}-${index}`} className="w-12 h-12 flex items-center justify-center font-black">{token}</div>
            ))}
            <div className="w-12 h-12 rounded-2xl border-4 border-dashed border-amber-300 flex items-center justify-center text-2xl">?</div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {currentOptions.map((option) => (
            <button key={option} onClick={() => handlePick(option)}
              className="w-20 h-20 bg-white text-4xl font-black rounded-3xl shadow-lg border-4 border-amber-200 hover:-translate-y-1 transition flex items-center justify-center">{option}</button>
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
  const [safariMode, setSafariMode] = useState('match');
  const [round, setRound] = useState(buildPhonicsRound);
  const [blendRound, setBlendRound] = useState(() => pickRandom(BLEND_WORDS));
  const [blendStep, setBlendStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const sayPrompt = useCallback(() => {
    if (safariMode === 'match') {
      speak(`Which one starts with ${round.target.letter}? ${round.target.letter} says ${round.target.sound}.`);
    } else {
      const blendText = blendRound.letters.join(', ');
      speak(`Blend the sounds: ${blendText}. What word does it make?`);
    }
  }, [round.target?.letter, round.target?.sound, blendRound, safariMode, speak]);

  useEffect(() => { sayPrompt(); }, [sayPrompt]);

  const nextRound = () => {
    if (safariMode === 'match') setRound(buildPhonicsRound());
    else { setBlendRound(pickRandom(BLEND_WORDS)); setBlendStep(0); }
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

  const handleBlendLetterTap = (idx) => {
    if (idx !== blendStep) return;
    playSfx('tap');
    speak(blendRound.letters[idx]);
    setBlendStep(idx + 1);
    if (idx + 1 >= blendRound.letters.length) {
      setTimeout(() => speak(`${blendRound.word}!`), 600);
    }
  };

  const blendOptions = useMemo(() => {
    if (safariMode !== 'blend') return [];
    const decoys = shuffle(BLEND_WORDS.filter((w) => w.word !== blendRound.word)).slice(0, 2);
    return shuffle([blendRound, ...decoys]);
  }, [blendRound, safariMode]);

  const handleBlendAnswer = (w) => {
    if (w.word === blendRound.word) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((prev) => prev + 1);
      playSfx('success');
      onCelebrate(praise, 8, 250);
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
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Sound Safari</h2>
          <p className="text-emerald-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="flex gap-2 mb-4">
          {[{ id: 'match', label: '🔤 Letter Match' }, { id: 'blend', label: '🧩 Blend It' }].map((m) => (
            <button key={m.id} onClick={() => { setSafariMode(m.id); nextRound(); playSfx('click'); }}
              className={`px-4 py-2 rounded-full font-bold text-sm ${safariMode === m.id ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>{m.label}</button>
          ))}
        </div>

        {safariMode === 'match' && (
          <>
            <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${shake ? 'animate-shake' : ''}`}>
              <div className="text-slate-500 uppercase tracking-wide text-xs font-bold">Listen</div>
              <div className="text-5xl font-black text-emerald-700 mt-2">{round.target.letter}</div>
              <div className="text-lg font-semibold text-slate-600">says &quot;{round.target.sound}&quot;</div>
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the sound</button>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {round.options.map((option) => (
                <button key={option.word} onClick={() => handlePick(option)} className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition">
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-lg font-black text-emerald-700">{option.word}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {safariMode === 'blend' && (
          <>
            <div className={`bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-emerald-200 mb-6 text-center ${shake ? 'animate-shake' : ''}`}>
              <div className="text-slate-500 uppercase tracking-wide text-xs font-bold mb-3">Tap each letter to hear it</div>
              <div className="flex items-center gap-3 justify-center mb-3">
                {blendRound.letters.map((l, i) => (
                  <button key={i} onClick={() => handleBlendLetterTap(i)}
                    className={`w-16 h-16 rounded-2xl text-3xl font-black flex items-center justify-center border-4 transition-all ${
                      i < blendStep ? 'bg-emerald-500 text-white border-emerald-600 scale-110' : i === blendStep ? 'bg-emerald-100 border-emerald-400 animate-pulse text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                    }`}>{l.toUpperCase()}</button>
                ))}
              </div>
              {blendStep >= blendRound.letters.length && (
                <div className="text-2xl font-black text-emerald-600 mt-2">What word is it? {blendRound.emoji}</div>
              )}
              <button onClick={sayPrompt} className="mt-3 text-emerald-600 font-semibold">🔊 Hear the sounds</button>
            </div>
            {blendStep >= blendRound.letters.length && (
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                {blendOptions.map((w) => (
                  <button key={w.word} onClick={() => handleBlendAnswer(w)} className="bg-white rounded-3xl p-4 shadow-lg border-4 border-emerald-200 hover:-translate-y-1 transition">
                    <div className="text-4xl mb-2">{w.emoji}</div>
                    <div className="text-lg font-black text-emerald-700">{w.word}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

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
  { id: 'jungle', name: 'Wild Jungle', grid: 5, pieces: ['🦁', '🐵', '🦜', '🌴', '🐍', '🦋', '🌺', '🐘', '🦎', '🌿', '🐆', '🦩', '🍌', '🌸', '🦧', '🪲', '🌻', '🐾', '🦥', '🍃', '🦔', '🌳', '🐢', '🪺', '🌈'] },
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

        {!solved && (
          <button onClick={() => {
            const emptySlot = state.placed.findIndex((p) => !p || p.correctSlot !== state.placed.indexOf(p));
            const correctPiece = state.tray.find((p) => p.correctSlot === emptySlot) || state.tray[0];
            if (correctPiece && emptySlot >= 0) {
              playSfx('sparkle');
              speak(`Try putting a piece in slot ${emptySlot + 1}`);
            }
          }} className="bg-white/80 text-orange-600 font-bold px-5 py-2 rounded-full shadow-md hover:bg-white transition text-sm">💡 Hint</button>
        )}

        {solved && (
          <div className="bg-white/90 p-6 rounded-3xl shadow-xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-black text-orange-700">{getPraise()}</h3>
            <div className="flex gap-4 justify-center mt-3">
              <button onClick={handleNextPuzzle} className="text-orange-600 font-semibold">Next puzzle</button>
              <button onClick={() => { setState(initPieces()); setSolved(false); setMoves(0); }} className="text-orange-600 font-semibold">Replay</button>
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
  const addTimeoutRef = useRef(null);
  useEffect(() => () => { if (addTimeoutRef.current) clearTimeout(addTimeoutRef.current); }, []);
  const visualEmoji = useMemo(() => pickRandom(VISUAL_EMOJIS), [problem.a, problem.b]);

  const options = useMemo(() => {
    const set = new Set([answer]);
    let attempts = 0;
    while (set.size < 4 && attempts < 30) {
      attempts++;
      const delta = Math.ceil(Math.random() * 5);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(0, answer + sign * delta);
      if (candidate !== answer) set.add(candidate);
    }
    for (let f = 1; set.size < 4; f++) { set.add(answer + f); }
    return shuffle(Array.from(set).slice(0, 4));
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
        addTimeoutRef.current = setTimeout(() => { setLevelIndex((prev) => prev + 1); setRound(0); }, 2000);
      } else {
        setRound(nextRound);
        addTimeoutRef.current = setTimeout(newProblem, 2000);
      }
    } else {
      setShake(true);
      playSfx('wrong');
      addTimeoutRef.current = setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 via-emerald-100 to-teal-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-emerald-700">Addition Adventure</h2>
          <p className="text-emerald-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-emerald-700/50 text-sm font-semibold">Level {levelIndex + 1}/{ADDITION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="mt-8 text-center z-10 px-4">
        {level.maxNum <= 10 && (
          <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
            <div className="bg-white/80 rounded-2xl px-4 py-2 shadow flex gap-1 flex-wrap justify-center">
              {Array.from({ length: problem.a }, (_, i) => <span key={`a-${i}`} className="text-2xl">{visualEmoji}</span>)}
            </div>
            <span className="text-3xl font-black text-emerald-500">+</span>
            <div className="bg-white/80 rounded-2xl px-4 py-2 shadow flex gap-1 flex-wrap justify-center">
              {Array.from({ length: problem.b }, (_, i) => <span key={`b-${i}`} className="text-2xl">{visualEmoji}</span>)}
            </div>
          </div>
        )}
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-8 ${shake ? 'animate-shake' : ''}`}>
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
  const subTimeoutRef = useRef(null);
  useEffect(() => () => { if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current); }, []);
  const visualEmoji = useMemo(() => pickRandom(VISUAL_EMOJIS), [problem.a, problem.b]);

  const options = useMemo(() => {
    const set = new Set([answer]);
    let attempts = 0;
    while (set.size < 4 && attempts < 30) {
      attempts++;
      const delta = Math.ceil(Math.random() * 5);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const candidate = Math.max(0, answer + sign * delta);
      if (candidate !== answer) set.add(candidate);
    }
    for (let f = 1; set.size < 4; f++) { set.add(answer + f); }
    return shuffle(Array.from(set).slice(0, 4));
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
        subTimeoutRef.current = setTimeout(() => { setLevelIndex((prev) => prev + 1); setRound(0); }, 2000);
      } else {
        setRound(nextRound);
        subTimeoutRef.current = setTimeout(newProblem, 2000);
      }
    } else {
      setShake(true);
      playSfx('wrong');
      subTimeoutRef.current = setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 via-violet-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg z-20 hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-purple-700">Subtraction Station</h2>
          <p className="text-purple-700/70 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
          <p className="text-purple-700/50 text-sm font-semibold">Level {levelIndex + 1}/{SUBTRACTION_LEVELS.length}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="mt-8 text-center z-10 px-4">
        {level.maxNum <= 10 && (
          <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
            <div className="bg-white/80 rounded-2xl px-4 py-2 shadow flex gap-1 flex-wrap justify-center">
              {Array.from({ length: problem.a }, (_, i) => (
                <span key={`s-${i}`} className={`text-2xl ${i >= answer ? 'opacity-25 line-through' : ''}`}>{visualEmoji}</span>
              ))}
            </div>
          </div>
        )}
        <div className={`inline-flex items-center gap-4 text-6xl font-black text-slate-800 mb-8 ${shake ? 'animate-shake' : ''}`}>
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

  const [explanation, setExplanation] = useState('');

  const handlePick = (opt) => {
    if (!question) return;
    if (opt.text === question.answer) {
      const praise = getPraise();
      setFeedback(praise);
      setExplanation('');
      playSfx('success');
      speak(praise);
      onCelebrate(praise, 6, 200);
      setScore((prev) => prev + 1);
      setTimeout(() => {
        setFeedback('');
        if (qIndex + 1 < cat.items.length) {
          setQIndex(qIndex + 1);
        } else {
          playSfx('complete');
          setDone(true);
        }
      }, 1500);
    } else {
      setShake(true);
      playSfx('wrong');
      const correctOpt = question.options.find((o) => o.text === question.answer);
      const explainText = `The answer is ${question.answer}!`;
      setExplanation(`${correctOpt?.visual || ''} ${explainText}`);
      speak(explainText);
      setFeedback('Not quite!');
      setTimeout(() => { setShake(false); setFeedback(''); setExplanation(''); }, 2500);
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
          <div className="text-5xl mb-2">{question.visual || '👨‍🚀'}</div>
          <h3 className="text-2xl font-black text-white mb-6">{question.q}</h3>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => (
              <button key={opt.text} onClick={() => { playSfx('tap'); handlePick(opt); }} className="bg-white/10 border-2 border-white/20 text-white font-bold py-4 px-3 rounded-2xl hover:bg-white/30 active:translate-y-1 transition-all flex flex-col items-center gap-1">
                <span className="text-4xl">{opt.visual}</span>
                <span className="text-base">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
        {feedback && <div className="mt-4 text-3xl font-black text-yellow-300 animate-bounce">{feedback}</div>}
        {explanation && <div className="mt-2 text-xl font-bold text-white/80 bg-white/10 rounded-2xl px-6 py-3">{explanation}</div>}
      </div>
    </div>
  );
};

const CountTheStars = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = COUNT_LEVELS[levelIndex];
  const [items, setItems] = useState([]);
  const [tapped, setTapped] = useState([]);
  const [target, setTarget] = useState(0);
  const [phase, setPhase] = useState('count');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const generateRound = useCallback(() => {
    const count = Math.ceil(Math.random() * level.max) + 1;
    const emojis = ['⭐', '🌟', '💫', '✨', '🌙', '☀️', '🪐', '🔮'];
    const emoji = pickRandom(emojis);
    const newItems = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji,
      x: 10 + Math.random() * 75,
      y: 10 + Math.random() * 65,
      size: 0.8 + Math.random() * 0.6,
    }));
    setItems(newItems);
    setTarget(count);
    setTapped([]);
    setPhase('count');
    setFeedback('');
  }, [level.max]);

  useEffect(() => { generateRound(); }, [generateRound, levelIndex]);

  useEffect(() => {
    if (phase === 'count') speak('Tap each star to count them!');
  }, [phase, speak]);

  const handleTapItem = (id) => {
    if (phase !== 'count' || tapped.includes(id)) return;
    const next = [...tapped, id];
    setTapped(next);
    playSfx('tap');
    speak(`${next.length}`);
    if (next.length === target) {
      setPhase('answer');
      setTimeout(() => speak(`How many did you count?`), 500);
    }
  };

  const options = useMemo(() => {
    if (phase !== 'answer') return [];
    const set = new Set([target]);
    while (set.size < 4) {
      const delta = Math.ceil(Math.random() * 3);
      const sign = Math.random() > 0.5 ? 1 : -1;
      set.add(Math.max(1, target + sign * delta));
    }
    return shuffle(Array.from(set));
  }, [target, phase]);

  const handleAnswer = (ans) => {
    if (ans === target) {
      const praise = getPraise();
      setFeedback(praise);
      playSfx('success');
      speak(praise);
      onCelebrate(praise, 6, 200);
      setStreak((s) => {
        const next = s + 1;
        timeoutRef.current = setTimeout(() => {
          if (next > 0 && next % 5 === 0 && levelIndex < COUNT_LEVELS.length - 1) {
            setLevelIndex((p) => p + 1);
            playSfx('levelup');
          } else {
            generateRound();
          }
        }, 1800);
        return next;
      });
    } else {
      setShake(true);
      playSfx('wrong');
      speak('Not quite, try again!');
      setFeedback('Try again!');
      timeoutRef.current = setTimeout(() => { setFeedback(''); setShake(false); }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white/20 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home className="text-white" /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">Count the Stars</h2>
          <p className="text-white/60 font-semibold">{level.emoji} {level.name} · Streak: {streak}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className="relative w-full max-w-md aspect-square bg-white/5 rounded-3xl border-2 border-white/10 mb-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTapItem(item.id)}
              className={`absolute transition-all duration-300 ${tapped.includes(item.id) ? 'scale-125 opacity-60' : 'hover:scale-110'}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: `${item.size * 2.5}rem` }}
            >
              {item.emoji}
              {tapped.includes(item.id) && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">{tapped.indexOf(item.id) + 1}</span>}
            </button>
          ))}
        </div>
        {phase === 'count' && <p className="text-white/80 text-xl font-semibold">Tap each one! {tapped.length}/{target}</p>}
        {phase === 'answer' && (
          <div className={`text-center ${shake ? 'animate-shake' : ''}`}>
            <p className="text-white text-xl font-bold mb-4">How many did you count?</p>
            <div className="flex gap-4 justify-center">
              {options.map((n) => (
                <button key={n} onClick={() => handleAnswer(n)} className="w-16 h-16 bg-yellow-400 text-black text-2xl font-black rounded-2xl shadow-lg active:translate-y-1 transition-all">{n}</button>
              ))}
            </div>
          </div>
        )}
        {feedback && <div className="mt-4 text-3xl font-black text-yellow-300 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const WordBuilder = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [scrambled, setScrambled] = useState([]);
  const word = WORD_BUILDER_WORDS[wordIndex];

  useEffect(() => {
    const letters = word.word.split('').map((l, i) => ({ letter: l, id: `${l}-${i}` }));
    setScrambled(shuffle(letters));
    setTyped([]);
    setFeedback('');
    speak(`Spell the word: ${word.word}. ${word.hint}`);
  }, [wordIndex, word, speak]);

  const handleLetterTap = (item) => {
    const next = [...typed, item];
    setTyped(next);
    setScrambled((prev) => prev.filter((s) => s.id !== item.id));
    playSfx('tap');
    speak(item.letter);
    if (next.length === word.word.length) {
      const spelled = next.map((t) => t.letter).join('');
      if (spelled === word.word) {
        const praise = getPraise();
        setFeedback(praise);
        setScore((s) => s + 1);
        playSfx('success');
        speak(`${word.word}! ${praise}`);
        onCelebrate(praise, 8, 300);
        setTimeout(() => setWordIndex((i) => (i + 1) % WORD_BUILDER_WORDS.length), 2000);
      } else {
        setShake(true);
        playSfx('wrong');
        setFeedback('Oops! Try again');
        setTimeout(() => {
          setShake(false);
          setFeedback('');
          const letters = word.word.split('').map((l, i) => ({ letter: l, id: `${l}-${i}` }));
          setScrambled(shuffle(letters));
          setTyped([]);
        }, 1200);
      }
    }
  };

  const handleUndo = () => {
    if (typed.length === 0) return;
    const last = typed[typed.length - 1];
    setTyped((prev) => prev.slice(0, -1));
    setScrambled((prev) => [...prev, last]);
    playSfx('click');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-100 via-sky-100 to-blue-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-cyan-700">Word Builder</h2>
          <p className="text-cyan-700/70 font-semibold">Words: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className="text-7xl mb-4">{word.emoji}</div>
        <p className="text-slate-600 font-semibold mb-2">{word.hint}</p>
        <button onClick={() => speak(`Spell ${word.word}. ${word.hint}`)} className="mb-4 text-cyan-600 font-semibold">🔊 Hear the word</button>
        <div className={`flex gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {word.word.split('').map((_, i) => (
            <div key={i} className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-3xl font-black transition-all ${typed[i] ? 'bg-cyan-500 text-white border-cyan-600 scale-110' : 'bg-white border-dashed border-slate-300 text-slate-300'}`}>
              {typed[i]?.letter || ''}
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {scrambled.map((item) => (
            <button key={item.id} onClick={() => handleLetterTap(item)}
              className="w-16 h-16 bg-white text-cyan-700 text-3xl font-black rounded-2xl shadow-lg border-4 border-cyan-200 hover:-translate-y-1 active:translate-y-1 transition-all">{item.letter}</button>
          ))}
        </div>
        {typed.length > 0 && (
          <button onClick={handleUndo} className="text-cyan-600 font-bold text-sm">↩️ Undo</button>
        )}
        {feedback && <div className="mt-4 text-2xl font-black text-cyan-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const ColorMixingLab = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [mixed, setMixed] = useState(false);
  const round = COLOR_MIX_ROUNDS[roundIndex % COLOR_MIX_ROUNDS.length];

  useEffect(() => {
    setMixed(false);
    setFeedback('');
    speak(`What color do ${round.name1} and ${round.name2} make when mixed together?`);
  }, [roundIndex, round.name1, round.name2, speak]);

  const handleMix = () => {
    setMixed(true);
    playSfx('sparkle');
    speak('Mix!');
  };

  const handlePick = (answer) => {
    if (answer === round.answer) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      playSfx('success');
      speak(`${round.answer}! ${praise}`);
      onCelebrate(praise, 8, 200);
      setTimeout(() => setRoundIndex((i) => i + 1), 2000);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback(`Not quite! ${round.name1} + ${round.name2} = ${round.answer}`);
      speak(`It makes ${round.answer}`);
      setTimeout(() => { setShake(false); setFeedback(''); }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-100 via-fuchsia-100 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-fuchsia-700">Color Mixing Lab</h2>
          <p className="text-fuchsia-700/70 font-semibold">Mixed: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-white shadow-xl border-4 border-fuchsia-200">{round.color1}</div>
          <span className="text-4xl font-black text-fuchsia-500">+</span>
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-white shadow-xl border-4 border-fuchsia-200">{round.color2}</div>
          <span className="text-4xl font-black text-fuchsia-500">=</span>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-white shadow-xl border-4 border-fuchsia-200 transition-all duration-700 ${mixed ? 'scale-125' : ''}`}>
            {mixed ? round.answerEmoji : '❓'}
          </div>
        </div>
        {!mixed && (
          <button onClick={handleMix} className="bg-fuchsia-500 text-white text-xl font-black px-8 py-4 rounded-full shadow-lg hover:bg-fuchsia-600 active:translate-y-1 transition-all mb-6">
            🧪 Mix Colors!
          </button>
        )}
        {mixed && (
          <div className={`${shake ? 'animate-shake' : ''}`}>
            <p className="text-xl font-bold text-fuchsia-700 mb-4">What color did it make?</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {shuffle(round.options).map((opt) => (
                <button key={opt} onClick={() => handlePick(opt)}
                  className="bg-white text-fuchsia-700 text-xl font-bold px-6 py-4 rounded-2xl shadow-lg border-4 border-fuchsia-200 hover:-translate-y-1 transition">{opt}</button>
              ))}
            </div>
          </div>
        )}
        {feedback && <div className="mt-6 text-2xl font-black text-fuchsia-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const OddOneOut = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const round = ODD_ONE_OUT_ROUNDS[roundIndex % ODD_ONE_OUT_ROUNDS.length];
  const shuffledItems = useMemo(() => shuffle(round.items), [round]);

  useEffect(() => {
    setFeedback('');
    speak(`Which one does not belong? ${round.hint}`);
  }, [roundIndex, round.hint, speak]);

  const handlePick = (item) => {
    if (item === round.odd) {
      const praise = getPraise();
      setFeedback(`${praise} ${item} is the odd one out!`);
      setScore((s) => s + 1);
      playSfx('success');
      speak(`${praise} ${item} doesn't belong with the ${round.category}!`);
      onCelebrate(praise, 8, 200);
      setTimeout(() => setRoundIndex((i) => i + 1), 2000);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback(`${round.hint}`);
      setTimeout(() => { setShake(false); setFeedback(''); }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-lime-100 via-yellow-100 to-lime-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-lime-700">Odd One Out</h2>
          <p className="text-lime-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <p className="text-2xl font-bold text-slate-700 mb-2">Which one doesn't belong?</p>
        <p className="text-slate-500 font-semibold mb-8">{round.hint}</p>
        <div className={`grid grid-cols-2 gap-6 w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
          {shuffledItems.map((item, i) => (
            <button key={`${item}-${i}`} onClick={() => handlePick(item)}
              className="aspect-square bg-white rounded-3xl shadow-xl border-4 border-lime-200 flex items-center justify-center text-7xl hover:-translate-y-2 active:translate-y-1 transition-all">{item}</button>
          ))}
        </div>
        {feedback && <div className="mt-6 text-xl font-black text-lime-700 animate-bounce text-center">{feedback}</div>}
      </div>
    </div>
  );
};

const TimeTeller = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [targetHour, setTargetHour] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

  const newRound = useCallback(() => {
    setTargetHour(Math.ceil(Math.random() * 12));
    setFeedback('');
  }, []);

  useEffect(() => {
    speak(`Show me ${targetHour} o'clock on the clock!`);
  }, [targetHour, speak]);

  const options = useMemo(() => {
    const set = new Set([targetHour]);
    while (set.size < 4) {
      set.add(Math.ceil(Math.random() * 12));
    }
    return shuffle(Array.from(set));
  }, [targetHour]);

  const handlePick = (h) => {
    if (h === targetHour) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      playSfx('success');
      speak(`${praise} That's ${targetHour} o'clock!`);
      onCelebrate(praise, 8, 200);
      setTimeout(newRound, 2000);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback('Try again!');
      setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  const hourAngle = (targetHour % 12) * 30;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-indigo-100 to-blue-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-700">Time Teller</h2>
          <p className="text-indigo-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <p className="text-2xl font-bold text-slate-700 mb-6">What time is this? 🕐</p>
        <div className={`relative w-52 h-52 rounded-full bg-white shadow-2xl border-8 border-indigo-200 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {[...Array(12)].map((_, i) => {
            const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            return (
              <span key={i} className="absolute text-sm font-black text-indigo-700" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>{i + 1}</span>
            );
          })}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
          <div className="absolute top-1/2 left-1/2 w-2 h-[60px] bg-indigo-600 rounded-full origin-bottom z-[5]"
            style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
          <div className="absolute top-1/2 left-1/2 w-1 h-[80px] bg-indigo-400 rounded-full origin-bottom"
            style={{ transform: `translate(-50%, -100%) rotate(0deg)` }} />
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          {options.map((h) => (
            <button key={h} onClick={() => handlePick(h)}
              className="bg-white text-indigo-700 text-xl font-black px-6 py-4 rounded-2xl shadow-lg border-4 border-indigo-200 hover:-translate-y-1 transition">{h} o'clock</button>
          ))}
        </div>
        {feedback && <div className="mt-4 text-2xl font-black text-indigo-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const NumberLineJump = ({ onBack, playSfx, soundOn, onToggleSound, speak, onCelebrate }) => {
  const [problem, setProblem] = useState({ a: 3, b: 2, op: '+' });
  const [feedback, setFeedback] = useState('');
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [jumperPos, setJumperPos] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const answer = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
  const maxNum = 15;

  const newProblem = useCallback(() => {
    const op = Math.random() > 0.5 ? '+' : '-';
    let a, b;
    if (op === '+') {
      a = Math.ceil(Math.random() * 8);
      b = Math.ceil(Math.random() * (maxNum - a));
    } else {
      a = Math.ceil(Math.random() * 10) + 2;
      b = Math.ceil(Math.random() * (a - 1)) + 1;
    }
    setProblem({ a, b, op });
    setJumperPos(op === '+' ? a : a);
    setShowAnswer(false);
    setFeedback('');
  }, []);

  useEffect(() => {
    setJumperPos(problem.a);
    speak(`What is ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b}?`);
  }, [problem, speak]);

  const handleTapNumber = (n) => {
    if (n === answer) {
      const praise = getPraise();
      setFeedback(praise);
      setScore((s) => s + 1);
      setShowAnswer(true);
      setJumperPos(answer);
      playSfx('success');
      speak(`${praise} ${problem.a} ${problem.op === '+' ? 'plus' : 'minus'} ${problem.b} equals ${answer}!`);
      onCelebrate(praise, 8, 200);
      setTimeout(newProblem, 2500);
    } else {
      setShake(true);
      playSfx('wrong');
      setFeedback('Try again!');
      setTimeout(() => { setShake(false); setFeedback(''); }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-40 h-40 bg-white/70 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Go back to menu"><Home /></button>
        <div className="text-center">
          <h2 className="text-3xl font-black text-orange-700">Number Line Jump</h2>
          <p className="text-orange-700/70 font-semibold">Score: {score}</p>
        </div>
        <SoundToggle soundOn={soundOn} onToggle={onToggleSound} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        <div className={`text-center mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="inline-flex items-center gap-3 text-5xl font-black text-slate-800">
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.a}</span>
            <span className="text-orange-500">{problem.op === '+' ? '+' : '−'}</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg">{problem.b}</span>
            <span>=</span>
            <span className="bg-white px-4 py-2 rounded-2xl shadow-lg text-slate-400">{showAnswer ? answer : '?'}</span>
          </div>
        </div>
        <div className="relative w-full max-w-2xl h-32 mb-6">
          <div className="absolute bottom-8 left-0 right-0 h-2 bg-orange-300 rounded-full" />
          {Array.from({ length: maxNum + 1 }, (_, i) => (
            <button key={i} onClick={() => handleTapNumber(i)}
              className={`absolute bottom-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                i === jumperPos ? 'bg-orange-500 text-white scale-125 shadow-lg' : 'bg-white text-slate-600 shadow border-2 border-orange-200'
              } ${i === answer && showAnswer ? 'ring-4 ring-green-400' : ''}`}
              style={{ left: `${(i / maxNum) * 92 + 4}%`, transform: 'translateX(-50%)' }}>{i}</button>
          ))}
          <div className="absolute text-3xl transition-all duration-700 ease-in-out" style={{ left: `${(jumperPos / maxNum) * 92 + 4}%`, bottom: '48px', transform: 'translateX(-50%)' }}>🐸</div>
        </div>
        <p className="text-slate-500 font-semibold mb-4">Tap the number where the frog should land!</p>
        {feedback && <div className="mt-2 text-2xl font-black text-orange-600 animate-bounce">{feedback}</div>}
      </div>
    </div>
  );
};

const ProgressDashboard = ({ points, gamesPlayed, streak, achievements, onBack, playSfx }) => {
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak));
  const totalGames = Object.values(gamesPlayed).reduce((a, b) => a + b, 0);
  const favoriteGame = Object.entries(gamesPlayed).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-100 via-purple-100 to-indigo-200 flex flex-col items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 right-8 w-48 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/60 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center justify-between w-full max-w-4xl mb-6 z-10">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><Home /></button>
        <h2 className="text-3xl font-black text-indigo-700">My Progress</h2>
        <div />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8 z-10">
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-2xl font-black text-indigo-700">{points}</div>
          <div className="text-sm text-slate-500 font-semibold">Total Stars</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">🎮</div>
          <div className="text-2xl font-black text-indigo-700">{totalGames}</div>
          <div className="text-sm text-slate-500 font-semibold">Games Played</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-black text-indigo-700">{streak}</div>
          <div className="text-sm text-slate-500 font-semibold">Day Streak</div>
        </div>
        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-lg border-2 border-indigo-200">
          <div className="text-3xl mb-1">{getRank(points).emoji}</div>
          <div className="text-lg font-black text-indigo-700">{getRank(points).title}</div>
          <div className="text-sm text-slate-500 font-semibold">Rank</div>
        </div>
      </div>
      {favoriteGame && (
        <div className="bg-white/80 rounded-2xl p-4 w-full max-w-4xl mb-6 z-10 text-center">
          <span className="text-slate-500 font-semibold">Favorite Game: </span>
          <span className="font-black text-indigo-700">{GAME_LABELS[favoriteGame[0]] || favoriteGame[0]} ({favoriteGame[1]} plays)</span>
        </div>
      )}
      <div className="w-full max-w-4xl z-10">
        <h3 className="text-xl font-black text-indigo-700 mb-4">🏆 Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.check(gamesPlayed, points, streak);
            return (
              <div key={a.id} className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 ${unlocked ? 'bg-white border-indigo-200 shadow-md' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{a.emoji}</div>
                <div>
                  <div className="font-black text-slate-700">{a.name}</div>
                  <div className="text-sm text-slate-500">{a.desc}</div>
                </div>
                {unlocked && <span className="ml-auto text-green-500 font-black">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8 w-full max-w-4xl z-10">
        <h3 className="text-xl font-black text-indigo-700 mb-4">📊 Games Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(gamesPlayed).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([game, count]) => (
            <div key={game} className="bg-white/80 rounded-2xl p-3 text-center border-2 border-indigo-100">
              <div className="font-bold text-slate-700 text-sm">{GAME_LABELS[game] || game}</div>
              <div className="text-xl font-black text-indigo-600">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PauseOverlay = ({ onResume }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm">
      <div className="text-6xl mb-4">⏸️</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Game Paused</h2>
      <p className="text-slate-500 font-semibold mb-6">Take a break if you need one!</p>
      <button onClick={onResume} className="bg-blue-500 text-white text-xl font-bold px-8 py-4 rounded-full shadow-lg hover:bg-blue-600 active:translate-y-1 transition-all flex items-center gap-2 mx-auto">
        <Play size={24} /> Resume
      </button>
    </div>
  </div>
);

const BreakReminder = ({ onDismiss, onTakeBreak }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm">
      <div className="text-6xl mb-4">🌙</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Break Time!</h2>
      <p className="text-slate-500 font-semibold mb-2">You have been playing for 30 minutes.</p>
      <p className="text-slate-500 font-semibold mb-6">How about a little rest?</p>
      <div className="flex gap-4 justify-center">
        <button onClick={onTakeBreak} className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-600 transition">Take a Break</button>
        <button onClick={onDismiss} className="bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-slate-300 transition">5 More Minutes</button>
      </div>
    </div>
  </div>
);

const DailyChallengeBanner = ({ challenge, progress, onGo, completed }) => (
  <div className={`w-full max-w-6xl mx-auto mb-6 rounded-3xl p-5 border-4 relative z-10 ${completed ? 'bg-green-100 border-green-300' : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-4xl">{challenge.emoji}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-700 uppercase">Daily Challenge</span>
            {completed && <span className="text-green-600 font-black">DONE!</span>}
          </div>
          <p className="text-slate-700 font-bold text-lg">{challenge.desc}</p>
        </div>
      </div>
      {!completed && (
        <button onClick={onGo} className="bg-amber-500 text-white font-bold px-5 py-2 rounded-full shadow-md hover:bg-amber-600 active:translate-y-1 transition-all whitespace-nowrap">
          Let's Go!
        </button>
      )}
      {completed && <div className="text-4xl">🏆</div>}
    </div>
    {!completed && (
      <div className="mt-3 bg-white/60 rounded-full h-3 overflow-hidden">
        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (progress / challenge.target) * 100)}%` }} />
      </div>
    )}
  </div>
);

const StreakBanner = ({ streak, bonusStars }) => {
  if (streak < 2) return null;
  return (
    <div className="w-full max-w-6xl mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-3 text-center relative z-10">
      <span className="text-white font-black text-lg">🔥 {streak} Day Streak! +{bonusStars} bonus stars</span>
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

const loadSaved = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};

const saveSafe = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded or private mode */ }
};

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [soundOn, setSoundOn] = useState(true);
  const [points, setPoints] = useState(() => loadSaved('amari_points', 0));
  const [celebration, setCelebration] = useState(null);
  const [sessionPoints, setSessionPoints] = useState({});
  const [summary, setSummary] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [streak, setStreak] = useState(() => loadSaved('amari_streak', 0));
  const [lastPlayDate, setLastPlayDate] = useState(() => loadSaved('amari_lastplay', ''));
  const [challengeProgress, setChallengeProgress] = useState(() => loadSaved('amari_challenge_progress', 0));
  const [challengeCompleted, setChallengeCompleted] = useState(() => loadSaved('amari_challenge_done', false));
  const [gamesPlayed, setGamesPlayed] = useState(() => loadSaved('amari_games_played', {}));
  const sessionStartRef = useRef(Date.now());
  const breakTimerRef = useRef(null);
  const screenRef = useRef(screen);
  const playSfx = useSfx(soundOn);
  const speak = useVoice(soundOn);
  useAmbientMusic(soundOn);

  const todaysChallenge = useMemo(() => getTodaysChallenge(), []);
  const today = new Date().toISOString().slice(0, 10);

  // Persist to localStorage safely
  useEffect(() => { saveSafe('amari_points', points); }, [points]);
  useEffect(() => { saveSafe('amari_streak', streak); }, [streak]);
  useEffect(() => { saveSafe('amari_lastplay', lastPlayDate); }, [lastPlayDate]);
  useEffect(() => { saveSafe('amari_challenge_progress', challengeProgress); }, [challengeProgress]);
  useEffect(() => { saveSafe('amari_challenge_done', challengeCompleted); }, [challengeCompleted]);
  useEffect(() => { saveSafe('amari_games_played', gamesPlayed); }, [gamesPlayed]);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(gamesPlayed, points, streak)).map((a) => a.id),
    [gamesPlayed, points, streak],
  );

  // Daily streak check on start (runs once)
  const hasCheckedTodayRef = useRef(false);
  useEffect(() => {
    if (hasCheckedTodayRef.current || lastPlayDate === today) return;
    hasCheckedTodayRef.current = true;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastPlayDate === yesterday) {
      setStreak((s) => s + 1);
    } else {
      setStreak(1);
    }
    setLastPlayDate(today);
    setChallengeProgress(0);
    setChallengeCompleted(false);
  }, [lastPlayDate, today]);

  // Screen time break reminder (30 min)
  useEffect(() => {
    breakTimerRef.current = setTimeout(() => {
      setShowBreak(true);
    }, 30 * 60 * 1000);
    return () => clearTimeout(breakTimerRef.current);
  }, []);

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
          // Track daily challenge progress
          setChallengeProgress((cp) => {
            const next = cp + 1;
            if (next >= todaysChallenge.target && !challengeCompleted) {
              setChallengeCompleted(true);
            }
            return next;
          });
          // Track total games played per game
          setGamesPlayed((prev) => ({
            ...prev,
            [gameIdAtCall]: (prev[gameIdAtCall] || 0) + 1,
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
  }, [challengeCompleted, todaysChallenge]);

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

        <div className="text-center mt-8 mb-6 animate-fade-in-down relative z-10">
          <div className="flex justify-center gap-4 text-5xl mb-4 animate-bounce-slow">
            <span>🐯</span>
            <span>🚀</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            Amari <span className="text-blue-500">Discovery</span>
          </h1>
          <p className="text-slate-600 font-bold text-xl mt-2 bg-white/60 inline-block px-6 py-2 rounded-full">
            Academy for Kids
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-slate-600 font-semibold">⭐ {points} Stars</span>
            <span className="bg-indigo-100 text-indigo-700 font-black text-sm px-3 py-1 rounded-full">
              {getRank(points).emoji} {getRank(points).title}
            </span>
            {getNextRank(points) && (
              <span className="text-slate-400 text-sm font-semibold">
                {getNextRank(points).minPoints - points}⭐ to {getNextRank(points).title}
              </span>
            )}
          </div>
        </div>

        <StreakBanner streak={streak} bonusStars={streak * 2} />
        <DailyChallengeBanner
          challenge={todaysChallenge}
          progress={challengeProgress}
          completed={challengeCompleted}
          onGo={() => { playSfx('launch'); setScreen(todaysChallenge.game); }}
        />

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
            desc="Drag pieces to build!"
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

          <MenuCard
            icon="🔢"
            title="Count the Stars"
            desc="Tap and count!"
            color="bg-indigo-600"
            onClick={() => {
              playSfx('click');
              setScreen('counting');
            }}
          />

          <MenuCard
            icon="🔤"
            title="Word Builder"
            desc="Spell CVC words!"
            color="bg-pink-500"
            onClick={() => {
              playSfx('click');
              setScreen('words');
            }}
          />

          <MenuCard
            icon="🎨"
            title="Color Mixing Lab"
            desc="Mix colors together!"
            color="bg-fuchsia-500"
            onClick={() => {
              playSfx('click');
              setScreen('colormix');
            }}
          />

          <MenuCard
            icon="🤔"
            title="Odd One Out"
            desc="Which one doesn't belong?"
            color="bg-cyan-500"
            onClick={() => {
              playSfx('click');
              setScreen('oddoneout');
            }}
          />

          <MenuCard
            icon="🕐"
            title="Time Teller"
            desc="Read the clock!"
            color="bg-lime-500"
            onClick={() => {
              playSfx('click');
              setScreen('timeteller');
            }}
          />

          <MenuCard
            icon="🐸"
            title="Number Line Jump"
            desc="Hop to the answer!"
            color="bg-emerald-600"
            onClick={() => {
              playSfx('click');
              setScreen('numberline');
            }}
          />
        </div>

        <button
          onClick={() => { playSfx('click'); setScreen('progress'); }}
          className="mt-8 relative z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-[0_6px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-3"
        >
          📊 My Progress & Achievements
        </button>

        <div className="mt-6 text-slate-500 font-medium text-sm flex gap-2 items-center relative z-10">
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
  } else if (screen === 'counting') {
    content = (
      <CountTheStars
        onBack={() => handleBack('counting')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'words') {
    content = (
      <WordBuilder
        onBack={() => handleBack('words')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'colormix') {
    content = (
      <ColorMixingLab
        onBack={() => handleBack('colormix')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'oddoneout') {
    content = (
      <OddOneOut
        onBack={() => handleBack('oddoneout')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'timeteller') {
    content = (
      <TimeTeller
        onBack={() => handleBack('timeteller')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'numberline') {
    content = (
      <NumberLineJump
        onBack={() => handleBack('numberline')}
        playSfx={playSfx}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((prev) => !prev)}
        speak={speak}
        onCelebrate={celebrate}
      />
    );
  } else if (screen === 'progress') {
    content = (
      <ProgressDashboard
        points={points}
        gamesPlayed={gamesPlayed}
        streak={streak}
        achievements={unlockedAchievements}
        onBack={() => setScreen('menu')}
        playSfx={playSfx}
      />
    );
  }

  return (
    <>
      {content}
      <CelebrationOverlay celebration={celebration} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} />}
      {showBreak && (
        <BreakReminder
          onDismiss={() => {
            setShowBreak(false);
            breakTimerRef.current = setTimeout(() => setShowBreak(true), 5 * 60 * 1000);
          }}
          onTakeBreak={() => {
            setShowBreak(false);
            setScreen('intro');
          }}
        />
      )}
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
