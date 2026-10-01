# Four-game quality batch 1

Date: 1 October 2026. Status: first four games independently accepted at **4.5/5**; final mobile overlay fix is live on `b6360bb`. The other 22 games remain categorized, not accepted.

The target remains 4.5/5 for every game. This release repairs the first four games; passing a build does not award that score. The full game-by-game requirements and remaining batches are in `game-quality-4.5-roadmap.md`.

## Implemented

| Game | Candidate changes | Remaining acceptance work |
|---|---|---|
| Curriculum Quest | Stable five-question queues in every band, frozen run difficulty, seeded choices/history, facts/Next, nine saved path badges, three difficulty bands, Time Teller link, illustrated module scenes and 48px controls. | 86e3 full baseline: six runs plus Geography replay, persistence/adaptation. 7d9 live delta: full five-question run, retry/facts/audio, finite finish, fresh restart, parent-world exit and unique sanitized UI log export passed. Independent editor: 4.5/5 accepted against the scoped evidence. |
| Letter Launch | Four taught-grapheme chapters, finite 6/6/7/8 rounds, seeded history, four saved chapter badges and packaged narration. | 86e3 baseline: seven full runs; 7d9 independent live telemetry/visual delta passed. b636 mobile SAT wrong/retry/right, unobstructed feedback/Next, normal/reduced motion and home challenge preservation passed. Independent editor: 4.5/5 accepted against the scoped evidence. |
| German Garage | Three different bays, seeded target rotation with shared persisted colour history, English support, German audio, explicit Next/Finish, eleven practice tabs. | 86e3 baseline: seven full runs, colour cycles, reload/unlocks, audio/layout. 7d9 independent live completion/wrong-clue/replay/hint/leave and unique sanitized UI log export passed; independent editor: 4.5/5 accepted against the scoped evidence. |
| Storybook Studio | Seven curated titles: three existing and four NEW, each ten narrated illustrated pages, three comprehension questions and word help. Resume, manual/auto controls, offline cache v13; custom backup/restore remains available. | 86e3 baseline: all seven completed (3 desktop +4 mobile), media/offline/resume and two-run seed proof. 7d9 independent Kai full read/quiz, wrong/clue/hints/leave/resume and sanitized UI export passed, with completion logged after final quiz. Independent editor: 4.5/5 against the scoped evidence. Historical custom books remain unrecovered. |

## Earlier release evidence (identity-scoped)

- 80 unit checks pass; ESLint, Vite production build and whitespace checks pass.
- Every fixed replay line in the new literacy/curriculum corpus resolves to a packaged MP3: 615 normalized voice keys, zero pending. Twelve new German recordings complete the German word library.
- Independent local Storybook UI review traversed all ten pages of all three books, completed each three-question comprehension path with wrong/right feedback, and exercised pause, replay, resume and cover restart.
- Independent local backup review imported a clearly labelled synthetic fixture through the actual UI, exported it, restored it in a fresh browser, checked duplicate handling and rejected a mixed invalid file without modifying the existing shelf. This is recovery-path evidence, not recovery of the family's missing stories.
- Local German Level 2 completed six rounds and unlocked Level 3; a Level 3 wrong/right direction check passed. Mobile layout measured 390px without horizontal overflow.
- Final independent local Curriculum review completed five questions with distinct facts and retry clues, reached the finite completion screen, and restarted into a new valid Round 1/5. Letter Launch completed all eight CVC targets; replay respected the eight completed-target history. Restored one-page and bundled ten-page cover labels were rechecked after repair. No release blocker was found in these tested local journeys.

## Logs and limits

Grown-ups → Game troubleshooting downloads the latest 300 device-local game diagnostics. Records include game/event identifiers, time, difficulty and numerical round/level/seed where supplied. They exclude names and authored story content. Storage failure does not interrupt gameplay.

These logs are bounded and browser-local. Story backups require the browser that still holds the custom books. They do not search another browser, computer or cleared database, and no missing historical books have been recovered in this batch.

An actual canonical production UI export after a wrong/right geography answer contains start, question, answer_attempt, answer_correct and leave events, with numeric seed/round and no child names or story text. The isolated QA evidence file is `output/playwright/batch1-production-diagnostics.json` (not committed).

An hourly thread monitor is active for canonical deployment identity and rotating real game controls. It remains quiet when healthy and unchanged; it reports actionable regressions. Monitoring does not substitute for the quality acceptance gate.

## Release identity

- Code SHA: `242a3f05e81fe1f9e9b2c5184659e1f232d9c4ee`.
- Deployment: `dpl_3bjcdDvpeyPDYmhEzdydQHvVKTTU`, READY.
- Immutable URL: https://dinospace-knvfb7xse-memas-projects-23a0001d.vercel.app.
- Canonical alias: https://dinospace-eight.vercel.app.
- Rendered JS/CSS checked independently: `index-7loj9iFU.js` / `index-rDO19aDV.css`.
- Independent Curriculum evidence: `batch1-curriculum-live-qa.md`; other first-batch evidence is being finalized.

### Letter follow-up release

