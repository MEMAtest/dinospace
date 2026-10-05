import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  B4_GRAMMAR_INVENTORY_SHA256, B4_GRAMMAR_SOURCE_COMMIT, B4_GRAMMAR_SOURCE_HASHES, B4_SOURCE_COMMIT, B4_WORKER_PID, B5_SOUND_SAFARI_INVENTORY_SHA256, B5_SOUND_SAFARI_MAX_CALLS_PER_RUN, B5_SOUND_SAFARI_MAX_RUNS, B5_SOUND_SAFARI_PREDECESSOR_LEDGER_SHA256, B5_SOUND_SAFARI_REQUEST_LIMIT, B5_SOUND_SAFARI_SOURCE_COMMIT, B5_SOUND_SAFARI_SOURCE_HASHES, B5_SOUND_SAFARI_TUPLE_SHA256, B7_SOLAR_TEACHING_BASE_COMMIT, B7_SOLAR_TEACHING_INVENTORY_SHA256, B7_SOLAR_TEACHING_MAX_CALLS_PER_RUN, B7_SOLAR_TEACHING_MAX_RUNS, B7_SOLAR_TEACHING_REQUEST_LIMIT, B7_SOLAR_TEACHING_SOURCE_COMMIT, B7_SOLAR_TEACHING_SOURCE_HASHES, JOBS, PINNED_INVENTORY_SHA256, SUPPLEMENTAL_INVENTORY_SHA256,
  acquireProducerLock, assertJournalPath, assertJournalSnapshot, assertPredecessorFinished, assertTerminalPredecessorRecord, b5SoundSafariAllowedPendingKeys, claimB5SoundSafariAttempt, claimB5SoundSafariRunWhenPending, claimB7SolarTeachingAttempt, claimB7SolarTeachingRun,
  availableCalls, classifyB5SoundSafariGenerationWork, getCandidateReusablePath, isCandidateReusable, isPackagedCandidate,
  loadPinnedInventory, producerLockPathForJournal, readRequestJournal, requestNarration, selectJobItems,
  sha256, validateB5SoundSafariBudgetState, validateB5SoundSafariExecutionCaps, validateB7SolarTeachingBudgetState, validateB7SolarTeachingExecutionCaps, validateBudgets,
} from './reviewedNarrationJobs.mjs';

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(root, 'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json');
const supplementalInventoryPath = resolve(root, 'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json');
const b4GrammarInventoryPath = resolve(root, 'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json');
const b7SolarTeachingInventoryPath = resolve(root, 'docs/qa-evidence/b7-solar-teaching-narration-jobs-20261004.json');
const b5SoundSafariInventoryPath = resolve(root, 'docs/qa-evidence/b5-sound-safari-narration-ledger-20261005/successor-c636516/ledger.json');
const cliPath = resolve(root, 'scripts/run-reviewed-narration-job.mjs');
const sharedJournal = resolve(root, '../dinospace-batch3-quality/tmp/offline-voice-request-state.json');
const b4Manifest = resolve(root, '../dinospace-batch4-quality/src/data/offlineVoiceManifest.js');

const tempDir = async () => mkdtemp(resolve(tmpdir(), 'reviewed-voice-test-'));
const deadPidProbe = () => { throw Object.assign(new Error('not running'), { code: 'ESRCH' }); };

