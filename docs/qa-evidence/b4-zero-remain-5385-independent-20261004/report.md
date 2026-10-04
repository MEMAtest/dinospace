# Batch 4 zero-remain tray: bounded independent UI check

Date: 4 October 2026  
Candidate: `http://127.0.0.1:5385/`  
Runtime source: `4a9ae1cd4cd1293aafae4c10877d5cb6cf8ae029` (base `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`)  
Identity: [`b4-zero-remain-5385-identity-20261004.json`](../b4-zero-remain-5385-identity-20261004.json)

## Procedure and candidate identity

I used a fresh named Playwright Chromium session. It began on `about:blank`; I installed the `/api/voice` and `/api/story` routes with HTTP 403 responses and confirmed both in `route-list` before the first app navigation. The routes remained listed after navigation. I independently fetched the candidate HTML, main JavaScript, and CSS; their HTTP 200 body SHA-256 hashes matched all three identity entries. The app showed sound on by default, which I switched off using the visible control. I selected Amari, Maths Missions, Subtraction Station and Chapter 1 through ordinary UI controls.

The browser viewport was 1280×800. The page had zero console errors or warnings; its request list contained ten static requests, all from 5385 and HTTP 200, with no voice/story request. No progress, question, seed, answer, storage, or child data was injected. No narration was played.

## Visible Chapter 1 sequence

I inspected all six ordinary questions in the first Take Away chapter. For the first five I solved the visible subtraction and selected the matching rendered answer; the UI then held feedback and required the visible Next question button. I left question six unanswered. The tray was empty before each answer and did not expose the remaining count.

| Chapter question | Visible prompt | Completed visible result |
|---|---|---|
| 1/6 | 6 cookies; take away 1 | Tray 5 cookies; “5 remain.” |
| 2/6 | 8 apples; take away 1 | Tray 7 apples; “7 remain.” |
| 3/6 | 2 apples; take away 1 | Tray 1 apple; “1 remains.” |
| 4/6 | 7 gems; take away 4 | Tray 3 gems; “3 remain.” |
| 5/6 | 4 cookies; take away 0 | Prompt’s removal group said “Take away: 0 (empty)”; held result tray 4 cookies; “4 remain.” |
| 6/6 | 7 cookies; take away 0 | Left unanswered; before-choice tray was empty. |

No zero-remain answer occurred among the five answered items; the sixth visible prompt also had a nonzero starting group and removed zero, so it did not provide a zero result to test. I stopped after reaching that final chapter question, without forcing a replay, changing question state, or searching another run. Consequently, the candidate’s new held `0 (empty)` text was **not observed** in this independent check. Its 390×844 zero-result state was also not tested.

## Bounded conclusion

The pre-answer UI did not display the remaining amount: snapshots label it “Empty remaining tray” until a correct response. On completed positive-result questions, the tray then showed the correct number and held feedback remained on the same question until Next. On the zero-removal prompt, “Take away: 0 (empty)” truthfully described that removed group; it did not disclose the remaining answer. This check does not validate the intended zero-result `0 (empty)` rendering because the ordinary queue produced no zero outcome.

The bounded independent scope is therefore **pre-answer tray/no-answer-leak and positive held-result behavior at desktop only**. Re-run a narrowly scoped ordinary UI check on a future naturally occurring zero-result question to assess the new empty-result presentation at both 1280×800 and 390×844 in the same profile. No audio readiness/listening, full mechanics matrix, or release acceptance is claimed.

## Evidence

- `screenshots/desktop-q1-before-answer.png` — 1280×800 first question: the result tray is empty before selection.
- `screenshots/desktop-q4-before-answer.png` — 1280×800 question 4 before selection.
- `snapshots/desktop-q1-before-answer.yml` through `snapshots/desktop-q6-before-answer.yml` — visible prompts, tray labels, options and held results for the observed queue; question 6 remains unanswered.
- The Playwright request log contained ten static 5385 assets with HTTP 200; console output contained zero errors and zero warnings.
