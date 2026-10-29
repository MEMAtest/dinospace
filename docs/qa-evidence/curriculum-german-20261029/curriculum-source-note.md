# Curriculum Quest source note — 29 October 2026

This is a source implementation note, not compiled, browser, or public acceptance. Pair9 remains the last accepted release until root completes Pair10 verification.

Current component read checked against the canonical absolute checkout on 29 October 2026: `src/components/games/CurriculumQuest.jsx` SHA-256 `38468784ed2e7a2396a86984b537a9a599a021fe03935bd0c25bb9d92ab56e82`. `completeRound` records learning evidence and has no parent reward call; the module/band claim is completion-only through `finishCurriculumPath`. The component passes four scaled callback units; App scales those to one actual point.

## Scope preserved

- The three existing modules (`continents`, `time-detectives`, `nature-lab`), authored rounds, and all three difficulty bands remain in `src/data/curriculumModules.js`.
- Queue selection remains five distinct rounds, seeded answer/question variation, recent-eight avoidance, unseen-first fill, and explicit replay order variation in `src/data/curriculumQueue.js`. The 20 October Africa-repeat closeout remains the required live regression; no authored question pool was reduced.
- Existing exact packaged narration is still the only audio source (`src/data/curriculumVoice.js`, `src/data/offlineVoiceManifest.js`, `public/audio/en`). Existing map/world/lesson illustrations remain the source art (`src/assets/curriculum/README.md`).

## Source changes

- `src/data/curriculumSession.js` now treats only `null` as a fresh key, distinguishes invalid from unavailable storage, validates sessions strictly, preserves unknown record fields, and confirms each write by exact readback. It refuses to replace malformed preferences or sessions and uses `playerStorageKey` for existing Amari/Askia key names.
- `src/data/curriculumBadges.js` keeps the legacy badge-array key. It preserves unknown string entries, rejects malformed arrays, and reports badge writes as saved only after readback.
- `src/data/curriculumProgress.js` keeps the legacy recent-history array format, stores a bounded per-child/module/band pending/applied transaction for idempotent Next, and stores at most nine module/band completion receipts separately. Unknown receipt metadata survives updates. Corrupt transaction/receipt bytes fail closed; receipt tokens must match the exact worldmap module/band claim.
- `src/components/games/CurriculumQuest.jsx` removes per-answer rewards. A new module/band completion stores a pending receipt and badge, then calls the parent with `rewardClaimToken('worldmap', moduleAndBand)`, `4` scaled points, and delay `0`; the receipt becomes confirmed only after the parent reports `persisted: true`. Legacy earned badges do not award points again. The existing locked fact/answer is held on save failure and Retry reuses the stored state/receipt.
- Packaged narration playback is paused and reset immediately when sound is muted; a generation guard stops a pending `play()` resolution from restarting it. An unreadable badge collection shows a read-error and Retry rather than appearing empty, while the last valid in-memory list is retained for that player.
- Learn now names the stage and gives one Start/Continue action; question stages read Try/Review. Geography, history, and nature lesson models state what to explore and how the question step works.

## Focused source checks

`node --test test/curriculumQueue.test.mjs test/curriculumSession.test.mjs test/curriculumBadges.test.mjs test/curriculumProgress.test.mjs test/curriculumModules.test.mjs test/curriculumVoice.test.mjs`: 40 passed, 0 failed, 0 skipped. Scoped ESLint passed for the changed JSX/data/tests. These checks do not prove actual rendering, parent integration, reward persistence in the app, or production behavior.

## Pending release proof

Root still owns compiled and canonical actual-control checks at 390×740 and 1440×844, including the full continents repeat/replay regression across all three bands, reload while question and held fact are open, storage-fault Retry with one history push, completion receipt recovery, zero replay/legacy reward delta, and child/sibling record retention. No source-only result should be described as live acceptance.

## Native phone geometry follow-up

The topic and level controls remain inside the same details panel. Choosing a module or level collapses it; the QA flow reopens it between those choices. Start/Continue also closes it and focuses the question heading even if the panel was already closed. The Learn and question headings use `tabIndex=-1` for programmatic focus. This addresses the observed 390×740 case where an expanded picker pushed the first answer below the viewport. Focused ESLint and 40/40 Curriculum tests pass after this delta. Native geometry remains root's acceptance gate.
