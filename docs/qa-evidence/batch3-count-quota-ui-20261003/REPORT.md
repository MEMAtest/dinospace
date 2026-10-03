# Batch 3 Count the Stars quota UI QA

Date: 2026-10-03 (Europe/London)

## Candidate and scope

- Frozen candidate identity: [`batch3-count-quota-identity-20261003.json`](../batch3-count-quota-identity-20261003.json), source SHA `653633f73cd97fcd297c592e1139c17ddb0b3855`, served at `http://127.0.0.1:5219`.
- All six JavaScript and CSS hashes recorded in the identity file were fetched from the served candidate and matched exactly; details are in [`served-assets.json`](served-assets.json).
- Scope: actual Count the Stars browser queues at desktop `1280x800` and mobile `390x844`, including ordinary Starter → Growing → Challenge progression, quota counts, grouping, replay novelty, feedback, completion rewards, persistence, sibling separation, console errors, and loaded static assets.
- This is local browser evidence only. It does not close packaged narration, listening, editorial, full 4.5 acceptance, canonical production identity/deployment, or production acceptance.

## Browser setup and interaction

Two fresh Playwright browser profiles were used. Before navigating either profile to the app, `/api/voice` and `/api/story` were routed to an empty `204` response. Sound was switched off through the visible UI. Each queue was played from the normal survey map: I tapped every rendered object button while its label said “not counted yet”, then selected the visible answer button matching the number of rendered objects. I used the visible Next button after the held fact card. No progress, seed, local storage, or unlock state was injected.

The desktop Starter Round 1 also covered hint and wrong-answer recovery. The one-use clue disabled after use; choosing `3` for the two-planet board returned “Check your count badges once more.” The same two object buttons and answer options stayed on screen. Choosing `2` then showed the held fact and explicit Next.

Counts below were read from the rendered object buttons. `grouped` and `orbit` are the visible board's `data-layout-variant`; “two visible groups” is the rendered accessibility label for grouped Challenge boards above 10. Motif names are the visible round headings.

## Rendered queues

| Viewport and band | Six visible totals | Layout or quota evidence |
| --- | --- | --- |
| Desktop Starter, initial | `2, 2, 2, 1, 1, 3` | Six rounds completed; Star Garden unlocked Growing. |
| Desktop Growing, initial | `9, 8, 2, 1, 6, 10` | Four above 5; review at 2 and 1; six unique totals. |
| Desktop Growing, replay | `2, 5, 6, 8, 10, 1` | Layouts `orbit, grouped, orbit, grouped, grouped, grouped`; 3 above 5, 2 grouped above 5, review at 2/5/1, six unique totals. |
| Desktop Challenge, initial | `5, 15, 19, 6, 18, 4` | 3 above 10; rounds 15, 19, and 18 rendered “two visible groups”; review at 5/6/4; six unique totals. |
| Desktop Challenge, replay | `13, 15, 3, 18, 1, 14` | 4 above 10; rounds 13 and 14 rendered “two visible groups”; review at 3/1; six unique totals. |
| Mobile Starter, initial | `5, 2, 3, 2, 2, 4` | Six rounds completed; Star Garden unlocked Growing. |
| Mobile Growing, initial | `2, 7, 10, 3, 1, 8` | 3 above 5; review at 2/3/1; six unique totals. |
| Mobile Growing, replay | `3, 4, 2, 8, 7, 9` | Layouts all `grouped`; 3 above 5, all 3 grouped, review at 3/4/2, six unique totals. |
| Mobile Challenge, replay | `20, 18, 14, 13, 9, 16` | 5 above 10; rounds 18, 14, and 13 rendered “two visible groups”; review at 9; six unique totals. |

The required Growing and Challenge count quotas passed on both sizes. The desktop initial/replay Growing queues and desktop initial/replay Challenge queues had no repeated visible motif-and-total pair. The mobile Growing initial/replay queues also had no repeated visible motif-and-total pair. The mobile Challenge replay began with a different visible motif and total from its earlier run.

The direct, bounded UI export from the Grown-ups “Download game log” control is preserved as [`amari-game-diagnostics.json`](amari-game-diagnostics.json). It records distinct mobile Challenge seeds for the initial run and replay (`1670831017` and `3544950916`) and distinct Growing seeds (`3333216647` and `3425764289`). The export contains 103 game events and 13 run milestones, all for `counting`; its event fields are limited to game/event/time/level/round/seed/difficulty/hints/firstAttempt, with no child names or story text.

## Progress, rewards, layout, and diagnostics

- Both profiles reached Challenge only after completing all six rounds in Starter and Growing. Each completed all six Challenge rounds through normal play.
- Desktop's constellation book showed all three pages Earned. On mobile, after reload and ordinary profile selection, the header retained 9 stars and the constellation book still showed 3/3 pages Earned.
- The new mobile profile initially showed `Constellation book (0/3)` while desktop already had all three. After Amari completed the three surveys, switching through the visible player selector to Askia showed `0 stars`; Askia's separate Count the Stars showed Level 1 of 3 with 4 to finish. No Amari constellation reward appeared in that sibling profile, and no Askia round was started.
- The `390x844` capture of a 17-object Challenge board fits within the viewport. Browser measurements reported document/body width `390` at mobile and `1280` at desktop, with no horizontal overflow.
- Playwright reported zero console errors and zero warnings in both profiles. All loaded static requests, including the lazy Count the Stars bundle and rendered images/audio assets, returned HTTP 200.

## Screenshots

- [Desktop Growing Round 1](desktop-growing-r1.png)
- [Desktop Challenge Round 1](desktop-challenge-r1.png)
- [Desktop Challenge completion](desktop-challenge-complete.png)
- [Mobile Starter Round 1](mobile-starter-r1.png)
- [Mobile Growing Round 1](mobile-growing-r1.png)
- [Mobile Challenge Round 1](mobile-challenge-r1.png)
- [Mobile unlocked survey map](mobile-unlock-map.png)
- [Mobile constellation book after reload](mobile-constellation-book.png)
- [Askia sibling profile](mobile-askia-sibling.png)
- [Askia Count the Stars progress](mobile-askia-count-progress.png)
