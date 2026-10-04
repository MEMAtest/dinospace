# B4 subtraction illustration opacity: independent UI check

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5386/`  
Source: `9c594dd0e49f5a84588787a084a55aefeec4cdc0` (parent `4a9ae1cd4cd1293aafae4c10877d5cb6cf8ae029`)  
Runtime branch: `codex/b4-zero-remain-tray-20261004`  
Identity: [`b4-zero-remain-5386-20261004-identity.json`](../b4-zero-remain-5386-20261004-identity.json)

## Scope and setup

This is a bounded independent check of the post-answer subtraction illustration change: the Starting group and Take away labels should remain readable while only their counter rows fade/move, and an ordinary zero-result should be displayed explicitly. It is not a full B4 game matrix, audio test, listening review, or release acceptance.

I used one fresh Playwright profile at 1280×800, muted through the visible sound control, then resized the same profile to 390×844. Before the first app navigation the session was at `about:blank`; `/api/voice` and `/api/story` were routed to local 403 responses and verified with `route-list`. The routes remained active after `goto`. Network inspection showed only those two blocked API requests plus static assets; the static index, JavaScript, and stylesheet returned 200 and matched the frozen identity hashes. Browser console reported 0 messages, 0 errors, and 0 warnings. No child data, seed, storage, answer, provider, or story state was injected.

## Observations

- **Desktop before answer:** Chapter 1, question 1 displayed “There are 9 shells. Take away 0. How many are left?” The Starting group had nine pictured shells and the Take away group showed `0 (empty)`; the Remaining tray was empty. The four visible options were 9, 8, 7, and 5. See `screenshots/desktop-q1-before-answer.png`.
- **Desktop correct answer held:** I selected the visible correct answer, 9. The result stayed held with “Start with 9. Take 0 away. 9 remain.” and an enabled Next question button; it did not auto-advance. At the settled state, both label paragraphs had computed opacity `1` and color `rgb(51, 65, 85)`, while each illustration row had opacity `0.4`; the containing groups remained opacity `1`. The starting illustration showed its intended movement/strike state. See `screenshots/desktop-q1-correct-held.png`.
- **390px correct answer held:** The same held question remained readable after resizing the same profile. Both labels stayed fully opaque, counter rows faded, and the nine-dot remaining tray, answer feedback, and Next question control fit in the viewport. See `screenshots/mobile-q1-correct-held.png`.
- **390px ordinary zero result:** I advanced once through the visible Next question button. Question 2 asked “There are 9 apples. Take away 9. How many are left?”; before answering, the removal group visibly contained nine apples and the remaining tray was empty. Selecting the visible answer 0 produced the held feedback “Start with 9. Take 9 away. 0 remain.” and the Remaining tray announced “Remaining tray, 0 apples” with visible text `0 (empty)`. At the transition sample, both group labels were opacity `1`, their illustration rows were opacity about `0.554` while fading, and the remaining-result text was opacity `1` with color `rgb(76, 29, 149)`. The answer buttons became disabled and Next question remained available. See `screenshots/mobile-q2-zero-transition.png` and `screenshots/mobile-q2-zero-held.png`.
- **Desktop same held zero state:** Resizing the same profile to 1280×800 retained question 2’s zero result, visible `0 (empty)` text, feedback, and Next question control. The starting/take-away labels remained opacity `1`; the illustration rows were faded to `0.4`. See `screenshots/desktop-q2-zero-held.png`.

The Q2 zero case appeared naturally in the ordinary six-question Chapter 1 queue, so I recorded it and stopped; I did not hunt for additional zero questions or continue into another chapter. This is a two-question, same-profile viewport check only.

## Result and limits

**Pass for this candidate and scope.** The labels retain full computed opacity and dark text while the counter illustrations fade; the post-answer empty tray communicates zero explicitly at desktop and mobile sizes. The focused screenshots show no clipping of the checked content or the Next control. This does not establish all subtraction question types, broader progression/persistence, reduced-motion behavior, screen-reader quality beyond the visible accessible group label, native audio, narration readiness, or any 4.5 score.

## Evidence files

Screenshots are in [`screenshots/`](screenshots/). Served asset hashes and build provenance remain in the linked frozen candidate identity; the independent browser session confirmed the three core files and static requests against that identity.
