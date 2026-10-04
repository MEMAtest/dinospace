import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH5_SPELLING_WORDS, PURE_PHONEME_CLIP_PATHS } from '../src/data/batch5Literacy.js';
import { getTaughtGraphemes, LITERACY_PROFILE_KEY } from '../src/data/literacy.js';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { createSoundSafariPool, createSoundSafariRun, getEligibleSpellingWords, isCanonicalBatch5QuestionId } from '../src/data/batch5LiteracyPools.js';
import {
  getSoundSafariPictureWords,
  SOUND_SAFARI_PICTURE_ART_MANIFEST,
  SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER,
  soundSafariChapterArtReady,
} from '../src/data/batch5SoundSafariPictureWords.js';

const defaultTaught = (chapter) => chapter < 2 ? PHASE_SOUNDS[2] : [...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]];
const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};

test('each controlled picture pool has at least twenty default-taught targets and uses only taught phonemes', () => {
  assert.deepEqual(SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.map((items) => items.length), [26, 24, 29]);
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const taught = new Set(defaultTaught(chapter));
    const words = getSoundSafariPictureWords(chapter, taught);
    const pool = createSoundSafariPool(chapter, taught);
    assert.ok(words.length >= 20, `chapter ${chapter + 1} picture lexicon has ${words.length} targets`);
    assert.ok(pool.length >= 20, `chapter ${chapter + 1} question pool has ${pool.length} questions`);
    assert.equal(new Set(words.map((item) => item.id)).size, words.length);
    for (const word of words) {
      assert.ok(word.graphemes.every((grapheme) => taught.has(grapheme)), `${word.id} uses taught graphemes`);
      assert.ok(word.phonemes.every((phoneme) => PURE_PHONEME_CLIP_PATHS[phoneme]), `${word.id} uses an existing phoneme key`);
      assert.equal(word.graphemes.length, word.phonemes.length, `${word.id} aligns authored graphemes and spoken phonemes`);
    }
    for (const question of pool) assert.ok(isCanonicalBatch5QuestionId('soundSafari', chapter, question.id));
  }
});

test('match distractors have distinct first sounds and blending choices stay within one grapheme length', () => {
  const phase2 = PHASE_SOUNDS[2];
  const matchPool = createSoundSafariPool(0, phase2);
  for (const question of matchPool) {
    assert.equal(question.type, 'match');
    assert.ok(question.options.length >= 4);
    assert.equal(new Set(question.options.map((option) => option.firstSound)).size, question.options.length);
    assert.equal(question.options.filter((option) => option.firstSound === question.answerId).length, 1);
  }
  const matchRun = createSoundSafariRun(0, phase2, 721);
  assert.equal(matchRun.length, 6);
  for (const question of matchRun) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map((option) => option.firstSound)).size, 4);
    assert.equal(question.options.filter((option) => option.firstSound === question.answerId).length, 1);
  }

  const blendPool = createSoundSafariPool(1, phase2);
  assert.equal(blendPool.length, 24);
  for (const question of blendPool) {
    assert.equal(question.type, 'blend');
    assert.ok(question.options.length >= 4);
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
    assert.ok(question.options.every((option) => option.id === question.answerId || option.word !== question.target.word));
    const wordsById = new Map(SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[1].map((item) => [item.id, item]));
    assert.ok(question.options.every((option) => wordsById.get(option.id).graphemes.length === question.target.graphemes.length));
  }
  for (const question of createSoundSafariRun(1, phase2, 722)) {
    assert.equal(question.options.length, 4);
    assert.equal(question.options.filter((option) => option.id === question.answerId).length, 1);
    assert.ok(question.options.every((option) => SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[1].find((item) => item.id === option.id).graphemes.length === question.target.graphemes.length));
  }
});

test('position questions avoid ambiguous even-length middles and keep phoneme count separate from spelling length', () => {
  const phase3 = [...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]];
  const pool = createSoundSafariPool(2, phase3);
  assert.equal(pool.length, 29 * 2 + 23);
  const positionsByWord = new Map();
  for (const question of pool) {
    assert.equal(question.type, 'segment');
    assert.ok(question.target.phonemes.length >= 3);
    assert.equal(question.target.graphemes.length, question.target.phonemes.length);
    positionsByWord.set(question.target.id, [...(positionsByWord.get(question.target.id) || []), question.position]);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.answerId));
  }
  for (const [wordId, positions] of positionsByWord) {
    const word = SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[2].find((item) => item.id === wordId);
    const expected = word.phonemes.length % 2 ? ['first', 'middle', 'last'] : ['first', 'last'];
    assert.deepEqual(positions, expected);
  }
  assert.equal(positionsByWord.size, 29);
  assert.ok(pool.filter((question) => question.position === 'middle').every((question) => question.target.phonemes.length % 2 === 1));
  assert.ok(pool.filter((question) => question.position === 'middle').length >= 20);
});

test('persisted partial taught-sound selections filter picture targets without fallback', () => {
  const originalStorage = globalThis.localStorage;
  const storage = memoryStorage();
  try {
    globalThis.localStorage = storage;
    storage.setItem(LITERACY_PROFILE_KEY, JSON.stringify({ selectedSounds: ['c', 'a', 't', 'p', 'm'] }));
    const persistedTaught = getTaughtGraphemes();
    const limitedPool = createSoundSafariPool(0, persistedTaught);
    assert.ok(limitedPool.length < 20);
    for (const question of limitedPool) {
      assert.ok(question.target.graphemes.every((grapheme) => persistedTaught.has(grapheme)));
      assert.ok(question.options.every((option) => {
        const word = SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[0].find((item) => item.id === option.id);
        return word.graphemes.every((grapheme) => persistedTaught.has(grapheme));
      }));
    }
    assert.deepEqual(createSoundSafariRun(0, persistedTaught, 723), []);
    assert.deepEqual(getSoundSafariPictureWords(2, persistedTaught), []);
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('sound-only picture vocabulary stays out of spelling and missing artwork keeps the game closed', () => {
  const spellingIds = new Set(BATCH5_SPELLING_WORDS.map((item) => item.id));
  const pictureIds = new Set(SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.flatMap((items) => items.map((item) => item.id)));
  const newIds = [...pictureIds].filter((id) => id.startsWith('safari-'));
  assert.ok(newIds.length > 0);
  assert.ok(newIds.every((id) => !spellingIds.has(id)));
  assert.equal(getEligibleSpellingWords(1, PHASE_SOUNDS[2]).some((item) => item.id.startsWith('safari-')), false);
  assert.equal(isCanonicalBatch5QuestionId('spelling', 1, 'spell:safari-ant'), false);
  for (const words of SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER) {
    for (const word of words) assert.ok(SOUND_SAFARI_PICTURE_ART_MANIFEST[word.id]);
  }
  assert.equal(soundSafariChapterArtReady(0), false);
  assert.equal(soundSafariChapterArtReady(1), false);
  assert.equal(soundSafariChapterArtReady(2), false);
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST.map.status, 'reuse-approved');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST.duck.status, 'reuse-approved');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST['safari-star'].status, 'reuse-inspected-candidate');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST['safari-snail'].status, 'reuse-inspected-candidate');
  assert.ok(Object.entries(SOUND_SAFARI_PICTURE_ART_MANIFEST).filter(([, entry]) => entry.status === 'missing-original').length >= 70);
});
