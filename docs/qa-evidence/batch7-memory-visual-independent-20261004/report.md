# Batch 7 Memory Match visual repair: independent mobile delta

Date: 2026-10-04
Candidate: frozen local build at `http://127.0.0.1:5288`
Source identity: `44b9807eeec169cc5d48809c8c5a5eff29297c5f`
Builder identity: [`batch7-memory-visual-identity-20261004.json`](../batch7-memory-visual-identity-20261004.json)

## Scope and setup

This is a bounded 390 × 844 CSS-pixel browser delta for the Memory Match mobile repair. I used a fresh Playwright browser profile, intercepted `/api/voice` and `/api/story` before navigating to the app, and confirmed both routes remained installed. No provider request escaped; the browser console reported zero errors and warnings. I selected Amari and reached Memory Match through the rendered game navigation. Levels 1 through 4 were completed via their rendered controls during this session; Level 5 was unlocked by the ordinary Next Level control. No progress or answer state was injected.

The previous independent 10-board gameplay report and the earlier candidate’s overlay failure remain separate evidence and were not overwritten.

## Findings

- **Level pills:** all ten level controls render in two rows. Their measured hitboxes are 53.5 × 48 CSS pixels. Row 1 has six buttons and row 2 has four. At the checked viewport, the document width equals the 390-pixel viewport width; there is no horizontal overflow.
- **Former Daily Mission overlap:** during active Level 5 play, the Daily Mission CTA was absent. A hit test at the formerly covered point `(330, 795)` reached the visible Dinosaur Discovery board. The board remained usable; card 24 flipped to the visible “Fossil Dig Rock” face without navigation. The screenshot is `screenshots/level5-card24-reveal-mobile.png`.
- **Art faces revealed through play:** separate face crops show the Level 1 Frog and Monkey cards; Level 5 reveals show the blue long-neck dinosaur and orange T-rex as distinct pictures. See `screenshots/level1-frog-face-mobile.png`, `screenshots/level1-monkey-face-mobile.png`, `screenshots/level5-longneck-face-mobile.png`, and `screenshots/level5-trex-face-mobile.png`. The matching long-neck pair was visibly face-up together during play. Other actual Level 5 reveals included Fossil Dig Pick, Dinosaur Nest, Leaf, Seedling, and Volcano.
- **Motion preference:** Playwright emulation confirmed `prefers-reduced-motion: reduce` and was then returned to `no-preference`. The board remained rendered in both modes. This was browser emulation, not a physical-device motion certification.
- **Guard/health checks:** both paid endpoints were guarded before app navigation; zero voice or story calls escaped. Console: zero errors and warnings.

## Limits and open gates

This delta did not complete Level 5, so Level 6 stayed locked. Car, Fire Engine, and Rocket were not actually revealed here and are **unverified** by this report. The builder inventory’s remaining art and packaged narration gaps remain open; these screenshots do not establish complete premium art, packaged voice coverage, audio playback, or human listening acceptance. Desktop geometry, physical-device touch, and broader Memory Match gameplay acceptance were not repeated.

Evidence screenshots are under `screenshots/`. Their paired board screenshots retain the full rendered control context; the individual crops isolate only faces that were visibly revealed during ordinary play.
