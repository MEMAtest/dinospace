# Spelling Studio and Letter Launch — illustrated clue update, 5 November 2026

Live at https://dinospace.netlify.app: source runtime `72ce4a32ee6cf4ca69ffe3276161818b71870efd`, module `/assets/arcade-C5jqYKfV.js`, worker `amari-discovery-v64`, Netlify gateway deployment `6aebc8f913b0e3c95d59480e`, immutable backend deployment `dpl_4zinWiWiAVDXJzJknUw8zWEV5SjQ`.

Ten semantically matched picture clues reuse existing offline illustrations for apple, chip, dog, fish, frog, insect, moon, plant, rock and sun. They appear when those words occur in either game; existing authored spelling pictures remain and other words retain their existing emoji/text cues. This is a targeted picture improvement, not a claim that every word has new artwork. Existing selection, teaching, hints, audio and persistence mechanics remain in place. No paid voice or story calls were made.

The build and 760 source tests passed, as did changed-file lint. On the public exact module, all six Spelling stages (31 responses plus five replay responses) passed at 390x740 with a 0.5px geometry tolerance and at 1440x844 with the original strict checks. All four Letter Launch chapters passed at both viewports. Native full-stage runs passed on phone and desktop on v63; the subsequent v64 source change adjusted only the Spelling optional-practice spacing. Native v64 Spelling mobile also passed. Reports listed below contain full controls and error arrays. Testing used the isolated synthetic profile, not family data, and is not physical-device or human listening certification.

The original strict production Spelling reports for v63 and v64 are retained: the 44px optional-practice button was centre-hittable, but the browser reported its bottom at 740.1875px on a 740px viewport. The clean live 390px run permits only 0.5px subpixel tolerance; it retains all other checks. This tolerance does not certify an exact fully visible bottom edge. The original first Letter native report also remains failed because a normal midnight streak/date rollover was outside that old harness allowlist; a clean rerun passed. These are not silently reclassified.

An actual v63-to-v64 Refresh games cutover retained all 117 synthetic local-storage hashes and the synthetic storybook IndexedDB, including media. The prior v62-to-v63 cutover crossed UTC midnight: 115 records stayed byte-identical and only last-play date and the streak advancing from 1 to 2 changed; the storybook database remained identical. This is not recovery of the user's unlocated personal stories. `production-core.json` and `served-pictures.json` verify exact public bytes.

Full source-bound reports:
- `docs/qa-evidence/books-spelling-20261029/native-spelling-390x740-arcade-BGcijMgk.json`
- `docs/qa-evidence/books-spelling-20261029/native-spelling-1440x844-arcade-BGcijMgk.json`
- `docs/qa-evidence/books-spelling-20261029/native-spelling-390x740-arcade-C5jqYKfV.json`
- `docs/qa-evidence/books-spelling-20261029/production-spelling-1440x844-arcade-C5jqYKfV.json`
- `docs/qa-evidence/letters-factfinder-20261029/production-letters-1440x844-arcade-C5jqYKfV-20261105T001141-705175000.json`
- `docs/qa-evidence/letters-factfinder-20261029/production-letters-390x740-arcade-C5jqYKfV-20261105T001118-494463000.json`
- `docs/qa-evidence/literacy-pictures-20261105/production-spelling-390-subpixel.json`
