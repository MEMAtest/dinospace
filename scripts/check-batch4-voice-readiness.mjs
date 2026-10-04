import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { buildBatch4VoiceInventory } from './batch4NarrationInventory.mjs';
const { coverage: BATCH4_NARRATION_COVERAGE, corpusByGame: BATCH4_VOICE_CORPUS_BY_GAME, items: BATCH4_VOICE_ITEMS } = buildBatch4VoiceInventory();

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDirectory = resolve(root, 'public');
const items = await Promise.all(BATCH4_VOICE_ITEMS.map(async (item) => {
  const manifestPath = OFFLINE_VOICE_MANIFEST[item.key] || null;
  const filePath = manifestPath ? resolve(publicDirectory, `.${manifestPath}`) : '';
  const safePath = filePath && (filePath === publicDirectory || filePath.startsWith(`${publicDirectory}${sep}`));
  let ready = false;
  if (manifestPath === item.path && safePath) {
    try {
      const bytes = await readFile(filePath);
      ready = bytes.length > 0;
    } catch {
      ready = false;
    }
  }
  return { ...item, ready };
}));

const readyItems = items.filter(({ ready }) => ready);
const pendingItems = items.filter(({ ready }) => !ready);
const chars = (entries) => entries.reduce((total, item) => total + item.text.length, 0);
const result = {
  scope: 'Read-only exact packaged narration inventory. File presence does not verify decoding, natural prosody, native playback, or listening acceptance.',
  coverage: BATCH4_NARRATION_COVERAGE,
  perGame: Object.fromEntries(Object.entries(BATCH4_VOICE_CORPUS_BY_GAME).map(([game, phrases]) => [game, { uniquePhrases: phrases.length, characters: chars(phrases.map((text) => ({ text }))) }])),
  uniqueClips: items.length,
  totalCharacters: chars(items),
  ready: { uniqueClips: readyItems.length, characters: chars(readyItems) },
  pending: { uniqueClips: pendingItems.length, characters: chars(pendingItems) },
  items,
};

if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  const { items: _items, ...summary } = result;
  console.log(JSON.stringify(summary, null, 2));
}
