import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewedCommit = 'bf3a76dabd2d95e17d37723215ac6a3ae1bf7c30';
const b5b7InventorySha = 'aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227';
const supplementalInventorySha = '0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd';
const sourceHashes = {
  'scripts/reviewedNarrationJobs.mjs': '125c8e5f1ee5d28c555879c37a3bb25b89e96d650e841f494841588ff9c19ba0',
  'scripts/run-reviewed-narration-job.mjs': 'f36de40839e3b1544e95f6c18854d8f4339bc1f9b490b1078054cc252e2e7959',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
  'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json': b5b7InventorySha,
  'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json': supplementalInventorySha,
  'src/data/offlineVoiceManifest.js': '674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7',
};

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const source = async (path) => readFile(resolve(repoRoot, path));
const exists = async (path) => stat(path).then(() => true, () => false);

async function prepareFixture(mode, job) {
  const tempRoot = await mkdtemp(resolve(tmpdir(), 'reviewed-narration-cli-fixture-'));
  const fixtureRoot = await realpath(tempRoot);
  const candidate = resolve(fixtureRoot, 'candidate');
  const b3 = resolve(fixtureRoot, 'dinospace-batch3-quality');
  const b4 = resolve(fixtureRoot, 'dinospace-batch4-quality');
  const inventoryRel = 'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json';
  const supplementalRel = 'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json';
  const voiceKeyRel = 'src/data/voiceKey.js';
  const helperRel = 'scripts/reviewedNarrationJobs.mjs';
  const runnerRel = 'scripts/run-reviewed-narration-job.mjs';
  const candidateManifestRel = 'src/data/offlineVoiceManifest.js';
  const journal = resolve(b3, 'tmp/offline-voice-request-state.json');
  const b4Manifest = resolve(b4, 'src/data/offlineVoiceManifest.js');
  const b4ManifestBytes = Buffer.from('export const OFFLINE_VOICE_MANIFEST = {};\n');

  await Promise.all([
    mkdir(resolve(candidate, 'scripts'), { recursive: true }),
    mkdir(resolve(candidate, 'src/data'), { recursive: true }),
    mkdir(dirname(resolve(candidate, inventoryRel)), { recursive: true }),
    mkdir(dirname(resolve(candidate, supplementalRel)), { recursive: true }),
    mkdir(resolve(candidate, 'public/audio/en'), { recursive: true }),
    mkdir(resolve(b3, 'tmp'), { recursive: true }),
    mkdir(dirname(b4Manifest), { recursive: true }),
  ]);

  for (const [path, expectedSha] of Object.entries(sourceHashes)) {
    const bytes = await source(path);
    assert.equal(digest(bytes), expectedSha, `reviewed source drifted: ${path}`);
    const destination = path === helperRel || path === runnerRel || path === voiceKeyRel || path === inventoryRel || path === supplementalRel || path === candidateManifestRel
      ? resolve(candidate, path)
      : null;
    if (destination) {
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
    }
  }

  await writeFile(resolve(candidate, 'package.json'), '{"type":"module"}\n');
  await writeFile(journal, '{"requests":[],"blockedUntil":0}\n');
  await writeFile(b4Manifest, b4ManifestBytes);
  const predecessorStatusPath = resolve(fixtureRoot, 'b4-terminal-status.json');
  await writeFile(predecessorStatusPath, JSON.stringify({
    workerPid: 18781,
    sourceCommit: 'ac3b3ccaf03107749d865f8d79557e872a06c881',
    status: 'completed',
    terminal: true,
    reconciled: true,
    exitCode: 0,
    finishedAt: new Date().toISOString(),
    finalManifestPath: b4Manifest,
    finalManifestSha256: digest(b4ManifestBytes),
  }));

  const fetchLog = resolve(fixtureRoot, 'fetch-log.jsonl');
  const shim = resolve(fixtureRoot, 'fixture-preload.mjs');
  await writeFile(shim, `
import { appendFile } from 'node:fs/promises';
import net from 'node:net';
import tls from 'node:tls';
const realKill = process.kill.bind(process);
net.connect = () => { throw new Error('fixture blocked direct network socket'); };
net.createConnection = net.connect;
tls.connect = () => { throw new Error('fixture blocked direct TLS socket'); };
process.kill = (pid, signal) => {
  if (pid === 18781 && signal === 0) throw Object.assign(new Error('fixture predecessor is stopped'), { code: 'ESRCH' });
  return realKill(pid, signal);
};
globalThis.fetch = async (url, init) => {
  const entry = { url: String(url), method: init?.method, body: init?.body };
  await appendFile(process.env.QA_FETCH_LOG, JSON.stringify(entry) + '\\n');
  if (String(url) !== 'https://dinospace-eight.vercel.app/api/voice') throw new Error('fixture blocked unexpected URL');
  const payload = JSON.parse(init.body);
  if (init.method !== 'POST' || payload.language !== 'en' || typeof payload.text !== 'string') throw new Error('fixture blocked unexpected request payload');
  if (process.env.QA_RESPONSE_MODE === 'throw') throw new Error('fixture transport failure');
  const mode = process.env.QA_RESPONSE_MODE;
  const status = mode === 'http500' ? 500 : mode === 'http429' ? 429 : mode === 'http204' ? 204 : 200;
  const provider = mode === 'wrong-provider' ? 'other' : 'elevenlabs';
  const mime = mode === 'wrong-mime' ? 'text/plain' : 'audio/mpeg';
  let bytes = mode === 'tiny' ? Buffer.from('tiny') : Buffer.concat([Buffer.from('ID3'), Buffer.alloc(1500, 0x41)]);
  return {
    status,
    ok: status >= 200 && status < 300 && status !== 204,
    headers: { get(name) { return name.toLowerCase() === 'x-amari-voice-provider' ? provider : name.toLowerCase() === 'content-type' ? mime : null; } },
    async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); },
  };
};
`);

  const originalManifestBytes = await readFile(resolve(candidate, candidateManifestRel));
  return { tempRoot, candidate, journal, b4Manifest, predecessorStatusPath, shim, fetchLog, originalManifestSha: digest(originalManifestBytes), mode, job };
}

