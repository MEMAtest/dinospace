# Independent QA — reviewed narration supervisor — 4 October 2026

## Candidate and scope

- Reviewed source: supervisor base `0d66b35ed8c80618fe05d1ac344372af81225750` plus shared producer-lock repair `afbbf01deb48b70b25797ec8fdbd698ed59ffa0c` (`codex/narration-supplement-20261004`).
- Reviewed pinned ledger SHA-256: `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`.
- Scope: read-only source and tests, focused tests/lint, and one ordinary dry-run. No paid/provider requests, no B4 worker or output changes, and no audio/listening claim.

## Finding from the first frozen revision and repair

The initial `0d66b35` revision acquired a packager-local lock and a new `.reviewed-narration.lock`; neither serialized against the existing B3 writer, which locks `dinospace-batch3-quality/tmp/offline-voice-generator.lock` while updating the same request journal. That left a race in which journal updates could be lost.

`afbbf01` closes this finding. The supervisor derives `offline-voice-generator.lock` from the shared journal directory and acquires that exact path with exclusive creation. The focused test reads the B3 writer's lock expression, compares the resolved paths, creates a held lock, and confirms a second acquisition refuses. The correction removes the two private locks in favor of the shared producer lock.

## Verification

- `node --test scripts/reviewedNarrationJobs.test.mjs`: **12 passed**.
- Scoped ESLint across the supervisor, helper and tests: **passed**.
- B7 Solar dry-run: 127 reviewed keys, 111 reusable candidates, 16 pending. It printed the pending key list and did not call a provider.
- The dry-run test checks that the candidate manifest, shared B3 request journal and active B4 manifest hashes are unchanged. The live-predecessor refusal test also confirms the candidate manifest and shared journal remain unchanged.
- At this review, PID 18781 was still running `run-batch4-voice-generation.mjs`; paid execution was therefore not attempted. No terminal/reconciled predecessor record or post-worker manifest is claimed.

## Remaining verification limit

The request helper's injected-fetch test verifies the fixed endpoint, exact text/language payload and timeout behavior. Source inspection confirms the runner rejects an unverified provider header, non-`audio/mpeg` MIME, undersized response, non-success statuses and rate-limit responses before accepting an output. The tests do **not** yet drive those runner acceptance/rejection branches with injected responses or assert that a request exception produces a failure audit. Add a local injected-fetch runner test for those cases before treating provider/MIME rejection and request-error audit as independently verified. This is a test-coverage gap; no defect was observed by making a provider request.

The report's candidate-byte reuse checks establish hashes and receipts only. They do not establish MP3 decode, playback, pronunciation or human listening. The actual paid path must remain closed until B4 is terminal, its final manifest is reconciled, and the exact predecessor record/hash is available.
