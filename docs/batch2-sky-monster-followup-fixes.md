# Sky Shapes and Monster Math follow-up fixes

This is a builder follow-up to findings in `docs/batch2-independent-qa.md` from the 5283 candidate. That independent report is preserved unchanged.

## Changes

- Monster Math now uses singular-aware count prompts and answers, story nouns and verbs, counter labels, ten-frame accessibility/explanation text, and number-line “step/steps” instructions. Examples include “Mira has 1 shell,” “One shell is left,” “1 counter stays,” and “jump back 1 step.”
- Counting answers display the correct final count immediately after a correct answer; the animation highlights the already-counted pictures without showing a transient incorrect number. Ten-frame equations and number-line destinations also show the correct result while the model animates.
- Sky Shapes `learning_attempt` details now include numeric level, round, and seed alongside difficulty. The existing diagnostics sanitizer retains those fields and excludes prompt/mission copy.

## Verification

- Added regression tests for singular count/story/operation wording, singular number-line steps, the stable count result text, and Sky learning-attempt seed/level/round diagnostics.
- `npm test`: 130 passed.
- `npm run lint`: passed.
- `npm run build`: passed. Existing Browserslist and large-chunk warnings remain.
- `git diff --check`: passed.

No deployment or commit was performed. These source fixes have not received a new independent browser acceptance pass.
