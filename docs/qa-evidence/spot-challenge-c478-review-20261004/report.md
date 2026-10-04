# Spot the Difference: canonical Challenge and scene-content review

Date: 2026-10-04  
Canonical URL: https://dinospace-eight.vercel.app  
Deployment: `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`  
Source archive: `c47864404cff1f31c9cefe9b8a363d0ba5542b24`  
Identity baseline: `docs/qa-evidence/sound-preference-canonical-identity-20261004.json`

## Scope and method

This is a fresh ordinary-UI Spot the Difference run on the current canonical deployment, separate from the retained 3cdf broad production baseline and the earlier 295 replay-repair candidate evidence. It covers all 12 authored scenes in Starter, Growing, and Challenge at 1280×800 and 390×844, then checks the four Challenge scenes again for target bounds, hints, misses, held rewards, progression, replay, and reload behavior. This is a bounded rendered-content review; the full historical matrix remains the broad progression baseline.

Fresh desktop and mobile browser profiles began at `about:blank`. Voice and story API guards were installed before the first app navigation. Sound was muted through the visible preference control. No child data, progress, seed, answer, storage, or hidden guide state was injected or read. All scene progression and targets were reached through normal controls. Static asset identity was independently checked against the seven-file c478 identity record; every fetched runtime/index SHA256 matched. Both sessions ended with zero console errors, warnings, or messages; no voice/story API resource request was observed.

## Rendered scene content

The image comparison has one shared raster `scene.image` in both views. Differences are rendered on top as `DifferenceVisual` overlays. Challenge uses authored SVG prop variants; Starter and Growing use generic emoji templates. Thus the Challenge findings below concern the complete rendered composite and authored overlays, not a claim that the underlying raster background or its birds/plants/buildings differ.

| Band / scene | Rendered content assessment |
|---|---|
| Starter — River Valley | Generic cloud/moon, lightning/star, and flower/sun substitutions sit over a river scene. Some weather/flower symbols are broadly nature-related, but they read as interchangeable stickers rather than changes to depicted river props. |
| Starter — Superhero City | Generic symbol substitutions sit over a city scene; the tested differences do not read as specific changes to city objects. |
| Starter — Moon Camp | Generic emoji substitutions are space-adjacent but remain floating symbols rather than altered camp equipment or landscape details. |
| Starter — Dino Park | Generic symbols sit over a dinosaur-park scene rather than changing visible park or dinosaur props. |
| Growing — Sound Safari | Generic flower/sun, cloud/moon, moon/sun, ninja/masks, and lightning/star pairs are overlaid on a waterfall/wildlife setting. In particular the ninja/masks pair has no clear sound or wildlife relationship. |
| Growing — Pattern Parade | The visual changes use generic badge-like substitutions rather than changes to objects in the depicted scene. |
| Growing — Time Observatory | Generic symbols overlay an observatory setting; they are not integrated changes to the telescope or other scene objects. |
| Growing — Treehouse Team | Generic symbols overlay the treehouse setting rather than changing identifiable treehouse details. |
| Challenge — Robin’s Woodland | Authored garden/woodland prop symbols (plant, flower, sun, leaf/heart and insect-like details) fit the scene broadly. These remain stylized symbols, but this review does not support a blanket relevance failure. |
| Challenge — World Explorer | Authored compass, map, marker, route, globe, and explorer-tool variants fit the map-workbench context. |
| Challenge — Nature Lab | Leaf, pot, watering, light, and growth-tool variants fit the plant-care/botany context. |
| Challenge — History Hall | Book, lock, column/arch, and compass-like details fit the historic-site context. |

The four Challenge pairs are defensible as authored thematic prop differences. The finite editorial concern is concentrated in the 8 Starter/Growing scenes: replace interchangeable floating emoji pairs with distinct, authored, scene-specific variants integrated into the depicted props. Keep each difference visible in both views, age-appropriate, and aligned with its interactive target. Review all 8 revised pairs at both widths before calling this concern closed. Do not describe this finding as a raster-art change.

## Interaction and layout evidence

