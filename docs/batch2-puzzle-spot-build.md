# Batch 2 build: Puzzle Pop and Spot the Difference

## Scope

Implemented the two Batch 2 games in their owned components and added separate data and test modules. Both games now own their chapter and scene flow because the shared session wrapper does not wrap Spot and has never wrapped Puzzle Pop. Neither game was deployed or committed by this task.

## Puzzle Pop

- Three chapters contain four distinct scenes each (12 total), with 2×2, 3×3 and 5×5 boards.
- A seeded scene queue and piece tray are fixed for each run. Replay shuffles deterministically from its new seed and rotates the queue if it would exactly repeat the previous order.
- Learners see a picture preview, hear the directions again, select a piece, fit it to a board space, and can request a next-piece hint. Incorrect spaces receive retry feedback.
- Each completed picture presents a short fact and holds it until Next. Completing all four scenes unlocks the next chapter; the final chapter has an explicit finish and replay state.
- Completion and unlocked-chapter progress are stored per player. Diagnostics include numeric seed, level/round, outcome and hint counts; authored picture facts/titles are not included.

## Spot the Difference

- Three chapters contain four paired scenes each (12 total), increasing from 3 to 5 to 7 changes per pair.
- Each pair reuses a local scene illustration and adds positioned, code-drawn details to Picture A and Picture B. The changed details are operable 56px targets; blank areas provide wrong-tap feedback. The two magnifier hints highlight the next unfound detail and give a positional clue.
- The game reports found/total, reveals completed changes, and holds a short scene fact until Next. Completion of all four pairs unlocks the next chapter; the last chapter has an explicit finish/replay state.
- Run order and detail order use a numeric seed. Completed-pair and unlocked-chapter progress is stored per player. Diagnostics include seed, level/round, outcome, hints and wrong-tap count without authored scene text.

## Verification

- Added `test/puzzlePopBatch2.test.mjs` for scene counts and board sizes, deterministic and replay-varied queues/trays, complete tile indexes, child-specific progress, chapter gating and malformed storage.
- Added `test/spotDifferenceBatch2.test.mjs` for scene counts, 3/5/7 change counts, valid separated details, deterministic and replay-varied runs, child-specific progress, chapter gating and malformed storage.
- `npm test`: 116 passed, 0 failed.
- Targeted ESLint for both components, data modules and tests: passed.
- `npm run build`: passed. Vite reported existing outdated Browserslist data and large-chunk advisories; neither stopped the build.

## QA boundary

This is implementation and automated-test evidence only. Desktop and 390px rendered browser playthroughs, actual touch/keyboard interaction, narration playback, visual quality of the composited image pairs, and completion/reload/replay checks still require the independent frozen-preview QA run. Do not treat this report as acceptance or a 4.5 score.

## Navigation regression follow-up

Fixed a chapter navigation defect found during review: Next chapter now always advances one chapter from the current selection, even when later chapters are already unlocked. Unlock state continues to control which chapter cards may be selected in the intro. Added `test/batch2Navigation.test.mjs`, which loads both actual component modules through Vite and verifies Starter→Growing, Growing→Challenge, and Challenge→Challenge for each game's navigation helper. The final Puzzle Pop button now reads “See chapter reward,” matching its action of opening the reward card rather than replaying the chapter.

Focused regression: `node --test test/batch2Navigation.test.mjs` passes. The full tests, lint and production build should be rerun on the frozen integration candidate.
