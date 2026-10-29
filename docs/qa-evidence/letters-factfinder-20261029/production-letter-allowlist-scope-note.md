# Letter Launch production report scope note

This note supplements the original reports; it does not change their outcomes.

## Initial production run

`production-letters-390x740-arcade-BrQh-tMA-20261029T125356-349845000.json` is a **failed run** (`passed: false`) on runtime `62ff5c2bd78baccffc9d3e1c3cf7c4f6073651ab`, entry `/assets/arcade-BrQh-tMA.js`, at 390×740. The final storage-scope assertion rejected the two pre-existing legacy challenge keys `amari_challenge_done` and `amari_challenge_progress` as unexpected. The report contains 27 letter-round rows and four packaged-audio rows before the assertion, and records an empty provider/error list. Its requested fault plan was local on chapter 0, badge on chapter 1, and parent reward on chapter 2. Per-fault outcome rows were not serialized (`flowResult` is null), so this report alone does not substantiate separate local/badge/parent fault results. The report is not acceptance evidence for a passing full run.

## Clean replay

`production-letters-390x740-arcade-BrQh-tMA-20261029T125626-308300000.json` is the subsequent passing replay on the same runtime and entry. It records 27 letter-round rows, no requested fault injection, no provider or browser errors, and unchanged reward totals: 390 points, four Letter Launch plays, and the same reward-claim map before and after. This is zero-reward replay evidence, not a replacement for the failed initial report or proof of the unlogged fault details above.

The source-bound native reports `native-letters-390x740-arcade-BrQh-tMA-20261029T124559-771513000.json` and `native-letters-1440x844-arcade-BrQh-tMA-20261029T124607-928701000.json` bind both viewports to source head `62ff5c2bd78baccffc9d3e1c3cf7c4f6073651ab` and entry `/assets/arcade-BrQh-tMA.js`. No values or fault outcomes have been inferred or inserted into either original production report.
