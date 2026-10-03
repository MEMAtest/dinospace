# Amari games: 4.5/5 quality roadmap

This is the implementation contract for raising all 26 Amari games to a tested 4.5/5. A game earns the target only after its specific checks and the common test gate pass. A route that loads or a successful build does not count as a 4.5 result.

## Shared acceptance bar

- **Age 6+:** one skill at a time, short concrete language, spoken prompt with replay, gentle error guidance, and tap targets at least 48px. Do not reveal the answer before the child can use a hint.
- **Stable run:** choose difficulty, round queue, and question count at Start. Evidence from a correct answer may affect the next run, never restart or reorder the current run.
- **Fair randomisation:** shuffle questions and distractor positions independently; use a seeded per-run queue and avoid the last eight eligible items across restarts where the pool permits. Never repeat within a run before pool exhaustion; after exhaustion reshuffle and avoid an immediate boundary repeat where possible. Validate one defensible answer and balanced answer positions. A taught-concept review scheduled in a later run is an explicit exception, not accidental repetition.
- **Real progression:** at least three named bands, each with 5–8 purposeful rounds or an explicitly named comparable reading, board, or discovery route. A new level must change the skill, content, or play mechanic, not only the number range. Show unlock, replay, and reward state clearly.
- **Useful feedback:** explain why an answer is right; keep an illustrated fact or explanation visible until the child advances. Wrong-answer guidance points to a usable clue without shaming.
- **Navigation:** Back returns to the exact parent world; restart/replay are available; 390px mobile has no clipped controls or unexplained horizontal scroll. Every carousel has an obvious swipe or next/previous cue.
- **Events:** record start, question/scene, answer, hint, level complete, replay, and leave with game, level, and seed. Never log prompt text or child data.
- **Evidence gate:** three seeded desktop and three mobile runs per game, collectively covering every required band and mechanic at both widths. Games with more than three stages need enough additional runs to cover the extra stages. Seeds come from ordinary UI starts and sanitized diagnostic exports; do not inject PRNG, answers, unlocks, or progress. Test correct and wrong answers, hints, audio, level/reward progression, restart, leave/back, and randomized restart uniqueness. Check asset/network errors and console. Capture start, feedback, and completion evidence. Bind production evidence to canonical URL, deployed SHA and rendered asset identity. Local/preview checks remain candidate evidence. Later narrow changes may use a retained full baseline plus explicit regression deltas; explain that lineage rather than counting old runs as new.

## Scoring and evidence provenance — clarified 3 October 2026

An independent editor scores five equally weighted dimensions from 0–5: age-6 teaching; meaningful progression; correctness and fair variation; feedback/audio/visual usability; and reliability/navigation/persistence. Acceptance requires an average of at least 4.5, no dimension below 4, and all mandatory game-specific and shared gates passed. Missing production gameplay evidence means **not accepted**, not an invented numeric score. A reviewer must give reasons and evidence for each dimension.

Keep three separate fields in each batch scorecard: historical review baseline; published editorial acceptance and its tested release lineage; fresh canonical production verification and its scope. The existing Batch 1 verdict below is its recorded acceptance, not a new full retest under these clarifications. Health samples do not re-certify it. The last batch contains two games because the catalog has exactly 26.

## Current acceptance status — 3 October 2026

**Verified 4.5:** Curriculum Quest, Storybook Studio, Letter Launch and German Garage. Independent reasons and exact production evidence are recorded in [batch 1 editor scorecard](batch1-editor-scorecard.md). Current canonical code SHA is `6b84554e7a1d21b3db658d213a2298462c78599e`; the Batch 1 gameplay acceptance evidence is separated between the full `86e3ecf` baseline, `7d9d961` telemetry follow-up and `b6360bb` mobile overlay repair. The later `aeea9e7` release added shared progress/success sounds. Batch 2 initially released at `20ff27d`; `8499e15` fixes duplicate-world Home navigation and limits repeated voice failures. Rotating production health reports do not replace full gameplay acceptance.

