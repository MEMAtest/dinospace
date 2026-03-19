import {
  GERMAN_PRAISE, BURST_EMOJIS, CONFETTI_COLORS,
  LETTERS, PATTERN_ROUNDS, PATTERN_TOKENS, PHONICS_ITEMS,
  GERMAN_COLORS, PUZZLE_TILES, STICKERS,
  PLAYER_RANKS, DAILY_CHALLENGES, ASTRONAUT_PROFILES,
} from './data/index.js';

export const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

export const shuffle = (list) => {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getPraise = () => pickRandom(GERMAN_PRAISE);

export const createBursts = () =>
  Array.from({ length: 14 }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    emoji: pickRandom(BURST_EMOJIS),
    left: Math.random() * 90 + 5,
    top: Math.random() * 70 + 10,
    delay: Math.random() * 0.3,
    size: Math.random() > 0.7 ? 'text-4xl' : 'text-3xl',
  }));

export const createConfetti = () =>
  Array.from({ length: 25 }, (_, i) => ({
    id: `confetti-${Date.now()}-${i}`,
    color: pickRandom(CONFETTI_COLORS),
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    width: Math.random() * 6 + 4,
    height: Math.random() * 10 + 6,
    drift: pickRandom(['animate-confetti-fall', 'animate-confetti-fall-left', 'animate-confetti-fall-right']),
    rotation: Math.random() * 360,
  }));

export const shadeColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const createPlanetStyle = (planet) => {
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

export const buildDinos = (level) => level.dinos.map((dino) => ({ ...dino, hidden: true }));

export const buildLetterRound = () => {
  const target = pickRandom(LETTERS);
  const options = shuffle([
    target,
    ...shuffle(LETTERS.filter((item) => item.letter !== target.letter)).slice(0, 3),
  ]);
  return { target, options };
};

export const buildMemoryDeck = (level) =>
  shuffle(
    level.emojis.flatMap((emoji, index) => [
      { id: `${emoji}-${index}-a`, emoji, flipped: false, matched: false },
      { id: `${emoji}-${index}-b`, emoji, flipped: false, matched: false },
    ]),
  );

export const buildParkRound = () => {
  const target = pickRandom(GERMAN_COLORS);
  let other = pickRandom(GERMAN_COLORS);
  while (other.name === target.name) other = pickRandom(GERMAN_COLORS);
  return { target, options: shuffle([target, other]) };
};

export const buildPatternRound = () => {
  const round = pickRandom(PATTERN_ROUNDS);
  const decoys = shuffle(PATTERN_TOKENS.filter((token) => token !== round.answer)).slice(0, 2);
  return { ...round, options: shuffle([round.answer, ...decoys]) };
};

export const buildPhonicsRound = () => {
  const target = pickRandom(PHONICS_ITEMS);
  const options = shuffle([
    target,
    ...shuffle(PHONICS_ITEMS.filter((item) => item.letter !== target.letter)).slice(0, 2),
  ]);
  return { target, options };
};

export const buildMatchRound = (items, optionCount = 4) => {
  const target = pickRandom(items);
  const options = shuffle([
    target,
    ...shuffle(items.filter((item) => item.name !== target.name)).slice(0, optionCount - 1),
  ]);
  return { target, options };
};

export const isPuzzleSolved = (tiles) =>
  tiles.every((tile, index) => tile.emoji === PUZZLE_TILES[index]);

export const buildPuzzleTiles = () => {
  const tiles = PUZZLE_TILES.map((emoji, index) => ({ id: `tile-${index}`, emoji }));
  let shuffled = shuffle(tiles);
  while (isPuzzleSolved(shuffled)) {
    shuffled = shuffle(tiles);
  }
  return shuffled;
};

export const findProfile = (name) => ASTRONAUT_PROFILES.find((p) => p.name === name) || null;

export const getRank = (points) => {
  for (let i = PLAYER_RANKS.length - 1; i >= 0; i--) {
    if (points >= PLAYER_RANKS[i].minPoints) return PLAYER_RANKS[i];
  }
  return PLAYER_RANKS[0];
};

export const getNextRank = (points) => {
  for (let i = 0; i < PLAYER_RANKS.length; i++) {
    if (points < PLAYER_RANKS[i].minPoints) return PLAYER_RANKS[i];
  }
  return null;
};

export const getTodaysChallenge = () => {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[dayIndex];
};

export const getUnlockedStickers = (points) => STICKERS.filter((sticker) => points >= sticker.points);

export const loadSaved = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export const saveSafe = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded or private mode */ }
};

export const computeValidMoves = (pieceId, [r, c], boardSize) => {
  const moves = [];
  const inBounds = (row, col) => row >= 0 && row < boardSize && col >= 0 && col < boardSize;

  if (pieceId === 'king') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (inBounds(r + dr, c + dc)) moves.push([r + dr, c + dc]);
      }
    }
  }

  if (pieceId === 'queen' || pieceId === 'rook') {
    // Straight lines
    for (let i = 0; i < boardSize; i++) {
      if (i !== r) moves.push([i, c]);
      if (i !== c) moves.push([r, i]);
    }
  }

  if (pieceId === 'queen' || pieceId === 'bishop') {
    // Diagonals
    for (let d = 1; d < boardSize; d++) {
      if (inBounds(r + d, c + d)) moves.push([r + d, c + d]);
      if (inBounds(r + d, c - d)) moves.push([r + d, c - d]);
      if (inBounds(r - d, c + d)) moves.push([r - d, c + d]);
      if (inBounds(r - d, c - d)) moves.push([r - d, c - d]);
    }
  }

  if (pieceId === 'knight') {
    const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of jumps) {
      if (inBounds(r + dr, c + dc)) moves.push([r + dr, c + dc]);
    }
  }

  if (pieceId === 'pawn') {
    // Pawns move forward (up = decreasing row)
    if (inBounds(r - 1, c)) moves.push([r - 1, c]);
  }

  return moves;
};

