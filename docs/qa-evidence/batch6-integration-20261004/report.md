# Batch 6 canonical integration builder report — 2026-10-04

## Candidate and lineage

- Base: canonical integration checkout `0d3ef056e569e3ef59763df388f26c3baa7783b8`.
- Source: `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff` on `codex/amari-batch6-integration-20261004`.
- Batch 6 owned components/data/tests were copied and byte-compared with reviewed quality source runtime `764b2ff49b6c40c13df928b4449d0a1f68fbe660`.
- Identity: `identity.json`; immutable local build at `http://127.0.0.1:5371/`.

## Integration scope

Integrated Pattern Parade, Dino Hangman, Chess Explorers and Astronaut Academy as Amari chapter flows through the existing catalog IDs. The four wrappers use the owned Amari journeys and keep separate Askia components. `ownsGameProgression` bypasses `GameSession` for the four games only in Amari mode; the existing Askia sessions remain available. The shared daily challenge tracker excludes these four chapter flows. Each game reports map/play/done phases to the existing App leave guard and receives the shared narration cancellation callback.

The integration retained the canonical App, sound preference persistence, B3 routes and collections, learning progress and diagnostics adapters, catalog/world definitions, navigation helpers, existing media assets and voice/story manifests. No provider request, generation, manifest rewrite or child progress mutation was made.

## Verification

- `node --test test/batch6Games.test.mjs test/batch3ProgressionOwnership.test.mjs test/batch3Collections.test.mjs test/countTheStarsProgress.test.mjs test/dinoDetectiveProgress.test.mjs test/littleGames.test.mjs`: 21/21 pass.
- Full `npm test`: 236/236 pass. Vite emitted a dependency-scan restart warning and shared test workers reported port `24678` already in use; neither affected test results. The warning is retained as harness noise, not treated as product behavior.
- Scoped ESLint over the integrated App, B6 components/data and relevant progression tests: pass.
- `npm run build:android` with all three configured environment variables: pass. Build printed the existing stale `caniuse-lite` notice and large shared-chunk warning.
- Local static preview: 5,879/5,879 files returned HTTP 200 and matched the frozen SHA-256 manifest; zero mismatches.

## Known gates

The reviewed source-level Batch 6 narration inventory is still incomplete: 378 phrases, 1 packaged phrase ready and 377 missing. This candidate does not claim complete audio, human listening, independent desktop/mobile UI acceptance, release approval or production readiness. Independent UI review should exercise all four Amari chapter entries and confirm Askia routing/session behavior plus B3 sound preference and badge/navigation regression.
