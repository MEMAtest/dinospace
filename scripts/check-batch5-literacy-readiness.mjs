import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { buildBatch5LiteracyNarrationInventory } from './batch5LiteracyNarrationInventory.mjs';
import { BATCH5_SPELLING_WORDS } from '../src/data/batch5Literacy.js';
import { SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER, SOUND_SAFARI_WHOLE_WORD_RECORDINGS } from '../src/data/batch5SoundSafariPictureWords.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDirectory = resolve(root, 'public');
const inventory = buildBatch5LiteracyNarrationInventory();
const voiceItems = await Promise.all(inventory.items.map(async (item) => {
  const manifestPath = OFFLINE_VOICE_MANIFEST[item.key] || null;
  const filePath = manifestPath ? resolve(publicDirectory, `.${manifestPath}`) : '';
  const safePath = filePath && filePath.startsWith(`${publicDirectory}${sep}`);
  let ready = false;
  if (manifestPath === item.path && safePath) { try { ready = (await readFile(filePath)).length > 0; } catch { ready = false; } }
  return { ...item, ready };
}));
const phonemeItems = await Promise.all(inventory.phonemes.map(async (item) => {
  const filePath = resolve(publicDirectory, `.${item.path}`);
  let ready = false;
  if (filePath.startsWith(`${publicDirectory}${sep}`)) { try { ready = (await readFile(filePath)).length > 0; } catch { ready = false; } }
  return { ...item, ready };
}));
const countChars = (items) => items.reduce((total, item) => total + item.text.length, 0);
const readyVoices = voiceItems.filter((item) => item.ready);
const pendingVoices = voiceItems.filter((item) => !item.ready);
const readyPhonemes = phonemeItems.filter((item) => item.ready);
const soundSafariWords = new Map([...BATCH5_SPELLING_WORDS, ...SOUND_SAFARI_PICTURE_WORDS_BY_CHAPTER.flat()].map((item) => [item.id, item]));
const requiredWholeWords = inventory.soundSafari.wholeWordRecordingIds.map((id) => {
  const word = soundSafariWords.get(id)?.word || '';
  const voiceItem = voiceItems.find(({ text }) => text === word) || null;
  return { id, word, configuredInRuntime: typeof SOUND_SAFARI_WHOLE_WORD_RECORDINGS[id] === 'string', packaged: Boolean(voiceItem?.ready), voiceItem };
});
const soundSafariPhraseGroups = Object.fromEntries(Object.entries(inventory.soundSafari.spokenTextGroups).map(([group, texts]) => {
  const items = texts.map((text) => voiceItems.find((item) => item.text === text)).filter(Boolean);
  return [group, { uniqueTexts: texts.length, ready: items.filter((item) => item.ready).length, pending: items.filter((item) => !item.ready).length }];
}));
const sourcePaths = [
  'src/data/batch5Literacy.js', 'src/data/batch5LiteracyPools.js', 'src/data/batch5LiteracyProgress.js',
  'src/data/batch5SoundSafariPictureWords.js', 'src/data/batch5SoundSafariPictureArt.js', 'src/data/batch5SoundSafariLabels.js',
  'src/data/batch5SoundSafariNarration.js', 'src/data/voiceKey.js', 'src/data/offlineVoiceManifest.js',
  'src/components/games/AmariSoundSafari.jsx', 'src/components/games/useAmariPhonemeAudio.js',
  'scripts/batch5LiteracyNarrationInventory.mjs', 'scripts/check-batch5-literacy-readiness.mjs',
];
const sourceHashes = await Promise.all(sourcePaths.map(async (path) => ({ path, sha256: createHash('sha256').update(await readFile(resolve(root, path))).digest('hex') })));
const report = {
  scope: 'Read-only local-source readiness. Manifest/file presence is not an audio decode, pronunciation, native playback, or listening check. No generator/provider is called.',
  source: { commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), hashes: sourceHashes },
  packagedNarration: { uniqueClips: voiceItems.length, characters: countChars(voiceItems), ready: { uniqueClips: readyVoices.length, characters: countChars(readyVoices) }, pending: { uniqueClips: pendingVoices.length, characters: countChars(pendingVoices) } },
  purePhonemeClips: { required: phonemeItems.length, ready: readyPhonemes.length, pending: phonemeItems.length - readyPhonemes.length, items: phonemeItems },
  inventory: { priorBatch5BaselineUniqueTextEntries: inventory.baselineUniqueTextCount, priorBatch5BaselineSequences: inventory.baselineSequenceCount, exactSequences: inventory.sequences.length, uniqueTextEntries: inventory.items.length },
  soundSafari: {
    defaultPoolQuestions: {
      phase2FirstSound: inventory.soundSafari.phase2MatchQuestionCount,
      phase2WholeWordMinimalPairDirections: inventory.soundSafari.phase2MinimalPairDirectionCount,
      phase2Blend: inventory.soundSafari.phase2BlendQuestionCount,
      phase3Blend: inventory.soundSafari.phase3BlendQuestionCount,
      phase3SoundPositions: inventory.soundSafari.phase3PositionQuestionCount,
    },
    purePhonemeSequences: inventory.soundSafari.purePhonemeSequences,
    purePhonemeClipUsage: { uniqueSoundSafariKeys: inventory.soundSafari.purePhonemeKeysUsed.length, soundSafariKeys: inventory.soundSafari.purePhonemeKeysUsed, absentLocalFiles: inventory.soundSafari.purePhonemeKeysUsed.filter((phoneme) => !phonemeItems.find((item) => item.phoneme === phoneme)?.ready) },
    requiredWholeWordRecordings: { uniqueWords: requiredWholeWords.length, configuredInRuntime: requiredWholeWords.filter((item) => item.configuredInRuntime).length, packaged: requiredWholeWords.filter((item) => item.packaged).length, items: requiredWholeWords },
    exactRuntimeSpeechGroups: soundSafariPhraseGroups,
  },
  voiceItems,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else { const { voiceItems: _voiceItems, purePhonemeClips: { items: _phonemeItems, ...phonemeSummary }, ...summary } = report; console.log(JSON.stringify({ ...summary, purePhonemeClips: phonemeSummary }, null, 2)); }
