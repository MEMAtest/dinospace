# Batch 3 implementation plan: Letter Trace and Cosmic Tic-Tac-Toe

Status: source audit and design only. No runtime code, content, or routing has been changed.

## Contract and current wiring

The shared 4.5 bar in [game-quality-4.5-roadmap.md](game-quality-4.5-roadmap.md) requires three purposefully different bands, seeded/restart-safe sessions, useful spoken and visual feedback, persistent rewards, keyboard and touch alternatives, and actual desktop plus 390px checks. These games currently run through `GameSession` from the main game catalog. The `GameSession` wrapper already persists level index/unlocks per `playerId`, tracks correct answers/first tries, and awards stars. Letter Launch is the only existing chapter badge collection; Letter Trace has no badge metadata of its own. The wrapper’s current levels for `trace` target 3/4/4 correct answers; `tictactoe` has only two levels, Rookie bot and Space Ace bot, each targeting three completed rounds.

Amari is the standard age-six profile. Askia is the age-three-to-five “little” profile (`isLittleExplorer`), forced to Starter difficulty. Askia’s home only lists game IDs in `LITTLE_EXPLORER_GAME_IDS`; neither `trace` nor `tictactoe` is there today. Both games are in Amari worlds and use the common components. `GameSession` supplies `sessionLevel`, `onGameEvent`, and a difficulty context, but the two components currently do not consume a finite per-level content plan or a run seed. If product wants either title exposed to Askia, the integration should be deliberate rather than inheriting Amari’s text, tracing precision, or competitive bot unchanged.

## Source findings

### Letter Trace

`src/components/games/LetterTrace.jsx` contains normalized uppercase and lowercase SVG-like stroke point definitions drawn on a canvas. The canvas accepts pointer input, checks stroke order and route proximity, accepts dots such as i/j with a tap, tracks on/off-guide distance, and provides generic off-path retry feedback. It has start dots, numbered stroke order, arrows, progress, erase, uppercase/lowercase switching, letter selection, and `Next letter`.

The source currently has several quality gaps to address in the build:

- The whole trace canvas is one large pointer surface, but the start marker acceptance radius is 56 canvas pixels, route tolerance is 52, and scoring changes from ratio 1.35 to 2 based on difficulty. Those raw pixel values need device-scale tests and should become a documented, scale-aware tolerance rather than silently getting tighter on smaller devices.
- There is no guided stroke-order animation or dedicated “show me the first stroke”/retry clue. Start and direction are static. Wrong starts and missed routes get a generic line; the trace does not surface a forgiving first attempt and a more precise later band as a visible learning progression.
- The component has a manual all-letter selector and free next-letter cycle. It has no seeded eight-letter session, no round/question event metadata, no level-complete event payload or persisted per-letter mastery. It emits `answer_correct` after a manual Check trace, so shared progression can finish while the component remains in its free-pick UI.
- The current tutorial text assumes two strokes (“lift for green 2”) even on one-stroke letters, and trace area height is driven by a flex child rather than a validated minimum on short/mobile viewports.
- Existing `TRACE_LETTERS` covers A–Z, upper/lowercase, word, emoji. `BLEND_WORDS` has ten simple CVC examples. The taught-grapheme filter exists but Letter Trace’s target word uses the broad alphabet list; do not imply an untaught CVC extension is decodable.

### Cosmic Tic-Tac-Toe

`src/components/games/TicTacToe.jsx` already has a responsive 3×3 button grid, keyboard-focusable squares, solo and two-player modes, simple and stronger bots, a tactical immediate-win/block selector, hints for an immediate win/block/fallback, score tally, reset/restart, win-line highlighting, and spoken result. Every square is a button with a positional accessible name.

The current game is unseeded free play. Its Rookie bot sometimes chooses a random legal square before checking either player’s immediate win; Space Ace takes an immediate win or block, then center/corner heuristics. It does not detect fork threats, explain why a bot move was made, expose a mission/tutorial objective, persist best result, or produce level-specific completion. Session wrapper offers only Rookie/Space Ace levels; mode/difficulty controls and the “How to win” panel are always available even during a round. The bot uses `Math.random()`, and no start/question/replay/leave diagnostics carry run seed/round. Keep two-player play as a clear free-play option, separate from tutorial progression.

## Proposed product structure

### Letter Trace: three eight-letter chapters

Use one immutable seeded queue of eight unique letters per run, drawn from a level’s eligible pool. Each letter contributes one completed round; hint/retry does not advance it, and changing bands/replaying starts a new seed/queue without changing the current run. Keep current trace state and queue stable for the full run. Avoid recently completed letters across restarts until the available pool is exhausted; profile-specific progress can influence only the next run.

