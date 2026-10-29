import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRoundOptions, buildSegmentChoices, buildSoundSafariRun, getSoundSafariAttemptQuality, getSoundSafariWords,
  SOUND_SAFARI_BLEND_PROMPT, SOUND_SAFARI_NARRATION_INVENTORY, SOUND_SAFARI_PHONEME_KEYS, SOUND_SAFARI_WORDS,
} from '../src/data/soundSafariAdventure.js';
import { getSoundSafariProgress, recordSoundSafariChapterCompletion } from '../src/data/soundSafariProgress.js';

const taught = ['s', 'a', 't', 'p', 'i', 'n'];
const storageFor = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('the six-phoneme trial builds three six-round chapters from only those sounds', () => {
  const first = buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught, seed: 41 });
  const second = buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught, seed: 41 });
  assert.deepEqual(first, second);
  assert.equal(SOUND_SAFARI_PHONEME_KEYS.join(''), taught.join(''));
  assert.equal(first.chapters.length, 3);
  assert.ok(first.supportedWordCount >= 17);
  for (const chapter of first.chapters) {
    assert.equal(chapter.rounds.length, 6);
    assert.equal(new Set(chapter.rounds.map((round) => round.id)).size, 6);
    for (const round of chapter.rounds) {
      const word = round.pictureWord ?? round.word;
      if (chapter.id === 'listen') assert.ok(taught.includes(word.initialSound));
      else assert.ok(word.phonemes.every((phoneme) => taught.includes(phoneme)));
    }
  }
});

test('recognition has six unique target sounds and exactly one picture begins with each sound', () => {
  const run = buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught, seed: 12 });
  const recognition = run.chapters[0];
  assert.equal(new Set(recognition.rounds.map((round) => round.target.sound)).size, 6);
  for (const round of recognition.rounds) {
    const choices = buildRoundOptions(round, recognition, 7, taught, taught);
    assert.equal(choices.length, 4);
    assert.equal(choices.filter((choice) => choice.initialSound === round.target.sound).length, 1);
  }
});

test('the 17 decodable picture words use supported sequences; insect is listen-only for /i/', () => {
  const words = getSoundSafariWords(taught, taught);
  assert.equal(words.length, 17);
  assert.ok(words.filter((word) => word.phonemes.length >= 4).length >= 4);
  for (const word of words) {
    assert.ok(word.needs.every((phoneme) => taught.includes(phoneme)));
    assert.ok(word.phonemes.every((phoneme) => taught.includes(phoneme)));
  }
  assert.equal(words.find((word) => word.id === 'insect'), undefined);
  const insect = SOUND_SAFARI_WORDS.find((word) => word.id === 'insect');
  assert.equal(insect.listeningOnly, true);
  assert.equal(insect.initialSound, 'i');
  assert.deepEqual(words.map(({ id }) => id), ['ant', 'sit', 'sip', 'tip', 'pit', 'pin', 'tin', 'tap', 'nap', 'pan', 'pat', 'sap', 'pip', 'snip', 'snap', 'spin', 'pants']);
});

test('segmentation tiles preserve the word phoneme sequence and supported decoys', () => {
  const run = buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught, seed: 2 });
  for (const round of run.chapters[2].rounds) {
    const choices = buildSegmentChoices(round.word, 8, taught, taught);
    assert.deepEqual(choices.filter((choice) => choice.correct).map((choice) => choice.sound).sort(), [...round.word.phonemes].sort());
    assert.ok(choices.every((choice) => taught.includes(choice.sound)));
  }
});

test('a missing audio key or untaught sound cannot accidentally unlock the trial', () => {
  assert.equal(buildSoundSafariRun({ taughtGraphemes: taught, supportedKeys: taught.slice(1) }).ready, false);
  assert.equal(buildSoundSafariRun({ taughtGraphemes: taught.slice(1), supportedKeys: taught }).ready, false);
});

