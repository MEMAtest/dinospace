import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 30000 });
test('offline Batch4 dry run selects only its finite corpus and rejects conflicting selectors', () => {
  const check = run('scripts/generate-batch1-offline-voices.mjs', ['--batch4-only', '--dry-run']);
  assert.equal(check.status, 0, check.stderr);
  const summary = JSON.parse(check.stdout.trim());
  assert.equal(summary.requested, 5246);
  assert.equal(summary.ready + summary.pending, summary.requested);
  assert.ok(Object.keys(summary.breakdown).every((id) => id.startsWith('batch4')));
  assert.equal(summary.dryRun, true);
  const conflict = run('scripts/generate-batch1-offline-voices.mjs', ['--batch4-only', '--batch2-only', '--dry-run']);
  assert.notEqual(conflict.status, 0);
  assert.match(conflict.stderr, /at most one corpus selector/);
  const changed = run('scripts/generate-batch1-offline-voices.mjs', ['--batch4-only', '--dry-run', '--expected-inventory-sha=changed']);
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /finite narration inventory has changed/);
});
test('Batch4 supervisor refuses to begin without an explicit shared rate journal', () => {
  const result = run('scripts/run-batch4-voice-generation.mjs', []);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /explicit shared request-state journal/);
});
