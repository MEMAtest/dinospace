# Sound preference persistence QA — frozen local candidate

Date: 2026-10-04

## Candidate and method

Tested the immutable local candidate at `http://127.0.0.1:5311`, source `c47864404cff1f31c9cefe9b8a363d0ba5542b24`, as identified in [sound-preference-identity-20261004.json](../sound-preference-identity-20261004.json). This report is specific to that local candidate; it is not production evidence.

Started an isolated browser profile on `about:blank`, installed 204 response guards for `/api/voice` and `/api/story`, then navigated to the app. No application state, storage, seed, answer, or unlock data was injected. The browser AudioScheduledSourceNode start and HTMLMediaElement play methods were instrumented before navigation to record native playback attempts; this measures playback events, not human-perceived quality.

## Results

- At desktop viewport, the home control initially read **Turn sound off** (sound enabled). Clicking it changed the label to **Turn sound on** (muted). After reload it remained **Turn sound on**. Clicking again restored **Turn sound off**, and after another reload it remained **Turn sound off**.
- With sound muted, the visible **Turn sound on** state persisted while navigating Amari → player chooser → Askia → Count the Stars and back through the chooser to Amari. This was repeated at 390×844; the toggle remained muted at Askia home and after returning to Amari home. The 390×844 app home document width was 375px, with no horizontal overflow.
- In muted state, ordinary Askia Count the Stars object taps and count response, plus Amari Monster Math **Hear the question again**, wrong answer, and correct answer produced no recorded oscillator starts or media play calls. The probe arrays stayed empty. This establishes that these sampled muted actions did not initiate native audio playback in the browser; it does not establish audible quality when unmuted.
- The browser request log contained only the two guarded API requests (`/api/voice` and `/api/story`, both 204) and static assets. Console reported zero messages, errors, or warnings.
- Independently fetched all seven candidate identity files over HTTP. Each returned 200 and matched its frozen SHA-256 and byte count; see the identity JSON.

## Evidence

- `screenshots/muted-after-reload.png`
- `screenshots/unmuted-after-reload.png`
- `screenshots/mobile-muted-monster.png`
- `screenshots/mobile-askia-count.png`

## Limits and lineage

The canonical Monster Math QA report [monster-header-canonical-20261004/report.md](../monster-header-canonical-20261004/report.md) records the separate canonical observation that the sound toggle reset after reload. This local candidate passed the corresponding two-way reload check and the profile-switch check. No deployment or promotion was performed by this QA. No human listening, narration completeness, or sound-quality acceptance is claimed; the instrumentation only confirms whether native playback was initiated for the sampled muted actions.
