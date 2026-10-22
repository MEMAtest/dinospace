# Batch 2 acceptance contract and source review

Updated: 22 October 2026  
Games: Puzzle Pop, Spot the Difference, Sky Shapes, Monster Math  
Status: **In progress; no game accepted and no editorial scores assigned.**

## Evidence boundary

Root reports canonical runtime commit `6960c53f` and deployment `dpl_77Wh681qiAQg2UER5ygr2dccmU27` as reverified. That is runtime identity evidence only. The reviewed checkout is at base commit `2ef64fe24d1621bb48218319fec01daa63353b80` with uncommitted source/test changes. No browser rehearsal, deployment change, provider call, commit, or score is recorded by this review. The current changes therefore remain a candidate source review, not canonical gameplay evidence.

Root reports a contained-browser pass of all 12 Puzzle Pop scenes and all 12 Spot the Difference pairs at 390px and 1440px; every Spot pair was visually checked and the authored differences rendered. Root also reports 343 passing tests and one skip after correcting the stale catalogue expectation for Code Cadets/Writing Desk. These are candidate-lineage results supplied by root, not independently reproduced here and not canonical-release acceptance. Sky Shapes and Monster Math browser evidence is still pending.

The four-game stage counts are:

| Game | Required content and progression |
|---|---|
| Puzzle Pop | 3 chapters × 4 scenes = 12; board sizes 3×3, 4×4, 5×5 |
| Spot the Difference | 3 chapters × 4 pairs = 12; exactly 3, 5, then 7 differences per pair |
| Sky Shapes | 3 skies × 4 missions = 12; one outline, compound, then ordered multipart routes |
| Monster Math | 3 episodes × 6 questions per ordinary run: count to 10, addition/subtraction to 20, then addition/subtraction stories |

The historical roadmap’s Puzzle Pop row says 2×2 through 5×5; current authored source has only 3×3, 4×4, and 5×5. Use current source counts and correct the historical row only when its owner updates that document. Sky’s four missions per sky are the previously documented comparable route. No mid-activity resume state is present in the four source progress models: completed scenes/missions/episodes and unlocks persist, while an interrupted board, trace, or question run is restarted. Acceptance must record that behavior clearly; do not describe the saved queue as a resumable game state.

## Shared browser gate

Use the existing contained synthetic browser at 1440×844 and 390×844, with fresh synthetic game profiles and no real child data. Use ordinary visible UI starts; do not inject seeds, answers, unlocks, or progress. Record candidate SHA and rendered asset identity, run seed, first item/order, profile, viewport, and the exact visible result. Check every authored scene/mission/question model, relevant console and asset requests, focus visibility, target dimensions (48px minimum), clipping/overflow, route-back behavior, and persisted progress after reload. Complete same-viewport ordinary replay comparisons and record both seeds and first item. Check sound-off guidance and play controls; playback/decode evidence is not human listening. Listen separately for intelligibility, pronunciation, wording agreement, joins, and perceived volume. Keep each game pending until its own mandatory cases pass on the accepted release lineage.

For each activity, cover a correct response, wrong response and recovery, hint use, held completion feedback, replay, leave/back and reload. Verify per-child progress and that all earned counts remain exact after reload. Since active runs are not saved, verify and report restart-on-reentry after an interrupted run instead of implying mid-run resume.

## Puzzle Pop

**Source contract:** `src/data/puzzlePopBatch2.js` defines Picture Pioneers (3×3), Curious Constructors (4×4), and Detail Detectives (5×5), each with four scenes. `src/components/games/PuzzlePlay.jsx` exposes chapter buttons, preview, piece tray, board spaces, hint, spoken instructions, facts, Next and Replay.

**Mandatory scenarios:**

