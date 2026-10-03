# Batch 3 final package: keyboard rewind and native narration delta

Date: 2026-10-03
Frozen candidate: `http://127.0.0.1:5243`
Source SHA: `8c9fd6e91ad640595d9986fc0d519e242d30d731`
Identity: [`batch3-final-package-identity-20261003.json`](../batch3-final-package-identity-20261003.json)
Scope: Narrow final keyboard direction/classification delta and native packaged playback/cancellation in Count the Stars, Dino Detective, Letter Trace, and Cosmic Tic-Tac-Toe. Local only.

## Identity, guardrails, and lineage

The final identity records 208 tests passing, full lint and production voice-config build passing, and the canonical voice inventory at 275 ready, 0 invalid, 0 missing. I independently fetched and SHA-256 checked the seven identity assets (`sw.js`, five JS bundles, and CSS); all served hashes matched the identity. Three isolated Playwright sessions used the frozen URL. Before each session's first app navigation, `/api/voice` and `/api/story` were routed; no non-static or provider requests were observed. Packaged clips were loaded from the candidate's own origin. Sound was on only in the dedicated audio session and off in the keyboard sessions. No seed, progress, answer, local storage, or hidden guide coordinates were read or injected. The exported log below was downloaded through Grown-ups' visible Download game log control.

This is a chronological delta after the preserved [5219 partial trace report](../batch3-trace-full-local-20261003/report.md), [5223 marker delta](../batch3-trace-marker-local-20261003/report.md), [5231 full Challenge matrix](../batch3-trace-wordchoice-full-local-20261003/report.md), and [5237 keyboard direction report](../batch3-trace-direction-delta-local-20261003/report.md). The 5237 report records the real orange-cursor rewind defect: keyboardRef rewound but the rendered cursor stayed at the high-water position. Candidate 5243 was frozen specifically with the cursor repair. The prior 5231 Challenge 8/8 desktop and mobile pointer results carry forward; unchanged Starter/Growing geometry evidence remains on the previously identified 5215/5223 candidates. This report does not recertify those complete geometry matrices.

## Keyboard direction and classification

### Desktop, 1280×800

A fresh Amari profile entered Letter Trace through visible controls. The canvas was focused directly through the UI (`CANVAS`, role `img`, accessible label `C letter guide. Trace C. Stroke 1 of 1.`). The visible instructions said: “Right or Down moves forward along the guide; Left or Up goes back. Press Space at the end to finish the stroke.” With Space to begin, visible Right presses moved the orange marker forward. Left and Up presses moved it back along the visible guide; the screenshots preserve the start, forward, Left/Up return, and endpoint positions. Forward key presses to the visible endpoint followed by Space showed 100% traced, enabled Check shape, and the held success explanation. Next letter advanced to round 2 (`M`). Back opened “Leave the game?”; Keep playing retained round 2. Back to world and reload returned through the normal UI; the Trace map showed `0 chapters earned · 0 letters independently mastered` because this profile had not completed the chapter.

### Mobile viewport, 390×844

A separate fresh Amari profile showed the same visible help and focused canvas (`CANVAS`, role `img`, accessible I guide label). `document.documentElement.scrollWidth` was 390px. Space began stroke 1 of the three-stroke I. Right moved the orange marker to the visible endpoint; Up moved it back to the start. Space at the incomplete start left progress at 0% and Check shape disabled. Forward movement and Space completed stroke 1 (33%); the next Space/Down/Space sequence completed stroke 2 (66%) without clearing the completed first stroke. The final visible stroke reached the endpoint, Space showed 100%, then Check shape held “You followed the letter. Great tracing!” until Next. Screenshots in `screenshots/` preserve the focused help, forward/back cursor states, and intermediate multi-stroke progress.

These were browser pointer/keyboard interactions at a mobile viewport, not a physical touch-screen test. The older 5237 rewind failure remains preserved as a real prior-candidate regression; candidate 5243's visible cursor now tracked both forward and reverse motion at both widths.

### Actual Grown-ups export

The ordinary downloaded `amari-game-diagnostics.json` is preserved verbatim. Its keyboard `learning_attempt` records `correct:true`, `firstAttempt:true`, `keyboardAlternative:true`, `independent:false`, `masteryEligible:false`, `handwritingMastery:false`, and `unassistedFirstTry:false`. Grown-ups showed 0 Secure and 0 Practising. The keyboard alternative completes a trace without awarding independent handwriting mastery.

## Packaged playback and cancellation

Native playback was verified by observing calls to the unchanged `HTMLMediaElement.play()` and native `play`, `playing`, `timeupdate`, `pause`, and `ended` events; `currentTime` advanced on each game clip. The observations and clip durations are preserved in [`native-audio-observations.json`](native-audio-observations.json).

- **Letter Trace:** Hear the tracing instruction played a 5.108-second same-origin MP3. Leaving the exercise reset it to 0 and emitted `pause`.
- **Count the Stars:** Hear instructions played a 1.997-second clip. Repeating Hear instructions reset/paused the first clip and started a second play. The visible clue rendered and remained while the round stayed at 1 of 6. Reload returned to the Star Garden selection; the fresh round was available with no counted objects.
- **Dino Detective:** Jungle Jive's instruction and Read clue both played packaged same-origin clips. Read clue stopped the previous play and started its own. The clue and Show a clue feedback were rendered visibly. Leave modal Keep playing retained Find 1 of 5; Back to world and reload returned to the Explore & Languages world without a solved search.
- **Cosmic Tic-Tac-Toe:** Show hint played native audio; repeating it replayed. The visible hint identified the target square, which was selected through its normal accessible gridcell. The success explanation remained held with Next tactic board; Next opened board 2 of 3. Keep playing retained the board and hint. Leaving the board returned to the map, and reload preserved 1/3 solved. This dedicated synthetic audio profile therefore earned one hinted board and one star; no other answer or board was completed.

Sound was audible-enabled for the native playback session. Telemetry proves browser media playback and cancellation; no human listening review was performed. This is not complete subjective narration acceptance.

## Console, layout, and release boundary

Desktop, mobile, and audio sessions ended with zero console errors and warnings. Mobile keyboard layout had no horizontal overflow. The final candidate's offline inventory and build checks are recorded in its identity; this report makes no production, 4.5, or human listening acceptance claim.
