# Spelling Studio: complete word-picture and clue audit

Date: 2026-10-05  
Reviewed checkout: `work/dinospace-batch5-integration`  
Source commit: `e6f6fa0ab5b9238f38abaea58f1a5fbeedcc1afe`  
Word-source SHA-256: `8440dd01d079549d4f03152f1f6ba7231562811979959c9d3731811e9310e057`

## Scope and result

I reviewed all 101 records in `BATCH5_SPELLING_WORDS` against their authored clue, emoji, grapheme segmentation, and band. The component renders the emoji as the main 96×96 picture tile and displays the text clue beside it; there is no word-specific picture asset lookup in Spelling Studio. The title model is deliberately shown in Chapter 1 (Copy). This report does not recommend suppressing that teaching model or changing the word pool, clue voice strings, answer flow, or taught-sound filter.

The source records are partitioned into 36 First Sounds, 31 More Phase 2 Sounds, and 34 Longer Sounds words. Source-level grapheme checks confirm 36/36 first-band and 31/31 more-band entries use the relevant Phase 2 taught set. None of the 34 Phase 3 words is decodable with the Phase 2-only default; all 34 become eligible when the Phase 3 graphemes are taught. I found no band/grapheme mismatch in these 101 records.

There are 35 exact-word image candidates already mapped in the reviewed Sound Safari asset registry: `pin`, `map`, `tap`, `dog`, `log`, `cat`, `hen`, `mat`, `pan`, `pot`, `mop`, `cot`, `cap`, `can`, `duck`, `dock`, `rock`, `sock`, `lock`, `bell`, `hill`, `fish`, `ship`, `shop`, `chip`, `ring`, `rain`, `seed`, `feet`, `green`, `boat`, `coat`, `moon`, `book`, and `fork`. Availability is not blanket approval: several images depict the wrong sense for the spelling clue, and their visual style should be normalized before reuse. Specifically reviewed candidate art is available for the Growing sheet (including dock v2 and crust v2) and the Challenge sheet (including green v2); those sheet reviews cover Sound Safari semantics at 82px, not their fit to every spelling clue.

## Main issues to fix

1. **Action clues often have static object emoji.** `sat` shows a chair, `got` a present, `fed` a bowl, `nod` a smile, and `fell` a leaf. The clue asks what someone does; use one simple action scene rather than a symbol that names an adjacent object.
2. **The `tip` picture conflicts with the clue.** The pouring-liquid emoji cues “pour” or a drink, while the clue means the pointed end. Use a pencil/paintbrush tip close-up or revise only the clue to name a familiar pointed end.
3. **`tin` and `can` currently collapse to near-synonyms.** Their clues are respectively “a small metal can” and “a metal container.” Keep both words and their current sound targets, but give `tin` a tea/biscuit tin with a fitted lid and `can` a food can with a pull tab; update the short clues to distinguish those familiar objects.
4. **Several abstract or relational words cannot be fairly cued by an isolated emoji.** `but`, `this`, `that`, `much`, `less`, `gap`, and `luck` need a tiny, literal scene with spatial/quantity/action context, or a clearer child-facing picture clue. Avoid arbitrary icons or adding text labels that disclose the answer.
5. **`thin` and `long` need a comparison.** A single thread/ruler-like object does not teach “not thick” or “not short.” Show clearly contrasted objects in one uncluttered scene.
6. **`dad` is represented by a generic adult-man emoji.** Use a warm, ordinary father-with-child scene; retain the specific clue “A father.” A generic standalone man does not communicate the relationship.

## Word-by-word picture direction

“Reuse candidate” names an exact subject asset in `SOUND_SAFARI_PICTURE_ART`; it does not imply the spelling tile has already been visually accepted. Other rows request a new, isolated picture or a small action/context scene in the same bright, dimensional style, legible at 96px. No answer spelling or grapheme markings should be added to the art.

### First sounds (36)

