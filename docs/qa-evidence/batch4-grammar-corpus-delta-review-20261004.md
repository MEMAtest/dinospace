# Independent Batch 4 grammar-corpus delta review

Date: 4 October 2026  
Base source: `ac3b3ccaf03107749d865f8d79557e872a06c881`  
Repair source: `fe5aeff64dca2d1c9aad6dcecee9cede5bdcc128`

## Review method and result

I generated the finite inventory from the unmodified `ac3` checkout, then from a temporary read-only archive of `fe5`, using each revision’s own `scripts/batch4NarrationInventory.mjs`. I compared the sorted exact-text/key/path item sets against the repair worktree file `docs/qa-evidence/batch4-grammar-repair-20261004/corpus-delta.json`, SHA-256 `8049920284e5b9273552f4381043bfb0182acda3e2d699c0df1509d06d6c76f8`.

The independently generated inventories agree with the delta file exactly:

- Both revisions contain 5,246 unique exact phrases.
- 5,199 phrase texts retain the same key and path.
- Exactly 47 old text/key/path entries disappear and exactly 47 corrected entries are added.
- The removed and added arrays match the JSON item-for-item, including keys and `/audio/en/{key}-matilda.mp3` paths.
- Both inventories enumerate the same 18,096 arithmetic questions, 120 Time Teller questions and 88,940 Number Line questions.

The 47 changed phrase pairs group as expected: six `There are 1 {noun}.` → `There is 1 {noun}.` starts; one `1 remain.` → `1 remains.` result phrase; and 40 A/B landing explanations changing `1 spaces` to `1 space` across landing values 1–20. Example: `B moved 1 spaces and landed on 20.` (`5c515759`) is replaced by `B moved 1 space and landed on 20.` (`40d471c0`). No other exact phrase, key or path changed in the generated inventory.

The repair commit’s scoped source diff changes only the finite inventory producer, arithmetic question/narration agreement, Number Line explanation/narration agreement, and focused tests. The helper source changes match the three repairs. The delta JSON also records the changed source hashes and identical `voiceKey.js` hash.

## Acceptance boundary

This confirms source-copy and deterministic inventory agreement only. The 47 new paths are expected asset names, not proof that recordings were generated, packaged, decoded, played, or listened to. The ac3-bound [representative listening worksheet](batch4-representative-listening-worksheet-20261004.md) remains tied to its original source and preserves the three old-string failures. Any candidate using `fe5` needs a separately bound visible-copy check and fresh recording/readiness/native-playback/listening evidence for changed keys. No worker, manifest, audio file, provider job, or production asset was changed or tested here.
