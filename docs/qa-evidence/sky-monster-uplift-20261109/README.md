# Sky Shapes and Monster Math — 9 November 2026

Live on https://dinospace.netlify.app: runtime `0e85c3d372bf9d0a38f28f7563a6b26634006bbd`, entry `/assets/arcade-UPS9q7yk.js`, worker `amari-discovery-v73`. The immutable backend is `dpl_F2Bqdckv5aASKER1Df5GhNXwSJqe` and the published Netlify gateway is `6af2352e1173787843ab03f3`.

Monster Math now displays its twenty counters as two separate five-by-two ten frames. Its phone episode title wraps in full. Both games' selection screens use existing illustrated catalogue art; Sky Shapes mission titles can wrap. The counters and gameplay data are unchanged.

The configured build, scoped lint, and all 760 source tests passed. Full visible-control native and production journeys each passed at 390x740 and 1440x844, with 36 Monster Math questions and 12 Sky Shapes flights per viewport. The runner checked the two frames' five columns and two rows on 12 models per run, all 36 episode headers for clipping, retry and held explanation/Next, packaged playback, earned records, navigation, and no page, console, request, response or provider errors. `frame-390.png` and `frame-1440.png` show the final production frames. This is synthetic Chromium evidence, not a physical phone test or a human listening/editorial assessment.

The published HTML entry, two stylesheets, module, worker and two catalogue artworks matched the built bytes (`production-v73-assets.json`). The actual Refresh games action retained all 117 synthetic local-storage record hashes and the synthetic Storybook database (`v73-cutover-before.json`, `v73-cutover-after.json`). This does not establish recovery of the user's historical stories or rewards.

The first long rehearsal was wrongly treated as stalled: it was a long, silent sequence. An initial retry also timed out on a click that had reached the home screen, and a later title-assertion injection failed due to a test-script reference error. Failed evidence remains in `../sky-monster-save-20261029/`. `run-observed.py` adds bounded local-only progress checkpoints, frame and heading checks; `integration-native.cjs` now passes its existing explicit timeout to clicks. Checkpoints use a transient loopback server and do not call a voice or story provider. The separate failed and interrupted runs are not counted as passes. The driver records hashes of both the original source and the instrumented runner; its instrumentation is part of this evidence, not unmodified-driver proof.

Final reports, each source-bound to the release entry:

- `../sky-monster-save-20261029/native-full-sky-monster-390x740-arcade-UPS9q7yk-20261109T205437-440967000.json`
- `../sky-monster-save-20261029/native-full-sky-monster-1440x844-arcade-UPS9q7yk-20261109T205847-790128000.json`
- `../sky-monster-save-20261029/production-full-sky-monster-390x740-arcade-UPS9q7yk-20261109T210435-295014000.json`
- `../sky-monster-save-20261029/production-full-sky-monster-1440x844-arcade-UPS9q7yk-20261109T210816-510147000.json`

The earlier v72 release and its successful journeys preceded the phone-title correction; v73 above is final. No paid calls, new checkout, browser profile or dependency installation were made. The existing synthetic profile and unrelated work were retained.
