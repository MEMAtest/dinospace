import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const statePath = resolve(root, 'tmp/offline-voice-request-state.json');
const statusPath = resolve(root, 'tmp/batch2-voice-generation-status.json');
const pidPath = resolve(root, 'tmp/batch2-voice-generation.pid');
const logPath = resolve(root, 'tmp/batch2-narration-generation-2026-10-02.log');
const maxRuns = 200;
const maxCooldownRetries = 3;
const requestWindowMs = 10 * 60 * 1000;
const requestLimit = 30;
const minimumCallsPerRun = 10;
const sleep = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

await mkdir(resolve(root, 'tmp'), { recursive: true });
await writeFile(pidPath, `${process.pid}\n`);

const log = async (event, data = {}) => {
  const line = JSON.stringify({ at: new Date().toISOString(), event, ...data });
  await appendFile(logPath, `${line}\n`);
  console.log(line);
};
const updateStatus = async (status, details = {}) => {
  await writeFile(statusPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), pid: process.pid, status, ...details }, null, 2)}\n`);
};
const readJournal = async () => {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    const now = Date.now();
    return {
      requests: Array.isArray(state.requests) ? state.requests.filter((request) => Number.isFinite(request.at) && now - request.at < requestWindowMs) : [],
      blockedUntil: Number.isFinite(state.blockedUntil) ? state.blockedUntil : 0,
    };
  } catch {
    return { requests: [], blockedUntil: 0 };
  }
};
const runGenerator = () => new Promise((resolveRun) => {
  const child = spawn(process.execPath, ['scripts/generate-batch1-offline-voices.mjs', '--batch2-only', '--max-calls=20'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; process.stdout.write(chunk); });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; process.stderr.write(chunk); });
  child.on('error', (error) => resolveRun({ code: 1, stdout, stderr: `${stderr}\n${error.message}` }));
  child.on('close', (code) => resolveRun({ code: code ?? 1, stdout, stderr }));
});

let cooldownRetries = 0;
let lastSummary = null;
try {
  const priorLog = await readFile(logPath, 'utf8');
  const priorRuns = priorLog.split(/\r?\n/).filter(Boolean).reverse();
  for (const line of priorRuns) {
    try {
      const event = JSON.parse(line);
      if (event.event !== 'run_finished') continue;
      lastSummary = {
        exitCode: event.exitCode,
        generated: event.generated,
        reused: event.reused,
        pending: event.pending,
        stoppedAt: event.stoppedAt ?? null,
      };
      break;
    } catch { /* ignore malformed or incomplete progress-log lines */ }
  }
} catch { /* first run has no progress log to recover */ }
try {
  await log('started', { maxRuns, maxCooldownRetries, requestLimit, requestWindowMinutes: 10, logPath, statusPath });
  await updateStatus('running', { run: 0, cooldownRetries, lastResult: null });

  for (let run = 1; run <= maxRuns; run += 1) {
    let journal = await readJournal();
    const now = Date.now();
    if (journal.blockedUntil > now) {
      const waitMs = journal.blockedUntil - now + 1000;
      if (cooldownRetries >= maxCooldownRetries) throw new Error('Maximum recorded cooldown waits reached; stopping safely.');
      cooldownRetries += 1;
      await log('waiting_recorded_cooldown', { waitSeconds: Math.ceil(waitMs / 1000), cooldownRetry: cooldownRetries, cooldownRetriesMax: maxCooldownRetries });
      await updateStatus('waiting_cooldown', { run: run - 1, cooldownRetries, waitUntil: new Date(now + waitMs).toISOString(), lastResult: lastSummary });
      await sleep(waitMs);
      journal = await readJournal();
    }

    const availableCalls = Math.max(0, requestLimit - journal.requests.length);
    const minimumBatch = Math.min(minimumCallsPerRun, Number.isInteger(lastSummary?.pending) ? lastSummary.pending : minimumCallsPerRun);
    if (availableCalls < minimumBatch) {
      const expiries = journal.requests.map((request) => request.at + requestWindowMs).sort((left, right) => left - right);
      const expiriesNeeded = minimumBatch - availableCalls;
      const waitUntil = expiries[expiriesNeeded - 1] + 1000;
      const waitMs = Math.max(1000, waitUntil - Date.now());
      await log('waiting_request_window', { requestsInWindow: journal.requests.length, availableCalls, minimumBatch, waitSeconds: Math.ceil(waitMs / 1000) });
      await updateStatus('waiting_request_window', { run: run - 1, cooldownRetries, waitUntil: new Date(waitUntil).toISOString(), requestsInWindow: journal.requests.length, availableCalls, minimumBatch, lastResult: lastSummary });
      await sleep(waitMs);
      run -= 1;
      continue;
    }

    await log('run_started', { run, requestsInWindow: journal.requests.length, remainingRuns: maxRuns - run });
    await updateStatus('running', { run, cooldownRetries, requestsInWindow: journal.requests.length, remainingRuns: maxRuns - run });
    const result = await runGenerator();
    const outputLine = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1) || '';
    let summary = null;
    try { summary = JSON.parse(outputLine); } catch { /* preserve only redacted status below */ }
    lastSummary = summary ? {
      exitCode: result.code,
      generated: summary.generated,
      reused: summary.reused,
      pending: summary.pending,
      stoppedAt: summary.stoppedAt ?? null,
    } : { exitCode: result.code, summaryAvailable: false };
    await log('run_finished', {
      run,
      exitCode: result.code,
      generated: Number.isInteger(summary?.generated) ? summary.generated : null,
      reused: Number.isInteger(summary?.reused) ? summary.reused : null,
      pending: Number.isInteger(summary?.pending) ? summary.pending : null,
      stoppedAt: typeof summary?.stoppedAt === 'string' ? summary.stoppedAt : null,
      stderrPresent: Boolean(result.stderr.trim()),
    });
    await updateStatus('running', { run, cooldownRetries, lastResult: lastSummary });

    if (result.code === 75 && summary?.stoppedAt === '429') continue;
    if (result.code !== 0) throw new Error(`Generator exited ${result.code}; stopping on non-rate-limit failure.`);
    if (!summary || !Number.isInteger(summary.pending)) throw new Error('Generator summary was unavailable; stopping safely.');
    if (summary.pending === 0) {
      await log('completed', { run, pending: 0, generatedTotalFromPilotAndWorkerNotTracked: true });
      await updateStatus('completed', { run, cooldownRetries, pending: 0, completedAt: new Date().toISOString() });
      process.exitCode = 0;
      break;
    }
    if ((summary.generated ?? 0) === 0 && (summary.reused ?? 0) === 0) {
      throw new Error('Generator made no progress; stopping safely.');
    }
    if (run === maxRuns) throw new Error(`Finite run limit ${maxRuns} reached with ${summary.pending} clips pending.`);
  }
} catch (error) {
  const message = String(error?.message || error)
    .replace(/https?:\/\/\S+/g, '[redacted-url]')
    .replace(/(?:api[_-]?key|token|secret)\s*[:=]\s*\S+/gi, '[redacted-credential]');
  await log('stopped_error', { message });
  await updateStatus('stopped_error', { error: message, cooldownRetries, stoppedAt: new Date().toISOString() });
  process.exitCode = 1;
} finally {
  await writeFile(pidPath, `${process.pid}\n`);
}
