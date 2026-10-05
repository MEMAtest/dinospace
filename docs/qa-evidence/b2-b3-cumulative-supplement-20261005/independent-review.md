# Independent source and package review: B2/B3 supplement

**Reviewed candidate:** `aa37a8a807349ca6953f397ef408ae067e6c63cc`  
**Exact canonical base:** `22d805b67ced8b36f45d0f5c547bfe67c5dded88`  
**Scope:** seven supplemental clips, manifest preservation, two Dino fact lines, and their presence in the configured build. No browser, provider, deployment, or listening work was performed.

## Findings

- The candidate is based on the named canonical commit. `git diff --name-status 22d805b..aa37a8a` shows exactly seven new MP3s, two QA evidence files, and edits to `src/data/offlineVoiceManifest.js` and `src/data/dinoDetectiveBatch3.js`. No other canonical source or public path changes.
- The manifest has 5,564 prior mappings and 5,571 candidate mappings. A parsed object comparison confirms exactly seven additions, zero removed mappings, and zero changed existing mappings.
- All seven added files match their saved package SHA-256 in both `public/audio/en` and `dist-supplement-20261005/audio/en`. Each key recomputes from its exact normalized English text. All seven package entries match the corresponding provider receipt on text hash, path, source commit, audio hash, and byte count.
- The five B2 receipts name source `94d44d031d5835d0d9fa2128064ff83ba5880a62`; the two revised Dino facts name `e2aee30169f6ade67f7948b0088a895a9cb119c3`. The Dino data file has no diff against the named `e2aee301` source, and both revised fact strings are present in the built JavaScript bundle.
- The B3 readiness snapshot reports 275/275 ready, and its decode report reports 275 valid, 0 missing, 0 invalid. Those B3 reports bind the two Dino additions. The five B2 additions are separately supported by the B2 audit and provider receipts; the B3 275-item decode snapshot does not include those five keys, so I do not use it as decode evidence for them.

| Key | Exact text | Owner/source | Audio SHA-256 |
| --- | --- | --- | --- |
| `a39b3546` | Build the Dino Park picture. Choose a piece, then tap its matching space. | B2 / `94d44d0` | `254457ed89777430e3229991151818defbc72250d8bfc0df3ea3edad631deecb` |
| `9685e0ac` | Next picture. Build Dino Park. Compare each piece with the preview. | B2 / `94d44d0` | `719d07e044ba711640be1fea66a3a1968219c1236ac511ecdd114357ac546cd6` |
| `e077fcc0` | Puzzle Pop. Picture Pioneers. Match big picture pieces and spot the main shapes. Build the Dino Park picture. | B2 / `94d44d0` | `7731f4aa1c8a070991b1c1e9cbaa88afd5031b7c0a1c52f53470b760ac991574` |
| `a44acc87` | Look near the middle area of Picture B. | B2 / `94d44d0` | `1d550c3b2f5e518dd6b2d64965d11e817a00028edf4f0462ed65c7253e60cf4a` |
| `5866151d` | Look near the middle bottom of Picture B. | B2 / `94d44d0` | `c5e8536fd3c067a27166ad0d189b359fffaf40f45c7dde1b978f7258b86956bc` |
| `f6991245` | A wetland is a place where the ground stays very wet. Some wetlands dry out for part of the year. | B3 / `e2aee30` | `0a3c032fb42d2491b305aaf89b2faf19c859f52681558eecb87632daeb99f67e` |
| `0f0204e5` | Water can slowly dissolve (wear away) limestone rock and help caves form. | B3 / `e2aee30` | `b40201a982d28314bcd8c327a85733c196d07478e43d0d1e3b3e135bc02fb73c` |

## Evidence limits

This establishes source, key, package, and build-file consistency for the supplement. It does not establish human listening quality, runtime playback/cancellation, production deployment, or 4.5 acceptance. The candidate's canonical deployment record identifies the unchanged base deployment (`dpl_5cKFB6U489CLoEPucaY9pDarcHsp` at commit `22d805b`); the supplemental candidate itself is local and must not be represented as promoted.
