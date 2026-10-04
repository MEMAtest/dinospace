# Batch 4 Amari integration builder report

Date: 2026-10-04  
Source: `codex/amari-batch4-integration-20261004` at `8bb8d4bb5b3a28383fbf3ca4639553e8cb5b2cf2`, based on `23bb5e15d770dfd4ab2123e2585e2f56b8f4bb20`.  
Candidate identity: [identity.json](identity.json)

## Integration scope

Ported the four Batch 4 chapter components Addition Adventure, Subtraction Station, Time Teller, and Number Line Jump from tracked Batch 4 commit `ac3b3ccaf03107749d865f8d79557e872a06c881`. Exact source SHA-256 values are recorded in the identity file. Added the six arithmetic/time progression and narration data modules, `Batch4BadgeCollections`, both read-only narration inventory commands, and the focused arithmetic, time/number-line, collection, narration, ownership, and clock-navigation tests.

Wiring is additive. Amari's four chapter IDs own their completion flow and are excluded from the generic daily-challenge tracker. The stickers shelf now renders Batch 3 and Batch 4 collections. The Time Detectives lesson's Time Teller link enters the `time-detectives` module and preserves that return route in browser history. `CurriculumQuest` accepts the targeted initial module. Askia's ownership remains unchanged.

The existing Batch 3 app behavior remains in place: the `amari-sound-on` preference, route-level narration cancellation, lazy Count the Stars and Letter Trace imports, and Batch 3 badge collections. No `offlineVoiceManifest`, public audio assets, shared voice hook, worker, or provider-generation code was changed. The Batch 4 narration helpers pass `premium: false` and exact phrase segments through the existing voice hook.

## Checks

- Focused Node tests: 25 passed, 0 failed. Command: `node --test test/batch4Arithmetic.test.mjs test/batch4ClockNavigation.test.mjs test/batch4Collections.test.mjs test/batch4Narration.test.mjs test/timeLineAdventure.test.mjs test/batch3ProgressionOwnership.test.mjs`.
- Scoped ESLint over the four chapter components, app/router/collection/data changes, tests, and read-only inventory scripts: passed.
- Configured production build: `npm run build:android` passed. Vite emitted existing Browserslist-age and large-chunk warnings; no compilation errors.
- Local frozen candidate: `http://127.0.0.1:5360/`, bound to IPv4 loopback. All 5,879 generated files were fetched from the frozen server; every response was HTTP 200 and matched the local SHA-256 manifest. No provider URLs were called during these checks.
- Read-only narration readiness: 65 of 5,246 unique phrases have non-empty packaged files; 5,181 are pending. Presence does not prove decode, playback, or listening quality.

## Remaining gates

This is an integration candidate only. Independent browser QA is assigned for the four game entries, related Time Detectives return flow, collections, and Batch 3 sound preference regression. Batch 4 audio packaging, full decode, native playback, and human listening acceptance remain open. Do not treat this candidate as released or fully narration-ready.
