# Sky Shapes accessible progress copy — immutable production candidate QA

**Run date:** 2026-10-04 (Europe/London)

**Candidate URL:** <https://dinospace-6439k5woj-memas-projects-23a0001d.vercel.app>

**Deployment:** `dpl_31hURucAfoMNNhQMJpKBGvcAkX6u` (READY)

**Frozen source:** `2923ca6e10c46609504f41529bf46286e17f8434`

**Identity:** [`sky-accessible-progress-production-candidate-20261004.json`](../sky-accessible-progress-production-candidate-20261004.json)

This is a narrow independent check of the Sky accessible-progress wording change on an immutable production-environment deployment candidate. The canonical alias was not promoted. This report does not rescore Sky or accept Batch 2.

## Identity and setup

Before navigating either browser profile to the app, I re-fetched every file listed in the frozen identity. All eight returned HTTP 200 and SHA-256 matched the recorded expected digest: `index.html`, `sw.js`, `SolarSystem` bundle, `AmariCountTheStars` bundle, main JS, web bundle, `AmariLetterTrace` bundle, and CSS.

Two new Playwright sessions began at `about:blank`, configured to 1280×800 and 390×844. Before candidate navigation, each installed `/api/voice` and `/api/story` routes returning HTTP 204; the route lists confirmed both guards. Both remained active during testing. The request inventory showed no application API requests. Sound remained off. Both browser consoles had zero messages, errors or warnings. Each profile used normal visible age-6 Amari → Creative Lab → Sky Shapes navigation; no storage, answer, seed or progress injection and no provider call was used.

## Desktop keyboard flow — 1280×800

The map exposed Cloud Meadow Starter at 0/4, with Growing and Challenge locked. **Start this sky** opened a normally selected **Mountain Peak** mission, Flight 1/4, at 0%. The visible keyboard help instructed the player to focus the outline, press Enter, then use Space, Enter or an arrow key.

I focused the visible board. In the browser, `document.activeElement` was the SVG board with `role="application"` and the accessible name “Tracing board for Mountain Peak. Start at the numbered circle and follow the glowing dots to the checkered flag. Press Enter, then Space or an arrow key to trace.” Enter began the trace. Fifteen actual Space keypresses advanced visible progress through 33%, 67% and 100%.

The active mission exposed the rendered progress wording **“Part 1 of 1. Follow the glowing dots to the flag.”** The visible completion retained 1/1 part, 100%, 2/3 accuracy stars, the Mountain Peak **Shape idea** fact, and the text **“2 new stars added to your collection!”** The fact and stars remained held until **Next mission**. Next advanced to Round Sun at 0% and retained 1/4 saved.

From the new active flight, **Back to learning world** opened the expected **Leave the game?** confirmation. **Back to world** returned to the Creative Lab parent at the exact candidate origin.

## Mobile pointer flow — 390×844

The isolated mobile profile followed the same ordinary route and started **Round Sun** at 0%. I traced the visible circle from its numbered green start around the on-screen glowing dots to the checkered flag using actual pointer down/move/up actions. An initial coarse pointer attempt missed the narrow glowing route and got the expected “Almost. Bring your trail back close to the glowing dots.” retry. After using the visible **Restart flight** control, I followed the same visible route with closer pointer steps; the trace completed at 100%. This is browser pointer input at a 390px viewport, not a physical handset touch test.

At an additional active 390px Mountain Peak view, a DOM read confirmed the progress node was `aria-live="polite"` and read **“Part 1 of 1. Follow the glowing dots to the flag.”** Completion changed the accessible snapshot text to **“Flight finished. Your stars are saved.”** The held Round Sun completion showed 1/1, 100%, 3/3 stars, the **Shape idea** fact, and **“3 new stars added to your collection!”** Next advanced to Window Cloud at 0% with 1/4 saved. Back from that new flight opened the leave confirmation and **Back to world** returned to Creative Lab.

For direct verification of the completed live-region attribute, I returned to the desktop Sky map through normal navigation and started the uncompleted Kite mission. A DOM read on its active state found the same `aria-live="polite"` progress node; after focus, Enter and 18 actual Space presses, the completed state had `aria-live="polite"` with text **“Flight finished. Your stars are saved.”** Kite awarded 3/3 and advanced the saved episode count from 1/4 to 2/4. This is a separate ordinary mission in the same isolated desktop profile, not a changed score for Mountain Peak.

The pictured pointer route and score are consistent with the visible dotted circle and finish flag. The first coarse attempt was an incomplete input that recovered after restart; it was not treated as a product defect.

## Result and boundary

The candidate passes the bounded desktop keyboard and 390px pointer checks. The polite live progress wording is child-readable during a trace and switches to the finished wording on completion. The ordinary fact/award/Next flow remained present, saved mission count incremented, and confirmed Back returned to the correct parent world at both widths. No regressions were observed in the tested journeys.

This does not independently test all 12 missions, route interruption/rewind, multipart missions, physical-device touch, full persistence/sibling isolation, audio playback or human listening. It does not change the canonical alias and makes no score or 4.5 acceptance claim.

## Screenshots

- Desktop: `desktop/mountain-peak-start.png`, `desktop/mountain-peak-finished-fact-stars.png`, `desktop/kite-live-finished.png`, `desktop/back-to-creative-lab.png`
- Mobile: `mobile/round-sun-start.png`, `mobile/round-sun-finished-fact-stars.png`, `mobile/back-to-creative-lab.png`
