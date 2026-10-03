# Spot feedback repair and Super Spotters bounds — 3 October 2026

## Candidate and setup

Fresh isolated Playwright CLI session `spot-repeat-repair-20261003`, opened at `about:blank`, with status-204 routes for `**/api/voice**` and `**/api/story**` installed before navigating to the frozen local candidate at `http://127.0.0.1:5199`. Browser viewport: 390×844. The supplied candidate has `VITE_ELEVENLABS_ENABLED=true`; both voice and story endpoint patterns were routed to 204 before navigation. The served assets were verified: JS `index-Dcf_ih0a.js`, SHA-256 `f70c6038be49561db3c62700912a72ffdcd281bbcc8792ade2f446195be41047`; CSS `index-CU-OkS6z.css`, SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`.

The fresh browser began with zero stars and all Spot chapters locked except Starter. I started through the ordinary UI and used visible hotspot buttons. To make the Challenge bounds reachable without injecting progress, I completed the four Starter and four Curious Comparers pairs through ordinary visible controls; this was only progression to unlock Super Spotters, not a repeat of their baseline acceptance. I did not solve or complete a Challenge pair.

## Repeated marker tap and genuine miss

On the first Starter pair, Dino Park, seed `3516220250`, I clicked the visible “Check right top detail” hotspot, then physically tapped the found marker’s center. The found marker and 1/3 progress remained unchanged; the success message remained visible, no miss feedback appeared, and no additional `answer_attempt` was recorded. There was no reward/penalty or progress change from the repeated tap.

I then physically tapped a blank Picture B area at `(330, 820)`. The UI showed the gentle “Not that spot yet. Compare the same area in Picture A.” message; the found marker and 1/3 progress remained. The UI-exported log records one additional `answer_attempt` for this blank miss, with no `answer_correct` event. The export was saved using the browser’s actual download event and `download.saveAs` to `spot-repeat-repair-390-diagnostics.json`.

## 390 px controls and Super Spotters bounds

The leave confirmation displayed two controls: **Keep playing 96×96 px** and **Back to world 80×80 px**. In the play view, Back and sound controls were 48×48 px, Hear clue was 132.8×48 px, Magnifier was 173.4×48 px, and hotspots were 56×56 px.

After ordinary Starter and Curious completion, Super Spotters was enabled in the chapter selector. Its first visible pair, Nature Lab, rendered all seven real hotspot buttons at 56×56 px. Pairwise intersection checks returned no overlapping hotspot rectangles. The page has vertical scroll: two lower hotspots start below the initial 844 px viewport, then become fully visible with ordinary page scrolling (`scrollY=185`). Document width stayed 390 px, so no horizontal overflow occurred. Bounds and measurements are in [spot-bounds-390.json](spot-bounds-390.json).

## Evidence

- `starter-before-hit-390x844.png`
- `after-first-hit-390x844.png`
- `repeat-marker-tap-390x844.png`
- `genuine-blank-miss-390x844.png`
- `leave-confirmation-390x844.png`
- `challenge-hotspots-top-390x844.png`
- `challenge-hotspots-scrolled-390x844.png`
- `spot-repeat-repair-390-diagnostics.json` (UI download saved through `download.saveAs`)
- `spot-bounds-390.json`

This is local candidate evidence only. The voice/story endpoints were blocked, so no audible review was performed. No production acceptance or overall game score is claimed. No source files were edited.

## Desktop repeat and blank-miss follow-up

A second fresh Playwright CLI session, `spot-repeat-repair-desktop-20261003`, started at `about:blank` at 1280×800. The same broad `**/api/voice**` and `**/api/story**` status-204 guards were installed before first navigation to `http://127.0.0.1:5199`. The served JS and CSS hashes matched the candidate hashes listed above.

Through the visible UI, I selected Amari → Thinking & Play → Spot the Difference → Bright-Eyed Beginners → Start chapter. The scene was Superhero City, Starter pair 1, seed `4105371066` (start/scene timestamp `2026-10-03T08:44:34.226Z`). Before clicking, the visible “Check right top detail” target measured 56×56 px at x=1111.59, y=342.64; its center was (1139.59, 370.64). Clicking that visible hotspot changed progress to 1/3 and showed “You found a change! 1 of 3.” I then physically clicked the former target center (1140, 371). The success feedback and 1/3 count remained unchanged, and no miss flash appeared. The target disappeared as found. The exported event log contains the initial hit’s `answer_attempt` and `answer_correct`, but no additional attempt for the repeated tap.

I physically clicked blank Picture B space at (954, 627), within its measured image rectangle x=664, y=288, 580×435. Progress remained 1/3 and the gentle “Not that spot yet. Compare the same area in Picture A.” response appeared. The event log has one additional `answer_attempt` at `2026-10-03T08:45:52.295Z`, with no corresponding `answer_correct`; this is the genuine blank miss. The actual UI download event was saved with `download.saveAs` as `spot-repeat-repair-desktop-diagnostics.json`.

Desktop screenshots: `starter-before-hit-desktop-1280x800.png`, `after-first-hit-desktop-1280x800.png`, `repeat-marker-tap-desktop-1280x800.png`, and `genuine-blank-miss-desktop-1280x800.png`. `desktop-console.txt` reports zero messages, errors, and warnings. Request inventories are in `desktop-requests.txt` and `desktop-requests-all.txt`; the ordinary listing noted 14 static requests hidden by default, and the all-requests listing retains them. It contains 17 requests total, all to the local origin for the page, bundled assets, images, icons, or packaged audio; no voice/story API request appears in that inventory. Both API guard patterns were active for the entire navigation and UI run.

This follow-up remains local candidate evidence only; voice/story calls were guarded, so it does not establish audible or production behavior. No source files were edited, and no further pairs were completed in the desktop run.
