import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH5_NARRATION, BATCH5_SPELLING_BANDS, BATCH5_SPELLING_WORDS, PURE_PHONEME_CLIP_PATHS, SPELLING_WORDS_BY_BAND } from '../src/data/batch5Literacy.js';
import { createSoundSafariPool, createSoundSafariRun, createSpellingRun, getEligibleSpellingWords, isCanonicalBatch5QuestionId } from '../src/data/batch5LiteracyPools.js';
import { getBatch5LiteracyProgress, recordBatch5LiteracyCompletion, rememberBatch5LiteracyRun } from '../src/data/batch5LiteracyProgress.js';
import { PHASE_GROUPS } from '../src/data/literacy.js';
import { PHASE_SOUNDS } from '../src/data/learningProgress.js';
import { playerStorageKey } from '../src/data/players.js';
import { buildBatch5LiteracyNarrationInventory } from '../scripts/batch5LiteracyNarrationInventory.mjs';
import { SOUND_SAFARI_DEFAULT_TAUGHT } from '../src/data/batch5SoundSafariPictureWords.js';
import { soundSafariPrompt, soundSafariRetryText, soundSafariSpokenFeedback } from '../src/data/batch5SoundSafariNarration.js';

const fullTaught = (chapter) => PHASE_GROUPS.slice(0, chapter + 1).flatMap((group) => group.graphemes);
const memoryStorage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data };
};

test('eligible spelling pools are strictly taught, finite and at least twenty words', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const taught = fullTaught(chapter);
    const eligible = getEligibleSpellingWords(chapter, taught);
    assert.ok(eligible.length >= 20);
    assert.deepEqual(eligible.map((item) => item.id), SPELLING_WORDS_BY_BAND[BATCH5_SPELLING_BANDS[chapter].id].map((item) => item.id));
    for (const item of eligible) assert.ok(item.graphemes.every((grapheme) => taught.includes(grapheme)));
    assert.deepEqual(getEligibleSpellingWords(chapter, []), []);
  }
  assert.ok(BATCH5_SPELLING_WORDS.every((item) => item.graphemes.length === item.phonemes.length));
});

test('all sound and spelling runs are deterministic, six rounds, answerable, and avoid repeats until the pool cycles', () => {
  for (let chapter = 0; chapter < 3; chapter += 1) {
    const taught = fullTaught(chapter);
    const soundTaught = chapter < 2 ? PHASE_SOUNDS[2] : [...PHASE_SOUNDS[2], ...PHASE_SOUNDS[3]];
    const soundPool = createSoundSafariPool(chapter, soundTaught);
    const spellingPool = getEligibleSpellingWords(chapter, taught).map((item) => `spell:${item.id}`);
    assert.ok(soundPool.length >= 20);
    const firstSound = createSoundSafariRun(chapter, soundTaught, 9100 + chapter);
    const firstSpelling = createSpellingRun(chapter, taught, 9100 + chapter);
    assert.deepEqual(firstSound, createSoundSafariRun(chapter, soundTaught, 9100 + chapter));
    assert.deepEqual(firstSpelling, createSpellingRun(chapter, taught, 9100 + chapter));
    assert.equal(firstSound.length, 6);
    assert.equal(firstSpelling.length, 6);
    assert.equal(new Set(firstSound.map((item) => item.id)).size, 6);
    assert.equal(new Set(firstSpelling.map((item) => item.id)).size, 6);
    for (const item of firstSound) {
      assert.ok(isCanonicalBatch5QuestionId('soundSafari', chapter, item.id));
      assert.ok(item.options.length >= (item.type === 'minimalPair' ? 2 : 3));
      const answers = item.options.filter((option) => item.type === 'match' ? option.firstSound === item.answerId : item.type === 'blend' || item.type === 'minimalPair' ? option.id === item.answerId : option === item.answerId);
      assert.equal(answers.length, 1, `${chapter}:${item.id} has one correct option`);
    }
    for (const item of firstSpelling) {
      assert.ok(isCanonicalBatch5QuestionId('spelling', chapter, item.id));
      assert.equal(item.missingOptions.filter((option) => option === item.target.graphemes[item.missingIndex]).length, 1);
      assert.equal(new Set(item.tiles.map((tile) => tile.id)).size, item.tiles.length);
      assert.ok(item.target.graphemes.every((token) => item.tiles.some((tile) => tile.grapheme === token)));
    }
    const soundSeen = new Set(firstSound.map((item) => item.id));
    const spellingSeen = new Set(firstSpelling.map((item) => item.id));
    for (let seed = 1; soundSeen.size < soundPool.length || spellingSeen.size < spellingPool.length; seed += 1) {
      const nextSound = createSoundSafariRun(chapter, soundTaught, seed, [...soundSeen]);
      const nextSpelling = createSpellingRun(chapter, taught, seed, [...spellingSeen]);
      assert.equal(nextSound.length, 6);
      assert.equal(nextSpelling.length, 6);
      for (const item of nextSound) soundSeen.add(item.id);
      for (const item of nextSpelling) spellingSeen.add(item.id);
      assert.ok(seed < Math.max(soundPool.length, spellingPool.length) + 2);
    }
    assert.equal(soundSeen.size, soundPool.length);
    assert.equal(spellingSeen.size, spellingPool.length);
  }
  assert.deepEqual(createSoundSafariRun(0, PHASE_SOUNDS[2], 1, []), createSoundSafariRun(0, PHASE_SOUNDS[2], 1, []));
});

