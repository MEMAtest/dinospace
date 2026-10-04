# Spot the Difference scene-prop redesign plan

Date: 4 October 2026  
Status: design plan only; no runtime or data changes made.

## Goal

Replace the unrelated emoji/SVG badges drawn over Spot the Difference’s backgrounds with actual scene-embedded object changes in all twelve picture pairs. Keep the established 3/5/7 objectives, authored facts, chapter progression, hints, 56px hit targets, replay variation, child-scoped saves, diagnostics, and packaged narration behavior.

## Evidence and current implementation

`src/components/games/SpotDifference.jsx` draws the exact same `scene.image` for Pictures A and B, then puts every `normalVisual` and `visual` in a 40×40 CSS-pixel layer at normalized `x/y`. Most variants use an emoji in `DifferenceVisual`; `prop:` variants are custom SVG symbols without a scene-material/shadow context. A separate 56×56 button at each coordinate is the actual answer target. Thus the backgrounds match, the different details float above them, and the interaction mechanics are independent of the art.

`src/data/spotDifferenceBatch2.js` has twelve existing scene assets and names, but `CHANGE_TEMPLATES` and `CHANGE_POSITIONS` recycle the same seven badge swaps and generic grid across Starter and Growing. Challenge has seven bespoke prop labels/variants per scene, but still renders those props as little detached SVG icons at those generic coordinates. The source includes useful scene art: Superhero City; Dino Park, River Valley and Moon Camp; Treehouse Team, Sound Safari, Pattern Parade and Time Observatory; Robin’s Woodland, World Explorer, History Hall and Nature Lab. Challenge already has scene-linked content that can guide the replacement.

The independent reviewer reported that the River Valley Starter and Sound Safari Growing scenes have unchanged backgrounds with badge swaps (cloud→moon, lightning→star, flower→sun; and five similar symbol swaps). In the Robin’s Woodland Challenge, the existing seven tap regions function at 56×56 and hints can point to different regions, but the artwork is still presented as floating badge changes rather than altered woodland objects. This is an art/editorial gap; it does not invalidate the recorded mechanics evidence.

The premium direction available in this checkout is the game’s own bright, polished, dimensional 3D scene art, including the dedicated Sound Safari art reviewed in `docs/qa-evidence/spot-safari-art-static-review-20261003.md`. I did not find the separate premium reference/mock images described in earlier editorial notes in this checkout; restore those references before final art sign-off if they remain authoritative.

## Recommended design and data change

Create twelve authored A/B scene-art pairs (24 4:3 output images), using the current scene image as the unchanged base. Bake object variants into the scene at the correct surface, scale, lighting, perspective and occlusion. Within each pair, preserve the same crop, characters, background and composition; only the declared three, five, or seven props may differ. Keep the source backgrounds intact. Avoid icon backplates, badge circles, detached floating glyphs, or gratuitous scene differences. Produce distinct variants that are visible on a 390px screen without adding text labels that give away answers.

Store the paired assets with predictable paths, for example `src/assets/spot-difference/pairs/<scene-id>-a.webp` and `...-b.webp`. Add `imageA` and `imageB` to each scene record. Each authored difference should carry a stable ID, child-safe internal label, target center and hit radius, a reserved hint-zone (left/middle/right × top/middle/bottom), and a tightly bounded normalized region describing where that one detail changes. Use the paired assets for the visual truth; do not render another answer glyph over them. Keep a transparent 56×56-or-larger control over each changed region and keep blank-area wrong-tap handling on Picture B. After a successful find, show the existing green confirmation ring, not a second prop illustration.

Keep the twelve scene IDs, chapter IDs/names, title, alt/fact text, queue/replay behavior, event game ID and round numbering. Keep `DifferenceVisual` out of the scene display once all pairs have paired art. Keep the clue audio strings stable by retaining the currently authored positional hint zone for each target. If a target must move to a different spoken zone, update and audit the finite Spot narration corpus and packaged clip manifest as a separately tracked migration; never leave a new phrase key silently missing. `spotDifferenceNarration` should continue to receive the same scene titles/facts and current start, prompt, hint, next and completion entry points. The report does not authorize generating or packaging audio.

