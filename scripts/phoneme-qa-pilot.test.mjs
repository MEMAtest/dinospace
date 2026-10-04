import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  API_ENDPOINT,
  MATILDA_SOURCE_COMMIT,
  PILOT_INVENTORY_SHA256,
  PILOT_MAX_CALLS,
  PILOT_MODEL_ID,
  PILOT_VOICE_ID,
  assertLivePredecessorBlocked,
  buildDryRunPlan,
  candidateOutputPath,
  executePilot,
  loadPilotInventory,
  parseArgs,
  requestPayload,
  requestPhoneme,
  validatePaidArgs,
  MAX_AUDIO_BYTES,
} from './run-phoneme-qa-pilot.mjs';
import { producerLockPathForJournal, sha256 } from './reviewedNarrationJobs.mjs';

const repoRoot = resolve(import.meta.dirname, '..');
const b3Root = resolve(repoRoot, '../dinospace-batch3-quality');
const b4ManifestPath = resolve(repoRoot, '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js');

test('pinned pilot is exactly three fixed English targets with reviewed Matilda provenance', async () => {
  const { inventory, sha256 } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  assert.equal(sha256, PILOT_INVENTORY_SHA256);
  assert.equal(inventory.modelId, 'eleven_flash_v2');
  assert.equal(inventory.voice.sourceRepositoryCommit, MATILDA_SOURCE_COMMIT);
  assert.deepEqual(inventory.items.map(({ phoneme, ipa, grapheme }) => [phoneme, ipa, grapheme]), [
    ['/s/', 's', 's'], ['/æ/', 'æ', 'a'], ['/t/', 't', 't'],
  ]);
  assert.equal(inventory.maximumProviderRequests, PILOT_MAX_CALLS);
  assert.equal(inventory.retries, 0);
});

