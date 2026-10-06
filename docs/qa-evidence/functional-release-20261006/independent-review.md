# Independent functional release review — 6 October 2026

## Reviewed source and result

- Frozen candidate: `ff2b38db634ddf84f4beffbe899bfadd0c689f94` on `codex/amari-completed-functional-release-20261006`, based on production archive `22d805b67ced8b36f45d0f5c547bfe67c5dded88`.
- Independent local result: no source, package, focused-test, or configured-build blocker found for the authorized functional release slice.
- This review covers the B2/B3 seven-clip and two-fact supplement, B4 arithmetic/time/number-line work and on-demand media behavior, and Solar System source/audio package.

## Checks performed independently

- `node --test test/solarDiscoveryPassport.test.mjs test/batch4Arithmetic.test.mjs test/batch4Collections.test.mjs test/batch4Narration.test.mjs test/timeLineAdventure.test.mjs test/batch4ClockNavigation.test.mjs test/batch3ProgressionOwnership.test.mjs` — 30 passed, 0 failed.
- `PWA_BUILD_DIR=dist node --test test/offlineServiceWorker.test.mjs` — 7 passed, 0 failed against the configured output.
- `npm run build:android` — succeeded with Vite 7.3.1 and 1,893 transformed modules. The five recorded output-file SHA-256 values match `build-identity.json`; emitted JavaScript contains both configured API URLs.
- Independently recomputed voice keys, manifest paths and source-file SHA-256 values: B2/B3 7/7; B4 5,246/5,246; Solar 127/127. The retained B4 full-decode record reports 5,246 requested, 5,246 valid, zero missing, zero invalid. This verifies identity and packaging, not audible playback or pronunciation.
- Runtime Solar data contains nine worlds and 54 facts. The source diff excludes Memory Match, Sound Safari and Spelling runtime changes; the canonical WordBuilder and the prior Storybook, Memory and game-sound source files are unchanged.
- `git diff --check 22d805b6..HEAD` passed. The source checkout remained clean at the frozen SHA after tests/build.

## Acceptance limits

This is technical acceptance of the scoped functional source/build package. It is not a 4.5 score or editorial acceptance. No human audio listening or new desktop/mobile browser gameplay was performed. Production deployment and served-file verification are separate evidence; after this review, the release owner reported Vercel deployment `dpl_Bw7nedpCSdJYkDBxtzkqE1vT2C6x` READY/PROMOTED for the same source and all 16 served-file hashes matching. The actual Chrome session remains subject to the user's existing-tab designation.
