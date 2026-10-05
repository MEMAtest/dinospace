# Independent static review: Sound Safari Challenge picture art

Date: 2026-10-05

## Reviewed candidate

- Runtime/art source: `308641dbb0a398449fa17d0929d048b9115a78cb` (`Add complete Sound Safari Challenge picture art`).
- Evidence/provenance refresh: `7f003279aff827a185ae107c859d23fdfdc32552` (inventory-only change after the art commit).
- Reviewed 82px sheet: `contact-sheet-all-29-82px.png`, SHA-256 `421e6ac74334970220974ca2d0a18438aacb3481e343ea160778a762467416df`.
- Provenance: `provenance.json`, SHA-256 `5d78dcef0155c920e5fbb41222c5a7592609b4230a82b5505fe01ad59890553a`.
- Review was static only. The sheet is 82px-bound with reviewer-only labels; runtime cards do not show those labels. No browser, audio, paid generation, or child data was used.
- The sheet represents all 29 Chapter 3 card mappings: 25 new art assets and four existing reused assets (fish, moon, snail, star).

## Verdict

The sheet is mostly ready as wordless picture vocabulary: 27 of 29 cards are immediately recognizable at the specified display size, one is borderline, and one needs a clearer visual treatment before it can safely cue its target word. The salient issue is `green`: the picture is a glossy green ball. It strongly reads as a ball and only secondarily as the color green; in a picture-only phoneme choice, a child can name it “ball” and miss the intended /g/ target. Replace it with a single large green colour swatch/paint sample, without letters or a competing object. Keep the palette saturated and visibly green at 82px. Check the corrected asset at 82px against other cards before accepting the Challenge set.

`seed` is borderline: the image shows a brown seed with a new sprout/root, and the seed itself is quite small relative to the leaves. It can be read as a germinating seed, but could also be named “bean” or “sprout.” A larger, unmistakable seed body with a small emerging root is a safer version if the intended answer is specifically “seed.” This is a watch item rather than a confirmed failure because the current visual still supports the target concept.

The remaining items have clear enough silhouettes and familiar visual cues at 82px. In particular, `ship` (large passenger ship), `shop` (storefront), and `chip` (single fried potato piece) are visually separable; the sheep, singular tooth, teeth row, and handled brush are also distinguishable. The branch/grass pair reads as woody leafy twig versus upright blades. The book/fork/coat/boat group has no picture collision. Chain links and chessboard pieces are small but their whole-object silhouettes remain legible in this sheet.

There is noticeable variation between glossy 3D, soft photographic, and flatter illustrated rendering. It does not prevent identification for the 27 clear cards in this review, so it is not an independent blocker; future art should keep the same isolated-object framing and avoid expanding style variation.

## Card-by-card review

| Card | 82px visual reading | Finding |
|---|---|---|
| ship | Passenger ship with hull, deck and upper structure | Clear; distinct from the rowboat |
| shop | Small storefront with awning and display window | Clear; no sign text needed |
| chip | One golden fried potato piece | Clear enough for UK “chip”; different from ship/shop |
| ring | Gold finger ring with a stone | Clear |
| rain | Cloud with falling drops | Clear |
| seed | Brown seed/bean with emerging shoot and root | Borderline; seed is small and “bean/sprout” is also plausible |
| feet | Pair of bare feet | Clear plural cue |
| green | Shiny green sphere/ball | Needs revision; target colour is less salient than competing noun “ball” |
| boat | Rowboat with oars and water edge | Clear; distinct from ship |
| coat | Pink outdoor puffer coat | Clear |
| book | Open book with pages | Clear |
| fork | Single metal fork | Clear |
| chain | Short linked metal chain | Clear, though fine links are small |
| chess | Board with opposing chess pieces | Clear enough at this scale |
| tooth | One isolated tooth | Clear and distinct from teeth |
| brush | Handled hairbrush with visible bristles | Clear |
| sheep | Fluffy lamb/sheep with four legs | Clear |
| shell | Ribbed scallop shell | Clear |
| spoon | Single metal spoon | Clear |
| shark | Side-view shark with fins and tail | Clear |
| train | Locomotive with connected passenger cars | Clear |
| wheel | Tire and visible spokes | Clear |
| branch | Woody twig with several leaves | Clear enough; stem remains visible |
| grass | Upright clump of grass blades | Clear; distinct from branch |
| teeth | Row of teeth with gums | Clear plural cue; distinct from one tooth |
| fish | Existing orange fish illustration | Clear; reused art |
| moon | Existing cratered crescent moon | Clear; reused art |
| snail | Existing snail with shell and eye stalks | Clear; reused art |
| star | Existing five-point yellow star | Clear; reused art |

## Provenance note

The provenance record preserves exact prompts for ten newly generated images. Exact prompt text for the earlier fifteen could not be recovered and is explicitly marked unavailable rather than reconstructed. That is a provenance limitation, not a visual-quality verdict. The retained source PNGs, derivatives and hashes give the artwork traceability, but do not restore those missing prompts.

## Acceptance instruction

Revise only the `green` artwork first; consider enlarging/reframing `seed` if convenient. Keep the original files and add a versioned replacement. Refresh the 82px sheet and compare those replacements plus the unchanged four-member reuse set. Do not infer wordless gameplay acceptance from this static review; the Challenge still has separate phoneme/audio and actual UI gates.
