# Monster Math accessibility and worked-feedback repair QA — 3 October 2026

## Candidate and controls

Tested the frozen local candidate at `http://127.0.0.1:5202` in two fresh named Playwright contexts: desktop 1280×800 (`monster-math-desktop-20261003`) and mobile 390×844 (`monster-math-mobile-20261003`). Each context began on `about:blank`; broad `**/api/voice**` and `**/api/story**` route guards were installed before the first site navigation. Sound was turned off through the UI before game play (game button subsequently read “Turn sound on”). The supplied source identity is `483be258a774be506cf980d1c96d887f5a819400` with generated manifest checkpoint. Verified served assets: JS `index-DiCtrx4F.js`, SHA-256 `a30a326889a2b053dd6402c13316ffe71ddd6547c93ce1047933c6114d84139f`; CSS `index-CU-OkS6z.css`, SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`.

All answers were chosen through the visible UI after counting visible pictures. No state, seed, answer pool, or progress was injected. Desktop and mobile each completed Starter through the UI, unlocking Growing. The desktop Starter was completed once without clues (6/6); its replay used a visible clue once and then six correct answers. Mobile Starter used a visible clue on its first question and then six correct answers. Neither context entered the Challenge episode or completed additional bands.

## Starter clue and completion feedback

The mobile Starter run seed was `3214324426`. I used “Show me a clue” on Question 1; it changed the prompt to “Touch or point to each picture once. Keep a steady count.” and the button to disabled “Clue shown.” I then selected the correct visible answer and answered the remaining five questions correctly. The completion screen read exactly **“5 of 6 correct without a mistake or clue”**, with **3 of 3 stars**. This matches six correct answers, one clue, and no mistakes. The diagnostics export records one `hint` (`hintType: clue`), six `answer_correct` events, and `level_complete`. The desktop clean run independently completed at **6 of 6 correct without a mistake or clue**; the desktop replay with one clue also completed at **5 of 6**. Screenshots include `desktop-starter-completion-no-hint.png` and `mobile-starter-completion-with-clue.png`.

## Growing model before and after the correct answer

On desktop, the first Growing question was the addition **“What is 17 plus 2?”** Before answering, the read-only accessible DOM inspection returned the model label **“17 counters; add 2 more. Put both groups together, then count them.”** Visible text showed **“17 + 2 = ?”** and **“Put the two groups together, then count every counter.”** It did not expose the solved total in the model or instructional text. The choices included 19 as an answer option, which is expected and was not presented as the solved answer. I selected the visible **19** button.

After the correct answer, the model label became **“17 counters; add 2 more; 19 counters total”**, the equation became **“17 + 2 = 19”**, and one worked-feedback paragraph read **“17 counters. Add 2 more. That makes 19 counters.”** The solved model and equation agree; Next remained visible and enabled until clicked. The solved equation and one feedback paragraph are the expected presentation, not a duplicate paragraph issue.

The independent mobile Growing first question was subtraction: **“What is 12 take away 1?”** Before answer, its model read **“12 counters, take away 1 counter. Count what is left.”**, with **“12 − 1 = ?”** and a neutral strategy prompt. After choosing visible answer 11, the model read **“12 counters, take away 1 counter; 11 counters stay”**, equation **“12 − 1 = 11”**, and one worked-feedback paragraph **“Start with 12 counters. Take 1 away. 11 counters stay.”** Next remained visible and enabled. The model, equation and one feedback paragraph agreed.

The desktop diagnostics report Starter seed `3664565570`, replay seed `3499928595`, and Growing seed `3619023156`; the mobile diagnostics report Starter seed `3214324426` and Growing seed `281418287`. Exports were created through the visible Grown-ups → Game troubleshooting → Download game log flow and saved with the actual browser download event using `download.saveAs` to unique paths.

## Evidence and limits

- `desktop-growing-q1-before-answer.png`, `desktop-growing-q1-answered.png`
- `desktop-question1-before.png`, `desktop-question1-answered.png`, `desktop-starter-completion-no-hint.png`, `desktop-clue-used.png`
- `mobile-starter-intro.png`, `mobile-starter-q1-before.png`, `mobile-starter-completion-with-clue.png`, `mobile-growing-q1-before-answer.png`, `mobile-growing-q1-answered.png`
- `monster-math-desktop-diagnostics.json`, `monster-math-mobile-diagnostics.json` (UI download events saved via `download.saveAs`)
- `desktop-console.txt`, `desktop-requests.txt`, `mobile-console.txt`, `mobile-requests.txt`

Both console captures reported zero messages, errors, and warnings. Request inventories contain local candidate assets and packaged audio only; no voice/story API request appears. Packaged audio bytes were requested despite sound being off; audio playback was not assessed. This is local candidate UI evidence only. It does not establish audible output, production availability, production data or an overall release score. No product/source code was edited; only QA evidence files were added.

## Follow-up: close the two remaining operation/viewport cases

This follow-up uses fresh desktop and mobile QA sessions on the same frozen local candidate. Both sessions opened `about:blank`; `**/api/voice**` and `**/api/story**` guards were installed before navigation, the sound toggle was switched off through the UI, and the served JS/CSS hashes were rechecked against the candidate values in the setup section above. Each fresh session unlocked Growing through six correct visible Starter answers. I then advanced Growing through the visible Next control only as needed to reach the missing operation. No injected data or answer state was used.

### Desktop subtraction

At 1280×800, the first Growing question was addition (1 + 15 = 16), so I answered that visible question to advance to subtraction, without completing Growing. The subtraction prompt was **“What is 14 take away 5?”** Before selection, its read-only accessible model label was **“14 counters, take away 5 counters. Count what is left.”** Visible equation and strategy were **“14 − 5 = ?”** and **“Start with the counters, take away the second group, then count what is left.”** Neither model nor strategy exposed the answer. I chose visible answer **9**. Afterward, the model read **“14 counters, take away 5 counters; 9 counters stay”**, equation **“14 − 5 = 9”**, and the sole worked-feedback paragraph read **“Start with 14 counters. Take 5 away. 9 counters stay.”** Next was visible and enabled.

### Mobile addition

At 390×844, the first Growing question was addition: **“What is 2 plus 14?”** Before selection, the accessible model label was **“2 counters; add 14 more. Put both groups together, then count them.”** Visible equation and strategy were **“2 + 14 = ?”** and **“Put the two groups together, then count every counter.”** The result was not exposed. I chose visible answer **16**. Afterward, the model read **“2 counters; add 14 more; 16 counters total”**, equation **“2 + 14 = 16”**, and the sole worked-feedback paragraph read **“2 counters. Add 14 more. That makes 16 counters.”** Next was visible and enabled.

The fresh desktop Starter/Growing seeds were `1795023336` and `2203950998`; the fresh mobile seeds were `1860579028` and `1170734031`. Both Starter runs completed 6/6 before Growing opened. The UI diagnostics downloads were saved with their actual browser download events via `download.saveAs` as `monster-math-label-desktop-diagnostics.json` and `monster-math-label-mobile-diagnostics.json`.

Follow-up screenshots: `desktop-growing-subtraction-before-answer.png`, `desktop-growing-subtraction-answered.png`, `mobile-growing-addition-before-answer.png`, and `mobile-growing-addition-answered.png`. Context logs are `label-desktop-console.txt`, `label-desktop-requests.txt`, `label-mobile-console.txt`, and `label-mobile-requests.txt`. Both console captures had zero messages, errors or warnings; request inventories show local-origin resources only and no voice/story API requests. A packaged audio resource was requested while the sound toggle was off; playback was not assessed. No further Growing questions were played after the missing cases. This remains local UI evidence, not audible or production acceptance.
