import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BATCH3_VOICE_CORPUS_BY_GAME, BATCH3_VOICE_ITEMS } from '../src/data/batch3Narration.js';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const root = resolve(import.meta.dirname, '..');
const readyKeys = new Set();
const missing = [];
for (const item of BATCH3_VOICE_ITEMS) {
  const path = OFFLINE_VOICE_MANIFEST[item.key];
  let ready = false;
  if (typeof path === 'string' && path.startsWith('/audio/en/') && !path.includes('..')) {
    try { ready = (await stat(resolve(root, 'public', path.slice(1)))).size > 1000; } catch { /* missing package */ }
  }
  if (ready) readyKeys.add(item.key);
  else missing.push(item);
}
const breakdown = Object.fromEntries(Object.entries(BATCH3_VOICE_CORPUS_BY_GAME).map(([game, lines]) => [game, {
  requested: lines.length, ready: lines.filter((text) => readyKeys.has(voiceClipKey(text))).length,
  pending: lines.filter((text) => !readyKeys.has(voiceClipKey(text))).length,
}]));
console.log(JSON.stringify({ requested: BATCH3_VOICE_ITEMS.length, ready: readyKeys.size, pending: missing.length,
  breakdown, missing, scope: 'Read-only mapped file coverage; runtime wiring, decode and human listening remain separate gates.' }, null, 2));
process.exitCode = missing.length ? 1 : 0;
