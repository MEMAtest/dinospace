# Independent bounded phonics regression: immutable production candidate

Date: 2026-10-04
Candidate URL: <https://dinospace-eeblb91eh-memas-projects-23a0001d.vercel.app>
Deployment: `dpl_7wFmajPYqR6CPrTLFksm4dkGzppv` (READY)
Runtime source: `0d3ef056e569e3ef59763df388f26c3baa7783b8`
Baseline archive: `94d44d031d5835d0d9fa2128064ff83ba5880a62`
Identity: [production candidate identity](../production-candidate-identity.json). Its eight listed served runtime files returned HTTP 200 and match the expected hashes. The identity records that the canonical alias still points to the prior release. This report is a bounded candidate check, not a deployment or release decision.

## Guarded setup

Used a fresh Playwright CLI session at 1280×800 solely to verify the first-use Phase 2 default, plus separate desktop and mobile sessions for the saved-setting and gameplay flows; all began at `about:blank`. Installed `/api/voice` and `/api/story` HTTP 403 routes and verified both in the route list before first navigation. Chose Amari through the visible player card. Switched sound off using the visible `Turn sound off` control before game attempts; in-game headers read `Turn sound on`, confirming muted state. No answer/progress/storage injection, provider calls, or child data were used.

## Grown-up default and saved restriction

Fresh Grown-ups views at desktop 1280×800 and mobile 390×844 showed `Phase 2 · age 5-6`, `0 of 23 selected sounds`, Phase 2 pressed, and all 23 Phase 2 grapheme buttons pressed. In the mobile profile, tapped the visible `ff` button once; the summary became `0 of 22 selected sounds`. After visiting Letter Launch and Spelling Studio, returned to Grown-ups: the count remained 22, Phase 2 remained selected, and `ff` was visibly unpressed. In the desktop gameplay profile, the same visible `ff` change was made from the fresh 23-sound default at 1280×720; after resizing that profile to 1280×800 and visiting both games, reentry showed 22 with `ff` unpressed.

- Fresh desktop 1280×800 default view: [Phase 2 with all 23 selected](screenshots/desktop-settings-phase2-default-23.png). Desktop saved-setting reentry at 1280×800: [Phase 2 with ff off](screenshots/desktop-settings-phase2-ff-unselected.png).
- Mobile 390×844: [Phase 2 settings with ff off](screenshots/mobile-settings-phase2-ff-unselected.png).

## Letter Launch

At 1280×800, the first muted run presented `U`/`D`; choosing `U` held `Well done! Up starts with the u sound.` `Next mission` changed the choices to `F`/`C`; choosing `C` held `Great job! Cat starts with the c sound.` and another `Next mission` showed `B`/`O`. Preserved evidence: [Up success](snapshots/desktop-letter-launch-held-up.yml), [Cat success](snapshots/desktop-letter-launch-held-cat.yml), [fresh question after Next](snapshots/desktop-letter-launch-next-question.yml), and [Cat held screenshot](screenshots/desktop-letter-launch-held-cat.png). In a later Level 1 run, `E`/`U` choices gave a visible retry after `U`: `Not quite. Listen for the first sound in Egg again.` Selecting `E` held `Great job! Egg starts with the e sound.` with Next mission. This later retry/success is preserved in [desktop retry](snapshots/desktop-letter-launch-wrong-egg.yml), [desktop held success](snapshots/desktop-letter-launch-held-egg.yml), and [Egg success screenshot](screenshots/desktop-letter-launch-held-egg.png). Confirmed Back to world returned to Read & Write.

At 390×844, the first active Level 1 pair was `O`/`R`; selecting `O` held `Great job! Octopus starts with the o sound.` Next mission presented `D`/`M`. Selecting `D` produced `Not quite. Listen for the first sound in Moon again.` Selecting `M` held `Super! Moon starts with the m sound.` with `Next mission`. Evidence: [mobile retry](snapshots/mobile-letter-launch-wrong-moon.yml), [mobile held Moon success](screenshots/mobile-letter-launch-held-moon.png), and the subsequent fresh pair in [the saved mobile snapshot](snapshots/mobile-letter-launch-next-question.yml). The leave dialog's `Keep playing` returned to the question; a second attempt and `Back to world` returned to Read & Write.

## Spelling Studio

At both sizes, entered Level 1 `Copy the word`. The first active rendered word was `SAT`, with a chair picture and letter tiles. Sound remained off. Selecting `a` first on desktop and `t` first on mobile left the slots unchanged and showed `The next letter is s`; selecting `s`, `a`, `t` produced held success with `Next word`. The desktop held state said `Well done!`; mobile said `Great job!`. `Next word` replaced SAT with a fresh PAT prompt, reset the slots, and advanced visible skill-run progress to 1/5. The leave dialog's `Keep playing` preserved that active PAT round before confirmed Back to world returned to Read & Write.

- Desktop wrong cue: [snapshot](snapshots/desktop-spelling-wrong-sat.yml); held SAT success: [screenshot](screenshots/desktop-spelling-held-sat.png).
- Mobile wrong cue: [snapshot](snapshots/mobile-spelling-wrong-sat.yml); held SAT success: [screenshot](screenshots/mobile-spelling-held-sat.png).

## Rendering, console, and requests

At 1280×800 the rendered document width was 1280 and no broken images were found. At 390×844 the rendered document width was 390 and no broken images were found; Grown-ups content scrolls vertically. Playwright console reported zero errors and zero warnings in each session. Request summaries listed 42 desktop and 23 mobile static requests; no non-static requests appeared. Both 403 provider guards remained installed after the journeys. These checks establish neither human listening quality nor audible playback quality; sound was intentionally muted.

## Scope and limits

This verifies a fresh Phase 2 default, a visible `ff` restriction persisting across game navigation and return, and one wrong/correct/held/Next/back flow in Letter Launch and Spelling Studio at 1280×800 and 390×844 on this immutable candidate. It does not repeat the full gameplay matrix, test every taught-sound configuration, establish human listening quality, or accept/promote the candidate.
