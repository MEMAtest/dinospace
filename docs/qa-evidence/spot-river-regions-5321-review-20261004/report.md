# River Valley bounded-region revision: independent local review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5321`  
Source: `bff12e2025a3d45b123a23a7f838d36500772a0e`  
Frozen dist: `tmp/spot-river-regions-bff12e2/dist`  
Identity: `docs/qa-evidence/spot-river-regions-identity-20261004.json`  
Prior rejected candidate: `docs/qa-evidence/spot-river-pair-5320-review-20261004/report.md`

## Verdict

**Reject this revision on visual fidelity.** The composition outside the three bounded edits now uses the original A raster, which removes the broad dinosaur/background re-render seen in 5320. However, the upper-right sky replacement has a plainly visible hard rectangular boundary in Picture B at both tested sizes. The seam is most evident as a vertical color/gradient edge at the left edge of the sky patch (about 75% of image width). That reads as a pasted rectangle rather than an edited sky. The flower and bridge edits did not show a similarly obvious rectangular edge in the rendered screenshots, but this finite review does not waive close-inspection of those regions on a later candidate.

The three objects and interaction mechanics work. That does not close the visual gate. This local experiment is not a release or 4.5 acceptance.

## Identity, isolation, and network

Fresh Playwright sessions started at `about:blank` at 1280×800 and 390×844. Each installed the voice/story API route guards before its first app navigation. The visible sound control was used to mute. Amari, Thinking & Play, and Spot the Difference were selected through ordinary UI. River Valley was reached after ordinary Starter progression: pair 2 on desktop and pair 1 on mobile. Other unlock pairs used the game’s exposed labeled target controls and are not counted as visual-discovery evidence.

All 9 files in the 5321 identity record returned HTTP 200 and matched their SHA256 and byte counts. In both browser sessions, Picture A and Picture B identify the same `dino-river-3d-DS1Pw89d.webp` raster as their source image; the visible B differences are rendered on top. No voice/story request was observed, both console logs had zero messages/errors/warnings, and sampled static resources returned HTTP 200. The identity record notes narration clip `a44acc87` remains missing. No provider call or human-audio test was made.

## Visual result

The desktop and mobile initial screenshots show all three intended visual changes:

1. Sun to crescent moon in the upper-right sky.
2. Pink petals to yellow on the large lower-left flower.
3. A central upright bridge post removed.

In both screenshots, the sky patch’s left edge creates a straight vertical transition through open blue sky. It is visible at the initial 1280×800 and 390×844 scales, not only under magnification. The A image does not contain this boundary. This is a concrete visual failure and the next revision must blend the clip boundary into the unchanged A raster without leaving a rectangle, duplicated shape, or leftover sun rays. The composition, dinosaur, sky, river, and other scene objects otherwise appear materially more stable than in 5320.

The lower-left flower’s surrounding leaves and the bridge gap looked reasonably integrated at the displayed scale in this review. That is a limited visual observation; the next revision still needs targeted seam inspection inside and around both edit masks.

## Pointer interaction and progress

| Viewport | Ordinary progression and interaction |
|---|---|
| Desktop 1280×800 | Fresh profile selected Amari and Thinking & Play. Starter showed River Valley as pair 2 after completing Superhero City. A blank sky click gave “Not that spot yet. Compare the same area in Picture A.” and stayed 0/3. Two unfinished Magnifier hints returned distinct clues, “left bottom” and “middle area.” Pointer clicks on yellow flower, missing bridge post, and crescent advanced to 1/3, 2/3, and 3/3. Completion held the clean-river fact and showed Next picture. On reload, the map retained Bright-Eyed Beginners at 2/4 pairs. |
| Mobile 390×844 | Fresh profile reached River Valley as pair 1. A blank foliage tap gave the same miss feedback and stayed 0/3. Two hints were distinct: “right top” and “middle area.” Pointer taps on crescent, missing bridge post, and lower flower advanced to 3/3. The completed pair held the clean-river fact and offered Next picture. Reload returned to the chapter map with 1/4 pairs retained. |

The actual River Valley target taps were pointer clicks on the visible changed objects. At mobile, the lower target required ordinary vertical scrolling because Picture B extends past the initial viewport. The 390 px browser viewport is not physical touchscreen evidence.

## Target geometry and viewport bounds

| Viewport | Picture B | Three targets | Bounds |
|---|---|---|---|
| 1280×800 | `(664,288)`, 580×435 px | Each 56×56 px: right top `(1140.59,320.89)`, left bottom `(711.39,634.09)`, middle `(873.80,473.14)` | All targets are inside Picture B. Document width 1280 px; no horizontal overflow; document height 831 px. |
| 390×844 | `(28,670.5)`, 334×250.5 px | Each 56×56 px: right top `(290.58,677.56)`, middle `(136.94,765.23)`, left bottom `(43.41,857.92)` | All targets are inside Picture B. Document width 390 px; no horizontal overflow; document height 1029 px. Picture B’s lower area requires page scroll. |

## Gate disposition

- **Artwork:** Fail on visible hard sky-region seam. Do not accept or expand this style to the remaining scenes until a new immutable candidate passes the same seam inspection.
- **Interaction:** Pass for this one River pair at desktop and mobile viewport: all 3 target areas, gentle miss, two distinct hints, held fact, Next, and reload retention were observed.
- **Target usability:** Pass for measured bounds: all targets are 56×56 px and fully contained in the edited Picture B area; no horizontal overflow. Mobile requires vertical scrolling for the lower part.
- **Audio/release:** Missing narration clip and human listening remain open. No release or 4.5 score is awarded.

## Evidence index

- `screenshots/page-2026-10-04T05-49-23-884Z.png` — desktop initial A/B, showing the sky seam.
- `screenshots/page-2026-10-04T05-51-21-856Z.png` — desktop pair completion and held fact.
- `screenshots/page-2026-10-04T05-52-31-346Z.png` — mobile initial A/B, showing the same seam.
- `screenshots/page-2026-10-04T05-54-26-667Z.png` — mobile scrolled scene after two target hits.
- `screenshots/page-2026-10-04T05-54-46-082Z.png` — mobile held fact after pair completion.
- `screenshots/mobile-reload-map-snapshot.yml` — visible map after mobile reload retaining 1/4 progress.

