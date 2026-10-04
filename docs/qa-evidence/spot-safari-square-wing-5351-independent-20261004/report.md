# Independent Spot Sound Safari square-frame review — scoped visual pass

Date: 2026-10-04
Candidate: `http://127.0.0.1:5351`
Frozen source: `aea335f28ba5c0143349baedd43cb44a49be39ea`
Frozen dist: `tmp/spot-safari-square-wing/dist`
Identity: [`spot-safari-square-wing-identity-20261004.json`](../spot-safari-square-wing-identity-20261004.json)

## Guarded ordinary-play method

A fresh Playwright profile started at `about:blank`; `/api/voice` and `/api/story` guards were installed and listed before navigation. I used `goto` to enter the candidate and confirmed both guards remained listed after navigation. Before selecting Amari I acted only on the visible `Turn sound off` button; the game then showed `Turn sound on` throughout play, confirming the sound-off state. No voice/story API or `/audio/` requests appeared in the request log. Console errors and warnings: 0.

I entered Thinking & Play → Spot the Difference through visible controls and completed all four Bright-Eyed Beginners pairs with visible answer targets. Curious Comparers unlocked normally. The first Growing queue showed Pattern Parade, Treehouse Team, Time Observatory, then Sound Safari. After reload and normal chapter replay, the order changed; this review did not inject queue/progress/answer state. I completed Time Observatory and Treehouse Team with visible targets to reach/recheck the scenes. No child data, hidden answers, local storage, seeds, or provider calls were inspected or injected.

## Safari art at both widths

Sound Safari Pair 1 was reviewed before interaction at 1280 × 800 and 390 × 844. Picture B clearly shows all five intended edits without using a hint or answer control:

1. Elephant’s nearer ear changes from pink to turquoise.
2. Parrot’s larger left-wing feathers change from blue to purple.
3. Monkey’s belly changes from tan to blue.
4. Frog’s skin changes from green to blue.
5. Elephant’s toenails change to blue-green.

The square scene frame restores the parrot’s full position and makes the wing edit easy to compare at 390 px; the former tiny tail patch at the crop edge is no longer the target. At both tested widths, the recolours remain on their objects. I saw no obvious edge spill, detached colour islands, or mask fringe. The full mobile screenshot shows both complete square scenes in the normal page layout, with no horizontal overflow. The desktop viewport screenshot shows the same full-scene artwork and all five edits; its page continues below the 800 px viewport because the scene frame is square.

The five actual Picture B controls align with those regions: right-top (wing), left-middle (ear), right-middle (belly), right-bottom (frog), middle-bottom (toenails). Each scored correctly at 390 px. A center click on the visible Picture B search surface produced “Not that spot yet” and left progress unchanged at 1/5. The magnifier displayed “look near the middle bottom of Picture B”; that control’s target also scored. Completion displayed the picture fact and held `Next picture` before it advanced.

| Viewport | Scene layout | Document width | Result |
| --- | --- | ---: | --- |
| 1280 × 800 | Full square scene frame, continuing below viewport | 1280 px | Five edits all discernible; target artwork aligned |
| 390 × 844 | Full square A/B images stacked, each 334 × 334 px | 390 px | Five edits all discernible; no horizontal overflow |

All five visible B answer buttons measured 56 × 56 px at 390 px. The wing target was the first accepted target; the center miss did not increment progress; four further accepted target buttons completed 5/5. The hint, feedback, fact, and held-Next path worked in the same run.

## Default 4:3 layout regression check

A Bright-Eyed Beginners Superhero City pair and a Curious Comparers Treehouse Team pair were each rendered at desktop and mobile widths. Both retained a 4:3 picture box rather than the Safari square frame:

- Desktop pictures: 580 × 435 px at 1280 × 800.
- Mobile pictures: 334 × 250.5 px at 390 × 844.
- Document width matched the viewport at both sizes. Visible answer targets measured 56 × 56 px on mobile.
- Treehouse Team accepted a visible correct target on mobile and a second correct target on desktop; the remaining visible targets completed the 5/5 pair.
- Superhero City accepted visible correct targets at mobile and desktop.

The screenshots show the full 4:3 artwork without visible stretching or horizontal crop. This is a narrow regression check for one Starter scene and Treehouse Team, not a full review of all default scenes.

## Persistence, identity, and limits

A normal page reload returned to the chapter selector while preserving visible progress (Bright-Eyed Beginners 4/4 and Curious Comparers 4/4). Selecting/replaying chapters remained available. `Back to learning world` opened the normal “Leave the game?” dialog; choosing `Back to world` returned to Thinking & Play. The synthetic QA profile was created solely through ordinary UI controls.

All 8 paths in the frozen identity record returned HTTP 200 with matching byte counts and SHA-256 hashes. The API guards were present before and after app navigation. No provider calls, voice/story API calls, or audio requests were observed. This is a local candidate-specific rendered QA result. It does not establish human listening, production behavior, full Spot chapter coverage, other scene acceptance, or overall 4.5 acceptance.

## Evidence

- [Sound Safari, desktop 1280 × 800, before interaction](safari-desktop-1280-initial.png)
- [Sound Safari, mobile 390 × 844, full page, before interaction](safari-mobile-390-initial-full.png)
- [Starter Superhero City, desktop 4:3](starter-superhero-city-desktop-4x3.png)
- [Starter Superhero City, mobile 4:3](starter-superhero-city-mobile-4x3-full.png)
- [Treehouse Team, desktop 4:3](treehouse-desktop-4x3.png)
- [Treehouse Team, mobile 4:3](treehouse-mobile-4x3-full.png)
