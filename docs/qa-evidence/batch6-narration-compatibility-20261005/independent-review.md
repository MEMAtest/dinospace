# Independent B6 narration compatibility review

**Candidate:** narration source owner `764b2ff49b6c40c13df928b4449d0a1f68fbe660`; current B6 integration/runtime `2a82fd8fd17d9e76ec4310f2fecf489291f5bbff`; Astronaut chapter-map copy source `3dafee7b31302cb1a7ab41f731fa51a5e7fcd2e0` (current docs head `028d8e47296f0811e1c5e9dad81b090a37ef27d0`).  
**Pinned inventory:** SHA-256 `aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227`.  
**Scope:** exact phrase/key/path compatibility, spoken-runtime delta, and read-only reusable/pending counts. No provider calls, paid execution, journal or lock access, browser work, deployment, or listening.

## Exact source-to-ledger match

I parsed the pinned consolidated inventory and used the existing `selectJobItems(inventory, 'b6')` implementation. It selects 378 B6 items; each uses `/audio/en/<key>-matilda.mp3`. The current `BATCH6_SPOKEN_PHRASES` export has 378 entries and 378 unique keys. Comparing normalized exact phrase text by `voiceClipKey` against the selected ledger returned 378 matches, zero ledger-only phrases, zero runtime-only phrases, and zero path mismatches. The ordered runtime phrase list SHA-256 is `ee76e198c7c2c96adcefb1c8a253783f0156ef755d2cfbff5512df893ca1887a`, matching the Astronaut route-copy source identity.

The compatibility checks bind these source hashes:

| Source | SHA-256 | Comparison |
| --- | --- | --- |
| `src/data/batch6Narration.js` | `436791b76cb6f3e807b1d5ea5e985e5fb25268e7e32facbc6469a0ad4ac45124` | Byte-identical to B6 owner source `764b2ff` |
| `src/data/batch6Games.js` | `701bf8da8c7c2c40daf30a4c7280d14cb488098ce8a9b5702d835785b21939c0` | Byte-identical to B6 owner source `764b2ff` |
| `src/components/games/PatternParade.jsx` | `d71e248fe0c7d363e5561bc5323a36a38dafe0ac833480c02752f8d7d246ccb7` | Byte-identical to B6 owner source `764b2ff` |
| `src/components/games/Hangman.jsx` | `fe2663b20ad28743c7b5ee98b28c0379de20b4b550cde240a19723a3152b1253` | Byte-identical to B6 owner source `764b2ff` |
| `src/components/games/ChessExplorers.jsx` | `4822415890e14a9503c277f45f9896a645d2c5b392a34210ebdf1f4c74ea16ea` | Byte-identical to B6 owner source `764b2ff` |
| `src/data/offlineVoiceManifest.js` | `674ecdbbc4bc75d7aaba599a02f0b3246be2c80a638e2b4d811762c49f9637b7` | No change in the later chapter-map copy delta |

Between B6 owner source `764b2ff` and the Astronaut copy source `3dafee7`, the only changed B6 component is `src/components/games/AstronautAcademy.jsx`. Its delta changes only the three chapter descriptions and two displayed chapter titles. No spoken text, `speakBatch6` call, mission data, answer, or narration collector changed. Later `fed06bb` and `028d8e4` commits add evidence only.

## Read-only package status at 2026-10-05 03:57 UTC

The allowed no-paid command was run from the supervisor checkout:

```sh
node scripts/run-reviewed-narration-job.mjs --job=b6 --inventory-sha256=aa07d93daba2b85aab5767f630391d2fb6862d4ad91ae43ed261e05ddac70227
```

It returned `mode: dry-run`, `readOnly: true`, 378 requested, 1 packaged candidate reusable, and 377 pending. The dry-run exits before paid-run journal/predecessor checks, lock acquisition, or writes. It did not call the provider or access the shared request journal.

The sole reusable item is `8a4e7833` (“Which planet is called the Red Planet?”), path `/audio/en/8a4e7833-matilda.mp3`, SHA-256 `509f74c1cf2165d89549f1a7263539362977a2f16769eacecbeebd4d9de042fa`. Read-only scans of the 378 expected B6 paths in both the current integration tree and supervisor tree found that one existing, correctly mapped file; the other 377 expected paths are absent, with zero present-but-unmapped B6 paths. This is a time-bound filesystem observation; the B7 Solar paid job was live, so recount after it reaches terminal status before planning any run.

## Finite execution plan for a later authorized run

Do not overlap the currently active B7 Solar worker (PID 6806/session 66972). Wait for its terminal completion and lock release, then re-run the read-only B6 dry-run against the unchanged exact inventory SHA. Any changed reusable/pending counts supersede the snapshot above. The paid runner also requires the reconciled terminal B4 predecessor status and the shared request journal.

The existing supervisor applies a 10-request B6 selector run cap even though its general CLI permits up to 20 calls per run. It has no B6-specific cumulative attempt ledger. For the current 377-pending snapshot, a bounded plan is:

1. After the other worker is terminal, run one invocation with `--max-calls=10 --max-runs=36` (at most 360 requests). Reconcile the audit and perform a new read-only dry-run. Continue only if all 360 were accepted/reused without a stop reason and exactly 17 keys remain pending.
2. Only at that exact state, run a second invocation with `--max-calls=10 --max-runs=2` (the exact selector has 17 remaining keys, so at most 17 requests). Reconcile its audit and final dry-run.

If either invocation stops on an error, the audit does not match the expected request count, or the pending set is not the expected remainder, stop for manual reconciliation. The generic B6 runner does not persist attempted-key no-retry state across separate invocations; do not rerun failed keys automatically. These are future execution instructions, not authorization to execute now. The shared rolling rate limit remains enforced by the supervisor; do not bypass its cooldown or lock.

## Limits

This confirms ledger compatibility and path readiness only. It does not establish MP3 decode, native playback, pronunciation, human listening, a deployed build, or release acceptance. The full source-bound B6 ledger remains the authority; no ledger or receipt check was changed.
