# Amari Memory visual coverage reconciliation

**Date:** 2026-10-04  
**Source baseline:** `7fbbfef9454a8d1e709cbcab5c8ae72c239e7dfb`  
**Sound-preference source:** `1410edb79f0105f25a3cbfd5c9a4c7626140ae1d`  
**Detailed machine-readable map:** [`coverage.json`](coverage.json)

## Read-only inventory and lineage

Ran `node scripts/memory-art-readiness.mjs` against the current frozen-source tree and cross-checked the result by importing `MEMORY_LEVELS` and summing its authored pair lists. The exact inventory is 10 levels, 127 pair placements (254 visible card faces over complete play), 87 unique tokens, 87 illustrated tokens, 0 unillustrated tokens, and 89 distinct image paths after per-board context mapping. Fish and rock each have context-specific files, which is why image paths outnumber token names. The complete token, board, context, and asset-path mapping is in `coverage.json`.

The independent full-run report at [`batch7-memory-final87-independent-20261004/report.md`](../batch7-memory-final87-independent-20261004/report.md) identifies the 7f candidate and records ordinary UI completion of every level at 1280×800 and 390×844. All pair cards were actually flipped and matched. This supports rendered gameplay coverage of all 127 pair placements on both viewports. The older [`batch7-memory-premium-independent-20261003/report.md`](../batch7-memory-premium-independent-20261003/report.md) also records the visible labels by authored level, but it is not used to infer current-candidate artwork quality.

Compared the source commits directly. `git diff --name-only 7fbbfef 1410edb -- src` returns only `src/App.jsx`; `src/data/index.js`, `src/data/memoryMatchContent.js`, `src/games/MemoryMatch.jsx`, and all 89 referenced image paths are unchanged. Every referenced file exists, and its Git blob ID is identical at 7f and 1410. SHA-256 for every current image file and both source-commit blob IDs are recorded in `coverage.json`. The browser bundle changes between these candidate builds because of the app-level sound-preference patch; the Memory data, renderer, and art files do not change.

## Coverage tiers

The full-run evidence establishes that all authored pairs were rendered and visibly revealed through normal play on the exact 7f candidate. Focused delta reports additionally inspect image shape, distinctions, captions, and/or small-card fit. The reconciliation maps **99 of 127 context placements** to a focused art delta and **28 placements** to full-run rendered evidence only. The 28 entries are listed below and in the JSON. “Rendered-only” means no separate focused art report for that particular token/context; it does not mean the card was unrevealed or missing.

Focused review is not a claim of human subjective acceptance for every illustration. The named candidate reports cover these visual deltas:

