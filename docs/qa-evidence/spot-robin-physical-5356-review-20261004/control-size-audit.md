# 390px Spot control-size audit (5356)

Same fresh mobile profile and guarded local origin as the 5356 Robin review. This bounded pass reused its ordinarily earned 4/4 chapter progress. It did not restart the 12-pair matrix. Width checks were `innerWidth=390`, `documentElement.scrollWidth=390` throughout; no horizontal overflow was observed.

| State / visible control | Measured CSS bounds | State and reachability |
| --- | ---: | --- |
| Chapter map: each of the three chapter selectors | 310×76 px | Enabled because the retained profile had earned 4/4 pairs in each chapter; all fit within the viewport width. |
| Chapter map: Replay chapter | 219.6×56 px | Enabled; fits within the viewport. |
| Active game: Back to learning world | 48×48 px | Enabled at x=12, y=12. |
| Active game: Turn sound on (sound remained muted) | 48×48 px | Enabled at x=330, y=12. |
| Active game: Hear clue | 132.8×48 px | Enabled. |
| Active game: Magnifier, before spending hints | 173.4×48 px | Enabled. |
| Active game: Magnifier 0 left | 173.4×48 px | Disabled after using both hints; remained a full-size control. |
| Active picture: each of seven unfinished target controls | 56×56 px | Enabled; target positions stayed inside the 390px document width. Bottom controls can fall below the initial 844px viewport, but normal vertical scrolling brought the image and all targets into view; their document bounds remained valid. |
| Held pair fact: Next picture | 160.8×48 px | Enabled and fully visible at x=114.6, y=418. |
| Held chapter-completion fact: Replay chapter | 183×48 px | Enabled and fully visible at x=103.5, y=418. Screenshot: [mobile held chapter completion](screenshots/mobile-held-chapter-completion.png). |
| Leave dialog: Keep playing | 96×96 px | Enabled and centered in the dialog. |
| Leave dialog: Back to world | 80×80 px | Enabled and centered in the dialog. |

No actionable target measured below 48px in either dimension. The `Search Picture B for a change` button spans the image area (334×334px) and is the image’s pointer surface; individual visible in-picture answer targets are 56×56px. Numbered “Changes found” indicators are non-interactive spans and are excluded from this touch-target check. Offscreen controls required ordinary vertical scrolling, not horizontal scrolling; all relevant page and control bounds were within the document, and the actual image could be scrolled into view.

The active control checks were observed during ordinary replay on the shared Spot layout. The retained profile no longer had a locked chapter button, so this report does not claim a fresh locked-state measurement. Browser console showed zero errors or warnings, and the pre-navigation `/api/voice` and `/api/story` guards remained installed. No provider or audio call was made.
