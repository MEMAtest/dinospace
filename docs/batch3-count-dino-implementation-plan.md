# Batch 3 source audit and implementation plan: Count the Stars + Dino Detective

Status: source-level plan only. No runtime code changed and no 4.5 score is claimed. The roadmap contract is [game-quality-4.5-roadmap.md](game-quality-4.5-roadmap.md), especially the age-6+, stable-run, randomisation, progression, feedback, navigation, events and evidence requirements.

## Existing wiring and limits

### Count the Stars

- `src/components/games/CountTheStars.jsx` serves both age groups. Amari uses the component through `GameSession`; Askia uses the same component with `littleMode` and an `ASKIA_SESSION_LEVELS.counting` session level.
- App currently wraps counting in `GameSession` (`src/App.jsx` / `src/data/gameSessions.js`). Amari's shared session target is eight correct answers. Askia's `ASKIA_SESSION_LEVELS.counting` currently sets session targets of 4/5/5, with display maxima of 3/5/7. The component separately chooses `COUNT_LEVELS`, changes its internal level after a five-answer streak, and schedules the next round after 1.1 seconds. This means the current Amari content can change band during a session, the round order is not frozen at Start, and the generic wrapper owns the result screen while the component owns an independent endless loop.
- The current generated board places one emoji type on a loose grid with a small coordinate jitter. At higher counts, 56px minimum hit targets and large emoji sit close together; overlap/tappability is not data-validated. The answer options are shuffled, but neither questions nor options are seeded. Correct feedback is transient, there is no held explanation/Next step, no explicit three-band unlock/replay state, and no constellation collection.
- Current Amari range tops out at 15 (`COUNT_LEVELS`); the roadmap requires bands for 1–5, 1–10 and 1–20. Askia has intentionally smaller `[3, 5, 7]` display maxima and three age-3 session levels with targets `[4, 5, 5]` in `src/data/sessionLevels.js`; keep those exact bounds and current simple tap-count-answer behavior.

### Dino Detective

- `src/components/games/DinoDetective.jsx` uses the 12 existing `DINO_LEVELS` in `src/data/index.js`; each level has a name, generic hint, and five to seven dinosaurs. It currently reveals every creature when its fixed scene position is clicked. Positions are static, all starts are immediately available in the selector, the same `dino-park.jpg` is used for every world, and there are no distinct per-world facts, ambient details, persistent world rewards, or seeded mission queue.
- The component calls `level_completed` when every fixed dinosaur has been found, then runs its own next-level/replay flow. In Amari mode App also places it inside `GameSession`, whose rule completes after that same event. This duplicates progression ownership and can put the shared session result over the game's world-completion flow.
- On narrow screens, fixed x/y placements and the variable five-to-seven target count need collision/edge validation. The hidden foliage controls are visual but have no specific accessible names. Existing controls do not provide a progressive clue system or an explicit, durable reveal fact before continuing.
- Askia's dinosaur game is a different implementation: `src/components/little/games/LittleDinoDetective.jsx` uses `LittleGameShell`, a three-spot footprint hunt, Askia art, and its own age-3 `LITTLE_LEVELS.dino` progression. Preserve this path, shell, level data, controls, and save key.

## Proposed ownership and boundaries