test('dry-run plan is fixed and keeps candidate files outside runtime audio and manifests', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  const plan = buildDryRunPlan(inventory);
  assert.equal(plan.readOnly, true);
  assert.equal(plan.maximumProviderRequests, 3);
  assert.equal(plan.retries, 0);
  assert.match(plan.candidateDirectory, /^tmp\/phoneme-qa-pilot\//);
  for (const item of inventory.items) {
    const output = candidateOutputPath(item);
    assert.match(output, /\/tmp\/phoneme-qa-pilot\/[a-f0-9]{64}\/pilot-/);
    assert.doesNotMatch(output, /\/public\/audio\/phonemes\/en\//);
  }
  assert.equal(resolve(repoRoot, 'public/audio/phonemes/en').includes(resolve(repoRoot, 'tmp/phoneme-qa-pilot')), false);
});

test('inventory hash and explicit paid limits fail closed', () => {
  assert.throws(() => parseArgs(['--execute-paid', '--model=eleven_multilingual_v2']), /Unsupported argument/);
  assert.throws(() => validatePaidArgs({ paid: true, inventorySha256: PILOT_INVENTORY_SHA256, maxCalls: 2, maxRuns: 1, maxCallsExplicit: true, maxRunsExplicit: true, requestJournal: '/x', predecessorStatus: '/y' }), /exactly --max-calls=3/);
  assert.throws(() => validatePaidArgs({ paid: true, inventorySha256: PILOT_INVENTORY_SHA256, maxCalls: 3, maxRuns: 2, maxCallsExplicit: true, maxRunsExplicit: true, requestJournal: '/x', predecessorStatus: '/y' }), /exactly --max-runs=1/);
  assert.throws(() => validatePaidArgs({ paid: true, inventorySha256: '0'.repeat(64), maxCalls: 3, maxRuns: 1, maxCallsExplicit: true, maxRunsExplicit: true, requestJournal: '/x', predecessorStatus: '/y' }), /exact pinned/);
});

test('pilot serializes with the actual B3 generator lock and shared journal', async () => {
  const journal = resolve(b3Root, 'tmp/offline-voice-request-state.json');
  assert.equal(producerLockPathForJournal(journal), resolve(b3Root, 'tmp/offline-voice-generator.lock'));
  const b3Generator = await readFile(resolve(b3Root, 'scripts/generate-batch1-offline-voices.mjs'), 'utf8');
  assert.match(b3Generator, /resolve\(root, 'tmp\/offline-voice-generator\.lock'\)/);
  const pilot = await readFile(resolve(repoRoot, 'scripts/run-phoneme-qa-pilot.mjs'), 'utf8');
  assert.match(pilot, /producerLockPathForJournal/);
  assert.match(pilot, /acquireProducerLock\(requestJournalPath/);
  assert.match(pilot, /assertJournalSnapshot\(requestJournalPath, expectedJournalSha256\)/);
});

test('a live B4 PID blocks paid execution before the current manifest is read', async () => {
  const temp = await mkdtemp(resolve(tmpdir(), 'phoneme-live-worker-'));
  const statusPath = resolve(temp, 'predecessor.json');
  await writeFile(statusPath, `${JSON.stringify({
    workerPid: 18781,
    sourceCommit: 'ac3b3ccaf03107749d865f8d79557e872a06c881',
    status: 'completed',
    terminal: true,
    reconciled: true,
    exitCode: 0,
    finishedAt: new Date().toISOString(),
    finalManifestPath: b4ManifestPath,
    finalManifestSha256: 'a'.repeat(64),
  })}\n`);
  try {
    await assert.rejects(
      () => assertLivePredecessorBlocked(statusPath, (pid, signal) => {
        assert.equal(pid, 18781);
        assert.equal(signal, 0);
        return undefined;
      }),
      /still live/,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('runner stops at its live-worker gate before acquiring the journal or calling the provider', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  const temp = await mkdtemp(resolve(tmpdir(), 'phoneme-pilot-execute-gate-'));
  const statusPath = resolve(temp, 'predecessor.json');
  const journalPath = resolve(b3Root, 'tmp/offline-voice-request-state.json');
  await writeFile(statusPath, `${JSON.stringify({
    workerPid: 18781,
    sourceCommit: 'ac3b3ccaf03107749d865f8d79557e872a06c881',
    status: 'completed',
    terminal: true,
    reconciled: true,
    exitCode: 0,
    finishedAt: new Date().toISOString(),
    finalManifestPath: b4ManifestPath,
    finalManifestSha256: 'b'.repeat(64),
  })}\n`);
  let calls = 0;
  try {
    await assert.rejects(() => executePilot({
      args: {
        paid: true,
        inventorySha256: PILOT_INVENTORY_SHA256,
        maxCalls: 3,
        maxRuns: 1,
        maxCallsExplicit: true,
        maxRunsExplicit: true,
        requestJournal: journalPath,
        predecessorStatus: statusPath,
      },
      inventory,
      inventorySha256: PILOT_INVENTORY_SHA256,
      apiKey: 'fixture-only-token',
      fetchImpl: async () => { calls += 1; throw new Error('The live-worker gate did not stop the request.'); },
      pidProbe: (pid, signal) => {
        assert.equal(pid, 18781);
        assert.equal(signal, 0);
        return undefined;
      },
    }), /still live/);
    assert.equal(calls, 0);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('an existing candidate directory blocks a second run before journal access or provider calls', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  const temp = await mkdtemp(resolve(tmpdir(), 'phoneme-repeat-guard-'));
  const candidateRoot = resolve(temp, PILOT_INVENTORY_SHA256);
  const auditPath = resolve(candidateRoot, 'audit.json');
  const outputPath = candidateOutputPath(inventory.items[0], candidateRoot);
  const journalPath = resolve(b3Root, 'tmp/offline-voice-request-state.json');
  const journalBefore = sha256(await readFile(journalPath));
  await mkdir(candidateRoot, { recursive: true });
  const priorAudit = Buffer.from('{"prior":"audit"}\n');
  const priorOutput = Buffer.alloc(1501, 7);
  await writeFile(auditPath, priorAudit);
  await writeFile(outputPath, priorOutput);
  let calls = 0;
  try {
    await assert.rejects(() => executePilot({
      args: {
        paid: true,
        inventorySha256: PILOT_INVENTORY_SHA256,
        maxCalls: 3,
        maxRuns: 1,
        maxCallsExplicit: true,
        maxRunsExplicit: true,
        requestJournal: journalPath,
        predecessorStatus: '/not-read-because-output-exists',
      },
      inventory,
      inventorySha256: PILOT_INVENTORY_SHA256,
      apiKey: 'fixture-only-token',
      candidateDirectory: candidateRoot,
      fetchImpl: async () => { calls += 1; throw new Error('Existing outputs must stop before a request.'); },
      pidProbe: () => { throw Object.assign(new Error('not running'), { code: 'ESRCH' }); },
    }), /candidate directory already exists/);
    assert.equal(calls, 0);
    assert.equal(sha256(await readFile(auditPath)), sha256(priorAudit));
    assert.equal(sha256(await readFile(outputPath)), sha256(priorOutput));
    assert.equal(sha256(await readFile(journalPath)), journalBefore);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('request payload is the exact pinned SSML and one fake success is one request', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  const item = inventory.items[0];
  assert.deepEqual(requestPayload(item), {
    text: '<phoneme alphabet="ipa" ph="s">s</phoneme>',
    model_id: 'eleven_flash_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.95 },
  });
  let calls = 0;
  const result = await requestPhoneme(item, {
    apiKey: 'fixture-only-token',
    fetchImpl: async (url, options) => {
      calls += 1;
      assert.equal(url, `${API_ENDPOINT}?output_format=mp3_44100_128`);
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers['xi-api-key'], 'fixture-only-token');
      assert.equal(JSON.parse(options.body).model_id, PILOT_MODEL_ID);
      assert.equal(API_ENDPOINT.endsWith(PILOT_VOICE_ID), true);
      return new Response(Buffer.alloc(1500, 1), { status: 200, headers: { 'content-type': 'audio/mpeg' } });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.bytes.length, 1500);
  assert.equal(result.contentType, 'audio/mpeg');
});

test('provider failure, wrong MIME, and undersized audio fail once without retries', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  for (const response of [
    new Response('unavailable', { status: 503, headers: { 'content-type': 'text/plain' } }),
    new Response(Buffer.alloc(1500), { status: 200, headers: { 'content-type': 'application/json' } }),
    new Response(Buffer.alloc(1000), { status: 200, headers: { 'content-type': 'audio/mpeg' } }),
  ]) {
    let calls = 0;
    await assert.rejects(() => requestPhoneme(inventory.items[0], {
      apiKey: 'fixture-only-token',
      fetchImpl: async () => { calls += 1; return response; },
    }), /no retry/);
    assert.equal(calls, 1);
  }
});

test('oversized response is cut off during streaming and never retried', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  let calls = 0;
  await assert.rejects(() => requestPhoneme(inventory.items[0], {
    apiKey: 'fixture-only-token',
    fetchImpl: async () => {
      calls += 1;
      return new Response(new ReadableStream({
        start(controller) { controller.enqueue(new Uint8Array(MAX_AUDIO_BYTES + 1)); },
      }), { status: 200, headers: { 'content-type': 'audio/mpeg' } });
    },
  }), /pilot limit/);
  assert.equal(calls, 1);
});

test('request timeout aborts both a pending response and a response body read', async () => {
  const { inventory } = await loadPilotInventory(PILOT_INVENTORY_SHA256);
  const item = inventory.items[0];
  await assert.rejects(() => requestPhoneme(item, {
    apiKey: 'fixture-only-token',
    timeoutMs: 5,
    fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    }),
  }), /timed out/);

  await assert.rejects(() => requestPhoneme(item, {
    apiKey: 'fixture-only-token',
    timeoutMs: 5,
    fetchImpl: async (_url, options) => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'audio/mpeg' }),
      body: new ReadableStream({
        start(controller) {
          options.signal.addEventListener('abort', () => controller.error(options.signal.reason), { once: true });
        },
      }),
    }),
  }), /timed out/);
});
