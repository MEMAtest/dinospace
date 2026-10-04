# Independent Star and Sun art UI delta — 2026-10-04

## Candidate and setup

- Frozen local candidate: source `db0a9c18b253cc24f879e87c0ea2050c64d5bc8c`, served at `http://127.0.0.1:5309` from `tmp/batch7-memory-star-sun-final/dist`.
- Candidate identity: `docs/qa-evidence/batch7-memory-star-sun-identity-20261004.json`; all seven served identity entries match the frozen bundle.
- Fresh isolated Playwright session `star-sun-db0a9c1`; turned sound off and installed `/api/voice` and `/api/story` route guards before app navigation. Selected Amari using the visible chooser. No progress, answers, storage, or deck were seeded/read; no provider calls occurred.
- Earned all ten Memory levels in order by visibly flipping cards and following the enabled Next level button. Read card names only after reveal. Replayed Galaxy Challenge through its visible level control for the face-down check.

## Results

- **Galaxy Challenge, desktop 1280×800:** completed 36 cards / 18 pairs. Plain Star, Glowing Star, Shooting Star, and Sun With A Face each appeared on their actual cards with distinct matching illustrations and captions. Each mapped WebP loaded at 512×512. All ten level controls measured 48×48px and document scroll width was 1280px. Screenshot: `galaxy-level10-desktop-completed.png`.
- **Galaxy Challenge, mobile 390×844:** all four images and captions rendered distinctly; each target card measured 82×82px. Captions were fully visible without clipping or overlap; all ten level selectors were visible in two rows and measured 53.5×48px. Document scroll width equalled 390px. Screenshot: `galaxy-level10-mobile-completed.png`.
- **Face-down rendering:** after visible level reselection, all 36 Galaxy Challenge cards were face down with zero front-image `<img>` elements at both desktop and mobile widths. Card size remained 82×82px on mobile. Captures: `galaxy-level10-desktop-facedown.png`, `galaxy-level10-mobile-facedown.png`.
- **Progress persistence:** after reloading, Amari remained selected; all ten level controls remained enabled and Galaxy Challenge remained selected. Mobile capture: `reload-preserved-progress-mobile.png`.
- New star/Sun WebPs returned HTTP 200 in the request log. `/api/voice` and `/api/story` guards stayed active; no matching requests occurred. Browser console showed 0 errors and 0 warnings.

## Scope and limits

This independent delta verifies the four star/Sun illustrations, their visible labels, mobile and desktop layout, face-down image suppression, and earned progress persistence on the frozen local candidate. It does not certify remaining Memory illustrations, narration/listening, production behavior, or any overall 4.5 score. Human audio review and broader art acceptance remain separate gates.
