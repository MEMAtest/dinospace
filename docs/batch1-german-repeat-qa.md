# German Garage repeat live QA

Date: 2026-10-01 (Europe/London)  
Tester: isolated Playwright session `luna_german_repeat_qa`  
Canonical URL: https://dinospace-eight.vercel.app  
Tested browser document: deployment `dpl_2EZ4WnumfgsGXC22WYWtVQq7Ak1X`, source SHA `665bcd2d7edf231c70d9f64a8cf9661a8533ed3d`  
Loaded app assets: `assets/index-BQjGggG1.js` and `assets/index-rDO19aDV.css`

The canonical alias moved to a later Storybook-only deployment (`dpl_CZVgq9aXeCXnKKjHHbBnHLN9b7Cj`, SHA `3e97df50a9e035023821065dee4c3371cebaf96f`) during QA. I kept the already loaded SHA665 browser document intact. No result below is attributed to SHA3e97.

## Completed runs

All answers were made with visible game controls. The game presents German clues as audio and reveals each German word with its English meaning after a correct choice; I did not inspect application state or use solver code. I tested the Replay the German clue control and checked the corresponding browser request. I did not independently transcribe every audio clue.

| Run | Viewport | Band and completion | Target order (German → English) | Feedback and reward |
|---|---:|---|---|---|
| D1 | Desktop default | Level 1, Colour painter, 5/5 | Gelb → yellow; Grün → green; Grün → green; Gelb → yellow; Rot → red | Wrong then correct: orange→yellow on q1, pink→yellow on q4, purple→red on q5. Complete screen: 2/5 right first time, 1/3 stars. |
| D2 | Desktop default | Level 2, Vehicle workshop, 6/6 | Rakete → rocket; Reifen → tyre; Zug → train; Lenkrad → steering wheel; Bus → bus; Tür → door | Wrong then correct on q2 (seat→tyre), q4 (wheel→steering wheel), q5 (aeroplane→rocket→train→bus), q6 (light→door). Complete screen: 2/6 right first time, 1/3 stars, “New sticker!” Dino Egg Prize. |
| D3 | Desktop default | Level 3, Direction driver, 7/7 | Links → left; Zurück → back; Halt → stop; Geradeaus → straight ahead; Rechts → right; Langsam → slowly; Links → left | Wrong then correct on q2 (straight ahead, right→back) and q5 (back→right). Complete screen: 5/7 right first time, 2/3 stars, “New sticker!” Super Star. |
| M1 | 390×844 | Level 3, Direction driver, 7/7 | Halt → stop; Links → left; Geradeaus → straight ahead; Zurück → back; Rechts → right; Langsam → slowly; Links → left | Wrong then correct on q1 (slowly, right→stop), q3 (stop, right, back, slowly→straight ahead), q4 (right, slowly, straight ahead, left→back), q5 (slowly, left→right). Complete screen: 2/7 right first time, 1/3 stars. |
| M2 | 390×844 | Level 2, Vehicle workshop, 6/6 | Auto → car; Rad → wheel; Zug → train; Sitz → seat; Fahrrad → bicycle; Lenkrad → steering wheel | Wrong then correct on q2 (light→wheel), q3 (aeroplane→train), q6 (light, tyre→steering wheel). Complete screen: 3/6 right first time, 2/3 stars, “New sticker!” Rescue Truck. |

The replayed Level 3 queue changed between desktop and mobile (`Links, Zurück, Halt, Geradeaus, Rechts, Langsam, Links` vs `Halt, Links, Geradeaus, Zurück, Rechts, Langsam, Links`). Level 2 also presented a different target order across its desktop and mobile runs. All three progression bands were unlocked and completed through the ordinary UI. The completion screen offered Replay level and the expected next/world navigation.

## Halt interaction anomaly

An earlier incomplete desktop attempt on the same loaded SHA665 showed Level 3 round 5/7. The saved snapshot listed all six choices as enabled; sequential UI clicks on `stop`, `straight ahead`, `slowly`, `right`, `left`, and `back` each left the round at 5/7 with “Not quite” feedback. The capture does not establish whether that was a stale-reference/tool-sequencing issue or an intermittent app issue, so it is recorded as an unreproduced anomaly, excluded from completed-run counts, and not treated as either a product defect or a pass.

Evidence:

