# Monster Math entry candidate — independent rendered QA

Date: 2026-10-04

## Candidate and scope

- Candidate URL: https://dinospace-bjwogjr64-memas-projects-23a0001d.vercel.app
- Deployment: `dpl_Dypi5oGP3et3yxgQiGjDqYpfCFMg` (READY candidate)
- Clean archive source: `94d44d031d5835d0d9fa2128064ff83ba5880a62`
- Candidate identity: [monster-entry-production-candidate-identity-20261004.json](../monster-entry-production-candidate-identity-20261004.json). The identity records 16/16 served index/runtime files matching the exact clean archive, including all HTTP 200 statuses and SHA-256s; root separately verified provider/archive metadata.
- Candidate is not canonical. This is a narrow Monster phase-entry delta; it does not retest all 18 questions, search for the exact 2+10 case, or claim overall acceptance.

## Guarded setup

Used two fresh named Playwright browser sessions, each opened at `about:blank`. Before the first app navigation, installed blocking handlers for `/api/voice` and `/api/story`. In each session I navigated normally, selected Amari, and clicked the visible `Turn sound off` control. No provider playback/generation, story endpoint, hidden answer/state, storage, progress, seed, or child data injection was used. After each run, Playwright reported zero console messages, errors, or warnings. Request listings showed only omitted static requests (16 mobile, 12 desktop); no voice/story or other non-static request appeared.

The browser used CSS viewports 390×844 and 1280×800. It is not physical-device touch testing and does not establish human listening quality.

## Mobile 390×844

At the Monster Math episode-selection page, the document width was 390px, equal to the viewport, with `scrollY=0`. The Start button was below the initial viewport at document y=920 (326×64 CSS px); a normal scroll brought it into view at `scrollY=192`. On the initial page the Back and sound controls measured 48×48 CSS px. After clicking Start, before any upward scroll, the question page was at `scrollY=0` and still had no horizontal overflow; Back was at (20,20), 48×48, and sound at (322,20), 48×48. The question restarted this way after returning to Maths and reopening Monster Math as well.

The first visible question showed four flowers and answer choices 8, 2, 7, 4. I chose 8, received “Not yet. Try the clue, then count the model again.”, requested the visible clue (“Touch or point to each picture once. Keep a steady count.”), counted the four rendered flowers, and selected 4. The result held on screen as “There are 4 flowers.” with `1/6` progress. The enabled Next question control measured 175.95×56 CSS px after bringing it into view. Hear-question and clue controls were 246.59×48 and 334×48; answer controls were 161×64 each.

Back opened the “Leave the game?” dialog. Keep playing dismissed it and preserved the same held explanation, progress, and enabled Next. Back followed by Back to world returned to the Maths world. Reopening Monster Math returned to its episode-selection page with Start six questions visible; the unfinished episode was not shown as earned.

Screenshots: [entry top](screenshots/mobile-entry-top.png), [Start after scroll](screenshots/mobile-start-visible-after-scroll.png), [question after normal re-entry](screenshots/mobile-counting-question-reentry.png), [wrong choice feedback](screenshots/mobile-wrong-answer-feedback.png), [held correct explanation](screenshots/mobile-held-correct-explanation.png), [re-entry wrong feedback](screenshots/mobile-retry-reentry.png), and [re-entry held result](screenshots/mobile-held-explanation-reentry.png).

## Desktop 1280×800

Monster Math opened at `scrollY=0`, document width 1280px (no horizontal overflow). The Back and sound controls measured 48×48 CSS px. The Start six questions button was already visible at x=156, y=544 and measured 968×64. Immediately after clicking Start, before any upward scroll, the question page remained at `scrollY=0` with document width 1280px; Back was at (142,30), 48×48, and sound at (1090,30), 48×48. The same measurements were captured after returning to Maths and reopening Monster Math.

After Start, Question 1/6 showed eight moons. I selected 10 and received the retry prompt; the visible clue asked me to touch/point to each picture once and keep a steady count. I counted the eight visible moons and selected 8. The held result read “There are 8 moons.”, progress was `1/6`, and Next question remained available at x=552.02, y=710, size 175.95×56.

Back opened the leave dialog. Keep playing preserved the held answer, then Back and Back to world returned to Maths. Reopening Monster Math showed the normal episode selection with Start available.

Screenshots: [entry and desktop Start](screenshots/desktop-entry.png), [counting question](screenshots/desktop-counting-question.png), and [held correct explanation](screenshots/desktop-held-explanation.png).

## Result and limits

The candidate passed this bounded rendered check for visible episode entry, below-fold mobile Start reachability, title-row control size, no horizontal overflow, wrong-answer retry, clue, correct held feedback/Next, Keep playing state retention, and parent-world return/re-entry at both viewports. No new defect was observed in this scope. The test stopped after one question per viewport and does not establish the remaining episode/question matrix, exact 2+10 observation, narration/listening quality, or production acceptance. Existing Spot/Sky/Puzzle production evidence remains separate and applies only to unchanged modules in this candidate.
