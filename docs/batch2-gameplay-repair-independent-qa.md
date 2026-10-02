# Batch 2 gameplay repair candidate — independent QA

## Scope and candidate identity

This is independent local browser evidence for the frozen candidate at `http://127.0.0.1:5290`, not production acceptance. I did not edit product source or use hidden app state, injected data, paid voice/story routes, or solver imports. Two fresh isolated Playwright sessions were used; each began with Amari at 0 stars. Before profile selection, both sessions blocked `**/api/voice` and `**/api/story/**` with 503 responses and sound was turned off.

| Candidate | Loaded assets | Viewports |
|---|---|---|
| Frozen 5290 | JS `index-CzoK39l9.js`; CSS `index-Bwl2SrXA.css`; SW v16 | Desktop 1280×720 and mobile 390×844 |

The local release note records 143/143 tests, lint, and build passing. Those are builder-reported checks, not rerun here. This candidate is not deployed. Existing 5283/5284/5285 browser evidence remains in `batch2-repaired-independent-qa.md` and `batch2-final-independent-qa.md`; it is not blended into this 5290 delta report.

## Sky Shapes — 5290 actual UI

### Desktop 1280×720

- Fresh Amari showed 0 stars. Opened Creative Lab → Sky Shapes → Start this sky. The first Starter mission was Mountain Peak. Clicked the visible green start on the tracing board, then pressed Enter and Space. The board remained `[active]`; Space advanced it to 15%, then repeated Space presses completed the outline at 100% sampled guide accuracy and earned 3 accuracy stars.
- Finished all four Starter missions: Mountain Peak, Kite, Window Cloud, and Round Sun. Clicked `Complete this sky`; the reward panel said `starter sky complete`, `Cloud Meadow`, and that the badge was saved. `Fly Rainbow Ridge` opened the Growing sky.
- Completed the Growing missions Heart Balloon, Cloud House, Bright Star, and Puffy Cloud. All displayed `Sky 2 · Rainbow Ridge`. Cloud House was a two-part outline (`0/2` initially): at 24% with `0/2`, Back → Keep playing restored Cloud House at the same 24% and `0/2`, with no completion/reward. Continued both parts to 2/2 and 100%. Heart Balloon was similarly left at 19%; Keep playing restored 19% and `0/4 saved`, without reward. Continued it to 100%.
- Completed Growing and clicked `Replay this sky`; it restarted at Puffy Cloud with `4/4 saved`, which differs from the initial Growing order that began at Heart Balloon. This verifies replay and that the replayed queue remained in Rainbow Ridge. `Back to world` returned to Creative Lab.
- Starter leave cancellation also passed: left Window Cloud at 12%; the leave dialog offered Keep playing / Back to world. Confirmed Back to world returned to Creative Lab with only the already completed Mountain Peak `1/4 saved`; the unfinished flight was not awarded.

### Mobile 390×844

- Fresh Amari showed 0 stars. Opened Creative Lab → Sky Shapes → Start this sky. Screenshot `.playwright-cli/batch2-5290-sky-mobile-first.png` shows the complete visible Mountain Peak board and on-screen keyboard guide.
- Clicked the visible green start point (195,314), then Enter and Space. The board became `[active]`; Space advanced to 15% and showed 100% sampled guide accuracy. Further Space inputs completed Mountain Peak at 100% with 3 accuracy stars. This is actual pointer-to-keyboard interaction on the mobile-sized viewport.
- On Window Cloud, left at 12%; Back to learning world opened the leave confirmation. Choosing Back to world returned to Creative Lab with `1/4 saved`. Screenshot `.playwright-cli/batch2-5290-sky-mobile-window.png` captures the in-progress board before leaving.

## Monster Math — 5290 actual UI

### Desktop 1280×720

- A second fresh Amari session began at 0 stars, sound off. Maths Missions → Monster Math → Start six questions opened Starter `Count to 10`.
- Actual visible prompts and accepted counts were apples 1, planets 8, stars 2, crystals 4, gems 2, and cookies 4. For Q1 apples, an incorrect 4 left the question and `0/6` in place with `Not yet` retry feedback. `Show me a clue` revealed a count-each-picture-once strategy. Correct 1 then showed the singular explanation `There is 1 apple.` This verifies the one-object prompt wording and explanation in the UI.
- Before answering Q1, Back to learning world → Keep playing restored the same apples question at `0/6`, with no completion. After the correct Q1 answer, the same leave confirmation and Keep playing preserved Q1’s `1/6` state and its feedback. Finished the episode through explicit Next/Finish controls: `Six questions complete`, `5 of 6 right first try`, `3 of 3 stars`, and `New episode badge saved for this child.`
- Replay episode started a new first question (flowers, six visible counters) rather than restoring the just-completed answer; leaving that replay through the confirmation returned to Maths Missions without a second completion.
- The Reward panel displayed `3 of 3 stars`, while subsequent Home and Grown-ups screens showed Total Stars `2`. The same display difference occurred after the separate mobile run. This is recorded as an unresolved reward-accounting question, not interpreted as a pass or product defect without the owner’s expected accounting model.

