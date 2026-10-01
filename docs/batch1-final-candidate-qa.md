# Batch 1 final candidate QA (local, not production)

Date: 1 October 2026. This report records browser evidence for the immutable local candidate and separates it from production acceptance. It does not claim a blanket 4.5/5 rating.

## Candidate identity and method

- Local static candidate: `http://127.0.0.1:5177` (`/tmp/dinospace-batch1-final-20261001`)
- Candidate source SHA reported by the release owner: `d2f1cdd116e88b72ff1a38c73a518a8ad8820cfd`
- Fresh browser load rendered `assets/index-BZkk3Yuu.js` and `assets/index-BjKMFMwR.css`.
- Browser: isolated Playwright Chromium session `luna-final-5177-sw`; explicit configuration `tmp/playwright-offline-acceptance.json` enables service workers. No app state was injected.
- The source owner reported 96 tests, lint and build passing; those are not UI evidence in this report.

## Service-worker offline reading

After loading the candidate online, the browser registered `http://127.0.0.1:5177/sw.js`; it reached `activated` and controlled the page. Cache storage included `amari-discovery-v13`.

I selected Amari and opened Storybook Studio through the visible UI. The shelf showed all seven bundled titles. I opened Kai, started reading, and verified the cover narration and Kai page illustrations were available. With Playwright network emulation set offline, I reloaded the browser document. The app shell and profile picker loaded. After selecting Amari, Read & Write, Storybook Studio and Kai again, the app restored the saved reading location (page 3, “Three Stops”), its 1600 px illustration loaded, and the page narration played with `navigator.onLine === false` (audio duration 11.12 s). Browser console showed zero errors and zero warnings. This is a controlled local candidate test with the v13 service worker; it is not installed-device or production offline acceptance.

## Storybook rendered content and assets

The seven-title shelf and all seven bundled `book.json` manifests were previously checked against the rendered `5175` candidate. Full rendered page-by-page reads and all-three-question wrong/clue/right/explanation flows were completed for Mina and Kai on that snapshot. Mina’s and Kai’s ten story pages, page illustrations, image descriptions, narration controls and word help were consistent; Kai’s reading position survived reload. The candidate owner confirmed story content/media logic is unchanged in `5177`; I did not repeat both full ten-page/quiz runs on `5177`.

On `5177`, I confirmed all seven book titles were present in the live Storybook shelf before switching offline. Offline shelf navigation and Kai continuation were exercised after a full offline reload as described above. This test does not count as full seven-title content verification. Earlier local-only Bo/Sami test evidence lives in the separate batch QA record and must not be treated as evidence for this immutable snapshot unless its identity is stated there.

## Curriculum Quest final layout check

I opened Curriculum Quest through the visible Explore & Languages world at the same `5177` candidate. At 390×844:

- Document and body scroll widths were 390 px; no horizontal overflow.
- Continents & Oceans, Time Detectives and Nature Lab were all fully visible as three stacked module buttons, each 354×57.5 px.
- All rendered buttons measured at least 48×48 px. The map answer pins were 48 px high (widths 48–56 px).

At 1280×800, the same three module names remained visible, document width was 1280 px with no overflow, and no rendered button was below 48×48 px. I saved viewport screenshots under `.playwright-cli/page-2026-10-01T01-10-35-240Z.png` (mobile) and `.playwright-cli/page-2026-10-01T01-10-38-108Z.png` (desktop). This was a focused layout check only; it did not repeat Curriculum completion queues, facts, retries, badge persistence, or parent navigation.

## Scope and remaining evidence gates

- The offline read-aloud proof is for a controlled local browser with its v13 service worker and cache installed. It is not canonical-host, installed-device, or production proof.
- The final local shelf contains seven titles, but this report does not establish seven full content/illustration/audio reviews on this exact snapshot. Full reading/quizzes for Mina and Kai are referenced on `5175`, which the owner identifies as story/media-identical; the exact-source boundary is preserved above.
- I did not repeat the three seeded desktop and three mobile full-run gates for Letter Launch, German Garage, Storybook Studio, or Curriculum Quest here. Chapter-badge implementation is not independently accepted by its implementer; use the separate independent badge report.
- Four older catalog stories/browser data recovery, an overall 4.5 rating, and canonical production acceptance are not established by this local QA.
