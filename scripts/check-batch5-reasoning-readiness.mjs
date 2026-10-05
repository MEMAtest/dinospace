import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { voiceClipKey } from '../src/data/voiceKey.js';
import { buildBatch5ReasoningNarrationInventory } from './batch5ReasoningNarrationInventory.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDirectory = resolve(root, 'public');
const inventory = buildBatch5ReasoningNarrationInventory();
const items = await Promise.all(inventory.items.map(async ({ text }) => {
  const key = voiceClipKey(text, 'en-US');
  const expected = `/audio/en/${key}-matilda.mp3`;
  const manifestPath = OFFLINE_VOICE_MANIFEST[key] || null;
  const filePath = manifestPath ? resolve(publicDirectory, `.${manifestPath}`) : '';
  const safe = filePath && filePath.startsWith(`${publicDirectory}${sep}`);
  let ready = false;
  if (manifestPath === expected && safe) { try { ready = (await readFile(filePath)).length > 0; } catch { ready = false; } }
  return { text, key, path: expected, ready };
}));
const ready = items.filter((entry) => entry.ready);
const pending = items.filter((entry) => !entry.ready);
const chars = (entries) => entries.reduce((sum, entry) => sum + entry.text.length, 0);
const report = {
  scope: 'Read-only local-source inventory. Existing file presence is not an audio decode, pronunciation, native playback, or listening check. This script does not generate or request audio.',
  packagedNarration: { uniqueClips: items.length, characters: chars(items), ready: { uniqueClips: ready.length, characters: chars(ready) }, pending: { uniqueClips: pending.length, characters: chars(pending) } },
  exactSequences: inventory.sequences.length,
  items,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else { const { items: _items, ...summary } = report; console.log(JSON.stringify(summary, null, 2)); }
