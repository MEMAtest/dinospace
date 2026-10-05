# Independent follow-up: B4 grammar reuse mapping guard

Date: 2026-10-05
Reviewed source commit: `3412bd3686acc883104fd22e4c42e718e80881d0`
Current documentation HEAD at review: `02413bdb1184e35633d62984d80ed4f99abf8e26` (docs-only cumulative import)
Pinned B4 grammar inventory SHA-256: `9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001`
Pinned six-row reuse proof SHA-256: `0d512625d875990a54991451cee2b292fef2ce13be54ab3fd7eefc6a890c20ad`

## Review result

The final mapping guard closes the conflict-path gap left open in the earlier review of `051b540`. `assertB4GrammarExactMappings` permits an absent mapping or the exact expected path and throws on a different non-null path. The runner calls it during B4 grammar preflight before mutation or provider work. The existing reuse verifier still validates file bytes; the helper does not create provider receipts or expand the six-row proof.

The retained missing-manifest fixture covers a different edge: when all 47 fixture items are already reusable and six exact mappings are absent, it repairs only those mappings before budget accounting, with zero runs, zero provider requests, and an unchanged isolated journal, even with the fixture journal saturated. The new conflicting-path fixture supplies valid expected audio but points one of the six manifest keys elsewhere; it asserts failure before a write/request and unchanged fixture manifest and journal.

I reran the two focused runner fixtures (2/2 passed) and the four reuse-helper tests (4/4 passed) at the reviewed tree. The frozen test transcript records the complete supervisor suite at 29/29 and scoped ESLint passing. These are local fixture/source checks; no live provider, browser, worker, real journal, or real manifest was used or changed. The source test's fake transport does not establish audio playback or human listening quality.

## Lineage carried forward

The original independent proof remains in [`report.md`](report.md) and [`cross-batch-candidate-proof.json`](cross-batch-candidate-proof.json). It binds six exact existing files to the B2 decode record, B2 packaging commit, canonical blobs, current bytes, and unchanged 47-item B4 inventory. The seven B4-generated receipts remain separate from cross-batch reuse. This follow-up reviews the helper safeguards against that proof; it does not turn reused assets into B4-generated receipts.

The two corrected helper conditions now have bounded evidence: missing exact mappings are repaired without consuming paid-run budget, while a conflicting path fails closed. This review is not authorization to resume a paid run. The separately required worker/journal/terminal reconciliation and any human listening assessment remain outside this review.
