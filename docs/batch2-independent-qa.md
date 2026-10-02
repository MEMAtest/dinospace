# Batch 2 independent QA and scorecard

## Scope and evidence identity

This is the independent test record for Puzzle Pop, Spot the Difference, Sky Shapes, and Monster Math. Product source is owned by the builders; this file is QA-only. Keep evidence separated by identity:

| Scope | Build / URL | Status |
|---|---|---|
| Existing production baseline | `https://dinospace-eight.vercel.app`, JS `index-D6fYZHfF.js`, CSS `index-BH3dde_v.css`; deployment/SHA not independently resolved | Limited read-only baseline only |
| Frozen candidate | `http://127.0.0.1:5282`, JS `index-Cm9CCuJO.js`, CSS `index-CXjgl5-j.css`, copied to `/tmp/dinospace-batch2-20261001/site` | Local candidate only; no deployment/SHA asserted |
| Production release | Exact SHA, deployment ID, JS/CSS bundle | Pending |

Do not combine an old-production run with a candidate or release run. Do not use an account/profile containing real child data; no paid actions. Use actual UI controls, with no app-state injection or solver imports.

## Shared 4.5 acceptance checklist

Each game must pass the roadmap shared gate: age-appropriate plain-language prompt; spoken prompt and replay; gentle, useful wrong-answer clue without exposing the answer prematurely; explanation/fact remains visible until advance; >=48px interactive targets; stable difficulty/queue/count within a run; seeded queue and independently shuffled answer positions with an eight-item no-repeat window across restarts; one defensible answer; three meaningful bands with 5–8 rounds or comparable scene objectives; clear unlock/replay/reward; exact-parent Back; restart; no unexplained mobile overflow at 390px; lifecycle events for start/question/scene/answer/hint/complete/replay/leave with game, level, seed and no prompt/child content; zero relevant network/asset/console failures.

Per game, collect three complete seeded desktop runs and three complete seeded 390px runs. Across the six runs, exercise right/wrong, hint, prompt replay, progression, reward, restart/replay, leave/back, randomized restart uniqueness, and audio toggle. Save screenshots of start, feedback, and completion per viewport. Record each run's seed, level/band, scene/question order, and outcome.

## Batch-specific checks

### Puzzle Pop

- Three chapters / 12 illustrated scenes; board sizes progress from 2×2 through 5×5.
- Preview is usable before play. Edge/next-piece hint is gentle and does not reveal the full solution prematurely.
- Confirm each completed scene's fact card remains visible until advancing.
- At least three different scenes per chapter across runs; tray contains each piece exactly once and placement is valid.
- Touch and keyboard operation; next-scene unlock, replay, restart with a different seeded order, and parent return.

### Spot the Difference

- Twelve paired scenes; three named chapters progressing 3, 5, then 7 differences.
- Verify found counter, magnifier/hint tokens, missed-tap clue, completion reveal, scene fact, next scene, restart, and parent return.
- Measure every mobile hotspot/interactive target at >=48px; validate no target is unreachable/overlapping in 390px layout.
- Seeded scene and target order; distinguish a legal target miss from a click intercepted by an overlay.

### Sky Shapes

- Twelve missions across three named skies; progression from simple to compound outlines.
- Start dots and path tolerance feedback; verify accuracy stars and saved chapter blueprint/sticker.
- Exercise touch, mouse, and keyboard alternatives. Mission queue is seeded and avoids immediate repeats across restarts.
- Check path drawing at 390px, progress visibility, feedback alignment, reward persistence, next mission, restart, and parent return.

### Monster Math

- Three episodes: count to 10; addition/subtraction to 20; short word problems.
- Verify each prompt, counters/ten-frame/number line, answer, animated result, and explanation agree.
- At least six unique questions per run; valid unique distractors; wrong attempt gives a usable visual clue without disclosing the answer.
- Episode unlock/replay/reward, restart queue, audio replay, and parent return.

## Existing source baseline observations (not candidate verdicts)

Before builder work, repository components showed: Puzzle Pop had three levels, no scene fact, and unseeded tray ordering; Spot the Difference had one scene with 2/3/4 differences and no chapter progression/reveal/token flow; Sky Shapes was a single-sky six-shape canvas without mission rewards or a visible cue for its horizontal shape strip; Monster Math practiced multiplication facts rather than the contracted counting/add-subtraction/word-problem episodes. These are source observations only; candidate UI evidence will supersede them where the builder has implemented the contract.

## Run log

### Existing production baseline (2026-10-01)