Suggested source boundaries:

- `src/data/spotDifferenceBatch2.js`: explicit per-scene asset pair and authored target manifest; stop rotating generic `CHANGE_TEMPLATES` across scene contexts.
- `src/components/games/SpotDifference.jsx`: render `imageA` and `imageB`, preserve the invisible large-picture miss catcher and exact answer targets, and remove normal/changed decorative badge layers. Keep success rings/hint pulse as interaction feedback only.
- `test/spotDifferenceBatch2.test.mjs`: validate full coverage, exact counts, stable IDs, known hint zones, bounded regions, and non-overlapping targets.
- Preserve `src/data/batch2Narration.js` copy and all existing progress/event semantics.

## Scene-by-scene art brief

These are authored change candidates and placement anchors, not already implemented or approved artwork. Place each change directly on the indicated item/region in the listed existing scene art. During art production, confirm its current object and crop in the actual 4:3 game frame. The Starter scenes each receive exactly 3, Growing exactly 5 and Challenge exactly 7 changes.

| Pair / current art | Starter — 3 changes | Growing — 5 changes | Challenge — 7 changes |
| --- | --- | --- | --- |
| Superhero City — `src/assets/spot-difference/superhero-city.webp` | Use the standing purple hero’s chest emblem (lightning/star); a checker/pennant detail on the rooftop tower; cruiser roof beacon count (one/two). | — | — |
| Dino Park — `src/assets/puzzle-pop/dino-park.jpg` | Volcano smoke puff count; the palm beside the path’s fruit/leaf count; one foreground dinosaur footprint pair’s spacing/count. | — | — |
| River Valley — `src/assets/puzzle-pop/dino-river-3d.webp` | Bridge rail/post count; a distinct bank boulder count/shape; the lower-left flower’s petal count. | — | — |
| Moon Camp — `src/assets/puzzle-pop/dino-moon-3d.webp` | Rover wheel/tread detail; rocket porthole count; habitat entrance lamp color/state. Anchor these to the rover, rocket and right-side habitat, not the sky as separate icons. | — | — |
| Treehouse Team — `src/assets/puzzle-pop/treehouse-robots-3d.webp` | — | Arrow-block direction in the floor foreground; toy-shelf rocket window/fin count; visible robot antenna-tip shape; potted seedling leaf count; hanging lantern flame count. | — |
| Sound Safari — `src/assets/spot-difference/sound-safari-animals-3d.webp` | — | Animal-integrated details: elephant ear fold/spot count; monkey call-hand pose; bird wing-feather count; frog spot count; lily-pad/flower count. Place on the animals or water plants shown in the existing 3D composition. Avoid floating sound-wave pictograms. | — |
| Pattern Parade — `src/assets/game-scenes/pattern-parade.webp` | — | Pennant order on the upper bunting; a tower banner shape; balloon cluster count; star motif on the arch; colored floor tile shape/count. | — |
| Time Observatory — `src/assets/game-scenes/time-observatory.webp` | — | Telescope angle at the right window; orbit/ring direction around the visible planet; visible book-spine count on a shelf; constellation star count in the central night sky; globe axis/stand detail near the telescope. Preserve the vertical source’s present game-frame crop when authoring. | — |
| Robin’s Woodland — `src/assets/puzzle-pop/robin-tree-3d.webp` | — | — | Sun ray count; canopy leaf direction; blossom petal count; small leaf silhouette; visible worm bend; ladybird spot count; leaf vein count. These align with the existing scene-specific Challenge intent, but must be composited onto the sun, branch, flowers, soil worm, ladybird and leaf rather than shown as separate icon art. |
| World Explorer — `src/assets/puzzle-pop/world-explorer-map-3d.webp` | — | — | Compass needle direction; river bend on map; map tree count; mountain peak count; destination marker shape; binocular angle; route bend count. Draw on the actual tabletop map/compass/binoculars with the map perspective, not as upright floating symbols. |
| History Hall — `src/assets/curriculum/history-world.webp` | — | — | Book state on the left stack; arch count in the distant ruins; foreground compass needle direction; paving stone silhouette; lantern flame count; scroll state; column groove count. Anchor changes to the visible book, arch, compass, stones, right lantern, scroll and ruin column. |
| Nature Lab — `src/assets/puzzle-pop/nature-lab-leaves-3d.webp` | — | — | Notebook leaf silhouette; leaf vein count; seedling leaf count; flower petal count; drops at watering can spout; potted plant leaf count; notebook leaf orientation. Integrate into the pictured worksheet samples, pots and watering can; avoid extra detached leaves. |

