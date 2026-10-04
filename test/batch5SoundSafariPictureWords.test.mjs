import test from 'node:test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { BATCH5_SPELLING_WORDS, PURE_PHONEME_CLIP_PATHS } from '../src/data/batch5Literacy.js';
import { getTaughtGraphemes, LITERACY_PROFILE_KEY } from '../src/data/literacy.js';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { createSoundSafariPool, createSoundSafariRun, getEligibleSpellingWords, getSoundSafariMinimalPairDefinitions, isCanonicalBatch5QuestionId } from '../src/data/batch5LiteracyPools.js';
import { SOUND_SAFARI_PICTURE_ART } from '../src/data/batch5SoundSafariPictureArt.js';
import { soundSafariSoundLabel } from '../src/data/batch5SoundSafariLabels.js';
import {
  getSoundSafariPictureWords,
  SOUND_SAFARI_PICTURE_ART_MANIFEST,
  SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER,
  SOUND_SAFARI_PHONEME_TAUGHT_EQUIVALENCES,
  isSoundSafariWordTaught,
  soundSafariChapterArtReady,
  SOUND_SAFARI_WHOLE_WORD_RECORDINGS,
  soundSafariWholeWordAudioReady,
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
  assert.deepEqual(SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.map((items) => items.length), [26, 26, 29]);
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
  const matchPool = createSoundSafariPool(0, phase2).filter((question) => question.type === 'match');
  for (const question of matchPool) {
    assert.equal(question.type, 'match');
    assert.ok(question.options.length >= 4);
    assert.equal(new Set(question.options.map((option) => option.firstSound)).size, question.options.length);
    assert.equal(question.options.filter((option) => option.firstSound === question.answerId).length, 1);
  }
  const mixedRun = createSoundSafariRun(0, phase2, 721);
  assert.equal(mixedRun.length, 6);
  assert.equal(mixedRun.filter((question) => question.type === 'minimalPair').length, 2);
  assert.equal(mixedRun.filter((question) => question.type === 'match').length, 4);
  for (const question of mixedRun.filter((item) => item.type === 'match')) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map((option) => option.firstSound)).size, 4);
    assert.equal(question.options.filter((option) => option.firstSound === question.answerId).length, 1);
  }

  const blendPool = createSoundSafariPool(1, phase2);
  assert.equal(blendPool.length, 23);
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

test('persisted ar-off selection excludes UK /ɑː/ targets and answer options even when spelling uses a', () => {
  const taught = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3].filter((sound) => sound !== 'ar')]);
  const words = getSoundSafariPictureWords(2, taught);
  assert.ok(taught.has('a'));
  assert.equal(taught.has('ar'), false);
  assert.ok(words.every((word) => isSoundSafariWordTaught(word, taught)));
  assert.ok(words.every((word) => !word.phonemes.includes('ar')));
  assert.ok(!words.some((word) => ['branch', 'grass', 'shark', 'star'].includes(word.word)));
  const questions = createSoundSafariPool(2, taught);
  assert.ok(questions.length >= 20);
  assert.ok(questions.every((question) => question.answerId !== 'ar' && !question.options.includes('ar')));

  const limited = new Set(['a', 't', 'o']);
  assert.equal(isSoundSafariWordTaught({ graphemes: ['a'], phonemes: ['unknown-phoneme'] }, limited), false);
  assert.equal(isSoundSafariWordTaught({ graphemes: ['t', 'oo'], phonemes: ['t', 'oo-long'] }, limited), false);
  assert.equal(SOUND_SAFARI_PHONEME_TAUGHT_EQUIVALENCES['oo-long'], 'oo');
  assert.equal(SOUND_SAFARI_PHONEME_TAUGHT_EQUIVALENCES['th-unvoiced'], 'th');
});

