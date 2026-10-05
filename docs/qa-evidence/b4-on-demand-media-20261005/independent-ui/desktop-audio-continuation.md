# B4 desktop native-media continuation

## Identity and boundaries

- Candidate: source `17bec08db5ad32e2c46ccdffaf40a5a757243e3c`, local origin `http://127.0.0.1:5400/`, frozen build `dist-on-demand-media-20261005-r5` (11,054 files; manifest SHA-256 `4afdf9b48b36bd1d8ff4cf020c28cc730be063441b7d039a32c7a046009a6d45`). See adjacent [`identity.json`](../identity.json).
- This adds a 1280×800 desktop runtime-media observation for Addition, Subtraction and Number Line Jump to the earlier report's mobile checks. It is not a gameplay-matrix rerun.
- I reused the existing dedicated Chrome tab. `/api/voice` and `/api/story` were confirmed as 403 routes before entering Maths and remained installed after reload. The visible sound preference was restored to muted after the samples. No provider/story calls, injected storage, hidden answer reads or human-listening assessment.

## Observations

A passive observer wrapped `HTMLMediaElement.play()` and `pause()` in the existing page, delegated both methods unchanged, and recorded local media events. Events included successful `play()` resolution, `loadedmetadata`, `canplay`, `playing`, `ended`, and interruption `pause` calls. The browser request log showed same-origin `/audio/en/*.mp3` range responses (206); no remote media host was contacted.

| Game | Visible prompt and ordinary controls | Runtime evidence |
|---|---|---|
| Addition Adventure | At 1280×800, “Put 2 shells and 4 shells together. How many altogether?” I chose visible 8 and received “Count both groups, then count on.” I then chose visible 6 and held “2 shells and 4 shells make 6 altogether.” With that correct feedback held, I activated “Hear question” and immediately used “Next question.” | Local clip `74505452-matilda.mp3` loaded and played for 1.068 s. On the held-answer Hear/Next sequence, `pause-call` was recorded at 0.002 s, followed by a new clip `9b6b487b-matilda.mp3` for the next prompt. Other local clips were loaded during the prompt and feedback sequence; this is evidence of runtime media dispatch only, not a judgement of the spoken content. |
| Subtraction Station | At 1280×800, “There are 8 flowers. Take away 6. How many are left?” I selected visible 4, received “Look at the marked objects. Count the ones that remain,” then selected 2 and held “Start with 8. Take 6 away. 2 remain.” With the result held, I activated “Hear question” and immediately used “Next question.” | Local clip `bbcb77de-matilda.mp3` loaded and played for 1.393 s. On the held-answer Hear/Next sequence, `pause-call` was recorded at 0.004 s, followed by `96a047de-matilda.mp3` for the next prompt. Other same-origin clips loaded during prompt and feedback. |
| Number Line Jump | At 1280×800, the visible mission was “Start at 9. Hop 9 back. Where do you land?” I activated “Hear mission,” then “Back,” and confirmed “Back to world.” | Local clip `6d80a6e0-matilda.mp3` loaded and played; the confirmed departure recorded `pause-call` at 0.368 s of its 1.115 s duration. The app returned to Maths Missions. A second startup clip `15415633-matilda.mp3` also played. |

The observed native-file requests were `206 Partial Content` responses, consistent with browser media range loading. No request to either guarded endpoint appeared. After the run, the console reported zero errors and zero warnings. The button was set to “Turn sound on” (muted), then the same page was reloaded; the world route and muted preference remained, and the observer wrapper was cleared. The route guard list remained `/api/voice` 403 and `/api/story` 403.

## Harness note and limits

A preceding observer attempt (before the clean reload used for these samples) incorrectly treated an event object as a media element and produced three harness console errors. That wrapper was removed by reloading the same tab before this continuation; the corrected observer caused no console errors. Those three earlier errors are a QA-instrumentation mistake, not an app finding.

The observed filenames did not match any of the 47 keys in the supplied corrected-grammar readiness ledger, so this run does not certify corrected-47 playback. Runtime events prove local clip loading/playback and cancellation only; they do not establish pronunciation, pacing, audio quality, or human listening acceptance. Full mechanics and earlier mobile evidence remain in the parent report.
