# Final targeted independent review: build 831

Date: 2026-10-03. This report records only the scoped follow-up against the frozen local build. It does not replace the retained full-band baseline or accept a release.

## Candidate and safeguards

- Source SHA: `83149d897366dcbe8bc4034849d340ed61a0221d`.
- Served at `http://127.0.0.1:5205` (desktop 1280×800 and mobile 390×844 isolated profiles). The exact rendered JS and CSS asset hashes, source directory, production voice flag, and root source gates are recorded in [candidate identity](../batch2-start-visible-candidate-identity-20261003.json). Root records 173/173 tests, lint/build pass, and all 1,371 packaged clip bytes matching.
- Both `**/api/voice**` and `**/api/story**` routes were blocked before reloading either app. Sound stayed off. Final request inventories show no voice/story requests; final console inventories show 0 errors and 0 warnings. No provider calls, source edits, seed/progress injection, or deployment occurred.
- Profiles carried progress earned earlier through the visible game UI. Additional Spot setup below used the visible hotspot controls to complete Starter and Growing; no stored state was copied or edited.

## Sky Shapes: repaired pre-input cue

At both widths, I used the visible map controls to load a Starter flight, a Growing flight, and a Challenge flight. On each newly loaded route and after the visible Restart flight control, the numbered green start marker was visible and the jet was absent. This fixes the e223 start-screen overlap documented in [the historical report](e223-targeted-delta-report.md) and [its geometry record](e223-sky-start-geometry-observation.json).

Pressing Enter begins tracing and places the jet at its active route point. A Space press advances it along the route. The jet may cover its own current point during this active-flight state; that is expected cursor placement, not a new start-cue failure. On Challenge, I completed the first numbered part through the displayed route and confirmed the next-part message named number 2; the next green marker and number were exposed before input, with no jet at that marker on desktop or mobile. Geometry and text captures for Starter load/begin/restart, Growing load/begin/step/restart, and Challenge load/begin/step/restart/next-part are retained in the `*repaired-sky*` files in this directory. Viewport document widths remained 1280 and 390 respectively.

## Spot the Difference: two Challenge picture pairs

I completed Nature Lab (pair 1) and Robin’s Woodland (pair 2) in Super Spotters at both widths. Both new picture pairs loaded with matching A/B artwork, subject-specific alt text, and seven distinct target controls. Each target measured 56×56 px; the seven rectangles did not overlap in either pair at either width. Document width equalled viewport width (1280 desktop, 390 mobile).

On each pair, I used both Magnifier controls without first finding the hinted target. The hint text and visible amber pulse moved to a different picture location on the second use. DOM measurements show a 56×56 px ring with computed amber border `rgb(245, 158, 11)` and `pulse` animation. The visible token count decreased 2→1→0 and the second control became disabled. Nature Lab’s hints pointed to separate leaf/flower and water-jar details; Robin’s Woodland pointed to separate scene details. The screenshot pairs and computed geometry are retained as `*-naturelab-hint*.png`, `*-robin-hint*.png`, and `*-spot-*-hint-*.json`.

Both pictures completed through their seven visible target controls and showed one held picture fact with Next picture available: “Plants need light and water to grow.” for Nature Lab, and “Robins use their beaks to find food and build safe nests.” for Robin’s Woodland. There was no second full fact sentence in the status area. After a correct target is found it is removed from the active hit targets. On desktop, a repeat click attempt on that same locator found no remaining control and the counter stayed at 1/7; on mobile the found control was likewise removed and the counter remained 1/7. The measured full target sets were pair-specific and distinct at each width; the initial 2→1→0 hint sequence stayed neutral to found count.

## Puzzle Pop: actual UI diagnostic export

To get a completed record with exactly one hint, I replayed the 2×2 Picture Pioneers image, pressed the visible Hint control once, followed its highlighted piece/space mapping, and completed the remaining three pieces using the visible tray and board controls. The one actual Download game log action is saved as `desktop-puzzle-hint-game-log.json`. Its `puzzle` `scene_complete` event for level 0, round 1 records `hints: 1` and `firstAttempt: true`, alongside the corresponding hint and four correct-placement events. The solved image showed its held picture fact and Next picture control.

The earlier e223 failure—its exported completion omitted the `hints` field—is preserved in `e223-targeted-delta-report.md` and the original e223 download. The 831 download supplies the missing field; the meanings are independent: `firstAttempt` records no wrong response, while `hints` records assistance.

## Boundary and remaining review

This targeted UI check establishes the repaired cue behavior, two affected Spot Challenge pairs, and the completed Puzzle hint export for this local build. It does not repeat the 24-game baseline or claim every unvisited picture/flight in these games passed. The visual asset sample here is limited to the named Nature Lab and Robin’s Woodland pairs. Voice content was not auditioned; the production alias was not exercised or deployed. I therefore make no fresh numeric five-dimension score or 4.5 acceptance claim from this visual and interaction delta. Any earlier provisional scores belong to their earlier source/build and are not silently carried forward.
