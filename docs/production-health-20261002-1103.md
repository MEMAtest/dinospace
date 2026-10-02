# Production health — 2 October 2026, 11:03 heartbeat

Executed 11:04–11:13 UTC in isolated Playwright session `health-20261002-1103`.

## Canonical deployment

Vercel inspect and deployment API confirmed READY production `dpl_3aXnFd9wZ2599fLqhszR7PyqzAxF`, Git metadata `8499e15471196f11a4a2665359f0d6cb38992033`, immutable URL `https://dinospace-rgfi9yvh9-memas-projects-23a0001d.vercel.app`. Canonical alias rendered JS `index-CvLivfU2.js` and CSS `index-Bwl2SrXA.css`. Unchanged identity.

## German Garage actual controls

- Fresh Amari showed 0 stars. Entered Explore & Languages, German Garage, then Play level 1 at 1280 × 900.
- Replayed the German clue. Black for Grün produced retry feedback and stayed on round 1/5. Green produced held `Grün means green` feedback, painted the car, and displayed 2/5. Next word remained required to proceed.
- Resized to 390 × 844; Next word moved to a distinct Garage mission at 2/5. Replayed its clue. Black for Braun produced retry feedback without progression; brown produced held `Braun means brown` feedback and displayed 3/5.
- Leave → Keep playing restored the same held Braun explanation and 3/5 state. Leave → Back to world reached `#/world/explore`.

## Diagnostics and scope

Console zero errors/warnings. All 25 observed requests returned HTTP 200, including illustrated car/garage scenes and packaged `gruen.mp3`/`braun.mp3`. Provider voice/story routes were blocked before selecting Amari; no such API request appeared. No provider generation or paid calls were made.

Mobile document width 390, no broken/incomplete rendered images. Visually inspected `output/playwright/health-20261002-1103-german-mobile.png`; the illustration and answer cards fit the viewport width. The page scrolls vertically; physical audio output was not assessed.

Closed the isolated browser. Only disposable browser-local progress changed; no real child data accessed. No newly confirmed regression or deployment mismatch in this sample, so no notification required. This rotating health sample does not certify full level completion, all game flows, or the 26-game 4.5 roadmap. Existing separate Batch 2 issues remain open.
