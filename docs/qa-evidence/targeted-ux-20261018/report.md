# Targeted game UX release — 18 October 2026

> Follow-up: user feedback exposed a Code Cadets navigation gap. [The navigation correction and new rehearsal](../code-navigation-20261018/report.md) supersede the Code navigation/clarity acceptance below.

## Outcome

Released and independently rehearsed Astronaut Academy, Curriculum Quest and Code Cadets. Each passes all five criteria in [the acceptance contract](acceptance.md): **5/5 against this targeted UX contract**. This score describes the tested entry, play, teaching/recovery, progression and responsive presentation. It is not a universal claim of perfection or acceptance of the other catalogue games. The broader 26-game editorial/audio roadmap is unchanged.

Luna agents implemented bounded changes. Root reviewed the source, rehearsed actual controls, returned failures for repair, checked screenshots, integrated the fixes and performed the production acceptance. [Sixteen concrete findings and repairs](findings-and-fixes.md) document that review.

## What changed

- **Astronaut Academy:** seven categories combined into Launch Lab, Earth & Life and Space Explorers. Five balanced, randomized questions per mission retain the 46-question pool. A recommended first mission, consistent vector icons/portrait fallbacks, useful facts and explicit Next replace the overloaded selection and timed feedback. Difficulty/choices remain stable during each mission.
- **Curriculum Quest:** distinct Learn → Play → Fact → Next/Finish states. Entry says Explore rather than asking an unanswerable question before Start. Optional words, notes, badges and level controls are tucked away. Answer controls disappear after success. Ocean targets are labelled and fit mobile; predictions receive neutral observation feedback. History links to working time-telling practice and returns to its parent world.
- **Code Cadets:** one guided next action, visible facing direction and secondary advanced tools. First sequence, direct debug repair and worked Repeat/Collect progress to completion. The eight-step program compresses to four blocks without losing Run. Actual four-block save/reopen/run works. Planned-movement wording no longer claims the rover has moved before Run.

## Acceptance results

| Activity | Clear entry | Focused play | Teaching/recovery | Progression/storage/navigation | Visual/responsive/accessibility |
|---|---|---|---|---|---|
| Astronaut Academy | Pass | Pass | Pass | Pass | Pass |
| Curriculum Quest | Pass | Pass | Pass | Pass | Pass |
| Code Cadets | Pass | Pass | Pass | Pass | Pass |

Widths: 1440px desktop and 390px mobile. Keyboard entry/focus, retry, deliberate wrong answers, fact continuation, completion, replay and parent navigation were exercised. Code storage used the isolated synthetic child profile. Main targets measured at least 44px; the inspected journeys have no horizontal overflow or missing required images. Browser page-error arrays and final error-console capture are empty.

## Source and deployment binding

Final canonical URL: **https://dinospace-eight.vercel.app/**

- Project: `prj_Ynw7abkJRQph4IebF9jonrYmEC4w` (`dinospace`).
- Final runtime source: `105a8d3121f2c47790d63e0ce7fb732bf4cb4519`.
- Final production: `dpl_9SXHWSRBvGEmFsp1ZHnmCCveNHkd`, READY, target production.
- Final tested preview: `dpl_4YYRt3zTdn4FH51KheykdJ93hS3K`.
- Main functional source: `01103b3b532881860cfbf357b1aba8dd7a64235e`.
- Main functional production: `dpl_7akeyKguApmispJE8MWpdQRV1eyM`.

Vercel promotion creates a new deployment identity. The final alias was independently resolved after rehearsal, not inferred from the preview URL. Identity responses and targeted source hashes are retained beside this report. Deployment metadata marks the workspace dirty because evidence was uncommitted; the intervening runtime diff is exactly three Code teaching-string replacements in `CodeCadets.jsx` (3 insertions/3 deletions). Astronaut, Curriculum, Code logic and styles did not change between these two releases.

## Evidence and scope of rehearsal

### Local/preview gates

22 meaningful focused tests passed: mission coverage/facts/randomization, coding stages/repeat semantics/storage, and curriculum modules/queues/badges. Scoped ESLint and Vite build passed. Existing bundle-size/Browserslist warnings remain. Local actual-control rehearsal completed 30 Astronaut questions, 90 Curriculum questions and all three Code missions at both widths. Preview rehearsals passed, including all final Code missions on the final wording candidate.

### Main functional production (`01103b3b`)

- [Astronaut](astro-production.json): six completed missions, 30 questions; wrong/retry/fact/next/finish/fresh replay. Feedback remained available beyond the former timed-dismiss interval.
- [Curriculum](curriculum-production.json): 18 completed five-question runs, 90 questions, three topics × three levels × two widths. No premature restart. [Additional investigation rehearsal](investigation-production.json) covered neutral prediction, observation, wrong conclusion and recovery; combined live coverage exercised all 12 round mechanics.
- [Code](code-production.json): all three missions at both widths, wrong supplied code/direct repair, eight-to-four Repeat transformation, four-block save/reopen/run, no unexpected native dialogs.
- [Navigation and keyboard](navigation-production.json): visible keyboard focus, mission activation/back, disclosure keyboard activation and Time Teller round-trip to Time Detectives.

### Final canonical production (`105a8d31`)

- [Astronaut repeated in full](astro-final-production.json): all three missions at both widths, another 30 questions, retry/fact/completion/replay.
- [Code repeated in full](code-final-production.json): all three missions at both widths; explicit final wording assertions; save/reopen/run four-block program. No dialogs or page errors.
- [Final smoke](smoke-final-production.json): Curriculum Explore → Start → answer → Fact and Code first mission at both widths, no page errors. The complete Curriculum matrix above remains source-bound to unchanged Curriculum code; it was not falsely counted as another 90-question run on the final wording-only deployment.
- Full scripts, logs and screenshots: [functional production](functional-production/) and [final production](final-production/). Final error-console capture reports zero errors and warnings.

## Boundaries

One contained headless Chromium session/tab was reused. Provider voice/story routes were guarded with 403 before gameplay. No paid voice calls, generated stories, new image generation, real child data edits or recurring monitoring restarts were performed. Existing packaged narration and artwork were retained; new non-hero Astronaut facts are readable text, not a newly recorded narration corpus. Audio listening/editorial acceptance for every game remains outside this targeted UX close-out.
