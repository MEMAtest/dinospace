# Sound Safari Growing persistence and narration-source audit

**Runtime/source snapshot:** `a652ad6cf33b72e3ef3ff523b70cc773bfcbbb18`  
**Inventory:** [`batch5-soundsafari-source-bound-audio-inventory-20261005.json`](batch5-soundsafari-source-bound-audio-inventory-20261005.json)  
**Scope:** canonical Growing question IDs, current taught-set filtering, and source/runtime narration collector coverage. No browser, provider, or audio was used.

## Finding

The reviewed source closes the Growing canonical-ID persistence defect. Chapter history validation builds its canonical Sound Safari IDs from the chapter’s maximum authored set: Phase 3 for Growing. Thus the recently added `blend:safari-plant`, `blend:safari-raft` and `blend:safari-plank` IDs survive normalization instead of being dropped by a smaller Phase 2 allowlist. The focused test writes those three IDs, re-reads through the progress sanitizer, then confirms the next full-taught Growing run avoids them. It separately confirms a restricted Phase 2 Growing pool and its options do not surface those advanced words.

The source-complete narration collector now uses the same question-pool and prompt/retry/feedback builders as the game. Its bounded enumeration covers 168 valid current questions across Starter match and whole-word pairs, Growing Phase 2 and full Phase 3 blending, and Challenge sound positions. It includes all generated prompt, retry, held-feedback segment/join and question-word-hint texts. A direct source check additionally confirmed every one of the 81 Challenge hint words has a corresponding text entry.

## Verified paths and restrictions

- `AmariSoundSafari.jsx` creates question pools with `createSoundSafariPool`, announces `soundSafariPrompt`, speaks wrong retry through `soundSafariRetryText`, and sends correct spoken feedback from `soundSafariSpokenFeedback`. The visible held answer fact uses the same fact builder.
- The audio hint branch routes first-sound match to one `playPhonemes` key and Growing blend to the ordered `question.target.phonemes` sequence. Minimal-pair and sound-position hints call `tell(question.target.word, [question.target.word])`. The independent inventory check found the complete ordered phoneme sequences and the standalone word text for these branches.
- Growing’s default Phase 2 pool is 23 questions; the full taught Phase 3 pool is 26, with all three advanced examples present as target questions. Tests verify `/ɑː/` (`ar`) is required for `plant` and `raft`, and both the `/ŋ/` sound (`ng`) and written `nk` pattern are required for `plank`. Removing those taught items excludes them from targets and choices; it does not merely hide their answer buttons.
- `batch5LiteracyProgress.js` sanitizes recent IDs using `isCanonicalBatch5QuestionId`. The canonical maximum set enables the full history to survive a read/reload; run construction then intersects recent history with the current actual pool so unavailable questions cannot leak into a restricted set. The focused test uses a storage fixture and proves sanitizer/reload/run-selection logic, not a real-browser storage journey. Progress remains Amari-scoped; the utility returns no progress for another player ID.

## Readiness boundary

The frozen source-bound inventory is **862 unique Batch 5 text clips / 603 sequences**. Only **11/862** text clips currently have a matching manifest entry and non-empty local file; the remainder are pending. The ten whole-word recordings required by Starter are inventoried, but **zero are configured in the runtime**; only `cat` and `rock` happen to have present files, which does not unblock the gate. Pure phoneme coverage is **0/37 files present**, including all 23 unique phoneme keys used by Sound Safari first-sound and full-Phase-3 blend audio. None of these presence counts proves full decode, audio quality, native playback or listening.

Therefore the inventory/collector is source-complete for the audited pools, while playable audio gates remain open. Starter correctly remains blocked pending its ten configured whole-word clips; pure-sound/blend hints still need their required recordings. Challenge’s separate artwork readiness gate remains outside this Growing-focused report.

## Reproducibility

The checked-in inventory JSON identifies runtime source `a652ad6cf33b72e3ef3ff523b70cc773bfcbbb18` and binds 13 source files by SHA-256; all 13 hashes matched the working files. The branch HEAD is a later docs-only commit (`952dd4f66a67fc4826c67b1b103d6a2e6f6e8bf0`); a fresh readiness run independently reproduced the same counts and source-file hashes.

Checks run on the frozen snapshot:

- `node --test test/batch5Literacy.test.mjs test/batch5SoundSafariPictureWords.test.mjs` — 16 passed.
- Scoped ESLint for the inventory/readiness scripts and literacy inventory test — passed.
- `node scripts/check-batch5-literacy-readiness.mjs --json` — completed; counts above reproduced.
- Direct read-only assertions covered all 168 pool questions’ prompt, retry and spoken-feedback texts; full-taught `plant`/`raft`/`plank` target IDs and valid options; restricted taught-set target and option exclusion; and all 81 Challenge word-hint text entries.

This is source and test evidence only. It is not a new visual review, gameplay matrix, served-candidate check, audio decode, playback test or human listening verdict.
