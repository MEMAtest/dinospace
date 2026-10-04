# Independent source/content review: Sound Safari picture vocabulary

Date: 4 October 2026  
Vocabulary implementation: `29392bb` (`Add controlled Sound Safari picture vocabulary`)  
Reviewed frozen candidate tip: `5e94c429859717c79da8d604681624a67c006e67`  
Integration baseline: `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`  
Scope: read-only source, inventory, and test review; no browser game run, artwork generation, voice/story calls, or runtime edits.

## Disposition

The authored pool and its game-start guard are not ready for playable visual acceptance. The 79-word inventory and source-level question counts are coherent, but the saved-taught-sound contract has a concrete Phase 3 defect affecting `branch` and `grass`. The art gate correctly prevents Start/Replay while images are unprepared. No five-dimension game score or 4.5 result is assigned from this source-only review.

## Pool and decodability evidence

The manifest contains 79 unique stable IDs: 35 reused spelling IDs and 44 Sound-Safari-only additions. The chapter lists contain 26, 24, and 29 targets. With default Phase 2 sounds, source tests produce 26 first-sound questions and 24 blend questions; Phase 3 produces 81 position questions (29 first, 23 unambiguous odd-length middle, and 29 last). A read-only inventory check found no word with unequal grapheme/phoneme sequence lengths. Source tests also confirm distinct first-sound options, one correct choice in each sampled run, same-grapheme-length blending decoys, deterministic six-question runs, and odd-only middle positions.

These are generator/data checks, not proof that the rendered pictures fairly identify each word or that a child can hear/recognize the target. The Phase 3 position pool uses up to four distinct phoneme tokens, but the current first-sound exercise is not a recorded minimal-pair contrast: its options are selected to have different initial sounds. The roadmap still calls for minimal-pair listening and animal-context explanation.

## Defect: selected graphemes do not cover selected phonemes

`getSoundSafariPictureWords()` filters each target against its `graphemes` only (`src/data/batch5SoundSafariPictureWords.js:123–130`). Phase 3 question generation then uses the target’s separate `phonemes` without checking the persisted taught set (`src/data/batch5LiteracyPools.js:66–74`). The inventory explicitly records the non-rhotic Southern British pronunciation: `branch` and `grass` have the written grapheme `a`, but use the `/ɑː/` phoneme key `ar` (`batch5-soundsafari-picture-vocabulary-inventory-20261004.json:107–113`).

A read-only pure-function probe used the complete Phase 2+3 selection with only `ar` removed. Both words still entered the Phase 3 pool because their written `a` grapheme remained selected. It generated `segment:safari-branch:middle` with answer `ar` while `ar` was not in the selected set. `grass` likewise remained eligible and contributed first/last questions. This distinguishes taught short `a` (the Phase 2 `/æ/` sound, as in `cat`) from a broad assumption that selecting grapheme `a` teaches every pronunciation of that spelling. Selecting `/ar/` must remain an explicit condition for these `/ɑː/` instances.

The existing test name claims that default words “use only taught phonemes,” but its check at `test/batch5SoundSafariPictureWords.test.mjs:23–35` only verifies that each phoneme has a declared clip-path key. It does not verify that the selected sound set covers the authored phoneme. The partial persisted-selection test at lines 99–116 only exercises Chapter 1 and does not toggle `ar` off while retaining the Phase 3 graphemes.

**Required source follow-up:** define and apply an explicit mapping/requirement between each spelling sequence and its actual spoken phoneme keys. Preserve both constraints: every written grapheme is selected, and every actual target/distractor phoneme is taught/available under the selected profile. Do not treat `a` as a blanket alias for `/ɑː/`. Add a regression case with all Phase 2+3 selections except `ar`; `branch`/`grass` and any `ar` answer/distractor must be absent, while they can be included when `ar` is selected. Keep explicit mappings for distinctions such as `th-unvoiced` versus the UI’s selected `th` token rather than assuming string equality everywhere.

## Fairness, pictures, and remaining gates

The source structure intends wordless single-subject art and keeps visible choice text absent; the UI’s accessible option label carries each word for assistive technology. The vocabulary is mostly concrete and the authored art directions specify useful distinctions (for example, animal-sense `bat`, a taxi `cab`, a plant `pot`, and a single tooth versus plural teeth). However, image-level fairness is not reviewable yet: the inventory reports **0 packaged target images and 72 missing originals**; five reuse references await copying and two inspected reuse candidates await approval. `soundSafariChapterArtReady()` returns false until every target in a selected chapter has a packaged asset (`src/data/batch5SoundSafariPictureWords.js:100–135`), and the component’s start path refuses to begin until that guard passes. Therefore no game-start, word-picture correctness, distractor fairness, image/text alignment, or visual-quality claim is made.

The roadmap requires audio, image, and answer agreement, three bands with six rounds, shuffled options, restart without recent repeats, minimal-pair listening, and animal context. Source tests support deterministic six-item runs, no-repeat selection before a pool cycle, and choice uniqueness. The following remain unverified or open:

- Resolve the `branch`/`grass` phoneme eligibility bug and add saved `ar` on/off regression coverage.
- Package approved, distinct, label-free artwork for all targets; inspect ambiguous small-card subjects (including grass versus a plant, isolated branch, chess, green, and tooth/teeth) at actual target size before enabling play.
- Complete the required isolated pure-phoneme assets and independently test audible phoneme→word→image agreement; this review made no asset or listening checks.
- Add/confirm a genuine minimal-pair listening exercise and age-appropriate animal/context explanation required by the roadmap; the present pool’s distinct-first-sound options alone do not establish that requirement.
- Only after those gates, run normal UI checks for six questions in each band, wrong/hint/correct held feedback, restart/recent behavior, saved-profile restrictions, and visual fairness at desktop and 390px.

## Test result and limits

`node --test test/batch5SoundSafariPictureWords.test.mjs` passes 5/5 on this candidate. The passing result does not catch the saved-`ar` case above. The test’s own assertion wording should be tightened to distinguish “a valid phoneme key exists” from “the selected profile teaches the phoneme.” No release, audible, visual, or overall score is awarded.
