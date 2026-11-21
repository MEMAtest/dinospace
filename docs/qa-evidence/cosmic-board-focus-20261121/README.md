# Focused boards · 21 November 2026

Cosmic Tic-Tac-Toe, full Chess matches and Puzzle Pop give the active board the space previously used by the site-wide header. Each game retains its own navigation and audio control. Cosmic keeps mode switches under **Game options** and shows a new board immediately through **Play again**. A Rocket win highlights the three actual winning squares and explains how to block two in a row.

| Active board | Live 390×740 touch | Live 1440×900 mouse and keyboard |
| --- | ---: | ---: |
| Cosmic Tic-Tac-Toe | 374 px wide | 608 px wide |
| Chess vs computer | 374 px wide | 748 px wide |
| Puzzle Pop, 3×3 | 366 px wide | 544 px wide |

At 390 px wide, Cosmic's board moved from 461 px down the page to 134 px and grew from 273 px to 374 px. The full boards fit within the first screen at both live sizes.

- Cosmic actual controls covered a Rocket win across squares 4, 5 and 6, a Dino diagonal win, a draw, replay, totals after reload, a Captain bot reply, leave and stay, and a tactic retry with hint, solved line and Next.
- Chess advanced a white pawn from e2 to e4 and received a legal computer reply. Both moves remained after reload and the Lessons control returned to the menu.
- Puzzle Pop completed a picture with the hint and board controls, proceeded to the next picture and returned to its world. Desktop used keyboard for puzzle placement and the chess move. Phone and narrow candidate checks used Chromium touch input.
- All 770 repository tests passed. The three serving targets matched 8 built resource hashes. The real **Refresh games** control preserved 118 synthetic storage records and the IndexedDB Storybook fixture. No browser errors, HTTP failures or provider calls occurred during the final walkthroughs.

Release source `2f7acd896e85ab931677f667a8d38c8b08f13b9b`, module `/assets/arcade-Brofo_4n.js`, worker `amari-discovery-v90`, backend deploy `dpl_5d6c8HZFew7cRuQp8tih129bQ8ZB` and Netlify deploy `6b01f20e378d43877421f23d`.

[Cosmic Tic-Tac-Toe](https://dinospace.netlify.app/#/play/tictactoe) · [Live Rocket result](rocket-live.jpg) · [Structured results](production-summary.json)
