# Batch 5 cumulative UI delta: actual guarded route check

**Frozen runtime source:** `10e4cd53d7f0e987a8a1086fd834b5033de55387`
**Canonical base:** `1accc99e89be303678ead99def6a3095ab1cb886`
**Build fingerprint:** [`batch5-cumulative-build-fingerprint-20261005.json`](batch5-cumulative-build-fingerprint-20261005.json)
**Evidence screenshots:** [`screenshots/`](batch5-cumulative-ui-delta-20261005/screenshots/)

## Session and identity

The initial preflight report said no named QA browser session could be found and therefore left the route checks unobserved. Root then identified an already-running Playwright CLI `default` session with one `about:blank` tab. I reused that sole existing session; I did not create a browser, context, tab, window, or incognito profile. The earlier report's explanation is retained here as chronology, but the unobserved conclusion is superseded by this completed check.

I served the existing frozen `dist` without rebuilding it at `http://127.0.0.1:5399/`. The fingerprint records all 5,959 built files with zero mismatches, 192/192 owned source files, and 23/23 source evidence files. Before first app navigation I installed voice and story 403 route guards, requested `/api/voice/qa-guard-probe` and `/api/story/qa-guard-probe`, observed 403 for each, then reset the same page to `about:blank` before entering the app. The captured request log contains only those two 403 guard probes and listed application/static requests, all of which returned 200. Console: zero errors and zero warnings.

I selected the Amari age 6+ route normally and muted through the visible sound control. The control remained `Turn sound on` (muted) during checks. I left the existing profile and saved progress in place. The inspected viewport sizes were desktop 1200×855 and mobile 390×844.

## Route results

| Game | Desktop | 390px | Findings |
|---|---|---|---|
| Sound Safari | Opened ordinary chapter map | Opened ordinary chapter map | Chapter 1 showed 38 taught-sound questions available, but the status said “Whole-word listening recordings for this chapter are still being prepared.” Start was disabled. The message gives no useful next action. This is a visible missing-audio gate; no attempt was made to bypass it. Screenshots: [desktop](batch5-cumulative-ui-delta-20261005/screenshots/sound-safari-desktop-gated.png), [390px](batch5-cumulative-ui-delta-20261005/screenshots/sound-safari-390-gated.png). |
| Spelling Studio | Started First Sounds, selected visible `s`, `i`, `t`; received “Well done. You built the word.” and held `SIT has 3 sounds.` feedback | Opened First Sounds and its first ordinary question | Desktop showed picture/prompt, answer tiles, sound count and Next word. Mobile showed a normal picture, prompt and tile choices. No missing-recording notice was visible on the entry screen. Sound was muted, so no playback or audio quality is claimed. Screenshots: [desktop held answer](batch5-cumulative-ui-delta-20261005/screenshots/spelling-desktop-held-correct.png), [390px question](batch5-cumulative-ui-delta-20261005/screenshots/spelling-390-question.png). |
| Colour Mixing Lab | Started ordinary question, chose an incorrect swatch and received retry guidance, then chose the correct swatch and received held fact/Next | Reached an ordinary recipe, tried an incorrect swatch, then the correct one and received held result/Next | Prompts, named colour choices, recipe/parts and result were visible. Back opened the leave confirmation; Back to world returned to Creative Lab. At 390px the document remained 390px wide and visible buttons measured at least 48px. Screenshots: [desktop held result](batch5-cumulative-ui-delta-20261005/screenshots/colour-desktop-held-correct.png), [390px held result](batch5-cumulative-ui-delta-20261005/screenshots/colour-390-held-correct.png). |
| Odd One Out | Opened an ordinary puzzle, chose a visible item and saw the named-group explanation and Next puzzle | Opened an ordinary puzzle with a named group and four pictured choices | Desktop showed the exclusion rationale and the Next control. Back opened the leave confirmation; Back to world returned to Thinking and Play. At 390px the document remained 390px wide and buttons were at least 48px. Screenshots: [desktop feedback](batch5-cumulative-ui-delta-20261005/screenshots/odd-one-out-desktop-feedback.png), [390px question](batch5-cumulative-ui-delta-20261005/screenshots/odd-one-out-390-question.png). |

## Acceptance boundary

This is a guarded, source-bound routing/UI delta on the frozen cumulative build. It checks ordinary entry, representative gameplay controls, parent-world return, responsive overflow and console/static request health. It does not repeat retained full chapter matrices, establish every question/pool outcome, prove sibling-data isolation, or validate native narration playback. In particular, Sound Safari remains blocked at its visible recording-readiness gate, and neither muted UI checks nor a clean network/console log count as listening or audio acceptance. No 4.5 score or release acceptance is claimed.

## Follow-up

Replace the Sound Safari “still being prepared” status with a truthful, useful next step while preserving the disabled Start gate. Keep the current frozen build and this evidence unchanged; verify that copy in a separate candidate before any integration decision.
