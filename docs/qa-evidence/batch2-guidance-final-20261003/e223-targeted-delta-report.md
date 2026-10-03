# Targeted guidance candidate QA — e223

Date: 2026-10-03. Independent UI review of the frozen local candidate only; this is not production acceptance.

## Identity and setup

- Source: `e223bccfd8c962a4c06ddd343ff2c2e53d8e4b58`.
- JavaScript: `index-CQ3R0BNq.js`, SHA-256 `c9c6f6a05a7c48e32b5a59505cbd386f6faa1584c397f741b9f72fb6a216207b`.
- CSS: `index-CUmO8J4O.css`, SHA-256 `d8fe5109969658486618b98444a2d23d3fb411f1604a6081d45d3e5ed90f5d2f`.
- Local origins: 5205 desktop and 5207 mobile; 1280×800 and 390×844. Voices muted. `/api/voice` and `/api/story` route guards were installed before application navigation. Request inventories are retained; neither route appears in them.
- The isolated profiles already had some ordinary saved progress. All setup and play used visible in-game controls; there was no storage import, answer injection, or seed/progress injection. Starter and Growing Sky missions and the puzzle needed to unlock Challenge were completed through their ordinary UI. The existing product full-band baseline remains separate; this report covers only changed UI/teaching areas and the necessary challenge setup.

## Puzzle Pop

The 5×5 Challenge board and tray fit the mobile viewport. Measured minimum board-cell size was 48.80 px on mobile and 68.80 px on desktop; minimum tray target was 50.66 px mobile and 49.47 px desktop. `documentElement.scrollWidth` matched viewport width at both sizes. The full chapter/picture heading remained visible at 390 px.

The “Show a piece mapping” demonstration selected a real tray piece and illuminated its matching preview cell/board space at both sizes. It did not place the piece: before placement, 25 pieces remained and the move count stayed 0. Placing that selected piece in the matching space produced the expected “Great fit!” feedback and 1/25 progress. The picture completed through visible piece/space controls; Next picture reset the new image to 25 remaining and 0 moves, with the demonstration available again. See `*-puzzle-demo-*`, `*-puzzle-first-place.png`, and the visible game-log exports.

The e223 game-log export retained the challenge hint event but its `scene_complete` event did not include a `hints` field. It recorded `firstAttempt:true`; that is consistent with the game’s separate semantics (“no incorrect response”), so this is not reported as a first-try scoring defect. The missing diagnostic hint count is a distinct export omission, assigned for repair; the later candidate needs a narrow exported-log check.

## Sky Shapes

The needed Starter and Growing missions were traced using visible controls; the multipart Growing house required ordinary keyboard assistance to complete a path, then advanced normally. At Challenge, desktop Moon Observatory completed all 4 ordered parts at 100% and mobile Sky Castle completed all 6 ordered parts at 99%. Both showed one held “Shape idea” fact and an available Next mission control. Completion screenshots: `desktop-sky-challenge-observatory-complete.png`, `mobile-sky-challenge-castle-complete.png`.

**Failure: the moving jet covers the numbered green start marker at the start of a flight.** On the desktop Moon Observatory, jet bounds were approximately 66×73 px and the start-circle bounds 72.6×72.6 px, with near-total overlap. On mobile Sky Castle, the jet bounds were 24×25 px and the start circle 22.6×22.6 px, centered at effectively the same point; the jet obscured the “1”. Captured start-state screenshots are `desktop-sky-challenge-observatory-start.png` and `mobile-sky-challenge-castle-start.png`; rounded DOM measurements are in `e223-sky-start-geometry-observation.json`. This impairs the main “start at 1” visual cue. Finish flags were separately visible in the checked layouts. Root assigned a bounded repair; do not treat this e223 result as passing start visibility.

The active play screen names the mission and completed/total path parts; the strategy remains in a single mission-specific “Tracing tip”, followed by live action feedback during tracing. The earlier note about a generic “Trace each outline part in order” instruction was stale and is withdrawn for e223. The chapter goal is on the map, not over the route.

## Runtime evidence and limits

Screenshots, actual UI diagnostic exports, Playwright console and request inventories are in this directory. The console inventories contain no browser errors; voice/story endpoints are absent from requests. The app was tested locally with the production voice feature flag in the build, but no audio was played or judged, no provider calls were made, and no production deployment was exercised. The exported corpus identity check for this build reports all 1,371 narration clip bytes matching. Existing retained full-band evidence is not repeated or expanded by this targeted review.

This report preserves the e223 failure identity. After this evidence was saved, the owner marked the origins safe to upgrade to the repaired candidate for focused start-marker follow-up.