**Latest narrow repair:** canonical deployment `dpl_DGLGVkaMikT5GPntS6YThDsesHyx` runs `6b84554e7a1d21b3db658d213a2298462c78599e`. It includes the earlier `9cc4331` reward/model/settings repairs, saves Sky completion before navigation, separates accuracy from newly credited stars, and prevents Puzzle retry timers overwriting successful feedback or picture facts. Clean candidate: 149 tests, lint/build and both independent local repair gates passed. Root verified Vercel identity and exact production-config bundle bytes; independent production Puzzle timing/facts, Spot attempt diagnostics and Sky immediate-save/chapter/replay control deltas passed. See [repair and release lineage](batch2-reward-model-repair-20261003.md). This is not a Batch 2 4.5 acceptance.

**Not yet accepted:** the remaining 22 games below. Their scores remain historical review baselines. **Batch 2 released, acceptance incomplete:** Puzzle Pop, Spot the Difference, Sky Shapes and Monster Math have expanded chapter/episode structures. The earlier 2 October production baseline ran `d31239453edf438b5a88ab788db942f2dae76fea`, deployment `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz`. The reproduced Sky pointer focus, Sky/Monster leave-cancellation and Monster star-accounting defects have been repaired, independently checked locally at desktop/390px and deployed. Production desktop/mobile Monster completion now displays and persists 3 stars after reload; mobile Sky focus/cancel checks also passed. See [production unblock evidence](batch2-unblock-production-mobile-20261002.md). Candidate gate: 144 tests, lint and build pass. The incomplete packaged narration integration remains separate: bounded background generation is running with manifest checkpoints, status and failure/completion monitoring. At the 3 October 07:14 UTC read-only audit, 1,058 of 1,359 clips decoded successfully, 301 Monster Math clips remained, and no existing clip was invalid. Local source `70108cb` repairs narration continuing after route exit; independent runtime deltas are retained in the [audio preflight](batch2-audio-runtime-preflight-20261003.md). Completed readiness, audible review and production audio QA are still required. All 24 baseline game/band/viewport rows are retained; failed rows require the released repair deltas and audio acceptance; no Batch 2 4.5 claim is made. Next batch after acceptance: Count the Stars, Letter Trace, Cosmic Tic-Tac-Toe and Dino Detective; their implementation plans are prepared. Historical custom storybooks have not been recovered; the seven-title curated shelf includes four newly added titles.

## Batch 1 — critical foundations

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Curriculum Quest | 1/5 (prior live baseline; re-score after current fix) | Freeze difficulty and question queue at Start; keep each map/sequence/science explanation and visual fact card open until Next; add facts for continents, oceans, chronology, and science; make each module a three-band skill path; link Time Detectives to Time Teller. | Cross the adaptive threshold during a run without resetting; answer five geography prompts and see five distinct facts; complete history/science facts; verify related-game link, rewards, restart, and 390px navigation. |
| Storybook Studio | 2/5 | Keep the three shipped books and restore/add at least four curated age-appropriate books; provide durable profile-based save/restore or an explicit export/import recovery path for browser-local custom books; add 3-step comprehension paths, word help, narration replay, and resumable page progress. Do not claim old browser-local stories have been recovered until they are actually imported. | Seven available curated stories with all assets; read, reload, and resume; complete randomized comprehension; verify persistence in a fresh browser or explicit recovery workflow and show missing legacy items clearly. |
| Letter Launch | 2.5/5 | Expand the current three bands into a purposeful phonics route: identify grapheme/sound, find initial sound, match upper/lowercase, then blend/assemble simple decodable CVC words. Use only taught graphemes; add 12+ eligible word/sound sets, a rocket launch animation, clue feedback, and collectible chapter badges. | Three or more meaningful bands with at least six valid shuffled rounds each; no untaught target; no-repeat window; incorrect clue and correct explanation; all rounds/rewards and mobile controls pass. |
| German Garage | 2.5/5 (old broken-art screenshot; current entry loads) | Recheck every tab’s art/audio; retain designed fallbacks; build three bays for colours, vehicles/parts, and short German directions with English support and spoken replay. Slow the feedback enough to understand, then let the child advance. | All scenes render or show intentional fallback; five varied targets per bay without repetition until pool exhaustion; audio, useful answer feedback, level unlock, and 390px back navigation pass. |

