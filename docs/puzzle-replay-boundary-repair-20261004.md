# Puzzle Pop completed-picture replay repair

## Confirmed source defect

The old queue guard changed only an identical full order. It could start the next run with the picture just completed: prior seed1 produced Robin’s Tree → Moon Camp → River Valley → Dino Park; replay seed38 produced Dino Park → Robin’s Tree → Moon Camp → River Valley. This is a source-level regression reproduction, not a claim that those seeds were injected or observed in a production browser.

## Repair

Source `0dd1077049eb492b6b16b9648eb77d936cab43ad` keeps seeded shuffling and rotates the queue at Start until both the first picture differs from the last completed picture and the full order differs from the previous queue. Each authored scene remains exactly once. The active run is never reordered. Completion saves `lastCompletedSceneId` in the existing child-specific progress object, so replay after a partially completed chapter also avoids the actual last completed picture. Legacy records without this field use the prior queue’s final item as a conservative fallback.

No narration strings, media files, trays, picture crops, scoring, chapter unlocks or shared child settings are changed.

## Gates and scope

- Six Puzzle tests pass, including 9,000 prior/next-seed combinations across all three chapters, repeated seeds, complete scene membership, partial-run completion and child isolation.
- Thirteen focused Puzzle/navigation/narration tests pass. The navigation test emitted nonfatal Vite dependency-scan warnings against preserved historical temporary QA snapshots; all assertions passed.
- Changed-file ESLint passes.
- Clean git-archive build with all three production public voice/story flags passes (4.50s); existing >500kB chunk warning remains.
- Frozen `tmp/puzzle-replay-boundary-0dd1077/dist`, explicit IPv4 origin `http://127.0.0.1:5301`. [Identity](qa-evidence/puzzle-replay-boundary-identity-20261004.json) records seven matching runtime/index JS/CSS files.
- Independent ordinary desktop/390px replay, reload and parent navigation checks are assigned. No local browser pass, production release, audio quality or 4.5 acceptance is claimed yet. Canonical remains Sky repair2923ca6.
