# Spot the Difference marker QA — 3 October 2026

## Scope and identity

Fresh isolated Playwright CLI session `spot-marker-fixed-20261003`; began at `about:blank`. Before first app navigation, status-204 routes blocked `**/api/voice**` and `**/api/story/**`. All player selection, game selection, chapter selection, hotspot input, replay, and log export used visible UI controls. No state/progress or answer data was injected; no source or deployment was changed.

Candidate: `http://127.0.0.1:5198`, source `6d18cce` plus the generated-manifest checkpoint. Served JS `/assets/index-ru9r4zVs.js` SHA-256 `24960c1feb0821cc5552bb0c9d81f89373037461c685d2d0e20417efe3083b1f`; CSS `/assets/index-CU-OkS6z.css` SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`. The served JS and CSS hashes match the requested candidate. This is local browser evidence only, not production acceptance.

The previous failure is preserved under its old identity in [the original reproduction](../../spot-marker-20261003/reproduction.md): source `a32f2e0`, JS SHA-256 `f2052b2c5e696a22a32c81e206b6ca02818d28375a467ff26ac4eed252d1969f`. Its original `before.png` / `after.png` remain unchanged. This report records only the new candidate deltas.

## Marker placement

At desktop 1280×800, the first visible pair was River Valley. I recorded the target rectangles before clicking two actual hotspot buttons, then the found-marker rectangles after the UI confirmed each hit. Both marker centers matched their pre-click target centers exactly (0 px error):

| Visible hotspot | Pre-click center | Found marker center | Error |
|---|---:|---:|---:|
| Check left middle detail | (782.4375, 502.6875) | (782.4375, 502.6875) | 0 px |
| Check right middle detail | (1097.3125, 506.96875) | (1097.3125, 506.96875) | 0 px |

At 390×844, the first pair was Superhero City. The two measured marker centers matched the target centers exactly relative to Picture B. The success message changes the layout height by 24 px, shifting the whole picture panel upward; comparing panel-relative coordinates gives 0 px error for both markers. Target and found marker rectangles are in [spot-marker-geometry.json](spot-marker-geometry.json).

At both sizes, the found markers appeared on the actual changed details. The desktop panel fit in the viewport. Mobile keeps the stacked picture panels in a vertically scrollable page: the 390 px viewport has no horizontal overflow, and lower picture content/hotspots can sit below the fold until the page is scrolled. The measured mobile controls are 48 px or larger; hotspot buttons are 56×56 px.

## Ordinary Starter runs and same-viewport replay

| Viewport | Completed Starter run | Same-viewport replay | Result |
|---|---|---|---|
| Desktop 1280×800 | Seed `3883754613`; River Valley → Superhero City → Dino Park → Moon Camp; completed all 4 pairs via visible hotspot buttons | Seed `1456009526`; first pair Superhero City | New seed and different first pair; replay left after one visible hotspot and repeated-tap observation |
| Mobile 390×844 | Seed `3330712524`; Superhero City → Dino Park → River Valley → Moon Camp; completed all 4 pairs via visible hotspot buttons | Seed `167300840`; first pair Moon Camp | New seed and different first pair; replay left before answering |

Seed and round milestones come from UI-exported diagnostics. Pair names/order were recorded from the visible scene headings and sequence. These are two separate completed-run → replay pairs at matching viewports; no cross-viewport order comparison was used. The uniquely named UI exports are `spot-desktop-run1-diagnostics.json`, `spot-desktop-run2-diagnostics.json`, `spot-mobile-run1-diagnostics.json`, and `spot-mobile-run2-diagnostics.json`.

## Repeated tap observation

On desktop replay seed `1456009526`, I found one hotspot, then physically tapped the same marked location again. The UI responded **“Not that spot yet. Compare the same area in Picture A.”** Progress stayed at 1/3 and no reward was issued. The UI export contains an `answer_attempt` for the repeat but no matching `answer_correct` event. The found marker itself is decorative and ignores pointer events; the tap falls through to the full Picture B search surface and is treated as a miss. This is an actual feedback/diagnostic behavior to review; it does not regress marker alignment.

## Mobile control bounds

Rendered button bounds were recorded in the intro chapter map, play screen, and completed screen. Chapter selection, Start/Replay chapter, Hear clue, Magnifier, Next picture/Next chapter, and Replay chapter were each at least 48 px in width and height. Sound and Back controls were 48×48 px; hotspot controls were 56×56 px. The image search surface spans Picture B and is larger than the minimum. The document width did not exceed the 390 px viewport. The play scene is vertically scrollable; lower targets can extend below the initial viewport and require scrolling, with no horizontal clipping observed.

## Evidence and boundary

- `desktop-before-hotspots.png`, `desktop-two-markers.png`, and `desktop-repeat-tap.png`
- `mobile-before-hotspots.png`, `mobile-two-markers.png`, `mobile-completed.png`, `mobile-replay-intro.png`, and `mobile-replay-first-pair.png`
- `spot-marker-geometry.json` and four uniquely named UI diagnostics exports
- Original failed-build identity and screenshots remain under [spot-marker-20261003](../../spot-marker-20261003/)

The marker-center defect is closed for the two measured real hotspots at each viewport on this frozen local candidate. The four-pair Starter run and same-viewport replay/order checks completed at both viewports. The repeat-tap feedback behavior remains an issue to review. This was not a production deployment or acceptance run. Narration/API playback was blocked; audible playback and quality were not evaluated. No 4.5/5 score or overall game acceptance claim is made.
