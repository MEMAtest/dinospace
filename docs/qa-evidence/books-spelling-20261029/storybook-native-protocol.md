# Storybook Studio actual-control protocol

Use `run-storybook-native.py` only after root hands over the existing guarded headless browser page and the exact compiled entry. It invokes the installed Playwright `run-code` against the existing profile and inlines the reviewed CJS runner as a raw `async page => { ... }` callback; the restricted VM has no `require`, `fs`, or `path`. It does not launch a browser, tab, context, profile, origin, or reset. First run `preflight` at 390×740, return to the library through its visible Back control, then run `full` at 390×740 and 1440×844. Use `localFaultMode: 'write'` on phone and `'readback'` on desktop; this repeats only a reversible favourite change and restores its original state. `full-with-backup` is a one-time candidate-only variant if root explicitly schedules the approved Pip QA backup. The wrapper verifies the compressed backup hash, decompresses in memory, clears any stale page payload, stages bounded chunks on the same page, and cleans up a partial payload if staging fails. Preserve existing IDB, localStorage, progress, rewards, reader profiles, and all earlier QA evidence. A previous run, completion, or reward is valid state; report replay deltas as zero rather than clearing state.

When the seven-book journeys are already recorded, use `continuation` instead of replaying all seventy pages: `STORYBOOK_SKIP_LOCAL_FAULT=1 python3 docs/qa-evidence/books-spelling-20261029/run-storybook-native.py http://127.0.0.1:5180 390 740 native continuation`. It performs the bounded reader-identity fault/recovery, visible library exit/reentry, zero-delta progress/reward comparison, and the approved Pip QA backup restore, stored-media Retry/object-URL lifecycle, and export summary. The backup bytes are staged only in memory on the existing page; the downloaded export is canceled and only a small structural summary plus SHA-256 is retained. Never use this mode on production or treat the Pip artifact as family data.

For canonical verification, run `full` at both required viewports before the one root-owned CLI upload of the approved Pip QA artifact. After that upload is visibly confirmed in the same synthetic browser profile, `continuation-restored` skips book replays and never opens the file chooser or stages another backup. It checks saved media Retry, playback, cleanup, progress/reward replay stability, and backup export. Do not call it before Pip is already present. The runner may dismiss an actual Break Time overlay only through its visible `5 More Minutes` control, logs the action, and never changes timer storage or settings. Aborted `blob:` requests are classified as intentional only when the exact URL was created, explicitly revoked before the failure event, and is no longer active in the media DOM; other request failures remain fatal.

The Python wrapper accepts `ORIGIN WIDTH HEIGHT STAGE MODE` and uses the fixed existing profile `amari-targeted-contained`; the root owns acquisition and release. It checks that the CLI VM exposes `Buffer` and WebCrypto before it executes the UI journey. It reads the compiled entry from root's built `dist/index.html` only to compare the current served entry; it does not build or navigate the page. Never run it until root explicitly hands over the page.

`preflight` proves the visible seven-included inventory, mobile cover/start/page geometry and exact compiled entry; it leaves the first reader open, so return to the library by its visible button before invoking `full`. The full runner resets filters through the visible Included and Search controls, searches each authored title, reads every cover/page, tests quizzes and persistence/reward flows, then leaves and re-enters Studio using normal app controls. It requires `launcherName` if the learning-world button differs from Storybook Studio / Read & Write. The primary reader, quiz, sound, retry, and Next controls are measured at their current viewport position before any click; only library browsing, search, profile tools, and backup navigation may explicitly scroll first.

## Entry and evidence

1. Root opens Storybook Studio through the ordinary learning-world controls on the already leased tab and verifies its session namespace guard. Initialize the harness with the current origin, exact expected compiled JS entry, viewport, and one screenshot path. Record the runtime/entry identity in each compact result.
2. Capture page errors, console errors, failed responses/requests, image decode status, media requests, and `/api/` requests. Any provider request is a failure; do not permit generation or narration providers. Check all primary controls by full-rectangle viewport containment, minimum 44px target, and center-point hit test before clicking.
3. Keep one representative image per viewport (the hardest reader page with visible illustration, text, and narration controls). Preserve only unique failure captures. Do not save a video or success trace. Keep pair-wide evidence below 10 MiB.

## Included collection and reader path

The library must show seven included stories:

- Rex and the Missing Moon Map
- Luna and the Whispering Forest
- Nia’s Great River Journey
- Bo and the Busy Bee Garden
- Sami and the Night-Light Parade
- Mina’s Mountain Seed
- Kai and the Lost Library Book

Use visible story cards/buttons only. For each included title, open the visible card, inspect the cover, use the visible Start Reading control, and advance through all ten pages with Previous/Next controls. On every screen record visible page label, displayed text, image `currentSrc`/decoded dimensions, narration availability, and audio element source/ready state. Start at least one exact packaged narration clip per book using its visible play control; record actual `playing`/time advance and test mute or pause followed by Next/leave cancellation. Audio may be unavailable on a particular page only if the UI labels that honestly; do not substitute device speech or call a provider.

