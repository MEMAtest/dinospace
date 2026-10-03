# Batch5 — literacy and reasoning

The four-game contracts remain those in `game-quality-4.5-roadmap.md`. This isolated checkout is based on root1d33a28; Batch3/4 code and releases are not included. These are source findings and implementation instructions, not production regressions or accepted scores.

## Source findings

SoundSafari currently adapts modes midstream, randomly picks individual questions without finite chapters, advances success after1.4seconds, and falls back to untaught phonics when the taught pool is too small. Its blend mode speaks the complete answer before asking the child to identify it. Spelling uses deterministic modulo ordering and an unscoped legacy word store. Its PHASE_WORDS pool has fewer than20Phase2entries. Colour Mixing deterministically loops a tiny recipe table and resets when adaptation changes. OddOneOut offers a generic because alternative that is also defensible alongside the expected reason; it does not state the property before selection.

## Shared contract

Implement three explicit sequential chapters per game, six frozen seeded missions each. Start captures taught settings/difficulty/queue/options; wrong answers, hints, Keep playing and rerenders do not replace any of them. Explanations stay until Next. Finish the final explanation before unlock/badge. Replay chooses a new seed, avoids recent content within finite pool and does not duplicate global star/badge credit. Persist child-separated canonical completions and bounded recent identities. Reject orphaned/future completions. Root owns App self-progression, Askia routing, shelf integration and exactrelease; builders own game/data/tests. Use stable optional narration cancellation and packaged-only exact phrases. No paid provider/story calls by builders.

## Sound Safari and Spelling — Luna stream

Add Amari-only components; preserve existing Askia components. SoundSafari chapters: listen/match with taught sounds and validated minimalpairs, ordered oralblending, segmenting sound positions. Document pure phoneme audio assets; do not substitute spoken letter names and call that a phoneme. Do not speak the answer before selection or reveal target picture in listening prompt. A pool shortage gives a clear grown-ups settings explanation, never untaught fallback.

Spelling chapters: copy→missinggrapheme→independentassembly,20+strictlydecodable words pereligibleband (overlap acrossskillsallowed), picture/contextline plus segmented phonemes, every required tile including repeated letters. Canonical finite pool exhaustion precedes word reuse; chapterreplay uses new arrangements. Keep existing caption/trickyword practice as labelled extras and preserve historical word evidence, child stars/stickers without falsely assigning legacy unscoped evidence to Askia. No keyboard completion should claim independent phoneme recognition if the target is exposed.

## Colour and OddOneOut — second stream

Colour: declare simplifiedRYBartistpaint model, equalpartsprimaryrecipes, white/blackshade chapters with ratios and explicitnamedcontrols, realworldcolourhunt. Colours reflect that declared pedagogical model, not additiveRGBaveraging. Animatepour/mixture/reducedmotion; keep matched explanation untilNext and persist eachchild's earned palette.

Odd: semantic→visual→statedrule categories, property visible before pick. Everythree decoys satisfy that property and exactlyoneitemfails it. Follow correctselection with simplebecausechoices where exactlyone is true under the stated rule; avoid vague allpurpose reasons or an equallyvalidcolourinterpretation. Facts should be accurate, short and relevant to the rule. Match generated visuals/labels and answerunderseeds;60+authoredmissionvariants or documentedfinitepoolminimum24/8perchapter. Freezechoices/renderedpositions perrun.

## Independent matrix and release

For eachgame at1280×800 and390×844, complete allthree6missionchapters; exercise wrong→hint→correct/heldNext, exactlastunlock, samebandreplay/newseed/content, positiveonlystarimprovement, equalbestnoreaward, reload/profileisolation, 48pxtargets/mobileoverflow, equivalentkeyboard/inputalternatives and reducedmotion. Inspectphoneme/wordasset agreement, accessiblepreanswerleaks, declaredcolourrecipe results and singledefensiblereason. Download ordinaryUI diagnostics withoutprivateprompts/names. Nativepackagedmedia/cancellation and listening are distinct gates. FreezeexactSHA+hashes beforeindependentQA; release onlyafterrelevantgates and retainexactVercelcanonicalidentity/productionPlaywright foreachbatch. No4.5promotionfromsourcechecks.
