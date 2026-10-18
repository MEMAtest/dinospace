# Code Cadets navigation correction — 18 October 2026

## Reason for the correction

The user's Mission 2 screenshot showed a completed-but-confusing interaction: an unclear objective, no intended route, and mission selection buried under advanced tools. The earlier successful journey tests did not establish that this screen explained itself. This report supersedes the earlier Code Cadets navigation/clarity acceptance.

## Changes

- Three visible, labelled mission tabs with the current mission marked; all are at least 44px tall.
- Explicit mission goal. Mission 2 explains two squares up, then two squares right to the flag.
- Green directional path, labelled Start and marked Turn corner on the map.
- Plain instruction to run the supplied code and watch whether Pip reaches the flag.
- Incorrect block 2 highlighted after the demonstration; block 3 highlighted when placing the later turn.
- Current action and success/Next panel stay visible while scrolling, including after mobile automatic board scrolling.
- Optional clue describes the full north-and-east route.
- Mission selection removed from advanced tools; save/open/manual editing remain secondary.

## Rehearsal and release

Root used one contained, headless Chromium session/tab and actual UI controls. Provider voice/story requests were guarded with 403; no paid generation or real child-data edits were performed. The prior session was closed, so the same named contained session was reopened; no normal Chrome windows were opened.

Six focused coding/rover/storage tests, scoped ESLint and Vite build passed. Local and preview rehearsals completed all three missions at 390px and 1440px, including wrong-code demonstration, direct repair, Repeat compression and four-block save/reopen/run. Dedicated navigation checks exercise visible mission tabs, correct route arrows and corner, highlighted repairs, sticky action after running, visible Next after success, and moving back to the first mission. Final clue-only revision was separately rehearsed on preview at both widths.

Final runtime: `a179d8efc22e48f91477d0f3adff57703b2130c8`.
Final tested preview: `dpl_GyyBBK4xndD3NTABz52QCVSspLvU`.
Canonical production: `dpl_2ofgXEQq5Stvw8CWBAwhcTvPZkFD`, https://dinospace-eight.vercel.app/.

An initial production rehearsal loaded the previous build during alias propagation and failed to find the new controls. It was rejected as release evidence. The final rehearsal starts only after canonical identity verification and requires the new Coding missions navigation. No result from the old-page attempt is counted as a pass.

## How a child proceeds

1. Choose a mission from the three tabs.
2. Follow the green action button to add or run instructions.
3. Watch Pip follow the highlighted code blocks. In Mission 2, use the repair action for the marked block, then run again.
4. Use Next mission after reaching the goal. Advanced editing and save/open remain under More tools.

## Final production result

- All three missions completed at both widths (six mission completions), with four-block save/reopen/run and no unexpected dialogs.
- The exact wrong-turn demonstration/repair/navigation sequence passed at both widths. Repair and Next stayed inside the 844px viewport after automatic board scrolling; mission tabs measured 54px tall on mobile and 48px on desktop.
- No page errors, broken images or horizontal overflow in these journeys. Final error-console capture is retained.
- Canonical deployment identity was checked before and after the accepted rehearsal and matched the final runtime above.

Final production results and screenshots are saved alongside this report. This is a correction to this specific navigation issue; it does not re-score all 26 games.
