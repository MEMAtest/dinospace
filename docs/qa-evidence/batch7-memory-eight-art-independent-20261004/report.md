# Memory eight-token art review — independent rendered delta

**Date:** 2026-10-04  
**Frozen origin:** `http://127.0.0.1:5334`  
**Source:** `7fbbfef9454a8d1e709cbcab5c8ae72c239e7dfb`  
**Candidate identity:** `docs/qa-evidence/batch7-memory-waterlily-dinonest-speedboat-identity-20261004.json`  
**Baseline:** Full ten-level gameplay and prior final-three art review are recorded separately in `batch7-memory-final87-independent-20261004/report.md`.

## Method and limits

I reused the already-earned synthetic profile in Playwright session `memory-final5334-qa-20261004`; it had unlocked levels 1–10 via ordinary visible play and displayed 10/10 board stickers. The session had the `/api/voice` and `/api/story` 403 routes active before this delta; `route-list` still showed both. No progress, answers, or storage were injected, and no provider calls were made. I used the visible level buttons to start the authored boards, flipped cards through the ordinary UI, and read captions only after a card visibly turned face-up. Each scoped board completed at its authored pair count.

This is an eight-token rendered-art delta. It does not repeat or replace the full-ten-level baseline and does not certify all 87 token illustrations, audio/listening, production, or overall 4.5 acceptance.

## Results

| Token | Board | Desktop 1280×800 | Mobile 390×844 | Rendered review |
|---|---|---|---|---|
| Mountain | Dinosaur Discovery, L5 (26 cards / 13 pairs) | Visible, caption “Mountain” | Visible, caption “Mountain”; 82×82 card | Clear green mountain with snow cap; reads as a mountain and differs from the nearby Volcano. No visible alpha fringe or spill. |
| Tulip | Garden & Pond Life, L9 (34 / 17) | Visible, caption “Tulip” | Visible, caption “Tulip”; 82×82 card | Pink tulip silhouette with stem and leaves; distinct from Water Lily. Caption remains readable at mobile size. |
| Lolly | Party & Treats, L4 (24 / 12) and Yummy Feast, L7 (30 / 15) | Visible on both authored boards | Visible on both authored boards | Swirl lollipop is distinct from other food and party pieces. Caption is clear. |
| Chips | Party & Treats, L4 and Yummy Feast, L7 | Visible on both authored boards | Visible on both authored boards | Fries in a carton are recognizable and distinct from the other foods. Caption is clear. |
| Racing Car | All Kinds of Vehicles, L6 (28 / 14) | Visible, caption “Racing Car” | Visible, caption “Racing Car”; 82×82 card | Small red-and-blue racing car is visually distinct from the regular white car. Caption is legible. No visible fringe or spill. |
| Drink | Yummy Feast, L7 | Visible, caption “Drink” | Visible, caption “Drink” | Orange drink with cup and straw is distinct from food artwork; caption readable. |
| Party Face | Party & Treats, L4 | Visible, caption “Party Face” | Visible, caption “Party Face” | Smiling party-face emoji with a party hat; clear and appropriately recognizable in the party board. |
| Duck | Garden & Pond Life, L9 | Visible, caption “Duck” | Visible, caption “Duck”; 82×82 card | Yellow duckling with bill and feet; distinct from the frog, fish, and other pond creatures. Caption readable. |

The desktop and mobile board screenshots are in `screenshots/`. On Garden & Pond Life at 390px, the document width remained 390px and the two target card buttons measured 82×82px. The full mobile board shows the duck and tulip cards in context; the desktop screenshot shows both complete target pairs among the 17 pairs.

## Guard and console checks

At the end of this review the browser route list still contained `**/api/voice` and `**/api/story`. The API-filtered request list was empty, and the console reported zero messages, errors, or warnings. These checks confirm the guarded local run only; they do not establish native audio playback or listening quality.
