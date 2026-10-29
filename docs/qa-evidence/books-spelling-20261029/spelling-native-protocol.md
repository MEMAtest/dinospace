# Spelling Studio native protocol

This is a source-bound normal-control protocol for the six Amari session levels. It uses the existing leased `amari-targeted-contained` Chromium page/profile and the runner's configured owner lease; it never opens a browser, tab, context, profile, or origin. The owner must verify `window.__amariQaNamespaced === true` after each navigation. Never use CLI `open`; navigation is `page.goto` on the already leased page.

## Matrix

Run each viewport on the compiled candidate and later on canonical production:

- Amari at 390×740 and 1440×844.
- The six normal session levels in order, with authored response targets `[5, 6, 7, 3, 6, 4]` (31 responses total).
- Modes: copy, missing-sound, then sound-built spelling for levels 3–6; longer pools must show the authored 4-, 5-, and 6–7-letter bands.
- Re-enter the same session through its ordinary UI after a held audio/leave probe. Do not reset or seed any progress.

The harness reads visible prompts, tiles, choices, mode labels, and exact stage counters. Its small test-side clue table maps the rendered cue to expected graphemes; answers are entered only by clicking visible controls. It does not read React/component internals or inject answers, seeds, stages, unlocks, rewards, or saved progress.

Optional Tricky Words and Caption Writing are secondary practice. The harness may explicitly scroll those secondary controls into view and records the initial/final geometry and scroll offset. After returning to the required stage, it scrolls back to the active card with a normal wheel gesture; all required prompt, clue, audio, tile, Next, Finish, Retry, level, and world controls still require full viewport geometry and a clear center hit before action.

## Required checks

For all six levels, record target/mode, visible pool word and length, unique words within the stage, actual tile or missing-sound controls, completion, local transaction, reward delta, and geometry before action (viewport containment and center hit-test). Include at least one real wrong response with the same word/clue retained for retry, one visible teaching clue with truthful assisted/non-mastery attribution, packaged playback followed by mute and Next/leave cancellation, and optional Tricky Words plus Caption Writing practice that leaves the parent stage counter and reward unchanged.

Fault probes use temporary one-key `Storage.prototype` wrappers on the namespaced logical keys, restored in `finally`: per-word write failure and readback failure with the word held for Retry; session write failure and committed-write/readback failure with the final word/fact held for Retry; and parent reward write failure on a stage with a calculated positive reward delta. Record the exact retry state before clicking Retry. If saved history leaves no positive delta, report the parent-claim probe as unavailable for that record; do not manufacture a clean profile or award.

Snapshot and compare the original `amari_game_levels_v1` bytes, sibling-player records, prior non-words reward claims/game counts, and unrelated progress rows. Verify local canonical completion prefix, each saved word transaction, parent `words:<attemptId>` claims exactly once for positive deltas, no replay farming, no provider requests, no page/console/resource/image failures, and no oversized/overlapping primary controls. Preserve one final screenshot per viewport and unique failure captures only. Keep partial rows and terminal stack traces if any step fails.

## Invocation

`run-spelling-native.py ORIGIN 390 740` and `run-spelling-native.py ORIGIN 1440 844` operate only on the owner-leased page. `SPELLING_START_LEVEL` defaults to `0`; use `1` only to continue a source-bound journey whose Level 1 was already completed by the prior partial report, preserving that saved run. The runner reads the compiled module identity from `dist/index.html` and writes a unique compact JSON report. Root owns build, page lease handoff, and production/canonical acceptance.
