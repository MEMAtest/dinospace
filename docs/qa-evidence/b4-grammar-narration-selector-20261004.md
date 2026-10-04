# B4 grammar narration selector — 4 October 2026

## Scope and pinned inputs

This source-only extension adds one reviewed selector, `b4-grammar`, to the narration supervisor. Its inventory is [batch4-grammar-narration-jobs-20261004.json](batch4-grammar-narration-jobs-20261004.json), SHA-256 `9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001`.

The ledger pins the corrected grammar source commit `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`, base `ac3b3ccaf03107749d865f8d79557e872a06c881`, and exact corpus comparison `corpus-delta.json` SHA-256 `8049920284e5b9273552f4381043bfb0182acda3e2d699c0df1509d06d6c76f8`. The comparison contains 47 additions, 47 removed forms, and 5,199 unchanged phrases. All five source files and hashes in the upstream comparison were rechecked against the B4 checkout while preparing this ledger.

Each of the 47 records contains its exact reviewed text, English Matilda voice, `voiceClipKey` value, canonical `/audio/en/<key>-matilda.mp3` path, source commit, and the upstream missing-at-review markers. The selector rejects changed totals, file-hash provenance, source identity, language/voice, text/key/path mismatches, duplicates, and non-missing-at-review records. It does not take arbitrary text or schedule the 47 removed forms for deletion.

## Verification

- `node --test scripts/reviewedNarrationJobs.test.mjs`: 16/16 passed. Added cases compare every ledger row with the source corpus-delta, check the five source files' bytes, reject changed provenance/text, and verify the exact dry-run set.
- Scoped ESLint and `git diff --check` passed.
- Default CLI dry-run: 47 requested, 0 locally reusable, 47 pending; ledger digest matches the pinned SHA.
- The test hashes the local voice manifest, shared B3 request journal, and B4 manifest before and after dry-run; all remain unchanged.
- Existing selector inventories and their dry-run assertions still pass.

## Execution status and limits

No provider request was made. No audio, manifest, request journal, or live worker was changed or restarted. The selector uses the same shared B3 producer lock, reconciled terminal B4 predecessor/PID check, bounded per-run and total-run budgets, request journal snapshots, exact candidate receipt validation, and finite request timeout as the reviewed supervisor. A paid run remains unavailable until the predecessor is terminal and reconciled and separate explicit authorization is provided. This is a selector/readiness change only; it does not certify audio bytes, decoding, pronunciation, or listening quality.