async function createCliFixture() {
  const temp = await tempDir();
  const fixtureRoot = resolve(temp, 'dinospace-game-editor-fixes');
  const batch3Root = resolve(temp, 'dinospace-batch3-quality');
  const batch4Root = resolve(temp, 'dinospace-batch4-quality');
  const fixtureJournal = resolve(batch3Root, 'tmp/offline-voice-request-state.json');
  const fixtureB4Manifest = resolve(batch4Root, 'src/data/offlineVoiceManifest.js');
  const fixtureManifest = resolve(fixtureRoot, 'src/data/offlineVoiceManifest.js');
  const fixtureCliPath = resolve(fixtureRoot, 'scripts/run-reviewed-narration-job.mjs');
  const originalConsolidated = JSON.parse(await readFile(inventoryPath, 'utf8'));
  const originalSolar = JSON.parse(await readFile(b7SolarTeachingInventoryPath, 'utf8'));
  const originalManifestSource = await readFile(resolve(root, 'src/data/offlineVoiceManifest.js'), 'utf8');
  const manifestObject = JSON.parse(originalManifestSource.match(/export const OFFLINE_VOICE_MANIFEST = (\{[\s\S]*\});\s*$/)[1]);
  const sourceCandidates = [root, resolve(root, '../dinospace-batch7-teaching-readability')];
  const paths = [
    'scripts/reviewedNarrationJobs.mjs',
    'scripts/run-reviewed-narration-job.mjs',
    'src/data/voiceKey.js',
    'src/data/offlineVoiceManifest.js',
    'docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json',
    'docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json',
    'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json',
    'docs/qa-evidence/b7-solar-teaching-narration-jobs-20261004.json',
  ];
  for (const path of paths) {
    const destination = resolve(fixtureRoot, path);
    await mkdir(resolve(destination, '..'), { recursive: true });
    await copyFile(resolve(root, path), destination);
  }
  await writeFile(resolve(fixtureRoot, 'package.json'), '{"type":"module"}\n');
  await mkdir(resolve(fixtureRoot, 'public/audio/en'), { recursive: true });
  const candidateItems = new Map();
  for (const item of [...originalConsolidated.items.filter((entry) => entry.owners?.includes('B7_solar')), ...originalSolar.items]) {
    const status = item.candidateStatus?.B7_solar;
    if (status?.fileExists && status.manifestMatches && status.sha256) candidateItems.set(item.key, { ...item, status });
  }
  for (const [key, item] of candidateItems) {
    const publicPath = manifestObject[key];
    if (!publicPath) throw new Error(`CLI fixture cannot find manifest path for ${key}.`);
    const destination = resolve(fixtureRoot, 'public', publicPath.slice(1));
    await mkdir(resolve(destination, '..'), { recursive: true });
    let copied = false;
    for (const sourceRoot of sourceCandidates) {
      const source = resolve(sourceRoot, 'public', publicPath.slice(1));
      try {
        const bytes = await readFile(source);
        if (sha256(bytes) !== item.status.sha256) continue;
        await writeFile(destination, bytes);
        copied = true;
        break;
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (!copied) throw new Error(`CLI fixture cannot locate exact ready bytes for ${key}.`);
  }
  await mkdir(resolve(fixtureJournal, '..'), { recursive: true });
  await copyFile(sharedJournal, fixtureJournal);
  await mkdir(resolve(fixtureB4Manifest, '..'), { recursive: true });
  await copyFile(b4Manifest, fixtureB4Manifest);
  const canonicalFixtureRoot = await realpath(fixtureRoot);
  return {
    temp,
    root: canonicalFixtureRoot,
    cliPath: await realpath(fixtureCliPath),
    manifest: await realpath(fixtureManifest),
    journal: await realpath(fixtureJournal),
    b4Manifest: await realpath(fixtureB4Manifest),
    cleanup: () => rm(temp, { recursive: true, force: true }),
  };
}

test('pins exact reviewed ledger and derives only approved owner keys', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({ inventoryPath, suppliedSha256: PINNED_INVENTORY_SHA256 });
  assert.equal(actualSha256, PINNED_INVENTORY_SHA256);
  assert.deepEqual(Object.keys(JOBS), ['b5-reasoning', 'b5-literacy', 'b5-sound-safari-literacy', 'b6', 'b7-solar', 'b7-solar-teaching', 'b7-memory', 'b2-supplement', 'b3-dino-facts', 'b4-grammar']);
  assert.equal(selectJobItems(inventory, 'b5-reasoning').length, 310);
  assert.equal(selectJobItems(inventory, 'b5-literacy').length, 659);
  assert.equal(selectJobItems(inventory, 'b6').length, 378);
  assert.equal(selectJobItems(inventory, 'b7-solar').length, 127);
  assert.equal(selectJobItems(inventory, 'b7-memory').length, 183);
  assert.ok(selectJobItems(inventory, 'b7-solar').every((item) => item.owners.includes('B7_solar') && !item.owners.includes('B4')));
  await assert.rejects(() => loadPinnedInventory({ inventoryPath, suppliedSha256: '0'.repeat(64) }), /must equal reviewed SHA/);
});

test('B5 Sound Safari successor pins exact 862 tuples, 13 source hashes, 11 reusable files and 851 exact pending keys', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({
    inventoryPath: b5SoundSafariInventoryPath,
    suppliedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256,
    expectedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256,
  });
  assert.equal(actualSha256, B5_SOUND_SAFARI_INVENTORY_SHA256);
  assert.equal(inventory.source.commit, B5_SOUND_SAFARI_SOURCE_COMMIT);
  assert.equal(inventory.sourceInventory.sha256, '365588284c853a7bfdfaf79f2e1153b1065a7f54c51c562f91cbd66b286b7e83');
  assert.equal(inventory.successor.supersedesLedgerSha256, B5_SOUND_SAFARI_PREDECESSOR_LEDGER_SHA256);
  assert.equal(inventory.successor.exactTupleSha256, B5_SOUND_SAFARI_TUPLE_SHA256);
  assert.equal(inventory.items.length, 862);
  const sourceRoot = resolve(root, '../dinospace-batch5-soundsafari-picture-art');
  assert.deepEqual(Object.keys(inventory.source.sha256ByPath).sort(), Object.keys(B5_SOUND_SAFARI_SOURCE_HASHES).sort());
  for (const [path, expected] of Object.entries(B5_SOUND_SAFARI_SOURCE_HASHES)) {
    const result = spawnSync('git', ['-C', sourceRoot, 'show', `${B5_SOUND_SAFARI_SOURCE_COMMIT}:${path}`], { encoding: 'buffer' });
    assert.equal(result.status, 0, `could not read exact source file ${path}`);
    assert.equal(sha256(result.stdout), expected, `source hash changed for ${path}`);
  }
  const selected = selectJobItems(inventory, 'b5-sound-safari-literacy');
  const allowedKeys = b5SoundSafariAllowedPendingKeys(selected);
  assert.equal(selected.length, 862);
  assert.equal(selected.filter((item) => item.expectedCandidateSha256).length, 11);
  assert.equal(allowedKeys.size, 851);
  assert.ok(selected.every((item) => item.sourceCommit === B5_SOUND_SAFARI_SOURCE_COMMIT && item.path === `/audio/en/${item.key}-matilda.mp3`));
  assert.ok([...allowedKeys].every((key) => selected.find((item) => item.key === key).candidateAtSnapshotPending));
  assert.throws(() => b5SoundSafariAllowedPendingKeys(selected.map(({ candidateAtSnapshotPending, ...item }) => item)), /lost or changed/);
  assert.throws(() => claimB5SoundSafariAttempt({ inventorySha256: actualSha256, runs: 0, attemptedKeys: [] }, selected.find((item) => item.expectedCandidateSha256).key, allowedKeys), /outside the pinned pending-key set/);
  const oldInventory = JSON.parse(await readFile(inventoryPath, 'utf8'));
  assert.equal(selectJobItems(oldInventory, 'b5-literacy').length, 659, 'legacy 659 selector remains separate and unchanged');
});

