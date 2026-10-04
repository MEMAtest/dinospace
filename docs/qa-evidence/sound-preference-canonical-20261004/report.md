# Sound preference persistence QA — canonical deployment

Date: 2026-10-04

## Identity and method

Tested canonical alias `https://dinospace-eight.vercel.app`, deployment `dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`, exact source/archive SHA `c47864404cff1f31c9cefe9b8a363d0ba5542b24`. The canonical identity record [sound-preference-canonical-identity-20261004.json](../sound-preference-canonical-identity-20261004.json) binds the alias and records the seven expected file hashes.

A fresh Playwright profile started at `about:blank`. Before first application navigation, 204 response routes were installed for `/api/voice` and `/api/story`; an init script instrumented `AudioScheduledSourceNode.start` and `HTMLMediaElement.play`. No profile data, storage values, progress, seeds, answers, or unlock state were injected. All routes, profile switching, and game actions used visible UI controls.

## Results

- At 1280×800, the fresh page showed **Turn sound off** (enabled). Toggling to **Turn sound on** and reloading kept sound muted. Toggling back to **Turn sound off** and reloading kept sound enabled.
- Repeated the same mute→reload and unmute→reload sequence at 390×844; both states persisted. Then muted and switched through the visible player chooser from Amari to Askia and back to Amari. Both profile home screens displayed **Turn sound on** (muted).
- At 390×844, normally opened Amari’s Monster Math Episode 1 and used **Hear the question again**, answered the visible ten-moons question incorrectly, then correctly. The correct feedback remained visible with **Next question**. The browser audio probe remained `starts: []` and `media: []` through those actions. This confirms no native playback was initiated in these sampled muted actions; it does not assess human-perceived quality.
- Document width matched viewport at 390 and 1280. The final Playwright console had zero messages, errors, or warnings.
- The browser request log showed static assets only; no `/api/voice` or `/api/story` request was observed. The routes were installed before navigation, but there were no requests to intercept. No provider call was made or observed.
- Independently fetched the seven files in the canonical identity record. All returned HTTP 200 with the expected byte counts and SHA-256 hashes.

## Screenshots

- `screenshots/mobile-askia-muted.png`
- `screenshots/mobile-muted-monster-held.png`
- `screenshots/desktop-muted-monster-held.png`

## Limits and lineage

This fresh canonical report supplements the independent local report [sound-preference-5311-local-20261004/report.md](../sound-preference-5311-local-20261004/report.md) and immutable candidate report [sound-preference-production-candidate-20261004/report.md](../sound-preference-production-candidate-20261004/report.md). It confirms the promoted canonical UI behavior for this bounded scenario only. It does not claim human listening, narration completeness, sound-quality acceptance, or a 4.5 acceptance score.
