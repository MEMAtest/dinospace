# Batch 4 arithmetic implementation report — 3 October 2026

## Scope

Implemented Addition Adventure and Subtraction Station as Amari chapter flows. Each has three named, sequential chapters and six seeded, distinct questions per run. Their component exports retain the existing `AdditionAdventure` and `SubtractionStation` names for root-owned catalog routing. No Askia or shared navigation files were changed.

## Implemented

- Addition uses bounded combine groups (sum 0–10), missing-part number bonds (whole 0–20), and short object stories (sum 0–20). The groups chapter has an empty-group zero model; number bonds use a whole/part diagram; combination and stories use labeled native vector counters and a result tray that fills only after a correct answer.
- Subtraction uses take-away (minuend 0–10), paired comparison groups (0–20), and short take-away stories (minuend 0–20). Comparison marks unmatched counters and explains difference without presenting it as removal. Equal and zero quantities are generated; negative answers are excluded.
- At Start each run freezes its seed, six-question queue, model, and answer choices. Wrong attempts and the one available clue do not replace questions. The correct explanation remains until Next. Replay creates a new seed, uses recent-question avoidance where the pool allows, and cannot award credit twice.
- Child-scoped progress sanitizes stored data, derives unlocks from contiguous completions, rejects locked/future awards, and awards only improved stars. `onCelebrate` receives `awardedStars * 4` only when the value is positive.
- Both flows report phases to the leave guard and emit start, question, answer-attempt, hint, correct-answer, completion, and leave events with game/level/round/seed identifiers and no prompt copy.
- Voice uses only the shared packaged-only option (`premium: false`) and supplies exact runtime text as segments. A finite exact-clip inventory has not yet been created or packaged; narration packaging, native runtime playback/cancellation, and human intelligibility remain pending gates.

## Focused checks

- `node --test test/batch4Arithmetic.test.mjs`: 5 passed.
- ESLint on both components, both arithmetic data modules, and the focused test: passed.
- The focused tests cover seeded reproducibility and variation, six-item uniqueness, option correctness and bounds, combine/bond/story semantics, zero/equality, distinct comparison models, and corrupted/future/orphaned progress records.

## Remaining acceptance gates

This is an implementation report, not game acceptance. Root integration must route both Amari components, remove any generic session wrapper that conflicts with their chapter ownership, and connect the existing chapter badge shelf. A separate fresh reviewer still needs to exercise all chapters, wrong/hint/correct/held-Next, replay/no-credit inflation, child isolation, keyboard/touch and 390px controls, narration playback/cancellation, console/network behavior, and rendered models at desktop and mobile. Finite voice clips need packaging and human listening. No production deployment or canonical evidence is claimed.
