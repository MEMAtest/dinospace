# Batch 4 independent editorial assessment

Date: 4 October 2026  
Games: Addition Adventure, Subtraction Station, Time Teller, Number Line Jump  
Contract: [Amari games 4.5/5 quality roadmap](../game-quality-4.5-roadmap.md)  
Implementation specification: [Batch 4 arithmetic, number line and time plan](../../../dinospace-batch4-quality/docs/batch4-arithmetic-time-implementation-plan-20261003.md)

## Ratings and decision

The scores below rate supported non-audio dimensions using the final retained rendered mechanics matrix and the corresponding authored source review. They do not promote a local candidate to production acceptance.

| Game | Age-6 teaching | Meaningful progression | Correctness and fair variation | Formal feedback / audio / visual dimension | Reliability / navigation / persistence | Measured visible feedback / visual component |
|---|---:|---:|---:|---|---:|---:|
| Addition Adventure | 4.5 | 4.5 | 4.5 | Pending packaged audio and human listening | 4.5 | 4.5 |
| Subtraction Station | 4.5 | 4.5 | 4.5 | Pending packaged audio and human listening | 4.5 | 4.5 |
| Time Teller | 4.5 | 4.5 | 4.5 | Pending packaged audio and human listening | 4.5 | 4.5 |
| Number Line Jump | 4.5 | 4.5 | 4.5 | Pending packaged audio and human listening | 4.5 | 4.5 |

The roadmap combines feedback, audio and visual usability as one formal dimension. The rendered-feedback and visual components support 4.5, but the packaged audio gate remains open; therefore that formal dimension and each overall mean are pending. No Batch 4 4.5 award is made, and the recorded verified count remains 4.

## Source and evidence lineage

- The full independent mechanics run is frozen candidate source `01e10f75d3658133db4b3a1ffd269f0ee34c7c35`, `http://127.0.0.1:5227`, identity [`batch4-final-repair-identity-20261003.json`](../../../dinospace-batch4-quality/docs/qa-evidence/batch4-final-repair-identity-20261003.json). Its four served runtime assets matched identity; 195 tests, full ESLint and production-config build passed. Independent Playwright used fresh guarded desktop `1280×800` and mobile `390×844` profiles with visible controls and ordinary unlocks. No production deployment or production identity was tested.
- The full rendered results are in [`batch4-final-repair-local-20261003/report.md`](../../../dinospace-batch4-quality/docs/qa-evidence/batch4-final-repair-local-20261003/report.md). It records all four games completing 3 chapters × 6 rounds at both widths, plus a same-band replay at both widths. It covers actual wrong/hint/correct/held-Next sequences, reward and replay accounting, sibling-profile checks, reload and the related Time Detectives / Maths return paths. The report found no console messages/errors/warnings in either profile.
- Earlier frozen candidate `d96e5d7ad08483163e375a4ddbe358a346163922` at `http://127.0.0.1:5221` was explicitly held in [`batch4-independent-local-20261003/report.md`](../../../dinospace-batch4-quality/docs/qa-evidence/batch4-independent-local-20261003/report.md). That report caught quarter-hour clock wrap, crowded ticks, the then-text-only frog, zero-removal clue copy, reload route loss, metrics and replay gaps. The final `5227` report then retested the clock wrap in both directions, number-line tick spacing/frog/A-B markers, zero-removal clue, route reload and accounting. Those earlier findings are not carried forward as current defects where the final report demonstrates the repair.
- The current isolated B4 source checkout is at `ac3b3cc` and has no canonical production deployment. Comparing it with the tested `01e10f7` shows the later source work adds packaged phrase segmentation and cancellation call sites, plus canonical-pool exports for the offline inventory; the retained full gameplay report remains bound to `01e10f7`. A narrower frozen `fa47bf7` browser delta at `5235` exercised ordinary Hear/Next/Keep playing/Back/reload controls, but the mission lines were unavailable because most clips were missing. It reported no native mission playback and cannot verify sound, playback cancellation, or changed runtime narration.
- I read the finite worker status JSON once, without restarting or changing the worker. Its recorded snapshot at `2026-10-04T11:50:02.871Z` showed PID `18781`, `waiting_request_window`, run 198, with last result 14 generated, 2,817 reused and 2,351 pending. This is a timestamped snapshot, not a current completion claim. The worktree manifest/audio files were left untouched.

