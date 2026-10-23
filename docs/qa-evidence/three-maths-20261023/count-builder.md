# Count the Stars builder notes

## Changes

- Added a visible recount action at the answer step. It clears only the current round's counted badges, returns to object counting, keeps the six-question run and existing mistake total, and records a hint so the reward reflects the extra help.
- Removed the object's pool index from its accessible name. Uncounted objects are announced as not counted; after tapping, the name exposes only that object's ordinal badge.
- Completion art now reads earned-page state, so a replay continues to show the earned constellation at full brightness.
- Added a direct next-survey action after the first two episodes. The map highlights the next incomplete unlocked survey and gives completed surveys quieter replay buttons.
- Added “Hear explanation” during the fact step, replaying the same packaged praise and explanation segments used for the correct answer.
- Simplified the berry, star and meteor motifs so each countable button depicts one named object. Removed the separate scene emoji beside the board to avoid stray count targets.

## Acceptance checks

- Existing batch data retains all three episodes (1–5, 1–10, 1–20), six rounds, 15 distinct motifs, seeded arrangements, recent-question rotation and player-scoped progress. Targets are 48px on the measured 308px phone board and 56px on the 440px desktop board.
- Recount is available only after the count is complete and before an answer; it starts at badge 1, keeps wrong-answer count, and marks the round as hinted.
- Correct-answer replay continues to use the existing `countCorrectNarration` segments; no narration assets or paid voice calls were added.
- Each berry/star/meteor button now contains one obvious countable motif, and scene decorations are not rendered beside the counting board.
- Focused automated checks: `node --test test/countUplift.test.mjs test/countTheStarsBatch3.test.mjs test/countTheStarsProgress.test.mjs test/batch3Narration.test.mjs`. `countUplift.test.mjs` checks all 40 count/layout combinations at 308px with 48px targets and 440px with 56px targets. Scoped lint: `npx eslint src/components/games/AmariCountTheStars.jsx`.
- Browser interaction and visual acceptance remain with the parent QA pass.
