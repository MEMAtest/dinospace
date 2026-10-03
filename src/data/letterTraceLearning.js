import { PHASE_WORDS, getTaughtGraphemes, isDecodableWith } from './literacy.js';

export const AMARI_TRACE_NARRATION = Object.freeze([
  'Follow the dotted path in order. Start at the green number and move toward the arrow.',
  'Take your time. Lift your finger before you start the next stroke.',
  'Show me a stroke.',
  'Try that stroke again. Begin at the green number and follow the arrows.',
  'You followed the letter. Great tracing!',
  'That is the word. You traced the letter and matched its first sound.',
  'The word starts with this letter sound.',
]);

export const LETTER_TRACE_LEVELS = Object.freeze([
  { id: 'follow-path', title: 'Follow the path', prompt: 'Trace eight big letters, one careful stroke at a time.', caseMode: 'upper' },
  { id: 'big-and-little', title: 'Big and little', prompt: 'Trace eight letters in big and little forms.', caseMode: 'paired' },
  { id: 'trace-and-read', title: 'Trace and read', prompt: 'Trace a letter, then find a word that starts with its sound.', caseMode: 'lower' },
]);
export const LETTER_TRACE_BADGES = Object.freeze(LETTER_TRACE_LEVELS.map(({ id, title }, index) => Object.freeze({ id: `trace-${id}`, title, level: index })));

