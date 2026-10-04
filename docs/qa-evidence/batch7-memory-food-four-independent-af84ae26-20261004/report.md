# Independent Yummy Feast food-art QA

**Candidate source:** `af84ae26525b1349e309b904058bc5b18d1d7daa`  
**Frozen origin:** `http://127.0.0.1:5318`  
**Frozen dist:** `tmp/batch7-memory-food-four-final/dist`  
**Identity:** `docs/qa-evidence/batch7-memory-food-four-identity-20261004.json`

## Scope and method

Independently checked the four new Yummy Feast illustrations—Carrot, Corn, Biscuit and Cheese—on Amari Memory Match Level 7. This is a bounded food-art delta, not a full Memory review, audio assessment, production check, human/device sign-off, or 4.5 acceptance.

Started a fresh Playwright CLI session at `about:blank`, installed persistent `**/api/voice` and `**/api/story` routes returning 403, and verified them with `route-list` before opening the candidate. Through visible controls, selected Amari, opened Thinking & Play → Memory Match, and earned Levels 1–6 using actual card flips and visible Next controls. Completed Yummy Feast normally at desktop and mobile widths. The solver reads accessible card names only after the actual card flips and waits for visible match/face-down state. Sound remained off. No progress/state injection, hidden-front reads, answer seeds, or provider calls were used.

The earned boards were Forest Friends 4 pairs/8 cards, Ocean Splash 8/16, Space Sparkle 10/20, Party & Treats 12/24, Dinosaur Discovery 13/26 and All Kinds of Vehicles 14/28. Visible Next then opened Yummy Feast with 15 pairs/30 cards.

## Results

| Viewport | Face-down board | Completed board |
| --- | --- | --- |
| 1280×800 | Yummy Feast: 30 cards, all 30 face down, zero mounted images, document width 1280. Cards measured 182×182px; Level 7 selector measured 48×48px. | Completed 15 pairs. Both copies of Carrot, Corn, Biscuit and Cheese were revealed through actual flips, showed the matching accessible labels and loaded their corresponding candidate image URLs. All cards remained within the 1280px document width. |
| 390×844 | Yummy Feast: 30 cards, all 30 face down, zero mounted images, document width 390. Cards measured 82×82px; Level 7 selector measured 53.5×48px. | Completed 15 pairs. Both copies of each new food token showed the correct accessible name and loaded expected image. Image and caption rows stayed separate, captions remained readable on the small cards, and document width stayed 390px. |

The desktop full-page screenshot shows the four new items as distinct objects in the existing food board: leafy orange carrot, corn ear, round biscuit and yellow cheese wedge. Revealed mobile image boxes were 63.36×30.41px inside 82×82px cards. Natural dimensions were Carrot 512×427, Corn 512×512, Biscuit 512×512, and Cheese 512×427. All eight individual flipped cards loaded successfully.

Screenshots in this folder:

- `food-desktop-facedown.png`, `food-desktop-fullpage.png`
- `food-mobile-facedown.png`, `food-mobile-fullpage.png`

## Reload, guards, and served identity

Reloading the same mobile session returned to the existing Amari Memory journey with Astronaut Mission selected and Yummy Feast still unlocked. Selecting the visible Level 7 button showed all 30 Food cards face down with zero images; document width remained 390px.

Both 403 guards remained installed. The browser request inventory showed no voice/story requests; console recorded zero errors, warnings or other messages. Every path in the frozen identity report was fetched from port 5318 and compared with the expected report hash and frozen dist. Root HTML, JS, CSS and all four new WebPs matched both.

The builder’s separate source checks and art inventory remain builder evidence. This report does not audit remaining Memory art, Askia parity, narration readiness, broader human/device acceptance, production, or overall quality.
