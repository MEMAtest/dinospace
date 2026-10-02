# Production health — 2 October 2026, 01:06 heartbeat

Checked approximately 01:07–01:13 UTC using an isolated Playwright browser session `health-0106`.

## Deployment identity

Vercel reports canonical alias `dinospace-eight.vercel.app` on READY deployment `dpl_7mvY5HPtQ6mMBvmEnPVddGumThyn`, Git SHA `aeea9e7167d9beb1c52e11e3b6643cb330975bc6`. Rendered bundle `index-D6fYZHfF.js` and CSS `index-BH3dde_v.css` match the preceding healthy release.

## Actual controls exercised

- Selected Amari, entered Read & Write, opened Letter Launch and started level 1.
- Desktop: replayed the clue, chose S for Sun. Correct feedback remained visible at 1/6 until Next mission was clicked.
- Resized to 390 × 844, clicked Next mission, replayed the next clue, and chose T for Top. Correct feedback remained visible at 2/6; no reset to the first question occurred.
- Clicked Back to learning world, then Back to world in the leave confirmation. Arrived at `#/world/read-write`.

## Diagnostics

- Mobile document width: 390 px; no horizontal overflow.
- No incomplete or broken rendered images.
- Browser console: 0 errors, 0 warnings.
- All 19 observed requests succeeded (200 or 206), including the two Letter Launch narration assets.
- Closed this QA session after checking. Real child data was not accessed or altered; no stories or paid voice calls were generated.

## Result and limits

Healthy and unchanged for this rotating sample; no notification required. Narration controls and successful audio requests were checked, but physical speaker output was not verified. This small sample does not establish full-game completion, every level, or acceptance of the entire 4.5 quality roadmap. Batch 2 remains separate local work.
