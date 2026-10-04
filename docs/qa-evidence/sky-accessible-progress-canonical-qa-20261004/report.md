# Sky Shapes accessible progress copy — canonical narrow QA

**Run date:** 2026-10-04 (Europe/London)

**Canonical URL:** <https://dinospace-eight.vercel.app>

**Deployment:** `dpl_31hURucAfoMNNhQMJpKBGvcAkX6u` (READY)

**Frozen source:** `2923ca6e10c46609504f41529bf46286e17f8434`

**Identity evidence:** [`sky-accessible-progress-canonical-identity-20261004.json`](../sky-accessible-progress-canonical-identity-20261004.json)

This report independently checks the promoted Sky Shapes accessible-progress wording on the exact canonical alias. It is a narrow delta, not a full Sky recertification or Batch 2 acceptance.

## Identity and test setup

Before app navigation, I re-fetched the eight identity-listed runtime/index files from the canonical host. All returned HTTP 200 and matched their expected SHA-256 values: `index.html`, `sw.js`, the Solar System, Count the Stars, main, web and Letter Trace bundles, and CSS. The identity JSON binds these exact bytes to source `2923ca6e10c46609504f41529bf46286e17f8434` and deployment `dpl_31hURucAfoMNNhQMJpKBGvcAkX6u`.

Two fresh Playwright browser sessions used 1280×800 and 390×844 viewports. They began at `about:blank`; before navigating to the app, each installed `/api/voice` and `/api/story` routes returning HTTP 204. Route lists confirmed the guards. No provider endpoint was called. Sound stayed off. Both sessions used ordinary visible profile → Creative Lab → Sky Shapes navigation and normal mission selection. No storage, answer, seed, progress or hidden-guide injection was used.

## Desktop keyboard flow — 1280×800

The fresh profile opened Cloud Meadow with 0/4 flights saved and the other two skies locked. The ordinary queue selected **Round Sun** at 0%. The visible keyboard instruction directed the player to focus the outline, press Enter to begin, then use Space, Enter or an arrow key. The focused element was the rendered SVG `application` board, named “Tracing board for Round Sun. Start at the numbered circle and follow the glowing dots to the checkered flag. Press Enter, then Space or an arrow key to trace.”

Enter began the trace; actual Space presses advanced the visible meter through 31%, 62%, 93%, then completion. The active progress copy was **“Part 1 of 1. Follow the glowing dots to the flag.”** A direct rendered-DOM check found this progress node had `aria-live="polite"`. Completion exposed **“Flight finished. Your stars are saved.”** The finished flight showed 100%, 2/3 accuracy stars, the Shape idea fact, and **“2 new stars added to your collection!”** The fact and reward were present before **Next mission**. Next advanced to Window Cloud at 0%, retaining 1/4 saved. The separate leave-game dialog appeared from **Back to learning world**; confirming **Back to world** returned to Creative Lab.

## Mobile pointer flow — 390×844

The fresh mobile profile opened Cloud Meadow at 0/4 and ordinary selection started **Window Cloud**, Flight 1/4. The visible instruction identified a square outline, green numbered start, glowing dotted route and checkered finish. I followed the visible square perimeter with actual pointer down/move/up input; no guide coordinates or app state were read. The flight completed at 100%, 3/3 accuracy stars. The accessible page snapshot showed the completion text **“Flight finished. Your stars are saved.”** The result held the Shape idea fact (“A square has 4 equal straight sides and 4 corners.”), and **“3 new stars added to your collection!”** before Next.

Next advanced to Mountain Peak at 0% with 1/4 saved. **Back to learning world** opened the expected **Leave the game?** confirmation; **Back to world** returned to Creative Lab. The mobile screenshot captures the active visible square and the completed flight. This was browser pointer testing at a 390px viewport, not testing on a physical touch device.

## Runtime checks and result boundary

Both browser consoles reported zero messages, errors or warnings. The mobile network inventory showed successful static/image requests and a few audio-file range requests (HTTP 206); this was not an audio playback or listening test. No other app API calls were observed. The route guards remained active through the run.

The bounded canonical desktop keyboard and mobile pointer checks passed: active guidance is exposed in a polite live region, completion replaces it with a clear saved-flight announcement, and held fact/reward/Next plus the confirmed parent-world return remained available. This closes only the canonical copy delta. It does not cover every Sky mission, multipart/replay paths, interruption, physical-device touch, audio quality, the full 390px Batch 2 control sweep, or the remaining mandatory 4.5 acceptance gates.

## Screenshots

- Desktop: [`sky-round-sun-initial.png`](desktop/sky-round-sun-initial.png), [`sky-round-sun-finished.png`](desktop/sky-round-sun-finished.png)
- Mobile: [`sky-map.png`](mobile/sky-map.png), [`sky-window-cloud-active.png`](mobile/sky-window-cloud-active.png), [`sky-window-cloud-finished.png`](mobile/sky-window-cloud-finished.png)