| Band | Chapter | Pool and mechanic | Feedback and success |
|---|---|---|---|
| 1 | Follow the Path | Eight simple uppercase forms from the taught grapheme set; broad touch-safe route, animated start pulse and one stroke at a time. | First miss highlights the current numbered start and plays a short direction preview; gentle retry, then confirm the shape and word. |
| 2 | Big and Little | Eight letters, upper/lower pairs taught together; child chooses or matches the requested case, then traces. More multi-stroke forms and a modestly narrower band. | Explicit “lift, then start at 2” guidance; retry can replay only the current stroke; praise orderly stroke sequence rather than pixel-perfectness. |
| 3 | Trace and Read | Eight eligible lowercase letters paired with familiar decodable CVC word extension; trace, then build/select the word from taught sounds. Only include words whose constituent graphemes are marked taught. | Keep the illustrated word clue visible, explain sound/letter match, and retry word assembly without discarding the completed trace. |

Do not select “easy letters” by visual intuition alone. Define the pools in a new pure-data module and validate membership against `TRACE_LETTERS` and taught graphemes. Start with a conservative shared pool, then expand where multi-stroke order, dots, and ascenders have reliable guides. Store per-player earned letter badge/mastery through a new versioned helper; do not overload `chapterBadges.js` or treat a route-completion reward as mastery for every letter. A chapter badge is awarded only on actual level completion, consistent with Letter Launch.

Touch/mouse should use Pointer Events with `touch-action:none` limited to the canvas. Add an accessible keyboard mode: focus the trace board, choose start/advance/reset with documented keys, and move a visible cursor along the current guide using arrows/space; provide the same shape feedback and avoid relying on pointer-only Check. Keep all buttons at least 48px. Make tolerance scale with the rendered canvas, but cap minimum/maximum CSS hit radii; record an understandable accuracy band, never reject a child for small device-coordinate differences. Show precise scoring separately from completion so progress never appears short of 100% on a successful trace.

Askia variant, only if surfaced: use short pre-writing routes (vertical/horizontal/curved path, then a large guided circle) with a single pulsing start and minimal words. Do not expose upper/lowercase sorting or CVC blending as a required age-three task. Use image/voice-led choices and retain a generous, forgiving completion envelope.

### Cosmic Tic-Tac-Toe: three tactic missions plus free play

Create three named chapters with three completed boards each (nine total per full progression, minimum comparable to the current shared three-answer level objective). The tutorial objective is part of each board and remains visible until its action occurs; a draw/loss teaches and offers retry without falsely completing a tactic. Seed board setup and bot choices per run, shuffle only among equally valid moves, and preserve the active board through hint, wrong/invalid taps, and leave-confirmation cancel. The bot must only take empty cells, never play after terminal state, and never erase/change a mark. On the easiest band, constrain scripted openings so the child has an attainable target; do not claim an unavoidable win if the user can choose a losing move.

| Band | Chapter/rival | Skill objective | Bot and explanation |
|---|---|---|---|
| 1 | Make a Line — Comet | Find a winning square when two friendly marks are already aligned; practice line directions and turns. | Gentle seeded legal moves, short delay, no stealing the obvious tutorial finish. Explain why the chosen square completes three. |
| 2 | Block the Rocket — Nova | Spot and block an opponent’s two-in-a-row, then finish a board. | Immediate win/block priorities; when a bot blocks, explain the threat in child language. Keep a retry board for the lesson. |
| 3 | Find a Fork — Meteor | Create two possible winning lines, and notice/prevent an opponent’s fork. | Search legal moves for fork creation/prevention before positional preference; do not use perfect play against the child. Narrate the tactic with a highlighted pair of candidate lines. |

Each run starts from a seed and a fixed three-board objective queue for that chapter. A shared pure helper should enumerate legal moves, terminal outcomes, immediate wins/blocks, fork moves, and deterministic seeded tie-breaks; include exhaustive reachable-state tests for legal placement and terminal stops. Persist only chapter unlock/best stars and mission badges per profile, not a child-facing loss streak. Replaying or changing rival starts a new seeded queue and preserves unlocked chapter state. Keep two-player mode under “Free play”; it should not accidentally award a tactic mission badge unless a valid curriculum objective was completed.

Askia variant, if surfaced: offer a short picture-first turn-taking match with optional adult/two-player handoff and a cooperative “help Dino make a row” objective. Avoid the competitive Fork chapter and dense bot commentary; use one-step light coaching and no reading required. Make the board and all square labels available to screen readers/keyboard. Use 72px+ cells where viewport allows and preserve at least 48px hit targets at 390px.

## File ownership and integration boundary

Proposed implementation ownership:

- Game builders: `src/components/games/LetterTrace.jsx`, `src/components/games/TicTacToe.jsx`.
- New pure modules: `src/data/letterTraceLearning.js` (eligible pools, seeded queue, mastery-safe helpers) and `src/data/cosmicTactics.js` (scenario/run queue, legal/tactical move functions, seeded tie-break). Keep UI wording and choices as fixed local content; no provider calls.
- Focused tests: `test/batch3LetterTrace.test.mjs` and `test/batch3CosmicTactics.test.mjs`; later add actual browser evidence in a separate QA document.
- Integration required from root/release integrator: `src/data/sessionLevels.js` (three bands and meaningful targets), `src/data/gameSessions.js` (trace/tictactoe progression event contract), `src/data/chapterBadges.js` (badge registration), `src/data/learningWorlds.js` (optional Askia availability decision), `src/gameCatalog.jsx` (only if new entry metadata/art is needed), `src/App.jsx` only if Askia game routing needs a special component/prop. Keep shared `GameSession.jsx`, hooks, diagnostics, and global CSS out of builder scope unless root explicitly assigns integration; use its existing `onGameEvent`, `onReviewComplete`, `sessionLevel`, and seeded event interfaces where possible.

Require an explicit root decision before adding either game to `LITTLE_EXPLORER_GAME_IDS`; present age-appropriate variants as a product option rather than silently placing age-six material in Askia’s daily home. If Askia remains out of scope, test that both common components still receive `littleMode` and forced Starter safely wherever the game can be launched, and avoid deceptive age labels.

## Acceptance scenarios for later independent browser QA

### Letter Trace

- Amari: start each band; record seed and eight-letter queue; verify queue is unique and stable even after hints/wrong attempts; complete a level, restart/replay, change level, reload, and switch player. Confirm badges/mastery persist only under the matching player.
- Trace capital A, lowercase a, one-stroke L, dotted i, multi-stroke E and a curve such as S using actual mouse and touch drags. Start one stroke in the wrong place, reverse direction, lift mid-stroke, use the clue, retry, and finish. Validate tolerance at desktop and 390px; check no marker/target is obscured and correct trace reaches 100%.
- Test keyboard-only focus/traversal and alternate trace controls without pointer input; screen reader names should expose letter, requested case, stroke number/direction, progress and retry guidance. Check reduced-motion behavior for guide pulse/animation.
- Band 3: ensure each displayed word is decodable from the documented taught set, target letter/word/emoji match, distractors are unique, and the word explanation remains until Next.
- Askia, if enabled: complete pre-writing shape route with one-finger touch and keyboard alternative; verify no forced reading or narrow tolerance. Confirm the full CVC/letter-selection route is not surfaced as age-three content.

### Cosmic Tic-Tac-Toe

- Amari desktop and 390px: finish Make a Line, Block the Rocket, and Find a Fork using the real board squares; verify each tutorial objective is distinct, the explanation is accurate, and completion/badges unlock one step at a time.
- Exercise immediate win, mandatory block, fork creation, fork prevention, draw, loss, occupied-square tap, multiple equally-good bot choices, and reset while bot is thinking. Every bot move must be legal and seeded; no move follows a win/draw.
- Try Show hint before a key tactic, wrong/non-actionable square, replay, next mission, leave and cancel, back to world, and reload under the same player. Confirm no active board is silently turned into completion; verify another profile has separate unlock/best-star state.
- Verify keyboard-only board navigation, visible focus, row/column/square accessible names, 48px+ square controls, no overflow or clipped hint/mission objective at 390px, sound replay, and reduced-motion mode.
- Askia, if enabled: use picture-led cooperative mission, turn handoff and optional adult mode at 390px; verify no competition-heavy tactical language or reading dependency.

For each title, independent QA should capture start, wrong/retry or hint, correct tactical/trace feedback, reward/unlock, replay and leave-cancel states at desktop and 390px, plus console/network checks. Do not call either title 4.5 from unit tests or this design doc alone.

## Visual assets available

Current tracing is code-native canvas drawing; it does not need a generated image. Reuse its guide geometry and CSS, adding a concise rendered animation/highlight rather than rasterized letters. Current Cosmic Tic-Tac-Toe is also code-native: CSS starfield, gradient UI and Dino/Rocket emoji marks with Lucide icons. Reuse this system and add clear board-state highlights. Available local character material includes `src/assets/landing/amari-astronaut-robot.png`, `src/assets/little/askia-detective.webp`, `src/assets/dino-character-stickers.png`, `src/assets/more-dino-character-stickers-transparent.png`, and little Rocket/Dino art already in `src/components/little/VehicleArt.jsx` and `DinoArt.jsx`. These are suitable for chapter headers or rewards; do not stretch a full character sheet or use large art in a tap target. No dedicated Tic-Tac-Toe board/tactic illustrations are currently wired, so keep tactic diagrams as accessible SVG/HTML board overlays.