| Area | Proposed files | Responsibility |
|---|---|---|
| Amari Count data and generators | `src/data/countTheStarsBatch3.js` | Episode definitions, 15 illustrated scene motifs, seed helpers, valid target generation, deterministic queue/options/positions, overlap validator. Pure functions only. |
| Amari Count persistence | `src/data/countTheStarsProgress.js` | Versioned, validated per-player unlocked episode, best stars, earned constellation pages, recent 8 round IDs and safe read/write helpers. No Askia keys or `littleProgress` changes. |
| Amari Count play UI | new `src/components/games/AmariCountTheStars.jsx` (or a clearly isolated Amari branch file) | Explicit episode picker/intro, frozen 6-round run, mark-as-counted interaction, durable feedback, constellation/replay results, phase/events. Leave existing `CountTheStars.jsx` Askia branch intact. |
| Dino world data and generation | `src/data/dinoDetectiveBatch3.js` | Twelve world records, unique scene facts, target species, ambient layer token, earned sticker id, band-specific clue pattern, seeded safe layout/search queue and validators. Reuse existing dinosaur names/facts where sound; avoid unverified biology. |
| Amari Dino persistence | `src/data/dinoDetectiveProgress.js` | Versioned, validated per-player world unlocks, best stars, 12 earned world-sticker IDs, last 8 completed world/run IDs. Reject invalid IDs and malformed storage. |
| Amari Dino UI | `src/components/games/DinoDetective.jsx` | World map/picker showing locked/current/completed worlds; one frozen seed per selected world run; 5 finds with durable fact review; explicit next/replay; phase and event reporting. Keep `LittleDinoDetective.jsx` unchanged. |
| Integration (root-owned) | `src/App.jsx`, optionally `src/data/gameSessions.js` | Route age-6 counting and Dino directly to their own progression owners instead of wrapping them in `GameSession`. Keep Askia counting in the existing `GameSession` with its current five-answer rule; keep Askia Dino routed to `LittleDinoDetective` and `LittleGameShell`. Preserve current parent-world callbacks. Integrate sticker collections only after the component/data contracts are reviewed. |
| Focused validation | `test/countTheStarsBatch3.test.mjs`, `test/countTheStarsProgress.test.mjs`, `test/dinoDetectiveBatch3.test.mjs`, `test/dinoDetectiveProgress.test.mjs` | Seed stability/variation, one correct answer, visible count integrity, geometry/collision safety, recent-history rules, data validation, storage isolation and completion-only rewards. |

This separation prevents Amari's new episode flow from silently changing Askia's age-3 design. Do not repurpose `LITTLE_LEVELS`, `littleProgress.js`, `LittleGameShell.jsx`, `ASKIA_SESSION_LEVELS`, or the `askia_little_progress` key for Amari content.

## Count the Stars: concrete progression and pool

Build three named, six-round episodes. Each episode contains five distinct supplied-art/emoji scene motifs (15 distinct scenes total). Scene motifs are board themes, while each generated question also has a target count and arrangement; this gives each band enough unique question IDs to support an eight-item cross-run no-repeat window without repeating the same scene-count pair.

| Episode | Target range | Skill/mechanic | Scene motifs |
|---|---:|---|---|
| Star Garden | 1–5 | Touch each object once; the tapped item visibly dims and gets an ordered count badge; then choose the total. | Fireflies, moon berries, comet seeds, tiny planets, rocket lights. |
| Constellation Workshop | 1–10 | Count organized groups; marked groups and a five-frame/ten-frame rail help the child keep place. Include a mix of grouped and scattered layouts. | Star clusters, satellite bolts, moon rocks, observatory windows, meteor trails. |
| Galaxy Survey | 1–20 | Count two visible groups and combine them, or count a larger organized array with optional group-marking. The scene depicts exactly the generated total. | Planet rings, satellite panels, nebula dots, crater gems, constellation maps. |

Use native SVG/DOM vector scenes, existing `game-scenes/time-observatory.webp` as an optional backdrop, the current restrained starfield, and the supplied rocket/astronaut assets where they fit. No paid image or voice calls. Motifs must differ in composition and color enough to read as separate scenes; emoji alone should not be the only visual differentiation.

Pure generator contract:

