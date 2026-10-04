# Spot the Difference renderer repair QA — frozen candidate 5332

Date: 2026-10-04
Candidate origin: `http://127.0.0.1:5332`
Frozen source SHA: `b032b081d60dedfa86eab831b3d76822fafe67fe`
Identity manifest: [candidate-identity.json](candidate-identity.json)
Previous renderer regression: [5329 rejection](../spot-treehouse-real-objects-5329-review-20261004/report.md)

## Scope and verdict

This is an independent rendered-browser regression check for the crop/clipPath fix on the four Starter scenes and Growing’s Treehouse Team scene, at 1280×800 and 390×844. It does not retest Safari, Observatory, or Pattern Parade as visual-art acceptance; those are separately assigned. It does not replace the retained full progression/content baseline, and it is not a production run.

**The repaired shared renderer passes the checked Starter and Treehouse visual/input deltas.** The five intended Treehouse changes are visible and individually hittable at both widths. The four Starter variants are visually distinct and their three changes per scene were found in ordinary play on desktop and mobile. On mobile, a River Valley bridge tap and Moon Camp porthole tap needed a correctly aligned, settled viewport; the corrected taps succeeded. No target defect was confirmed. All stated completion facts remained held until the visible Next action.

The previous 5329 failure remains part of the record: its nested `<g>` inside `clipPath` left the color edits invisible. Candidate 5332 changes that renderer structure; this report confirms the visual effect for the scoped scenes only. It does not claim every Spot asset or chapter has passed.

## Method and safety boundary

Each gameplay run used a fresh Playwright profile, sound was turned off through the visible control, and chapter/pair access was earned through normal UI controls. No seed, answer, storage, or progress state was injected. No provider job or child-data endpoint was used.

For the guarded verification session, the browser started at `about:blank`; a single Playwright run registered local `204` fulfill handlers for `**/api/voice**` and `**/api/story**` before its first navigation to 5332. No `/api/voice` or `/api/story` requests appeared in the recorded request list or page resource entries. The CLI `route-list` output does not enumerate these script-installed page handlers (it returned “No active routes”), so the no-provider conclusion is limited to the guarded navigation procedure plus the absence of observed requests; the CLI list itself is not independent confirmation of those handlers.

## Results

### Starter scenes

| Scene | Desktop 1280×800 | Mobile 390×844 | Evidence and notes |
|---|---|---|---|
| Superhero City | All three visible edits found by pointer; blank tap rejected. Held community fact shown before Next. | All three visible edits found by pointer after scrolling to Picture B; a tap on the wrong awning subregion was rejected before the corrected awning tap. Held fact and Next shown. | [Desktop](screenshots/desktop-superhero-city.png), [mobile](screenshots/mobile-superhero-city.png) |
| Dino Park | Purple dinosaur, teal flower, orange sun visible; all three hit by pointer; blank tap rejected. Held fossils fact. | Same three bounded edits visible; head, flower, and sun all hit by pointer; blank tap rejected. Held fossils fact. | [Desktop](screenshots/desktop-dino-park.png), [mobile](screenshots/mobile-dino-park.png) |
| River Valley | Crescent moon and yellow flower were hit by pointer; the bridge change was completed using the visible “Check middle middle detail” control after a guessed tap missed. Held river fact. | In the first pass moon and flower were hit, then the bridge completed through its visible labelled control after a misaligned tap. In a normal replay with the page scrolled/settled, all three were hit by pointer: bridge center, moon, flower. Held river fact. | [Desktop](screenshots/desktop-river-valley.png), [mobile](screenshots/mobile-river-valley.png) |
| Moon Camp | Green porthole, orange rover panel, and green habitat window visible; all three hit by pointer. Held Moon fact. | Green porthole, orange rover panel, and green habitat window visible. Initial taps happened before the scroll position settled and missed; after replay, the 56×56 “Check left top detail” target was measured over the visible porthole, and taps on the porthole, panel, and habitat window completed 3/3 by pointer. No target defect confirmed. Held Moon fact. | [Desktop](screenshots/desktop-moon-camp.png), [mobile](screenshots/mobile-moon-camp.png), [settled mobile target](screenshots/mobile-moon-hit-region.png) |

The images show the A/B composition after the crop normalization repair. On mobile the two pictures stack and the user scrolls vertically; the final document width stayed 390 CSS px (no horizontal overflow). On desktop it stayed 1280 CSS px.

### Growing — Treehouse Team

Normal UI progression unlocked Growing. Desktop reached Treehouse after completing the earlier pairs through visible `Check … detail` controls; mobile reached it as the first Growing pair and continued through the other three via the same visible controls. Those shortcut completions establish ordinary progression only; this is not visual acceptance of the intervening art.

At both widths the Treehouse A/B pair displayed all five intended localized edits without an obvious half-painted edge or spill:

1. left blue arrow block to magenta, arrow glyph retained;
2. right green up-arrow block to cyan, arrow glyph retained;
3. terracotta pot to teal, plant/leaves retained;
4. robot eyes and smile to pink, face silhouette retained;
5. red shelf-house roof to blue, shelf/house form retained.

At 1280×800 all five changed objects were tapped from their rendered positions and completed 5/5. At 390×844, the Picture B image was scrolled fully into view; a blank sky-area tap was rejected; both magnifier hints were used and gave distinct “middle area” then “right area” guidance; then the five actual objects were tapped (roof, pot, robot face, left block, right block) and completed 5/5. The fact “Taking turns helps everyone share a game or a job.” remained visible on the completion card with an explicit Next picture button. The mobile document had no horizontal overflow.

Evidence: [desktop pair](screenshots/desktop-treehouse.png), [desktop held completion](screenshots/desktop-treehouse-complete.png), [mobile full pair](screenshots/mobile-treehouse-pair.png), [mobile held completion](screenshots/mobile-treehouse-complete.png).

### Reload, identity, and browser health

After both Starter and Growing each displayed 4/4 completed pairs on the mobile run, a reload returned to the Spot map and retained both chapter counts; Growing’s next chapter remained unlocked. The desktop reload also returned to the map with both 4/4 counts and the next chapter unlocked. See [mobile reload map](screenshots/mobile-reload-map.yml) and [desktop reload map](screenshots/desktop-reload-map.yml).

All 14 paths in the frozen identity manifest returned HTTP 200 from 5332 and matched both byte count and SHA-256, including the index, runtime JS/CSS, four Starter art assets, and Treehouse/Safari assets. The manifest provides the exact per-file digests.

The Playwright console had zero messages (errors 0, warnings 0) for the checked mobile session. Desktop console likewise had zero messages. No `/api/voice` or `/api/story` entries appeared in either session’s request/resource list. Native narration was not assessed; sound was muted, and no listening/audio acceptance is claimed.

## Limits

- No Safari or Observatory art/input acceptance claim; another reviewer owns those deltas. Pattern Parade is a separate frozen candidate.
- No exhaustive scan of all 12 scenes, all target dimensions, or every game control class.
- No packaged-audio listening, clip-readiness, production deployment, or 4.5 acceptance claim.
- These results are local to immutable candidate 5332 and its identity hashes.
