import { createHash } from 'node:crypto';
import { mkdir, open, readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { voiceClipKey, normalizeVoiceText } from '../src/data/voiceKey.js';

export const PINNED_INVENTORY_SHA256 = 'aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227';
export const SUPPLEMENTAL_INVENTORY_SHA256 = '0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd';
export const SUPPLEMENTAL_SOURCE_COMMITS = Object.freeze({
  2: '94d44d031d5835d0d9fa2128064ff83ba5880a62',
  3: 'e2aee30169f6ade67f7948b0088a895a9cb119c3',
});
export const SUPPLEMENTAL_SOURCE_HASHES = Object.freeze({
  'src/data/batch2Narration.js': '979c76771ee751a5a44bb480d910257b05d7148c84eb4f108879efd3df04cc14',
  'src/data/puzzlePopBatch2.js': '74b63dd135836f58a9322f835e1a05411cbff6be49fea007e466dad9ffb59e56',
  'src/data/spotDifferenceBatch2.js': '5f8a2916eb1fad79a7913deae73404eb9155826683279f14b348f4441696b98c',
  'src/data/batch3Narration.js': '8944c5fb6315e7751c15521826d603e4c9d1245503dde17e7c235edbf31a0d33',
  'src/data/dinoDetectiveBatch3.js': '1bf0d3074ad7e3cba4df6ae701eeec22b9b71745017be9112592aa5b9d500749',
  'src/data/voiceKey.js': 'd013e09382520cc4a97e8134171631ade5eb31d39a54d92cc089159dcd95628f',
});
export const B4_SOURCE_COMMIT = 'ac3b3ccaf03107749d865f8d79557e872a06c881';
export const B4_WORKER_PID = 18781;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const REQUEST_LIMIT = 30;
export const MAX_CALLS_PER_RUN = 20;
export const MAX_RUNS = 100;
export const MAX_REQUEST_TIMEOUT_MS = 90_000;
export const VOICE_ORIGIN = 'https://dinospace-eight.vercel.app';
export const VOICE_ENDPOINT = `${VOICE_ORIGIN}/api/voice`;

export const JOBS = Object.freeze({
  'b5-reasoning': Object.freeze({ owner: 'B5_reasoning', label: 'B5 reasoning narration' }),
  'b5-literacy': Object.freeze({ owner: 'B5_literacy', label: 'B5 literacy narration' }),
  b6: Object.freeze({ owner: 'B6', label: 'B6 Amari narration' }),
  'b7-solar': Object.freeze({ owner: 'B7_solar', label: 'B7 Solar narration' }),
  'b7-memory': Object.freeze({ owner: 'B7_memory', label: 'B7 Memory narration' }),
  'b2-supplement': Object.freeze({ ledger: 'supplemental', batch: 2, label: 'B2 released narration supplement' }),
  'b3-dino-facts': Object.freeze({ ledger: 'supplemental', batch: 3, game: 'dino', label: 'B3 revised Dino fact narration' }),
});

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function validateBudgets({ maxCalls, maxRuns, paid }) {
  if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > MAX_CALLS_PER_RUN) {
    throw new Error(`max-calls must be an integer from 1 to ${MAX_CALLS_PER_RUN}.`);
  }
  if (!Number.isInteger(maxRuns) || maxRuns < 1 || maxRuns > MAX_RUNS) {
    throw new Error(`max-runs must be an integer from 1 to ${MAX_RUNS}.`);
  }
  if (paid && (maxCalls === undefined || maxRuns === undefined)) {
    throw new Error('Paid execution requires explicit --max-calls and --max-runs values.');
  }
  return { maxCalls, maxRuns };
}