1. Play all 12 named scenes across the three chapters at both viewports. Confirm every preview, loose piece, and placed tile depicts the same undistorted crop; inspect the 5×5 tile/tray sizes and mobile page flow.
2. For each board size, select a piece, place it in a wrong space, confirm gentle feedback and no placement, then place it correctly. Verify hint highlights the exact matching preview region and board slot and does not silently place a piece.
3. Complete each scene; verify one fact remains until Next, `Hear fact again` speaks that fact, chapter completion unlocks only after all four scenes, and Replay starts a different ordinary order when available.
4. Exercise tap/tap and keyboard board navigation: Tab to the tray, select with Enter/Space, confirm focus reaches the intended board slot, use arrow keys within row/column boundaries, place, and continue with keyboard. Confirm focus remains visible and predictable through wrong placement, hints, and scene advance.
5. Leave mid-board and reload. Confirm the interrupted board is not represented as resumed; completed scene IDs and unlocked chapter remain saved. Verify parent-world Back and per-profile separation.

Use visible names `Start chapter` / `Replay chapter`, `Choose loose piece N`, `Puzzle space N`, `Hint` / `Show a piece mapping`, `Hear instructions again`, `Hear fact again`, `Next picture`, `Next chapter`, `Replay pictures`, and `Back to learning world`. DOM role expectations include a `grid` with rows/cells and one roving `tabindex=0` board button.

**Source review:** the diff adds roving board focus and arrow-key movement, refocuses the board after selecting a loose piece, returns to the tray after placement, and adds fact replay. Root's reported browser pass covers all scenes and both sizes, including the square scenes. Source geometry uses the same square `object-cover` framing for the preview and tile image, so the four 1254×1254 square illustrations (Robin’s Woodland, Treehouse Robots, World Explorer, Nature Lab) do not have a source-level preview/tile crop mismatch. This review found no remaining crop blocker. Keep keyboard focus restoration and authored fact-to-art teaching alignment in the accepted-lineage evidence; no new image generation is required.

## Spot the Difference

**Source contract:** `src/data/spotDifferenceBatch2.js` contains 12 authored pairs and declared difference targets. `src/components/games/SpotDifference.jsx` has blank-area miss feedback, accessible hotspot buttons, magnifier hints, held facts, next/replay and a newly added fact replay control.

**Mandatory scenarios:**

1. Review every Picture A/B pair side by side at both sizes. Count exactly 3/5/7 real changes in the depicted scene; descriptions and coordinates must identify those changes. Confirm unchanged regions remain stable and no extra image/rendering artifacts create a fourth/eighth find.
2. On each band, tap blank Picture B space and confirm a gentle miss with no progress; find targets, verify counters advance once, and retap a found target without losing progress. Check first-miss diagnostics and the source’s overlapping touch target behavior, especially Dino Park’s broad dinosaur hit polygon and nearby flower target.
3. Use both magnifier hints consecutively without finding an intervening change; the hints must be visibly amber, distinct, actionable and decrement the two-token count. Verify exhaustion, reset on next pair, and no hint that reveals the whole answer.
4. Finish every pair at both sizes. Hold the single scene fact until Next, test `Hear fact again`, chapter unlock/replay, ordinary same-viewport replay variation, reload progress, profile separation, and exact parent Back.
5. Measure all seven Super Spotters hotspots at 390px; verify ≥48px targets, pairwise nonoverlap where the visible details require separate targets, correct target registration at touch centers, and no horizontal overflow.

Visible controls include `Hear clue`, `Magnifier N left`, `Search Picture B for a change`, `Check [left|middle|right] [top|middle|bottom] detail`, `Hear fact again`, `Next picture`, `Next chapter`, `Replay chapter`, and `Back to learning world`.

**Source review:** the current renderer uses `SceneColorEditLayer` for color-only alterations and `SceneEditLayer` to composite `imageB` inside normalized `editRegions`; `pairedArt` suppresses generic difference icons. The 12 source labels map to those declared color, shape, count, or direction changes. Root reports visually checking every pair in browser and confirming that actual differences rendered at both 390px and 1440px. This closes the earlier unchanged-art source concern for the reported candidate. The remaining acceptance evidence is accepted-lineage identity and gameplay behavior (miss recovery, hotspot/touch overlap, hints, persistence, replay, and listening), rather than another generic art pass.

