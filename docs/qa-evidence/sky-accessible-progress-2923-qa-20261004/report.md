# Sky Shapes accessible progress copy — independent frozen-candidate QA

**Run date:** 2026-10-04 (Europe/London)

**Candidate:** source `2923ca6e10c46609504f41529bf46286e17f8434`, frozen local origin `http://127.0.0.1:5297`

**Identity:** [`sky-accessible-progress-identity-20261004.json`](../sky-accessible-progress-identity-20261004.json)

This is an independent, narrow browser check of the screen-reader progress wording change. It retains the full Sky gameplay baseline and does not claim broad gameplay recertification, production acceptance, a score change, or Batch 2 acceptance.

## Identity and guarded setup

Before app navigation, I fetched all eight files listed in the frozen identity directly from `127.0.0.1:5297`. Every response returned HTTP 200 and its SHA-256 matched the identity record. The identity binds the frozen package to source `2923ca6e10c46609504f41529bf46286e17f8434`; its recorded candidate gates are 19/19 focused tests, changed-file lint, and a clean configured build.

I opened two fresh Playwright sessions at `about:blank`, set desktop to 1280×800 and mobile to 390×844, and installed `/api/voice` and `/api/story` intercepts returning HTTP 204 before navigating. Both intercepts remained active after navigation. The request lists contained no voice/story or other API requests. Both profiles used ordinary Amari → Creative Lab → Sky Shapes navigation; no storage, progress, seed, or answer state was injected, and no provider-generated data was requested. Sound remained off. Console logs were empty in both sessions.

## Desktop keyboard trace — 1280×800

The normal Sky map showed **Cloud Meadow**, 0/4 completed, and **Start this sky**. The first mission was **Kite**, 1/4. Before input the visible board showed the numbered green start, dotted outline and checkered finish; the accessible board label instructed the learner to start at the numbered circle and follow the glowing dots to the flag.

The visible keyboard instruction said to focus the outline, press Enter to begin, then use Space, Enter or an arrow key to guide the jet. I clicked the visible tracing board, then checked `document.activeElement`: it was an SVG with `role="application"` and the rendered Kite tracing-board `aria-label`. I pressed Enter to start, then used actual Space keypresses. Visible progress advanced 0% → 6% → 28% → 85% → 100%. During the partial trace, the live announcement remained the stable, child-readable **“Part 1 of 1. Follow the glowing dots to the flag.”** At completion it changed to **“Flight finished. Your stars are saved.”**

Completion preserved the existing result flow: 1/1 part, 100%, 3/3 accuracy stars, one **Shape idea** fact, and visible text confirming three new stars were added. The fact and result stayed on screen until **Next mission**. Next advanced to Mountain Peak, reset that new mission to 0%, and retained 1/4 saved in the episode. Screenshots include the starting board, focused SVG, held completion/fact/stars and next-mission state.

## Mobile pointer trace — 390×844

The fresh profile followed the same normal route and loaded the Kite Starter mission at 0%. I used the screenshot’s visible numbered start, diamond outline and glowing dots to trace the route with mouse-pointer down/move/up actions. The pointer completed the outline with 100% progress and three stars. This is an ordinary mouse-pointer check at the 390px layout; it is not a physical handset/touchscreen test.

The held result showed one Shape idea fact, 3/3 accuracy stars, 1/4 saved and the same exact **“Flight finished. Your stars are saved.”** completion announcement. **Next mission** advanced to Mountain Peak at 0% while retaining 1/4 saved. Mobile screenshots show the initial visible path and the held completion state.

## Result and boundary

The copy delta passes this narrow desktop keyboard and 390px pointer check. Progress, end-of-flight live text, visible fact, star award and Next state behaved normally in both sessions. No scoring change or loss of accessibility focus was observed.

The full 12-mission gameplay matrix, pointer interruption/rewind, all multipart missions, complete mobile touch coverage, saved-state reload/sibling isolation, audio playback and human listening remain covered only by their linked prior evidence or open separate gates. This check does not close the required human listening review or any shared 4.5 acceptance gate. No source file was edited and nothing was deployed.

## Evidence

- `desktop/kite-start.png`
- `desktop/canvas-focused.png`
- `desktop/kite-finished-fact-stars.png`
- `desktop/next-mission.png`
- `mobile/kite-start.png`
- `mobile/kite-finished-fact-stars.png`
