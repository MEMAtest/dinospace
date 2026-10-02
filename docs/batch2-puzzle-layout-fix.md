# Puzzle Pop layout repair evidence

## Change

The 5282 QA report identified almost blank tray pieces, the board and tray below the 1280×720 viewport, and a mobile collision between Hint and the floating mission control. The blank art came from constructing unquoted CSS `url(data:image/svg+xml,...)` values: punctuation in the SVG data URL made the CSS declaration invalid in Chromium. Tile backgrounds now quote the URL. The preview and gameplay column also use a compact small-screen scene preview, a viewport-aware board cap, and an auto-filled tray whose tiles retain 48px minimum dimensions. The 5×5 board uses a smaller height cap so its tray can stay near the viewport.

The mission launcher collision is owned by the root integration; it was not edited here. In this isolated Vite session the launcher was not visible. Independent frozen-preview QA must confirm the integrated layout after root produces its new candidate.

## Browser check

Used a separate Playwright CLI session at `http://127.0.0.1:5184` on the current working tree, profile Amari, using visible UI controls. This is a development preview, not 5282 and not release evidence.

- At 390×844, the 2×2 board measured 280×280 at y=408–688. Hint remained visible, the four tray buttons measured about 50.7×50.7 at y=776–827, document width was 390, and content ended at y=843. The compact preview retained the scene image, skill cue, Hear again control and four-step chapter indicator.
- At 1280×720, the 2×2 board measured 340×340 at y=160–500. The tray buttons appeared at y=592–641, its container ended at y=661, document height stayed at 720, and width stayed at 1280.
- The SVG based River Valley thumbnail now showed clear sky, river and dinosaur crops. Through UI controls, selected “Choose piece 2” and placed it in “Puzzle space 2”; the board rendered the expected visible top-right image crop and the tray showed the remaining recognizable pieces.
- Screenshots: `.playwright-cli/page-2026-10-01T10-01-35-661Z.png` (390×844), `.playwright-cli/page-2026-10-01T10-01-55-123Z.png` (1280×720), and `.playwright-cli/page-2026-10-01T10-02-16-689Z.png` (placed piece).

## Checks and limits

- `npm test`: 128 passed, 0 failed.
- Focused ESLint on Puzzle Pop component/data/test: passed.
- `npm run build`: passed; Vite still reports large-chunk and stale Browserslist advisories.
- `git diff --check -- src/components/games/PuzzlePlay.jsx`: passed.
- Did not complete a chapter, test the 3×3/5×5 boards in a rendered browser, or verify the integrated floating mission control. Independent QA must rerun those on a newly frozen preview and must not reuse the 5282 pass record for these fixes.
