# Count the Stars layout-specific clue correction

Candidate source: `79a719e91e727f09d1f78cf890acd7e671cab381`, based on frozen variety candidate `40c053408d47ca76ff26cc8ae5c2e8ad9bb99d70`.

Local preview: http://127.0.0.1:5395/  
Frozen build: `tmp/count-layout-clue-5395/dist`  
Identity: [identity.json](identity.json)  
Served assets: [served-assets-sha256.txt](served-assets-sha256.txt)

## Change

The prior clue selector used `episodeIndex === 2 && round.count > 5` to choose the split-group prompt. That did not inspect the question’s actual arrangement, so a Challenge Orbit question rendered as a regular row array could be described as two groups.

The new `getCountQuestionArrangement(round)` classifier follows the arrangement produced from the round’s `layoutVariant` and count:

- Orbit with at most five objects is scattered.
- Grouped with more than ten objects is two separated groups.
- All other questions are arranged in rows or an array.

Both the board’s accessible arrangement label and the visible clue now use this shared classifier. All three clues reuse existing authored lines. No question IDs, counts, object coordinates, narration keys, progress behavior, or audio data changed.

## Verification

- Focused Count tests: 8 passed, including a new exhaustive mapping assertion for every question in all three episode pools. It explicitly checks Satellite Panels at 15 objects in both Orbit and Grouped variants.
- Scoped ESLint passed for the component, data module, and test.
- Production-config Vite build passed.
- A fresh Playwright CLI profile used confirmed 403 voice and story routes installed on `about:blank` before navigation, kept sound visibly off, and earned Starter/Growing/Challenge unlocks through normal controls. The Challenge check showed Satellite Panels with 12 objects and Crater Gems with 15 objects in rows, each with the row clue; a normal Challenge replay showed Constellation Maps with 17 objects in two groups and the matching split-group clue.
- Console reported zero messages, errors, and warnings. The request summary reported 14 static requests and no non-static API requests; route-list confirmed both guards remained active.
- The frozen preview manifest covers 5,879 files. A fresh HTTP fetch verified all 5,879 SHA-256 hashes against the frozen local build with zero mismatches.

Screenshots are in [screenshots](screenshots/). The scattered ≤5 mapping is covered by the exhaustive pool test, but this guarded browser run did not capture a scattered-hint screenshot. An earlier exploratory browser profile was discarded because its programmatic guard registrations were not visible in Playwright CLI route-list. Its request log was unavailable after close; it is excluded from all accepted findings. The fresh guarded session above is the only browser evidence in this report. No production deployment, provider calls, listening, or acceptance score is claimed.
