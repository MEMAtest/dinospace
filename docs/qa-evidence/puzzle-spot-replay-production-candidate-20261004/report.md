# Puzzle Pop and Spot the Difference replay checks on the READY production candidate

**Run date:** 2026-10-04 (Europe/London)
**Result:** Targeted replay checks passed on the exact unpromoted candidate below at desktop and 390 × 844. This is a production-candidate behavior report, not canonical promotion, release scoring, full 4.5 acceptance, or audio acceptance.

## Exact deployment and lineage

| Item | Identity |
|---|---|
| Deployment | `dpl_FjAsdFFoZqPXLM1EbfnLW4Sy59s5` |
| Candidate URL | <https://dinospace-qfb174zn5-memas-projects-23a0001d.vercel.app> |
| Provider `githubCommitSha` / audited archive source | `2952958fe41de443a8dfeabbbe0bb54d96e572ad` |
| Frozen runtime origin | `http://127.0.0.1:5303` |
| Candidate identity record | [`puzzle-spot-replay-production-candidate-20261004.json`](../puzzle-spot-replay-production-candidate-20261004.json) |
| Prior local replay delta | [`Puzzle/Spot local replay report`](../puzzle-spot-replay-local-qa-20261004/report.md), commit `c0120f3d0ba85120e351267a982a5f3a98234408` |
| Preserved broad Batch2 production baseline | [`Batch2 production report`](../batch2-production-final-20261003/report.md) and [`follow-up`](../batch2-production-final-20261003/follow-up-report.md), source `3cdfc426e91b46a855448690278ceb6590280b68` |

The production candidate is byte-matched to the 5303 frozen local runtime, whose source descends from Puzzle replay repair `0dd1077049eb492b6b16b9648eb77d936cab43ad`. I independently fetched and SHA-256 checked all seven identity-listed HTML, JS, and CSS assets from the candidate; all seven matched. These are candidate-specific checks. The canonical alias had not been promoted during this run.

## Isolation, guards, and instrumentation

Four new Playwright sessions used ordinary Amari profile selection: Puzzle and Spot each had a fresh desktop session at 1280 × 800 and a fresh mobile session at 390 × 844. Each session started on `about:blank`. Before the first app navigation, `**/api/voice**` and `**/api/story**` were routed to empty HTTP responses (200 for desktop Puzzle, 204 for the other three sessions). Subsequent request inspection showed no request to either route. No progress, child data, seeds, answers, storage, or unlocks were injected.

Puzzle pieces were placed by reading the visible Hint text and using its visibly highlighted board space. Spot targets were selected after comparing the rendered Picture A/Picture B scenes; one intentionally incorrect Picture B tap produced the visible, recoverable “Not that spot yet” feedback, and the visible Magnifier clue on desktop pointed to “middle top.” These assisted actions tested replay mechanics, not independent mastery.

All four browser consoles reported zero messages, errors, and warnings. Static request logs contained no 4xx/5xx responses; delivered app images were HTTP 200, and packaged audio range requests were HTTP 200/206. The route guard prevented provider story/voice requests. This report does not claim audio playback was heard or evaluated.

## Replay results

| Game / viewport | Normal Starter completion and last held fact | Replay entry | Complete one replay item, leave the next partial, then map Replay | Reload / parent navigation |
|---|---|---|---|---|
| **Puzzle Pop — desktop 1280 × 800** | Picture Pioneers completed 4/4. Order: River Valley → Moon Camp → Dino Park Picnic → Robin’s Tree. Last held fact: Robin’s Tree. | Replay began on Dino Park Picnic, different from the last held picture. | Completed Dino Park Picnic, advanced to Moon Camp and left it incomplete. Re-entered from Creative Lab, selected Picture Pioneers and Replay chapter; replay began on Robin’s Tree, different from the just-completed Dino Park Picnic. | Reload returned to the map with Picture Pioneers 4/4, Curious Constructors unlocked at 0/4, and Detail Detectives locked. Back confirmation and Back to world worked. Home showed 2 stars from the fresh profile’s initial 0 after the chapter and replay. |
| **Puzzle Pop — mobile 390 × 844** | Picture Pioneers completed 4/4. Order: Dino Park Picnic → Robin’s Tree → Moon Camp → River Valley. Last held fact: River Valley. | Replay began on Robin’s Tree, different from the last held picture. | Completed Robin’s Tree, advanced to River Valley and left it incomplete. Re-entered from Creative Lab and used Replay chapter; replay began on Moon Camp, different from the just-completed Robin’s Tree. | Reload retained 4/4 and unlocked Curious Constructors at 0/4, with Detail Detectives locked. Back confirmation and Back to world worked. |
| **Spot the Difference — desktop 1280 × 800** | Bright-Eyed Beginners completed 4/4 pairs. Order: Superhero City → Dino Park → Moon Camp → River Valley. Last held fact: River Valley. | Replay began on Moon Camp, different from the last held pair. | Completed Moon Camp, advanced to River Valley and left it incomplete. Returned to Thinking & Play, re-entered Spot and used Replay chapter; replay began on Superhero City, different from the just-completed Moon Camp. | Reload retained 4/4, unlocked Curious Comparers at 0/4, and kept Super Spotters locked. Back confirmation and Back to world worked. Home showed 2 stars from the fresh profile’s initial 0 after the chapter and replay. |
| **Spot the Difference — mobile 390 × 844** | Bright-Eyed Beginners completed 4/4 pairs. Order: River Valley → Moon Camp → Superhero City → Dino Park. Last held fact: Dino Park. | Replay began on Superhero City, different from the last held pair. | Completed Superhero City, advanced to Dino Park and left it incomplete. Returned to Thinking & Play, re-entered Spot and used Replay chapter; replay began on River Valley, different from the just-completed Superhero City. | Reload retained 4/4, unlocked Curious Comparers at 0/4, and kept Super Spotters locked. Back confirmation and Back to world worked. |

