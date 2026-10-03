# Monster Math mobile held-feedback visibility check

## Result: unable to run without rebuilding progress

The requested check depended on the already-unlocked isolated 5203 mobile session so I could reach one Story prompt without repeating a band. At task start, the available browser inventory contained no tab at `127.0.0.1:5203` and no retained isolated Playwright context; the only visible app-browser tabs were unrelated. I did not create another context or replay Starter/Growing to recreate unlocks, and did not inject progress or state.

Therefore this report records no new gameplay observation. I could not capture a current before/after screenshot, measure Next bounds, test the 390px document width, verify one-question advancement, or export diagnostics. The 5203 mobile screenshot retained in [packaged runtime evidence](../monster-packaged-runtime-20261003/report.md) still shows the explanation beginning near the bottom and Next outside that screenshot; whether ordinary vertical scrolling exposes a sufficiently large, usable Next control remains **unverified**.

No source or test files were changed, no provider endpoint was called, and no audio or production claim is made. This initial attempt did not close the gap; see the separately identified follow-up below.

## Follow-up on the newly authorized isolated candidate session

A fresh named Playwright session was created at `about:blank`, set to 390×844, then given broad `**/api/voice**` and `**/api/story**` abort routes before navigating to `http://127.0.0.1:5204`. Served JS was `index-Dckzdv86.js`, SHA-256 `4585129777a287697bf27be43e560159825723e295ac78bfe6928bce96f73c7c`; CSS was `index-CU-OkS6z.css`, SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`. The visible sound control was turned off (`Turn sound on`). No answer, seed, progress, or unlock was injected.

I completed the six visible Starter questions and six visible Growing questions to unlock Story through normal UI. The UI export records Starter seed `3396886547`, Growing seed `301157189`, and Story seed `588548649`. In Story Q1 the visible prompt was “Ava has 4 flowers. Ava finds 7 more. How many flowers are there now?” I chose visible answer 11. The held feedback was “Ava had 4 flowers. Ava found 7 more. Now there are 11 flowers.”

A normal mouse-wheel vertical scroll moved the page from `scrollY=0` to `178` with document/body width still 390px. The enabled “Next question” button measured **175.95×56 CSS px** at `{x:107.02,y:737.5}` in the 390×844 viewport, entirely within the visible viewport. This exceeds the 48px minimum in both dimensions. Clicking it advanced exactly once from Story Question 1/6 to Question 2/6; the Ava feedback disappeared and the new Tess prompt appeared. This closes the mobile Next visibility/advance check on this candidate.

The Story prompt screenshots are `story-q1-before-answer-390x844.png`, `story-q1-held-before-scroll-390x844.png`, and `story-q1-held-after-scroll-390x844.png`; bounds are in `next-bounds.json`. The sanitized actual UI download, captured with `waitForEvent('download')` around the visible Grown-ups → Game troubleshooting → Download game log action and saved via `download.saveAs`, is `monster-mobile-next-5204-ui-log.json`. Console output has 0 errors/warnings; the request filter found no `/api/voice` or `/api/story` requests. Setup and inventories are retained alongside this report.

### Additional accessibility finding during setup

On Starter Question 2, before selecting an answer, the read-only accessibility snapshot exposed the picture group as **“10 counters 🍊”** while the ten individual picture nodes were `aria-hidden`. That pre-answer accessible name states the correct quantity for the prompt “How many oranges can you see?”, leaking the answer to assistive technology. The full ordinary-UI pre-answer snapshot is `starter-q2-preanswer-ax-label.yml`. This is a concrete age-6 teaching/fairness issue in the 5204 candidate; no source change was made here. The prior 5202 Growing neutral-label checks do not cover this counting-grid state.
