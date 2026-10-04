# Memory Match sound preference reload and player-switch check

**Date:** 2026-10-04  
**Frozen origin:** `http://127.0.0.1:5335`  
**Source:** `1410edb79f0105f25a3cbfd5c9a4c7626140ae1d`  
**Candidate identity:** `docs/qa-evidence/batch7-memory-sound-preference-identity-20261004.json`

## Setup

Used a fresh Playwright profile opened at `about:blank`. Installed `**/api/voice` and `**/api/story` route guards and verified them before first navigation, after navigation, and at the final check. Used the visible sound and player controls; no storage or other state injection was used.

## Results

- **1280×800 reload:** initial sound-on control was “Turn sound off.” After clicking it, the control changed to “Turn sound on”; reload retained that muted state. Clicking “Turn sound on” changed it back, and reload retained “Turn sound off,” confirming sound-on state.
- **390×844 reload:** repeated both transitions. Muted state remained muted after reload, and sound-on state remained on after reload.
- **Amari/Askia switch at 390×844:** selected Amari, muted through the home control, opened the visible player picker, and selected Askia. Askia’s home retained “Turn sound on” (muted). Turned sound on from Askia, opened the player picker, and selected Amari; the welcome screen retained the sound-on state (“Turn sound off” action).
- **Muted Memory action:** while sound was visibly muted, opened Thinking & Play → Memory Match and flipped one ordinary Level 1 card. It revealed “monkey”; the board stayed at 0 pairs and the sound control remained “Turn sound on” (muted). Screenshot: `screenshots/mobile-muted-card-flip.png`.

This verifies the UI preference transitions, reload persistence, and retention across player switching. I did not judge audible output or human listening. The browser exposed no `<audio>` or `<video>` element after the muted flip. The session fetched the local packaged clip `/audio/en/24f14aff-matilda.mp3` twice with HTTP 200 during app start/player flow; no `/api/voice` or `/api/story` request occurred. I cannot attribute those cached local-media GETs to a sound heard during the card flip.

## Identity and runtime checks

All eight HTML, JavaScript, CSS, and image files in the candidate identity record matched their served byte counts and SHA-256 values. Both provider guards remained listed at the end. Console reported zero messages, errors, or warnings. No paid voice/story endpoint call was made. This is a bounded local QA delta; it does not claim audio playback quality, human listening, production behavior, or full 4.5 acceptance. The underlying Memory game and art were not retested here; the unchanged candidate baseline is separately documented in `batch7-memory-final87-independent-20261004/report.md`.
