# Independent audit: six exact Batch 2 audio reuses for B4 grammar

Date: 2026-10-05  
B4 audit checkout: `7defff33511aeb7465f1e964315ad12e579b7d67`  
B4 selector inventory: `docs/qa-evidence/batch4-grammar-narration-jobs-20261004.json`, SHA-256 `9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001` (47 exact items)  
Batch 2 decode evidence: `docs/qa-evidence/batch2-corpus-final-decode-20261003.json`, SHA-256 `1b6b3a1003ce029d524b7223bd3f84fd490f39c671597a5a3cf8cb6bc3219e90`  
Batch 2 packaging commit: `ead5a1d60d2ad5e2cacefc4cbcecb0aee7cec630`  
Current canonical source snapshot: `1accc99e89be303678ead99def6a3095ab1cb886`

## Finding

The six files that stopped the first corrected-grammar run are genuine exact-text Batch 2 assets. For every row below, the B2 full-decode record has the same key, English text, `/audio/en/<key>-matilda.mp3` path, SHA-256, `valid: true`, and positive decoded duration. The same audio bytes exist in the B2 packaging commit, the canonical source snapshot, and the current working files. The key also recomputes from the exact English text using the shared voice-key algorithm. Both the B2 and canonical manifests point each key to this same path.

| Key | Exact phrase | B2 decoded duration | Audio SHA-256 prefix |
|---|---|---:|---|
| `11d1317d` | There is 1 cookie. | 1.161 s | `2e4f1ec6e357…dc02c26fc` |
| `3352ee11` | There is 1 apple. | 1.254 s | `bd877d335962…8d2fa44c` |
| `47902350` | There is 1 gem. | 1.207 s | `71d7f41237e4…229668bcf` |
| `84bd0c17` | There is 1 shell. | 1.207 s | `42753b6bad77…d364bc11` |
| `b04f8552` | There is 1 flower. | 1.300 s | `4ce18bfca10d…414ede7f` |
| `d067b8a7` | There is 1 star. | 1.254 s | `e33d14a1ceaa…a6bbcf723` |

All six were `valid: true` in the 1,371-item B2 decode ledger. The detailed per-file rows, including full hashes and exact current/canonical/package checks, are in [`cross-batch-candidate-proof.json`](cross-batch-candidate-proof.json), SHA-256 `e66aaf13062d0becc56c251ee3077a301225a37aa632f5c24fa33af88dfc6013`. The B4 inventory remains the original 47-item pinned ledger. Its `mapped: null` fields describe the source inventory snapshot, while both the B2 packaging manifest and current canonical manifest already contain the six exact paths.

The original B4 run correctly stopped at `11d1317d`: it had no receipt in the B4 inventory namespace and the runner correctly refused to overwrite an existing file of unknown provenance. This read-only audit now establishes the separate B2 lineage needed to safely recognize those six files. It does not make B2 files into B4-generated clips.

## Narrow reuse-helper requirements

1. Keep the original 47-item B4 inventory and its SHA unchanged. Add a separate immutable cross-batch proof ledger, bound to the exact B2 decode-ledger SHA, B2 packaging commit, B4 inventory SHA, canonical baseline, and these six full tuples (language, voice, normalized text, key, path, decoded SHA, and byte length).
2. Before classifying a B4 item as reusable, require an exact match against both the pinned B4 item and the B2 decode row. Verify the shared key algorithm against the exact text; require the B2 decode record to be valid with positive duration; verify the current file bytes against the ledger hash and byte length. Reject any missing/mismatched tuple, missing file, changed bytes, or decode evidence. Do not generalize trust to other key prefixes or filenames.
3. Treat this as a separate reuse provenance type. Do not synthesize or copy a `reviewedNarrationSupervisorV1` B4 receipt for the six B2 assets. Keep the seven genuine B4 receipts/audio hashes from the first run unchanged. If the manifest already maps the key to this exact path, leave it untouched; if absent, add only after proof succeeds; if mapped elsewhere, fail closed.
4. Classify verified existing candidates before claiming a paid run or adding request-journal entries. A reuse-only case with a valid file and missing manifest mapping may repair that exact mapping with zero provider requests and must consume neither per-run nor cumulative paid-call/run budget. Mixed batches should charge budget only for actual provider attempts.
5. Preserve the existing unknown-overwrite refusal. If a candidate fails the separate cross-batch proof, stop before provider request or file/manifest overwrite. Add finite fixture cases for all-six acceptance, each tuple/hash/source mismatch rejection, missing file, stale/alternate manifest path, and reuse-only manifest repair with zero requests, zero journal delta, and no run-budget increment. Confirm the original seven B4 receipts and manifest mappings remain byte-identical through those tests.

This is a source-bound reuse finding and helper acceptance outline, not approval to execute another paid run. No provider call, browser, manifest write, or code edit was made. Full decode and matching bytes establish technical file identity/readiness only; they do not establish pronunciation, naturalness, playback quality, or human listening acceptance.


## Review of strict reuse helper at frozen `051b540`

I reviewed the implementation at `051b540f518c7c73bf9fb5563d0914e4ce314f7b` without editing it. The new helper pins the separate six-row cross-batch ledger SHA (`0d512625d875990a54991451cee2b292fef2ce13be54ab3fd7eefc6a890c20ad`), checks all 47 selected items/unique keys, and requires each cross-batch row's exact key, text, path, and corrected B4 source commit before adding its reviewed audio SHA as `expectedCandidateSha256`. The existing file-hash check and unknown-overwrite refusal remain in the normal packaged-candidate path. The B4 inventory remains at its exact original 47-item SHA, and the seven prior B4 provider receipts remain distinct and unchanged.

I ran the added helper tests (4/4 passed) and existing B4 selector tests (2/2 passed). The helper tests cover all six current bytes, wrong ledger digest, altered tuple fields, duplicates, and same-path wrong audio. No provider endpoint, browser, manifest, journal, or worker operation was used.

### One unclosed edge before paid resume

A valid cross-batch file with a missing manifest key is not yet a zero-run reuse. Preflight calls `isPackagedCandidate`, which requires a manifest mapping; the candidate therefore enters `pending`. In `scripts/run-reviewed-narration-job.mjs` at the reviewed commit, the paid loop increments `runs` and computes/waits for request capacity before its item loop calls `isCandidateReusable` and repairs the manifest entry. The file is reused without a provider request, but a reuse-only case still consumes one run and may wait/fail for journal capacity before reaching reuse. This does not affect the six current canonical keys, because those keys are already mapped to the exact path in the canonical manifest. It does fail the required missing-manifest reuse-only case.

Before treating the B4 runner as ready for another paid run, classify the pinned cross-batch candidates and repair only verified exact-path manifest entries before capacity waits and run accounting. Add an isolated CLI fixture in which the file/hash proof is valid, the key is absent from the manifest, and all remaining work is reusable: assert the manifest gets the exact path, `runs` stays zero, provider requests stay zero, the shared request journal is byte-identical, and the seven existing B4 receipts/audio remain unchanged. Keep wrong-byte, altered-ledger, or conflicting-manifest cases fail-closed before any request or overwrite.

The current-code review is therefore **not a paid-run approval** until that bounded no-call/missing-manifest fixture passes. The six exact lineage findings above remain valid. The B2 decode and byte hashes do not certify pronunciation or human listening.