test('UK plant and raft require taught /ɑː/ while retaining their authored spellings', () => {
  const phase2 = new Set(PHASE_SOUNDS[2]);
  const phase3 = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]]);
  const phase2Words = getSoundSafariPictureWords(1, phase2);
  assert.equal(phase2Words.length, 23);
  assert.ok(!phase2Words.some((word) => ['plant', 'raft'].includes(word.word)));
  const phase3Words = getSoundSafariPictureWords(1, phase3);
  assert.equal(phase3Words.length, 26);
  for (const word of phase3Words.filter((item) => ['plant', 'raft'].includes(item.word))) {
    assert.ok(word.graphemes.includes('a'));
    assert.ok(word.phonemes.includes('ar'));
    assert.equal(word.phase, 3);
    assert.ok(word.ukIpa);
  }
  const arOff = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3].filter((sound) => sound !== 'ar')]);
  const arOffPool = createSoundSafariPool(1, arOff);
  assert.ok(arOffPool.every((question) => !['plant', 'raft'].includes(question.target.word)));
  assert.ok(arOffPool.every((question) => question.options.every((option) => !['plant', 'raft'].includes(option.word))));
  const arOnPool = createSoundSafariPool(1, phase3);
  assert.ok(arOnPool.some((question) => question.target.word === 'plant'));
  assert.ok(arOnPool.some((question) => question.target.word === 'raft'));
  assert.ok(arOnPool.some((question) => question.target.word === 'plank'));
  assert.ok(arOnPool.some((question) => question.options.some((option) => option.word === 'plank')));
  assert.equal(createSoundSafariPool(1, phase2).some((question) => question.target.word === 'plank'), false);
  const ngOff = new Set([...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3].filter((sound) => sound !== 'ng')]);
  const ngOffPool = createSoundSafariPool(1, ngOff);
  assert.equal(ngOffPool.some((question) => question.target.word === 'plank'), false);
  assert.ok(ngOffPool.every((question) => question.options.every((option) => option.word !== 'plank')));
  const fiveGraphemeTargets = createSoundSafariPool(1, phase2).filter((question) => question.target.graphemes.length === 5);
  assert.equal(fiveGraphemeTargets.length, 4);
  assert.ok(fiveGraphemeTargets.every((question) => question.options.length === 4 && question.options.every((option) => option.word.length === 5)));
  // ng authorizes the /ŋ/ phoneme, while written nk remains a separately
  // taught spelling cluster; both must be selected before plank can appear.
  const nkOff = new Set([...phase3].filter((sound) => sound !== 'nk'));
  const nkOffPool = createSoundSafariPool(1, nkOff);
  assert.ok(nkOff.has('ng'));
  assert.equal(nkOffPool.some((question) => question.target.word === 'plank'), false);
  assert.ok(nkOffPool.every((question) => question.options.every((option) => option.word !== 'plank')));
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
  assert.equal(soundSafariChapterArtReady(0), true);
  assert.equal(soundSafariChapterArtReady(1), false);
  assert.equal(soundSafariChapterArtReady(2), false);
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST.map.status, 'packaged');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST.duck.status, 'packaged');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST['safari-star'].status, 'packaged');
  assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST['safari-snail'].status, 'packaged');
  assert.ok(Object.entries(SOUND_SAFARI_PICTURE_ART_MANIFEST).filter(([, entry]) => entry.status === 'missing-original').length > 0);
});


test('starter run has two distinct whole-word contrasts and four first-sound questions with no pre-answer word leaks', () => {
  const taught = PHASE_SOUNDS[2];
  const pool = createSoundSafariPool(0, taught);
  const pairQuestions = pool.filter((question) => question.type === 'minimalPair');
  const definitions = getSoundSafariMinimalPairDefinitions();
  assert.equal(definitions.length, 6);
  assert.deepEqual(new Set(definitions.map((pair) => pair.id)), new Set(['cat-bat', 'cat-rat', 'cat-cap', 'hen-pen', 'duck-dock', 'sock-rock']));
  assert.equal(pairQuestions.length, definitions.length * 2);
  for (const question of pairQuestions) {
    assert.equal(question.options.length, 2);
    assert.equal(new Set(question.options.map((option) => option.id)).size, 2);
    assert.equal(new Set(question.options.map((option) => option.imageSrc)).size, 2);
    assert.equal(question.options.filter((option) => option.id === question.answerId).length, 1);
    assert.equal(question.target.id, question.answerId);
    assert.ok(question.prompt.toLowerCase().includes('whole spoken word'));
    assert.ok(!question.prompt.toLowerCase().includes(question.target.word.toLowerCase()));
    const changedPositions = question.target.phonemes.flatMap((phoneme, index) => phoneme === question.otherWord.phonemes[index] ? [] : [index]);
    assert.deepEqual(changedPositions, [question.contrastIndex]);
    assert.ok(question.afterAnswer.includes(question.target.word));
    assert.ok(question.afterAnswer.includes(question.otherWord.word));
    assert.ok(question.afterAnswer.includes(question.contextFact));
    const expectedPosition = question.contrastIndex === 0 ? 'first sound' : question.contrastIndex === question.target.phonemes.length - 1 ? 'last sound' : 'middle sound';
    assert.ok(question.afterAnswer.includes(expectedPosition));
    assert.ok(!question.afterAnswer.includes('starts with /'));
    assert.ok(!question.afterAnswer.includes(`/${question.target.phonemes[question.contrastIndex]}/`));
    for (const option of question.options) assert.ok(option.imageSrc);
  }
  for (let seed = 1; seed <= 100; seed += 1) {
    const run = createSoundSafariRun(0, taught, seed);
    assert.equal(run.length, 6);
    assert.equal(run.filter((question) => question.type === 'minimalPair').length, 2);
    assert.equal(run.filter((question) => question.type === 'match').length, 4);
    const pairs = run.filter((question) => question.type === 'minimalPair');
    assert.equal(new Set(pairs.map((question) => question.pairId)).size, 2);
    assert.equal(new Set(run.map((question) => question.id)).size, 6);
    assert.deepEqual(pairs.map((question) => question.leftCorrect).sort(), [false, true]);
    for (const question of pairs) {
      assert.equal(question.options[0].id === question.answerId, question.leftCorrect);
      assert.ok(question.options.every((option) => existsSync(fileURLToPath(SOUND_SAFARI_PICTURE_ART[option.id]))));
    }
  }
  assert.equal(SOUND_SAFARI_WHOLE_WORD_RECORDINGS.cat, undefined);
  assert.equal(soundSafariWholeWordAudioReady(0), false);
});

