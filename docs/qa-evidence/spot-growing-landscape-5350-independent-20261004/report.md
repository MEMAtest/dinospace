# Time Observatory independent UI check — 2026-10-04

## Candidate and scope

- Frozen origin: `http://127.0.0.1:5350`
- Candidate source: `77940e9d4b7400cdd0c2796205790da58ce06cfa`
- Candidate identity: `docs/qa-evidence/spot-growing-landscape-identity-20261004.json`
- Tested in a fresh Playwright profile, initially at `about:blank`. `/api/voice` and `/api/story` route guards were installed and verified before first app navigation and after navigation. Sound was turned off using its visible control.
- Earned Bright-Eyed Beginners 4/4 through visible UI controls, then tested Time Observatory, Curious Comparers Pair 1. This is a bounded scene/control delta, not a complete Spot the Difference journey or 4.5 acceptance.

## Rendered visual and controls

At 1280×800 and 390×844, the rendered landscape pair retained the complete observatory scene. The five edited details were visible in Picture B: the hanging planet disc changed gold to cyan/blue; the Earth globe’s oceans changed blue/green to purple; the telescope barrel changed to a brighter blue; the top book cover changed blue to red; and the hourglass sand changed from purple to orange/pink. The telescope change was the least prominent of the five, but remained visible in the normal 390px rendering. I saw no obvious color spill, detached patches, fringe, or clipping around these details.

The five visible target regions corresponded to right-bottom (hourglass), left-middle (globe), middle-bottom (books), left-top (hanging planet), and right-middle (telescope). Each accepted a real click and advanced the visible count exactly once to 5/5. Clicking the visible general search region first produced “Not that spot yet. Compare the same area in Picture A.” and kept the count at 0/5. The visible magnifier provided a right-bottom clue; using that clue and selecting the matching region advanced the count to 1/5.

At 5/5 the app displayed the Time Observatory completion fact, “Earth turns once each day, bringing daylight and darkness,” and a “Next picture” button. Next advanced to Pattern Parade Pair 2 at 0/5. Reload then returned to the chapter picker and retained Curious Comparers at 1/4. I did not continue into Pattern Parade.

At the 390px chapter-picker state after reload, `document.documentElement.scrollWidth` equaled the 390px viewport width (no horizontal overflow). Back and sound controls measured 48×48px; chapter choices were 310×76px and Replay chapter was 220×56px. The page height fit the 844px viewport. Console reported zero errors and zero warnings. The only network requests observed were app/static assets; no voice/story API request occurred. All 11 files listed in the candidate identity JSON matched the served bytes and SHA-256 hashes.

## Evidence

- `screenshots/desktop-initial.png` — untouched desktop pair.
- `screenshots/mobile-initial.png` — untouched mobile pair.
- `screenshots/mobile-complete.png` — mobile 5/5 completion fact and Next control.

The frozen runtime and source were not modified. This report does not establish narration playback, human listening, the other three Time Observatory-independent pair contents, all 12 pairs, production behavior, or full 4.5 acceptance.
