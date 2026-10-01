# Letter Launch release-delta QA

Date: 1 October 2026  
Canonical: `https://dinospace-eight.vercel.app`  
Release identity: SHA `7d9d96166f4bd4d2b283b761dcfbaae5dd3b0256`, deployment `dpl_7guvWUZ3ocswiVGXcLbVrewzaEq8`; JavaScript `assets/index-C0jdAtV8.js`, CSS `assets/index-BH3dde_v.css`.  
Browser: isolated Playwright session `letter-release-delta`; gameplay/profile data stayed in that session. All interactions below used visible app controls.

## Scope and outcome

This is a bounded release-delta check of the generic lifecycle/diagnostic changes and the rocket/motion presentation on the exact release above. It is not a repeat of the earlier 86e3ecf candidate’s seven-run, four-chapter production baseline or its separate 5183 visual proof; those remain scoped to their recorded candidate. This run adds a completed Level 1, an interrupted replay, and Level 2 SAT coverage, plus an actual diagnostic export.

## Actual UI walkthrough

At desktop size, I started Letter Launch Level 1. On the first pictured word, Insect, I chose P incorrectly. The app retained the prompt, showed a retry clue, and the “Hear the clue again” control replayed it. Choosing I then showed “Super! Insect starts with the i sound.” I completed all six questions through the visible controls. The completion screen showed 2/6 correct first try, one of three stars, and the Sound Scout badge. I used Replay level, then left through the visible Back-to-world confirmation. The desktop screenshot shows the rocket in its launch animation: [desktop rocket launch](../.playwright-cli/page-2026-10-01T02-48-25-493Z.png).

At 390×844, Level 2 presented the SAT picture clue with a chair and the caption “She sat down on the chair.” I selected S correctly. With reduced motion enabled, the app respected `prefers-reduced-motion`; the rocket had no active CSS animation and stayed in a static launch pose. The document and body remained 390px wide. The Next mission control was reachable after normal vertical scrolling. Screenshot: [mobile reduced-motion SAT](../.playwright-cli/page-2026-10-01T02-53-07-637Z.png).

One mobile layout issue remains visible: the fixed daily challenge widget overlaps the right side of the SAT success feedback banner at the initial scroll position. The control to continue remains available after scrolling. This is a release-delta observation, not a claim that the overlay was repaired.

## Diagnostic export

I opened Grown-ups through the press-and-hold flow, opened Game troubleshooting, and downloaded the log through the UI. Playwright saved the download to the unique path `output/playwright/batch1-letter-release-delta-log.json` to avoid shared default-download collisions.

The export has 36 Letter Launch events: 3 `start`, 2 `level_start`, 8 `question`, 4 `answer_attempt`, 1 `hint`, 7 `answer_correct`, 7 `learning_attempt`, 1 `level_complete`, 1 `replay`, and 2 `leave`. It contains three numeric run seeds: Level 1 completion `3184685144` (rounds 0–5), interrupted Level 1 replay `3160055535` (round 0), and Level 2 practice `2997682155` (round 0). The final event rows preserve the seed and round/page context; no authored prompt, answer, title, or child-name fields appeared in the exported event objects. Wrong/right activity, clue replay, completion, replay, and leaving are all represented.

## Technical checks and proof boundary

At the mobile viewport, measured document/body widths were 390px; option buttons measured 109×96px and the Next mission button measured about 163×56px after scrolling. The final reload of the canonical page showed no console/page errors or failed same-origin requests. The desktop view supplied the normal-motion launch animation; the mobile view supplied reduced-motion behavior.

This delta run does not establish answer-position distribution across the entire generator or replace the separate prior chapter-completion evidence. See [Letter Launch final production QA](batch1-letter-final-production-qa.md) for the earlier candidate’s full chapter/run baseline and its editorial findings.
