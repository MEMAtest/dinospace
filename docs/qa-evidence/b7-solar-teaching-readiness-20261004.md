# B7 Solar teaching-copy narration ledger — 2026-10-04

## Source and scope

This readiness update is bound to the local, undeployed Batch 7 candidate source commit `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade`, based on integrated runtime `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`. It covers the Solar System narration only. The candidate also changes Memory Match mobile labels; those changes are outside this voice ledger.

The source-bound full Solar ledger is [`b7-solar-teaching-narration-jobs-20261004.json`](b7-solar-teaching-narration-jobs-20261004.json), SHA-256 `da8d0fa36700cb7703678243640a82740ea05c5f17170b76c073f76ca51998d5`. It records source file hashes for `src/data/index.js`, `src/data/offlineVoiceManifest.js` and `src/data/voiceKey.js`, the 22 changed fact IDs and every exact phrase/key/path for the 127-phrase runtime corpus. Its 44 revised voice keys are derived from the 22 revised facts: a standalone fact line and `Discovery N. {fact}` line for each fact.

## Candidate byte readiness

| Current Solar source | Unique phrases | Exact reusable manifest/file matches | Pending | Change from prior source |
| --- | ---: | ---: | ---: | --- |
| `c4db1d4` baseline | 127 | 111 | 16 | Previous full Solar inventory |
| `21ee7b2` teaching copy | 127 | 75 | 52 | 44 new-copy keys plus 8 unchanged missing keys |

Of the 44 superseded phrase keys, 36 had matching old candidate bytes and 8 were missing. Those keys are no longer requested by the new source. The 75 remaining byte matches stay reusable; they are not evidence of successful decode, native playback, pronunciation or human listening. The 44 new-copy keys are absent from the manifest and package at this snapshot. The eight retained pending phrases were already absent under the previous source.

The source-bound [dry-run record](b7-solar-teaching-dry-run-20261004.json) captured 127 requested / 75 reusable / 52 pending and a sorted pending-key digest of `ed7e5ab1e535d41faa97776a939cbbf839883c332f303bc4cde63c485d52a19a`. The candidate voice manifest, shared B3 request journal and B4 manifest had identical before/after hashes. PID 18781 was live. No voice or story request was sent and no audio was generated.

## Prepared selector and finite request cap

The supervisor exposes the new exact pin as `b7-solar-teaching`; the older `b7-solar` selector and consolidated inventory remain unchanged. Its default invocation is read-only:

```sh
node scripts/run-reviewed-narration-job.mjs --job=b7-solar-teaching --inventory-sha256=da8d0fa36700cb7703678243640a82740ea05c5f17170b76c073f76ca51998d5
```

The current pending set has a hard ceiling of 52 distinct phrase keys. If a future paid run is separately authorized after the B4 predecessor is terminal and reconciled, the ledger's conservative capped plan is six single-run invocations with `--max-runs=1` and `--max-calls` set to `10,10,10,10,10,2`. Those caps sum to 52; do not retry a failed call under the same budget. The shared journal permits 30 requests per rolling 10 minutes, so the plan must span at least two rolling windows. Before any future paid invocation, rerun this source-bound dry-run and reconcile exact byte reuse against the then-current B4 output and manifest. A changed pending set needs a new budget and ledger review.

The captured B4 worker was live. This ledger does not authorize or perform paid work, restart a worker, edit a voice manifest, or accept narration quality. Decode, native playback, and human listening remain separate gates.

## Edited facts

`earth-fact-5`, `earth-fact-6`, `jupiter-fact-2`, `jupiter-fact-6`, `mars-fact-4`, `mars-fact-5`, `mars-fact-6`, `mercury-fact-2`, `mercury-fact-4`, `mercury-fact-6`, `neptune-fact-3`, `neptune-fact-4`, `pluto-fact-2`, `pluto-fact-4`, `pluto-fact-6`, `saturn-fact-2`, `saturn-fact-3`, `saturn-fact-4`, `uranus-fact-1`, `uranus-fact-2`, `venus-fact-3`, and `venus-fact-4`.