- [Eight-art delta](../batch7-memory-art-ee38737-independent-20261004/report.md): Dog, Fox, Moon, Ringed Planet, Comet, Satellite, Egg, Volcano.
- [Flora and celestial delta](../batch7-memory-art-update-200bdcc-independent-20261004/report.md): Tree, Seedling, Leaf, Mushroom, Earth, Sun, Full Moon, New Moon.
- [Ocean art](../batch7-memory-ocean-art-3a2d367-independent-20261004/report.md): Whale, Dolphin, Shark, Turtle.
- [Ocean and garden fish contexts](../batch7-memory-ocean-garden-independent-2e348c-20261004/report.md): Ocean Fish, Jellyfish, Crab, Squid; Garden Pond Fish.
- [Star and Sun art](../batch7-memory-star-sun-independent-db0a9c1-20261004/report.md): Star, Glowing Star, Shooting Star, Sun with a face.
- [Space object art](../batch7-memory-space-objects-independent-c1d58ec-20261004/report.md): Alien, Galaxy, Flying Saucer, Telescope in their authored Space Sparkle/Astronaut contexts.
- [Frog/Monkey grid correction](../batch7-memory-frog-grid-independent-3931a3b-20261004/report.md) and [isolated-animal/space delta](../batch7-memory-isolated-space-independent-dadb0eb3-20261004/report.md): Frog and Monkey in Forest/Garden, Suited Astronaut, and Moon Rock.
- [Fossil art](../batch7-memory-fossils-independent-0d519939-20261004/report.md): Bone, Dinosaur Tooth, Fossil Dig Pick, Fossil Dig Rock and the separate Moon Rock mapping.
- [Garden creatures](../batch7-memory-garden-creatures-independent-8ff59e48-20261004/report.md) and [crawlers](../batch7-memory-garden-crawlers-independent-20261004/report.md): Bee, Butterfly, Ladybird, Snail, Caterpillar, Worm, Ant, Spider.
- [Vehicle art](../batch7-memory-vehicles-independent-a59482a7-20261004/report.md) and [vehicle-four delta](../batch7-memory-vehicle-four-independent-20261004/report.md): Aeroplane, Helicopter, Steam Train, Passenger Train, Bus, Tractor, Bicycle, Scooter.
- [Party decorations](../batch7-memory-party-decorations-independent-eb869cd7-20261004/report.md), [Party/Food overlap](../batch7-memory-party-food-independent-725830f0-20261004/report.md), and [Food additions](../batch7-memory-food-four-independent-af84ae26-20261004/report.md): Balloon, Sweet, Cake, Party Popper, Strawberry, Pizza, Doughnut, Cupcake, Carrot, Corn, Biscuit, Cheese.
- [Fruit art](../batch7-memory-fruit-independent-e7714415-20261004/report.md): Apple, Banana, Grapes, Watermelon in Yummy Feast.
- [Final-three art](../batch7-memory-final87-independent-20261004/report.md): Dinosaur Nest, Speedboat, Water Lily.
- [Eight-token rendered delta](../batch7-memory-eight-art-independent-20261004/report.md): Mountain, Tulip, Lolly, Chips, Racing Car, Drink, Party Face, Duck.

## Context placements with full-run evidence only

These 28 placements were visibly included in the completed-board run, but do not have a separate focused art review for the named context. Some share an image that received focused review in another level; that does not substitute for a context-specific review.

| Token | Contexts without a focused delta |
|---|---|
| Comet | Astronaut Mission; Galaxy Challenge |
| Star | Space Sparkle; Astronaut Mission |
| Galaxy | Galaxy Challenge |
| Earth | Galaxy Challenge |
| Moon | Astronaut Mission; Galaxy Challenge |
| Glowing Star | Space Sparkle; Astronaut Mission |
| Shooting Star | Astronaut Mission |
| Watermelon | Party & Treats |
| Turtle | Garden & Pond Life |
| Suited Astronaut | Galaxy Challenge |
| Alien | Galaxy Challenge |
| Telescope | Galaxy Challenge |
| Ringed Planet | Astronaut Mission; Galaxy Challenge |
| Rocket | Space Sparkle; Vehicles; Astronaut Mission; Galaxy Challenge |
| Fire Engine | Vehicles |
| Car | Vehicles |
| Satellite | Astronaut Mission; Galaxy Challenge |
| Flying Saucer | Vehicles; Galaxy Challenge |

No pair placement is unrendered in the source-matched ten-level run. The actual uncovered item is **focused visual scrutiny** for these context placements, not missing runtime illustration files. For the legacy shared Rocket, Car, Fire Engine, Watermelon, and listed reused celestial assets, the full run gives rendered proof; this reconciliation does not upgrade that to focused premium-art acceptance.

## Conclusion and boundaries

The source audit and existing independent browser evidence reconcile cleanly to all 87 tokens and all 127 authored pair placements. At the source level, no Memory art/data/renderer file or referenced asset changed between 7f and the 1410 sound-preference patch. 99 context placements have focused visual delta evidence; 28 are supported by the full-run rendered baseline only and remain the exact outstanding visual-review list.

This is local rendered evidence only. It does not certify subjective premium-art acceptance across all 87 tokens, packaged narration, human listening, production, release, or an overall 4.5 score.
