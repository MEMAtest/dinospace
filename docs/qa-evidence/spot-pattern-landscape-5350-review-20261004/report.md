# Pattern Parade landscape pair QA — frozen candidate 5350

Date: 2026-10-04
Candidate origin: `http://127.0.0.1:5350`
Frozen source SHA: `77940e9d4b7400cdd0c2796205790da58ce06cfa`
Identity manifest: [candidate-identity.json](candidate-identity.json)
Artwork prompt and provenance: [art-provenance.json](art-provenance.json)

## Scope and verdict

This is an independent rendered-browser review of the new Spot the Difference Growing scene, Pattern Parade, at 1280×800 and 390×844. It preserves the 5332 Starter/Treehouse baseline and the historical Spot progression evidence. It does not claim a full rerun of every scene, Safari or Observatory art acceptance, or production acceptance.

**The rendered landscape and five localized color changes passed this scoped review.** In each viewport, the pennant cloth, arch medallion, one balloon, parade drum, and shop canopy have visible changes that stay within their object boundaries; there is no rectangular patch, color spill, or unexpected change elsewhere in the matched scene. Each corresponding object was tapped directly from its visible position and registered exactly once. Blank taps were rejected. The pair fact remained on screen until Next was selected.

## Method and safety boundary

Separate fresh Playwright profiles were opened at `about:blank`. Before first app navigation, each run registered local `204` fulfill handlers for `**/api/voice**` and `**/api/story**`, set the viewport, and used `goto` to enter candidate 5350. Sound was turned off using the visible control. Spot was opened from the Amari home and Thinking & Play world; Curious Comparers was unlocked by completing all four Starter pairs through the ordinary visible UI. Pattern Parade appeared normally in Growing (desktop pair 3; mobile pair 2). No seed, answer, progress, or storage state was injected, and no provider job or child-data request was used.

The recorded Playwright request lists contained only static assets; page resource entries contained no `/api/voice` or `/api/story` requests. The CLI `route-list` returned “No active routes” even after the scripted `page.route` registrations and navigation, so it does not independently prove those page-bound handlers remained installed. The zero-request conclusion is based on the guarded run procedure and observed request/resource logs. No narration listening or audio-quality judgment was made.

## Rendered art and target alignment

The 1448×1086 scene is a clear 4:3 landscape at both desktop and 334×250.5 CSS pixels on mobile. At 390px, A and B stack vertically and remain fully reachable by normal vertical scrolling; `documentElement.clientWidth` and `scrollWidth` both remained 390. Desktop viewport and document widths both remained 1280.

| Intended edit | Visible result | Target/input result |
|---|---|---|
| Left foreground pennant | A purple cloth; B warm orange/ochre cloth. Star and gold pole are retained. | Direct tap accepted. |
| Upper-center arch medallion | Central medallion shows a distinct warmer color variant; arch geometry is unchanged. | Direct tap accepted. |
| Right balloon cluster | The blue balloon in A becomes pink in B; other balloons and strings remain. | Direct tap accepted. |
| Lower-center parade drum | Red drum body in A becomes blue in B; gold trim and drumsticks remain. | Direct tap accepted. |
| Right shop canopy | Pink-and-white canopy in A becomes green-and-white in B; awning shape and building remain. | Direct tap accepted. |

No mask edge appeared as a rectangle. Color edits followed the pictured object silhouettes, with the neighboring pole, arch, strings, trim, drumsticks, awning/building, confetti, paving, and background unchanged to visual inspection. The central medallion color change is the least conspicuous of the five, but it remained distinguishable at both tested render sizes and its 56×56 CSS-pixel target was directly tappable.

Desktop evidence: [initial pair](screenshots/desktop-pattern-parade.png), [after both hints](screenshots/desktop-after-hints.png). Mobile evidence: [initial full pair](screenshots/mobile-pattern-parade.png), [after both hints](screenshots/mobile-after-hints.png).

## Interaction and progression

| Check | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| Blank miss | Tap at `(688,700)` was rejected with “Not that spot yet”; score stayed 0/5. | Tap at `(180,499)` was rejected with “Not that spot yet”; score stayed 0/5. |
| First/second magnifier hint | “right top of Picture B”, then “left top of Picture B”. | “right area of Picture B”, then “right top of Picture B”. |
| Five real pointer taps | Pennant `(758,427)`, medallion `(991,414)`, balloons `(1165,530)`, drum `(1000,641)`, canopy `(1185,410)`; 5/5. | Pennant `(80,566)`, medallion `(198,559)`, balloons `(302,618)`, drum `(217,689)`, canopy `(330,548)`; 5/5. |
| Held completion | “Repeating patterns follow a rule that we can describe.” and Next picture appeared at 5/5. | Same fact and Next picture appeared at 5/5; [screenshot](screenshots/mobile-held-fact.png). |
| Next/progression | Completion state was held for inspection; Next was not clicked on desktop. | Next was selected. The two remaining Growing pairs were completed with their visible labelled controls; Curious Comparers showed 4/4 and the next chapter became available. Reload retained 4/4 Starter and 4/4 Growing. Back to learning world returned to Thinking & Play, where Spot showed “Played 2”. See [map](screenshots/mobile-chapter-complete-map.png) and [post-reload snapshot](screenshots/mobile-reload-map.yml). |

All five visible target controls measured 56×56 CSS pixels in each viewport, meeting the 48px target-size check for this scene. Every target was located and hit using the visible picture composition; accessible labels were not used to complete Pattern Parade.

## Served identity and browser health

All 11 paths in the frozen identity manifest returned HTTP 200 from 5350 and matched both declared byte counts and SHA-256 digests. This includes the index/runtime assets, the Pattern Parade landscape, and the shared Treehouse/Safari assets. Desktop and mobile console logs each reported zero messages (errors 0, warnings 0). Neither viewport recorded a voice/story request or resource entry.

## Limits

- This is local evidence for the exact frozen 5350 source/asset identity only.
- The second new landscape, Time Observatory, is not visually accepted by this report.
- No other Spot scenes or all-control-class sweep were repeated here; retained baseline and narrow renderer deltas remain distinct.
- Packaged narration was not played or evaluated. No audio-readiness, production deployment, or 4.5 acceptance is claimed.
