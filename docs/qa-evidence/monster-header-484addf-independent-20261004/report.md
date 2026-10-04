# Monster Math header candidate: independent local UI check

Date: 2026-10-04

## Candidate identity and limits

- Frozen source SHA: `484addf2e76be849845f508bdc9fc5e1325b51b7`
- Origin: `http://127.0.0.1:5307`
- Identity: [`monster-header-identity-20261004.json`](../monster-header-identity-20261004.json); all seven listed served HTML/JS/CSS hashes match the frozen build.
- Browser: fresh isolated Playwright session `monster-header-484addf`; viewport checks at 390×844 and 1280×800.
- `/api/voice` and `/api/story` routes were installed and listed before visiting the app. Sound was switched off. No provider calls, saved-data edits, progress seeding, answer extraction, or source/build changes were used.
- This is a frozen local candidate check. It does not certify narration, full audio, production behavior, or Amari 4.5 acceptance.

## Episode access and header

Using ordinary rendered controls, I completed Episode 1, **Count to 10**, with 6/6 correct and 3/3 stars, then Episode 2, **Add and Take Away**, with 6/6 correct and 3/3 stars at 390×844. Episode 3 unlocked without storage changes.

I checked **Monster Story Problems** at both viewport sizes and replayed it from the episode map. The episode label rendered in full as “Episode 3 · Monster Story Problems” at 390px; it was not ellipsized. The map rendered all three episode names in full. Mobile document width remained within the 390px viewport (390px); the page uses vertical scrolling for content below the fold.

Header Back and sound buttons measured 48×48px on desktop and mobile. On desktop, “Hear the question again” measured 246.6×48px, answer buttons 172.4×64px, and “Try the jumps” 356.8×48px. On mobile, the question button measured 246.6×48px, answer buttons 153.5×64px, and “Try the jumps” 319×48px. All measured interactive targets meet the 48px minimum.

## Story episode results

For every turn I used the visible story, visible number-line starting point and jump direction/count, and the rendered answer buttons. Correct results stayed visible with Next held until clicked. No clue was used.

### Mobile, 390×844

| # | Visible story | Visible model | Answer | Visible feedback |
|---|---|---|---:|---|
| 1 | Tess has 16 stars; gives 9 away | Start at 16, jump back 9 | 7 | 7 stars are left |
| 2 | Bo has 11 balloons; gives 3 away | Start at 11, jump back 3 | 8 | 8 balloons are left |
| 3 | Tess has 12 stars; gives 3 away | Start at 12, jump back 3 | 9 | 9 stars are left |
| 4 | Mira has 14 shells; gives 9 away | Start at 14, jump back 9 | 5 | 5 shells are left |
| 5 | Max has 5 cookies; finds 5 more | Start at 5, jump forward 5 | 10 | There are 10 cookies |
| 6 | Tess has 10 stars; gives 7 away | Start at 10, jump back 7 | 3 | 3 stars are left |

Completion displayed “6 of 6 correct without a mistake or clue,” 3/3 stars, and “Progress is saved.”

### Desktop, 1280×800

| # | Visible story | Visible model | Answer | Visible feedback |
|---|---|---|---:|---|
| 1 | Max has 4 cookies; finds 2 more | Start at 4, jump forward 2 | 6 | There are 6 cookies |
| 2 | Ava has 13 flowers; gives 9 away | Start at 13, jump back 9 | 4 | 4 flowers are left |
| 3 | Max has 9 cookies; finds 3 more | Start at 9, jump forward 3 | 12 | There are 12 cookies |
| 4 | Nia has 11 gems; finds 9 more | Start at 11, jump forward 9 | 20 | There are 20 gems |
| 5 | Leo has 5 apples; gives 1 away | Start at 5, jump back 1 | 4 | 4 apples are left |
| 6 | Bo has 1 balloon; finds 3 more | Start at 1, jump forward 3 | 4 | There are 4 balloons |

Completion displayed “6 of 6 correct without a mistake or clue,” 3/3 stars, and “Progress is saved.”

## Persistence, navigation, and diagnostics

After desktop completion, reloading retained all three completed episode badges and their three-star rewards in the episode map. From the completion screen, **Back to world** returned to **Maths Missions**. From an active game, Back opened the visible “Leave the game?” guard; choosing **World** also returned to **Maths Missions**.

The guarded routes remained active through navigation and replay. The browser recorded zero console errors and zero warnings. The non-static request list was empty; 44 static requests were omitted by the CLI summary. Sound stayed off, so this run makes no claim about audio playback or narration assets.

## Evidence

- [Mobile Episode 3 gameplay at 390×844](mobile-episode3.png)
- [Mobile story replay, first question](mobile-story-replay-q1.png)
- [Mobile completed story rewards](mobile-story-completed.png)
- [Desktop Episode 3 gameplay at 1280×800](desktop-episode3.png)
- [Desktop completed story rewards](desktop-story-completed.png)

## Result

The frozen candidate passes this scoped header, ordinary progression, Challenge episode, held-feedback, reward persistence, and navigation check at the tested widths. Audio/narration and production checks remain separate gates.