| Word | Current emoji/clue fit | Picture instruction and reusable candidate |
|---|---|---|
| sat | Chair emoji names the seat, not sitting. | New: child seated on a chair, clear sitting pose. |
| pat | Hand emoji is ambiguous. | New: open hand gently patting a friendly dog or cushion. |
| pin | Pushpin matches the tiny paper-holding point. | Reuse candidate: `pin-v1.webp`; ensure it reads as a pushpin, not a sewing needle. |
| tin | Can emoji and clue duplicate `can`. | New: small lidded tea/biscuit tin; distinguish it from a food can. |
| map | Map emoji is an exact cue. | Reuse candidate: `../curriculum/continent-map.svg`; for a consistent picture set, prefer a folded route map with a dotted path and no words. |
| tap | Faucet emoji matches the clue. | Reuse candidate: `tap-v1.webp` (faucet). |
| dog | Dog emoji directly matches “pet that barks.” | Reuse candidate: `dog-v1.webp`; existing candidate has a friendly, clear dog silhouette. |
| log | Log emoji is direct. | Reuse candidate: `log-v1.webp`. |
| cat | Cat emoji directly matches the clue. | Reuse candidate: `cat-v1.webp`. |
| kid | Child emoji names the target but is generic. | New: one child in a familiar everyday activity; avoid text and gender coding. |
| hen | Chicken emoji is close, but can be a rooster. | Reuse candidate: `hen-v1.webp`; preserve visible hen cues (comb, body, eggs nearby only if not cluttered). |
| red | Red circle accurately cues a colour, though it is a generic UI symbol. | New: single saturated red swatch with the same framing as green-v2; no object competing with the colour. |
| mat | Yoga mat emoji is a rolled/exercise-mat association. | Reuse candidate: `mat-v1.webp`, a flat floor mat; this better fits “soft floor covering.” |
| man | Person emoji is not specifically a man; clue says any adult person. | New: adult male person, varied and respectful; revise clue to “A grown-up male person.” |
| tan | Beach emoji cues beach/suntan, not the colour. | New: one light tan/brown colour swatch matching the green/red treatment. |
| pan | Frying-pan emoji is direct. | Reuse candidate: `pan-v1.webp`; its frying pan shape fits the clue. |
| nap | Sleeping face signals sleep but not a short rest. | New: child taking a brief daytime nap on a pillow/sofa; keep calm and non-clinical. |
| sap | Tree emoji only names the source tree. | New: close view of a tree trunk with one sticky amber sap drop. |
| sip | Cup emoji names a drink, not a small drink/action. | New: child taking one small sip from a cup, with a modest visible liquid level. |
| sit | Chair emoji repeats `sat` and names furniture. | New: child sitting upright on a chair, distinct from the past-tense `sat` pose only if useful; retain their different authored clues. |
| pit | Hole emoji is reasonably direct but lacks the ground context. | New: clear small hole in a soil cross-section; no fruit pit. |
| kit | Toolbox emoji suggests tools, but not a small set. | New: open, compact kit with a few useful tools neatly contained. |
| tip | Pouring emoji contradicts “the very end.” | New: close-up pointed pencil/brush tip attached to its whole object; do not show liquid pouring. |
| dip | Carrot suggests food, not dipping. | New: carrot piece entering a small bowl of sauce; make the dipping action obvious. |
| dim | Bulb emoji may cue lightbulb rather than low brightness. | New: simple split scene with the same lamp glowing brightly on one side and dimly on the other; no tiny details. |
| mad | Angry face broadly fits “feeling cross.” | New: expressive child with a mild frustrated face; safe, non-threatening emotion. |
| sad | Sad face broadly fits “feeling unhappy.” | New: expressive child with a gentle sad face; avoid tears as the sole cue. |
| dad | Generic man emoji omits the father/child relationship. | New: father sharing an ordinary activity with a child; diverse, warm, not a stereotype. |
| gap | Two-way arrows describe distance abstractly. | New: two familiar blocks/objects separated by a visible empty space. |
| got | Gift emoji cues a present, not receiving. | New: child receiving a ball/book from another person, with the handover visible. |
| pot | Plant-pot emoji is plausible, but the exact mapped art is a cooking pot. | New: ceramic flower pot with soil/one small plant; avoid `pot-v1.webp` unless the target clue changes. |
| top | Up arrow is a symbol, not the highest part. | New: three stacked blocks with the top block unmistakably uppermost; no arrow label. |
| mop | Mop emoji is direct. | Reuse candidate: `mop-v1.webp`. |
| nod | Smile emoji does not show nodding or agreement. | New: child nodding yes, side view or two restrained head-position marks. |
| not | Prohibition emoji is a reasonable “no” symbol but can mean stop/forbidden. | New: child gently shaking head “no” in context; keep the clue explicit that this is a word meaning no. |
| cot | Bed emoji fits “small bed.” | Reuse candidate: `cot-v1.webp`; its crib/cot silhouette is clear. |
| cop | Police emoji is direct but may read only as a uniform. | New: friendly community police officer in neutral stance; avoid weapons or arrest imagery. |
| cap | Cap emoji is exact. | Reuse candidate: `cap-v1.webp`; clear baseball cap at card size. |
| can | Can emoji fits, but overlaps `tin`. | Reuse candidate: `can-v1.webp` only if rendered as the food-can sense; ensure red paint tin is not presented as the same item as `tin`. |

