# Batch 2 packaged audio preflight — 3 October 2026

## Scope

This is a local audio-integration snapshot, not a production release or editorial acceptance. Source base is `539e1e0`, including the already committed narration hook/builders and worker-generated uncommitted voice manifest/assets. The finite background worker continues; no generated files were staged or deployed. The snapshot directory is `/tmp/dinospace-batch2-audio-snapshot-20261003`, served at `http://127.0.0.1:5195`.

- JS `index-ClpA5Rt-.js`: SHA-256 `a7732dbda18e3472b3b1cfddd0b044711f4cf62bbe392bdc384c00f006900e8c`.
- CSS `index-CPZQTFam.css`: SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`.
- Build passed. This frozen bundle will not change as the worker adds clips.

## Physical clip checks

The ready corpus comprises Puzzle Pop 73 clips, Spot the Difference 55, and Sky Shapes 39. All 167 previously passed full FFmpeg decoding. The frozen snapshot's 167 clips also passed signal screening: finite mean and peak levels, mean above -45 dB, and peak below full scale. Mean levels range from -25.0 to -18.8 dB. Each measured clip has a retained hash and authored text in [the signal report](qa-evidence/batch2-audio-signal-levels-20261003.json). These thresholds screen silent/corrupt/full-scale audio; they do not certify perceived volume, wording, intelligibility, pronunciation or prosody.

## Open gates

Independent actual-control playback, replay, hint/fact, next/cancellation and mute checks at desktop and 390px are underway for these three games. Native media events and successful requests are runtime proof only, not listening proof. Monster Math still requires 433 missing clips at this checkpoint, followed by packaged-sequence runtime and audible joins/prosody checks. Complete corpus readiness, audible review, exact production release and production playback deltas remain required. The accepted count is 4/26.

## Restored QA snapshot and resumed worker

At the next goal continuation the prior worker PID 27199 was absent on repeated process checks; execution handle 36845 was also unavailable. The log ended during run 31 without a terminal reason. Cause is unproven. Read-only readiness found 405 missing clips, with all generated files preserved. No generator child or lock remained. Root resumed the existing generator using a detached worker PID 4108 and the same request journal/30-call ten-minute cap. `--max-runs=169` preserves the previous remaining run allowance rather than resetting to 200. The script now accepts this bounded override, rejects values outside 1–200 before writing or calling services, and passed syntax validation plus a zero-value rejection check. The resumed worker completed two passes and checkpointed 375 missing clips.

The previous `/tmp` snapshot was missing and independently returned HTTP 404; those initial runtime attempts performed no browser navigation and provide no playback proof. Root rebuilt source `b93ebd7` plus the current generated manifest into workspace `tmp/batch2-audio-snapshot-20261003-0640`, served on the same port 5195. Runtime testers received this new identity:

- JS `index-Dmr-JKNn.js`: SHA-256 `b32ececc238e237cad75666c7006217f9650a678f2cf0fe07db316b46a459e25`, served HTTP 200.
- CSS remains `index-CPZQTFam.css`, unchanged hash.

The rebuilt snapshot differs by generated-manifest coverage; gameplay/narration hook source is unchanged. It remains local, frozen and incomplete for Monster. Historical `/tmp` measurements retain their own identity; no attempt is made to label them as the new runtime build.

## Reproduced exit defect and repaired candidate

Independent Sky UI testing of the restored `index-Dmr-JKNn.js` snapshot reproduced narration continuing after confirmed navigation back to Creative Lab. A 4.272-second packaged replay started at 06:47:41.460 UTC; the route changed within approximately 0.4 seconds, while the same audio reached its natural end at 06:47:45.790. This is a failed exit gate. Opening a leave dialog alone is not navigation and should preserve audio if the child cancels it; a Spot attempt that confirmed after its clip had already ended was not counted as an exit-leak reproduction.

Source repair `70108cb` exposes the existing narration cancellation function and runs it during route/player cleanup before the destination starts narration. It also guards packaged playback callbacks against a cancelled generation: a controlled delayed-autoplay-rejection test first reproduced two gesture listeners being re-armed after cancellation, then passed after the guard fix. The tests use a fake media element only for this timing race; they do not serve as actual browser playback proof. Full Node suite: 162/162. Lint/build passed.

New frozen LOCAL candidate is workspace `tmp/batch2-audio-exit-fix-20261003`, served at port 5196:

- JS `index-YAjCSdc_.js`: SHA-256 `f79f3b88a7bbb16a86c9a42c04deb3b4634ff139e492176c2d0b1df110f8b8c3`.
- CSS remains `index-CPZQTFam.css` with its recorded unchanged hash.

Independent confirmed-Back, cancelled-leave, replay, next and mute deltas are underway at both widths. This repair is not deployed; canonical production still runs `6b84554`. Packaged narration completion, audible review and production audio evidence remain required.
