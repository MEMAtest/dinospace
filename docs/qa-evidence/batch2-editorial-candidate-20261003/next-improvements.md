# Batch 2 editorial next steps — Puzzle Pop, Spot the Difference, Sky Shapes

This is an addendum to the independent 5203 editorial review. Its estimates remain tied to candidate `ead5a1d60d2ad5e2cacefc4cbcecb0aee7cec630`; this is a concrete plan for addressing the gaps before a new editorial score is considered. It does not change that report or accept any game at 4.5/5.

The requested 3D UI/character/game mock image paths were not available in this agent's filesystem: `view_image` returned “unable to locate image” for both `/var/folders/t_/nqjg355s26x2smr80s78_1_r0000gn/T/codex-clipboard-ea0cb788-d9a5-4304-9408-5ec967374329.png` and `/var/folders/t_/nqjg355s26x2smr80s78_1_r0000gn/T/codex-clipboard-1d69d3a4-2e77-43ff-90d0-9a16b562f4de.png`. I cannot claim visual similarity or deviation from those images. The visible candidate has polished, colorful layouts, but its Spot and Puzzle illustrations are mainly flat cartoons with emoji-like detail markers, and Sky uses an illustrated route over a space background. Restore the reference files for the next reviewer to compare art style, shape language, character proportions, depth/materials, spacing, and color treatment directly.

## Puzzle Pop

The current map already has a sound progression—four pictures each at 2×2, 3×3, and 5×5—and the retained full baseline covers the ordinary band/reward/replay flows. Preserve those counts and progression while making the spatial learning strategy more explicit:

- Add one short age-six strategy cue per chapter. Picture Pioneers should direct children to compare a piece’s edge/corner with the preview; Curious Constructors should suggest using one clear edge or color landmark before fitting neighbors; Detail Detectives should prompt scanning a row/column and checking a small feature. Each cue should appear before the first placement in that chapter and be repeated by Hint in child-readable language.
- Keep each scene’s fact to one short sentence tied to something visible in its finished image. In a fact audit, all 12 picture facts should identify a visible subject/detail and contain no mismatch with the image. Existing full-baseline facts can be rechecked; do not regenerate all 12 games solely to re-prove unchanged items.
- On 390px, keep the complete scene title visible in the game header or in a nearby persistent label. The current mobile header shortens it to `D…`; the scene name is present in the placement prompt, but the header should not truncate a title while a child is switching attention between preview and board.
- If the unavailable art mocks are the visual target, restyle preview and tray imagery to that reference’s consistent illustrated depth and character treatment. Keep all puzzle-piece boundaries distinguishable at 5×5, and test one bright, one dark, and one high-detail scene at 390px so the new treatment does not reduce edge visibility or make pieces too small.

**Evidence for re-score:** use the retained completed-band baseline plus narrow candidate deltas for strategy prompt per chapter, one sample completion/fact in each band at desktop and 390px, and the previously tested mobile header/5×5 geometry. If art changes, capture the same three scenes at both widths and compare to the restored mocks. Keep the audio dimension provisional until listening is completed.

## Spot the Difference

The 5204 hint repair now has a visible amber 56×56 target, chooses a new unfinished target after a hinted target is found, and resets tokens on Next and Replay chapter. Preserve that behavior. Two additional editorial improvements remain:

- Teach a repeatable comparison routine in the intro or first pair: “Look at the top, middle, then bottom of Picture A and Picture B.” Keep per-pair prompts short; show the two pictures side by side when width permits and stacked with ordinary vertical scrolling at 390px.
- Make the second Magnifier clue select a different still-unfound target after the first has been found. If the child uses both without finding the first, do not silently claim a different area; keep the highlighted target consistent with the selected clue. Validate against at least three ordinary scene seeds at each viewport: token count 2→1→0, target names and centers distinct when a prior target is found, correct hit moves to 1/3, and a found target is never re-highlighted.
- On the completed pair card, show the picture fact once. In the current 5204 completion state, “Fossils are clues that help scientists learn about dinosaurs” appears in the top `Picture pair complete!` status and again in the `Picture fact` card. Make the status concise and nonduplicative (for example, `Picture pair complete! Read your fact, then choose Next picture.`) while keeping the single factual sentence until Next. Do not alter or synthesize narration keys as part of this on-screen-copy fix.
- Keep 3/5/7 counts exactly honest. Each pair should contain exactly its displayed number of genuine changes; missed taps should remain gentle and neutral; found markers should be hit-test neutral; hint rings must stay visible over light and dark art. The 5204 desktop/mobile target test covers one pair, while the retained baseline covers all bands.
- Use the restored illustration mocks to decide whether flat scene renderings and symbol overlays should be upgraded. A visual refresh should make each difference visually coherent with the scene while remaining independently findable; do not make every change a large emoji swap in Challenge.

**Evidence for re-score:** retain all prior baseline rows, then independently test the updated hint/copy deltas at both widths, capture one full completion fact card per viewport, and retain one ordinary run seed per tested state. Score audio only after human review of clue and completion playback, mute, replay, Next, and confirmed Back.

## Sky Shapes

The authored 4×3 mission route is already supported by the independent route/fact review and the full baseline: all 12 complete outlines or multipart constructions are meaningful missions, not dozens of token trace points. Keep that learning route. Refine instruction hierarchy and visual presentation:

- Each flight should have one visually dominant task instruction. The current 390px Kite screen presents the same broad goal in the `starter sky goal` capsule, the “Trace each outline part in order” header, and the status “Start at the green 1. Trace the diamond outline.” Keep the mission-specific action and tip; shorten the capsule to a unique chapter objective or remove it from the active flight view so a child does not reread three overlapping statements.
- Maintain one objective per level: Starter = one simple outline; Growing = curves/inward corners and the two-part house order; Challenge = 3–6 ordered paths. Each flight tip must name the visible shape/path feature to use, and the fact shown on success must accurately describe the route. The 12 existing fact-to-path checks are reusable unless routes or facts change.
- Use a consistent visible start and finish cue that remains distinguishable on the space background without relying on green/red alone. The current mission has a numbered green start, red finish, sampled glowing dots, and keyboard instructions; compare the restored 3D game mock for line weight, jet/character size, decorative clutter, and route contrast before restyling.
- Preserve the visible percentage, stars, accuracy-versus-new-star explanation, replay and saved chapter behavior. The full baseline and 6b repair deltas already cover unique order, route feedback, save/reload and reward credit; reuse those results and test only changed prompt/visual states.

**Evidence for re-score:** retain the comparable four-mission-per-sky evidence; add one starter, one multipart Growing, and one ordered Challenge sample across desktop and 390px for revised instructions and finish/route visibility. Reuse full baseline replay/save records. Include real keyboard and pointer/touch deltas only if the input surface or drawing art changes. Listening/intelligibility is still a separate unaccepted gate.

## Scoring gate

These are measurable improvements, not automatic score increases. A later independent editor should score all five roadmap dimensions with evidence for each, average at least 4.5, and leave no dimension below 4. All production-identity, required gameplay, and human-listening gates remain separate. No score can be raised solely because the 5204 Spot hint fix passed or because narration files decode successfully.
