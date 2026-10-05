#!/usr/bin/env node
// Read-only decode verification for a saved offline voice readiness snapshot.
import { readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voiceClipKey } from '../src/data/voiceKey.js';

const execFileAsync = promisify(execFile);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONCURRENCY = 4;
const MAX_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 30_000;

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const isSha = (value) => typeof value === 'string' && /^[a-f0-9]{40}$/i.test(value);
const inside = (parent, child) => {
  const rel = relative(parent, child);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
};

function validateOptions({ sourceCommit, concurrency, timeoutMs }) {
  if (!isSha(sourceCommit)) throw new Error('--source-commit must be a 40-character Git SHA');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX_CONCURRENCY) {
    throw new Error(`--concurrency must be an integer from 1 to ${MAX_CONCURRENCY}`);
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 120_000) {
    throw new Error('--timeout-ms must be an integer from 1000 to 120000');
  }
}

function validateItem(item, index, seen) {
  const errors = [];
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return { errors: ['item must be an object'] };
  }
  const { key, text, path, ready } = item;
  if (typeof key !== 'string' || !/^[a-f0-9]{8}$/.test(key)) errors.push('key must be eight lowercase hex characters');
  if (typeof text !== 'string' || !text.trim()) errors.push('text must be a non-empty string');
  if (typeof path !== 'string') errors.push('path must be a string');
  if (typeof ready !== 'boolean') errors.push('ready must be a boolean');
  if (typeof key === 'string' && typeof text === 'string' && /^[a-f0-9]{8}$/.test(key)) {
    const expectedKey = voiceClipKey(text, 'en-US');
    if (key !== expectedKey) errors.push(`key does not match text (expected ${expectedKey})`);
    if (seen.has(key)) errors.push('duplicate voice key in snapshot');
    seen.add(key);
    const expectedPath = `/audio/en/${key}-matilda.mp3`;
    if (path !== expectedPath) errors.push(`path must be exactly ${expectedPath}`);
  }
  return { index, key, text, path, ready, errors };
}

async function runTool(executable, args, timeoutMs) {
  return execFileAsync(executable, args, {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
    windowsHide: true,
  });
}

async function inspectItem(item, publicRoot, { timeoutMs, ffprobePath, ffmpegPath }) {
  const result = { key: item.key, text: item.text, path: item.path, ready: item.ready, errors: [...item.errors] };
  if (result.errors.length) return result;
  if (!item.ready) {
    result.errors.push('readiness snapshot marks this clip missing');
    return result;
  }

  const expectedAbsolute = resolve(publicRoot, `.${item.path}`);
  if (!inside(publicRoot, expectedAbsolute)) {
    result.errors.push('resolved path escapes the explicit public directory');
    return result;
  }

  let actualPath;
  let before;
  try {
    actualPath = await realpath(expectedAbsolute);
    if (!inside(publicRoot, actualPath)) {
      result.errors.push('file or symlink resolves outside the explicit public directory');
      return result;
    }
    before = await readFile(actualPath);
  } catch (error) {
    result.errors.push(`missing or unreadable file: ${error.message}`);
    return result;
  }

  result.bytesBefore = before.length;
  result.sha256Before = sha256(before);
  try {
    const probe = await runTool(ffprobePath, [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', actualPath,
    ], timeoutMs);
    const duration = Number(probe.stdout.trim());
    if (!Number.isFinite(duration) || duration <= 0) {
      result.errors.push(`ffprobe returned a non-positive or non-finite duration: ${probe.stdout.trim() || '(empty)'}`);
    } else {
      result.durationSeconds = duration;
    }
  } catch (error) {
    result.errors.push(`ffprobe failed: ${error.message}`);
  }

  try {
    await runTool(ffmpegPath, [
      '-nostdin', '-v', 'error', '-xerror', '-i', actualPath,
      '-map', '0:a:0', '-f', 'null', '-',
    ], timeoutMs);
    result.fullDecode = true;
  } catch (error) {
    result.fullDecode = false;
    result.errors.push(`full ffmpeg decode failed: ${error.message}`);
  }

  try {
    const after = await readFile(actualPath);
    result.bytesAfter = after.length;
    result.sha256After = sha256(after);
    if (after.length !== before.length || result.sha256After !== result.sha256Before) {
      result.errors.push('file bytes changed during verification');
    }
  } catch (error) {
    result.errors.push(`could not re-read file after verification: ${error.message}`);
  }
  result.valid = result.errors.length === 0;
  return result;
}

