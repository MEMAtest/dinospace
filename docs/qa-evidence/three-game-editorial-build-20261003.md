# Three-game editorial candidate build report

## Scope

This source-only pass updates Puzzle Pop, Spot the Difference, and Sky Shapes. It retains the existing game IDs, scene/mission identities, queues, reward rules, authored spoken text, and narration corpus keys.

- **Puzzle Pop:** the active header keeps the complete scene title on its own wrapping line with chapter and picture position below. In the first Challenge picture, the existing hint action now explains and shows how the selected piece's square in the preview maps to its glowing board space. It uses the ordinary hint count, event, and packaged narration path; it does not place a piece.
- **Spot the Difference:** the twelve scenes bind to the aligned scene art, including the dedicated Sound Safari animals and existing River Valley/Moon Camp art. Alt text now describes the visible Time, History, Sound Safari, and new scenes. The seven Challenge differences per scene use paired scene props with count, shape, or orientation changes; Starter and Growing retain their existing difference templates and behavior.
- **Sky Shapes:** the active board header identifies the mission and part count without repeating a generic tracing instruction. The numbered start remains, and finish markers are offset checkered flags with position selection that keeps each flag inside the board and clear of the numbered start.

## Verification

- Focused Sky Shapes and Spot tests: **20 passed**.
- Full test suite: **171 passed, 0 failed**.
- ESLint: **passed**.
- Production build: **passed**.
- `git diff --check`: **passed**.

The build emitted the existing stale `caniuse-lite` database notice and Vite's chunk-size warning. Neither prevented the build.

## Limits

This is local source/build evidence. It is not an actual browser review, production deployment or acceptance, or an assessment of audio quality. Independent UI review is still required for mobile layout, the Puzzle preview-to-board demonstration, and the visual clarity/alignment of the new Spot props and Sky markers.

## Spot Challenge target placement follow-up

During independent review, the initial scene-specific Challenge placements were found to put the History Hall book and compass 7% apart horizontally at the same vertical position, causing their 56px hit targets to overlap. All Challenge prop pairs now use the established safe seven-position layout. A regression test checks every Challenge scene at a 280×210 frame: targets remain fully inside the frame and no pair of 56px target rectangles intersects. This data-level check supplements, but does not replace, the requested actual browser retest.
