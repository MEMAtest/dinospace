# Memory Match water lily, dinosaur nest, and speedboat builder check

**Source commit:** `7fbbfef9454a8d1e709cbcab5c8ae72c239e7dfb`
**Frozen local candidate:** [http://127.0.0.1:5334](http://127.0.0.1:5334)
**Served identity:** [batch7-memory-waterlily-dinonest-speedboat-identity-20261004.json](batch7-memory-waterlily-dinonest-speedboat-identity-20261004.json)
**Asset provenance:** [memory-waterlily-nest-speedboat-art-provenance-20261004.json](memory-waterlily-nest-speedboat-art-provenance-20261004.json)

## Change scope

Added transparent images and 512px WebP derivatives for the existing authored Memory tokens `🪷` water lily, `🪺` dinosaur nest, and `🚤` speedboat. They map only to the Garden, Dinos, and Vehicles boards respectively. The original PNGs were copied unchanged; prompts, paths, hashes, dimensions, and alpha data are recorded in the provenance file.

`MemoryMatch.jsx` adds static imports and path-map entries only. `memoryMatchContent.js` maps existing tokens to matching illustrations. No board definitions, token identities, pair counts, gameplay, progress/persistence logic, or Askia rendering/art map changed. A focused test asserts exact board, label, and path for each new mapping. The illustration inventory test now also asserts every authored token has global art or complete board-specific art.

## Source checks

- `node --test test/memoryMatchContent.test.mjs test/batch7Progress.test.mjs`: 19 passed.
- `npm run lint`: passed.
- Production-config `npm run build:android`: passed. Existing stale Browserslist data and >500KB chunk-size advisory warnings remain.
- Illustration audit: 87/87 unique authored tokens have matching artwork, counting context-specific entries. Five tokens use board-specific paths: fish, jellyfish, crab, squid, and rock. No authored token is missing an illustration path. A separate read-only source/component audit records 127 board-token usages and 89 artwork files with zero missing board mappings, files, or component mappings: [memory-complete-art-file-audit-20261004.json](memory-complete-art-file-audit-20261004.json).
- SHA-256 checks match between the served immutable build and its local copy for `index.html`, application JS/CSS, and all three new WebPs.

## Ordinary UI check

Used a fresh CLI browser profile. Started at `about:blank`, installed 403 routes for `**/api/voice` and `**/api/story`, verified both with `route-list`, then navigated with `goto` to the frozen candidate. Both guards remained active in final checks.

Selected Amari, Thinking & Play, and Memory Match using visible controls. At 1280×800, earned levels 1–9 with actual card flips and the visible Next Level control. At 390×844, replayed the unlocked Dino, Vehicles, and Garden boards through their visible level selectors. The play helper read only a face-down card’s visible index before flipping it and its accessible name after reveal. It did not read hidden faces or inject progress/deck/storage state. The browser profile was isolated and synthetic; it did not use child data.

| New illustration | Authored board | Cards | Mobile result |
| --- | --- | ---: | --- |
| Dinosaur Nest | Dinosaur Discovery, level 5 | 26 | 82×82px card, 512px image, “Dinosaur Nest” caption |
| Speedboat | All Kinds of Vehicles, level 6 | 28 | 82×82px card, 512px image, “Speedboat” caption |
| Water Lily | Garden & Pond Life, level 9 | 34 | 82×82px card, 512px image, “Water Lily” caption |

All three target boards completed at the authored pair count on both viewports. After completion, each visible level selector started a fresh round. The 26, 28, and 34 face-down cards had zero image descendants and zero `.memory-card-label` nodes; accessible names showed only “Face-down memory card N”. Reloading each selected round preserved the board and count, with the same hidden-face results. A Garden screenshot after reload is included with the matched-card images at [`batch7-memory-waterlily-dinonest-speedboat-builder-images`](batch7-memory-waterlily-dinonest-speedboat-builder-images/).

Final CLI `route-list` showed both provider guards. No matching provider request appeared in `requests` (static requests were omitted by the default CLI output). Console reported 0 messages, 0 errors, and 0 warnings. No narration playback was tested or certified.

## Limits

This is builder evidence for the final three token mappings. Independent rendered QA remains separate. The source audit shows artwork mapped to every token; subjective premium-art acceptance, audio and human listening, production, release, and any 4.5 score remain open.