- Code SHA: `665bcd2d7edf231c70d9f64a8cf9661a8533ed3d`.
- Deployment: `dpl_2EZ4WnumfgsGXC22WYWtVQq7Ak1X`, READY; canonical aliases confirmed via Vercel API.
- Immutable URL: https://dinospace-8agznuylm-memas-projects-23a0001d.vercel.app.
- Rendered JS checked independently: `index-BQjGggG1.js`.
- Published from a clean Git archive; unpublished story candidates and working-tree changes were excluded.
- Corrected both Letter Launch and shared session targets to six; a regression test checks their agreement. The decorative rocket is contained within its animation area and cannot intercept controls.
- Independent canonical mobile run completed six actual prompts, kept the final explanation until Finish, reported 6/6 and 3/3 stars, and recorded one seed with question rounds 0–5. No console errors or warnings.

Later local changes, new books and documentation commits are not part of this production code identity until explicitly released. Do not label this batch verified 4.5 until all roadmap checks pass.

The initial attempt for `094ab31` was blocked by Vercel because the workstation's automatic Git author email was not associated with a project member. The authenticated GitHub and Vercel accounts are MEMAtest; the established repository author email was verified against GitHub's author association on `52c9c0e`. Repository-local Git attribution was corrected, without rewriting the already-pushed commit. The replacement release commit records this correction and excludes local QA output from Git. Explicit deployment exclusions are being added separately.

### Storybook mobile follow-up release

- Code SHA: `3e97df50a9e035023821065dee4c3371cebaf96f`.
- Deployment: `dpl_CZVgq9aXeCXnKKjHHbBnHLN9b7Cj`, READY.
- Immutable URL: https://dinospace-bxg9hmbpm-memas-projects-23a0001d.vercel.app.
- Canonical alias verified independently; rendered JS/CSS `index-B_ynxaXR.js` / `index-d000j113.css` return 200.
- Storybook library, creator and reader controls meet the 48px mobile target; navigation explicitly returns to the learning world.
- All three shipped books completed mobile reading and three-question comprehension, including wrong-answer clues and correct explanations. No horizontal overflow or console errors.
- Detailed identity-scoped evidence is in `batch1-production-qa.md`, `batch1-curriculum-live-qa.md` and `batch1-german-repeat-qa.md`.
- The seven-title shelf and later local German/shared-control changes are not part of this deployment.


### German navigation production follow-up

- Code SHA: `c8a5155059ac0bdaf30cf75bf5416281e275fb5e`.
- Deployment: `dpl_RSfE9gs3q9CLeZWGgUo5Jotj2Dq1`, READY; canonical alias and JS `index-DnXwhuXc.js` / CSS `index-DLS0TiZ4.css` independently verified.
- All eleven German lesson tabs work at 390px and desktop with loaded artwork/audio and 48px targets. Bonus practice does not advance the core level; correct core answers do. The daily challenge arrow is 48px and was exercised through the actual UI.

### Final batch candidate — historical local evidence (superseded below)

- Immutable browser candidate: `http://127.0.0.1:5175`, JS `index-BGEGW0jB.js`, CSS `index-gL0RBHbW.css`.
- Seven curated titles: three existing plus four NEW books (Bo, Sami, Mina, Kai). This is an expansion, not recovery of missing custom stories. Each new book has ten illustrated/narrated pages, a narrated cover, three comprehension questions and three vocabulary explanations.
- All 88 new page/cover media files validate. All 147 fixed Storybook learning lines resolve to physical packaged audio, zero pending, with no provider calls during validation.
- 96 automated tests pass; full source ESLint and production build pass. Temporary built QA archives are excluded from lint, matching the existing build-output exclusions.
- Independent UI proof: all four Letter chapters completed, all four specific chapter badges saved through reload, and Askia retained separate rewards. Root Curriculum badges independently passed completion, replay idempotency, reload and player isolation.
- German independent QA completed three desktop and three mobile runs across all three bays. It found a colour repeated across paint/park scenes; these now share a persisted colour history. A new 30-seed alternating-scene/reload test passes. Final targeted browser verification is pending.
- Manual Storybook reading now starts at page one when automatic narration is off. The independent manual/automatic checks passed on the earlier local candidate. Final seven-title rendered/offline review is pending.
- Curriculum explanatory feedback has a larger durable Explorer fact panel; map and module-scene contrast were improved. Letter Launch now uses a relevant rocket card/icon and a packaged space scene. Root checked the Letter introduction and gameplay at 390px: readable controls, visible stage/skill counters and contained decorative rocket.
- Source service-worker cache generation is v13 for the release; the unchanged immutable QA snapshot still uses v12. Production offline acceptance must verify v13 after deployment.
- No first-batch game is claimed as 4.5 until the independent editor closes its remaining concrete acceptance gaps. The other 22 Amari games remain categorized, not accepted.


## Current live batch release — 1 October 2026

