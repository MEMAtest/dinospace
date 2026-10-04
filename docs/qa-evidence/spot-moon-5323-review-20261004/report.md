# Moon Camp original-colour masks: independent rendered review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5323`  
Source: `05e0dcd9352f1e0b7893cc28a7575f464a93c68e`  
Frozen dist: `tmp/spot-moon-original-colours/dist`  
Identity: `docs/qa-evidence/spot-moon-original-colours-identity-20261004.json`

## Verdict

**Rendered mask alignment passes for the three Moon Camp colour edits at the tested desktop and mobile sizes.** The changes stay on the rocket porthole glass, rover solar-panel cells, and habitat window. I saw no obvious clipping, detached colour island, changed surrounding background, or mask spill in the full side-by-side views. Ordinary pointer interactions found all three targets at both sizes and reached the held fact/Next state.

This is a narrow single-pair candidate review. It is not a full Spot acceptance, audio/listening result, production review, or 4.5 score.

## Candidate and isolation

All eight files in the candidate identity record returned HTTP 200 with matching byte counts and SHA256: `index.html`, six JS/CSS assets, and `dino-moon-3d-f1vVSf2r.webp`. Both browser sessions began at `about:blank`; `/api/voice` and `/api/story` guards were installed before first app navigation. Fresh sessions used 1280×800 and 390×844 viewports. The visible sound control remained off. The Amari profile, Thinking & Play world, Spot game, Starter chapter, and progression were reached using ordinary UI. There was no provider request, storage/progress/answer injection, or inspection of hidden solution state.

Both A and B use the same original Moon Camp raster. In B, the visible colour changes are localized to three object surfaces: the rocket porthole glass changes purple to green, the rover solar-panel cells change blue to orange, and the habitat window changes amber to green. At both viewport widths, the surrounding rocket ring/body, panel frame, habitat shell, sky, rover, and other scene detail appear unchanged. I saw no rectangular patch boundary, edge cut-off, doubled geometry, or isolated colour fleck. This is a rendered visual judgement at the two captured viewport sizes, not a pixel-difference claim.

## Ordinary UI path and pointer evidence

| Viewport | Path and result |
|---|---|
| Desktop 1280×800 | Fresh Starter opened Moon Camp as Pair 1. A blank Picture B tap `(830,690)` produced “Not that spot yet. Compare the same area in Picture A.” and stayed at 0/3. One Magnifier hint said “look near the left top of Picture B.” Actual pointer taps at the porthole `(757,379)`, solar-panel cells `(1000,571)`, and habitat window `(1168,531)` advanced 1/3, 2/3, 3/3. The held fact read “The Moon is a rocky world that travels around Earth.” with Next picture available. |
| Mobile 390×844 | Fresh Starter began on Superhero City, followed by River Valley and Moon Camp as Pair 3. The visible accessible target controls were used only to complete the first two pairs for ordinary progression; Moon Camp itself was completed by pointer. On Moon Camp, a blank sun/sky tap `(270,675)` produced the same gentle miss and stayed at 0/3. The first and second hints were “left top” and “right area.” After normal scroll to expose the lower half of Picture B, pointer taps at the porthole `(81,699)`, habitat window `(319,626)`, and solar-panel cells `(222,648)` advanced to 3/3. The held fact and Next picture control appeared. |

At desktop, both pictures were 580×435 px and the three active target controls were each 56×56 px, fully within Picture B. At mobile, pictures were 334×250.5 px; each target remained 56×56 px and fully inside Picture B. The lower targets required ordinary vertical scrolling. Mobile `documentElement.clientWidth` and `scrollWidth` were both 390 px at the held-fact screen; no horizontal overflow was observed. The 390px emulated viewport is not physical touchscreen evidence.

Console messages: zero at both viewports. Requests contained only same-origin app/static assets; no `/api/voice` or `/api/story` request escaped the installed guards. Images loaded successfully in the initial pair views. No audio was played or evaluated.

## Evidence files

- `screenshots/desktop-moon-camp-first-visit.png` — initial side-by-side at 1280×800.
- `screenshots/desktop-moon-camp-first-hint.png` — desktop wrong tap and first hint visible.
- `screenshots/desktop-moon-camp-held-fact.png` — desktop completed pair and held fact.
- `screenshots/mobile-moon-camp-pair3-initial.png` — mobile side-by-side before search.
- `screenshots/mobile-moon-camp-two-found-scrolled.png` — porthole found and lower Picture B visible after normal scroll.
- `screenshots/mobile-moon-camp-held-fact.png` — mobile completed pair and held fact.

## Gate disposition

- **Artwork/mask alignment:** Pass for these three Moon Camp surfaces at 1280×800 and 390×844. No obvious spill or seam was visible.
- **Interaction:** Pass for the three changed surfaces, one blank miss at each viewport, hint availability, held fact, and Next control.
- **Target usability:** Measured controls are 56×56 px and fully inside Picture B. Mobile requires vertical scroll for lower scene details; no horizontal overflow.
- **Audio, full-game acceptance, and score:** Not assessed here. No human listening or paid/provider call was used; no overall acceptance/4.5 score is awarded.
