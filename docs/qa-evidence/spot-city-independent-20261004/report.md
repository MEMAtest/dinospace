# Independent Spot the Difference City candidate QA

Date: 2026-10-04

Candidate: `http://127.0.0.1:5326`

Source SHA: `c89d69519cef3036a0bd20ada0f6fac8e0cbc683`

Frozen dist: `tmp/spot-city-original-colours/dist`

Identity record: [`spot-city-original-colours-identity-20261004.json`](../spot-city-original-colours-identity-20261004.json)

## Scope and setup

Opened a fresh uniquely named Playwright browser session on `about:blank`; installed `**/api/voice` and `**/api/story` route guards before the first app navigation and verified both in the route list. Chose Amari and opened Thinking & Play → Spot the Difference → Bright-Eyed Beginners through visible controls. Sound remained off. No narration or audio was invoked. No question data, storage, progress, or game state was injected or read.

This is a local frozen-candidate visual and interaction review of the **Superhero City** pair. The profile initially saw River Valley, Dino Park, then City. After a UI replay, the visible pair order changed and City appeared fourth; this was ordinary chapter replay. City was exercised at desktop 1280 × 800 and responsive 390 × 844. Pointer clicks were sent to the centers of the currently visible `Check ... detail` target buttons; the positions and sizes below come from their rendered bounding boxes.

## Early mask, object, spill, and fidelity verdict

**Pass for the three original-source colour masks in this frozen candidate.** Picture A and Picture B both render the same 1448 × 1086 source image (`/assets/superhero-city-DPTOkgpV.webp`). B visibly changes only the tower cupola panels to blue, the flying hero’s cape fabric to gold, and one entire shop canopy to green. The adjacent red canopy is a separate storefront awning and remains unchanged; the green target is not a half-painted canopy.

At both rendered sizes the dome colour follows the curved panel boundary and preserves the gold trim and tower masonry; cape gold follows the cloth silhouette and stays off the hero’s body; and the awning change stays within that canopy, preserving the roof, façade, and neighboring red awning. The hero faces, suit, hair, buildings, windows, sky, road, and other scene details appear stable. I observed no edge fringe, hue spill, clipping, or unrelated background difference in the visible pair.

| Viewport | Picture A/B rendered size | Target boxes in Picture B | Other controls |
| --- | --- | --- | --- |
| 1280 × 800 | 580 × 435 px each | 56 × 56 px each | Header controls 48 × 48 px; no horizontal overflow |
| 390 × 844 | 334 × 250.5 px each, stacked | 56 × 56 px each | Header, hint, and sound controls at least 48 px; document width 390 px |

The desktop screenshot preserves the first full-size comparison. The mobile screenshot shows both full stacked pictures. The rendered desktop B target centers line up with cupola, cape, and canopy respectively; on mobile, all three buttons remain centered over those same details.

## Pointer, hint, miss, feedback, and Next

At 390 px, a pointer click on an unchanged central part of Picture B produced **“Not that spot yet. Compare the same area in Picture A.”** without incrementing the found count. The visible magnifier button then displayed **“Magnifier hint: look near the left top of Picture B.”** and decreased the remaining hint count from two to one; no audio control was used.

At both 390 px and 1280 px, clicking the three currently visible target buttons by pointer produced consecutive correct feedback (`1 of 3`, `2 of 3`, then pair complete). The completed fact said, “People help their community by sharing and caring for the places where they live.” It remained visible after a 1.3 second wait with **Next picture** still available; it did not advance automatically. Clicking Next picture completed the chapter at Pair 4 of 4 and showed a visible **Next chapter** control.

## Reload, routes, and candidate identity

Reload after the mobile City completion returned to the chapter picker with Bright-Eyed Beginners showing **3/4 pairs**. The completed City pair remained credited and the visible **Replay chapter** control allowed ordinary replay. No synthetic progress was used.

All eight paths in the frozen identity record returned HTTP 200 with byte counts and SHA-256 values matching the record, including the shared City image. Page resource inspection found no `/api/voice` or `/api/story` requests and no failed candidate asset responses. The two guards remained installed during the run. Browser console errors: 0; warnings: 0.

One small-screen copy observation: the chapter/pair subtitle in the top header ends in an ellipsis at 390 px; the page title, instructions, picture labels, target positions, and scene remain visible. This is separate from the City artwork mask verdict.

## Evidence and limits

- [Desktop City pair before clicks](city-desktop-initial.png)
- [Desktop City completed fact](city-desktop-complete.png)
- [Mobile City pair before clicks](city-mobile-initial.png)
- [Mobile City completed fact](city-mobile-complete.png)

**Result:** pass for this frozen City candidate’s three colour edits, full-object alignment, no-spill rendering, responsive target placement, miss/hint/correct feedback, held fact, Next behavior, and reload progress persistence. Scope is local and pair-specific. This is not human listening, a real-device touch-emulation pass, full Spot chapter/game coverage, production validation, or overall 4.5 acceptance.