In all four sessions, the map replay’s opening scene differed from the last replay item completed immediately before it. Chapter completion facts remained visible until Next. The active replay board itself returned to its chapter map after reload; replay-session position is not claimed to persist.

## Rendered mobile controls and layout

At 390 px, the document width equaled the viewport width in both games (`scrollWidth = innerWidth = 390`). No horizontal overflow occurred. Gameplay content uses normal vertical scrolling: lower Picture B and the Puzzle piece tray sit below the initial viewport, then are reachable on scroll. The saved scrolled-bottom screenshots show those controls fully visible and usable.

Minimum observed interactive dimensions were 48 × 48 px. Puzzle board spaces measured 128 × 128 px and visible piece buttons 51 × 51 px on mobile; Spot difference hotspots measured 56 × 56 px. Header, Hint, and clue buttons were at least 48 px high. Desktop width likewise equaled its viewport and measured controls were at least 48 × 48 px.

## Screenshot evidence

- Puzzle desktop: [`first board`](screenshots/puzzle-desktop-first-start.png), [`last held fact`](screenshots/puzzle-desktop-completion-held-fact.png), [`Replay first`](screenshots/puzzle-desktop-replay-first.png), [`partial replay`](screenshots/puzzle-desktop-replay-next-in-progress.png), [`map Replay first`](screenshots/puzzle-desktop-map-replay-first.png), [`reloaded map`](screenshots/puzzle-desktop-reload-map.png), [`2-star home`](screenshots/puzzle-desktop-home-reward.png), [`measured controls`](screenshots/puzzle-desktop-replay-controls.png).
- Puzzle mobile: [`first board`](screenshots/puzzle-mobile-first-start.png), [`chapter held fact`](screenshots/puzzle-mobile-chapter-completion-held.png), [`Replay first`](screenshots/puzzle-mobile-replay-first.png), [`partial replay`](screenshots/puzzle-mobile-replay-next-in-progress.png), [`map Replay first`](screenshots/puzzle-mobile-map-replay-first.png), [`reloaded map`](screenshots/puzzle-mobile-reload-map.png), [`scrolled piece tray`](screenshots/puzzle-mobile-game-bottom.png).
- Spot desktop: [`first pair`](screenshots/spot-desktop-first-pair.png), [`visible Magnifier clue`](screenshots/spot-desktop-first-hint.png), [`held first fact`](screenshots/spot-desktop-first-pair-held.png), [`pair 2`](screenshots/spot-desktop-pair2.png), [`pair 3`](screenshots/spot-desktop-pair3.png), [`pair 4`](screenshots/spot-desktop-pair4.png), [`chapter held fact`](screenshots/spot-desktop-chapter-completion-held-fact.png), [`Replay first`](screenshots/spot-desktop-replay-first.png), [`partial replay`](screenshots/spot-desktop-partial-replay-in-progress.png), [`map Replay first`](screenshots/spot-desktop-map-replay-first.png), [`reloaded map`](screenshots/spot-desktop-reload-map.png), [`2-star home`](screenshots/spot-desktop-home-reward.png), [`measured controls`](screenshots/spot-desktop-replay-controls.png).
- Spot mobile: [`chapter map`](screenshots/spot-mobile-chapter-map.png), [`first pair`](screenshots/spot-mobile-first-pair.png), [`held first fact`](screenshots/spot-mobile-first-pair-held.png), [`pairs 2–4`](screenshots/spot-mobile-pair2.png), [`pair 3`](screenshots/spot-mobile-pair3.png), [`pair 4`](screenshots/spot-mobile-pair4.png), [`chapter held fact`](screenshots/spot-mobile-chapter-completion-held.png), [`Replay first`](screenshots/spot-mobile-replay-first.png), [`partial replay`](screenshots/spot-mobile-partial-replay-in-progress.png), [`map Replay first`](screenshots/spot-mobile-map-replay-first.png), [`reloaded map`](screenshots/spot-mobile-reload-map.png), [`scrolled lower picture and targets`](screenshots/spot-mobile-game-bottom.png).

## Limits

This report covers only the candidate URL and Starter replay checks described above. It does not re-run Growing or Challenge, recertify the entire game catalog or profile-isolation matrix, measure every scene permutation, assess human listening quality, or grant a five-dimension score or 4.5 acceptance. The canonical alias was not promoted as part of this QA.
