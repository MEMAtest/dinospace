import { mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  B4_WORKER_PID,
  MAX_REQUEST_TIMEOUT_MS,
  RATE_WINDOW_MS,
  acquireProducerLock,
  assertJournalPath,
  assertJournalSnapshot,
  assertPredecessorFinished,
  availableCalls,
  producerLockPathForJournal,
  readRequestJournal,
  sha256,
} from './reviewedNarrationJobs.mjs';

export const PILOT_INVENTORY_SHA256 = '921d4adc622bbdbe4eecf458126089ba8ea49c6b421c68f26c96875c02559b71';
export const PILOT_MODEL_ID = 'eleven_flash_v2';
export const PILOT_VOICE_ID = 'XrExE9yKIg1WjnnlVkGX';
export const PILOT_VOICE_NAME = 'Matilda';
export const PILOT_MAX_CALLS = 3;
export const PILOT_MAX_RUNS = 1;
export const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
export const MATILDA_SOURCE_COMMIT = '85eee97bbc2910e83b38ec5deea2f45cdb773e83';
export const API_ORIGIN = 'https://api.elevenlabs.io';
export const API_ENDPOINT = `${API_ORIGIN}/v1/text-to-speech/${PILOT_VOICE_ID}`;

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(root, 'scripts/phoneme-qa-pilot-inventory.json');
const expectedRequestJournalPath = resolve(root, '../dinospace-batch3-quality/tmp/offline-voice-request-state.json');
const expectedProducerLockPath = resolve(root, '../dinospace-batch3-quality/tmp/offline-voice-generator.lock');
const expectedB4ManifestPath = resolve(root, '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js');
const expectedVoiceSourcePath = resolve(root, '../dinospace-batch3-quality/api/voice.js');
const candidateRoot = resolve(root, 'tmp/phoneme-qa-pilot', PILOT_INVENTORY_SHA256);
const outputFormat = 'mp3_44100_128';
const APPROVED_TARGETS = Object.freeze([
  Object.freeze({ id: 'pilot-01-sustained-fricative-s', phoneme: '/s/', ipa: 's', grapheme: 's', outputFile: 'pilot-01-sustained-fricative-s.mp3' }),
  Object.freeze({ id: 'pilot-02-short-vowel-a', phoneme: '/æ/', ipa: 'æ', grapheme: 'a', outputFile: 'pilot-02-short-vowel-a.mp3' }),
  Object.freeze({ id: 'pilot-03-stop-consonant-t', phoneme: '/t/', ipa: 't', grapheme: 't', outputFile: 'pilot-03-stop-consonant-t.mp3' }),
]);

const help = `Isolated three-sound pronunciation experiment (QA candidates only)

Read-only default:
  node scripts/run-phoneme-qa-pilot.mjs --inventory-sha256=${PILOT_INVENTORY_SHA256}

Paid execution requires an explicit later decision and all fixed gates:
  --execute-paid --inventory-sha256=${PILOT_INVENTORY_SHA256}
  --max-calls=3 --max-runs=1
  --request-journal=<exact shared B3 journal>
  --predecessor-status=<terminal, reconciled B4 worker status JSON>

This script has no runtime-asset, manifest, model, voice, output-path, retry,
story, image, or arbitrary-text selector. Its hard ceiling is three API calls.
`;

export function parseArgs(argv) {
  const result = { paid: false, help: false, maxCalls: null, maxRuns: null, maxCallsExplicit: false, maxRunsExplicit: false };
  for (const arg of argv) {
    if (arg === '--execute-paid') { result.paid = true; continue; }
    if (arg === '--help' || arg === '-h') { result.help = true; continue; }
    const match = arg.match(/^--([a-z0-9-]+)=(.*)$/);
    if (!match) throw new Error(`Unexpected argument: ${arg}`);
    const [, name, value] = match;
    if (name === 'inventory-sha256') result.inventorySha256 = value;
    else if (name === 'request-journal') result.requestJournal = value;
    else if (name === 'predecessor-status') result.predecessorStatus = value;
    else if (name === 'max-calls') { result.maxCalls = Number(value); result.maxCallsExplicit = true; }
    else if (name === 'max-runs') { result.maxRuns = Number(value); result.maxRunsExplicit = true; }
    else throw new Error(`Unsupported argument: ${name}`);
  }
  return result;
}

