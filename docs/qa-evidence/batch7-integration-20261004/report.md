# Batch 7 canonical integration builder report — 2026-10-04

## Candidate and lineage

- Canonical base: `0d3ef056e569e3ef59763df388f26c3baa7783b8`.
- Runtime source commit: `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`, branch `codex/amari-batch7-integration-20261004`.
- Ported reviewed B7 game/data source from runtime `b6976948cf61147491e3658a5ce2e249a91bca09`.
- Identity: `identity.json`; immutable local build: `http://127.0.0.1:5372/`.

## Selective integration

- Integrated the Amari Memory Match artwork, themed ten-board data, contextual card labels, strategy narration, best-board passport and seeded runtime. Board IDs and pair counts remain `4, 8, 10, 12, 13, 14, 15, 16, 17, 18`. Askia’s existing rendering and five-level board data remain in the same mode-specific path.
- Integrated the Amari Solar System fact/mission/challenge journey and the per-player Discovery passport. All 9 planets and 54 fact slots remain; B7 updates the existing four-term definitions in place.
- Added the B7 badge collection alongside the existing B3 collection; B7’s collection only renders for Amari. Memory is excluded from the floating daily tracker because the current Memory screen opens directly to an active board and has no separate map phase.
- Preserved the canonical App sound preference, phonics/voice hooks, B3 routing and collections, profile and shared progression adapters, navigation, and voice/story manifests. No shared audio, unrelated gameplay files, Askia data, or canonical preferences were replaced.
- Added the 84 required Memory runtime art files from the reviewed B7 source. Shared canonical illustration files used by the component were already present and unchanged.

## Verification

- Focused Memory, B7 passport, difficulty, Askia, and B3 collection tests: 34/34 passed.
- Full `npm test`: 246/247 passed. The single failure is the existing offline narration gate: 18 app prompts lack packaged clips. No manifest edits, generation, provider requests, or listening claim was made.
- Scoped ESLint over the edited App, Memory/Solar components, data/helpers, and focused tests: no errors. ESLint ignores the CSS file because no CSS rule configuration is supplied.
- `npm run build:android` with the configured voice/story environment: passed. Existing stale Browserslist data and large shared-chunk warnings remain.
- Static preview: all 5,963 files returned HTTP 200 and matched their frozen SHA-256 manifest; zero mismatches.

## Acceptance boundary

This is builder and integration evidence, not independent visible-game acceptance. Agent 4’s source-candidate review is separate; this candidate needs its own bounded check of the canonical App integration at desktop/390px, Memory profile isolation/Askia parity/tracker obstruction, and Solar facts/passport/navigation. Audio remains incomplete; this report does not claim human listening, release approval, production readiness, or a 4.5 score.
