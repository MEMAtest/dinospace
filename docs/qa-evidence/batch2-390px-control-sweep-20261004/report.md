# Batch 2 canonical 390px control-class sweep

**Run date:** 2026-10-04 (Europe/London)

**Canonical URL:** <https://dinospace-eight.vercel.app>

**Deployment:** `dpl_31hURucAfoMNNhQMJpKBGvcAkX6u` (READY)

**Frozen source:** `2923ca6e10c46609504f41529bf46286e17f8434`

**Identity evidence:** [`sky-accessible-progress-canonical-identity-20261004.json`](../sky-accessible-progress-canonical-identity-20261004.json)

This is a rendered-control and viewport-boundary check for the four Batch 2 games. It complements, but does not replace, their retained full-game production matrices and current-release deltas. It does not assign or change rubric scores.

## Identity, guards, and integrity

Before app navigation, I re-fetched the eight identity-listed production files. Each returned HTTP 200 and matched its expected SHA-256 in the identity record. The record binds the canonical alias to source `2923ca6e10c46609504f41529bf46286e17f8434` and deployment `dpl_31hURucAfoMNNhQMJpKBGvcAkX6u`.

The fresh mobile profile began at `about:blank`, was sized 390×844, and installed `/api/voice` and `/api/story` routes returning HTTP 204 before navigation. The route list confirmed both guards throughout the session. No provider call, seed, answer, profile, local storage or progress injection was used. The profile used ordinary Age 6+ Amari navigation and earned progress through visible controls. Sound stayed off. The browser console had zero messages, errors or warnings. Static requests succeeded; packaged audio resources returned both HTTP 200 and range HTTP 206 during normal loading, which proves neither playback nor listening quality.

## Directly measured controls

Dimensions below are CSS pixels from visible elements’ rendered rectangles. Unless stated, the page document width remained exactly 390px. No horizontal overflow was observed. Below-fold actions were reachable by ordinary vertical scrolling or browser locator auto-scroll; no hidden state was used.

| Game | Map and lock controls | Active / feedback / completion controls | Smallest direct measurement |
|---|---|---|---|
| **Puzzle Pop** | Back and sound 48×48; three chapter buttons 310×76; Start chapter 203.8×56. Starter and Growing were completed through ordinary UI, unlocking the 5×5 Challenge. One Nature Lab Challenge picture was completed with visible mapping hints; the remaining three Challenge pictures were not played. | 2×2 board spaces 128×128; 3×3 board spaces 84×84; 5×5 Challenge spaces 48.8×48.8 (25 spaces); shuffled tray piece buttons 50.7×50.7; Hint 87.8×48; Hear again 230×48. A deliberately wrong piece placement returned “Not there yet” and left the piece available. At 5×5, visible mapping hints selected ordinary accessible piece/space controls; after the 25th correct placement, a held fact and Next picture appeared. Back opened a Keep playing/Back to world confirmation; choosing Back to world returned to Creative Lab. | **48.8×48.8** (5×5 board spaces; smallest measured). Tray pieces measured 50.7×50.7. The board meets the 48px threshold with about 0.8px margin; controls are tight but pass the specified minimum. |
| **Spot the Difference** | Back and sound 48×48; chapter buttons 310×76; Start chapter 203.8×56. Starter was available, Growing and Challenge were visibly locked at 0/4. | Hear clue 132.8×48; Magnifier 173.4×48; full Picture B search surface 334×250.5; three visible target buttons 56×56. A blank-area tap returned “Not that spot yet”; the magnifier showed a distinct target hint; found targets disappeared from the active set; all three Starter differences produced a held Picture fact and Next picture. | **48×48** (shared navigation/audio controls); **56×56** spot targets. This run did not unlock the seven-target Challenge. |
| **Sky Shapes** | Back and sound 48×48; map cards 366×112; Start this sky 326×64. The fresh candidate profile showed later skies locked. | Tracing board 342×222.3; Hear 202.1×48; hint 181.1×48; Restart 154.9×48; Next mission 139×48. A short visible-circle trace returned “Almost. Bring your trail back close to the glowing dots”; Restart reset to 0; the completed circle showed held fact, rating and saved stars before Next. | **48×48** (header and mission actions). |
| **Monster Math** | Back and sound 48×48; episode cards 366×132 (Starter/Growing) and 366×112 (Challenge); Start six questions 326×64. After visible Starter completion, Growing unlocked and Challenge remained locked. | Hear question 246.6×48; four answer choices 161×64; Show me a clue 334×48; Next question 176×56. Counting wrong answer returned “Not yet”; clue was one-use; correct answer kept the picture model and distinct explanation visible until Next. Growing addition wrong → clue → correct followed the same retained-answer flow. Episode completion offered Episode map, Replay episode, Next episode and Back to world. | **48×48** (shared header and replay audio control). Several Next/Start actions sat below the initial viewport and were reachable by normal scroll. |

