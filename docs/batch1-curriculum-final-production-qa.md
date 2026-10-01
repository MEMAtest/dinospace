# Curriculum Quest final production walkthrough

1 October 2026. Canonical https://dinospace-eight.vercel.app. Release `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`, deployment `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`. Rendered script `index-Bjt4H7n4.js`, CSS `index-BjKMFMwR.css`. Isolated browser profile; real rendered controls, no injected answers/progress.

## Six completed runs

| Viewport | Module / band | Questions | Numeric seed | Result |
|---|---|---:|---:|---|
| 1280×800 | Continents / Starter | 5 | 3810630286 | Complete, badge saved |
| 1280×800 | Time Detectives / Starter | 5 | 3201952098 | Complete, badge saved |
| 1280×800 | Nature / Starter | 5 | 1239025690 | Complete, badge saved |
| 390×844 | Nature / Growing | 5 | 2264755903 | Complete, badge saved |
| 390×844 | Time Detectives / Challenge | 5 | 1051838192 | Complete, badge saved |
| 390×844 | Continents / Challenge | 5 | 3946674736 | Complete, badge saved |

Every run reached round five and its finite completion screen; no three-answer restart or mid-run difficulty change. All bands represented across the six-game gate. This is not six runs per module/band.

## Interactions and learning

- Geography wrong Asia when asked Africa gave a retry clue without advancing; correct Africa kept an Explorer fact visible until explicit Next. Kenya/Egypt examples appeared. Other observed facts explained Asia's size, east/right, Atlantic/Arctic/Indian location, natural beaches, and plan views.
- History wrong first smartphone in the letter/landline/smartphone sequence kept the step available. Correct ordering explained chronology. Castle artefacts, photographic limits, older seaside photos and lighting chronology were tested. Challenge expanded to four communication items and comparing disagreeing sources, interviews and modern maps. Each correct answer had a durable explanation/Next.
- Nature wrong cat for bird gave explanatory retry; robin, oak tree, glass, rabbit and frog all completed with facts. Growing tested wood versus chair, summer weather, an investigable paper-absorption question, and seedling prediction then observation. A prediction of equal growth was saved as an idea, not marked wrong; the visible seven-day observation supported the watered-seedling conclusion.
- Hear-why control clicked for Africa. Packaged audio controls available on prompts, choices, lesson, facts and vocabulary. Full audio/network coverage from independent preceding candidate checks remains separately scoped.
- Each newly selected band starts with its teaching bridge where applicable, then questions from the selected band. Growing Nature finished explicitly as Growing, Challenge paths as Challenge.

## Persistence / navigation / diagnostics

- Shelf showed six of nine path badges and 34 test stars. Full reload, Amari reselection, and reopening Stickers retained the exact six badges and 34 stars.
- Back prompted Leave the game; Back to world returned to `/world/explore`. World header Back returned to Home. No forced direct-home return from game.
- Actual Grown-ups hold gate → Game troubleshooting → Download game log exported `output/playwright/batch1-curriculum-final-production-log.json`: 52 events, six `level_complete` entries above, stable numeric seed and band per run, correct rounds 0–4. Only keys `at`, `difficulty`, `event`, `firstAttempt`, `game`, `round`, `seed`; no names/story text.
- 390px document width remained 390. Nature and Geography current checks showed no broken images. Console: zero errors, zero warnings.
- CLI locator mistakes (using visible button text instead of accessible labels, attempting navigation before confirming Leave dialog) timed out; corrected using fresh snapshots. These were automation mistakes, not counted as product failures.

## Acceptance scope

The exact-release six-run, finite-progress, fact/retry, saved-badge and diagnostics gates passed. Earlier independent immutable checks establish exhausted-pool replay shuffle and adaptation on the next mount; they remain local evidence, not retrospectively relabeled production. Answer-position balance/generator-wide distribution and final editorial score require separate evidence/review. No blanket all-games or 4.5 claim is made here.

## Exact-release follow-up acceptance

After the recorded reload, re-entering Curriculum through Explore automatically selected Challenge (no injected settings). This is next-mount adaptation after the earlier frozen Starter runs. At 390px every visible button measured at least 48px in both dimensions; module tabs were 354×57.5px. A further full five-question Challenge Geography run selected south-of-England waterway, England's capital, globe versus flat map, east direction, and today's weather. None repeated the preceding Challenge run's Atlantic/Arctic/beach/plan/Indian prompts; the changed queue completed normally. Challenge badge count remained two of three (idempotent); all seven visible run completions are distinct from the six-run minimum. The previous Starter east item may appear in another band: recent-history isolation is by module and band.

Independent source-level distribution review (same Curriculum source as release): 143 definitions, 104 direct-choice variants, exactly one keyed correct choice and unique option IDs. Seeds 1–10,000 × cursors 0–4 produced 5.2 million placements: [1,733,992, 1,717,144, 1,748,864], about 33.35/33.02/33.63 percent. Worst individual spread 0.61 percentage points. This is generator/content simulation, not millions of browser runs; spatial map pins and semantic chronology intentionally retain their positions.


## Follow-up production delta: 7d9d961 (1 October 2026)

Canonical deployment `dpl_7guvWUZ3ocswiVGXcLbVrewzaEq8` is READY with exact source SHA `7d9d96166f4bd4d2b283b761dcfbaae5dd3b0256`. Fresh browser HTML rendered `index-C0jdAtV8.js` and `index-BH3dde_v.css`. This is focused acceptance of the changed diagnostics, separate from the six full 86e3ecf gameplay runs above.

At 390×844, actual controls completed a five-question Starter geography run: harbour map key, Europe, North America, Antarctica, Africa. A wrong school-symbol answer produced a sailor clue; choosing the anchor produced an explanatory fact and required explicit Next. Europe retained its UK/France fact; Africa retained the Atlantic/Indian Ocean and Kenya/Egypt fact until Next. The run ended at a finite completion screen. Try-this-round-again retained the Europe question and generated a replay record; restarting the finished level produced Australia and a fresh seed. Back requested confirmation and returned to Explore & Languages, then home.

Manual prompt, corrective-feedback and explanation audio controls were exercised. Grown-ups was opened through the three-second hold, then Game troubleshooting / Download game log exported uniquely to `output/playwright/batch1-curriculum-7d9-release-log.json`. The export retains earlier baseline logs; only events at or after 02:46 UTC belong to this delta. Its 20 new records comprise start=1, question=6 (one intentional same-question retry), answer_attempt=1, answer_correct=5, hint=3, replay=2, level_complete=1, leave=1. All five question cursors 0–4 have matching correct answers under stable seed 1212381145. Completion occurred once after the final explicit Next. The restarted but intentionally abandoned run uses seed 1120586678. All new records contain a numeric seed; keys are allowlisted metadata only, with no authored prompts, choices or child name. Document width remained 390px at a 390px viewport.

Two automation selector mistakes were corrected from fresh snapshots: answer controls use the `Choose` prefix, and retry resets the active question rather than showing a new Start button. The exit-confirmation control is named Back to world. These were harness mistakes, not failed game actions.