| Check | Result |
|---|---|
| Ordinary progression, desktop | Completed 4/4 Starter (River Valley, Superhero City, Moon Camp, Dino Park), 4/4 Growing (Sound Safari, Pattern Parade, Time Observatory, Treehouse Team), and 4/4 Challenge (Robin’s Woodland, World Explorer, Nature Lab, History Hall). |
| Ordinary progression, mobile | Completed 4/4 Starter (Superhero City, River Valley, Moon Camp, Dino Park), 4/4 Growing (Pattern Parade, Time Observatory, Treehouse Team, Sound Safari), and 4/4 Challenge (World Explorer, Nature Lab, Robin’s Woodland, History Hall). |
| Replay | Completed all four Challenge pairs in another ordinary Replay at each viewport. The next run began on a different scene from the prior run. No immediate replay defect reproduced. |
| Challenge targets | Each Challenge scene exposed 7 visible target controls, each 56×56 CSS px and fully contained in Picture B; no target rectangles overlapped. Verified for all four scenes at both viewports. |
| Desktop page bounds | 1280 px document width; no horizontal overflow. Document height 831 px at 800 px viewport, requiring 31 px vertical scroll. |
| Mobile page bounds | 390 px document width; no horizontal overflow. Document height 1005–1029 px at 844 px viewport. The pictures stack vertically; their lower regions and some targets require scrolling, so both full pictures cannot be compared simultaneously. All seven targets remain reachable by ordinary vertical scroll. |
| Miss feedback | A blank tap/click in Picture B on desktop Starter River Valley and mobile Starter Superhero City produced “Not that spot yet. Compare the same area in Picture A.” Progress stayed at 0/3. |
| Hints | On desktop Robin’s Woodland, two consecutive unfinished Magnifier uses gave distinct clues (“left bottom” then “middle top”) and reduced the count 2→1→0. On mobile World Explorer, two consecutive uses gave “left top” then “right bottom”, also 2→1→0. |
| Target/reward/Next | Visible target controls were clicked in each Challenge scene; each scene reached 7/7, its matching fact/reward was held, and Next advanced to the following picture. Challenge completion retained its final fact and exposed Replay. |
| Parent navigation/reload | Back to the learning world returned to Thinking & Play. After reload, the Spot tile retained its Played count and its map showed 4/4 for all three chapters. Mobile also exercised the mid-run leave confirmation; Keep playing and Back to world were available, and Back to world returned to the parent. |

The target controls are usable and correctly sized in this sample. Completing target controls proves hit behavior and completion flow, not independent unaided visual-discovery accuracy: target selection was through the visible labeled target controls rather than unscripted visual search. The mobile comparison requires vertical memory/scrolling between pictures; that is a layout trade-off worth addressing if simultaneous comparison is a product requirement, but no horizontal clipping or unreachable target was found.

## Evidence files

Screenshots are in `screenshots/`:

- `spot-c478-desktop-challenge-pair-1.png` through `-4.png`: desktop World Explorer, Robin’s Woodland, History Hall, Nature Lab during replay.
- `spot-c478-mobile-fullpage-challenge-1.png` through `-4.png`: mobile Robin’s Woodland, History Hall, Nature Lab, World Explorer.
- `spot-c478-challenge-desktop-held.png`: desktop held Challenge reward.
- `page-2026-10-04T05-01-57-059Z.png` and `page-2026-10-04T05-09-56-666Z.png`: desktop and mobile gentle miss feedback.
- `page-2026-10-04T05-13-32-209Z.png`: mobile Challenge completion.
- `page-2026-10-04T05-14-10-157Z.png`: mobile chapter map after reload with progress retained.

The Challenge replay orders shown in screenshots correspond to World Explorer → Robin’s Woodland → History Hall → Nature Lab on desktop and Robin’s Woodland → History Hall → Nature Lab → World Explorer on the first mobile replay. They are distinct ordinary UI runs.

## Provisional gate disposition

| Dimension | Provisional finding |
|---|---|
| Functionality | Strong bounded pass: ordinary 12-scene progression at both widths, Challenge 7-target interactions, misses, distinct hints, held facts/Next, replay, parent return, and reload persistence were observed. Unaided discovery was not measured. |
| Visual design | Challenge authored overlays are coherent and 56 px targets are contained/non-overlapping. Mobile stacks the comparisons and needs vertical scrolling. Starter/Growing generic floating emoji differences remain an editorial integration defect. |
| Content/editorial | Challenge themes are defensible. Starter/Growing require scene-integrated differences; Sound Safari’s ninja/masks pair is the clearest unrelated substitution. |
| Reliability | Fresh canonical runtime matched all seven identity hashes; no console issue or provider request was observed in these sessions. This is not a broad production reliability claim. |
| Audio | Not scored. Sound was muted and no human listening test was performed; packaged audio quality/readiness is not established here. |

Overall 4.5 acceptance remains open. The generic Starter/Growing art treatment and mandatory audio/listening gate are unresolved; this report does not award a 4.5 score.

