import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OFFLINE_VOICE_CORPUS } from './offline-voice-corpus.mjs';
import { CURRICULUM_VOICE_CORPUS } from '../src/data/curriculumVoice.js';
import { OFFLINE_VOICE_MANIFEST as existingManifest } from '../src/data/offlineVoiceManifest.js';

const root = resolve(import.meta.dirname, '..');
const audioRoot = resolve(root, 'public', 'audio');
const manifestPath = resolve(root, 'src', 'data', 'offlineVoiceManifest.js');
const envFile = process.argv.find((arg) => arg.startsWith('--env='))?.slice(6);
const refreshGerman = process.argv.includes('--refresh-de');
const voiceProxyUrl = process.env.VOICE_PROXY_URL || '';

const readEnvValue = async (name) => {
  if (process.env[name]) return process.env[name];
  if (!envFile) return '';
  const raw = await readFile(envFile, 'utf8');
  const line = raw.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  if (!line) return '';
  const value = line.slice(name.length + 1).trim();
  return value.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n');
};

const apiKey = await readEnvValue('ELEVENLABS_API_KEY');
if (!apiKey && !voiceProxyUrl) throw new Error('ELEVENLABS_API_KEY or VOICE_PROXY_URL is required');
const englishVoice = await readEnvValue('ELEVENLABS_VOICE_ID') || 'XrExE9yKIg1WjnnlVkGX';
const germanVoice = await readEnvValue('ELEVENLABS_GERMAN_VOICE_ID');
const model = await readEnvValue('ELEVENLABS_MODEL_ID') || 'eleven_multilingual_v2';
const voiceCorpus = [...new Map([...OFFLINE_VOICE_CORPUS, ...CURRICULUM_VOICE_CORPUS].map((item) => [item.key, item])).values()];

if (refreshGerman && !germanVoice) {
  throw new Error('ELEVENLABS_GERMAN_VOICE_ID is required when refreshing German clips');
}

const legacy = new Map([
  ['en:welcome amari! your next learning adventure is ready.', 'welcome-amari-matilda.mp3'],
  ['en:hello explorer! your next learning adventure is ready.', 'hello-explorer-matilda.mp3'],
  ...['circle', 'square', 'triangle', 'diamond', 'star', 'heart'].map((shape) => [
    `en:trace the ${shape}. follow the glowing flight path.`, `sky-${shape}-matilda.mp3`,
  ]),
  ['en:all six shapes are complete. you are a sky shape superstar!', 'sky-complete-matilda.mp3'],
]);

const exists = async (path) => {
  try { return (await stat(path)).size > 1000; } catch { return false; }
};

await mkdir(resolve(audioRoot, 'en'), { recursive: true });
await mkdir(resolve(audioRoot, 'de'), { recursive: true });

let generated = 0;
let reused = 0;
// Preserve only clips that are physically present. This prevents interrupted
// generation runs from leaving manifest entries that point at missing audio.
const manifest = {};
for (const [key, publicPath] of Object.entries(existingManifest)) {
  if (await exists(resolve(root, 'public', publicPath.replace(/^\//, '')))) manifest[key] = publicPath;
}

const generateItem = async (item, index) => {
  const language = item.lang.toLowerCase().startsWith('de') ? 'de' : 'en';
  const fileName = `${item.key}-${language === 'de' ? 'german' : 'matilda'}.mp3`;
  const output = resolve(audioRoot, language, fileName);
  if (await exists(output) && !(language === 'de' && refreshGerman)) {
    manifest[item.key] = `/audio/${language}/${fileName}`;
    reused += 1;
    return;
  }

  const oldName = legacy.get(`${language}:${item.text.toLowerCase()}`);
  if (oldName) {
    const oldPath = resolve(audioRoot, language, oldName);
    if (await exists(oldPath)) {
      await copyFile(oldPath, output);
      manifest[item.key] = `/audio/${language}/${fileName}`;
      reused += 1;
      return;
    }
  }

  const voiceId = language === 'de' ? germanVoice : englishVoice;
  let response;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    response = voiceProxyUrl
      ? await fetch(voiceProxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'https://dinospace-eight.vercel.app' },
          body: JSON.stringify({ text: item.text, language }),
        })
      : await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey, Accept: 'audio/mpeg' },
          body: JSON.stringify({
            text: item.text,
            model_id: model,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.95 },
          }),
        });
    if (response.ok) break;
    if (![429, 500, 502, 503].includes(response.status) || attempt === 5) {
      throw new Error(`ElevenLabs failed for ${item.key}: ${response.status} ${await response.text()}`);
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1500));
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000) throw new Error(`ElevenLabs returned a short clip for ${item.key}`);
  await writeFile(output, bytes);
  manifest[item.key] = `/audio/${language}/${fileName}`;
  generated += 1;
  if ((index + 1) % 25 === 0) console.log(`${index + 1}/${voiceCorpus.length}`);
};

const concurrency = Math.max(1, Math.min(6, Number(process.env.VOICE_GENERATION_CONCURRENCY || 4)));
let rateLimited = false;
let cursor = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (cursor < voiceCorpus.length && !rateLimited) {
    const index = cursor;
    cursor += 1;
    try {
      await generateItem(voiceCorpus[index], index);
    } catch (error) {
      if (String(error?.message || error).includes(': 429 ')) {
        rateLimited = true;
        console.warn('ElevenLabs rate limit reached; saved completed clips. Run this command again later to resume.');
        break;
      }
      throw error;
    }
  }
}));

await writeFile(
  manifestPath,
  `// Generated by scripts/generate-offline-voices.mjs.\nexport const OFFLINE_VOICE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`,
);
console.log(JSON.stringify({ total: voiceCorpus.length, generated, reused }));
if (rateLimited) process.exitCode = 75;