test('child-facing sound names describe all authored phonemes instead of exposing storage keys', () => {
  const phonemes = new Set(SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.flatMap((words) => words.flatMap((word) => word.phonemes)));
  for (const phoneme of phonemes) assert.notEqual(soundSafariSoundLabel(phoneme), 'a speech sound', `missing child label for ${phoneme}`);
  assert.equal(soundSafariSoundLabel('c'), 'k sound');
  assert.equal(soundSafariSoundLabel('ck'), 'k sound');
  assert.equal(soundSafariSoundLabel('sh'), 'sh sound, as in ship');
  assert.equal(soundSafariSoundLabel('ch'), 'ch sound, as in chip');
  assert.equal(soundSafariSoundLabel('ll'), 'l sound');
  assert.equal(soundSafariSoundLabel('ss'), 's sound');
  assert.equal(soundSafariSoundLabel('ng'), 'ng sound, as in sing');
  assert.equal(soundSafariSoundLabel('u'), 'short u sound, as in up');
  assert.equal(soundSafariSoundLabel('o'), 'short o sound, as in dog');
  assert.equal(soundSafariSoundLabel('x'), 'k sound then s sound, as in fox');
  assert.equal(soundSafariSoundLabel('qu'), 'k sound then w sound, as in queen');
});

test('recent whole-word pair signatures rotate across the finite pair pool before reuse', () => {
  const taught = PHASE_SOUNDS[2];
  const first = createSoundSafariRun(0, taught, 901);
  const firstPairIds = new Set(first.filter((item) => item.type === 'minimalPair').map((item) => item.pairId));
  const second = createSoundSafariRun(0, taught, 902, first.map((item) => item.id));
  const secondPairIds = new Set(second.filter((item) => item.type === 'minimalPair').map((item) => item.pairId));
  assert.equal(second.length, 6);
  assert.equal([...firstPairIds].some((id) => secondPairIds.has(id)), false);
  const third = createSoundSafariRun(0, taught, 903, [...first, ...second].map((item) => item.id));
  assert.equal(third.length, 6);
});

test('every starter picture URL resolves to a local file and artwork readiness follows each full chapter pool', () => {
  const starter = SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER[0];
  assert.equal(starter.length, 26);
  for (const word of starter) {
    const url = SOUND_SAFARI_PICTURE_ART[word.id];
    assert.ok(url, `${word.id} has a static art URL`);
    assert.ok(existsSync(fileURLToPath(url)), `${word.id} art file exists`);
    assert.equal(SOUND_SAFARI_PICTURE_ART_MANIFEST[word.id].status, 'packaged');
  }
  assert.equal(soundSafariChapterArtReady(0), true);
  assert.equal(soundSafariChapterArtReady(1), false);
  assert.equal(soundSafariChapterArtReady(2), false);
});
