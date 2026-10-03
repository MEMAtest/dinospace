# 5219 current-letter announcement delta

Date: 2026-10-03  
Candidate: `http://127.0.0.1:5219`  
Source: `653633f73cd97fcd297c592e1139c17ddb0b3855`  
Identity record: [`batch3-count-quota-identity-20261003.json`](../batch3-count-quota-identity-20261003.json)  
Runtime app entry: `/assets/index-BhTsQrK7.js`, SHA-256 `d94c784b1e537b39799a0171324dcd4b188e592d35ef1df3d693682f2432e26f`  
App CSS: `/assets/index-CohPvEcn.css`, SHA-256 `aa083338878e3f69d88a4c06d125f13ffa209ca3e32629be90482227184b4a4d`  
Candidate identity record reports tests 199, lint/build passed, production-voice build flag true; it is a local browser candidate, not production acceptance.

## Setup and bounds

Used the isolated `b3count-5219-desktop` Playwright context at 1280×800. The `**/api/voice**` and `**/api/story**` routes were blocked before navigation and sound was disabled through the visible control. No API/provider requests were made; the console remained clean and observed requests were static assets. The context began with a fresh in-app profile and entered Trace through normal controls. No progress, answer, seed, or storage was injected.

This was a targeted accessibility-announcement check plus one ordinary Starter completion and the first four Growing rounds. It was not a full Growing or Challenge playthrough and does not replace the 5215 evidence. The linked identity record carries the candidate source SHA, served JS/CSS asset names and hashes, and reports served asset match.

## Observations

| UI point | Observed announcement/result | Outcome |
|---|---|---|
| New capital `A`, first stroke | `A letter guide. Trace A. Stroke 1 of 2.` while the visible guide showed two strokes | Pass: current letter's stroke count is correct immediately on round activation |
| `A` after tracing both visible strokes | `A letter guide. Trace A. All 2 strokes complete.`; prompt said all strokes were traced and offered Check shape | Pass |
| Check A, then Next to lowercase `d` | `d letter guide. Trace d. Stroke 1 of 1.` before tracing | Pass: count updates on transition to a new lowercase letter |
| `d` after its single pointer stroke | `d letter guide. Trace d. All 1 strokes complete.` | Pass |
| Next to capital `G` | `G letter guide. Trace G. Stroke 1 of 1.` | Pass |
| `G` after its single pointer stroke, then Next to lowercase `s` | `G letter guide. Trace G. All 1 strokes complete.`; `s` immediately announced `Stroke 1 of 1` | Pass for sampled capital/lowercase transitions |

Trace paths followed the visible guide using ordinary pointer input; Check/Next were visible controls. Starter proceeded through its ordinary eight letters and reached its completion screen (`1 chapters earned · 1 letters independently mastered`). The score indicates only one independently mastered letter in the visible map after the chapter; this narrow test did not investigate why the other traced letters did not increase that count. It also did not export diagnostics, so it makes no claim about the event-level classification of keyboard input.

Screenshots in this folder: `desktop/trace-5219-starter-complete.png`, `desktop/trace-5219-growing-A-initial.png`, `desktop/trace-5219-growing-A-complete.png`, `desktop/trace-5219-growing-G-initial.png`, and `desktop/trace-5219-growing-s-initial.png`. The separate 5215 candidate's initial `A` announcement mismatch remains recorded in `repair-candidate-addendum.md`; this 5219 pass is not retroactive evidence for 5215.

## Remaining scope

Full desktop Challenge and mobile Trace chapter playthroughs remain pending. Growing was sampled through four rounds only. The keyboard path worked when the canvas was focused on 5215, but definitive diagnostic/reward proof that keyboard tracing does not count as handwriting mastery remains pending. No full product acceptance, audio listening, production result, or 4.5 score is claimed.