### More Phase 2 sounds (31)

| Word | Current emoji/clue fit | Picture instruction and reusable candidate |
|---|---|---|
| duck | Duck emoji directly fits. | Reuse candidate: `duck-v1-card.webp`; prior Memory/Sound Safari art is recognizable. |
| dock | Anchor emoji names boat equipment, not a place to stop. | Reuse candidate: `dock-v2.webp`; reviewed 82px image shows a wooden quay, blue water, and a small tied boat. |
| back | Return arrow is ambiguous. | New: child viewed from behind with the back of the body clearly visible; avoid a backward arrow. |
| neck | Giraffe emoji cues animal/long neck, not the body part alone. | New: friendly portrait/animal crop with neck visibly connecting head and shoulders. |
| peck | Bird emoji names a bird, not its quick tap. | New: small bird pecking one seed on the ground, beak contact visible. |
| sick | Fever face is understandable but abstract. | New: child resting with a tissue/thermometer; no alarming medical detail. |
| tick | Check emoji fits “a small mark beside a choice.” | New or reuse as an isolated, bold check mark in a simple checkbox; use a mark, not a checked list full of text. |
| rock | Rock emoji is exact. | Reuse candidate: `fossil-rock-v1-card.webp`; reviewed rock art is a clear single stone. |
| sock | Sock emoji is exact. | Reuse candidate: `sock-v1.webp`; reviewed 82px art is distinct from its sound-alike. |
| lock | Lock emoji directly fits. | Reuse candidate: `lock-v1.webp`. |
| luck | Clover convention suggests luck but does not depict the clue’s event. | New: child finds a four-leaf clover or wins a harmless coin toss; choose one clear “good chance” scene, not a floating clover icon. |
| bell | Bell emoji directly fits. | Reuse candidate: `bell-v1.webp`; reviewed chapter sheet includes a clear bell. |
| fell | Falling-leaf emoji names a leaf, not “dropped down.” | New: ball or toy visibly falling to the floor; no injury. |
| tell | Speaking emoji is close but lacks a listener. | New: one child telling a short story to a friend; visible turn-taking. |
| sell | Price tag cues a price, not giving something for money. | New: simple friendly shop exchange: seller hands over one item while receiving a coin. |
| hill | Hill emoji directly fits. | Reuse candidate: `hill-v1.webp`; reviewed 82px art is an isolated raised landform. |
| fill | Milk glass suggests fullness, not filling. | New: liquid pouring into a clear cup up to a visible level. |
| miss | Red X is a result symbol and could mean wrong. | New: child narrowly missing a ball with a net/goal; non-violent game action. |
| hiss | Snake emoji plus “snake-like s sound” fits. | New: friendly snake making a soft hiss with a small breath cue; avoid fangs/aggression. |
| less | Down arrow is not a smaller amount. | New: two piles of the same familiar item, one visibly smaller; no numerals. |
| mess | Teddy bear alone is not untidiness. | New: a few toys/clothes scattered on a floor beside a tidy space; uncluttered at 96px. |
| fuss | Distressed face is vague and “a lot of bother” is adult phrasing. | New: child fussing mildly over a small everyday problem; simplify clue to “Making a lot of noise about a small problem.” |
| puff | Air cloud reasonably depicts a puff but is generic. | New: one visible puff of breath/air from a child blowing a feather; distinct from smoke. |
| huff | Angry face suggests emotion, not breathing out. | New: child breathing out a visible breath after effort; keep the face cross only if the clue stays “in a cross way.” |
| run | Runner emoji directly represents running. | New consistent-style child running in profile; simple ground shadow, clear legs in motion. |
| fed | Bowl suggests food, not giving it to someone. | New: adult/child feeding a pet or baby with a spoon; choose one safe, obvious recipient. |
| hit | Baseball suggests sport but not the strike. | New: bat making contact with a ball; show the action without a person being hit. |
| but | Opposing arrows do not teach the joining word. | New context pair: child wants to play outside, but rain is falling; keep two contrasting halves and retain a plain-language clue about joining ideas that do not quite match. |

