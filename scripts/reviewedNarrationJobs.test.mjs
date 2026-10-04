import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  B4_SOURCE_COMMIT, B4_WORKER_PID, JOBS, PINNED_INVENTORY_SHA256,
  acquireProducerLock, assertJournalPath, assertJournalSnapshot, assertPredecessorFinished, assertTerminalPredecessorRecord,
  availableCalls, getCandidateReusablePath, isCandidateReusable, isPackagedCandidate,
  loadPinnedInventory, producerLockPathForJournal, readRequestJournal, requestNarration, selectJobItems,
  sha256, validateBudgets,
} from './reviewedNarrationJobs.mjs';

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(root, 'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json');
const cliPath = resolve(root, 'scripts/run-reviewed-narration-job.mjs');
const sharedJournal = resolve(root, '../dinospace-batch3-quality/tmp/offline-voice-request-state.json');
const b4Manifest = resolve(root, '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js');

const tempDir = async () => mkdtemp(resolve(tmpdir(), 'reviewed-voice-test-'));
const deadPidProbe = () => { throw Object.assign(new Error('not running'), { code: 'ESRCH' }); };

test('pins exact reviewed ledger and derives only approved owner keys', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({ inventoryPath, suppliedSha256: PINNED_INVENTORY_SHA256 });
  assert.equal(actualSha256, PINNED_INVENTORY_SHA256);
  assert.deepEqual(Object.keys(JOBS), ['b5-reasoning', 'b5-literacy', 'b6', 'b7-solar', 'b7-memory']);
  assert.equal(selectJobItems(inventory, 'b5-reasoning').length, 310);
  assert.equal(selectJobItems(inventory, 'b5-literacy').length, 659);
  assert.equal(selectJobItems(inventory, 'b6').length, 378);
  assert.equal(selectJobItems(inventory, 'b7-solar').length, 127);
  assert.equal(selectJobItems(inventory, 'b7-memory').length, 183);
  assert.ok(selectJobItems(inventory, 'b7-solar').every((item) => item.owners.includes('B7_solar') && !item.owners.includes('B4')));
  await assert.rejects(() => loadPinnedInventory({ inventoryPath, suppliedSha256: '0'.repeat(64) }), /must equal reviewed SHA/);
});

test('rejects jobs, call rates and run counts outside finite reviewed bounds', () => {
  assert.throws(() => selectJobItems({ items: [] }, 'b4'), /Unknown job selector/);
  assert.throws(() => validateBudgets({ maxCalls: 21, maxRuns: 1, paid: true }), /max-calls/);
  assert.throws(() => validateBudgets({ maxCalls: 20, maxRuns: 101, paid: true }), /max-runs/);
  assert.deepEqual(validateBudgets({ maxCalls: 20, maxRuns: 75, paid: false }), { maxCalls: 20, maxRuns: 75 });
});

