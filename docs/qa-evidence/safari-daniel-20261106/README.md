# Sound Safari Daniel voice repair — 7 November 2026

Live at https://dinospace.netlify.app, runtime `3156525648283dc8747c58ac4709d5528665c5c9`, entry `/assets/arcade-D_qRocaF.js`, worker `amari-discovery-v70`. Immutable backend `dpl_Ab5xx6qNVT5KexYMfFteUzT35TU1` (`https://dinospace-lj22ib5gf-memas-projects-23a0001d.vercel.app`); Netlify gateway `6aee6c207c24d587c81975aa`.

Sound Safari's 18 words and blend instruction now use Daniel recordings generated with the same voice and model as the six previously user-approved Daniel phoneme clips. The game uses its own fixed voice inventory for prompts and spoken explanations rather than shared Matilda clips; other games retain their own voice inventory. Browser playback verifies the instruction and sampled word/explanation paths start and advance. This is not an independent human listening or pronunciation assessment of the newly generated clips.

The user approved 19 recordings with no automatic retry. The first `ant` attempt returned 401 because the local Vercel credential was masked. A restricted, expiring production-environment job with no domain promotion produced the remaining 18. After explicit user approval, a separate ant-only restricted job made exactly one retry, which succeeded. The ledger retains all 20 attempts, including the 401 and authorised retry; 19 unique recordings were saved. Both temporary deployments were safely removed and their actual endpoints returned 404; their tokens and temporary API sources were deleted. All 19 files decode, have positive duration, contain non-silent audio, and match their recorded SHA-256 hashes. No additional provider calls were made during browser testing.

Build, scoped lint and all 760 source tests passed. Full actual-control native and canonical production journeys passed at 390x740 and 1440x844, 72 questions per viewport across Time Teller and Sound Safari. Tests exercise the three Sound Safari chapters, wrong retry, held explanations, sampled new Daniel word/instruction/explanation playback, the six previously approved phonemes and saved progress/reload. The phone browser first became unresponsive; its interrupted run is not counted. The same named persistent synthetic session was restored; the first restored run hit a two-second player-selection timeout and is retained as a failed result. Subsequent full journeys passed. Physical-device testing and human listening were not performed.

Canonical HTML, worker, module and all 19 audio files match the immutable candidate (`candidate-assets.json`, `production-assets.json`). An actual Refresh games click retained 117 synthetic local-storage hashes and the synthetic storybook database (`cutover-before.json`, `cutover-after.json`); it does not establish recovery of personal stories. No real user profile or saved data was reset.

Full journey reports:
- `docs/qa-evidence/time-safari-save-20261029/native-time-safari-390x740-arcade-D_qRocaF-20261107T000600-737224000.json`
- `docs/qa-evidence/time-safari-save-20261029/native-time-safari-1440x844-arcade-D_qRocaF-20261107T000722-881256000.json`
- `docs/qa-evidence/time-safari-save-20261029/production-time-safari-390x740-arcade-D_qRocaF-20261107T000943-992097000.json`
- `docs/qa-evidence/time-safari-save-20261029/production-time-safari-1440x844-arcade-D_qRocaF-20261107T001058-097112000.json`
