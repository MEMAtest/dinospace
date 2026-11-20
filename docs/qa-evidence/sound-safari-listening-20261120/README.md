# Sound Safari production rehearsal · 20 November 2026

Runtime commit `8cb968027d69d4bcbe6a9b33820a4e9b274c055c`. App module `/assets/arcade-Cu9SKvq9.js`. Worker cache `amari-discovery-v84`.

- Public origin [Dino Space](https://dinospace.netlify.app/).
- Immutable Vercel deploy `dpl_Ec8f3Wq21tdVQGMeNFAirWaaDUbx`; Netlify gateway deploy `6affa22149c9ff74b3670317`.
- 765 repository tests passed. The immutable backend, Netlify draft and published site matched the local release hashes for 9 resources.

Each run started with fresh synthetic progress and used the visible game controls to complete all 18 challenges across Listen, Blend and Segment. Both runs reopened each saved chapter after reload and replayed all six Listen challenges without duplicating rewards.

- Listen used a neutral prompt and a deliberate first-sound clue.
- Blend showed ordered graphemes after mute and after an injected browser playback rejection. Restoring sound did not remove the assisted status.
- Segment held back the printed word during the audio-first challenge, then made it available after an injected word-clip failure. Its visual assistance survived toggling sound.
- All three chapters held feedback on wrong and right answers, supported a same-round retry and played packaged explanatory audio. A denied chapter save remained visible and recovered on retry.

The published game was exercised with browser pointer controls at 390×740 and 1440×844. An independent isolated browser check at both widths covered fallback and assisted status in Segment and Blend. Playback was verified by media time advancing. Pronunciation and voice consistency were outside this browser check.

An already-open synthetic QA tab used the in-app **Refresh games** control. All 118 synthetic storage records and the IndexedDB Storybook fixture matched before and after. Both public runs had no unexpected HTTP errors, console errors or provider requests. The phone-sized run used a Chromium viewport on this computer.

Puzzle Pop also passed a fresh 3×3 board and reload using touch and keyboard on this later runtime.

[Per-run results](production-summary.json)
