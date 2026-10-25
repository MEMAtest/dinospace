export const SOUND_SAFARI_PHONEME_KEYS = Object.freeze(['s', 'a', 't', 'p', 'i', 'n']);
// Six individually packaged clips; parent confirmed clean sounds on 25 October 2026.
export const SOUND_SAFARI_PHONEME_AUDIO = Object.freeze({
  s: '/audio/phonemes/en/s-daniel-v1.mp3',
  a: '/audio/phonemes/en/a-daniel-v1.mp3',
  t: '/audio/phonemes/en/t-daniel-v1.mp3',
  p: '/audio/phonemes/en/p-daniel-v1.mp3',
  i: '/audio/phonemes/en/i-daniel-v1.mp3',
  n: '/audio/phonemes/en/n-daniel-v1.mp3',
});
export const SOUND_SAFARI_BLEND_PROMPT = 'Say each sound, then blend the word. What word does this make?';

const entries = [
  ['ant', 'a n t', 'ant'], ['sit', 's i t', 'sit'], ['sip', 's i p', 'sip'],
  ['tip', 't i p', 'tip'], ['pit', 'p i t', 'pit'], ['pin', 'p i n', 'pin'], ['tin', 't i n', 'tin'],
  ['tap', 't a p', 'tap'], ['nap', 'n a p', 'nap'], ['pan', 'p a n', 'pan'], ['pat', 'p a t', 'pat'],
  ['sap', 's a p', 'sap'], ['pip', 'p i p', 'pip'], ['snip', 's n i p', 'snip'],
  ['snap', 's n a p', 'snap'], ['spin', 's p i n', 'spin'], ['pants', 'p a n t s', 'pants'],
  ['insect', 'i n s e k t', 'insect', true],
];
export const SOUND_SAFARI_WORDS = Object.freeze(entries.map(([word, phonemeText, picture, listeningOnly = false]) => Object.freeze({
  id: word,
  word: word.toUpperCase(),
  phonemes: phonemeText.split(' '),
  needs: [...new Set(phonemeText.split(' '))],
  picture,
  initialSound: phonemeText.split(' ')[0],
  listeningOnly,
})));

export const SOUND_SAFARI_NARRATION_INVENTORY = Object.freeze([
  SOUND_SAFARI_BLEND_PROMPT,
  ...SOUND_SAFARI_WORDS.map(({ word }) => word),
]);

export const SOUND_SAFARI_CHAPTERS = Object.freeze([
  { id: 'listen', title: 'Listen for a sound', skill: 'phoneme-recognition', intro: 'Listen to the sound. Choose the picture that begins the same way.' },
  { id: 'blend', title: 'Blend the sounds', skill: 'oral-blending', intro: 'Tap each sound, then slide the sounds together to make a word.' },
  { id: 'segment', title: 'Pull a word apart', skill: 'phoneme-segmentation', intro: 'Say the word slowly. Find each sound in order.' },
]);

