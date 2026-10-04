# Spot the Difference — consolidated production candidate review

**Checked:** 2026-10-04  
**Candidate:** READY deployment `dpl_ACKz7A5eDD8DiCfUptevNEjP5xdV` at `https://dinospace-51fgt6ny5-memas-projects-23a0001d.vercel.app`.  
**Archive/source:** `4fcb80d34bb2e9cfdb587f40ec61f44a6ae75f55`.  
**Canonical:** unchanged during this review (`dpl_2wMjWv6KPJ4QPMKrSJLWinefowDz`).  
**Identity:** [`candidate-identity.json`](candidate-identity.json) records 16 runtime/index files. I independently fetched and SHA-256 checked every entry: all 16 returned HTTP 200 with exact expected byte counts and hashes.

## Method and scope

Used two fresh browser profiles at 1280×800 and 390×844. In each profile I opened `about:blank`, registered `**/api/voice**` and `**/api/story**` guards to return 204, then navigated to the candidate. The route list still showed both guards after navigation. I muted with the visible sound control before starting the game. No provider-generated voice or story data was requested. The saved request logs contain no unguarded `/api/voice` or `/api/story` requests; both browser consoles reported zero errors and warnings.

In each profile, normal play unlocked and completed Bright-Eyed Beginners (3 changes per picture), Curious Comparers (5), and Super Spotters (7), four pictures per chapter. I used the in-picture visible “Check … detail” controls to complete the pairs and advance; I did not use hidden answers, seeds, storage, or injected progress. This validates the production candidate’s combined rendering, chapter progression, band counts, facts and navigation. It does not claim direct pointer hit-area retesting for every target; prior local pointer evidence remains separately scoped.

Each of the 12 rendered Picture A/B pairs was captured at both widths after waiting for both image elements to decode. The fresh profiles received ordinary randomized queue orders; both covered the same four scenes in each band. Screenshots are full-page captures so mobile’s stacked A/B panels are visible together.

## Scene review

| Band | Scene | Desktop A/B | Mobile A/B | Rendered review |
| --- | --- | --- | --- | --- |
| Starter · 3 | River Valley | [desktop](screenshots/desktop/starter-1.png) | [390px](screenshots/mobile/starter-3.png) | Sun/moon, flower and bridge-area changes are visible in the pictured landscape. |
| Starter · 3 | Moon Camp | [desktop](screenshots/desktop/starter-2.png) | [390px](screenshots/mobile/starter-2.png) | Picture pair renders fully; differences are within pictured camp/vehicle details. |
| Starter · 3 | Dino Park | [desktop](screenshots/desktop/starter-3.png) | [390px](screenshots/mobile/starter-1.png) | Long-neck dinosaur and flower changes are visible; no obvious color spill outside the pictured objects. |
| Starter · 3 | Superhero City | [desktop](screenshots/desktop/starter-4.png) | [390px](screenshots/mobile/starter-4.png) | Scene and hero/building details render within the scene bounds. |
| Growing · 5 | Treehouse Team | [desktop](screenshots/desktop/growing-1.png) | [390px](screenshots/mobile/growing-4.png) | Five object changes are visible on the blocks, robot, plant and related props; no detached answer badges. |
| Growing · 5 | Sound Safari | [desktop](screenshots/desktop/growing-2.png) | [390px](screenshots/mobile/growing-2.png) | Animal and parrot details appear as pictured object changes. |
| Growing · 5 | Pattern Parade | [desktop](screenshots/desktop/growing-3.png) | [390px](screenshots/mobile/growing-1.png) | Pennant, arch, balloon, drum and canopy changes read as physical scene details. |
| Growing · 5 | Time Observatory | [desktop](screenshots/desktop/growing-4.png) | [390px](screenshots/mobile/growing-3.png) | Planet/globe/book/hourglass changes render on the depicted props. |
| Challenge · 7 | World Explorer | [desktop](screenshots/desktop/challenge-1.png) | [390px](screenshots/mobile/challenge-2.png) | Map, globe, telescope and binocular changes are visible in the workbench scene; no floating answer badges. |
| Challenge · 7 | Robin’s Woodland | [desktop](screenshots/desktop/challenge-2.png) | [390px](screenshots/mobile/challenge-3.png) | Seven physical-object changes remain visible, including flower/can colors and leaf, daisy, ladybird and worm details; no floating badges. |
| Challenge · 7 | Nature Lab | [desktop](screenshots/desktop/challenge-3.png) | [390px](screenshots/mobile/challenge-1.png) | Plant, seedling, can and leaf details render within the workbench image; no obvious stray mask regions. |
| Challenge · 7 | History Hall | [desktop](screenshots/desktop/challenge-4.png) | [390px](screenshots/mobile/challenge-4.png) | Book, model, compass, stone, lantern, scroll and column changes appear on the physical artifacts. |

Across both widths, the image pairs were legible and remained within their image frames. At 390px the pictures stack vertically, with both images and the numbered progress row in the document; the screenshot review showed no horizontal spill. The numbered “Changes found” markers are status indicators, not additional answer controls.

## Progress and persistence evidence

- Held-fact screenshots: [desktop Starter](screenshots/desktop/starter-held-fact.png), [desktop Growing](screenshots/desktop/growing-held-fact.png), [desktop Challenge](screenshots/desktop/challenge-held-fact.png), [mobile Starter](screenshots/mobile/starter-held-fact.png), [mobile Growing](screenshots/mobile/growing-held-fact.png), [mobile Challenge](screenshots/mobile/challenge-held-fact.png).
- Completion screenshots: [desktop Starter](screenshots/desktop/starter-completion.png), [desktop Growing](screenshots/desktop/growing-completion.png), [desktop Challenge](screenshots/desktop/challenge-completion.png), [mobile Starter](screenshots/mobile/starter-completion.png), [mobile Growing](screenshots/mobile/growing-completion.png), [mobile Challenge](screenshots/mobile/challenge-completion.png).
- After a mobile reload, the Spot chapter map retained 4/4 pairs for all three bands: [map after reload](screenshots/mobile/map-after-reload.png). Back to learning world returned to Thinking & Play; its Spot card showed the played badge.

The new screenshot pass supersedes an initial attempt whose captures were made before image decode and showed empty panels. Those captures were overwritten; all linked scene screenshots in this report were taken after both picture images decoded. No functional failure was observed in this bounded production-candidate pass.

## Limits

This is one immutable candidate and two fresh synthetic profiles. Per-scene progression used visible target controls, so the pass does not recertify direct picture-coordinate hit regions, wrong-tap feedback, or per-scene hint behavior; those mechanics remain supported by the retained local evidence. Muting was deliberate, and no human listening, narration playback quality, clip-readiness, overall 4.5 acceptance, or canonical promotion is claimed. The deployment remained a candidate; this review made no deployment or source changes.

## Browser logs

- [Desktop static requests](desktop-static-requests.txt), [desktop request list](desktop-requests.txt), [desktop console](desktop-console.txt)
- [Mobile static requests](mobile-static-requests.txt), [mobile request list](mobile-requests.txt), [mobile console](mobile-console.txt)
