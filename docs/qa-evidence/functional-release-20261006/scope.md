# Functional release slice — 6 October 2026

## Source base and included work

- Fresh source base: production archive commit `22d805b67ced8b36f45d0f5c547bfe67c5dded88`, reverified against Vercel READY/PROMOTED deployment `dpl_5cKFB6U489CLoEPucaY9pDarcHsp` before checkout creation.
- B2/B3: seven completed supplemental narration clips and two Dino fact-line improvements from `aa37a8a8`; retained package and decode evidence in `docs/qa-evidence/b2-b3-cumulative-supplement-20261005/`.
- B4: reviewed Addition, Subtraction, Time Teller and Number Line source/data/routes/tests from `22e4cc90`; 5,199 retained verified narration clips and 47 corrected replacements from `5577cdc5` and `fd5509b7`; on-demand service-worker media caching from `17bec08d`; held Addition group visibility fix matching the one-line delta in `95d0160e`. The service-worker release cache advances to `amari-discovery-v17`, preserving the separate `amari-discovery-media-v1` cache.
- Solar System: included only reviewed Solar component and planet data from the Batch 7 candidate, plus an isolated Solar discovery passport module. The module persists only completed Solar facts and quizzes; Memory Match code and data are excluded. The source includes the reviewed nine-body, 54-fact corpus (eight planets plus Pluto) and the 127-clip Solar package (52 new files; 75 reused canonical files) with exact package evidence under `docs/qa-evidence/b7-solar-audio-package-20261005/`.

## Excluded work

- Spelling Studio's 101 illustrations remain in its separate candidate. Canonical Spelling uses `WordBuilder`, which has no illustration map or image-card hook. The new illustration map is attached to a replacement Amari Spelling component that requires the still-incomplete phoneme and whole-word audio. No B5 runtime/source is routed to children in this release.
- Sound Safari, Batch 6, and Memory Match changes are excluded. Their source/audio or acceptance work remains incomplete.

## Acceptance limits

This package is a targeted functional/source release slice, not a full 4.5 acceptance declaration. No human pronunciation, pacing or clarity listening claim is made. Independent full desktop/390px production Playwright acceptance remains a post-deployment gate. Per-game overall editorial scores and any other open mandatory acceptance checks remain open.

## Build and source identity

See `build-identity.json` after the frozen source build. The immutable deployment and served-file identity must be added by the release owner after deployment; this checkout has not been deployed by this integration task.
