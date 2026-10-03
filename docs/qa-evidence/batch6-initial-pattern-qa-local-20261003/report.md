# Batch 6 initial candidate: Pattern Parade route failure

Date: 2026-10-03
Candidate: `http://127.0.0.1:5251`
Candidate source SHA: `e7ec3f550177f937cb7a5d021dae8447aaf18d3b`
Identity: [`batch6-initial-candidate-identity-20261003.json`](../batch6-initial-candidate-identity-20261003.json)
Scope: Narrow guarded UI observation of Pattern Parade only. QA stopped when the source owner identified the Amari route/component wiring issue. This is a preserved failure report, not acceptance.

## Setup and identity check

The independent Playwright CLI session used a fresh browser context. Before its first candidate navigation, route mocks for `**/api/voice**` and `**/api/story**` were installed with status 403 and verified in the CLI route list. The request list showed static local assets and packaged MP3s only; neither guarded route was requested. The landing page was opened and gameplay was entered through ordinary Amari/world/game controls. Sound remained off. No progress, storage, seed, answer key, or hidden game state was injected or read.

The CLI default viewport was 1280×720 for the gameplay observations. A later screenshot was captured at 1280×800; the current question remained in the same run. This limited report contains no mobile check.

At the time of this QA run, four of five direct HTTP asset fetches matched the identity. The fetch of assets/index-BO6NpCPQ.js returned HTTP 200 at 1,114,112 bytes with SHA-256 b7c664a40a167934ad9041b7d55adeb300243247e47815484fc841697e637267; identity expects 29f488630e0ed722a11625bdc2c5205a2a7c1ec5a15c098d05ca135340f55025. The local frozen artifact at tmp/batch6-initial-candidate-20261003/dist/assets/index-BO6NpCPQ.js matched the expected hash. After this report was drafted, root independently fetched the same HTTP asset and observed the expected 1,234,742 bytes and matching SHA. The cause and timing of the discrepancy are unresolved; this report preserves the observation without concluding the candidate server was mutated. A fresh exact-byte check remains part of follow-up testing on the next candidate.

## Observed Pattern Parade route behavior

After choosing Amari and entering Thinking & Play → Pattern Parade, the route was `/#/play/pattern`. Pattern Parade began with “Level 1 of 3: Simple repeats,” but its visible run said “5 to finish” and `0/5`. This did not meet the assigned six-question chapter acceptance. The page also displayed a legacy “Daily mission” widget, which was retained as a visible clue that the route was using an unexpected game shell.

The first prompt showed yellow, yellow, blue, yellow, yellow, question mark. Choosing red displayed “Try again!” without shaming or losing the question. Choosing blue showed “Super! Rule: Repeat yellow, yellow, blue.” The feedback had no visible Next control; a later snapshot showed a new moon question with no explicit advance action. In a separate replay, the visible prompt purple, purple, purple, green, question mark accepted green and explained “Repeat three purple, then green.” On the visible terms, that explanation does not justify another green as the next term; this is a correctness/rule explanation mismatch. In a later orange sequence, orange, orange, blue, orange, question mark accepted orange and displayed “Super! Rule: Repeat orange, orange, blue.” The success explanation was captured synchronously in a separate screenshot and again had no visible Next control. A later screenshot showed the next prompt without an explicit advance action. These observations contradict the held-until-Next contract and expose at least one ambiguous or inconsistent sequence/rule pair.

Root subsequently identified the cause as Amari chapter routing selecting legacy Askia game wrappers (`!littleMode` was inverted in the shared wrapper path). This is root-provided diagnosis, not independently established by this narrow browser check. Full Batch 6 QA was stopped at root's direction while that source fix and a new candidate are prepared. No conclusion is made about Dino Hangman, Chess Explorers, Astronaut Academy, mobile behavior, chapter rewards, saved facts, diagnostics, or sibling isolation.

## Evidence files

- `screenshots/pattern-0-of-5.png`: replay begins at 0/5.
- `screenshots/pattern-wrong-retry.png`: wrong choice produces “Try again!”.
- `screenshots/pattern-correct-feedback.png`: correct explanation appears without a visible Next control.
- `screenshots/pattern-next-question-without-next.png`: later question appears without an explicit advance action.
- `screenshots/pattern-1280x800-current.png`: viewport resized to 1280×800; same replayed run, current question.

The candidate console contained no errors or warnings during this session. No provider request was made. Candidate is local only; all four Batch 6 games remain unscored and unaccepted.
