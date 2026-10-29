# Dino Jigsaw audit and acceptance

Audit date: 2026-10-29  
Checkout: `dinospace-b7-memory-cumulative-20261006`

## Source audit

- `src/components/little/games/DinoJigsaw.jsx` already uses a real cropped-picture puzzle. Askia starts with 2 pieces; the five saved levels configure 2, 4, 8, mixed 8/12, and 12 pieces. Preserve those level indexes and current `LITTLE_LEVELS.dinojigsaw` data.
- `src/data/littleGames.js` contains six reviewed scene targets (T-rex, Brachiosaurus, Triceratops, Pterodactyl, Stegosaurus, Ankylosaurus). The level configs unlock 4, 4, 4, 5, then 6. Existing tests assert the 2/4/8/12 progression and scene counts. There are five dedicated dinosaur WebP illustrations; Pterodactyl uses the existing `Dino` vector art. All targets share `bg-dino.webp`; scene identity currently comes from the target dinosaur and its prompt rather than unique backgrounds.
- Current piece selection already supports tap-then-tap and pointer drag through `DragItem`; selected pieces receive a border/ring. A wrong slot keeps the piece in the tray and selected for retry, gives a brief slot shake, plays the existing retry line and counts a mistake. Empty-slot buttons already expose row/column labels.
- Current prompt is a generic drag instruction in `LITTLE_LINES.jigsawIntro`, then only names the dinosaur. There is no persistent one-step help or progress-aware instruction. The board keeps a full faint solution image visible at every level, making higher piece counts easier than their nominal grid size suggests.
- Solving currently triggers `complete()` after a 350 ms delay, then the default shell advances after its timed delay. No held explanation/manual Next exists for this game. `LittleGameShell` already supports `manualNext` and a `review` fragment in its held-round panel.
- `LittleGameShell` defaults to non-pair-safe result saving. That path calls `recordLittleResult`; `src/data/littleProgress.js` catches storage errors and returns a success-shaped result, so it cannot provide an honest save failure/Retry. Pair-safe commit and reward retry exist in `pairLittleProgress.js` / `LittleGameShell`, but its accepted game IDs currently omit `dinojigsaw`. Do not claim strict result persistence until root adds that ID to the shared helper; this is the only identified shared-code dependency.
- Existing coverage is mostly `test/littleGames.test.mjs`: it checks five levels, exact grid sizes, enough scenes, and legacy saved level retention. There is no focused Jigsaw interaction/review test. Reuse existing art and the existing pair progress/reward APIs; no new artwork or external asset calls are justified by this audit.

## Acceptance criteria before release

1. Keep the existing five level indexes and verified 2 → 4 → 8 → 12 piece steps; ensure the 8/12 mixed stage and harder top stage are explicit and do not reset child progress or alter the original progress key/schema.
2. Retain six distinct dinosaur targets and current packaged art. Show a purposeful, short instruction for each current picture, a persistent one-step “choose a piece, then choose its matching space” aid, and clear piece/place progress. Make later boards genuinely harder by reducing/removing the full-image guide at the appropriate higher levels while keeping a fair starter guide.
3. Keep selected-piece/tap-then-tap and drag controls keyboard-accessible with clear accessible names and visible selected state. A wrong placement must leave the piece available, announce retry feedback, and keep the explanation/run from advancing.
4. On the last correct placement, hold the completed picture and a concise accurate dinosaur explanation until the child activates a clearly named Next/Finish control; never auto-advance past it.
5. Preserve level/reward history and child scoping. Use a strict save-before-success result path; on storage failure, retain the result and show an honest Retry action without a false progress/reward claim. Retrying the same result must be idempotent. Legacy progress must be carried forward without deleting unrelated fields.
6. Add focused data/behavior tests for level/piece schedules, scene diversity/targets, wrong retry and held completion contracts where pure logic can represent them, save failure/retry/idempotence and legacy-field preservation. Add scoped lint. Root will verify actual controls in the existing browser profile at 390 px and 1440 px and own integration/build/release checks.

## Scope and limitations

This audit is source-based and read-only apart from this acceptance document. It does not claim browser, persistence-failure, screen-reader, or production acceptance. Current common jungle art is retained; unique background scenes are not part of the change unless source inspection proves existing assets are sufficient and no new external artwork is required.
