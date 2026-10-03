# Batch 2 reward and teaching-model repair — 3 October 2026

## Reproduced production issues

Independent Playwright testing of canonical SHA `d31239453edf438b5a88ab788db942f2dae76fea` reproduced:

- Sky Shapes: 12 perfect flights each displayed three stars, but Home showed only 18 stars: one per flight plus three chapter bonuses. Screenshot: `output/playwright/batch2-sky-monster-acceptance-20261003/sky-desktop-home-after-12-missions-18-stars.png`.
- Monster Math: an available, unearned episode was labelled locked; clue and explanation paragraphs appeared twice.
- Monster story subtraction: the initial 18 minus 12 number line showed only 16–20; after answering it expanded correctly to 4–20. Arithmetic was correct, but the initial teaching aid omitted the counting route.
- Grownups offered difficulty selectors for these chapter-based games which no longer controlled their runs.

## Repair

Sky awards the difference between the new mission rating and the saved best rating. A perfect first mission awards three stars; identical or lower replay awards zero; improving one to three awards two. Completing a chapter for the first time adds a separately identified two-star bonus. Existing historical totals remain preserved: old credits cannot be reconstructed reliably, so this release does not fabricate retrospective awards.

Monster available episodes say “not earned yet”; unavailable episodes remain locked. Feedback contains one clue or explanation. The initial number line includes every tick between the start and result, with two context ticks where the 0–20 boundary permits. The answer highlight and jump markers remain hidden until a correct choice. Regression coverage checks all operation/story pools, including 18 minus 12.

Monster also awards only additional best-rating stars: one to three awards two extra, identical/lower replay awards zero. First completion awards its displayed rating.

The obsolete Grownups selectors were removed; chapter unlocks and saved child progress remain the source of progression.

## Source and verification boundary

Integration commits: `65657ec`, `6a651a7`, `321200a`, `3d9bb91`. The clean candidate is rooted in the released SHA and contains these gameplay changes plus Spot first-miss telemetry, without the unfinished packaged narration integration. Clean candidate branch `codex/batch2-reward-settings-repair-20261003`, commit `9cc4331`: 148/148 Node tests and lint passed. Build and fresh independent browser acceptance of this exact candidate are pending.

An earlier candidate at `02cfdda` passed independent first-flight visible UI checks: zero baseline → displayed 3 stars → Home total 3. That evidence does not certify the later number-line change.

No new production release is claimed in this checkpoint. Full Batch 2 acceptance also requires all three bands at desktop and 390px, retained generated seeds, bounded replay deltas, narration readiness and actual audio QA. No 4.5 score is assigned yet.
