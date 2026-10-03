# Letter Trace full-scope request: partial 5219 evidence

Date: 2026-10-03
Frozen candidate: `http://127.0.0.1:5219`
Identity record: [`batch3-count-quota-identity-20261003.json`](../batch3-count-quota-identity-20261003.json)
Recorded source SHA: `653633f73cd97fcd297c592e1139c17ddb0b3855`

## Candidate and isolation

The 5219 identity reported `servedAssetMatch: true`; all six listed JS/CSS hashes were independently fetched from 5219 and matched the identity. The current checkout HEAD was `774611febd75a857d3978d81b7e4ad27d2131c01` during this run, so runtime identity is established by the frozen identity record plus matching served hashes, not by the current checkout SHA.

Two fresh Playwright contexts were used: desktop at 1280×800 and keyboard probe at 1280×800. Before their first app navigation, both contexts installed and confirmed `**/api/voice**` and `**/api/story**` route guards. Sound was turned off through the visible control. Request inventories showed only static assets, and both consoles had 0 errors and 0 warnings. No seed, answer, progress, local storage, or hidden guide data was read or injected.

## Completed checks

### Desktop pointer interactions

In one fresh desktop profile, Starter round 1 `S` and round 2 `A` were traced with actual pointer gestures through the visible guide, reached 100%, and were checked through the visible control. Round 3 `D` was then examined. Its accessible label reported “Stroke 1 of 2” and the UI prompt said “Start at green 1,” but the initial rendered guide showed a gray `2` marker at the actual top-left start and no visible green `1`. Starting at the apparent bottom-left endpoint was rejected at 0%. After the ordinary “Show this stroke” hint, starting at the visible top-left completed stroke 1; the UI then displayed green `2` at the shared point. A pointer path completed stroke 2 and showed the ordinary success explanation, but this hinted/previously mis-started attempt is not unhinted mastery evidence.

Evidence screenshots are in `screenshots/`: `desktop-starter-D-initial-misleading-start-marker.png`, `desktop-starter-D-stroke-hint.png`, and `desktop-starter-D-stroke1-complete.png`.

### Separate keyboard profile and Grown-ups export

A second fresh profile entered Starter `C` through visible controls, activated “Use keyboard,” and reached the canvas via Tab. `document.activeElement` was the canvas with role `img` and the visible C guide label. Space began the trace. Arrow keys moved the visible orange point through the guide; Space completed the visible stroke at 100%, and Check shape displayed the held success explanation.

The Trace map then reported `0 chapters earned · 0 letters independently mastered`; Grown-ups reported `0 Secure` and `1 Practising`. The ordinary “Download game log” action exported `keyboard-diagnostics.json`. It records a trace `learning_attempt` and `answer_correct` for that keyboard C (`hints: 0`, `firstAttempt: true`), with no explicit handwriting-mastery field or distinct keyboard event type. The map count is direct UI evidence that this one keyboard letter did not earn handwriting mastery; the generic exported events do not by themselves prove event-level keyboard exclusion. A full eight-round keyboard chapter and post-chapter export were not run.

The focused UI screenshots are `screenshots/keyboard-c-focused-guide.png` and `screenshots/keyboard-c-next-dot.png`. The exported JSON is preserved verbatim as `keyboard-diagnostics.json`.

## Scope still pending

This run is partial and does not satisfy the requested full 5219 rehearsal. Only desktop Starter rounds 1–3 were entered, with the first two unhinted pointer completions; keyboard tracing covered one C letter only. No mobile Trace chapter was run. Growing and Challenge were not run on either width. The full desktop/mobile chapter coverage, one same-band replay, Challenge randomized/frozen word-choice checks, comprehensive held-Next behavior, fresh badge/reload and sibling-profile isolation, mobile clipping/touch checks, and definitive full-chapter keyboard diagnostic comparison remain pending. Prior 5215 and targeted 5219/5215 records cited in the separate repair addendum retain their original candidate identities and do not fill these gaps.

The observed 5219 initial shared-start marker defect was independently addressed and verified in the separate 5223 delta report. That later candidate's evidence must not be attributed to 5219.

## Acceptance boundary

5219 full Trace QA remains **incomplete**. This report supports only the candidate identity, guarded local sessions, two unhinted desktop pointer round completions, the D marker observation, and one successful keyboard C stroke plus its UI/export evidence. It is not production evidence, full Trace acceptance, or an overall quality score.