## Batch 2 — shallow game upgrades

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Puzzle Pop | 2.5/5 | Add 12 illustrated scenes over three chapters; increase board sizes from 2×2 through 5×5; add picture preview, gentle edge/next-piece hint, scene fact, and unlock/replay flow. | All 12 scenes, four per chapter, have valid art/facts and solvable shuffled trays; touch/keyboard play; distinct restart order; mobile completion and next-scene unlock. |
| Spot the Difference | 2.5/5 | Add 12 paired scenes; progress from 3 to 5 to 7 differences; add magnifier/hint tokens, clear found counter, completion reveal, and a scene fact. | Hotspots at least 48px on mobile; shuffled scene/target order; gentle missed-tap feedback; find, reveal, next, restart, and back all work. |
| Sky Shapes | 3/5 | Add 12 flight missions over three skies; grow from simple to compound outlines; give start dots, path tolerance feedback, accuracy stars, and a saved chapter blueprint/sticker. | Touch, mouse, and keyboard alternatives; seeded mission queue without immediate repeat; accurate route feedback and chapter reward. |
| Monster Math | 3/5 | Build three visual episodes: count to 10, add/subtract to 20, then short word problems. Model each operation with counters, ten frames, or a number line and animate the result. | Every generated prompt/model/result agree; distractors valid; six unique questions per run; next episode unlock/replay works. |

## Batch 3 — core variety and skill feedback

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Count the Stars | 3/5 | Add 15 countable scenes; mark each tapped object; bands cover 1–5, 1–10, and 1–20; turn collected totals into a constellation book. | Rendered object count equals answer; objects do not overlap or become untappable; scene/count/options vary; counted items visibly/audibly mark. |
| Letter Trace | 3/5 | Animate stroke order and start dots; add uppercase/lowercase, forgiving-to-precise stroke bands, simple CVC extension, and clue-based retry. | Three bands and eight letters per band; touch/mouse trace; score uses safe tolerance; persisted letter badges and retry guidance. |
| Cosmic Tic-Tac-Toe | 3/5 | Add tutorial missions for making a line, blocking, and a fork; give three themed boards/rivals and explainable bot feedback at age-appropriate difficulty. | No impossible bot move; distinct tutorial tactics; randomized valid starts; completion/replay stays in the game. |
| Dino Detective | 3.5/5 | Give each of the 12 worlds a distinct scene fact, target dinosaur, ambient detail, and sticker; progressively vary hiding patterns. | 12 unique facts; targets in safe randomized positions; five finds reachable at 390px; completion unlock and parent-world return pass. |

## Batch 4 — maths depth and time link

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Addition Adventure | 3.5/5 | Three chapters: combine groups, number bonds, and short story problems; animate manipulatives into the result. | Band limits respected; visual count equals equation; six unique questions per run; explanation remains until Next. |
| Subtraction Station | 3.5/5 | Three chapters: remove objects, compare groups, and story problems; animate removal; avoid negatives until an explicitly older band. | Generated model matches equation; six unique questions per run; wrong feedback shows which group is removed; replay and progression pass. |
| Time Teller | 3.5/5 | Preserve analog-clock work; add hand-setting missions, daily-routine context, narrated short/long-hand lesson, and routes for o’clock, half/quarter, and daily time. | 50 seeded clock/label pairs agree; options are unique; six rounds per band; Time Detectives route and return work. |
| Number Line Jump | 3.5/5 | Three worlds with draggable/tappable jumps, forward/back movement, missing numbers, and comparison; mark each hop. | Equation, hops, and landing agree; no-repeat run queue; keyboard/touch and 390px tests pass. |

