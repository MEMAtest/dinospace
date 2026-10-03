import { BATCH5_SPELLING_BANDS, BATCH5_SPELLING_WORDS, SPELLING_WORDS_BY_BAND } from './batch5Literacy.js';
import { PHASE_GROUPS } from './literacy.js';

const hash = (text) => [...String(text)].reduce((result, char) => Math.imul(result ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
const randomFor = (seed) => { let state = seed >>> 0; return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ value >>> 15, value | 1); value ^= value + Math.imul(value ^ value >>> 7, value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296; }; };
export const seededLiteracyShuffle = (values, seed) => { const out = [...values]; const random = randomFor(seed); for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
const taughtSet = (taught) => taught instanceof Set ? taught : new Set((taught || []).map((item) => String(item).toLowerCase()));
export const getEligibleSpellingWords = (bandIndex, taught) => {
  const band = BATCH5_SPELLING_BANDS[bandIndex];
  if (!band) return [];
  const taughtGraphemes = taughtSet(taught);
  const pool = SPELLING_WORDS_BY_BAND[band.id].filter((item) => item.graphemes.every((grapheme) => taughtGraphemes.has(grapheme)));
  const requiresNewSound = bandIndex === 1 ? PHASE_GROUPS[1].graphemes : bandIndex === 2 ? PHASE_GROUPS[2].graphemes : [];
  if (requiresNewSound.length && !requiresNewSound.some((grapheme) => taughtGraphemes.has(grapheme))) return [];
  return pool.length >= 20 ? pool : [];
};

const canonicalSoundPoolCache = new Map();
const getCanonicalSoundIds = (chapterIndex) => {
  if (!canonicalSoundPoolCache.has(chapterIndex)) {
    const taught = PHASE_GROUPS.slice(0, chapterIndex + 1).flatMap((group) => group.graphemes);
    canonicalSoundPoolCache.set(chapterIndex, new Set(createSoundSafariPool(chapterIndex, taught).map((item) => item.id)));
  }
  return canonicalSoundPoolCache.get(chapterIndex);
};
const distinctPhonemes = (words) => [...new Set(words.flatMap((item) => item.phonemes))];
const takeOptions = (answer, tokens, seed) => {
  const decoys = seededLiteracyShuffle(tokens.filter((token) => token !== answer), seed).slice(0, 3);
  return decoys.length === 3 ? seededLiteracyShuffle([answer, ...decoys], seed ^ 0x4f1bbcdc) : [];
};
const rime = (item) => item.graphemes.slice(1).join('');

export const createSoundSafariPool = (chapterIndex, taughtInput) => {
  const taught = taughtSet(taughtInput);
  if (chapterIndex === 0) {
    const words = getEligibleSpellingWords(0, taught);
    const groups = new Map();
    for (const item of words) { const key = rime(item); groups.set(key, [...(groups.get(key) || []), item]); }
    return [...groups.values()].map((group) => group.filter((item, index) => group.findIndex((other) => other.phonemes[0] === item.phonemes[0]) === index)).filter((group) => group.length >= 3).flatMap((group) => group.map((target) => ({
      id: `match:${target.id}`, type: 'match', target, answerId: target.phonemes[0],
      options: group.map((item) => ({ id: item.id, word: item.word, emoji: item.emoji, firstSound: item.phonemes[0] })),
    })));
  }
  if (chapterIndex === 1) {
    const words = getEligibleSpellingWords(1, taught);
    return words.map((target) => ({ id: `blend:${target.id}`, type: 'blend', target, answerId: target.id,
      options: words.filter((item) => item.graphemes.length === target.graphemes.length).map((item) => ({ id: item.id, word: item.word, emoji: item.emoji })) }));
  }
  if (chapterIndex === 2) {
    const words = getEligibleSpellingWords(2, taught);
    const tokens = distinctPhonemes(words);
    return words.flatMap((target) => ['first', 'middle', 'last'].map((position) => {
      const index = position === 'first' ? 0 : position === 'last' ? target.graphemes.length - 1 : Math.floor(target.graphemes.length / 2);
      const answerId = target.phonemes[index];
      return { id: `segment:${target.id}:${position}`, type: 'segment', target, position, index, answerId, options: takeOptions(answerId, tokens, hash(`${target.id}:${position}`)) };
    })).filter((item) => item.options.length === 4);
  }
  return [];
};

export const createSoundSafariRun = (chapterIndex, taught, seed, recentIds = []) => {
  const pool = createSoundSafariPool(chapterIndex, taught);
  if (pool.length < 20 || !Number.isInteger(seed)) return [];
  const poolIds = new Set(pool.map((item) => item.id));
  const recent = new Set(recentIds.filter((id) => poolIds.has(id)));
  let available = pool.filter((item) => !recent.has(item.id));
  const fresh = seededLiteracyShuffle(available, seed);
  const nextItems = fresh.length >= 6 ? fresh.slice(0, 6) : [...fresh, ...seededLiteracyShuffle(pool.filter((item) => !fresh.some((entry) => entry.id === item.id)), seed ^ 0x9e3779b9).slice(0, 6 - fresh.length)];
  return nextItems.map((item, index) => {
    const correctOption = item.type === 'match' ? item.options.find((option) => option.firstSound === item.answerId)
      : item.type === 'blend' ? item.options.find((option) => option.id === item.answerId) : null;
    const otherOptions = item.type === 'match' ? item.options.filter((option) => option.firstSound !== item.answerId)
      : item.type === 'blend' ? item.options.filter((option) => option.id !== item.answerId) : item.options;
    const options = correctOption ? [correctOption, ...seededLiteracyShuffle(otherOptions, seed + index * 31337).slice(0, 3)] : item.options;
    return Object.freeze({
    ...item,
    options: Object.freeze(seededLiteracyShuffle(options, seed + index * 104729)),
    graphemes: Object.freeze([...item.target.graphemes]),
    phonemes: Object.freeze([...item.target.phonemes]),
  });
  });
};

export const createSpellingRun = (chapterIndex, taughtInput, seed, recentIds = []) => {
  const taught = taughtSet(taughtInput);
  const pool = getEligibleSpellingWords(chapterIndex, taught);
  const tokens = [...new Set(pool.flatMap((item) => item.graphemes))].filter((token) => taught.has(token));
  if (pool.length < 20 || tokens.length < 4 || !Number.isInteger(seed)) return [];
  const poolIds = new Set(pool.map((item) => `spell:${item.id}`));
  const recent = new Set(recentIds.filter((id) => poolIds.has(id)));
  let available = pool.filter((item) => !recent.has(`spell:${item.id}`));
  const fresh = seededLiteracyShuffle(available, seed);
  const selected = fresh.length >= 6 ? fresh.slice(0, 6) : [...fresh, ...seededLiteracyShuffle(pool.filter((item) => !fresh.some((entry) => entry.id === `spell:${item.id}`)), seed ^ 0x9e3779b9).slice(0, 6 - fresh.length)];
  return selected.map((item, index) => {
    const missingIndex = (seed + index * 17) % item.graphemes.length;
    const missingOptions = takeOptions(item.graphemes[missingIndex], tokens, seed + index * 97);
    const distractors = seededLiteracyShuffle(tokens.filter((token) => !item.graphemes.includes(token)), seed + index * 131).slice(0, 3);
    const tiles = seededLiteracyShuffle([...item.graphemes, ...distractors].map((grapheme, tileIndex) => ({ id: `${item.id}:${tileIndex}`, grapheme })), seed + index * 193);
    return Object.freeze({ id: `spell:${item.id}`, target: item, missingIndex, missingOptions: Object.freeze(missingOptions), tiles: Object.freeze(tiles.map(Object.freeze)) });
  });
};

export const isCanonicalBatch5QuestionId = (game, chapterIndex, id) => {
  if (typeof id !== 'string') return false;
  const [kind, wordId, position] = id.split(':');
  const band = game === 'spelling' ? BATCH5_SPELLING_BANDS[chapterIndex]?.id
    : chapterIndex === 0 ? BATCH5_SPELLING_BANDS[0].id : chapterIndex === 1 ? BATCH5_SPELLING_BANDS[1].id : chapterIndex === 2 ? BATCH5_SPELLING_BANDS[2].id : null;
  if (!band || !BATCH5_SPELLING_WORDS.some((item) => item.id === wordId)) return false;
  const wordPool = SPELLING_WORDS_BY_BAND[band];
  if (!wordPool.some((item) => item.id === wordId)) return false;
  if (game === 'spelling') return chapterIndex >= 0 && chapterIndex <= 2 && kind === 'spell' && id === `spell:${wordId}`;
  if (chapterIndex < 0 || chapterIndex > 2) return false;
  return getCanonicalSoundIds(chapterIndex).has(id)
    && (chapterIndex !== 2 || ['first', 'middle', 'last'].includes(position));
};
