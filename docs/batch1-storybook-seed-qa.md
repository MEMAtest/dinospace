# Storybook seeded quiz and diagnostics QA

Date: 2026-10-01

## Local candidate

Candidate: local `http://127.0.0.1:5181`, Git SHA `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`, served JS `index-Bs1WbdJw.js`, CSS `index-BjKMFMwR.css`.

- Opened Bo and the Busy Bee Garden as Amari, advanced all ten story pages with Next, and completed the three-question quiz.
- On question 1, a wrong choice retained the same prompt and choice order and showed a gentle clue. Try again reset the choices. A correct answer locked all choices until Next clue. Question/clue/why narration controls worked; observed packaged audio requests returned HTTP 200.
- Finished the quiz. The shelf showed Completed; reopening the completed story showed its cover and Start Again action. This is expected replay behavior for completed books.
- Grown-ups → press-and-hold → Game troubleshooting → Download game log produced six Storybook records: `comprehension_started`, `comprehension_answer_wrong`, three `comprehension_question_complete`, and `comprehension_complete`. All six shared numeric seed `807500437`. Event keys were only `at`, `game`, `event`, `round`, `seed`, with `firstAttempt` on question-complete events; no title or story text fields.

## Canonical production candidate

Canonical `https://dinospace-eight.vercel.app`, Ready deployment `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`, source SHA `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`. Served assets matched: `index-Bjt4H7n4.js` and `index-BjKMFMwR.css`.

- Completed two full ten-page reads and three-question quizzes for Bo through visible page/quiz controls. The first run included a deliberate wrong choice, then retry and correct answer; the same question and choice order remained after retry. Correct answers locked choices until Next clue. Question and why replay controls worked; observed audio files returned HTTP 200.
- Each quiz began with “How did Bo stay safe while watching Bea?”; choice order differed between openings. The first and replay opening question happened to match, so question-order difference is not claimed.
- Tested resume on an incomplete story: after reading through page 2, reload returned to the player picker. Reselecting Amari, opening Storybook Studio and reopening Bo restored `Page 3 of 11` / Page 2. Completed-book replay still correctly opens at the cover with Start Again.
- Used the visible Grown-ups entry and held Press and hold, opened Game troubleshooting, then clicked Download game log. Captured this browser session's download to `.playwright-cli/storybook-seed-production-log-20261001.json` to avoid a shared default filename collision. It contained 11 Storybook records over two quiz runs:
  - Seed `2187296540`: start, wrong answer, three question-complete events, complete.
  - Seed `1557554118`: start, three question-complete events, complete.
- The two runs used different numeric seeds. Export fields were `at`, `game`, `event`, `round`, `seed`, and `firstAttempt`; no story title/text keys or child name were present.

## Scope

This accepts the seeded quiz/retry/logging path on the canonical candidate, including different seeds across replay, and confirms incomplete-book resume across app reload. It does not claim a different opening question on replay; that randomized result happened to repeat, while the choice order and numeric seed changed.

## Independent seeded-shuffle and answer-position review

As an independent reviewer, I ran `shuffledComprehension` read-only for all seven bundled story titles with seeds 1–10,000. Each title produced all six possible orders of its three questions. Across the resulting 70,000 runs / 210,000 answer positions, there were zero missing or duplicate correct choices; the correct option appeared at positions 1/2/3 a total of 69,489 / 69,832 / 70,679 times (approximately 33.09%, 33.25%, 33.66%). This supports seeded question-order variation, unique defensible answers, and broadly balanced correct-choice placement. It is source simulation rather than additional browser runs.