test('B5 Sound Safari run/request caps, duplicate refusal and ready-only budget preservation', async () => {
  assert.equal(B5_SOUND_SAFARI_REQUEST_LIMIT, 851);
  assert.equal(B5_SOUND_SAFARI_MAX_CALLS_PER_RUN, 20);
  assert.equal(B5_SOUND_SAFARI_MAX_RUNS, 43);
  assert.equal(validateB5SoundSafariExecutionCaps({ maxCalls: 20, maxRuns: 43, maxTotalCalls: 851, paid: true }), true);
  assert.throws(() => validateB5SoundSafariExecutionCaps({ maxCalls: 21, maxRuns: 1, maxTotalCalls: 851, paid: true }), /max-calls/);
  assert.throws(() => validateB5SoundSafariExecutionCaps({ maxCalls: 20, maxRuns: 44, maxTotalCalls: 851, paid: true }), /max-runs/);
  assert.throws(() => validateB5SoundSafariExecutionCaps({ maxCalls: 20, maxRuns: 43, maxTotalCalls: 852, paid: true }), /max-total-calls/);
  assert.throws(() => validateB5SoundSafariExecutionCaps({ maxCalls: 20, maxRuns: 43, maxTotalCalls: undefined, paid: true }), /max-total-calls/);

  const { inventory, actualSha256 } = await loadPinnedInventory({ inventoryPath: b5SoundSafariInventoryPath, suppliedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256, expectedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256 });
  const selected = selectJobItems(inventory, 'b5-sound-safari-literacy');
  const allowedKeys = b5SoundSafariAllowedPendingKeys(selected);
  const initial = { inventorySha256: actualSha256, runs: 0, attemptedKeys: [] };
  const readyOnlyState = { ...initial };
  const readyOnlyKeys = b5SoundSafariAllowedPendingKeys(selected.filter((item) => item.expectedCandidateSha256));
  assert.equal(readyOnlyKeys.size, 0);
  assert.deepEqual(claimB5SoundSafariRunWhenPending(readyOnlyState, readyOnlyKeys.size, readyOnlyKeys), readyOnlyState);
  let state = initial;
  for (let run = 0; run < B5_SOUND_SAFARI_MAX_RUNS; run += 1) state = claimB5SoundSafariRunWhenPending(state, 1, allowedKeys);
  assert.equal(state.runs, B5_SOUND_SAFARI_MAX_RUNS);
  assert.throws(() => claimB5SoundSafariRunWhenPending(state, 1, allowedKeys), /43-run cap/);

  const keys = [...allowedKeys].sort();
  let attempts = { inventorySha256: actualSha256, runs: 0, attemptedKeys: [] };
  for (const key of keys) attempts = claimB5SoundSafariAttempt(attempts, key, allowedKeys);
  assert.equal(attempts.attemptedKeys.length, 851);
  assert.equal(validateB5SoundSafariBudgetState(attempts, actualSha256, allowedKeys), true);
  assert.throws(() => claimB5SoundSafariAttempt(attempts, keys[0], allowedKeys), /already attempted/);
  assert.throws(() => claimB5SoundSafariAttempt(attempts, 'ffffffff', allowedKeys), /outside the pinned pending-key set/);
  assert.throws(() => validateB5SoundSafariBudgetState({ inventorySha256: actualSha256, runs: 0, attemptedKeys: ['ffffffff'] }, actualSha256, allowedKeys), /invalid or does not match/);
});