## Sky Shapes

**Source contract:** `src/data/skyShapes.js` defines four missions in each sky: Cloud Meadow (Round Sun, Mountain Peak, Window Cloud, Kite); Rainbow Ridge (Heart Balloon, Bright Star, Cloud House, Puffy Cloud); Aurora Station (Rocket Ship, Winged Jet, Sky Castle, Moon Observatory). Mission path count ranges from one outline to six ordered parts.

**Mandatory scenarios:**

1. Complete all 12 missions at both sizes, recording the ordinary generated mission queue. Confirm the stated objective changes by band and the later compound/precision challenges are understandable.
2. For each input type, trace using mouse, touch, and keyboard. Include wrong start, drift away and return, pointer interruption/cancel, visible hint, replayed prompt, and Restart flight resetting route display to 0% while retaining a truthful retry/accuracy record.
3. Exercise every multipart mission’s order and lift between paths: Cloud House (2), Winged Jet (3), Rocket Ship (4), Sky Castle (6), Moon Observatory (4). Confirm a part cannot be skipped or credited out of order.
4. Verify pointer accuracy and star thresholds from visible outcomes, saved best accuracy/reward, held shape explanation, Next mission/Complete this sky, unlock and replay. Keyboard-completed routes must say accuracy was not measured and must not fabricate a numeric accuracy or mastery result.
5. Leave and reload mid-flight; record restart behavior and confirm completed mission/reward state, exact star totals and profile separation survive. Confirm parent Back and sound-off instructions.

Use visible `Start this sky` / `Replay this sky`, tracing board (`role=application`), `Show a tracing hint`, `Hear mission again`, `Restart flight`, `Next mission`, `Complete this sky`, and `Back to world`.

**Source review:** the precision normalizer now averages unscaled per-sample precision and clamps the final percentage to 0–100; source-level normalization defect is settled. Keyboard-only completion is labelled participation and does not fabricate measured accuracy. A transparent, full-view SVG rectangle supplies the pointer hit surface behind route strokes, and the direction banner now sits above the board, resolving the source-level input-surface and banner-occlusion concerns. Browser verification remains pending for blank-area pointer start, interrupted/cancelled pointer, 390px banner/board layout, ordered multipart tracing, restart/retry semantics, and truthful visible accuracy/star outcomes. `keyboardUsedRef` remains sticky for a mission: a route that begins with keyboard and later uses pointer is treated as keyboard-guided. Confirm the intended mixed-input result during the focused browser run; this is the only identified scoring behavior question. Queue variability and recent-item behavior still need ordinary UI evidence.

## Monster Math

**Source contract:** `src/data/monsterMathEpisodes.js` authors count, operation, and word-problem pools; `src/components/games/MonsterMath.jsx` renders picture models, two ten-frames, number lines, guided steps, answer buttons and held explanations.

**Mandatory scenarios:**

1. Complete each episode’s six questions at both widths. Check all four options are unique and exactly one is correct, question IDs do not repeat in a run, and every prompt, visible model, explanation and answer agree.
2. Counting: inspect count targets across 1–10, ensure the count pictures do not announce the answer before selection, and confirm each picture has a useful accessible name. Wrong answer → clue → retry must remain gentle.
3. Add/Take Away: sample both operation kinds and verify counters/ten-frames up to 20, including addition with first addend over 10 and non-negative subtraction. Story Problems: sample all three add and all three subtract questions in a run; check story quantities, operation, number line, answer and explanation. Before answering, a subtraction route must include its valid landing without revealing the answer.
4. In a story problem, request the clue and advance the visible `Jump one step forward/back` control once per activation. Confirm exactly one hop each time, stop at the required count, reset per question, and that guided use counts as clue use. Verify wrong guidance and the correct explanation each appear once and remain until Next.
5. Replay prompt; complete six questions; verify first-try count and run stars, unlock/episode map labels, Next episode, Replay episode, Back, and exact saved episode/star totals after reload and profile switch. Leave/reload mid-run and confirm the product restarts rather than implying question-level resume.

