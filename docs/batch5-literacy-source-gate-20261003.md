# Batch 5 Amari literacy source gate — 2026-10-03

## Implemented

- Sound Safari has three six-question chapters: taught first-sound matching, oral blending, and sound-position identification. It uses finite authored word/task pools, pure phoneme playback, picture choices, replay controls, wrong-answer/hint tracking, held feedback, and explicit Next.
- Spelling Studio has three six-word chapters: supported copy, missing grapheme, and independent tile assembly. Eligible content is filtered against the learner's currently taught graphemes; a chapter stays unavailable below 20 eligible words. Tiles retain separate identities for repeated graphemes.
- Queue seeds are fixed for a run. The recent-ID ledger puts all unseen pool items ahead of previously seen items and resets only when the finite pool has been exhausted. Replays create a new seed.
- Completion and best-star updates happen when the final held answer advances. New stars are awarded only for a new best score. Progress is stored under Amari's child-scoped key; Askia receives an empty progress view and cannot write this ledger.
- Existing tricky-word and caption-writing practice remain separately labelled extras. The old spelling record and writing-sample keys are accessed only in Amari's view; Batch 5 completion does not rewrite those records.
- Packaged narration calls use `premium: false` and exact segment arrays. Pure phonemes have a separate finite asset path inventory and fail closed when missing. Runtime imports only authored pools and small validators; it does not import or construct the narration inventory.

## Source verification

- Full-taught spelling pool sizes: 36, 31, and 34 words.
- Full-taught Sound Safari pool sizes: 30, 31, and 102 questions.
- Finite narration readiness script: 659 distinct clip texts / 21,936 characters. Eleven existing local files account for 177 characters; 648 clips / 21,759 characters are pending. The 37 pure phoneme recordings are all pending.
- `node --test test/batch5Literacy.test.mjs`: 4 focused tests pass, including strict eligibility, deterministic six-round runs, exact answer uniqueness, pool exhaustion before reuse, player separation, progress sanitization, star improvements, and narration inventory joins.
- `npm test`: 186 tests pass. The test suite's existing Vite dependency-scan child emitted “server restarting” and port-in-use diagnostics during teardown, but the test command exited successfully.
- `npm run lint`: passes.
- `node scripts/check-batch5-literacy-readiness.mjs`: read-only inventory check; it does not generate or request audio.

## Remaining gates

This source commit does not contain generated or recorded audio. The 648 packaged narration clips and all 37 pure speech-sound recordings must be produced through the approved native workflow, then checked for file integrity, pronunciation, phoneme purity, natural pacing, and device playback. Human listening and independent child-facing QA remain pending. No build, deployment, or browser QA was performed for this source task; this report does not claim audio or release readiness.
