# Independent scattered-board strategy QA

Date: 2026-10-04  
Candidate source: `1accc99e89be303678ead99def6a3095ab1cb886`  
Frozen preview: `http://127.0.0.1:5396/`  
Candidate identity: [`../identity.json`](../identity.json)

## Scope and setup

I used a fresh Playwright CLI session at 1280×800, opened at `about:blank`. The `/api/voice` and `/api/story` routes returned 403 and were visible in `route-list` before the first app navigation. Sound stayed muted through the visible control. I selected Amari and entered Maths Missions → Count the Stars.

Using rendered object buttons and the visible answer choices, I completed all six Starter rounds and all six Growing rounds to earn the Challenge unlock normally. I completed the first six-round Challenge survey, then used the ordinary replay control for one additional bounded sample. Its first round was a grouped Planet Rings board; after answering that rendered board, round 2 showed a scattered Nebula Dots board. I stopped on that board after checking its banner, layout label, and Show a clue result. This was a narrow check of the repaired branch, not a new full-game matrix. No answer, queue, seed, or progress state was injected.

## Result

On the Challenge Nebula Dots board, three pink nebula lights were visibly scattered: one high in the board, one lower left, and one lower right. The accessible board name read “scattered one by one.” The episode strategy banner changed to “Count each glowing object once. A number badge keeps your place.” This matches the displayed layout. At 390×844 the banner wrapped cleanly above the board, and all three object controls plus the instruction and clue buttons remained visible without clipping. Desktop and mobile captures: [desktop](screenshots/scattered-nebula-desktop.png), [mobile](screenshots/scattered-nebula-mobile.png).

The visible Show a clue control displayed “Point to each shape once. The numbered badges keep your place.” This agrees with both the banner and the scattered objects. The mobile screenshot with clue open is [here](screenshots/scattered-nebula-mobile-clue.png).

The earlier independent 5395 report (source `79a719e91e727f09d1f78cf890acd7e671cab381`; evidence commit `26fb2cd7c38175894bb505f22e72b29f25d8bf75`; path `docs/qa-evidence/count-layout-clue-20261004/independent/report.md` in its separate worktree) records the defect on a scattered Satellite Panels board and the prior array/split-group clue matrix. This local 5396 check confirms the banner repair on a naturally reached scattered Challenge board while preserving the existing array and grouped wording during the initial Challenge run and the grouped replay round. It does not repeat the full retained matrix.

## Diagnostics and limits

The voice/story 403 guards remained active after navigation. The request summary showed only static requests (11 omitted from the compact listing); no provider/API request occurred. Browser console: 0 messages, 0 errors, 0 warnings. The board was not answered after the banner/clue inspection, and no hint audio was played. This is local preview evidence only; no production deployment was exercised in this report, no human listening was performed, and no overall score or full acceptance is claimed.