Visible controls: `Start six questions`, `Hear the question again`, `Show me a clue` / `Try the jumps`, `Jump one step forward/back`, `Start again`, answer buttons, `Next question` / `Finish episode`, `Episode map`, `Replay episode`, and `Back to world`.

**Source review:** the diff now reserves three of six Growing questions for each operation and three of six Story Problems for each operation, then shuffles the six-question mixture. This corrects run-level omission of one advertised operation. The new test covers 100 seeds for the 3/3 split and model validity. It does not guarantee the required first-addend-over-10 example in a given six-question run; ordinary browser sessions must show that case or the question sampler needs an explicit coverage rule. Current subtraction pool permits only positive answers (`start` 2–20, `take` 1–start−1); keep any wording of the domain consistent with that. The counting accessibility and non-leaking pre-answer state need rendered screen-reader/browser checks.

## Shared audio, content, and release blockers

- Batch 2 historical readiness reports 1,371 packaged clips fully decoded, while independent human listening and final canonical production playback remained open. Verify the current exact packaged keys after the Dino Park title update and new `Hear fact again` actions. Decode or HTTP success is not an intelligibility review.
- Listen to one prompt, wrong/clue, and completion fact/explanation per game at each size. Check sound-off guidance, replay behavior, and that navigation stops active speech.
- Check all referenced images load from the candidate and rendered crop/overlay identity matches source. Do not generate assets or call a paid provider merely to fill an evidence gap.
- Batch 1 is released with acceptance pending: merged-source cumulative browser rehearsal, human listening, canonical-source reconciliation, and final scores remain open in `../batch1/root-review.md`. Batch 2 is the only active implementation batch. No batch score or accepted count is advanced here.

## Tracker handoff

| Game | Tracker state | Current source review disposition | Acceptance still required |
|---|---|---|---|
| Puzzle Pop | In progress | Root-reported all-12 browser pass at 390px and 1440px; square preview/tile crop is source-consistent | Accepted-lineage confirmation, keyboard focus behavior, variation, hint/wrong recovery, persistence, audio listening |
| Spot the Difference | In progress | Root-reported all-12 browser and visual pair pass at 390px and 1440px; source labels align with declared render layers | Accepted-lineage confirmation, overlap/touch and miss/hint behavior, reload/replay, audio listening |
| Sky Shapes | In progress | Normalization, transparent pointer surface, and above-board direction banner source concerns settled; mixed-input result identified | All 12 routes, multipart order, pointer/touch/keyboard and cancel behavior, mixed-input outcome, accuracy/retry/restart, persistence/replay, audio listening |
| Monster Math | In progress | Both advertised operations are now guaranteed per six-question Growing/Story run; high-addend example still not guaranteed | All 18 episode questions/run scope, models, guided number line, high-addend case, unique options, exact saved stars, audio listening |

No numeric scores are assigned. Do not close any row based on this source review, unit tests, current production identity, or the older partial evidence alone.

## Released result — 22 October 2026

Runtime `3e5c03db350c12cfdbe0295a180b058405031d38` is on canonical production as `dpl_VZwrqeqTGUkTdWbN847PVoRQ38y5`. Root completed all four games at desktop and phone sizes, then supplementary native touch, keyboard, queue variation, persistence, profile isolation, sound-off and packaged playback checks. The authoritative result is [the production report](../../qa-evidence/batch2-uplift-20261022/README.md). The source-review notes above remain a dated audit trail, not current blockers. Human listening and final editorial scores remain pending; the tracker uses `released_acceptance_pending`, not accepted.
