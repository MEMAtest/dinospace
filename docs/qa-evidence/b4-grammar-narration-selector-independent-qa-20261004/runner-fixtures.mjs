import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const qaDir = dirname(fileURLToPath(import.meta.url));
const repo = resolve(qaDir, '../../..');
const reviewedCandidate = '8fecff6e4dc36bac8c6628c9c68818e2ba71c86e';
const inventorySha = '9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001';
const pinnedFiles = {
  'scripts/reviewedNarrationJobs.mjs': '67362ba6c0851f5f7eb03bcc079118f1f954c9a7eb1d39c09cb142a67fa24f77',
  'scripts/run-reviewed-narration-job.mjs': '144fe64a7991ebf8de6a6f1b337313e148330a21146df37df1219b40d7bd9966',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
  'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json': inventorySha,
};
const inventoryRel = 'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json';
const sharedJournalRel = '../dinospace-batch3-quality/tmp/offline-voice-request-state.json';
const b4ManifestRel = '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js';
const b4SourceCommit = 'fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128';
const predecessorSourceCommit = 'ac3b3ccaf03107749d865f8d79557e872a06c881';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const livePidGate = async () => {
  const cli = resolve(repo, 'scripts/run-reviewed-narration-job.mjs');
  const sharedJournal = resolve(repo, sharedJournalRel);
  const b4Manifest = resolve(repo, b4ManifestRel);
  const actualManifest = resolve(repo, 'src/data/offlineVoiceManifest.js');
  const lockPath = resolve(dirname(sharedJournal), 'offline-voice-generator.lock');
  const auditPath = resolve(repo, 'tmp/reviewed-narration-audit-b4-grammar.json');
  const digest = async (path) => sha256(await readFile(path));
  const existed = async (path) => { try { return { exists: true, sha256: await digest(path) }; } catch (error) { if (error.code === 'ENOENT') return { exists: false, sha256: null }; throw error; } };
  const before = {
    journal: await existed(sharedJournal),
    b4Manifest: await existed(b4Manifest),
    runnerManifest: await existed(actualManifest),
    producerLock: await existed(lockPath),
    audit: await existed(auditPath),
  };
  const manifestBytes = await readFile(b4Manifest);
  const dir = await mkdtemp(resolve(tmpdir(), 'b4-selector-live-pid-'));
  try {
    const statusPath = resolve(dir, 'predecessor.json');
    await writeFile(statusPath, JSON.stringify({
      workerPid: process.pid,
      sourceCommit: predecessorSourceCommit,
      status: 'completed',
      terminal: true,
      reconciled: true,
      exitCode: 0,
      finishedAt: new Date().toISOString(),
      finalManifestPath: realpathSync(b4Manifest),
      finalManifestSha256: sha256(manifestBytes),
    }));
    const result = spawnSync(process.execPath, [
      cli,
      '--job=b4-grammar',
      `--inventory-sha256=${inventorySha}`,
      '--execute-paid',
      '--max-calls=1',
      '--max-runs=1',
      `--request-journal=${realpathSync(sharedJournal)}`,
      `--predecessor-status=${statusPath}`,
    ], { cwd: repo, encoding: 'utf8' });
    const after = {
      journal: await existed(sharedJournal),
      b4Manifest: await existed(b4Manifest),
      runnerManifest: await existed(actualManifest),
      producerLock: await existed(lockPath),
      audit: await existed(auditPath),
    };
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /still live; refusing paid execution/);
    assert.deepEqual(after, before, 'live-PID preflight must not change manifests, journal, lock, or audit');
    return { exitCode: result.status, stderr: result.stderr.trim(), blockedBeforeLockOrJournalWrite: true, before, after };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const createFixture = async (mode) => {
  const parent = await mkdtemp(resolve(tmpdir(), `b4-selector-${mode}-`));
  const root = resolve(parent, 'dinospace-b4-grammar-narration');
  const b3 = resolve(parent, 'dinospace-batch3-quality');
  const put = async (path, bytes) => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  };
  await Promise.all([
    mkdir(resolve(root, 'docs/qa-evidence'), { recursive: true }),
    mkdir(resolve(root, 'scripts'), { recursive: true }),
    mkdir(resolve(root, 'src/data'), { recursive: true }),
  ]);
  for (const [path, expectedSha] of Object.entries(pinnedFiles)) {
    const bytes = execFileSync('git', ['show', `${reviewedCandidate}:${path}`], { cwd: repo });
    assert.equal(sha256(bytes), expectedSha, `reviewed git blob SHA mismatch for ${path}`);
    await put(resolve(root, path), bytes);
  }
  await put(resolve(root, 'package.json'), '{"type":"module"}\n');
  await put(resolve(root, 'src/data/offlineVoiceManifest.js'), '// fixture manifest\nexport const OFFLINE_VOICE_MANIFEST = {};\n');
  await put(resolve(root, sharedJournalRel), '{"requests":[],"blockedUntil":0}\n');
  const b4Manifest = resolve(root, b4ManifestRel);
  await put(b4Manifest, '// fixture B4 manifest\nexport const OFFLINE_VOICE_MANIFEST = {};\n');
  const b4ManifestBytes = await readFile(b4Manifest);
  const inventory = JSON.parse(await readFile(resolve(root, inventoryRel), 'utf8'));
  const deadPid = 18781;
  const statusPath = resolve(parent, 'predecessor.json');
  await put(statusPath, JSON.stringify({
    workerPid: deadPid,
    sourceCommit: predecessorSourceCommit,
    status: 'completed',
    terminal: true,
    reconciled: true,
    exitCode: 0,
    finishedAt: new Date().toISOString(),
    finalManifestPath: realpathSync(b4Manifest),
    finalManifestSha256: sha256(b4ManifestBytes),
  }));
  const fetchLog = resolve(parent, 'fetch-log.jsonl');
  const socketAttemptsPath = resolve(parent, 'socket-attempts.txt');
  const preloadPath = resolve(parent, 'fake-fetch.cjs');
  await put(preloadPath, `
const fs = require('node:fs');
const net = require('node:net');
const tls = require('node:tls');
let socketAttempts = 0;
const blockSocket = (name) => (...args) => { socketAttempts += 1; throw new Error('Network socket blocked by independent fixture: ' + name); };
net.connect = blockSocket('net.connect');
net.createConnection = blockSocket('net.createConnection');
tls.connect = blockSocket('tls.connect');
process.on('exit', () => fs.writeFileSync(process.env.QA_SOCKET_ATTEMPTS, String(socketAttempts)));
const originalKill = process.kill.bind(process);
process.kill = (pid, ...args) => { if (Number(pid) === 18781) { const error = new Error('fixture predecessor is marked exited'); error.code = 'ESRCH'; throw error; } return originalKill(pid, ...args); };
const mode = process.env.QA_FAKE_FETCH_MODE;
const logPath = process.env.QA_FAKE_FETCH_LOG;
const expectedUrl = 'https://dinospace-eight.vercel.app/api/voice';
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  await fs.promises.appendFile(logPath, JSON.stringify({ url, method: init.method, body: init.body, headers: init.headers }) + '\\n');
  if (url !== expectedUrl || mode === 'deny') throw new Error('Network blocked by independent fixture');
  const bytes = Uint8Array.from(Buffer.alloc(1201, 0x41));
  return {
    ok: true,
    status: 200,
    headers: { get(name) {
      if (name.toLowerCase() === 'x-amari-voice-provider') return mode === 'success' ? 'elevenlabs' : 'unverified';
      if (name.toLowerCase() === 'content-type') return 'audio/mpeg';
      return null;
    } },
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
};
`);
  return { parent, root, statusPath, fetchLog, socketAttemptsPath, preloadPath, inventory, b4Manifest };
};

