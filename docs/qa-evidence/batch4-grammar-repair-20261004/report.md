# Batch 4 singular agreement repair — 4 October 2026

## Exact candidate

Source `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128` is based on the repaired clean integration `aa1627216907ae1612e1bdbb309764000a995ae6`, which starts from canonical `0d3ef056`. The frozen configured local build is served at `http://127.0.0.1:5384`; all eight JS/CSS/HTML runtime files match their built SHA-256 values in [runtime-identity.json](runtime-identity.json). Original5383 is preserved.

## Concrete defects and changes

Independent source review found Subtraction prompts with “There are 1 apple” and explanations with “1 remain.” Number Line comparison explanations also used “1 spaces.” Root corrected singular agreement in the authored data, exact narration segment helpers and finite inventory producer. Singular now uses “There is 1 apple,” “1 remains” and “1 space”; zero and plural retain their existing forms. The change alters no question IDs, mathematical answers, options, difficulty, chapter progress or reward logic.

The exact ac3b3cc→fe5aeff finite corpus comparison is in [corpus-delta.json](corpus-delta.json): 5,246 phrases before and after, 5,199 identical keys/text/paths, 47 removed from this B4 inventory and 47 corrected additions. These are six starting noun phrases, one remaining-count phrase and 40 A/B one-space landing phrases. No existing audio or manifest entry was deleted or replaced. The unchanged worker must finish its original pinned corpus; the new candidate requires only its 47 corrected recordings afterward, with exact provenance and audio acceptance. Removed B4 phrases are not an instruction to delete globally shared assets.

## Verification

- Eighteen focused arithmetic/narration/time-line tests passed; [tests.txt](tests.txt).
- The new test checks actual finite-corpus singular and plural examples, rejects all three malformed agreement patterns, and verifies exact source/segment joins. Existing tests cover all18,096 arithmetic questions, canonical time questions and exact corpus deduplication/phrase-sized segments.
- Changed-file ESLint and configured `npm run build:android` passed. The pre-existing large-chunk build warning remains.
- Eight served runtime files match the frozen build; unchanged public assets/manifest retain the clean integration baseline.
- No provider request, worker restart or worker/manifest/audio mutation occurred.

## Remaining acceptance

Independent source/corpus review and a bounded rendered copy delta remain pending. Retain full5227 mechanics and5383 shared navigation/collection evidence under their actual identities; this small copy change does not call for replaying every level. Corrected recordings, decode, actual sequence/cancellation, pronunciation/listening and exact production release checks remain open. No 4.5 award or production release is claimed.
