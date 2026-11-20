# Puzzle Pop production rehearsal · 20 November 2026

Runtime commit `3a81bac96fdc6718bc1a1302c0501348dc87795d`. App module `/assets/arcade-xxJrWx6L.js`. Worker cache `amari-discovery-v83`.

- Public origin [Dino Space](https://dinospace.netlify.app/).
- Immutable Vercel deploy `dpl_2RbpnDZw3BWpKZRDb9abPeu4EEZq`; Netlify gateway deploy `6affa095cebca0f67e040c59`.
- 764 repository tests passed. The immutable backend, Netlify draft and published site matched the local release hashes for 8 resources.

Each run started with fresh synthetic progress and solved all 12 pictures through game controls: four each at 3×3, 4×4 and 5×5, totalling 200 placements. Each run also replayed one board of each size for another 50 placements.

| Viewport | Input | Checks |
| --- | --- | --- |
| 390×740 | Native Chromium touch events | 12 accepted inside-edge drops. Wrong slot, padding and outside-board drops at each size left the puzzle unchanged. Hint followed reselection. |
| 1440×844 | Keyboard | Arrow boundaries, Space and Enter placement, focus through the tray and onto the completion heading, and hint reselection. |

The first live touch attempt stopped before the first drop with no drag preview. The runner was updated to wait for layout and the preview and to hit-test the drag origin. The full rerun passed against the same release.

Both viewports exercised denied completion and replay-queue writes, recovered through the on-screen controls, checked saved completion and rewards after reload, and checked that replay awarded no duplicate stars. Game audio started.

An already-open synthetic QA tab used the in-app **Refresh games** control. All 118 synthetic storage records and the IndexedDB Storybook fixture matched before and after. Both public runs had no unexpected HTTP errors, console errors or provider requests. The phone-sized run used a Chromium viewport on this computer.

[Per-run results](production-summary.json)
