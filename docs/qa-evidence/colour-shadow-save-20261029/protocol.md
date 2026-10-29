# Colour Mixing Lab + Shadow Match acceptance protocol

## Standalone held-fact touch check

The full acceptance callback covers Shadow Match progression. To sample touch input without completing a level, use `run-shadow-touch-check.py` on the existing leased page. It opens Amari's naturally unlocked Level 5 through the visible practice selector, matches the visible target image to visible option art, tries a wrong option, dispatches a cancelled touch and a real touch drag, plays the held fact audio, and returns home before Next. It verifies progress and both players' reward records remain unchanged. This uses Chromium CDP touch emulation; it does not certify a physical device.

```sh
COLOUR_SHADOW_BROWSER_OWNER=<active-owner> \
  python3 docs/qa-evidence/colour-shadow-save-20261029/run-shadow-touch-check.py \
  http://127.0.0.1:5180 390 740 /assets/arcade-<exact-entry>.js <exact-runtime-sha>
```

Use the current canonical origin and its exact runtime identity for hosted verification. The runner checks the existing lease/profile, exact entry and namespaced page, and blocks provider routes before navigation. It writes compact JSON and retains a screenshot only on failure.

## Scope and limits

Run through the existing `amari-targeted-contained` Playwright page only. Root owns the browser session. Use one retained synthetic profile, supplied exact entry/runtime identity, and current lease. The driver never creates a browser, context, tab, profile, or session. Never reset or seed saved progress, inject an answer/run queue, or invoke an external speech provider. Reinstall the media observer immediately after each document navigation or reload. Keep reports below 8 MiB total and source files below 150 KiB; retain failure reports and one screenshot only when a run fails.

Run native and canonical at 390×740 and 1440×844. Record each origin/build/entry/source hash separately. Block provider requests before every navigation, and finish with no page, console, request, response, or provider errors. Primary controls must be fully visible before click; only normal world/catalogue and secondary picker navigation may scroll. Every used/audited interactive target must be at least 44×44 CSS pixels, center-hit and inside the viewport.

## Colour Mixing Lab

Enter as Amari from the ordinary player/world/catalogue flow. Complete all six visible missions in each lab: Paint Mixer, Light & Shade, and Colour Makers. Replay each lab's six missions with a same-mission wrong response and visible clue/recovery, yielding 18 normal plus 18 replay rows (36 total). Derive the scoop plan from visible proportions or the visible recipe-card label and target picture; physically add each scoop, use Mix, inspect the rendered blend, and answer from the shown blend/properties. A wrong answer must leave the same mission active. Keep the explanation visible, play its packaged audio through the UI, and use the visible Next mix/Finish chapter action.

Read the strict saved record and receipts from the exact player-scoped colour progress key. Check all 18 missions are retained, all positive receipt markers are claimed after the reserved `dino:colormix` token succeeds, and each one-mission paint reward changes parent points by one (the adapter accepts four units but the actual parent delta is one). Equal/lower replay must preserve the record and pay no extra token. Reload and verify record/claims persist; return through the ordinary parent navigation. Fault only naturally eligible missions: exact local write/readback failures while the result is held, parent write/readback while a positive receipt is pending, and same-page reload/intro drain for a different naturally eligible pending receipt. No queue-write fault is expected unless source adds a persisted queue. Current starting inventory is already capped on Colour at both origins, so all Colour positive-write/reward branches must be recorded as unexercised; do not inject faults into replay-only results or manufacture eligibility. Shadow starts fresh for both players, so its natural completion chain and later pending-receipt reload can be exercised.

## Shadow Match

Enter Shadow Match through Askia's ordinary Dino World route and complete all five levels normally: 4, 5, 6, 7, and 8 matches respectively (30 matches). Then run Amari's normal advanced route from its appropriate starting level, completing its available advanced levels and at least one equal/lower capped replay if the retained profile makes that naturally available. Retain saved high-water level and each per-level best; do not replay for additional rewards. At each level, record the visible pool label (3, 6, 8, 10, and 12 species) and verify choice counts follow the authored 2→3→4→4→5/6 progression; higher levels exercise similar silhouettes and Level 5 mirrored shadows. Check visible new-species art and the actual silhouette/mask against the visible creature. Derive the answer by comparing the rendered image source/art identity and visible creature label to the available rendered shadows, never by reading target IDs, queue state, React props, or hidden attributes.

For wrong-response coverage, choose a visible wrong shadow, verify the same target remains, then use the visible clue and answer correctly. Hold each found dinosaur's fact/explanation and demonstrate the visible audio replay plus Next match before advancing. At least one Level 5 choice must confirm mirrored rendering and all six visible choices. Record actual level/match counts and image identities. Use the raw Shadow Match receipt points and `dino:shadowmatch` token without the Colour adapter multiplier. Verify claimed markers, exact parent token/delta, per-level progress, and Askia/Amari/sibling isolation after reload. Exercise local write/readback and parent write/readback/reload recovery only on a naturally new, positive per-level receipt; cap/replay branches must retain badges/bests and pay zero. Keep all retries on the same held match/result.

## Evidence

Store bounded per-row evidence for visible prompt/model, derived response, wrong/clue state, held explanation/audio, target bounds, resulting saved level/mission/receipt, exact storage deltas, parent token/points, reload result, and ordinary parent return. Keep full source hashes for every game/helper touched by the journey and for the driver, runner, protocol, and shared integration helper. A passed report proves only the saved profile, exact build, origin, viewport, visible actions, and exercised reward branches. It does not establish physical-device behavior or branches that had no natural eligibility.