test('B5 Sound Safari runner classifies snapshot or receipt bytes before claiming a run when manifest entries are missing', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({ inventoryPath: b5SoundSafariInventoryPath, suppliedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256, expectedSha256: B5_SOUND_SAFARI_INVENTORY_SHA256 });
  const selected = selectJobItems(inventory, 'b5-sound-safari-literacy');
  const allowedKeys = b5SoundSafariAllowedPendingKeys(selected);
  const snapshotReady = selected.find((item) => item.expectedCandidateSha256);
  const receiptReusable = selected.find((item) => item.candidateAtSnapshotPending);
  const fixtureRoot = await tempDir();
  try {
    const artRoot = resolve(root, '../dinospace-batch5-soundsafari-picture-art');
    const snapshotPath = resolve(fixtureRoot, 'public', snapshotReady.path.slice(1));
    await mkdir(resolve(snapshotPath, '..'), { recursive: true });
    await copyFile(resolve(artRoot, 'public', snapshotReady.path.slice(1)), snapshotPath);

    const receiptBytes = Buffer.alloc(1400, 19);
    const receiptPath = resolve(fixtureRoot, 'public', receiptReusable.path.slice(1));
    await mkdir(resolve(receiptPath, '..'), { recursive: true });
    await writeFile(receiptPath, receiptBytes);
    const receipt = {
      producer: 'reviewedNarrationSupervisorV1',
      inventorySha256: actualSha256,
      key: receiptReusable.key,
      path: receiptReusable.path,
      sourceCommit: B5_SOUND_SAFARI_SOURCE_COMMIT,
      textSha256: sha256(Buffer.from(receiptReusable.text, 'utf8')),
      voice: 'matilda',
      contentType: 'audio/mpeg',
      bytes: receiptBytes.length,
      audioSha256: sha256(receiptBytes),
    };
    const manifest = new Map();
    const receipts = new Map([[receiptReusable.key, receipt]]);
    const classified = await classifyB5SoundSafariGenerationWork(fixtureRoot, [snapshotReady, receiptReusable], manifest, receipts, actualSha256);
    assert.deepEqual(classified.generationPending, []);
    assert.deepEqual([...classified.reusablePaths.entries()].sort(), [[receiptReusable.key, receiptReusable.path], [snapshotReady.key, snapshotReady.path]].sort());
    const initialBudget = { inventorySha256: actualSha256, attemptedKeys: [], runs: 7 };
    assert.deepEqual(claimB5SoundSafariRunWhenPending(initialBudget, classified.generationPending.length, allowedKeys), initialBudget);

    const invalidReceipt = { ...receipt, textSha256: '0'.repeat(64) };
    const invalid = await classifyB5SoundSafariGenerationWork(fixtureRoot, [receiptReusable], new Map(), new Map([[receiptReusable.key, invalidReceipt]]), actualSha256);
    assert.deepEqual(invalid.generationPending.map((item) => item.key), [receiptReusable.key]);
    assert.equal(invalid.reusablePaths.size, 0);
  } finally { await rm(fixtureRoot, { recursive: true, force: true }); }
});