## Batch 5 — literacy and reasoning polish

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Sound Safari | 3.5/5 | Add phoneme habitats, blend/segment tasks, and minimal-pair listening; use the animal context to explain the sound. | Audio, image, and answer agree; shuffled options; three bands with six rounds; restart avoids recent repeats. |
| Spelling Studio | 3.5/5 | Stage grapheme teaching, picture/context sentence, sound-by-sound assembly, readable correction, and 20+ decodable words per band. | Required graphemes always available; tile positions shuffle; words do not repeat before a full pool cycle; collection persists. |
| Colour Mixing Lab | 3.5/5 | Three labs: primary mixes, shades/lightness, and real-world colour hunt; animate liquid and save palettes. | Every recipe maps to its expected colour; shuffled recipes; explanation stays until Next; palette persists. |
| Odd One Out | 3.5/5 | Add semantic, visual, and rule-based categories; ask for a simple “because” choice and show a child-friendly fact. | Exactly one defensible answer per seed; decoys share the stated property; layout randomizes; explanation persists. |

## Batch 6 — thinking and world-story progression

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Pattern Parade | 3.5/5 | Build a festival route with AB/AAB/ABB/ABC/growing patterns, objects/sounds/movement, and rule explanation. | Generator validates answer and enough sequence terms; no repeated pattern signature in eight runs; three bands/six rounds. |
| Dino Hangman | 3.5/5 | Use decodable word families, picture clues, and a positive rescue meter that never shames; reward completed dino facts. | Starter words are age-6 decodable; hints/retry work; session words do not repeat; success/failure recover safely. |
| Chess Explorers | 3.5/5 | Teach piece movement, safe captures, then mini-puzzles; show legal destinations and explain moves through a coach. | Only legal moves accepted; three bands/five puzzles; randomized puzzle order; completion unlocks a piece badge. |
| Astronaut Academy | 4/5 | Add a mission map, planet science/engineering facts, and spaced review that brings missed concepts back in later missions. | Seeded mission/option rotation; every correct answer has a durable fact card; six missions unlock a badge. |

## Batch 7 — preserve strong mechanics and finish

| Game | Last score | Work required for 4.5/5 | Acceptance evidence |
|---|---:|---|---|
| Memory Match | 4/5 | Keep the verified rising pair count; add simple visual memory strategies, themed animated boards, next-session-only adaptation, and a board fact/sticker. | Existing L1–L5 counts remain 4→8→10→12→13; 10 seeded decks have pair integrity and distinct layouts; no completion reset; mobile cards stay tappable. |
| Solar System | 4/5 | Keep fact deck/missions/back target; make the mobile planet strip visibly navigable; add guided first mission and a persistent discovery passport. | All 9 planet tabs work at desktop/390px without trapped navigation; three discoveries and valid challenges per planet; passport persists; Back returns to Explore. |

## Delivery order

Implement one four-game batch at a time. Run meaningful unit checks, production-candidate Playwright at desktop and 390px, and visual review before moving to the next batch. Record per-game status as **not started**, **in progress**, **verified 4.5**, or **blocked by missing external data/infrastructure**; preserve stale review scores as historical until rerun.

## Concrete editorial checks for every game

These clarify the rows above. They are acceptance instructions, not claims of completed implementation.

