# Dino Park original-colour recolour: independent local review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5327`  
Source: `ed54999807a10007f9ed4bbffe095565fdf6b69a`  
Frozen dist: `tmp/spot-park-original-colours/dist`  
Identity: `docs/qa-evidence/spot-park-original-colours-identity-20261004.json`

## Verdict

**Do not accept the artwork yet.** The recolour generally follows the blue long-neck dinosaur and keeps its cream underside, eye and teeth intact, but the purple mask has visible artifacts outside the silhouette. In the desktop A/B crop there is a flat purple tab in the sky above/left of the head and a vertical purple block outside the near front foot into the water/shore. A cyan/teal spill is also visible at the foot/water boundary. These are not subtle at enlarged scale and are visible in the mobile crop too. The art must be corrected before visual acceptance.

The orange sun disc and blue/teal flower petals appear localized; the yellow flower centre remains visible. Pointer interaction, hints, held fact, and ordinary reload progress behaved correctly in the tested UI paths. This is a narrow local candidate review, not full Spot acceptance, production acceptance, an audio/listening result, or a 4.5 score.

## Candidate identity and safeguards

All eight identity-record files returned HTTP 200 with matching byte counts and SHA256. Fresh desktop and mobile Playwright sessions started at `about:blank`; `/api/voice` and `/api/story` guards were installed before first app navigation. Sound was turned off through the visible control. Amari, Thinking & Play, Spot, and Starter were reached through normal UI; mobile progression used the visible labelled targets on earlier pairs to reach Dino Park as Pair 4. No child data, seed, progress, answer, storage, or hidden solution state was injected or inspected. No provider endpoint request escaped the guards.

Desktop and mobile console logs each had zero errors, warnings, or other messages. Requested application, image, and packaged audio files returned HTTP 200; the interface was muted and no audio was played. These fetches do not establish narration playback or audio quality.

## Visual inspection

The pair uses the same `dino-park-CfXqz-J3.jpg` scene in both pictures. Picture B recolours the long-neck dinosaur from blue to purple, the sun disc from yellow to orange, and the lower-left flower petals from pink to blue/teal.

The dinosaur’s head, neck, back, tail, and legs are predominantly purple. The cream underside, visible eye details, and teeth remain legible. However, the recolour does not cleanly stop at the dinosaur boundary:

- A small flat purple tab intrudes into the sky just above/left of the head, approximately **9–12% across and 23–26% down** Picture B.
- A rectangular purple block leaks beside the near/front-left foot into the water/shore at approximately **8–12% across and 78–85% down** Picture B.
- A cyan/teal patch crosses the foot/water boundary around **23–29% across and 78–83% down** Picture B.

These normalized coordinates are approximate visual locations in the 580×435 desktop Picture B image, not extracted hidden solution coordinates. The mobile enlargement confirms the foot-edge block/spill; at normal 390px scale the artifacts are less prominent but still present. The desktop A/B detail crop should guide correction; preserve the dinosaur’s actual silhouette and protect the cream belly/eye details while removing the outside-mask patches.

The orange sun disc appears confined to its circular face, with rays remaining in the surrounding sky. The flower petals are blue/teal while the yellow centre remains visible; I saw no obvious isolated colour fleck at either rendered size.

## Normal UI interactions

| Viewport | Route and observations |
|---|---|
| Desktop 1280×800 | Fresh Starter opened Dino Park as Pair 1. A blank Picture B sky click `(700,310)` yielded “Not that spot yet. Compare the same area in Picture A.” and stayed at 0/3. A pointer click on the long-neck head `(733,416)` was accepted (1/3). A second click on its body `(785,580)` remained at 1/3, a neutral repeat rather than duplicate credit. Flower `(756.8,662.1)` advanced to 2/3; sun `(1162.8,348.9)` advanced to 3/3. The held fact said “Fossils are clues that help scientists learn about dinosaurs.” and Next picture was available. Two visible Magnifier hints were also tested on the following Moon Camp pair; they read “left top” and “middle area.” |
| Mobile 390×844 | Fresh Starter order was Moon Camp, River Valley, Superhero City, then Dino Park (Pair 4). Earlier pairs were completed using only their exposed labelled target controls for ordinary progression. After normal scroll to expose Picture B, a blank sky click `(160,500)` gave the same gentle miss and stayed at 0/3. Dino Park Magnifier hints were distinct: “right top” and “left area.” The long-neck head `(69,555)` was accepted (1/3) even though that point lies outside the ordinary left-middle 56px target box. A body tap `(114,650)` remained neutral at 1/3. Flower `(81.4,700.9)` advanced to 2/3; sun `(315.2,520.6)` completed the chapter and held the same fossil fact. After normal reload, the chapter map showed Bright-Eyed Beginners 4/4, Curious Comparers unlocked at 0/4, and Super Spotters still locked. |

Desktop Picture B was 580×435 px. The visible target buttons measured 56×56 px. At mobile, Picture B was 334×250.5 px and target buttons were also 56×56 px, fully within the image. The mobile lower scene required ordinary vertical scrolling. At the post-reload map, `clientWidth` and `scrollWidth` were both 390 px. The 390px browser viewport is not physical touchscreen evidence.

## Evidence files

- `screenshots/desktop-park-initial.png` — 1280×800 pair before search.
- `screenshots/desktop-dino-outline-detail.png` — enlarged, side-by-side A/B crop showing head and foot/water mask leaks.
- `screenshots/desktop-park-held-fact.png` — desktop completion fact and Next control.
- `screenshots/mobile-park-initial.png` — mobile pair before scroll.
- `screenshots/mobile-park-full-scene.png` — Picture B after ordinary scroll.
- `screenshots/mobile-dino-outline-detail.png` — enlarged Picture B dinosaur and foot/water boundary.
- `screenshots/mobile-park-held-fact.png` — mobile chapter completion and held fact.
- `screenshots/mobile-reload-progress.png` and `mobile-reload-map-snapshot.yml` — persisted chapter-map progress after reload.
- `screenshots/mobile-first-hint-snapshot.yml` and `mobile-second-hint-snapshot.yml` — exact mobile hint copy.

## Gate disposition

- **Artwork fidelity:** Fail pending cleanup of the head/sky and foot/water mask leaks. The sun-disc and flower-petal recolours appear localized in these renders.
- **Pointer interactions:** Pass for visible Dino Park long-neck head recognition, neutral repeat on the body after that difference was already found, flower and sun targets, one blank miss, held fact, and Next/completion at both sizes.
- **Hints and reload:** Mobile Dino Park showed two distinct hints; desktop hint controls were exercised on the subsequent Moon Camp pair. Reload preserved the full Starter completion and next chapter unlock state.
- **Audio and release:** No listening claim, provider call, production acceptance, or overall 4.5 score is made.