1. `startRun(playerId, episodeId)` selects one numeric seed, six unique question IDs, and answer-option positions. Save this queue in component state and never regenerate it because of an answer, hint, render or difficulty update.
2. Question IDs are `sceneId:count:layoutVariant`. Keep the last eight finished/started IDs per child and episode out of the next queue while alternatives exist; only relax the window when the validated eligible pool is exhausted, and never repeat within one six-question run.
3. Counts include every object actually rendered, no decorative extra stars inside the count board. Build non-overlapping object centers and 56px+ hit regions in normalized board coordinates; validate all center/size bounds and pairwise spacing before accepting a seed. Fall back to a known-safe grid for any rejected layout.
4. Each counted object visibly changes and exposes its ordinal in accessible text. Replay the spoken count instruction, speak the current count after each tap, and let the child replay the prompt without resetting the run.
5. Wrong number leaves the same scene and selected-count evidence on screen, says a short clue such as “Check the count badges once more,” and logs a hint only when a hint control is explicitly used. Correct answer keeps the explanation/fact and scene visible until Next; do not advance on a timer.
6. Six completed rounds show episode results and a new/re-earned constellation page. First actual episode completion unlocks the next episode; replaying an unlocked episode is explicit. Persist child-scoped episode unlocks, best stars and earned pages only on completion, never on Start or unlock preview.

All numbers/options and scene content must be accessible by tap and keyboard. At 390px, keep the entire board and answer buttons reachable without horizontal page scroll; four numeric choices must remain at least 48×48px and not overlap. Desktop remains centered in a bounded board, with countable objects spaced independently of viewport.

## Dino Detective: concrete world layout

Reuse the existing 12 named worlds as three ordered bands of four (`DINO_LEVELS[0..3]`, `[4..7]`, `[8..11]` as the initial mapping, subject to content review). Each world record gets its own short factual scene card, one target species, ambient layer identifier, visual sticker mark, clue presentation, and search layout. A world run contains five distinct target-find rounds for its featured dinosaur; after each find, the child sees that dinosaur's existing species fact plus the world's unique scene fact before choosing Next. At the end, award that world's sticker and unlock the next world after actual completion.

Progressive hiding pattern by band:

- Starter: five large leaf/rock/puddle hiding spots, a bright short trail and a spoken/replayable clue. The target can be anywhere; the trail ends at it.
- Growing: five differently themed cover spots, a complete footprint trail with two directional turns/ambient movement, still clearly ending at the target. Add no time limit.
- Challenge: five larger but visually similar covers and a shorter/fainter trail plus a usable free hint control. Keep all targets fully tappable, all clue cues perceivable without color alone, and never require pixel precision.

Each run chooses and records one seed before round one. Randomize which safe hiding spot contains the target and its clue/layout pattern deterministically. Across restarts of the same world, do not repeat a complete five-round placement signature from the most recent eight runs when valid alternatives exist. Across worlds, keep each world’s unique fact, featured dinosaur and sticker fixed. A child who taps a wrong cover gets gentle feedback and a clue, but no phase reset; the target becomes visible only after a correct find or explicit hint/reveal.

For art, reuse `dino-park.jpg` as a source layer, supplied Dino character sticker sheets through `DinoSticker`/`DinoIcon`, and the existing dino title characters. Add scene-specific ambient SVG/CSS elements (for example mist, river glints, volcanic glow, moon glow, fern silhouettes) keyed by `ambientId`; do not stretch one static photo and call it twelve different scenes. Keep backgrounds decorative and `pointer-events:none`.

Five hiding controls must fit a 390px viewport as ≥48×48 CSS px button boxes, including their focus ring; the boxes must not overlap each other, the header, clue/replay/hint controls, or the bottom navigation. Use a validated five-slot template with responsive normalized positions and margins, then randomize the target assignment to slots. Five finds are a finite objective and do not mean rendering five overlapping creatures on one board. Use descriptive screen-reader names such as “Look behind the fern, spot 2 of 5,” plus visible numbered footprints/spot markers so position is not conveyed by color alone.

## Shared event/progress contract

Emit `start`, `question`/`scene`, `answer_attempt`, `answer_correct`/`answer_incorrect`, explicit `hint`, `level_complete`, `replay`, and `leave` events. Include only game ID, level/world ID or index, round, seed, answer correctness, hint state and first-attempt status. Never include prompt/fact text or player names in diagnostics. Leave uses the current seeded run metadata; back/cancel must not award rewards or change phase. After a wrong answer, the same round remains active. Correct-answer explanation remains until Next.

