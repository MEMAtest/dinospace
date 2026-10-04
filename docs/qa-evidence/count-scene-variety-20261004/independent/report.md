# Independent Count the Stars scene-variety QA

Date: 4 October 2026  
Candidate: source `40c053408d47ca76ff26cc8ae5c2e8ad9bb99d70`  
Frozen local preview: `http://127.0.0.1:5393/` (`tmp/count-scene-variety-40c0534/dist`)  
Evidence identity: sibling `identity.json`; served asset identity: sibling `served-assets-sha256.txt` (5,879 served files, zero mismatches per frozen report).  
Scope: one fresh isolated ordinary Amari profile; 390×844 rendered UI; one complete six-round run in each of Starter, Growing, and Challenge. No source edits, hidden-state/progress/answer injection, provider calls, audio acceptance, deployment, or release approval.

## Setup and method

Started a new Playwright CLI session on `about:blank`, installed `/api/voice` and `/api/story` 403 route guards there, then navigated to the preview. Chose Amari and muted using the visible **Turn sound off** control. Progress was earned through the visible Maths Missions → Count the Stars route and normal completion of each band. For each question, counted only the visible board objects by activating their rendered controls, then selected the matching number among the visible answer choices. No app storage or hidden question/answer state was read.

## Results

| Band | Visible board title and count by round | Distinct scenes |
|---|---|---:|
| Starter | Tiny Planets (5); Firefly Meadow (1); Moon Berries (2); Comet Seeds (3); Rocket Lights (4); Rocket Lights (3) | 5 |
| Growing | Meteor Trails (10); Meteor Trails (6); Observatory Windows (5); Moon Rocks (9); Star Clusters (7); Satellite Bolts (1) | 5 |
| Challenge | Crater Gems (7); Constellation Maps (3); Crater Gems (1); Planet Rings (17); Satellite Panels (15); Nebula Dots (14) | 5 |

All 18 questions accepted the visible-object count and held a positive result with the matching noun and total before Next. The band completion screens reported earned pages and stars (Starter 2, Growing 3, Challenge 2). This confirms the changed selection produced five distinct visible motifs in each of these three ordinary runs; it is a bounded sample, not a broad seeded-selection guarantee. The frozen builder identity separately records its 500-seed sweep.

## Satellite Panels at 390×844

Challenge round 5 rendered 15 separate framed solar-panel icons in a 5×3 arrangement. Each panel contains an internal 3×3 cell pattern. At normal mobile size the outer frame makes each panel one countable object; individual cells are visibly inside the panel and are not presented as separate count controls. The UI presented 15 panel targets, and after tapping each once the held explanation said, “There are 15 solar panels. You counted each one once.” A mobile screenshot of the held result is saved as `screenshots/satellite-panels-mobile-held.jpg`.

I used **Show a clue**, selected the visible wrong option 14, and observed the retry status **“Check your count badges once more.”** The choices remained available. Selecting 15 then held the correct explanation and **Next**. The clue itself said **“Count one visible group, then the other group. Add the two totals.”** That instruction does not fit the visible Satellite Panels board: it is a single 5×3 array, with no divider or two visibly distinct groups. The previous prompt correctly offered either counting along a row or counting each group. The clue should adapt to this board or use row/array wording, rather than describing two groups that are not shown.

## Runtime observations and limits

- Browser console: 0 messages (0 errors, 0 warnings).
- Sound was visibly muted. No audible or narration-quality judgment was made.
- The 403 routes were installed before app navigation. The muted ordinary flow generated no provider use; no paid endpoint was called.
- This report verifies a single rendered profile and the scene-variety delta. It does not re-run the prior full Count mechanics matrix or independently verify reload persistence. It does not clear the clue mismatch, or award a game score, 4.5 acceptance, production, or release status.