test('B7 Solar teaching ledger binds 22 edited facts, 44 changed keys and the exact 75/52 readiness snapshot', async () => {
  const sourceRoot = resolve(root, '../dinospace-batch7-teaching-readability');
  const { inventory, actualSha256 } = await loadPinnedInventory({
    inventoryPath: b7SolarTeachingInventoryPath,
    suppliedSha256: B7_SOLAR_TEACHING_INVENTORY_SHA256,
    expectedSha256: B7_SOLAR_TEACHING_INVENTORY_SHA256,
  });
  assert.equal(actualSha256, B7_SOLAR_TEACHING_INVENTORY_SHA256);
  assert.equal(inventory.source, B7_SOLAR_TEACHING_SOURCE_COMMIT);
  assert.equal(inventory.base, B7_SOLAR_TEACHING_BASE_COMMIT);
  assert.equal(inventory.requested, 127);
  assert.equal(inventory.readyAtCandidateSnapshot, 75);
  assert.equal(inventory.pendingAtCandidateSnapshot, 52);
  assert.equal(inventory.newCopyKeys.length, 44);
  assert.equal(inventory.unchangedPriorMissingKeys.length, 8);
  for (const [path, expected] of Object.entries(B7_SOLAR_TEACHING_SOURCE_HASHES)) {
    const result = spawnSync('git', ['-C', sourceRoot, 'show', `${B7_SOLAR_TEACHING_SOURCE_COMMIT}:${path}`], { encoding: 'buffer' });
    assert.equal(result.status, 0, `could not read source-pinned file ${path}`);
    assert.equal(sha256(result.stdout), expected, `source bytes changed: ${path}`);
  }
  const selected = selectJobItems(inventory, 'b7-solar-teaching');
  assert.equal(selected.length, 127);
  assert.equal(selected.filter((item) => item.expectedCandidateSha256).length, 75);
  const budgetAllowedKeys = new Set(selected.filter((item) => !item.expectedCandidateSha256).map((item) => item.key));
  assert.equal(budgetAllowedKeys.size, 52);
  assert.equal(validateB7SolarTeachingBudgetState({ inventorySha256: actualSha256, runs: 0, attemptedKeys: [] }, actualSha256, budgetAllowedKeys), true);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: actualSha256, runs: 0, attemptedKeys: [selected.find((item) => item.expectedCandidateSha256).key] }, actualSha256, budgetAllowedKeys), /invalid or does not match/);
  assert.ok(selected.every((item) => item.sourceCommit === B7_SOLAR_TEACHING_SOURCE_COMMIT && item.path === `/audio/en/${item.key}-matilda.mp3`));
  const auditPath = resolve(sourceRoot, 'docs/qa-evidence/batch7-teaching-readability-20261004/fact-and-voice-audit.json');
  const auditBytes = await readFile(auditPath);
  assert.equal(sha256(auditBytes), inventory.factAuditSha256);
  const audit = JSON.parse(auditBytes.toString('utf8'));
  const auditedNew = audit.rows.filter((row) => row.changed).flatMap((row) => row.newUtterances.map((utterance) => utterance.key)).sort();
  assert.deepEqual([...inventory.newCopyKeys].sort(), auditedNew);
  const altered = structuredClone(inventory);
  altered.sourceHashes['src/data/index.js'] = '0'.repeat(64);
  assert.throws(() => selectJobItems(altered, 'b7-solar-teaching'), /source provenance mismatch/);
  const alteredStatus = structuredClone(inventory);
  const changedStatus = alteredStatus.items.find((item) => inventory.newCopyKeys.includes(item.key)).candidateStatus.B7_solar;
  changedStatus.fileExists = true;
  changedStatus.manifestMatches = true;
  changedStatus.sha256 = 'a'.repeat(64);
  assert.throws(() => selectJobItems(alteredStatus, 'b7-solar-teaching'), /75 ready \/ 52 pending/);
});

