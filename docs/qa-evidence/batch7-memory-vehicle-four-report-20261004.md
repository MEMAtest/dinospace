# Vehicle card art builder check

Added distinct transparent illustrations for the existing Bus, Tractor, Bicycle, and Scooter tokens in Amari Memory Match's **All Kinds of Vehicles** board. The board remains 14 pairs / 28 cards. Existing labels, progression, stored progress, face-down behavior, and Askia card rendering are unchanged.

- Source commit: `357f24cf13b1b8ddcde474f0b7628f3dad11ebf0`
- Candidate origin: `http://127.0.0.1:5324`
- Frozen production-config dist: `tmp/batch7-memory-vehicle-four-final/dist`
- Served identity and exact asset/source hashes: [batch7-memory-vehicle-four-identity-20261004.json](batch7-memory-vehicle-four-identity-20261004.json)
- Image-generation prompts and provenance: [batch7-memory-vehicle-four-provenance-20261004.json](batch7-memory-vehicle-four-provenance-20261004.json)

## Rendered builder check

A fresh Playwright CLI session selected Amari through the visible chooser, opened Thinking & Play → Memory Match, and completed Forest Friends (4 pairs), Ocean Splash (8), Space Sparkle (10), Party & Treats (12), Dinosaur Discovery (13), and Vehicles (14). The interaction used actual card flips and Next level controls; the helper read only visible card numbers and card names revealed after a real flip. It did not inspect hidden faces or alter storage.

At 1280×800 the 28 completed cards measured 182×182px. At 390×844 they measured 82×82px, the document stayed 390px wide, and all four new pictures and their captions appeared without clipping or overlap. All ten level controls measured 48×48px on desktop and at least 53.5×48px on mobile. Screenshots show the complete Vehicles board at both widths in [desktop](batch7-memory-vehicle-four-builder-images/vehicles-desktop-1280-full.png) and [mobile](batch7-memory-vehicle-four-builder-images/vehicles-mobile-390-full.png).

The earned Vehicles level remained selected after reload. All 28 cards returned face down, with zero mounted images and zero front labels at both widths. Screenshots: [desktop](batch7-memory-vehicle-four-builder-images/vehicles-desktop-1280-facedown.png), [mobile](batch7-memory-vehicle-four-builder-images/vehicles-mobile-390-facedown.png).

Voice and story API routes were guarded with 204 responses before app navigation. No matching voice/story requests were observed; browser console errors and warnings were zero. Served HTML, JS, CSS, and all four WebP hashes match the frozen dist.

## Source gates and limits

- 16 focused tests passed across `test/memoryMatchContent.test.mjs` and `test/batch7Progress.test.mjs`.
- `npm run lint` passed.
- The explicit production-config `npm run build:android` passed. Existing stale Browserslist data and large-chunk warnings remain.
- The read-only artwork audit reports 76 of 87 unique Memory tokens illustrated; 11 remain.

This is builder-rendered evidence; independent review is pending. The remaining art inventory, full narration readiness, Askia-specific parity review, broader human/device checks, production deployment, and overall quality acceptance remain open.
