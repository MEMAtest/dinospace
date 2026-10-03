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

Integration commits: `65657ec`, `6a651a7`, `321200a`, `3d9bb91`. The clean candidate is rooted in the released SHA and contains these gameplay changes plus Spot first-miss telemetry, without the unfinished packaged narration integration. Clean candidate branch `codex/batch2-reward-settings-repair-20261003`, commit `9cc4331`: 148/148 Node tests and lint passed. Build also passed (JS `index-3o36Hdky.js`); fresh independent browser acceptance of this exact candidate passed for the narrow release gate (see `batch2-settings-audio-candidate-20261003.md`). Integration suite: 159/159 tests and lint passed. The clean candidate has 148 tests because it deliberately excludes 11 unfinished narration integration checks.

An earlier candidate at `02cfdda` passed independent first-flight visible UI checks: zero baseline → displayed 3 stars → Home total 3. That evidence does not certify the later number-line change.

Released to canonical production: deployment `dpl_kiGvxVvJatYKntaseMvP9tMp3e6T`, immutable `https://dinospace-b0efvu1om-memas-projects-23a0001d.vercel.app`, exact SHA `9cc4331dd9e9491284cb052f13a2804d484671cb`. Root verified alias assignment and HTML/static assets. Production JS `index-DfKtGOa7.js` exactly matches this source rebuilt with public `VITE_ELEVENLABS_ENABLED=true`; default local voice-off build uses `index-3o36Hdky.js`. CSS remains `index-Bwl2SrXA.css`. Independent production controls are being checked; deployment readiness alone does not prove them. Full Batch 2 acceptance also requires all three bands at desktop and 390px, retained generated seeds, bounded replay deltas, narration readiness and actual audio QA. No 4.5 score is assigned yet.


## Further defect found during production acceptance

On released `9cc4331`, a completed 100% flight followed by Back to world before pressing Next mission left the completion ledger empty and Home at zero. Pressing Next did persist 3 stars, so the defect is completion save timing, not reward arithmetic. The result card already said the stars were saved. This path is now a required regression.

Candidate `773b3c306673baeace3fd5b8aae984729f67ad26` moves flight, best-rating, chapter reward and unlock persistence to the final accepted trace point. The navigation button no longer awards or saves progress. Chapter bonus text identifies the separate two stars. A synchronous route-finished guard rejects duplicate final pointer events. 149 tests, lint and build passed; JS `index-BgC8Szhg.js`. Independent finish→leave→Home→reload and fourth-flight badge/bonus checks are underway. This follow-up is not deployed yet.


## Follow-up candidate acceptance

Independent actual-controls QA of `773b3c3` passed completed-flight→leave→Home and reload at 390px and desktop. Cloud Meadow finished four unique perfect flights, saved badge, unlocked Sky 2 and showed 14 global stars before pressing Complete this sky; leave/reload retained the state. A completed perfect replay added zero. Numeric run seeds included 60885509 (mobile) and 3773054440 (desktop); final independent report/screenshots will retain this candidate identity.

The original production baseline also reproduced a Puzzle feedback race: wrong placement→correct placement within 850ms showed Great fit, but 1.1 seconds later a stale timer replaced it with wrong-placement guidance. Candidate `1f07314` removes only that delayed text write; the short wrong-slot visual animation still clears. Final candidate `6b84554` adds precise Sky copy distinguishing accuracy rating from new star credit. 149 tests, lint and build pass; default voice-off JS `index-Dz1r44Ih.js`. Independent Puzzle timed recovery and Sky copy deltas are in progress before release.
