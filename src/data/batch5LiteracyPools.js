import { BATCH5_SPELLING_BANDS, BATCH5_SPELLING_WORDS, SPELLING_WORDS_BY_BAND } from './batch5Literacy.js';
import { PHASE_GROUPS } from './literacy.js';
import { PHASE_SOUNDS } from './learningProgress.js';
import {
  getSoundSafariPictureWords,
  SOUND_SAFARI_DEFAULT_TAUGHT,
} from './batch5SoundSafariPictureWords.js';
import { getSoundSafariPictureArt } from './batch5SoundSafariPictureArt.js';
import { soundSafariSoundLabel } from './batch5SoundSafariLabels.js';

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
    const taught = chapterIndex < 2 ? PHASE_SAFES[2] : PHASE_SAFES[3];
    canonicalSoundPoolCache.set(chapterIndex, new Set(createSoundSafariPool(chapterIndex, taught).map((item) => item.id)));
  }
  return canonicalSoundPoolCache.get(chapterIndex);
};
const PHASE_SAFES = Object.freeze({
  2: SOUND_SAFARI_DEFAULT_TAUGHT.phase2,
  3: SOUND_SAFARI_DEFAULT_TAUGHT.phase3,
});
const distinctPhonemes = (words) => [...new Set(words.flatMap((item) => item.phonemes))];
const takeOptions = (answer, tokens, seed) => {
  const decoys = seededLiteracyShuffle(tokens.filter((token) => token !== answer), seed).slice(0, 3);
  return decoys.length === 3 ? seededLiteracyShuffle([answer, ...decoys], seed ^ 0x4f1bbcdc) : [];
};
const MINIMAL_PAIR_RECORDS = Object.freeze([
  Object.freeze({ id: 'cat-bat', wordIds: Object.freeze(['cat', 'safari-bat']), contextWordId: 'safari-bat', contextFact: 'A bat is an animal that flies.' }),
  Object.freeze({ id: 'cat-rat', wordIds: Object.freeze(['cat', 'safari-rat']), contextWordId: 'safari-rat', contextFact: 'A rat is a small animal with a long tail.' }),
  Object.freeze({ id: 'cat-cap', wordIds: Object.freeze(['cat', 'cap']), contextWordId: 'cat', contextFact: 'A cat is a furry pet that may say meow.' }),
  Object.freeze({ id: 'hen-pen', wordIds: Object.freeze(['hen', 'safari-pen']), contextWordId: 'hen', contextFact: 'A hen is a bird that lays eggs.' }),
  Object.freeze({ id: 'duck-dock', wordIds: Object.freeze(['duck', 'dock']), contextWordId: 'duck', contextFact: 'A duck is a bird with webbed feet that help it paddle.' }),
  Object.freeze({ id: 'sock-rock', wordIds: Object.freeze(['sock', 'rock']), contextWordId: 'rock', contextFact: 'A rock is a hard piece of stone.' }),
]);
const minimalPairQuestions = (words) => {
  const byId = new Map(words.map((item) => [item.id, item]));
  return MINIMAL_PAIR_RECORDS.flatMap((pair) => {
    const pairWords = pair.wordIds.map((id) => byId.get(id));
    if (pairWords.some((item) => !item || !getSoundSafariPictureArt(item.id))) return [];
    const [left, right] = pairWords;
    if (left.phonemes.length !== right.phonemes.length) return [];
    const differences = left.phonemes.flatMap((phoneme, index) => phoneme === right.phonemes[index] ? [] : [index]);
    if (differences.length !== 1) return [];
    return pairWords.map((target) => {
      const otherWord = target.id === left.id ? right : left;
      return Object.freeze({
        id: `minimal:${pair.id}:${target.id}`,
        type: 'minimalPair',
        pairId: pair.id,
        pairWordIds: pair.wordIds,
        target,
        otherWord,
        contextWord: byId.get(pair.contextWordId),
        contextFact: pair.contextFact,
        contrastIndex: differences[0],
        answerId: target.id,
        prompt: 'Listen to the whole spoken word. Which picture matches?',
        afterAnswer: `${pair.contextFact} The ${differences[0] === 0 ? 'first' : differences[0] === left.phonemes.length - 1 ? 'last' : 'middle'} sound in ${left.word} is the ${soundSafariSoundLabel(left.phonemes[differences[0]])}; in ${right.word} it is the ${soundSafariSoundLabel(right.phonemes[differences[0]])}.`,
        options: Object.freeze(pairWords.map((item) => Object.freeze({ id: item.id, word: item.word, imageSrc: getSoundSafariPictureArt(item.id) }))),
      });
    });
  });
};
export const getSoundSafariMinimalPairDefinitions = () => MINIMAL_PAIR_RECORDS;
export const createSoundSafariPool = (chapterIndex, taughtInput) => {
  const taught = taughtSet(taughtInput);
  if (chapterIndex === 0) {
    const words = getSoundSafariPictureWords(0, taught);
    const phaseTwoPairWords = [...words, ...getSoundSafariPictureWords(1, taught)];
    return words.map((target) => {
      const byFirstSound = new Map();
      for (const item of words) {
        if (item.phonemes[0] !== target.phonemes[0] && !byFirstSound.has(item.phonemes[0])) {
          byFirstSound.set(item.phonemes[0], item);
        }
      }
      const options = [target, ...byFirstSound.values()].map((item) => ({
        id: item.id,
        word: item.word,
        emoji: item.emoji,
        imageSrc: getSoundSafariPictureArt(item.id),
        firstSound: item.phonemes[0],
      }));
      return {
        id: `match:${target.id}`, type: 'match', target, answerId: target.phonemes[0], options,
      };
    }).filter((item) => item.options.length >= 4).concat(minimalPairQuestions(phaseTwoPairWords));
  }
  if (chapterIndex === 1) {
    const words = getSoundSafariPictureWords(1, taught);
    return words.map((target) => ({ id: `blend:${target.id}`, type: 'blend', target, answerId: target.id,
      options: words.filter((item) => item.graphemes.length === target.graphemes.length).map((item) => ({ id: item.id, word: item.word, emoji: item.emoji, imageSrc: getSoundSafariPictureArt(item.id) })) }))
      .filter((item) => item.options.length >= 4);
  }
  if (chapterIndex === 2) {
    const words = getSoundSafariPictureWords(2, taught).filter((item) => item.graphemes.length === item.phonemes.length && item.phonemes.length >= 3);
    const tokens = distinctPhonemes(words);
    return words.flatMap((target) => ['first', ...(target.phonemes.length % 2 === 1 ? ['middle'] : []), 'last'].map((position) => {
      // A middle sound is unambiguous only for odd-length sound sequences.
      // First and last questions still use every otherwise eligible target.
      const index = position === 'first' ? 0 : position === 'last' ? target.phonemes.length - 1 : Math.floor(target.phonemes.length / 2);
      const answerId = target.phonemes[index];
      return { id: `segment:${target.id}:${position}`, type: 'segment', target, position, index, answerId, options: takeOptions(answerId, tokens, hash(`${target.id}:${position}`)) };
    })).filter((item) => item.options.length === 4);
  }
  return [];
};

