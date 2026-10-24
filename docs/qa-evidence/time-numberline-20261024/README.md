# Time Teller and Number Line Jump — targeted close-out, 24 October 2026

## Acceptance before implementation

Existing production baseline: `8efdde9d7b1f130f2c720e64584127303b04032e`, public Netlify origin. These games already have three six-mission chapters; this work must improve the learning interactions while preserving their records, packaged narration and curriculum return route.

| Game | Release acceptance |
|---|---|
| Time Teller | One clear mission and start action; readable hour/minute distinction; optional hands-on clock practice available before the first chapter. Direct touch/mouse hand-setting plus keyboard/button alternatives, quarter-hour snapping and correct hour carry/wrap. Read, quarter-to, routine and set missions agree with rendered hand angles and answer labels. Six distinct questions per chapter; wrong retry and one-use clue; correct worked answer stays until Next and packaged explanation replays. All three chapters, replay, earned stars/badges, reload and Maths/Curriculum return work at 390 and 1440px. Final earned chapter is stored when the last answer is solved, even before Finish. |
| Number Line Jump | Whole number line fits the phone without a hidden horizontal strip; start, current frog and each accepted hop are visible. Full-size tap/keyboard controls and frog swipe move exactly one step; wrong direction changes neither position nor hop count. Missing-start/hops/landing and farther/larger comparisons have clear, separate visual models without accidentally labelling an unknown answer. Six distinct questions in each of three worlds. Retry, clue, held/replayable explanation, normal unlock, replay, durable earned records, reload and parent return work at both widths. Final earned world is stored before Finish. |

Shared: controls at least48px, no page overflow, broken images, console/page errors or paid provider requests. Use only the one persistent synthetic headless QA browser and existing installed dependencies. No resetting of any progress ledger. Production acceptance requires the verified immutable candidate, gateway preview and final public Netlify rehearsal. Technical playback is recorded separately from subjective human listening; no automatic5/5 editorial claim.

## Status

Released and functionally accepted for this targeted scope. Public site: **https://dinospace.netlify.app**. Runtime `f85db347ab536951be3a7e10ddbda839597b088e`; backend `dpl_CDiS4ZxG8NrXZs1VHwdJ4KcPhPGD`; Netlify production gateway `6adcedbc9cb8b516a859de79`; service-worker v32. The backend remains the pinned internal immutable upstream, with the old public Vercel root/index redirecting307 to Netlify. Baseline DOM/phone geometry retained in `baseline.json`.

## Rehearsal repairs

The first390px local run found a3px inner overflow in one comparison figure when the frog sat at the scale edge. The endpoint padding was increased and the SVG scale aligned with the new inset. Retain the failure observation; rerun the actual chapters before accepting.

The QA helper briefly false-blocked on a CLI event/status line because it counted every leading dash as a tab. Read-only session/tab inventory confirmed one persistent headless tab. The parser now counts only numbered tab entries and still rejects two/zero tabs; fixture checks cover both. One local rerun command continued after the false block due shell exit handling; the existing owner lease remained valid, the same single tab was used, and no browser resource was created. Subsequent orchestration requires a successful ready result before gameplay.

## Delivered

- Time Teller: readable clock face and hand legend, optional interactive practice before Chapter1, direct touch/mouse hand selection and dragging, quarter snapping with hour carry, large button/keyboard alternatives, compact expandable hand lesson, one task at a time and replayable held explanations. Every Clock Explorers run includes whole/half cases; Past and To includes both quarter directions. Same-hour/different-minute distractors require reading both hands. Existing questions, narration and progress IDs are retained.
- Number Line Jump: the whole scale fits the phone; each accepted hop draws one arc and moves the frog one space. Tap, keyboard and frog-swipe input; clear start/landing labels and two separate comparison journeys replace the wide scrolling strip and tiny S/L/A/B markers. Unknown start/landing values stay unlabelled before a clue or solution. Worked explanations stay until Next and can replay.
- Both games save a completed chapter/world and earned reward delta when its final answer is solved. Reloading before Finish retains the earned record. Replay preserves best stars, unlocked chapters and the highest resume chapter, and never pays unchanged stars twice.

