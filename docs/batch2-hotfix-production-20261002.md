# Batch 2 production hotfix — 2 October 2026

## Identity and scope

Canonical alias: https://dinospace-eight.vercel.app. Vercel API confirms READY production deployment `dpl_3aXnFd9wZ2599fLqhszR7PyqzAxF`, immutable URL `https://dinospace-rgfi9yvh9-memas-projects-23a0001d.vercel.app`, source metadata SHA `8499e15471196f11a4a2665359f0d6cb38992033`. Browser JavaScript is `index-CvLivfU2.js`; CSS is `index-Bwl2SrXA.css`; service worker cache is v15.

This release includes the client voice cooldown, server Retry-After/CORS exposure and the explicit WorldPage parent-home target. It excludes all unfinished Batch 2 narration corpus, sequence playback and changed Monster Math wording. Those changes remain local until packaged assets and audio acceptance pass.

The frozen release archive passed all 139 tests and full ESLint. Vercel production build succeeded. Source archive: `/tmp/dinospace-batch2-hotfix-20261002`; release log: `/tmp/batch2-hotfix-deploy-20261002.log`.

## Actual production navigation checks

- Integrator fresh isolated Playwright `hotfix-production`, 390×844: mute before playing, Amari → Creative Lab → Puzzle Pop → Start chapter → Back to learning world → confirm Back to world → single Back to home. Final route `#/home`; document width 390; no broken images; zero console errors/warnings. All 13 observed requests returned 200 and none called the voice API. Screenshot `output/playwright/batch2-hotfix-production-home-390.png`.
- Integrator fresh isolated `hotfix-desktop`, 1280×720: same actual journey after taking a fresh started-game snapshot, leave confirmation worked and one home click reached `#/home`. Width 1280; no broken images; zero console errors/warnings. Screenshot `output/playwright/batch2-hotfix-production-home-desktop-confirmed.png`.
- A first over-compressed desktop automation attempted Back to world after the preceding control had already returned directly to the world; that locator timed out. Its screenshot is the world, not home, and is not acceptance evidence. The separate fresh desktop run above exercised the settled game and actual leave dialog successfully.
- Independent Luna also confirmed one-click home routing on this exact hotfix in a separate session. German Garage Replay the German clue fetched only packaged `/audio/de/gelb.mp3` (206); no dynamic voice request and zero console errors/warnings. Independent detail remains in `batch2-production-independent-qa.md`.

The voice cooldown was tested with mocked responses locally, not by deliberately exhausting production voice quotas. Packaged German audio network success does not establish physical speaker output. These targeted fixes do not confer 4.5 scores on the four Batch 2 games; their full gameplay, seeded evidence and narration gates remain open.
