# Puzzle Pop and Spot the Difference: packaged narration runtime QA

Date: 2026-10-03
Scope: local frozen bundle runtime only; no deployment or production acceptance.

## Decision

**Runtime GO for the tested local flows and fixed cancellation delta.** This is bounded to the exact game, viewport, and interaction combinations below. It does not certify complete gameplay/audio coverage, production behavior, or what a child hears. The old snapshot reproduced narration continuing after confirmed navigation; the fixed local candidate paused the active clip promptly after confirmed navigation in desktop checks. The candidate’s mobile Spot “Keep playing” flow preserved both route and an actively playing clue.

**Production audio acceptance: UNVERIFIED. Intelligibility/prosody: UNVERIFIED.** Native media events, successful HTTP responses, clip decoding/level screening, and on-screen text are not evidence of perceived sound, pronunciation, intelligibility, or prosody. No listening claim is made.

## Snapshot identities

| Snapshot | Bundle | Result and scope |
|---|---|---|
| Restored older local snapshot, `http://127.0.0.1:5195` | `index-Dmr-JKNn.js`, SHA-256 `b32ececc238e237cad75666c7006217f9650a678f2cf0fe07db316b46a459e25`; CSS `index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459` | Gameplay/runtime checks below. The independent Sky tester reproduced route-exit narration continuing on this older identity after confirmed Back, as recorded in the preflight; that defect is not attributed to this subagent’s naturally-ended older-build attempts. |
| Repaired local candidate, `http://127.0.0.1:5196` | `index-YAjCSdc_.js`, SHA-256 `f79f3b88a7bbb16a86c9a42c04deb3b4634ff139e492176c2d0b1df110f8b8c3`; same CSS SHA as above | Fixed-cancellation candidate. Based on source `70108cb` plus generated manifest snapshot. Not deployed. |

Before first navigation, fresh isolated browser sessions blocked `**/api/voice**` and `**/api/story/**`. Browsing and interactions used visible controls only; no answers, seeds, or progress were injected. Network exports show packaged audio/static requests and no voice/story API calls. The candidate console export reports zero messages/errors/warnings.

## Runtime matrix

| Bundle | Game / viewport | Actual visible-control checks and observed result |
|---|---|---|
| Older (`b32ececc…`) | Puzzle Pop, desktop | Start/replay packaged prompt, hint-led piece placement through a full 2×2 picture, scene fact, Next picture. Replay while playing stopped/replaced the previous clip without stale overlap. The Back attempt confirmed only after the clip naturally ended, so it is **not** evidence for or against exit cancellation. |
| Older | Puzzle Pop, 390×844 | Replay prompt, visible Hint-guided completion, fact and Next picture. Mute then replay produced no new Audio object. Screenshot shows board/card controls within the mobile layout; vertical scrolling is expected. |
| Older | Spot the Difference, desktop | Start packaged prompt, Hear clue, Magnifier guidance, visible hotspot solving through completion, fact and Next pair. |
| Older | Spot the Difference, 390×844 | Hear clue from visible control produced packaged MP3 playback. Mute then Hear clue produced no new Audio object. Mobile picture stack fits viewport width; lower content uses vertical scrolling. The older-snapshot Back confirmation attempt was after natural clip end and is not counted as cancellation evidence. |
| Fixed candidate (`f79f3b88…`) | Puzzle Pop, desktop | Confirmed Back during a visible replay. Route changed to `#/world/creative`; active packaged clip id 4 (`546b2307-matilda.mp3`, 8.27 s) paused at 0.00 s about 147 ms after play, with no natural `ended`. |
| Fixed candidate | Spot the Difference, desktop | Confirmed Back during start narration on two attempts. Route changed to `#/world/thinking`; active packaged clip ids 6/8 (`aa85af47-matilda.mp3`, 5.85 s) paused at 0.00 s about 113–131 ms after `playing`, before natural end. |
| Fixed candidate | Puzzle Pop, 390×844 | Start chapter played id 12 (`047ccc1a-matilda.mp3`, 7.99 s); confirmed Back while playing. Route changed to `#/world/creative`; clip paused at 0.00 s ~418 ms after `playing`, before natural end, and remained paused after 900 ms. |
| Fixed candidate | Puzzle Pop, 390×844 | Separate Start chapter → open leave dialog → Keep playing check. Route stayed `#/play/puzzle`; id 13 (`546b2307-matilda.mp3`, 8.27 s) was still playing 900 ms after the choice, with no pause/end. |
| Fixed candidate | Spot the Difference, 390×844 | Opened the actual leave dialog and read the UI: heading “Leave the game?” with controls “Keep playing” and “Back to world.” Hear clue started `61fb1c94-matilda.mp3` (4.69 s); while it was playing at 0.01 s, confirmed Back. Route changed from `#/play/spot` to `#/world/thinking`; the clip paused at 0.00 s ~202 ms after `playing`, before natural end, and stayed paused after 900 ms. A separate run clicked Keep playing while another clue was playing; route remained `#/play/spot`, and playback continued for at least 900 ms. |

