import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { buildBatch5LiteracyNarrationInventory } from './batch5LiteracyNarrationInventory.mjs';

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
const report = {
  scope: 'Read-only local-source readiness. Manifest/file presence is not an audio decode, pronunciation, native playback, or listening check. No generator/provider is called.',
  packagedNarration: { uniqueClips: voiceItems.length, characters: countChars(voiceItems), ready: { uniqueClips: readyVoices.length, characters: countChars(readyVoices) }, pending: { uniqueClips: pendingVoices.length, characters: countChars(pendingVoices) } },
  purePhonemeClips: { required: phonemeItems.length, ready: readyPhonemes.length, pending: phonemeItems.length - readyPhonemes.length, items: phonemeItems },
  inventory: { exactSequences: inventory.sequences.length, uniqueTextEntries: inventory.items.length },
  voiceItems,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else { const { voiceItems: _voiceItems, purePhonemeClips: { items: _phonemeItems, ...phonemeSummary }, ...summary } = report; console.log(JSON.stringify({ ...summary, purePhonemeClips: phonemeSummary }, null, 2)); }
