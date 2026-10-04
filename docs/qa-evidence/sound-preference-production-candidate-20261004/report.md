# Sound preference persistence QA — immutable production candidate

Date: 2026-10-04

## Candidate identity and setup

Tested candidate URL `https://dinospace-iw0e236dn-memas-projects-23a0001d.vercel.app`, deployment `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`, exact audited archive/source SHA `c47864404cff1f31c9cefe9b8a363d0ba5542b24`. The candidate identity file [sound-preference-production-candidate-20261004.json](../sound-preference-production-candidate-20261004.json) records the READY provider binding and seven asset hashes. This is candidate-specific evidence; the canonical alias was still bound to the earlier `484addf` deployment during this test.

A fresh Playwright profile was opened on `about:blank`. Before the first application navigation, 204 response routes were installed for `/api/voice` and `/api/story`, and an init script instrumented `AudioScheduledSourceNode.start` and `HTMLMediaElement.play` to record native playback attempts. No storage, profile progress, seeds, answers, unlocks, or app state were injected. All profile and game navigation and answers used visible controls.

## Results

- At desktop 1280×800, the fresh chooser showed **Turn sound off** (sound enabled). Clicking it changed the control to **Turn sound on** (muted). After reload, the control still read **Turn sound on**. Clicking again changed it to **Turn sound off**; after a second reload it still read **Turn sound off**.
- Muted state then persisted in normal UI navigation from Amari to Askia at desktop and at 390×844, and after switching back to Amari at mobile. Both profile home controls continued to read **Turn sound on**. The mobile Askia home had a 390px document width at 390px viewport; Amari home had 375px document width at 390px viewport. No horizontal overflow was observed on those pages.
- In muted Askia Count the Stars, the visible two-object counting round was counted and answered correctly. In muted Amari Monster Math, **Hear the question again** and a wrong then correct answer were used on the visible ten-planets question; the correct result remained held with **Next question**. `AudioScheduledSourceNode.start` and `HTMLMediaElement.play` remained uncalled throughout the sampled muted actions (`starts: []`, `media: []`). This verifies no native browser playback was initiated for these muted samples; it does not establish unmuted sound quality.
- The Playwright request log contained only candidate static asset requests and no `/api/voice` or `/api/story` request. The guards were installed before navigation, but no API request reached a guard, so there were no intercepted API attempts to report. No paid provider call was made or observed.
- The final browser console had zero messages, errors, or warnings. Independently fetched all seven listed candidate files; all returned HTTP 200 with byte counts and SHA-256 hashes matching the frozen source identity.

## Screenshots

- `screenshots/desktop-default-enabled-selector.png`
- `screenshots/desktop-muted-monster.png`
- `screenshots/mobile-askia-muted.png`
- `screenshots/mobile-muted-monster.png`

## Scope limits and lineage

The corresponding independent local candidate report is [sound-preference-5311-local-20261004/report.md](../sound-preference-5311-local-20261004/report.md), which also passed the persistence and profile-switch checks. This report establishes the immutable candidate behavior only. It does not promote the candidate, alter the canonical alias, claim human listening, narration completeness, or sound-quality acceptance, and does not award any 4.5 acceptance score.