### Mobile 390×844

- A third fresh Amari session began at 0 stars, sound off. Starter Q1 showed `How many kites can you see?` with two visible counters. A deliberate 6 got retry feedback; the clue then showed the counting strategy; correct 2 revealed `There are 2 kites.`
- Completed all six questions: kites 2, balloons 9, flowers 4, balloons 2, flowers 2, crystals 8. The finish panel showed six complete, 5/6 first try, 3/3 stars, and a saved episode badge. Screenshot `.playwright-cli/batch2-5290-monster-mobile-q1.png` records the responsive question layout; `.playwright-cli/batch2-5290-monster-mobile-finish.png` records the reward panel.
- Evaluated visible rendered geometry on the finish screen: viewport 390×844, document width 390, document height 844; all four visible reward buttons were 56px tall and no horizontal overflow appeared.
- Home showed Amari at 2 stars. Switching player through the real profile chooser showed Askia at 0 stars with only the age-3 worlds; switching back restored Amari’s 2 stars and Monster Math under Play again. This is isolated synthetic-browser persistence/profile-separation evidence, not a claim about actual family data.

## Diagnostics, assets, and console

Downloaded the logs through the real Grown-ups → press-and-hold → Game troubleshooting → Download game log controls. Immediately copied the actual nested CLI downloads to unique evidence files:

- `.playwright-cli/batch2-5290-monster-desktop-diagnostics.json`: schema v2, 22 events and 7 milestones. Starter start seed `163618493` matches `level_complete` seed `163618493`; replay seed `1153938907` has a start and leave but no second completion. The export includes six `answer_correct`, one `answer_attempt`, one `hint`, three `leave`, one `level_complete`, and one `replay` event, as well as question/start events.
- `.playwright-cli/batch2-5290-monster-mobile-diagnostics.json`: schema v2, 16 events; Starter start and level-complete milestones both use seed `2951501065`.
- Both exports list retention as 300 events / 100 run milestones and only metadata keys: `game`, `event`, `at`, `level`, `round`, `seed`, `difficulty`, `firstAttempt`, and `hintType`. No names, story text, questions, facts, answer text, or recordings appear in the export schema/data. This fresh-profile run did not contain version-1 history, so backward compatibility with an existing v1 dataset was not tested.
- The desktop diagnostics export also retained two Sky completed-run seed pairs: Starter `297382263` (start/complete) and Growing `3839677600` (start/complete). Growing replay seed `1463840616` was left, with no completion milestone. All logged leave milestones corresponded to actual leave confirmations.
- The app JS/CSS and requested static app assets returned HTTP 200. Mobile static inventory included the expected hashed JS/CSS, Amari/Askia profile art, app icon, and Fuel Up art. Both desktop and mobile browser console commands returned 0 errors and 0 warnings. No `/api/voice` or `/api/story/` request appears in the reviewed requests; those routes were blocked before app profile selection and audio was off. The intentional blocked routes were not exercised by the tested controls.

## Candidate verdict and remaining gates

**Scoped 5290 checks passed:** desktop Sky pointer-to-keyboard and compound outline, incomplete Sky leave/restore and parent return, full Starter plus Growing completion/replay; mobile Sky pointer-to-keyboard and incomplete leave; desktop/mobile Monster Starter wrong/clue/correct, singular count explanation, finish/reward/replay; desktop leave confirmation before and after a correct answer; v2 export start/completion seed matching; mobile persistence/profile separation; asset and console checks.

This is not an overall 4.5 rating or release acceptance. Remaining evidence/decisions:

1. Resolve whether the visible Monster `3 of 3 stars` result versus Home/Grown-ups Total Stars `2` is expected accounting.
2. Version-1 log compatibility was not exercised because these were fresh isolated profiles with no existing v1 log.
3. Physical narration audibility was not tested; voice/story API routes were blocked and sound stayed off by design.
4. This candidate report covers Sky Shapes and Monster Math only. It is local 5290 proof, not production proof; the other Batch 2 games and production deployment require their separately scoped acceptance evidence.

