# Independent review: B5 Sound Safari finite narration selector

Date: 2026-10-05

## Reviewed identity

- Frozen repository: `work/dinospace-game-editor-fixes`, HEAD `2691977f630211b29ed2a7eec20646b28de1c85b`.
- Selector: `b5-sound-safari-literacy`.
- Exact successor ledger: `docs/qa-evidence/b5-sound-safari-narration-ledger-20261005/successor-c636516/ledger.json`, SHA-256 `5d6630518ec00b2d4c92fd869ce79db38e611c604f24172092626b443ce206c0`.
- Source identity: Sound Safari art source `c636516afa9ffa1b77dcc3bd5b7353ee80bce567`; runner pins 13 source paths/hashes. The focused inventory test reads each path from that exact Git commit and checks its hash.

## Findings

The selector is source- and ledger-bound. Validation checks the 862 distinct phrase tuples, key derivation, exact English audio paths, 13 source hashes, unchanged predecessor tuple digest, and the 11-ready/851-pending snapshot. The dry-run independently returned 862 requested, 11 reusable, 851 pending and eligible, and zero unavailable snapshot-ready entries.

The finite plan is enforced in the B5-specific validator and selector: at most 20 calls per run, 43 runs, and 851 distinct pending keys overall. Attempt keys must belong to the pinned snapshot-pending set; duplicate attempts are rejected. The ledger's planned run sizes are forty-two groups of 20 and a final group of 11. The shared rolling limit is 30 requests per 10 minutes. Failed or ambiguous attempts are charged before dispatch, and the code has no automatic retry path.

Receipt reuse requires the exact inventory SHA, producer, key, path, source commit, voice, MIME type, text hash, byte count and audio hash; the file bytes are rehashed. Snapshot reuse requires the expected snapshot hash. A manifest entry alone is insufficient. The missing-manifest fixture placed one snapshot-ready item and one receipt-backed item on disk with an empty manifest; classification returned both as reusable, no generation-pending items, and `claimB5SoundSafariRunWhenPending` left the run budget unchanged. That fixture verifies the helper/budget behavior; it is not an end-to-end paid CLI execution.

The paid path requires an explicit shared B3 journal, resolves and verifies its canonical path, checks the reconciled predecessor record and current B4 manifest hash, and rejects a live PID 18781. The runner uses the B3 producer's exact adjacent `offline-voice-generator.lock`, refusing an existing lock; the focused suite verifies that lock path and collision refusal. It snapshots the shared journal and rechecks its hash immediately before each request. Attempts are recorded before the provider request; failed provider responses stop without retry, and the `finally` path writes the audit and releases the lock.

## Validation performed

- Focused selector tests: `node --test --test-name-pattern='B5 Sound Safari' scripts/reviewedNarrationJobs.test.mjs` — 3 passed, 0 failed.
- Full supervisor tests: `node --test scripts/reviewedNarrationJobs.test.mjs` — 23 passed, 0 failed.
- Targeted ESLint on `scripts/run-reviewed-narration-job.mjs`, `scripts/reviewedNarrationJobs.mjs`, and `scripts/reviewedNarrationJobs.test.mjs` — passed.
- Read-only dry-run used the exact ledger SHA above — 862 selected, 11 reusable, 851 allowlisted pending, 0 snapshot-ready unavailable.
- Working tree remained unchanged by review/test commands except for the pre-existing unrelated untracked `docs/qa-evidence/batch3-trace-cosmic-local-20261003/desktop/repair-M-wrongstart.png`; it was not staged.

## Scope and release limits

No provider request, worker start, browser session, paid execution, or manifest/journal write was performed. The actual PID 18781 gate was not challenged by invoking paid mode; the predecessor helper's live-PID refusal and terminal/hash checks are fixture-tested, and the B5 CLI routes through that same guard before entering the paid executor. The selector remains disabled in the ledger and is not activated by this review. Static bytes, selector accounting, and fixture behavior do not prove MP3 decode, playback, pronunciation, or human listening quality. The separate worker/PID 18781 stop-and-reconcile gate remains mandatory before any future paid run.
