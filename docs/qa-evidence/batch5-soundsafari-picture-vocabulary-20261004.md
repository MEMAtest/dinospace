# Batch 5 Sound Safari controlled picture vocabulary

Date: 2026-10-04
Candidate base: `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35` (`work/dinospace-batch5-integration`)
Scope: authored Sound Safari vocabulary and pool construction only; pre-art candidate.

## Result

The picture-choice chapters now draw from a finite, authored noun vocabulary. Existing spelling-bank words retain their existing IDs; new Sound Safari words use `safari-*` IDs and do not enter spelling eligibility or progress. The full spelling word bank and its eligibility code are unchanged.

| Chapter | Targets under default taught sounds | Default question pool |
| --- | ---: | ---: |
| Sound starter: match the first sound | 26 | 26 |
| Blend the sounds | 24 | 24 |
| Find a sound in the word | 29 | 81 |

The third chapter has first and last questions for all 29 words, and middle questions for the 23 odd-phoneme words. Even-length sound sequences do not receive a “middle” question. Target and decoy words are filtered against every grapheme in the persisted selected-sounds set, with no fallback. A six-question run remains seeded and finite.

## Fairness and phonics rules

- First-sound choices contain distinct initial phonemes, with one correct choice.
- Blending choices have the same grapheme count as the target and one correct word ID.
- Position questions use phoneme order and are authored only for words whose grapheme and phoneme sequences have equal counts. First and last use all eligible targets, while middle is limited to odd phoneme counts.
- Pronunciation is contemporary non-rhotic Southern British English. `branch` and `grass` use /ɑː/; the written `a` grapheme is retained and their sound sequence uses the existing `ar` recording key. The manifest records this explicitly.
- `flower` is excluded because its final unstressed vowel has no matching packaged sound key; `snow` lacks the required `ow` recording; `cheese` ends in /z/, which this phoneme inventory does not encode. Abstract/function words and actions or people that cannot be distinguished fairly from a wordless image are excluded from this picture vocabulary.

## Artwork inventory

There are 79 unique targets: 35 reused spelling IDs and 44 sound-only IDs. The machine-readable manifest lists every word, grapheme and phoneme sequence, clue, object art direction, task eligibility, source path/hash, and missing-art ID.

- Five exact-subject assets are approved for reuse: map, duck, fish, moon, and rock. They are still source references, not copied or packaged into this candidate.
- Star and snail assets were inspected at 82px and are recognizable. They remain reuse candidates pending root approval.
- 72 target IDs have no selected semantic image yet: `ant`, `bag`, `bat`, `cab`, `can`, `cap`, `cat`, `cot`, `dog`, `hen`, `log`, `mat`, `mop`, `mug`, `net`, `pan`, `pen`, `pig`, `pin`, `pot`, `rag`, `rat`, `tag`, `tap`, `tub`, `dock`, `sock`, `lock`, `bell`, `hill`, `truck`, `brick`, `crab`, `flag`, `frog`, `drum`, `clock`, `plant`, `sack`, `tent`, `belt`, `pond`, `nest`, `raft`, `plank`, `crust`, `stump`, `ship`, `shop`, `chip`, `ring`, `rain`, `seed`, `feet`, `green`, `boat`, `coat`, `book`, `fork`, `chain`, `chess`, `tooth`, `brush`, `sheep`, `shell`, `spoon`, `shark`, `train`, `wheel`, `branch`, `grass`, `teeth`.

No new bitmap was generated or copied. The Start and Replay controls are disabled until every target in the selected chapter has packaged artwork. The candidate therefore verifies source mechanics and inventory only; it is not a playable or visually accepted Sound Safari build.

## Verification

- `node --test test/batch5SoundSafariPictureWords.test.mjs test/batch5Literacy.test.mjs` — passed.
- Targeted assertions cover 20+ default-taught target/question counts, unique first-sound distractors, same-length blend choices, correct-option uniqueness, odd-only middles, six-item deterministic queues, saved-sound filtering without fallback, and separation from spelling progress.
- `npx eslint src/components/games/AmariSoundSafari.jsx src/data/batch5LiteracyPools.js src/data/batch5SoundSafariPictureWords.js test/batch5Literacy.test.mjs test/batch5SoundSafariPictureWords.test.mjs` — passed.
- `npm run build:android` — passed with the repository’s Vite chunk-size and stale Browserslist-data warnings. The Sound Safari game chunk was emitted; its Start/Replay guard is part of the built source.
- Local frozen preview identity — pending.

Full inventory: `batch5-soundsafari-picture-vocabulary-inventory-20261004.json`.