export const createSoundSafariRun = (chapterIndex, taught, seed, recentIds = []) => {
  const pool = createSoundSafariPool(chapterIndex, taught);
  if (pool.length < 20 || !Number.isInteger(seed)) return [];
  if (chapterIndex === 0) {
    const matches = pool.filter((item) => item.type === 'match');
    const pairs = pool.filter((item) => item.type === 'minimalPair');
    const recentPairIds = new Set(recentIds.map((id) => pool.find((item) => item.id === id)?.pairId).filter(Boolean));
    const pairGroups = new Map();
    for (const item of pairs) pairGroups.set(item.pairId, [...(pairGroups.get(item.pairId) || []), item]);
    const pairPool = [...pairGroups.entries()];
    const freshPairs = seededLiteracyShuffle(pairPool.filter(([pairId]) => !recentPairIds.has(pairId)), seed);
    const fallbackPairs = seededLiteracyShuffle(pairPool.filter(([pairId]) => recentPairIds.has(pairId)), seed ^ 0x77391);
    const selectedPairs = [...freshPairs, ...fallbackPairs].slice(0, 2);
    if (selectedPairs.length !== 2) return [];
    const selected = selectedPairs.map(([, directions], index) => {
      const direction = seededLiteracyShuffle(directions, seed + (index + 1) * 65537)[0];
      const leftCorrect = (seed + index) % 2 === 0;
      const targetIsInitiallyLeft = direction.options[0]?.id === direction.target.id;
      const keepInitialOrder = targetIsInitiallyLeft === leftCorrect;
      const options = keepInitialOrder ? direction.options : [...direction.options].reverse();
      return Object.freeze({ ...direction, options: Object.freeze(options), leftCorrect });
    });
    const recentMatchIds = new Set(recentIds.filter((id) => id.startsWith('match:')));
    const freshMatches = seededLiteracyShuffle(matches.filter((item) => !recentMatchIds.has(item.id)), seed ^ 0x9e3779b9);
    const fallbackMatches = seededLiteracyShuffle(matches.filter((item) => recentMatchIds.has(item.id)), seed ^ 0x4f1bbcdc);
    const selectedMatches = [...freshMatches, ...fallbackMatches].slice(0, 4).map((item, index) => {
      const correct = item.options.find((option) => option.firstSound === item.answerId);
      const decoys = item.options.filter((option) => option.firstSound !== item.answerId);
      return { ...item, options: seededLiteracyShuffle([correct, ...seededLiteracyShuffle(decoys, seed + index * 31627).slice(0, 3)], seed ^ (index * 97 + 5)) };
    });
    if (selectedMatches.length !== 4) return [];
    return seededLiteracyShuffle([...selected, ...selectedMatches], seed ^ 0x71f3).map((item) => Object.freeze({
      ...item,
      options: Object.freeze([...item.options]),
      graphemes: Object.freeze([...item.target.graphemes]),
      phonemes: Object.freeze([...item.target.phonemes]),
    }));
  }
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
  if (!Number.isInteger(chapterIndex) || chapterIndex < 0 || chapterIndex > 2) return false;
  if (game === 'spelling') {
    const band = BATCH5_SPELLING_BANDS[chapterIndex]?.id;
    if (!band || !BATCH5_SPELLING_WORDS.some((item) => item.id === wordId)) return false;
    return SPELLING_WORDS_BY_BAND[band].some((item) => item.id === wordId)
      && kind === 'spell' && id === `spell:${wordId}`;
  }
  if (game !== 'soundSafari') return false;
  return getCanonicalSoundIds(chapterIndex).has(id)
    && (chapterIndex !== 2 || ['first', 'middle', 'last'].includes(position));
};