- Isolated Playwright session: `luna_batch2_baseline`; opened the canonical alias in a fresh browser session. Landing page was Amari Discovery; 1280×720 viewport and document width 1280; no console errors or warnings. Initial screenshot: `.playwright-cli/page-2026-10-01T08-41-37-702Z.png`.
- The fresh session had no cookies or session storage; local storage contained only `amari_voice_mode_v4=premium`.
- Selected the visible Age 6+ Amari profile through the actual profile-picker control. Its home screen showed 0 stars, a 1-day streak, and a daily challenge. Stopped without opening a game or answering because those values could be real child progress. Therefore this is route-shell/asset identity evidence only and does not count toward any gameplay gate.
- Source-level baseline observations above remain historical context, not rendered behavior evidence. Builders' frozen candidate must be tested in its own clean isolated session.

### Frozen candidate, batch2-20261001 (2026-10-01)

- Isolated Playwright session `luna_batch2_candidate`; actual UI controls only; viewport tested at 390×844 and 1280×720. No source mutation, hidden-state reads, or real account data. Bundle identity checked in the loaded page. Browser console had no game/runtime errors during these journeys. This is local preview evidence, not production acceptance.
- Puzzle Pop mobile: Picture Pioneers completed all four 2×2 scenes in order Moon Camp → River Valley → Dino Park Picnic → Robin’s Tree. Deliberately placed piece 2 in space 1; moves rose to 2, piece count remained 3, and feedback prompted matching the scene. Visible hint directed piece 3 to the glowing space; UI accepted that placement. First fact (“The Moon shines because sunlight bounces off its rocky surface.”) remained until Next. Chapter reward appeared; Curious Constructors then completed all four 3×3 scenes (first observed scene: Treehouse Robots) and showed its completion reward. Parent return led to Creative Lab. At 390px, however, the floating daily mission launcher overlapped Hint: Hint rect `[274.2,774.5,87.8,48]`, launcher `[319,763,48,48]`. Tray tiles and board spaces rendered nearly white/blank, making pieces hard to compare with the preview. At 1280×720, board content and piece tray extended below the initial viewport (first captured tray y≈832). Screenshots: `.playwright-cli/page-2026-10-01T09-02-13-886Z.png`, `.playwright-cli/page-2026-10-01T09-03-18-606Z.png`, `.playwright-cli/page-2026-10-01T09-05-23-516Z.png`. Desktop full chapter runs and remaining chapter band/replay evidence not completed.
- Spot the Difference mobile: Bright-Eyed Beginners completed four pairs in order Moon Camp → Dino Park → Superhero City → River Valley. A blank-area miss kept 0/3 and gave a comparison clue; Hear clue and Magnifier were usable, the magnifier count changed 2→1, and its position clue enabled a correct hotspot (1/3). Scene facts remained until Next. Reward unlocked Curious Comparers; first Growing pair, Time Observatory, completed 5/5. Parent return went to Thinking & Play. At 390px, document width stayed 390 and hotspot targets measured 56×56. Screenshot `.playwright-cli/page-2026-10-01T09-16-57-244Z.png`, `.playwright-cli/page-2026-10-01T09-17-46-050Z.png`, `.playwright-cli/page-2026-10-01T09-20-52-546Z.png`. Only one complete mobile chapter plus one Growing pair; no desktop run/restart/seed evidence yet. A route entered after prior page scrolling showed the Spot header controls clipped above viewport; needs fresh-route confirmation before treating as product defect.
- Sky Shapes mobile: Cloud Meadow completed in order Mountain Peak → Round Sun → Kite → Window Cloud. Hint changed visible guidance; keyboard focus/Enter/Space tracing completed all four flights, with 2–3 stars each. Explicit sky reward appeared. Replay this sky then completed the exact same four-mission order, demonstrating a full-queue repeat on replay despite the contract requiring rotation. Rainbow Ridge unlocked and began at Puffy Cloud; later UI showed that Growing sky completed. Leaving the reward screen required the visible confirmation; Back to world returned to Creative Lab. Width stayed 390, controls met 48px. No desktop run, mouse/touch trace run, or seed export yet. The exact replay-order failure was sent to root for remediation.
- Monster Math mobile: completed all three episodes, each six questions. Starter questions in observed order: cookies 3; flowers 9; balloons 8; cookies 7; crystals 9; planets 9. One wrong answer (2 for 3 cookies) gave a clue before correct answer; clue and spoken-question replay controls were exercised. Growing order: 11+2, 2+12, 14−6, 12+7, 6+5, 9+6. Challenge order: Kai 5+12; Tess 19−11; Nia 5+12; Leo 14−7; Tess 7−1; Nia 9+8. Challenge replay changed order to Mira 3+2; Max 20−4; Tess 6+1; Max 3+16; Tess 17−5; Nia 8−3. Episodes showed 3/3 stars and explicit saved badge/replay UI; reload preserved Amari's 19 stars, while switching to Askia showed 0, without cross-profile leakage. At 390px document width stayed 390; long question/start and finish content required scrolling but did not overflow horizontally. Desktop Starter, Growing, and Challenge each completed on the same session, six prompts per episode; Growing and Challenge were completed all-first-try. Challenge desktop order: Tess 5+3; Max 4−3; Leo 14−11; Nia 13−6; Mira 16−10; Mira 10−9. In Growing Q1 (11+2), the static pre-answer ten-frame appeared to show only 10 orange plus 2 blue counters; this is a likely one-counter model discrepancy requiring recheck. A displayed 2+12 equation briefly showed 13 during its answer animation, then settled to 14 with a correct explanation; not treated as a persistent defect. No numeric seed or diagnostics export has been captured yet. Screenshot `.playwright-cli/page-2026-10-01T09-25-22-056Z.png` (Growing model).

