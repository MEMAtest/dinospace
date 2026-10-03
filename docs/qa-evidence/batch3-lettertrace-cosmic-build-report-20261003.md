# Batch 3 Letter Trace and Cosmic Tic-Tac-Toe implementation report

Date: 2026-10-03
Branch: `codex/amari-batch3-quality-20261003`
Base: `974cf18`
Scope: implementation and pure-helper checks for Amari Letter Trace and Cosmic Tic-Tac-Toe. This is not independent UI acceptance or a 4.5 certification.

## Delivered

- `src/components/games/AmariLetterTrace.jsx` adds three age-appropriate chapters: uppercase stroke practice, alternating uppercase/lowercase practice, and lowercase tracing followed by a taught, decodable word choice. Each chapter has eight unique seeded rounds, ordered stroke guides, scaled pointer tolerance, a keyboard practice route, retry/hint controls, and a held explanation before Next.
- `src/data/letterTraceLearning.js` provides deterministic chapter generation, decodable word selection, seeded and varied answer choices, stroke geometry helpers, and per-player completion/mastery persistence. Challenge requests lowercase explicitly. Saved progress is sanitized: unlocks derive from contiguous completed chapters, and invalid, future-locked, or untaught mastery/completion writes are rejected. Keyboard or hinted practice never records handwriting mastery.
- `src/components/games/TicTacToe.jsx` adds three tactic chapters (win, block, fork) and free play against a second player or seeded bot. Tactic answers remain hidden until hint; a wrong move leaves the puzzle available for retry. Completed unique mission IDs, not repeated attempts, earn chapter progress and badges. Bot and board transitions stop after a terminal result; restart replaces the active board.
- `src/data/cosmicTactics.js` provides winning-line, legal-move, win/block/fork, seeded scenario, seeded bot, and per-player progress helpers. It rejects occupied and post-terminal moves; mission completion IDs are bounded and deduplicated, and chapter unlocks/badges derive from completed missions.
- `src/components/games/LetterTrace.jsx` only exports the existing stroke-guide helper for reuse; Askia’s existing tracing behavior remains in that component.
- `test/batch3LetterTrace.test.mjs` and `test/batch3CosmicTactics.test.mjs` cover meaningful deterministic, decodability, geometry, malformed progress, tactic solvability/diversity, legal move, terminal-stop, bot, and completion behavior.

## Integration contract

`AmariLetterTrace` and the updated `TicTacToe` component accept `playerId`, `onPhaseChange`, and `onGameEvent` integration props. Phases are `map`, `intro`, `play`, and `complete`; event callbacks identify the game and emit start, question, hint, attempt, completion, and replay events. One newly earned trace mastery or chapter badge and one newly completed TTT mission or badge each call `onCelebrate` with four points, matching the parent integration’s `/4` scale. TTT emits `tactic_completed` when a mission is solved and emits `round_completed` once for that solved mission or once for a terminal free-play board.

Progress APIs for the parent shelf are `getLetterTraceProgress(playerId, storage)`, `getLetterTraceShelfBadgeIds(playerId, storage)`, and `getCosmicProgress(playerId, storage)`. The corresponding write helpers are `recordLetterTraceMastery`, `completeLetterTraceLevel` (requires eight completed rounds), and `completeCosmicTactic`. Storage keys are `amari_letter_trace_progress_v1` and `amari_cosmic_tactics_v1`.

Both components expose finite fixed narration inventories (`AMARI_TRACE_NARRATION`, `COSMIC_TACTIC_NARRATION`) and request packaged-only speech with `premium:false`. No browser speech or provider fallback was added. Missing packaged clips remain an audio packaging/acceptance question; this report makes no listening or production-audio claim.

## Checks and limits

- Focused command: `node --test test/batch3LetterTrace.test.mjs test/batch3CosmicTactics.test.mjs` — 10 passed, 0 failed.
- Focused ESLint over the seven owned source/test files — passed.
- A full Vite build was attempted while other builders were writing to the shared checkout; the PWA post-build step failed because `dist/assets` was absent during that concurrent build. This is not counted as a successful build and no repeat build was run to avoid contention. Root will run the full sequential gates after builders stop.
- No browser gameplay, mobile/desktop layout, screen-reader, physical handwriting, packaged narration playback, human listening, final source identity, or production deployment acceptance was performed here. A fresh independent tester should verify the integrated route and persistence on desktop and mobile after root’s integration and full build gates.

## Follow-up review fixes

This follow-up review fixed the chapter replay path: the component now keeps a run-specific ordered list and step counter, keeps one seed for the run, and continues to the next run board even when saved unique-mission progress was already complete. A partial chapter resumes only its missing mission IDs; an all-complete chapter selection starts a full replay. The pure helpers `getCosmicRunMissionIds` and `getNextCosmicRunStep` cover these cases, including three distinct transformed boards under one seed. `getCosmicProgress` now discards future-chapter missions/badges when earlier chapters are incomplete.

The finite narration inventories are now exported from their pure data modules (`letterTraceLearning.js` and `cosmicTactics.js`) for Node-side packaging inspection; the components import/re-export them. Diagnostic `firstAttempt` now tracks incorrect responses independently from hints: hint counts are recorded separately, while trace handwriting mastery still requires unassisted first-try pointer tracing. Prior follow-up focused checks passed 12/12; the latest stroke-state regression is included in the updated focused suite. Focused ESLint and `git diff --check` pass. Full suite/build and independent UI acceptance remain root-owned gates.

The next focused follow-up fixes two interaction paths. If a pointer stroke ends or is canceled before reaching its endpoint, only that unfinished stroke's cursor/path is cleared; completed strokes remain intact and the prompt directs the learner back to the current numbered start. The `resetUnfinishedTraceStroke` helper has focused coverage for preserving neighboring strokes and counters. Cosmic board/map navigation now asks `Keep playing` or `Leave board`; keeping the board does not change board state, and leaving only changes phase without awarding a result.
