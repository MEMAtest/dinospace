# Independent Party-decoration Memory QA

**Candidate source:** `eb869cd76eebbe906afc59bd55a9f54c67eb1307`  
**Frozen origin:** `http://127.0.0.1:5317`  
**Frozen dist:** `tmp/batch7-memory-party-decorations-final/dist`  
**Identity:** `docs/qa-evidence/batch7-memory-party-decorations-identity-20261004.json`

## Scope and procedure

Independently checked the four Party & Treats art additions—Balloon, Party popper, Cake and Sweet—on Amari Memory Match Level 4. This is a bounded illustration delta, not a full Memory review, audio assessment, production check, human/device sign-off, or 4.5 acceptance.

Opened a fresh isolated Playwright CLI session at `about:blank`, installed `**/api/voice` and `**/api/story` routes returning 403, and confirmed both with `route-list` before navigating to port 5317. Chose Amari using the visible profile chooser, entered Thinking & Play → Memory Match, and earned Forest Friends, Ocean Splash and Space Sparkle through actual card flips and visible Next controls. Completed Party & Treats normally at each tested viewport. The helper reads each card’s accessible name only after an actual flip and waits for rendered match/face-down feedback. Sound remained off. No stored progress, seeds, hidden fronts, React state, or provider calls were used.

## Results

| Viewport | Face-down board | Completed board |
| --- | --- | --- |
| 1280×800 | Party & Treats: 24 cards, all 24 face down, zero mounted images, document width 1280. Cards were 182×182px; Level 4 selector was 48×48px. | Completed 12 pairs. Both flipped copies of Balloon, Sweet, Cake and Party popper had the expected accessible names, the corresponding four candidate asset URLs, and loaded images. All cards remained within the 1280px document width. |
| 390×844 | Party & Treats: 24 cards, all 24 face down, zero mounted images, document width 390. Cards were 82×82px; Level 4 selector was 53.5×48px. | Completed 12 pairs. Both flipped copies of each new token used its corresponding expected image and accessible name. The four illustrations are visually distinct, captions fit on the small card, art and caption rows remain separated, and document width stayed 390px. |

The Sweet source art is 512×256; Balloon, Cake and Party popper are each 512×512. At mobile size, the four revealed image boxes were each 63.36×30.41px inside 82×82px cards. Full-page screenshots show Balloon, Party popper, Cake and wrapped Sweet as different objects with no caption overlap.

Screenshots in this folder:

- `party-desktop-facedown.png`, `party-desktop-fullpage.png`
- `party-mobile-facedown.png`, `party-mobile-fullpage.png`

## Reload, network and identity

Reloading at mobile width returned to the existing Amari Memory journey; Dinosaur Discovery was selected as the next unlocked level, and the Level 4 Party & Treats selector remained enabled. Selecting that visible level button returned to 24 face-down Party cards with zero images, confirming the earned unlock survived reload.

The two 403 endpoint guards stayed installed; the browser request list showed no voice/story requests. Console errors, warnings and other messages: zero. Every path in the frozen identity report was fetched from port 5317 and compared to both the report and frozen dist. Root HTML, JS, CSS and all four new WebPs matched the expected and frozen SHA-256 values.

The builder-recorded read-only inventory reports 64 of 87 unique Memory tokens illustrated after this delta, with 23 remaining. This independent Party-art check did not audit that full inventory. Narration readiness, Askia parity, broader human/device acceptance, production and overall quality scoring remain open.