## Final evidence

| Gate | Result |
|---|---|
| Source | Full suite365/365 passed, zero skips; ESLint passed; production-configured build passed. Eight emitted-worker install/cache/range/media tests passed. |
| Narration | Existing5246 packaged Batch4 clips ready, zero pending. No new paid voice/story/image calls. Representative explanations actually started playback at both widths, including routine set missions. Existing subjective listening quality was not re-certified by playback assertions. |
| Local |36 missions +12 replay missions at390px; all three chapters/worlds earned normally, with no storage reset. |
| Candidate | Gateway preview matches immutable backend HTML/worker and entry/style availability; valid public-origin voice/story API preflights. Full36+12 native missions at390px passed. Mouse drag3:15→3:30→3:45→4:00 passed at1440px. |
| Public production | **96 missions/replays**:36missions+12replays at each of390×900 and1440×900. Read/set, forward/back, all missing-equation positions, both distance/landing comparisons, wrong retry, one-use clue, held feedback, actual audio, keyboard/touch/swipe, normal unlock and replay passed. Visible controls≥48px; no horizontal page/figure overflow. Console/page errors0; failed art/audio responses0; provider requests0. |
| Durability | Both games reloaded after final correct answer before Finish; all earned records/reward values remained. Final all-three-chapter records and replay best stars survived reload. Existing synthetic Counting and Askia records remain; no real child/profile data was used. |
| Navigation/update | Maths returns passed both widths. Time Detectives → clock → reload → Time Detectives passed. Current entry and active worker cache are v32; Game update available notice absent. Both old entry links retain307 to Netlify. |
| Identity | Vercel API source SHA/READY and Netlify published deploy verified. Public HTML, emitted worker, both entry modules and both stylesheets match the production-configured local build byte-for-byte. See `production-http.json` and `served-runtime.json`. |

The first local byte comparison used the default disabled dynamic-voice build flag and therefore differed from production. Rebuilding with production's existing `VITE_ELEVENLABS_ENABLED=true` resolved that comparison exactly. The flag does not affect mandatory packaged playback. No provider request was made during QA. An initial unpublished candidate `dpl_81j9ZsqCWK6c1DSe3ttsPCivdUrx` was superseded by the same-hour distractor improvement and was never promoted to the public app. Initial Curriculum selectors incorrectly assumed the related link was outside collapsed notes and included an aria-hidden emoji; final traversal uses the actual visible controls/accessibility names and passes.

Historical catalogue/editorial scores are unchanged. This is acceptance of these two targeted functional uplifts, not an automatic5/5 score or proof that all26 games are complete. Other games and the unresolved historical personal-story inventory are outside this release.

## Representative final public views

| Game |390px|1440px|
|---|---|---|
| Time Teller |[phone](timeteller-390.jpg)|[desktop](timeteller-1440.jpg)|
| Number Line Jump |[phone](numberline-390.jpg)|[desktop](numberline-1440.jpg)|

## Resources and handoff

Reused the canonical checkout, installed dependencies and single persistent headless Chromium profile/tab. No worktrees, installs, browser windows/profiles/tabs or new raster assets were created. Original clock/frog SVG artwork supports precise teaching diagrams. The existing389MiB build was rebuilt in place; final evidence and four retained JPEGs occupy under0.5MiB. Final persistent synthetic browser profile is about156MiB, below256MiB; it is retained without clearing its state. Free disk was about51GiB before and50.5GiB after; this shared-volume difference is not all attributable to this task.

Task-owned Vite server5328 was stopped, the task's Python bytecode file removed, and representative screenshots moved to this one evidence folder. Unique failure observations and bounded temporary deployment/test logs are retained for diagnosis; unrelated worktrees, ignored data, older evidence and dependencies are preserved. `cleanup-manifest.json` records hashes, sizes, process identity and rollback. Quiet monitoring has the new baseline and includes Time Teller/Number Line Jump in its rotation; browser ownership is released while leaving the one headless session available.
