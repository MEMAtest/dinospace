# Batch 5 child recording recovery copy: UI delta

**Frozen runtime source:** `721d6ed4d5092e05f6da2c5f7a469ae837ddb700`  
**Builder evidence/docs commit:** `e6f6fa0ab5b9238f38abaea58f1a5fbeedcc1afe`  
**Parent UI report:** [`batch5-cumulative-ui-delta-20261005.md`](batch5-cumulative-ui-delta-20261005.md)  
**Screenshots:** [`screenshots/`](batch5-child-recording-recovery-copy-20261005/screenshots/)

## Build and browser controls

I reused the existing `default` Playwright session and its current tab only. No browser, context, tab, window, or profile was created. The previously stopped static server was replaced with a server for the immutable directory `/tmp/dinospace-b5-child-copy-recovery-20261005` at `http://127.0.0.1:5401/`; no rebuild was run.

Before app navigation, voice and story 403 routes were installed on the same page. Requests to `/api/voice/qa-guard-probe` and `/api/story/qa-guard-probe` both returned 403, then the tab returned to `about:blank`. Sound was turned off with the visible UI control after loading the new origin and stayed muted through testing. No answers, progress, storage, or seeds were injected.

Identity checks: the build contains 5,959 files and 208,628,714 bytes. Its reported `index.html`, main JS, and CSS SHA-256 values were checked against the files on disk and match: `865f7b5b…8e8eec7`, `5e8a3145…80e0b19b`, and `935e2f6e…e682d2`. I also compared the candidate’s complete per-file list against the preceding cumulative build fingerprint: both contain 5,959 paths; five old hashed bundles were replaced by five new hashed bundles, `index.html` and `sw.js` changed, and all other paths match. The candidate’s per-file differences are captured by the listed main asset names and the two UI component changes in the frozen report. All 16 listed static requests returned 200. Both guard probes returned 403. Console reported zero errors and warnings.

## Findings

### Sound Safari

At 1280×800 and 390×844, the chapter map displayed: “The listening recordings are not ready yet. Tap the back arrow to choose another game.” Start remained disabled; no attempt was made to bypass the readiness gate. The message now gives a concrete action. At both widths, the visible `Back to learning world` button returned to the Read & Write world (`#/world/read-write`). Screenshots: [desktop gate](batch5-child-recording-recovery-copy-20261005/screenshots/sound-safari-desktop-gated.png), [390px gate](batch5-child-recording-recovery-copy-20261005/screenshots/sound-safari-390-gated.png).

### Spelling Studio

At both 390px and 1280×800, the ordinary First Sounds chapter could be opened and started. Its “Repeated letters use separate tiles.” footer appeared white on the navy scene background and was legible at both viewport sizes. The opened ordinary question was `not`; it does not exercise repeated-letter tile behavior. I did not trigger any sound control because the profile was muted. Therefore the revised pure-sound recording recovery error was not naturally exposed and remains unverified by this browser delta. Screenshots: [390px question/footer](batch5-child-recording-recovery-copy-20261005/screenshots/spelling-390-footer.png), [desktop question/footer](batch5-child-recording-recovery-copy-20261005/screenshots/spelling-desktop-footer.png).

## Boundary

This delta verifies the Sound Safari disabled gate and its child-facing recovery action, the back-arrow route at both viewport sizes, and Spelling Studio footer contrast on an ordinary question. It does not verify pure-sound error rendering, repeated-letter behavior itself, audio playback, recording readiness, listening quality, the remaining chapter matrices, or 4.5/release acceptance. The chapter gate is still correctly disabled; no provider or story calls were made.
