# Puzzle Pop 5207 Challenge crop regression

**Result:** the bounded 5×5 crop/target checks passed at desktop 1280×800 and mobile 390×844. Puzzle Pop remains a local candidate, not accepted at 4.5. The mobile Nature Lab art/fact mismatch below remains open.

## Candidate and method

- Candidate URL: `http://127.0.0.1:5207`
- Source: `35ee3f7b9b62379bc5440c05869bc2619f4d3379`
- JS: `index-BRWRMlSS.js`, SHA-256 `5c80e07695cc9670b168b13f507bbfc350ed96d21fa660b38e9bcb8166944ef1`
- CSS: `index-D3NTSs-Z.css`, SHA-256 `008707f972ebe009fcbfcf5aa50207cc0c8a381f3f4e89fa1d22194374a681db`
- Sessions reused: `puzzle-crop-5207-desktop-20261003` and `puzzle-crop-5207-mobile-20261003`; both were fresh isolated contexts before initial navigation. The `/api/voice` and `/api/story` route guards were set before navigation, and sound was muted in the UI. No progress, seed, answer, or unlock state was injected.
- Setup: completed all four Growing 3×3 pictures per viewport by using visible Hint, Choose piece, and highlighted Puzzle space controls (36 placements per viewport). Challenge unlocked through normal progression.
- Scope: only this narrow crop, geometry, and held-fact delta. The retained full 24-row baseline was not replayed and the full 12-picture asset/fact catalog was not reviewed.

## 5×5 results

Each viewport completed the first selected Challenge picture and portrait Time Observatory using ordinary hinted UI placements, 25 placements per picture. Both then advanced to wide World Explorer and placed one hinted piece for a visible preview/board crop comparison.

After these completions, the chapter map showed Picture Pioneers `2×2 · 4/4`, Curious Constructors `3×3 · 4/4`, and unlocked Detail Detectives `5×5 · 2/4` at both widths. The challenge button remained enabled at desktop `216×76px` and mobile `310×76px`; map document width remained 390px on mobile. See `desktop-challenge-unlocked-map.png` and `mobile-challenge-unlocked-map.png`.

| Viewport | Completed wide picture | Completed portrait picture | Wide partial picture | Board targets | Tray targets | Horizontal overflow |
|---|---|---|---|---:|---:|---|
| Desktop 1280×800 | History Hall, `1672×941` | Time Observatory, `941×1672` | World Explorer, `1672×941`, 1/25 placed | 25, minimum `68.80×68.80px` | 25, minimum `49.47×49.47px` | None; document width 1280px |
| Mobile 390×844 | Nature Lab, `1944×809` | Time Observatory, `941×1672` | World Explorer, `1672×941`, 1/25 placed | 25, minimum `48.80×48.80px` | 25, minimum `50.66×50.66px` | None; document width 390px |

For World Explorer, preview and board tiles referenced the same image URL and used `object-fit: cover`. The placed desktop tile used a 500%×500% image with left/top offsets `-300%/-300%`; mobile used `-200%/0%`. Screenshots show the placed crop at the matching landmark: desktop the fourth-row/fourth-column lake tile; mobile the first-row/third-column blue-sky tile. All 25 board and tray targets met the 48px minimum and none extended past the horizontal viewport. At mobile width, lower tray rows sit below the initial fold and are reachable by ordinary vertical page scroll. The completion card showed a single held Picture fact and a `161.75×48px` Next picture target. The visible leave dialog measured Keep playing `96×96px`, Back to world `80×80px`, both in bounds at each viewport.

## Remaining content defect

Mobile Nature Lab displayed three animal cutouts (bluebird, green lizard/frog-like animal, orange cat) while its alt text describes leaves/seeds and its held fact says leaves vary in shape and use sunlight. This is a real artwork-to-fact mismatch on this 5207 candidate, not a crop bug. A dedicated Nature Lab image and matching fact should replace it before 4.5 acceptance. The crop checks do not establish that other artwork/facts agree across all 12 pictures.

## Network, console, and evidence

The sampled local JS/CSS and scene images loaded with HTTP 200. The packaged Matilda MP3 returned 206 Partial Content. No `/api/voice` or `/api/story` call appeared; the pre-navigation route setup is recorded in [route-guards.txt](route-guards.txt). Both challenge console captures report zero messages, errors, and warnings. The Playwright requests listing contains 34 static requests per context and no provider/API entries.

Screenshots:

- `desktop-challenge-start.png`, `mobile-challenge-start.png`
- `desktop-challenge-5x5-complete.png`, `mobile-challenge-5x5-complete.png`
- `desktop-challenge-portrait-time-start.png`, `mobile-challenge-portrait-time-start.png`
- `desktop-challenge-geography-partial.png`, `mobile-challenge-geography-partial.png`

Actual game diagnostics were downloaded through the visible Grown-ups troubleshooting control and saved with distinct paths as `desktop-challenge-delta-game-log-ui-export.json` and `mobile-challenge-delta-game-log-ui-export.json`.

The existing provisional 5207 Puzzle score remains `4.32` (4.4 teaching, 4.5 progression, 4.3 correctness/variation, 4.0 feedback/audio/visual, 4.4 reliability). This bounded regression does not revise or accept that estimate. The Nature Lab mismatch, human listening, canonical production verification, and final editorial acceptance remain open.
