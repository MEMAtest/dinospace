# Monster Math phase-entry scroll check — local 5358

Date: 2026-10-04  
Candidate: source `94d44d031d5835d0d9fa2128064ff83ba5880a62`, frozen dist `tmp/release-94d44d0/dist`, served at `http://127.0.0.1:5358`.  
Identity: [monster-entry-scroll-repair-identity-20261004.json](../monster-entry-scroll-repair-identity-20261004.json).

## Result

The narrow phase-entry check passed at 390×844 and 1280×800. Starting the six-question Starter episode from its below-fold map card entered Question 1/6 with `scrollY === 0`. The active header, Back control, and sound control were visible. Back and sound controls measured 48×48 CSS px at both widths. The page had no horizontal overflow.

This is a bounded local check of the phase-entry scroll repair. It does not verify all Monster Math content or scoring, and it makes no audio-quality or 4.5 acceptance claim.

## Steps and observations

- In each fresh Playwright session, opened `about:blank`, installed `/api/voice` and `/api/story` 204 guards in the same Playwright call before the first app navigation, then set the viewport and navigated to 5358. The CLI did not list those per-call `page.route` guards afterward; I then installed persistent CLI route guards and confirmed both patterns in `route-list`. No `/api/voice` or `/api/story` requests appeared in either session's request log.
- Used the visible player chooser to select Amari, opened Maths Missions, selected Monster Math, and observed Episode 1 “Count to 10” with Episodes 2 and 3 locked.
- At mobile width the “Start six questions” control was below the initial viewport: its measured box began at y=920 and was 326×64 px. Activating it entered Question 1/6 and reset the viewport to y=0. Header bounds were x=8, y=8, width=374, height=122; Back was 48×48 at x=20, y=20; sound was 48×48 at x=322, y=20.
- At desktop width, Start entered Question 1/6 at y=0. Header bounds were x=128, y=16, width=1024, height=76; Back and sound were each 48×48 and fully visible.
- On mobile Question 1, the prompt showed five crystals. A visible wrong choice (6) displayed “Not yet. Try the clue, then count the model again.” The visible correct choice (5) held “There are 5 crystals.” and exposed Next question. Next advanced to Question 2/6, “How many apples can you see?”
- Back opened the “Leave the game?” dialog. “Keep playing” returned to the same Question 2/6. “Back to world” returned to Maths Missions; reopening Monster Math and using Start again entered a fresh Question 1/6 at y=0.
- Sound was turned off through the visible control before gameplay in both profiles. Screenshots, console, request, and layout checks are summarized below.

## Evidence

- [Mobile map before Start](mobile-map-before-start.png)
- [Mobile Question 1](mobile-active-question-1.png)
- [Mobile held correct answer](mobile-held-answer.png)
- [Mobile replay Start transition](mobile-replay-start-question-1.png)
- [Desktop Question 1](desktop-active-question-1.png)

At the end of each profile, Playwright reported 0 console errors and 0 warnings. All requested identity assets (16/16, including index and service worker) matched the frozen manifest by response length and SHA-256. Static requests returned HTTP 200. The browser logs contained no provider API attempts. The sound toggle remained off; no human listening was performed.

## Scope boundary

Only the initial entry into the active episode, one count answer with a retry, held feedback/Next, Back/Keep, and return/re-entry were checked. The full 18-question episode progression, episode unlocks, story problems, and production deployment were not tested here.
