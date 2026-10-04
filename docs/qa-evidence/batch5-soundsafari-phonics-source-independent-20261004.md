# Independent Sound Safari phonics-source review

Date: 2026-10-04  
Reviewed source: `work/dinospace-batch5-soundsafari-picture-art`, commit `decb60c4c816a24df875044df0d589b90f814f15`  
Files: `src/data/batch5SoundSafariPictureWords.js`, `src/data/batch5SoundSafariLabels.js`, `src/data/batch5LiteracyPools.js`, `src/data/learningProgress.js`, `test/batch5SoundSafariPictureWords.test.mjs`  
Scope: source/lexicon review and focused unit tests only. No app/browser session, child data, provider calls, audio decoding, or listening.

## Findings

The frozen 81-word lexicon has one-to-one authored grapheme and phoneme-token sequences throughout. I inspected each pair below; no unmatched spelling/sound token was found. All used phoneme keys resolve to an entry in `PURE_PHONEME_CLIP_PATHS`; that verifies source mapping only, not the presence, correctness, or audible quality of a packaged clip.

The earlier `branch`/`grass` eligibility defect is fixed: target inclusion requires both the written graphemes and the actual sound keys to be taught. The UI sound-key labels now avoid exposing internal IPA/storage keys. The UK `/ɑː/` exceptions (`plant`, `raft`, `branch`, `grass`, `shark`, `star`) use the `ar` sound key and are excluded when that key is untaught. `plank` is correctly authored as `/plæŋk/`, with sound key `ng` for `/ŋ/`, and requires the separately taught spelling cluster `nk`; it is absent from both target and option lists if either gate is off. Cambridge's UK entries support the selected pronunciations for [plant](https://dictionary.cambridge.org/pronunciation/english/plant), [raft](https://dictionary.cambridge.org/dictionary/english/raft), [grass](https://dictionary.cambridge.org/pronunciation/english/grass), and [plank](https://dictionary.cambridge.org/pronunciation/english/plank).

The sound-label map uses familiar examples for all keys in the authored set. In particular, `c` and `ck` are described as the /k/ sound; `oo-long` and `oo-short` share taught spelling `oo` but have distinct examples (`moon`/`book`); and the voiced/unvoiced `th` keys share the taught `th` spelling while retaining separate examples (`this`/`thin`). The unused composite labels `x` and `qu` are explicitly explained as two successive sounds (`k` then `s`, and `k` then `w`) rather than being presented as single phonemes.

The six minimal pairs are exact one-phoneme contrasts: `cat/bat` (first), `cat/rat` (first), `cat/cap` (last), `hen/pen` (first), `duck/dock` (middle vowel), and `sock/rock` (first). Both answer directions are generated for each pair. The after-answer copy now names the changed position and uses child-facing sound names; the old generic “starts with /…” wording is absent. The tests assert all six relations, their one-position difference, both directions, and no visible word leak in the pre-answer prompt. Independent source inspection also found that the fixed Chapter 3 four-choice sound options do not put `c`/`ck` and `k` together as competing equivalent /k/ answers.

### Audited lexicon

The “spelling” and “sound keys” columns are token sequences, not IPA transcription. Their order is the authored left-to-right phoneme order used by the game.

#### Starter: first-sound picture pool (26)

| Word | Spelling graphemes | Sound keys |
|---|---|---|
| ant | a-n-t | a-n-t |
| bag | b-a-g | b-a-g |
| bat | b-a-t | b-a-t |
| cab | c-a-b | c-a-b |
| can | c-a-n | c-a-n |
| cap | c-a-p | c-a-p |
| cat | c-a-t | c-a-t |
| cot | c-o-t | c-o-t |
| dog | d-o-g | d-o-g |
| hen | h-e-n | h-e-n |
| log | l-o-g | l-o-g |
| mat | m-a-t | m-a-t |
| map | m-a-p | m-a-p |
| mop | m-o-p | m-o-p |
| mug | m-u-g | m-u-g |
| net | n-e-t | n-e-t |
| pan | p-a-n | p-a-n |
| pen | p-e-n | p-e-n |
| pig | p-i-g | p-i-g |
| pin | p-i-n | p-i-n |
| pot | p-o-t | p-o-t |
| rag | r-a-g | r-a-g |
| rat | r-a-t | r-a-t |
| tag | t-a-g | t-a-g |
| tap | t-a-p | t-a-p |
| tub | t-u-b | t-u-b |

#### Growing: blend pool (26 authored; 23 with default Phase 2 sounds)

