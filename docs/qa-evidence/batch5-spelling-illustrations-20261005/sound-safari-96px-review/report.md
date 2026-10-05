# Sound Safari asset reuse review for Spelling Studio

Date: 2026-10-05  
Spelling source checkout: `e6f6fa0ab5b9238f38abaea58f1a5fbeedcc1afe`  
Spelling source file SHA-256: `8440dd01d079549d4f03152f1f6ba7231562811979959c9d3731811e9310e057`

## Scope and decision

This is a static review of the 35 exact-word Sound Safari images already referenced by `SOUND_SAFARI_PICTURE_ART`, at the Spelling Studio's 96×96 image size. Each image was compared to its existing Spelling Studio clue. I used both a labeled reviewer sheet and an image-only sheet so the word/clue captions could support matching without being the only thing making an image recognizable.

- **31 accept** as exact-subject reuse candidates for their current clue.
- **1 conditional accept:** `can` is a recognizable metal food can, but should ship only beside a visually distinct `tin` image.
- **3 revise:** `map`, `pot`, and `seed` do not currently meet the Spelling clue/style bar.

“Accept” here means the exact image is semantically suitable at 96px for the named spelling target; it is not permission to change the Sound Safari mapping. The 35 candidates are only a subset of the full 101-word bank. The other 66 words remain in the artwork gap, and the prior complete audit continues to cover their current emoji/clue issues. No word, phoneme, clue, pool, or runtime was removed or changed.

## Reviewer sheets and exact source inventory

- [Image-only 96px contact sheet](contact-sheet-image-only-96px.png), SHA-256 `e113669eeeb55745c1041f0340651923735a6e64e6e24cf5d8c748e312eccd9c`.
- [Labeled 96px contact sheet](contact-sheet-35-96px.png), SHA-256 `a82b6890ba66385bc32d5a71a302441029adaeb0b097bf0715e9b5ce197e4639`.
- [Per-word decisions with source paths, sizes, and SHA-256 values](asset-decisions.json), SHA-256 `aecfd6a44a3f249b4b40edb450e65f2ba3211dfa126f70d06ebb8def8bcbc374`.

The map source is SVG, so its contact-sheet cell uses a 96px Quick Look raster for static comparison; the inventory retains and hashes the original SVG file. The sheet rendering does not change or replace any source artwork.

## Per-word review

| Word | Decision | Reason at 96px |
|---|---|---|
| pin | Accept | Red-headed pushpin and metal point are recognizable; fits the paper-holding clue. |
| map | Revise | The world-map content is recognizable, but it is a flat vector among dimensional art and does not show a route/destination. Use a folded route map, with no text. |
| tap | Accept | Faucet shape is immediately clear and matches the water clue. |
| dog | Accept | Friendly dog silhouette matches the pet/barking clue. |
| log | Accept | Cut tree log reads clearly as a thick piece of a tree. |
| cat | Accept | Cat is immediately recognizable and fits the clue. |
| hen | Accept | Chicken/hen silhouette is clear; clue supplies egg-laying context. |
| mat | Accept | Flat textured floor mat matches the clue. |
| pan | Accept | Frying pan and handle are distinct. |
| pot | Revise | Current red handled cookware depicts a cooking pot, not the plant container in the clue. Replace with a flowerpot. |
| mop | Accept | Mop head and handle are legible at the target size. |
| cot | Accept | Rail-sided baby cot is a recognizable small bed. |
| cap | Accept | Baseball-cap silhouette is clear. |
| can | Conditional accept | Red metal food can fits “a metal container,” but must be visually contrasted with `tin` so the pair does not collapse. |
| duck | Accept | Duckling reads as a swimming bird and differs clearly from dock. |
| dock | Accept | The reviewed v2 quay, water, and tied boat communicate a boat stop rather than an anchor. |
| rock | Accept | Single rough stone reads immediately as rock. |
| sock | Accept | Single colourful sock is recognizable. |
| lock | Accept | Padlock shape fits keeping a door shut. |
| bell | Accept | Brass bell is clear and fits making a sound. |
| hill | Accept | Green raised landform reads as a small hill. |
| fish | Accept | Orange fish silhouette is immediately recognizable. |
| ship | Accept | Passenger ship with hull/decks is distinct from the rowboat. |
| shop | Accept | Awning, storefront, and display window form a clear shop without relying on sign text. |
| chip | Accept | One golden fried potato piece fits UK “chip” and is distinct from ship/shop. |
| ring | Accept | Gold finger-ring silhouette is clear. |
| rain | Accept | Cloud with falling drops depicts rain. |
| seed | Revise | It can still be named as a bean or sprout; enlarge the seed body and make the shoot visibly emerge from it. The separate 82px review also flagged it borderline. |
| feet | Accept | Pair of feet makes the plural target clear. |
| green | Accept | Corrected v2 is a single vivid colour swatch without a competing object reading. |
| boat | Accept | Rowboat with oars/water is distinct from ship. |
| coat | Accept | Outdoor coat silhouette is clear. |
| moon | Accept | Cratered celestial body is recognizable as the moon in this set; retained 82px art review also passed it. |
| book | Accept | Open book and pages are clear. |
| fork | Accept | Single fork and tines are immediately recognizable. |

## Pair and style cautions

`can` and `tin` have closely overlapping existing clues (“a metal container” and “a small metal can”). Preserve the current wording and phonics data during this art pass; make the picture for `tin` specifically a lidded tea/biscuit tin and `can` a food can, then review them side-by-side at 96px. This is a visual distinction recommendation, not a claim that images fully resolve the source's lexical overlap.

`pot` must not reuse the mapped cooking-pot image for the plant-container clue. `map` should be remade in the dimensional card style and should show a simple route rather than a flat world map. `seed` should retain the seed as the dominant shape; do not let a small seed disappear under the plant. The existing challenge and Growing reviews are useful evidence for their own picture sets, but do not automatically accept any image outside the exact words/clues assessed here.

This review does not alter source assets or mappings, generate images, launch a browser, or test runtime behavior. It does not claim audio, phoneme, or overall product acceptance.
