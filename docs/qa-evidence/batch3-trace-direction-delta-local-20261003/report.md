# Letter Trace keyboard diagnostics and direction-help delta

Date: 2026-10-03
Frozen candidate: `http://127.0.0.1:5237`
Source SHA: `16b545b6afef31a54c02d5a98e3e7db7e07b2677`
Identity: [`batch3-direction-identity-20261003.json`](../batch3-direction-identity-20261003.json)
Scope: Narrow keyboard-mode classification/export and rendered help/direction observation. Local only.

## Identity and setup

Identity records 204/204 tests, full ESLint, production-configuration build, and all six served asset hashes matching. A fresh ordinary profile was used. Voice and story routes were guarded before first app navigation, audio was off, and Grown-ups diagnostics were reached through the visible hold-to-open control. The exported diagnostic JSON is preserved verbatim as `amari-game-diagnostics.json`.

## Keyboard alternative and Grown-ups export

At desktop 1280×800, after activating “Use keyboard,” the canvas itself was focused through the UI. `document.activeElement` was a `CANVAS` with role `img` and accessible label `G letter guide. Trace G. Stroke 1 of 1.` The rendered instructions read: “Focus the guide. Press Space to start. Right or Down moves forward along the guide; Left or Up goes back. Press Space at the end to finish the stroke.” Space began the stroke; repeated forward Right key presses visibly moved the orange marker to the end; Space completed the stroke at 100%, and the visible Check shape action displayed the success explanation.

The normal Download game log export contains the corresponding trace `learning_attempt` and `answer_correct`. For the attempt, the preserved fields are `correct:true`, `firstAttempt:true`, `independent:false`, `masteryEligible:false`, `handwritingMastery:false`, `keyboardAlternative:true`, and `unassistedFirstTry:false`. The map had zero earned chapters and zero independently mastered letters; Grown-ups showed no Secure handwriting credit. This confirms the keyboard alternative was classified as assisted rather than handwriting mastery in the exported log.

## Visible rewind defect

At mobile 390×844, the same rendered instructions were present and the canvas remained within the viewport (document width 390px; canvas 332px wide). With the canvas focused, Space started the keyboard trace and twenty ArrowDown presses visibly advanced the orange guide cursor to the lower endpoint. Subsequent ArrowUp/ArrowLeft presses did not visibly rewind the orange cursor; Space consequently did not complete the stroke. Screenshots in `screenshots/` preserve the focused guide, forward state, and attempted return states.

The observed visible-cursor rewind failure is a defect in this candidate and should not be dismissed as a mobile-only issue: the source owner identified that the keyboard cursor rewinds while the drawing uses high-water stroke coverage, preventing the orange marker from moving back. No hidden state was inspected. This candidate's back-direction behavior fails the visible help contract. A later repaired candidate requires a focused forward/back/Space retest at both widths; this report does not stand in for that retest.

## Limits

The keyboard diagnostic/export evidence is from a successful desktop G completion. The mobile run is an intentional preserved failure and not a completed keyboard letter. No pointer mastery matrix or audible narration acceptance is claimed here. No provider calls were made. This report is local evidence only and makes no production or 4.5 acceptance claim.
