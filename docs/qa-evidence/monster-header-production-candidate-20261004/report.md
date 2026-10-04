# Monster Math header candidate: independent production-candidate check

Date: 2026-10-04

## Candidate identity and scope

- Candidate URL: <https://dinospace-n67vr8wze-memas-projects-23a0001d.vercel.app>
- Vercel deployment: `dpl_J3KZBY4qUa8CvBSGzKy3KmWmyiPB` (READY)
- Audited source/archive SHA: `484addf2e76be849845f508bdc9fc5e1325b51b7`
- Identity: [`monster-header-production-candidate-20261004.json`](../monster-header-production-candidate-20261004.json). All seven listed HTML/JS/CSS files were fetched from the candidate and matched their frozen SHA-256 values.
- The production alias remained on the earlier `2952958` deployment. This report covers only the immutable candidate URL; it does not claim canonical promotion or general production acceptance.
- The earlier [local independent Monster Math report](../monster-header-484addf-independent-20261004/report.md) is retained as lineage, not substituted for this candidate run.

## Guarded browser setup

I used a fresh isolated Playwright profile, installed `/api/voice` and `/api/story` 204 guards before the first app navigation, selected Amari through the UI, and turned sound off in the UI. A browser reload cleared the initial page-level route registrations; I noticed this and installed persistent CLI routes before subsequent reload/replay actions, then confirmed them in the route list. No provider API requests were observed. I did not seed progress, modify storage, inject answers, or use hidden answer/path data.

One accidental, unrelated Count the Stars survey was opened while locating Monster Math. It was not used to unlock Monster Math and is not part of the findings below.

## Ordinary mobile progression and story episode

At 390×844, visible map controls were used to complete Episode 1, **Count to 10**, 6/6, and Episode 2, **Add and Take Away**, 6/6. Both displayed 3/3 stars. This ordinarily unlocked Episode 3, **Monster Story Problems**.

I completed the six visible Challenge questions using their rendered prompts, number-line models, and answer buttons. On Q1, Tess had 3 stars and found 4 more. I chose 5 to exercise the wrong-answer state; the UI said “Not yet. Try the clue, then count the model again.” I used the one-use clue, which became disabled as “Clue shown”; it said to combine the groups because the prompt used “more” and “now.” I exercised the visible number-line controls, including **Start again**, then completed four forward jumps to 7. The correct-answer explanation remained visible and Next was held until I clicked it.

| Q | Visible story and model | Answer used |
|---|---|---:|
| 1 | Tess: 3 stars, finds 4 more; start 3, forward 4 | 7 |
| 2 | Ava: 9 flowers, finds 3 more | 12 |
| 3 | Bo: 15 balloons, gives 12 away | 3 |
| 4 | Ava: 6 flowers, gives 3 away | 3 |
| 5 | Ava: 12 flowers, gives 4 away | 8 |
| 6 | Ava: 1 flower, finds 13 more; visible model starts at 1, forward 13 to 14 | 14 |

Challenge completion showed **5 of 6 correct without a mistake or clue**, 3/3 stars, and “New episode badge saved for this child.” The 3-star result is consistent with the displayed completion and the product's existing threshold; this is not a perfect-first-try run. No claim is made that the exact `2 + 10` prompt appeared.

Reloading retained all three completed episode badges and their star rewards. Evidence includes [mobile map after reload](screenshots/mobile-map-after-reload.png), [Challenge map](screenshots/mobile-challenge-map.png), [first Challenge prompt/model](screenshots/mobile-challenge-question1.png), and [Q6 model](screenshots/mobile-question6-model.png).

## Episode titles and responsive layout

All three full episode titles were checked on the map and in active-game headers at both 390×844 and 1280×800. Active screens showed:

- `Episode 1 · Count to 10`
- `Episode 2 · Add and Take Away`
- `Episode 3 · Monster Story Problems`

The Challenge header rendered without ellipsis at both sizes. Its measured paragraph width was 350/350 CSS pixels on mobile and 743/743 on desktop. The document width equaled the viewport width at both tested sizes (390/390 and 1280/1280). The Episode 2 mobile header measured 350/350. Screenshots: [mobile Starter](screenshots/mobile-starter-header.png), [mobile Growing](screenshots/mobile-growing-header.png), [mobile Story Problems](screenshots/mobile-story-header.png), and the corresponding [desktop Starter](screenshots/desktop-starter-header.png), [desktop Growing](screenshots/desktop-growing-header.png), and [desktop Story Problems](screenshots/desktop-story-header.png).

On desktop I replayed the first visible question in each episode to verify the active headers. I also replayed Challenge Q1 (Bo: 17 balloons, gives 9 away; visible model 17 back 9 to 8), chose a wrong answer, used the clue, exercised a back-jump and **Start again**, completed the visible nine back-jumps, and submitted 8. The rendered explanation remained until Next was clicked. A second desktop replay showed Mira's 2 shells plus 3 more equals 5 and held the explanation until Next. Desktop was a bounded title/control replay, not a second full six-question recertification.

Back from an active game opened the visible “Leave the game?” confirmation. Choosing **Back to world** returned to **Maths Missions**. See [mobile leave confirmation](screenshots/mobile-leave-confirmation.png) and [desktop leave confirmation](screenshots/desktop-leave-confirmation.png).

## Network and runtime observations

- All seven candidate identity assets returned HTTP 200 and matched the identity SHA-256 values.
- Browser console had zero errors and zero warnings.
- No non-static requests or provider API calls were observed after guarded navigation. Static assets loaded successfully; one packaged audio range request returned HTTP 206, which is normal for the observed range response.
- Sound remained off. I did not listen to audio or assess narration quality; this report does not close any audio/listening gate.

## Result and limits

The candidate passed this bounded independent check of all three active episode titles at mobile and desktop widths, ordinary mobile progression into Challenge, the six-question mobile story flow, wrong-answer/clue/reset behavior, held correct feedback, saved completion badges, and active-game Back confirmation. The desktop Challenge run was partial as described above. This evidence does not certify exact-prompt coverage, human audio quality, all-device behavior, the canonical alias, or the full 4.5 acceptance gate. No source files or deployment settings were changed.

## Screenshots

- [Mobile episode map after reload](screenshots/mobile-map-after-reload.png)
- [Mobile Challenge map](screenshots/mobile-challenge-map.png)
- [Mobile Challenge Q1](screenshots/mobile-challenge-question1.png)
- [Mobile Challenge Q6 number-line model](screenshots/mobile-question6-model.png)
- [Mobile Episode 1 header](screenshots/mobile-starter-header.png)
- [Mobile Episode 2 header](screenshots/mobile-growing-header.png)
- [Mobile Episode 3 header](screenshots/mobile-story-header.png)
- [Desktop episode map after reload](screenshots/desktop-map-after-reload.png)
- [Desktop Episode 1 header](screenshots/desktop-starter-header.png)
- [Desktop Episode 2 header](screenshots/desktop-growing-header.png)
- [Desktop Episode 3 header](screenshots/desktop-story-header.png)
- [Desktop held story feedback](screenshots/desktop-held-story-fact.png)
