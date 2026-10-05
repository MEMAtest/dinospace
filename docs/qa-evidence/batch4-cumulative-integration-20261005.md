# Batch 4 cumulative source integration

Date: 2026-10-05

## Source lineage

- Canonical base: released runtime `1accc99e89be303678ead99def6a3095ab1cb886`.
- Runtime integration commit: `22e4cc90fb3915b4308a6d40ea693f4843931fbf`.
- Addition, Time Teller, Number Line, B4 badge collections, arithmetic/time data, scripts, and focused tests use the reviewed `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128` source tree.
- Subtraction uses `9c594dd0e49f5a84588787a084a55aefeec4cdc0`, which includes the zero-result tray fix from ancestor `4a9ae1cd4cd1293aafae4c10877d5cb6cf8ae029`.
- Related lesson routing uses `aa1627216907ae1612e1bdbb309764000a995ae6` for `useHashRouter` and its runtime-binding test. This commit carries the existing clock-origin state through navigate, popstate restoration, and Back.
- The App and `CurriculumQuest` route glue follows the B4 integration changes from `aa81a5602bfa6d941243d916177265a6fae32a38`, applied as narrow hunks on the current canonical files.

The integration adds Batch4 badge display, excludes its four Amari chapters from the generic challenge tracker, and assigns their progression to Amari only. Time Teller launched from Curriculum Quest retains the Time Detectives module origin and restores that module on return. Existing Askia sessions remain wrapped as before.

No older App, shared progress adapter, Count implementation, voice manifest, public audio, voice API configuration, or unrelated source was copied. The four Count paths and audio/manifest paths compare unchanged to the canonical base. Within `src/`, `public/`, and `api/`, the candidate adds seven owned support files, updates the four game components, and has four documented glue changes: App, game sessions, Curriculum Quest route initialization, and the hash router. The other 6,022 canonical files in that comparison remain unchanged.

The machine-readable source and build fingerprint is [batch4-cumulative-build-fingerprint-20261005.json](batch4-cumulative-build-fingerprint-20261005.json). It contains per-file SHA-256 comparisons for 17 source-owned files and fingerprints all 5,879 files in `dist`.

## Verification

- Focused Batch4 and ownership tests: 27/27 passed.
- Scoped ESLint: passed without errors.
- Configured production Vite build: passed from the integrated runtime commit; output directory is `dist/`.
- Vite reported stale Browserslist data and a large-chunk advisory. Neither failed the build.

## Open acceptance gates

The existing Batch4 narration corpus remains incomplete. This source integration does not establish audio decode, pronunciation, playback, voice quality, or human listening acceptance. No provider calls, narration worker changes, browser QA, deployment, release, or overall quality score were performed.