The per-player progress helpers should follow the validation and child-isolation conventions in `skyShapesProgress.js`, `monsterMathProgress.js`, and `chapterBadges.js`. A malformed or unavailable localStorage value must fall back to safe defaults without crashing. Collections should show locked/earned entries honestly: no award from selecting an episode, opening an intro, or leaving an unfinished run. Provide a way from the game’s completion/intro screen to see the constellation/world collection; App-owned sticker-shelf wiring requires root integration rather than direct App edits by a game builder.

## Acceptance rehearsal after implementation

### Count the Stars (Amari age 6+)

1. At 1280×800 and 390×844, open from Maths Missions and confirm the parent Back target is Maths Missions. Verify episode lock states and that only Starter can start for a new child.
2. Start with a captured seed. Verify six distinct count scenes/targets and answer positions are stable through wrong answers, prompt replay, explicit hint and ordinary rerenders. Verify no target repeats in the prior-eight window on a fresh run where the pool allows it.
3. For each band, test one wrong answer followed by a correct answer; tap objects in a nonsequential order; confirm each is marked once, answer equals visible object count, wrong guidance retains the same scene, and correct explanation stays until Next.
4. Complete all six rounds in each band; confirm the previous five answers do not auto-change difficulty, completion/reward appears only after Next on the final explanation, the chapter page persists after reload, and next band unlocks only after completion. Replay a completed band and verify progress/reward does not duplicate or erase.
5. Check sound replay/mute, keyboard Enter/Space on countable objects and answers, 48px answer targets, no overlapping/unreachable count objects, asset/console errors and `scrollWidth === innerWidth` at 390px. Export/capture the run seed and round IDs without child/prompt text.

### Dino Detective (Amari age 6+)

1. At 1280×800 and 390×844, open from the correct learning world and verify exact Back destination. New child sees only first world unlocked; reload preserves unlocks and earned stickers per child.
2. Complete five finds in a Starter world: wrong hiding spot, explicit hint, then correct find; verify each of five safely randomized positions is reachable and not overlapped, and each find's target/fact card remains until Next.
3. Complete world one and verify its scene fact, actual-earned sticker, and Growing unlock. Reload, replay world one, and confirm no duplicate sticker award. Select the explicitly unlocked Growing world, complete it, then repeat for Challenge; verify the clue pattern changes by band and remains fair/no timer.
4. Use replay and Back during intro, active search and fact review. Back returns to the right parent and does not award/complete; return, resume by explicitly selecting the same unlocked world and replay from its start with a new recorded seed.
5. For at least eight seeds per band, check unique target placement/order, world stays associated with its own fixed target/fact/sticker, no recent full layout signature repeats when alternatives remain, and all four distinct world records in the band are represented. Check 48px+ search/hint/Next targets, keyboard access, focus visibility, assets/console and zero horizontal overflow at 390px.

### Age-3 regression boundary

Separately open Askia’s Little Explorer Count the Stars and Dino Detective after any implementation. Verify Count still uses the three `ASKIA_SESSION_LEVELS.counting` bands with maxima 3/5/7 and session targets 4/5/5. Verify Askia Dino still uses its `LittleGameShell`, three location choices, footprint prompt and per-child `LITTLE_LEVELS.dino`/`askia_little_progress` state. No Amari 1–20 count scene, twelve-world map, Amari progress key, sticker-unlock policy or six-round wrapper may leak into those flows. This regression is required even though the age-3 games are outside Batch 3 scoring.


Do not mark either game verified 4.5 from data/unit checks alone. Complete the roadmap's three seeded desktop and three mobile runs with actual controls, sound/facts, unlock/replay, reload/profile isolation, assets/console and screenshots before rescoring.