export function validatePaidArgs(args) {
  if (!args.paid) return;
  if (args.inventorySha256 !== PILOT_INVENTORY_SHA256) throw new Error('Paid execution requires the exact pinned three-sound inventory SHA.');
  if (!args.maxCallsExplicit || args.maxCalls !== PILOT_MAX_CALLS) throw new Error('Paid execution requires exactly --max-calls=3.');
  if (!args.maxRunsExplicit || args.maxRuns !== PILOT_MAX_RUNS) throw new Error('Paid execution requires exactly --max-runs=1; retry and repeat runs are disabled.');
  if (!args.requestJournal || !args.predecessorStatus) throw new Error('Paid execution requires the exact shared journal and a terminal reconciled B4 status record.');
  if (Object.keys(args).some((key) => !['paid', 'help', 'maxCalls', 'maxRuns', 'maxCallsExplicit', 'maxRunsExplicit', 'inventorySha256', 'requestJournal', 'predecessorStatus'].includes(key))) {
    throw new Error('Paid execution received unsupported configuration.');
  }
}

function assertPilotItem(item, expected) {
  if (!item || item.id !== expected.id || item.phoneme !== expected.phoneme
    || item.ipa !== expected.ipa || item.grapheme !== expected.grapheme
    || item.outputFile !== expected.outputFile
    || item.ssml !== `<phoneme alphabet="ipa" ph="${expected.ipa}">${expected.grapheme}</phoneme>`) {
    throw new Error('A pilot target does not match the fixed reviewed /s/, /æ/, /t/ set.');
  }
  return item;
}

function assertExactInventory(inventory) {
  if (inventory?.schemaVersion !== 1
    || inventory.experiment !== 'sound-safari-phoneme-qa-pilot-20261004'
    || inventory.language !== 'en'
    || inventory.modelId !== PILOT_MODEL_ID
    || inventory.phonemeAlphabet !== 'ipa'
    || inventory.outputFormat !== outputFormat
    || inventory.maximumProviderRequests !== PILOT_MAX_CALLS
    || inventory.retries !== 0
    || inventory.voice?.id !== PILOT_VOICE_ID
    || inventory.voice?.name !== PILOT_VOICE_NAME
    || !Array.isArray(inventory.items)
    || inventory.items.length !== PILOT_MAX_CALLS) {
    throw new Error('The fixed phoneme experiment inventory has an unexpected shape.');
  }
  const ids = new Set();
  for (const item of inventory.items) {
    if (!item || typeof item.id !== 'string' || ids.has(item.id)
      || typeof item.grapheme !== 'string' || typeof item.ipa !== 'string'
      || typeof item.phoneme !== 'string' || typeof item.ssml !== 'string'
      || !/^pilot-[0-9]{2}-[a-z0-9-]+\.mp3$/.test(item.outputFile)
      || item.ssml !== `<phoneme alphabet="ipa" ph="${item.ipa}">${item.grapheme}</phoneme>`) {
      throw new Error('A pilot target is malformed or has an unsafe candidate output name.');
    }
    ids.add(item.id);
  }
  inventory.items.forEach((item, index) => assertPilotItem(item, APPROVED_TARGETS[index]));
  if (inventory.voice?.sourceRepositoryCommit !== MATILDA_SOURCE_COMMIT) {
    throw new Error('Matilda voice provenance does not match the reviewed source.');
  }
  return inventory;
}

export async function loadPilotInventory(suppliedSha256) {
  if (suppliedSha256 !== PILOT_INVENTORY_SHA256) throw new Error(`Inventory SHA must be ${PILOT_INVENTORY_SHA256}.`);
  const bytes = await readFile(inventoryPath);
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== PILOT_INVENTORY_SHA256) throw new Error(`Pinned pilot inventory changed: got ${actualSha256}.`);
  const inventory = assertExactInventory(JSON.parse(bytes.toString('utf8')));
  await verifyVoiceProvenance(inventory);
  return { inventory, sha256: actualSha256 };
}

