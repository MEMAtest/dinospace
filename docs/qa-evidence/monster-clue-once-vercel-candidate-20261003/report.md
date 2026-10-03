# Monster Math clue-once: immutable Vercel candidate UI check

**Run date:** 2026-10-04 (Europe/London)
**Candidate:** deployment `dpl_2STuJZUmaGLU6Vpvj5sb6uSj4B7t`
**Source:** `f72f59edf2c4df00d3f4649e22310bbf2281c9a0`
**URL:** `https://dinospace-kdjkemvhr-memas-projects-23a0001d.vercel.app`
**Identity evidence:** [`monster-clue-production-candidate-identity-20261003.json`](../monster-clue-production-candidate-identity-20261003.json)

This is a scoped UI check of a READY immutable Vercel candidate. It is not the canonical site: at the time of this check canonical remained on source `a1eec24552c99529ba30ed38d10492a6ce1c7829`. This report does not authorize or perform promotion, and does not claim full Batch 4/4.5 acceptance.

## Guarded setup

I used two fresh Playwright CLI sessions, one at 1280×800 and one at 390×844. In each session I opened `about:blank`, set the viewport, added routes for `**/api/voice` and `**/api/story` returning HTTP 204, and verified both routes in the route list before the first navigation to the Vercel candidate. I selected Amari and navigated through the rendered Maths Missions and Monster Math controls. In each profile I completed the six visible Count to 10 picture-count questions with ordinary answer controls to unlock Growing; no progress or storage was seeded, no answers were read from hidden state, and no provider calls were made. The sound control remained off.

The identity file binds the deployment to source `f72f59e` and records all seven served runtime asset hashes matching the frozen candidate. Its provider metadata explains why the surrounding `gitCommitSha` is not used for source attribution.

## Desktop: 1280×800

The first Growing question was “What is 18 take away 6?” Before the clue, the model showed “Start with the counters, take away the second group, then count what is left.” After **Show me a clue**, the clue “Start with 18 counters. Slide 6 away, then count what stays.” appeared once; the neutral teaching sentence under the model disappeared; and the clue control was disabled as **Clue shown**.

I selected the visible wrong choice 8. Retry feedback appeared and the neutral sentence remained absent. I then selected correct choice 12. One explanation appeared (“Start with 18 counters. Take 6 away. 12 counters stay.”) and stayed visible until I clicked **Next question**. The next visible question was 19 − 8 with its own neutral strategy and unused clue control.

From the next question, **Back to learning world** opened the leave confirmation. **Keep playing** retained the same question; confirmed **Back to world** returned to Maths Missions.

## Mobile: 390×844

The first Growing question was 10 − 9. The clue appeared once, the neutral model sentence disappeared, the clue button became disabled, wrong choice 2 produced retry feedback, and correct choice 1 showed one explanation (“Start with 10 counters. Take 9 away. 1 counter stays.”). **Next question** advanced to a new question with a fresh neutral strategy and unused clue. The leave confirmation’s **Keep playing** retained the current question; confirmed **Back to world** returned to Maths Missions.

I also exercised another ordinary Growing question (16 + 3) to check the mobile feedback and Next geometry. After clue, wrong 15, and correct 19, the explanation and Next appeared in the page content. At the initial scroll position, Next was below the viewport: its bounding box was `x=107.0, y=806, width=176.0, height=56` while the viewport bottom was 844. The document had vertical overflow (`scrollHeight=973`) but no horizontal overflow (`scrollWidth=390`). After a normal PageDown scroll, Next was fully visible at `y=738..794`, unobscured in the screenshot, and a click advanced to question 2. The target was 56px high, above the 48px minimum. Thus it is reachable, though a child must scroll to see it on this tall feedback screen.

## Console, requests, and limits

- Both browser sessions: 0 console messages, 0 errors, 0 warnings.
- App HTML, main JS/CSS, visible character/game images, and icons loaded successfully (HTTP 200). The browser also requested local Matilda audio assets (HTTP 206 range responses, with a few HTTP 200 responses) while the app’s sound control was off. This establishes asset availability only; this run did not start or assess audio playback.
- The `/api/voice` and `/api/story` guards were present in both sessions throughout, returning HTTP 204. No paid endpoint or story generation was exercised.
- The exact 2 + 10 prompt did not appear in this bounded natural sample; no queue was forced. The normal observed examples still exercise the shared clue flow.
- This does not test other games, sibling isolation, diagnostics export/privacy, or human listening. No source files or deployment settings were changed.

Screenshots and accessible browser snapshots are organized separately under [`desktop/`](desktop/) and [`mobile/`](mobile/).