The object lists are intentionally scene-specific. Before freezing the art, reject any proposed feature that is hidden by the current crop, not clearly visible at small size, or confusable with a neighboring feature. Each background should have no unlisted B-vs-A differences; this game teaches careful comparison and must not introduce accidental answer targets.

## Finite acceptance matrix

### Automated/source gate

1. Validate exactly 12 unique scene records: 4 each in bands 0, 1 and 2, with 3/5/7 authored targets respectively, stable scene and difference IDs, correct local A/B asset paths, unchanged facts/titles, and a non-empty internal target label.
2. Validate every A/B record has the same intrinsic dimensions/aspect; every target region is in the 4:3 frame; every touch target is at least 56×56 CSS px; no target rectangles overlap at the minimum rendered frame size. Check geometry after object-fit crop, not only before it.
3. For each pair, validate that its hint target order contains no duplicates and every target retains a supported narration zone. Check generated Spot voice-key inventory against the packaged manifest without invoking a provider.
4. Add a paired-art review inventory listing A/B image paths, changed object IDs, target percentages and expected visible difference. Run focused Spot tests, full tests, lint, production-config build, and `git diff --check` on the eventual source candidate.

### Browser/visual gate

Use one frozen candidate and fresh isolated profiles with `/api/voice` and `/api/story` guards installed and checked before app navigation. Use normal UI progress only. At desktop 1280×800 and mobile 390×844, inspect all twelve scene pairs: 24 pair/viewport views. For every target, visually confirm the one named object change is discoverable in B and the corresponding original is visible at the same location in A; there are no stray/background changes, badge overlays, broken images, or crop changes. On mobile confirm the target is independently tappable after vertical scroll and remains at least 56×56, all centers remain in frame, and no horizontal overflow. Record a side-by-side screenshot per scene per viewport.

Then execute complete chapter flows in both viewports, one ordinary run per band: 4 Starter pairs ×3, 4 Growing ×5, and 4 Challenge ×7. For a representative pair in each band, also attempt one blank area (gentle retry, unchanged count), request the two magnifier hints sequentially (distinct unfinished target regions and correct displayed hint count), tap each target using its visible scene location, repeat a found target (neutral/no duplicate credit), and verify found count, a single held scene fact, Next reset, final chapter completion and replay. Confirm all twelve scene IDs get `scene_complete` once and the chapter reward/unlock only after its four pairs.

Repeat Starter once at each viewport and verify its replay order can vary while remaining a four-scene permutation. Reload after completed pairs/chapter and verify earned child-scoped progress and unlocked chapter remain; check sibling profile remains isolated through normal profile UI. Use the grown-up diagnostics export control when available and confirm only bounded level/round/seed/outcome/hint/wrong-tap fields are present, without child names, scene facts, picture text, or answer labels. Verify no voice/story requests slipped through guards; check every art request, console, page width and interactive-control bounds.

This proposed matrix is deliberately broader than an asset smoke check. Passing source tests or one visually strong pair is not enough to claim the twelve-pair art change is complete.
