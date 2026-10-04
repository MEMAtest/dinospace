# Batch 7 Memory Match art update: independent browser review

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5291/`  
Source: `200bdcc2b75fdaefa37a2787b974bf6d093dbe89`  
Candidate identity: [candidate-identity.json](candidate-identity.json)

## Method

I used a fresh isolated Playwright profile, `b7-memory-art-update-200bdcc`. While the page was still `about:blank`, I installed and verified route guards for `/api/voice` and `/api/story`; both guards remained active throughout. There were no requests to either endpoint. Sound was turned off through the visible control. The app was opened only after the guards were in place.

I selected Amari through the player screen, opened Thinking & Play, then Memory Match. I completed Levels 1–10 at 390 × 844 CSS px by clicking the rendered face-down cards, using only the names displayed after each card had actually turned over, and following the visible Next Level button. I then replayed Levels 5, 8, 9, and 10 at 1280 × 800 using the visible level buttons. No progress or answer state was injected, no hidden card content was read, and no source files were changed.

## New art observations

Each of the eight added faces was visibly revealed during ordinary play on mobile and desktop. The labels and images were reviewed only while the cards were face-up.

| Added face | Mobile observation | Desktop observation |
|---|---|---|
| Tree | Level 5; mature trunk and canopy distinguish it from the seedling and loose leaf sprig. [Screenshot](screenshots/mobile-level5-complete.png) | Level 5; distinct at 182 × 182 px. [Screenshot](screenshots/desktop-level5-complete.png) |
| Seedling | Levels 5 and 9; two new leaves rooted in soil distinguish it from both tree and leaf sprig. [Level 9 screenshot](screenshots/mobile-level9-complete.png) | Levels 5 and 9; distinct at 149 × 149 px on Level 9. [Screenshot](screenshots/desktop-level9-complete.png) |
| Leaf sprig | Levels 5 and 9; three leaves without soil remain distinct from the rooted seedling and mature tree. [Level 9 screenshot](screenshots/mobile-level9-complete.png) | Level 9; the three leaves and label are clear at 149 × 149 px. [Screenshot](screenshots/desktop-level9-complete.png) |
| Mushroom | Level 9; red spotted cap and pale stem are recognizable at the mobile card size. [Screenshot](screenshots/mobile-level9-complete.png) | Level 9; recognisable with the visible “Mushroom” label. [Screenshot](screenshots/desktop-level9-complete.png) |
| Earth | Level 8; blue and green globe is distinct from Sun and the other space cards. [Screenshot](screenshots/mobile-level8-complete.png) | Level 8; globe and “Earth” label visible at 149 × 149 px. [Screenshot](screenshots/desktop-level8-complete.png) |
| Sun | Level 8; orange and yellow radiant sun differs from Earth and from the existing “Sun with a face” card in Level 10. [Screenshot](screenshots/mobile-level8-complete.png) | Level 8; radiant sun remains clearly recognizable. [Screenshot](screenshots/desktop-level8-complete.png) |
| Full Moon | Level 10; bright, textured circular face is readily distinguished from the dark New Moon and crescent Moon. [Screenshot](screenshots/mobile-level10-complete.png) | Level 10; bright textured disk is distinct at 149 × 149 px. [Screenshot](screenshots/desktop-level10-complete.png) |
| New Moon | Level 10; the near-black disk and narrow illuminated rim are visible against the light card and contrast strongly with Full Moon. [Screenshot](screenshots/mobile-level10-complete.png) | Level 10; dark disk and rim are clearly visible. [Screenshot](screenshots/desktop-level10-complete.png) |

No new art-specific rendering or semantic distinction defect was observed. On the 390 px captures, some longer existing captions are ellipsized by the narrow cards; the newly added Earth, Sun, Leaf, Seedling, and Mushroom labels remained readable, while the Full Moon art itself was clear even where its caption was abbreviated.

## Layout, requests, and console

- On mobile, the measured viewport and document widths were both 390 px. A rendered memory card measured 82 × 82 px. All ten visible level controls measured 53.5 × 48 px.
- On desktop, the measured viewport and document widths were both 1280 px. Level 5 cards measured 182 × 182 px; Level 8, 9, and 10 cards measured approximately 149 × 149 px.
- All eight added art assets appeared in the browser’s actual request log and returned HTTP 200. The complete log contains 85 static requests; none returned a non-2xx status. The exact served JavaScript, CSS, and asset identity is in [candidate-identity.json](candidate-identity.json). See [new-art-asset-requests.txt](new-art-asset-requests.txt) and [asset-requests.txt](asset-requests.txt).
- The active voice and story guards are recorded in [provider-guards.txt](provider-guards.txt). The non-static request view shows no dynamic requests, and the static request log contains no provider endpoint requests; see [provider-requests.txt](provider-requests.txt).
- The browser console had zero messages, errors, or warnings; see [console.txt](console.txt).

## Scope limits

This is an independent visual and responsive-rendering delta for the eight new Memory Match images. It is not human listening, audio acceptance, a full application or device matrix, a release decision, or a game-quality score. No voice or story provider was contacted. No child data was used; progress was earned in the isolated synthetic browser profile. Candidate inventory reports 23 of 87 unique Memory Match tokens illustrated, leaving 64 without matching illustrations. Human visual acceptance and broader quality gates remain pending.