| Game | Required learning and verification details |
|---|---|
| Curriculum Quest | Cover all three modules and their three bands; cross the adaptive threshold without restarting; inspect five geography facts, history/science explanations, named rewards and the Time Teller link/return. Apply the finite-pool rule. |
| Storybook Studio | Comparable route is supported reading → vocabulary → three-step comprehension. Inspect all seven titles/assets, narration, resume and an explicit backup/restore round trip; separate newly added books from recovered legacy books. |
| Letter Launch | Cover all four stages, taught-grapheme validation and 12+ eligible sets, visible launch animation, four chapter badges and profile separation. |
| German Garage | Cover all three core bays and every optional practice tab; check bilingual explanations, German replay, pool exhaustion and child-controlled feedback advance. |
| Puzzle Pop | Cover four scenes in each of three chapters, preview/hint/fact, all board sizes, solvable shuffled pieces and touch plus keyboard completion. |
| Spot the Difference | Cover 12 pairs over three bands with exactly 3/5/7 genuine differences; check independently reachable mobile targets, missed taps, clue limits, scene facts and attempt diagnostics. |
| Sky Shapes | Simple outlines → compound routes → precision/ordered parts; cover 12 missions, route explanation, scoring, pointer interruption, touch/mouse/keyboard and saved accuracy rewards. |
| Monster Math | Count → add/take away → story problems. Episode labels/session metadata must match; inspect counters, ten frames and number lines against every generated answer, unique options and exact reload star totals. |
| Count the Stars | One-to-one → grouped → tens/ones counting, beyond larger ranges alone. Validate 15 scenes, totals to 20, no decorative extra counted objects, marked taps and saved constellations. |
| Letter Trace | Stroke order → letter case → CVC transfer, eight eligible letters per band. Reject reversed strokes/random scribbles while accepting valid child strokes at both widths; verify mastery, hints and input alternatives. |
| Cosmic Tic-Tac-Toe | Make a line → block → guided fork. Explain the two possible winning lines; validate legal bot moves/terminal stops, draws and losses as recoverable outcomes, hints and saved mission rewards. |
| Dino Detective | Group 12 worlds into three hiding/clue strategies; verify every world fact/sticker, five reachable finds, safe varied placement and completion-only unlock. |
| Addition Adventure | Groups → bonds → story chapters; state band bounds in data/session labels and validate each depicted group, sum and held worked explanation. |
| Subtraction Station | Removal → comparison → stories. Explain comparison separately from taking away; validate models and reject unintended negative results. |
| Time Teller | Include o’clock, half/quarter past and quarter to, hand setting and routines. Explain daily-time ambiguity and verify the exact parent route after entry from Curriculum. |
| Number Line Jump | Forward/back hops → missing numbers → comparison; equation, visible hops and landing agree, with keyboard/touch controls and durable explanation. |
| Sound Safari | Listening → blending → segmenting; document taught phonemes and minimal-pair recordings; picture clues must not reveal a listening answer prematurely. |
| Spelling Studio | Copy → missing sound → independent assembly; 20+ taught decodable words per band, all required tiles including repeated letters, shuffled layout and saved collection. |
| Colour Mixing Lab | Specify a consistent pigment model and proportions. Mix → shade/lightness → colour hunt; recipes/results/explanations agree and controls convey meaning beyond colour alone. |
| Odd One Out | State the intended property before selection; validate odd item and simple “because” answer, excluding defensible alternative rules in decoys. |
| Pattern Parade | AB/AAB/ABB/ABC/growing patterns have enough visible terms for one rule. A signature means the full pattern content, not merely AB; apply finite-pool exceptions. |
| Dino Hangman | Decodable families → picture-supported clues → independent rescue; document eligible words, gentle failure/retry and durable dino-fact rewards. |
| Chess Explorers | Movement → safe capture → mini-puzzle; name the simplified rules taught and one objective per puzzle. Accept legal destinations without ambiguous unexplained “best move” scoring. |
| Astronaut Academy | Observe → explain → design mission objectives; six purposeful missions per route, durable science facts, later-run review of missed concepts and a clear badge map. |
| Memory Match | Preserve 4→8→10→12→13 pairs; teach scan/group/recall strategies as boards grow. Check pair integrity, distinct layouts, no level-5 regression, later-run adaptation and persisted stickers. |
| Solar System | Comparable discovery → compare → challenge route across eight planets plus Pluto, a dwarf planet. Verify all nine destinations, mobile strip cues, seeded missions and saved discovery passport. |