test('B7 Solar teaching selector dry-run reports 127 current phrases and keeps all ledgers and shared files read-only', async () => {
  const fixture = await createCliFixture();
  try {
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    const beforeB4Manifest = sha256(await readFile(fixture.b4Manifest));
    const result = spawnSync(process.execPath, [fixture.cliPath, '--job=b7-solar-teaching', `--inventory-sha256=${B7_SOLAR_TEACHING_INVENTORY_SHA256}`], { cwd: fixture.root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.trim(), JSON.stringify({ stderr: result.stderr, error: result.error?.message, signal: result.signal, status: result.status, cwd: fixture.root, cli: fixture.cliPath }));
    const summary = JSON.parse(result.stdout);
    const ledger = JSON.parse(await readFile(resolve(fixture.root, 'docs/qa-evidence/b7-solar-teaching-narration-jobs-20261004.json'), 'utf8'));
    assert.equal(summary.mode, 'dry-run');
    assert.equal(summary.readOnly, true);
    assert.equal(summary.inventorySha256, B7_SOLAR_TEACHING_INVENTORY_SHA256);
    assert.equal(summary.requested, 127);
    assert.equal(summary.packagedCandidateReusable, 75);
    assert.equal(summary.pending, 52);
    assert.deepEqual(summary.pendingKeys, ledger.items.filter((item) => !item.candidateStatus.B7_solar.fileExists).map(({ key }) => key).sort());
    assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
    assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
    assert.equal(sha256(await readFile(fixture.b4Manifest)), beforeB4Manifest);
  } finally { await fixture.cleanup(); }
});

test('B7 Solar teaching paid caps reject excessive per-run, run-count and total budgets before execution', async () => {
  const fixture = await createCliFixture();
  try {
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    const beforeB4Manifest = sha256(await readFile(fixture.b4Manifest));
    const missingTotal = spawnSync(process.execPath, [fixture.cliPath, '--job=b7-solar-teaching', `--inventory-sha256=${B7_SOLAR_TEACHING_INVENTORY_SHA256}`, '--execute-paid', '--max-calls=10', '--max-runs=6'], { cwd: fixture.root, encoding: 'utf8' });
    assert.equal(missingTotal.status, 1);
    assert.match(missingTotal.stderr, /requires explicit --max-total-calls/);
    for (const [extraArgs, expected] of [
      [['--max-calls=11', '--max-runs=1', '--max-total-calls=52'], /max-calls must be from 1 to 10/],
      [['--max-calls=10', '--max-runs=7', '--max-total-calls=52'], /max-runs must be from 1 to 6/],
      [['--max-calls=10', '--max-runs=6', '--max-total-calls=53'], /max-total-calls must be from 1 to 52/],
    ]) {
      const result = spawnSync(process.execPath, [fixture.cliPath, '--job=b7-solar-teaching', `--inventory-sha256=${B7_SOLAR_TEACHING_INVENTORY_SHA256}`, '--execute-paid', ...extraArgs], { cwd: fixture.root, encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, expected);
      assert.doesNotMatch(result.stderr, /fetch|HTTP|provider request/i);
      assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
      assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
      assert.equal(sha256(await readFile(fixture.b4Manifest)), beforeB4Manifest);
    }
    assert.equal(B7_SOLAR_TEACHING_REQUEST_LIMIT, 52);
    assert.equal(B7_SOLAR_TEACHING_MAX_CALLS_PER_RUN, 10);
    assert.equal(B7_SOLAR_TEACHING_MAX_RUNS, 6);
    assert.throws(() => validateB7SolarTeachingExecutionCaps({ maxCalls: 20, maxRuns: 1, maxTotalCalls: 52, paid: true }), /max-calls/);
    assert.throws(() => validateB7SolarTeachingExecutionCaps({ maxCalls: 10, maxRuns: 7, maxTotalCalls: 52, paid: true }), /max-runs/);
    assert.throws(() => validateB7SolarTeachingExecutionCaps({ maxCalls: 10, maxRuns: 6, maxTotalCalls: 53, paid: true }), /max-total-calls/);
  } finally { await fixture.cleanup(); }
});

test('B7 Solar attempt ledger is inventory-bound, unique and capped at 52 keys', () => {
  let state = { inventorySha256: B7_SOLAR_TEACHING_INVENTORY_SHA256, runs: 0, attemptedKeys: [] };
  for (let index = 0; index < 6; index += 1) state = claimB7SolarTeachingRun(state);
  assert.equal(validateB7SolarTeachingBudgetState(state), true);
  assert.throws(() => claimB7SolarTeachingRun(state), /six-run cap/);
  const keys = Array.from({ length: 52 }, (_, index) => index.toString(16).padStart(8, '0'));
  for (const key of keys) state = claimB7SolarTeachingAttempt(state, key);
  assert.equal(validateB7SolarTeachingBudgetState(state), true);
  assert.throws(() => claimB7SolarTeachingAttempt(state, keys[0]), /already attempted/);
  assert.throws(() => claimB7SolarTeachingAttempt(state, 'fffffff0'), /52-request inventory cap/);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: '0'.repeat(64), runs: 0, attemptedKeys: [] }), /invalid or does not match/);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: B7_SOLAR_TEACHING_INVENTORY_SHA256, runs: 7, attemptedKeys: [] }), /invalid or does not match/);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: B7_SOLAR_TEACHING_INVENTORY_SHA256, runs: 0, attemptedKeys: [...keys, 'fffffff0'] }), /invalid or does not match/);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: B7_SOLAR_TEACHING_INVENTORY_SHA256, runs: 0, attemptedKeys: [keys[0], keys[0]] }), /invalid or does not match/);
  assert.throws(() => validateB7SolarTeachingBudgetState({ inventorySha256: B7_SOLAR_TEACHING_INVENTORY_SHA256, runs: 0, attemptedKeys: [keys[0]] }, B7_SOLAR_TEACHING_INVENTORY_SHA256, new Set([keys[1]])), /invalid or does not match/);
});

