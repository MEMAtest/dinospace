# Reviewed narration supervisor — 2026-10-04

## Scope and inputs

The original supervisor selectors use the pinned B5–B7 consolidated inventory. It does not generate audio during review. The pinned input is `docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json`, SHA-256 `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`. Original selectors are `b5-reasoning`, `b5-literacy`, `b6`, `b7-solar`, and `b7-memory`; pure phoneme files and story/image work have no selector. The later source-bound `b7-solar-teaching` selector uses its own reviewed full-corpus pin and preserves the original `b7-solar` selector unchanged.

The follow-up commit adds two separately pinned selectors for the seven phrases in `docs/qa-evidence/batch2-batch3-supplemental-narration-jobs-20261004.json`, SHA-256 `0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd`: `b2-supplement` (5 missing B2 released lines) and `b3-dino-facts` (2 revised Dino facts). This ledger is copied byte-for-byte from the reviewed source; it pins the B2 source files to commit `94d44d031d5835d0d9fa2128064ff83ba5880a62` and the revised B3 Dino files to `e2aee30169f6ade67f7948b0088a895a9cb119c3`, with file-level hashes. Every phrase's key is re-derived from its exact text and its en/Matilda/path values are checked. Supplemental receipts use their own inventory-SHA-named file and do not change the B5–B7 ledger or receipts.

A source-bound `b7-solar-teaching` selector now handles the later B7 copy source `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade` without changing the original `b7-solar` inventory (`aa07d93d…`, 127/111/16). Its separate full-corpus ledger is `docs/qa-evidence/b7-solar-teaching-narration-jobs-20261004.json`, SHA-256 `015a15c5ea22c77c6e1ba79952fd2efc4f1545324a8d3929472e68877a4cea89`. That candidate has 127 unique Solar phrases, 75 exact reusable manifest/file matches and 52 pending phrases: 44 keys for 22 revised facts plus 8 unchanged phrases that were already missing. The 44 superseded keys are removed from this new selector; 36 had old candidate bytes and 8 were missing. Source hashes pin the changed `src/data/index.js` and the candidate's unchanged manifest and key normalizer. See [B7 Solar teaching readiness](../b7-solar-teaching-readiness-20261004.md) and the source-bound [dry-run record](../b7-solar-teaching-dry-run-20261004.json).

The ledger records integrated runtime lineage B5 `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`, B6 `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`, and B7 `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`. It records the currently changing B4 corpus as a separate predecessor snapshot. Execution requires a terminal, reconciled B4 status file naming the expected source commit, worker PID, manifest path, and exact current manifest hash.

## Safety behavior

- Dry-run is the default. It reads the pinned inventory and local manifest/files, prints pending keys, and does not write either manifest or request journal.
- Execution needs `--execute-paid`, explicit `--max-calls` and `--max-runs`, the exact inventory SHA, the shared B3 request journal, and a terminal predecessor status. Per-run calls are capped at 20; the shared rolling journal caps requests at 30 per 10 minutes; runs are capped at 100.
- It refuses while the B4 PID is live, uses a fixed voice endpoint and exact reviewed text, and has no arbitrary text, story, or image mode. Each request has a 90-second timeout covering fetch and response-body reading; there are no retries.
- A packaged candidate is reusable only when it maps to the canonical key path and its bytes match the pinned inventory hash. A new output is reusable only with a local receipt bound to the inventory, key, exact text hash, voice, path, MIME type, byte count, and audio hash. Unknown existing files are not overwritten.
- The runner takes the **same exclusive `tmp/offline-voice-generator.lock`** as the existing B3 writer. The lock is adjacent to the shared request journal, so both writers serialize before reading or writing the request state. A shared request-journal snapshot hash is also checked before each request. Execution audit includes configured provider request budget, attempted/accepted counts, failures, manifest before/after hashes, changed keys, and output hashes, including request errors.

Candidate byte identity is not audio validation. It does not certify successful decode, playback, pronunciation, or human listening.

## Dry-run evidence

