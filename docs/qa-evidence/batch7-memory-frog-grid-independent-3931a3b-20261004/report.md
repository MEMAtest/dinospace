# Independent Frog and Monkey card-grid repair delta — 2026-10-04

## Candidate and setup

- Frozen local candidate: source `3931a3b485356ab968b9197fec8d273f223517b0`, served at `http://127.0.0.1:5310` from `tmp/batch7-memory-frog-grid-fix-final/dist`.
- Candidate identity: `docs/qa-evidence/batch7-memory-frog-grid-fix-identity-20261004.json`; all four recorded served file hashes match the frozen bundle.
- Fresh isolated Playwright session `frog-grid-3931a3b`; turned sound off and installed `/api/voice` and `/api/story` guards before app navigation. Selected Amari through the visible chooser. No progress, answers, storage, or deck were seeded/read; no provider calls occurred.
- Earned Forest Friends, then completed each level through Astronaut Mission and Garden & Pond Life with visible card flips and enabled Next controls. Replayed Forest Friends and Garden & Pond Life at mobile size through their visible level controls. Read names only after cards flipped face up.

## Results

- **Forest Friends, desktop 1280×800:** completed 8 cards / 4 pairs. Frog and Monkey sprites both span the available grid width; the art crop measured 194.7×128.5px inside 231.25px cards, and each label occupied its own 221.25×21px caption row. No sprite was collapsed to text width. Screenshot: `forest-level1-desktop-completed.png`.
- **Forest Friends, mobile 390×844:** replayed 8 cards / 4 pairs. Frog and Monkey crops each measured 63.36×27.36px inside 82×82px cards; labels were separate 72×17.2px rows below the artwork. Screenshot: `forest-level1-mobile-completed.png`.
- **Garden & Pond Life, desktop:** completed 34 cards / 17 pairs. Both Frog cards displayed full-width 122.45×78.25px sprite crops inside 149.17px cards; each “Frog” caption remained in a separate 139.17×20.95px row. The existing Pond Fish raster pair still loaded the 512×512 WebP and remained correctly labelled. Screenshot: `garden-level9-desktop-completed.png`.
- **Garden & Pond Life, mobile:** replayed 34 cards / 17 pairs. Both Frog crops measured 63.36×27.36px with separate 72×17.2px labels in 82×82px cards. Pond Fish remained a correctly labelled raster pair. Screenshot: `garden-level9-mobile-completed.png`.
- **Face-down controls:** Forest’s 8 and Garden’s 34 face-down cards had zero front `<img>` elements at both widths. The captured backs show no Frog or Monkey art. Screenshots: `forest-level1-desktop-facedown.png`, `forest-level1-mobile-facedown.png`, `garden-level9-desktop-facedown.png`, `garden-level9-mobile-facedown.png`.
- **Controls and overflow:** Memory level pills measured 48×48px at desktop and 53.5×48px at mobile. Card targets measured 82×82px on mobile. Document scroll width matched the viewport at 1280px and 390px.
- Console showed 0 errors and 0 warnings. `/api/voice` and `/api/story` guards remained active; no provider requests were observed. The representative Pond Fish image request returned HTTP 200.

## Scope and limits

This independent regression verifies the Frog and Monkey crop width, label row placement, Garden Frog rendering, an existing Garden Pond Fish raster card, face-down hiding, and responsive layout on the frozen local candidate. It does not certify other Memory art, narration/listening, production behavior, or any overall 4.5 score. Human audio review and broader art acceptance remain separate gates.
