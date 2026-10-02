# Batch 2 narration inventory and offline-voice integration

## Finding

The four Batch 2 games call the shared narration hook with authored prompts, facts, hints, completion lines, and transitions. Exact missing clips can fall through to the optional dynamic voice endpoint. Root's API inspection confirms an HTTP 429 is this app's 45-requests-per-5-minute limiter response; provider failures map to 502. No API or provider calls were made during this work.

## Change

`src/data/batch2Narration.js` now owns the pure text builders used by Puzzle Pop, Spot the Difference, Sky Shapes, and Monster Math, as well as the finite list of authored narration lines. Components use the shared builders so clip keys and live text remain identical. This preserves the curated packaged narrator contract; the provisional browser-speech fallback was removed. Batch 2 inventory is intentionally separate from the already-packaged legacy pending gate until these clips are generated.

Monster Math supplies full authored text plus packaged segments through `speak(text, { segments })`. Full-line narration remains preferred when a matching clip exists; the runtime can use a segment sequence only when every segment clip is present. Story scaffolds are paired with intact quantity phrases (for example, `Mira has` + `2 shells.` and `Mira finds` + `3 more.`); no numbers are split into bare word or phoneme clips. Each segment sequence rejoins with a single space to the exact question prompt, clue, retry, or explanation passed to `speak`. Addition/subtraction explanations were rewritten as short, clear sentences with equivalent meaning, allowing reusable clips without reducing the question pool.

All fixed Batch 2 game lines use packaged-only lookup while assets are missing, so they fail closed without reaching `/api/voice`. The existing `scripts/generate-batch1-offline-voices.mjs` workflow now has a `--batch2-only` selector. It shares the established lock, request journal, 20-call-per-run maximum, cooldown handling, provider/MIME/size validation, and checkpointed manifest updates. `--dry-run` inventories this corpus without locking, writing, or calling the endpoint.

## Inventory

Command: `node scripts/generate-batch1-offline-voices.mjs --batch2-only --dry-run --max-calls=20`

Current result: 1,359 unique requested narration lines; 206 already have physical clips; 1,153 are pending. Per-game inventory:

| Game | Ready | Pending | Total |
| --- | ---: | ---: | ---: |
| Puzzle Pop | 16 | 57 | 73 |
| Spot the Difference | 0 | 55 | 55 |
| Sky Shapes | 0 | 39 | 39 |
| Monster Math | 190 | 1,002 | 1,192 |

Most reused Monster segments (usage across all question prompts, clues, retries, and explanations): `Try again.` (3,316); the two story clues (3,040 and 2,592); `How many are left?` (1,520); `Now there are` (1,296); each character's `… gives` scaffold (380); each character's `… has` scaffold (352); and the quantity phrase `1 more.` (192). The fixed count and operation clues remain complete sentences. Exact Sky accuracy stays visible in completion feedback; narration uses a mission-specific completion line. The Monster question pool remains fully varied. No assets were generated in this task.

The shared hook now prefers an exact complete-line clip, otherwise plays a segment sequence only if every segment has a verified bundled clip; missing or mismatched segments stop without dynamic requests or partial audio. Its focused segment tests are included in the passing repository test run. Once clips are generated, actual audio QA must check sentence prosody, joins and pauses, intelligibility, cancellation, and sound-toggle behavior on mobile as well as desktop; passing string-reassembly tests alone does not clear that gate.

## Verification

Release readiness command: `node scripts/generate-batch1-offline-voices.mjs --batch2-only --check-ready`. This uses the same read-only inventory and exits nonzero while any physical clip is missing; source/corpus tests passing alone do not close this gate.

- `npm test`: 150/150 passed, including exact text reassembly for every Monster prompt, clue, retry, and explanation, generator dry run, and packaged-sequence fail-closed tests.
- No browser speech fallback remains in Puzzle Pop.
- No API/provider requests or asset generation were made during preparation. The narration source is committed but remains unreleased.
- Production narration remains dependent on completing the 1,153 pending packaged clips. Until then, missing fixed Batch 2 lines intentionally stay silent; visible prompts and explanations remain available. This is an explicit audio release blocker, followed by prosody and mobile playback QA.

## Counting prompt correction

The one-object counting prompt previously disclosed the answer (“Can you see one star?”). Every count now asks “How many … can you see?”; singular grammar is retained in the post-answer explanation. A pool-wide check verifies all 120 counting prompts omit quantity words and digits. Removing the 12 redundant answer-revealing clips reduces the pending inventory to 1,153 without changing the 3,316-question pool. Focused maths/corpus tests: 14/14, ESLint passed. This correction is local source, not current production.
