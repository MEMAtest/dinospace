# Independent B7 Solar audio package review

Date: 2026-10-05  
Reviewed runtime source: `532e540da87b7f6a4197c84de39bb127f296fdef`  
Candidate evidence commit: `37165dcfe4892e7d743ab91fbe532a6a79079087`  
Build: `dist-solar-audio-20261005`, tree SHA-256 `276cd270c6b940189e281dd37c9c29037407f05dc8a16a48cf602facf6ea1a22` (6,015 files)

## Result

The cumulative Solar package is byte-consistent with the pinned 127-item source ledger and its generation/decode evidence. The review found no key, text, path, manifest, receipt, or built-file mismatch.

- `package.json`, the root `complete127-readiness.json`, and `complete127-decode.json` bind to source commit `21ee7b240b271c5d775e4ebca3b5f29e0ad63ade`. Their ordered 127 `(key, text, path)` rows agree. The candidate package’s 127 `(key, path, SHA-256)` rows agree with the decode records.
- The root decode evidence records 127 requested, 127 valid, zero missing, and zero invalid. I independently hashed every corresponding file under the candidate build; all 127 hashes match the root decode’s before/after hashes.
- The 52 new manifest keys match the 52 entries in root `completed-provenance.json`: inventory SHA `da8d0fa36700cb7703678243640a82740ea05c5f17170b76c073f76ca51998d5`, exact source commit, key/path, UTF-8 text SHA-256, and audio SHA-256 all agree. Root `completed-audit.json` records 52 provider requests accepted/generated, 75 reused, six runs, and a total cap of 52. The other 75 package entries are the existing ledger files; the root readiness/decode checks bind those bytes too.
- The manifest grew from 5,564 to 5,616 entries. All 5,564 prior key-to-path mappings are unchanged; exactly 52 mappings were added. Relative to packaging base `aadc875b4b27f9b66571b491e558967986fb3a27`, the runtime diff is 52 added MP3 files plus the manifest update. The remaining two additions in that diff are package evidence documents. No other runtime paths changed, so the cumulative Count runtime and the previously integrated Memory/game code remain as at the base.
- Every one of the build identity’s 6,015 files matched its recorded byte length and SHA-256.

## Evidence and limits

The comparison used the candidate `package.json`, `build-identity.json`, and `root-source-decode.json`, plus root `b7-solar-teaching-generation-20261005/{complete127-readiness.json,complete127-decode.json,completed-provenance.json,completed-audit.json}`. The pinned source and byte lineage are verified; this does not establish native playback, pronunciation quality, human listening acceptance, or production behavior. Memory’s separate voice gate remains open. No browser or provider operation was performed.