export async function verifyVoiceProvenance(inventory) {
  if (inventory.voice?.sourceRepositoryCommit !== MATILDA_SOURCE_COMMIT
    || inventory.voice?.sourcePath !== 'api/voice.js'
    || inventory.voice?.sourceLine !== 6) throw new Error('Matilda provenance does not match the reviewed source location.');
  const voiceSource = await readFile(expectedVoiceSourcePath);
  if (sha256(voiceSource) !== inventory.voice.sourceSha256
    || !voiceSource.toString('utf8').includes(`const DEFAULT_ENGLISH_VOICE_ID = '${PILOT_VOICE_ID}'; // Matilda`)) {
    throw new Error('Matilda provenance source/hash does not match the reviewed pilot inventory.');
  }
  return true;
}

export function buildDryRunPlan(inventory, inventorySha256 = PILOT_INVENTORY_SHA256) {
  assertExactInventory(inventory);
  return Object.freeze({
    mode: 'dry-run',
    readOnly: true,
    inventorySha256,
    modelId: PILOT_MODEL_ID,
    voice: Object.freeze({ name: PILOT_VOICE_NAME, id: PILOT_VOICE_ID }),
    maximumProviderRequests: PILOT_MAX_CALLS,
    maximumResponseBytesPerClip: MAX_AUDIO_BYTES,
    predecessorWorkerPid: B4_WORKER_PID,
    retries: 0,
    candidateDirectory: relative(root, candidateRoot),
    items: Object.freeze(inventory.items.map(({ id, phoneme, ipa, grapheme, ssml, outputFile }) => Object.freeze({ id, phoneme, ipa, grapheme, ssml, outputFile }))),
    note: 'SSML support is documented; isolated phonics-quality sound output is unverified and requires human listening.',
  });
}

export function candidateOutputPath(item) {
  const expected = APPROVED_TARGETS.find((target) => target.id === item?.id);
  if (!expected) throw new Error('Only one of the three pinned experiment targets has an output path.');
  assertPilotItem(item, expected);
  const fullPath = resolve(candidateRoot, expected.outputFile);
  const rel = relative(candidateRoot, fullPath);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Output path escaped the QA-only candidate directory.');
  return fullPath;
}

export function requestPayload(item) {
  const expected = APPROVED_TARGETS.find((target) => target.id === item?.id);
  if (!expected) throw new Error('Only a pinned experiment target may be sent to the provider.');
  assertPilotItem(item, expected);
  return Object.freeze({
    text: item.ssml,
    model_id: PILOT_MODEL_ID,
    voice_settings: Object.freeze({ stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.95 }),
  });
}

