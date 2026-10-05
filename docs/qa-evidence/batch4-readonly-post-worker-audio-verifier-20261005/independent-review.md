# Independent review: read-only audio snapshot verifier

Date: 2026-10-05

## Reviewed identity and scope

- Source commit: `b7ec83b5aa20a0e59e40b20d34ace924605f4111`
- Reviewed files: `scripts/verify-audio-snapshot.mjs`, `test/verify-audio-snapshot.test.mjs`, and the dated usage note in `docs/qa-evidence/batch4-readonly-post-worker-audio-verifier-20261005.md`.
- Review was limited to source, temporary-fixture tests, and scoped lint. No project corpus scan, provider call, browser, worker control, manifest write, or human listening was performed.

## Findings

The verifier binds each valid row's eight-character key to `voiceClipKey(text, 'en-US')`, rejects duplicate keys, and requires the exact `/audio/en/<key>-matilda.mp3` path. It resolves the explicit public directory and each file with `realpath`, rejecting symlink targets outside that directory. Per file it captures bytes and SHA-256 before `ffprobe` and a full `ffmpeg` audio-stream decode, then rereads and compares size and SHA-256. Errors are collected per row and flattened into the aggregate report instead of stopping at the first bad clip. Worker concurrency is capped at eight (default four), and each external probe/decode process has a bounded timeout.

The temporary fixtures passed for a valid generated MP3, truncated audio aggregated alongside a valid row, an escaping symlink, key/text/path mismatches, invalid SHA input, and concurrency-option bounds. The tests exercise temporary files and do not alter project audio or manifests.

## Provenance limit

`readinessJsonSha256` identifies the exact snapshot bytes, and `itemBindingSha256` identifies its ordered key/text/path/readiness rows. The report's `sourceCommit` is supplied by the caller. If the snapshot contains its own `sourceCommit`, equality is enforced; if it omits that field, as the ordinary B4 readiness output can, the verifier does not independently establish which checkout produced the snapshot. The documented `git rev-parse HEAD` check and separate source/corpus lineage evidence are therefore necessary. The decoder's hash output alone is not source provenance.

## Checks run

- `node --test test/verify-audio-snapshot.test.mjs`: 5/5 passed.
- `npx eslint scripts/verify-audio-snapshot.mjs test/verify-audio-snapshot.test.mjs`: passed.
- Source review confirmed exact path/key validation, symlink containment, complete decode invocation, before/after byte stability checks, bounded worker count, and per-item error aggregation.

No runtime changes are proposed by this review. Decode success remains distinct from audible playback, pronunciation, naturalness, or human listening acceptance.
