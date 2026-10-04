# Supplemental narration selector QA — 2026-10-04

## Candidate and scope

- Frozen implementation: `bf3a76dabd2d95e17d37723215ac6a3ae1bf7c30` (`codex/narration-supplement-20261004`), based on shared-lock fix `afbbf01`.
- Supplemental ledger SHA-256: `0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd` (7 records).
- Existing B5–B7 ledger SHA-256: `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`.
- This review used only unit/failure fixtures and read-only CLI dry-runs. No paid/provider request, browser playback, worker, manifest, request-journal, inventory, or audio-file write was made.

## Findings

The new selectors resolve exactly five released Batch 2 lines (`b2-supplement`) and two local Batch 3 Dino fact lines (`b3-dino-facts`). The B2 source provenance is commit `94d44d031d5835d0d9fa2128064ff83ba5880a62`; the B3 source provenance is `e2aee30169f6ade67f7948b0088a895a9cb119c3`. I independently hashed all six referenced source files using `git show <commit>:<path>`; all six match the values pinned in the 7-record ledger. The two new selectors validate the exact ledger digest, expected source commit/file hashes, record counts, English/Matilda voice, exact-text `voiceClipKey`, canonical output path, missing-at-review status, and duplicate keys before returning work items. Dry-runs returned the expected seven keys, all pending and with no reusable packaged bytes.

The existing five B5–B7 selectors remain available and keep using their original inventory SHA. Independent read-only dry-runs returned the prior counts: B5 reasoning 310, B5 literacy 659, B6 378, B7 Solar 127, and B7 Memory 183. They select from the separate consolidated B5–B7 inventory; the new B2/B3 selectors select only from the supplemental ledger. Receipts are now keyed to inventory SHA: one shared B5–B7 receipt namespace (`aa07…`) and a separate supplemental namespace (`0b3…`). Receipt checks additionally bind key, path, exact text digest, voice/MIME/size/audio digest, and source commit for supplemental items.

The safety gates from the shared-lock predecessor remain intact: the fixed B4 source commit and PID are unchanged (`ac3b3ccaf03107749d865f8d79557e872a06c881`, PID `18781`); paid mode still requires an exact shared journal path and a terminal, reconciled B4 status tied to the current B4 manifest; the live PID is rejected; journal schema/snapshot checks, exclusive adjacent producer lock, fixed voice endpoint, explicit finite budgets, and no-retry behavior remain present. The test suite's live-PID, modified-inventory, concurrent-journal, and lock-conflict cases use temporary fixtures. I did not invoke an actual request. The separate runner-response audit-fixture review remains outside this report.

A disposable local receipt fixture also confirmed that an exact supplemental inventory/source receipt can reuse its exact bytes, while the same receipt is rejected under the B5–B7 inventory SHA and when its source commit is changed. The fixture directory was removed after the check.

## Verification

- `node --test scripts/reviewedNarrationJobs.test.mjs`: **14 passed, 0 failed**.
- Ran read-only CLI dry-runs for all seven selectors. The supplemental results were `b2-supplement`: 5 requested / 0 reusable / 5 pending (`5866151d`, `9685e0ac`, `a39b3546`, `a44acc87`, `e077fcc0`); `b3-dino-facts`: 2 requested / 0 reusable / 2 pending (`0f0204e5`, `f6991245`). Existing B5–B7 counts are recorded in [evidence.json](evidence.json).
- Candidate offline manifest SHA was unchanged across all seven dry-runs: `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7`.
- Shared B3 request journal SHA was unchanged: `48c0e501fb3afc791aa82ed1120ce0496cde8ba4f9a0d2d9a1263964261083a2`.
- B4 offline manifest SHA was unchanged: `acf5ca46e6278f9008be6846c1f615aefe7697d7aafe2ed4fb0eafc34b402a27`.
- B4 worker PID `18781` was live at the end of the check. No paid execution was attempted.
- Temporary receipt fixture: exact supplemental receipt accepted; cross-ledger inventory SHA and wrong source commit rejected; temporary files removed.

## Boundary

This is code-path and dry-run evidence, not audio generation, decode, playback, pronunciation, or human listening acceptance. The separate B5–B7 ledger and its pending plans were not changed. The earlier runner stored B5–B7 receipts at the unsuffixed `tmp/reviewed-narration-provenance.json`; this candidate reads/writes inventory-SHA-named receipt files instead. No old or new receipt file exists in this checkout, and no paid run occurred, so migration of a pre-existing unsuffixed receipt is unverified. If a release environment carries such a receipt, reconcile it before execution rather than assuming it is imported.