- Failed attempt snapshot: [page-2026-09-30T22-54-09-370Z.yml](../.playwright-cli/page-2026-09-30T22-54-09-370Z.yml)
- Failed attempt screenshot: [page-2026-09-30T22-54-32-525Z.png](../.playwright-cli/page-2026-09-30T22-54-32-525Z.png)
- In a fresh desktop run, clicking `stop` with an exact accessible-name locator after Replay on a `Halt` clue advanced to 4/7 and showed “Richtig! Halt means stop.” In the mobile Level 3 run, Halt also passed after two wrong answers. These successes did not erase the earlier anomaly.

## Mobile, audio, navigation, and artifacts

- At 390px, `document.documentElement.scrollWidth` measured 390px. The German Garage intro showed its three level controls at 48×48 CSS px; visible play/back controls were larger. The mobile completion screen’s visible buttons measured at least 56×56px.
- The `World` completion action returned to Explore & Languages, and the German Garage card opened its intro. A screenshot of the Explore & Languages page and the German Garage Level 3 intro were captured at 390px.
- Replay was exercised on the German `Halt` clue; `GET /audio/de/halt.mp3` returned 200. Directional and vocabulary audio requests observed during these runs returned 200, including `rechts`, `langsam`, `links`, `geradeaus`, `halt`, `zurueck`, `auto`, `rad`, `zug`, `sitz`, `fahrrad`, and `lenkrad`.
- The loaded SHA665 JavaScript, CSS, game illustrations, and reward artwork returned 200. Browser console after the runs: 0 messages, 0 errors, 0 warnings.
- Captures: mobile German Garage intro [page-2026-09-30T23-11-42-272Z.png](../.playwright-cli/page-2026-09-30T23-11-42-272Z.png); desktop Level 1 fact view [page-2026-09-30T22-49-46-995Z.png](../.playwright-cli/page-2026-09-30T22-49-46-995Z.png) and completion [page-2026-09-30T22-50-09-787Z.png](../.playwright-cli/page-2026-09-30T22-50-09-787Z.png); desktop Level 2 completion [page-2026-09-30T22-52-06-935Z.png](../.playwright-cli/page-2026-09-30T22-52-06-935Z.png); desktop Level 3 clue/feedback [page-2026-09-30T23-00-11-882Z.png](../.playwright-cli/page-2026-09-30T23-00-11-882Z.png) and completion [page-2026-09-30T23-01-53-442Z.png](../.playwright-cli/page-2026-09-30T23-01-53-442Z.png); mobile Level 3 completion [page-2026-09-30T23-05-47-108Z.png](../.playwright-cli/page-2026-09-30T23-05-47-108Z.png); mobile Level 2 completion [page-2026-09-30T23-08-15-784Z.png](../.playwright-cli/page-2026-09-30T23-08-15-784Z.png); mobile world return [page-2026-09-30T23-11-39-698Z.png](../.playwright-cli/page-2026-09-30T23-11-39-698Z.png).

This report records three complete desktop runs and two complete 390px runs under SHA665. It does not assess premium visual quality or any 4.5 gate.

## Immutable local seeded-history candidate

This is an independent local browser check, separate from both production identities above. I used isolated Playwright session `luna_german_seed_qa_static` against the copied static build `http://127.0.0.1:5174` (no HMR). Candidate bundle: `assets/index-e0VyN0Zq.js` and `assets/index-BEMHwIEo.css`. This build was uncommitted and has no production SHA; do not attribute these results to the canonical site.

| Run | Viewport | Completed band | Visible/audio target order | Result |
|---|---:|---|---|---|
| Seed D1 | 1280×900 | L1 Colour painter, 5/5 | Schwarz, Schwarz, Rosa, Orange, Lila | First Schwarz included deliberate brown→black retry; 3/3 stars and Rocket Star. The first two questions were in alternating paint then garage/park scenes, so this is a confirmed early repeat across modes before the colour pool was exhausted. |
| Seed D2 | 1280×900 | L2 Vehicle workshop, 6/6 | Auto, Lenkrad, Rakete, Tür, Flugzeug, Rad | 6/6 first try, 3/3 stars. |
| Seed D3 | 1280×900 | L3 Direction driver, 7/7 | Geradeaus, Langsam, Rechts, Halt, Zurück, Links, Geradeaus | Wrong→right on Halt; `Halt means stop` explanation. The final repeat followed the six-item pool. 3/3 stars and Dino Egg Prize. |
| Seed M1 | 390×844 | L1 Colour painter, 5/5 | Grün, Rosa, Weiß, Rot, Braun | Wrong blue→correct green; 4/5 first try, 3/3 stars and Super Star. |
| Seed M2 | 390×844 | L2 Vehicle workshop, 6/6 | Zug, Reifen, Bus, Sitz, Fahrrad, Licht | 6/6 first try, 3/3 stars. |
| Seed M3 | 390×844 | L3 Direction driver, 7/7 | Langsam, Rechts, Halt, Zurück, Links, Geradeaus, Langsam | Wrong→right on Halt; replay and explanation worked. 6/7 first try, 3/3 stars and Rescue Truck. The last repeat followed the six-item pool. |

