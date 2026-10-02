# Sky Shapes trace and navigation investigation

## Scope and identities

- Production reproduction: `https://dinospace-eight.vercel.app`, rendered JavaScript `/assets/index-CvLivfU2.js` and CSS `/assets/index-Bwl2SrXA.css` (the 8499 release noted by the integrator). This is pre-fix evidence; it does not prove the deployed app includes the local repair.
- Fixed local candidate: static build at `/tmp/dinospace-sky-trace-final`, served at `http://127.0.0.1:5189`; built from repository HEAD `dce7cd5a203565c32eff68095b42136204ff97d7` plus the uncommitted Sky Shapes component/test changes described below. The browser loaded the built bundle, not Vite HMR. The local JS was `index-B3TVGwwh.js` and CSS was `index-Bwl2SrXA.css`.
- Voice and story API routes were blocked during these browser runs; game sound was off. No paid voice or story calls were made.

## Production reproduction: Heart Balloon did not advance

On the production bundle, I used the visible controls to complete all four Starter flights and enter Growing. The observed Growing missions were Puffy Cloud, Bright Star, and Heart Balloon; these are Growing-band content. On Heart Balloon, clicking the visible tracing board at the green start point left `document.activeElement` as `BODY`. Pressing Enter followed by 30 Space presses did not start or advance the route: the UI remained at `0/1`, `0%`, and showed no result/Next mission, while the sampled-move accuracy indicator showed 100%.

The input path explains the failure: the valid board pointer handler calls `preventDefault()`, which suppresses the browser's normal focus transfer. Before the repair it did not explicitly focus the SVG, so subsequent keyboard events went to the page body. This is a reproducible input/focus defect, rather than evidence that the child was pressing too few keys. Production has not yet been retested after deployment of the repair.

## Local repair proof

The valid pointer-start handler now explicitly focuses the tracing SVG with `preventScroll: true` after preventing the pointer default. On the fixed local build, I used the actual visible board click (no scripted focus); the active element became `svg`. Enter plus 30 Space presses then completed Heart Balloon at `1/1`, displayed `100% accurate · 3 stars earned`, and exposed Next mission. Screenshot: [fixed Heart Balloon result](../.playwright-cli/page-2026-10-02T08-15-12-880Z.png).

The focused queue regression now verifies, for all three episodes and multiple seeds, that every queued mission ID belongs to its selected episode, while retaining deterministic order and within-run uniqueness checks. The observed Growing queue stayed inside the Growing episode. I did not observe Starter missions leaking into Growing in the tested runs.

## Leave and cancel proof (fixed local build)

At desktop 1280×720 and mobile 390×844, I checked Back from the Sky Shapes intro; each returned to the parent Creative Lab world. I then entered a flight, waited 10.5 seconds for the guarded leave confirmation, selected Back to learning world, and chose Keep playing. In both viewports the confirmation closed while the game remained on the same active flight with its mission heading and progress intact; no result or reward appeared. The mobile document width remained 390 px at a 390 px viewport. Mobile post-cancel screenshot: [mobile flight preserved](../.playwright-cli/page-2026-10-02T08-16-58-001Z.png).

The component no longer sets its phase to `done` before asking the parent to navigate back. A canceled parent confirmation therefore cannot turn an in-progress flight into a completion screen. Completed reward state is unaffected by this change.

## Validation and limits

- `node --test test/batch2SkyShapes.test.mjs`: 8/8 passed.
- `npm run lint`: passed.
- Vite production build: passed; only the existing outdated Browserslist database and large-chunk advisories were reported.
- No full-project test-suite result is claimed for this dirty snapshot.
- The source change is local and uncommitted. It has not been deployed, so the production reproduction remains a release blocker until the repair is included and rechecked against the resulting bundle.
