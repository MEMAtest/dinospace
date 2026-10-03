# Score and wording reconciliation for the 037 art-aligned candidate

Date: 2026-10-03  
Applies to: source `037914f48e5198ca97c03668baa1d0d2dbf40369` and the evidence in `report.md`.  
This addendum preserves the original report unchanged as a record of what was written for that candidate. It corrects the interpretation of one inherited Sky finding and clarifies the Puzzle correctness evidence; it is not new gameplay evidence or a score acceptance.

## Sky Shapes: correct the active-flight description

The old broad chapter-goal capsule is **not** present during active flight on source `e8065ffc…` / 5205, nor on the unchanged Sky component inherited by 037. The map retains the chapter objective; the active-play screenshot `../batch2-editorial-final-20261003/mobile-sky-flight.png` shows these three separate cues:

1. The top mission heading: “Trace each outline part in order · 0/1”.
2. The strategy panel: “Tracing tip: Keep the jet moving gently around the round path until it meets the red dot.”
3. The live action/status instruction: “Start at the green 1. Trace the circle outline.” (It changes as the flight proceeds.)

The remaining product issue is **instruction hierarchy**, not an extra chapter capsule and not a claim that the goal is absent. The top generic direction, specific strategy tip, and live action each compete for attention while partly restating how to trace. Keep the live action/status as the dominant cue, reduce the top line to mission identity and progress, and move the strategy tip to a visually secondary/help treatment that adds a distinct useful technique. Retain the visible Green=start / Red=finish legend and numbered start marker. The report’s earlier proposed goal-capsule removal should not be carried forward.

## Puzzle Pop: correctness evidence versus scope

The 037 report’s reason for a 4.4 correctness/fair-variation estimate says its delta did not re-audit the other eight scene facts or rerun variation. That is a **scope statement**, not evidence of a current correctness defect. The relevant retained evidence is broader when combined:

- The retained 24-row gameplay baseline covers the established puzzle progression and scene/replay behavior.
- [`puzzle-fact-art-audit-20261003.md`](../puzzle-fact-art-audit-20261003.md) statically reviews all 12 earlier image/title/alt/fact bindings and records which images had mismatches.
- [`puzzle-new-art-static-review-20261003.md`](../puzzle-new-art-static-review-20261003.md) reviews the four replacement assets and matching current copy for Robin’s Tree, Treehouse Robots, World Explorer, and Nature Lab; it also checks the retained alt corrections.
- `report.md` supplies independent rendered proof on 037 for those four changed scenes, including accepted placements, correct completion facts, and the updated crop mapping at desktop and mobile. The Nature Lab animal/leaf mismatch and the 5205/5207 duplicate-fact/crop failures remain attached to their earlier candidate identities, not 037.

No correctness defect was observed in the 037 delta. The other-eight/all-scenes observation is not grounds by itself to hold correctness below 4.5: use the retained baseline and both static reviews when the reviewer reconsiders that dimension. If a reviewer still withholds a numeric correctness rating pending fresh all-scene UI variation evidence, label that as an **unscored evidence gap**, not a demonstrated content/correctness bug. Do not raise the score automatically; a fresh judgment is still required.

The concrete 037 product defect is instead visual usability: at 390px the chapter/status line truncates the scene name (`Detail Detectives · Picture 3 of 4 · …`), even though “Nature Lab” remains visible in the preview card. This is preserved in the original report and screenshot. The status heading should show the full scene title at mobile width. Human listening and canonical production checks are separate pending gates, not substitutes for the observed UI defect or evidence of a correctness failure.

## Score status

The `4.38` mean and displayed dimensions in `report.md` remain provisional estimates tied to 037; this addendum does not certify a game at 4.5 or silently change its mean. It replaces only the inaccurate Sky description and the implication that the correctness score is lower because eight facts were not newly re-audited. Puzzle’s 390px title truncation remains an observed product issue for the feedback/visual dimension. For Sky, the feedback/visual concern is the three-cue hierarchy described above, not a missing active chapter capsule. Listening, production identity, and any later candidate’s visual changes require their own gates and candidate-specific evidence.
