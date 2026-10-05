import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ARTIFACT_DIR = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(ARTIFACT_DIR, 'source-inventory.json');
const OUTPUT = resolve(ARTIFACT_DIR, 'ledger.json');
const SOURCE_COMMIT = 'a652ad6cf33b72e3ef3ff523b70cc773bfcbbb18';
const PER_RUN_CAP = 20;
const REQUEST_CAP = 851;
const RUN_CAP = Math.ceil(REQUEST_CAP / PER_RUN_CAP);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function sourceRootFromArgs() {
  const index = process.argv.indexOf('--source-root');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Pass --source-root <clean checkout at a652ad6>.');
  return resolve(process.argv[index + 1]);
}

async function makeLedger(sourceRoot) {
  const revision = spawnSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  assert(revision.status === 0, 'Could not read source checkout revision.');
  assert(revision.stdout.trim() === SOURCE_COMMIT, `Expected source ${SOURCE_COMMIT}, got ${revision.stdout.trim()}.`);
  const status = spawnSync('git', ['-C', sourceRoot, 'status', '--porcelain'], { encoding: 'utf8' });
  assert(status.status === 0 && status.stdout.trim() === '', 'Source checkout must be clean; do not bind the ledger to uncommitted edits.');

  const sourceInventoryBytes = await readFile(INPUT);
  const inventory = JSON.parse(sourceInventoryBytes.toString('utf8'));
  assert(inventory.source?.commit === SOURCE_COMMIT, 'Inventory source commit differs.');
  assert(inventory.inventory?.uniqueTextEntries === 862 && inventory.inventory?.exactSequences === 603, 'Inventory totals differ from audited corpus.');
  assert(inventory.packagedNarration?.ready?.uniqueClips === 11 && inventory.packagedNarration?.pending?.uniqueClips === 851, 'Candidate readiness changed; prepare a reviewed successor ledger instead.');

  const sourceHashes = {};
  for (const file of inventory.source.hashes) {
    const actual = sha256(await readFile(resolve(sourceRoot, file.path)));
    assert(actual === file.sha256, `Frozen source bytes differ: ${file.path}`);
    sourceHashes[file.path] = actual;
  }
  const keyModule = await import(pathToFileURL(resolve(sourceRoot, 'src/data/voiceKey.js')).href);
  const manifestModule = await import(pathToFileURL(resolve(sourceRoot, 'src/data/offlineVoiceManifest.js')).href);
  const { voiceClipKey } = keyModule;
  const manifest = manifestModule.OFFLINE_VOICE_MANIFEST;

  const seen = new Set();
  const items = [];
  for (const voiceItem of inventory.voiceItems) {
    assert(typeof voiceItem.text === 'string' && voiceItem.text.trim(), 'Empty narration text in source inventory.');
    assert(voiceItem.key === voiceClipKey(voiceItem.text, 'en-US'), `Key/text mismatch for ${voiceItem.key}.`);
    assert(voiceItem.path === `/audio/en/${voiceItem.key}-matilda.mp3`, `Unexpected Matilda path for ${voiceItem.key}.`);
    assert(!seen.has(voiceItem.key), `Duplicate key ${voiceItem.key}.`);
    seen.add(voiceItem.key);

    const manifestMatches = manifest[voiceItem.key] === voiceItem.path;
    let fileBytes = null;
    let audioSha256 = null;
    try {
      const audio = await readFile(resolve(sourceRoot, 'public', voiceItem.path.slice(1)));
      fileBytes = audio.length;
      audioSha256 = sha256(audio);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const fileExists = fileBytes !== null;
    const ready = manifestMatches && fileExists && fileBytes > 0;
    assert(ready === voiceItem.ready, `Snapshot readiness mismatch for ${voiceItem.key}; no silent refresh.`);
    assert(ready || (!manifestMatches && !fileExists), `Ambiguous existing candidate for pending key ${voiceItem.key}.`);
    items.push({
      key: voiceItem.key,
      text: voiceItem.text,
      textSha256: sha256(Buffer.from(voiceItem.text, 'utf8')),
      path: voiceItem.path,
      candidateAtSnapshot: { manifestMatches, fileExists, fileBytes, audioSha256 },
    });
  }
  assert(seen.size === 862, `Expected 862 unique voice keys, got ${seen.size}.`);
  items.sort((left, right) => left.key.localeCompare(right.key));
  const ready = items.filter((item) => item.candidateAtSnapshot.audioSha256 !== null).length;
  assert(ready === 11 && items.length - ready === REQUEST_CAP, 'Ready/pending totals differ from the frozen review.');

  return {
    schemaVersion: 1,
    ledgerName: 'B5 Sound Safari and literacy narration',
    selectorProposal: 'b5-sound-safari-literacy',
    source: { commit: SOURCE_COMMIT, sha256ByPath: sourceHashes },
    sourceInventory: {
      path: 'source-inventory.json',
      sha256: sha256(sourceInventoryBytes),
      uniqueTexts: 862,
      exactSequences: 603,
    },
    voice: { language: 'en-US', providerVoice: 'matilda', outputDirectory: 'public/audio/en' },
    candidateSnapshot: {
      ready: 11,
      pending: 851,
      meaning: 'Byte presence and hashes do not establish decode, pronunciation, native playback, or listening quality.',
    },
    finiteExecutionPlan: {
      enabled: false,
      providerEndpoint: 'https://dinospace-eight.vercel.app/api/voice',
      maximumRequestsPerRun: PER_RUN_CAP,
      maximumUniqueRequests: REQUEST_CAP,
      maximumRuns: RUN_CAP,
      plannedRunCaps: Array.from({ length: RUN_CAP }, (_, index) => Math.min(PER_RUN_CAP, REQUEST_CAP - index * PER_RUN_CAP)),
      rollingSharedLimit: { requests: 30, minutes: 10 },
      retryPolicy: 'No automatic retries. Each pending key is charged to the cumulative attempt set before the first request, including a failed or ambiguous request.',
      reusePolicy: 'Reuse the 11 snapshot files only when path and SHA-256 match candidateAtSnapshot. Any later-produced bytes require a successful receipt bound to this exact ledger SHA, key, exact text, output path, and audio SHA. A path or manifest match alone is not proof of reuse.',
      producerSafety: {
        lock: 'tmp/offline-voice-generator.lock adjacent to the shared request journal',
        predecessorPid: 18781,
        gate: 'No selector integration or paid run until PID 18781 is stopped, its journal is reconciled to terminal status, and the shared lock/journal are freshly checked.',
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
    process.stdout.write(`Wrote read-only ledger artifact; sha256=${sha256(canonical)}; no provider or worker calls.\n`);
    return;
  }
  const existing = await readFile(OUTPUT);
  assert(sha256(existing) === sha256(canonical), 'Ledger or candidate snapshot changed; stop and review a successor ledger.');
  process.stdout.write(`${JSON.stringify({
    result: 'dry-run-valid',
    ledgerSha256: sha256(existing),
    sourceCommit: ledger.source.commit,
    sourceInventorySha256: ledger.sourceInventory.sha256,
    uniqueTexts: ledger.items.length,
    readyAtSnapshot: ledger.candidateSnapshot.ready,
    pending: ledger.candidateSnapshot.pending,
    plannedRunCaps: ledger.finiteExecutionPlan.plannedRunCaps,
    providerCalls: 0,
    workerStarts: 0,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
