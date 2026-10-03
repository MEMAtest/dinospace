# Monster Math preview runtime delta — independent QA

**Date:** 3 October 2026. **Scope:** bounded Vercel preview runtime checks for the identified candidate only. This report does not certify production, physical-device behavior, speech intelligibility, or a 4.5 score.

## Candidate and method

The frozen preview identity and pre-check served asset hashes are recorded in [`identity.txt`](identity.txt). Fresh isolated Chrome contexts began at `about:blank`: desktop 1280×800 and mobile 390×844. Broad voice and story API abort guards were installed before first navigation. No answers, seeds, unlocks, profiles or progress were injected. The normal Amari profile and visible Monster Math/Starter UI controls were used.

The app uses detached native `Audio` objects. A page-level capture listener was installed before navigation; for subsequent playback checks, I attached native event listeners to objects returned by a pass-through wrapper around the browser's original `Audio` constructor. The wrapper did not fake audio or change its source. Setup details are in [`pre-navigation-setup.md`](pre-navigation-setup.md); full event traces are in [`desktop-native-media-events.json`](desktop-native-media-events.json) and [`mobile-native-media-events.json`](mobile-native-media-events.json).

## Starter UI result

Each context started a normal Starter run and sampled its first count question. The actual diagnostic seeds were desktop `577101011` and mobile `3659342194`.

| Viewport | Visible question and accessible picture names | Wrong answer → clue → correct answer |
|---|---|---|
| Desktop 1280×800 | “How many crystals can you see?” One visible picture exposed as `img "crystal"` inside neutral `group "Counting pictures"`. | Selecting 2 showed gentle retry copy. After “Show me a clue,” selecting visible answer 1 produced “There is 1 counter.” and “There is 1 crystal.” The result remained held with enabled **Next question**. |
| Mobile 390×844 | “How many shells can you see?” One visible picture exposed as `img "shell"` inside neutral `group "Counting pictures"`. | Selecting 5 showed gentle retry copy. After “Show me a clue,” selecting visible answer 1 produced “There is 1 counter.” and “There is 1 shell.” The result remained held with enabled **Next question**. |

The actual UI diagnostic downloads record the intentional wrong attempts with `firstAttempt: true`, then a clue event, then the correct selections with `firstAttempt: false`. The clue-assisted answers are therefore not counted as first-try correct. The exports were saved from visible Grown-ups → Game troubleshooting → Download game log browser download events using `download.saveAs`: [`desktop-game-log.json`](desktop-game-log.json), [`mobile-game-log.json`](mobile-game-log.json). They capture the answer/clue sequence and the subsequent Next/leave events; a later visible Starter reentry used only to observe automatic prompt playback is retained in the native media traces, not these two earlier diagnostics exports.

Screenshots preserve pre-answer AX/pictures, wrong feedback, clue, correct held feedback, native-prompt playback, and the confirmed Back dialog for each viewport. See the `desktop-*.png` and `mobile-*.png` files beside this report.

## Packaged playback and interruption

The visible first question and replay control used packaged local Matilda clips. The event traces include native `play`, `loadeddata`, `playing`, `timeupdate`, `pause` and `ended` events; request inventories show local `/audio/en/*.mp3` range responses. On a naturally started second Starter run, the initial question prompt also produced native `play` → `loadeddata` → `playing` events at both widths. These observations establish browser playback mechanics only. I did not judge what the clips sounded like.

At both widths:

- Replaying while sound was enabled reached native `playing`, then `ended` when allowed to finish.
- Muting an actually playing replay generated `pause`; no media remained active. Turning sound back on did not emit another `playing` event for that stale clip.
- After the correct held result, starting a replay and activating **Next question** paused the old prompt before the new question prompt played. The new visible question advanced once.
- On Question 2, a replay was actively `playing` when I chose **Back to learning world**. The confirmation dialog appeared while the audio object was still active. Confirming **Back to world** paused that clip, left no active media, and returned to the exact Maths Missions route (`#/world/maths`, heading “Maths Missions”). Switching sound off and on there did not revive the stale clip.

This is a narrow preview interaction check; it is not a full episode or full application test.

## Network and console

Both console captures report zero messages, errors or warnings. Request inventories show the expected preview JS/CSS and local packaged assets; local speech clips returned `206` range responses. The API-filter inventories are empty; voice and story guards were active before the first navigation. No provider call, paid narration call, or generated story request occurred during this test.

## Boundaries

This verifies only the served preview identity `37bd0a3…`. A successful local packaged-media event sequence does not establish human listening quality. This is not a canonical production deployment check, physical-device check, complete Monster band run, or overall 4.5/5 acceptance.
