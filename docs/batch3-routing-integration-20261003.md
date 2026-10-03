# Batch 3 initial routing integration

Source changes in the isolated Batch 3 checkout route Amari counting and tracing to dedicated lazy components and keep Askia's existing components. Amari counting, tracing, Dino Detective and Tic-Tac-Toe bypass the old answer-count wrapper so their finite chapter flow and held explanations have one progression owner. Existing board games preserve their own flow; unchanged answer sessions keep the wrapper.

`test/batch3ProgressionOwnership.test.mjs` passes two checks: exact Askia counting targets remain 4/5/5 with maxima 3/5/7, and unaffected sessions retain their wrapper. This is pure integration-contract evidence, not rendered routing evidence. The new components are still being implemented, so full build and actual desktop/mobile routing checks remain pending. No change was deployed.

Root owns App, gameSessions and shelf integration. Builders own four game components/data. Direct Amari celebration callback divides reward units by 4; builders must pass newly credited stars × 4 and never award credit twice on replay. Their phase notifications must keep the shared leave guard accurate.
