# Root review findings and repairs

Luna implemented the three activities; root reviewed the source, used actual controls in the contained browser, inspected screenshots and returned concrete failures for repair.

1. Astronaut consolidation originally retained long 18/13/15-question runs. Replaced with five-question balanced/randomized runs from all 46 retained questions, with fresh replay selection.
2. Non-hero Astronaut questions initially had praise without a teaching fact. Added explicit educational explanations; hero facts remain until the child continues. No new paid voice corpus was generated; existing question/praise/hero narration remains and retry uses an existing packaged clip.
3. Raw emoji-heavy Astronaut question/answer visuals were replaced with consistent vectors, meaningful shapes/numbers/animal marks and portrait fallbacks. Removed unsupported pause/resume and badge claims.
4. A daily challenge overlay covered the third Astronaut mission. Added Astronaut to the existing overlay exclusion list; curriculum and code were already excluded.
5. The Curriculum Learn screen reserved a large blank vocabulary column and Start had poor contrast. Moved optional content below a compact preview, put the single Start beside the intro, and fixed primary-action contrast across all topic colours.
6. Curriculum facts no longer show active answer controls or redundant prompt audio. The stage label changes to Fact. Technical skill IDs, school-term tags and repeated controls are absent from active play.
7. Static history preview chronology was corrected to Letter → Photograph → Telephone → Smartphone.
8. Ocean rounds previously showed only wave markers plus unrelated land pins. Named ocean targets now stand alone and fit mobile without overlapping or clipping.
9. Predictions were incorrectly displayed under Try again. The observation now guides the next step without marking a prediction wrong.
10. Code's first mobile version had an intrinsic-size Pip image clipping coach text and pushing the first action far below the viewport. Bounded images/text columns, compact header and current action above the board fixed this; default tools remain closed.
11. Debug repair no longer requires Add + repeated Move earlier. It is a direct two-step repair after trying the supplied code.
12. Root found a functional Repeat regression: compressing eight blocks to four made the scaffold offer Add again and removed Run. Explicit build → replace → run stages and a meaningful 8→6→4/saved-program regression test fixed it.
13. Removed unsupported Code badge-earned claims; actual success describes the completed task. No unsaved browser dialogs occur on normal Next. Real four-block save/reopen/run was exercised.
14. Root tightened mobile mission hierarchy, primary-button contrast, path-arrow contrast and keyboard focus. No normal Chrome windows or extra QA tabs were used.

15. Froze adaptive Astronaut difficulty for each five-question mission. New recommendations apply to the next mission; a correct answer cannot move or multiply its answer choices during feedback.

16. Tightened coding instructions to distinguish the program being planned from the rover’s current position. Editing code resets Pip to the start; the guide no longer falsely says Pip has already reached the corner or sample before Run.

## Local verification

- 22 meaningful focused tests pass (Astronaut mission coverage/facts/randomization, Code flow, rover semantics/storage, Curriculum module/queue/badge contracts).
- Scoped ESLint passes; production Vite build passes with existing chunk/Browserslist warnings.
- Astronaut: six full missions, 30 answered questions, wrong/retry/fact/completion/fresh replay, desktop and390px. Fact remained available after the old dismissal interval.
- Curriculum: 18 completed five-question runs, 90 questions, all three topics and all three difficulty bands at desktop and390px; 12 round mechanics covered, including route, sequence, ocean, country, map key and prediction/observation. No queue reset before completion.
- Code: six completed missions across both widths, wrong supplied code/direct repair, eight-to-four Repeat transformation, saved program left/reopened/run; no unexpected native dialogs.
- No application page errors, missing required imagery or horizontal overflow in recorded journeys. Full screenshots, expected-data-based native-control scripts and structured results retained.

Preview and production acceptance are recorded separately in the final report; these local results are not substituted for live proof.