test('clues, muted practice, and missing target-word audio are assisted attempts', () => {
  const base = { firstAttempt: true, usedClue: false, soundOn: true, visualPractice: false, audioReady: true };
  assert.deepEqual(getSoundSafariAttemptQuality(base), { assisted: false, independent: true });
  assert.deepEqual(getSoundSafariAttemptQuality({ ...base, usedClue: true }), { assisted: true, independent: false });
  assert.deepEqual(getSoundSafariAttemptQuality({ ...base, audioReady: false }), { assisted: true, independent: false });
  assert.deepEqual(getSoundSafariAttemptQuality({ ...base, soundOn: false }), { assisted: true, independent: false });
  assert.deepEqual(getSoundSafariAttemptQuality({ ...base, firstAttempt: false }), { assisted: false, independent: false });
});

test('narration inventory stays finite and within the shared 40-line budget', () => {
  assert.equal(SOUND_SAFARI_NARRATION_INVENTORY[0], SOUND_SAFARI_BLEND_PROMPT);
  assert.equal(SOUND_SAFARI_NARRATION_INVENTORY.length, 19);
  assert.equal(new Set(SOUND_SAFARI_NARRATION_INVENTORY).size, SOUND_SAFARI_NARRATION_INVENTORY.length);
});

test('chapter completion validates round IDs, prerequisites, child isolation, and replay awards', () => {
  const storage = storageFor();
  const listenIds = ['listen-a', 'listen-i', 'listen-n', 'listen-p', 'listen-s', 'listen-t'];
  const blendIds = SOUND_SAFARI_WORDS.slice(0, 6).map((word) => `blend-${word.id}`);
  assert.equal(recordSoundSafariChapterCompletion('child-a', 'blend', blendIds, storage), null);
  assert.equal(recordSoundSafariChapterCompletion('child-a', 'listen', ['bad', ...listenIds.slice(1)], storage), null);
  const first = recordSoundSafariChapterCompletion('child-a', 'listen', listenIds, storage);
  const second = recordSoundSafariChapterCompletion('child-a', 'blend', blendIds, storage);
  const replay = recordSoundSafariChapterCompletion('child-a', 'listen', listenIds, storage);
  assert.equal(first.newlyEarned, true);
  assert.equal(first.persisted, true);
  assert.equal(second.newlyEarned, true);
  assert.equal(replay.newlyEarned, false);
  assert.equal(replay.persisted, true);
  assert.deepEqual(getSoundSafariProgress('child-a', storage).earnedChapterIds, ['listen', 'blend']);
  assert.deepEqual(getSoundSafariProgress('child-b', storage).earnedChapterIds, []);
});

test('failed storage writes do not return an earned or persisted chapter', () => {
  const failingStorage = { getItem: () => null, setItem: () => { throw new Error('quota exceeded'); } };
  const result = recordSoundSafariChapterCompletion('child-a', 'listen', ['listen-a', 'listen-i', 'listen-n', 'listen-p', 'listen-s', 'listen-t'], failingStorage);
  assert.equal(result.persisted, false);
  assert.equal(result.newlyEarned, false);
  assert.equal(result.storageError, true);
  assert.deepEqual(result.progress.earnedChapterIds, []);
});

test('malformed saved awards and unknown recent IDs are dropped on read', () => {
  const storage = storageFor();
  storage.setItem('child_sound_safari_adventure_v1', JSON.stringify({ version: 1, unlockedChapter: 2, earnedChapterIds: ['segment'], completedChapterIds: ['segment'], recentRoundIds: ['unknown'] }));
  assert.deepEqual(getSoundSafariProgress('child', storage), { version: 1, unlockedChapter: 0, completedChapterIds: [], earnedChapterIds: [], recentRoundIds: [], rewardReceipts: {} });
  storage.setItem('child_sound_safari_adventure_v1', JSON.stringify({ version: 1, unlockedChapter: 2, earnedChapterIds: ['listen'], completedChapterIds: [], recentRoundIds: [] }));
  assert.equal(getSoundSafariProgress('child', storage).unlockedChapter, 0);
});
