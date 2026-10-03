# Batch 7 independent browser QA

Date: 2026-10-03  
Scope: local immutable candidates 5257, 5263, and 5273. This is functional browser evidence, not a release or quality-rating decision.

## Candidate identity

| Candidate | Source SHA | Local URL | Identity evidence |
| --- | --- | --- | --- |
| Original game build (full matrix) | `b36d078c52bd551efd2cb2b962e386ef78d575c4` | `http://127.0.0.1:5257` | [`batch7-album-identity-20261003.json`](../batch7-album-identity-20261003.json) |
| Hidden-face accessibility build | `1b19e73d43776400bf324f42d88e1a49dbd95366` | `http://127.0.0.1:5263` | [`batch7-hidden-face-identity-20261003.json`](../batch7-hidden-face-identity-20261003.json) |
| Solar copy repair build | `aaf8e6ddca38d46432cbc6768ee22689665778a1` | `http://127.0.0.1:5273` | [`batch7-solar-fact-repair-identity-20261003.json`](../batch7-solar-fact-repair-identity-20261003.json) |

The served entry bundles, CSS, service worker, and Solar model chunks were SHA-256 compared with each frozen local `dist` before interaction; all listed identity hashes matched. The identity JSON files contain the per-file hashes. The candidates were tested in isolated Playwright CLI profiles: `b7-memory-desktop` / `b7-solar-mobile-isolated` for 5257, `b7-memory-a11y-5263` for 5263, and `b7-solar-repair-5273` for 5273.

## Safety and test method

- Installed Playwright routes for both `**/api/voice` and `**/api/story` before first navigation in each browser profile. No story requests occurred. Voice requests were intercepted and answered with 403; the browser consequently logged expected 403 resource errors (five in each 5273 fact-card check). No provider response or paid generation was used.
- Used normal visible UI controls and observed rendered labels, accessible button names, counters, and panels. Memory board solving only read a card's `aria-label` after clicking that card to turn it face up. No hidden face values, internal app state, or synthetic progress writes were used.
- Desktop viewport: 1280×900. Mobile viewport: 390×844.
- Browser storage was isolated per profile. No real child data was used or changed.

## Memory Match on immutable 5257

Completed every authored board at both viewports, using the app’s ten-level sequence: 4, 8, 10, 12, 13, 14, 15, 16, 17, and 18 pairs. At each level, the visible completion state reported all pairs found. The actual Next Level control unlocked and advanced through all ten boards. Levels 2–10 were disabled before being unlocked. On Level 10 the replay control reopened Level 10, rather than returning to Level 1.

At desktop, deliberately selected two different cards: the mismatch turned back over and the Moves counter advanced. Matched pairs stayed revealed. Continued through normal play, then reloaded; the saved level and 10/10 Memory passport count persisted. The 390px layout used four card columns and required vertical scrolling for lower rows; all cards remained reachable. Active-game Back opened the leave confirmation; Keep playing dismissed it, and Back to world navigated out. Completed-game navigation worked without an active-run prompt.

Evidence: [Level 10 desktop](screenshots/memory-level-10-desktop.png), [Level 10 mobile](screenshots/memory-level-10-mobile.png).

## Solar System on immutable 5257

Visited all nine planets at both viewports and opened all six authored discoveries on each: 54/54 facts per viewport. Each selection updated the visible “Did you know?” panel to the selected discovery. Visited the planet tabs and the More / Previous planet controls at mobile width. The 3D model’s planet selection changed the selected planet; Pause/Resume orbit, Zoom in, Zoom out, and Reset controls were exercised.

Completed all nine planet challenges, selecting answers from the visible fact content and answer choices. Wrong/retry/then-correct behavior was exercised for Mercury and Earth, including in the fresh mobile profile. The wrong answer remained recoverable; correct completion reported mission complete. Passport totals reached 54/54 discoveries and 9/9 challenges. Reload retained these totals. Album showed 9/9 Solar stickers.

Evidence: [Solar model and mobile controls](screenshots/solar-controls-mobile.png), [separate profile album](screenshots/isolated-album-mobile.png).

**Content finding on 5257:** this frozen original candidate contained Solar wording later identified in the source review as inaccurate or unsupported (including Mercury day/cliff copy, Jupiter protection wording, Neptune colour wording, and Pluto/Charon orbit wording). The mechanics matrix does not certify those facts. The bounded corrected copy was separately checked on 5273 below; the old candidate remains unchanged.

## Persistence and profile isolation

On the main profile, Album showed Memory 10/10 and Solar 9/9 at desktop and mobile, and those totals survived reload. A separate fresh mobile profile completed Solar only; Album showed Memory 0/10 and Solar 9/9. This confirms these visible counts were not shared between the two browser profiles.

## Hidden-face accessibility delta on 5263

Opened a fresh origin at mobile and desktop. Before turning any card, the card controls were named “Face-down memory card N”; their hidden front-face content was marked `aria-hidden`. After an actual card click, the revealed card had a content-specific accessible name (observed “monkey card”). This verifies the rendered accessibility-tree change in the candidate at both widths. No screen-reader hardware/software certification was performed, and the original 5257 remains the immutable full gameplay candidate.

Evidence: [face-up mobile](screenshots/card-faceup-mobile.png), [face-up desktop](screenshots/card-faceup-desktop.png).

## Solar fact repair delta on 5273

At 390px and 1280px, opened the affected discovery cards and verified the selected card and visible fact panel agreed:

| Planet | Discovery | Rendered repaired copy |
| --- | ---: | --- |
| Mercury | 3 | “From one sunrise to the next takes 176 Earth days.” |
| Mercury | 5 | “Long cliffs formed as Mercury cooled and shrank.” |
| Jupiter | 6 | “Jupiter also has faint rings made of tiny dark particles.” |
| Neptune | 3 | “Methane gas helps give Neptune its blue colour.” |
| Pluto | 6 | “Pluto and Charon both move around a shared centre between them.” |

Mercury’s visible statistic is labelled “ONE SPIN — 59 Earth days” at both widths. This targeted check covers the repaired cards and related statistic only; it is not a re-run of all 54 cards on the copy-only build.

Evidence: [repair at mobile width](screenshots/solar-repair-mobile.png), [repair at desktop width](screenshots/solar-repair-desktop.png). NASA primary-source research and the precise copy scope are recorded in [`batch7-solar-fact-repair-20261003.md`](../../batch7-solar-fact-repair-20261003.md).

## Findings and acceptance boundary

No progression, challenge recovery, persistence, replay, or visible control blocker was found in this functional scope. The 5257 accessibility issue around unrevealed card faces was addressed in the separately identified 5263 candidate and verified as a rendered accessibility-tree change. The inaccurate original Solar copy was addressed for the bounded set listed above in separately identified 5273 and verified at both widths.

This evidence does not certify premium illustration quality, visual/editorial polish, audio performance or listening quality, reduced-motion behavior, a separate real-browser matrix beyond the Playwright Chromium run, human usability, physical-device behavior, screen-reader output, production deployment, production storage, or a 4.5 score. The intentional voice-route 403 console errors are test guards, not evidence of successful audio playback. Full original-candidate matrices and targeted deltas are not equivalent to production or human acceptance.
