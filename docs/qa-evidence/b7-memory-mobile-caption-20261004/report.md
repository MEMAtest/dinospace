# B7 Memory Match early mobile caption delta

## Candidate and lineage

- Source: `9fe5c70aec9b21b7bd0ce2180a473835ab524880`, based on the scoped 4bd desktop/back-mark polish (`4bdcb7b9769d0f25c493995d016f9eef38968e12`).
- Frozen preview: `http://127.0.0.1:5394/`, serving `tmp/b7-memory-mobile-caption-9fe5c70/dist`.
- The implementation changes only `memoryMatch.css`; it raises the initial/early mobile caption rule to 12px and reserves a taller wrapped-label row. The existing 13–18-pair four-column 12px rules and under-370px three-column handling remain in place. Data, pairs, narration, progression, the vector back mark, desktop CSS, and the 5391 candidate were not changed.
- Build identity and complete file hashes: [identity.json](identity.json), [served-assets-sha256.txt](served-assets-sha256.txt).

## Normal first-board check

A fresh Playwright session opened `about:blank`; voice and story requests were guarded with `page.route` before the first app navigation. I selected Amari → Thinking & Play → Memory Match through visible controls and turned sound off through the visible home control. Memory showed “Turn sound on,” confirming the muted state. The first normal Forest Friends 4-pair board was used; no progress, seed, or storage state was injected. One face-down card was clicked to reveal a card and measure its label.

At **390×844**, the board remained four columns. The card measured 82×82px and the `frog` caption rendered at 12px in a 72×33.6px label box. The label’s scroll height matched its box height; the document width and viewport were both 390px. At **360×844**, the card measured 76×76px and the same caption rendered at 12px in a 66×33.6px box with no text overflow; document and viewport widths were both 360px. Back, sound, repeat-tip, and level controls measured at least 48×48px; memory cards measured 82×82px and 76×76px respectively.

The browser console reported zero errors and zero warnings. No voice or story request occurred. All 5,963 frozen served files matched the local SHA256 manifest.

## Captures and limits

- [360px first board](screenshots/mobile-360-first-board.png)
- [390px first board](screenshots/mobile-390-first-board.png)

This is a first-board mobile delta only. It does not replay later levels or replace the retained 5391 ten-level matrix and late-board caption evidence. It does not establish physical-device behavior, audio quality, listening acceptance, deployment, or a 4.5 award.
