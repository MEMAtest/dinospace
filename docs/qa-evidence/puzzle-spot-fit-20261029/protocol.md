# Pair 13: Puzzle Pop and Spot the Difference layout protocol

## Scope

This is a source-bound full visible-control layout replay for the current compiled Pair 13 release. It checks the existing Amari routes at **390×740** and **1440×844**. It does not replace earlier game acceptance, assign editorial scores, or claim that a layout replay is a new full game-quality acceptance.

The frozen source has three Puzzle Pop chapters (9, 16 and 25 pieces) and three Spot chapters (3, 5 and 7 differences). Each chapter has four authored scenes. The run covers 12 puzzle scenes and 12 Spot pairs per viewport, including 200 piece placements and 60 visible Spot changes. Only normal catalogue navigation and currently unlocked chapter options are used; nothing is seeded or reset.

## Source-bound interaction checks

| Game | Visible interaction | Geometry and progression checks |
|---|---|---|
| Puzzle Pop | Choose a chapter from “Choose another chapter”; use the public Hint/Show a piece mapping to select one loose piece and expose its destination; place it; advance with the held Next picture/Next chapter control. | Read each visible preview title, prove four distinct titles per chapter, count the displayed 9/16/25 board cells and loose pieces, measure every board cell at 48px minimum and in-viewport at scene start, and measure each actual destination, hint, held audio and Next control before clicking. On the first scene of each chapter, attempt a wrong empty space and confirm the title and loose-piece count remain unchanged. Require the visible piece count to advance after each correct placement. Listen to a packaged picture fact once per chapter and retain the held fact text. |
| Spot the Difference | Choose a chapter, use at most two magnifiers, then use the public `Check <region> detail` controls for any remaining target. Start each chapter with one wrong tap in a visible blank part of Picture B. | Read each visible pair title and prove four distinct titles per chapter. Measure each region button at 48px minimum, fully within the viewport, and center-hit-testable before use. On phones, measure and switch between both Picture A and Picture B tabs and confirm their rendered image boxes align. On desktop, require both image panels visible side-by-side and aligned. Verify the counter stays on the same pair after the wrong pixel, reaches the chapter's 3/5/7 target, and the two-hint control is exhausted. Require a held picture fact, packaged fact replay once per chapter, and a measured explicit Next control. |

The runner records progress/reward snapshots and hashes all browser storage keys. Expected game progress and ordinary diagnostic, sound-preference, and reward records are allowlisted; any other changed key fails the lane. The currently frozen Puzzle Pop build uses only its durable chapter receipt for parent rewards. Puzzle Pop and Spot chapter receipts use the reserved `dino:puzzle:` and `dino:spot:` parent-claim namespaces. This layout matrix does not claim replay-zero behavior or no reward farming.

### Optional 390px persistence-fault lane

`PUZZLE_SPOT_FAULTS=1` opts the 390px invocation into actual-control write/readback failure and retry checks for both games. Do not set this flag for 1440px. The runner arms a one-shot fault only around the final visible piece/difference action on the first authored scene, verifies the held result and the game's actual Retry control, restores the original `Storage.prototype` methods in `finally`, then retries. The same held result receives a committed-but-unconfirmed local readback fault before a final normal retry. Puzzle Pop's button is `Retry saving this picture`; Spot's is `Retry save`. Next controls must be disabled/absent until storage confirms the scene.

If a game has a naturally incomplete chapter with no existing receipt, the first such final chapter scene is used for a parent-claim write fault followed by a committed-but-unconfirmed reward-record readback fault. The exact same reserved reward token is retried, with one 2-point parent award and the local receipt marked claimed. Existing completed chapters without receipts remain ineligible, and are never reset or backpaid. When no chapter is naturally eligible, the runner reports the parent fault chain as not exercised with its reason; no new eligibility is forced.

Before opening the leased page, the Python runner makes a bounded no-cache HTTP request to the origin and exact compiled entry, recording status, content type, size, and SHA-256. In the page it waits for either the normal Amari player chooser or the world chooser before selecting or continuing. This prevents an unmounted React shell or an offline cached document from being counted as current runtime evidence.

Audio evidence means a same-origin packaged clip played and advanced. It does not assess intelligibility, pronunciation, or human-perceived quality. Provider attempts are blocked and recorded; any attempt fails.

## Prior acceptance evidence

The earlier Pair 2 release report remains the historical functional baseline: [batch2-uplift-20261022 README](../batch2-uplift-20261022/README.md) reports all 12 puzzle scenes and Spot pairs at 390×844 and 1440×844, including 200 puzzle placements and 60 Spot targets per viewport. The new driver uses 390×740 to catch current compact-phone layout regressions. The old 844px results are not relabelled as 740px evidence.

## Invocation

Root supplies the active browser lease and exact frozen runtime identity. The runner accepts only the existing preview (`http://127.0.0.1:5180`) or canonical Amari origin, and calls `run-code` in the already leased `amari-targeted-contained` page. It does not open a browser, create a context/tab/profile, or write app storage. The chapter selector is secondary navigation and may be deliberately scrolled into view; piece placements, Spot task controls, held facts, audio replay, and Next/reward actions are measured and clicked without automatic scrolling.

```sh
PUZZLE_SPOT_BROWSER_OWNER=pair13-puzzle-spot-native PUZZLE_SPOT_FAULTS=1 \
  python3 docs/qa-evidence/puzzle-spot-fit-20261029/run-puzzle-spot-fit.py \
  http://127.0.0.1:5180 390 740 /assets/arcade-EXACT.js FROZEN_RUNTIME_SHA
```

Run the normal command without `PUZZLE_SPOT_FAULTS` for `1440 844`. The same opt-in flag is valid for 390px native and production runs only. Use a unique invocation only after the owner has issued the lease and frozen entry. Reports contain the exact origin, entry, runtime/source identities, viewport, per-scene task labels, geometry, fault outcomes, and storage deltas. A failed lane preserves partial rows and one bounded failure screenshot; it must not be relabelled as a pass.

## Not covered here

The driver does not re-run the earlier native/public release matrices, test another child profile, alter saved progress to force a fresh reward, inspect hidden React state or authored answer coordinates, or assess editorial quality. Those claims require separate evidence.
