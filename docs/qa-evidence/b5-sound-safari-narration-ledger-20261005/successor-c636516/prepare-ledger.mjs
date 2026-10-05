import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const DIR = dirname(fileURLToPath(import.meta.url));
const INVENTORY = resolve(DIR, 'source-inventory.json');
const OUTPUT = resolve(DIR, 'ledger.json');
const PREDECESSOR = resolve(DIR, '../ledger.json');
const SOURCE_COMMIT = 'c636516afa9ffa1b77dcc3bd5b7353ee80bce567';
const PREDECESSOR_LEDGER_SHA256 = '3a8b85354a1163b11405a8b3ad51a3faf536839c188539d58dc81e0399910773';
const ART_SOURCE_PATH = 'src/data/batch5SoundSafariPictureArt.js';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function sourceRootFromArgs() {
  const index = process.argv.indexOf('--source-root');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Pass --source-root <clean checkout at c636516>.');
  return resolve(process.argv[index + 1]);
}

async function makeLedger(sourceRoot) {
  const revision = spawnSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  assert(revision.status === 0 && revision.stdout.trim() === SOURCE_COMMIT, 'Source checkout is not the pinned c636516 commit.');
  const status = spawnSync('git', ['-C', sourceRoot, 'status', '--porcelain'], { encoding: 'utf8' });
  assert(status.status === 0 && !status.stdout.trim(), 'Source checkout must be clean.');

  const oldLedgerBytes = await readFile(PREDECESSOR);
  assert(sha256(oldLedgerBytes) === PREDECESSOR_LEDGER_SHA256, 'Historical a652 ledger changed.');
  const oldLedger = JSON.parse(oldLedgerBytes.toString('utf8'));
  const inventoryBytes = await readFile(INVENTORY);
  const inventory = JSON.parse(inventoryBytes.toString('utf8'));
  assert(inventory.source?.commit === SOURCE_COMMIT, 'Successor inventory source commit differs.');
  assert(inventory.inventory?.uniqueTextEntries === 862 && inventory.inventory?.exactSequences === 603, 'Successor corpus totals differ.');
  assert(inventory.packagedNarration?.ready?.uniqueClips === 11 && inventory.packagedNarration?.pending?.uniqueClips === 851, 'Successor readiness differs; review rather than refresh silently.');

  const oldTuples = oldLedger.items.map(({ key, text, path }) => ({ key, text, path })).sort((a, b) => a.key.localeCompare(b.key));
  const newTuples = inventory.voiceItems.map(({ key, text, path }) => ({ key, text, path })).sort((a, b) => a.key.localeCompare(b.key));
  const tupleBytes = Buffer.from(`${JSON.stringify(oldTuples)}\n`, 'utf8');
  const tupleSha256 = sha256(tupleBytes);
  assert(oldTuples.length === 862 && newTuples.length === 862, 'Expected 862 predecessor/successor tuples.');
  assert(JSON.stringify(oldTuples) === JSON.stringify(newTuples), 'Successor text/key/path tuples differ from historical a652 ledger.');

  const sourceHashes = {};
  for (const file of inventory.source.hashes) {
    const actual = sha256(await readFile(resolve(sourceRoot, file.path)));
    assert(actual === file.sha256, `Frozen successor source differs: ${file.path}`);
    sourceHashes[file.path] = actual;
  }
  const changedSourcePaths = Object.keys(sourceHashes).filter((path) => oldLedger.source.sha256ByPath[path] !== sourceHashes[path]).sort();
  assert(JSON.stringify(changedSourcePaths) === JSON.stringify([ART_SOURCE_PATH]), 'Only the expected artwork source hash may differ from the a652 ledger.');

  const { voiceClipKey } = await import(pathToFileURL(resolve(sourceRoot, 'src/data/voiceKey.js')).href);
  const { OFFLINE_VOICE_MANIFEST } = await import(pathToFileURL(resolve(sourceRoot, 'src/data/offlineVoiceManifest.js')).href);
  const seen = new Set();
  const items = [];
  for (const entry of inventory.voiceItems) {
    assert(entry.key === voiceClipKey(entry.text, 'en-US'), `Key/text mismatch for ${entry.key}.`);
    assert(entry.path === `/audio/en/${entry.key}-matilda.mp3`, `Unexpected output path for ${entry.key}.`);
    assert(!seen.has(entry.key), `Duplicate key ${entry.key}.`);
    seen.add(entry.key);
    const manifestMatches = OFFLINE_VOICE_MANIFEST[entry.key] === entry.path;
    let fileBytes = null;
    let audioSha256 = null;
    try {
      const bytes = await readFile(resolve(sourceRoot, 'public', entry.path.slice(1)));
      fileBytes = bytes.length;
      audioSha256 = sha256(bytes);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const fileExists = fileBytes !== null;
    const ready = manifestMatches && fileExists && fileBytes > 0;
    assert(ready === entry.ready, `Candidate status mismatch for ${entry.key}; do not silently refresh.`);
    assert(ready || (!manifestMatches && !fileExists), `Ambiguous pending candidate for ${entry.key}.`);
    items.push({
      key: entry.key,
      text: entry.text,
      textSha256: sha256(Buffer.from(entry.text, 'utf8')),
      path: entry.path,
      candidateAtSnapshot: { manifestMatches, fileExists, fileBytes, audioSha256 },
    });
  }
  assert(seen.size === 862, 'Successor must have exactly 862 unique keys.');
  items.sort((a, b) => a.key.localeCompare(b.key));
  const ready = items.filter((item) => item.candidateAtSnapshot.audioSha256 !== null).length;
  assert(ready === 11 && items.length - ready === 851, 'Successor candidate counts differ from historical snapshot.');

  return {
    schemaVersion: 1,
    ledgerName: 'B5 Sound Safari and literacy narration',
    selectorProposal: 'b5-sound-safari-literacy',
    successor: {
      sourceCommit: SOURCE_COMMIT,
      supersedesLedgerSha256: PREDECESSOR_LEDGER_SHA256,
      exactTupleSha256: tupleSha256,
      tupleComparison: '862/862 exact key, text, and path tuples equal the a652 historical ledger.',
      changedSourcePaths,
    },
    source: { commit: SOURCE_COMMIT, sha256ByPath: sourceHashes },
    sourceInventory: { path: 'source-inventory.json', sha256: sha256(inventoryBytes), uniqueTexts: 862, exactSequences: 603 },
    voice: { language: 'en-US', providerVoice: 'matilda', outputDirectory: 'public/audio/en' },
    candidateSnapshot: {
      ready: 11,
      pending: 851,
      meaning: 'Byte presence and hashes do not establish decode, pronunciation, native playback, or listening quality.',
    },
    finiteExecutionPlan: {
      enabled: false,
      providerEndpoint: 'https://dinospace-eight.vercel.app/api/voice',
      maximumRequestsPerRun: 20,
      maximumUniqueRequests: 851,
      maximumRuns: 43,
      plannedRunCaps: Array.from({ length: 43 }, (_, index) => Math.min(20, 851 - index * 20)),
      rollingSharedLimit: { requests: 30, minutes: 10 },
      retryPolicy: 'No automatic retries. Each pending key is charged to the cumulative attempt set before its first provider request, including a failed or ambiguous request.',
      reusePolicy: 'Reuse the 11 snapshot files only when path and SHA-256 match candidateAtSnapshot. Later-produced bytes require a successful receipt bound to this exact successor ledger SHA, key, exact text, path, and audio SHA. A path or manifest match alone is insufficient.',
      producerSafety: {
        lock: 'tmp/offline-voice-generator.lock adjacent to the shared request journal',
        predecessorPid: 18781,
        gate: 'No paid run until PID 18781 is stopped, its journal is reconciled to terminal status, and the shared lock/journal are freshly checked.',
      },
    },
    items,
  };
}

async function main() {
  const mode = process.argv[2];
  if (!['--write-ledger', '--dry-run'].includes(mode)) throw new Error('Use --write-ledger or --dry-run.');
  const ledger = await makeLedger(sourceRootFromArgs());
  const canonical = Buffer.from(`${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  if (mode === '--write-ledger') {
    await writeFile(OUTPUT, canonical, { flag: 'wx' });
    process.stdout.write(`Created successor ledger; sha256=${sha256(canonical)}; tupleSha256=${ledger.successor.exactTupleSha256}; no provider calls.\n`);
    return;
  }
  const existing = await readFile(OUTPUT);
  assert(sha256(existing) === sha256(canonical), 'Successor ledger/snapshot changed; prepare a reviewed successor instead.');
  process.stdout.write(`${JSON.stringify({ result: 'dry-run-valid', ledgerSha256: sha256(existing), sourceCommit: SOURCE_COMMIT, exactTupleSha256: ledger.successor.exactTupleSha256, uniqueTexts: ledger.items.length, ready: ledger.candidateSnapshot.ready, pending: ledger.candidateSnapshot.pending, runCaps: ledger.finiteExecutionPlan.plannedRunCaps, providerCalls: 0, workerStarts: 0 }, null, 2)}\n`);
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
