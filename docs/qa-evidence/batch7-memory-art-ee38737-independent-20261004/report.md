# Batch 7 Memory Match eight-art delta: independent browser review

Date: 2026-10-04
Frozen candidate: `http://127.0.0.1:5299`
Source: `ee38737b1bbb2dbfc7a158c796ea1f18289f40df`
Candidate served-asset identity: [candidate-identity.json](candidate-identity.json)
Browser session: fresh Playwright profile `b7-memory-art-ee38737`

## Method and progression

I installed `/api/voice` and `/api/story` route guards in the fresh browser profile while it was on `about:blank`; the route list confirmed both guards before I navigated to the app. The request log contains no calls to either endpoint, and the console reports zero errors and warnings. Amari was selected through the visible player screen. I did not inject progress, seed state, inspect hidden card content, or make provider calls.

I checked the prior 5288 profile’s visible Grown-ups screen for the optional backup route. It exposed the hold-to-open progress/settings panel but no backup, download, or restore control. I therefore earned Levels 1 through 5 on the new 5299 profile through actual card flips, pair completion, and the rendered Next Level control. Level 5 was reached but not completed. I did not change source files; other builder changes already present in the shared checkout were left unstaged and untouched.

## Added art observations

All eight images added by this candidate were visibly revealed on both mobile (390 × 844 CSS px) and desktop (1280 × 800 CSS px). Labels below each face and the face’s accessibility name were read only after the corresponding rendered card had been flipped through the UI.

| Level | Face label | Mobile reveal | Desktop reveal |
|---|---|---|---|
| 1 | Dog | [mobile screenshot](screenshots/mobile-dog-reveal.png) | [desktop screenshot](screenshots/desktop-dog-reveal.png) |
| 1 | Fox | [mobile screenshot](screenshots/mobile-fox-reveal.png) | [desktop screenshot](screenshots/desktop-fox-reveal.png) |
| 3 | Moon | [mobile screenshot](screenshots/mobile-moon-reveal.png) | [desktop screenshot](screenshots/desktop-moon-reveal.png) |
| 3 | Ringed Planet | [mobile screenshot](screenshots/mobile-ringed-planet-reveal.png) | [desktop screenshot](screenshots/desktop-ringed-planet-reveal.png) |
| 3 | Comet | [mobile screenshot](screenshots/mobile-comet-reveal.png) | [desktop screenshot](screenshots/desktop-comet-reveal.png) |
| 3 | Satellite | [mobile screenshot](screenshots/mobile-satellite-reveal.png) | [desktop screenshot](screenshots/desktop-satellite-reveal.png) |
| 5 | Egg | [mobile screenshot](screenshots/mobile-egg-reveal.png) | [desktop screenshot](screenshots/desktop-egg-reveal.png) |
| 5 | Volcano | [mobile screenshot](screenshots/mobile-volcano-reveal.png) | [desktop screenshot](screenshots/desktop-volcano-reveal.png) |

The images remain visually distinct at the card sizes tested. In particular, the dark crescent Moon is visually separate from the bright Ringed Planet; the Comet has a long bright tail, while the Satellite has a recognizable body and solar panels. Dog and Fox faces are distinct from Monkey and Frog. The Egg and Volcano illustrations are individually recognizable at mobile card size.

The closed-card screenshots show only the themed card backs. The actual revealed images appeared in the browser’s static-request log during the visible flips; each of the eight added image assets returned HTTP 200. See [asset-requests.txt](asset-requests.txt). The supplied candidate identity records all 66 frozen assets as HTTP 200 with matching hashes. No broken image or console error was observed.

## Layout and retained controls

- At 390 × 844, all ten level pills are visible in two rows of six and four. Measured pill boxes are 53.5 × 48 CSS px; document width equals the 390 px viewport.
- At the former overlay point `(330, 795)`, the hit target was Level 5 card 20. The active board was visible, no modal was present, and no Daily Mission CTA appeared among visible button labels.
- At 1280 × 800, Level 5 cards measured 182 × 182 CSS px and the document width equalled the viewport. The desktop Level 1 cards measured 231 × 231 CSS px. The cards remained fully rendered and clickable at both tested widths.
- Initial face-down screenshots for Levels 1, 3, and 5 and the corresponding flipped-face screenshots are included under `screenshots/`.

The provider guards, matching empty endpoint-request filter, and console output are preserved in [provider-guards.txt](provider-guards.txt), [provider-requests.txt](provider-requests.txt), and [console.txt](console.txt).

## Scope limits

The eight images listed above were all observed on both viewport sizes. Level 5 was not completed, so Level 6 remained locked. Car and Fire Engine were not observed in this delta. The Rocket card was visibly revealed at Level 3 and its local `fuel-rocket` asset returned HTTP 200, but Rocket is not one of the eight new assets reviewed here. This review is an art and responsive-rendering delta only; it is not complete gameplay, audio, human listening, device, release, or 4.5 acceptance.
