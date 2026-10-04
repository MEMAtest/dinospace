# Puzzle and Spot replay boundary repair

## Reproduced problem

Both queue guards previously prevented only an identical whole run, allowing an immediate repeated picture at the boundary. Source-level reproduction (no production browser seed injection):

- Puzzle prior seed1: Robin’s Tree → Moon Camp → River Valley → Dino Park. Next seed38 began Dino Park.
- Spot prior seed1: spot4 → spot3 → spot2 → spot1. Next seed38 began spot1.

This contradicts the shared acceptance requirement to avoid an immediate boundary repeat where the pool permits. Each chapter has four distinct scenes, so the repeat is avoidable.

## Changed source and invariants

`2952958fe41de443a8dfeabbbe0bb54d96e572ad` includes Puzzle repair0dd1077 and the equivalent Spot repair. Each game saves actual `lastCompletedSceneId` in its existing child-specific progress object. The new Start queue preserves seeded shuffling but rotates to avoid the last completed scene and an identical full order. Existing records without completion history fall back to the previous queue’s final scene. A partial chapter replay uses the actual last completion.

All authored pictures and Spot targets appear exactly once per run; active queues remain fixed. No art, crop, narration strings/files, target positions, unlock rules, scoring or provider calls change.

## Verification

- 23 focused Puzzle/Spot/narration tests pass. Across each game’s three chapters,9,000 prior/next seed combinations prove membership, changed replay order and no completed-picture boundary repeat, including same-seed replay. Spot also preserves all authored targets.
- Separate partial-completion/child-isolation tests pass.
- Full clean-archive suite: **213/213 pass**. Log: `tmp/puzzle-spot-replay-2952958-tests.log`.
- Full clean-archive lint passes.
- Configured archive production build passes5.79s with existing >500kB chunk warning. Public voice/story flags match the production configuration.
- Frozen `tmp/puzzle-spot-replay-2952958/dist` serves on explicit IPv4 `http://127.0.0.1:5303`; [all seven runtime/index JS/CSS assets match](qa-evidence/puzzle-spot-replay-identity-20261004.json). Earlier Puzzle-only5301 remains unchanged.

Independent ordinary desktop/390px browser replay, partial completion, reload, child isolation and parent navigation checks are underway. Candidate identity and green tests do not prove those browser results. Production candidate/promotion/fresh canonical controls and audio/editorial acceptance remain pending. Canonical source remains2923ca6; no new4.5 score is awarded.
