# Dino Detective and Dino Hangman

Live acceptance passed on 29 October 2026. All six final-source native journeys and all six canonical public journeys passed. Positive reward Retry and final saved-record reconciliation also passed.

The one public app is [dinospace.netlify.app](https://dinospace.netlify.app). Runtime `c2043b79699752727a33b458473557378b382242` serves `/assets/arcade-DYyDnHAt.js` with worker `amari-discovery-v43`. Immutable backend deployment `dpl_CsK1oBbZoJW5Dn5WSVvChwSVzzsG` is pinned by Netlify gateway `6ae2bf3d0e9ac4fec2a96773`; the old Vercel app entry remains redirect-only.

Dino Detective retains Amari’s 12 worlds and five finds per world, plus Askia’s five levels with 5/5/6/6/7 finds. The older-child bands now teach progressively harder searches: full trails, partial trails, then a spatial word clue with optional stronger visual guidance. Found animals and facts stay held for Next/Finish. The younger-child version keeps footprint inspection as its baseline mechanic and records optional clearer-trail help separately. Decorative start/result images are bounded so they cannot cover the level selector or Next.

Hangman now has four named missions with 3/3/6/4 distinct rescues and word lengths 3/4/5/6–7. Pools respect taught graphemes; clue-only regular four-letter additions do not expose an unrecorded Hear button. Losing keeps the answer for same-word Retry. Hints remain explicitly assisted practice. The full 26-letter keyboard, held Finish/Retry, saved-level navigation and mission selection must fit and receive actual taps on the phone. The floating daily mission cannot cover the keyboard.

Both games require a local write and readback before claiming a saved result. Positive reward receipts use stable parent claim tokens, recover after Back/reopen, and add no duplicate reward on reentry. Existing sibling records, earlier game rows, bests and sticker IDs are protected. Failed saves retain the result and a primary Retry action.

| Route | Viewports | Runs per viewport | Responses per viewport |
|---|---|---:|---:|
| Amari Detective |390×740, 1440×844|12 worlds|60 finds|
| Askia Detective |390×740, 1440×844|5 levels|29 finds|
| Amari Hangman |390×740, 1440×844|4 missions|16 rescues|

Each full matrix is 6 journeys, 42 world/level runs and 210 primary responses. Wrong retries, audio controls, individual keyboard taps, save-fault diagnostics and replay checks are additional actions rather than inflated primary counts.

The actual web build and 518 tests passed with 0 skips; scoped lint and diff checks passed. `source-gates.json` binds the source and compiled hashes. `native-compiled-summary.json` identifies the final six native reports. `production-summary.json` identifies the final six canonical reports.

`patch-production-http.json` verifies the canonical HTML, module/stylesheets and worker bytes against the immutable backend. `patch-production-critical-art.json` verifies six Shadow Match hashes and 39 catalogue assets; `patch-production-media-availability.json` checks 37 exact word recordings and three dinosaur scene assets without downloading an audio corpus. Packaged playback, mute/leave cancellation and request guards are tested in the actual UI; there were no new paid voice, story or image jobs in this pair. No subjective listening score is inferred.

The original worker 41→42 open-page refresh preserved 38 selected saved-record hashes; worker 42→43 preserved 40 including the newly earned Dinosaur/Hangman records. `production-retention-summary.json` confirms 29 other saved-key hashes and four earlier Askia game rows unchanged; prior sticker IDs retained; canonical/legacy reward mirrors equal. Askia 166→206 exactly matches 40 earned claim points; Amari 258→306 matches 48 including the clean four-point improvement. No replay paid twice. Original protected Writing Desk projects remain in the one synthetic browser profile; evidence keeps their hashes and byte lengths rather than duplicate document bodies.

The first public worker 42 candidate completed its functional journeys but was rejected at the final geometry audit because the parent-reward Retry extended below 740px. Worker43 moves Retry into the main action row and compacts result navigation. Earlier unique layout failures, source gates and partial reports remain retained in `audit-and-repairs.md` and adjacent records. They are not final acceptance.

All checks use the same retained headless session/profile and synthetic storage namespace, with provider API 403 guards. No real family browser data was touched. A single bounded localhost run in that profile tested first-time awards; its known storage stayed below 40 MiB. The evidence budget was explicitly revised from 8 to 12 MiB for the additional public patch; lossless report compaction and retained originals are recorded in `evidence-compaction.json`. No worktree, clone, dependency install or browser profile was created.

These are targeted gameplay and persistence checks. Historical editorial scores and historical personal-story recovery are separate.
