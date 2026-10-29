# Retained-game integration regression and learning-wiki scope

This is a bounded final regression plan for the 14 older retained lanes in `queue.json`'s `retainedReleasedScopes`, plus a separate cross-integration smoke across the delivery pairs. The fourteen lanes are not the fourteen games in Pairs 1–7. Existing source-bound reports and retained harnesses are reused; this protocol does not claim fresh live acceptance or replace Pair 8's active gate.

## Fourteen retained game lanes

| Pair | Games and current route scope | Existing acceptance harnesses / evidence |
|---|---|---|
| A | Letter Trace: 3 chapters, 8 distinct letters each. | `docs/qa-evidence/trace-tactics-20261025/rehearsal.cjs`; `README.md`, source gates and local/build/public JSON. |
| A | Cosmic Tic-Tac-Toe: 3 tactics per chapter, plus Scout/Captain/two-player free games. | `docs/qa-evidence/trace-tactics-20261025/rehearsal.cjs`, `dot-rehearsal.cjs`; same report. |
| B | Puzzle Pop: 12 scenes; 9→16→25-piece progression. | `docs/qa-evidence/batch2-uplift-20261022/README.md`; source-bound local/public JSON and retained renders. No standalone CJS rehearsal is retained in this folder. |
| B | Spot the Difference: 12 pairs, 3→5→7 changes. | Same report; local/public JSON and retained A/B visual set. No standalone CJS rehearsal is retained in this folder. |
| B | Sky Shapes: 12 missions. | Same report; local/public JSON, touch/diagnostic records. No standalone CJS rehearsal is retained in this folder. |
| B | Monster Math: six-question episodes; authored addition/subtraction balance and counting replay. | Same report; local/public JSON and playback records. No standalone CJS rehearsal is retained in this folder. |
| C | Count the Stars: 3 surveys × 6 rounds; all 15 named scenes. | `docs/qa-evidence/three-maths-20261023/rehearsal.cjs`; `README.md`, local/public records. |
| C | Addition Adventure: 3 chapters × 6 questions. | Same harness/report. |
| C | Subtraction Station: 3 chapters × 6 questions. | Same harness/report. |
| D | Time Teller: 3 chapters × 6 missions. | `docs/qa-evidence/time-numberline-20261024/rehearsal.cjs`; `README.md`, local/public records. |
| D | Number Line Jump: 3 worlds × 6 questions. | Same harness/report plus mouse clock-drag record. |
| E | Sound Safari: 3 chapters × 6 challenges. | `docs/qa-evidence/safari-colour-20261025/safari-rehearsal.cjs`; `README.md`, local/build/public records. |
| E | Colour Mixing Lab: 3 labs × 6 missions. | `docs/qa-evidence/safari-colour-20261025/colour-rehearsal.cjs`; same report. |
| F | Shadow Match: 5 levels, 3/6/8/10/12 creatures and 4/5/6/7/8 matches. | `docs/qa-evidence/shadow-progression-20261023/rehearsal.cjs`, `production-touch.cjs`; `README.md`, local/public records. |

Reports contain exact runtime, viewport, saved-record snapshots and limitations. Some releases retain only source-bound JSON/render evidence, not a runnable harness; do not describe those as executable scripts. Before reusing a harness, check its documented runtime/profile assumptions. Do not reset or inject answers, targets, progress or rewards. Snapshot the report-listed record keys and hashes and expect only documented current-game changes. Pair 5 (`docs/qa-evidence/rocket-fuel-20261028/native-matrix.cjs`) snapshots `<player>_little_progress`, `<player>_rewards_v2`, and the other-child equivalents; its browser guard maps logical keys into `qa_rewards_20261024_`. Verify the guard precondition and do not reopen through an unguarded CLI.

## Cross-integration smoke across Pairs 1–11

Run only when each pair has passed its own release gate, using the canonical QA session and candidate/runtime identity recorded by its owner. Normal-home route counts for Pairs 1–7 are: (1) 18 sorting scenes + 24 Pattern missions; (2) 3 Astronaut missions + 3 Chess routes of 5 puzzles; (3) 12 coding missions + 3 writing projects; (4) 9 Solar destinations + 10 Memory levels; (5) Rocket and Fuel 5 levels each, with Amari starting at L3; (6) both Rescue games 5 levels, Amari L3 start; (7) Detective Amari 12 worlds/Askia 5 levels plus 4 Hangman missions. Pair 8 is Storybook Studio + Spelling Studio (still gated by its current report); Pairs 9–11 are queued and their route/level inventory must be taken from their own source-bound report when active, not inferred here.

At 390×740 and 1440×844, choose one representative authored path for each title through the real home/profile controls; use visible controls only. Confirm route/level, make a real wrong attempt then solve where supported, exercise clue/replay/mute and keyboard/pointer/touch inputs where available, wait through held feedback, complete, return through the actual parent route, reload, and verify the right child's saved progress/reward. On at least one path per pair, test leaving during active feedback. Record before/after snapshots using that pair's documented keys, plus one representative render per viewport; retain failure evidence, not successful traces/videos. This is a smoke pass: each pair's full matrix remains required for exhaustive content/level coverage.

For Pair 5, preserve the exact compact-shell opt-ins in `src/components/little/games/RocketBuilder.jsx` and `FuelUp.jsx`: both pass `pairSafeProgress`; Fuel Up also passes `manualNext`. `compactStart` and `compactDone` are available in `src/components/little/LittleGameShell.jsx` but are not these two games’ declared opt-ins in the current source. Verify Rocket’s level selector, target identity and assembly/tap/drag snap zones; verify Fuel Up’s can selection, held count, undo/recount and explicit Next transition. Check the level-up/sticker reward state plus Next and Home controls at 390×740 because the prior mobile overflow occurred with both reward panels present. Existing packaged clips cover the Pair 5 strings; this regression needs no paid narration or asset generation.

## Separate learning-wiki request (not delivered by game acceptance)

The queue records a distinct request for a child-friendly topic/animal search and explainer. Reusable local content already exists in `src/data/curriculumModules.js` (authored year-one topics, map skills and explanations), `src/data/solarDiscoveryPassport.js` plus `SolarSystem.jsx` (planet facts), and `src/data/dinoDetectiveBatch3.js` (scene and dinosaur facts). Existing art can be reused from `public/art/catalog-v3/` and the Solar System model/art assets; no content corpus copy or new paid generation is required.

Smallest useful separate feature: a local curated “Fact Finder” screen with a short search box, category chips (animals, dinosaurs, space, places, nature), and selectable cards. A selected card shows its existing authored title, one or two existing fact sentences, and current matching art; an optional “Explore this” link returns to the corresponding existing activity. Keep search local to bundled curated records, preserve existing facts verbatim, and do not add rewards, generated facts, provider calls, or claim that the game regression delivered the wiki. This remains an independently scoped, unaccepted feature requiring its own implementation and acceptance gate.
