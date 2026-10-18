# Next game UX review — 18 October 2026

## Scope and identity

Targeted live inspection of Writing Desk, Colour Mixing Lab, Solar System and Chess Explorers, supported by a shared-component source audit. Production deployment `dpl_2ofgXEQq5Stvw8CWBAwhcTvPZkFD`, runtime `a179d8efc22e48f91477d0f3adff57703b2130c8`. This is a prioritisation audit, not full catalogue acceptance. No product code or release changed in this review.

## Priority close-outs

| Priority | Game | Confirmed issue | Required acceptance |
|---|---|---|---|
| 1 | Writing Desk | At 390px, a normal click in the page followed by typing “Hello from Earth” produced an empty heading followed by a paragraph. Next remained disabled. The UI offered no explanation of why the typed title did not count. The four step labels are spans rather than navigation controls. | The heading step focuses a visibly labelled heading field; ordinary typing satisfies the step. Show why Next is disabled. Allow clear return to earlier steps and hold the current action beside the editing area. Rehearse heading → message → picture → save/reopen → Word export. |
| 2 | Colour Mixing Lab | Opening Play control contains only an icon. After Red + Yellow → Orange, no Next control appears; the next round replaces the result automatically (source delay 1100ms, observed after 1500ms). | Label Start clearly, teach prediction before revealing the mixture, hold the explanation until Next, show finite completion without an apparent reset. |
| 3 | Solar System | Overview, inspection, turn and zoom controls respond. Overview appears both in the top tabs and lower controls. Inspection controls start around y=1201 on 390px and y=1176 on desktop with an 844px viewport. | One overview/planet switch; concise nearby gesture guide; compact controls beside the planet; one current discovery goal with optional facts/details. Rehearse scroll, drag, touch and returning from overview. Lower controls alone are not proof that interaction is broken. |
| 4 | Chess Explorers | Move It practice completes after five legal moves, but the screen does not explicitly state that goal; five unlabelled dots carry progress. Of 36 square buttons, 35 have neither text nor an accessible square label. | State the goal and count in words; recommend a first activity; name board coordinates/pieces/moves; explain valid-move highlights; rehearse Learn → five moves → Next Piece with keyboard and touch. |

## Shared first-action issue

`GameSession.jsx` renders the opening Play button with an aria-label and a Play SVG, without visible action text. Colour Mixing was confirmed live. Source routing shows the same opening shell for these eight Amari games: Odd One Out, Letter Launch, Sound Safari, German Garage, Colour Mixing Lab, Pattern Parade, Spelling Studio and Dino Hangman. This is a shared clarity risk, not a claim that all eight games fail to function. A visible Start label and concise current goal should be reviewed together, then verified in each affected entry screen.

The source also schedules timed round changes in Odd One Out (1250ms), Sound Safari (1400ms) and Pattern Parade (2200ms). Their feedback timing needs direct rehearsal before assigning a failure or acceptance score.

## Evidence and limits

`observations.json` contains the live DOM measurements and outcomes. `source-hashes.json` identifies the reviewed files. `writing-mobile.png` is the single retained representative render. Writing's first-step blocker prevented a normal complete postcard journey; its synthetic draft was saved before leaving. Colour Mixing was exercised through one correct answer; Solar controls were used at 390px and 1440px; Chess was completed through five moves at 390px. No claim of a full all-game rehearsal is made. The console error check returned no application errors; it reported four warnings without returning warning text, so they remain unclassified.

Provider voice/story requests were guarded with 403 in one contained headless QA browser. No provider-generated content, paid voice calls or real child records were used. Earlier harness attempts missed the normal leave dialog or the icon-only session start; those were recovered through visible controls and are not counted as product crashes.

## Storage and recovery

Reused the existing checkout and dependencies; created no worktree, clone, installation, trace or video. Free space was approximately 121 GiB before and after. Review artifacts were moved once from the task output folder to this canonical evidence directory; no duplicate evidence folder remains. Retained one representative screenshot, compact logs/scripts and structured observations (under 0.5 MiB total). Unrelated worktrees and data were left untouched. Original command scripts refer to their former output path; recreate that small output directory before replaying a screenshot command. No cleanup outside this task was performed.