async function mapLimit(items, concurrency, callback) {
  const output = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      output[index] = await callback(items[index]);
    }
  });
  await Promise.all(workers);
  return output;
}

export async function verifySnapshot({ snapshotPath, publicDirectory, sourceCommit, concurrency = DEFAULT_CONCURRENCY, timeoutMs = DEFAULT_TIMEOUT_MS, ffprobePath = 'ffprobe', ffmpegPath = 'ffmpeg' }) {
  validateOptions({ sourceCommit, concurrency, timeoutMs });
  if (!snapshotPath || !publicDirectory) throw new Error('--snapshot and --public-dir are required');
  const snapshotBytes = await readFile(snapshotPath);
  const snapshot = JSON.parse(snapshotBytes.toString('utf8'));
  if (!snapshot || !Array.isArray(snapshot.items)) throw new Error('readiness snapshot must contain an items array');
  if (snapshot.items.length === 0) throw new Error('readiness snapshot items array must not be empty');
  if (snapshot.uniqueClips !== undefined && snapshot.uniqueClips !== snapshot.items.length) {
    throw new Error(`snapshot uniqueClips (${snapshot.uniqueClips}) does not match items length (${snapshot.items.length})`);
  }
  if (snapshot.sourceCommit && snapshot.sourceCommit.toLowerCase() !== sourceCommit.toLowerCase()) {
    throw new Error(`snapshot sourceCommit ${snapshot.sourceCommit} does not match --source-commit ${sourceCommit}`);
  }
  const publicRoot = await realpath(publicDirectory);
  const seen = new Set();
  const validated = snapshot.items.map((item, index) => validateItem(item, index, seen));
  const results = await mapLimit(validated, concurrency, (item) => inspectItem(item, publicRoot, { timeoutMs, ffprobePath, ffmpegPath }));
  const errors = results.flatMap((item, index) => item.errors.map((message) => ({ index, key: item.key ?? null, text: item.text ?? null, path: item.path ?? null, message })));
  const report = {
    scope: 'Read-only full decode and stability check of files named by an exact saved readiness snapshot. This does not establish playback, pronunciation, naturalness, or human listening acceptance.',
    sourceCommit: sourceCommit.toLowerCase(),
    readinessJsonSha256: sha256(snapshotBytes),
    itemBindingSha256: sha256(Buffer.from(JSON.stringify(validated.map(({ key, text, path, ready }) => ({ key, text, path, ready }))))),
    publicDirectory: publicRoot,
    requested: results.length,
    valid: results.filter(({ valid }) => valid === true).length,
    missing: results.filter(({ ready, errors }) => ready === false || errors.some((message) => message.startsWith('missing or unreadable'))).length,
    invalid: results.filter(({ ready, errors, valid }) => ready !== false && valid !== true && !errors.some((message) => message.startsWith('missing or unreadable'))).length,
    concurrency,
    timeoutMs,
    results,
    errors,
  };
  return report;
}

function parseArgs(argv) {
  const options = { concurrency: DEFAULT_CONCURRENCY, timeoutMs: DEFAULT_TIMEOUT_MS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help') return { help: true };
    if (!['--snapshot', '--public-dir', '--source-commit', '--concurrency', '--timeout-ms'].includes(arg)) {
      throw new Error(`unknown option: ${arg}`);
    }
    const value = argv[++i];
    if (!value) throw new Error(`missing value for ${arg}`);
    const field = ({ '--snapshot': 'snapshotPath', '--public-dir': 'publicDirectory', '--source-commit': 'sourceCommit', '--concurrency': 'concurrency', '--timeout-ms': 'timeoutMs' })[arg];
    options[field] = ['concurrency', 'timeoutMs'].includes(field) ? Number(value) : value;
  }
  return options;
}

const help = `Usage: node scripts/verify-audio-snapshot.mjs --snapshot readiness.json --public-dir /path/to/public --source-commit <40-char-sha> [--concurrency 1..${MAX_CONCURRENCY}] [--timeout-ms 1000..120000]\n\nRead-only. Checks snapshot key/text/path bindings, safe local paths, positive ffprobe duration, full ffmpeg decode, and file hash stability. Emits JSON to stdout; exits 1 when any item fails.`;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(help);
    else {
      const report = await verifySnapshot(options);
      console.log(JSON.stringify(report, null, 2));
      if (report.errors.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error(`${error.message}\n\n${help}`);
    process.exitCode = 2;
  }
}