See [dry-runs.json](dry-runs.json) for the original five B5–B7 plans. Its B7 Solar row is the unchanged `c4db1d4` snapshot and remains historical. The separate `b7-solar-teaching` snapshot for source `21ee7b2` is [b7-solar-teaching-dry-run-20261004.json](../b7-solar-teaching-dry-run-20261004.json): 127 requested, 75 reusable, 52 pending. PID 18781 was live during that capture, so no paid path could proceed.

| Selector | Keys | Reusable package candidates | Pending |
| --- | ---: | ---: | ---: |
| B5 reasoning | 310 | 23 | 287 |
| B5 literacy | 659 | 11 | 648 |
| B6 | 378 | 1 | 377 |
| B7 Solar | 127 | 111 | 16 |
| B7 Memory | 183 | 2 | 181 |


## Supplemental queue

See [supplemental-dry-runs.json](supplemental-dry-runs.json). All seven entries were still pending at capture, with zero byte-hash candidates to reuse. This matches the reviewed ledger's `mapped: null` and `fileBytes: null` for each. The exact source phrases are:

| Selector | Key | Source batch | Reviewed phrase |
| --- | --- | ---: | --- |
| `b2-supplement` | `a39b3546` | 2 | Build the Dino Park picture. Choose a piece, then tap its matching space. |
| `b2-supplement` | `9685e0ac` | 2 | Next picture. Build Dino Park. Compare each piece with the preview. |
| `b2-supplement` | `e077fcc0` | 2 | Puzzle Pop. Picture Pioneers. Match big picture pieces and spot the main shapes. Build the Dino Park picture. |
| `b2-supplement` | `a44acc87` | 2 | Look near the middle area of Picture B. |
| `b2-supplement` | `5866151d` | 2 | Look near the middle bottom of Picture B. |
| `b3-dino-facts` | `f6991245` | 3 | A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year. |
| `b3-dino-facts` | `0f0204e5` | 3 | Water can slowly dissolve (wear away) limestone rock and help caves form. |

Read-only examples:

```sh
node scripts/run-reviewed-narration-job.mjs --job=b2-supplement --inventory-sha256=0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd
node scripts/run-reviewed-narration-job.mjs --job=b3-dino-facts --inventory-sha256=0b3e4fb645aec52d445ed04246b8c49958fdef60d92f9644b43e86060af6a2dd
```

The B5–B7 plans remained unchanged after adding these selectors. The candidate manifest, shared request journal, and B4 manifest had identical before/after hashes over all seven dry-runs. These later hashes supersede the earlier B5–B7-only snapshot above because the active B4 worker can update its manifest and shared request journal between capture times. PID 18781 remained live, so no paid work was attempted. The 37 pure phoneme paths/32 sounds remain a separate gate and are not included in the voice selectors.

When B4 is terminal and reconciled, the finite follow-on queue should process the seven earlier fixes first (`b2-supplement`, then `b3-dino-facts`) before opening the larger B5–B7 selectors. Each later run still requires its own authorized paid invocation and the same live-predecessor, shared-lock, journal, and budget checks. This report only prepares that sequence; it does not authorize or perform calls.

## Verification

- `node --test scripts/reviewedNarrationJobs.test.mjs`: 18 passed, including exact B7 Solar teaching source hashes, 127/75/52 readiness, 44 new and 8 retained missing keys, and dry-run no-write verification.
- ESLint passed for all three new scripts.
- Tests cover the original and source-specific inventory digests and selector counts, exact supplemental source hashes/text-derived keys/paths, finite limits, terminal predecessor and PID checks, the exact B3 producer lock conflict path, journal schema and concurrent-change detection, mapped and unmapped byte-hash reuse, receipt binding, injected-fetch endpoint/body/timeout behavior, unchanged files in dry-run, and rejection of paid mode with a live process or missing explicit caps.
- Tests and dry-runs made no provider calls. Paid execution was not run. The terminal-worker path still needs review after B4 stops and is reconciled; the separate agent should review this supervisor before any later execution is authorized.
