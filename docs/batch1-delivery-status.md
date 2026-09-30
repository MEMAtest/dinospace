# Four-game quality batch 1

Date: 30 September 2026. Status: local reviewed candidate; live acceptance pending.

The target remains 4.5/5 for every game. This release repairs the first four games; passing a build does not award that score. The full game-by-game requirements and remaining batches are in `game-quality-4.5-roadmap.md`.

## Implemented

| Game | Candidate changes | Remaining acceptance work |
|---|---|---|
| Curriculum Quest | Stable finite five-question queues (four where the band contains four), fixed difficulty within a run, shuffled choices, recent-question history, explanatory facts held until Next, teaching labels hidden during assessment, three selectable difficulty bands, related Time Teller link, larger mobile controls. | Independent full-run/replay browser check and canonical production verification. |
| Letter Launch | Four different stages: letter sounds, initial sounds, upper/lowercase matching, CVC assembly. Uses taught graphemes, keeps an eight-target history, holds final explanation until Finish, and packages replay narration. | Stable eight-round CVC/replay history check and canonical production verification. |
| German Garage | Colour, vehicle/parts and directions bays with English meaning choices, deliberate Next/Finish, target rotation and all 72 local German word recordings. Existing extra practice remains available. | Canonical production verification across bays, including narration and rewards. |
| Storybook Studio | Resumable page progress; three-step comprehension and word help for each bundled book; custom-story JSON backup/restore with text, illustrations and narration; duplicate handling; atomic IndexedDB import; invalid backups rejected; correct cover page count. | Canonical production verification. Only three bundled books exist. Four new curated books are planned separately; prior custom stories are not claimed recovered. |

## Evidence so far

- 80 unit checks pass; ESLint, Vite production build and whitespace checks pass.
- Every fixed replay line in the new literacy/curriculum corpus resolves to a packaged MP3: 615 normalized voice keys, zero pending. Twelve new German recordings complete the German word library.
- Independent local Storybook UI review traversed all ten pages of all three books, completed each three-question comprehension path with wrong/right feedback, and exercised pause, replay, resume and cover restart.
- Independent local backup review imported a clearly labelled synthetic fixture through the actual UI, exported it, restored it in a fresh browser, checked duplicate handling and rejected a mixed invalid file without modifying the existing shelf. This is recovery-path evidence, not recovery of the family's missing stories.
- Local German Level 2 completed six rounds and unlocked Level 3; a Level 3 wrong/right direction check passed. Mobile layout measured 390px without horizontal overflow.
- Final independent local Curriculum review completed five questions with distinct facts and retry clues, reached the finite completion screen, and restarted into a new valid Round 1/5. Letter Launch completed all eight CVC targets; replay respected the eight completed-target history. Restored one-page and bundled ten-page cover labels were rechecked after repair. No release blocker was found in these tested local journeys.

## Logs and limits

Grown-ups → Game troubleshooting downloads the latest 300 device-local game diagnostics. Records include game/event identifiers, time, difficulty and numerical round/level/seed where supplied. They exclude names and authored story content. Storage failure does not interrupt gameplay.

These logs are bounded and browser-local. Story backups require the browser that still holds the custom books. They do not search another browser, computer or cleared database, and no missing historical books have been recovered in this batch.

## Release identity

Populate after deployment: commit, immutable deployment URL, canonical alias and independent live acceptance results. Do not label this batch verified 4.5 until all remaining roadmap checks pass.
