# Batch 5 four-game integration candidate

Date: 2026-10-04  
Branch/source: `codex/amari-batch5-integration-20261004` at `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`, based on clean canonical/B3 integration `0d3ef056e569e3ef59763df388f26c3baa7783b8`.  
Batch 5 game source: `a7790ea9c8611d4152da6e660cb46bd02511ac7a`.  
Candidate: `http://127.0.0.1:5368/`  
Identity: [identity.json](identity.json)

## Integration scope

Added the four current Amari chapters: Colour Mixing Lab, Odd One Out, Sound Safari, and Spelling Studio, with their authored data, progress helpers, styling, phoneme-audio cancellation helper, attempt metrics, focused tests, and read-only narration inventory scripts. The four Amari game components match the reviewed B5 source files byte-for-byte, including the 5367 Spelling copy refinement.

Routing is additive. Existing catalog `component` entries remain the legacy components used by Askia; new `amariComponent` entries are selected only for Amari. The four Amari routes bypass the generic answer-count session wrapper and daily challenge tracker because each chapter flow owns its own start/play/completion states. Their `onPhaseChange`, `cancelNarration`, and current shared sound props remain connected. Existing App, hooks, router, sound preference, learning progress, diagnostics, offline voice manifest, and general assets were not copied from the older Batch 5 checkout. The existing `src/data/literacy.js`, `players.js`, `utils.js`, shared components, and current offline manifest remain the integration-base versions.

No Batch 5 voice assets or manifest mappings were added. This carries the intentionally incomplete packaged corpus forward without calling a provider, editing B4 worker files, or changing media assets.

## Verification

- Focused Batch 5 model/progress/UI/narration tests and Amari ownership regression tests: **24 passed, 0 failed**.
- Existing shared diagnostics and learning-progress tests: **16 passed, 0 failed**.
- Scoped ESLint on the changed runtime and test files passed. This checkout had no `node_modules` link; lint used the existing shared workspace dependencies through a local symlink.
- Configured production Vite build passed. Existing warnings: stale Browserslist data and a chunk above 500 kB.
- Two read-only source readiness inventories report 659 literacy narration phrases (11 present, 648 pending), 37 pure phoneme clips (0 present), and 310 reasoning phrases (23 present, 287 pending). These are file-presence counts, not decoding, playback, or listening evidence.
- Candidate port 5368 was unused before binding Vite Preview to `127.0.0.1`. All 5,879 files in the frozen build returned HTTP 200 and matched their SHA-256 values; index returned 200. See [served asset hashes](served-assets-sha256.txt).

## Independent QA and release boundary

This freeze verifies source integration, focused logic, build, and served bytes. Independent browser QA should exercise Amari's four entries and chapters, Askia's retained legacy paths, current sound preference across reload, B3 routes/collections, progress ownership, and the relevant navigation transitions. It must install provider guards before app navigation. No browser gameplay acceptance, human audio review, deployment, production check, or 4.5 score is claimed here.
