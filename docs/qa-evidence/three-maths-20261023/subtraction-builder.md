# Subtraction Station builder handoff

Date: 2026-10-23  
Scope: builder implementation only; browser acceptance belongs to the release QA pass.

## Changes

- Take-away and story questions use one set of starting objects. Tapping an object marks that same object as taken away; the model reports the marked count and the remaining count from that set. Selection is capped at the amount to remove, and Undo and Reset work before an answer is locked. A correct answer settles the same objects and equation even if the learner skipped the optional tapping.
- Comparison questions align Group A and Group B in pair tiles (two columns on narrow screens, four on wider screens). Empty slots and amber outlines identify the unpaired amount, including equal groups and zero.
- The question and subtraction equation remain visible. The model labels each activity as take-away, story, or comparison. After a correct answer, the learner can replay the existing packaged explanation narration.
- Chapter generation, six-question runs, question prompts, hint and mistake scoring, per-profile progress, and the non-negative arithmetic data are unchanged.

## Builder checks

- Scoped ESLint passed for `src/components/games/SubtractionStation.jsx`.
- Focused arithmetic, narration, and progression tests passed: `node --test test/batch4Arithmetic.test.mjs test/batch4Narration.test.mjs test/batch3ProgressionOwnership.test.mjs` (15/15).
- `git diff --check` passed. Browser layout, touch behavior, and audio replay acceptance remain for the independent browser pass.
