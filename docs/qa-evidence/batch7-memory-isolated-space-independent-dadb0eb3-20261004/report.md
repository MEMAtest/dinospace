# Independent isolated-animal and space-art check — 2026-10-04

## Candidate and guarded setup

- Frozen local origin: `http://127.0.0.1:5314`.
- Source: `dadb0eb3c6f4e454b3db6b975266cc3600c103e0`; frozen distribution: `tmp/batch7-memory-isolated-space-final/dist`.
- Candidate identity: [`batch7-memory-isolated-space-identity-20261004.json`](../batch7-memory-isolated-space-identity-20261004.json).
- Opened a fresh Playwright CLI session (`batch7-animals-astro-guarded-20261004`) at `about:blank`. Before first navigation, installed and verified `/api/voice` and `/api/story` routes returning HTTP 403 (`blocked-by-independent-qa`). The guards remained through gameplay and reload. Sound was turned off.
- Selected Amari from the visible profile chooser and entered Thinking & Play → Memory Match. Earned the relevant level access by completing levels 1–10 in order with rendered card flips and Next controls. The helper read a card's accessible name only after it visibly flipped face up, then matched using only those observations. It did not read hidden fronts, app state, seeds, answers, or storage.

## Board results

The four requested boards were completed at both desktop 1280×800 and mobile 390×844. At both viewports, the visible card faces and names matched, the full-board screenshots show the art and captions without overlap, and document width equals viewport width.

| Board | Pair count | Observed art |
|---|---:|---|
| Forest Friends, Level 1 | 4 / 8 cards | Frog and Monkey each completed as two matching pairs. The new art renders as separate, complete cutout figures on the card backgrounds, visually consistent with Dog and Fox and without the earlier scenic-strip crop. At mobile width, face-up buttons resolved to `isolated-frog-v1-card-89MVsj26.webp` and `isolated-monkey-v1-card-IlBechiJ.webp`, loaded successfully. |
| Garden & Pond Life, Level 9 | 17 / 34 cards | Frog pair used the same isolated Frog illustration. Pond Fish remained labeled and illustrated as a fish; it was not replaced or relabeled as Frog. |
| Astronaut Mission, Level 8 | 16 / 32 cards | “Suited Astronaut” and “Moon Rock” each appeared as their own matching pair. The Suited Astronaut card loaded the Amari astronaut image; Moon Rock loaded its contextual rock image. |
| Galaxy Challenge, Level 10 | 18 / 36 cards | Moon Rock appeared as its own matching pair alongside the other authored space tokens. The revealed Moon Rock buttons loaded the Moon Rock image. |

At 390×844, card controls measured 82×82 and the ten level selector controls measured 53.5×48. At 1280×800, the selectors measured 48×48. Each of the four requested boards was also checked face down at both viewports: every card button was face down and no card-front `<img>` element was mounted.

To check that Moon Rock remained context-bound, I replayed Dinosaur Discovery (Level 5) at both widths. Its 26 cards / 13 pairs completed normally, and no revealed card label contained “Moon Rock.” Thus the rock art was observed in Astronaut Mission and Galaxy Challenge, and absent from the dinosaur board. A global rock substitution was not observed.

## Reload and runtime identity

After completing the mobile Galaxy Challenge, reloading returned to a face-down Galaxy Challenge board with 36 face-down cards and zero front images. Forest, Astronaut, Garden, and Galaxy level selectors remained enabled, confirming Amari profile and earned progression persistence; the just-completed face-up board did not persist as face-up.

The served root, JavaScript, CSS, and all four newly mapped WebP files were downloaded and their SHA-256 values matched the candidate identity. The four illustration hashes were:

- Isolated Frog: `9a0cc2706b20109095fcb36852750aee0a9b8456d677e697d433eebc1bb3f622`
- Isolated Monkey: `e6aebcf179052aff994510d2ee5a25411d65be475b8695dde3f701201e638489`
- Amari astronaut: `b916a317eaf876b7d315731f3148b47bf16e44aa14c7447747394e3e51f62ca7`
- Moon Rock: `67992a1b6786c13ee43fab5859a0173e895edb6a9ed2a7e9cc30744022aa205a`

The request log showed no voice or story API requests. Console inspection found zero errors and zero warnings; no failed static request was observed.

## Screenshots

Each named board has a face-down capture and full-page completed captures at both viewports:

- Forest Friends: `forest-desktop-facedown.png`, `forest-desktop-fullpage.png`, `forest-mobile-facedown.png`, `forest-mobile-fullpage.png`
- Astronaut Mission: `astronaut-desktop-facedown.png`, `astronaut-desktop-fullpage.png`, `astronaut-mobile-facedown.png`, `astronaut-mobile-fullpage.png`
- Garden & Pond Life: `garden-desktop-facedown.png`, `garden-desktop-fullpage.png`, `garden-mobile-facedown.png`, `garden-mobile-fullpage.png`
- Galaxy Challenge: `galaxy-desktop-facedown.png`, `galaxy-desktop-fullpage.png`, `galaxy-mobile-facedown.png`, `galaxy-mobile-fullpage.png`
- Context control: `dinosaur-desktop-fullpage.png`, `dinosaur-mobile-fullpage.png`

## Scope and limits

This is independent local browser evidence for the four named board contexts, the frog/monkey illustration correction, face-down hiding, responsive card/control geometry, and reload progression. It does not certify the remaining Memory art inventory, Askia visual parity, packaged narration or human listening, production, or overall 4.5 acceptance.
