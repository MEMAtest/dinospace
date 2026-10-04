# Memory Match final illustration candidate — independent UI QA

**Date:** 2026-10-04  
**Frozen local origin:** `http://127.0.0.1:5334`  
**Source:** `7fbbfef9454a8d1e709cbcab5c8ae72c239e7dfb`  
**Identity:** `docs/qa-evidence/batch7-memory-waterlily-dinonest-speedboat-identity-20261004.json`

## Guarded ordinary UI route

I opened a fresh Playwright profile at `about:blank`, added and verified the `**/api/voice` and `**/api/story` route guards before navigating, and verified them again after the game and reload checks. I selected Amari, Thinking & Play, and Memory Match through visible controls. I turned sound off using the visible “Turn sound off” action before play. No child data, seeded progress, injected storage, deck data, or unrevealed card names were used. The ordinary-play helper read each accessible face name only after its card had been clicked and visibly flipped; face-down cards were identified only by their visible index labels.

## Progression and board completion

Completed all ten levels at 1280×800 using visible Next level controls. Then completed all ten unlocked levels at 390×844 using the visible level selectors. Both runs reached the visible 10/10 board-sticker shelf. The final Galaxy Challenge displayed 18/18 pairs and the “Replay this level” completion panel. The Game card in Thinking & Play showed “Played 10”.

| Board checked | Desktop result | Mobile result |
| --- | --- | --- |
| Ocean Splash | Completed during the full ten-level run | 16 cards, 8 pairs; visible fish, jellyfish, crab, squid, shark, dolphin, turtle and whale labels |
| Dinosaur Discovery (Level 5) | 26 cards, 13/13 pairs | 26 cards, 13/13 pairs |
| All Kinds of Vehicles (Level 6) | 28 cards, 14/14 pairs | 28 cards, 14/14 pairs |
| Garden & Pond Life (Level 9) | 34 cards, 17/17 pairs | 34 cards, 17/17 pairs |
| Galaxy Challenge (Level 10) | 36 cards, 18/18 pairs | 36 cards, 18/18 pairs |

Level 5 remained 26 cards/13 pairs after the candidate update. The rendered board retained the fossil dig rock and pick as distinct labeled pictures from the newer dinosaur nest. On the Galaxy board, Moon Rock remained separately labeled and illustrated from Fossil Dig Rock. Ocean labels confirmed separate fish, jellyfish, crab, and squid cards. Crops and full-board screenshots are included below.

## New illustrations and responsive layout

On both desktop and mobile, the three new mapped pairs were present on their authored boards, matched through actual card flips, and captioned “Dinosaur Nest”, “Speedboat”, and “Water Lily”. At 390×844 their cards measured 82×82px; crops show the distinct matching image and caption. The complete boards fit the 390px page width. Level selector hit areas measured 54×48px; Back, sound, and memory-tip controls measured 48×48px. I found no horizontal overflow at either viewport. Screenshots were taken after the flip animation settled.

## Reload privacy, replay, and navigation

At 390×844 I selected each target board through its visible level button and verified the newly started round had, before any flips:

| Board | Face-down cards before reload | Face-down after reload | Card image descendants | Front caption nodes |
| --- | ---: | ---: | ---: | ---: |
| Dinosaur Discovery | 26/26 | 26/26 | 0 | 0 |
| All Kinds of Vehicles | 28/28 | 28/28 | 0 | 0 |
| Garden & Pond Life | 34/34 | 34/34 | 0 | 0 |

Each accessible card name was only “Face-down memory card N” before and after reload, and the selected board persisted. Selecting an already unlocked level restarted that level as a fresh face-down round. The Memory Match Back control returned to Thinking & Play, then Back to home returned to the Amari home. The sound control returned to its enabled default after a full reload; I switched it off again before further card play.

## Runtime evidence and limits

All six files in the candidate identity record (HTML, JavaScript, CSS, and the three new WebP images) matched the served SHA-256 hashes and byte counts. The Playwright console reported zero messages, errors, or warnings. `route-list` retained both API guards, and no `/api/voice` or `/api/story` request was observed. Static candidate assets returned HTTP 200.

This is independent local UI evidence for the frozen candidate only. It does not certify narration playback, human listening, subjective premium-art acceptance for every one of the 87 authored tokens, production, release, or full 4.5 acceptance. The report covers complete ordinary gameplay through all ten levels at both target viewport sizes and focused visible-art/reload checks for the newly mapped cards and their relevant context boards.

## Screenshots

- `screenshots/desktop-dinosaur-discovery-complete.png`, `screenshots/mobile-dinosaur-discovery-complete.png`
- `screenshots/desktop-vehicles-complete.png`, `screenshots/mobile-vehicles-complete.png`
- `screenshots/desktop-garden-complete.png`, `screenshots/mobile-garden-complete.png`
- `screenshots/mobile-ocean-context-complete.png`, `screenshots/mobile-galaxy-context-complete.png`
- `screenshots/mobile-dinosaur-discovery-face-down-reload.png`, `screenshots/mobile-vehicles-face-down-reload.png`, `screenshots/mobile-garden-face-down-reload.png`
- Individual rendered card crops for dinosaur nest, speedboat, water lily, fossil dig rock, moon rock, fish, jellyfish, crab, and squid.
