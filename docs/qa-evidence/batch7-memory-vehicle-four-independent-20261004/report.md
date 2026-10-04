# Independent QA: Memory Match Vehicles art delta

Date: 2026-10-04
Candidate: `http://127.0.0.1:5324`
Frozen source: `357f24cf13b1b8ddcde474f0b7628f3dad11ebf0`
Evidence/source branch head at review start: `ab6ce142ee0bab38e34673e3f4b62ad19e02304b`
Frozen dist: `tmp/batch7-memory-vehicle-four-final/dist`
Identity record: [`batch7-memory-vehicle-four-identity-20261004.json`](../batch7-memory-vehicle-four-identity-20261004.json)
Builder provenance: [`batch7-memory-vehicle-four-provenance-20261004.json`](../batch7-memory-vehicle-four-provenance-20261004.json)

## Scope and setup

Used fresh Playwright CLI session `mem-vehicle357-independent-20261004`, starting at `about:blank`. Installed `**/api/voice` and `**/api/story` 204 routes and verified both before first app navigation. Chose Amari, opened Thinking & Play → Memory Match, and earned Levels 1–5 by visibly flipping cards and using each visible Next level control. The helper read each card's accessible name only after that card was flipped face up; it did not inspect hidden card faces or alter browser storage. Sound was initially on; see the audio/network limitation below.

Completed the 14-pair Vehicles board by ordinary visible card flips at 1280 × 800 and again at 390 × 844. This is a responsive browser viewport with Playwright mouse clicks, not physical-device touch testing.

## Earned route and board mechanics

| Board | Pairs cleared | Visible card flips | Mismatches observed |
| --- | ---: | ---: | ---: |
| Forest Friends | 4 | 12 | 2 |
| Ocean Splash | 8 | 24 | 4 |
| Space Sparkle | 10 | 30 | 5 |
| Party & Treats | 12 | 42 | 9 |
| Dinosaur Discovery | 13 | 38 | 6 |
| All Kinds of Vehicles, desktop | 14 | 42 | 7 |
| All Kinds of Vehicles, mobile | 14 | 44 | 8 |

The board remained at 14 pairs / 28 cards. Correct matches were reflected by the visible paired/matched card labels and pair count; the completion panel and Next level button appeared after the final pair. Replay shuffled the visible card order.

## New art and responsive layout

**Pass for the four new card illustrations at both sizes.** The yellow bus has a readable long body and rows of windows; the green tractor shows its cab, two large rear wheels, and smaller front wheels; the turquoise bicycle has a clear open frame and two wheels; and the coral/cream step-through scooter has a seat, handlebar, body and two wheels. At 82 × 82 px, bicycle and scooter remain distinct by their frame geometry and both have full matching captions. I saw no clipped part, conspicuous colored fringe, or detached glow. Full captions stayed in their reserved label row without image/caption overlap.

| Viewport | Cards | Each card | Level controls | Document width | New-art image box |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1280 × 800 | 28 | 182 × 182 px | 48 × 48 px | 1280 px, no horizontal overflow | about 151 × 109 px |
| 390 × 844 | 28 | 82 × 82 px | 53.5 × 48 px | 390 px, no horizontal overflow | about 63 × 30 px |

Each new label and image appeared twice on the matched board: Bus, Tractor, Bicycle, and Scooter. The 390 px page extends vertically and scrolls normally; all 28 cards, the level selector, and completion control remained reachable.

## Face-down hiding, reload, Back, and re-entry

After selecting Level 6 through its visible level button and reloading, the selected board remained **All Kinds of Vehicles**, the saved best time remained visible, and all 28 cards were face down. At both measured sizes the face-down board had **zero card `<img>` elements and zero revealed card labels**. The matched card art was present only on face-up/matched cards.

The visible Back to Thinking and Play control returned to that world. Re-entering Memory Match opened the highest unlocked board, Yummy Feast (Level 7), with all 30 cards face down; Vehicles remained unlocked and available from its level selector. Selecting Vehicles and reloading returned to the 28-card Vehicles board. No progress was seeded or cleared.

## Served identity and diagnostics

Independently fetched the seven paths listed in the candidate identity record (HTML, JS, CSS, and four new WebPs). Every response was HTTP 200 and its byte count and SHA-256 matched the frozen-dist identity record. The four visible artwork paths were served successfully. The accumulated browser network log had 179 entries; all observed requests returned 200 or 206. Browser console reported 0 errors and 0 warnings.

The voice and story API guards were installed and verified before the first app navigation. A later `route-list` check during the Back/re-entry sequence unexpectedly reported no active rules; I reinstalled both 204 rules before the final reload and verified they remained listed afterward. The accumulated network log contains **zero** `/api/voice` and `/api/story` requests. Therefore there is no evidence of a provider call; I cannot claim route continuity during that intermediate sequence based on the CLI listing alone.

**Audio limitation:** I did not deliberately activate Repeat the memory tip or another audio control. However, the app initially showed “Turn sound off,” so sound was enabled during the early earned-level and first Vehicles pass. The browser recorded 49 local `/audio/en/*.mp3` GETs. I then used the visible sound toggle to disable sound for subsequent screenshot capture and replay. This is not an audio-free run, and no human listening or audio-quality claim is made.

## Screenshots

- [Desktop Vehicles board, all pairs visible](vehicles-desktop-complete.png)
- [Desktop, after reload with all cards face down](vehicles-desktop-facedown.png)
- [Mobile Vehicles board, all pairs visible](vehicles-mobile-complete.png)
- [Mobile, after reload with all cards face down](vehicles-mobile-facedown.png)

## Result and limits

**Scoped pass** for the bus, tractor, bicycle, and scooter art on Amari Memory Match Level 6: visible labels and silhouettes, card/caption fit at 1280 × 800 and 390 × 844, 14-pair completion through rendered controls, 48 px or larger level selectors, face-down image hiding, progress persistence, and candidate asset identity. This is not complete Memory inventory acceptance, Askia parity review, touch-device validation, human listening, production validation, or overall quality acceptance.
