import { mkdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outputDir = resolve(root, 'public/audio/de');
const endpoint = 'https://dinospace-eight.vercel.app/api/voice';
const origin = 'https://dinospace-eight.vercel.app';
const clips = [
  ['Rad', 'rad'], ['Tür', 'tuer'], ['Lenkrad', 'lenkrad'], ['Licht', 'licht'], ['Sitz', 'sitz'], ['Reifen', 'reifen'],
  ['Links', 'links'], ['Rechts', 'rechts'], ['Geradeaus', 'geradeaus'], ['Halt', 'halt'], ['Langsam', 'langsam'], ['Zurück', 'zurueck'],
];

await mkdir(outputDir, { recursive: true });
let generated = 0;
let reused = 0;
for (const [text, slug] of clips) {
  const output = resolve(outputDir, `${slug}.mp3`);
  try {
    if ((await stat(output)).size > 1000) { reused += 1; console.log(`Kept existing clip: ${text}`); continue; }
  } catch { /* generate missing file */ }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ text, language: 'de' }),
  });
  if (response.status === 204 || response.status === 429) {
    console.error(`Stopped at ${text}: voice endpoint returned ${response.status}; no retry attempted.`);
    process.exitCode = response.status === 429 ? 75 : 2;
    break;
  }
  if (!response.ok) {
    console.error(`Stopped at ${text}: voice endpoint returned ${response.status}; no retry attempted.`);
    process.exitCode = 1;
    break;
  }
  if (response.headers.get('x-amari-voice-provider') !== 'elevenlabs') {
    console.error(`Stopped at ${text}: ElevenLabs provider could not be verified; response was not saved.`);
    process.exitCode = 1;
    break;
  }
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'audio/mpeg') {
    console.error(`Stopped at ${text}: expected audio/mpeg, received ${contentType || 'no content type'}; response was not saved.`);
    process.exitCode = 1;
    break;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000) {
    console.error(`Stopped at ${text}: response was only ${bytes.length} bytes; response was not saved.`);
    process.exitCode = 1;
    break;
  }
  await writeFile(output, bytes, { flag: 'wx' }).catch(async (error) => {
    if (error.code !== 'EEXIST') throw error;
    if ((await stat(output)).size <= 1000) await writeFile(output, bytes);
  });
  generated += 1;
  console.log(`Saved verified clip: ${text} (${bytes.length} bytes)`);
}
console.log(`German clip run complete: ${generated} generated, ${reused} already present.`);
