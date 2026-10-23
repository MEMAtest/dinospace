# Three-game maths uplift — 23 October 2026

Scope: Count the Stars, Addition Adventure and Subtraction Station, selected as the next three outstanding games in the delivery backlog. Luna builders own the scoped component changes; root owns review, native rehearsal, release and canonical verification. This report does not change historical editorial scores.

## Per-game acceptance instructions

| Game | Required scenarios |
|---|---|
| Count the Stars | All three surveys, six rounds each, all fifteen named scenes. Starter 1–5, Growing 1–10, Challenge 1–20. Each button depicts one named object; 48px non-overlapping hit regions at 390; 56px at desktop. Native touch, mouse/keyboard, counted badges, repeated-tap protection; wrong total retries same round. Recount resets only current badges, uses a clue and preserves mistakes. Correct explanation waits for Next and can replay packaged audio. Direct next-survey path, collection/replay art retains earned status, all 3 pages and progress survive reload. |
| Addition Adventure | Six unique questions in each of Groups, Bonds and Stories. Groups bounded to10; bonds/stories to20. Joining and splitting conserve the same object total without duplicating the whole beside its parts. Explicit equation and visual whole/part model. Wrong retry and one-use hint; solved explanation is held until Next, replay narration and keyboard answer work. All3 chapters unlock in order; replaying an earlier chapter never reduces resume point or best stars; reward delta only. |
| Subtraction Station | Six unique questions in each of Take Away, Compare and Stories. No negative answers; zero/equal cases supported by finite-pool tests. One original object set, capped removable selection, Undo/Reset and settled correct model even if optional taps were skipped. Exact matching icon retained. Comparison pairs align and wrap at 390; empty slots and unpaired counters agree with absolute difference. Explicit equation, wrong/hint recovery, held/replayable explanations, keyboard/touch, ordered unlocks and persisted best progress. |
| Shared release gates | 390×844 and1440×844 native journeys through every chapter; no horizontal overflow, ≥48px actionable targets, zero console/page errors or broken illustrated/audio assets. Guard provider APIs, preserve real child data, use only one contained synthetic browser. Build, scoped lint, finite-pool/progress/narration tests and emitted PWA audit pass. Verify exact immutable and canonical Vercel identities and served code. |

## Reproduced baseline and fixes

- Root's production Addition rehearsal showed10 original stars still present beside10 result stars after answering10+0: visually20 while the lesson answer was10. Baseline DOM evidence is retained in `baseline.json`.
- Source review found subtraction marking removal before a learner action and adding separate duplicate take-away/result groups. The new model uses one original set, mark/unmark, Undo/Reset and exact same-object remaining counts. Comparison now uses responsive pair units rather than a long20-row column.
- Counting had no answer-stage recount, no fact replay, dimmed earned replay art, several multi-object motifs for one target, and equally prominent starts once multiple surveys unlocked. The patch provides recount, existing recorded explanation replay, one berry/star/meteor/nebula light per target, earned-state art and clearer next-survey guidance.
- Addition keeps its optional join/split reversible before answering. There is no forced waiting timer: explanations remain indefinitely until the child's explicit Next.

## Verification and evidence boundaries

Native runs start with only the three synthetic QA profile ledgers empty. No earned chapter, answer, random seed or reward is injected. Questions are solved from rendered equations, visible object sets and pair counts. Tests exercise actual controls; true touch uses Chromium input events. This is separate from the user's real in-app profile. Existing unrelated evidence is preserved.

Packaged playback checks prove media playing and playhead advancement, not an independent pronunciation/loudness listening review. No new paid voice jobs, story requests or image-generation calls are part of this batch. Existing finite narration and accurate SVG manipulatives are reused. No new editorial score is inferred from deployment.

Builder notes: `count-builder.md`, `addition-builder.md`, `subtraction-builder.md`.

## Final source-bound results

**Functional release passed.** Runtime `03773d034120af12605e7037c23de1eda964b5de`, canonical deployment `dpl_AHueSG9Lk5TNwPVgkHxHc5hvRmg3`, READY. Candidate and canonical entry bytes match; service-worker cache is **v27**. Local and Vercel builds are not asserted byte-identical.

| Check | Result |
|---|---|
| Local | Phone 54 questions; desktop 72 including completed earlier-chapter replays. All15 count scenes at both widths. These runs preceded a final Count the Stars fact-panel declutter; the final candidate and production runs cover that source. |
| Immutable candidate | Phone 72 questions including replay; every chapter, all 15count scenes, audio and persisted progress passed. |
| Canonical production | **144 questions:72 at 390×844 and72 at 1440×844.** Each game completed all 3 chapters and an earlier-chapter replay. All15count scenes at each width. |
| Interaction | Real touch, keyboard Enter, wrong-answer retry, one-use hint, join/split, capped removal, Undo/Reset, recount, explicit Next and parent-world returns passed. |
| Models | Addition conserves object totals before/after joining. Subtraction keeps the same original set and settles the removed/remaining amounts correctly. Comparison A/B counts match the visible problem. Phone counting targets do not overlap. |
| Feedback/audio | Explanations held over 6 seconds at each chapter's representative first question and replayed through actual packaged media. No forced Next delay. Replay completion preserves earned artwork, best stars and highest unlocked chapter. |
| Errors | Zero observed page errors, console errors, broken illustrated/audio assets or provider API requests in final production runs. |
| Automated | **349 passed,1 existing generic PWA skip,0 failed**; emitted-build PWA audit **8 passed,0 skipped**; scoped ESLint/build passed. |

Root review also removed empty moved-source trays/dangling operators after addition joins, added a non-colour strike to removed objects, simplified the nebula light to one object, and cleared obsolete counting hints/tools from the solved fact panel. The phone geometry regression test covers every count 1–20 in both layouts on 308px/48px and 440px/56px boards.

The user's real in-app profile was inspected read-only while at Home with its break reminder; no real gameplay or record reset was performed. Refresh the existing user tab when ready to load this release. Quiet monitoring verifies current deployment and assets and reuses the isolated QA session for controls only when it is available; it never creates extra browser windows or touches real child records.

## Representative production views

| Game | Phone | Desktop |
|---|---|---|
| Addition | [view](addition-390.webp) | [view](addition-1440.webp) |
| Subtraction | [view](subtraction-390.webp) | [view](subtraction-1440.webp) |
| Counting | [view](counting-390.webp) | [view](counting-1440.webp) |

## Resources and cleanup

No worktrees, source copies, dependency installations, paid voice/story requests or generated raster-art calls were created. Existing compatible dependencies/build directory were reused. Accurate SVG objects and existing recordings supply the teaching visuals/audio. Keep only compact JSON, six representative WebP renders, source replay script and builder/root acceptance notes here. Task-owned duplicate PNGs and parsed raw browser logs are removed after extraction; unique baseline DOM evidence remains in `baseline.json`. Existing unrelated untracked evidence is preserved. The task-owned Vite server is stopped; the single contained QA browser may be reused by monitoring.

Final retained QA folder is approximately 0.5 MiB; the existing 389 MiB build directory is retained for recovery and audit.
