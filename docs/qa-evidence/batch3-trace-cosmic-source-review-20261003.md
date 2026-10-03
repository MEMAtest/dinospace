# Batch 3 source acceptance review: Letter Trace and Cosmic Tic-Tac-Toe

Review date: 2026-10-03  
Owned implementation lineage: `9c40344` (Letter Trace/Cosmic chapters), `d73463b` (Cosmic replay progression). The reviewed game/data/test paths are unchanged at current `6382b07`; App, catalog, session routing and Batch 3 collection wiring are unchanged from `d73463b`. This is a read-only source review, not browser or release acceptance.

## Findings

### Blocker: Letter Trace's lift-mid-stroke retry message does not match its input state

In [AmariLetterTrace.jsx](../../src/components/games/AmariLetterTrace.jsx#L294), `endPointer` reports “Start this stroke again at green N” when the pointer is released before reaching the end, but it leaves `strokeStateRef.cursors[activeIndex]` at the partial cursor. The next `startPointer` uses `stroke[cursor]` as the anchor when that cursor is greater than zero ([line 269](../../src/components/games/AmariLetterTrace.jsx#L269)), so the child resumes at the partial point instead of restarting at the green numbered start. The only explicit `Retry trace` control resets every stroke ([line 491](../../src/components/games/AmariLetterTrace.jsx#L491)); there is no current-stroke retry. This conflicts with the planned lift-mid-stroke and current-stroke retry path. Reset the current stroke cursor/path when a lift interrupts it, or provide a separately labelled resume message/control and a current-stroke replay.

### Teaching gap: “Big and little” does not pair the same letter's cases

The level-1 run builder selects eight unique letters, then alternates requested case by round index ([letterTraceLearning.js](../../src/data/letterTraceLearning.js#L55)). Consequently a capital round and the following lowercase round are different letters. The child can practise both cases over a run, but never compares/traces both forms of the same grapheme in a paired activity, despite the chapter's “Big and little” prompt and the implementation plan's explicit upper/lower pairs. Keep the eight-round run, and add a same-letter visual pairing or a within-round case-match before tracing.

### Cosmic chapter map silently discards the active in-memory board

The parent-world Back path is guarded by App after its play-time threshold: App's active `play` phase installs a leave dialog ([App.jsx](../../src/App.jsx#L132)); the shared `onBack` calls the router's guarded back path ([App.jsx](../../src/App.jsx#L241), [useHashRouter.js](../../src/hooks/useHashRouter.js#L59)). I am **not** classifying that guarded parent navigation as unconfirmed.

The in-game `Chapter map` button is different: it directly calls `setPhase('map')` ([TicTacToe.jsx](../../src/components/games/TicTacToe.jsx#L367)), with no confirm/resume action. Starting that chapter again calls `startMission`, which creates a new seed and reconstructs the first still-incomplete mission ([lines 85–112](../../src/components/games/TicTacToe.jsx#L85)); the previous board/target/run seed live only in component state. Thus a child can leave a lesson through the internal map, lose the active board silently, and return to a newly transformed board. The incomplete mission is not marked solved, so this is not false progress, but it does not preserve the active lesson through a leave/cancel or resume flow. Add a Stay/Leave confirmation or a clear Resume action retaining the same seed and board. This aligns with the plan's active-board preservation through leave-confirmation cancel ([plan](../batch3-trace-tictactoe-implementation-plan.md#L51)) and the requested resume check.

## Checks that passed in the source/helpers

- Level 3 word rounds filter by taught graphemes and `isDecodableWith`; choices contain the target plus two unique distractors. An additional 300-seed sampling per each of eight level-3 targets placed the correct word across all three answer positions (observed counts 87/108/105), confirming the right answer is not fixed in one slot.
- The Letter Trace helper suite verifies deterministic unique eight-letter rounds, per-player mastery/completion, locked progression and size-aware tolerance. The keyboard path exposes an explicit toggle, arrow movement, a visible cursor and Space/Enter stroke controls. It awards chapter completion but withholds handwriting mastery for keyboard, hinted or non-first-try completion.
- The Cosmic pure helpers validate legal moves, terminal stop, deterministic bot choices, three distinct transformed boards per seed and child-scoped completed-mission/badge records. I additionally checked 256 seeds × 3 chapters × 3 mission rounds (2,304 scenarios): every intended win, block or fork target was empty and satisfied its tactic.
- Focused tests only: `node --test test/batch3LetterTrace.test.mjs test/batch3CosmicTactics.test.mjs` passed 12/12. No full suite/build, browser run, provider call or source modification was made.
- App routes the Amari Letter Trace implementation and passes `playerId`, `sessionLevel`, phase and event callbacks. `ownsGameProgression` bypasses the old generic `GameSession` target for these custom flows. Batch 3 collections read the same player-scoped progress stores used by both games; opening the collection is read-only.

## Acceptance boundary

These are source-level findings and helper results only. They do not establish actual pointer/keyboard behavior, 390px geometry, narration playback, visible hint/reward states, console/network health, or production behavior. No 4.5 score or browser acceptance is assigned here. Other dirty paths belonged to concurrent Count/Dino work; none were edited.
