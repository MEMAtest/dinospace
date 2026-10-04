# Independent QA: B4 grammar narration selector

**Reviewed candidate:** `8fecff6e4dc36bac8c6628c9c68818e2ba71c86e` in `work/dinospace-b4-grammar-narration`
**Added selector:** `b4-grammar`
**Result:** selector and isolated packaging behavior passed this bounded review. Paid packaging remains blocked while the real B4 worker is live; this is not audio or release acceptance.

## Pinned inventory and selector reconciliation

The selector’s ledger is `batch4-grammar-narration-jobs-20261004.json`, SHA-256 `9d0850e9fe357cf99b8edf2255b427c66a15c79a4163a47ea9191706624e3001`. It pins source `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`, base `ac3b3ccaf03107749d865f8d79557e872a06c881`, and `corpus-delta.json` SHA-256 `8049920284e5b9273552f4381043bfb0182acda3e2d699c0df1509d06d6c76f8`. The ledger has 47 additions, 47 removed forms, and 5,199 unchanged phrases. Its 47 entries pin exact text, English/Matilda, voice key, canonical path, source revision, and missing-at-review markers.

The candidate tests validate those corpus rows and source hashes, reject changed provenance/text and inventory digests, and check the exact B4 dry-run selection. Existing B5–B7 and B2/B3 supplemental selectors remain in the registry; the test suite still exercises their selector inventory and dry-run behavior. B4 is appended as a separate job. The exact shared B3 `offline-voice-generator.lock` path is used; the lock-collision fixture verifies refusal while the producer lock is held. Journal path/snapshot checks, cooldown/rate limits, finite budgets, and timeout coverage also passed.

## Independent checks

- `node --test scripts/reviewedNarrationJobs.test.mjs`: 16/16 passed.
- Scoped ESLint and `git diff --check` passed.
- Default `b4-grammar` dry-run: 47 requested, 0 reusable, 47 pending; read-only. The actual dry-run output is retained as `dry-run.json`.
- A temporary sibling-tree fixture copied the candidate runner/helper, voice-key helper, B4 inventory, and fixture manifests/journal. All network access was blocked by replacing the subprocess `fetch`; the replacement accepted only the exact reviewed voice URL and rejected any other URL. It made one synthetic request under `--max-calls=1 --max-runs=1`.
- The accepted fixture wrote one manifest mapping and an inventory/source/text-bound receipt (`sourceCommit=fe5aeff…`, exact inventory digest, key/path, voice, content type, byte count and digest). The 1,201-byte fake payload was not decoded or listened to. 46 jobs remained pending, as expected for the one-call cap.
- The rejected fixture returned an unverified provider header. The runner retained the one attempt in the fixture journal, recorded zero accepted responses, left the fixture manifest unchanged, wrote no receipt or audio, and released the producer lock. These are temporary fixture artifacts only.
- A separate live-PID preflight used the actual shared journal and manifests with a synthetic status record naming the QA process itself as the worker. It exited before acquiring the lock or writing journal, manifests, or audit. Before/after SHA-256 values match; the production lock was absent and left absent. Independently, `ps` showed the actual worker PID `18781` still running (`node scripts/run-batch4-voice-generation.mjs --max-runs=520 ...`). No attempt was made to stop or signal it.

The runner fixture transcript and source are retained in `runner-fixtures.json` and `runner-fixtures.mjs`; test output is in `tests.tap`.

## Existing UI evidence

From the retained 5383 profile earned through ordinary UI, I scrolled the visible Amari discovery shelf and captured [the Addition badge section](screenshots/5383-amari-addition-earned-scrolled.png). It shows `Addition 1 / 3 collected` and the earned `Put Groups Together` badge marked `Collected`. This was a shelf visibility check; no chapter replay was performed.

## Limits

No paid/provider request was made. No production or B4 manifest, shared journal, lock, worker, source, or audio asset was changed. Fake fixture bytes establish receipt and failure-path mechanics only. They do not establish valid audio, pronunciation, playback, listening quality, packaged completeness, or release readiness. The actual live B4 worker remains a hard execution precondition until its terminal status and final manifest are reconciled.
