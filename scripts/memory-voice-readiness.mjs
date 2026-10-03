import { existsSync } from 'node:fs';
import { MEMORY_LEVELS } from '../src/data/index.js';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { memoryNarrationLines } from '../src/data/memoryMatchContent.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const entries = memoryNarrationLines(MEMORY_LEVELS).map((text) => {
  const key = voiceClipKey(text, 'en-US');
  const path = OFFLINE_VOICE_MANIFEST[key] || null;
  return { text, key, path, packaged: Boolean(path && existsSync(`public${path}`)) };
});
const packaged = entries.filter((entry) => entry.packaged).length;
console.log(JSON.stringify({
  scope: 'Amari Memory Match only; read-only audit, no voice generation or network requests',
  language: 'en-US',
  phrases: entries.length,
  packaged,
  missing: entries.length - packaged,
  readiness: entries.length === packaged ? 'ready' : 'incomplete',
  entries,
}, null, 2));
