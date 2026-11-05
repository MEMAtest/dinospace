# Subtraction Station and Number Line Jump — 5 November 2026

Live at https://dinospace.netlify.app. Runtime `61a8d746c4ea2d5dccb73a1a0d54fb2c2b4fbe0b`, entry `/assets/arcade-UpMdFwWa.js`, worker `amari-discovery-v66`, immutable backend `dpl_7VETb6hu7YGJGKx6eRF36n2J9ev9`, Netlify gateway `6aecf6b0ce4663b4d1b1d2a7`.

The Subtraction chapter card uses the existing illustrated subtraction machine; the Number Line selection uses the existing friendly illustrated frog. The functional number-line SVG frog is retained during play. No maths logic, saved progression or audio was changed. A 390px visual rehearsal confirmed decoded art, 56px visible, centre-hittable start controls and no horizontal overflow (`native-visual-390.json` and two representative screenshots).

Build and 760 source tests passed, and scoped lint passed. Full native and canonical actual-control runs passed at both 390x740 and 1440x844: 72 questions per viewport across all chapters and lower-rated replays, artwork decoding, model correctness, wrong retries, explanations, packaged playback and saved records after reload, with no page, console, request, response or provider errors. Fault-injection and physical-device/human-listening certification were not performed in this update.

An actual Refresh games cutover retained 117 synthetic local-storage hashes and the synthetic storybook database. This is not evidence of personal-story recovery. Public HTML, module, styles, worker and both images matched the tested build and pinned backend on repeat (`production-core.json`). The first immediate post-cutover check recorded one module mismatch (`production-core-initial-mismatch.json`); repeat and independent follow-up requests matched, and the initial cause was not established. No paid voice or story calls and no new editorial score.

Live reports:
- `docs/qa-evidence/subtract-numberline-save-20261029/production-subtract-numberline-390x740-arcade-UpMdFwWa-20261105T213623-365168000.json`
- `docs/qa-evidence/subtract-numberline-save-20261029/production-subtract-numberline-1440x844-arcade-UpMdFwWa-20261105T213712-155483000.json`
