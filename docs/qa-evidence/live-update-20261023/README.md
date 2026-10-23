# Live app / stale-tab repair — 23 October 2026

## Confirmed observations

The canonical release was already `03773d03`, but the user's open Home tab still had `/assets/arcade-CeTz6ja-.js` loaded from the previous Shadow Match release. Its Break Time overlay covered the controls. All visible home/world illustrations decoded successfully; the evidence did not show missing home images.

A normal reload loaded the current maths bundle `/assets/arcade-wsV7W-0p.js`. The home Addition Adventure control opened its intro successfully. No answers were completed and saved points stayed at 3. After the repair below, the same existing tab loaded `/assets/arcade-1e7QzwSn.js` and visibly rendered the styled Addition intro. No new user browser windows or tabs were opened.

The previous maths uplift changed the counting pictures and in-game arithmetic models. It did not replace every home/world thumbnail. The six new Shadow Match creatures appear progressively at levels 3–5; they remain served at `/art/shadow-match-v2/` with the accepted bytes.

## Fix and acceptance

Added a small release notice above the app. It checks the same-origin generated index without HTTP caching on focus, on visibility return, and every three minutes while visible. It compares only the module entry URL; it never executes fetched HTML. A changed release offers **Refresh games** and **Later**, with a reminder to save work first. It never automatically reloads or resets progress. Offline, invalid and cross-origin results do not interrupt play or produce a false notice. Hidden tabs do not poll; cleanup aborts unfinished checks. No timestamp cache keys accumulate.

Four focused lifecycle tests pass. A contained Chromium fixture served changed release metadata to the actual production build and verified the notice at 390px and 1440px, Later dismissal, explicit native refresh, unchanged saved progression and no execution of the fake entry. This is a simulated release-metadata test, not a second production deployment used to manufacture an update.

## Released evidence

Runtime **`cf0156060c364f3b0fa9d91cdb5af4212fbd5f50`**, deployment **`dpl_9dmAihwKWuyYCWbUy92MRiEADnqh`**, service-worker cache **v28**. The immutable candidate and canonical index entry/preload/stylesheets match byte for byte. All six new dinosaur images match their recorded SHA-256 hashes.

- Candidate: actual Addition, Subtraction, Counting and Shadow Match controls passed at 390px, including packaged explanations and the new Parasaurolophus graphic.
- Final canonical rechecks: the same four games passed at 390px and 1440px, with zero page/console errors, failed assets or provider API calls. The stable release correctly showed no update notice.
- One first post-promotion visit reported a CSS404 for `/assets/arcade-DU7D2KCy.css`. That failure is preserved in `promotion-first-check.log` and `promotion-css-failure.json`. The resource then returned 200 and matched the candidate bytes; fresh phone and desktop visits were clean. This is recorded as a recovered cutover failure, not omitted from the evidence.
- Full suite: **353 passed, 1 existing skip, 0 failed**. Emitted-build PWA audit: **8 passed, 0 skipped**. Scoped ESLint and build passed; existing chunk-size advisory remains.
- The four gameplay components are unchanged from the prior source. The full 144-question maths rehearsal remains attached to `03773d03` in `../three-maths-20261023`; this global update repair has representative current-release checks, not a fresh all-game acceptance or new editorial score.

The device/browser clarification remains relevant if the user means a separate phone installation or another URL. These checks prove the named web deployment and existing in-app tab, not an unidentified installed app.

## Evidence / resources

`user-tab-observation.json`, `served-runtime.json`, the candidate/canonical identities, browser result JSON, replay scripts and `verification-summary.json` retain exact observations. `update-390.webp`/`update-1440.webp` show the simulated update notice; `live-shadow-390.webp` shows the actual current production dinosaur artwork.

No checkout, dependency installation, paid voice/story call or generated-art job was created. Existing dependencies and build directory were reused. Only compact QA evidence is kept; task-owned duplicate PNGs and parsed raw logs are removed, retaining the unique first CSS failure. The existing contained QA browser is retained for monitoring; the task-owned preview server is stopped. Unrelated untracked evidence is preserved.
