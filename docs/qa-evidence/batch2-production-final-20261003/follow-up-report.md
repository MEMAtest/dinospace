# Batch 2 production acceptance follow-up — 2026-10-03

This supplements `report.md`; the original report and the two on-device diagnostic downloads are preserved unchanged. The follow-up used the existing isolated Playwright profiles at 1280×800 desktop and 390×844 mobile. No source changes or deployments were made.

## Release identity at follow-up start and end

The canonical alias continued to serve `/assets/index-B8F2g6Xc.js` and `/assets/index-CUmO8J4O.css`. Their SHA-256 values matched the committed production identity record at the start and final end check. The record maps the alias to READY deployment `dpl_Yw6eFRkrTbgF7b9hw2oyUdSXJA9W`, source `3cdfc426e91b46a855448690278ceb6590280b68`, runtime-equivalent source `83149d897366dcbe8bc4034849d340ed61a0221d`. Final alias response was served at 2026-10-03 15:19 UTC; Vercel request id `lhr1::tr8hc-1791040766476-cf332848de24`.

## Real media observation method

Before app navigation/reload, both profiles blocked `**/api/voice**` and `**/api/story**`. An observational init script wrapped the browser’s real `Audio` constructor and native `HTMLMediaElement.play()` / `pause()` methods, invoked the original constructors/methods, and attached event listeners for load, play, playing, pause, ended, and error. It did not stub playback or synthesize media events. The app fetched packaged same-origin MP3 files and the browser reported native playback events and fulfilled play promises. No voice/story provider requests were observed or permitted. These checks establish browser playback state, not human-perceived audibility or audio quality.

## Media and navigation gates

Each tested clip returned HTTP 200 from `/audio/en/*.mp3`; native `playing` and resolved play promises were seen. `ended` was recorded for Puzzle replay. The additional cancellation checks cover all four fixed-game routes. Each confirmed Back flow returned to the exact parent world and paused the current Audio object.

| Game | Packaged audio and controls observed | Next / confirmed Back |
|---|---|---|
| Puzzle Pop — desktop | Replay chapter loaded `546b2307-matilda.mp3` (200). Hear instructions replay loaded `97cd6c49-matilda.mp3` (200), played and ended at 5.2477s. Turning sound off during an active replay produced `pause` at 0s; a further 1.2s while muted produced no new events. Turning sound on and replaying produced a new native instance and another `ended`. | While replay clip id 16 was playing, Next paused id 16 and started scene clip id 17 (`e1fda993-matilda.mp3`, 200). Confirmed Back during that prompt paused it and returned to `#/world/creative`. |
| Spot the Difference — mobile | Chapter replay and Hear clue loaded packaged clips `2d910285-matilda.mp3` and `76eb7889-matilda.mp3` (200). Scene completion/Next prompt clips also returned 200. | On a second ordinary Starter replay, the third visible “Check … detail” target completed the pair. Immediate Next paused old clip id 41, started new clip id 42 (`f7b3e40c-matilda.mp3`, 200). Confirmed Back during an active replay paused id 31 and returned to `#/world/thinking`. |
| Sky Shapes — mobile | Starter/Growing/Challenge prompts and “Hear mission again” loaded packaged audio; Challenge replay loaded `8060f730-matilda.mp3` (200). | Next paused Challenge prompt id 25 and started Winged Jet prompt id 26 (`010b840d-matilda.mp3`, 200). Confirmed Back paused id 26 and returned to `#/world/creative`. |
| Monster Math — mobile | Count to 10 question replay and correct-answer narration loaded packaged clips `5c823d3b-matilda.mp3`, `d067b8a7-matilda.mp3` and `b36037d6-matilda.mp3` (200). | After counting the single visible star and choosing 1, Next paused prompt/explanation id 34, started the next question clip id 35, “How many moons can you see?” (200). Confirmed Back paused id 35 and returned to `#/world/maths`. |

## Mobile Sky Shapes delta

The 390×844 profile unlocked the three skies through ordinary play: Cloud Meadow Starter (4/4 flights), Rainbow Ridge Growing (4/4), then Aurora Station Challenge. Each newly loaded band showed its green numbered start before input; the plane was absent until Enter and Space were used. Restart returned active progress to zero and retained the numbered start. Document and body widths remained 390px.

All four Starter flights and all four Growing flights were completed with the on-screen keyboard instructions. This included the Growing Cloud House route with its two numbered parts. Challenge load showed numbered starts 1–4, no plane, and the 0/4-part status. Moon Observatory was completed through four parts to a held “Shape idea” fact and Next mission. Winged Jet was then completed through three parts to a second held fact (“The airplane uses 3 separate lines for its body, main wings, and tail wings.”) and Next mission. Each has a screenshot in this directory, including `followup-mobile-sky-challenge-next-part.png` and `followup-mobile-sky-challenge-held-fact.png`.

## Remaining boundary

This follow-up closes the previously open native media and mobile Sky delta gates for the tested journeys. It does not claim full completion of the Sky Challenge’s four-mission sky, audible quality, or roadmap 4.5 acceptance. Human listening remains pending. The first report’s existing non-audio gates and limitations remain in force.
