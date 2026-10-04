# Robin leaf visual delta — frozen 5351

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5351`  
Source: `aea335f28ba5c0143349baedd43cb44a49be39ea`  
Identity: [`spot-safari-square-wing-identity-20261004.json`](../spot-safari-square-wing-identity-20261004.json)

## Result

**Robin’s Woodland fails the seven-genuine-differences visual gate on 5351.** Before interacting with either Robin pair, I inspected the ordinary rendered A/B scenes in two fresh profiles: desktop 1280×800 and mobile 390×844. The desktop profile encountered Robin as pair 1/4; the mobile queue encountered it as pair 2/4 after a normally completed World Explorer pair. Both showed 0/7 changes. The round-versus-pointed leaf marks at the upper-left and upper-right portions of the pictures have no discernible silhouette change between A and B. I did not tap, use a hint, or advance either Robin pair.

Evidence: [desktop A/B before interaction](screenshots/desktop-robin-before-interaction.png), [mobile full A/B before interaction](screenshots/mobile-robin-before-interaction-full.png). At 390px the pictures are stacked, each rendered at approximately 334×251 CSS pixels; the relevant marks are visible in the complete full-page capture. The pictorial comparison is an observed rendered defect on this frozen candidate. It is consistent with, but does not rely on, the separate source-level diagnosis in the integrator’s messages.

## Method and boundaries

The desktop and mobile profiles each started with guarded `about:blank`, registered fulfill handlers for `**/api/voice**` and `**/api/story**`, then navigated to this exact origin. Sound was off. Progression to Challenge used ordinary Starter/Growing play; no progress, seed, answer, storage, or hidden guide data was injected. The mobile profile normally completed the visible World Explorer pair before its randomized queue reached Robin. The Robin pair remained at 0/7 and was left untouched.

All 10 paths in the frozen candidate identity were fetched directly from the served origin and matched the manifest byte counts and SHA-256 values. This is an image-only failure observation: no Robin target hit-testing, miss, hint, held fact, Next, reload, or completion control was tested. The mobile profile has a viewport-cropped B panel in the initial viewport, so the reported mobile evidence uses the full-page screenshot; the page’s document width remained 390px. This review does not establish audio readiness/listening quality, production acceptance, or overall 4.5 acceptance.

## Follow-up candidate

The original 5351 result remains failed and unchanged. Any candidate that repairs the leaf silhouettes needs a new rendered comparison before acceptance; passing tap controls cannot waive the visual gate.