#### Candidate run coverage status

| Game | Desktop completed | 390px completed | Exact contract status |
|---|---:|---:|---|
| Puzzle Pop | 0 | 2 chapters | Incomplete; blank tiles and mobile Hint/mission overlap block acceptance |
| Spot the Difference | 0 | 1 chapter + 1 Growing pair | Incomplete |
| Sky Shapes | 0 | 2 Starter replays + Growing flow | Incomplete; replay repeated identical full queue |
| Monster Math | 3 episodes | 3 episodes + changed Challenge replay | Gameplay breadth observed, but no retained seed/log evidence and one ten-frame count needs recheck |

The roadmap asks for three complete seeded runs per game per viewport; the counts above are completed UI journeys only, not a claim that every journey had a visible numeric seed. Save start/feedback/completion evidence per run and finish the required logs before scoring. The 5282 findings must not be conflated with any later fixed candidate or canonical production deployment.

| Identity | Game | Viewport | Seed / band | Scene or question order | Wrong / hint / right | End / reward / replay / leave | Assets / console / overflow | Artifacts |
|---|---|---|---|---|---|---|---|---|
| 5282 local | Puzzle Pop | Desktop | Not captured | Not run | — | — | No console errors; content extends below viewport | — |
| 5282 local | Puzzle Pop | 390px | Not surfaced | 2 chapters, 2×2 then 3×3 | Wrong retry; hint; correct placement | Both chapter rewards; parent return; replay pending | Blank tiles, Hint overlaps mission launcher | `.playwright-cli/page-2026-10-01T09-02-13-886Z.png`; `...09-03-18-606Z.png`; `...09-05-23-516Z.png` |
| 5282 local | Spot the Difference | Desktop | Not captured | Not run | — | — | No console errors | — |
| 5282 local | Spot the Difference | 390px | Not surfaced | Bright-Eyed Beginners 4 pairs; Curious Comparers pair 1 | Wrong, clue, magnifier, right | Chapter reward, parent return | 56px hotspots; fresh-route header check remains | `.playwright-cli/page-2026-10-01T09-16-57-244Z.png`; `...09-17-46-050Z.png`; `...09-20-52-546Z.png` |
| 5282 local | Sky Shapes | Desktop | Not captured | Not run | — | — | No console errors | — |
| 5282 local | Sky Shapes | 390px | Not surfaced | Cloud Meadow order repeated identically on replay | Hint; keyboard trace | Reward; Growing unlock; parent return | 390px width; no queue rotation | — |
| 5282 local | Monster Math | Desktop | Not surfaced | 3 episodes × 6 prompts | Growing/Challenge all correct first try | Episode rewards | No console errors | — |
| 5282 local | Monster Math | 390px | Not surfaced | 3 episodes × 6 prompts + changed Challenge replay | Wrong, clue, prompt replay, correct | 3/3 stars; reload; Askia separation | Vertical scrolling; 390px width | `.playwright-cli/page-2026-10-01T09-25-22-056Z.png` |

## Independent ratings

| Game | Historical score | Current independent score | Evidence status | Remaining concrete gaps |
|---|---:|---:|---|---|
| Puzzle Pop | 2.5/5 | Pending | Candidate not supplied | Pending |
| Spot the Difference | 2.5/5 | Pending | Candidate not supplied | Pending |
| Sky Shapes | 3/5 | Pending | Candidate not supplied | Pending |
| Monster Math | 3/5 | Pending | Candidate not supplied | Pending |

A 4.5 score requires both the shared evidence gate and every batch-specific check. If any gate is incomplete, keep the score pending or below 4.5 and name the exact missing evidence.
