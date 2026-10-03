# Batch 4 arithmetic source repair — 3 October 2026

## Scope and identity

Repairs were made to the isolated arithmetic candidate that began at `76cb59fb0e9dd6cd6e27191cb1e42eab7bafa5ac`. Scope is Addition Adventure and Subtraction Station source, their data/progress modules, focused arithmetic tests, and this report. The active Time Teller and Number Line Jump edits remain untouched. This is a local source verification report, not a browser acceptance, release, or 4.5 score.

## Independent hold findings and actions

- **Incorrect three-star threshold:** both screens previously accumulated clean answers and then counted the final correct round a second time. Each correct completion now adds one result record. The shared scorer counts those six completed records once; five independent correct results are required for three stars, and four produce two stars.
- **First attempt versus hint:** answer attempts now emit `correct: false` on wrong choices. `firstAttempt` records whether that round had a prior wrong choice; hint use is stored separately in each result. A hinted first choice therefore remains a first attempt while not counting as independent. Completion events include a bounded total hint count.
- **Progress and replay:** the canonical six-question queue is recorded at Start, so leaving an unfinished run also enters recent history. Recent IDs are normalized against the exact game and chapter pool. Locked/future completions, malformed runs, and orphaned progress are rejected. Replays use a fresh seed and do not repeat completed chapter credit.
- **Canonical run validation:** progress writes now require six unique IDs present in the exact canonical game/chapter pool, canonical prompt/model/explanation fields, integer operands/answers, semantic consistency, and four unique integer choices within the chapter answer range. This rejects invented IDs, forged prompts, negative operands, oversized operands, wrong semantic types, and out-of-range choices.
- **Take-away model and clue:** removed objects are crossed/marked in the starting group before the child answers, and the clue refers to those visible marks. The result tray stays empty until a correct choice, so the remaining total is not printed early. After success, source groups move toward the result with a reduced-motion-aware CSS transition; no delayed callbacks or unmanaged timers are used.
- **Comparison meaning and layout:** equal groups ask about unpaired counters and explain that the groups are the same size with zero unpaired. Unequal groups retain the larger-group wording. The comparison model is two labeled side-by-side groups, with amber rings revealed only after a correct answer.
- **Illustrations and zero:** authored apple, shell, star, flower, gem, and cookie stories now render matching native SVG shapes rather than identical colored circles. Empty groups receive an explicit `0 (empty)` label.
- **Narration:** arithmetic uses a finite word-segment inventory derived from the bounded canonical prompt, clue, and explanation text. Calls retain `premium: false` and require exact packaged segment matches. No audio clips were generated or packaged; playback and intelligibility remain an independent gate.
- **Rewards and chapters:** explanation remains held behind Next for all six rounds. A chapter becomes complete only after the final Next. Celebration passes the actual `addition` or `subtraction` game ID and only runs for first chapter completion, preventing replay award inflation.

## Focused source checks

- `node --test test/batch4Arithmetic.test.mjs`: **9 passed**.
- Focused ESLint over both arithmetic components, both arithmetic data modules, and the arithmetic test: **passed**.
- Tests now cover 4-versus-5 clean scoring, hint/attempt separation, canonical and forged run rejection (including invalid IDs, text, types, integer/range constraints), equal/zero comparisons, exact finite narration segmentation, and recent history for abandoned runs.

## Remaining gate

A fresh independent reviewer still needs to exercise the rendered desktop and 390px controls, six held-Next rounds, wrong/hint/correct sequences, object motion and screen-reader output, story-object visuals, replay rewards, and packaged narration availability. No full build, deployment, production check, or audio generation was run for this repair.
