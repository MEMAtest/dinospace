# Memory mountain, tulip, lolly and chips builder check

## Scope and source

Added matching, transparent 3D illustrations for the existing Amari Memory tokens `⛰️ mountain`, `🌷 tulip`, `🍭 lolly`, and `🍟 chips`. The source audit found these were unillustrated and confirms they appear on Dinosaur Discovery, Garden & Pond Life, Party & Treats, and Yummy Feast respectively. Lolly and chips also appear in both Party and Food boards.

`MemoryMatch.jsx` changes only import the four compressed WebP files and add them to the existing path-to-asset table. The existing shared labels, board token lists, pair counts, game state, progression and Askia card-art map are unchanged. The source PNGs remain unchanged beside their encoding-only 512 × 512 WebP derivatives. Prompts, original and derivative hashes, dimensions and alpha evidence are in [the asset provenance record](memory-mountain-tulip-lolly-chips-art-provenance-20261004.json).

Source commit: `382945e78752e2f4e532ac6d0f92c13458ccfb4d` on `codex/amari-batch7-quality-20261003`.

## Checks

- Focused tests: `node --test test/memoryMatchContent.test.mjs test/batch7Progress.test.mjs` — 17 passed.
- `npm run lint` — passed.
- Production-config `npm run build:android` — passed. Vite printed the existing stale Browserslist-data notice and the existing large-chunk advisory.
- Read-only Memory inventory: 80 of 87 unique tokens have illustrations. Remaining: racing car (Vehicles), drink (Food), party face (Party), duck and water lily (Garden), dinosaur nest (Dinos), and speedboat (Vehicles).
- The build was copied to an immutable local candidate at `tmp/batch7-memory-mountain-tulip-lolly-chips/dist` and served at [http://127.0.0.1:5331](http://127.0.0.1:5331). SHA-256 checks matched for the served HTML, application JS/CSS, and all four new WebP files. See [candidate identity](batch7-memory-mountain-tulip-lolly-chips-identity-20261004.json).

## Rendered builder evidence

Using ordinary UI controls, I selected Amari, opened Memory Match, earned levels 1 through 9 with visible card flips and Next Level, then replayed the earned target boards. No local storage, hidden face, or deck data was injected or inspected.

At 1280 × 800 and 390 × 844, the mountain appeared on Dino level 5, tulip on Garden level 9, lolly and chips on Party level 4, and lolly and chips on Food level 7. Every target was matched through actual visible flips. On mobile the target cards measured 82 × 82 pixels; all face-down cards on the target boards had no descendant image element. Labels were readable in the rendered cards. Screenshots for both widths are in [the builder images folder](batch7-memory-mountain-tulip-lolly-chips-builder-images/).

Both 403 request routes (`**/api/voice`, `**/api/story`) were verified active before and after `goto` in the final browser context and remained listed after the replay. The guarded replay showed no console errors or warnings; the request list displayed only the static-asset summary. One earlier preliminary CLI run used `open <appURL>` after installing guards on `about:blank`; that command recreated the context and dropped the routes. Those preliminary screenshots are superseded, and are not counted as guarded evidence.

This is builder evidence only. Independent rendered QA, human listening, remaining Memory illustration work, release, deployment, and any overall quality score remain separate gates.
