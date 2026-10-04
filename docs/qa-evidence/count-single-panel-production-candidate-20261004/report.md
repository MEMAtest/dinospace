# Independent production-candidate QA: Count the Stars panel art

**Result:** candidate identity and ordinary progression/reward persistence were checked. The target `Satellite Panels` prompt did not appear in the one permitted Challenge run, so this run provides **no production visual verdict** on the repaired panel. The local 5387 rendered evidence remains separate and does not substitute for this production observation.

## Exact candidate and guarded setup

- Deployment: `dpl_JDhthNmQTzSw1UBsT4EvJfuwq7k2`, READY production-target deployment at `https://dinospace-p57qywzaw-memas-projects-23a0001d.vercel.app`.
- Runtime source: `e067e3d389ad2f1ec1a8583535c07edd4b83268e`; build commit: `602f236d8cf85c8eb0e9a7b0978379c5e08eb02e`; canonical baseline: `0d3ef056e569e3ef59763df388f26c3baa7783b8`.
- Candidate identity copied to `identity.json`: candidate index and primary JS/CSS return HTTP 200 and match the frozen 5387 bytes by SHA-256. This is the three-file identity check recorded by the deployment verifier, not a full static-asset audit. Canonical alias remained unchanged during this test.
- Opened a new isolated Playwright session at `about:blank`. Added `/api/voice` and `/api/story` 403 routes and verified both were active before the first app navigation and after it. Sound was muted using the visible `Turn sound off` control. No provider calls were allowed, and no progress/seed/answer state was injected.

## Visible progression and one bounded Challenge run

Through ordinary controls, completed Star Garden (Starter) and Constellation Workshop (Growing), counting the visible tappable objects and choosing the matching visible number option. Each round displayed the corresponding “There are/is N … You counted each one once” feedback and Next. Each band completed with a 3-star best and unlocked the next band.

Completed exactly one six-round Galaxy Survey (Challenge) run on the desktop viewport. The actual visible queue and visible tap totals are recorded in `run-observations.json`. It was: Constellation Maps (8), Crater Gems (2), Constellation Maps (5), Nebula Dots (12), Planet Rings (19), Planet Rings (13). All six correct held feedback messages matched the numbers of visible object buttons clicked; Next advanced each round. `Satellite Panels` did not appear. I did not replay, reroll, manipulate state, or begin another Challenge run to search for it.

Galaxy Survey completed and showed a 3-star best. The survey map showed 3-star entries for all three bands. After reload, the app returned to the Star Garden map, but all three best-star entries remained 3. Returning through the visible `Back to Maths Missions` control showed the Count the Stars card as `Played 3` at both 1280×800 and 390×844. Screenshots document the map before reload and Maths Missions shelf after reload at both sizes.

## Browser diagnostics

- Browser console: 0 errors, 0 warnings.
- `/api/voice` and `/api/story` were guarded to 403 before app navigation; request inspection showed these guards, with no successful provider/story request.
- Main app views and static assets loaded without a console asset error. The three core served hashes are in `identity.json`; this is not an exhaustive image/network audit.

## Evidence and scope limits

- `screenshots/earned-constellation-map-before-reload-desktop.png` — all three 3-star bests before reload (SHA-256 `45e2334076a517aa20187bcccea9464eadb30a55265905586ac3ffa943fc73ca`).
- `screenshots/maths-world-after-reload-desktop.png` — played Count the Stars card at 1280×800 after reload/return (SHA-256 `05f417bf00be263eaa0ad1515cbbc8a396b0674461b4ac3df705e0f99833134c`).
- `screenshots/maths-world-after-reload-mobile.png` — same card at 390×844 (SHA-256 `c157d40c95565cb90c46c3e7cc8f778f1c43a558afe818cb5b095f85290bebb9`).

The run exercised the candidate's normal band progression, correct-feedback/Next, Challenge completion, reload persistence, and parent-world return. Because the repaired panel prompt did not occur, no production claim is made about its appearance, internal grid, tappability, clue, held feedback, or target-specific exit guard at either viewport. It would take an ordinary natural occurrence in a future bounded run to close that specific rendered-evidence gap. This is not a full game matrix, human audio review, full asset audit, or overall 4.5 acceptance.