export async function requestPhoneme(item, { apiKey, fetchImpl = fetch, timeoutMs = MAX_REQUEST_TIMEOUT_MS }) {
  if (typeof apiKey !== 'string' || apiKey.trim().length < 8) throw new Error('ELEVENLABS_API_KEY is required for explicit paid execution.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_REQUEST_TIMEOUT_MS) throw new Error('Request timeout is outside the reviewed finite bound.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Phoneme QA request timed out.')), timeoutMs);
  try {
    const response = await fetchImpl(`${API_ENDPOINT}?output_format=${outputFormat}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey, Accept: 'audio/mpeg' },
      body: JSON.stringify(requestPayload(item)),
      redirect: 'error',
      signal: controller.signal,
    });
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw Object.assign(new Error(`Provider returned HTTP ${response.status}; no retry will occur.`), { status: response.status, contentType, bytes: 0 });
    }
    if (contentType !== 'audio/mpeg') {
      await response.body?.cancel().catch(() => {});
      throw Object.assign(new Error(`Provider returned unexpected MIME type ${contentType || '(missing)'}; no retry will occur.`), { status: response.status, contentType, bytes: 0 });
    }
    const declaredBytes = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredBytes) && declaredBytes > MAX_AUDIO_BYTES) {
      await response.body?.cancel().catch(() => {});
      throw Object.assign(new Error(`Provider audio exceeded the ${MAX_AUDIO_BYTES}-byte pilot limit; no retry will occur.`), { status: response.status, contentType, bytes: declaredBytes });
    }
    const chunks = [];
    let totalBytes = 0;
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = Buffer.from(value);
          totalBytes += chunk.length;
          if (totalBytes > MAX_AUDIO_BYTES) {
            await reader.cancel();
            throw Object.assign(new Error(`Provider audio exceeded the ${MAX_AUDIO_BYTES}-byte pilot limit; no retry will occur.`), { status: response.status, contentType, bytes: totalBytes });
          }
          chunks.push(chunk);
        }
      } finally {
        reader.releaseLock();
      }
    }
    const bytes = Buffer.concat(chunks, totalBytes);
    if (bytes.length <= 1000) throw Object.assign(new Error(`Provider returned only ${bytes.length} bytes; no retry will occur.`), { status: response.status, contentType, bytes: bytes.length });
    return Object.freeze({ response, bytes, contentType });
  } finally {
    clearTimeout(timer);
  }
}

async function saveJournal(journalPath, journal) {
  const tempPath = `${journalPath}.${process.pid}.phoneme-pilot.tmp`;
  await writeFile(tempPath, `${JSON.stringify({ requests: journal.requests, blockedUntil: journal.blockedUntil }, null, 2)}\n`, { flag: 'wx' });
  await rename(tempPath, journalPath);
}

async function saveAudit(auditPath, audit) {
  await mkdir(dirname(auditPath), { recursive: true });
  const tempPath = `${auditPath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(audit, null, 2)}\n`);
  await rename(tempPath, auditPath);
}

export async function assertLivePredecessorBlocked(statusPath, pidProbe = process.kill.bind(process)) {
  return assertPredecessorFinished(statusPath, expectedB4ManifestPath, pidProbe);
}

export async function executePilot({ args, inventory, inventorySha256, apiKey, fetchImpl = fetch, now = Date.now, pidProbe = process.kill.bind(process) } = {}) {
  validatePaidArgs(args);
  assertExactInventory(inventory);
  if (inventorySha256 !== PILOT_INVENTORY_SHA256) throw new Error('Refusing execution with a non-pinned inventory.');
  await verifyVoiceProvenance(inventory);
  const requestJournalPath = assertJournalPath(args.requestJournal, expectedRequestJournalPath);
  if (await realpath(requestJournalPath) !== await realpath(expectedRequestJournalPath)) throw new Error('Shared request journal resolves through an unexpected path.');
  if (producerLockPathForJournal(requestJournalPath) !== expectedProducerLockPath) throw new Error('Shared journal does not resolve to the canonical B3 producer lock.');
  await assertLivePredecessorBlocked(args.predecessorStatus, pidProbe);
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required; it is never read from or written to the source tree.');

  const heldLock = await acquireProducerLock(requestJournalPath, { pid: process.pid, job: 'phoneme-qa-pilot-20261004', startedAt: new Date(now()).toISOString() });
  const auditPath = resolve(candidateRoot, 'audit.json');
  const audit = {
    experiment: 'sound-safari-phoneme-qa-pilot-20261004',
    inventorySha256,
    mode: 'qa-candidate-only',
    modelId: PILOT_MODEL_ID,
    voice: { name: PILOT_VOICE_NAME, id: PILOT_VOICE_ID, source: 'api/voice.js default English voice; see pinned inventory' },
    maximumProviderRequests: PILOT_MAX_CALLS,
    requestTimeoutMs: MAX_REQUEST_TIMEOUT_MS,
    retries: 0,
    callsAttempted: 0,
    candidatesAccepted: 0,
    acceptedForRuntime: false,
    requests: [],
    postProcessing: { fullDecode: 'not-run', durationSeconds: null, waveformReview: 'not-run', humanListening: 'not-reviewed' },
    failure: null,
    startedAt: new Date(now()).toISOString(),
  };
  let failure = null;
  try {
    let journal = await readRequestJournal(requestJournalPath);
    if (journal.blockedUntil > now()) throw new Error('Shared request cooldown is active; this finite pilot will not wait.');
    if (availableCalls(journal, now()) < PILOT_MAX_CALLS) throw new Error('Shared B3 request budget has fewer than three available calls; refusing a partial pilot.');
    let expectedJournalSha256 = journal.sourceSha256;

    for (const item of inventory.items) {
      await assertLivePredecessorBlocked(args.predecessorStatus, pidProbe);
      await assertJournalSnapshot(requestJournalPath, expectedJournalSha256);
      const freshJournal = await readRequestJournal(requestJournalPath);
      if (freshJournal.sourceSha256 !== expectedJournalSha256) throw new Error('Shared request journal changed outside this run; stopping before the next request.');
      if (availableCalls(freshJournal, now()) < 1) throw new Error('Shared request budget is exhausted; no retry or wait will occur.');

      const attemptedAt = now();
      freshJournal.requests.push({ at: attemptedAt });
      await saveJournal(requestJournalPath, freshJournal);
      expectedJournalSha256 = sha256(await readFile(requestJournalPath));
      audit.callsAttempted += 1;
      const record = {
        id: item.id,
        phoneme: item.phoneme,
        ipa: item.ipa,
        grapheme: item.grapheme,
        exactRequest: { url: `${API_ENDPOINT}?output_format=${outputFormat}`, method: 'POST', body: requestPayload(item) },
        attemptedAt: new Date(attemptedAt).toISOString(),
        httpStatus: null,
        contentType: null,
        bytes: 0,
        sha256: null,
        outputPath: null,
        durationSeconds: null,
        fullDecode: 'not-run',
        waveformReview: 'not-run',
        humanListening: 'not-reviewed',
      };
      audit.requests.push(record);
      let generated;
      try {
        generated = await requestPhoneme(item, { apiKey, fetchImpl });
        record.httpStatus = generated.response.status;
        record.contentType = generated.contentType;
        record.bytes = generated.bytes.length;
      } catch (error) {
        record.httpStatus = Number.isInteger(error.status) ? error.status : null;
        record.contentType = error.contentType || null;
        record.bytes = Number.isInteger(error.bytes) ? error.bytes : 0;
        record.error = error.message;
        if (record.httpStatus === 429) {
          freshJournal.blockedUntil = attemptedAt + RATE_WINDOW_MS;
          await saveJournal(requestJournalPath, freshJournal);
          expectedJournalSha256 = sha256(await readFile(requestJournalPath));
        }
        throw error;
      }

      const outputPath = candidateOutputPath(item);
      await mkdir(candidateRoot, { recursive: true });
      await writeFile(outputPath, generated.bytes, { flag: 'wx' });
      record.sha256 = sha256(generated.bytes);
      record.outputPath = relative(root, outputPath);
      audit.candidatesAccepted += 1;
      console.log(JSON.stringify({ candidate: record.outputPath, bytes: record.bytes, sha256: record.sha256, acceptedForRuntime: false }));
    }
  } catch (error) {
    failure = { name: error.name, message: error.message };
    audit.failure = failure;
    throw error;
  } finally {
    audit.completedAt = new Date(now()).toISOString();
    audit.auditPath = relative(root, auditPath);
    try {
      await saveAudit(auditPath, audit);
    } finally {
      await heldLock.lock.close();
      await rm(heldLock.path, { force: true });
    }
  }
}

export async function main(argv = process.argv.slice(2), environment = process.env) {
  const args = parseArgs(argv);
  if (args.help) { console.log(help); return; }
  if (args.inventorySha256 !== PILOT_INVENTORY_SHA256) throw new Error('Provide the exact pinned --inventory-sha256.');
  const { inventory, sha256: actualSha256 } = await loadPilotInventory(args.inventorySha256);
  if (!args.paid) {
    console.log(JSON.stringify(buildDryRunPlan(inventory, actualSha256), null, 2));
    return;
  }
  validatePaidArgs(args);
  await executePilot({ args, inventory, inventorySha256: actualSha256, apiKey: environment.ELEVENLABS_API_KEY });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`Stopped safely: ${error.message}`); process.exitCode = 1; });
}
