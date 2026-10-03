# Batch 3 initial routing integration

Source changes in the isolated Batch 3 checkout route Amari counting and tracing to dedicated lazy components and keep Askia's existing components. Amari counting, tracing, Dino Detective and Tic-Tac-Toe bypass the old answer-count wrapper so their finite chapter flow and held explanations have one progression owner. Existing board games preserve their own flow; unchanged answer sessions keep the wrapper.

`test/batch3ProgressionOwnership.test.mjs` passes two checks: exact Askia counting targets remain 4/5/5 with maxima 3/5/7, and unaffected sessions retain their wrapper. This is pure integration-contract evidence, not rendered routing evidence. The new components are still being implemented, so full build and actual desktop/mobile routing checks remain pending. No change was deployed.

Root owns App, gameSessions and shelf integration. Builders own four game components/data. Direct Amari celebration callback divides reward units by 4; builders must pass newly credited stars × 4 and never award credit twice on replay. Their phase notifications must keep the shared leave guard accurate.

## Collection integration

The Amari sticker page now reads constellation pages, Letter Trace chapters, Cosmic tactic badges and Dino world discoveries from the same per-player game progress. Opening the page does not write or award anything. Reward IDs must also have their corresponding completed episode/world/tactic record; orphaned rewards remain unearned. Existing global stickers and earlier chapter collections remain in place.

Four focused integration tests pass: routing ownership and exact Askia bounds, existing wrapper ownership, read-only earned collections with sibling isolation, and orphaned/unavailable-storage behavior. A first fixture used the old Cosmic count field while its builder changed progress to distinct mission IDs; the fixture now uses valid mission IDs. No rendered shelf or complete build pass is claimed while the new components remain under development.

## Root review corrections before browser QA

Review of the initial builder source identified active Count phases bypassing the leave guard, Challenge tracing requesting uppercase despite a lowercase chapter, word choices always presenting the correct word first, and Cosmic chapter replay finishing after one board because it used lifetime completion count. Builders are correcting these before a frozen integrated candidate. Count layout/art and Dino illustrated cover/collection scope also require correction to meet the published visual contract. These findings are not accepted gameplay and are retained here to make the quality gate explicit.

Batch 2 functional repairs separately reached canonical production at `3cdfc426e91b46a855448690278ceb6590280b68`; final independent production controls and listening remain pending. No Batch 3 source has been deployed.

## Read-only narration packaging plan

The four authored narration inventories are now enumerable from pure data through `batch3Narration.js`. `check-batch3-voice-readiness.mjs` checks the existing packaged manifest and files without generation or API requests. The preliminary [coverage report](qa-evidence/batch3-narration-readiness-plan-20261003.json) intentionally exits nonzero while clips are absent. This is a file coverage plan; no premium runtime wiring, complete decode, audible-quality or release claim follows from it. Count uses a development browser voice pending proper packaged wiring; Dino currently labels its text clue honestly.

## Integrated source gate and build diagnosis

After the builders stopped, root ran the full repository suite: 197/197 passed, and ESLint passed. The first sequential build reproduced the missing `dist/assets` error. This was not merely parallel contention: the PWA close hook masked Rollup's original import diagnostic. Root now skips precache injection after a failed build, exposing the actual Count import mismatch. `recentCountQuestionIds` is exported by `countTheStarsProgress.js`, not `countTheStarsBatch3.js`; root moved the import. The repaired production-config build succeeded in a unique output directory. The earlier failure records remain; later independent retry/navigation corrections still need a refreshed frozen candidate and browser checks.
