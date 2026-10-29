# Dino Jigsaw native acceptance protocol

Status: **prepared, not executed**. Root owns browser leasing and native/production execution. No game source, browser state, user progress, or profile was changed by this preparation.

## Bounded runner

`run-jigsaw-matrix.py` runs exactly one normal-UI level in the already-open `amari-targeted-contained` session. It refuses to run unless `tmp/amari-qa-browser-owner.json` names an active, unexpired `pair9-jigsaw` lease. It does not open a browser/tab/context, make a new profile, reset storage, or seed progress. It requires the already-built `dist/index.html`; it never builds. Retain the root-provided same-origin/page lease and API guard before invoking it.

Example (root runs after lease and supplies the matching compiled entry basename):

```sh
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 1 390 native
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 2 390 native
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 3 390 native
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 4 390 native
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 5 390 native
```

Repeat in the same increasing order at 1440 px; do the corresponding Amari sequence for levels 3, 4, 5. After native candidate passes, repeat against the explicitly approved production origin using `production`. Each row is a separate invocation because each level must be reached through normal saved progression; earlier level buttons must be visible in the UI. Two viewports are 390×740 and 1440×844. Output JSON names include stage, player, level, viewport, and timestamp; output is never overwritten. Only failures retain a small viewport screenshot.

The callback uses the piece crop's rendered CSS geometry to identify its matching grid cell, then acts through child-facing controls. It records each hit-tested tile, slot, and held review control; `elementFromPoint` must resolve the center to the actual control. It tries one deliberately wrong placement against an empty wrong slot followed by retry in the first puzzle, uses tap controls throughout, and performs one pointer drag plus one keyboard Space/Enter placement where the grid has enough pieces. Each of four rounds must hold the explanation and expose Next/Finish. Every observed control must be at least 44×44 CSS px and entirely within the viewport. It captures task, board, tray and feedback geometry and rejects horizontal overflow or a scrolled puzzle. The runner decodes visible puzzle images and compares the selected child's target game fields, all other game/reward fields, sibling state and existing sticker IDs; it emits individual local-record hashes and the actual saved target commit/reward delta. For backwards compatibility, it treats `dino:jigsaw:little:<transaction>` and legacy `dinojigsaw:little:<transaction>` as the same Jigsaw claim, and `dino:chess:<transaction>` and legacy `chess:<transaction>` as the same Chess claim. It asserts the QA storage namespace, supplied compiled module identity, no page/console errors, failed resources/requests, or `/api/` requests.

It explicitly replays the existing packaged Dino Jigsaw instruction, verifies that its source is under `/audio/`, and toggles sound off while it is playing; a pause/end event for that exact source is required before play starts. The media observer is installed once in the current document after normal navigation, without a persistent init-script stack. This checks the existing recorded instruction and mute cancellation only; it does not claim all child audio or narration quality.

## Optional native fault runs

Use these in order before any ordinary completion of the same levels, so no reset or test seed is needed and each successful Retry can naturally unlock the next level:

```sh
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 1 390 native progress-write
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 askia 2 390 native progress-readback
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 amari 3 390 native reward-write
python3 docs/qa-evidence/chess-jigsaw-20261029/run-jigsaw-matrix.py http://localhost:5180 amari 4 390 native reward-readback
```

Synthetic interception arms only immediately before the visible final `Finish game` action and matches the selected child's exact logical storage key. It captures the attempted transaction ID. A blocked `setItem` is rejected before the original method, without changing its value; readback cases allow the genuine first write then throw once on its confirming `getItem`. The callback waits for and geometrically checks the actual `Retry saving this result` control, asserts the required held-data boundary, restores original `Storage.prototype` methods before retry, retries the same transaction, and verifies one saved result/reward. Parent reward faults are attempted only if the current level is not at its three-star best and is beyond the legacy reward ceiling; the harness intentionally makes exactly one wrong attempt, then completes all other placements correctly, so a one- or two-star best can naturally improve to three. Otherwise the run completes normally and reports `unavailable` without modifying data to force eligibility. The original methods are restored again from `finally` on every path.

For a single emulated-touch sample, add `--emulated-touch` to only one 390×740 Level 5 run per native/public matrix. The helper uses one transient CDP session attached to the existing selected page; it sends touchStart/moves/touchCancel and checks zero placements, then touchStart/moves/touchEnd and checks exactly one. It records actual `pointerType: touch` events, disables emulation and detaches in `finally`. This is emulated touch coverage, not physical-device certification. The flag is rejected at other levels or widths.

The optional `--verify-replay` flag performs one normal Go home → reopen → browser reload → same-level replay after the first saved result. It requires the selected level to remain available, verifies reload itself changes no protected records, then completes the same four puzzles through normal tap controls and asserts the replay result/reward delta is zero. It uses the existing child data only; no raw storage edits or seeds.

## Root-owned acceptance checks still required after runner output

- Compare the protected snapshot hashes and parsed rows: only the selected player's Dino Jigsaw fields may change; sibling progress, other little-game entries and prior reward claims/stickers must remain intact; allow only the current game’s verified reward delta.
- Confirm the recorded result persists, then leave/reopen through the normal parent navigation and reload once. Compare the same saved level, play count and result after reopening. Replay the same completed level and verify zero added reward/duplicate claim.
- On a naturally eligible, reward-positive run only, verify a real progress `setItem` failure retains the held result, offers Retry, and does not claim a saved result/reward before retry. Restore the original method and retry the same transaction; verify exactly one progress advance and one reward. Separately test a readback `getItem` failure and parent reward write failure with the UI's stable Retry/reopen path. Do not fabricate eligibility or reset existing child data to force a reward test.
- Check the real board/tray/feedback/primary actions together at 390×740 and 1440×844, including the 12-piece board. The callback checks each control when used; it does not certify that every simultaneously visible control remains within the viewport when the page scrolls.
- Confirm all six target scenes remain distinguishable from the rendered image/art and current prompt. Question prompt records were inventoried separately; no new audio/art assets or provider calls are part of this acceptance.
- End at the correct parent screen; confirm no leave confirmation appears after a completed result, while leaving an active unsolved run still gives genuine confirmation.

No browser journey, storage fault, reload, production check, or acceptance result is claimed by this preparation artifact.
