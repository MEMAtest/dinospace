# Puzzle Pop and Spot the Difference: bounded canonical control check

**Run date:** 2026-10-04 (Europe/London)  
**Result:** Bounded visible-control checks passed in fresh desktop and 390 × 844 mobile sessions against the promoted canonical alias. This is separate from the broader Starter/replay run performed on the immutable production candidate.

## Canonical identity and evidence lineage

| Item | Identity |
|---|---|
| Canonical alias | <https://dinospace-eight.vercel.app> |
| Production deployment | `dpl_FjAsdFFoZqPXLM1EbfnLW4Sy59s5` |
| Provider source / audited archive | `2952958fe41de443a8dfeabbbe0bb54d96e572ad` |
| Canonical identity record | [`puzzle-spot-replay-canonical-identity-20261004.json`](../puzzle-spot-replay-canonical-identity-20261004.json) |
| Earlier candidate replay QA | [`candidate report`](../puzzle-spot-replay-production-candidate-20261004/report.md), commit `1cfa6dc6c104e559f1a9fa6be2b26bbd5e416842` |
| Preserved broad Batch2 baseline | [`production report`](../batch2-production-final-20261003/report.md) and [`follow-up`](../batch2-production-final-20261003/follow-up-report.md), source `3cdfc426e91b46a855448690278ceb6590280b68` |

After promotion, I independently fetched all seven HTML, JavaScript, and CSS files recorded in the canonical identity. Every response was HTTP 200, and each served SHA-256 matched the frozen `2952958` value. The earlier full Starter and replay checks remain candidate-only evidence; the fresh alias run below did not repeat them.

## Session isolation and guards

Four fresh Playwright sessions started on `about:blank`, installed `**/api/voice**` and `**/api/story**` routes returning empty HTTP 204 responses, then navigated to the canonical alias. Each session selected Amari through the normal profile picker and turned sound off through the visible sound control. There was no progress, profile, answer, unlock, seed, or storage injection.

At the end of each session, `performance` resource inspection found no `/api/voice` or `/api/story` resources. All four browser consoles reported zero messages, errors, and warnings. The document widths matched their viewports (desktop 1280 px; mobile 390 px), so no horizontal overflow was present. Sampled static requests in each game returned HTTP 200, with one packaged audio range request returning HTTP 206. Audio was not played or evaluated; these checks establish no human listening result.

## Fresh canonical control results

| Game / viewport | Actions through visible controls | Result |
|---|---|---|
| **Puzzle Pop — desktop 1280 × 800** | Opened Picture Pioneers and started normally. The visible Hint selected piece 3 and marked the corresponding board space. Used the displayed Hint and highlighted space for each placement. | The 2×2 Moon Camp picture completed and held its picture fact. Next advanced to River Valley, picture 2 of 4. Back to learning world opened “Leave the game?”; Back to world returned to Creative Lab. |
| **Puzzle Pop — mobile 390 × 844** | Repeated the same normal chapter start and visible Hint/highlighted-space placement path in a separate fresh session. | Moon Camp completion held the same picture fact; Next advanced to River Valley, picture 2 of 4. Back confirmation and return to Creative Lab worked. No horizontal overflow. |
| **Spot the Difference — desktop 1280 × 800** | Started Bright-Eyed Beginners. Compared the rendered Picture A/B details. The first Magnifier said “look near the middle top of Picture B”; tapping the visible middle-top hotspot advanced 0/3 to 1/3. Tapped the remaining visible hotspot controls to finish the pair. | Superhero City reached 3/3 and held the picture fact (“People help their community by sharing and caring for the places where they live.”). Next advanced to pair 2, Dino Park. Back opened the leave confirmation; Back to world returned to Thinking & Play. |
| **Spot the Difference — mobile 390 × 844** | Started Bright-Eyed Beginners in a separate fresh session. Compared the rendered pictures. The first Magnifier said “look near the right top of Picture B”; tapping that visible hotspot advanced 0/3 to 1/3. Tapped the remaining visible hotspot controls to finish the pair. | Superhero City reached 3/3 and held the same picture fact. Next advanced to pair 2, River Valley. Back confirmation and return to Thinking & Play worked. No horizontal overflow. |

Magnifier coordinates and scene choice varied between fresh/randomized rounds. A later visible replay clue also appeared on mobile for Dino Park (“right top”) and on desktop for River Valley (“right top”). The checks follow the clue and visible hotspot labels; they do not assert every scene permutation was exercised.

## Screenshots

- Puzzle: [desktop board](screenshots/puzzle-desktop-first-board.png), [mobile board](screenshots/puzzle-mobile-first-board.png), [desktop held fact](screenshots/puzzle-desktop-held-fact.png), [mobile held fact](screenshots/puzzle-mobile-held-fact.png).
- Spot: [desktop Magnifier clue](screenshots/spot-desktop-magnifier-clue.png), [mobile Magnifier clue](screenshots/spot-mobile-magnifier-clue.png), [desktop held fact](screenshots/spot-desktop-held-fact.png), [mobile held fact](screenshots/spot-mobile-held-fact.png), [desktop leave confirmation](screenshots/spot-desktop-parent-leave-confirmation.png), [mobile leave confirmation](screenshots/spot-mobile-parent-leave-confirmation.png).

## Limits

This report is a fresh canonical-alias control check for one visible Puzzle picture and one Spot pair at each viewport. Starter completion/replay rotations, all-pair coverage, other chapters, child/sibling/profile isolation, and broader game certification remain represented only by their separately identified evidence. No narration was listened to, no 4.5 score was assigned, and this bounded run is not full 4.5 acceptance.
