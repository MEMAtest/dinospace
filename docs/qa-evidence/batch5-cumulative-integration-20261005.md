# Batch 5 cumulative source integration

Date: 2026-10-05

## Source lineage and scope

- Canonical base: released runtime `1accc99e89be303678ead99def6a3095ab1cb886`.
- Batch 5 owned source: frozen implementation `c636516afa9ffa1b77dcc3bd5b7353ee80bce567`.
- Integrated source commit: `10e4cd53d7f0e987a8a1086fd834b5033de55387`.
- The 192 imported owned files (four Amari components, helpers, tests, scripts, and 165 Sound Safari images) were byte-compared against the frozen Batch 5 source commit; all 192 matched.

The change adds the Amari-owned versions of Sound Safari, Spelling Studio, Colour Mixing Lab, and Odd One Out, along with their data, progress, picture-art and readiness helpers. Routing selects those components only for Amari. The existing catalog components remain the Askia route; Batch 5 IDs are Amari-owned progression and excluded from the generic challenge tracker. The ownership test now checks those four IDs while preserving Askia's legacy session behavior.

The integration is additive on the released runtime. It does not copy an older App, navigation, shared progress, voice manifest, audio files, or unrelated game components. In particular, `AmariCountTheStars.jsx`, `countTheStarsBatch3.js`, and their tests remain byte-identical to the canonical base. The existing canonical sound preferences, public audio/voice configuration, and released B1–B4 runtime files remain unchanged.

## Verification

- Focused Batch 5 tests plus progression ownership: 36/36 passed.
- Full `npm test`: 264/264 passed.
- Scoped ESLint: passed with no errors; the existing CSS file is reported as ignored by the ESLint configuration.
- Serial production-configured Vite build: passed from the integrated source. Output directory: `dist/`. Vite reported stale Browserslist data and the existing large-chunk advisory; neither failed the build.

## Open acceptance gates

The source-bound Batch 5 narration inventory remains incomplete: 11/862 text clips are locally present, 851 are pending, no pure-phoneme recordings are present (0/37), and none of the 10 required whole-word comparison clips is configured for the game. The two locally present standalone words are not wired into Sound Safari and have not been auditioned. This integration does not establish audio decoding, pronunciation, playback, voice quality, or human listening acceptance.

No browser QA, deployment, release, or overall quality score was performed as part of this source integration. A separate current-candidate UI review and completion of the audio gates remain necessary.
