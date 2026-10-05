# Batch 5 recording recovery copy and build evidence

Date: 2026-10-05

## Source delta

- Frozen runtime source commit: `721d6ed4d5092e05f6da2c5f7a469ae837ddb700` (parent freeze: `3e0f4d89753f180d351bb7679f3383047534d5ac`).
- Only `AmariSoundSafari.jsx` and `AmariSpellingStudio.jsx` changed.
- Sound Safari's blocked whole-word recording status now tells the child to use the back arrow to choose another game. The whole-word recording readiness gate and disabled Start/Replay behavior remain in place.
- Sound Safari and Spelling Studio pure-sound recording errors now use child-readable recovery text: “This sound recording is not ready yet. Tap the back arrow to choose another game.”
- Spelling Studio's “Repeated letters use separate tiles” footer now uses white text for legibility on its dark scene background.
- No game logic, progress, question pools, voice text, narration mapping, or audio files changed. No browser or provider calls were made.

## Narration compatibility

Rebuilt the current `scripts/batch5LiteracyNarrationInventory.mjs` result in memory and compared it with the exact c636 source-bound inventory at `docs/qa-evidence/batch5-soundsafari-source-bound-audio-inventory-20261005.json`:

| Check | Result |
|---|---:|
| Unique phrase records | 862; all `text`, `key`, and `path` rows match c636 exactly |
| Runtime speech sequences | 603; count matches c636 |
| Previous Batch 5 baseline | 659 phrases and 332 sequences; counts unchanged |
| Sound Safari group sizes | 10 whole-word texts, 8 prompt/retry texts, 187 feedback texts, 29 Challenge hint texts; all match c636 |

All 12 inventory-producing inputs listed in the c636 JSON (the inventory builder, its data/helper modules, voice-key implementation, manifest, and readiness checker) still match their c636 SHA-256 values exactly. The changed Sound Safari component is an audit-bound source file in that artifact but is not imported by the inventory builder; the Spelling component is not an inventory input. The current builder output's 862 ordered phrase/key/path rows match the c636 records exactly, and the same unchanged builder plus all unchanged sequence-generating inputs produces the same 603 exact sequences.

The two changed component files have new byte hashes because of the UI copy and footer contrast edits. This is a deliberate component-hash delta from c636; the narration inventory remains text-compatible. The prior c636 component hashes and new frozen-source hashes are:

| Component | c636 SHA-256 | Frozen source SHA-256 |
|---|---|---|
| `src/components/games/AmariSoundSafari.jsx` | `bd80ee469e7c8dffc82d5e341387207fd5e6ff19d6e4734916f631f6cd0ab36b` | `15c6d19a737bbe93ea8a40341d83c274494b4c56e4047d84a6b4ad53d93bf278` |
| `src/components/games/AmariSpellingStudio.jsx` | `9e35a64f6dad114ad9e0d805d3f8d932071dd9e88a1e3405c58fa517b5a313fb` | `a775c079e1f16b069aff7f8a030f2b6aac6c9f0dc03ac2f7c99e0005e03ee36f` |

## Verification

- Focused literacy and Sound Safari picture-word tests: 16/16 passed.
- Scoped ESLint for the two changed components: passed.
- Configured production build: `npm run build:android -- --outDir /tmp/dinospace-b5-child-copy-recovery-20261005` passed.
- The existing repository `dist/` was preserved; build output went to a new temporary directory.
- Vite emitted the existing stale Browserslist database and large-chunk warnings; the build completed successfully.

Build identity for `/tmp/dinospace-b5-child-copy-recovery-20261005`:

- 5,959 files; 208,628,714 bytes.
- Deterministic sorted path/SHA-256 tree fingerprint: `46a1d078311a53b691f9a051f099c1c2aceb225c610e2a78787547f6a376bdb4`.
- `index.html`: `865f7b5b5ed369dd830a76ad3bbbe1fb464fed446cef31f0830de05d78e8eec7`.
- Main JS `assets/index-Dq6AXOCR.js`: `5e8a31457d80b18ee39c1cfc624d0f2064bd77b2fd87154f0cfb2fa880e0b19b`.
- Main CSS `assets/index-B3qXgrAo.css`: `935e2f6e7e5d102cbca3b7a914c2217d3bbb64d4a7563abfcdf07967f9e682d2`.

## Lineage note

The existing finite c636 narration ledger remains text-compatible at 862 phrases and 603 sequences. The changed UI components are not byte-identical to c636, as shown by the component hashes above; any later source-bound ledger or successor snapshot must bind the new source commit `721d6ed4d5092e05f6da2c5f7a469ae837ddb700`. This copy repair does not add or remove spoken phrases and does not resolve the existing audio readiness or listening gates.
