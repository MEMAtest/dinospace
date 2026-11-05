# Sky Shapes and Monster Math — live acceptance resolution, 5 November 2026

Current canonical site: https://dinospace.netlify.app; application runtime `72ce4a32ee6cf4ca69ffe3276161818b71870efd`, entry `/assets/arcade-C5jqYKfV.js`. The application was not redeployed: the diagnosed issue was in the QA driver.

## Root cause and correction

The unmodified full-journey driver left Sky Shapes for Creative Lab and called a full page reload 49 ms later. The timestamped trace in `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T205455-074503000.json` records five catalogue image requests starting 42–45 ms before the test's `reload-begin` marker, and each aborted about 565 ms after that marker as the document was reloaded. HTTP image availability and separate settled-catalogue checks are retained in the prior audit. The trace is consistent with the test cancelling its own in-flight requests. Original failed reports remain failed and are not rewritten.

The source-bound QA driver `docs/qa-evidence/sky-monster-save-20261029/sky-monster-native.cjs` now waits for visible catalogue images to complete with nonzero natural dimensions and for started network requests to settle before it performs its intentional reload. It does not suppress or filter page, console, HTTP or request errors. It records which visible pictures decoded. The actual game code, earned records and personal data are unchanged.

## Live verification

Phone 390x740: full 36 Monster Math questions, 12 Sky Shapes flights, keyboard and emulated touch, held explanations, audio playback, progress retention through reload and no page/console/request/response/provider errors. See `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-C5jqYKfV-20261105T210642-191254000.json`. This is synthetic Chromium evidence, not physical-device or human listening certification.

Desktop 1440x844: the same 36 questions and 12 flights passed, including keyboard and emulated touch, progress retention after reload and zero page, console, request, response or provider errors. See `docs/qa-evidence/sky-monster-save-20261029/production-full-sky-monster-1440x844-arcade-C5jqYKfV-20261105T211036-634760000.json`. The existing gameplay eligibility limits and historical human-listening gate are unchanged.

After the Count/Addition release, `production-v65-sample.json` verified the current public module `/assets/arcade-BBjJnjd-.js`: Monster Math started a visible question and Sky Shapes opened a visible tracing board at 390px, with no page, console, HTTP or provider errors. This sample does not replace the full earlier v64 phone/desktop runs.
