# Batch 4 read-only post-worker audio verification

Date: 2026-10-05

## Scope and safety

`scripts/verify-audio-snapshot.mjs` consumes a saved JSON readiness snapshot and an explicit `public` directory. It checks that every row has the expected English voice key for its exact text, a unique key, and the exact `/audio/en/<key>-matilda.mp3` path. It verifies that resolved files remain inside the supplied public directory, reports snapshot-missing and filesystem-missing files, probes for a finite positive duration, runs a complete `ffmpeg` decode, and compares byte count and SHA-256 before and after both checks. Work is bounded to at most eight simultaneous files and a timeout of 1–120 seconds per tool invocation. Output includes the snapshot file hash, an ordered item-binding hash, the explicitly supplied source commit, and per-item key/text/path/results.

The command only reads inputs and prints JSON to stdout. It does not call a provider, write audio, edit a manifest or readiness snapshot, start/stop a worker, or decide whether clips sound correct. Decode success is not a pronunciation, playback, naturalness, or human-listening acceptance claim. The saved snapshot must come from `check-batch4-voice-readiness.mjs --json` in the exact source checkout being checked. The operator supplies and verifies that checkout's full commit SHA; if the snapshot itself has a `sourceCommit` property, the command also enforces equality.

## Fixture verification

The fixture suite `node --test test/verify-audio-snapshot.test.mjs` creates and removes temporary files outside the repository. It exercises a valid generated MP3, a truncated MP3 alongside another valid row (confirming failures aggregate rather than aborting the batch), a symlink that resolves outside the public directory, key/text/path mismatch, invalid source SHA, and the concurrency bound. Results on this date: 5/5 passed. Scoped ESLint passed for the new script and test. No project audio or manifest was read or changed by these tests.

## Final corpus invocations

Run only after the narration worker is terminal and its journal/artifact state has been reconciled. Keep the two snapshots and results separate. The commands below intentionally use a fresh temporary evidence directory and do not alter either source checkout.

```sh
ROOT=/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-game-editor-fixes
AC3_SOURCE=/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-batch4-quality
AC3_SHA=ac3b3ccaf03107749d865f8d79557e872a06c881
OUT=$(mktemp -d)
test "$(git -C "$AC3_SOURCE" rev-parse HEAD)" = "$AC3_SHA"
node "$AC3_SOURCE/scripts/check-batch4-voice-readiness.mjs" --json > "$OUT/ac3-readiness.json"
node "$ROOT/scripts/verify-audio-snapshot.mjs" --snapshot "$OUT/ac3-readiness.json" --public-dir "$AC3_SOURCE/public" --source-commit "$AC3_SHA" --concurrency 4 --timeout-ms 30000 > "$OUT/ac3-decode.json"
```

For the corrected grammar snapshot, check out the exact reviewed `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128` source into a separate clean directory first; do not move the ac3 checkout or reuse its JSON. Then run:

```sh
FE5_SOURCE=/absolute/path/to/clean/fe5aeff-checkout
FE5_SHA=fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128
test "$(git -C "$FE5_SOURCE" rev-parse HEAD)" = "$FE5_SHA"
node "$FE5_SOURCE/scripts/check-batch4-voice-readiness.mjs" --json > "$OUT/fe5-readiness.json"
node "$ROOT/scripts/verify-audio-snapshot.mjs" --snapshot "$OUT/fe5-readiness.json" --public-dir "$FE5_SOURCE/public" --source-commit "$FE5_SHA" --concurrency 4 --timeout-ms 30000 > "$OUT/fe5-decode.json"
```

For durable evidence, copy the resulting JSON reports into a new, dated evidence directory only after the worker is terminal; retain each readiness snapshot byte-for-byte. A nonzero verifier exit means at least one row failed. Review the per-row results and errors rather than interpreting an aggregate count alone.

## Current limits

No 5k-clip corpus run was performed while the narration worker may still be active. This report records the verifier and its temporary-fixture checks only; it makes no claim about current Batch 4 audio completeness or quality.
