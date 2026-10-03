// Read-only corpus audit. No generation, provider requests or manifest writes.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { BATCH2_VOICE_CORPUS_BY_GAME } from '../src/data/batch2Narration.js';
import { OFFLINE_VOICE_MANIFEST } from '../src/data/offlineVoiceManifest.js';
import { voiceClipKey } from '../src/data/voiceKey.js';

const root = resolve(import.meta.dirname, '..');
const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Local corpus existence, SHA256, duration and full decoding; not listening or production acceptance',
  requested: 0, ready: 0, missing: [], invalid: [], results: [],
};
const seen = new Set();
for (const [game, lines] of Object.entries(BATCH2_VOICE_CORPUS_BY_GAME)) {
  for (const text of lines) {
    const key = voiceClipKey(text, 'en-US');
    if (seen.has(key)) continue;
    seen.add(key);
    report.requested++;
    const candidates = [...new Set([OFFLINE_VOICE_MANIFEST[key], `/audio/en/${key}-matilda.mp3`].filter(Boolean))];
    let bytes, path;
    for (const candidate of candidates) {
      if (!candidate.startsWith('/audio/') || candidate.includes('..')) continue;
      try { bytes = await readFile(resolve(root, `public${candidate}`)); path = candidate; break; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!bytes) { report.missing.push({ game, key, text }); continue; }
    const filename = resolve(root, `public${path}`);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filename], { encoding: 'utf8' });
    const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', filename, '-f', 'null', '-'], { encoding: 'utf8' });
    const duration = Number(probe.stdout?.trim());
    const valid = bytes.length > 0 && probe.status === 0 && Number.isFinite(duration) && duration > 0 && decode.status === 0 && !decode.stderr?.trim();
    const result = { game, key, text, path, sha256: createHash('sha256').update(bytes).digest('hex'), duration: Number.isFinite(duration) ? duration : null, valid };
    report.results.push(result);
    if (valid) report.ready++; else report.invalid.push({ ...result, error: String(probe.error || decode.error || probe.stderr || decode.stderr || 'Invalid audio').slice(0, 500) });
  }
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.missing.length || report.invalid.length ? 1 : 0;
