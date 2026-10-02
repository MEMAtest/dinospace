# Batch 2: Sky Shapes and Monster Math

## Build scope

This implementation adds two standalone games to the existing component integration. `JetSkyShapes` and `MonsterMath` accept the normal `playerId`, `onPhaseChange`, `onGameEvent`, narration, sound, celebration, and back callbacks; no shared routing, hook, or game-session files were changed.

Sky Shapes contains three skies and twelve missions. The first sky practices single simple outlines, the second adds curved and multi-part familiar forms, and the third combines several outlines into flying machines and buildings. Missions use numbered green start dots, a red finish, sampled tracing paths, distance tolerance, on-route accuracy, three star thresholds, mouse/touch pointer input, and Enter/Space/arrow-key tracing. A player must finish the four missions in a sky to unlock its badge and the next sky.

Monster Math contains three episodes: counting to ten, addition and subtraction within twenty, and short word problems. Each run has six deterministic questions, unique within the run, with four distinct answer choices and varied correct-answer positions. The visual models match each question: countable picture groups, a twenty-space ten-frame, or a number line. Wrong answers allow another try; correct explanations and the counter/jump animation remain until the child presses Next. Clues, question replay, stars, episode badges, and explicit replay are included.

Progress is stored separately per child. Both games persist completion, best results, unlocks, and a bounded recent-question/mission history. Lifecycle diagnostics use numeric seed/level/round fields and fixed skill/item identifiers, without authored prompts or child names. Both components expose start/play/done phase changes.

## Verification

- Added data and persistence tests in `test/batch2SkyShapes.test.mjs` and `test/batch2MonsterMath.test.mjs`.
- `npm test`: 126 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed. Vite reports the existing large-chunk warning and stale Browserslist data warning.
- `git diff --check`: passed.

## Independent acceptance still required

This is implementation and automated-data verification, not browser acceptance. The independent tester should verify both games at desktop and 390px, especially pointer capture/trace tolerance and keyboard-guided traces, touch behavior, feedback-to-Next gating, all six Monster Math rounds and their visual arithmetic models, interruption/back behavior, replay seed changes, player isolation, rewards/unlocks, narration and sound controls, and console/runtime errors. No deployment or commit was performed.

## Follow-up from independent QA

The 5282 report remains intact at `docs/batch2-independent-qa.md`; its earlier exact-order replay observation is the pre-fix result. The data queue now compares a candidate replay with the persisted last four mission IDs and rotates a matching permutation, so even the same seed cannot replay the just-finished exact order. A regression test covers all three skies and multiple seeds.

Monster Math's operation model now exposes twenty explicit cells, visibly splitting an 11 + 2 problem into 11 orange counters and 2 blue counters with seven empty spaces. This fixes the screenshot ambiguity for addends above ten. Correct equations and number-line destinations display the final answer immediately while the model highlights its animation, so no intermediate count is presented as a false equation result.

Follow-up verification: `node --test test/batch2SkyShapes.test.mjs test/batch2MonsterMath.test.mjs`, full `npm test`, `npm run lint`, `npm run build`, and `git diff --check` passed. On a local Vite browser at `http://127.0.0.1:5182`, a completed Cloud Meadow fixture with the prior order Mountain Peak → Round Sun → Kite → Window Cloud was replayed with seed `71234`; the new order began Round Sun → Kite → Window Cloud → Mountain Peak, and the saved queue differed from the prior order. In Monster Math, a UI run with seed `15` reached 11 + 2 and displayed 11 orange plus 2 blue counters, `11 + 2 = ?`, and the correct answer 13 among distinct choices. Screenshot: `.playwright-cli/page-2026-10-01T10-05-15-728Z.png`.

The Grown-ups UI log export was retained at `output/playwright/batch2-sky-monster-followup-game-log.json`: 17 events from the local fixture, with numeric seeds 15 for `math` and 71234 for `jet`, and no prompt/text/name fields. Math's six-question run was intentionally left on its last unanswered question; this is focused regression evidence, not a completed-run claim. Independent acceptance at desktop and 390px remains required.
