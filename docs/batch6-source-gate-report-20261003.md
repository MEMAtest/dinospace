# Batch 6 source gate report — 3 October 2026

This report records implementation and source-level verification for Pattern Parade, Dino Hangman, Chess Explorers, and Astronaut Academy in the isolated Batch 6 branch. It is not a 4.5 score, release acceptance, production claim, or authorization to deploy.

## Implemented source gates

- Pattern Parade has three named skill chapters and 54 validated, full-content-signature missions per chapter. Eight consecutive six-question queues can be formed without reusing a signature. Remixes map authored symbol tokens as whole tokens and use neutral labels/rule facts. The growing validator accepts only repeated-token growth or an explicitly alternating two-token sequence. Sound and movement modalities are explicit; each rule fact waits for Next.
- Dino Hangman has three distinct six-word-eligible chapter routes. Every authored word includes explicit grapheme segmentation, and eligibility reuses `isDecodableWith` with the selected taught-sound set. Missing segmentation fails closed; there is no split-letter fallback. A once-per-word picture or sound clue, visible rescue-supply count, retry after failure, stable fact, and explicit Next are present. A chapter is disabled when fewer than six currently taught-sound words are available.
- Chess Explorers has three chapters with five frozen puzzles per run. Each puzzle states one objective. Source validators check board bounds, legal piece movement, straight/diagonal path blockers, friendly occupancy, enemy capture, and defended-capture rejection. The UI describes the practice-board limits: no check, castling, or promotion.
- Astronaut Academy has science, engineering, and review chapters with six missions per run. Questions and options are seeded and frozen. Missed concepts are persisted for a later run and do not replace an active question. Completed runs save the discovery passport, badge, chapter completion, and best-star delta. Each authored fact links to an official NASA, JPL, or ESA source; the data validator rejects unapproved source domains.
- Each Amari game owns its chapter map/run/finish state and bypasses the generic `GameSession` wrapper. Askia continues to use the preserved legacy component. Progress is player/game-scoped. The save function validates game/chapter, bounded stars, canonical item IDs, and exact completed queue length (6/6/5/6); invalid data or unavailable storage returns `{ saved: false }`, distinct from zero new stars. Back during play opens Keep playing / Leave game; map/Next/replay/confirmed navigation cancels narration. The journey helper sends level/seed/round and correctness/assist flags without answer or prompt text; mastery receives one `learning_attempt`, while answer events carry `diagnosticOnly: true`.
- Batch 6 narration has a finite exact phrase inventory. Unknown phrases are rejected, and accepted phrases request `{ premium: false }` packaged playback. No provider, story, voice, or runtime content generation was added.
- Chapter maps use existing local Amari/Dino/Chess artwork, controls are at least 48px, and reduced-motion CSS is included.

## Verification performed

- `node --test test/batch6Games.test.mjs`: 6/6 passed, including eight non-repeating Pattern queues, strict taught-sound eligibility, chess legality/safety, NASA-source validation, packaged-only narration, and per-player completion/best-star storage.
- `node --test test/batch6Games.test.mjs`: 6/6 passed, including eight actual non-repeating Pattern queue starts, no-fallback Hangman eligibility, directional pawn attacks, board legality/safe captures, official-source validation, finite offline narration, and canonical completed-run storage.
- `npm test`: 185/185 passed. The parallel test harness also printed Vite dependency-scan shutdown and WebSocket port-in-use warnings; there were no failed or skipped tests.
- `npm run lint`: passed with no warnings.
- `npm run build`: production-mode Vite build passed. Existing warnings report stale `caniuse-lite` data and the >500 kB shared JS chunks; no build errors.
- Official-source fact review was performed on 3 October 2026. Representative primary-page checks:

| Official page consulted | Claim used in game content |
| --- | --- |
| [NASA: Sun facts](https://science.nasa.gov/sun/facts/) | The Sun is a star and provides Earth with light and heat. |
| [NASA: Moon facts](https://science.nasa.gov/moon/facts/) and [Moonlight](https://science.nasa.gov/moon/moonlight/) | The Moon orbits Earth and reflects sunlight rather than making its own light. |
| [NASA: Mars facts](https://science.nasa.gov/mars/facts/) and [Mars moons](https://science.nasa.gov/mars/moons/) | Mars has water ice and two small moons, Phobos and Deimos. |
| [NASA: What is a spacesuit?](https://www.nasa.gov/humans-in-space/what-is-a-spacesuit/) | Spacesuits supply oxygen and protect astronauts. |
| [NASA: Lucy spacecraft](https://science.nasa.gov/mission/lucy/spacecraft/) | Spacecraft solar panels provide electricity; spacecraft use antennas for radio communication. |
| [NASA: Perseverance rover components](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/) | Rover wheels, cameras, and sealed sample tubes serve the described travel, imaging, and sample-storage roles. |
| [NASA Ames: Mars 2020 contributions](https://www.nasa.gov/ames/ames-contributions-to-mars-2020-mission/) | Parachutes help slow a descending lander. |
| [NASA: Earth facts](https://science.nasa.gov/earth/facts/) | Earth is nearly spherical, rotates to create day/night, and is mostly covered by water. |

Every mission fact links to an official NASA, JPL, or ESA page. The source validator rejects unapproved domains and requires an option, answer, fact, and source for each mission.

## Separate gates still required

- Independent immutable candidate identity after commit.
- Audio corpus packaging, full clip decode/readiness, and native playback cancellation testing. Human listening is not completed by this source gate.
- Independent Playwright evidence at 1280×800 and 390×844 for every chapter, wrong answers, hints, held feedback, retry, completed-only rewards, persistence/reload, same-band replay, sibling isolation, and Back/Keep/Leave cancellation. No browser gameplay runs or storage/progress injection were performed in this source gate.
- Human editorial review, real device/offline checks, and canonical production alias/SHA/asset verification remain unperformed. No deployment occurred and no child data was written or mutated.

The 4.5 roadmap's evidence and reviewer gates remain open. This source report explicitly leaves all four Batch 6 games unscored and unaccepted.
