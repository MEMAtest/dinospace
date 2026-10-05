# B5 Sound Safari selector successor (`c636516`)

This is a separate successor to the historical `a652ad6` snapshot in the parent directory. The old `b5-literacy` selector and its 659-entry ledger remain unchanged. The successor pins source commit `c636516afa9ffa1b77dcc3bd5b7353ee80bce567`, the refreshed 862-text source inventory, and all 13 contributing source-file hashes. Its 862 `(key, text, path)` tuples are byte-for-byte equivalent to the predecessor ledger; only the source/art provenance snapshot changed.

The new selector `b5-sound-safari-literacy` is implemented in the reviewed narration runner, separately from `b5-literacy`. Read-only dry-run reports 862 selected entries, 11 snapshot-ready/reusable files, and an exact allowlist of 851 pending entries. Selector caps are 20 attempted requests per run, 851 distinct keys total, and 43 runs maximum. Every attempt is recorded before dispatch, duplicate or out-of-ledger keys are rejected, and there are no automatic retries. Existing candidate bytes without matching snapshot SHA or a valid receipt bound to this successor ledger are not reused.

The runner retains the shared producer lock, request journal, rolling-window accounting, and terminal-predecessor PID guard. The worker/PID 18781 gate remains open: this selector is **not activated**, and this change does not authorize paid execution. The focused tests exercise provenance, caps, pending-key allowlisting, duplicate refusal, and a receipt/snapshot reuse case with missing manifest entries; in that case no generation run is charged. No provider request or worker start was made.

Validation performed:

```text
node --test --test-name-pattern='B5 Sound Safari' scripts/reviewedNarrationJobs.test.mjs
3 passed, 0 failed

node scripts/run-reviewed-narration-job.mjs --job=b5-sound-safari-literacy --inventory-sha256=5d6630518ec00b2d4c92fd869ce79db38e611c604f24172092626b443ce206c0
read-only dry-run: 862 selected, 11 reusable, 851 pending and allowlisted, 0 unavailable snapshot-ready files
```

These are inventory and runner-safety checks. They do not establish audio decoding, native playback, pronunciation, or listening quality.