test('progress is Amari scoped, sanitizes corrupt chapters and awards only best-star improvements', () => {
  const storage = memoryStorage();
  const taught = fullTaught(0);
  const words = getEligibleSpellingWords(0, taught);
  const poolIds = words.map((item) => `spell:${item.id}`);
  const runIds = createSpellingRun(0, taught, 54).map((item) => item.id);
  assert.equal(rememberBatch5LiteracyRun('spelling', 0, runIds, poolIds, 'askia', storage), null);
  assert.equal(recordBatch5LiteracyCompletion('spelling', 1, 3, runIds, poolIds, 'amari', storage), null);
  assert.equal(rememberBatch5LiteracyRun('spelling', 0, runIds, poolIds, 'amari', storage).unlockedChapter, 0);
  assert.equal(recordBatch5LiteracyCompletion('spelling', 0, 2, runIds, poolIds, 'amari', storage).awardedStars, 2);
  assert.equal(recordBatch5LiteracyCompletion('spelling', 0, 2, runIds, poolIds, 'amari', storage).awardedStars, 0);
  assert.equal(recordBatch5LiteracyCompletion('spelling', 0, 3, runIds, poolIds, 'amari', storage).awardedStars, 1);
  assert.equal(getBatch5LiteracyProgress('spelling', 'amari', storage).unlockedChapter, 1);
  assert.equal(getBatch5LiteracyProgress('spelling', 'askia', storage).unlockedChapter, 0);
  const stateKey = playerStorageKey('amari', 'batch5_literacy_progress_v1');
  storage.setItem(stateKey, JSON.stringify({ version: 1, games: { spelling: { completedChapterIds: [0, 2], bestStars: { 0: 9, 2: 3 }, recentQuestionIds: { 2: ['spell:invented'] } } } }));
  const clean = getBatch5LiteracyProgress('spelling', 'amari', storage);
  assert.deepEqual(clean.completedChapterIds, [0]);
  assert.deepEqual(clean.bestStars, {});
  assert.deepEqual(clean.recentQuestionIds, {});
});

