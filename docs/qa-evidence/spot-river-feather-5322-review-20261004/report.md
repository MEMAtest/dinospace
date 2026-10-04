# River Valley feathered-mask revision: independent local review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5322`  
Source: `9ddfb4f738584002bf20d0bf67f758c48237812a`  
Frozen dist: `tmp/spot-river-feather/dist`  
Identity: `docs/qa-evidence/spot-river-feather-identity-20261004.json`  
Lineage: full-image candidate 5320 rejected for unintended scene differences; hard rectangular sky edge in 5321 recorded as a separate rejection.

## Verdict

**Do not accept 5322 yet.** The feathered mask removes the hard rectangular sky edge observed on 5321, and the flower and bridge edits look integrated at the tested sizes. However, a zoomed side-by-side still shows faint traces of the original sun rays near the top of Picture B above/around the crescent. That is an unintended remaining visual detail in a puzzle whose requested sky edit is sun-to-crescent. The three intended target objects and all interaction mechanics pass. Refine the sky replacement so the prior rays disappear while the patch blends into the original sky.

This is a local one-pair visual/interaction review. It is not a release or 4.5 acceptance.

## Identity, isolation, and network

Fresh Playwright sessions started at `about:blank`, sized 1280×800 and 390×844. Both installed `/api/voice` and `/api/story` route guards before first app navigation. Sound was muted through the visible UI. The Amari profile, Thinking & Play world, Spot tile, chapter start, and all progression were reached through normal UI. No profile data, seed, progress, answer, storage, or hidden guide state was injected or inspected. No provider call was made.

All 9 files in the 5322 identity record returned HTTP 200 with exact byte counts and SHA256 matches. Browser asset requests were same-origin static resources only. Desktop and mobile console logs each had zero errors, warnings, or other messages. A prior package-existence audit records `a44acc87` (the middle-area Spot hint) among missing audio clips; no audio playback or human listening was attempted here.

## Visual inspection

Both A and B report the same `dino-river-3d-DS1Pw89d.webp` base image. B draws the authored changes through soft SVG masks. The intended changes are visible: the upper-right sun is replaced by a crescent, the large lower-left flower has yellow petals, and the central bridge post is removed.

The prior sharp sky rectangle is no longer visible at 1280×800 or 390×844. In the enlarged A/B sky comparison, faint remnants of the original sun rays remain near the top of Picture B. This is most visible in `desktop-sky-region-side-by-side-detail.png`; the full-size scene screenshot shows the same region at normal scale. The next revision should include enough of the original ray field within the sky mask to remove those marks, while feathering the patch boundary into the original sky.

The lower-left flower remains a single yellow flower; its neighboring pink blossom, leaves, and river details show no obvious added island or clipping seam in the full view and enlarged comparison. The bridge has one central post removed; no obvious duplicate post or rectangular patch is visible. These observations are bounded to the rendered scene at the supplied viewports.

## Ordinary-UI interactions

| Viewport | Ordinary progression and River result |
|---|---|
| Desktop 1280×800 | Fresh profile began Starter. Moon Camp was pair 1; River Valley appeared as pair 2. A blank sky click at `(760,340)` gave the gentle miss copy and stayed at 0/3. Two unfinished hints were distinct: “left bottom” and “middle area.” Pointer taps on the yellow flower `(735,674)`, bridge gap `(866,484)`, and crescent `(1170,338)` advanced 1/3 → 2/3 → 3/3. The held River fact was “A clean river gives plants and animals a place to find fresh water.” Next picture was available. After reload, the map retained 2/4 Starter pairs. |
| Mobile 390×844 | Fresh profile began Starter. Moon Camp and Dino Park were pairs 1 and 2, Superhero City was pair 3, and River Valley was pair 4. A blank foliage tap at `(55,680)` gave the same gentle miss and stayed 0/3. Two hints were distinct: “middle area” and “left bottom.” Pointer taps on crescent `(319,681)`, bridge gap `(165,769)`, and yellow flower `(72,690)` after normal vertical scrolling advanced to 3/3. The chapter-completion screen held the River fact and offered Next chapter and Replay. After reload, the map retained 4/4 Starter pairs. |

Other pairs used the app’s exposed labeled target controls only to earn ordinary chapter progression. They are not counted as independent visual-search evidence. The three River Valley targets above were clicked on the pictured changed objects.

## Hit-target and viewport geometry

| Viewport | Picture B bounds | Three visible targets | Page bounds |
|---|---|---|---|
| Desktop 1280×800 | `(664,288)`, 580×435 px | Each 56×56 px: right top `(1140.59,320.89)`, left bottom `(711.39,634.09)`, middle `(873.80,473.14)` | Every target fully inside Picture B. Document width 1280 px (no horizontal overflow), height 831 px. |
| Mobile 390×844 | `(28,646.5)`, 334×250.5 px | Each 56×56 px: right top `(290.58,653.56)`, middle `(136.94,741.23)`, left bottom `(43.41,833.92)` | Every target fully inside Picture B. Document width 390 px (no horizontal overflow), height 1005 px. The lower flower target sits at the bottom edge of the initial viewport and is reached by normal scroll. |

This browser viewport run is not physical touchscreen evidence.

## Gate disposition

- **Artwork fidelity:** Not accepted. Hard edge fixed, but residual sun rays remain in the edited sky region. Flower and bridge showed no other obvious unintended shape at these viewports.
- **Interaction:** Pass for this one pair on both viewports: three actual pointer targets, gentle miss, distinct hints, held fact/Next, and ordinary reload retention.
- **Target usability:** Pass for measured controls: 56×56 px, fully contained, no horizontal overflow. Mobile requires vertical scroll to reach lower Picture B details.
- **Audio/release:** No audio quality claim. The known missing hint clip remains a separate gate. No release or overall quality score is awarded.

## Evidence index

- `screenshots/desktop-river-initial.png` — initial 1280×800 pair.
- `screenshots/desktop-sky-region-side-by-side-detail.png` — enlarged sky crop showing residual ray traces.
- `screenshots/desktop-river-held-fact.png` — completed River pair with fact and Next picture.
- `screenshots/mobile-river-initial.png` — initial 390×844 pair.
- `screenshots/mobile-river-two-found-scrolled.png` — two found targets and ordinary scroll to lower target.
- `screenshots/mobile-river-complete.png` — held fact on Starter completion.
- `screenshots/desktop-first-hint-snapshot.yml`, `desktop-second-hint-snapshot.yml`, `mobile-first-hint-snapshot.yml`, and `mobile-second-hint-snapshot.yml` — exact distinct Magnifier messages.
- `screenshots/desktop-reload-map-snapshot.yml` and `mobile-reload-map-snapshot.yml` — normal reload progress retention.

