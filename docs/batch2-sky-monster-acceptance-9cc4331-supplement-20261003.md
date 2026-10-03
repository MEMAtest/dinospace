# Sky Shapes + Monster Math production supplement — 2026-10-03

## Release and method

- Canonical: https://dinospace-eight.vercel.app
- Parent-confirmed deployment: `dpl_kiGvxVvJatYKntaseMvP9tMp3e6T`
- Parent-confirmed source: `9cc4331dd9e9491284cb052f13a2804d484671cb`
- Browser loaded assets: `index-DfKtGOa7.js`, `index-Bwl2SrXA.css`; the page was not reloaded after this canonical production release was loaded.
- Fresh isolated mobile session: `batch2_9cc_mobile_supplement_1003`, 390×844 CSS px. `/api/voice` and `/api/story/` were blocked before selecting synthetic profile Amari. Sound remained off. No provider calls, paid calls, or stories were made. No PRNG, answer, or progress state was injected.
- This is QA of the released canonical production build, not a preview candidate. It supplements, and does not alter, the original `d312394…` production-baseline report. Evidence is in `output/playwright/batch2-sky-monster-acceptance-20261003-production9cc4331/`.

## Requested mobile regression checks

| Check | Result | Evidence and boundary |
|---|---|---|
| Monster mobile replay uses a new ordinary-UI seed and different first prompt | Pass | Starter run began on gems (6); replay began on stars (5). Lifecycle seeds differ: `3504959667` and `1553945743`. Replay was left at question 1 and its two leave events were logged. See `monster-mobile-replay-starter-question1.png`. |
| Monster Growing addition with first addend >10 | Pass | Normal generated Growing queue included `18 + 2 = ?`, answer 20. The visible model stated “18 counters and 2 more, 20 counters total”; selected 20 and completed 6/6. Seed `2626890896`, level 1, ordinary Start flow. See `monster-mobile-growing-firstaddend18plus2.png` and `monster-mobile-growing-complete.png`. |
| Sky mobile replay uniqueness | Pass (prompt/seed) | First Starter run began with Kite; after completing all four Starter flights and choosing Replay this sky, flight 1 was Round Sun. Seeds differ: `900719180` and `1784129585`. Replay left at 0/4 and logged leave events. See `sky-mobile-replay-starter-question1-candidate.png`. |
| Sky hint and restart on mobile | Pass | On Starter Kite, “Show a tracing hint” changed the instructions to follow glowing dots. On Round Sun, Restart flight reset the route from 49% to 0%. See `sky-mobile-starter-hint.png`, `sky-mobile-restart-before-49pct.png`, and `sky-mobile-restart-after-reset.png`. |
| 48px control sizing / 390px overflow | Pass for sampled game controls | At 390px, document width stayed 390px. Sampled Sky icon controls were 48×48; “Hear mission again”, hint, and restart controls were 48px tall. Monster hear/clue controls were 48px high and answer options were 161×64. This is a sampled control check, not an exhaustive app-wide audit. |
| Genuine touch tracing | Pass in browser touch emulation | Chrome DevTools touch events were dispatched over the visible Sky SVG path (with mobile touch emulation); the full Kite route registered at 100% accuracy and 3/3 stars. Screenshot `sky-mobile-starter-touch-kite-result.png`. This establishes browser-emulated touch behavior, not a physical-handset check. |
| Seeded diagnostic evidence | Pass | Exported through the visible Grown-ups → Game troubleshooting → Download game log controls. The unchanged downloaded file is `output/playwright/batch2-sky-monster-acceptance-20261003-production9cc4331/amari-game-diagnostics-ui-export.json` (SHA-256 `48e06fcea5ff8d22861a8bbc447073123c661ff31ae994c46595a4ee0a7caf5f`). UI screenshot: `grownups-troubleshooting-export.png`. |

## Open gates

- The app narration integration is still not live. HTTP asset delivery or browser success does not certify audible quality. Do not claim the 4.5 bar is met until the narration gate is closed.
- Physical-device touch and audio output quality remain unverified.
- This supplement covers the requested mobile regression gaps; it is not a fresh six-run-per-game desktop/mobile certification. See the original report for the broader baseline and its boundaries.
- The home and Grown-ups screens in this production session displayed 18 total stars after the QA playthrough (screenshot `mobile-home-stars-after-qa.png`; Grown-ups showed the same count). Treat this as an observed production display, not a clean reward-delta calculation: the QA flow played Monster and Sky, so the current total does not establish a per-game attribution.
- Historical `d312394…` findings remain attributed to that older release.
