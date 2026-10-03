# Spot the Difference found marker reproduction

Date: 2026-10-03

## Frozen build identity

- Source revision: `a32f2e0`
- Preview: `http://127.0.0.1:5197`, served by `vite preview --outDir tmp/batch2-sky-teaching-20261003`
- JavaScript bundle: `/assets/index-DclDJx8i.js`, SHA-256 `f2052b2c5e696a22a32c81e206b6ca02818d28375a467ff26ac4eed252d1969f`
- Stylesheet: `/assets/index-CU-OkS6z.css`, SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`

## Reproduction

Used a new Playwright CLI session (`spot-marker-repro-20261003`). It opened `about:blank`, installed status-204 routes for `**/api/voice**` and `**/api/story/**`, then navigated to the preview. This kept voice and story API calls blocked before the first app navigation. The session began without injected player progress; profile selection, world selection, game selection, and starting the first chapter were done through the visible UI.

Path: select Amari → Thinking & Play → Spot the Difference → Start chapter. In the first Bright-Eyed Beginners pair, the center of the visible “Check middle top detail” target in Picture B was recorded before clicking its real UI button. One hotspot was solved; no queue was completed and no unlock was pursued.

## Observed geometry

Picture B's image container measured `x=664, y=288, width=580, height=435` CSS pixels. The selected hotspot was styled at `left=50%`, `top=17%`; its pre-click button rectangle was `x=926, y=333.9375, width=56, height=56`, so its center was `(954, 361.9375)`.

After the visible hotspot was clicked, the found marker rendered at `x=640, y=264, width=48, height=48`, center `(664, 288)`, exactly at the image container's upper-left corner. That placed the marker center `290px` left and `73.9375px` above the clicked target center.

The found-marker branch had no `left` or `top` style, while the unfound visual branch and hotspot button both used the difference's percentage coordinates. This confirms the marker placement defect.

## Screenshots

- Before the click: [before.png](before.png)
- After the click: [after.png](after.png)

## Change made

The found marker now uses its difference's `x`/`y` percentages and ignores pointer events because it is decorative. No score, queue, narration, or progress behavior was changed.
