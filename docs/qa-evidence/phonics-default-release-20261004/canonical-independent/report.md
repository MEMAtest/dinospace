# Canonical phonics defaults: independent production delta

Date: 2026-10-04  
Canonical URL: <https://dinospace-eight.vercel.app>  
Deployment: `dpl_7wFmajPYqR6CPrTLFksm4dkGzppv` (READY)  
Audited runtime source: `0d3ef056e569e3ef59763df388f26c3baa7783b8`

The production identity and all eight verified served-file hashes are recorded in [canonical-identity.json](../canonical-identity.json). This report covers the requested bounded default-settings and first-active-question delta; the retained full two-game desktop/mobile baseline is [the immutable candidate report](../independent-live/report.md) at source-bound baseline `0ce7b8b`. It does not repeat that full matrix or make an overall product acceptance claim.

## Method and isolation

Used separate fresh Playwright CLI profiles at 1280×800 and 390×844. Each began at `about:blank`; `/api/voice` and `/api/story` were routed to HTTP 403 and verified in the route list before the first app navigation. Both profiles selected Amari through the visible player picker and muted audio with the visible `Turn sound off` control. No answer, progress, or profile state was injected. No provider call was made. The exercised questions were solved from the displayed tiles and visible feedback only.

## Results

| Check | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| Fresh Phase 2 first-use sound selection | Grown-ups showed 23/23 phase sounds selected. | Grown-ups showed 23/23 phase sounds selected. |
| Save the supported restricted selection | Tapped `ff`; displayed selected count changed to 22. | Tapped `ff`; displayed selected count changed to 22 and the `ff` control became unpressed. |
| Preserve selection after navigating through game and returning | Completed one Letter Launch answer, returned to Read & Write and Home, then reopened Grown-ups; the settings remained at 22. | Completed one Spelling Studio word, returned to Read & Write and Home, then reopened Grown-ups; the settings remained at 22. |
| Requested first active game question | Letter Launch Level 1 showed visible choices D/A. D produced retry feedback naming “Apple”; choosing A showed held “Super! Apple starts with the a sound.” with Next mission. Back opened the confirmation dialog; confirmed Back to world returned to Read & Write. | Spelling Studio Level 1 Copy showed “SAT” and visible `s`, `a`, `t` tiles. Tapping `t` first showed “The next letter is s”; `s-a-t` then showed held “Well done!” with Next word. Next word reset to PAT. Back opened the dialog; Keep playing returned to the question, and confirmed Back to world returned to Read & Write. |
| Sound, console, assets and layout | Muted; 0 console errors/warnings; 0 broken images; document width 1280 equals viewport. | Muted; 0 console errors/warnings; 0 broken images; document width 390 equals viewport. |

The routed provider endpoints remained guarded for each whole session; the CLI request summaries showed 20 desktop and 18 mobile static requests omitted from the default display, with no reported non-static request output. These observations are not a human narration or audio-quality assessment; interaction was deliberately muted.

## Evidence

- [Desktop held Letter Launch feedback](desktop-letter-launch-held-feedback.png)
- [Desktop held Letter Launch snapshot](desktop-letter-launch-held.yml)
- [Desktop 23-sound default settings](desktop-settings-23-selected.png)
- [Mobile held Spelling feedback](mobile-spelling-held-feedback.png)
- [Mobile 23-sound default settings](mobile-settings-23-selected.yml)
- [Mobile wrong-tile retry snapshot](mobile-spelling-wrong-retry.yml)
- [Mobile 22-sound saved settings snapshot](mobile-settings-ff-off.yml)
- [Mobile confirmed return to Read & Write](mobile-confirmed-world-return.yml)

## Scope limit

This verifies the promoted defaults and the specified ordinary controls at both viewport sizes. It does not replace the retained full matrix, establish human listening quality, or accept the whole app at 4.5.
