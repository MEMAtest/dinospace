# Batch 4: arithmetic, number lines and time

Status: source audit and implementation instructions only. These four games remain **not started** in the acceptance inventory. This extends their published instructions in `game-quality-4.5-roadmap.md`; it does not assign a new score or claim browser verification.

## Observed source risks

- Addition draws each operand independently up to `level.maxNum`, so a displayed maximum of 20 permits a sum of 40. Define whether a bound means an operand or a total; the new age-six chapters below use explicit total bounds.
- Subtraction adds up to three to its configured minuend limit. Its model is removal in every band; comparison has not been implemented as a different concept.
- Both arithmetic games generate a fresh random problem and advance automatically after success timers. The old `GameSession` answer-count wrapper and internal level counts are competing progression owners. Replace this with a single finite chapter owner and held explanations.
- Time Teller already has correct SVG hour-hand movement (`hour * 30 + minute * 0.5`), unique time-label distractors, and o'clock/half/quarter values. Preserve these strengths. Its initial target is always three o'clock, and success automatically advances after 1.1 seconds. It lacks hand-setting and routine missions.
- Number Line Jump offers forward/back equations and automatically animates hops after an answer. It lacks missing-number and comparison worlds. Its wrong-answer timeout is not retained for cleanup, unlike its animation/next timers.

These are source findings. Reproduce relevant failures through real controls before treating them as production regressions.

## Shared implementation contract

Each game owns three sequential chapters of six rounds. At Start, choose one seed and freeze its queue, answer order, model and chapter bounds. Incorrect attempts, hints, rerenders and Keep playing cannot replace it. Next is the only way past a correct worked explanation. Complete the final explanation before awarding a chapter badge or unlocking the next chapter. Same-band replay chooses a new seed and avoids recent question identities where the finite pool permits; it never duplicates star/badge credit.

Use pure generators and child-scoped validated progress stores. Reject future locked completions and orphaned awards; derive unlocks from contiguous completion. Preserve existing global child stars/stickers and Askia behavior. Root owns App routing, removal of the generic wrapper for these four Amari flows, sticker shelf integration and exact production promotion. Builders own game components/data/tests. Independent reviewers own their reports and browser evidence.

All controls must be at least 48 CSS pixels at 390px. A number line may scroll within its labelled region, with a visible scroll cue and equivalent keyboard control; it must not overflow the document. Keep illustrated content relevant and use established premium assets or coherent native vector manipulatives. Prefer reusable, finite narration segments over generating every numerical sentence combination. Package each exact runtime segment and verify native playback, cancellation and human intelligibility separately.

## Addition Adventure

1. **Combine groups:** totals 0–10. Two labelled native object groups move into a result tray after a correct answer; the pre-answer accessible model describes separate quantities and never discloses the sum. Include zero as an empty group with a clear label.
2. **Number bonds:** totals 0–20, with a missing part in a whole/part diagram. Explain that both parts make the whole. Do not simply enlarge the combine-groups scene.
3. **Short stories:** totals 0–20, with concise familiar contexts and displayed models. Rotate context/operands without changing the chosen run. The worked fact identifies the two groups and their sum.

Validate depicted object counts, group labels, numerical bounds, correct unique options, six distinct questions and sum/animation agreement. Test wrong then correct, hint, keyboard and touch, model accessibility, held Next, replay and completion-only badge/credit at both widths.

## Subtraction Station

1. **Take away:** minuend 0–10, subtrahend 0–minuend. Show removed objects distinctly through pattern/crossing and movement; count remaining objects without disclosing the answer before selection.
2. **Compare groups:** quantities 0–20. Pair groups visibly and ask how many more/fewer. Explain comparison as the unmatched difference, rather than depicting it as removal.
3. **Short stories:** minuend 0–20, with clear removal or comparison wording and matching models. No negative result in these age-six chapters.

Validate that models and narration agree with the actual equation/semantic type; zero and equal quantities are legal. Test both removal and comparison at both widths, including explicit wrong guidance, held explanation, bounded options, replay and no duplicate credit.

## Time Teller

1. **Clock explorers:** o'clock and half past, with a replayable short/long hand lesson and read-clock missions. Explain the shorter hour hand moving between numbers.
2. **Past and to:** quarter past and quarter to as well as previously taught times. Include the next-hour relationship, especially quarter to twelve and quarter to one. Use the existing continuous hour-hand calculation.
3. **Set a routine:** mix read-clock, set-hand and familiar daily-routine contexts. Use explicit AM/PM or morning/evening context when distinguishing a daily event; an analogue clock alone cannot determine it. Provide touch/keyboard minute steps and hour controls, without requiring fine dragging.

Property-check at least 50 seeded clock/label cases, including every allowed hour/minute pair and 12-hour wrap boundaries. Verify hand angles, unique distractors and hand-setting answer validation. Each run has six distinct missions. Exercise entry through Curriculum Quest's Time Detectives link and confirmed return to that originating route, as well as entry/return from Maths Missions. Do not erase an origin route during a chapter transition.

## Number Line Jump

1. **Forward and back:** totals/landings 0–10. The child actively makes each hop using tap/keyboard or a coarse drag; show starting value, direction and hop count.
2. **Missing numbers:** values 0–20. Freeze a missing start, hop count or landing for the round; use a labelled number line to support the missing-part reasoning.
3. **Compare distances:** values 0–20. Compare two starts/landings or hop sequences. State whether the question asks larger value or farther distance; do not conflate them.

Equation, visible accepted hops and landing must agree. Reject hops beyond the allowed line and provide an equivalent keyboard route. Before a correct answer, the accessible model must expose the task without supplying the solution. Restart/leave cancels every animation and delayed feedback handler, preventing stale callbacks from mutating the next run.

## Independent acceptance and release

At desktop and 390px, use fresh QA profiles and ordinary controls to complete all three chapters of each game, then a same-band replay. Capture UI diagnostic seeds/level/round/hint outcomes, start, wrong, held explanation, completion, reload, Keep playing and confirmed Back states. Check per-child isolation, duplicate credit, all target classes, illustrated/audio assets, console and guarded provider requests. Unit/build passes support a candidate; only canonical deployment identity plus actual production Playwright and required audio/editorial review support 4.5 acceptance. Retain failed candidates and their findings.