export async function loadPinnedInventory({ inventoryPath, suppliedSha256, expectedSha256 = PINNED_INVENTORY_SHA256 }) {
  if (suppliedSha256 !== expectedSha256) {
    throw new Error(`Inventory SHA argument must equal reviewed SHA ${expectedSha256}.`);
  }
  const bytes = await readFile(inventoryPath);
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== expectedSha256) {
    throw new Error(`Inventory content SHA mismatch: expected ${expectedSha256}, got ${actualSha256}.`);
  }
  const inventory = JSON.parse(bytes.toString('utf8'));
  const expectedCount = expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256 ? 7 : inventory.items?.length;
  const countIsValid = expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256
    ? inventory.requested === expectedCount
    : inventory.uniqueVoiceKeys === inventory.items?.length;
  if (!Array.isArray(inventory.items) || !countIsValid || inventory.items.length !== expectedCount) {
    throw new Error('Reviewed inventory structure is not the pinned key ledger format.');
  }
  if (expectedSha256 === SUPPLEMENTAL_INVENTORY_SHA256) validateSupplementalProvenance(inventory);
  return { inventory, actualSha256 };
}

export function validateSupplementalProvenance(inventory) {
  const provenance = inventory.provenance || {};
  const expectedPaths = Object.keys(SUPPLEMENTAL_SOURCE_HASHES).sort();
  if (Object.keys(provenance).sort().join('\n') !== expectedPaths.join('\n')) throw new Error('Supplemental ledger source provenance paths changed.');
  for (const path of expectedPaths) {
    const batch = path.includes('batch2') || path.includes('puzzlePopBatch2') || path.includes('spotDifferenceBatch2') || path.includes('voiceKey') ? 2 : 3;
    const expected = provenance[path];
    if (expected.source !== SUPPLEMENTAL_SOURCE_COMMITS[batch] || expected.sha256 !== SUPPLEMENTAL_SOURCE_HASHES[path]) {
      throw new Error(`Supplemental source provenance mismatch for ${path}.`);
    }
  }
  return true;
}

