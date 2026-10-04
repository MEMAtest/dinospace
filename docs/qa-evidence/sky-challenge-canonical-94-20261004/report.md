# Sky Shapes Challenge completion — canonical 94

Date: 2026-10-04. Independent browser evidence for the previously open four-flight Challenge coverage at both target viewports. This closes that specific coverage gap; it does not award a score or accept the overall Batch 2 release.

## Identity and safeguards

- Canonical URL: `https://dinospace-eight.vercel.app`
- Deployment: `dpl_Dypi5oGP3et3yxgQiGjDqYpfCFMg` (READY)
- Archived source: `94d44d031d5835d0d9fa2128064ff83ba5880a62`
- The existing [canonical identity record](../batch2-functional-release-94d44d0-canonical-20261004.json) lists 16 runtime/index assets. A fresh request for every listed path returned HTTP 200 with the expected byte count and SHA-256; results are in [served-identity.json](served-identity.json).
- Two fresh Playwright browser sessions used 1280×800 and 390×844 viewports. Each began at `about:blank`; `/api/voice` and `/api/story` route guards returning 204 were installed and listed before the first app navigation. Both guards remained active. The visible sound control was set to **Turn sound on** (muted) before game navigation. No `/api/` requests, console errors or warnings were observed. Static browser requests returned 200.
- The child profile was synthetic and isolated. All progression needed to reach Challenge was earned through the visible UI. No progress, seeds, answers, storage, or child data were injected. Tracing used the visible keyboard instructions, focused game board, Enter to begin, and arrow-key input; rendered progress/status text was used to know when to advance to the next numbered outline.

## Challenge outcomes

Each completed flight retained its mission fact and displayed the saved-rating message. The first three missions offered **Next mission**; the fourth offered **Complete this sky**. Challenge mission order is determined by the ordinary queue.

| Viewport | Visible Challenge order | Parts and held result |
|---|---|---|
| 1280×800 | Moon Observatory → Sky Castle → Rocket Ship → Winged Jet | 4/4, 6/6, 4/4, 3/3 ordered parts; respectively 98%, 98%, 98%, and 97% accuracy; each showed 3/3 accuracy stars and a held Shape idea fact. Winged Jet also showed the Aviator badge and 2 bonus stars. |
| 390×844 | Sky Castle → Moon Observatory → Winged Jet → Rocket Ship | 6/6, 4/4, 3/3, 4/4 ordered parts; respectively 98%, 98%, 97%, and 98% accuracy; each showed 3/3 accuracy stars and a held Shape idea fact. Rocket Ship also showed the Aviator badge and 2 bonus stars. |

In both profiles, the fourth flight reached 4/4 saved and **Complete this sky**. The completion view showed the Aurora Station badge and replay action. **Replay this sky** opened a fresh Challenge flight while retaining 4/4 saved; the desktop replay began with a different first mission than the original queue. **Back to learning world** opened the expected Leave the game? dialog; **Back to world** returned to Creative Lab.

### Mobile scope reconciliation

The existing source-bound evidence already records full mobile Challenge completions for Moon Observatory and Winged Jet on source `3cdfc426…`, and Sky Castle on canonical predecessor `c478644…`; Sky code and route data are unchanged between those builds and source 94. Therefore Rocket Ship was the sole previously unobserved mobile Challenge route. In the new clean mobile profile the normal Challenge queue placed Sky Castle, Moon Observatory, and Winged Jet before Rocket Ship. Those three were completed only as needed to reach the missing mission; Rocket Ship then completed normally at 4/4 parts and 4/4 saved. The profile’s post-return map visibly showed all three skies complete, all four Aurora Station missions checked at 3★, and **Replay this sky**. These intervening queue plays are preserved as setup/route evidence, not a claim that prior reports were absent.

Desktop is a fresh full quartet at the exact canonical runtime: Moon Observatory, Sky Castle, Rocket Ship, and Winged Jet each completed once in the 1280×800 profile. The retained Starter/Growing baseline was not rescored by this report; the eight visible flights completed in each fresh profile served only to unlock Challenge normally.

## Evidence files

Screenshots are in [screenshots](screenshots/):

- Desktop: Moon Observatory start and completion; completed facts for all four Challenge flights; replay start showing the 4/4 saved count.
- Mobile: Challenge unlocked state; Rocket Ship start and held completion; final map showing 4/4 in each sky and each Challenge mission at 3★; replay start.
- CLI snapshots and action output are retained in the local Playwright session output. Key held-state screenshot files are committed with this report.

## Result and limits

All four Challenge routes completed at both requested viewport sizes. The route order, numbered-part progress, score/reward copy, held facts, Next/complete controls, replay, and confirmed parent navigation worked in the tested sessions. The prior “two missing Challenge completions per viewport” worksheet gap is now closed by source-bound retained evidence plus the fresh canonical completions documented here; no Challenge route failure was reproduced.

This was keyboard-operated browser viewport QA, not physical-device touch testing. Narration stayed muted; no packaged audio was played or listened to and no audio-quality claim is made. This report closes only the Sky Challenge completion evidence gap. Other Batch 2 gates, including missing audio and human listening, remain separate; no five-dimension rating or 4.5 acceptance is claimed.
