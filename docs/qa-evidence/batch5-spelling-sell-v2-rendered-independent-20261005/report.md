# Spelling Studio sell-v2 rendered-fit check

## Candidate and method

- Frozen source: `d06ccdb5af09ca2c63ea99f6759f851bcb682235`.
- Candidate identity: [`batch5-spelling-illustrations-100-identity-20261005.json`](../batch5-spelling-illustrations-100-identity-20261005.json), which binds the preview build's served index, JS, CSS and sell-v2 WebP hashes.
- Preview: `http://127.0.0.1:5399/`, using the sole existing Chrome tab. No browser/tab/context was created.
- `/api/voice` and `/api/story` 403 route guards were verified before the first navigation; they remained installed. Sound was muted. No provider calls or hidden progress/answer injection were used.
- Used Amari's ordinary visible flow and completed Chapter 1's six words and Chapter 2's six-word run. The initial profile had 23 selected Phase 2 sounds; Chapter 3 showed 0 eligible words. Through the visible Grown-ups settings, selected Phase 3, which showed 49 selected sounds. Chapter 3 then showed 34 eligible words. This was a normal UI setting change on the QA profile.

## Result

**Rendered sell-v2 fit remains unverified.** The sell card did not appear in the bounded visible sample. After the first Chapter 2 run, I completed three further ordinary six-word Chapter 2 runs (18 additional visible rounds; 24 Chapter 2 rounds total) and stopped at the agreed cap. The 18 additional visible targets were:

| Run | Visible targets |
|---|---|
| 1 | neck, fill, mess, tell, sock, fell |
| 2 | red, luck, lock, log, miss, but |
| 3 | duck, hiss, fuss, rock, tick, hen |

The image fit and legibility of sell-v2 at the actual responsive card size therefore remain open; the prior 96px static approval is not a substitute for rendered review. The static candidate's coin cue may be small, but it was not shown in this session, so no rendered readability judgment is made.

The current final screenshot records the last sampled 390×844 Chapter 2 round and held correct answer: [mobile sample](screenshots/phase2-last-sampled-round-mobile.png). The frozen 100-image identity still maps 100 of 101 authored words and leaves `fuss` unmapped; the sampled `fuss` question visibly fell back to its existing 😣 glyph. The separate static `fuss-v3` approval does not alter this frozen build.

The browser console had zero messages, errors, or warnings. Requests observed were local app assets and local image files; no paid endpoint was contacted. This is a candidate-specific bounded local UI review, not full Spelling Studio acceptance, audio acceptance, or a production claim.
