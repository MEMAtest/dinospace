# Independent Batch 7 cumulative source review

Date: 2026-10-05

## Reviewed identity and limits

- Canonical runtime base: `1accc99e89be303678ead99def6a3095ab1cb886`.
- Reviewed Batch 7 source: `9fe5c70aec9b21b7bd0ce2180a473835ab524880`.
- Frozen cumulative integration: `07132a6f68877f19ea38ed59ec2b49645ea4a8fb` on `codex/amari-batch7-cumulative-20261005`.
- This is a read-only source/build review. No browser, provider, deployment, or human-listening acceptance was performed.

## Independent checks

The frozen integration contains exactly the ten recorded B7 source/test paths and 84 files under `src/assets/memory-match`. I independently SHA-256 checked each of the 94 files in `source-provenance.json` against both the working-tree file and the blob at the reviewed source commit: 94 matched, 0 mismatched.

I compared the frozen integration with the canonical base across `src`, `public`, and `api`. The 92 changed paths there are exactly the 84 memory images and eight B7 runtime/data files; there are no other changed canonical paths. The two owned tests are outside those trees. `AmariCountTheStars.jsx`, `countTheStarsBatch3.js`, and `countTheStarsBatch3.test.mjs` are byte-identical to the canonical base. This matters because the historical reviewed source commit `9fe5c70` contains Count changes that are intentionally excluded from this cumulative integration; the frozen tree correctly restores canonical Count source.

The unchanged source surface count is consistent with the recorded provenance: 6,030 canonical `src`/`public`/`api` paths at base, less five pre-existing owned source paths, leaves 6,025 non-owned files. The recorded provenance has zero mismatches for those files.

I verified the frozen build output against `build-fingerprint.json`: all 5,963 listed files exist and match recorded byte length and SHA-256. `index.html` points to the recorded app entry chunk; its built bundle contains the memory illustration paths and the SolarSystem lazy chunk. The source imports the Memory card map into `MemoryMatch`, uses `PLANETS` in `SolarSystem`, and adds `Batch7BadgeCollections` through the Amari player session.

I independently ran the two B7 focused test files plus the unchanged Count tests: 25 passed, 0 failed. Targeted ESLint on the changed JS/JSX files passed. A CSS argument is ignored by ESLint's current configuration, so no lint claim is made for CSS beyond the builder's recorded lint result.

## Result

The cumulative freeze matches the reviewed B7 owned source and assets, preserves all non-owned canonical runtime files including Count, and its recorded built output is intact. This closes the source/build integration identity check only. It does not certify the retained game matrices against this exact build, audio readiness or listening, production deployment, or overall game-quality acceptance; those remain separate evidence gates.
