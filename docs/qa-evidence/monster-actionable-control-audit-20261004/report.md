# Monster Math 390 px production candidate audit

Date: 2026-10-04  
Candidate: [READY production preview](https://dinospace-51fgt6ny5-memas-projects-23a0001d.vercel.app)  
Deployment: `dpl_ACKz7A5eDD8DiCfUptevNEjP5xdV`  
Immutable candidate source archive: `4fcb80d34bb2e9cfdb587f40ec61f44a6ae75f55`  
Identity record: [sky-spot-production-candidate-identity-20261004.json](../sky-spot-production-candidate-identity-20261004.json)

## Identity and method

The deployed `READY` candidate was treated as immutable. The identity record pins 16 served files and SHA-256 hashes; I independently fetched each listed file from the candidate, and all 16 returned HTTP 200 with byte counts and SHA-256 values matching the record. The candidate predates the source-only Monster scroll repair in commit `94d44d031d5835d0d9fa2128064ff83ba5880a62`.

The browser run used a fresh 390 px viewport. I opened `about:blank`, installed `**/api/voice**` and `**/api/story**` request guards before navigating, navigated with `goto`, and verified the routes remained installed after navigation. Sound was turned off through the visible control. I used only normal visible UI: selected episodes, read visible questions/models/options, answered with the ordinary buttons, and used ordinary clues, number-line controls, Next/Finish, replay, and leave confirmation. I did not read or inject app state, answer keys, seeds, or stored progress. Browser screenshots are in [`mobile/`](mobile/).

## Entry and layout finding

The episode map loads at the top. Episode tiles and the Start button are below the fold, so an ordinary Start click scrolls the page to the control. When play begins, that scroll position remains, clipping the active header and Back/sound controls. At 390 px, no horizontal page overflow was observed; document and body widths were 390 px.

| Episode | Start button before click | Active immediately after normal click | After ordinary scroll-to-top |
| --- | --- | --- | --- |
| Count to 10 | `326 × 64`, y=920 | `scrollY=37`; header y=-29, h=121.75; Back and sound y=-17, each `48 × 48` and clipped | Header y=8; controls y=20, fully visible |
| Add and Take Away | `326 × 64`, y=920 | `scrollY=151`; header y=-143; buttons y=-131 | Restored when scrolled to top |
| Monster Story Problems | `326 × 64`, y=920 | `scrollY=131`; header y=-123; buttons y=-111 | Restored when scrolled to top |

Screenshots: [`map-locked.png`](mobile/map-locked.png), [`count-q1-active-clipped-header.png`](mobile/count-q1-active-clipped-header.png), [`growing-q1-header-clipped.png`](mobile/growing-q1-header-clipped.png), and [`story-q1-active.png`](mobile/story-q1-active.png).

The source-only follow-up adds a `useLayoutEffect` in `MonsterMath.jsx` that scrolls to the top when phase becomes `play`, matching the already-used Sky Shapes phase-entry behavior. It is committed separately as `94d44d031d5835d0d9fa2128064ff83ba5880a62`; the live candidate above was not rebuilt or changed during this audit. Independent verification of a new frozen build remains separate.

## Visible question/result rows

“Held” means the correct-answer explanation remained on screen until I pressed the visible Next/Finish control. Wrong retries and hints below were intentional visible button interactions. Answer choices are listed in the displayed order; chosen answers were selected through those buttons.

### Count to 10

| # | Visible prompt and model | Displayed choices → selected | Held result |
| --- | --- | --- | --- |
| 1 | How many oranges can you see?; five orange pictures | 2, 7, 5, 3 → 5; first tried 2 and saw retry feedback | “There are 5 counters.” / “There are 5 oranges.” |
| 2 | How many crystals can you see?; four crystal pictures | 6, 2, 5, 4 → 4 | “There are 4 crystals.” |
| 3 | How many apples can you see?; three apple pictures | 2, 4, 7, 3 → 3 | “There are 3 apples.” |
| 4 | How many planets can you see?; five planet pictures | 9, 5, 4, 3 → 5 | “There are 5 planets.” |
| 5 | How many gems can you see?; five gem pictures | 6, 1, 4, 5 → 5 | “There are 5 gems.” |
| 6 | How many balloons can you see?; two balloon pictures | 3, 2, 1, 6 → 2 | “There are 2 balloons.” |

Question 1’s wrong/retry, held result, all remaining start/held cards, and the completion screen are captured in the `count-q*` screenshots. Completion showed 5/6 correct without a mistake or clue, 3 stars, and a new badge. Episode map was `140.3 × 56`, Replay `180.2 × 56`, Next `140.9 × 56`, and Back to world `146 × 56`. Map screenshots show Growing locked initially and unlocked after Count completion.

### Add and Take Away

| # | Visible prompt and displayed choices → selected | Clue/wrong retry | Held explanation |
| --- | --- | --- | --- |
| 1 | What is 18 take away 16?; 2, 5, 1, 0 → 2 | Clue: “Start with 18 counters. Slide 16 away, then count what stays.” Tried 5 first; retry appeared. | “Start with 18 counters. Take 16 away. 2 counters stay.” |
| 2 | What is 8 take away 1?; 5, 7, 8, 6 → 7 | None | “Start with 8 counters. Take 1 away. 7 counters stay.” |
| 3 | What is 10 take away 4?; 2, 5, 6, 3 → 6 | None | “Start with 10 counters. Take 4 away. 6 counters stay.” |
| 4 | What is 14 plus 3?; 19, 18, 17, 15 → 17 | Clue: “Put the two groups together, then count every counter.” Tried 18 first; retry appeared. | “14 counters. Add 3 more. That makes 17 counters.” |
| 5 | What is 2 plus 12?; 12, 16, 14, 13 → 14 | None | “2 counters. Add 12 more. That makes 14 counters.” |
| 6 | What is 19 take away 10?; 12, 10, 9, 5 → 9 | None | “Start with 19 counters. Take 10 away. 9 counters stay.” |

At Q2, the arithmetic frame measured `342 × 78`; each answer choice was `161 × 64`; question replay was `246.6 × 48`; clue was `334 × 48`. Episode Next controls measured `176 × 56` and Finish `181.56 × 56`; some were below the initial viewport and normal locator activation scrolled them into view. Completion showed 4/6 correct without mistake or clue, 2 stars, and a new badge. The leave dialog showed Keep playing (`88.3 × 88.3`) and leave (`73.6 × 73.6`); Keep playing preserved the held question and Finish state. Screenshots: `growing-q*`, `growing-leave-dialog.png`, and `growing-completion.png`.

**Coverage boundary:** this normal six-question Growing queue did not show the requested special `2 + 10` case. It remains unverified in rendered gameplay; I did not force a seed or extend into a broad/random-run search.

### Monster Story Problems

| # | Visible story prompt | Displayed choices → selected | Held explanation |
| --- | --- | --- | --- |
| 1 | Tess has 4 stars. Tess finds 3 more. How many stars are there now? | 9, 7, 6, 3 → 7; tried 6 first and saw retry | “Tess had 4 stars. Tess found 3 more. Now there are 7 stars.” |
| 2 | Tess has 4 stars. Tess finds 6 more. How many stars are there now? | 13, 10, 14, 7 → 10 | “Tess had 4 stars. Tess found 6 more. Now there are 10 stars.” |
| 3 | Ava has 4 flowers. Ava finds 7 more. How many flowers are there now? | 9, 15, 10, 11 → 11 | “Ava had 4 flowers. Ava found 7 more. Now there are 11 flowers.” |
| 4 | Tess has 6 stars. Tess finds 14 more. How many stars are there now? | 20, 17, 18, 19 → 20 | “Tess had 6 stars. Tess found 14 more. Now there are 20 stars.” |
| 5 | Nia has 13 gems. Nia gives 8 gems away. How many are left? | 6, 5, 7, 3 → 5 | “Nia starts with 13 gems. Nia gives 8 gems away. 5 gems are left.” |
| 6 | Leo has 2 apples. Leo finds 7 more. How many apples are there now? | 7, 9, 12, 13 → 9 | “Leo had 2 apples. Leo found 7 more. Now there are 9 apples.” |

On Q1, the visible clue said “Look for the words ‘more’ and ‘now.’ Put both groups together.” The number line began at 4 with 3 jumps remaining. “Jump one step forward” measured `210.2 × 48`; “Start again” measured `117.1 × 48`. One jump displayed “At 5. 2 jumps to go.” Start again restored “At 4. 3 jumps to go.” Three jumps displayed “At 7. All jumps done.” The correct-answer explanation remained held until Next. Completion showed 5/6 correct without mistake or clue, 3 stars and a badge; the final episode had no Next episode button. “Replay episode” opened a fresh Q1 at 0/6, confirming replay reset. See `story-q1-*`, `story-q2-*` through `story-q6-*`, `story-completion.png`, and `story-replay-active.png`.

## Result and limits

- Ordinary visible progression covered all six questions in each of the three episodes, with held feedback, intentional wrong-answer retry, single-use clue, number-line step/reset, active leave confirmation/Keep playing, completion, unlock, and replay behavior.
- Active header clipping on entry is a confirmed production candidate defect. A narrow source repair is committed; no new build or candidate verification is included in this evidence commit.
- No horizontal overflow was measured at 390 px. This is browser viewport evidence, not physical-device evidence.
- The exact `2 + 10` Growing prompt was not naturally in the observed six-question queue and remains unverified.
- This report makes no claim about audio quality/listening acceptance or overall 4.5 quality acceptance.
- Voice and story API guards were installed in the fresh browser context before navigation and still appeared in the post-navigation route listing. No `/api/voice` or `/api/story` request was observed. Sound was muted by the product control. Browser interaction was visually observed; this is not a production promotion or provider test.
