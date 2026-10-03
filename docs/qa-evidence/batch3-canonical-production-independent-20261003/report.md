# Canonical Batch 3 production regression delta

Date: 2026-10-03
Production URL: [https://dinospace-eight.vercel.app](https://dinospace-eight.vercel.app)
Deployment: `dpl_2d8La99iCHGQAUNjCpfagawN9LB8` (Vercel READY)
Source: `a6e1e675411a9a6d48b3f8e99fdbd5ad44ea44f4`
Identity: [`batch3-canonical-production-identity-20261003.json`](../batch3-canonical-production-identity-20261003.json)

## Scope and method

This is an independent production regression delta for Count the Stars, Letter Trace, Cosmic Tic-Tac-Toe, and Dino Detective. I used two fresh isolated browser sessions at desktop 1280×800 and mobile 390×844. Before each first production navigation, I installed Playwright routes for `/api/voice` and `/api/story` with 204 responses, then confirmed both routes were active. No provider or story requests were made. I selected Amari through the visible player picker and used normal game controls. I did not seed or inspect storage/progress, extract hidden answers, or call a provider.

The production identity records all seven served runtime hashes matching the promoted source. The retained configured-preview regression report uses this same source SHA; the earlier full local matrix is supporting lineage context only and is not represented here as a production run. See [`batch3-configured-preview-independent-20261003`](../batch3-configured-preview-independent-20261003/report.md) and [`batch3-final-package-local-20261003`](../batch3-final-package-local-20261003/report.md).

## Actual control results

| Game | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| Count the Stars | Ordinary Maths route to Starter / Star Garden. Tapped four visible planets, used Show a clue, submitted wrong `3` and observed corrective feedback, then correct `4`; success explanation and Next remained visible. | Separate fresh profile, same ordinary entry. Tapped four visible fireflies, used clue, wrong `3` feedback, then correct `4`; held success and Next observed. |
| Letter Trace | Ordinary Read & Write route to chapter 1. Enabled keyboard mode, focused the visible canvas, Space began the stroke, ArrowRight advanced the keyboard guide, and Space finished each of D's two strokes. Check shape held success; Next letter advanced. The progress text remained `0% traced` during partial key movement until Space finished a stroke, then jumped to `14%`/`100%`. | Ordinary chapter 1 entry. Used pointer movement along the visible G guide, from its green start through the visible curved path to the endpoint. Progress reached 100%; Check shape held success and Next advanced to M. Screenshot preserves the completed pointer state. |
| Cosmic Tic-Tac-Toe | Ordinary Thinking & Play route, Make a line board 1. Wrong square showed retry feedback; Retry restored the board; Show hint marked the visible winning square; selecting it showed 1/3 solved and held the explanation with Next tactic board. Confirmed Back returned Thinking & Play. | Same normal entry. Wrong square, Retry, visible hint target, correct target, held success and Next all worked. Confirmed leave returned the chapter map with 1/3; reload retained that map/progress, and Back to learning world returned Thinking & Play. |
| Dino Detective | Ordinary Explore & Languages route, Starter / Jungle Jive. Wrong cover produced “Not this cover”; Show a clue marked spot 4 and described the lower-left location; selecting it revealed T-Rex and fern facts with Next find held. Confirmed Back returned Explore & Languages. | Separate fresh profile, same chapter. Found the first visible target and facts, then on the next find tested wrong cover → clue target → correct cover. The two facts and Next find were held. Reload returned to the chapter map with Jungle Jive ready; no accidental chapter completion or badge appeared. |

Screenshots and accessible snapshots are in this folder. These checks exercise representative mission rounds and tactic board 1, not all chapters or every randomized queue.

## Packaged audio, mute, and exit cancellation

Desktop Dino Detective provided direct browser media evidence. An observation-only wrapper around the native `Audio` constructor returned actual browser `Audio` objects and left their original `play()`/`pause()` behavior untouched. A same-origin packaged clip (`audio/en/ac4e248c-matilda.mp3`) emitted native `play` and `playing`; `timeupdate` advanced to about 4.2 seconds of its 5.20-second duration. Replaying Read facts again constructed and played the clip again. Tapping Turn sound off emitted native `pause` at time 0. While the same clip was playing, Back to learning world opened the normal confirmation; confirming Back to world returned to Explore & Languages and emitted native pause/reset at 0. Other same-origin packaged narration files returned HTTP 200 or 206. Both provider routes remained guarded; there were no external voice/story requests.

This is evidence of actual browser media playback and cancellation, not a human listening-quality review or complete narration audit. Mobile flows also loaded same-origin packaged audio; mobile audio event timing/cancellation was not separately instrumented.

## Navigation, reload, console, and assets

Back confirmations offered Keep playing and a distinct confirmed exit. World-specific return routes were correct for all four games: Maths Missions, Read & Write, Thinking & Play, and Explore & Languages. Cosmic reload retained its completed-board count (1/3). Dino Detective reload returned to its chapter map without inventing a find/badge. This bounded delta did not exhaustively test reload behavior in every game.

Both browser consoles ended with zero errors and zero warnings. Static request review found no failed application assets; packaged audio requests succeeded (200/206). The only non-static routes observed for these profiles were the explicit 204 voice/story guards.

## Finding and release boundary

One visible usability issue reproduced in production: Letter Trace's progress text and progress bar do not refresh during partial keyboard arrow movement. After focus on the canvas and Space-start, ArrowRight movement advanced the hidden-in-the-interaction high-water cursor, but the visible label stayed at 0% until Space ended the stroke; it then jumped to the completed-stroke value. The keyboard path itself completed D successfully, Check shape and held feedback worked, and the mobile pointer path remained functional. This is an interaction-feedback defect, not a blocked lesson.

No other blocking defect was reproduced in the bounded controls above. This report confirms the exercised production interactions against the named canonical deployment only. It is not full Batch 3 4.5 acceptance, a complete three-chapter/six-mission matrix, full randomized replay/star accounting, exhaustive sibling isolation, complete touch-target audit, or production voice/story certification.