export function selectJobItems(inventory, jobName) {
  const job = JOBS[jobName];
  if (!job) throw new Error(`Unknown job selector. Choose one of: ${Object.keys(JOBS).join(', ')}.`);
  const selected = new Map();
  if (job.ledger === 'supplemental') {
    const records = inventory.items?.filter((entry) => entry.batch === job.batch && (!job.game || entry.game === job.game)) || [];
    const expectedCount = jobName === 'b2-supplement' ? 5 : 2;
    if (records.length !== expectedCount) throw new Error(`${jobName} ledger must contain exactly ${expectedCount} reviewed phrases.`);
    for (const entry of records) {
      if (entry.source !== SUPPLEMENTAL_SOURCE_COMMITS[entry.batch]) throw new Error(`Supplemental source commit mismatch for ${entry.key}.`);
      if (entry.language !== 'en' || entry.voice !== 'matilda') throw new Error(`Supplemental language or voice mismatch for ${entry.key}.`);
      if (entry.key !== voiceClipKey(entry.text, 'en-US')) throw new Error(`Supplemental key does not match its exact reviewed phrase: ${entry.key}.`);
      if (entry.path !== `/audio/en/${entry.key}-matilda.mp3`) throw new Error(`Supplemental output path mismatch for ${entry.key}.`);
      if (entry.mapped !== null || entry.fileBytes !== null) throw new Error(`Supplemental phrase ${entry.key} was not missing at review time; reconcile its exact bytes before scheduling.`);
      if (selected.has(entry.key)) throw new Error(`Duplicate supplemental key ${entry.key}.`);
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: entry.path,
        owners: Object.freeze([`B${entry.batch}_${entry.game}`]),
        expectedCandidateSha256: null,
        sourceCommit: entry.source,
      }));
    }
    return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  for (const entry of inventory.items) {
    if (!entry.owners?.includes(job.owner)) continue;
    const candidates = [entry.text, ...(entry.textVariants || [])];
    for (const text of candidates) {
      if (voiceClipKey(text, 'en-US') !== entry.key) {
        throw new Error(`Voice key does not match reviewed text for ${entry.key}.`);
      }
      if (normalizeVoiceText(text).toLowerCase() !== normalizeVoiceText(entry.text).toLowerCase()) {
        throw new Error(`Text variants do not share the same normalized voice text for ${entry.key}.`);
      }
    }
    if (!selected.has(entry.key)) {
      selected.set(entry.key, Object.freeze({
        key: entry.key,
        text: entry.text,
        path: `/audio/en/${entry.key}-matilda.mp3`,
        owners: Object.freeze([...entry.owners]),
        expectedCandidateSha256: entry.candidateStatus?.[job.owner]?.fileExists
          ? entry.candidateStatus[job.owner].sha256
          : null,
      }));
    }
  }
  if (selected.size === 0) throw new Error(`Reviewed inventory contains no keys for ${jobName}.`);
  return [...selected.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function assertJournalPath(providedPath, expectedPath) {
  if (!providedPath) throw new Error('Paid execution requires explicit --request-journal pointing to the shared journal.');
  if (resolve(providedPath) !== resolve(expectedPath)) {
    throw new Error(`Request journal must be the shared journal at ${resolve(expectedPath)}.`);
  }
  return resolve(providedPath);
}

export function producerLockPathForJournal(journalPath) {
  return resolve(dirname(journalPath), 'offline-voice-generator.lock');
}

export async function acquireProducerLock(journalPath, metadata) {
  const lockPath = producerLockPathForJournal(journalPath);
  await mkdir(dirname(lockPath), { recursive: true });
  const lock = await open(lockPath, 'wx').catch((error) => {
    if (error.code === 'EEXIST') throw new Error(`A voice producer lock exists at ${lockPath}; the shared journal is in use.`);
    throw error;
  });
  await lock.writeFile(`${JSON.stringify(metadata)}\n`);
  return { lock, path: lockPath };
}

export async function readRequestJournal(journalPath) {
  const journalInfo = await stat(journalPath).catch((error) => {
    throw new Error(`Cannot read the explicit shared request journal: ${error.message}`);
  });
  if (!journalInfo.isFile()) throw new Error('Shared request journal must be a regular file.');
  const bytes = await readFile(journalPath);
  const parsed = JSON.parse(bytes.toString('utf8'));
  const now = Date.now();
  if (!parsed || !Array.isArray(parsed.requests) || !Number.isSafeInteger(parsed.blockedUntil)
      || parsed.blockedUntil < 0 || parsed.blockedUntil > now + 60 * 60 * 1000) {
    throw new Error('Shared request journal has an invalid schema; refusing to treat it as empty.');
  }
  for (const request of parsed.requests) {
    if (!Number.isSafeInteger(request?.at) || request.at < 0 || request.at > now + 60_000) {
      throw new Error('Shared request journal has an invalid or future request timestamp.');
    }
  }
  return {
    requests: parsed.requests.filter((request) => now - request.at < RATE_WINDOW_MS),
    blockedUntil: parsed.blockedUntil,
    sourceSha256: sha256(bytes),
  };
}

export async function assertJournalSnapshot(journalPath, expectedSha256) {
  const currentSha256 = sha256(await readFile(journalPath));
  if (currentSha256 !== expectedSha256) {
    throw new Error('Shared request journal changed outside this run; stopping before the next request.');
  }
  return currentSha256;
}

export function availableCalls(journal, now = Date.now()) {
  if (journal.blockedUntil > now) return 0;
  return Math.max(0, REQUEST_LIMIT - journal.requests.filter((item) => now - item.at < RATE_WINDOW_MS).length);
}

export function assertTerminalPredecessorRecord(record, { expectedB4ManifestSha256, now = Date.now() }) {
  if (!record || record.workerPid !== B4_WORKER_PID) throw new Error(`Predecessor status must identify B4 worker PID ${B4_WORKER_PID}.`);
  if (record.sourceCommit !== B4_SOURCE_COMMIT) throw new Error('Predecessor status must identify the reviewed B4 source commit.');
  if (!['completed', 'failed', 'stopped_error'].includes(record.status) || record.terminal !== true || record.reconciled !== true) {
    throw new Error('B4 predecessor status must be terminal and reconciled after its final inventory pass.');
  }
  if (!Number.isInteger(record.exitCode) || !Number.isFinite(Date.parse(record.finishedAt)) || Date.parse(record.finishedAt) > now) {
    throw new Error('B4 predecessor status needs a completed timestamp and integer exit code.');
  }
  if (!/^[a-f0-9]{64}$/i.test(record.finalManifestSha256 || '') || record.finalManifestSha256 !== expectedB4ManifestSha256) {
    throw new Error('B4 predecessor status manifest SHA does not match the current reconciled B4 manifest.');
  }
  return true;
}

export async function assertPredecessorFinished(statusPath, expectedManifestPath, pidProbe = process.kill.bind(process)) {
  if (!statusPath) throw new Error('Paid execution requires explicit --predecessor-status from the terminal B4 run.');
  const record = JSON.parse(await readFile(statusPath, 'utf8'));
  const manifestPath = resolve(expectedManifestPath);
  if (resolve(record.finalManifestPath || '') !== manifestPath) {
    throw new Error(`Predecessor status must name the current B4 manifest path ${manifestPath}.`);
  }
  let isAlive = false;
  try { pidProbe(record.workerPid, 0); isAlive = true; }
  catch (error) { if (error.code !== 'ESRCH') throw new Error(`Cannot verify predecessor PID state: ${error.message}`); }
  if (isAlive) throw new Error(`B4 predecessor PID ${record.workerPid} is still live; refusing paid execution.`);
  const manifestBytes = await readFile(manifestPath);
  assertTerminalPredecessorRecord(record, { expectedB4ManifestSha256: sha256(manifestBytes) });
  return record;
}

export async function getCandidateReusablePath(root, manifest, item) {
  const packagedPath = manifest instanceof Map ? manifest.get(item.key) : manifest[item.key];
  for (const candidate of new Set([packagedPath, item.path].filter(Boolean))) {
    if (candidate !== item.path || !candidate.startsWith('/audio/en/') || candidate.includes('..')) continue;
    try {
      const filePath = resolve(root, 'public', candidate.slice(1));
      const info = await stat(filePath);
      if (!info.isFile() || info.size <= 1000 || !item.expectedCandidateSha256) continue;
      if (sha256(await readFile(filePath)) === item.expectedCandidateSha256) return candidate;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return null;
}

export async function isCandidateReusable(root, manifest, item, receipt = null, expectedInventorySha256 = PINNED_INVENTORY_SHA256) {
  const receiptMatches = receipt
    && receipt.inventorySha256 === expectedInventorySha256
    && receipt.producer === 'reviewedNarrationSupervisorV1'
    && receipt.key === item.key
    && receipt.path === item.path
    && receipt.sourceCommit === (item.sourceCommit || null)
    && receipt.voice === 'matilda'
    && receipt.contentType === 'audio/mpeg'
    && Number.isSafeInteger(receipt.bytes) && receipt.bytes > 1000
    && receipt.textSha256 === sha256(Buffer.from(item.text, 'utf8'))
    && /^[a-f0-9]{64}$/.test(receipt.audioSha256 || '');
  if (receiptMatches) {
    try {
      const filePath = resolve(root, 'public', item.path.slice(1));
      const info = await stat(filePath);
      if (info.isFile() && info.size > 1000 && sha256(await readFile(filePath)) === receipt.audioSha256) return item.path;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return getCandidateReusablePath(root, manifest, item);
}

export async function isPackagedCandidate(root, manifest, item, receipt = null, expectedInventorySha256 = PINNED_INVENTORY_SHA256) {
  const packagedPath = manifest instanceof Map ? manifest.get(item.key) : manifest[item.key];
  return Boolean(packagedPath && (await isCandidateReusable(root, manifest, item, receipt, expectedInventorySha256)) === packagedPath);
}

export async function requestNarration(item, fetchImpl = fetch, timeoutMs = MAX_REQUEST_TIMEOUT_MS) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_REQUEST_TIMEOUT_MS) {
    throw new Error(`Request timeout must be from 1 to ${MAX_REQUEST_TIMEOUT_MS} milliseconds.`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('Narration request timed out.')), timeoutMs);
  try {
    const response = await fetchImpl(VOICE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: VOICE_ORIGIN },
      body: JSON.stringify({ text: item.text, language: 'en' }),
      signal: controller.signal,
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    return { response, bytes };
  } finally {
    clearTimeout(timeout);
  }
}
