# Batch 2 production repair delta — 2026-10-03

## Production identity and isolation

Fresh independent browser session `luna_batch2_release_qa` began at `about:blank`. Before production navigation and before selecting a player, the session intercepted `**/api/voice**` and `**/api/story/**` with 503 responses. No voice/story call reached a provider. Selected the app’s visible Age 6+ Amari profile in the fresh context; no real account or child data was imported or used.

Live alias: [dinospace-eight.vercel.app](https://dinospace-eight.vercel.app), deployment `dpl_DGLGVkaMikT5GPntS6YThDsesHyx`, reported READY by release owner. Independently fetched the served assets from the live page before player selection:

| Asset | HTTP | SHA-256 |
|---|---:|---|
| `/assets/index-akZ21SWl.js` | 200 | `3ebd53465f2f2a6994163ce420c3d04e7e4f578544518f9bde4f7b6e2f8fb2b0` |
| `/assets/index-CPZQTFam.css` | 200 | `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459` |

These match the release owner’s supplied artifact identity for commit `6b84554e7a1d21b3db658d213a2298462c78599e`.

## Puzzle Pop regression gates

All placements used visible Hint, piece and puzzle-space controls; keyboard checks focused the visible controls and activated them with Enter. Board instructions and feedback were read from the visible page. No state injection or solver was used.

| Case | Result |
|---|---|
| Desktop 1280×800, in-progress quick wrong → correct | On Moon Camp, wrong space 1 showed retry guidance; the hinted correct space 3 produced Great fit. The measured interval from reading wrong feedback to completing the correct click was **30 ms**; total from first wrong click start to correct click was **69 ms**. After **1.35 s**, Great fit remained and the board still showed 3 pieces left. |
| Desktop 1280×800, final wrong → correct | With three pieces already placed, the final-piece wrong space showed retry guidance; the correct hinted target completed Moon Camp. Correct click followed the wrong click by **35 ms**; total was **69 ms**. After **1.35 s**, the visible Moon Camp completion card and “The Moon shines because sunlight bounces off its rocky surface” fact remained. |
| Mobile 390×844, keyboard quick wrong → correct | Focused the hinted piece and pressed Enter, focused a different empty space and pressed Enter, then focused the hinted target and pressed Enter. Retry guidance appeared before correction and Great fit replaced it. Correct Enter followed wrong feedback by **6 ms**; total from starting wrong placement was **15 ms**. After **1.35 s**, Great fit remained with 3 pieces left. |
| Mobile 390×844, final wrong → correct | With three pieces in place, wrong space produced retry guidance; the final hinted correct target completed Dino Park Picnic. Correct click followed the wrong click by **75 ms**; total was **125 ms**. After **1.35 s**, the completion card and the fact “Some dinosaurs ate plants, and some ate meat. Their teeth helped scientists learn what they ate” remained. |

**Production regression result: pass** for the delayed-feedback fix and final-fact persistence at both viewport sizes. Delayed-after screenshots, captured after the 1.35-second wait and visually inspected without text selection, are:

- Desktop after-delay completion/fact: [`batch2-release-puzzle-desktop-after-delay-20261003.png`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-release-puzzle-desktop-after-delay-20261003.png)
- Mobile after-delay completion/fact: [`batch2-release-puzzle-mobile-after-delay-20261003.png`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-release-puzzle-mobile-after-delay-20261003.png)
- Desktop board before final-piece attempt (setup only): [`batch2-release-puzzle-desktop-before-final-20261003.png`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-release-puzzle-desktop-before-final-20261003.png)
- Mobile board before final-piece attempt (setup only): [`batch2-release-puzzle-mobile-before-final-20261003.png`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-release-puzzle-mobile-before-final-20261003.png)

The `before-final` shots document setup and are **not** after-delay proof. The `after-delay` screenshots show the actual final UI state after the wait on each viewport.

## Spot the Difference first-miss telemetry

At 390×844, started the default Bright-Eyed Beginners chapter, seed `2736253934`, pair 1 Moon Camp. Clicked the visible blank “Search Picture B for a change” target twice. Both misses showed “Not that spot yet. Compare the same area in Picture A.” No pair completion is claimed. In the Grown-ups diagnostics download, Spot level 0 round 1 contains two `answer_attempt` events: first `firstAttempt:true`, second `firstAttempt:false`.

- Start-state screenshot: [`batch2-release-spot-starter-before-misses-20261003.png`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-release-spot-starter-before-misses-20261003.png)
- The post-second-miss UI snapshot is `qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/spot-after-second-miss.yml`.
- UI-exported diagnostics: [`batch2-production-delta-6b84554-20261003.json`](qa-evidence/batch2-puzzle-spot-production-6b84554-20261003/batch2-production-delta-6b84554-20261003.json)
- Export SHA-256: `928d0c26edfe64113e3e6dec0cd751bae3330f9c5859cb212ac9d696d1886cd4` (39 events, 4 milestones). Retained fields contain game/event/time/level/round/seed/firstAttempt, without story text or child identifiers.

## Console and certification boundary

The browser recorded 7 console errors and 0 warnings; all 7 were `503 Service Unavailable` errors from the intentionally intercepted `/api/voice` route. These are expected QA interceptions, not live provider failures. Audio playback and story-provider behavior remain uncertified. The app rendered its visible picture assets and controls; JS/CSS asset responses were independently fetched with HTTP 200 and exact hashes above.

This report is the narrow independent production delta for the released repair. It does not claim a new six-run-per-game matrix or a new overall 4.5/5 score; those broader results and boundaries remain in [the baseline acceptance report](batch2-fresh-acceptance-20261003.md).
