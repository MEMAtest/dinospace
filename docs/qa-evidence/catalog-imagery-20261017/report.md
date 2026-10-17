# Catalogue imagery acceptance — 17 October 2026

## Scope

Five generated world dioramas and 34 distinct game illustrations replace the small vector/sticker catalogue icons. The coverage includes every game in Amari's five worlds, including the six shared younger-explorer activities. Existing game names, descriptions, favourites and navigation remain HTML.

The artwork is reused on home practice/recent thumbnails and GameSession welcome screens. Existing gameplay scenes remain intact. This is visual acceptance, not a new 4.5 editorial score or a full gameplay certification.

## Assets and provenance

- Built-in image generation only, after explicit authorisation to use allowance and credits.
- 39 transparent PNG originals in `assets-source/catalog-v3`.
- Complete prompt set, source paths, dimensions, SHA-256 hashes and file sizes in `assets-source/catalog-v3/provenance.json`.
- 39 WebP runtime images, total 2,596,090 bytes (about 2.6 MB), lazy-loaded for games.
- Worlds 768px wide; games 640px wide. Contact sheet: `game-contact.jpg`.

## Implementation and defects caught

WorldIcon now renders world artwork. The catalogue assigns each game its matching illustration. Menu cards have a larger artwork area and a darker lower scrim to retain white-label contrast.

A welcome-screen sizing regression initially caused the new artwork to cover the title and intercept the Back button. This was repaired with a bounded welcome artwork container and non-interactive images. Practice/recent thumbnails received explicit bounds. The final native Back and Worlds controls were exercised successfully.

## Local evidence

- Scoped ESLint: pass on all six changed source files.
- Vite production build: pass. Existing chunk-size and Browserslist age warnings remain.
- Asset inventory: 39/39, all RGBA WebP, all output hashes recorded.
- Five worlds at 1440px and 390px: ten world views, 68 game image checks, plus home world artwork at both widths. No broken images, clipped card titles, horizontal overflow or page errors.
- One actual game-card launch and parent-world return per world at both widths: ten journeys, no broken images, overflow or page errors.
- Favourites toggled on and back off through real controls for each world/viewport.
- Single existing `amari-solar-contained` Chromium session and tab reused. Provider story/voice routes blocked before the journeys; no provider generation invoked.

## Release boundary

Runtime commit: `be72df4075e997f22cd26dca7962f0a4d2232c9d`.
Preview: https://dinospace-ah6zt73dv-memas-projects-23a0001d.vercel.app/
Vercel deployment: `dpl_BA9CG8yzqSQCi6Mdu2QqoCLbPZWQ`, READY, target preview; provider identity recorded in `preview-identity.json`.

Production has not been promoted by this change. Original 26-game quality acceptance remains separate.

## Hosted preview acceptance

The provider-verified preview repeated the five-world audit at desktop and 390px: 68 game-image checks plus ten home world-image checks, with no broken imagery, clipped card titles, horizontal overflow or page errors. Ten native card-launch and parent-world return journeys also passed. Final screenshots and the exact Playwright scripts are retained beside this report. No new browser windows, tabs or contexts were created.

Final browser console: zero errors and zero warnings.
