# Monster Math guided number-line practice — independent QA

**Date:** 3 October 2026. **Decision:** the guided practice mechanics passed this bounded local check at both viewports. One age-six wording improvement remains. This is not production acceptance, a human listening result, or a 4.5/5 release certification.

## Candidate and method

Frozen candidate: `http://127.0.0.1:5209`, source `19a4f01ccd00dacd867c89d149b20c2cbec1bc89`.

- JS `index-CX0VJ3DR.js`, SHA-256 `d6bdc7db470e1fcfb171e7a2d58e2da3963e74651948f89fa70593cf399aa95d`
- CSS `index-D3NTSs-Z.css`, SHA-256 `008707f972ebe009fcbfcf5aa50207cc0c8a381f3f4e89fa1d22194374a681db`
- Both assets match [`batch2-jumps-readable-candidate-identity-20261003.json`](../batch2-jumps-readable-candidate-identity-20261003.json). The 1,371 packaged narration clips were unchanged from the preceding candidate; narration listening was not tested here.

I used fresh named Playwright contexts at 1280×800 and 390×844. Each began at `about:blank`; sound was disabled with the visible control; broad `**/api/voice**` and `**/api/story**` abort guards were installed before the first candidate navigation. No seed, progress, answer, unlock, or state was injected. I completed six visible Starter and six visible Growing questions at each viewport using only visible picture counts, visible arithmetic prompts, answer buttons and Next controls to unlock Story. I then exercised one ordinary Story question per viewport and one additional ordinary Story question per viewport to isolate the “clue then correct first answer” diagnostic. Those extra checks were single-question deltas, not completed Story bands.

The guard snippets, full local request inventories, console logs, screenshots, accessibility snapshots and actual Grown-ups → Game troubleshooting → Download game log exports are retained beside this report. Both UI download events were saved with Playwright `download.saveAs` to distinct desktop and mobile paths. The browser request inventories contain 21 successful local GETs and no `/api/voice` or `/api/story` requests; both final console logs have zero errors or warnings. The CLI's separate `route-list` reports no CLI mock routes; the page-level route-handler snippets show the guards used on the first navigation.

## Observed practice states

| Viewport | Ordinary Story question | Result |
|---|---|---|
| Desktop 1280×800 | Leo has 14 apples; gives 4 away; answer 10. | Before the clue, the number line showed the start at 14 and instruction to jump back 4, with no solved landing marker/route or step button. The answer remained among the ordinary choices. The only practice entry was **Try the jumps**. After choosing it, one **Jump one step back** button and **Start again** appeared. |
| Mobile 390×844 | Ava has 4 flowers; finds 11 more; answer 15. | Before the clue, the number line showed the start at 4 and instruction to jump forward 11, with no solved landing marker/route or step button. The answer remained among the ordinary choices. The only practice entry was **Try the jumps**. After choosing it, one **Jump one step forward** button and **Start again** appeared. |

Each activation advanced exactly one number. The visible marker moved and its accessible label changed to “Current position N”; a single changing `aria-live="polite"` status paragraph reported the current position and remaining jumps. The step button and reset button measured 48px high or larger. At mobile the step button measured 210.16×48px and Start again 117.13×48px; document/body widths remained 390px. The ordinary question replay, answer, clue, Back and sound controls measured at least 48px high; answer targets were 161×64px. Desktop step was 187.05×48px and reset was 117.13×48px; viewport/document/body widths remained 1280px.

### Desktop subtraction interaction

For 14−4, a pointer activation moved 14→13 and changed the announcement to “At 13. 3 jumps left.” **Start again** restored 14 and 4 jumps. Keyboard Enter moved to 13; Space moved to 12; two pointer activations moved to 11 and then 10. At 10 the step button was disabled; an additional Space left position and status unchanged. A wrong visible answer (11) showed the gentle retry copy without removing the practice control. The correct answer 10 produced the matching solved line “Start at 14, then jump back 4 steps to 10.” and feedback “Leo starts with 14 apples. Leo gives 4 apples away. 10 apples are left.” Step controls disappeared after the correct result. Next advanced once to Max’s 4−1 question; previous jump status and controls were absent.

