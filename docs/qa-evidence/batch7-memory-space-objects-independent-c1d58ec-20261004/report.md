# Independent Space object art UI delta — 2026-10-04

## Candidate and setup

- Frozen local candidate: source `c1d58ecb50f8dbfb42c1a356b9377a2cd4d63da9`, served at `http://127.0.0.1:5308` from `tmp/batch7-memory-space-objects-final/dist`.
- Candidate identity: `docs/qa-evidence/batch7-memory-space-objects-identity-20261004.json`; all seven frozen/served SHA-256 entries match.
- Fresh isolated Playwright session `space-objects-c1d58ec`; chose Amari through the visible profile chooser, turned sound off, and installed `/api/voice` and `/api/story` route guards before app navigation. No provider calls occurred. No progress, answers, storage, or deck were seeded/read.
- Completed Forest Friends and Ocean Splash using visible card flips; followed the enabled Next level controls through Space Sparkle, Party & Treats, Dinosaur Discovery, All Kinds of Vehicles, Yummy Feast, and Astronaut Mission. Replayed Space Sparkle and Astronaut Mission at mobile width using the visible level buttons. Card names were read only after face-up reveal.

## Results

- **Space Sparkle, desktop 1280×800:** completed 20 cards / 10 pairs. The rendered Flying Saucer, Alien, and Galaxy pairs matched their full visible labels; all three WebPs loaded at 512×512. Cards measured 182×182px. Document scroll width was 1280px. Screenshot: `space-level3-desktop-completed.png`.
- **Space Sparkle, mobile 390×844:** replayed 20 cards / 10 pairs. The same three art/name pairs rendered with 82×82px cards and no horizontal overflow. Screenshot: `space-level3-mobile-completed.png`.
- **Astronaut Mission, desktop 1280×800:** completed 32 cards / 16 pairs. All four targeted assets appeared on cards labelled Alien, Galaxy, Flying Saucer, and Telescope, each loaded at 512×512. Their pictured objects were visually distinct from one another. Cards measured about 149×149px; document scroll width was 1280px. Screenshot: `astronaut-level8-desktop-completed.png`.
- **Astronaut Mission, mobile 390×844:** replayed 32 cards / 16 pairs. All four target art/name pairs rendered, cards measured 82×82px, and document scroll width equalled 390px. Longer labels such as “Flying Saucer” fit without clipping or overlapping the art in the captured board. Screenshot: `astronaut-level8-mobile-completed.png`.
- **Face-down rendering:** at desktop and mobile widths, all 32 Astronaut Mission cards were face down and had zero front `<img>` elements. Screenshots: `astronaut-level8-desktop-facedown.png`, `astronaut-level8-mobile-facedown.png`. The asset request record shows the new object assets returning HTTP 200 as play revealed cards; after flipping, the actual visible names and images were confirmed on both boards.
- **Reload persistence:** after the ordinary unlock sequence, reloading retained the Amari profile and enabled selectors for Levels 1–9, with Level 10 still disabled. The rendered game opened Astronaut Mission. Screenshot: `reload-preserved-unlocks-desktop.png`.
- Browser console: 0 errors and 0 warnings. `/api/voice` and `/api/story` guards remained active. New asset requests returned HTTP 200; no voice/story requests were observed.

## Scope and limits

This independent delta covers the three new Space Sparkle objects and four Astronaut Mission objects at desktop and mobile sizes, face-down image suppression, visible labels, ordinary unlock/reload behavior, and served candidate identity. It does not certify remaining Memory illustrations, packaged narration/listening, production behavior, or any overall 4.5 score. Human audio review and broader art acceptance remain separate gates.
