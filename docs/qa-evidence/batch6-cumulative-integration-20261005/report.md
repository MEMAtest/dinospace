# Batch 6 cumulative source integration

Date: 5 October 2026

Branch: `codex/amari-batch6-cumulative-20261005`

Base: released Batch 5 source `1accc99e89be303678ead99def6a3095ab1cb886`

Batch 6 integration source: `7c350f4bff66c1e9aff922cb5ee98e0fdd1d4ef8`

Reviewed Batch 6 source: `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`

## Source scope

This is a fresh cumulative branch based on `1accc99`, the source SHA bound to the current canonical preflight record. The older `codex/amari-batch6-integration-20261004` branch and its artifacts are preserved unchanged; it is based on the earlier `0d3ef05` tree and is not the base of this candidate.

The candidate imports only Batch 6-owned game files, data, narration collector, and tests from reviewed source `2a82fd8`. All 12 copied files match that reviewed source byte-for-byte. Three narrow shared integration files layer the four Amari chapter flows onto the current base:

- `src/App.jsx` connects the four Amari chapter flows to their existing catalog routes, excludes their maps from the floating daily tracker, and passes the shared narration-cancellation callback through the leave flow.
- `src/data/gameSessions.js` lets the Amari chapter flows own their finite progression while Askia retains the prior wrapper behavior.
- `test/batch3ProgressionOwnership.test.mjs` covers this split and retains the existing Batch 3 and Count progression assertions.

The exact 15-file diff is enumerated in [identity.json](identity.json). Its parent is exactly `1accc99`; the recorded base and integrated Git tree SHAs bind every untouched tracked file to that released source tree. No other tracked source file changed. The released Count files (`AmariCountTheStars.jsx`, `countTheStarsBatch3.js`, and `countTheStarsBatch3.test.mjs`), `api/**`, `public/audio/**`, and `src/data/offlineVoiceManifest.js` are unchanged from the base. Existing game catalog/world entries are reused without edits. No public media or audio was copied from the older integration branch.

## Verification

- Full test suite: 238/238 passed. The parallel test harness emitted a Vite dependency-scan shutdown warning and a WebSocket port `24678`-in-use warning; neither caused a test failure.
- Full `npm run lint`: passed.
- Configured production build `npm run build:android`: passed with `VITE_ELEVENLABS_ENABLED=true`, `VITE_VOICE_API_URL=https://dinospace-eight.vercel.app/api/voice`, and `VITE_STORY_API_URL=https://dinospace-eight.vercel.app/api/story`.
- Build output is frozen by [dist-sha256-manifest.json](dist-sha256-manifest.json): 5,879 files, manifest digest `fcdd380858803bb1bf97d6483136a424e81698b51079152c52a5a148f6558747`.
- Identity in [identity.json](identity.json) binds the source SHA, reviewed-source file comparison, base exclusions and configured build. This is a local source/build freeze only.

The build printed the existing stale `caniuse-lite` notice and large shared-chunk warning. They did not fail the build.

## Retained evidence and gates

The integration reuses Batch 6's retained mechanics and reliability review rather than repeating those matrices: `work/dinospace-batch6-quality/docs/qa-evidence/batch6-full-local-20261003/report.md`, `work/dinospace-batch6-integration/docs/qa-evidence/batch6-integration-browser-20261004/report.md`, `work/dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-followup-20261004/report.md`, and `work/dinospace-batch6-quality/docs/qa-evidence/batch6-reliability-root-20261004/report.md`. Their routes and source checks are prior evidence, not new browser acceptance of this cumulative build.

No browser session was opened for this source task. There were no provider calls, worker starts, audio generation, deployment, or child progress mutation. Narration readiness, native playback, human listening, fresh cumulative UI review and production checks remain open. This freeze does not award a 4.5 score or accept the games for release.
