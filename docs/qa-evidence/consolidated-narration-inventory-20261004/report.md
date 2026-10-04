# Consolidated narration inventory — 2026-10-04

## Scope and evidence

This is a read-only inventory for the current B5, B6 and B7 integration candidates plus the active B4 corpus. Phrase identity is the app's `en-US` voice key, which normalizes whitespace and case. The machine-readable file lists every key, owning batch, exact text variant, candidate manifest/file status, and (when present) local file SHA-256.

“Packaged” here means the candidate manifest points to the expected `/audio/en/<key>-matilda.mp3` path and that the local file is nonempty. These checks do not establish decoding, pronunciation, prosody, native playback or human listening acceptance. B4 cross-worktree bytes are availability evidence only; decoding/provenance review remains a later gate.

## Exact source lineage

| Corpus | Runtime/source SHA | Inventory source | Candidate manifest SHA |
| --- | --- | --- | --- |
| B4 active quality corpus | `ac3b3ccaf03107749d865f8d79557e872a06c881` | `scripts/check-batch4-voice-readiness.mjs` + `scripts/batch4NarrationInventory.mjs` | Active working-tree manifest SHA recorded in JSON; this worktree is changing |
| B5 integration | `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35` | `batch5ReasoningNarrationInventory.mjs`, `batch5LiteracyNarrationInventory.mjs`, read-only readiness checkers | `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7` |
| B6 integration | `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff` | `BATCH6_SPOKEN_PHRASES` in `src/data/batch6Narration.js` (same file SHA as source `764b2ff49b6c40c13df928b4449d0a1f68fbe660`) | `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7` |
| B7 integration | `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301` | Existing Memory/Solar readiness outputs for source `b6976948cf61147491e3658a5ce2e249a91bca09`; Memory and Solar runtime source files were hash-verified identical across the two commits | `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7` |

The three frozen integration candidates share the same checked-in voice manifest. Their current readiness was read from each candidate's own files. B4 has a separate active working-tree manifest and generated files; it was not copied or changed.

## Request and packaged counts

| Owner corpus | Unique keys | Candidate present | Candidate missing |
| --- | ---: | ---: | ---: |
| B4 arithmetic/time/number-line | 5,246 | 3,547 | 1,699 |
| B5 reasoning | 310 | 23 | 287 |
| B5 literacy narration | 659 | 11 | 648 |
| B6 four Amari games | 378 | 1 | 377 |
| B7 Memory Match | 183 | 2 | 181 |
| B7 Solar System | 127 | 111 | 16 |

B5 reasoning and literacy share ten voice keys with capitalization-only text variants (`boat/Boat`, `cat/Cat`, `coat/Coat`, `dog/Dog`, `duck/Duck`, `fish/Fish`, `fork/Fork`, `green/Green`, `red/Red`, `sock/Sock`). Deduplicating by the actual voice key yields 6,893 keys across all six owner corpora (6,903 ownership references), and 1,647 unique keys across the B5–B7 integrations (1,657 ownership references). The frozen B5–B7 candidates have 147 unique ready keys and 1,500 unique missing keys after deduplication.

## B4 changing snapshot and cross-worktree availability

At 15:46:12 UTC, B4's manifest SHA was `7b8b6998eba7317cf9368b9af446003750aa8c2615bfc575bcd1eb3480fb964b`; the SHA was the same immediately before and after the read-only readiness pass. The pass saw 8,789 English MP3 files, 3,547 of 5,246 requested phrases present and 1,699 pending. PID 18781 was still running the B4 corpus job at elapsed 20:24:43. A prior snapshot at 15:41:49 UTC had manifest SHA `c6f8ed57f2ded7fad709b4554a501bc46ba3ab76bfbeceb234dd78a9d755b8e3`, 8,760 MP3s, 3,518 present and 1,728 pending. That change confirms B4 is a moving snapshot; reconcile again after the worker exits.

The B4 active worktree contains exact-key bytes for 142 unique B5–B7 integration keys. All 142 are already present in their frozen integration candidates, and the file SHA-256 values match. Thus this read did not find additional B4-only packaged bytes that reduce the B5–B7 missing queue. The JSON preserves per-key hashes for traceability without claiming decoded or reviewed audio.

## Separate pure-phoneme gate

B5 literacy requires 37 distinct asset paths under `/audio/phonemes/en/`; all 37 are currently absent from the frozen B5 candidate. These map to 32 distinct sound targets after grapheme aliases are grouped: `c/k/ck` → /k/, `l/ll` → /l/, `s/ss` → /s/, and `f/ff` → /f/. This is a separate phoneme-asset gate, not part of the 659 spoken narration phrases. Preserve all 37 path validations even when a sound target is shared.

## Finite serial follow-up order

Do not start another job while PID 18781 is active. After it exits:

1. Re-snapshot B4 source, manifest, files and requested/present/missing counts; record the terminal job result. Decode-audit its generated/changed files before calling the B4 audio gate complete.
2. Reconcile the frozen B5–B7 packages against the final B4 snapshot by exact key, manifest path and byte hash. Keep candidate-local readiness separate from cross-worktree availability; decode-review each reused file before adoption.
3. Process the 16 missing B7 Solar phrases as one finite repair set. These are the small set affected by recent fact edits; do not reuse stale wording clips.
4. Process the 377 missing B6 phrases as one finite corpus covering Pattern Parade, Dino Hangman, Chess Explorers and Astronaut Academy.
5. Process the 287 missing B5 reasoning phrases, then the 648 missing B5 literacy narration phrases. Deduplicate the ten shared B5 keys once, with casing variants retained in the source ledger.
6. Handle the pure-phoneme set as a separate finite job: 32 sound targets, validate all 37 required paths and each sound against the authored grapheme policy.
7. Process the 181 missing B7 Memory phrases. Then rerun exact-source manifests, file checks, decode checks, native playback checks and human listening review as separate acceptance steps.

This order is a queue plan only. No generation, provider request, manifest edit, worker restart or audio-quality claim was made for this inventory.