test('B4 grammar selector pins all 47 exact additions to fe5 source files and expected voice paths', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({
    inventoryPath: b4GrammarInventoryPath,
    suppliedSha256: B4_GRAMMAR_INVENTORY_SHA256,
    expectedSha256: B4_GRAMMAR_INVENTORY_SHA256,
  });
  assert.equal(actualSha256, B4_GRAMMAR_INVENTORY_SHA256);
  assert.equal(inventory.source, B4_GRAMMAR_SOURCE_COMMIT);
  assert.equal(inventory.removed, 47);
  assert.equal(inventory.unchanged, 5199);
  const sourceRoot = resolve(root, '../dinospace-batch4-grammar');
  const sourceDeltaBytes = await readFile(resolve(sourceRoot, 'docs/qa-evidence/batch4-grammar-repair-20261004/corpus-delta.json'));
  assert.equal(sha256(sourceDeltaBytes), inventory.deltaSha256);
  const sourceDelta = JSON.parse(sourceDeltaBytes.toString('utf8'));
  assert.equal(sourceDelta.added.length, 47);
  assert.equal(sourceDelta.removed.length, 47);
  assert.equal(sourceDelta.unchanged, 5199);
  assert.deepEqual(
    inventory.items.map(({ text, key, path }) => ({ text, key, path })).sort((a, b) => a.key.localeCompare(b.key)),
    sourceDelta.added.map(({ text, key, path }) => ({ text, key, path })).sort((a, b) => a.key.localeCompare(b.key)),
  );
  for (const [path, expected] of Object.entries(B4_GRAMMAR_SOURCE_HASHES)) {
    assert.equal(sha256(await readFile(resolve(sourceRoot, path))), expected, `source bytes changed: ${path}`);
  }
  const selected = selectJobItems(inventory, 'b4-grammar');
  assert.equal(selected.length, 47);
  assert.equal(new Set(selected.map(({ key }) => key)).size, 47);
  assert.ok(selected.every((item) => item.sourceCommit === B4_GRAMMAR_SOURCE_COMMIT && item.owners.includes('B4_grammar') && item.path === `/audio/en/${item.key}-matilda.mp3`));
  assert.deepEqual(selected.map(({ text }) => text).sort(), inventory.items.map(({ text }) => text).sort());
  const changed = structuredClone(inventory);
  changed.sourceHashes['src/data/timeLineAdventure.js'] = '0'.repeat(64);
  assert.throws(() => selectJobItems(changed, 'b4-grammar'), /source provenance mismatch/);
  const changedText = structuredClone(inventory);
  changedText.items[0].text += ' altered';
  assert.throws(() => selectJobItems(changedText, 'b4-grammar'), /key does not match/);
});