test('requires a terminal reconciled B4 record tied to the current manifest and dead worker PID', async () => {
  const dir = await tempDir();
  try {
    const manifestPath = resolve(dir, 'offlineVoiceManifest.js');
    const bytes = Buffer.from('export const manifest = {};\n');
    await writeFile(manifestPath, bytes);
    const recordPath = resolve(dir, 'predecessor.json');
    const good = { workerPid: B4_WORKER_PID, sourceCommit: B4_SOURCE_COMMIT, status: 'completed', terminal: true, reconciled: true, exitCode: 0, finishedAt: new Date().toISOString(), finalManifestPath: manifestPath, finalManifestSha256: sha256(bytes) };
    await writeFile(recordPath, JSON.stringify(good));
    await assertPredecessorFinished(recordPath, manifestPath, deadPidProbe);
    await assert.rejects(() => assertPredecessorFinished(recordPath, manifestPath, () => {}), /still live/);
    assert.throws(() => assertTerminalPredecessorRecord({ ...good, reconciled: false }, { expectedB4ManifestSha256: sha256(bytes) }), /terminal and reconciled/);
    assert.throws(() => assertTerminalPredecessorRecord({ ...good, finalManifestSha256: 'f'.repeat(64) }, { expectedB4ManifestSha256: sha256(bytes) }), /manifest SHA/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('requires the explicit shared journal and fails closed on invalid journal state or concurrent edits', async () => {
  assert.throws(() => assertJournalPath('', sharedJournal), /explicit --request-journal/);
  assert.throws(() => assertJournalPath(resolve(root, 'tmp/isolated.json'), sharedJournal), /must be the shared journal/);
  const dir = await tempDir();
  try {
    const validPath = resolve(dir, 'journal.json');
    await writeFile(validPath, JSON.stringify({ requests: Array.from({ length: 30 }, (_, i) => ({ at: Date.now() - i })), blockedUntil: 0 }));
    const journal = await readRequestJournal(validPath);
    assert.equal(availableCalls(journal), 0);
    await assertJournalSnapshot(validPath, journal.sourceSha256);
    await writeFile(validPath, JSON.stringify({ requests: [], blockedUntil: 0 }));
    await assert.rejects(() => assertJournalSnapshot(validPath, journal.sourceSha256), /changed outside this run/);
    await writeFile(validPath, JSON.stringify({ requests: Array.from({ length: 30 }, (_, i) => ({ at: Date.now() - i })), blockedUntil: 0 }));
    journal.requests.pop();
    assert.equal(availableCalls(journal), 1);
    await writeFile(validPath, '{broken');
    await assert.rejects(() => readRequestJournal(validPath));
    await writeFile(validPath, JSON.stringify({ requests: [{ at: Date.now() + 600_000 }], blockedUntil: 0 }));
    await assert.rejects(() => readRequestJournal(validPath), /future request timestamp/);
    await writeFile(validPath, JSON.stringify({ requests: [], blockedUntil: Date.now() + 3_700_000 }));
    await assert.rejects(() => readRequestJournal(validPath), /invalid schema/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('uses and honors the exact exclusive lock held by the shared B3 producer', async () => {
  const b3Root = resolve(root, '../dinospace-batch3-quality');
  const producerSource = await readFile(resolve(b3Root, 'scripts/generate-batch1-offline-voices.mjs'), 'utf8');
  assert.match(producerSource, /const lockPath = resolve\(root, 'tmp\/offline-voice-generator\.lock'\)/);
  assert.equal(producerLockPathForJournal(sharedJournal), resolve(b3Root, 'tmp/offline-voice-generator.lock'));

  const dir = await tempDir();
  try {
    const journalPath = resolve(dir, 'tmp/offline-voice-request-state.json');
    const producerLock = producerLockPathForJournal(journalPath);
    await mkdir(resolve(dir, 'tmp'), { recursive: true });
    await writeFile(producerLock, JSON.stringify({ pid: 18781, startedAt: new Date().toISOString() }));
    await assert.rejects(() => acquireProducerLock(journalPath, { pid: process.pid, job: 'test' }), /shared journal is in use/);
    await rm(producerLock);
    const held = await acquireProducerLock(journalPath, { pid: process.pid, job: 'test' });
    assert.equal(held.path, producerLock);
    await held.lock.close();
    await rm(held.path);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('only reuses a packaged candidate when reviewed bytes match, including an unmapped exact file', async () => {
  const dir = await tempDir();
  try {
    const itemBytes = Buffer.alloc(1201, 0x31);
    const item = { key: 'reviewed-key', path: '/audio/en/reviewed-key-matilda.mp3', text: 'Exact approved line.', expectedCandidateSha256: sha256(itemBytes) };
    const audioPath = resolve(dir, 'public', item.path.slice(1));
    await mkdir(resolve(dir, 'public/audio/en'), { recursive: true });
    await writeFile(audioPath, itemBytes);
    const mapped = new Map([[item.key, item.path]]);
    assert.equal(await getCandidateReusablePath(dir, mapped, item), item.path);
    assert.equal(await isPackagedCandidate(dir, mapped, item), true);
    assert.equal(await isCandidateReusable(dir, new Map(), item), item.path);
    assert.equal(await isPackagedCandidate(dir, new Map(), item), false);

    await writeFile(audioPath, Buffer.alloc(1201, 0x32));
    assert.equal(await getCandidateReusablePath(dir, mapped, item), null);
    await writeFile(audioPath, Buffer.alloc(1000, 0x31));
    assert.equal(await getCandidateReusablePath(dir, mapped, item), null);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('a generated file is reusable only with a matching local receipt and exact text/inventory binding', async () => {
  const dir = await tempDir();
  try {
    const bytes = Buffer.alloc(1400, 0x41);
    const item = { key: 'generated-key', path: '/audio/en/generated-key-matilda.mp3', text: 'Exact approved line.', expectedCandidateSha256: null };
    const audioPath = resolve(dir, 'public', item.path.slice(1));
    await mkdir(resolve(dir, 'public/audio/en'), { recursive: true });
    await writeFile(audioPath, bytes);
    const receipt = { producer: 'reviewedNarrationSupervisorV1', inventorySha256: PINNED_INVENTORY_SHA256, key: item.key, path: item.path, textSha256: sha256(Buffer.from(item.text)), voice: 'matilda', contentType: 'audio/mpeg', bytes: bytes.length, audioSha256: sha256(bytes) };
    assert.equal(await isCandidateReusable(dir, new Map(), item, receipt), item.path);
    assert.equal(await isCandidateReusable(dir, new Map(), item, { ...receipt, textSha256: '0'.repeat(64) }), null);
    await writeFile(audioPath, Buffer.alloc(1400, 0x42));
    assert.equal(await isCandidateReusable(dir, new Map(), item, receipt), null);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('request helper sends only the approved voice payload and enforces a finite timeout through injected fetch', async () => {
  const item = { text: 'One exact reviewed sentence.' };
  let captured;
  const response = { ok: true, arrayBuffer: async () => Buffer.from('response bytes') };
  const returned = await requestNarration(item, async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return response;
  }, 100);
  assert.equal(returned.response, response);
  assert.equal(returned.bytes.toString(), 'response bytes');
  assert.match(captured.url, /\/api\/voice$/);
  assert.equal(captured.init.method, 'POST');
  assert.deepEqual(captured.body, { text: item.text, language: 'en' });
  assert.equal(captured.init.signal instanceof AbortSignal, true);
  await assert.rejects(() => requestNarration(item, async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
  }), 5), /timed out/);
  await assert.rejects(() => requestNarration(item, async (_url, init) => ({
    arrayBuffer: () => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })),
  }), 5), /timed out/);
  await assert.rejects(() => requestNarration(item, async () => ({}), 90_001), /timeout must be/);
});

test('dry-run reports exact pending keys and leaves package and shared journal untouched', async () => {
  const beforeManifest = sha256(await readFile(resolve(root, 'src/data/offlineVoiceManifest.js')));
  const beforeJournal = sha256(await readFile(sharedJournal));
  const beforeB4Manifest = sha256(await readFile(b4Manifest));
  const result = spawnSync(process.execPath, [cliPath, '--job=b7-solar', `--inventory-sha256=${PINNED_INVENTORY_SHA256}`], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.mode, 'dry-run');
  assert.equal(summary.readOnly, true);
  assert.equal(summary.requested, 127);
  assert.equal(summary.packagedCandidateReusable, 111);
  assert.equal(summary.pending, 16);
  assert.equal(summary.pendingKeys.length, 16);
  assert.equal(sha256(await readFile(resolve(root, 'src/data/offlineVoiceManifest.js'))), beforeManifest);
  assert.equal(sha256(await readFile(sharedJournal)), beforeJournal);
  assert.equal(sha256(await readFile(b4Manifest)), beforeB4Manifest);
});

test('paid mode cannot pass a live predecessor PID even with an apparently terminal record', async () => {
  const dir = await tempDir();
  try {
    const bytes = await readFile(b4Manifest);
    const statusPath = resolve(dir, 'live-predecessor.json');
    await writeFile(statusPath, JSON.stringify({ workerPid: process.pid, sourceCommit: B4_SOURCE_COMMIT, status: 'completed', terminal: true, reconciled: true, exitCode: 0, finishedAt: new Date().toISOString(), finalManifestPath: b4Manifest, finalManifestSha256: sha256(bytes) }));
    const beforeManifest = sha256(await readFile(resolve(root, 'src/data/offlineVoiceManifest.js')));
    const beforeJournal = sha256(await readFile(sharedJournal));
    const result = spawnSync(process.execPath, [cliPath, '--job=b7-solar', `--inventory-sha256=${PINNED_INVENTORY_SHA256}`, '--execute-paid', '--max-calls=1', '--max-runs=1', `--request-journal=${sharedJournal}`, `--predecessor-status=${statusPath}`], { cwd: root, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /still live/);
    assert.equal(sha256(await readFile(resolve(root, 'src/data/offlineVoiceManifest.js'))), beforeManifest);
    assert.equal(sha256(await readFile(sharedJournal)), beforeJournal);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CLI refuses a modified inventory digest before selecting or writing', () => {
  const result = spawnSync(process.execPath, [cliPath, '--job=b6', `--inventory-sha256=${'0'.repeat(64)}`], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must equal reviewed SHA/);
});

test('paid mode requires explicit per-run and total-run caps', () => {
  const result = spawnSync(process.execPath, [cliPath, '--job=b6', `--inventory-sha256=${PINNED_INVENTORY_SHA256}`, '--execute-paid'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /explicit --max-calls and --max-runs/);
});
