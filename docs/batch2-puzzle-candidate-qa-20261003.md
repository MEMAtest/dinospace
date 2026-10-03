# Batch 2 Puzzle Pop candidate regression QA — 2026-10-03

## Scope and identity

This is a separate local-candidate regression supplement to [the original production baseline acceptance report](batch2-fresh-acceptance-20261003.md). It does not replace or amend the six-run Puzzle Pop / Spot production matrix recorded there. I used a new Playwright browser session, `luna_puzzle_candidate_qa`, first opened at `about:blank`; `/api/voice` and `/api/story/**` were intercepted with 503 before navigating to the local app or selecting Amari. The candidate was served at `http://localhost:5194`, and the page loaded `/assets/index-Dz1r44Ih.js`. Parent identified the frozen source as `6b84554e7a1d21b3db658d213a2298462c78599e`; this is **local candidate evidence**, not production verification. No application code was changed by this QA.

## Puzzle Pop timing and keyboard checks

The visible Hint control supplied the piece and target in every run; wrong placements and recoveries used ordinary visible board/tray buttons or keyboard focus plus Enter. No imported solver or hidden game-state access was used. The candidate quick recovery was tested at both 1280×800 and 390×844.

| Viewport / case | Observed result | Evidence |
|---|---|---|
| Desktop 1280×800, wrong → correct during one board | River Valley: deliberately wrong space 1 produced “Not there yet…”; hinted correct space 2 immediately produced “Great fit! 1 of 4 pieces are in place.” After 1.15 seconds it still displayed the Great fit message and 3 pieces left. | `run-code` return text retained in session transcript. Candidate asset `/assets/index-Dz1r44Ih.js`. |
| Desktop 1280×800, final wrong → correct | After three pieces were placed, the last piece’s hint identified piece 3 / space 3. Clicking occupied space 1 produced “Not there yet…”; clicking correct empty space 3 immediately completed River Valley and showed its picture fact. After 1.2 seconds the same completion message and fact remained; no stale retry message replaced them. | Board before final placement `.playwright-cli/page-2026-10-03T01-14-43-526Z.png`; last-piece mobile screenshot below shows the analogous final-board setup. Exact after-text returned in the run-code transcript. |
| Mobile 390×844, keyboard wrong → correct | On Robin’s Tree, focused the hinted visible piece and pressed Enter; focused a different empty space and pressed Enter; then focused the hinted target and pressed Enter. The wrong placement gave retry guidance, the correct placement gave Great fit, and after 1.15 seconds Great fit remained. | Screenshot of mobile board with one target remaining `.playwright-cli/page-2026-10-03T01-16-50-678Z.png`; run-code output returned selected, wrong, correct, and delayed text. |
| Mobile 390×844, final wrong → correct | After three pieces were placed, wrong space 1 gave retry guidance; correct empty space 3 completed Robin’s Tree and displayed “Robins use their beaks to find small insects and worms in the soil.” After 1.2 seconds the completion and fact remained. | Exact three-stage text captured via run-code return. |
| Desktop 1280×800, keyboard wrong → correct | On Dino Park Picnic, focused the hinted visible piece and pressed Enter; focused a different empty space and pressed Enter; focused the hinted target and pressed Enter. Retry guidance was replaced with Great fit and remained after 1.15 seconds. | `.playwright-cli/page-2026-10-03T01-18-51-646Z.png`; run-code output returned selected, wrong, correct, and delayed text. |

**Puzzle candidate regression: pass** for the tested wrong-answer timer and focused-button keyboard recovery at both widths. The original d312 production bundle reproduced stale wrong-answer text overwriting Great fit after 1.1 seconds; these candidate checks did not. The candidate’s final-piece checks at both widths retained the completion fact after the same timer window.

The candidate diagnostics export records Puzzle seed `2298502897`, level 0, with visible-action `answer_attempt` events (both first attempt and later retries), scene completions for rounds 1 and 2, and the partial round 3 before navigation away. This is only a narrow regression check and does not add to the six-run production acceptance counts.

## Spot Difference first-miss telemetry delta

At the candidate’s normal default Bright-Eyed Beginners / Starter entry, seed `1169211189`, I clicked the visible blank “Search Picture B for a change” control twice without completing the pair. The UI showed “Not that spot yet. Compare the same area in Picture A.” after each miss. I left using the visible in-game confirmation and downloaded diagnostics from the Grown-ups “Game troubleshooting” section.

The user-facing diagnostics export shows, for Spot level 0 round 1, two `answer_attempt` events: first miss `firstAttempt:true`, second miss `firstAttempt:false`. No pair completion is claimed. This confirms the candidate’s first-miss telemetry delta via actual controls.

- Candidate export: [`batch2-puzzle-timer-candidate-6b84554-20261003.json`](../output/playwright/batch2-puzzle-timer-candidate-6b84554-20261003.json)
- SHA-256: `6caedb90ccc703d2c098085caac10a66a4f0c48224afec62ed46696788d8a830`
- Export contains 44 events and 4 milestones; retained fields include game/event/time/level/round/seed/firstAttempt and no story text or child identifiers.

## Boundary

This verifies only the local `6b84554e7a1d21b3db658d213a2298462c78599e` candidate. Do not attribute it to any deployment. Production audio remains uncertified because `/api/voice` was intentionally intercepted; this was not treated as a live provider failure. The broader 4.5 quality score remains outside this delta report and must be based on the complete production acceptance matrix.