test('narration inventory includes exact finite runtime speech and phoneme recordings stay separate', () => {
  const inventory = buildBatch5LiteracyNarrationInventory();
  const texts = new Set(inventory.items.map((item) => item.text));
  const keys = new Set(inventory.items.map((item) => item.key));
  assert.equal(keys.size, inventory.items.length);
  assert.ok(inventory.items.every((item) => item.path === `/audio/en/${item.key}-matilda.mp3`));
  for (const sequence of inventory.sequences) {
    assert.ok(sequence.every((segment) => texts.has(segment)));
    assert.ok(texts.has(sequence.join(' ')));
  }
  for (const item of BATCH5_SPELLING_WORDS) {
    assert.ok(texts.has(item.word));
    assert.ok(texts.has(item.clue));
    assert.ok(texts.has(`The word is ${item.word}.`));
    assert.ok(texts.has(`${BATCH5_NARRATION.praise[1]} The word is ${item.word}.`));
  }
  assert.ok(Object.keys(PURE_PHONEME_CLIP_PATHS).every((phoneme) => PURE_PHONEME_CLIP_PATHS[phoneme].startsWith('/audio/phonemes/en/')));
  assert.ok(inventory.phonemes.length >= 20);
  assert.equal(inventory.soundSafari.wholeWordRecordingIds.length, 10);
  assert.equal(inventory.soundSafari.phase2MinimalPairDirectionCount, 12);
  assert.equal(inventory.soundSafari.phase2BlendQuestionCount, 23);
  assert.equal(inventory.soundSafari.phase3BlendQuestionCount, 26);
  assert.equal(inventory.soundSafari.phase3PositionQuestionCount, 81);
  assert.equal(inventory.soundSafari.purePhonemeSequences.phase3BlendQuestions.length, 26);
  assert.ok(inventory.soundSafari.purePhonemeSequences.phase3BlendQuestions.every(({ phonemes }) => phonemes.every((phoneme) => Object.hasOwn(PURE_PHONEME_CLIP_PATHS, phoneme))));
  for (const word of ['plant', 'raft', 'plank']) assert.ok(texts.has(`You blended the sounds to say ${word}.`));
  const actualSoundSafari = [
    ...createSoundSafariPool(0, SOUND_SAFARI_DEFAULT_TAUGHT.phase2),
    ...createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase2),
    ...createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase3),
    ...createSoundSafariPool(2, SOUND_SAFARI_DEFAULT_TAUGHT.phase3),
  ];
  for (const question of actualSoundSafari) {
    const speech = soundSafariSpokenFeedback(question);
    assert.ok(texts.has(soundSafariPrompt(question)), `${question.id} prompt is inventoried`);
    assert.ok(texts.has(soundSafariRetryText(question)), `${question.id} retry is inventoried`);
    assert.ok(speech.segments.every((segment) => texts.has(segment)), `${question.id} feedback segments are inventoried`);
    assert.ok(texts.has(speech.text), `${question.id} joined feedback is inventoried`);
  }
  for (const id of inventory.soundSafari.wholeWordRecordingIds) assert.ok(texts.has(id.startsWith('safari-') ? id.slice(7) : id));
});

test('Growing canonical history accepts advanced blend IDs while restricted taught sets still exclude them', () => {
  const storage = memoryStorage();
  const starterPool = createSoundSafariPool(0, SOUND_SAFARI_DEFAULT_TAUGHT.phase2);
  const starterIds = starterPool.map(({ id }) => id);
  const starterRun = createSoundSafariRun(0, SOUND_SAFARI_DEFAULT_TAUGHT.phase2, 851);
  recordBatch5LiteracyCompletion('soundSafari', 0, 2, starterRun.map(({ id }) => id), starterIds, 'amari', storage);

  const advancedPool = createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase3);
  const advancedIds = advancedPool.map(({ id }) => id);
  const targetRecent = ['blend:safari-plant', 'blend:safari-raft', 'blend:safari-plank'];
  for (const id of targetRecent) assert.ok(isCanonicalBatch5QuestionId('soundSafari', 1, id), `${id} is a canonical Growing ID`);
  const completeRecent = [...targetRecent, ...advancedIds.filter((id) => !targetRecent.includes(id)).slice(0, 3)];
  assert.ok(rememberBatch5LiteracyRun('soundSafari', 1, completeRecent, advancedIds, 'amari', storage));

  const reloadedProgress = getBatch5LiteracyProgress('soundSafari', 'amari', storage);
  assert.ok(targetRecent.every((id) => reloadedProgress.recentQuestionIds[1].includes(id)));
  const nextAdvancedRun = createSoundSafariRun(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase3, 852, reloadedProgress.recentQuestionIds[1]);
  assert.ok(nextAdvancedRun.length === 6 && targetRecent.every((id) => !nextAdvancedRun.some((item) => item.id === id)));

  const restrictedPool = createSoundSafariPool(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase2);
  const restrictedIds = new Set(restrictedPool.map(({ id }) => id));
  assert.ok(targetRecent.every((id) => !restrictedIds.has(id)));
  const restrictedRun = createSoundSafariRun(1, SOUND_SAFARI_DEFAULT_TAUGHT.phase2, 853, reloadedProgress.recentQuestionIds[1]);
  assert.equal(restrictedRun.length, 6);
  assert.ok(targetRecent.every((id) => !restrictedRun.some((item) => item.id === id)));
});
