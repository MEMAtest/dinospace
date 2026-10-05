# B5 Sound Safari / literacy narration ledger

## Snapshot

This is a separate read-only ledger for source commit `a652ad6cf33b72e3ef3ff523b70cc773bfcbbb18`. It is not the existing 659-text `b5-literacy` selector and must not replace or amend that older ledger. The copied source inventory is pinned by SHA-256 `2a8b1965ced54771d58833d393cb2d5234bc3b9fbeb47111df02dac0c929077f`; it records 862 exact unique narration texts across 603 sequences and hashes 13 contributing runtime/source files.

`ledger.json` contains each exact phrase, `voiceClipKey` key, Matilda output path, UTF-8 text SHA-256, and snapshot status. Eleven entries had both a matching offline-manifest entry and a local file at the audited snapshot; their bytes are individually SHA-256 pinned. The other 851 entries had neither a manifest match nor a file. This is file-presence evidence only. It does not establish MP3 decoding, pronunciation, native playback, or human-listening quality. The audit found zero of 37 required pure-phoneme files and zero whole-word minimal-pair recordings configured in runtime, despite two of ten whole-word files being present.

## Finite plan (not activated)

The proposed selector name is `b5-sound-safari-literacy`, separate from `b5-literacy`. The maximum is 20 unique requests per run, 851 unique requests total, and 43 runs total; the full pending schedule is 42 runs of 20 and a final run of 11. It respects the shared 30-request rolling window per 10 minutes. Attempts must be recorded before request dispatch and count as consumed even when a request fails or has an ambiguous outcome. Automatic retries are prohibited; any retry needs a newly reviewed successor ledger and separate authorization.

The 11 snapshot files may be reused only when both the expected path and pinned audio SHA match. Any bytes created after the snapshot require a successful receipt bound to this exact ledger SHA, key, exact phrase, path, and audio SHA. Matching a path or manifest entry alone is insufficient.

The shared producer gate remains mandatory: acquire the existing lock `tmp/offline-voice-generator.lock` adjacent to the shared request journal; recheck the journal and 30-per-10-minute window for every run; and do not integrate or execute this selector until predecessor PID `18781` is stopped and its journal is reconciled to a terminal status. Root reported that PID still live with an active request-window wait and pending items during this audit. No provider request, worker start, manifest change, or package-file write was made here.

## Dry-run validation

The isolated `prepare-ledger.mjs` is not a provider runner. `--write-ledger` created only this ledger JSON after verifying a clean checkout at the pinned source commit, all 13 source hashes, exact inventory/key/path derivation, and candidate bytes. `--dry-run` repeats those checks, compares the canonical ledger byte-for-byte, and prints counts/caps; it has no write path. It fails closed if source, manifest, candidate status, or hashes change, so a later candidate requires a reviewed successor ledger.

Validation run against a temporary detached checkout at `a652ad6`:

```text
node prepare-ledger.mjs --dry-run --source-root /tmp/dinospace-b5-safari-a652-20261005
result: dry-run-valid
ledger SHA-256: 3a8b85354a1163b11405a8b3ad51a3faf536839c188539d58dc81e0399910773
862 unique texts; 11 snapshot files; 851 pending requests
per-run caps: 20 x 42, then 11; maximum 43 runs; maximum 851 unique requests
provider calls: 0; worker starts: 0
```

## Required integration work before any future run

The shared supervisor needs a new pinned selector and provenance validator for this ledger; do not route it through the old 659-text selector. The new branch must verify all 13 source hashes, the copied inventory SHA, exact 862 key/text/path tuples, exact 11-ready/851-pending snapshot, and the exact set of eligible pending keys. Add selector-specific enforcement for all three caps (20 per run, 851 total attempts, 43 runs), with a budget sidecar keyed to this ledger SHA and a pending-key allowlist derived from the selected entries. Ensure ready/reused-only invocations do not consume a run or request budget.

Before any dispatch, validate `--max-calls`, `--max-runs`, and a new `--max-total-calls` against these selector-specific limits; do not rely on the generic 20/100 CLI limits. Preserve the existing lock and terminal-predecessor PID gate, refresh the shared request journal immediately before the run, and retain the existing no-retry, receipt, and byte-verification behavior. In particular, the selected item representation must retain or explicitly project candidate hashes and pending status; avoid deriving the allowed set from a field discarded by selection. Validate cumulative attempt arrays using `.length`, not `.size`, and reject keys outside the pinned pending set before a provider request.

No runner code was edited and this artifact does not authorize execution. Future packaged-audio, native-playback, and human-listening acceptance remain separate gates.
