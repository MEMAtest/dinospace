# Starter City, Dino Park, and Moon Camp art region review

Date: 2026-10-04  
Review type: offline visual preparation only  
Provenance: [`spot-starter-three-art-provenance-20261004.json`](spot-starter-three-art-provenance-20261004.json)

## Scope and conclusion

I visually compared each prepared original with its generated B candidate at the native 1448 × 1086 canvas. Each candidate contains the three intended differences in the provenance record. Each also contains visible unrelated redraws and geometry drift across the scene. Do not use a generated B raster as the full second half of a pair. If these are used, preserve the original as the base and composite only the bounded object edits below, then compare the rendered pair at its actual 4:3 crop and verify exactly three differences.

The boxes below are approximate native-canvas pixel bounds, intended as conservative starting regions for a tight object mask—not rectangular paint instructions. Use the object silhouette with a small antialiasing margin; exclude neighboring objects, shadows, facial features, rims, frames, and background. Coordinates are `(left, top)–(right, bottom)` from the upper-left.

## Starter City: superhero-city.webp → superhero-city-pair-b-v1.png

1. **Standing hero suit: purple to green.** Candidate mask bounds about `(389, 576)–(660, 864)` (27–46% canvas width, 53–80% height). Recolor only the purple shirt and trousers, following their silhouette. Preserve the yellow belt, gloves, boots, lightning emblem, skin, hair, and purple cape. The cape folds meet the shoulder and waist; a loose rectangular mask risks recoloring cape or background. The candidate also changes suit shading and body/face details, so do not transplant the entire hero crop.
2. **Flying hero cape: red to gold.** Bounds about `(948, 151)–(1087, 275)` (65–75% width, 14–25% height). Mask the cape fabric only. Keep the red suit, gloves, face, and blue sky untouched. Its thin outer tip is close to open sky and should be checked for a clean silhouette edge.
3. **Tower cupola: red to blue.** Bounds about `(257, 194)–(414, 276)` (18–29% width, 18–25% height). Restrict the change to the curved dome panels; retain the gold trim, tower masonry, roof edge, and star/finial. The generated dome panel geometry/highlights do not align exactly with the source, making a full dome crop likely to create a doubled edge.

**Observed incidental changes:** the standing hero’s hair, face, pose details and suit shading drift; the flying hero and nearby clouds/buildings have small redraws; window and facade details, trees, rooftops, and vehicle/road details also vary. The star, dome trim, and tower outline are not pixel-stable. Aligning by canvas dimensions alone will not make a whole-image overlay safe.

## Dino Park: dino-park.jpg → dino-park-pair-b-v1.png

1. **Left sauropod body: blue to purple.** Bounds about `(88, 261)–(770, 904)` (6–53% width, 24–83% height). Apply a color-only change to the visible dinosaur silhouette. Exclude its pale underside, eye, mouth/interior, claws, water/ground occlusion, and cast shadows. The neck and tail cross busy sky/foliage/water backgrounds; use a silhouette mask with careful antialiasing rather than a broad box.
2. **Palm canopy: green to gold.** Bounds about `(536, 579)–(791, 708)` (37–55% width, 53–65% height). Change the leaf blades only; keep the trunk, background volcano/sky, and nearby dinosaur/tail edges fixed. Gold tips extend into sky and green foliage in different directions in the candidate, so its generated leaf silhouette should not be copied wholesale.
3. **Lower-left flower petals: pink to white.** Bounds about `(176, 921)–(268, 1022)` (12–19% width, 85–94% height). Change petals only. Preserve the yellow center, leaves, stem, and surrounding rocks/ground. The bottom-left foliage and flower position/details are redrawn, so anchor the center and original silhouette before making the color edit.

**Observed incidental changes:** the sauropod’s head, eye, neck contour, spots, leg details, and tail shift; the palm leaf shape and trunk highlights differ; the volcano plume/lava, sun rays, distant trees, water/shoreline, foreground rocks, path and lower foliage also vary. Several scene edges move by enough that a whole generated image would produce extra findable differences.

## Moon Camp: dino-moon-3d.webp → moon-camp-pair-b-v1.png

1. **Rocket porthole glass: blue/purple to green.** Bounds about `(144, 132)–(303, 306)` (10–21% width, 12–28% height). Restrict the edit to the inner glass, retaining the gold/metal ring, highlights, rocket body, and reflected edge. The glass is circular but highlights touch its boundary; use a circular/elliptical mask matched to the original opening, not the outer ring.
2. **Rover solar-panel surface: blue to orange.** Bounds about `(784, 764)–(939, 826)` (54–65% width, 70–76% height). Change the panel cells/surface only; preserve the panel border, support, rover camera, wheels, and ground. The generated panel changes its grid/orientation slightly; the original panel quadrilateral and grid are the alignment reference.
3. **Dish reflector tilt.** Bounds about `(1293, 277)–(1437, 401)` (89–99% width, 26–37% height). Rotate/reorient only the dish reflector while keeping the same support/mount and attachment point. Do not move the mast, ball/feed, or dome edge. The generated reflector and feed geometry shift; a tight mask around the dish must preserve the original mount silhouette and leave clear sky between the dish and frame edge.

**Observed incidental changes:** Moon surface rocks and shadows are redrawn across the foreground; astronaut suit/hand/boot details and pose edges drift; the rover, solar grid, habitat windows, Earth/cloud/lighting details, rocket highlights, and satellite dish construction change. The rocket, dino, and habitat retain the overall composition but are not pixel-aligned at object-detail scale. A/B seam checks should include the astronaut, rover, habitat, and cratered foreground because those areas contain visible non-target variation.

## Integration review checks (not performed here)

- Preserve exact original pixels outside the three masks per pair. Compare A/B with a difference map after any compositing and confirm no fourth changed island appears.
- Inspect at the game's actual image crop and display size; these prepared files are 4:3, while a different `object-fit` or crop can move hotspot centers and clip the edge-near dish.
- Keep each answer hotspot centered on the changed object, with a child-sized touch target that does not overlap another answer target. Confirm hint locations correspond to the final composite.
- This review did not integrate assets, open gameplay, test visual acceptance, evaluate narration/audio, or make any release/4.5 claim.
