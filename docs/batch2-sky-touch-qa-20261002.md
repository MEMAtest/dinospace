# Sky Shapes integrator touch QA — 2 October 2026

Frozen candidate 5285: JavaScript `index-Bt4ua6Fb.js`, CSS `index-Bwl2SrXA.css`, source checkpoint `48d03ec36396b59304b830b05e9f937f953fd5e8`. Isolated session `integrator-touch`, 390×844. These are root integrator checks, separate from independent tester keyboard evidence.

## Actual touch journeys

Navigated Amari → Creative Lab → Sky Shapes. Drew through the visible SVG guide points using browser CDP touchStart/touchMove/touchEnd input. Coordinates came from rendered polylines transformed through the SVG screen matrix; no app state, answers or progress were injected.

| Sky | Visible mission order | Numeric seed from actual UI diagnostics export | Result |
|---|---|---:|---|
| Starter / Cloud Meadow | Mountain Peak, Window Cloud, Kite, Round Sun | 4103245062 | Four completed missions, each 100% progress and 100% accuracy, 3 stars; explicit badge/reward, 6 total stars |
| Growing / Rainbow Ridge | Heart Balloon, Puffy Cloud, Cloud House, Bright Star | 555120310 | Four completed missions, including two-part Cloud House; each 100%/3 stars; badge/reward, 12 total stars |
| Challenge / Aurora Station | Rocket Ship, Winged Jet, Sky Castle, Moon Observatory | 1463193563 | Four completed missions with 4/3/6/4 outline parts; each 100%/3 stars; badge/reward, 18 total stars |

Heart Balloon's earlier incomplete automation run did not reproduce with this input. Completion progress is now 100% and remains distinct from accuracy.

## Persistence, navigation and diagnostics

After Starter reward, reloaded and reselected Amari: home retained 6 stars, Cloud Meadow map retained 4/4 flights and Aviator badge, Growing was unlocked. Continued Growing and Challenge through actual controls. Final Back to world returned to Creative Lab. Back to home then Grown-ups opened the actual three-second hold gate; Game troubleshooting → Download game log produced `output/playwright/batch2-5285-integrator-touch-log.json`.

Export has 54 Sky events, three start seeds above and three `level_complete` events. All `learning_attempt` records include numeric level/round/seed and only privacy-safe keys `at,difficulty,event,firstAttempt,game,level,round,seed`.

Screenshot `output/playwright/batch2-5285-touch-reward.png` captures Starter reward. Mobile document width 390 px; browser console zero errors/warnings. The captured request inventory through Starter reload contained 22 successful requests; this does not claim an inventory captured after every later step.

A first attempt to access Game troubleshooting as a button timed out: the actual control is a disclosure summary. Fresh snapshot and actual summary selection succeeded. An immediate chained Back to home navigation also needed a fresh snapshot/retry after hash routing; the final parent/home routes passed. These tool timing/locator limitations are preserved instead of treated as game failures.

Closed only this QA browser. No real child data, provider story generation or paid voice calls. Touch input is browser-emulated, not a physical handset. Physical speaker output is not verified. This report is local evidence and does not claim a production release or full 26-game acceptance.