### Mobile addition interaction

For 4+11, keyboard Enter moved 4→5 and Space moved 5→6, with remaining counts 10 then 9. A wrong visible answer (17) left the same question and enabled step control in place. Nine pointer activations then advanced 6→15 one number at a time; at 15 the step button disabled, and an extra Enter made no change. The correct visible answer 15 produced “Start at 4, then jump forward 11 steps to 15.” and “Ava had 4 flowers. Ava found 11 more. Now there are 15 flowers.” Step controls disappeared. Next advanced once to Tess’s 16−9 question and cleared the old practice status. On that new question, one back-step moved 16→15 and **Start again** restored 16 with 9 jumps remaining.

### Hint accounting and wording

Both viewports recorded a `hint` with `hintType: "clue"`. To isolate first-answer scoring, each context then began one additional ordinary Challenge queue, used the visible clue on Question 1, and selected the visible correct answer without an intervening wrong answer. The UI diagnostic logs record `answer_correct.firstAttempt: false` for those first correct selections (desktop Story seed `1128832827`; mobile Story seed `2758292032`), so clue-assisted answers do not count as first-try correct. In the earlier interaction run, logs also retain the visible wrong attempts and later correct answers.

One improvement remains in this exact candidate: the status says **“At 4. 11 jumps left.”** during forward addition. The number and remaining-hop count are correct, but “left” can suggest a leftward direction to a young learner. The same wording was observed for subtraction and means jumps remaining there too. Prefer **“At N. N jumps to go.”**, with the singular form **“1 jump to go,”** and **“At N. All jumps done.”** at the endpoint so the remaining count does not imply direction. This is a copy-only issue on the 5209 identity; any later copy repair has a separate identity and is not covered by this report.

The status uses dark brown `rgb(69, 26, 3)` text on white, 14.98:1 contrast. The mobile step button uses the same foreground on amber `rgb(245, 158, 11)`, 6.97:1 contrast. Both exceed 4.5:1 for normal text.

## Evidence files

- [`interaction-traces.json`](interaction-traces.json): summarized positions, hop counts, reset/terminal results, first-answer diagnostics, bounds and contrast.
- `desktop/` and `mobile/` contain `story-q1-preclue-*`, `story-q1-clue-*`, practice/correct-result/next screenshots and snapshots; mobile also has the second-question contrast and reset capture.
- `monster-5209-desktop-ui-log-final.json` and `monster-5209-mobile-ui-log-final.json`: actual UI log downloads saved via `download.saveAs`. They contain Starter/Growing unlock seeds and both bounded Story runs per viewport.
- `requests-final.txt`, `console-final.txt`, `route-guards.txt`, and `pre-navigation-guards.js` retain runtime setup and inventories.
- The scripts used for ordinary UI unlock and interaction are preserved as `unlock-starter.js`, `unlock-growing.js`, `subtraction-interactions.js`, `addition-interactions.js`, and capture/export scripts.

## Editorial score update

For this 5209 local candidate only, I would raise the prior provisional **Age-6 teaching** estimate from 4.0/5 to **4.5/5**. The learner can now explore an addition or subtraction one hop at a time before answering, see the position and remaining hops change, use either keyboard or pointer, reset the practice, and still answer the underlying question. Wrong answers preserve the practice state. The ambiguous “jumps left” copy is a real minor teaching-clarity issue and should be corrected on the next identified snapshot.

The other provisional Monster dimension views remain progression 4.5/5, correctness/fair variation 4.5/5, feedback/audio/visual usability 4.0/5, and reliability/navigation/persistence 4.0/5, based on retained baseline and prior identified deltas; this jump check does not change those judgments. Equal-weight mean for this local editorial synthesis is **4.3/5**, provisional and unaccepted. Human listening, final production identity verification, the known 6b duplicate-feedback regression retest, and the later copy-only status wording identity remain separate gates. No audible-quality, physical-device, production, or release-acceptance claim is made.