test('B4 grammar default plan is the exact 47 phrase set and remains read-only', async () => {
  const fixture = await createCliFixture();
  try {
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    const beforeB4Manifest = sha256(await readFile(fixture.b4Manifest));
    const result = spawnSync(process.execPath, [fixture.cliPath, '--job=b4-grammar', `--inventory-sha256=${B4_GRAMMAR_INVENTORY_SHA256}`], { cwd: fixture.root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const summary = JSON.parse(result.stdout);
    const ledger = JSON.parse(await readFile(resolve(fixture.root, 'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json'), 'utf8'));
    assert.equal(summary.mode, 'dry-run');
    assert.equal(summary.readOnly, true);
    assert.equal(summary.inventorySha256, B4_GRAMMAR_INVENTORY_SHA256);
    assert.equal(summary.requested, 47);
    assert.equal(summary.pending, 47);
    assert.deepEqual(summary.pendingKeys, ledger.items.map(({ key }) => key).sort());
    assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
    assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
    assert.equal(sha256(await readFile(fixture.b4Manifest)), beforeB4Manifest);
  } finally { await fixture.cleanup(); }
});

test('supplemental selectors bind exact reviewed source hashes, voice keys, phrases and paths', async () => {
  const { inventory, actualSha256 } = await loadPinnedInventory({
    inventoryPath: supplementalInventoryPath,
    suppliedSha256: SUPPLEMENTAL_INVENTORY_SHA256,
    expectedSha256: SUPPLEMENTAL_INVENTORY_SHA256,
  });
  assert.equal(actualSha256, SUPPLEMENTAL_INVENTORY_SHA256);
  const batch2 = selectJobItems(inventory, 'b2-supplement');
  const batch3 = selectJobItems(inventory, 'b3-dino-facts');
  assert.equal(batch2.length, 5);
  assert.equal(batch3.length, 2);
  assert.ok(batch2.every((item) => item.sourceCommit === '94d44d031d5835d0d9fa2128064ff83ba5880a62' && item.path === `/audio/en/${item.key}-matilda.mp3`));
  assert.ok(batch3.every((item) => item.sourceCommit === 'e2aee30169f6ade67f7948b0088a895a9cb119c3' && item.path === `/audio/en/${item.key}-matilda.mp3`));
  assert.deepEqual(batch3.map((item) => item.text), [
    'Water can slowly dissolve (wear away) limestone rock and help caves form.',
    'A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year.',
  ].sort((a, b) => batch3.find((item) => item.text === a).key.localeCompare(batch3.find((item) => item.text === b).key)));
  const changed = structuredClone(inventory);
  changed.items[0].text += ' Changed.';
  assert.throws(() => selectJobItems(changed, 'b2-supplement'), /key does not match/);
  await assert.rejects(() => loadPinnedInventory({ inventoryPath: supplementalInventoryPath, suppliedSha256: PINNED_INVENTORY_SHA256, expectedSha256: SUPPLEMENTAL_INVENTORY_SHA256 }), /must equal reviewed SHA/);
});

test('supplemental dry-runs keep exact pending sets and do not alter either ledger family or shared files', async () => {
  const fixture = await createCliFixture();
  try {
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    const beforeB4Manifest = sha256(await readFile(fixture.b4Manifest));
    for (const [job, requested, keys] of [
      ['b2-supplement', 5, ['5866151d', '9685e0ac', 'a39b3546', 'a44acc87', 'e077fcc0']],
      ['b3-dino-facts', 2, ['0f0204e5', 'f6991245']],
    ]) {
      const result = spawnSync(process.execPath, [fixture.cliPath, `--job=${job}`, `--inventory-sha256=${SUPPLEMENTAL_INVENTORY_SHA256}`], { cwd: fixture.root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout);
      assert.equal(summary.mode, 'dry-run');
      assert.equal(summary.inventorySha256, SUPPLEMENTAL_INVENTORY_SHA256);
      assert.equal(summary.requested, requested);
      assert.equal(summary.packagedCandidateReusable, 0);
      assert.equal(summary.pending, requested);
      assert.deepEqual(summary.pendingKeys, keys);
    }
    assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
    assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
    assert.equal(sha256(await readFile(fixture.b4Manifest)), beforeB4Manifest);
  } finally { await fixture.cleanup(); }
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
    const receipt = { producer: 'reviewedNarrationSupervisorV1', inventorySha256: PINNED_INVENTORY_SHA256, key: item.key, path: item.path, sourceCommit: null, textSha256: sha256(Buffer.from(item.text)), voice: 'matilda', contentType: 'audio/mpeg', bytes: bytes.length, audioSha256: sha256(bytes) };
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
  const fixture = await createCliFixture();
  try {
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    const beforeB4Manifest = sha256(await readFile(fixture.b4Manifest));
    const result = spawnSync(process.execPath, [fixture.cliPath, '--job=b7-solar', `--inventory-sha256=${PINNED_INVENTORY_SHA256}`], { cwd: fixture.root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const summary = JSON.parse(result.stdout);
    assert.equal(summary.mode, 'dry-run');
    assert.equal(summary.readOnly, true);
    assert.equal(summary.requested, 127);
    assert.equal(summary.packagedCandidateReusable, 111);
    assert.equal(summary.pending, 16);
    assert.equal(summary.pendingKeys.length, 16);
    assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
    assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
    assert.equal(sha256(await readFile(fixture.b4Manifest)), beforeB4Manifest);
  } finally { await fixture.cleanup(); }
});

test('paid mode across both ledgers cannot pass a live predecessor PID even with an apparently terminal record', async () => {
  const fixture = await createCliFixture();
  try {
    const bytes = await readFile(fixture.b4Manifest);
    const statusPath = resolve(fixture.temp, 'live-predecessor.json');
    await writeFile(statusPath, JSON.stringify({ workerPid: process.pid, sourceCommit: B4_SOURCE_COMMIT, status: 'completed', terminal: true, reconciled: true, exitCode: 0, finishedAt: new Date().toISOString(), finalManifestPath: fixture.b4Manifest, finalManifestSha256: sha256(bytes) }));
    const beforeManifest = sha256(await readFile(fixture.manifest));
    const beforeJournal = sha256(await readFile(fixture.journal));
    for (const [job, inventorySha] of [['b7-solar', PINNED_INVENTORY_SHA256], ['b2-supplement', SUPPLEMENTAL_INVENTORY_SHA256]]) {
      const result = spawnSync(process.execPath, [fixture.cliPath, `--job=${job}`, `--inventory-sha256=${inventorySha}`, '--execute-paid', '--max-calls=1', '--max-runs=1', `--request-journal=${fixture.journal}`, `--predecessor-status=${statusPath}`], { cwd: fixture.root, encoding: 'utf8' });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /still live/);
    }
    assert.equal(sha256(await readFile(fixture.manifest)), beforeManifest);
    assert.equal(sha256(await readFile(fixture.journal)), beforeJournal);
  } finally { await fixture.cleanup(); }
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
