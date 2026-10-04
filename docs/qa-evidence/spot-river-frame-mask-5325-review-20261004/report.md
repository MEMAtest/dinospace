# River Valley frame-mask cleanup: independent local delta review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5325`  
Source: `94c4614aa894fc5ee72409522d25c6a5b045d4f3`  
Frozen dist: `tmp/spot-river-frame-mask/dist`  
Identity: `docs/qa-evidence/spot-river-frame-mask-identity-20261004.json`  
Prior candidate: `9ddfb4f` at 5322 had a faint residual trace of the original sun rays; that failure remains recorded in `spot-river-feather-5322-review-20261004/`.

## Verdict

**The 5325 River sky cleanup passes this bounded rendered delta at 1280×800 and 390×844.** The crescent replaces the sun without visible residual rays, a rectangular patch, or an obvious seam at the edited frame. The yellow flower and removed bridge post remain localized, with no obvious extra geometry, colour island, clipping, or collateral background change. Actual pointer taps on all three changed objects completed the pair at both sizes.

This report is a narrow candidate delta, not a full Spot rerun, production review, audio/listening result, or 4.5 acceptance.

## Identity and isolation

All nine files in the candidate identity record returned HTTP 200 with matching byte counts and SHA256. Fresh desktop and mobile Playwright sessions began at `about:blank`; `/api/voice` and `/api/story` route guards were installed before first navigation. The user-visible path selected Amari, Thinking & Play, Spot, and Starter; sound was turned off in the interface. Mobile progression reached River Valley as Pair 3 after two earlier pairs were completed through the exposed labelled target controls. No child data, seed, progress, answer, storage, or hidden solution state was injected or inspected. No provider request occurred.

Both River pictures use the original `dino-river-3d-DS1Pw89d.webp` raster; candidate identity also includes `river-valley-pair-b-v1-BvZSBbF5.webp`. At 1280×800 and 390×844, I saw the intended crescent, single yellow flower, and gap where the central bridge post was removed. The top/right sky frame looked continuous in both full-size views. The faint original rays reported on 5322 were not visible on 5325. Flower and bridge edits had no obvious seams or added shapes in the rendered comparisons. This is a visual check at the tested sizes, not a pixel-difference proof.

## Pointer interaction

| Viewport | Ordinary route and result |
|---|---|
| Desktop 1280×800 | Fresh Starter opened Superhero City Pair 1, Moon Camp Pair 2, and River Valley Pair 3. A blank sky click `(760,340)` gave “Not that spot yet. Compare the same area in Picture A.” and remained 0/3. The two hints were distinct: “middle area” then “right top.” Pointer taps on the crescent `(1168.6,348.9)`, yellow flower `(739.4,662.1)`, and bridge-post gap `(901.8,501.1)` produced 1/3, 2/3, and 3/3. The held fact was “A clean river gives plants and animals a place to find fresh water.” with Next picture available. |
| Mobile 390×844 | Fresh Starter opened Dino Park Pair 1, Moon Camp Pair 2, and River Valley Pair 3. River Valley required ordinary vertical scrolling to expose Picture B. A blank foliage click `(80,500)` yielded the same gentle miss and stayed at 0/3. Hints were “middle area” then “right top.” Pointer taps on the crescent `(318.6,520.6)`, yellow flower `(71.4,700.9)`, and bridge-post gap `(164.9,608.2)` produced 1/3, 2/3, and 3/3. The same River fact appeared with Next picture available. |

At desktop, Picture B was 580×435 px and each target control 56×56 px, fully within the image. At mobile, Picture B was 334×250.5 px and each target remained 56×56 px, fully inside the image. The lower Picture B area required normal vertical scroll. At the sampled mobile held-fact state, viewport and document widths were both 390 px; no horizontal overflow was observed. This 390px browser viewport is not physical touchscreen evidence.

The route-guarded sessions made no `/api/voice` or `/api/story` calls. Requested app, scene, and audio files returned 200; audio requests were muted and do not establish playback or quality. Console had zero errors, warnings, or other messages in both sessions.

## Evidence files

- `screenshots/desktop-river-initial.png` — initial desktop pair and sky frame.
- `screenshots/desktop-river-held-fact.png` — all three desktop targets found and fact held.
- `screenshots/mobile-river-initial.png` — mobile pair before search.
- `screenshots/mobile-river-scrolled.png` — full mobile Picture B after ordinary scroll.
- `screenshots/mobile-river-held-fact.png` — all three mobile targets found and fact held.

## Gate disposition

- **Sky-frame cleanup:** Pass for this rendered delta; the 5322 residual ray trace is no longer visible at either tested viewport.
- **Object localization:** Pass by visual inspection at these sizes for crescent, flower, and bridge-post removal.
- **Interactions and target size:** Pass for one actual three-target pointer completion, one miss, two distinct hints, and held fact/Next at each viewport; measured targets were 56×56 px and fully inside Picture B.
- **Audio, full-game acceptance, and score:** Not assessed. No listening claim, provider call, production acceptance, or overall 4.5 score is made.
