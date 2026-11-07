# Puzzle Pop and Spot the Difference — 7 November 2026

Live at https://dinospace.netlify.app, runtime `c6f87e8681bfa725f0a54080f7f55836057ddb66`, entry `/assets/arcade-DTw2uC-a.js`, worker `amari-discovery-v71`. Immutable backend `dpl_GJfzGbT1njTyzbWadvgHJrasBvFx` (`https://dinospace-okarv4nae-memas-projects-23a0001d.vercel.app`); Netlify gateway `6aee77b5d0c7c4ec1123b332`.

The chapter screens use existing illustrated catalogue artwork sized for the phone. Spot's chapter, pair and found-count line no longer truncates on the 390px layout. `before-spot-play.png` records the previous clipped line; the production intro and play screenshots show the final screens. Existing scenes, difficulty, progress and rewards are unchanged.

Build, scoped lint and 760 source tests passed. Full native and live actual-control journeys passed at 390x740 and 1440x844: 12 Puzzle Pop scenes (200 placements) and 12 Spot pairs (60 found changes) per viewport. The driver verifies decoded chapter artwork, unclipped Spot progress, visible controls, wrong retries, held facts, packaged audio playback, parent navigation and saved records. Production visual checks found the 52/56px start controls in view and hittable, decoded art, an unclipped progress line, no horizontal overflow, no captured errors and no provider requests. Human listening, physical-device testing and a new editorial score remain outside this targeted check.

The public entry, styles, module, worker and catalogue art matched the tested candidate (`production-assets.json`). An actual Refresh games click retained 117 synthetic local-storage hashes and the synthetic storybook database; this does not prove recovery of personal stories. No real child data was reset, and no new paid calls were made.

Full journey reports:
- `docs/qa-evidence/puzzle-spot-fit-20261029/native-puzzle-spot-390x740-arcade-DTw2uC-a-20261107T005314-905560000.json`
- `docs/qa-evidence/puzzle-spot-fit-20261029/native-puzzle-spot-1440x844-arcade-DTw2uC-a-20261107T005425-295661000.json`
- `docs/qa-evidence/puzzle-spot-fit-20261029/production-puzzle-spot-390x740-arcade-DTw2uC-a-20261107T005920-312712000.json`
- `docs/qa-evidence/puzzle-spot-fit-20261029/production-puzzle-spot-1440x844-arcade-DTw2uC-a-20261107T010037-692827000.json`