**Unverified combinations:** fixed-candidate replay, hint, completion, Next and mute were not re-run across both games and both widths. The candidate has confirmed-Back and Keep playing checks for both games at 390×844 and confirmed-Back checks for both games at desktop; those lifecycle checks do not replace the unrun interaction matrix. No complete 12-scene narration matrix was repeated.

## Editor assessment (provisional, not a score)

The retained full production-baseline report documents all three Puzzle Pop bands completed at desktop and mobile, with 2×2, 3×3 and 5×5 objectives, scene-specific facts, rewards/unlocks, and different replay orders. Spot the Difference likewise has all three bands completed across both viewports, increasing 3/5/7-change objectives, magnifier clues, completion facts/rewards, and observed scene-order variation. Plain instructions, visible feedback, short scene facts, and progressive challenge support an age-six learning experience; the current runtime checks show those text and interaction affordances alongside packaged prompt/clue flows.

Current mobile evidence at 390px shows vertical scrolling without observed horizontal overflow. Spot’s image pairs stack; the leave confirmation exposes two clear actions. Puzzle’s title/subheading can truncate the scene label on narrow screens, while the main prompt/fact remains visible. The initial full production acceptance recorded one Puzzle Pop manually selected wrong piece/space pair consuming a move without explicit feedback. That historical observation is retained, but the later `6b84554` production repair delta ([report](../../batch2-production-repair-delta-20261003.md)) explicitly rechecked quick and final wrong→correct placements at desktop and mobile: retry guidance appeared, correction replaced it, and delayed follow-up states retained the expected success/completion fact. On that newer evidence, the previously suspected wrong-space recovery gap is superseded/closed for the tested cases; no remaining fix is identified from it. This provisional editorial assessment does not establish audio quality, production audio acceptance, or a 4.5 rating.

## Evidence

- Older snapshot screenshots, media events, network/console logs and uniquely named UI diagnostics export are in this directory: `native-media-events-older-0640.jsonl`, `network-older-0640.txt`, `console-older-0640.txt`, `amari-game-log-ui-export-older-0640.json`.
- Fixed candidate screenshots/logs: `repaired-70108cb/puzzle-confirmed-back-desktop.png`, `repaired-70108cb/spot-mobile-leave-modal-labels-70108cb.png`, `repaired-70108cb/spot-mobile-confirmed-back-70108cb.png`, `repaired-70108cb/spot-mobile-keep-playing-70108cb.png`, `repaired-70108cb/puzzle-mobile-confirmed-back-70108cb.png`, `repaired-70108cb/puzzle-mobile-keep-playing-70108cb.png`, `repaired-70108cb/native-media-events-70108cb.jsonl`, `repaired-70108cb/network-70108cb.txt`, `repaired-70108cb/console-70108cb.txt`.
- The full production baseline and its viewport/band details are in [batch2-fresh-acceptance-20261003.md](../../batch2-fresh-acceptance-20261003.md); fixed-repair test/source scope is in [batch2-audio-runtime-preflight-20261003.md](../../batch2-audio-runtime-preflight-20261003.md).
