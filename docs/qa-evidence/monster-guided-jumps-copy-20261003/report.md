# Monster Math guided-jump wording delta — independent QA

**Date:** 3 October 2026. **Result:** the copy-only correction is present in actual Story play at desktop and mobile. Scope was limited to singular remaining-jump and terminal status wording; this is not a new full-baseline run, a narration-listening result, or production acceptance.

## Candidate and safeguards

Frozen local candidate: `http://127.0.0.1:5209`, source `037914f48e5198ca97c03668baa1d0d2dbf40369`.

- Served JS `index-BSWKtpbm.js`, SHA-256 `31b725a9caf8f216466d79e57097606e8530b0928d372ae7862fabd86414e100` (verified directly from the running server before testing).
- Served CSS `index-D3NTSs-Z.css`, SHA-256 `008707f972ebe009fcbfcf5aa50207cc0c8a381f3f4e89fa1d22194374a681db`.
- Before reloading either retained isolated QA context, I installed page-level abort guards for `**/api/voice**` and `**/api/story**`. Sound was switched off using the visible control. I reused the naturally earned Story unlock after normal reload; no seed, answer, or progress injection was used.
- Browser console inventories reported zero messages, errors, or warnings. Cumulative request inventories show no API requests; a packaged local MP3 was fetched as a static asset despite sound being off. I did not claim playback or listening quality. Request and console captures are beside this report.

## Actual Story observations

| Viewport | Visible ordinary question | Copy observed after clue and number-line actions |
|---|---|---|
| Desktop 1280×800 | “Nia has 20 gems. Nia gives 16 gems away. How many are left?” | After 15 visible one-step actions, at 5: **“At 5. 1 jump to go.”** The next action reached 4: **“At 4. All jumps done.”** |
| Mobile 390×844 | “Ava has 12 flowers. Ava gives 8 flowers away. How many are left?” | After 7 visible one-step actions, at 5: **“At 5. 1 jump to go.”** The next action reached 4: **“At 4. All jumps done.”** |

Both screenshots show the number-line marker and live status together. The singular now uses “jump”; the completed state no longer reports jumps “left.” The newly tested labels address the exact ambiguity recorded on the previous candidate. The previous failure remains attached to its original identity: [`monster-guided-jumps-20261003/report.md`](../monster-guided-jumps-20261003/report.md) documents 19a4's “At 4. 11 jumps left.” wording. This check does not rewrite that history.

Evidence: [desktop singular](desktop-singular.png), [desktop terminal](desktop-terminal.png), [mobile singular](mobile-singular.png), [mobile terminal](mobile-terminal.png), plus viewport request and console captures.

## Current-candidate editorial view and gates

The earlier **4.3/5** mean belongs to the provisional 19a4 editorial synthesis; it should not be carried forward as a settled score for `037914f`. That calculation gave numeric caps to Feedback/Audio/Visual and Reliability/Navigation/Persistence from a mixture of an older production failure and missing final-release evidence. Neither is a demonstrated product defect in this copy-only candidate. To avoid inflating or misattributing the result, this report leaves those dimensions unscored and does not calculate a new mean.

| Dimension | Current 037914f view | Evidence and boundary |
|---|---:|---|
| Age-6 teaching | 4.5/5, provisional | The retained ordinary-UI baseline covers picture counting, operations, Story problems, clues, and held worked answers. The 5209 guided-practice delta demonstrated one-step number-line movement, reset, keyboard and pointer use, answer-hiding until practice starts, and preservation after a wrong answer. This copy delta now verifies singular and terminal wording at both widths. The ten-then-ones approach below is optional enrichment, not a 4.5 gate. |
| Progression | 4.5/5, provisional | Retained 24-run evidence completed all three episodes at both widths with unlocks/rewards, and the 9cc supplement verified mobile replay uniqueness and the required `18 + 2` Growing case. The current change only alters jump-status copy; it does not change progression. |
| Correctness and fair variation | 4.5/5, provisional | The completed baseline sampled visible models and answers; the 9cc supplement covers first-addend-over-10 addition; 5202 checked addition and subtraction explanation/model agreement; and 5205 checked neutral pre-answer picture counts with individually named objects for the sampled balloon/apple/orange cases. These results remain tied to their original identities and are inherited evidence, not retests of every path on 037914f. No correctness defect was observed in this copy delta. |
| Feedback, audio, and visual clarity | Unscored pending evidence | The current copy check observed no feedback defect. The duplicate explanation is a concrete **production `6b84554…`** failure and remains a release regression to retest on the final production identity; it is not attributed to 037914f. The 5203 runtime check covered browser media mechanics, but no human listening judgment or final-identity playback check is available here. Those are evidence gaps, not grounds for a numeric product-quality cap. |
| Reliability, navigation, and persistence | Unscored pending final identity | Current 037914f copy interaction advanced to the exact endpoint at both widths; the guarded reload retained the naturally earned Story unlock; request inventories show no API calls and consoles have no messages. Retained baseline/supplement evidence covers broader navigation and replay. Final production identity binding and the affected production regressions have not been verified, so this dimension is not assigned a score from absence of that proof. No reliability failure was observed in this delta. |

### Actionable next steps

1. **Optional teaching improvement:** prototype a guided “jump back ten, then the remaining ones” choice alongside single-unit steps. Check the spoken/announced intermediate positions, exact final value, keyboard and pointer operation, and that each path still leaves the answer hidden until practice begins. This is an enhancement opportunity, not a current failure or a release requirement.
2. **Local candidate proof:** on the intended final bundle, retain a narrow affected-delta check for the Growing `2 + 10` clue/correct-result path (one result model and one distinct explanation), the sampled picture AX labels, and Story Next after ordinary mobile scroll. The retained full baseline remains valid and need not be replayed just because this status copy changed.
3. **Human listening:** a reviewer should listen to actual packaged final-candidate speech for names, quantities, story prompts and explanations, and record pronunciation, pacing, clip joins, volume consistency and age suitability. Browser media events and local MP3 requests do not satisfy this step.
4. **Production acceptance:** first bind the intended canonical deployment to an exact source SHA and served asset hashes. Then retest the affected production deltas, including the `6b84554…` duplicate-explanation case, picture AX behavior and mobile Story Next, using ordinary visible UI and retained baseline evidence. Keep findings attached to their actual release identities.

This copy change closes the prior 19a4 “jumps left” ambiguity. The 19a4 wording failure remains documented at its original identity. Ten-then-ones remains optional. Human listening, final-production identity verification, and the targeted production feedback regression remain separate open gates; this report makes no audible-quality, production, or release-acceptance claim.
