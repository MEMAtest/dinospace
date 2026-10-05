# Addition held-group contrast: source and build review

Date: 2026-10-05  
Source: `95d0160ef7a422a138551db82f11aa8d585b3a7d`  
Parent: `d6058d3cfa633ab654fa3ac7b0a0233ef163c301`  
Build: `dist-addition-held-group-contrast-20261005` (11,054 files; 359,715,947 bytes)  
Build listing SHA-256: `b467324399baf3f8f1070dc2cfc5e8b15f4472f6d21ac52eaf3870bc96ac91b4`

## Findings

The source diff is limited to one class expression in `src/components/games/AdditionAdventure.jsx`. It removes `opacity-30` from the held original-group card after a correct answer; the existing upward/right movement remains. No prompt, scoring, progress, queue, hint, narration, manifest, or other game source changed in this commit (`git diff --numstat` reports one insertion and one deletion for that file).

The frozen build identity in `independent-source-build.json` records SHA-256 and size for every file in the 11,054-file output. The configured local server at `http://127.0.0.1:5402` returned HTTP 200 for the index and all five index-linked assets. The index, main JavaScript, stylesheet, icons, and web manifest bytes each match their corresponding frozen build file exactly. Main JavaScript SHA-256 is `cb9e89592137fe555e2768dd350949bacc775dba9e3f552225b1c52a9dc36d68`; stylesheet SHA-256 is `1fc250ee9b2df6ef6f45c6e42b37f13e7ce78edfa266449ba0f7e320ee15d118`.

## Limits

This was a source/build/HTTP identity check only. I did not open a browser or inspect the held group visually. The change removes the source opacity utility that faded the held card; this report does not claim visual acceptance, gameplay acceptance, 4.5 acceptance, or release readiness.
