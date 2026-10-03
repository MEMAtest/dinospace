# Sky Shapes packaged narration controls — 2026-10-03

## Scope and candidate identity

Bounded runtime check of the frozen local candidate at `http://127.0.0.1:5203`; not production acceptance. Candidate source is `ead5a1d60d2ad5e2cacefc4cbcecb0aee7cec630` (complete-corpus identity record: [`batch2-complete-candidate-identity-20261003.json`](../batch2-complete-candidate-identity-20261003.json), 1,371 matched clips, no mismatches). The loaded files were `index-DZuRTFaZ.js` (SHA-256 `d63a6423477fd3cda6d2e9f66d15eefafc6a693e6039865a79b1f59cc534d85c`) and `index-CU-OkS6z.css` (SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`).

Both browsers were fresh isolated sessions. Before the first navigation, each installed abort guards matching `**/api/voice**` and `**/api/story**`. No injected seeds, answers, progress, or fake audio were used. The starter flights were completed by actual pointer traces through the visible tracing board. The app's own diagnostics were downloaded through its visible Download game log button and saved with unique paths using Playwright's `download.saveAs`.

The earlier active-fact Back proof remains a separate lineage: it was captured on source `56e8ad61f41aa61b0668c3d1ae35970e2bc5e051` at port 5201 and is documented in [`sky-spoken-facts-20261003/qa-report-20261003.md`](../sky-spoken-facts-20261003/qa-report-20261003.md). It is not combined with the 5203 source evidence here.

## Desktop — 1280 × 800

- UI diagnostic export `desktop-ui-diagnostic-export-20261003.json` identifies game `jet`, starter seed `3291063970`, and first-attempt `answer_correct`; a second ordinary Starter flight was used for the mute control, without completing the band.
- Mountain Peak completion displayed “Shape idea: A triangle has 3 straight sides and 3 corners.” Native media events record the authored completion praise `ef380652-matilda.mp3` playing for 4.040 s and naturally ending, then the matching authored fact `b57c84aa-matilda.mp3` playing for 2.926 s and naturally ending. The fact has one `playing` event in the saved trace. The earlier `1029770e` and `aaf81fc2` entries in the same fresh-session log map in the packaged corpus to the sky-selection narration (“Choose a sky…”) and Mountain Peak mission prompt (“Sky 1. Trace the Mountain Peak…”); they are pre-flight narration, not completion segments.
- Round Sun completion displayed “Shape idea: A circle is one smooth curve. It has no corners.” Praise `75af60ea-matilda.mp3` naturally ended (4.412 s); fact `d9a1e08e-matilda.mp3` began (3.483 s). Clicking **Turn sound off** generated a pause call at about 0.047 s and a native `pause` at 0 s with `ended=false`. No further `playing` segment occurred while muted. **Turn sound on** followed by visible **Hear mission again** started packaged prompt `37504663-matilda.mp3` (4.272 s), demonstrating explicit re-enable/replay.
- Keep-playing check used visible **Hear mission again**. Prompt `5e00ba97-matilda.mp3` reached native `playing` (duration 4.133 s); in the same Playwright invocation, **Back to learning world** opened the leave dialog and **Keep playing** dismissed it. At the immediate post-action check, about 0.55 s after `playing`, there was no `pause` or `ended` event. The saved full event log shows that clip later ended naturally at its full 4.133 s, distinguishing continuation from a suppressed event.

## Mobile — 390 × 844

- UI diagnostic export `mobile-ui-diagnostic-export-20261003.json` identifies game `jet`, starter seed `693263565`, and first-attempt `answer_correct`.
- The completed Mountain Peak UI displayed “Shape idea: A triangle has 3 straight sides and 3 corners.” Praise `ef380652-matilda.mp3` played for 4.040 s and naturally ended; fact `b57c84aa-matilda.mp3` began (duration 2.926 s). **Turn sound off** paused the fact at about 0.014 s with `ended=false`; it was the last segment, and no further segment played while muted. **Turn sound on** plus **Hear mission again** started prompt `5e00ba97-matilda.mp3` (4.133 s).
- For Keep playing, after that prompt reached native `playing`, the same run-code invocation clicked **Back to learning world** and **Keep playing**. The modal was dismissed and no `pause` or `ended` event appeared in the immediate ~0.55 s check; the saved event trace later records natural end at the full 4.133 s.

## Network and limits

Saved static request inventories show app assets and packaged clips served from `127.0.0.1:5203`; no `/api/voice` or `/api/story` request is present. The broad abort guards were installed before the first app navigation. There were zero console errors and zero warnings in either session. Packaged clips had successful local HTTP responses (200 or byte-range 206).

This verifies UI sequencing, native media element events, mute pause, re-enable/replay, and short-window Keep-playing continuation on this local candidate. It does not establish that anyone heard the clips, audio quality/prosody, production behavior, 5×5 controls, or overall quality/acceptance. No external provider request was made.

## Artifacts

- `desktop-ui-diagnostic-export-20261003.json`, `mobile-ui-diagnostic-export-20261003.json` — actual UI downloads saved via `download.saveAs`; unique filenames despite the app's shared suggested name.
- `desktop-media-events-20261003.json`, `mobile-media-events-20261003.json` — read-only native media events and local performance resource inventory.
- `desktop-requests-20261003.txt`, `mobile-requests-20261003.txt` — dynamic request logs.
- `desktop-requests-static-20261003.txt`, `mobile-requests-static-20261003.txt` — static and packaged audio responses.
- `desktop-console-20261003.txt`, `mobile-console-20261003.txt` — browser console summaries.
