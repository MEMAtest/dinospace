# River Valley authored-pair prototype: independent local review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5320`  
Source: `0246a5c`  
Frozen dist: `tmp/spot-river-pair-0246a5c/dist`  
Identity: `docs/qa-evidence/spot-river-pair-identity-20261004.json`  
Asset provenance: `docs/qa-evidence/spot-river-pair-provenance-20261004.json`

## Verdict

**Do not accept this candidate’s artwork as a three-local-change pair.** The three requested differences are visible and the interaction works at both tested sizes, but the B image also appears to change the dinosaur’s pose/placement outside those intended regions. The scene-wide generation difference is visible in the side-by-side rendering, so this version does not meet the provenance prompt’s “no other objects changed” constraint. Root has frozen the original at 5320 and is preparing a region-constrained revision separately.

This is a finite one-pair local review, not a release or 4.5 acceptance. The candidate identity lists one missing narration clip (`a44acc87`, “Look near the middle area of Picture B”); no narration playback or audio quality is accepted here.

## Identity, isolation, and network

Fresh desktop and mobile Playwright sessions began at `about:blank`. Each installed `**/api/voice**` and `**/api/story**` route guards before navigating to the app. Sound was muted through the visible control. The Amari player and Thinking & Play world were selected through ordinary UI. No storage, seed, progress, child profile, answer, or hidden guide state was injected or inspected; no provider call was made.

All nine files in the candidate identity record were fetched from 5320 and returned HTTP 200. Their byte counts and SHA256 hashes matched the frozen identity, including both River Valley image assets. Browser request inventories contained same-origin static files only; there were no voice/story requests. Desktop and mobile console logs each had zero errors, warnings, or other messages.

## Visual comparison

The source provenance identifies these requested edits in Picture B:

1. Upper-right sun changed to a crescent moon.
2. Large lower-left flower changed from pink petals to yellow petals.
3. One central bridge upright post removed.

All three are visible in the browser at 1280×800 and 390×844. The overall 4:3 scene composition and crop are retained. However, the dinosaur’s silhouette/pose appears to move between A and B outside those locations; the image also shows small scene-wide differences in the sky, river, rocks, and foliage. The source asset dimensions match at 1448×1086, but B is a generated full-image variant, not an edit constrained to the three authored regions. These extras are not needed to make the puzzle solvable and weaken the child’s ability to compare a stable picture.

The screenshot files preserve the source candidate’s side-by-side views. `river-desktop-initial.png` shows all of Picture A and B together, making the apparent extra dinosaur pose difference reviewable. `river-mobile-initial.png` shows the stacked 390 px layout.

## Ordinary-UI interaction evidence

| Viewport | Normal unlock route and River round | Checks and result |
|---|---|---|
| Desktop 1280×800 | Fresh Amari profile → Thinking & Play → Spot the Difference → Start Bright-Eyed Beginners. Dino Park completed as pair 1; River Valley appeared as pair 2. After completing the remaining ordinary chapter rounds, Replay began with Dino Park and River Valley appeared as pair 2 again. | Blank click at `(760,340)` on blank Picture B sky gave “Not that spot yet. Compare the same area in Picture A.” Progress stayed 0/3. Two Magnifier hints gave distinct clues: “right top” and “left bottom.” Actual pointer taps on the crescent `(1170,338)`, yellow flower `(735,674)`, and bridge-post gap `(866,484)` advanced 1/3, 2/3, 3/3. The completed pair held the fact “A clean river gives plants and animals a place to find fresh water.” and exposed Next picture. |
| Mobile 390×844 | Fresh Amari profile → Thinking & Play → Spot the Difference → Start Bright-Eyed Beginners. Moon Camp, Superhero City, and Dino Park completed through ordinary UI; River Valley appeared as pair 4. | Blank tap at `(55,680)` on Picture B foliage gave the same gentle miss and stayed at 0/3. Magnifier hints were distinct: “left bottom” then “middle area.” Pointer taps on the crescent `(319,705)`, bridge-post gap `(165,793)`, and, after vertical scroll, yellow flower `(72,690)` advanced to 3/3 and chapter completion. The fact was held, with Next chapter and Replay chapter available. |

Other chapter-unlock pairs were completed through the app’s exposed, labeled target controls. Those unlock actions are not counted as independent visual-discovery tests. The River target checks above used pointer clicks on the pictured edits.

## Hit-target geometry and viewport bounds

| Viewport | Picture B | Target controls | Page bounds |
|---|---|---|---|
| Desktop 1280×800 | `(664,288)` to `(1244,723)`, 580×435 px | Three buttons, each 56×56 px: right-top `(1140.59,320.89)`, left-bottom `(711.39,634.09)`, middle `(873.80,473.14)`. All fully inside Picture B. | Document width 1280 px, no horizontal overflow; height 831 px. Both full images and all targets were visible in the initial viewport. |
| Mobile 390×844 | `(28,670.5)` to `(362,921)`, 334×250.5 px | Three buttons, each 56×56 px: left-bottom `(43.41,857.92)`, middle `(136.94,765.23)`, right-top `(290.58,677.56)`. All fully inside Picture B. | Document width 390 px, no horizontal overflow; height 1029 px. A and B stack vertically. Picture B starts below the first viewport’s upper portion; the lower flower target requires normal vertical scrolling. |

The visible A/B scene scales/crops consistently at each viewport. The lower mobile target is reachable by ordinary page scroll. A 390 px viewport in desktop Playwright is not physical-device or touchscreen evidence.

## Gate disposition

- **Interaction:** Pass for this pair in the two fresh browser profiles: all three picture targets, gentle miss, two distinct hints, held fact, and forward progression were exercised.
- **Target usability:** Pass for measured geometry: all three controls are 56×56 px and contained in Picture B; no horizontal overflow was found. Mobile needs vertical scrolling for lower Picture B content.
- **Artwork fidelity:** Fail for this candidate. The dinosaur’s pose/placement appears to change outside the three intended difference regions. The next candidate should preserve the A raster and compose only the authorized sun, flower, and bridge edits; inspect seams and interior-region spill before any acceptance.
- **Reliability/audio:** No console or network-provider issue was observed. The missing narration clip remains pending; no human listening or audio acceptance was performed.
- **Release/overall score:** Not assessed and not accepted.

## Screenshot index

- `screenshots/river-desktop-initial.png` — fresh desktop River Valley A/B before miss/hints.
- `screenshots/river-desktop-hints.png` — desktop after the miss and both hints.
- `screenshots/river-desktop-held-fact.png` — desktop River Valley 3/3 held fact with Next picture.
- `screenshots/river-mobile-initial.png` — fresh mobile River Valley A/B at initial scroll position.
- `screenshots/river-mobile-two-found.png` — two target changes found before scrolling to the flower.
- `screenshots/river-mobile-scrolled.png` — both images and lower target visible after ordinary scroll.
- `screenshots/river-mobile-complete.png` — mobile chapter completion and held River Valley fact.

