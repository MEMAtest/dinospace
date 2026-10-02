# Amari quality goal resumed — 3 October 2026

The user explicitly restated the 26-game 4.5/5 objective. The goal tool returned no existing goal, so a new active goal was created with that objective, without a token budget.

## Published acceptance contract

`docs/game-quality-4.5-roadmap.md` contains exactly 26 game rows matching the Amari catalog. An independent contract review confirmed the count. Commit `52b73e0` publishes finite-pool randomization rules, comparable progression exceptions, canonical production evidence requirements, a five-dimension scoring rubric and concrete additional checks for every title. Historical Batch 1 acceptance is explicitly distinct from new full current-production verification. The working branch was pushed; this is not a product deployment.

## Current batch and changes

Batch 2 remains Puzzle Pop, Spot the Difference, Sky Shapes and Monster Math. A Luna builder fixed the first-missed-tap diagnostic marker in Spot the Difference and added first-attempt/retry regression coverage. Full current tests: 155 pass, zero fail; lint and production build pass. This source fix is committed on the working branch and awaits the batch release gate. Product production remains the separately accepted `d31239453edf438b5a88ab788db942f2dae76fea` release.

The new acceptance matrix requires 24 completed runs across four games: three desktop and three 390px runs per game, covering every band, with bounded additional started replay checks. Seeds must come from real UI starts and exported diagnostics; no PRNG/state injection. Independent Luna testers are executing actual production controls in separate isolated sessions, splitting Puzzle/Spot and Sky/Monster. Their reports must retain passed, failed and untested cases, not count representative checks as completed acceptance.

## Narration checkpoint and recovery

The old PID 87713 was absent on resumption. Its status/log preserved 802 pending clips at 23:26:58 UTC on 2 October with no recorded generator error. No stale lock or other generator process existed. The cause of process termination was not established. A detached shell launch did not start, so the authorized finite worker was resumed in managed exec session 36845, PID 27199, at 23:35:12 UTC. It retained the request journal, already-generated assets and provider/MIME validation; no duplicate generation was requested. After two batches the pending count fell to 772, with no errors or cooldown retries. The worker remains bounded and must be supervised by status, log and live PID, never by status alone.

Read-only local corpus inventory: Puzzle 73/73, Spot 55/55, Sky 39/39, Monster 420/1,192. `docs/qa-evidence/batch2-audio-container-check-20261003.json` records successful full decode and positive duration for all 167 three-game clips (2.043–10.542 seconds). This proves file integrity only. It does not prove intelligibility, prosody, playback cancellation, mobile sound controls or released availability. Manifest and newly generated audio remain dirty by design while the worker checkpoints.

## Required next actions

1. Review fresh independent gameplay findings and repair reproduced failures.
2. Supervise narration to completion; run `node scripts/generate-batch1-offline-voices.mjs --batch2-only --check-ready` when complete.
3. Review actual playback of complete and segmented lines, cancellation and sound-toggle behavior at both widths.
4. Freeze a complete candidate; pass its meaningful tests, lint/build and independent controls; release and bind production evidence to exact deployment, source SHA and rendered assets.
5. Publish the four per-game scorecards only when mandatory gates and the 4.5 scoring bar are met, then implement Batch 3 (Count the Stars, Letter Trace, Cosmic Tic-Tac-Toe, Dino Detective). Prepared plans are retained.

The overall goal is active and unfinished. No additional game was declared 4.5 from these preparatory checks.
