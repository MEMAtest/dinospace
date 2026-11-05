# Sky Shapes and Monster Math — current live audit, 5 November 2026

Acceptance remains open. No game source was changed or released as part of this audit. Current production module `/assets/arcade-C5jqYKfV.js`, runtime `72ce4a32ee6cf4ca69ffe3276161818b71870efd`.

The original phone and desktop full journeys, plus three phone reruns, each completed 36 Monster questions and 12 Sky flights, but all five report `passed: false`: catalogue images recorded `net::ERR_ABORTED` during the multi-route journey. No page errors, console errors, HTTP response errors or provider attempts were reported in those failure messages. Preserve the original failure status; successful task counts do not override it.

HEAD requests to the six originally reported image URLs returned 200. `catalog-post-abort-check-20261105.json` shows the two visible Creative Lab pictures decoded after the first run. A focused navigation probe initially ran before lazy images had populated and failed; its retry waited for the visible images to decode and passed with no failed requests. An immediate-return probe recorded no failures, so it did not reproduce the aborts. These small probes do not explain every aborted request and do not close the full-journey gate.

Two reruns used a temporary driver adding network-idle and image-settlement waits; these changes were QA-only, not product code. The second modified driver is retained here as `settled-driver.cjs` (SHA-256 `89a2db6d17e832eaaa2f2f0d0ceaca71fb38ae459e35a0ab09bb1f562b9b6851`). Its report embeds the standard runner's original source inventory; that inventory is not the hash of the modified driver. The copied `settled-runner.py` documents how the QA driver was invoked and references its then-temporary path. No site data was cleared and no paid voice or story requests were made.

The synthetic Chromium profile measured approximately 1.1 GiB (about 772 MiB HTTP cache and 365 MiB service-worker data) and was retained intact. No conclusions are drawn about family progress or personal books.

Original reports (all remain failed):
- `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T002021-510181000.json`
- `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-1440x844-arcade-C5jqYKfV-20261105T002505-555614000.json`
- `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T003005-463093000.json`
- `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T003522-051853000.json`

Focused observations:
- `docs/qa-evidence/sky-monster-save-20261029/catalog-post-abort-check-20261105.json`
- `docs/qa-evidence/sky-monster-save-20261029/catalog-navigation-settled-20261105.json` (failed early-read probe)
- `docs/qa-evidence/sky-monster-save-20261029/catalog-navigation-settled-retry-20261105.json`
- `docs/qa-evidence/sky-monster-save-20261029/catalog-fast-navigation-20261105.json` (inconclusive)

A three-cycle fast Sky Shapes navigation probe recorded 18 catalogue requests and no aborts (`docs/qa-evidence/sky-monster-save-20261029/catalog-race-trace-20261105.json`). A further full mobile run on that warmed profile still reported aborted catalogue images after completing all 36 questions and 12 flights (`docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T004150-215646000.json`). The targeted probe did not reproduce or explain the full-run warning; full acceptance remains open.