The six completed runs cover each band at both viewports and exercise wrong/right, replay, durable explanations, finite endings and rewards. A reload/reselect check after M3 opened L3 with Rechts first, the only item unseen in the recorded trailing history; the exact accessible `right` control produced `Richtig! Rechts means right.` This verifies the seeded-history behavior after reload in the candidate. `Replay level` also began with an unseen target after a completed run. At mobile completion, document width stayed 390px and buttons measured 56px or larger. At desktop the games reached their level review screens. The previous failed Halt attempt remains an unreproduced anomaly and is excluded.

Network chronology for Seed D1 shows the duplicate precisely: Schwarz audio requests 16–21 occurred during the first painted-car question and its retry; after the garage-scene asset loaded at request 22, Schwarz was requested again at 23–25 for the next question. The later questions were Rosa, Orange, and Lila. This is a real paint/park cross-mode rotation gap in this candidate; five different targets cannot be claimed. Root has since added shared colour history to fix cross-mode repeats. This candidate predates that fix, so recheck it only on the new candidate identity.

For Seed D2, target order was Auto, Lenkrad, Rakete, Tür, Flugzeug, Rad. For D3 it was Geradeaus, Langsam, Rechts, Halt, Zurück, Links, Geradeaus. Mobile M2 and M3 orders are recorded in the table. German audio replay requests and candidate JS/CSS/illustrations returned 200. After these runs, console reported 0 errors and 0 warnings; failed/non-200 network requests: none. Screenshots: desktop L1 completion [page-2026-10-01T00-02-27-202Z.png](../.playwright-cli/page-2026-10-01T00-02-27-202Z.png), desktop L3 Halt feedback [page-2026-10-01T00-21-11-914Z.png](../.playwright-cli/page-2026-10-01T00-21-11-914Z.png), desktop L3 completion [page-2026-10-01T00-22-47-929Z.png](../.playwright-cli/page-2026-10-01T00-22-47-929Z.png), mobile L1 completion [page-2026-10-01T00-26-02-560Z.png](../.playwright-cli/page-2026-10-01T00-26-02-560Z.png), mobile L2 [german-seeded-M2-complete.png](../.playwright-cli/german-seeded-M2-complete.png), mobile L3 [german-seeded-M3-complete.png](../.playwright-cli/german-seeded-M3-complete.png).

## Shared-colour-history visual candidate

I then used fresh isolated session `luna_german_final_5175` at 390×844 on the later immutable local build `http://127.0.0.1:5175`, with JS `assets/index-BGEGW0jB.js` and CSS `assets/index-gL0RBHbW.css`. This is still a local candidate, not a deployed SHA. The changed scene art and fact typography loaded visibly. I completed the whole five-round Level 1 path with actual answer buttons, replayed each German clue, and saw durable German-to-English feedback. Order: Orange (paint), Grün (garage), Schwarz (paint), Rosa (garage), Lila (paint). All five targets differed across alternating modes; the earlier duplicate Schwarz did not recur. Every replayed audio URL returned 200. The finish screen showed 5/5 right first time, 3/3 stars, and Rocket Star. Replaying the level after completion began with Rot, a target not in the just-completed five; the parent leave dialog returned to Explore & Languages through Back to world.

At 390px, document width was 390px. Every visible German Garage button measured at least 48px high; lesson tabs were 48×173px, Back/Sound/Replay buttons 48×48px, and answer choices 120px high. Console errors/warnings: zero. No non-200 requests were observed. Mobile completion capture: [page-2026-10-01T00-49-05-639Z.png](../.playwright-cli/page-2026-10-01T00-49-05-639Z.png). The checked scene shows the white car painted Schwarz at [page-2026-10-01T00-48-19-611Z.yml](../.playwright-cli/page-2026-10-01T00-48-19-611Z.yml). This verifies the corrected cross-mode color history for one mobile run, plus replay selection; it does not replace the seeded desktop/mobile run gate on the final release identity.


