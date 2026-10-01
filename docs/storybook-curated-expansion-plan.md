# Storybook Studio curated expansion

This work adds four newly authored age 5–6 books to the three original bundled books. These are new manuscripts; they are not recovered browser-local stories and do not represent historical custom content.

## Reviewed manuscripts

All four authored manuscripts are in `docs/storybook-curated-manuscripts.json`. Each has ten pages, 20–40 words per page, three comprehension questions with page-grounded clues and explanations, and three word-help entries.

| Title | Story focus | Cast and setting |
| --- | --- | --- |
| Bo and the Busy Bee Garden | Flowers, nectar, pollen, and watching pollinators safely | Bo, Bea the bee, and Gran in an apple garden |
| Sami and the Night-Light Parade | Lantern light, shadows, sequencing, and a small worry | Sami, Dad, Tavi the firefly, and family |
| Mina’s Mountain Seed | Plant care, patience, and observing growth | Mina, Piko, and Guide Leni at an alpine hut |
| Kai and the Lost Library Book | Remembered route clues and caring for shared books | Kai, Dad, Aunt Jo, Noor, and Baker Elsie in a rainy neighbourhood |

Bo’s reviewed copy uses apple blossoms and a simple explanation of pollen. It does not say that every flower needs a bee visit. Sami’s copy keeps Tavi tiny and Dad close to Sami. Mina’s copy uses a small terracotta pot and has a stable Guide Leni design. Kai’s copy now includes a reviewed Dad character description that matches the illustrations. Exact titles, page copy, image prompts, questions, clues, explanations, and word meanings remain in the manuscript source.

## Media and app status

Each book has 22 local assets: a cover image and narration plus ten page images and narrations. The resumable packager is `scripts/package-curated-storybooks.mjs`; its default is a no-call dry run. It checkpoints each asset and validates complete packages against the reviewed manuscript hash. Localized image edits and their prior files are recorded in `docs/storybook-curated-media-review.json`; archived originals are under ignored `tmp/storybook-curated-originals/`.

Status as of 2026-10-01:

- **Bo:** all 22 assets are packaged and reviewed. Seven images were replaced after review to make page actions distinct while retaining the painted 2D style. The source-bound manifest and all assets validate.
- **Sami:** all 22 assets are packaged and reviewed. Pages 3 and 4 received localized clean-shaven edits. The source-bound manifest and all assets validate.
- **Mina:** all 22 assets are packaged and all ten page illustrations were inspected against the narration. Pages 2, 3, 5, 6, 7, and 10 received localized outfit/action/cast corrections. The source-bound manifest and all assets validate.
- **Kai:** all 22 assets are packaged and all ten page illustrations plus cover were inspected against the narration and cast. Page 4 shows Baker Elsie; pages 2, 6, 7, 8, and 9 received localized character/cast corrections. Dad's reviewed tan-coat design is recorded in the manuscript source. The source-bound manifest and all assets validate.
- **Catalog:** the app contains the three original books plus Bo, Sami, Mina, and Kai, with bundled fallback text, comprehension, word help, and shelf/series/bedtime metadata. All seven books have three comprehension questions and at least three word-help entries.
- **Learning replay audio:** the approved fixed corpus has 147 requested Storybook lines across all seven books. All 147 clips are physically ready and mapped in the offline manifest. The corpus covers prompts, choices, clues, explanations, and word meanings; no arbitrary child text is sent for narration.

## Remaining acceptance work

1. Independently test Storybook on a rendered app build: offline installation and reading, narration replay, reload/resume, backup/restore, and comprehension. These journeys have not all been independently accepted yet.
2. Update `docs/game-quality-4.5-roadmap.md` only after content, media, and rendered acceptance evidence is complete.

Historical custom-story recovery remains a separate gate. No historic story or profile recovery is claimed by this expansion.