## Per-game rationale

### Addition Adventure

- **Age-6 teaching — 4.5.** The authored order moves from joining two visible groups (totals 0–10), to filling a missing part in a whole/part diagram (0–20), to short familiar addition stories. Instructions and clues name one strategy at a time; the visible empty group labels zero explicitly. The final matrix exercised wrong choice, count-on clue, correction and held explanation.
- **Meaningful progression — 4.5.** “Put Groups Together,” “Number Bonds,” and “Addition Stories” change model and reasoning task, not just the numeric ceiling. Each has six frozen questions. Full ordinary completion, badge unlock, replay and improvement accounting were observed at desktop and mobile.
- **Correctness and fair variation — 4.5.** The current source defines bounded sums for each chapter, matching vector objects and result trays, unique valid answer choices, seeded six-item queues, and recent-question avoidance where the pool allows. The final rendered matrix completed all chapters and a full Addition Stories replay at both widths; visible manipulatives matched the selected equations.
- **Visible feedback / visual component — 4.5.** Objects form labeled groups; result trays fill only after a correct answer; wrong feedback and one-step clues retain the same question; the worked answer stays visible until Next. The full matrix exercised these states on both viewports. The final local run reported no console or static-asset failures.
- **Reliability / navigation / persistence — 4.5.** Full chapter rewards, replay, shelf persistence, reload and Amari/Askia separation were observed across the final matrix. The UI-exported diagnostic recorded wrong attempts as `correct:false` and a successful answer with one learning-credit event. This is local evidence, not production verification.

### Subtraction Station

- **Age-6 teaching — 4.5.** “Take Away” shows the starting group and marks removed objects before the answer; “Compare Groups” pairs counters and counts unpaired objects without depicting comparison as removal; “Subtraction Stories” uses clear take-away language. The source supports zero, equal groups and non-negative results. The final run exercised 5−5=0, removing zero and the corrected zero-removal clue.
- **Meaningful progression — 4.5.** Three six-question chapters introduce removal, a distinct comparison model, and story transfer. All three were completed and the Take Away chapter replayed at both sizes.
- **Correctness and fair variation — 4.5.** Source validation bounds operands and answers, matches the model to operation type, uses four unique in-range choices, and freezes six unique questions at Start. The final UI run observed equality, zero-removal, wrong/clue/correct, and held results. A 2★→3★ replay improved the best and added one star; an equal-best replay did not add credit.
- **Visible feedback / visual component — 4.5.** Removed objects are visibly crossed, equal comparison shows no unmatched counters, and the remaining count is withheld until a correct answer. The final matrix verified the zero clue against the zero-removal situation and held explanation through Next.
- **Reliability / navigation / persistence — 4.5.** The current progress code derives unlocks from contiguous chapter completion, validates canonical question IDs/models, and only credits improved stars. The final rendered matrix checked replay/reward deduplication, profile separation, shelf persistence, and reload.

### Time Teller

- **Age-6 teaching — 4.5.** Clock Explorers focuses on o’clock and half past; Past and To adds quarter past/quarter to; Daily Routines asks the child to read or set familiar times with the time-of-day context stated. The short red hour hand and long blue minute hand are named in the visible lesson and held explanations. The year/day ambiguity is avoided by giving routine context in the mission rather than asking an analogue clock to reveal AM/PM.
- **Meaningful progression — 4.5.** The three six-mission chapters add read-clock, quarter-time, and hand-setting/routine work. The final matrix completed all 18 missions and a full Daily Routines replay at both widths.
- **Correctness and fair variation — 4.5.** The generator uses unique read-time labels, supported o’clock/half/quarter values, and set/read tasks in Daily Routines. Rendered hand angles matched sampled options. The final UI tested the repaired boundary both ways: 12:45 +15 minutes became 1:00; 1:00 −15 minutes returned to 12:45 at desktop and mobile.
- **Visible feedback / visual component — 4.5.** The analog clock, color-distinguished hands, hint, wrong-hand correction, check action, and held explanation provide a visible reasoning path. The final rendered matrix exercised wrong, hint and correct flows at both widths, including the hour rollover in the setter.
- **Reliability / navigation / persistence — 4.5.** The complete chapter/replay flow was exercised at both sizes. From Curriculum Quest → Time Detectives → Practise telling the time, Keep playing preserved the active clock, reload retained the clock route/origin, and confirmed Back returned to the Time Detectives module. Separate Maths entry returned to Maths. These are local controls; no production routing proof exists.

