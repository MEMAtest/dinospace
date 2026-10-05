# Independent UI review: progressive Spelling illustration candidate

Date: 2026-10-05
Candidate source: `56d35a8cb07f41e02cc9228c7b4ec1a09e779012`.
Configured local build: `/tmp/batch5-spelling-progressive-20261005`, served at `http://127.0.0.1:5397/`, 6,001 files, tree SHA-256 `6d95b4c7b67bc78201850274b6959296acb098ba1ad24581bc13d8471e0685fe`. The [builder identity](../batch5-spelling-progressive-illustration-identity-20261005.json) binds served index, JS, CSS and sample asset hashes to this build. This is a bounded local candidate review, not production or full 101-word acceptance.

## Setup and normal UI route

Used the existing dedicated Playwright Chrome session and its existing tab only. Confirmed before app use and again during the run that `/api/voice` and `/api/story` were routed to 403 guards. Muted through the visible sound control; no voice/story requests were made. Browser console had zero messages/errors/warnings. No window, tab, context, hidden storage, seed, answer, progress or child data was added.

The synthetic QA profile first showed Phase 2 with 23 selected sounds and the visible Chapter 3 message “This chapter has 0 words you can make with your learned sounds. It needs at least 20.” Through the visible Grown-ups controls, selecting Phase 3 changed the display to 49 selected sounds. On return to Spelling Studio, Chapter 3 offered 34 makeable words, so the initial zero was the expected taught-sound filter rather than a forced unlock. Chapter 1 and Chapter 2 each had already been completed with six ordinary visible clue/tile rounds and their chapter badges.

## Bounded rounds and card result

After selecting Phase 3 in the visible parent settings, I completed three normal Chapter 3 six-word runs (18 questions) to review representative rendering and progression: chin, coat, fork, moon, rain, pain; then look, road, tail, boat, shop, much; then that, chip, fish, book, farm, seed. The image was still the existing emoji for words whose candidate art had not been mapped in this frozen build. This does not certify all 74 mapped words.

For the targeted `sell` card, I used a normal Chapter 2 replay. The displayed clue was “Give something for money” with the incomplete word `s • ll`; I answered using the visible `e` tile. The app held the correct feedback “SELL has 3 sounds” until Next. It was rendered at both 1280×800 and 390×844. The 96px image, showing an adult handing a red apple to a child, fits without clipping at both sizes. However, it contains no money, price, till, or visible exchange cue. In this context it can read as sharing/giving, so the image does not distinguish selling well enough for the authored clue. **Semantic card-fit: fail; layout fit: pass.**

Screenshots are saved with SHA-256 in [sell-ui-evidence.json](sell-ui-evidence.json): [desktop before answer](sell-desktop-before.png), [mobile before answer](sell-mobile-before.png), [mobile held correct](sell-mobile-held-correct.png), [desktop held correct](sell-desktop-held-correct.png).

## Outcome and next check

Keep `sell` pending and do not count this card as approved. The replacement should show a clear payment cue (coin or price exchange) while keeping the item being sold obvious at 96px. Review the revised asset alone at 96px, then repeat only this normal clue/tile round at 1280 and 390; retain the rest of this candidate’s existing mechanics and baseline.

The local candidate identity reports 74 mapped illustration IDs, 27 missing IDs and `sell` pending review. This check changes no word pool, clue, answer, or runtime file. It does not establish listening quality or full-game acceptance.
