# B7 Memory narration ledger: independent safety review

Reviewed source commit: `497b7498a0c0d9323fec93803aadccde96087532`.

Reviewed the six requested files only: `scripts/reviewedNarrationJobs.mjs`, `scripts/reviewedNarrationJobs.test.mjs`, `scripts/run-reviewed-narration-job.mjs`, and the ledger, dry-run output, and report under `docs/qa-evidence/b7-memory-narration-ledger-20261005/`.

## Source and queue binding

- Ledger SHA-256 matches the pinned `6619f554efbfe852713bb2a9513f35760d6901f5ccf26fb6d53752f520513b58`.
- All six source file hashes match the exact B7 runtime commit `532e540da87b7f6a4197c84de39bb127f296fdef`.
- Recomputed `memoryNarrationLines(MEMORY_LEVELS)` from that source commit: all 183 phrases, keys, and `/audio/en/<key>-matilda.mp3` paths exactly match the ledger; all phrases and keys are unique. The ordered binding hash matches `2852f4fac5df0ab477ba354660f5face9a6f48339bc324fc3ca8d23420c86723`.
- The ledger's two ready items are `626fc8ec` and `b1765fe5`; the other 181 are the only allowlisted pending keys. Candidate reuse is bound to exact snapshot bytes and manifest mapping; no new-ledger receipt is claimed for the two existing clips.
- The direct read-only CLI dry run returned 183 requested, 2 reusable, 181 pending, and 0 snapshot-ready files unavailable. Its pending keys agree with the ledger's pinned list.

## Safety and regression checks

- Memory-specific caps are 10 requests per run, at most 19 runs, and 181 unique requests. The run schedule sums to 181. Attempts are persisted before the provider request, restricted to the pinned pending set, and duplicates/unknown keys are rejected; automatic retry is disabled.
- Paid mode requires explicit limits, the reviewed inventory digest, a terminal and reconciled B4 predecessor record tied to its current manifest, and the existing shared producer lock/journal. Existing output bytes with no matching snapshot hash or exact receipt are refused before replacement. No runner execution or lock acquisition was attempted in this review.
- The new selector is additive. The existing `b7-memory`, B6, and Solar selectors remain present; the 28-test suite passed, including the retained B6/Solar selector and Solar dry-run checks.
- `node --test scripts/reviewedNarrationJobs.test.mjs`: **28/28 passed**. Direct dry-run only; no provider requests, shared journal writes, manifest edits, or browser activity.

## Finding

Low priority: if the B7 Memory invocation reaches its configured total-call limit, the `stopReason` branch in `scripts/run-reviewed-narration-job.mjs` labels it as a “B7 Solar teaching invocation cap” (around line 323). This does not change the enforced cap or permit an extra request, but should say B7 Memory before a paid run so the audit record is accurate.

## Conclusion

The pinned ledger, ready-clip reuse, 181-key allowlist, finite caps, and read-only dry-run are verified. The review did not execute any paid mode and makes no claim about generated audio or listening quality. The active B6 worker remains an operational gate: any later run must wait for its terminal/reconciled state and the shared producer lock to be free, then run serially under the existing plan.
