# Sound Safari starter picture-art review

Date: 2026-10-04  
Review type: independent contact-sheet and word-manifest review; no application interaction  
Art checkout: `work/dinospace-batch5-soundsafari-picture-art`, HEAD `29392bb1b8acec5b847c3f129431edf4aa5d44dd`  
Evidence image: `docs/qa-evidence/batch5-soundsafari-picture-art-starter/contact-sheet-82px.png`  
Contact-sheet SHA-256: `b770a939d2de7695cbb17c0d25935c2e0767da5eaa9c1faa3658e8255445e986`  
Manifest reviewed: `src/data/batch5SoundSafariPictureWords.js`, Stage 1 (`stageOneWords`)

## Scope and result

I inspected the 864×660 contact sheet at its supplied 82-pixel card scale and compared the pictured nouns with the Stage 1 word records and their clue/visual-description fields. The sheet contains the 24 new generated nouns plus the reused `dog` picture. The authored Stage 1 list has 26 words: `map` is the additional item and is not on this sheet; it uses the existing continent-map SVG. This review therefore covers the 25 pictured items only, not the complete Stage 1 artwork set.

The set has a cohesive glossy 3D icon style: objects are isolated, centered, softly shaded, and consistently framed. Most nouns remain readily identifiable at thumbnail size, and the picture subjects match their target words. The main semantic weak points are **rag** and **rat**: the folded cloth looks clean and towel-like rather than like a used wiping rag, while the friendly rat could readily be named “mouse.” These are meaningful exact-word risks even though neither noun has a near-duplicate in this pictured set. I recommend a targeted correction or child-nameability check for those two before treating art exactness as closed.

## Per-picture observations

| Word | Contact-sheet observation | Assessment |
|---|---|---|
| ant | Ant silhouette has a distinct head, body, antennae, and visible legs. | Clear match. Six legs are visible at this scale. |
| bag | Blue handled bag with an unmistakable carry shape. | Clear match. |
| bat | Brown animal with spread wings, not a sports bat. | Clear match for the intended animal sense. |
| cab | Yellow taxi-like car. | Accurate cab/taxi meaning; some children may answer “taxi,” which the clue explicitly bridges. |
| can | Red metal can with top and bottom rims. | Clear match. |
| cap | Blue baseball-style cap with a projecting bill. | Clear match. |
| cat | Seated kitten with visible ears, face, and tail. | Clear match. |
| cot | Small white infant cot/crib with rails and blue mattress. | Clear match in UK English; rails help distinguish it from a bed. |
| dog | Friendly puppy, reused existing art. | Clear match. |
| hen | Chicken with a small comb and no prominent rooster tail. | Reasonable match, though the image alone cannot establish “hen” to a child who only knows “chicken.” |
| log | Bark-covered cut trunk section with visible end grain. | Clear match. |
| mat | Flat blue rectangular floor mat. | Clear match. |
| mop | Long handled mop with a visible mop head. | Clear match. |
| mug | Open handled drinking cup. | Clear match. |
| net | Hooped hand net with visible mesh. | Clear generic net; the pictured form suggests a hand/butterfly net more than a fishing net, but the target word is simply “net.” |
| pan | Black frying pan with handle and red exterior edge. | Clear match. |
| pen | Blue capped ballpoint pen. | Clear match; distinct from the pictured pin. |
| pig | Pink pig with snout, ears, and legs. | Clear match. |
| pin | Red-headed straight pin. | Clear match; visually distinct from pen. |
| pot | Red lidded cooking pot with handles. | Clear match. |
| rag | Pale folded cloth, neat and smooth in the thumbnail. | **Needs review.** It reads as a towel, washcloth, or napkin more readily than an old wiping rag; the associated clue supplies the wiping use but the image does not reinforce it. Consider a clearly used/frayed cleaning cloth or a supervised child naming check. |
| rat | Small brown rodent with rounded ears and a long tail. | **Needs review.** At 82px it is plausible as either a rat or mouse. The clue (“small animal with a long tail”) does not distinguish the two. A more rat-specific body/muzzle/ear proportion or child naming check would reduce ambiguity. |
| tag | Blank pale paper label with a string loop. | Clear match. Pale fill is low contrast on the white card, though the outline and loop remain visible. |
| tap | Chrome sink tap/faucet. | Clear match for UK “tap.” |
| tub | Small white bath tub. | Clear match, but its white body has relatively low contrast against the white card. |

## Rubric view

- **Semantic exactness:** Mostly strong. The 22 clear matches are visually consistent with their nouns. `rag` and `rat` are the two concrete naming ambiguities; `hen` is understandable as a chicken but depends on knowing the more specific word.
- **Distinguishability:** Strong within this sheet. Silhouettes separate the pictured objects well, including the plausible pen/pin pair. The rat’s possible “mouse” name is a vocabulary/exactness issue rather than confusion with another pictured card. This contact sheet does not establish how the app chooses distractors or how children respond to them.
- **Child-age vocabulary:** Most are concrete early nouns. `cab`, `cot`, `tap`, and `tub` are valid UK terms; the clue for cab usefully links it to “taxi.” `rag` is less familiar and its clue is doing substantial explanatory work. No child study was conducted.
- **Style and readability:** Strong visual consistency and polished rendering across the set. Main silhouettes are centered and recognizable at 82px. Pale tag, rag, cot, and tub details lose some separation on white, but this is a modest contrast concern rather than a broad readability failure. No rendered gameplay choice layout, physical device, or motion state was evaluated.

## Acceptance boundary

This is a finite art/editorial review of a contact sheet, not runtime QA. It does not establish that all 26 Stage 1 items render correctly in the game, that generated distractor sets are fair, or that images remain legible under the actual choice layout. It makes no claim about packaged whole-word audio, pronunciation, playback, child testing, production behavior, or overall 4.5 acceptance. The `map` SVG was not inspected as part of this sheet review.

No source or art files were changed. No provider, audio, or child-data calls were made.
