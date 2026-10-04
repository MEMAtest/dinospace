# Monster Math exact-case bounded production sample

**Date:** 2026-10-04  
**Canonical app:** `https://dinospace-eight.vercel.app`  
**Source candidate:** `c47864404cff1f31c9cefe9b8a363d0ba5542b24`  
**Vercel deployment:** `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz` (`READY`, production)  
**Identity evidence:** [`canonical-identity.json`](canonical-identity.json)

## Canonical identity and guard setup

Before app navigation in each new session, I opened `about:blank` and installed CLI route guards for `/api/voice` and `/api/story`, both returning HTTP 403. The route list showed both guards before navigating to the canonical URL. The final filtered browser request list showed no `/api/` requests. I independently fetched and SHA-256 checked the seven files in the attached root identity record against the canonical alias; all seven returned HTTP 200 and matched: `index.html`, the main JS and CSS, and the Count the Stars, Letter Trace, Solar System and web chunks.

The first gameplay attempt began at the player page with the control labeled **Turn sound off**, which means sound was on. I missed that control before starting gameplay. I did not click Hear the question again or Show me a clue, and the route guards remained installed. Static packaged `/audio/en/*.mp3` requests occurred during that attempt (1003 requests in the retained browser list; HTTP 200/206 responses). This run is labeled as an unmuted functional observation; it does not establish playback quality or listening acceptance.

I discarded it as the final muted check and created a second isolated profile. On the fresh profile, the canonical landing page’s **Turn sound off** control was clicked before choosing Amari; the label changed to **Turn sound on**, confirming the muted state. I navigated normally to Maths Missions and Monster Math. That profile showed Counting unlocked and Growing locked. I did not start another Growing sample because the task’s 60-run cap had already been consumed by the first sample. The fresh muted state and map are captured in [`fresh-muted-episode-map.png`](screenshots/fresh-muted-episode-map.png).

## Bounded visible sample

In the first isolated profile, I earned Counting by completing the six ordinary visible count questions, then used the visible episode controls to unlock and replay Growing. A visible-only script is included at [`visible-only-sampling-script.js`](visible-only-sampling-script.js). For each Growing question it read the on-screen equation and numeric answer button labels, calculated from that equation, selected the corresponding visible button, waited for the held response, and advanced through the visible Next/Finish controls. It did not read hidden question data, answers, PRNG state, storage, or inject progress. The loop was capped at 60 Growing runs × 6 questions (360 visible question opportunities).

The exact ordered equation **`2 + 10 = ?`** did not appear within that cap. The observed browser state after the loop was the Growing completion screen showing all six questions complete and 3/3 stars. No pre-answer exact-case screenshot was produced. One visible Growing example (`7 + 5 = ?`) is retained at [`first-profile-growing-q1-visible-model.png`](screenshots/first-profile-growing-q1-visible-model.png); its ten-frame shows seven orange counters and five blue counters, and the answer options are ordinary visible buttons.

## Result and remaining check

The exact `2 + 10` UI case was **not observed in the authorized 60-run sample**. This is not evidence of a product failure. As the mandatory case did not occur, I could not assess its ten-frame rendering, pre-answer state at both viewport widths, clue-once behavior, wrong-answer retry, whether the 12 explanation is singular and held, Next behavior, or mobile control dimensions. Those exact-case controls remain unverified by this bounded run. No defect or acceptance conclusion is inferred from a non-sighting.

**Sampling-record limitation:** the Playwright `run-code` call’s returned row array was not retained in the report workspace when the long command outlived the initial exec wait. The visible-only sampling script and manually captured snapshots remain, but no auditable 360-row JSON of equations, options, selected values, and held feedback exists. The runner configuration was 60 runs × 6 questions and the UI was observed at Growing completion after the process ended; do not use this report to infer addition/subtraction frequency, whether `10 + 2` occurred, or whether any other right operand 10 occurred. The exact-case non-sighting reflects the runner’s lack of a captured target case/screenshot, not a preserved per-question ledger.

The first sample’s sound was on, so no human listening or audio-quality conclusion is made. The second fresh profile confirms the intended muted setup but contains no Growing gameplay because the run cap was reached. No paid voice/story provider request was made, and this scoped functional check does not certify full Monster Math, release acceptance, or an overall 4.5 score.

The fresh muted profile’s console check reported zero errors and zero warnings; its filtered network list showed no `/api/` requests. Both 403 guards were still active at that check. The initial full-sample console likewise reported zero errors/warnings. The browser loaded packaged static audio in the unmuted attempt, so this absence of provider API requests is not a claim that audio was not requested or played.
