import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_TAUGHT_GRAPHEMES } from '../src/data/literacy.js';
import { appendSpellingRecent, makeSpellingQueue, qualifiesForIndependentSpelling, spellingAttemptAttribution, spellingAttemptMasteryEligible, spellingCaptionSegments, SPELLING_PREANSWER_CUES, SPELLING_TRICKY_WORDS, SPELLING_WORDS, spellingSessionMode, spellingTrickyWordsForPhase, spellingWordsForPhase } from '../src/data/spellingStudio.js';

test('spelling pool has at least 20 individually decodable words in each phase band', () => {
  const phase2 = spellingWordsForPhase(2, new Set(DEFAULT_TAUGHT_GRAPHEMES));
  const phase3Taught = new Set([...DEFAULT_TAUGHT_GRAPHEMES, ...SPELLING_WORDS.filter((word) => word.phase === 3).flatMap((word) => word.graphemes)]);
  const phase3 = spellingWordsForPhase(3, phase3Taught);
  assert.ok(phase2.length >= 20, `phase 2 has ${phase2.length}`);
  assert.ok(phase3.length >= 20, `phase 3 has ${phase3.length}`);
  assert.equal(new Set(SPELLING_WORDS.map((word) => word.word)).size, SPELLING_WORDS.length);
  assert.ok(SPELLING_WORDS.every((word) => word.graphemes.join('').toUpperCase() === word.word));
});

test('word queue is seeded, covers each eligible item once, and defers recent words', () => {
  const items = SPELLING_WORDS.slice(0, 24);
  const recent = ['SAT', 'DOG', 'PIN'];
  const one = makeSpellingQueue(items, { seed: 42, recent });
  assert.deepEqual(makeSpellingQueue(items, { seed: 42, recent }), one);
  assert.equal(new Set(one.map((item) => item.word)).size, items.length);
  assert.ok(one.slice(0, items.length - recent.length).every((item) => !recent.includes(item.word)));
  assert.notDeepEqual(makeSpellingQueue(items, { seed: 43, recent }), one);
});

test('recent-word history deduplicates and remains bounded', () => {
  assert.deepEqual(appendSpellingRecent(['CAT', 'DOG', 'CAT'], 'CAT'), ['DOG', 'CAT']);
  assert.equal(appendSpellingRecent(Array.from({ length: 8 }, (_, index) => `W${index}`), 'NEXT').length, 8);
});

test('tricky spelling eligibility is a frozen phase snapshot with no later-phase words', () => {
  const phase2 = spellingTrickyWordsForPhase(2);
  const phase3 = spellingTrickyWordsForPhase(3);
  assert.ok(phase2.length > 0);
  assert.ok(phase2.every((word) => word.phase === 2 && word.graphemes.join('').toUpperCase() === word.word));
  assert.ok(phase3.length > phase2.length);
  assert.ok(phase3.some((word) => word.phase === 3));
  assert.ok(phase2.every((word) => word.phase <= 2));
});

test('pre-answer spelling cues cover every word without spelling out the answer', () => {
  const words = [...SPELLING_WORDS, ...SPELLING_TRICKY_WORDS];
  assert.deepEqual(Object.keys(SPELLING_PREANSWER_CUES).sort(), words.map(({ word }) => word).sort());
  for (const { word } of words) {
    const cue = SPELLING_PREANSWER_CUES[word];
    assert.ok(cue.trim().length > 0, `${word} needs a usable clue`);
    const tokens = cue.toLowerCase().match(/[a-z]+/g) || [];
    assert.ok(!tokens.includes(word.toLowerCase()), `${word} appears in its pre-answer cue: ${cue}`);
  }
});

test('an explicit teaching clue blocks independent spelling credit but word replay does not', () => {
  assert.equal(qualifiesForIndependentSpelling({ mode: 'spell' }), true);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'tricky' }), true);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'spell', usedTeachingHint: true }), false);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'tricky', hadMistake: true }), false);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'missing' }), false);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'copy' }), false);
});

test('longer levels increase real word length and keep complete packaged word recordings', async () => {
  const { LONGER_SPELLING_WORDS, spellingLevelWords } = await import('../src/data/spellingStudio.js');
  const { getOfflineVoiceClip } = await import('../src/data/offlineVoice.js');
  const { existsSync } = await import('node:fs');
  const taught = new Set(DEFAULT_TAUGHT_GRAPHEMES);
  for (const [level, min, max, count] of [[3,4,4,3],[4,5,5,6],[5,6,7,4]]) {
    const pool = spellingLevelWords(level, taught);
    assert.ok(pool.length >= count);
    assert.ok(pool.every(item => item.word.length >= min && item.word.length <= max));
    assert.equal(makeSpellingQueue(pool).length, pool.length);
  }
  for (const item of LONGER_SPELLING_WORDS) {
    assert.equal(item.graphemes.join('').toUpperCase(), item.word);
    assert.ok(!item.cue.toUpperCase().split(/[^A-Z]+/).includes(item.word));
    const clip = getOfflineVoiceClip(item.word);
    assert.ok(clip, item.word + ' must have an existing recording');
    assert.ok(existsSync(new URL('../public' + clip, import.meta.url)));
  }
  assert.equal(spellingLevelWords(5, new Set(['s','a','t'])).length, 0);
});

