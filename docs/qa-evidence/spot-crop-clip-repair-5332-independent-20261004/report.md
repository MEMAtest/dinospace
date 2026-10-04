# Independent Spot Sound Safari renderer review — controls pass; mobile visual acceptance held

Date: 2026-10-04
Candidate: `http://127.0.0.1:5332`
Frozen source: `b032b081d60dedfa86eab831b3d76822fafe67fe`
Frozen dist: `tmp/spot-crop-clip-repair/dist`
Identity: [`spot-crop-clip-repair-identity-20261004.json`](../spot-crop-clip-repair-identity-20261004.json)

## Guarded, ordinary UI path

A fresh uniquely named Playwright profile started at `about:blank`. I installed `/api/voice` and `/api/story` request guards, verified both in the route list, then navigated with `goto` and verified they remained installed. I selected Amari by visible UI, entered Thinking & Play → Spot the Difference, and completed all four Bright-Eyed Beginners pairs by clicking the visible hotspot controls. Curious Comparers unlocked through the ordinary chapter control. No progress, answer, seed, or storage state was injected or inspected.

Sound was initially turned off by clicking the visible `Turn sound off` control. At the Spot game screen the toggle correctly read `Turn sound on` (sound off); I mistakenly clicked it, enabling sound, before starting Starter. The guarded profile consequently made 11 local packaged `/audio/en/*.mp3` GET requests (HTTP 200). Whether any clip played to completion was not evaluated. I noticed this after inspecting the request log, turned sound off, and did not use Hear clue. There were no `/api/voice` or `/api/story` requests; the guards remained listed. This profile is not an audio-silent run, and no listening claim is made.

## Renderer and visible art

At 1280 × 800 and 390 × 844, Sound Safari Pair 1 rendered composited colour changes on Picture B. The turquoise elephant ear, blue monkey belly, blue frog skin, and blue-green elephant toenails are plainly visible against Picture A. All five answer targets are present in expected regions and score when activated: left-middle (ear), right-middle (belly), right-bottom (frog), middle-bottom (toenails), and right-top (parrot tail). The normal magnifier control also gave the visible clue “look near the middle bottom of Picture B.”

The fifth, parrot-tail edit is **not reasonably discernible unaided at 390 px**. In the untouched mobile screenshot, each picture is 334 × 250.5 px and the parrot is clipped at the upper edge; its tail/under-branch area is small and partly occluded. A child can score the right-top control, but that does not establish that the edit can be seen. The same tail area is difficult to distinguish in the desktop crop. Treat this as a remaining visual readability defect, not a pass for all five changes. The underlying renderer repair does restore visible overlays for the other edits.

| Viewport | A/B image box | Document width | Result |
| --- | --- | ---: | --- |
| 1280 × 800 | 580 × 435 px each | 1280 px | Four changes clear; parrot tail remains hard to see |
| 390 × 844 | 334 × 250.5 px each, stacked | 390 px, no horizontal overflow | Four changes clear; parrot partly clipped and fifth change not discernible |

## Interaction, persistence, and diagnostics

- Bright-Eyed Beginners completed 4/4 using actual rendered target buttons; completion facts and the held `Next picture` / `Next chapter` controls appeared and advanced only after the visible completion state.
- Curious Comparers Pair 1 reached 5/5 using the five actual hotspot controls. The ordinary magnifier displayed its clue, and the held completion fact appeared before `Next picture` advanced to Pair 2.
- A normal page reload returned to the game’s chapter selector while preserving visible progress at Bright-Eyed Beginners 4/4 and Curious Comparers 1/4. Selecting Curious Comparers retained that earned progress. `Back to learning world` returned to Thinking & Play.
- The pair included rendered emoji changes on the following Time Observatory scene; that scene-specific asset work is outside this renderer/Safari review and is separately assigned.
- Candidate identity: all 14 asset paths in the frozen record returned HTTP 200 and matched recorded byte counts and SHA-256 hashes.
- Browser console: 0 errors, 0 warnings. Voice/story routes remained installed; no voice/story API calls were recorded. Local packaged media GETs are disclosed above.

## Verdict and limits

The 5332 renderer fix is visibly effective for the Sound Safari overlays and the pair’s ordinary hint, answer, feedback, completion, Next, reload-progress, and parent-world navigation paths worked. **Hold full visual acceptance for this pair until the fifth change is discernible without relying on its hotspot at 390 px.** This is a local candidate-specific result. I did not test Sound Safari miss handling, other Growing pairs, Starter/Treehouse regressions, human listening, production behavior, or overall 4.5 acceptance.

## Screenshots

- [Desktop, untouched Sound Safari Pair 1](sound-safari-desktop-1280-initial.png)
- [Mobile full page, untouched Sound Safari Pair 1](sound-safari-mobile-390-initial-full.png)
- [Desktop after visible magnifier hint](sound-safari-desktop-after-hint.png)
