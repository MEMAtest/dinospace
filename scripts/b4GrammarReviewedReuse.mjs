import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

export const B4_GRAMMAR_REUSE_LEDGER = 'docs/qa-evidence/b4-grammar-reviewed-reuse-20261005.json';
export const B4_GRAMMAR_REUSE_SHA256 = '0d512625d875990a54991451cee2b292fef2ce13be54ab3fd7eefc6a890c20ad';

// This supplements the unchanged 47-text ledger. It never creates provider
// receipts: the existing reuse verifier must still check actual audio bytes.
export async function applyB4GrammarReviewedReuse(items, root) {
  const bytes = await readFile(resolve(root, B4_GRAMMAR_REUSE_LEDGER));
  if (createHash('sha256').update(bytes).digest('hex') !== B4_GRAMMAR_REUSE_SHA256) {
    throw new Error('B4 grammar reviewed reuse ledger hash mismatch.');
  }
  const ledger = JSON.parse(bytes);
  if (items.length !== 47 || ledger.items.length !== 6) {
    throw new Error('B4 grammar reuse must retain all 47 texts and exactly six shared clips.');
  }
  const selected = new Map(items.map((item) => [item.key, item]));
  if (selected.size !== 47) throw new Error('Duplicate B4 grammar selected key.');
  const reuse = new Map();
  for (const entry of ledger.items) {
    const item = selected.get(entry.key);
    if (!item || item.text !== entry.text || item.path !== entry.path
        || item.sourceCommit !== ledger.correctedSourceCommit || reuse.has(entry.key)) {
      throw new Error(`B4 grammar reuse tuple mismatch for ${entry.key}.`);
    }
    reuse.set(entry.key, entry.sha256);
  }
  return items.map((item) => Object.freeze({
    ...item,
    expectedCandidateSha256: reuse.get(item.key) ?? item.expectedCandidateSha256,
  }));
}
