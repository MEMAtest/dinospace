# Batch 3 copy and keyboard repair: independent local delta

Date: 2026-10-03  
Candidate URL: `http://127.0.0.1:5271`  
Source: `a1eec24552c99529ba30ed38d10492a6ce1c7829`  
Identity: [`batch3-copy-keyboard-repair-identity-20261003.json`](../batch3-copy-keyboard-repair-identity-20261003.json)

## Scope and safeguards

This is a narrow check of the Count the Stars prompt grammar and Letter Trace keyboard-progress repair, after the canonical production regression recorded in [`batch3-canonical-production-independent-20261003`](../batch3-canonical-production-independent-20261003/report.md). It is not a full game matrix or production acceptance. I used fresh isolated desktop (1280×800) and mobile (390×844) Playwright sessions, selected Amari through the visible picker, and used ordinary controls. Before app navigation, `/api/voice` and `/api/story` were guarded with 204 responses and confirmed active. No provider calls, hidden answer/state inspection, storage injection, or progress seeding occurred. Candidate identity was independently checked against the seven URLs in the supplied identity JSON; all returned HTTP 200 and SHA-256 matched.

## Results

- **Letter Trace, desktop keyboard:** In a visible G trace, focusing the canvas and pressing Space began the stroke. ArrowRight immediately moved the orange guide marker and changed the visible label from 0% to 10%, then 40%. ArrowLeft did not reduce the displayed progress from 40%. Check shape remained disabled while the stroke was partial. Further ArrowRight presses moved the marker visibly along the path and raised the label to 90%, then 100%; Check shape remained disabled until Space ended the stroke. Check shape then enabled; submitting held a success message and Next. The partial screenshot shows the orange marker at 90% alongside the matching label. Completion snapshot records held feedback.
- **Letter Trace, mobile pointer:** In a fresh 390×844 session, used pointer movement along the visible M path. Progress reached 100%, Check shape held the success message, and Next remained available. This narrow repair did not regress the touch/pointer completion path. Screenshot and completion snapshot are included.
- **Count the Stars, desktop copy:** Completed the ordinary six-round Star Garden starter queue using each visible object's button and the visible matching answer. The observed counts were 5 fireflies, 3 comet seeds, 4 fireflies, 3 moon berries, 2 planets, and 1 firefly. The one-object question read “How many fireflies did you count?” and the held feedback read “There is 1 firefly. You counted each one once.” Multi-object questions also used plural nouns (“How many planets did you count?”). The naturally reached singular-count case was grammatical; no copy defect was reproduced.

## Diagnostics and limits

Both sessions had zero browser console messages (including errors and warnings). Static requests shown by Playwright all returned HTTP 200; the non-static request list contained only the two guarded `/api/voice` and `/api/story` requests, each 204. No application request escaped the guards. Available local narration files requested during these interactions returned 200; this was not a listening-quality or complete narration check.

This validates only the named local repair candidate's visible Count prompt and a desktop keyboard plus mobile pointer Letter Trace path. It does not retest the full games, chapters, queues, replay/reward accounting, sibling isolation, or deployed behaviour. The canonical production report remains the production evidence; this local repair is not deployed.

## Captured evidence

- Desktop partial keyboard progress: [`trace-partial-progress.png`](desktop/trace-partial-progress.png)
- Desktop held trace completion: [`trace-complete.yml`](desktop/trace-complete.yml)
- Mobile pointer completion: [`trace-pointer-complete.png`](mobile/trace-pointer-complete.png), [`trace-complete.yml`](mobile/trace-complete.yml)
- Count singleton prompt and feedback: [`count-singular-question.yml`](desktop/count-singular-question.yml), [`count-singular-feedback.yml`](desktop/count-singular-feedback.yml), [`count-singular-result.png`](desktop/count-singular-result.png)
