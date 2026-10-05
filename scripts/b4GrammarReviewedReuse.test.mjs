import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { applyB4GrammarReviewedReuse, B4_GRAMMAR_REUSE_LEDGER } from './b4GrammarReviewedReuse.mjs';
import { selectJobItems, getCandidateReusablePath } from './reviewedNarrationJobs.mjs';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(root, 'docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json')));
const selected = selectJobItems(inventory, 'b4-grammar');

test('six exact shared clips enrich the complete unchanged grammar request set', async () => {
  const enriched = await applyB4GrammarReviewedReuse(selected, root);
  assert.equal(enriched.length, 47);
  assert.deepEqual(enriched.map(({ text, key, path, sourceCommit }) => ({ text, key, path, sourceCommit })),
    selected.map(({ text, key, path, sourceCommit }) => ({ text, key, path, sourceCommit })));
  assert.equal(enriched.filter((item) => item.expectedCandidateSha256).length, 6);
  for (const item of enriched.filter((entry) => entry.expectedCandidateSha256)) {
    assert.equal(await getCandidateReusablePath(root, {}, item), item.path);
  }
});

test('altered shared text, source, key, and duplicate selection are rejected', async () => {
  for (const field of ['text', 'sourceCommit', 'key', 'path']) {
    const changed = structuredClone(selected);
    changed.find((item) => item.key === '11d1317d')[field] += 'altered';
    await assert.rejects(applyB4GrammarReviewedReuse(changed, root), /reuse tuple mismatch/);
  }
  await assert.rejects(applyB4GrammarReviewedReuse(selected.slice(1), root), /retain all 47/);
  await assert.rejects(applyB4GrammarReviewedReuse([...selected.slice(1), selected[1]], root), /Duplicate/);
});

test('changed reuse-ledger bytes fail the pinned digest', async () => {
  const temp = await mkdtemp(resolve(tmpdir(), 'b4-reuse-ledger-'));
  try {
    const file = resolve(temp, B4_GRAMMAR_REUSE_LEDGER);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, `${await readFile(resolve(root, B4_GRAMMAR_REUSE_LEDGER), 'utf8')} `);
    await assert.rejects(applyB4GrammarReviewedReuse(selected, temp), /ledger hash mismatch/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('a same-path file with different bytes is never reusable', async () => {
  const temp = await mkdtemp(resolve(tmpdir(), 'b4-reuse-audio-'));
  try {
    const item = (await applyB4GrammarReviewedReuse(selected, root)).find((entry) => entry.key === '11d1317d');
    const path = resolve(temp, 'public', item.path.slice(1));
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, Buffer.alloc(1500, 5));
    assert.equal(await getCandidateReusablePath(temp, { [item.key]: item.path }, item), null);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
