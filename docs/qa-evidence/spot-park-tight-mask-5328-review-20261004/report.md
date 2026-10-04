# Dino Park tight silhouette: independent local review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5328`  
Source: `a86a9b97e9eeb809a65386caca2705bab85e1fa3`  
Frozen dist: `tmp/spot-park-tight-mask/dist`  
Identity: `docs/qa-evidence/spot-park-tight-mask-identity-20261004.json`

## Verdict

**The corrected Dino Park recolour passes this narrow visual and pointer regression check at 1280×800 and 390×844.** In the A/B renders, the purple long-neck dinosaur’s colour follows its visible silhouette, including the head, neck, torso, tail, and feet. The cream underside, eye, mouth, and teeth remain distinct. I did not see the sky tab or water/foot blocks previously present on candidate 5327, nor a visible colour spill outside the dinosaur. The orange sun disc and teal flower petals remain localized; the flower’s yellow centre is retained. The preserved composition outside those intended objects appears unchanged in the side-by-side captures.

This is a bounded local delta, not a rerun of Spot’s full authored scene/chapter matrix. It does not establish audio quality/readiness, production acceptance, or an overall 4.5 score.

## Identity and safeguards

All eight files in the frozen candidate identity returned HTTP 200 with the recorded byte sizes and SHA256 values. Fresh desktop and mobile browser profiles started at `about:blank`; `/api/voice` and `/api/story` guards were installed before first app navigation. I used the visible sound control to mute the app, reached Spot and Starter through normal UI, and progressed to Dino Park through the ordinarily displayed scene order. Earlier scenes were completed using their visible labelled targets. No child data, seed, progress, answer, storage, hidden solution or guide state was injected or inspected. The voice/story guards recorded no provider requests. Browser console logs had zero messages, and the document did not overflow horizontally at either viewport. This test did not assess audible quality.

## Rendered visual check

The rendered comparison shows Picture A’s blue long-neck dinosaur and Picture B’s purple recolour. The head shape and eye/mouth details remain recognizable; the mask does not flatten the cream belly. At desktop and mobile scale, I saw no separate purple tab in the sky, rectangular foot/water patch, cyan edge spill, or obvious unnatural contour. The sun’s orange disc and flower’s teal petals are visibly bounded to their intended objects. These are rendered observations, not a claim that the source background raster itself differs.

The prior 5327 visual failure remains part of the history: that candidate had a purple tab above/left of the head and purple/cyan patches near the feet and water. Candidate 5328 is a separate immutable origin and the screenshots below show the new candidate’s rendered result; the old failure is not relabelled as a pass.

## Normal UI interaction

| Viewport | Observed path and result |
|---|---|
| Desktop 1280×800 | Starter’s ordinary random order placed Dino Park fourth. A blank Picture B tap at `(700,310)` gave the gentle “Not that spot yet” feedback and stayed at 0/3. The long-neck head tap `(733,416)` advanced to 1/3. A body repeat `(785,580)` remained neutral at 1/3. Flower `(756.8,662.1)` advanced to 2/3; sun `(1162.8,348.9)` completed 3/3. The held fact was “Fossils are clues that help scientists learn about dinosaurs.” Next picture was available. |
| Mobile 390×844 | Starter’s visible randomized order was Moon Camp, Superhero City, Dino Park. Earlier scenes were completed by their visible labelled targets. After ordinary scrolling to Picture B, a blank sky tap `(160,500)` gave the gentle miss and stayed at 0/3. The head tap `(69,555)` advanced to 1/3; a body repeat `(114,650)` stayed neutral. Flower `(81.4,700.9)` advanced to 2/3; sun `(315.2,520.6)` completed 3/3. The same fossil fact remained held and Next picture appeared. Reload returned to the map with Starter at 3/4 pairs and the next chapter still locked, consistent with only three scenes completed in that fresh profile. |

The rendered target buttons measured 56×56 CSS pixels. At mobile, the dinosaur head point was outside the standard left-middle target button but was accepted through the separate generous touch polygon. The lower scene required ordinary vertical scrolling; the 390px map had no horizontal overflow after reload. The body tap occurred after the head had already been credited, so this is a neutral-repeat check, not proof that a body-only tap independently identifies the dinosaur.

## Evidence files

- `screenshots/desktop-initial.png` — desktop Dino Park before searching.
- `screenshots/desktop-ab-detail.png` — side-by-side desktop composition and recolour.
- `screenshots/desktop-held-fact.png` — completed round, held fact, and Next.
- `screenshots/mobile-initial.png` — mobile pair before scrolling.
- `screenshots/mobile-full-scene.png` — mobile scene after ordinary scroll.
- `screenshots/mobile-ab-detail.png` — side-by-side mobile composition and recolour.
- `screenshots/mobile-held-fact.png` — completed mobile round and held fact.
- `screenshots/mobile-reload-map.png` — ordinary reload and map progress.

## Gate disposition

- **Dino Park visual delta:** Pass for the visible native recolour silhouette at both tested widths; no 5327 sky/foot/water leaks observed.
- **Pointer round delta:** Pass for one blank miss, head recognition, neutral repeat after recognition, flower/sun completion, held fact, and Next at desktop and mobile.
- **Reload:** Mobile ordinary reload retained the observed map progress and chapter lock state.
- **Audio, full content, production, score:** Not established by this delta. No provider call or human listening claim; no 4.5 acceptance.