- Code SHA `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`, READY deployment `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`.
- Canonical https://dinospace-eight.vercel.app verified against Vercel metadata and real-browser JS `index-Bjt4H7n4.js` / CSS `index-BjKMFMwR.css`. Immutable URL https://dinospace-7la22nyoj-memas-projects-23a0001d.vercel.app.
- Seven curated books are live: three existing plus four NEW (Bo, Sami, Mina, Kai). All four new books/media are complete. No missing historical custom stories were recovered.
- 101 tests, full ESLint and production build passed before release. SW cache v13 was independently exercised on production with an offline reload, shelf, illustration and playing narration.
- Curriculum: six complete canonical runs, three desktop and three mobile; all modules and Starter/Growing/Challenge represented. Every run ended after five questions with facts/Next and a saved badge. Six of nine badges and 34 isolated test stars survived full reload. Actual UI diagnostics export has 52 sanitized events and six numeric run seeds. See `batch1-curriculum-final-production-qa.md`.
- Storybook: all seven titles read through ten pages and three comprehension questions, three desktop and four mobile complete journeys; wrong/clue/right/why, manual/automatic reading, filters, resume and offline narration checked. See `batch1-storybook-final-production-qa.md`; independent quiz-seed review is separate.
- German final seven-run evidence and independent editorial assessment are being consolidated in `batch1-german-final-production-qa.md`.
- Letter: canonical three desktop and four mobile runs passed progression, chapter badges, persistence, profile separation and diagnostics. Independent editor score is 4/5: distinct launch animation, SAT picture clarity and target/answer-position validation are being repaired in a new local candidate, not yet live.
- All 26 games have categorized improvement instructions in the roadmap. Remaining 22 have not been accepted. No blanket 4.5/all-games/glitch-free claim.


## Final follow-up production release — 7d9d961

- Source SHA: `7d9d96166f4bd4d2b283b761dcfbaae5dd3b0256`.
- Deployment: `dpl_7guvWUZ3ocswiVGXcLbVrewzaEq8`, READY; exact metadata and canonical aliases verified through Vercel API.
- Canonical: https://dinospace-eight.vercel.app. Immutable: https://dinospace-3jjvosthh-memas-projects-23a0001d.vercel.app.
- Fresh canonical HTML/browser: `index-C0jdAtV8.js` / `index-BH3dde_v.css`. Source published from a clean Git archive.
- 106 tests pass; full ESLint, production build and diff check pass. Existing large-chunk/Browserslist notices are build warnings, not runtime failures.
- Adds seeded generic per-question/scene, manual hint, replay, completion and leave diagnostics for the first four games. Storybook generic completion now follows the last quiz question; existing reading rewards are unchanged. Records exclude names, authored stories, prompts and choices.
- Letter has an 88px contained liftoff scene next to the prompt, a static reduced-motion success pose, clarified SAT caption, and deterministic answer-position/taught-grapheme validation.
- Full 86e3ecf gameplay evidence remains explicitly scoped to that baseline. Independent review approved focused changed-handler acceptance for this bounded follow-up rather than repeating unchanged six-run journeys. Current delta reports are appended to the per-game final-production QA documents; all four exports and the subsequent mobile overlay retest were reviewed; the independent scorecard now awards each first-batch game 4.5/5.


### Final mobile overlay repair — b6360bb

- Current canonical source: `b6360bbf82cb32643be8a880900f13553c7300af`. Deployment `dpl_9rxV9wXYUJrmUH22Z5BTFsCaAJ4s`, READY. Immutable URL https://dinospace-jbjgn2v4q-memas-projects-23a0001d.vercel.app.
- Exact source metadata/canonical aliases independently read through Vercel API; canonical browser reload rendered `index-BCMFohwQ.js` / `index-BH3dde_v.css`, at 390px with no horizontal overflow or broken picker images.
- The sole source delta from 7d9d961 adds Letter Launch to the existing games excluded from the floating daily-challenge tracker. This repairs the independently observed mobile feedback overlap. Daily challenge counting/home card handlers are unchanged. Full lint/build/diff checks passed for this bounded repair; the 106-test suite passed for the preceding telemetry/Letter release.
- The hourly health monitor `amari-production-game-health` remains ACTIVE and follows the canonical alias rather than a hard-coded deployment. It is quiet when healthy/unchanged.


Independent b636 Letter retest completed: SAT wrong → clue → correct, no floating overlay, readable feedback and 163×56px Next after ordinary vertical scroll, normal/reduced-motion layouts at 390px without horizontal overflow, home daily challenge preserved, console zero errors/warnings. Evidence: `batch1-letter-overlayfix-qa.md`. No daily subtraction progress was claimed from playing Letter.


## Batch 1 accepted

The independent editor reviewed the full baseline journeys, scoped production deltas, sanitized UI exports, source randomization checks, and final mobile overlay repair. Curriculum Quest, Letter Launch, German Garage and Storybook Studio are each **verified 4.5/5** under the documented roadmap. The detailed reasons and bounded evidence are in `batch1-editor-scorecard.md`.

The remaining 22 games are categorized with written improvement instructions; they have not earned this acceptance. Next four: Puzzle Pop, Spot the Difference, Sky Shapes and Monster Math. The overall 26-game objective remains unfinished.
