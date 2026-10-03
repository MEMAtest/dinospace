# Monster Math clue-once canonical production check

**Run date:** 2026-10-04 (Europe/London)
**Canonical URL:** https://dinospace-eight.vercel.app
**Deployment:** `dpl_2STuJZUmaGLU6Vpvj5sb6uSj4B7t` (READY)
**Source:** `f72f59edf2c4df00d3f4649e22310bbf2281c9a0`
**Identity evidence:** [`monster-clue-canonical-identity-20261003.json`](../monster-clue-canonical-identity-20261003.json)

This is a narrow canonical regression check of the Monster Math clue-once repair. The root-verified identity records the exact deployment and all seven expected served runtime asset hashes. It is not full Batch 2 acceptance or full 4.5 acceptance, and it does not establish human listening or broad release readiness.

## Guarded setup and ordinary unlock

I used fresh isolated Playwright browser sessions at desktop 1280×800 and mobile 390×844. In each session I began at `about:blank`, configured the viewport, installed `**/api/voice` and `**/api/story` routes to return HTTP 204, and confirmed both routes were active before navigating to the canonical app. I selected Amari and used the rendered Maths Missions and Monster Math controls. In each profile I completed the six visible Count to 10 questions with ordinary answer buttons to unlock Growing. No progress or storage was seeded, no answers were taken from hidden application state, and no provider or story-generation call was made. Sound remained off.

## Desktop: 1280×800

The first naturally presented Growing prompt was **9 + 7**. Before answering, the rendered model included one neutral strategy sentence. Clicking **Show me a clue** replaced that sentence with the clue “Put the two groups together, then count every counter.” exactly once, and disabled the clue control as **Clue shown**.

I chose the visible wrong answer 15. Retry feedback appeared; the strategy remained absent. I then chose 16. The correct explanation “9 counters. Add 7 more. That makes 16 counters.” appeared once and remained held with the answer controls disabled until **Next question**. Next advanced to a fresh question (3 + 15) with its own neutral strategy and available clue.

**Back to learning world** opened the leave confirmation. **Keep playing** retained the same question. Reopening the confirmation and choosing **Back to world** returned to the rendered Maths Missions list.

## Mobile: 390×844

The first Growing prompt was **16 take away 6**. The single clue replaced the neutral strategy sentence; the clue button became disabled. Choosing visible wrong answer 7 showed retry feedback, and choosing 10 showed one held explanation: “Start with 16 counters. Take 6 away. 10 counters stay.” The answer controls stayed disabled until Next. **Next question** advanced to a new prompt (18 − 2) with a new strategy sentence and unused clue.

At the initial scroll position on the held-feedback view, the page measured 390px wide by 973px tall; there was no horizontal overflow. The **Next question** button measured 176×56px at y=867.5, below the 844px viewport. A normal touch-style scroll brought the button fully into view at y=738–794, where it was visible and operable. Thus the feedback layout requires vertical scrolling on this screen size, but the control is reachable and exceeds the 48px target-height threshold.

**Back to learning world** opened the leave confirmation. **Keep playing** kept the same question. A second attempt followed by confirmed **Back to world** returned to Maths Missions.

## Runtime evidence and limits

- Both browser sessions reported zero console messages, errors, and warnings.
- HTML, main JS/CSS, images/icons requested during the sessions returned HTTP 200. Browser audio requests used local `/audio/en/*-matilda.mp3` assets (HTTP 206 range and HTTP 200 responses). Sound stayed off, and this run did not start or evaluate audio playback; successful requests establish availability only.
- Both guarded routes remained installed and returned HTTP 204 throughout the sessions.
- The exact 2 + 10 prompt was not observed in this bounded natural sample; I did not force a queue or extend sampling to reach it.
- This delta does not retest the other games, the full candidate matrix, sibling isolation, grown-up diagnostics export/privacy, packaged narration completeness, or human listening. No source or deployment settings were changed.

Screenshots and accessible Playwright snapshots are saved under [`desktop/`](desktop/) and [`mobile/`](mobile/). The related immutable candidate check remains separately documented in [`monster-clue-once-vercel-candidate-20261003/report.md`](../monster-clue-once-vercel-candidate-20261003/report.md).
