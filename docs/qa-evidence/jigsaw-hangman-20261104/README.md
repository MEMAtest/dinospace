# Dino Jigsaw and Dino Hangman visual and gameplay uplift — 4 November 2026

Public site: https://dinospace.netlify.app. Source runtime `41c66bc07722d4015ff46214c8039cff585d2333`, module `/assets/arcade-yYH5eORi.js`, worker `amari-discovery-v62`. Netlify gateway deploy `6aebc51527fb9c4efd38e27f` points to immutable Vercel deployment `dpl_CSqDW2fT6dkYZH7Fa4Cg9n4sZi3J`. Production HTML, scripts, styles, worker and three new art files matched the build and pinned backend (production-core-v62.json).

Jigsaw uses four illustrated settings, including three new original landscapes, with six dinosaur targets and a new pterosaur. Newly unlocked scenes are encountered first; later rounds vary, with no duplicates within a level. Actual production controls passed all five levels at 390px (2, 4, 8, mixed 8/12, then 12 pieces), including a level-five emulated touch sample; level five also passed at 1440px. The corresponding source-bound reports are listed below. Art provenance and hashes are in art-provenance.json.

Hangman has larger five-, six- and seven-letter word pools and clearer meaning clues. A child can choose the optional clue-only challenge; standard mode retains recordings where available, and clue-only mode allows playback after the answer. New words without recordings use meaning clues and do not claim to have audio. On the exact public module, full four-level 93-check journeys passed at 390px and 1440px, including incorrect retries, held results and saved progression; clue-only and standard audio visibility passed separately on mobile. Native runs also passed both sizes. These are synthetic browser rehearsals, not physical-device or human listening certification.

A first live v61 run exposed a long clue pushing part of the 26-key keyboard below a 390x740 viewport. The retained production-v61-long-clue-geometry-failure.json records that failure. V62 removed a redundant hint beside the clue; the complete mobile run and clue-only challenge then passed with all keys visible. Earlier geometry and audio-test setup failures are retained for context.

A real Refresh games cutover from v61 to v62 preserved all 117 protected synthetic local-storage records and the synthetic storybook database (including its media); cutover-v62-before.json and cutover-v62-after.json contain hashed evidence. This does not establish recovery of the family's missing books. No paid voice or story requests were made. Build succeeded and 760 source tests passed; the worker budget retains its 40 MiB ceiling and includes the three new landscapes.

Jigsaw production reports for this exact release:
- `docs/qa-evidence/chess-jigsaw-20261029/production-amari-L5-1440x844-20261104T235512-164181000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L1-390x740-20261104T235350-773873000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L2-390x740-20261104T235357-572808000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L3-390x740-20261104T235405-909412000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L4-390x740-20261104T235418-106194000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L5-390x740-20261104T235432-393373000.json`
- `docs/qa-evidence/chess-jigsaw-20261029/production-askia-L5-390x740-20261104T235456-156788000.json`
