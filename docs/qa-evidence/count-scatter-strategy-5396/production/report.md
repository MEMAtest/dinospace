# Independent production-candidate QA: Count scattered strategy

Date: 2026-10-04  
Immutable deployment: `dpl_5cKFB6U489CLoEPucaY9pDarcHsp`  
URL: https://dinospace-3sqfand4s-memas-projects-23a0001d.vercel.app  
Runtime source: `1accc99e89be303678ead99def6a3095ab1cb886`  
Packaging archive commit: `22d805b67ced8b36f45d0f5c547bfe67c5dded88`  
Served-file identity: [`../production-identity.json`](../production-identity.json)

This is an immutable production candidate, not the canonical alias and not a promotion. The identity record binds the served index, app JavaScript, stylesheet, and Count game chunk to the frozen source.

## Method and scope

I used one dedicated Playwright CLI browser session, `count-prod-scatter-qa-20261004` (browser PID 73608), at 1280×800, then resized that same earned profile to 390×844. The session started at `about:blank`; `/api/voice` and `/api/story` were configured to return 403 and confirmed in `route-list` before the first app navigation and after the run. Sound was muted at entry using the visible control. I selected Amari, opened Maths Missions → Count the Stars, and earned access by completing six Starter and six Growing rounds through visible object buttons and visible answer choices. I completed one Challenge survey. No data, answer, progress, or seed was injected. No additional browser window was opened.

This bounded run reuses the retained 5395/5396 clue-layout and game matrices. It exercises the production scattered-banner correction, natural array/group/scattered layouts, one wrong/retry/correct/held/Next path, one Challenge completion, persistence after reload, and the parent Maths route. It does not repeat the full game matrix.

## Layout and copy observations

The first Challenge round displayed 18 Satellite Panels in a regular array and retained the Challenge strategy: “Count along a row, or count each group and put the totals together.” On the same ordinary six-round queue, Challenge round 4 showed 14 Crater Gems with the accessible board description “two visible groups”; it retained that Challenge strategy. This grouped layout and row/array layout were also covered by the retained clue matrix for source `79a719e91e727f09d1f78cf890acd7e671cab381`.

Challenge round 2 showed one Constellation Map star with the accessible board description “scattered one by one.” The banner changed to “Count each glowing object once. A number badge keeps your place.” The scattered per-question clue displayed “Point to each shape once. The numbered badges keep your place.” Both matched the rendered board. I captured the scattered question at desktop with the clue visible, then at mobile with the same question and clue. At 390×844, the strategy wraps above the board; the object, clue, and other controls fit in the page.

The run later classified a four-object Planet Rings board as scattered, and 11-object Nebula Dots as two visible groups; these were naturally reached in the same queue. The main target comparison is the captured one-object Constellation Maps board, since it was the first scattered Challenge layout reached.

## Answer, completion, persistence, and navigation

At mobile width, I tapped the visible map-star object and chose 2. The game showed “Check your count badges once more.” I then chose 1 and saw the held success explanation “There is 1 map star. You counted each one once.” Next advanced to the following Challenge round. I answered the remaining visible boards and reached “Galaxy Survey complete!” with “Best: 2 stars” and the Galaxy Survey constellation page earned.

The Survey map displayed Best 2 stars and all three constellation pages. After reloading the same browser profile, the survey map and Best 2 stars were still present. Re-entering Count the Stars showed the earned pages; Back to Maths Missions returned to the Maths Missions world.

Screenshots: [desktop scattered clue](screenshots/scattered-desktop-clue.png), [mobile scattered clue](screenshots/scattered-mobile-clue.png), [wrong-answer retry](screenshots/scattered-mobile-wrong-retry.png), [held correct answer](screenshots/scattered-mobile-held-correct.png), [Challenge completion](screenshots/challenge-completion.png), [survey map after reload](screenshots/persistent-survey-map-after-reload.png), [return to Maths Missions](screenshots/parent-maths-return.png).

## Audio and diagnostics

I briefly turned sound on using the visible control and selected Show a clue on the scattered Constellation Maps question. The browser fetched `/audio/en/03a953b6-matilda.mp3` with HTTP 206. The source manifest maps key `03a953b6` to “Point to each shape once. The numbered badges keep your place.” The UI exposed no `audio` or `video` DOM element to inspect for current playback time, pause state, or cancellation. I later used Next after answer feedback, but could not determine whether Next cancelled narration. Further packaged narration requests occurred during the Challenge while sound was enabled; no voice/story endpoint request occurred. I restored mute using the visible control before leaving the game. These observations do not establish audibility or human listening quality.

The visible static requests for the app shell, Count chunk, CSS, and loaded image assets returned HTTP 200; narration assets returned HTTP 206. The request list showed no non-static provider requests. Both 403 guards remained active. Browser console: 0 messages, 0 errors, 0 warnings.

## Limits

This is a bounded live check of one immutable production candidate. It does not cover every question or profile/viewport combination, repeat the retained full matrix, evaluate sound quality, or establish release acceptance. No canonical promotion was performed and no overall quality score is claimed.
