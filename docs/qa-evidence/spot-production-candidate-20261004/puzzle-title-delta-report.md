# Puzzle Pop Dino Park title — independent production-candidate delta

**Date:** 2026-10-04  
**Candidate:** https://dinospace-51fgt6ny5-memas-projects-23a0001d.vercel.app  
**Deployment:** dpl_ACKz7A5eDD8DiCfUptevNEjP5xdV (READY production-target candidate)  
**Clean archive source:** 4fcb80d34bb2e9cfdb587f40ec61f44a6ae75f55  
**Candidate identity:** candidate-identity.json; 16 runtime/index files re-fetched and SHA-256 checked in this review  
**Canonical alias remained unchanged:** dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz

## Result

**Dino Park naming and the visible 2×2 completion flow pass at desktop 1280×800 and mobile 390×844.** On both sizes, the active header, preview card, instruction, completion heading, and fact use “Dino Park.” The mobile fresh run reached Dino Park as Picture 3 of 4 after ordinary River Valley and Moon Camp play. I completed the Dino Park puzzle through the visible Hint-selected piece and glowing-space controls; the held fact matched the picture, and Next advanced to the next queue item. On desktop, I completed the full four-picture Starter chapter, saw 4/4, used Replay chapter, and confirmed the replay opened a normal active picture. Back opened its leave dialog; Keep playing retained the puzzle, while Back to world returned to Creative Lab.

**One mobile queue anomaly was observed once and did not reproduce.** In the first ordinary mobile run, the visible screen after Dino Park Next showed Moon Camp as Picture 4 of 4, despite Moon Camp having appeared as Picture 2 of 4 earlier in that run. A second fresh guarded mobile run showed River Valley (1/4) → Moon Camp (2/4) → Dino Park (3/4) → Robin’s Tree (4/4). The second run's per-step screenshots document the fresh sequence. The initial observation remains ambiguous and merits source/queue reconciliation; it is not a confirmed defect, and these two runs do not establish general queue reliability. No source was changed by this test.

## Guarded test procedure

I opened two fresh named Playwright sessions at about:blank. In each, I installed /api/voice and /api/story route handlers before the first app navigation, set the viewport, then navigated to the immutable candidate. I used the visible Turn sound off control before selecting Amari. All further navigation and answers used visible UI controls. No child data, seed, progress, answer, local storage, PRNG, or hidden solution state was injected or inspected. I did not invoke narration or request an unmuted fallback; the three new Dino Park clips remain a separate missing-asset gate.

The CLI route-list command reported “No active routes” after navigation, so it is not evidence that the programmatic page handlers remained installed. The pre-navigation setup and request logs are the evidence: each browser request list showed only static requests (16 desktop and 15 mobile omitted as static), with no voice/story API or other non-static request observed. Both browser consoles reported zero errors, warnings, or messages. The browser viewport emulates 390px and is not physical-device touch evidence.

## Rendered title and puzzle observations

### Desktop

- Fresh Starter opened Dino Park as Picture 1 of 4.
- The active header and preview title both said Dino Park; the instruction read “Look at the Dino Park preview. Choose a piece to begin.” The 2×2 board and four-piece tray were visible beside the preview.
- I used the visible Hint control for the first three matches. Each clue named the piece and glowing space, and the corresponding visible space accepted the placement with “Great fit!” The remaining visibly unplaced piece went in the remaining space, completing all four.
- The held completion read “Dino Park complete!” and showed: “Some dinosaurs ate plants, and some ate meat. Their teeth helped scientists learn what they ate.” Next picture stayed available until pressed; it advanced to Moon Camp.
- The chapter map then showed Picture Pioneers at 4/4. Selecting it exposed Replay chapter; replay began an ordinary new queue. Back showed the leave confirmation; Keep playing dismissed it without leaving, and Back to world returned to Creative Lab.

### Mobile

- A fresh Starter run showed River Valley (Picture 1 of 4), Moon Camp (2 of 4), then Dino Park (3 of 4). The active header, preview heading, and instruction all named Dino Park. The instruction was “Look at the Dino Park preview. Choose a piece to begin.”
- The full-page 390×844 capture shows the 2×2 preview, board, and tray in the normal vertically stacked layout. The visible status showed 4 left · 0 moves before placement. Four visible Hint/highlighted-space interactions completed it.
- The held result read “Dino Park complete!” with the matching picture fact and a 161.75×48 CSS-pixel Next picture button. Document width equaled the 390px viewport. Next advanced to Moon Camp as Picture 4 of 4; this is the observed repeat described below.
- Back opened “Leave the game?”; Keep playing left the active puzzle in place, and the confirmed Back to world returned to Creative Lab.

## Queue observation

In the first mobile run, visible screens established:

1. River Valley — Picture 1 of 4.
2. Moon Camp — Picture 2 of 4, completed through visible hints and spaces.
3. Dino Park — Picture 3 of 4, completed through visible hints and spaces.
4. Moon Camp — Picture 4 of 4, immediately after clicking Dino Park’s Next picture.

The repeat is visible in [mobile-queue-duplicate-moon-4of4.png](screenshots/mobile-queue-duplicate-moon-4of4.png). The earlier Moon Camp completion is evidenced by the completed Picture 2 indicator on the Dino Park screen; there was no reload or replay between these entries. The first run did not retain a screenshot for each of its first two screens, so only the visible record described above is claimed.

I repeated Starter in a second fresh guarded mobile profile. After each Next, I recorded the visible number/title and captured the active and held screen for the first three items. The sequence was River Valley (1/4), Moon Camp (2/4), Dino Park (3/4), Robin’s Tree (4/4). This did not reproduce Moon Camp at 4/4. Screenshots are [1](screenshots/mobile-recheck-picture-1-active.png), [2](screenshots/mobile-recheck-picture-2-active.png), [3](screenshots/mobile-recheck-picture-3-active.png); held screens are also retained for the first three. This is a second bounded observation, not a reliability pass.

## Identity, screenshots, and limits

All 16 runtime/index files in the candidate identity returned HTTP 200 with matching byte counts and SHA-256 values. The identity binds the candidate source and current alias comparison; this report does not promote the candidate, change canonical state, or grant overall game acceptance.

- [Desktop active Dino Park 2×2](screenshots/desktop-dino-park-active.png)
- [Desktop Dino Park held fact](screenshots/desktop-dino-park-held-fact.png)
- [Desktop Picture Pioneers 4/4 and Replay chapter](screenshots/desktop-starter-replay-map.png)
- [Desktop Starter chapter completion](screenshots/desktop-starter-completion.png)
- [Mobile active Dino Park 2×2](screenshots/mobile-dino-park-active.png)
- [Mobile Dino Park held fact](screenshots/mobile-dino-park-held-fact.png)
- [Mobile repeated Moon Camp at 4/4](screenshots/mobile-queue-duplicate-moon-4of4.png)
- [Second fresh mobile run: River Valley 1/4](screenshots/mobile-recheck-picture-1-active.png)
- [Second fresh mobile run: Moon Camp 2/4](screenshots/mobile-recheck-picture-2-active.png)
- [Second fresh mobile run: Dino Park 3/4](screenshots/mobile-recheck-picture-3-active.png)

This is a narrow title and 2×2 UI delta. It does not rerun all 24 boards, assess human listening, verify the missing three clips, or accept/promote the candidate. The retained full gameplay baseline remains the evidence for mechanics unchanged by this title-only Puzzle delta; this check adds candidate-bound title, Dino Park completion, replay/back, and the queue observation.
