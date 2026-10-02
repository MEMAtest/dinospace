# Production health — 2 October 2026, 06:49 UTC

Heartbeat received at 05:09 UTC; this resumed check ran 06:49–06:56 UTC in isolated Playwright session `health-0609`.

## Release identity

Vercel canonical alias `dinospace-eight.vercel.app` resolves to READY production deployment `dpl_3qZ69v23WHWt2UBHsp8Lc1uwc7Am`, immutable URL `https://dinospace-3qos88fxh-memas-projects-23a0001d.vercel.app`. Metadata SHA is `20ff27d91e86b974e6e71e009d572f6f5ab5abba`. Actual browser loaded `index-C8__ZC2f.js` and `index-Bwl2SrXA.css`. This is the authorized Batch 2 release, replacing the previous `aeea9e7` release.

## German Garage actual controls

- Desktop 1280 × 720: selected Amari, entered Explore & Languages, started German Garage level 1 and replayed the clue. Pink painted the car Rosa and held translation feedback until Next word.
- Mobile 390 × 844: Next word retained progression at round 2. Replayed the bundled German clue; yellow produced held Gelb translation feedback. Next word reached round 3. Yellow was incorrect and retained round 3 with retry feedback; red produced held Rot translation feedback and advanced the counter.
- Back to learning world opened the leave dialog; Back to world returned to `#/world/explore`.
- Mobile document width 390; no broken or incomplete rendered images. Console had zero errors/warnings. All 24 observed requests succeeded (200/206), including Rosa, Gelb and Rot audio. Physical speaker output was not verified.
- Screenshot: `output/playwright/health-20261002-0649-parent.png`. Closed only this isolated browser. Real child data was not accessed or changed; no provider story generation or paid voice calls were performed in this health sample.

## Newly confirmed release issue

Concurrent independent production acceptance found five automatic Puzzle Pop `/api/voice` requests returning HTTP 429. Evidence: `.playwright-cli/console-2026-10-02T06-48-56-329Z.log`. Tester disabled sound and stopped triggering narration requests. A separate Luna builder is investigating missing packaged narration and safe fallback behavior without calling the provider. Batch 2 narration acceptance remains blocked until repair and live verification.

This health sample is not full-game acceptance or proof that all 26 games meet the 4.5 roadmap. Independent Batch 2 production gameplay testing continues separately in `docs/batch2-production-independent-qa.md`.