The Spot accessibility snapshot places the full-picture search action before its smaller target controls, but a visible-DOM check found no nested `button` elements or nested `[role=button]` elements: the large search button and target buttons were sibling controls under a shared container. I found no basis in this run to report a nested-interactive defect. The three Starter targets were spatially distinct, with no target-to-target overlap observed.

## State coverage observed in this run

- **Puzzle Pop:** chapter map with locked cards; ordinary Starter progression through all four 2×2 pictures; wrong placement; hint-selected piece/space; correct placements; held fact; Next picture; completed Starter badge; Next chapter; all four Growing 3×3 pictures via visible mapping hints; unlocked Challenge. Nature Lab 5×5 showed 25 accessible board spaces and 25 piece positions; final remaining-piece hint and correct placement reached “Picture complete! Read the picture fact below.” with the leaf fact held. Next picture was available. Back opened the leave dialog; Back to world returned to Creative Lab. A return through Creative Lab showed Challenge selected at 1/4 and a Replay chapter control. The remaining three pictures, replay result, and Challenge chapter-complete badge remain unobserved.
- **Spot the Difference:** Starter map and locked later bands; active 3-target pair; two magnifier hints available; blank-tap feedback; first and subsequent found-target states; completed pair with held fact and Next picture. The run did not finish four pairs, so later chapter unlocks and Challenge presentation were not directly observed.
- **Sky Shapes:** map with saved Starter progress and disabled Growing/Challenge cards; active one-part circle mission; visible hint; incomplete-trace feedback; Restart; successful completion with held fact/rating/reward; Next mission. The direct UI delta was retained separately in the canonical accessible-progress report.
- **Monster Math:** locked map and six-question Counting activity; wrong, clue, correct/held-answer and episode-completion states; unlocked Growing activity; wrong, clue, and correct held-answer state. The Challenge episode and its number-line controls were not unlocked in this run.

Across all captured active states, interactive buttons and measured board/target actions were at least 48px per dimension. Several long screens placed mission questions, answer/Next controls, puzzle trays, or the Spot Picture B surface below the first viewport; those controls remained reachable through ordinary scrolling. Screenshots preserve representative map, active, retry, and held-fact states.

## Evidence lineage and limits

This candidate’s eight exact hashes bind the app shell and runtime to the current canonical release. The [retained 3cdf full production matrix](../batch2-production-final-20261003/report.md) and [native-media/mobile follow-up](../batch2-production-final-20261003/follow-up-report.md) include additional exact-source production observations: Spot Challenge seven-target pairs with 56×56 controls and zero target-to-target overlap at 390px, and broad mobile Sky Starter/Growing completion. Those historical checks retain their own deployment and scope; they are not represented as fresh actions in this run. Earlier Puzzle 5×5 target-size notes on separate local/editorial candidates are not substituted for current canonical evidence: this run directly measured the current 5×5 board and tray. It is limited to one normally earned Challenge picture, not all Challenge scenes or replay.

The current direct sweep unlocked and measured Puzzle Pop’s 5×5 Challenge (all 25 spaces and the shuffled tray); one Challenge picture was completed and held. The other three Challenge pictures, replay flow and Challenge chapter-complete badge remain unobserved. Spot’s seven-target Challenge and Monster Math’s Challenge were not unlocked in this session. Thus this is still not a complete fresh state matrix for every game-specific class. Puzzle 5×5 spaces measure 48.8px, only 0.8px above the required 48px floor. No failure was seen among the measured current-canonical controls. Spot’s Challenge geometry retains only the prior exact-runtime production evidence below; it was not reproduced here.

No human audio listening, full-catalog art review, replay-order certification, full persistence/sibling isolation, rubric re-score, or 4.5 acceptance is claimed. The four games remain in progress until every game-specific and shared mandatory gate is independently satisfied.

## Screenshots

- Puzzle: [`puzzle-map-locked-chapters.png`](puzzle-map-locked-chapters.png), [`puzzle-2x2-active.png`](puzzle-2x2-active.png), [`puzzle-wrong-placement.png`](puzzle-wrong-placement.png), [`puzzle-3x3-active.png`](puzzle-3x3-active.png), [`puzzle-5x5-active-last-piece.png`](puzzle-5x5-active-last-piece.png), [`puzzle-5x5-nature-lab-complete-held-fact.png`](puzzle-5x5-nature-lab-complete-held-fact.png), [`puzzle-5x5-leave-confirmation.png`](puzzle-5x5-leave-confirmation.png)
- Spot: [`spot-map-locked-chapters.png`](spot-map-locked-chapters.png), [`spot-starter-active.png`](spot-starter-active.png), [`spot-wrong-tap.png`](spot-wrong-tap.png), [`spot-fact-held.png`](spot-fact-held.png)
- Sky: [`sky-map-or-active.png`](sky-map-or-active.png), [`sky-wrong-route-feedback.png`](sky-wrong-route-feedback.png), [`sky-flight-complete.png`](sky-flight-complete.png)
- Monster Math: [`monster-counting-active.png`](monster-counting-active.png), [`monster-growing-active.png`](monster-growing-active.png)
