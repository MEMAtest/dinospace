# Chess Explorers: bounded reliability evidence

Date: 4 October 2026. Runtime: `60f362368d5eedb3b43dedc4fa95eb3097672d7e`, immutable local origin `http://127.0.0.1:5363/`. Root is a reviewer of this candidate, not its builder. This report supplements the retained chapter matrix; it is not production acceptance. [Four current served hashes](identity.json) match frozen HTML, service worker, main JavaScript and CSS.

## Method

Fresh named Playwright profile `root-b6-reliability-20261004`, 1280×800. Opened about:blank, installed and verified `/api/voice` and `/api/story` 403 routes before app navigation, and muted through the visible control. Selected Amari and entered Chess through Thinking & Play. No storage, answers, seeds or progress injected. Moves used the visible blue-outlined piece and gold-star goal; the bounded loop read rendered grid accessibility labels and the rendered origin class, then clicked the corresponding cells. It did not read game state. An initial manually entered unsupported `#/game/chess` URL rendered Home; that route is not claimed as a normal navigation finding.

## Observations

- Completed Piece moves through five ordinary visible moves and held explanations, then Next. Completion showed ★★★. The chapter map and reload retained ★★★ and unlocked Safe captures; Mini-puzzles remained locked. [Saved chapter after reload](chess-reload-earned.yml), [screenshot](chess-reload-earned.png).
- **Concrete old-candidate defect:** before reload the control read Turn sound on (muted). After reload it read Turn sound off (sound enabled). Provider guards remained installed. Root muted again. Current canonical has a separately verified persistence fix; this does not establish a production regression. Selective B6 integration must retain that fix and verify both toggle directions across reload.
- Returned normally via Back to Thinking & Play, then Home. Amari showed 3 stars. Reentered from Play again and replayed Piece moves. Visible randomized replay order: king up (`c2→c3`), rook right (`a1→d1`), bishop diagonal (`a1→d4`), rook left (`c1→a1`), king down (`d3→d2`). Each held Why it works and Next puzzle before advancing. [Replay completion](chess-replay-complete.yml) showed ★★★.
- Back first returned to the chapter map, then Back to games returned to Thinking & Play, then Back to home returned Home. [Home after equal replay](chess-replay-home-stars.yml) still showed 3 stars: no duplicate global credit. A runner call initially attempted Back to home before leaving the chapter map and timed out; the following snapshot showed the map intact. This was an automation sequencing error, not a product defect.
- Selected Askia through the visible picker. [Askia Home](askia-separate-home.yml) showed 0 stars. This proves the observed global star separation only; it does not prove Chess badge/fact collection isolation, since Askia has a different game menu.

## Limits and next action

Desktop bounded saved chapter/equal replay evidence only. No higher-best delta was attempted after a three-star first run, no mobile check, no native listening, no full collection-isolation UI proof and no reliability or overall score assigned. The shared completion helper stores records under player and game and awards only a positive best-star delta; that source evidence complements, but does not replace, the observations above. Preserve this frozen origin while the Astronaut copy repair is built.