export const LETTER_TRACE_ROUNDS_PER_LEVEL = 8;
const TAUGHT_LETTER_ORDER = Object.freeze(['a', 's', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l']);
const EXTRA_DECODABLE_WORDS = Object.freeze([
  { word: 'ANT', graphemes: ['a', 'n', 't'], family: '-ant', phase: 2, emoji: '🐜', hint: 'A tiny insect.' },
]);

const hashSeed = (value) => {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
};

export const seededRandom = (seed) => {
  let state = Number(seed) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

export const getTraceEligibleItems = (level = 0, taught = getTaughtGraphemes()) => {
  if (!(taught instanceof Set)) taught = new Set(Array.isArray(taught) ? taught : []);
  const letters = TAUGHT_LETTER_ORDER
    .filter((lower) => taught.has(lower))
    .map((lower) => ({ lower, upper: lower.toUpperCase() }));
  if (level !== 2) return letters;
  const decodableWords = [...PHASE_WORDS, ...EXTRA_DECODABLE_WORDS].filter((word) => isDecodableWith(word, taught));
  const byInitial = new Map(decodableWords.map((word) => [word.word[0].toLowerCase(), word]));
  return letters.filter(({ lower }) => byInitial.has(lower)).map((letter) => ({ ...letter, word: byInitial.get(letter.lower) }));
};

export const makeLetterTraceRun = ({ seed, level = 0, taught = getTaughtGraphemes(), recentLetters = [] } = {}) => {
  const normalizedSeed = Number.isSafeInteger(seed) && seed >= 0 ? seed >>> 0 : hashSeed(`${Date.now()}-${Math.random()}`);
  if (!Number.isInteger(level) || level < 0 || level >= LETTER_TRACE_LEVELS.length) return { seed: normalizedSeed, rounds: [], error: 'Unknown tracing chapter.' };
  const eligible = getTraceEligibleItems(level, taught);
  if (eligible.length < LETTER_TRACE_ROUNDS_PER_LEVEL) {
    return { seed: normalizedSeed, rounds: [], error: `Need eight eligible letters or words; found ${eligible.length}.` };
  }
  const recent = new Set(recentLetters);
  const fresh = eligible.filter((item) => !recent.has(item.lower));
  const pool = fresh.length >= LETTER_TRACE_ROUNDS_PER_LEVEL ? fresh : eligible;
  const roundItems = shuffle(pool, seededRandom(normalizedSeed)).slice(0, LETTER_TRACE_ROUNDS_PER_LEVEL);
  return {
    seed: normalizedSeed,
    rounds: roundItems.map((item, index) => ({
      round: index,
      lower: item.lower,
      upper: item.upper,
      requested: level === 2 || level === 1 && index % 2 === 1 ? item.lower : item.upper,
      word: level === 2 ? item.word : null,
      emoji: level === 2 ? item.word?.emoji : null,
    })),
  };
};

export const traceToleranceForSize = (width, height, level = 0) => {
  const basis = Math.min(width, height);
  const ratios = [0.17, 0.14, 0.12];
  return Math.max(26, Math.min(54, basis * (ratios[level] ?? ratios[0])));
};

export const findForwardGuidePoint = (points, point, cursor = -1, maxBacktrack = 0, maxAdvance = Infinity) => {
  if (!Array.isArray(points) || !points.length) return { index: -1, distance: Infinity };
  let nearest = { index: -1, distance: Infinity };
  const first = Math.max(0, cursor - maxBacktrack);
  const last = Math.min(points.length - 1, Math.max(0, cursor) + maxAdvance);
  for (let index = first; index <= last; index += 1) {
    const candidate = points[index];
    const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    if (distance < nearest.distance) nearest = { index, distance };
  }
  return nearest;
};

export const makeTraceWordChoices = (round, eligible = getTraceEligibleItems(2), seed = 0) => {
  const words = eligible.map((item) => item.word).filter(Boolean);
  const random = seededRandom(seed);
  const distractors = shuffle(words.filter((word) => word.word !== round.word?.word), random).slice(0, 2);
  return shuffle([round.word, ...distractors].filter(Boolean), random);
};

export const LETTER_TRACE_PROGRESS_KEY = 'amari_letter_trace_progress_v1';
const safeRead = (storage) => {
  try {
    const parsed = JSON.parse(storage?.getItem(LETTER_TRACE_PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
};

export const getLetterTraceProgress = (playerId = 'amari', storage = globalThis.localStorage) => {
  const saved = safeRead(storage)[playerId] || {};
  const candidateLevels = new Set(Array.isArray(saved.completedLevels) ? saved.completedLevels.filter((level) => Number.isInteger(level) && level >= 0 && level <= 2) : []);
  const completedLevels = [];
  let unlocked = 0;
  for (let level = 0; level < LETTER_TRACE_LEVELS.length; level += 1) {
    if (!candidateLevels.has(level)) break;
    completedLevels.push(level);
    unlocked = Math.min(2, level + 1);
  }
  const rawRecent = saved.recentByLevel && typeof saved.recentByLevel === 'object' ? saved.recentByLevel : {};
  return {
    unlocked,
    completedLevels,
    masteredLetters: Array.isArray(saved.masteredLetters) ? [...new Set(saved.masteredLetters.filter((letter) => /^[a-z]$/.test(letter) && TAUGHT_LETTER_ORDER.includes(letter)))] : [],
    recentByLevel: Object.fromEntries([0, 1, 2].map((level) => [level, Array.isArray(rawRecent[level]) ? rawRecent[level].filter((letter) => /^[a-z]$/.test(letter) && TAUGHT_LETTER_ORDER.includes(letter)).slice(-8) : []])),
  };
};

export const getLetterTraceShelfBadgeIds = (playerId = 'amari', storage = globalThis.localStorage) => {
  const completed = new Set(getLetterTraceProgress(playerId, storage).completedLevels);
  return LETTER_TRACE_BADGES.filter((badge) => completed.has(badge.level)).map((badge) => badge.id);
};

export const recordLetterTraceMastery = ({ playerId = 'amari', level, letter, storage = globalThis.localStorage }) => {
  if (!Number.isInteger(level) || level < 0 || level > 2 || typeof letter !== 'string' || !/^[a-z]$/i.test(letter)) return { ...getLetterTraceProgress(playerId, storage), newlyMastered: false, invalid: true };
  const normalizedLetter = letter.toLowerCase();
  if (level > getLetterTraceProgress(playerId, storage).unlocked) return { ...getLetterTraceProgress(playerId, storage), newlyMastered: false, invalid: true };
  if (!getTraceEligibleItems(level).some((item) => item.lower === normalizedLetter)) return { ...getLetterTraceProgress(playerId, storage), newlyMastered: false, invalid: true };
  const all = safeRead(storage);
  const previous = getLetterTraceProgress(playerId, storage);
  const newlyMastered = !previous.masteredLetters.includes(normalizedLetter);
  const masteredLetters = [...new Set([...previous.masteredLetters, letter.toLowerCase()])].sort();
  const recent = Array.isArray(previous.recentByLevel[level]) ? previous.recentByLevel[level] : [];
  const recentByLevel = { ...previous.recentByLevel, [level]: [...recent, normalizedLetter].slice(-8) };
  const next = { ...previous, masteredLetters, recentByLevel };
  try { storage?.setItem(LETTER_TRACE_PROGRESS_KEY, JSON.stringify({ ...all, [playerId]: next })); } catch { /* local progress remains optional */ }
  return { ...next, newlyMastered };
};

export const completeLetterTraceLevel = ({ playerId = 'amari', level, completedRounds, storage = globalThis.localStorage }) => {
  const previous = getLetterTraceProgress(playerId, storage);
  if (!Number.isInteger(level) || level < 0 || level > 2 || level > previous.unlocked || completedRounds !== LETTER_TRACE_ROUNDS_PER_LEVEL || getTraceEligibleItems(level).length < LETTER_TRACE_ROUNDS_PER_LEVEL) return { ...previous, newlyCompleted: false, invalid: true };
  const all = safeRead(storage);
  const completedLevels = [...new Set([...previous.completedLevels, level])].sort();
  const newlyCompleted = !previous.completedLevels.includes(level);
  const next = { ...previous, unlocked: Math.max(previous.unlocked, Math.min(2, level + 1)), completedLevels };
  try { storage?.setItem(LETTER_TRACE_PROGRESS_KEY, JSON.stringify({ ...all, [playerId]: next })); } catch { /* local progress remains optional */ }
  return { ...next, newlyCompleted };
};