## Local German Garage navigation and progression fix

This is separate from the production runs above. I verified the local Vite build at `http://127.0.0.1:5173` after the `GermanGarage.jsx` navigation/tap-target and extra-practice progression edits. These local results are not attributed to the current production deployment.

- At 390×844 and 1280×900, all 11 lesson buttons were visible and selectable with More practice expanded. The desktop document width stayed at 1280px; mobile stayed at 390px. Each lesson button measured 48px high at both sizes. Every button in the German Garage header, lesson navigation, and lesson main area measured at least 48px in each viewport.
- I selected every lesson tab at both viewports and pressed Replay the German clue on each. Every tab rendered its mission prompt and answer choices; all visible lesson images reported loaded (`naturalWidth > 0`). German audio requests were served successfully as HTTP 206 Partial Content (including the lesson clips loaded during the tab/replay sequence); no failed/404/500 requests appeared. Console had zero errors or warnings; one React DevTools informational message appeared.
- After entering German Garage, Back to learning world opened the leave confirmation; choosing Back to world returned to Explore & Languages.
- Progression check: in Level 1, I answered the Numbers bonus prompt incorrectly twice and correctly once. While the correct-answer explanation was visible, the core counter remained `Level 1 · 1 / 5` and the session mission bar remained `0/5`. Next word returned to the Farben core prompt at `1 / 5`. An incorrect core answer showed “Not quite”; the next correct answer showed `Richtig! Blau means blue.` and advanced the counter to `2 / 5`.
- Mobile menu capture: [page-2026-09-30T23-22-15-972Z.png](../.playwright-cli/page-2026-09-30T23-22-15-972Z.png). Desktop menu capture: [page-2026-09-30T23-20-33-941Z.png](../.playwright-cli/page-2026-09-30T23-20-33-941Z.png).

## Focused clean-release live confirmation

I ran this separately in fresh isolated browser session `luna_german_release_confirm` after the German navigation/progression fix was released. These results belong to this exact canonical deployment:

- Canonical alias: https://dinospace-eight.vercel.app
- Immutable deployment: https://dinospace-6ri0cwqd6-memas-projects-23a0001d.vercel.app
- Deployment: `dpl_RSfE9gs3q9CLeZWGgUo5Jotj2Dq1`
- Git SHA: `c8a5155059ac0bdaf30cf75bf5416281e275fb5e`
- Rendered assets: `assets/index-DnXwhuXc.js` and `assets/index-DLS0TiZ4.css` (both HTTP 200)

In the mobile 390×844 Level 1 run, I opened More practice → Zahlen. The visible choice `three` produced `Richtig! Drei means three.` and the explanation. The core counter stayed at Level 1, 1/5, and daily mission stayed at 0/5. Next word returned to Farben at Level 1, 1/5. Braun then advanced the core to 2/5. In Garage round 2, red showed “Not quite”; white then showed `Richtig! Weiß means white.` and advanced the core to 3/5.

All 11 More practice tabs were selected at both 390×844 and 1280×900, and Replay was clicked for every tab in each viewport. I checked scene-image completion after render settled; every visible scene image had `naturalWidth > 0`. An immediate post-switch mobile check had observed some lazy images before their load completed; after waiting 350ms, all 11 images were complete. German audio requests observed for the lesson replays returned HTTP 200. At 390px the document width was 390px and all 11 tabs measured 48px high (173px wide). At 1280px the document width was 1280px, all 11 tabs measured 48px high, and no header, tab-navigation, or lesson-main buttons were under 48px.

The floating daily mission tracker at 390px measured 136×78px at x242/y754. Its arrow measured 48×48px at x319/y763. Clicking “Play today’s mission: Answer 5 addition questions” through that arrow opened the Addition Adventure intro. German’s “Back to learning world” prompted “Leave the game?”; selecting “Back to world” returned to Explore & Languages. Browser console showed 0 errors and 0 warnings.

Clean-release mobile capture with the mission widget visible: [page-2026-09-30T23-48-02-920Z.png](../.playwright-cli/page-2026-09-30T23-48-02-920Z.png).
