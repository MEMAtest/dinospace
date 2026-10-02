# Monster Math leave-guard regression

## Cause and repair

The Back handler changed Monster Math to its `done` phase before asking the app to navigate away. The app's leave guard then displayed its confirmation dialog while the game component stayed mounted. Choosing “Keep playing” dismissed only the dialog, leaving the game on the completion/reward screen even though the run had no answers.

The handler now records the leave intent and delegates navigation to the app without changing the game phase. The existing final-question completion path remains the only path that transitions a run to `done`, after completion has been saved.

## Verification

- Focused regression test: `node --test test/batch2MonsterMath.test.mjs` (9/9 passing). It asserts that leave intent cannot set `done` and that the completion path checks for a saved completion before doing so.
- Actual local UI: `http://127.0.0.1:5192/#/play/math`; no paid API or story calls.
- Completed Starter once (6/6), used “Replay episode” (fresh run at Question 1/6, score 0/6), selected Back, and confirmed the leave dialog appeared over the active question. “Keep playing” returned to the same Question 1/6 and 0/6 state. This reproduces the saved-replay case from the report.
- Repeated the leave-confirmation and Keep playing check at 390×844. `innerWidth`, document width, and body width were all 390px; no horizontal overflow. Console had no errors or warnings (one standard React DevTools info message).
- Screenshots: [desktop replay state](../output/playwright/monster-math-leave-replay-desktop.png), [mobile 390px replay state](../output/playwright/monster-math-leave-replay-mobile-390.png).

No deploy or production data changes were made.