### Longer sounds (34)

| Word | Current emoji/clue fit | Picture instruction and reusable candidate |
|---|---|---|
| fish | Fish emoji directly fits. | Reuse candidate: `pond-fish-v1-card.webp`; reviewed reused fish art is clear. |
| ship | Ship emoji is exact. | Reuse candidate: `ship-v1.webp`; 82px review found passenger ship distinct from boat. |
| shop | Store emoji is exact. | Reuse candidate: `shop-v1.webp`; 82px review found the storefront legible without sign text. |
| shut | Door emoji names the object, not closing it. | New: hand closing a door, with the door nearly shut; gentle, safe scene. |
| thin | Thread emoji can be thin, but clue is comparative. | New: same-kind thick and thin string/board side by side; thin target is clearly narrower. |
| this | Pointing finger has no near/far referent. | New context scene: child points to an object close beside them; clue remains “a word for something nearby.” |
| that | Pointing finger has no visible distance. | New context scene: child points to the same kind of object farther away; match framing with `this`. |
| chat | Speech bubble represents talk but is abstract. | New: two children facing each other and talking; relaxed expression, no written speech. |
| chin | Smiling face hides the chin as target. | New: clear lower-face/neck portrait that includes the chin, with a natural pose and no floating arrow. |
| chip | Fries emoji may mean plural chips/fries, but clue is singular. | Reuse candidate: `chip-v1.webp`; 82px review found one golden fried potato piece, suitable for singular UK “chip.” |
| rich | Money symbol is stereotyped and does not show “having lots.” | New: simple storybook scene with a full coin jar or a well-stocked home; avoid luxury/status stereotypes. |
| much | Box icon is unrelated to “a large amount.” | New: one large pile of familiar blocks/fruit contrasted with a small pile; the large amount is obvious. |
| sing | Microphone emoji cues performance, not singing. | New: child singing with musical notes kept secondary; open mouth and happy posture. |
| ring | Ring emoji is exact. | Reuse candidate: `ring-v1.webp`; 82px review found a clear finger ring. |
| song | Notes represent music but not words plus music. | New: child singing with a simple music book/notes; keep distinct from `sing` by showing a song represented on a page. |
| long | Ruler emoji suggests measurement but not “not short.” | New: same-kind long and short ribbon/rope side by side; target long is salient. |
| rain | Rain cloud emoji directly fits. | Reuse candidate: `rain-v1.webp`; reviewed at 82px as cloud with drops. |
| tail | Cat emoji may show a whole cat with a small tail. | New: animal side view with tail large and clearly attached; keep enough whole-animal context to identify it as a tail. |
| wait | Hourglass emoji is a symbol, not waiting. | New: child waiting for a bus or a growing plant; one quiet scene with a clear “waiting” posture. |
| pain | Bandage suggests injury, but not an ache in the body. | New: child points to a mildly sore knee/elbow; no wound or medical drama. |
| sail | Sailboat emoji is close but may be read as a boat. | New: small sailboat with a large wind-filled sail as the focal feature; do not reuse the rowboat image for `boat`. |
| seed | Sprouting-seed art risks reading as bean/sprout. | Reuse candidate: `seed-v1.webp` only after enlargement/reframing; prior 82px review marked the seed body borderline-small. |
| feet | Feet emoji directly conveys plural feet. | Reuse candidate: `feet-v1.webp`; 82px review found a clear pair. |
| green | Green circle is a generic colour sample. | Reuse candidate: `green-v2.webp`; independent 82px correction review passed the single colour swatch. |
| boat | Sailboat emoji can overlap `sail`. | Reuse candidate: `boat-v1.webp`; reviewed rowboat with oars/water edge, distinct from passenger `ship`. |
| coat | Coat emoji is exact. | Reuse candidate: `coat-v1.webp`; reviewed outdoor coat silhouette. |
| road | Road emoji is a useful symbol but thin/abstract. | New: simple road curving past grass/trees with one small car; preserve a wide, unmistakable path. |
| moon | Moon emoji is direct. | Reuse candidate: `crescent-moon-v1-card.webp`; reviewed cratered moon art. |
| food | Steaming bowl only cues one meal/dish. | New: small plate/bowl with a few familiar foods; avoid making soup the only interpretation. |
| book | Book emoji is direct. | Reuse candidate: `book-v1.webp`; 82px review found open pages clear. |
| look | Eyes emoji is a body part, not looking. | New: child looking closely at a butterfly/toy; show gaze direction without an arrow. |
| farm | Tractor emoji cues farm machinery, not the place. | New: a compact farm scene with barn, field/crops, and one animal; avoid detail too small for 96px. |
| fork | Fork emoji is exact. | Reuse candidate: `fork-v1.webp`; 82px review found a single fork clear. |
| turn | Curved arrow cues direction but not the action. | New: child turning around or a small vehicle turning at a corner; use one obvious direction change. |

