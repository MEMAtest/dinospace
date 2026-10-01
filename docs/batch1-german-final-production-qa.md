# German Garage final production candidate QA

Date: 2026-10-01

Candidate: canonical `https://dinospace-eight.vercel.app`, Ready deployment `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`, source SHA `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`. Served assets matched the deployment notice: `index-Bjt4H7n4.js` and `index-BjKMFMwR.css`.

## Desktop, 1280 × 720

Using the actual Amari UI, opened Explore & Languages → German Garage and completed three runs:

1. Level 1 first run, alternating paint and garage scenes: Weiß, Blau, Braun, Orange, Lila. A deliberate wrong answer on the initial Weiß prompt (red) retained the round and choices and showed gentle retry copy. Replayed the word, chose white, and the car changed to Weiß; choices stayed disabled until Next word. A second deliberate wrong on Lila (pink) also retained the prompt; correct purple advanced.
2. Level 1 replay: Schwarz, Gelb, Grün, Rosa, Rot. Together the two runs used all ten distinct colours before the first repeat. Result: 3/3 stars, 5/5 right first time, new sticker.
3. Level 2 Vehicle workshop: Flugzeug/aeroplane, Lenkrad/steering wheel, Fahrrad/bicycle, Tür/door, Rakete/rocket, Reifen/tyre. Finish showed 3/3 stars and 6/6 right first time.

All observed German narration requests returned HTTP 200 or 206 Partial Content for range playback. Scene and answer images loaded successfully. Console reported zero errors and zero warnings. Back to learning world worked.

## Mobile, 390 × 844

In a fresh browser profile, completed four runs:

1. Level 1 first run: Braun, Weiß, Grün, Blau, Lila.
2. Level 1 replay: Rosa, Schwarz, Gelb, Orange, Rot. Together the runs used all ten distinct colours before the first repeat. Both result screens showed 3/3 stars and 5/5 right first time.
3. Level 2 Vehicle workshop: Bus, Rad/wheel, Auto/car, Sitz/seat, Zug/train, Licht/light. Finish showed 3/3 stars and 6/6 right first time.
4. Level 3 Direction driver (unlocked after Level 2): Zurück/back, Geradeaus/straight ahead, Langsam/slowly, Links/left, Rechts/right, Halt/stop, Zurück/back after all six direction terms had been seen. Finish showed 3/3 stars and 7/7 right first time.

Reloaded after the two Level 1 runs, reselected Amari and entered German Garage again. The 12-play progress and Level 2 unlock persisted. After completing Level 2, Level 3 unlocked. A fresh Level 1 target repeated only after all ten colours had been used. All observed Level 2 and Level 3 narration requests returned HTTP 200; Level 1 audio returned HTTP 200 or 206 Partial Content. `document.documentElement.scrollWidth` and `document.body.scrollWidth` remained 390px at the Level 1 and Level 3 result screens. Console reported zero errors and zero warnings.

## Scope

This covers seven complete runs: three desktop (two Level 1 colour cycles and Level 2) and four mobile (two Level 1 colour cycles, Level 2, and the Level 3 run required to test directions). The extra mobile Level 2 run was required to unlock Level 3. It does not claim a desktop Level 3 run.

## Diagnostics export and seeded answer-position source proof

From the completed mobile Amari profile, I used the actual Grown-ups → Game troubleshooting → Download game log controls and saved the result to `output/playwright/batch1-german-final-production-log.json` to avoid the shared default download path. The export contains 61 German events across levels 0–2 and five distinct numeric run-start seeds. Its event fields are limited to timestamps, game/event identifiers, level/round, numeric seed, difficulty, and first-attempt outcome; there are no names, targets, answer strings, prompts, choices, or other authored child-facing text.

There are 24 question events and 23 correct-answer events. Every completed question has exactly one correct-answer event with the same numeric seed, level, and round. One additional level-0 question has a numeric seed but no answer event; it is immediately followed by a level-start event for level 1, so it is recorded as an abandoned replay question, not as a completed round. The five run-start seeds are unique. The export includes durable level completion and first-attempt outcome events for the completed rounds.

Separately, I exercised `buildSeededGermanRound` and `germanTranslation` read-only across all 11 bundled modes, 10,000 seeds per supported mode/option-count pair, and Starter (3), Growing (4), and Challenge (6) answer counts: 330,000 generated rounds. Each round was regenerated with the same inputs to check determinism; the target appeared exactly once in its options, all option names were unique, and its English translation was defined and unambiguous. There were zero failures. Correct-target positions were broadly balanced:

| Options | Position counts, from first to last |
| ---: | --- |
| 3 | 36,856 · 36,689 · 36,455 |
| 4 | 27,519 · 27,670 · 27,555 · 27,256 |
| 6 | 18,288 · 18,441 · 18,253 · 18,358 · 18,493 · 18,167 |

This source proof checks seeded round generation and translation uniqueness, while the UI evidence above checks event persistence and seed agreement for completed sampled rounds. It does not treat the interrupted question as completed or establish further gameplay beyond the seven runs documented above.

## 7d9d release telemetry delta

On 1 October 2026, I verified the canonical release at source SHA `7d9d96166f4bd4d2b283b761dcfbaae5dd3b0256`, deployment `dpl_7guvWUZ3ocswiVGXcLbVrewzaEq8`, with rendered assets `index-C0jdAtV8.js` and `index-BH3dde_v.css`. This delta check supplements the full gameplay runs above; it does not relabel the 86e3 runs as occurring on the new SHA.

In an isolated Amari browser profile, I completed the five-round Starter Colour Painter level using the visible choices, explanation/Next controls, and Finish Level. I replayed the German clue, made two wrong attempts followed by correct answers, and observed feedback and scene changes. I then used Replay Level, observed a new opening target, and left through Back to learning world → Back to world. The active replay question is intentionally incomplete.

Using the Grown-ups → Game troubleshooting → Download game log UI, I saved a unique second export to [`output/playwright/batch1-german-7d9-release-log.json`](../output/playwright/batch1-german-7d9-release-log.json). It contains 23 German events: `level_start` 1, `start` 2, `question` 6, `hint` 4, `answer_attempt` 2, `answer_correct` 5, `level_complete` 1, `replay` 1, and `leave` 1. The five completed question events each match exactly one answer on level, round, and per-question seed; the sixth question belongs to the abandoned replay and has no answer. The two run-start seeds differ; each question seed is distinct in this sample. The export contains only `at`, `game`, `event`, `level`, `round`, `seed`, `difficulty`, `firstAttempt`, and `hintType`; it contains no profile names, question prompts, answer choices, answers, or other authored child-facing content. `hintType` is `replay_clue`.

The generic `level_start` event has no seed, but it is immediately paired with the seeded `start` event. `level_complete` uses the seed and round of the final answered question. No concrete gameplay regression was found in this bounded release-delta check.
