import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { voiceClipKey } from '../src/data/voiceKey.js';
import { verifySnapshot } from '../scripts/verify-audio-snapshot.mjs';

const SOURCE_COMMIT = 'fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128';

async function setupFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'audio-snapshot-check-'));
  const publicDirectory = join(root, 'public');
  const audioDirectory = join(publicDirectory, 'audio', 'en');
  await mkdir(audioDirectory, { recursive: true });
  const key = voiceClipKey('A small test phrase.', 'en-US');
  const audioPath = join(audioDirectory, `${key}-matilda.mp3`);
  execFileSync('ffmpeg', [
    '-nostdin', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=22050',
    '-t', '0.18', '-codec:a', 'libmp3lame', '-b:a', '32k', audioPath,
  ]);
  const snapshotPath = join(root, 'readiness.json');
  const item = { text: 'A small test phrase.', key, path: `/audio/en/${key}-matilda.mp3`, ready: true };
  await writeFile(snapshotPath, JSON.stringify({ sourceCommit: SOURCE_COMMIT, uniqueClips: 1, items: [item] }));
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, publicDirectory, audioPath, snapshotPath, item };
}

test('valid local MP3 is fully decoded and hash-stable', async (t) => {
  const fixture = await setupFixture(t);
  const before = await readFile(fixture.audioPath);
  const report = await verifySnapshot({
    snapshotPath: fixture.snapshotPath,
    publicDirectory: fixture.publicDirectory,
    sourceCommit: SOURCE_COMMIT,
    concurrency: 2,
    timeoutMs: 10_000,
  });
  const after = await readFile(fixture.audioPath);
  assert.equal(report.valid, 1);
  assert.equal(report.errors.length, 0);
  assert.equal(report.results[0].fullDecode, true);
  assert.ok(Number.isFinite(report.results[0].durationSeconds) && report.results[0].durationSeconds > 0);
  assert.deepEqual(after, before);
  assert.match(report.readinessJsonSha256, /^[a-f0-9]{64}$/);
  assert.match(report.itemBindingSha256, /^[a-f0-9]{64}$/);
});

test('truncated MP3 is reported without stopping the batch', async (t) => {
  const fixture = await setupFixture(t);
  const original = await readFile(fixture.audioPath);
  await writeFile(fixture.audioPath, original.subarray(0, 12));
  const key2 = voiceClipKey('Another phrase.', 'en-US');
  const secondPath = join(fixture.publicDirectory, 'audio', 'en', `${key2}-matilda.mp3`);
  await writeFile(secondPath, original);
  const snapshot = JSON.parse(await readFile(fixture.snapshotPath, 'utf8'));
  snapshot.items.push({ text: 'Another phrase.', key: key2, path: `/audio/en/${key2}-matilda.mp3`, ready: true });
  snapshot.uniqueClips = snapshot.items.length;
  await writeFile(fixture.snapshotPath, JSON.stringify(snapshot));

  const report = await verifySnapshot({ snapshotPath: fixture.snapshotPath, publicDirectory: fixture.publicDirectory, sourceCommit: SOURCE_COMMIT, concurrency: 2, timeoutMs: 10_000 });
  assert.equal(report.requested, 2);
  assert.equal(report.valid, 1);
  assert.equal(report.invalid, 1);
  assert.ok(report.results[0].errors.some((message) => /ffprobe|decode/i.test(message)));
  assert.equal(report.results[1].valid, true);
});

test('symlink targets outside public are refused before decoding', async (t) => {
  const fixture = await setupFixture(t);
  const outside = join(fixture.root, 'outside.mp3');
  await writeFile(outside, await readFile(fixture.audioPath));
  await rm(fixture.audioPath);
  await symlink(outside, fixture.audioPath);

  const report = await verifySnapshot({ snapshotPath: fixture.snapshotPath, publicDirectory: fixture.publicDirectory, sourceCommit: SOURCE_COMMIT });
  assert.equal(report.valid, 0);
  assert.match(report.errors[0].message, /resolves outside/);
  assert.equal(report.results[0].fullDecode, undefined);
});

test('key/text/path mismatch is aggregated and rejected', async (t) => {
  const fixture = await setupFixture(t);
  const snapshot = JSON.parse(await readFile(fixture.snapshotPath, 'utf8'));
  snapshot.items[0] = { ...fixture.item, text: 'Different phrase.', path: '/audio/en/../escape.mp3' };
  await writeFile(fixture.snapshotPath, JSON.stringify(snapshot));
  const report = await verifySnapshot({ snapshotPath: fixture.snapshotPath, publicDirectory: fixture.publicDirectory, sourceCommit: SOURCE_COMMIT });
  assert.equal(report.valid, 0);
  assert.ok(report.errors.some(({ message }) => /key does not match text/.test(message)));
  assert.ok(report.errors.some(({ message }) => /path must be exactly/.test(message)));
});

test('source SHA and concurrency bounds are mandatory', async (t) => {
  const fixture = await setupFixture(t);
  await assert.rejects(() => verifySnapshot({ snapshotPath: fixture.snapshotPath, publicDirectory: fixture.publicDirectory, sourceCommit: 'bad' }), /40-character Git SHA/);
  await assert.rejects(() => verifySnapshot({ snapshotPath: fixture.snapshotPath, publicDirectory: fixture.publicDirectory, sourceCommit: SOURCE_COMMIT, concurrency: 9 }), /concurrency/);
});
