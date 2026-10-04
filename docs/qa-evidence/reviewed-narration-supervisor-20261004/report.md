# Reviewed narration supervisor — 2026-10-04

## Scope and inputs

This branch adds a finite command-line supervisor for the pinned B5–B7 narration ledger only. It does not generate audio during review. The pinned input is `docs/qa-evidence/consolidated-narration-inventory-20261004/inventory.json`, SHA-256 `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`. Selectors are `b5-reasoning`, `b5-literacy`, `b6`, `b7-solar`, and `b7-memory`; pure phoneme files and story/image work have no selector.

The ledger records integrated runtime lineage B5 `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`, B6 `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`, and B7 `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`. It records the currently changing B4 corpus as a separate predecessor snapshot. Execution requires a terminal, reconciled B4 status file naming the expected source commit, worker PID, manifest path, and exact current manifest hash.

## Safety behavior

- Dry-run is the default. It reads the pinned inventory and local manifest/files, prints pending keys, and does not write either manifest or request journal.
- Execution needs `--execute-paid`, explicit `--max-calls` and `--max-runs`, the exact inventory SHA, the shared B3 request journal, and a terminal predecessor status. Per-run calls are capped at 20; the shared rolling journal caps requests at 30 per 10 minutes; runs are capped at 100.
- It refuses while the B4 PID is live, uses a fixed voice endpoint and exact reviewed text, and has no arbitrary text, story, or image mode. Each request has a 90-second timeout covering fetch and response-body reading; there are no retries.
- A packaged candidate is reusable only when it maps to the canonical key path and its bytes match the pinned inventory hash. A new output is reusable only with a local receipt bound to the inventory, key, exact text hash, voice, path, MIME type, byte count, and audio hash. Unknown existing files are not overwritten.
- A shared request-journal snapshot hash is checked before each request. The runner takes exclusive local and shared-journal locks. Execution audit includes configured provider request budget, attempted/accepted counts, failures, manifest before/after hashes, changed keys, and output hashes, including request errors.

Candidate byte identity is not audio validation. It does not certify successful decode, playback, pronunciation, or human listening.

## Dry-run evidence

See [dry-runs.json](dry-runs.json). At capture time PID 18781 was live, so the paid path could not proceed. The five read-only plans were:

| Selector | Keys | Reusable package candidates | Pending |
| --- | ---: | ---: | ---: |
| B5 reasoning | 310 | 23 | 287 |
| B5 literacy | 659 | 11 | 648 |
| B6 | 378 | 1 | 377 |
| B7 Solar | 127 | 111 | 16 |
| B7 Memory | 183 | 2 | 181 |

The candidate manifest hash was `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7`; shared request-journal hash was `611d6c1234bc601232780b54325319a10f43bb448cec1537f9c865cb0c7ad255`; B4 manifest hash was `1dd3a86cce642a883c5478fc9e8a5d55f174e7a58d4e469351df8cc00121ce8b`.

## Verification

- `node --test scripts/reviewedNarrationJobs.test.mjs`: 11 passed.
- ESLint passed for all three new scripts.
- Tests cover exact inventory/job selection, finite limits, terminal predecessor and PID checks, journal schema and concurrent-change detection, mapped and unmapped byte-hash reuse, receipt binding, injected-fetch endpoint/body/timeout behavior, unchanged files in dry-run, and rejection of paid mode with a live process or missing explicit caps.
- Tests and dry-runs made no provider calls. Paid execution was not run. The terminal-worker path still needs review after B4 stops and is reconciled; the separate agent should review this supervisor before any later execution is authorized.
