# Batch 2 home navigation repair

Production `20ff27d` and the frozen cooldown candidate reproduced a two-click Back to home defect after leaving a game for its world. Game leave replaces its current history entry with the parent world; ordinary history back can therefore land on a duplicate world entry. The named WorldPage Back to home now calls `back({ toParent: true })`, using the established `parentRoute(world) → home` contract. Game leave confirmation remains in force.

Independent Luna confirmed the issue after Sky Shapes and Spot the Difference production chapter completion. The integrator verified the fix on a fresh isolated 390×844 browser against frozen `381b3fc` at `http://127.0.0.1:5287` (JS `index-Dd7vSQ3w.js`). Actual controls: Amari → Creative Lab → Puzzle Pop → Start chapter → Back to learning world → leave confirmation Back to world → a single Back to home. The final URL was `#/home`, document width 390, no broken images and zero console errors/warnings. Screenshot: `output/playwright/batch2-home-5287.png`. This targeted check proves named world-parent navigation locally, not full chapter completion or production acceptance.

The next release pairs this navigation fix with the narration request cooldown and cache version 15. Unfinished packaged-only Batch 2 narration changes are excluded from that release.