async function runScenario(mode, job) {
  const fixture = await prepareFixture(mode, job);
  try {
    const inventorySha = supplementalInventorySha;
    const args = [
      '--import', fixture.shim,
      await realpath(resolve(fixture.candidate, 'scripts/run-reviewed-narration-job.mjs')),
      `--job=${job}`, `--inventory-sha256=${inventorySha}`,
      '--execute-paid', '--max-calls=1', '--max-runs=1',
      `--request-journal=${fixture.journal}`, `--predecessor-status=${fixture.predecessorStatusPath}`,
    ];
    const child = spawnSync(process.execPath, args, {
      cwd: fixture.candidate,
      encoding: 'utf8',
      timeout: 10_000,
      env: { ...process.env, QA_FETCH_LOG: fixture.fetchLog, QA_RESPONSE_MODE: mode },
    });
    assert.equal(child.error, undefined, `${mode}: child process error: ${child.error?.message}`);
    assert.equal(await exists(fixture.fetchLog), true, `${mode}: injected fetch was not reached. status=${child.status} signal=${child.signal} stdout=${child.stdout} stderr=${child.stderr}`);
    const fetchEvents = (await readFile(fixture.fetchLog, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map((row) => JSON.parse(row));
    const inventory = JSON.parse(await readFile(resolve(fixture.candidate, 'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json'), 'utf8'));
    const batch = job === 'b2-supplement' ? 2 : 3;
    const items = inventory.items.filter((entry) => entry.batch === batch && (batch !== 3 || entry.game === 'dino')).sort((a, b) => a.key.localeCompare(b.key));
    const requestedItem = items[0];
    assert.equal(fetchEvents.length, 1, `${mode}: exactly one injected fetch should occur`);
    assert.equal(fetchEvents[0].url, 'https://dinospace-eight.vercel.app/api/voice');
    assert.equal(fetchEvents[0].method, 'POST');
    assert.deepEqual(JSON.parse(fetchEvents[0].body), { text: requestedItem.text, language: 'en' });

    const auditPath = resolve(fixture.candidate, `tmp/reviewed-narration-audit-${job}.json`);
    const audit = JSON.parse(await readFile(auditPath, 'utf8'));
    const journal = JSON.parse(await readFile(fixture.journal, 'utf8'));
    assert.equal(audit.inventorySha256, inventorySha);
    assert.equal(audit.configuredMaxCallsPerRun, 1);
    assert.equal(audit.configuredMaxRuns, 1);
    assert.equal(audit.maximumProviderRequests, 1);
    assert.equal(audit.providerRequestsAttempted, 1);
    assert.equal(audit.providerResponsesAccepted, mode === 'success' ? 1 : 0);
    assert.equal(audit.manifestBeforeSha256, fixture.originalManifestSha);
    assert.equal(journal.requests.length, 1, `${mode}: attempted request must remain in shared journal`);
    const lockPath = resolve(dirname(fixture.journal), 'offline-voice-generator.lock');
    assert.equal(await exists(lockPath), false);

    const outputPath = resolve(fixture.candidate, 'public/audio/en', `${requestedItem.key}-matilda.mp3`);
    const manifest = await readFile(resolve(fixture.candidate, 'src/data/offlineVoiceManifest.js'), 'utf8');
    if (mode === 'success') {
      assert.equal(child.status, 2, `one accepted item leaves the finite run pending; ${child.stderr}`);
      assert.equal(audit.generated, 1);
      assert.equal(audit.failure, null);
      assert.notEqual(audit.manifestAfterSha256, fixture.originalManifestSha);
      assert.equal(audit.manifestChangedKeys.includes(requestedItem.key), true);
      assert.equal(await exists(outputPath), true);
      const outputBytes = await readFile(outputPath);
      assert.ok(outputBytes.length > 1000);
      assert.match(manifest, new RegExp(`\\"${requestedItem.key}\\": \\"/audio/en/${requestedItem.key}-matilda\\.mp3\\"`));
      const receiptPath = resolve(fixture.candidate, `tmp/reviewed-narration-provenance-${inventorySha}.json`);
      const provenance = JSON.parse(await readFile(receiptPath, 'utf8'));
      const receipt = provenance.entries[requestedItem.key];
      assert.equal(receipt.inventorySha256, inventorySha);
      assert.equal(receipt.sourceCommit, requestedItem.source);
      assert.equal(receipt.key, requestedItem.key);
      assert.equal(receipt.path, `/audio/en/${requestedItem.key}-matilda.mp3`);
      assert.equal(receipt.voice, 'matilda');
      assert.equal(receipt.contentType, 'audio/mpeg');
      assert.equal(receipt.bytes, outputBytes.length);
      assert.equal(receipt.audioSha256, digest(outputBytes));
      assert.equal(receipt.textSha256, digest(Buffer.from(requestedItem.text, 'utf8')));
    } else {
      assert.equal(child.status, 1, `${mode}: expected safe stop; stdout=${child.stdout} stderr=${child.stderr}`);
      assert.equal(audit.generated, 0);
      assert.equal(audit.manifestChangedKeys.length, 0);
      assert.equal(audit.changedFiles.length, 0);
      assert.equal(audit.manifestAfterSha256, fixture.originalManifestSha);
      assert.equal(await exists(outputPath), false, `${mode}: rejected response must not write audio`);
      assert.equal(digest(Buffer.from(manifest)), fixture.originalManifestSha, `${mode}: rejected response must not change manifest`);
      if (mode === 'throw') assert.match(audit.failure?.message || '', /fixture transport failure/);
      else assert.match(audit.stoppedAt || '', /HTTP 204|HTTP 500|HTTP 429|Provider header|MIME type|too small/);
      if (mode === 'http429' || mode === 'http204') assert.ok(journal.blockedUntil > Date.now());
      else assert.equal(journal.blockedUntil, 0);
    }
    assert.equal(await exists(lockPath), false, `${mode}: producer lock should be released`);
    return { job, mode, exitCode: child.status, fetches: fetchEvents.length, attempted: audit.providerRequestsAttempted, accepted: audit.providerResponsesAccepted, generated: audit.generated, journalRequests: journal.requests.length, blocked: journal.blockedUntil > Date.now(), lockReleased: true, sourceCommit: requestedItem.source, failure: audit.failure?.message || audit.stoppedAt || null };
  } finally {
    if (process.env.QA_KEEP_FIXTURES !== '1') await rm(fixture.tempRoot, { recursive: true, force: true });
    else console.error(`retained fixture: ${fixture.tempRoot}`);
  }
}

test('runner keeps failures audited and accepts only fixture-verified provider/MIME responses', async () => {
  const modes = ['wrong-provider', 'wrong-mime', 'tiny', 'http500', 'http204', 'http429', 'throw'];
  const results = [];
  for (const mode of modes) results.push(await runScenario(mode, 'b3-dino-facts'));
  results.push(await runScenario('success', 'b2-supplement'));
  results.push(await runScenario('success', 'b3-dino-facts'));
  assert.deepEqual(results.slice(0, modes.length).map(({ mode }) => mode), modes);
  assert.ok(results.slice(0, modes.length).every((result) => result.exitCode === 1 && result.accepted === 0 && result.generated === 0 && result.lockReleased));
  assert.ok(results.slice(modes.length).every((result) => result.exitCode === 2 && result.accepted === 1 && result.generated === 1 && result.lockReleased));
  assert.equal(results[modes.length].sourceCommit, '94d44d031d5835d0d9fa2128064ff83ba5880a62');
  assert.equal(results[modes.length + 1].sourceCommit, 'e2aee30169f6ade67f7948b0088a895a9cb119c3');
  console.log(JSON.stringify({ reviewedCommit, b5b7InventorySha256: b5b7InventorySha, supplementalInventorySha256: supplementalInventorySha, scenarios: results, note: 'Fixture-only synthetic bytes; no provider request, media decode, listening, or quality claim.' }, null, 2));
});
