# Sound Safari `green` art correction: independent 82px re-review

Date: 2026-10-05

## Frozen candidate

- Inventory/evidence HEAD: `b393805b7294273952b85288d30b8bf0defc6381`.
- Runtime mapping commit: `c636516afa9ffa1b77dcc3bd5b7353ee80bce567`.
- Full 29-card 82px sheet: `contact-sheet-all-29-82px-green-v2.png`, SHA-256 `ffe37390c78daa027b8834f3b0f7d8d4859c87d6707d3eb1350355b019751bde`.
- Side-by-side 82px comparison: `green-v2-comparison-82px.png`, SHA-256 `dbe186003be3f846d4aafaeefb584dbee2a079bc98c8339c0f15f7fc78cb3346`.
- Mapped WebP: `src/assets/sound-safari/word-cards/green-v2.webp`, SHA-256 `4c371e52ce82a236d40b951c27e2930f15b888d4c8d948244fffc2c9a8799b6d`.

## Verdict

Pass for the narrow correction. At the 82px bound, the v2 image reads as one vivid green colour swatch rather than a ball. The continuous flat face and square silhouette communicate colour without adding a competing object name. It is large enough to recognize at the card size. In the full 29-card sheet, only the green illustration differs from the prior sheet; the other 28 cards retain their reviewed appearance.

The source diff changes only the `green` URL from `green-v1.webp` to `green-v2.webp`. The old PNG/WebP remain intact, and the new asset has separate provenance and hashes. The comparison and candidate sheet align with the corrected mapping.

This closes only the earlier green-art concern. The earlier full-card review’s `seed` borderline remains unchanged and is not re-rated here. This is a static artwork check, not browser/playback/phoneme/gameplay acceptance.
