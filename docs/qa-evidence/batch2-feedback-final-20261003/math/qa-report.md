# Monster Math feedback repair — independent narrow QA

Date: 3 October 2026  
Reviewer: fresh isolated Playwright sessions (`mathqa`, `mathmobile`)  
Target: `http://127.0.0.1:5199/` (local candidate; not production)

## Candidate identity

- Frozen source: `f79a282a99774b39005c882d60f2ea479cbabf48` (the shared worktree advanced separately during QA)
- Served JS `/assets/index-Dcf_ih0a.js`: SHA-256 `f70c6038be49561db3c62700912a72ffdcd281bbcc8792ade2f446195be41047`
- Served CSS `/assets/index-CU-OkS6z.css`: SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`

## Verdict

**Narrow repair does not pass because the pre-answer accessible model label exposes the answer.** The starter-to-growing progression, model arithmetic, clue replacement, mobile bounds, and leave confirmation worked. After selection, the solved equation/model and one worked feedback paragraph are expected together; this QA did not find two worked feedback paragraphs.

## Observations

- Both viewports began in separate browser sessions with `/api/voice` and `/api/story` route aborts installed before app navigation, including the bare endpoints. Sound was muted. The tested flow made no provider calls; the run was visual/mechanics QA only.
- Desktop showed Starter selected and Growing/Challenge locked. After completing six Starter questions, the completion view saved the badge and reported `5 of 6 right first try`; it unlocked Growing. The desktop run used a clue once, and the score excludes hinted answers, so 5/6 is consistent with the scoring rule; the old “right first try” wording is ambiguous about clue use. Mobile independently completed six questions without clues, reported `6 of 6 right first try`, and showed Starter earned, Growing available, and Challenge locked.
- On desktop, the second count question showed one clue sentence, “Touch or point to each picture once. Keep a steady count.” The baseline instruction was replaced; no duplicate clue text appeared.
- The desktop Growing question `11 + 5` displayed neutral spoken/visual instruction, but its model accessible label read “11 counters and 5 more, 16 counters total” before any answer. A separate equation placeholder showed `11 + 5 = ?`. After choosing 16, the model showed `11 + 5 = 16` and the single feedback paragraph stated “11 counters. Add 5 more. That makes 16 counters.” The solved model/equation and one explanation agreed and remained visible until Next.
- The mobile Growing question `8 + 3` reproduced the pre-answer accessible-label leak: “8 counters and 3 more, 11 counters total”; after selecting 11, `8 + 3 = 11` and one feedback paragraph (“8 counters. Add 3 more. That makes 11 counters.”) remained together until Next. This is a valid solved model plus one explanation, not a duplicate explanation.
- At 390×844, `documentElement.scrollWidth` was 390 (no horizontal overflow). All visible game and leave-dialog buttons measured at least 48×48 CSS px. In the leave dialog, Keep playing measured 96×96 and Back to world 80×80. The confirmation presented both choices and Keep playing restored the same unanswered question.
- Static requests observed: 16 on desktop and 18 on mobile; all returned HTTP 200. Console inventory: zero messages, errors, or warnings in both sessions. Voice/story API requests were blocked by the installed routes; narration/audio quality was not evaluated.

## Evidence

- `1280-before-answer.png`, `1280-q6-feedback.png`, `1280-growing-before-answer.png`
- `390-leave-confirmation.png`, `390-q6-feedback.png`, `390-episode-map-unlocked.png`, `390-growing-before-answer.png`, `390-growing-feedback.png`
- `390-amari-game-diagnostics.json` — exported through the grown-up UI’s Download game log control. It records the two ordinary UI-created run seeds, six Starter correct-answer events, Starter completion, one Growing correct-answer event, and leave; no prompt text or child name appears.
- `desktop-requests.txt`, `mobile-requests.txt`, `desktop-console.txt`, `mobile-console.txt`

## Scope limits

This was a bounded local regression delta, not a three-run-per-band acceptance or a 4.5 score. During this frozen `f79a282` assessment, no source was edited and no production deployment was examined. Sound was muted, and the packaged narration/audio review remains out of scope with generated audio incomplete. No seed, answer, or progress was injected; unlocks and answers were reached through visible controls.
