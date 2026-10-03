# Puzzle Pop and Spot the Difference packaged narration runtime QA

Date: 2026-10-03
Status: Original requested `/tmp` snapshot blocked before browser navigation; resolved for bounded QA by restoring a separate frozen workspace snapshot. See resolution and completed QA below.

## Requested snapshot

- URL: `http://127.0.0.1:5195`
- Expected JS: `index-ClpA5Rt-.js`, SHA-256 `a7732dbda18e3472b3b1cfddd0b044711f4cf62bbe392bdc384c00f006900e8c`
- Expected CSS: `index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`

## Observations

- `curl -I --max-time 5 http://127.0.0.1:5195/` returned `HTTP/1.1 404 Not Found`.
- PID 4097 is `vite preview --host 127.0.0.1 --port 5195 --strictPort --outDir /tmp/dinospace-batch2-audio-snapshot-20261003`.
- The configured output directory `/tmp/dinospace-batch2-audio-snapshot-20261003` is absent in this environment.
- The checkout `dist` directory has different JS/CSS asset names; it cannot be substituted for the requested frozen snapshot.
- No browser was navigated and no app interactions, API blocking, media instrumentation, screenshots, or UI diagnostic export occurred.

Runtime GO/HOLD: HOLD. This is an environment blocker only; it is not a product runtime result.

## Resolution and completed QA (2026-10-03)

The blocker above applies only to the originally requested `/tmp` snapshot identity. It was resolved by restoring a distinct frozen snapshot into the workspace at `tmp/batch2-audio-snapshot-20261003-0640`, served at port 5195, with JS `index-Dmr-JKNn.js` SHA-256 `b32ececc238e237cad75666c7006217f9650a678f2cf0fe07db316b46a459e25`. This is not the missing original identity. Runtime work continued against that restored snapshot and a separate repaired local candidate at port 5196 (`index-YAjCSdc_.js`, SHA-256 `f79f3b88a7bbb16a86c9a42c04deb3b4634ff139e492176c2d0b1df110f8b8c3`).

Completed bounded findings and the exact tested game/viewport matrix are in [report.md](report.md). The restored older snapshot had broad visible-control prompt/hint/fact/next/mute coverage, but its confirmed-Back test did not occur before natural clip end; separate independent confirmed-Back evidence reproduced the leak and is recorded in the preflight. The repaired candidate paused narration after confirmed desktop navigation for both games, and its 390px Spot leave-dialog Cancel retained the route and active audio. Runtime GO is local and bounded only. Production audio acceptance, audible intelligibility/prosody, candidate full interaction matrix, and deployed behavior remain unverified.