## Candidate reuse map

Exact-word mapped art candidates should be checked against the spelling clue before adoption. Strong fit candidates from already reviewed 82px sheets include `duck-v1-card.webp`, `dock-v2.webp`, `rock-v1-card.webp`, `sock-v1.webp`, `lock-v1.webp`, `bell-v1.webp`, `hill-v1.webp`, `fish`, `ship-v1.webp`, `shop-v1.webp`, `chip-v1.webp`, `ring-v1.webp`, `rain-v1.webp`, `feet-v1.webp`, `green-v2.webp`, `boat-v1.webp`, `coat-v1.webp`, `moon`, `book-v1.webp`, and `fork-v1.webp`. The Growing art review found the Chapter 2 set recognizable at 82px, with only crust requiring a v2 correction; `dock-v2` and `crust-v2` are the retained reviewed versions. The Challenge review passed the corrected green swatch and previously rated `seed` borderline.

Other exact-name candidates (`pin`, `map`, `tap`, `dog`, `log`, `cat`, `hen`, `mat`, `pan`, `pot`, `mop`, `cot`, `cap`, `can`) are available in the mapping/contact sheet but need to be reviewed in the spelling clue context before reuse. In particular, do not use the cooking-pot art for the plant-container clue, or let `tin` and `can` collapse into indistinguishable cans.

## Acceptance instructions for a future art pass

- Keep all 101 IDs, grapheme/phoneme arrays, band assignment, authored clue speech, and taught-sound filtering unchanged unless a separately reviewed editorial change explicitly revises wording.
- Make every main card image recognizable without reading its caption at 96px. For verbs and relational words, use simple pictured actions/scenes; do not substitute a nearby object or arbitrary icon.
- For colour and comparison words, use large consistent swatches or matched comparison pairs. For `this`/`that`, hold the same scene and change only distance/context.
- Reuse the reviewed Sound Safari subject image only where its exact target matches this word's clue; preserve its attribution/provenance/hash. Keep the common card crop, light background, and art style consistent.
- Build a labelled reviewer contact sheet with all 101 words at the actual 96px tile size. Inspect sound-alike/sense pairs together, especially `tin/can`, `sat/sit`, `this/that`, `thin/long`, `ship/boat/sail`, `seed/plant`, and `look/chin`.
- Report image meaning separately from phoneme eligibility. Chapter 1's visible model is intentional copying; picture remediation must not hide or move that model.

This is a static source/editorial audit, not a browser or gameplay acceptance, audio review, generated-art provenance audit, or overall 4.5 score. Existing component edits in the shared checkout were left untouched.
