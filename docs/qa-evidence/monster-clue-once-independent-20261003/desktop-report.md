# Monster Math clue-once repair: desktop-width independent check

**Run date:** 2026-10-03 (UTC)
**Candidate:** `f72f59edf2c4df00d3f4649e22310bbf2281c9a0`
**Target:** `http://127.0.0.1:5281`
**Viewport:** 1280×800
**Candidate identity:** [`monster-clue-once-candidate-identity-20261003.json`](../monster-clue-once-candidate-identity-20261003.json)

This supplements the separate [390×844 mobile report](report.md). The candidate identity records matching hashes for the seven expected served assets. This is a local UI check only; it does not establish production acceptance or full Batch 4/4.5 acceptance.

## Setup and ordinary unlock

I opened a fresh Playwright CLI session at `about:blank`, set the desktop viewport, installed `**/api/voice` and `**/api/story` HTTP 204 routes, and confirmed both guards in the route list before navigating to the app. I selected Amari, entered Maths Missions, opened Monster Math, and completed the visible six-question Count to 10 starter episode from its rendered pictures and choices. The result showed 6/6 correct, 3/3 stars, and the new episode badge saved. I used **Next episode** to start the now-unlocked Growing episode. No storage/progress seeding, hidden answer inspection, or provider request was used. Sound remained off.

## Growing clue path

The first rendered Growing question was “What is 14 take away 6?” Before the clue, the ten-frame teaching copy read “Start with the counters, take away the second group, then count what is left.” Pressing **Show me a clue** displayed “Start with 14 counters. Slide 6 away, then count what stays.” once in the clue area, removed the neutral teaching copy under the model, and disabled the clue button as **Clue shown**.

I chose the visible wrong option 4. The UI showed “Not yet. Try the clue, then count the model again.” The duplicate neutral copy remained absent and the clue stayed used. I then chose visible correct option 8. The answer remained on screen with one explanation: “Start with 14 counters. Take 6 away. 8 counters stay.” The rendered **Next question** control stayed available until I chose it. Next advanced to question 2 (8 + 12) and displayed that question’s own neutral strategy with an unused clue control.

## Back guard and return

From Growing question 2, **Back to learning world** opened **Leave the game?**. **Keep playing** closed the dialog and left question 2 visible. Reopening the dialog and selecting **Back to world** returned to the Maths Missions page (`#/world/maths`). See screenshots and accessible snapshots in [`1280/`](1280/).

## Browser observations and bounds

- Playwright console: 0 messages, 0 errors, 0 warnings.
- Static request log: app entry, JavaScript, CSS, and listed image/icon assets returned HTTP 200. Local audio files also returned HTTP 200; sound was off, so this check does not establish actual audio playback or narration quality.
- The voice/story routes remained guarded with HTTP 204 responses.
- Exact 2 + 10 did not appear in the bounded desktop run (one normal Growing question was exercised). Its exact-question path is not claimed here. No attempt was made to force a queue or alter progress.
- This run tests only the desktop-width Monster Math clue path and Back guard. It does not expand the full-game matrix, mobile result, export/privacy, sibling isolation, audio, or release gates.
- No source files were modified.
