# Batch 2 canonical address smoke — 2026-10-04

Target: [canonical identity and file manifest](../batch2-functional-release-94d44d0-canonical-20261004.json), `https://dinospace-eight.vercel.app`, deployment `dpl_Dypi5oGP3et3yxgQiGjDqYpfCFMg`, audited archive source `94d44d031d5835d0d9fa2128064ff83ba5880a62`.

## Result

The bounded canonical address checks passed for Monster Math at 390×844, Sky Shapes at 1280×800, and one Spot the Difference Starter pair at 390×844. All checks used fresh browser sessions and ordinary visible navigation. The canonical asset check matched all 16 manifest entries by response length and SHA-256.

This smoke check supplements the retained game-specific matrices. It does not repeat them, verify all chapter queues, or establish overall 4.5 acceptance or audible quality.

## Guarded browser setup

Each fresh Playwright session opened `about:blank`, installed `/api/voice` and `/api/story` routes returning HTTP 204, set its viewport, and only then navigated to the canonical URL. The CLI route list showed both guards. Sound was turned off using the visible control before entering each game. All logged static requests returned HTTP 200. No voice/story requests were observed; no provider data was generated.

## Checks

### Monster Math — mobile

Navigated through Amari → Maths Missions → Monster Math. The ordinary episode map showed Starter “Count to 10” available and Growing/Challenge locked. Starting the six-question episode entered Question 1/6 with `scrollY = 0`. The header stayed within the viewport; Back and sound controls were each 48×48 CSS px. The page had no horizontal overflow. Back opened the leave dialog; “Keep playing” preserved Question 1/6.

Evidence: [map](monster-mobile-map.png), [active question](monster-mobile-active.png).

### Sky Shapes — desktop

Navigated through Amari → Creative Lab → Sky Shapes. Starting the selected “Cloud Meadow” sky entered Mission 1, “Window Cloud”, Flight 1/4 with `scrollY = 0`. Header, Back and sound controls were visible; both controls measured 48×48 CSS px. The page had no horizontal overflow. Back opened the leave dialog and “Back to world” returned to Creative Lab.

Evidence: [active mission](sky-desktop-active.png).

### Spot the Difference — mobile

Navigated through Amari → Thinking & Play → Spot the Difference. The ordinary Starter chapter map showed all four pairs available. Started the chapter and decoded both Dino Park pictures before capture. Picture A and B each loaded at 1448×1086 natural pixels and rendered at 334×250.5 CSS px. The full-page capture shows both images in the normal 390 px flow; no seed, answer or progress state was supplied. Back opened the leave dialog and “Back to world” returned to Thinking & Play.

Evidence: [viewport](spot-mobile-starter-pair.png), [full pair](spot-mobile-starter-pair-full.png), [parent world](spot-mobile-parent-world.png).

## Runtime and limits

Across all three sessions, Playwright reported zero console errors and warnings. No provider API attempts appeared in the browser request lists; the persistent guard list contained both blocked routes in each session. The candidate identity manifest and live responses matched 16/16 assets. No human listening was performed. Previously retained full game matrices remain separate evidence and are not claimed as newly rerun in this smoke check.