const runFixture = async (mode) => {
  const fixture = await createFixture(mode);
  try {
    const root = fixture.root;
    const realRoot = resolve(dirname(realpathSync(resolve(root, 'scripts/run-reviewed-narration-job.mjs'))), '..');
    const sharedJournal = resolve(root, sharedJournalRel);
    const actualManifest = resolve(root, 'src/data/offlineVoiceManifest.js');
    const b4Manifest = fixture.b4Manifest;
    const producerLock = resolve(dirname(sharedJournal), 'offline-voice-generator.lock');
    const provenancePath = resolve(root, `tmp/reviewed-narration-provenance-${inventorySha}.json`);
    const auditPath = resolve(realRoot, 'tmp/reviewed-narration-audit-b4-grammar.json');
    const manifestBefore = sha256(await readFile(actualManifest));
    const journalBefore = sha256(await readFile(sharedJournal));
    const args = [
      realpathSync(resolve(root, 'scripts/run-reviewed-narration-job.mjs')),
      '--job=b4-grammar',
      `--inventory-sha256=${inventorySha}`,
      '--execute-paid',
      '--max-calls=1',
      '--max-runs=1',
      `--request-journal=${realpathSync(sharedJournal)}`,
      `--predecessor-status=${fixture.statusPath}`,
    ];
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, NODE_OPTIONS: `--require=${fixture.preloadPath}`, QA_FAKE_FETCH_MODE: mode, QA_FAKE_FETCH_LOG: fixture.fetchLog, QA_SOCKET_ATTEMPTS: fixture.socketAttemptsPath },
    });
    if (!result.stdout.trim()) throw new Error(`fixture CLI produced no JSON (status=${result.status})\nstdout=${result.stdout}\nstderr=${result.stderr}`);
    const summary = JSON.parse(result.stdout);
    const fetched = (await readFile(fixture.fetchLog, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
    const socketAttempts = Number(await readFile(fixture.socketAttemptsPath, 'utf8'));
    assert.equal(socketAttempts, 0, 'no net/tls socket API may be attempted in the isolated fixture');
    assert.equal(fetched.length, 1);
    assert.deepEqual(Object.keys(JSON.parse(fetched[0].body)).sort(), ['language', 'text']);
    assert.equal(fetched[0].url, 'https://dinospace-eight.vercel.app/api/voice');
    assert.equal(fetched[0].method, 'POST');
    assert.equal(summary.job, 'b4-grammar');
    assert.equal(summary.inventorySha256, inventorySha);
    assert.equal(summary.runs, 1);
    assert.equal(summary.auditPath, auditPath);
    assert.equal(summary.manifestBeforeSha256, manifestBefore);
    assert.equal(summary.requested, 47);

    const manifestAfter = sha256(await readFile(actualManifest));
    const journalAfter = sha256(await readFile(sharedJournal));
    const journal = JSON.parse(await readFile(sharedJournal, 'utf8'));
    const audit = JSON.parse(await readFile(auditPath, 'utf8'));
    const first = fixture.inventory.items.slice().sort((a, b) => a.key.localeCompare(b.key))[0];
    assert.equal(first.source, b4SourceCommit);
    assert.equal(journal.requests.length, 1);
    assert.equal(audit.configuredMaxCallsPerRun, 1);
    assert.equal(audit.configuredMaxRuns, 1);
    assert.equal(audit.maximumProviderRequests, 1);
    assert.equal(audit.providerRequestsAttempted, 1);
    assert.equal(audit.manifestBeforeSha256, manifestBefore);
    assert.equal(audit.manifestAfterSha256, manifestAfter);
    assert.equal(await exists(producerLock), false, 'fixture lock must be released');

    let receiptOutcome;
    if (mode === 'success') {
      assert.equal(result.status, 2, result.stderr);
      assert.equal(summary.generated, 1);
      assert.equal(summary.pendingKeys, 46);
      assert.equal(audit.providerResponsesAccepted, 1);
      assert.equal(journal.requests.length, 1);
      const manifest = parseManifest(await readFile(actualManifest, 'utf8'));
      assert.equal(manifest[first.key], first.path);
      const receipts = JSON.parse(await readFile(provenancePath, 'utf8'));
      const receipt = receipts.entries[first.key];
      assert.equal(receipts.inventorySha256, inventorySha);
      assert.equal(receipt.inventorySha256, inventorySha);
      assert.equal(receipt.sourceCommit, b4SourceCommit);
      assert.equal(receipt.key, first.key);
      assert.equal(receipt.path, first.path);
      assert.equal(receipt.voice, 'matilda');
      assert.equal(receipt.contentType, 'audio/mpeg');
      assert.equal(receipt.textSha256, sha256(Buffer.from(first.text, 'utf8')));
      assert.equal(receipt.bytes, 1201);
      const audioBytes = await readFile(resolve(root, 'public', first.path.slice(1)));
      assert.equal(sha256(audioBytes), receipt.audioSha256);
      receiptOutcome = { accepted: true, fakeBytesOnly: true, sourceCommit: receipt.sourceCommit, inventorySha256: receipt.inventorySha256, key: receipt.key, path: receipt.path, bytes: receipt.bytes };
    } else {
      assert.equal(result.status, 1);
      assert.match(summary.stoppedAt, /Provider header was not verified/);
      assert.equal(summary.generated, 0);
      assert.equal(summary.pendingKeys, 47);
      assert.equal(audit.providerResponsesAccepted, 0);
      assert.equal(manifestAfter, manifestBefore);
      assert.equal(journal.requests.length, 1, 'failed response retains the bounded request attempt');
      assert.equal(await exists(provenancePath), false, 'rejected response must not write a receipt');
      assert.equal(await exists(resolve(root, 'public', first.path.slice(1))), false, 'rejected response must not write audio');
      receiptOutcome = { accepted: false, noReceiptWritten: true, noAudioWritten: true, stopReason: summary.stoppedAt };
    }
    assert.equal(audit.inventorySha256, inventorySha);
    assert.equal(audit.requested, 47);
    assert.equal(audit.runs, 1);
    assert.equal(audit.providerRequestsAttempted, 1);
    assert.equal(audit.maximumProviderRequests, 1);
    assert.equal(journalAfter === journalBefore, false, 'the fixture journal records one attempted fake request');
    return { mode, exitCode: result.status, fakeFetchCalls: fetched.length, blockedSocketAttempts: socketAttempts, pending: summary.pendingKeys, receiptOutcome, audit, manifestBefore, manifestAfter, journalRequests: journal.requests.length, producerLockReleased: true };
  } finally {
    await rm(fixture.parent, { recursive: true, force: true });
  }
};

async function exists(path) {
  try { await stat(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

function parseManifest(source) {
  const match = source.match(/export const OFFLINE_VOICE_MANIFEST = (\{[\s\S]*\});\s*$/);
  assert.ok(match, 'fixture manifest parses');
  return JSON.parse(match[1]);
}

const realPidAlive = (() => { try { process.kill(18781, 0); return true; } catch (error) { return error.code !== 'ESRCH'; } })();
assert.equal(realPidAlive, true, 'B4 predecessor PID 18781 should still be live for this bounded review');
const livePid = await livePidGate();
const success = await runFixture('success');
const rejected = await runFixture('reject-provider');
console.log(JSON.stringify({ sourceCommit: reviewedCandidate, liveWorkerPid: 18781, realWorkerObservedAlive: realPidAlive, livePid, success, rejected, realProviderCalls: 0, productionManifestsOrJournalChanged: false }, null, 2));
