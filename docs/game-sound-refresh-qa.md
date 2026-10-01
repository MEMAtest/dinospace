# Game sound refresh: independent QA

Date: 1 October 2026. No product files changed. Browser session was isolated as `luna_sound_refresh` / `luna_sound_final`; no app state was injected.

## Candidate identity and scope

- Frozen local candidate 5280: JavaScript `index-DHKB01hu.js`, CSS `index-BH3dde_v.css`.
- Final immutable local candidate 5281: JavaScript `index-CVuvpshR.js`, CSS `index-BH3dde_v.css`. The only runtime delta from 5280 is scheduling each note's initial gain floor at its own `startAt`, for the intended 18 ms attack. The subsequent test-only optional-call audit did not change runtime behavior.
- This is local candidate evidence, not production evidence. Production still requires the later canonical deployment identity check.

## Actual UI checks

- Fresh load had zero `AudioContext` constructions before interaction. Choosing Amari created one running context after the first user gesture. Its welcome cue connected oscillators through a gain node and compressor to the destination.
- On 5280, completed a five-question Starter Continents & Oceans run. Wrong Antarctica on the Africa question showed a clue; Africa then succeeded. On the east question, Left showed a clue; Right succeeded. Completed the remaining questions using their visible prompts and answers. `Next question` reached the finite completion screen and awarded the Starter map badge.
- On 5281, repeated wrong and correct answer actions with native AudioContext observation. A wrong answer followed by an immediate mute suppressed the queued wrong cue. With the success cue active, toggling mute 35 ms after the correct-answer action canceled scheduled master-gain values, set the master gain to zero, and rescheduled stop on all three success oscillators at the current audio time. All three emitted `ended` within about 5 ms, instead of playing their planned tails. While muted, the next round produced no additional oscillators. Re-enabling sound and answering the next question produced the success cue again.
- Switched to Askia and played Count the Stars through two counted-object rounds. The UI advanced the session progress meter to value 3; correct answers generated the success arpeggio. This was a bounded progress check, not a full level-completion run.
- Console showed zero errors and warnings in the final candidate session.

## Native Web Audio observations

The observer wrapped browser-native constructors and node/AudioParam methods, then called the original methods unchanged. It recorded execution and scheduled values; it did not stub audio or change the game state.

- Wrong cue: 440 Hz sine at gain 0.07, then 349.23 Hz triangle at gain 0.065.
- Success cue: 523.25 Hz sine, 659.25 Hz sine, and 783.99 Hz triangle, each at gain 0.12. In the final candidate, the notes began at 0, 95 ms, and 190 ms; each gain floor was scheduled at the matching note start, with the attack endpoint 18 ms later.
- The final-candidate completion screen was observed after a full run on 5280; I did not independently attribute a separate completion cue to that screen in this browser pass. The source tests confirm a distinct completion-cue plan. The root also rendered that cue plan with an offline audio sampler, which does not prove that a completion UI action triggers it.
- No physical speaker recording or listening assessment was made. These are Web Audio scheduling measurements, not a claim about the sound as heard on a particular device.

## Alias and automated checks

The frozen test suite passed 110 tests, lint, and build (reported by the builder). The sound tests check that every statically called `playSfx` name, including optional calls, has a cue definition; preserve the legacy cue names; keep cues small and bounded; check rising success/completion plans; and verify coalescing behavior. Unknown names resolve to no cue, while a known cue in the same batch is retained. I did not invoke an unknown SFX alias through a hidden app function in the browser.

## Result

**Pass for the final local candidate; ready for canonical deployment confirmation.** Core controls, delayed-note gain timing, mute cancellation, silent behavior while muted, re-enable, progress, wrong/success cues, and visible finite completion were observed. Audio quality is described only from the measured signal plan; the browser did not provide physical audio capture.


## Canonical production confirmation

Verified after a fresh load of `https://dinospace-eight.vercel.app/` on 1 October 2026. Deployment `dpl_7mvY5HPtQ6mMBvmEnPVddGumThyn`, SHA `aeea9e7167d9beb1c52e11e3b6643cb330975bc6`; the browser loaded JavaScript `index-D6fYZHfF.js` and CSS `index-BH3dde_v.css`.

Before any gesture, the native AudioContext observer recorded zero constructions. Selecting Amari created one running context. In Curriculum Quest, actual UI choices exercised a wrong Antarctica response to the Africa prompt, which showed the map clue and emitted the gentle 440 Hz sine + 349.23 Hz triangle cue; choosing Africa showed the success fact and emitted the 523.25 / 659.25 / 783.99 Hz arpeggio. Muting 35 ms after the correct action set master gain to zero, canceled scheduled gain automation, and rescheduled all three oscillators to stop at audio time 51.653 s. All three ended by 51.659 s; their later planned stops were at 51.851 / 51.946 / 52.041 s. A subsequent Next question while muted added no oscillators. Turning sound back on and answering Asia generated the three-note success cue again.

The browser console reported zero errors and warnings. This is the requested narrow production controls check; it is separate from the local full-flow evidence above. No microphone, speaker loopback, or physical listening assessment was used.
