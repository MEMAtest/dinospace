# Independent Party/Food art check — 2026-10-04

## Candidate and guarded setup

- Frozen local origin: `http://127.0.0.1:5313`.
- Candidate source: `725830f0b7cb72ee9eff83b61de9871fb8ebcf29`; served distribution: `tmp/batch7-memory-party-food-final/dist`.
- Builder identity: [`batch7-memory-party-food-identity-20261004.json`](../batch7-memory-party-food-identity-20261004.json).
- New CLI context `batch7-food-guarded-20261004` opened at `about:blank`. Before the first app navigation, I installed and verified `/api/voice` and `/api/story` routes returning HTTP 403 (`blocked-by-independent-qa`). The guards remained active through reload. Sound was turned off.
- Selected Amari through the visible profile chooser and entered Thinking & Play → Memory Match. Earned access through levels 1–7 in order using only card flips and rendered Next level controls. For each match attempt, the board helper clicked visible cards and read a card label only after that card was visibly face-up. No deck, React state, answers, profile storage, or progress data were read or changed directly.

## Board results

| Board | Width | Result | Layout and new art |
|---|---:|---|---|
| Party & Treats (Level 4) | 1280×800 | 24/24 cards matched; 12 pairs | Document width 1280; card controls 182×182; four new pairs matched visible labels for Strawberry, Pizza, Doughnut, Cupcake. New artwork rendered in distinct complete silhouettes, captions below the art, no overlap. |
| Party & Treats (Level 4) | 390×844 | 24/24 cards matched; 12 pairs | Document width 390; card controls 82×82; level selectors 53.5×48. Full-page capture shows the entire board, all captions, and all four new pairs without horizontal overflow or art-caption overlap. |
| Yummy Feast (Level 7) | 1280×800 | 30/30 cards matched; 15 pairs | Document width 1280; card controls 182×182; four new pairs matched the visible labels and distinct artwork. No visible clipping or caption overlap. |
| Yummy Feast (Level 7) | 390×844 | 30/30 cards matched; 15 pairs | Document width 390; card controls 82×82; level selectors 53.5×48. Full-page capture shows all 30 cards and readable captions, including Strawberry, Pizza, Doughnut, and Cupcake. No horizontal overflow or art-caption overlap. |

Across both boards, the newly illustrated pairs showed eight face-up cards, with loaded WebP sources at 512×512 (strawberry source is 506×512 in rendered Yummy Feast); labels corresponded to each rendered image. On each board at both widths, the face-down state had all cards labeled face down and zero card-front `<img>` elements.

Reload after the mobile Yummy Feast completion restored a face-down Astronaut Mission board while preserving the Amari profile and enabled Level 4 and Level 7 selectors. This confirms earned unlock persistence; reload does not retain the just-completed board as the active board.

## Served identity and runtime diagnostics

Downloaded hashes for `/`, the candidate JavaScript and CSS, and all four new WebPs matched the identity JSON. WebP hashes:

- Strawberry: `944cf5c855e9caaf2e1bbe9da2a4e1d1129a414215783e71c1b7fc7fc5e0f93b`
- Pizza: `5a086d1e5189266e290497ff4644ee18e546fa8866ef58aa8d3984a694f24850`
- Doughnut: `0f8879f8688a7c4852a7ff0f36b7e79ba34eb340c418d7ee1cb5aea7ba69e4ed`
- Cupcake: `e9ddbfc5ba29263686e4521ccf435d670eec97aaad4895a960caacbe09f9e906`

All four illustration requests returned HTTP 200 during play. The static request log contained no `/api/voice` or `/api/story` request; both 403 route guards remained installed. Playwright console inspection reported zero errors and zero warnings.

## Screenshots

- Party: `party-desktop-completed.png`, `party-desktop-facedown.png`, `party-desktop-fullpage.png`, `party-mobile-completed.png`, `party-mobile-facedown.png`, `party-mobile-fullpage.png`
- Yummy Feast: `food-desktop-completed.png`, `food-desktop-facedown.png`, `food-desktop-fullpage.png`, `food-mobile-completed.png`, `food-mobile-facedown.png`, `food-mobile-fullpage.png`

## Scope and limits

This is independent local browser evidence for the four food illustrations on the two authored boards, face-down hiding, viewport layout, ordinary progression, and reload/unlock behavior. It does not certify remaining Memory artwork, Askia parity, packaged narration or human listening, production behavior, or overall 4.5 acceptance.
