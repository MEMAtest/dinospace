// Read-only inventory of the exact Solar System spoken controls.
// No provider requests, generation or manifest writes.
import { existsSync } from 'node:fs';
import { PLANETS } from '../src/data/index.js';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const lines = [...new Set([
  ...PLANETS.flatMap((planet) => [
    `${planet.name}. ${planet.subtitle}. ${planet.mission}`,
    ...planet.facts.flatMap((fact, index) => [fact, `Discovery ${index + 1}. ${fact}`]),
    `Correct. ${planet.quiz.answer}.`,
  ]),
  'Not quite. Check the discoveries and try again.',
])];
const entries = lines.map((text) => {
  const key = voiceClipKey(text, 'en-US');
  const path = OFFLINE_VOICE_MANIFEST[key] || null;
  return { text, key, path, packaged: Boolean(path && existsSync(`public${path}`)) };
});
const packaged = entries.filter(({ packaged }) => packaged).length;
console.log(JSON.stringify({
  scope: 'Solar System only; read-only manifest/file existence, not decode, listening or release acceptance',
  language: 'en-US', destinations: PLANETS.length,
  discoveries: PLANETS.reduce((count, planet) => count + planet.facts.length, 0),
  phrases: entries.length, packaged, missing: entries.length - packaged,
  readiness: entries.length === packaged ? 'ready' : 'incomplete', entries,
}, null, 2));