| Word | Spelling graphemes | Sound keys |
|---|---|---|
| duck | d-u-ck | d-u-ck |
| dock | d-o-ck | d-o-ck |
| rock | r-o-ck | r-o-ck |
| sock | s-o-ck | s-o-ck |
| lock | l-o-ck | l-o-ck |
| bell | b-e-ll | b-e-ll |
| hill | h-i-ll | h-i-ll |
| stamp | s-t-a-m-p | s-t-a-m-p |
| clamp | c-l-a-m-p | c-l-a-m-p |
| truck | t-r-u-ck | t-r-u-ck |
| brick | b-r-i-ck | b-r-i-ck |
| crab | c-r-a-b | c-r-a-b |
| flag | f-l-a-g | f-l-a-g |
| frog | f-r-o-g | f-r-o-g |
| drum | d-r-u-m | d-r-u-m |
| clock | c-l-o-ck | c-l-o-ck |
| plant | p-l-a-n-t | p-l-ar-n-t |
| sack | s-a-ck | s-a-ck |
| tent | t-e-n-t | t-e-n-t |
| belt | b-e-l-t | b-e-l-t |
| pond | p-o-n-d | p-o-n-d |
| nest | n-e-s-t | n-e-s-t |
| raft | r-a-f-t | r-ar-f-t |
| plank | p-l-a-n-k | p-l-a-ng-k; requires `nk` |
| crust | c-r-u-s-t | c-r-u-s-t |
| stump | s-t-u-m-p | s-t-u-m-p |

#### Challenge: sound positions (29 words, 81 questions)

| Word | Spelling graphemes | Sound keys |
|---|---|---|
| fish | f-i-sh | f-i-sh |
| ship | sh-i-p | sh-i-p |
| shop | sh-o-p | sh-o-p |
| chip | ch-i-p | ch-i-p |
| ring | r-i-ng | r-i-ng |
| rain | r-ai-n | r-ai-n |
| seed | s-ee-d | s-ee-d |
| feet | f-ee-t | f-ee-t |
| green | g-r-ee-n | g-r-ee-n |
| boat | b-oa-t | b-oa-t |
| coat | c-oa-t | c-oa-t |
| moon | m-oo-n | m-oo-long-n |
| book | b-oo-k | b-oo-short-k |
| fork | f-or-k | f-or-k |
| chain | ch-ai-n | ch-ai-n |
| chess | ch-e-ss | ch-e-ss |
| tooth | t-oo-th | t-oo-long-th-unvoiced |
| brush | b-r-u-sh | b-r-u-sh |
| snail | s-n-ai-l | s-n-ai-l |
| sheep | sh-ee-p | sh-ee-p |
| shell | sh-e-ll | sh-e-ll |
| spoon | s-p-oo-n | s-p-oo-long-n |
| shark | sh-ar-k | sh-ar-k |
| star | s-t-ar | s-t-ar |
| train | t-r-ai-n | t-r-ai-n |
| wheel | w-ee-l | w-ee-l |
| branch | b-r-a-n-ch | b-r-ar-n-ch |
| grass | g-r-a-ss | g-r-ar-ss |
| teeth | t-ee-th | t-ee-th-unvoiced |

## Eligibility and pool evidence

| Chapter | Authored words | Default eligible targets | Default questions |
|---|---:|---:|---:|
| Starter | 26 | 26 | 38 (26 first-sound + 12 directed minimal-pair questions) |
| Growing | 26 | 23 | 23 |
| Challenge | 29 | 29 | 81 (29 first + 23 odd-length middle + 29 last) |

The tests additionally assert distinct first-sound distractors, four unique same-grapheme-length options for each default Growing run item, exactly one correct answer, exclusion of even-length middle questions, partial-selection filtering without fallback, Phase 2/3 `ar` on/off behavior, and `ng`/`nk` plank gating. `node --test test/batch5SoundSafariPictureWords.test.mjs` passed 11/11 on the reviewed snapshot.

## Residual editorial gate

The `duck/dock` pair is a vocabulary/art risk for a UK child audience. The 82px sheet shows a tiny wooden jetty-like platform on white, with no water or boat context. Cambridge's UK learner entry defines a dock as a place where ships stop and goods are moved, while the illustrated structure over water is the US sense; Cambridge uses `jetty` for that structure in UK English ([dock](https://dictionary.cambridge.org/dictionary/learner-english/dock), [jetty](https://dictionary.cambridge.org/dictionary/learner-english/jetty)). At thumbnail size the current asset can also read as a small wooden bench/platform. Preserve the tested sound contrast, but either make the picture unmistakably a UK dock/port (with a ship and harbour/loading context) or choose a more familiar age-appropriate whole-word contrast. This is not a phoneme or pool-construction defect.

## Boundaries

This audit supports the source's phoneme ordering, gating, labels, and finite pools only. The source commit is not a served/frozen playable candidate. The word-choice game remains closed for Growing and Challenge while artwork is incomplete (`soundSafariChapterArtReady(1)` and `(2)` are false). No pure-phoneme clip was decoded or heard; no claim is made about audio-file existence beyond the source's path-key mapping, pronunciation quality, whole-word recording coverage, runtime behavior, child testing, production behavior, or overall 4.5 acceptance.
