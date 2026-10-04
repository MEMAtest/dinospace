# Independent Fruit art UI delta — 2026-10-04

## Candidate and method

- Frozen local candidate: source `e7714415d47f4fdc9adaadb060b8b544cefd3206`, served at `http://127.0.0.1:5305` from `tmp/batch7-memory-fruit-art-final-v3/dist`.
- Candidate identity and seven frozen/served hashes: `docs/qa-evidence/batch7-memory-fruit-art-identity-20261004.json` (all matched).
- Fresh Playwright session `fruit-art-e7714415`; selected Amari using the visible profile UI. `/api/voice` and `/api/story` routes were guarded before app navigation and remained active. Request log showed the four fruit WebP assets at HTTP 200 and no voice/story endpoint requests. Sound was off. No progress, answers, storage, or deck were seeded/read.
- Completed each board by visibly flipping cards and reading only the revealed button label, then followed the rendered Next level control. This delta rechecked Level 7 Yummy Feast at both viewports and ordinarily earned the remaining unlocks through Galaxy Challenge; Level 2 Dolphin regression is covered by the retained candidate/builder evidence and was not repeated here.

## Results

- **Yummy Feast, desktop 1280×800:** 30 cards / 15 pairs completed. All four new pictures rendered and agreed with their labels: apple, banana, grapes, watermelon. Captured desktop board screenshot: `level7-yummy-desktop-completed.png`.
- **Yummy Feast, mobile 390×844:** 30 cards / 15 pairs completed. All four new WebPs loaded at natural sizes 512×512, 512×512, 506×512, 512×512 respectively and matched the visible names. Cards measured 82×82px, page scroll width equalled 390px, and the full board/captions had no visible art/text overlap. Face-down capture showed the back rather than fruit imagery; no `<img>` was mounted on face-down card buttons. Screenshots: `level7-yummy-mobile-facedown.png`, `level7-yummy-mobile-completed.png`.
- **Ordinary unlock progression:** Astronaut Mission 16 pairs, Garden & Pond Life 17 pairs, Galaxy Challenge 18 pairs. No direct navigation or storage manipulation was used to unlock them.
- **Galaxy Challenge selector/layout at desktop 1280×800:** all ten level controls visible, each 48×48px; document scroll width 1280px. Screenshot: `level10-desktop-completed.png`.
- **Galaxy Challenge selector/layout at mobile 390×844:** all ten level controls visible in two rows, each 53.5×48px; cards 82×82px; document scroll width 390px. Full-page screenshot: `level10-mobile-completed.png`.
- The completed mobile Level 10 screenshot shows full rendered captions (including longer names such as “Moon Rock”, “Flying Saucer”, “Suited Astronaut”, “Ringed Planet” and “Shooting Star”) without ellipses or clipping. The mobile and desktop captures show labels below the art with no overlap. Face-down cards remain image-free; a matched New Moon card, for example, loaded its mapped WebP after revelation.
- Playwright console: 0 errors and 0 warnings. The active API guards remained in place; no paid voice/story calls occurred.

## Scope and gates

This independent delta verifies the four Fruit illustrations on the actual authored Yummy Feast board at desktop and mobile sizes, the frozen candidate’s level selector/touch target dimensions at both widths, ordinary progression to Level 10, and a retained Dolphin regression baseline. It does not certify the other missing Memory illustrations, human narration/listening quality, production behavior, or any overall 4.5 acceptance score. Packaged narration and human review remain separate gates.
