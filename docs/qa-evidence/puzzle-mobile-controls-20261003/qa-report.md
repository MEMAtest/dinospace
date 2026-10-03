# Puzzle Pop mobile controls — bounded production geometry QA

Date: 3 October 2026  
Target: canonical production `https://dinospace-eight.vercel.app/`  
Viewport: 390×844  
Scope: responsive board/tray target geometry, keyboard focus, chapter progression, and sampled intro/fact/reward/leave controls. This is not a full Puzzle Pop gameplay acceptance.

## Candidate identity

- Production release: commit `6b84554e7a1d21b3db658d213a2298462c78599e`, deployment `dpl_DGLGVkaMikT5GPntS6YThDsesHyx` (identity supplied for this audit)
- Served JS: `/assets/index-akZ21SWl.js`, SHA-256 `3ebd53465f2f2a6994163ce420c3d04e7e4f578544518f9bde4f7b6e2f8fb2b0`
- Served CSS: `/assets/index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`

## Result

**Sampled geometry passes the 48×48 CSS-pixel minimum at all three board sizes.** There was no horizontal overflow (`documentElement.scrollWidth` stayed 390). The full 2×2 and 3×3 boards, all 25 5×5 board spaces, and their tray controls stayed within the 390px content width. The 3×3 and 5×5 trays extend below the initial 844px viewport and are reachable with ordinary vertical scrolling; after scrolling, every 5×5 tray piece was fully within the viewport. This is below-fold content, not clipped content.

Keyboard focus is available: board spaces and piece buttons are native buttons with `tabIndex=0`. On the 3×3 board I used Tab to reach “Choose piece 9” and Enter to select it; the selected state was exposed and the board remained at 9 pieces.

## Measurements

| Surface | Board space controls | Piece tray controls | Notes |
|---|---:|---:|---|
| 2×2 | 128×128 px (4) | 51×51 px (4) | Board 280×280 px at x=55; tray fully within width. |
| 3×3 | 84×84 px (9) | 51×51 px (9) | Tray wraps to two rows and extends 39 px below the initial viewport; vertical scroll reaches it. |
| 5×5 | 49×49 px (25) | 51×51 px (25) | Smallest sampled target is a board space at 49×49 px. Board is fully visible before scrolling. Tray extends to document y=1053 and is fully visible after scrolling to y=257. |

Other sampled controls: header Back and sound buttons 48×48 px; Hear again 230×48 px; Hint 88×48 px; chapter selection cards 310×76 px; Start chapter 204×56 px; picture fact Next picture 162×48 px; chapter reward Next chapter 167×48 px and Replay pictures 188×48 px. The leave dialog Keep playing and Back to world buttons measured 96×96 px and 80×80 px.

## UI flow and evidence

- Started in a fresh browser session. Installed abort routes for `**/api/voice**` and `**/api/story**` before the first production navigation, then muted sound.
- Completed all four Picture Pioneers puzzles (4 pieces each) and all four Curious Constructors puzzles (9 pieces each) using the on-screen Hint button, selected-piece state, and glowing board space. The UI unlocked Detail Detectives and the first 5×5 Time Observatory picture. Stopped there without completing or answering any 5×5 challenge piece.
- Used the actual Grown-ups → Game troubleshooting → Download game log UI to save `390-amari-game-diagnostics.json`. The export contains game/level/round/seed event records without child names or prompt text.
- Saved screenshots: `390-intro-map.png`, `390-2x2-before.png`, `390-starter-picture-complete.png`, `390-starter-reward.png`, `390-growing-chapter-map.png`, `390-3x3-before.png`, `390-growing-reward.png`, `390-challenge-map-unlocked.png`, `390-5x5-before.png`, `390-5x5-tray-scrolled.png`, and `390-leave-confirmation.png`.
- Network inventory: 22 static requests, all HTTP 200. Console inventory: zero messages, errors, or warnings. No voice/story API calls reached a provider because the routes were blocked; audio was not evaluated.

## Limits

This is an independently run mobile geometry check for the production release identity above. It does not score Puzzle Pop or replace the required seeded gameplay runs. I made no source changes and did not deploy. The first 5×5 puzzle was opened and measured only; Challenge play was not completed.