test('session progression reaches the longer pools without repeating within a level', async () => {
  const { SESSION_LEVELS } = await import('../src/data/sessionLevels.js');
  const { spellingLevelWords } = await import('../src/data/spellingStudio.js');
  const taught = new Set(DEFAULT_TAUGHT_GRAPHEMES);
  assert.equal(SESSION_LEVELS.words.length, 6);
  assert.equal(SESSION_LEVELS.hangman.length, 4);
  for (let level = 3; level < 6; level++) assert.ok(spellingLevelWords(level, taught).length >= SESSION_LEVELS.words[level].target);
  for (let level = 1; level < 4; level++) assert.ok(spellingLevelWords(level + 2, taught).length >= SESSION_LEVELS.hangman[level].target);
});

test('six session stages use their authored interaction mode and eligible pool size', async () => {
  const { SESSION_LEVELS } = await import('../src/data/sessionLevels.js');
  const { spellingLevelWords } = await import('../src/data/spellingStudio.js');
  const taught = new Set(DEFAULT_TAUGHT_GRAPHEMES);
  assert.deepEqual(SESSION_LEVELS.words.map((_, index) => spellingSessionMode(index)), [
    'copy', 'missing', 'spell', 'spell', 'spell', 'spell',
  ]);
  for (const [index, level] of SESSION_LEVELS.words.entries()) {
    const pool = spellingLevelWords(index, taught);
    assert.ok(pool.length >= level.target, `${level.name} needs ${level.target}; found ${pool.length}`);
    const queue = makeSpellingQueue(pool, { seed: index + 1 });
    assert.equal(new Set(queue.map(({ word }) => word)).size, queue.length, `${level.name} repeats before cycling`);
    if (index === 3) assert.ok(pool.every(({ word }) => word.length === 4));
    if (index === 4) assert.ok(pool.every(({ word }) => word.length === 5));
    if (index === 5) assert.ok(pool.every(({ word }) => word.length >= 6 && word.length <= 7));
  }
});

test('independent spelling and phonics mastery remain separate for tricky and longer clusters', () => {
  const simple = SPELLING_WORDS.find(({ word }) => word === 'SAT');
  const phaseThree = SPELLING_WORDS.find(({ word }) => word === 'FISH');
  const longerCluster = { word: 'ROCK', graphemes: ['r', 'o', 'ck'], phase: 2, family: 'longer words' };
  const tricky = { word: 'THE', phase: 2, family: 'tricky' };
  assert.equal(qualifiesForIndependentSpelling({ mode: 'spell' }), true);
  assert.equal(spellingAttemptMasteryEligible({ mode: 'spell', word: simple }), true);
  assert.equal(spellingAttemptMasteryEligible({ mode: 'spell', word: phaseThree }), true);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'spell', hadMistake: true }), false);
  assert.equal(qualifiesForIndependentSpelling({ mode: 'spell', usedTeachingHint: true }), false);
  assert.equal(spellingAttemptMasteryEligible({ mode: 'spell', word: longerCluster }), false);
  assert.equal(spellingAttemptMasteryEligible({ mode: 'tricky', word: tricky }), false);
  assert.deepEqual(spellingAttemptAttribution({ mode: 'copy', word: simple }), {
    firstAttempt: true, independent: false, masteryEligible: true,
  });
  assert.deepEqual(spellingAttemptAttribution({ mode: 'spell', word: longerCluster }), {
    firstAttempt: true, independent: true, masteryEligible: false,
  });
  assert.deepEqual(spellingAttemptAttribution({ mode: 'spell', word: simple, usedTeachingHint: true }), {
    firstAttempt: false, independent: false, masteryEligible: true,
  });
});

test('caption voice requires exact packaged segments and does not invent a prompt recording', async () => {
  const { DECODABLE_CAPTIONS } = await import('../src/data/literacy.js');
  const { getOfflineVoiceClip } = await import('../src/data/offlineVoice.js');
  const recorded = DECODABLE_CAPTIONS.find(({ text }) => spellingCaptionSegments(text, (part) => Boolean(getOfflineVoiceClip(part, 'en-US'))));
  const unrecorded = DECODABLE_CAPTIONS.find(({ text }) => !spellingCaptionSegments(text, (part) => Boolean(getOfflineVoiceClip(part, 'en-US'))));
  assert.ok(recorded);
  assert.deepEqual(spellingCaptionSegments(recorded.text, (part) => Boolean(getOfflineVoiceClip(part, 'en-US'))), recorded.text.split(' ').map((part) => part.replace(/[.,!?;]+$/u, '')));
  assert.ok(unrecorded);
  assert.equal(spellingCaptionSegments(unrecorded.text, (part) => Boolean(getOfflineVoiceClip(part, 'en-US'))), null);
  assert.equal(spellingCaptionSegments('Read and copy: A CAT SAT.', (part) => Boolean(getOfflineVoiceClip(part, 'en-US'))), null);
});

test('all authored spelling word prompts have exact packaged clips and files', async () => {
  const { LONGER_SPELLING_WORDS } = await import('../src/data/spellingStudio.js');
  const { getOfflineVoiceClip } = await import('../src/data/offlineVoice.js');
  const { existsSync } = await import('node:fs');
  for (const item of [...SPELLING_WORDS, ...SPELLING_TRICKY_WORDS, ...LONGER_SPELLING_WORDS]) {
    const clip = getOfflineVoiceClip(item.word, 'en-US');
    assert.ok(clip, `${item.word} has no exact packaged clip`);
    assert.ok(existsSync(new URL(`../public${clip}`, import.meta.url)), `${item.word} clip file is missing`);
  }
  assert.ok(getOfflineVoiceClip('Super!', 'en-US'));
});
