# B7 Memory narration ledger and dry-run review

## Scope and source binding

This review adds a distinct `b7-memory-current` selector for the current B7 integration source. The prior generic `b7-memory` selector and consolidated inventory remain unchanged. The source binding is runtime commit `532e540da87b7f6a4197c84de39bb127f296fdef`, based on reviewed Memory baseline `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`. The new ledger SHA-256 is `6619f554efbfe852713bb2a9513f35760d6901f5ccf26fb6d53752f520513b58`.

The ledger pins six B7-owned source files: `MemoryMatch.jsx`, `data/index.js`, `memoryMatchContent.js`, `batch7Progress.js`, `voiceKey.js`, and `offlineVoiceManifest.js`. The test suite verifies their exact bytes from the pinned B7 commit. The ordered `(key, text, path)` binding is `2852f4fac5df0ab477ba354660f5face9a6f48339bc324fc3ca8d23420c86723`. It contains all 183 authored lines from `memoryNarrationLines(MEMORY_LEVELS)`, each at `/audio/en/<key>-matilda.mp3`; source/key/text/path mismatches fail closed.

## Candidate availability and finite plan

The snapshot has 2 exact packaged clips and 181 missing clips. The exact reusable entries are `626fc8ec` at `/audio/en/626fc8ec-matilda.mp3` (`dd050f705bb90bf46291f48a30dff84e30338139edaa17da8d50481d789bc8fb`) and `b1765fe5` at `/audio/en/b1765fe5-matilda.mp3` (`2eca41c609ce1daa585b2affc8803ab33998b016a26180ee5b1945b0b4862c0f`). Both files exist and match the pinned candidate bytes and manifest paths. No receipt file exists yet for this new ledger SHA, so these two are reusable by the pinned candidate hashes rather than described as receipt-bound. The remaining 181 keys are the only eligible request set. The read-only CLI dry-run agrees: 183 requested, 2 reusable, 181 pending, 0 snapshot-ready clips unavailable. The sorted pending-key digest is recorded in `dry-run.json`.

Paid execution is disabled in the ledger. If separately authorized later, the selector enforces at most 10 requests per run, 19 runs, and 181 distinct requests total. Its cumulative attempt sidecar is inventory-bound, allows only the pinned 181 pending keys, rejects duplicate attempts and foreign keys, and has no automatic retry path. The selector uses the existing shared lock, journal, request-rate limiter, and terminal predecessor check; it adds no parallel producer or alternate request path. CLI tests reject cap values above those limits before execution.

## Verification and limits

`node --test scripts/reviewedNarrationJobs.test.mjs` passes 27/27 tests. New tests verify the pinned source hashes and tuples, exact readiness split, cap bounds, duplicate/foreign/exhausted attempt rejection, and an isolated CLI dry-run that preserves its manifest and shared journal. The direct dry-run is read-only and shows the same 183/2/181 split. No provider call, paid run, journal mutation, manifest mutation, browser session, or audio-listening check was performed.

This is narration-job preparation evidence only. It does not establish generated audio, playback behavior, pronunciation quality, full ten-level gameplay acceptance, Askia collection ownership, or a 4.5 acceptance score. Existing two packaged clips are reusable source-bound files; the remaining 181 are not ready. The active B6 producer must reach its terminal/reconciled gate before any future paid execution is considered.
