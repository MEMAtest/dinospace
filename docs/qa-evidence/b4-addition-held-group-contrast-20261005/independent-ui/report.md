# Addition held-group contrast: independent rendered check

## Candidate and scope

- Frozen candidate source: `95d0160ef7a422a138551db82f11aa8d585b3a7d`, parent `d6058d3c`.
- Frozen build and served hashes: [`independent-source-build.json`](../independent-source-build.json). Before app navigation, I independently fetched the index and all five linked files listed there from `http://127.0.0.1:5402`; each returned HTTP 200 and matched its recorded SHA-256.
- Used the sole existing Chrome tab at 390×844, then resized the same held round to 1280×800. No new browser, window, tab, context, profile injection, or progress seeding was used.
- `/api/voice` and `/api/story` were confirmed guarded with 403 responses before navigation and remained guarded. Sound stayed muted.

## Result

The held original groups are clearly readable at both widths after the correct answer. On the visible first question, “Put 7 shells and 0 shells together. How many altogether?”, I chose the visible answer 7. The held state showed seven shells in the first group, the explicit “Second group: 0 (empty)” label, seven shells in the result tray, and “7 shells and 0 shells make 7 altogether.” The original groups and their labels were high contrast and readable; I saw no opacity fade that obscured them. Screenshots: [390×844 held answer](screenshots/mobile-held-answer.png) and [1280×800 held answer](screenshots/desktop-held-answer.png).

The visible Next question advanced to question 2 of 6 and reset the result tray. Back opened the expected “Leave the game?” confirmation; confirming “Back to world” returned to Maths Missions. The app console had zero messages, errors, or warnings. The request log showed local app assets only; no paid route was requested.

This verifies the specific Addition held-group contrast correction at two responsive viewport sizes. It is not a full Addition rerun, audio/listening acceptance, or overall release decision.