export const seededShuffle = (items, seed) => {
  let state = (Number(seed) >>> 0) || 0x51f15e;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const getSoundSafariAttemptQuality = ({ firstAttempt, usedClue, soundOn, visualPractice, audioReady }) => {
  const assisted = Boolean(usedClue || !soundOn || visualPractice || !audioReady);
  return { assisted, independent: Boolean(firstAttempt && !assisted) };
};

export const getSoundSafariListeningPictures = (taughtGraphemes, supportedKeys = SOUND_SAFARI_PHONEME_KEYS) => {
  const taught = new Set([...(taughtGraphemes || [])].map((item) => String(item).toLowerCase()));
  const supported = new Set(supportedKeys);
  return SOUND_SAFARI_WORDS.filter((word) => taught.has(word.initialSound) && supported.has(word.initialSound));
};

export const getSoundSafariWords = (taughtGraphemes, supportedKeys = SOUND_SAFARI_PHONEME_KEYS) => {
  const taught = new Set([...(taughtGraphemes || [])].map((item) => String(item).toLowerCase()));
  const supported = new Set(supportedKeys);
  return SOUND_SAFARI_WORDS.filter((word) => !word.listeningOnly && word.phonemes.every((sound) => taught.has(sound) && supported.has(sound)));
};
const sampleWithoutRecent = (items, recentIds, seed) => {
  const shuffled = seededShuffle(items, seed);
  return [...shuffled.filter((item) => !recentIds.includes(item.id)), ...shuffled.filter((item) => recentIds.includes(item.id))].slice(0, 6);
};

export function buildSoundSafariRun({ taughtGraphemes, supportedKeys = SOUND_SAFARI_PHONEME_KEYS, recentIds = [], seed = 1 } = {}) {
  const words = getSoundSafariWords(taughtGraphemes, supportedKeys);
  const listeningPictures = getSoundSafariListeningPictures(taughtGraphemes, supportedKeys);
  const initialSounds = [...new Set(listeningPictures.map((word) => word.initialSound))];
  if (initialSounds.length < 6 || words.length < 6 || SOUND_SAFARI_PHONEME_KEYS.some((sound) => !supportedKeys.includes(sound))) {
    return { ready: false, reason: 'more-taught-sounds', chapters: [], supportedWordCount: words.length };
  }
  const recognition = initialSounds.map((sound) => ({
    id: `listen-${sound}`,
    target: { sound },
    pictureWord: seededShuffle(listeningPictures.filter((word) => word.initialSound === sound), seed + sound.charCodeAt(0))[0],
    skill: 'phoneme-recognition',
  }));
  const pools = [recognition, words.map((word) => ({ id: `blend-${word.id}`, word, skill: 'oral-blending' })), words.map((word) => ({ id: `segment-${word.id}`, word, skill: 'phoneme-segmentation' }))];
  if (pools.some((pool) => pool.length < 6)) return { ready: false, reason: 'more-taught-sounds', chapters: [], supportedWordCount: words.length };
  const chapters = SOUND_SAFARI_CHAPTERS.map((chapter, index) => ({
    ...chapter,
    rounds: sampleWithoutRecent(pools[index], recentIds, seed + index * 101).map((round, roundIndex) => ({ ...round, number: roundIndex + 1 })),
  }));
  return { ready: true, chapters, supportedWordCount: words.length };
}

export function buildRoundOptions(round, chapter, seed = 1, taughtGraphemes = [], supportedKeys = SOUND_SAFARI_PHONEME_KEYS) {
  const words = getSoundSafariWords(taughtGraphemes, supportedKeys);
  if (chapter.id === 'listen') {
    const correct = round.pictureWord;
    const decoys = getSoundSafariListeningPictures(taughtGraphemes, supportedKeys)
      .filter((word) => word.id !== correct.id && word.initialSound !== round.target.sound);
    return seededShuffle([correct, ...seededShuffle(decoys, seed).slice(0, 3)], seed + 7);
  }
  const pool = words.filter((word) => word.id !== round.word.id);
  return seededShuffle([round.word, ...seededShuffle(pool, seed).slice(0, 2)], seed + 13);
}

export function buildSegmentChoices(word, seed = 1, taughtGraphemes = [], supportedKeys = SOUND_SAFARI_PHONEME_KEYS) {
  const correct = word.phonemes.map((sound, index) => ({ id: `${word.id}-${index}-${sound}`, sound, correct: true }));
  const taught = new Set([...(taughtGraphemes || [])].map((item) => String(item).toLowerCase()));
  const decoys = seededShuffle([...new Set(supportedKeys.filter((sound) => taught.has(sound) && !word.phonemes.includes(sound)))], seed)
    .slice(0, 2).map((sound, index) => ({ id: `${word.id}-extra-${index}`, sound, correct: false }));
  return seededShuffle([...correct, ...decoys], seed + 17);
}
