# Independent Spot Sound Safari candidate review — rejected

Date: 2026-10-04
Candidate: `http://127.0.0.1:5330`
Frozen source: `810478a644725ad0ef1a9b45154e1f147c0672e3`
Frozen dist: `tmp/spot-safari-real-objects/dist`
Identity: [`spot-safari-real-objects-identity-20261004.json`](../spot-safari-real-objects-identity-20261004.json)

## Scope and guarded profile

The art-review session started at `about:blank`, installed 204 route guards for `**/api/voice` and `**/api/story`, then used `goto` to navigate to the candidate; both guards were still listed afterward. At the visible first page I turned sound off before choosing Amari. No clue/audio control was used.

I completed Bright-Eyed Beginners (4/4 pairs) with ordinary visible controls, visible magnifier hints, and actual hotspot buttons to unlock Curious Comparers. No progress, answer, storage, or game state was injected or read. The Growing / Curious Comparers **Sound Safari, Pair 1** visual check was then made at 1280 × 800 and 390 × 844 before any interaction with that pair.

A separate initial CLI setup probe used `open URL`, which replaced its about:blank page context and lost the newly installed routes. I abandoned that probe before earning or reviewing a pair and restarted in a new fresh session using guarded `goto`. Read-only request filters on the abandoned probe showed no voice/story API or audio requests. The findings below are from the guarded session.

## Early art verdict: fail

**Reject this frozen candidate for the requested five object-colour edits.** Picture A and Picture B look visually identical at both tested sizes. The expected differences are not discernible:

- elephant inner ear remains pink;
- parrot tail feathers show no changed hue;
- monkey belly remains the same light tan;
- frog skin remains green;
- elephant toenails remain the same pale grey.

There are no visible coloured overlays or changed pixels at the intended object locations. Because no edits render, there are no seams, spill, detached colour islands, or halos to evaluate; that absence is not a pass for mask quality. The crop and target alignment against changed pixels also cannot be accepted until the differences are visible. The five rendered Picture B hit targets are 56 × 56 px and sit over the expected object regions, but this does not establish alignment to edits that are absent.

| Viewport | Rendered A/B pictures | Document width | Picture B hit targets |
| --- | --- | ---: | --- |
| 1280 × 800 | Each 580 × 435 px | 1280 px; no horizontal overflow | 5 × 56 × 56 px |
| 390 × 844 | Stacked, each 334 × 250.5 px | 390 px; no horizontal overflow | 5 × 56 × 56 px |

The candidate serves a 1254 × 1254 square image, cropped into the same 4:3 rendered boxes at both widths. This records the displayed dimensions only; it does not prove that the absent colour masks align to the displayed crop.

## Candidate identity and diagnostics

All eight paths in the frozen identity record (HTML, five JS bundles, CSS, and the Sound Safari image) returned HTTP 200 with byte counts and SHA-256 hashes matching the record. Browser console errors: 0; warnings: 0. The active 204 guards remained listed during the art review. The guarded session recorded zero `/api/voice`, `/api/story`, or `/audio/` requests. No provider call or audio use was observed.

## Evidence

- [Desktop Sound Safari before any pair interaction](sound-safari-desktop-1280-initial.png)
- [Mobile Sound Safari before any pair interaction, full page](sound-safari-mobile-390-initial-full.png)

## Result and limits

**Fail/reject for the five requested colour edits.** The rendered pair does not show any of them, so I stopped before clicking Growing targets or testing its hints, completion fact, Next, or reload behavior. The four Starter pairs were completed only to reach the requested Growing scene. This is a local, scene-specific visual rejection, not full Spot coverage, production validation, audio acceptance, or overall 4.5 acceptance.
