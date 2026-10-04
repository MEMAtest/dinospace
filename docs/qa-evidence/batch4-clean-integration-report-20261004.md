# Batch 4 clean integration builder report

Date: 2026-10-04

## Candidate

- Worktree: `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-batch4-clean-integration`
- Branch: `codex/amari-batch4-clean-integration-20261004`
- Canonical base: `0d3ef056e569e3ef59763df388f26c3baa7783b8`
- Runtime source commit: `aa81a5602bfa6d941243d916177265a6fae32a38`
- Local immutable build preview: `http://127.0.0.1:5382/`
- Served byte identity: [batch4-clean-integration-identity-20261004.json](./batch4-clean-integration-identity-20261004.json)

## Integration scope

Ported the four reviewed B4 chapter components from `ac3b3ccaf03107749d865f8d79557e872a06c881`; SHA-256 comparisons confirm the four component sources match that commit exactly. Added the four game-owned data/progress modules, finite narration helpers and inventory, child-scoped badge collections, focused tests, Amari-only progression ownership, and exclusion from the generic daily challenge overlay.

The only shared UI glue adds Batch 4 badges to the sticker shelf and restores the Time Detectives module when returning from the related clock lesson. The base already contained the allow-listed navigation history helpers, so `src/navigation.js` and `src/hooks/useHashRouter.js` remain unchanged. Askia's existing answer-count session behavior remains enabled.

The canonical sound preference, shared phonics, B1–B3 routes and assets, B3 audio, and `offlineVoiceManifest.js` were preserved. No worker-produced audio or manifest changes were copied. No provider, image, or voice generation was run.

## Verification

- Focused B4 data/progress and progression ownership tests: 21 passed; clock-navigation coverage also passed in the full suite.
- Full `npm test`: 247 passed, 0 failed. A pre-existing WebSocket test helper logged that port `24678` was already in use; all tests still passed.
- ESLint on all changed runtime/data/tests/inventory files: passed.
- Configured production build (`npm run build:android`): passed. Vite reported the existing large chunk warning and stale Browserslist data; neither failed the build.
- Read-only packaged narration inventory: 5,246 unique phrases; 65 clips are present and 5,181 are pending. File presence is not decode, playback, prosody, or listening acceptance.
- Local loopback preview: all 5,879 files in `dist` were fetched from port 5382 and compared byte-for-byte to the build output; all matched, including all 7 JavaScript/CSS files.
- No production deployment or external provider requests were made.

## Remaining acceptance

This is a builder source/build check. Independent rendered desktop and 390px controls QA is pending, including Time Detectives module restoration and clock-lesson Back/reload. Narration decoding and human listening remain open. The candidate is not a production release or a 4.5 quality acceptance.