### Number Line Jump

- **Age-6 teaching — 4.5.** Forward/back missions let the child make each hop; Missing Numbers asks for a start, hop count or landing; Compare Values and Distances separately asks for the larger endpoint or the farther journey. The distinction is explicit in prompt and explanation, and the frog marks the current value.
- **Meaningful progression — 4.5.** Forward and Back (0–10), Missing Numbers (0–20), and Compare Values and Distances (0–20) introduce different tasks across three six-mission worlds. The final matrix completed all worlds and a six-mission Forward and Back replay at both widths.
- **Correctness and fair variation — 4.5.** The source validates equation, accepted hops and landing; rejects out-of-bounds hops; includes missing-start/hop/landing classes; and keeps “larger endpoint” separate from “farther” hop count. The final rendered run checked each mode and an equal-landing “Same” case. Accepted frog hops visibly updated one step at a time.
- **Visible feedback / visual component — 4.5.** The retained [390px frog screenshot](../../../dinospace-batch4-quality/docs/qa-evidence/batch4-final-repair-local-20261003/numberline-mobile-world1-frog.png) shows the illustrated frog above its current tick; the number line scrolls inside its labeled region while the page remains within the viewport. In the retained [0–20 comparison screenshot](../../../dinospace-batch4-quality/docs/qa-evidence/batch4-final-repair-local-20261003/numberline-desktop-world3.png), 44px circles have about 70px spacing; the final report found no overlap. When A and B land on the same value, both marker identities render together on that tick.
- **Reliability / navigation / persistence — 4.5.** Full completion/replay, chapter shelves, reload and sibling-profile separation were exercised. Source uses the `numberline` identity for events and celebration in the repaired candidate; the earlier `math` award misclassification is not reproduced in the final report’s Number Line shelf/global-star checks. No canonical production journey was run.

## Remaining gates and instructions

No below-target non-audio dimension was identified in the reconciled final local matrix and authored source. The concrete earlier mechanics defects listed in the 5221 hold were addressed and the relevant behaviors were retested in the 5227 final report. No additional mechanics rewrite is recommended from this evidence.

To move these ratings to an acceptance decision:

1. Finish packaging and decode verification for all current exact narration segments. The worker status above is an intermediate snapshot; do not describe it as a completed corpus.
2. Independently verify native playback and cancellation for the changed phrase-segment runtime, then have a person review representative number/noun, subtraction comparison, and clock/time sequences for pronunciation, pacing, clarity, age fit and clipping. A 204/HTTP asset response, manifest entry or successful build does not prove hearing quality.
3. Freeze the completed audio source, bind the exact candidate/served assets, and run the required canonical production regression. There is currently no Batch 4 production deployment evidence.

These gates do not alter the supported local non-audio scores above. They keep the formal feedback/audio/visual score and overall 4.5 acceptance open. The authoritative verified count remains 4.


## Subsequent singular-agreement finding and repair — 4 October 2026

Independent preparation of the exact listening worksheet found three authored agreement defects that the earlier non-audio assessment did not flag: Take Away “There are 1 apple,” remaining-count “1 remain,” and Number Line comparison “1 spaces.” These defects are concrete authored-copy findings; the old table is retained as its earlier assessment, not a claim that these phrases are acceptable.

Root repair fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128 corrects the data, exact narration helper segments and finite inventory. The [repair report](batch4-grammar-repair-20261004/report.md) and exact corpus delta retain 5,199 unchanged phrases and identify 47 corrected additions. Question IDs, maths, difficulty, progression and reward logic are unchanged. Eighteen focused tests/lint/configured build and all eight served runtime hashes passed on frozen5384. Independent source/rendered review remains pending; no new teaching score or overall award is recorded here.

The live ac3 narration worker remains immutable and may generate those old phrases. They will be unused by the corrected B4 source; the 47 exact replacements must be packaged after that worker is terminal, then decoded and verified through actual native sequence/cancellation and listening. Neither the old generated corpus nor the source repair alone closes audio or production acceptance.
