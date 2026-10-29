# Final catalogue and retained-game integration smoke

This protocol tracks a bounded final integration smoke for the 14 older lanes in `queue.json`'s `retainedReleasedScopes`, plus catalogue entry/return coverage across all 35 normal Amari activities and 10 normal Askia routes. The 14 retained lanes are not the newly delivered Pair 1–11 activities. Their prior source-bound gameplay reports remain the content-acceptance evidence; the pending integration pass checks cross-release navigation, layout, saved-record isolation and representative interactions. It is not a full repeat content certification. Pairs 1–11, including Pair 8 and Pair 11, have passed their own release gates. Fact Finder is a separately accepted Pair 11 feature; that acceptance does not establish recovery of historical family stories.

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

The bounded driver is `retained-integration-native.cjs`. It accepts the already-leased `page`, checks the exact compiled entry and namespacing guard through `integration-native.cjs`, and enters games through visible world and game cards. It loads eight title-specific visual/board recipes from `retained-visual-exercises.cjs` and six maths recipes from `retained-maths-exercises.cjs`; callers may still supply an explicit `exercises[id]` map. Recipes derive task identity from visible prompts and models, make a wrong attempt, solve through visible controls or guidance, verify same-task retry where applicable, and measure/click held Next. Optional replays are checked against newly observed packaged media. The runner checks that audio stops on the visible parent `Worlds` control and compares storage hashes against each lane's exact declared keys. It creates no page/session, navigates no URLs, seeds answers, or writes app storage. Missing lane callbacks are hard failures; a source record or historical screenshot is not counted as a live sample. Run once for each viewport after Pair 11's own acceptance. Its report is a bounded integration smoke only, not full content acceptance.

The Playwright CLI callback VM has no Node `require`, `fs`, or `path`. Load these CommonJS recipe modules in the Node host before creating the callback (or inline the four source modules in the bounded runner wrapper); do not call `require` from inside the browser callback. The Letter Trace guide table is embedded as the same authored normalized path data displayed on its tracing canvas, so the callback needs no filesystem lookup.

New retained-lane reports must be invoked with the exact owner-supplied `--runtime-sha` and the expected compiled entry. The runner records the source checkout HEAD separately, verifies the served page's origin, namespace and exact module entry, and does not derive production identity from the historical `canonicalRelease` ledger field. The existing catalogue-entry runner covers all 35 Amari and 10 Askia visible routes; it uses the same explicit SHA and exact-entry binding. Both runners use only the already-leased page and retained profile. For example:

```sh
FINAL_QA_OWNER=<active-owner> python3 docs/qa-evidence/final-integration-20261029/run-retained.py \
  390 740 /assets/arcade-<exact-entry>.js --origin https://dinospace.netlify.app \
  --runtime-sha <exact-40-character-runtime-sha>
```

## Cross-integration smoke across Pairs 1–11

Run only after each pair's own release gate, using the canonical QA session and candidate/runtime identity recorded by its owner. The source-reconciled catalogue scope is 35 unique Amari game IDs and 10 normal Askia routes: eight of those Askia routes overlap with Pair 1–11 upgrades, while Count the Stars and Shadow Match are retained routes. Pair-specific level and content coverage stays in each pair's source-bound report; this integration smoke does not infer or repeat those matrices.

At 390×740 and 1440×844, enter all 35 Amari cards through their ordinary worlds and all 10 Askia routes through their ordinary LittleHome world cards. Check the rendered entry/art, parent return, storage and reward deltas, errors and exact bundle identity. These route checks do not imply a gameplay pass for any lane. For the 14 retained lanes, use the existing source-bound recipes for one representative interaction where supported, preserving prior full-content evidence rather than replaying every scene or mission. At least one path should cover leaving during held feedback. Record before/after snapshots using each lane's documented keys, plus one representative render per viewport; retain unique failures and compact successful summaries.

For Pair 5, preserve the exact compact-shell opt-ins in `src/components/little/games/RocketBuilder.jsx` and `FuelUp.jsx`: both pass `pairSafeProgress`; Fuel Up also passes `manualNext`. `compactStart` and `compactDone` are available in `src/components/little/LittleGameShell.jsx` but are not these two games’ declared opt-ins in the current source. Verify Rocket’s level selector, target identity and assembly/tap/drag snap zones; verify Fuel Up’s can selection, held count, undo/recount and explicit Next transition. Check the level-up/sticker reward state plus Next and Home controls at 390×740 because the prior mobile overflow occurred with both reward panels present. Existing packaged clips cover the Pair 5 strings; this regression needs no paid narration or asset generation.

## Fact Finder and historical-story boundary

Fact Finder is implemented and separately accepted in Pair 11. Its production evidence covers the curated 34-topic library, search/category/alias behavior and normal Explore destinations. The retained integration smoke may verify its catalogue entry and parent return; it does not repeat the full library matrix. Historical personal stories remain a separate data-recovery question and are not implied to have been recovered by Fact Finder or Storybook Studio acceptance.