At the end of a book, answer each visible comprehension question from the story text that was just read. On at least one question, choose a wrong visible option, verify the same prompt remains and a useful clue appears, then use the visible Try again and answer correctly. Hold the correct explanation before Next/Finish and verify its control is visible, unmasked, and centered. Do not inspect React state or hidden answer props; the visible page text is the answer evidence.

For one story, stop after an intermediate page, return to the library, reopen it, and verify the reader resumes at the saved page. Toggle a favourite using its visible card control and verify the pressed state and saved progress survive reopen. Switch only among existing profiles through the visible selector; do not create/delete profiles or change their details. Confirm included inventory remains seven and My stories shows a separate count. Search an included title and verify it remains discoverable.

## Saved inventory, media, restore and lifecycle

- Take pre/post snapshots of raw localStorage key names, byte counts and hashes, plus read-only IndexedDB store counts. Do not dump story text, profile names, or asset bytes in reports. Keep every pre-existing record/hash. Distinguish readable empty from unavailable inventory; unavailable must not be called zero saved stories.
- With a clean candidate, observe library network activity before opening a story: no page narration or cover audio should be fetched for off-screen/unopened media. For saved media, observe current screen plus previous-screen retention, coalesced navigation reads, and object URL release on leave/child switch. The harness exposes created/revoked object URL counts; report cache bounds from observed controls and cleanup, not implementation claims alone.
- If backup/restore is tested, use only the already-approved synthetic `Pip and the Sunflower` QA backup at `docs/game-delivery-20261019/batch1/approved-provider-qa/pip-sunflower-backup.json.gz` (compressed SHA-256 `6460dad1981b6053a3e8bd2878d6e1403f671707f9f8a97bc6eec6575dda7cc0` from the approved inventory; verify against the inventory file before use). Decompress in memory and pass bytes through the visible Restore a story backup file chooser; do not write an extracted copy. The backup contains one QA-only ready book and 14 assets, with no progress rows. Keep it clearly labelled QA, preserve existing books, and do not treat it as a recovered family story. Verify its restored cover/page media and backup availability; never import the generic bulk QA backup.
- Retry a saved image/audio read only through the visible Retry saved media button. Confirm readable story text remains available during storage errors and that Retry does not issue a provider request.
- On the synthetic Pip QA book only, the runner dispatches bounded image/audio decode-error events without changing or deleting stored bytes. It then uses visible Retry cover / Retry saved media controls and requires a newly hydrated decoded URL; this checks that retry invalidates a stale cached URL and clears the failed image state.

## Persistence, rewards and cross-player receipts

Use only the normal visible reader journey. For a not-yet-completed book on an already-approved synthetic QA namespace, finish it once and verify local progress receipt commit/readback before the outer-player claim. Inject one bounded parent reward-write failure through the harness's temporary namespaced-key fault wrapper, confirm the same book/result remains held with a fully visible Retry, restore the original Storage method in `finally`, then retry once and reopen. Check that the same stable receipt token is claimed once; subsequent replay earns zero. Keep original and sibling-player rewards/progress hashes and compare all unrelated rows.

Verify receiver binding using an existing completion receipt already associated with a different outer App player, if such a record is present in the preserved QA profile: reopening under that other player must not transfer or duplicate the reward and must not block reading. Do not synthesize or edit a receipt. If no such record exists, mark this specific UI probe unavailable; the source-level receiver helper tests remain separate evidence.

Local write/readback fault probes may use temporary wrappers only on the exact namespaced Storybook progress or parent reward key. Always restore wrappers in `finally`, preserve the held page/result before Retry, and never reset or replace current progress. If the chosen record has already earned the maximum reward, report the positive-delta parent-failure scenario unavailable rather than manufacturing a profile or clearing state.

## Exit

Return to the learning world through the visible Back control, then re-enter Storybook from the world. Confirm audio is paused, reader URLs were released, library inventory/progress remains intact, and the exact candidate entry is still served. Each viewport result records: origin, entry, timestamp, viewport, included-title count, page/audio/image rows, wrong-retry evidence, visible-control geometry, storage before/after hashes, reward delta/receipt token outcome, provider requests, errors, and retained screenshot path. Keep partial results and unique actual failures; do not convert an unrun or unavailable path to pass. The root owns browser lease and final interpretation.

## Frozen QA artifact identification

The preapproved Pip backup inventory is `docs/qa-evidence/personal-story-recovery-20261024/backup-references.json`. This is an existing QA-only artifact, not a family backup or evidence that missing personal stories were recovered. No browser work is authorized by this protocol until root hands over the final compiled candidate and the existing browser lease.
