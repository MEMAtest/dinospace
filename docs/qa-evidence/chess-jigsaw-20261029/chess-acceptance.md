# Chess Explorers full-game acceptance

## Scope and source baseline

Preserve the existing three five-puzzle lesson chapters, “Meet the pieces,” and reward-free 6×6 practice. Add an explicit full chess game against a local computer opponent as the prominent first choice in the existing Chess Explorers menu. Do not wrap Chess in `GameSession` or rewrite the existing lesson progress key.

The lesson source currently uses `src/data/chessAdventure.js` and `src/data/chessProgress.js`. Its 15 authored 6×6 puzzles and simplified move checker explicitly omit alternating turns, castling, en passant, promotion, checkmate, and stalemate. Existing `src/components/games/ChessExplorers.jsx` renders Unicode pieces on square buttons; only `public/art/catalog-v3/game-chess.webp` is dedicated catalogue art. Pair 2’s prior 15-puzzle lesson acceptance remains separate from full-game acceptance.

The existing dependency manifest has no chess rules library. Implementation uses the root-installed pinned `chess.js@1.4.0` through a pure adapter; never expand the 6×6 lesson checker into the full-rules engine.

## Implementation boundary

- `ChessExplorers.jsx`: retain lesson behavior and add the menu entry; the full-game screen returns to the same lessons/menu.
- `ChessGame.jsx` and `chessGame.css`: actual 8×8 game, visible selection and legal destination affordances, turn/check/result status, New Game, Undo, Resume, storage Retry, promotion picker, color/difficulty controls.
- `src/data/chessGameRules.js`: thin `chess.js` adapter for strict move replay, legal moves, serialized move records, regenerated FEN, check/terminal status, and safe board labels. No UI or storage.
- `src/data/chessGameAi.js` plus `src/workers/chessAi.worker.js`: deterministic, local, bounded difficulty search. Worker messages contain a bounded legal move history and request id; discard stale responses after leave/new/undo/unmount.
- `src/data/chessGameProgress.js`: strict per-child keys `amari_chess_game_v1` / `askia_chess_game_v1`, distinct from the lesson key; null-only fresh state, safe storage getter, validation, write/readback, stable completion receipts, conservative preservation of unknown valid fields, explicit move/start/undo intents, and fail-closed malformed/read failures.
- `test/chessGameRules.test.mjs`, `test/chessGameAi.test.mjs`, `test/chessGameProgress.test.mjs`, plus focused Chess component assertions where useful. Root owns App/player reward allowlist, worker/precache/version, build, browser and release integration.

## Gameplay and persistence acceptance

1. Start standard chess with either side chosen as the human. Human moves are made by selecting one own piece then a legal destination; keyboard and touch/click work identically. Legal targets and the last move are visible; labels identify square and occupant without relying on color alone. Illegal moves leave the position unchanged with concise feedback. The interface reports side to move, check, thinking, checkmate, stalemate, and draw states accurately.
2. Full orthodox rules: all six pieces, alternating turns, path blockers, capture, king safety, check evasion, castling rights and attacked transit squares, en-passant only on the immediately following turn, and promotion to queen/rook/bishop/knight. Checkmate and stalemate are distinct. Also handle threefold repetition, fifty-move, and insufficient-material draws via the rules library.
3. Computer difficulty is offline and bounded. Each level uses a documented search/node ceiling and seeded tie-breaking; the worker returns a legal move or a safe legal fallback before timeout. A canceled/stale request never changes the current board.
4. Save the complete move list and settings after each committed move. Do not trust saved FEN as authority: reconstruct from the standard start by replaying every validated move through `chess.js`, then require stored FEN/result (if present) to match the regenerated state. Reject malformed histories without overwriting them. Resume survives reload and maintains castling/en-passant/repetition history.
5. New Game confirms before discarding an unfinished match. Undo removes one human move and its computer reply, persists the resulting valid history, and never increments rewards. Leaving/unmounting cancels AI work; abandoning an unfinished match gives no completion reward.
6. Keep a terminal board and stable receipt through local-save or parent-reward failure. Retry commits the same local result then claims the same `chess:<receiptId>` token; Back/reopen quietly reconciles an unconfirmed positive receipt. Root adds the chess token allowlist. Award only the first completed game at each difficulty (one actual point per difficulty), independent of win/draw/loss, with no reward for later rematches, undo, New Game, or resume. Existing chapter badge rewards remain unchanged.
7. Per-child full-game data is isolated. Tests and browser checks snapshot lesson progress, both players’ records, sibling game records, and reward claims; only the active child’s new chess-game key and its legitimate reward record may change.
8. Board plus controls fit at 390×740 and 1440×844. Each square is at least 44×44 px at the phone viewport; controls and board cells have full visible bounds and working center hit targets. Keyboard focus stays visible, board updates are announced, and no color-only distinction conveys legal/check state.
9. Reuse exact packaged audio only if its full-game line is present in `getOfflineVoiceClip`; otherwise provide written status and instructions without device/provider fallback or new recordings.

## Required verification

Pure behavior tests cover legal and illegal moves for every piece, self-check and pinned-piece rejection, castling allowed/blocked/through-check/rights-lost cases, en-passant timing, all promotions, known checkmate and stalemate positions, each draw case, strict move-list reconstruction, AI legality and budget/cancellation, read/write/readback failures, unknown metadata preservation, stable receipt retry/reopen, no reward farming, and player isolation.

Compiled and canonical actual-control QA must play complete legal games from the standard starting position at 390×740 and 1440×844, cover both human colors and all computer difficulties, make an illegal move and recover, then exercise undo, confirmed new game, saved resume after reload, storage Retry and parent reward Retry. It should verify exact parent return, audio cancellation if any audio is used, zero provider calls, zero runtime/network errors, and protected-record hashes. Rule-module behavior tests own castling/en-passant/promotion/draw fixtures; browser tests should exercise special UI paths when reached naturally and must not inject hidden board positions to force a rare terminal. Keep fixture correctness separate from evidence that a full match was played. This document records requirements only; source, focused tests, compiled UI, and canonical acceptance are separate gates.
