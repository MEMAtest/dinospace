# Puzzle Pop scene title repair — local preparation

The independent twelve-scene artwork audit identified a small content mismatch: the scene titled **Dino Park Picnic** depicts dinosaurs in a park, without a picnic. The local source now calls it **Dino Park**. Scene ID, artwork, fact, authored order, saves and progression remain unchanged.

## Verification

- Focused Puzzle Pop and Batch 2 narration tests: **12 passed**.
- Changed-file ESLint: passed.
- Vite production build: passed (existing chunk-size and Browserslist warnings).
- Read-only packaged corpus existence check: **1,371 unique lines, three missing updated title lines**. This check is not a fresh full decode or listening review.

## Required before release

The three changed lines need packaged narration after the already authorized Batch 4 worker finishes. No new paid voice worker was started. Then run corpus readiness/full decoding, freeze the exact source/build, independently verify the corrected visible title and packaged narration on desktop and 390px, and perform release acceptance. This local preparation is **not deployed or accepted at 4.5**. The current canonical audit remains bound to source c47864404cff1f31c9cefe9b8a363d0ba5542b24 and the old title.

## Missing lines

- `a39b3546`: Build the Dino Park picture. Choose a piece, then tap its matching space.
- `9685e0ac`: Next picture. Build Dino Park. Compare each piece with the preview.
- `e077fcc0`: Puzzle Pop. Picture Pioneers. Match big picture pieces and spot the main shapes. Build the Dino Park picture.
