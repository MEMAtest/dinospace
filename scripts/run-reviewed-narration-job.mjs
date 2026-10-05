import { mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { applyB4GrammarReviewedReuse, assertB4GrammarExactMappings } from './b4GrammarReviewedReuse.mjs';
import {
  B4_GRAMMAR_INVENTORY_SHA256, B5_SOUND_SAFARI_INVENTORY_SHA256, B5_SOUND_SAFARI_MAX_CALLS_PER_RUN, B5_SOUND_SAFARI_MAX_RUNS, B5_SOUND_SAFARI_REQUEST_LIMIT, B7_MEMORY_CURRENT_INVENTORY_SHA256, B7_MEMORY_CURRENT_MAX_CALLS_PER_RUN, B7_MEMORY_CURRENT_MAX_RUNS, B7_MEMORY_CURRENT_REQUEST_LIMIT, B7_SOLAR_TEACHING_INVENTORY_SHA256, B7_SOLAR_TEACHING_REQUEST_LIMIT, JOBS, PINNED_INVENTORY_SHA256, RATE_WINDOW_MS, SUPPLEMENTAL_INVENTORY_SHA256,
  acquireProducerLock, assertJournalPath, assertJournalSnapshot, assertPredecessorFinished, b5SoundSafariAllowedPendingKeys, b7MemoryCurrentAllowedPendingKeys, claimB5SoundSafariAttempt, claimB5SoundSafariRunWhenPending, claimB7MemoryCurrentAttempt, claimB7MemoryCurrentRun as updateB7MemoryCurrentRun, claimB7SolarTeachingAttempt, claimB7SolarTeachingRun,
  availableCalls, classifyB5SoundSafariGenerationWork, isCandidateReusable, isPackagedCandidate, loadPinnedInventory, readRequestJournal,
  requestNarration, selectJobItems, sha256, validateB5SoundSafariBudgetState, validateB5SoundSafariExecutionCaps, validateB7MemoryCurrentBudgetState, validateB7MemoryCurrentExecutionCaps, validateB7SolarTeachingBudgetState, validateB7SolarTeachingExecutionCaps, validateBudgets,
} from './reviewedNarrationJobs.mjs';

const root = resolve(import.meta.dirname, '..');
const batch5To7InventoryPath = resolve(root, 'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json');
const supplementalInventoryPath = resolve(root, 'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json');
const b4GrammarInventoryPath = resolve(root, 'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json');
const b7SolarTeachingInventoryPath = resolve(root, 'docs/qa-evidence/b7-solar-teaching-narration-jobs-20261004.json');
const b7MemoryCurrentInventoryPath = resolve(root, 'docs/qa-evidence/b7-memory-narration-ledger-20261005/ledger.json');
const b5SoundSafariInventoryPath = resolve(root, 'docs/qa-evidence/b5-sound-safari-narration-ledger-20261005/successor-c636516/ledger.json');
const manifestPath = resolve(root, 'src/data/offlineVoiceManifest.js');
const expectedJournalPath = resolve(root, '../dinospace-batch3-quality/tmp/offline-voice-request-state.json');
const expectedB4ManifestPath = resolve(root, '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js');

function parseArgs(argv) {
  const result = { paid: false, help: false, maxCalls: 20, maxRuns: 1, maxCallsExplicit: false, maxRunsExplicit: false };
  for (const arg of argv) {
    if (arg === '--execute-paid') { result.paid = true; continue; }
    if (arg === '--help' || arg === '-h') { result.help = true; continue; }
    const match = arg.match(/^--([a-z0-9-]+)=(.*)$/);
    if (!match) throw new Error(`Unexpected argument: ${arg}`);
    const [, name, value] = match;
    if (name === 'max-calls') { result.maxCalls = Number(value); result.maxCallsExplicit = true; }
    else if (name === 'max-runs') { result.maxRuns = Number(value); result.maxRunsExplicit = true; }
    else if (name === 'max-total-calls') { result.maxTotalCalls = Number(value); result.maxTotalCallsExplicit = true; }
    else if (['job', 'inventory-sha256', 'request-journal', 'predecessor-status'].includes(name)) result[name] = value;
    else throw new Error(`Unsupported argument: ${name}`);
  }
  return result;
}

const help = `Reviewed narration job packager

Read-only default (B5–B7):
  node scripts/run-reviewed-narration-job.mjs --job=<b5-reasoning|b5-literacy|b5-sound-safari-literacy|b6|b7-solar|b7-memory> --inventory-sha256=${PINNED_INVENTORY_SHA256}

Read-only default (source-bound B5 Sound Safari/literacy successor ledger):
  node scripts/run-reviewed-narration-job.mjs --job=b5-sound-safari-literacy --inventory-sha256=${B5_SOUND_SAFARI_INVENTORY_SHA256}

Read-only default (source-bound B7 Solar teaching-copy update):
  node scripts/run-reviewed-narration-job.mjs --job=b7-solar-teaching --inventory-sha256=${B7_SOLAR_TEACHING_INVENTORY_SHA256}

Read-only default (source-bound current B7 Memory narration):
  node scripts/run-reviewed-narration-job.mjs --job=b7-memory-current --inventory-sha256=${B7_MEMORY_CURRENT_INVENTORY_SHA256}

Read-only default (supplemental B2/B3):
  node scripts/run-reviewed-narration-job.mjs --job=<b2-supplement|b3-dino-facts> --inventory-sha256=${SUPPLEMENTAL_INVENTORY_SHA256}

Read-only default (B4 grammar corrections):
  node scripts/run-reviewed-narration-job.mjs --job=b4-grammar --inventory-sha256=${B4_GRAMMAR_INVENTORY_SHA256}

Paid voice execution requires all of:
  --execute-paid --max-calls=1..20 --max-runs=1..100
  --request-journal=<the shared B3 request journal>
  --predecessor-status=<terminal, reconciled B4 status JSON>

The only endpoint is the reviewed voice endpoint. There is no story, image, or arbitrary-text selector.
`;

function absolutePublicPath(publicPath) {
  if (!publicPath.startsWith('/audio/en/') || publicPath.includes('..')) throw new Error(`Refusing non-English narration path: ${publicPath}`);
  return resolve(root, 'public', publicPath.slice(1));
}

async function writeManifest(manifest) {
  const ordered = Object.fromEntries([...manifest.entries()].sort(([a], [b]) => a.localeCompare(b)));
  const temp = `${manifestPath}.${process.pid}.tmp`;
  await writeFile(temp, `// Generated by scripts/run-reviewed-narration-job.mjs; source inventory SHA is pinned.\nexport const OFFLINE_VOICE_MANIFEST = ${JSON.stringify(ordered, null, 2)};\n`);
  await rename(temp, manifestPath);
}

async function readManifest() {
  const bytes = await readFile(manifestPath);
  const source = bytes.toString('utf8');
  const match = source.match(/export const OFFLINE_VOICE_MANIFEST = (\{[\s\S]*\});\s*$/);
  if (!match) throw new Error('Could not parse the current offline voice manifest; refusing to overwrite it.');
  const object = JSON.parse(match[1]);
  if (!object || Array.isArray(object) || typeof object !== 'object') throw new Error('Offline voice manifest has an invalid object shape.');
  return { manifest: new Map(Object.entries(object)), sha256: sha256(bytes) };
}

function provenancePathFor(inventorySha256) {
  if (!/^[a-f0-9]{64}$/.test(inventorySha256)) throw new Error('Refusing invalid inventory SHA for narration receipt path.');
  return resolve(root, `tmp/reviewed-narration-provenance-${inventorySha256}.json`);
}

async function readProvenance(inventorySha256) {
  const provenancePath = provenancePathFor(inventorySha256);
  try {
    const parsed = JSON.parse(await readFile(provenancePath, 'utf8'));
    if (parsed.inventorySha256 !== inventorySha256 || !parsed.entries || typeof parsed.entries !== 'object' || Array.isArray(parsed.entries)) {
      throw new Error('Narration provenance receipt does not match the pinned inventory.');
    }
    return new Map(Object.entries(parsed.entries));
  } catch (error) {
    if (error.code === 'ENOENT') return new Map();
    throw error;
  }
}

async function writeProvenance(receipts, inventorySha256) {
  const provenancePath = provenancePathFor(inventorySha256);
  await mkdir(dirname(provenancePath), { recursive: true });
  const temp = `${provenancePath}.${process.pid}.tmp`;
  const entries = Object.fromEntries([...receipts.entries()].sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(temp, `${JSON.stringify({ inventorySha256, entries }, null, 2)}\n`);
  await rename(temp, provenancePath);
}

function b7BudgetPath(inventorySha256) {
  return resolve(root, `tmp/reviewed-narration-b7-budget-${inventorySha256}.json`);
}

async function readB7Budget(inventorySha256, allowedKeys) {
  try {
    const state = JSON.parse(await readFile(b7BudgetPath(inventorySha256), 'utf8'));
    validateB7SolarTeachingBudgetState(state, inventorySha256, allowedKeys);
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') return { inventorySha256, attemptedKeys: [], runs: 0 };
    throw error;
  }
}

async function writeB7Budget(inventorySha256, state) {
  validateB7SolarTeachingBudgetState(state, inventorySha256);
  const path = b7BudgetPath(inventorySha256);
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`);
  await rename(temp, path);
}

function b5SoundSafariBudgetPath(inventorySha256) {
  return resolve(root, `tmp/reviewed-narration-b5-sound-safari-budget-${inventorySha256}.json`);
}

async function readB5SoundSafariBudget(inventorySha256, allowedKeys) {
  try {
    const state = JSON.parse(await readFile(b5SoundSafariBudgetPath(inventorySha256), 'utf8'));
    validateB5SoundSafariBudgetState(state, inventorySha256, allowedKeys);
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') return { inventorySha256, attemptedKeys: [], runs: 0 };
    throw error;
  }
}

async function writeB5SoundSafariBudget(inventorySha256, state, allowedKeys) {
  validateB5SoundSafariBudgetState(state, inventorySha256, allowedKeys);
  const path = b5SoundSafariBudgetPath(inventorySha256);
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`);
  await rename(temp, path);
}

async function claimB5SoundSafariRun(inventorySha256, budget, allowedKeys, pendingCount) {
  const next = claimB5SoundSafariRunWhenPending(budget, pendingCount, allowedKeys);
  if (next === budget) return false;
  Object.assign(budget, next);
  await writeB5SoundSafariBudget(inventorySha256, budget, allowedKeys);
  return true;
}

async function claimB5SoundSafariKey(inventorySha256, budget, key, allowedKeys) {
  const next = claimB5SoundSafariAttempt(budget, key, allowedKeys);
  Object.assign(budget, next);
  await writeB5SoundSafariBudget(inventorySha256, budget, allowedKeys);
}

async function claimB7Run(inventorySha256, budget) {
  const next = claimB7SolarTeachingRun(budget);
  Object.assign(budget, next);
  await writeB7Budget(inventorySha256, budget);
}

async function claimB7Attempt(inventorySha256, budget, key) {
  const next = claimB7SolarTeachingAttempt(budget, key);
  Object.assign(budget, next);
  await writeB7Budget(inventorySha256, budget);
}

function b7MemoryCurrentBudgetPath(inventorySha256) {
  return resolve(root, `tmp/reviewed-narration-b7-memory-budget-${inventorySha256}.json`);
}

async function readB7MemoryCurrentBudget(inventorySha256, allowedKeys) {
  try {
    const state = JSON.parse(await readFile(b7MemoryCurrentBudgetPath(inventorySha256), 'utf8'));
    validateB7MemoryCurrentBudgetState(state, inventorySha256, allowedKeys);
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') return { inventorySha256, attemptedKeys: [], runs: 0 };
    throw error;
  }
}

async function writeB7MemoryCurrentBudget(inventorySha256, state, allowedKeys) {
  validateB7MemoryCurrentBudgetState(state, inventorySha256, allowedKeys);
  const path = b7MemoryCurrentBudgetPath(inventorySha256);
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`);
  await rename(temp, path);
}

async function claimB7MemoryCurrentRun(inventorySha256, budget, pendingCount, allowedKeys) {
  if (pendingCount === 0) return false;
  const next = updateB7MemoryCurrentRun(budget);
  Object.assign(budget, next);
  await writeB7MemoryCurrentBudget(inventorySha256, budget, allowedKeys);
  return true;
}

async function claimB7MemoryCurrentKey(inventorySha256, budget, key, allowedKeys) {
  const next = claimB7MemoryCurrentAttempt(budget, key, allowedKeys);
  Object.assign(budget, next);
  await writeB7MemoryCurrentBudget(inventorySha256, budget, allowedKeys);
}

async function saveJournal(journalPath, journal) {
  const temp = `${journalPath}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify({ requests: journal.requests, blockedUntil: journal.blockedUntil }, null, 2)}\n`);
  await rename(temp, journalPath);
}

async function writeAudit(auditPath, audit) {
  await mkdir(dirname(auditPath), { recursive: true });
  await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
}

async function execute(args, items, manifest, journalPath, auditPath, manifestBeforeSha256, initialReady, inventorySha256) {
  const heldLock = await acquireProducerLock(journalPath, { pid: process.pid, job: args.job, startedAt: new Date().toISOString() });
  const changedFiles = [];
  const manifestChangedKeys = [];
  let stopReason = null;
  let runs = 0;
  let generated = 0;
  let reused = initialReady;
  let providerRequestsAttempted = 0;
  let providerResponsesAccepted = 0;
  let auditFailure = null;
  let receipts = new Map();
  let b7Budget = { inventorySha256, attemptedKeys: [], runs: 0 };
  let b7MemoryCurrentBudget = { inventorySha256, attemptedKeys: [], runs: 0 };
  let b5SoundSafariBudget = { inventorySha256, attemptedKeys: [], runs: 0 };
  const b5AllowedKeys = args.job === 'b5-sound-safari-literacy' ? b5SoundSafariAllowedPendingKeys(items) : null;
  const b7MemoryAllowedKeys = args.job === 'b7-memory-current' ? b7MemoryCurrentAllowedPendingKeys(items) : null;
  try {
    if (args.job === 'b7-solar-teaching') {
      const allowedKeys = new Set(items.filter((item) => !item.expectedCandidateSha256).map((item) => item.key));
      b7Budget = await readB7Budget(inventorySha256, allowedKeys);
    }
    if (args.job === 'b5-sound-safari-literacy') {
      b5SoundSafariBudget = await readB5SoundSafariBudget(inventorySha256, b5AllowedKeys);
    }
    if (args.job === 'b7-memory-current') {
      b7MemoryCurrentBudget = await readB7MemoryCurrentBudget(inventorySha256, b7MemoryAllowedKeys);
    }
    receipts = await readProvenance(inventorySha256);
    const currentManifest = await readManifest();
    if (currentManifest.sha256 !== manifestBeforeSha256) {
      throw new Error('Candidate voice manifest changed after preflight; refusing to overwrite concurrent work.');
    }
    let journal = await readRequestJournal(journalPath);
    let expectedJournalSha256 = journal.sourceSha256;
    let pending = [];
    while (runs < args.maxRuns) {
      await assertPredecessorFinished(args['predecessor-status'], expectedB4ManifestPath);
      pending = [];
      if (args.job === 'b5-sound-safari-literacy') {
        const work = await classifyB5SoundSafariGenerationWork(root, items, manifest, receipts, inventorySha256, b5SoundSafariBudget.attemptedKeys);
        let manifestNeedsWrite = false;
        for (const [key, reusablePath] of work.reusablePaths) {
          if (manifest.get(key) !== reusablePath) {
            manifest.set(key, reusablePath);
            manifestChangedKeys.push(key);
            manifestNeedsWrite = true;
          }
        }
        if (manifestNeedsWrite) await writeManifest(manifest);
        pending.push(...work.generationPending);
      } else if (args.job === 'b4-grammar') {
        // Repair verified mappings before considering any paid run or capacity.
        let manifestNeedsWrite = false;
        for (const item of items) {
          const reusablePath = await isCandidateReusable(root, manifest, item, receipts.get(item.key), inventorySha256);
          if (!reusablePath) pending.push(item);
          else if (manifest.get(item.key) !== reusablePath) {
            manifest.set(item.key, reusablePath);
            manifestChangedKeys.push(item.key);
            reused += 1;
            manifestNeedsWrite = true;
          }
        }
        if (manifestNeedsWrite) await writeManifest(manifest);
      } else {
        for (const item of items) {
          const attemptedKeys = args.job === 'b7-solar-teaching' ? b7Budget.attemptedKeys
            : args.job === 'b7-memory-current' ? b7MemoryCurrentBudget.attemptedKeys : [];
          if (attemptedKeys.includes(item.key)) continue;
          if (!(await isPackagedCandidate(root, manifest, item, receipts.get(item.key), inventorySha256))) pending.push(item);
        }
      }
      if (!pending.length) break;
      let capacity = availableCalls(journal);
      const remainingInvocationBudget = args.job === 'b7-solar-teaching' ? args.maxTotalCalls - providerRequestsAttempted
        : args.job === 'b7-memory-current' ? Math.min(args.maxTotalCalls - providerRequestsAttempted, B7_MEMORY_CURRENT_REQUEST_LIMIT - b7MemoryCurrentBudget.attemptedKeys.length)
        : args.job === 'b5-sound-safari-literacy' ? args.maxTotalCalls - b5SoundSafariBudget.attemptedKeys.length
          : Infinity;
      if (remainingInvocationBudget <= 0) {
        stopReason = args.job === 'b5-sound-safari-literacy'
          ? 'Configured B5 Sound Safari unique-request cap reached; no retry was attempted.'
          : 'Configured B7 Solar teaching invocation cap reached; no retry was attempted.';
        break;
      }
      if (args.job === 'b7-solar-teaching' && b7Budget.runs >= 6) {
        stopReason = 'B7 Solar teaching six-run cap is exhausted; no retry was attempted.';
        break;
      }
      if (args.job === 'b7-memory-current' && b7MemoryCurrentBudget.runs >= B7_MEMORY_CURRENT_MAX_RUNS) {
        stopReason = 'B7 Memory nineteen-run cap is exhausted; no retry was attempted.';
        break;
      }
      if (args.job === 'b5-sound-safari-literacy' && b5SoundSafariBudget.runs >= B5_SOUND_SAFARI_MAX_RUNS) {
        stopReason = 'B5 Sound Safari 43-run cap is exhausted; no retry was attempted.';
        break;
      }
      const selectorRunCap = args.job === 'b5-sound-safari-literacy' ? B5_SOUND_SAFARI_MAX_CALLS_PER_RUN : 10;
      const targetCapacity = Math.min(selectorRunCap, args.maxCalls, pending.length, remainingInvocationBudget);
      while (capacity < targetCapacity) {
        const now = Date.now();
        if (journal.blockedUntil > now) await new Promise((resolveDelay) => setTimeout(resolveDelay, journal.blockedUntil - now + 1000));
        else {
          const expiries = journal.requests.map((request) => request.at + RATE_WINDOW_MS).sort((a, b) => a - b);
          const needed = targetCapacity - capacity;
          const waitUntil = expiries[needed - 1];
          if (!Number.isFinite(waitUntil)) throw new Error('Request journal reports no available calls without enough finite expiries; refusing to wait indefinitely.');
          await new Promise((resolveDelay) => setTimeout(resolveDelay, Math.max(1000, waitUntil - Date.now() + 1000)));
        }
        journal = await readRequestJournal(journalPath);
        capacity = availableCalls(journal);
      }
      runs += 1;
      if (args.job === 'b7-solar-teaching') await claimB7Run(inventorySha256, b7Budget);
      if (args.job === 'b7-memory-current') await claimB7MemoryCurrentRun(inventorySha256, b7MemoryCurrentBudget, pending.length, b7MemoryAllowedKeys);
      if (args.job === 'b5-sound-safari-literacy') await claimB5SoundSafariRun(inventorySha256, b5SoundSafariBudget, b5AllowedKeys, pending.length);
      const runBudget = Math.min(selectorRunCap, args.maxCalls, capacity, remainingInvocationBudget);
      let usedThisRun = 0;
      let reusedThisRun = 0;
      for (const item of pending) {
        if (usedThisRun >= runBudget) break;
        const reusablePath = await isCandidateReusable(root, manifest, item, receipts.get(item.key), inventorySha256);
        if (reusablePath) {
          if (manifest.get(item.key) !== reusablePath) {
            manifest.set(item.key, reusablePath);
            await writeManifest(manifest);
            manifestChangedKeys.push(item.key);
            reused += 1;
            reusedThisRun += 1;
          }
          continue;
        }
        const outputPath = absolutePublicPath(item.path);
        const existingBeforeRequest = await readFile(outputPath).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (existingBeforeRequest) {
          const existingHash = sha256(existingBeforeRequest);
          const priorReceipt = receipts.get(item.key);
          if (existingHash !== item.expectedCandidateSha256 && existingHash !== priorReceipt?.audioSha256) {
            throw new Error(`Refusing to overwrite existing audio with unknown provenance: ${item.path}.`);
          }
        }
        await assertPredecessorFinished(args['predecessor-status'], expectedB4ManifestPath);
        await assertJournalSnapshot(journalPath, expectedJournalSha256);
        const freshJournal = await readRequestJournal(journalPath);
        if (freshJournal.sourceSha256 !== expectedJournalSha256) {
          throw new Error('Shared request journal changed outside this run; stopping before the next request.');
        }
        journal = freshJournal;
        if (args.job === 'b7-solar-teaching') await claimB7Attempt(inventorySha256, b7Budget, item.key);
        if (args.job === 'b7-memory-current') await claimB7MemoryCurrentKey(inventorySha256, b7MemoryCurrentBudget, item.key, b7MemoryAllowedKeys);
        if (args.job === 'b5-sound-safari-literacy') await claimB5SoundSafariKey(inventorySha256, b5SoundSafariBudget, item.key, b5AllowedKeys);
        journal.requests.push({ at: Date.now() });
        await saveJournal(journalPath, journal);
        expectedJournalSha256 = sha256(await readFile(journalPath));
        usedThisRun += 1;
        providerRequestsAttempted += 1;
        const { response, bytes } = await requestNarration(item);
        if (response.status === 204 || response.status === 429) {
          journal.blockedUntil = Date.now() + RATE_WINDOW_MS;
          await saveJournal(journalPath, journal);
          stopReason = `HTTP ${response.status}; no retry was attempted.`;
          break;
        }
        if (!response.ok) { stopReason = `HTTP ${response.status}; no retry was attempted.`; break; }
        if (response.headers.get('x-amari-voice-provider') !== 'elevenlabs') { stopReason = 'Provider header was not verified; response discarded.'; break; }
        if ((response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() !== 'audio/mpeg') { stopReason = 'MIME type was not audio/mpeg; response discarded.'; break; }
        if (bytes.length <= 1000) { stopReason = 'Audio response was too small; response discarded.'; break; }
        const existing = await readFile(outputPath).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (existing) {
          const oldHash = sha256(existing);
          const priorReceipt = receipts.get(item.key);
          const expectedLedgerHash = item.expectedCandidateSha256;
          if (oldHash !== expectedLedgerHash && oldHash !== priorReceipt?.audioSha256) {
            throw new Error(`Refusing to overwrite existing audio with unknown provenance: ${item.path}.`);
          }
        }
        await mkdir(dirname(outputPath), { recursive: true });
        const tempOutput = `${outputPath}.${process.pid}.tmp`;
        await writeFile(tempOutput, bytes);
        await rename(tempOutput, outputPath);
        const audioSha256 = sha256(bytes);
        const receipt = { producer: 'reviewedNarrationSupervisorV1', inventorySha256, key: item.key, path: item.path, sourceCommit: item.sourceCommit || null, textSha256: sha256(Buffer.from(item.text, 'utf8')), voice: 'matilda', audioSha256, bytes: bytes.length, contentType: 'audio/mpeg', generatedAt: new Date().toISOString() };
        receipts.set(item.key, receipt);
        await writeProvenance(receipts, inventorySha256);
        manifest.set(item.key, item.path);
        await writeManifest(manifest);
        changedFiles.push({ path: item.path, key: item.key, text: item.text, owners: item.owners, sourceCommit: item.sourceCommit || null, bytes: bytes.length, sha256: audioSha256 });
        manifestChangedKeys.push(item.key);
        generated += 1;
        providerResponsesAccepted += 1;
      }
      if (stopReason) break;
      if (usedThisRun === 0 && reusedThisRun === 0 && pending.length) throw new Error('No progress in a finite run; stopping safely.');
    }
    pending = [];
    for (const item of items) {
      if (!(await isPackagedCandidate(root, manifest, item, receipts.get(item.key), inventorySha256))) pending.push(item.key);
    }
    if (args.job === 'b7-solar-teaching' && b7Budget.attemptedKeys.length > 0) {
      const failedAttempted = pending.filter((key) => b7Budget.attemptedKeys.includes(key));
      if (failedAttempted.length && !stopReason) stopReason = `Previously attempted B7 Solar teaching keys remain unavailable; automatic retry was refused (${failedAttempted.length}).`;
    }
    if (args.job === 'b5-sound-safari-literacy' && b5SoundSafariBudget.attemptedKeys.length > 0) {
      const failedAttempted = pending.filter((key) => b5SoundSafariBudget.attemptedKeys.includes(key));
      if (failedAttempted.length && !stopReason) stopReason = `Previously attempted B5 Sound Safari keys remain unavailable; automatic retry was refused (${failedAttempted.length}).`;
    }
    if (args.job === 'b7-memory-current' && b7MemoryCurrentBudget.attemptedKeys.length > 0) {
      const failedAttempted = pending.filter((key) => b7MemoryCurrentBudget.attemptedKeys.includes(key));
      if (failedAttempted.length && !stopReason) stopReason = `Previously attempted B7 Memory keys remain unavailable; automatic retry was refused (${failedAttempted.length}).`;
    }
    const manifestAfterSha256 = sha256(await readFile(manifestPath));
    const summary = { job: args.job, inventorySha256, requested: items.length, runs, generated, reused, candidateReusableAtEnd: items.length - pending.length, pendingKeys: pending.length, configuredTotalCallCap: ['b7-solar-teaching', 'b7-memory-current', 'b5-sound-safari-literacy'].includes(args.job) ? args.maxTotalCalls : null, b7AttemptedCount: args.job === 'b7-solar-teaching' ? b7Budget.attemptedKeys.length : null, b7CumulativeRunCount: args.job === 'b7-solar-teaching' ? b7Budget.runs : null, b7MemoryAttemptedCount: args.job === 'b7-memory-current' ? b7MemoryCurrentBudget.attemptedKeys.length : null, b7MemoryCumulativeRunCount: args.job === 'b7-memory-current' ? b7MemoryCurrentBudget.runs : null, b5SoundSafariAttemptedCount: args.job === 'b5-sound-safari-literacy' ? b5SoundSafariBudget.attemptedKeys.length : null, b5SoundSafariCumulativeRunCount: args.job === 'b5-sound-safari-literacy' ? b5SoundSafariBudget.runs : null, stoppedAt: stopReason, manifestBeforeSha256, manifestAfterSha256, manifestChangedKeys, changedFiles, auditPath };
    console.log(JSON.stringify(summary, null, 2));
    if (stopReason || pending.length) process.exitCode = stopReason ? 1 : 2;
  } catch (error) {
    auditFailure = { message: error.message, name: error.name };
    throw error;
  } finally {
    const manifestAfterSha256 = await readFile(manifestPath).then(sha256).catch(() => null);
    try {
      await writeAudit(auditPath, {
      job: args.job,
      inventorySha256,
      requested: items.length,
      configuredMaxCallsPerRun: args.maxCalls,
      configuredMaxRuns: args.maxRuns,
      maximumProviderRequests: args.job === 'b7-solar-teaching' ? Math.min(args.maxCalls * args.maxRuns, args.maxTotalCalls, B7_SOLAR_TEACHING_REQUEST_LIMIT)
        : args.job === 'b7-memory-current' ? Math.min(args.maxCalls * args.maxRuns, args.maxTotalCalls, B7_MEMORY_CURRENT_REQUEST_LIMIT)
        : args.job === 'b5-sound-safari-literacy' ? Math.min(args.maxCalls * args.maxRuns, args.maxTotalCalls, B5_SOUND_SAFARI_REQUEST_LIMIT)
          : args.maxCalls * args.maxRuns,
      configuredTotalCallCap: ['b7-solar-teaching', 'b7-memory-current', 'b5-sound-safari-literacy'].includes(args.job) ? args.maxTotalCalls : null,
      b7AttemptedCount: args.job === 'b7-solar-teaching' ? b7Budget.attemptedKeys.length : null,
      b7CumulativeRunCount: args.job === 'b7-solar-teaching' ? b7Budget.runs : null,
      b7MemoryAttemptedCount: args.job === 'b7-memory-current' ? b7MemoryCurrentBudget.attemptedKeys.length : null,
      b7MemoryCumulativeRunCount: args.job === 'b7-memory-current' ? b7MemoryCurrentBudget.runs : null,
      b5SoundSafariAttemptedCount: args.job === 'b5-sound-safari-literacy' ? b5SoundSafariBudget.attemptedKeys.length : null,
      b5SoundSafariCumulativeRunCount: args.job === 'b5-sound-safari-literacy' ? b5SoundSafariBudget.runs : null,
      runs,
      providerRequestsAttempted,
      providerResponsesAccepted,
      generated,
      reused,
      stoppedAt: stopReason,
      failure: auditFailure,
      manifestBeforeSha256,
      manifestAfterSha256,
      auditPath,
      manifestChangedKeys,
      changedFiles,
      completedAt: new Date().toISOString(),
      });
    } finally {
      await heldLock.lock.close();
      await rm(heldLock.path, { force: true });
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(help); return; }
  if (!JOBS[args.job]) throw new Error(`Choose one reviewed --job selector: ${Object.keys(JOBS).join(', ')}.`);
  if (!args['inventory-sha256']) throw new Error('Provide the reviewed --inventory-sha256 for this exact ledger.');
  validateBudgets({ maxCalls: args.maxCalls, maxRuns: args.maxRuns, paid: args.paid });
  if (args.paid && (!args.maxCallsExplicit || !args.maxRunsExplicit)) throw new Error('Paid execution requires explicit --max-calls and --max-runs flags.');
  if (args.job === 'b7-solar-teaching') {
    if (args.paid && !args.maxTotalCallsExplicit) throw new Error('B7 Solar teaching paid execution requires explicit --max-total-calls.');
    validateB7SolarTeachingExecutionCaps({ maxCalls: args.maxCalls, maxRuns: args.maxRuns, maxTotalCalls: args.maxTotalCalls, paid: args.paid });
  }
  if (args.job === 'b5-sound-safari-literacy') {
    if (args.paid && !args.maxTotalCallsExplicit) throw new Error('B5 Sound Safari paid execution requires explicit --max-total-calls.');
    validateB5SoundSafariExecutionCaps({ maxCalls: args.maxCalls, maxRuns: args.maxRuns, maxTotalCalls: args.maxTotalCalls, paid: args.paid });
  }
  if (args.job === 'b7-memory-current') {
    if (args.paid && !args.maxTotalCallsExplicit) throw new Error('B7 Memory paid execution requires explicit --max-total-calls.');
    validateB7MemoryCurrentExecutionCaps({ maxCalls: args.maxCalls, maxRuns: args.maxRuns, maxTotalCalls: args.maxTotalCalls, paid: args.paid });
  }
  const ledger = JOBS[args.job].ledger;
  const expectedInventorySha256 = ledger === 'supplemental' ? SUPPLEMENTAL_INVENTORY_SHA256
    : ledger === 'b4-grammar' ? B4_GRAMMAR_INVENTORY_SHA256
      : ledger === 'b7-solar-teaching' ? B7_SOLAR_TEACHING_INVENTORY_SHA256
        : ledger === 'b7-memory-current' ? B7_MEMORY_CURRENT_INVENTORY_SHA256
        : ledger === 'b5-sound-safari-literacy' ? B5_SOUND_SAFARI_INVENTORY_SHA256
      : PINNED_INVENTORY_SHA256;
  const inventoryPath = ledger === 'supplemental' ? supplementalInventoryPath
    : ledger === 'b4-grammar' ? b4GrammarInventoryPath
      : ledger === 'b7-solar-teaching' ? b7SolarTeachingInventoryPath
        : ledger === 'b7-memory-current' ? b7MemoryCurrentInventoryPath
        : ledger === 'b5-sound-safari-literacy' ? b5SoundSafariInventoryPath
      : batch5To7InventoryPath;
  const { inventory, actualSha256 } = await loadPinnedInventory({ inventoryPath, suppliedSha256: args['inventory-sha256'], expectedSha256: expectedInventorySha256 });
  const selectedItems = selectJobItems(inventory, args.job);
  const items = args.job === 'b4-grammar'
    ? await applyB4GrammarReviewedReuse(selectedItems, root)
    : selectedItems;
  const { manifest, sha256: manifestBeforeSha256 } = await readManifest();
  if (args.job === 'b4-grammar') assertB4GrammarExactMappings(items, manifest);
  const existingReceipts = await readProvenance(actualSha256);
  const missing = [];
  let packagedCandidateReusable = 0;
  for (const item of items) {
    const reusablePath = args.job === 'b5-sound-safari-literacy'
      ? await isCandidateReusable(root, manifest, item, existingReceipts.get(item.key), actualSha256)
      : await isPackagedCandidate(root, manifest, item, existingReceipts.get(item.key), actualSha256);
    if (reusablePath) packagedCandidateReusable += 1;
    else missing.push(item);
  }
  const sourceReadyUnavailable = ['b5-sound-safari-literacy', 'b7-memory-current'].includes(args.job) ? missing.filter((item) => item.expectedCandidateSha256).map((item) => item.key) : [];
  const pendingAllowlist = args.job === 'b5-sound-safari-literacy' ? [...b5SoundSafariAllowedPendingKeys(items)].sort()
    : args.job === 'b7-memory-current' ? [...b7MemoryCurrentAllowedPendingKeys(items)].sort() : undefined;
  const jobPlan = { job: args.job, label: JOBS[args.job].label, inventorySha256: actualSha256, requested: items.length, packagedCandidateReusable, pending: missing.length, eligiblePending: ['b5-sound-safari-literacy', 'b7-memory-current'].includes(args.job) ? pendingAllowlist.length : undefined, snapshotReadyUnavailable: ['b5-sound-safari-literacy', 'b7-memory-current'].includes(args.job) ? sourceReadyUnavailable.length : undefined, pendingAllowlist, maxCallsPerRun: args.job === 'b7-memory-current' ? Math.min(args.maxCalls, B7_MEMORY_CURRENT_MAX_CALLS_PER_RUN) : args.maxCalls, maxRuns: args.job === 'b7-memory-current' ? Math.min(args.maxRuns, B7_MEMORY_CURRENT_MAX_RUNS) : args.maxRuns, maxTotalCalls: args.job === 'b7-solar-teaching' ? args.maxTotalCalls ?? B7_SOLAR_TEACHING_REQUEST_LIMIT : args.job === 'b7-memory-current' ? args.maxTotalCalls ?? B7_MEMORY_CURRENT_REQUEST_LIMIT : args.job === 'b5-sound-safari-literacy' ? args.maxTotalCalls ?? B5_SOUND_SAFARI_REQUEST_LIMIT : undefined };
  if (!args.paid) { console.log(JSON.stringify({ mode: 'dry-run', readOnly: true, ...jobPlan, pendingKeys: missing.map((item) => item.key) }, null, 2)); return; }

  if (sourceReadyUnavailable.length) throw new Error(`Pinned snapshot-ready narration files are unavailable at their expected byte hash (${sourceReadyUnavailable.length}); refusing to regenerate outside the exact pending-key allowlist.`);

  if (!args['predecessor-status']) throw new Error('Paid execution requires explicit --predecessor-status from the terminal B4 run.');
  const journalPath = assertJournalPath(args['request-journal'], expectedJournalPath);
  if (await realpath(journalPath) !== await realpath(expectedJournalPath)) throw new Error('Shared request journal resolves through an unexpected path.');
  await assertPredecessorFinished(args['predecessor-status'], expectedB4ManifestPath);
  const journal = await readRequestJournal(journalPath);
  if (journal.blockedUntil > Date.now()) throw new Error(`Shared voice cooldown is active until ${new Date(journal.blockedUntil).toISOString()}.`);
  const auditPath = resolve(root, `tmp/reviewed-narration-audit-${args.job}.json`);
  await execute(args, items, manifest, journalPath, auditPath, manifestBeforeSha256, packagedCandidateReusable, actualSha256);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`Stopped safely: ${error.message}`); process.exitCode = 1; });
}
