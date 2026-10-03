# Puzzle Pop same-viewport replay pairs — 3 October 2026

## Scope and identity

This is independent, bounded UI evidence for the two previously missing Picture Pioneers replay pairs. The candidate was served locally at `http://127.0.0.1:5198` from source `6d18cce` with the generated offline voice manifest. The browser loaded `index-ru9r4zVs.js` (SHA-256 `24960c1feb0821cc5552bb0c9d81f89373037461c685d2d0e20417efe3083b1f`) and `index-CU-OkS6z.css` (SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`). These hashes match the frozen local candidate noted in `batch2-remaining-gates-20261003.md`.

Each Playwright session began at `about:blank`. Requests matching `**/api/voice/**` and `**/api/story/**` were aborted before the first app navigation. No seed, answer, or progress was injected. Gameplay used the visible Hint button, its selected piece, and the highlighted puzzle space. No source files were edited by this QA; the app was not deployed. This is local candidate evidence, not canonical-production availability or audio-listening evidence.

## Replay evidence

| Viewport | Completed ordinary Starter run | Ordinary same-viewport replay | Outcome |
|---|---|---|---|
| 1280×800 | Seed `718123875`; Dino Park Picnic → Moon Camp → River Valley → Robin’s Tree | Seed `2862541608`; first scene Moon Camp | First scene differs immediately; replay left after recording the first scene. |
| 390×844 | Seed `1267416720`; Dino Park Picnic → River Valley → Robin’s Tree → Moon Camp | Seed `2880826730`; first scene Robin’s Tree | First scene differs immediately; replay left after recording the first scene. |

The numeric seeds come from the actual Grown-ups → Game troubleshooting → Download game log UI exports. The displayed scene titles and run order come from the game UI snapshots and screenshots. The browser's default download filename was `amari-game-diagnostics.json`; the later retained UI downloads were saved with unique absolute paths using the Playwright download event's `saveAs`. [desktop-diagnostics-ui-export-20261003.json](desktop-diagnostics-ui-export-20261003.json) and [mobile-diagnostics-ui-export-20261003.json](mobile-diagnostics-ui-export-20261003.json) each contain the completed-run and replay `game: "puzzle"` start events and their expected seed pair. Verified in the retained files: desktop IDs/seeds are `puzzle`/`718123875` and `puzzle`/`2862541608`; mobile IDs/seeds are `puzzle`/`1267416720` and `puzzle`/`2880826730`. The earlier copies [desktop-diagnostics.json](desktop-diagnostics.json) and [mobile-diagnostics.json](mobile-diagnostics.json) are byte-identical to the UI downloads (SHA-256 respectively `5e67118501aa8dc1f98fb5d0b7302acaab3b88ae8cea0d6a94ad1e26b307225b` and `7180fb97badbda0e078ccdcfc5006712f4fd463467b5a1b3e30325c94ebcc4be`). There are **two actual combined UI export downloads, not four separate per-run exports**; the other two retained files are byte-identical copies. The retained UI export format includes the session event history, so per-run files cannot be recovered without rerunning or altering the event log.

Screenshots document each completed scene and the first replay scene: [desktop set](desktop-picture1-complete.png), [desktop replay](desktop-replay-picture1.png), [mobile set](mobile-picture1-complete.png), [mobile replay](mobile-replay-picture1.png). UI snapshots for scene starts and replay headings are retained alongside them. No replay was run to completion because each first scene already proved a different order.

## 390px visible-control and width measurements

Rendered button bounds were read from the live DOM at 390px, with `document.documentElement.scrollWidth` also recorded. The document width stayed 390px on both the intro and gameplay screens. Every visible button measured in the intro, active picture, scene fact card, and chapter reward was at least 48×48px:

- Intro: chapter selectors 310×76; Start chapter 204×56; Back to learning world and sound toggle 48×48.
- Active picture: Hear again 230×48; four puzzle spaces 128×128; Hint 88×48; tray pieces 51×51; Back and sound 48×48.
- Scene fact card: Next picture 162×48; Back, sound, and Hear again 48px high or larger.
- Chapter reward: Next chapter 167×48; Replay pictures 188×48; Back, sound, and Hear again 48px high or larger.

The header exit button was observed at 48×48 and opened the normal leave confirmation. The two leave-confirmation choice buttons were not separately rectangle-measured. No 3×3 or 5×5 controls were entered or measured.

## Diagnostics and boundary

Both browser consoles reported zero messages, errors, or warnings. The captured static-request lists showed the JS, CSS, and loaded picture assets returning HTTP 200; packaged MP3 requests returned HTTP 200 or 206 (range response). The retained nonstatic request inventories contain no entries beyond the tool's static-request omission note, so no provider or other nonstatic request was recorded in either session. They are saved as [desktop inventory](desktop-nonstatic-request-inventory.txt) and [mobile inventory](mobile-nonstatic-request-inventory.txt); the corresponding static inventories are retained beside them.

**Interception limitation:** the route patterns registered before navigation were `**/api/voice/**` and `**/api/story/**`. They cover descendant paths but do not match the bare `/api/voice` or `/api/story` paths. The saved browser request inventories show zero nonstatic/API requests in either session, with no actual provider endpoint request recorded; however, bare endpoints were not blocked by the routes themselves. This does not certify audible quality or physical device output.

The replay-order pairs are closed for the **local candidate only**. This report adds no production acceptance, no 4.5/5 score, and no all-26 quality claim. The pre-existing recorded local offline-manifest/audio-worker changes in the shared worktree were left untouched.
