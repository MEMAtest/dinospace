# Batch 2 — four-game production uplift

22 October 2026. **Functional release and production rehearsal passed. Final 5/5 editorial acceptance remains pending human listening.** No new score is assigned and the earlier batch's separate Storybook speed/listening gates remain open.

## Released identity

- Runtime commit: `3e5c03db350c12cfdbe0295a180b058405031d38`.
- Canonical site: https://dinospace-eight.vercel.app.
- Vercel deployment: `dpl_VZwrqeqTGUkTdWbN847PVoRQ38y5`; immutable candidate: https://dinospace-1f0fgmo45-memas-projects-23a0001d.vercel.app.
- `candidate-identity.json` and `canonical-after.json` report the same READY deployment and commit. `prod-runtime.json` verifies the canonical entry bundle matches the candidate byte for byte: SHA256 `23bbb21b05154cb06e26d70e6a7cb053ac223e3cd450a0a95d6c4bb5fb1edb35`. Active caches are shell `amari-discovery-v25` and stable media `amari-discovery-media-v1`.
- The earlier runtime was `6960c53f`, recorded in `canonical-before.json`. Historical editorial acceptance is not transferred to this release.

## Changes and acceptance results

| Game | Uplift | Production evidence |
|---|---|---|
| Puzzle Pop | Roving keyboard grid and arrow movement; selection/placement focus; exact selected-piece crop; mobile board/tray scrolling only when needed; 48px minimum board cells; replayable facts. Preserves 9→16→25-piece progression. | All 12 scenes at 390×844 and 1440×844; 200 placements per viewport. Minimum phone board cell 48.8px. All three grids also pass wrong-placement recovery, keyboard selection/placement/hint focus and joint board/selected-crop visibility. |
| Spot the Difference | Pointer coordinates resolve the actual touched object when touch targets overlap; found targets stay neutral; replayable facts. Existing illustrated pairs retained after visual review. | All 12 pairs at 390×844 and 1440×844: 3→5→7 changes, 60 targets per viewport. Blank-space misses, distinct magnifier hints, Dino Park overlap and keyboard targets pass. Root inspected all 12 actual A/B renders; `visual/spot-spot-*-pair.webp` retains them. |
| Sky Shapes | Visible start/direction/finish guidance above the board; full SVG touch surface; new missions return to the top; measured precision rather than binary movement credit; keyboard help explicitly earns participation without fabricated pen accuracy. | All 12 missions at 390×844 and 1440×844 (11 mouse + one keyboard per viewport). Another 11 native Chromium CDP-touch missions plus one keyboard mission pass at 390px, including ordered multipart routes. Touch cancel, restart to 0%, and keyboard→restart→pointer remain truthfully classified as assisted. |
| Monster Math | Every six-question Growing and Story run guarantees three addition and three subtraction questions. Retains counters, two ten-frames, guided number-line jumps, held explanations and saved best rewards. | Three six-question episodes plus six-question counting replay at both sizes: 24 answers per viewport. Four unique answer options, actual visible counting quantities, wrong→clue recovery, one-step guided jumps, held feedback, replay variation and saved episode state after reload pass. Production includes the 15+1 high-first-addend case; counting quantity 10 was also exercised locally. |

`prod-puzzle-{390,1440}.json`, `prod-spot-{390,1440}.json` and `prod-sky-monster-{390,1440}.json` contain the full runs. `prod-supplement.json` records three ordinary varied queues each for Puzzle and Spot, persisted progress after reload, and all three puzzle keyboard/mobile cases. `prod-sky-touch.json`, `prod-sky-diagnostics.json` and `prod-spot-held.json` contain the additional input and 6.1-second held-fact checks. Native full-stage production runs report no page errors or provider requests; Sky/Monster additionally record zero console and asset failures.

`prod-profile-isolation.json` uses only the isolated synthetic browser: the second profile starts fresh with later bands locked and usable sound-off instructions in all four games. Amari's saved records remain unchanged. Completed scenes/missions/episodes and unlocks persist; interrupted boards, traces and question runs restart on re-entry. This release does not introduce partial-run resume.

## Audio, tests and limits

- `prod-playback.json`: native packaged narration playback advances beyond 150ms in every game, without provider requests. This verifies playback, not perceived pronunciation or volume.
- `narration-decode.json`: 1,373 current unique clips are present and SHA256-covered; 1,368 match prior full-decode hashes and five received current ffprobe plus full ffmpeg decoding. Zero failures; duration 43:27.883. No new voice/story jobs or image generation were performed.
- Experimental missing-addend/comparison tasks were deferred because correct packaged narration was absent. They were not needed for this batch's agreed maths contract and are not shipped silently.
- Full suite: 344 tests, 343 passed, one emitted-PWA audit initially skipped for missing `PWA_BUILD_DIR`. The separate `PWA_BUILD_DIR=dist` run passes all eight PWA checks with no skips. Scoped lint, build and diff checks pass. The existing build chunk-size warning remains.
- One final Spot desktop navigation exceeded the inherited 15-second load-event wait; the chooser was complete at inspection and the bounded retry passed all 12 pairs. See `navigation-observation.json`. These runs do not establish a general load-latency budget.
- Human listening for intelligibility, pronunciation, joins and perceived volume remains the final editorial gate. Teaching, progression, correctness/variation, visual/audio usability and reliability/navigation/persistence receive no invented 5/5 scores while that gate is open. No claim is made that the other catalogue games are complete.

## Storage and recovery

No worktrees, project copies, dependency installations, visible Chrome windows or extra browser tabs were created. One contained headless Chromium session was reused. Source artwork remains unchanged. Curated final screenshots live once in `visual/`; structured records are retained here, and bounded rehearsal inputs remain under `output/playwright/batch2-uplift-20261022`. Redundant CLI logs/source echoes and derived harness copies were removed after extracting their JSON results; exact removals are in `storage-manifest.json`. The task's local Vite server was stopped. No unrelated, ignored, or earlier batch evidence was removed.
