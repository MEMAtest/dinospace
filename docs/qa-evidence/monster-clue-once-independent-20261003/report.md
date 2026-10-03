# Monster Math clue-once repair: independent local UI check

**Run date:** 2026-10-03 (UTC)
**Candidate:** `f72f59edf2c4df00d3f4649e22310bbf2281c9a0`
**Target:** `http://127.0.0.1:5281`
**Identity:** [`monster-clue-once-candidate-identity-20261003.json`](../monster-clue-once-candidate-identity-20261003.json)

## Setup and scope

I used a fresh Playwright CLI profile at 390×844. Before the first app navigation I routed `**/api/voice` and `**/api/story` to HTTP 204 and checked that both guards were installed. I selected Amari and reached Maths Missions and Monster Math through the rendered controls; I did not seed progress, alter storage, inspect answers, or call either provider. Sound was off during the test.

The candidate identity document records matching SHA-256 hashes for all seven expected served assets. This is a narrow local UI regression check for the Monster Math clue paragraph, not production acceptance or full Batch 4/4.5 acceptance. The candidate document separately records 14 focused tests, changed-file lint, and a production-config build passing; those are not substitutes for this browser evidence.

## Ordinary progress and gameplay

I completed the six-question Count to 10 starter episode using the visible picture/count choices. The rendered result showed 6/6 correct, 3/3 stars, and that the badge was saved for this child. I used the visible Next episode control to unlock Growing, then answered its six rendered questions. On its first question (18 + 1), I requested a clue, selected a visibly offered wrong choice (16), then selected the visibly offered correct choice (19). The episode result showed 5/6 correct without a mistake or clue, 3/3 stars, and the badge saved. This reflects the one assisted/clued response.

I replayed Growing through its rendered Replay episode control and answered ordinary randomized questions from their visible equations and choices. The replay result showed 6/6 correct and 3/3 stars. Further natural Growing replay questions were sampled; exact 2 + 10 did not appear in this bounded run, so that specific equation’s UI path remains unverified here. No queue data was forced or seeded.

## Clue regression result

On the initial Growing question, the pre-clue screen showed the neutral model sentence, “Put the two groups together, then count every counter.” After pressing **Show me a clue**, that same sentence appeared once in the clue/status area and disappeared from the teaching copy under the ten-frame model. The button became disabled and read **Clue shown**.

The wrong choice produced retry feedback (“Not yet. Try the clue, then count the model again.”) and did not bring back the duplicate teaching sentence. Correct choice 19 produced one visible explanation (“18 counters. Add 1 more. That makes 19 counters.”). After **Next question**, a new question appeared with its own neutral model teaching sentence and an unused clue button. This supports the intended per-question reset. The saved screenshots and accessible snapshots are under [`390/`](390/).

## Back guard

On a fresh active replay question, **Back to learning world** opened a **Leave the game?** dialog. **Keep playing** closed the dialog and left the same question visible. Reopening the dialog and choosing **Back to world** returned to the Maths Missions screen (`#/world/maths`). The corresponding snapshots and final screenshot are included under `390/`.

## Browser observations and limits

- Playwright console: 0 messages, 0 errors, 0 warnings.
- Static requests reported HTTP 200 for the app entry, JS/CSS, displayed character/game images and icon. A local Matilda audio asset was fetched with HTTP 200. Sound remained off, so this run does not establish narration playback or listening quality.
- The voice and story routes remained intercepted with 204 responses. No provider call was allowed.
- Tested only a fresh synthetic Amari profile at mobile viewport size. No desktop, sibling isolation, export/privacy, narration, or production behavior is claimed by this report.
- No source files were modified.
