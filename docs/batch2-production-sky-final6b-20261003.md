# Batch 2 Sky Shapes production gate — final 6b (2026-10-03)

## Decision

**GO for the narrow Sky Shapes production persistence/reward/copy gate.** The exercised first-flight save, leave-before-Next persistence, four-mission chapter reward/unlock, and completed replay credit behavior passed on the canonical deployment. This is not a 4.5/5 certification for all games: the full 24-run quality matrix and the audio acceptance matrix remain separate gates.

## Deployment and source lineage

- Canonical alias: https://dinospace-eight.vercel.app
- Deployment: `dpl_DGLGVkaMikT5GPntS6YThDsesHyx` (READY)
- Deployed source: `6b84554e7a1d21b3db658d213a2298462c78599e`
- Rendered JS: `/assets/index-akZ21SWl.js`, SHA-256 `3ebd53465f2f2a6994163ce420c3d04e7e4f578544518f9bde4f7b6e2f8fb2b0`
- Rendered CSS: `/assets/index-CPZQTFam.css`, SHA-256 `25e3cfc13e4e40f8ceb95c3adf163e301e2f6b800c18052e2ccb9e32e475f459`
- The loaded canonical asset hashes match the deployment identity supplied by root. This report makes no claim about the later source head or any local candidate bundle.

## Procedure and evidence

Used fresh named Playwright session `batch2-prod-final-6b`; no storage/PRNG injection. API routes `**/api/voice`, `**/api/voice/**`, and `**/api/story/**` were intercepted with local 503 responses before navigation. The UI sound control was set off. The intercepted `/api/voice` POSTs returned only the local QA 503; no provider response was received. The packaged audio request returned HTTP 206, which proves delivery only, not audibility or quality.

### Mobile first-flight persistence

At 390×844, ordinary navigation selected Amari and started Sky 1. Fresh UI diagnostics gave seed `1518496700` (starter). Tracing the Kite through its visible outline achieved 100% / 3 of 3. Before selecting Next, local storage showed `amari_points=3` and Sky progress contained `sky-diamond` with three best stars. I used the game Back control and confirmation to leave before Next, returned Home, and reloaded; Home retained 3 stars. The reload persistence was observed in the same session and profile.

### Desktop chapter save/reward

At 1280×900, a fresh Sky run had seed `276534555`. Kite was already complete from the mobile run, so the run completed the remaining Window Cloud, Round Sun, and Mountain Peak missions. Each was traced to 100% / 3 of 3 via pointer input along the visible SVG path. Before pressing “Complete this sky”, the final result showed separate flight-rating and chapter-bonus messages: “Your best flight rating is saved. 3 new stars added to your collection!” and “Aviator badge saved · 2 bonus stars added!” Local storage showed:

- 4 unique completed mission IDs: `sky-diamond`, `sky-square`, `sky-circle`, `sky-triangle`;
- all four at best accuracy 100 and best mission stars 3;
- `completedEpisodeIds=["cloud-meadow"]`, `unlockedEpisode=1` (Sky 2 unlocked);
- global `amari_points=14` (3 + 3 + 3 + 3 + 2 chapter bonus).

After selecting “Complete this sky”, the completion screen said the saved badge and flight stars were ready and offered replay/Sky 2. Home showed 14 stars.

### Completed replay

Using the visible Sky map controls, replayed an already completed mission at desktop and completed it at 100% / 3 of 3. Result copy remained accurate: “Your best flight rating is saved. Try a new mission to collect more stars.” The Home/global star total remained 14. No reward was added for an identical replay.

Screenshots saved under [`qa-evidence/batch2-production-final6b-20261003`](qa-evidence/batch2-production-final6b-20261003/):

- `mobile-home-14-stars.png` — 390px Home after the full chapter; the earlier first-flight 3-star → leave → reload result was also observed live, but its screenshot was not retained in this evidence folder.
- `desktop-replay-rating.png` — desktop game surface after replay, showing the completed trace and 3/3 rating; exact replay result copy was also verified in the live accessibility snapshot.
- `amari-game-log-sky-exclusive-repeat-20261003.json` — genuine Grown-ups → Game troubleshooting → Download game log export, saved directly to its unique evidence path immediately after the download event. SHA-256 `3ee39322aede2f8d40e0fda5bbbdd386a00751a70a8fcaf6d90671921f7a5f26`. It includes Jet milestones for first run seed `1518496700`, desktop run `276534555`, first replay `1364367510`, and later replay `1455201883`, plus the chapter completion.
- `amari-game-log-mismatched-puzzle-spot-20261003.json` — preserved first export that collided with another QA download; see the resolution below.

### Shared-download collision resolved

The first UI export appeared to contain only Puzzle and Spot records. Root identified concurrent QA sessions writing the same default Playwright download filename. I preserved that mismatched export separately as `amari-game-log-mismatched-puzzle-spot-20261003.json` (SHA-256 `928d0c26edfe64113e3e6dec0cd751bae3330f9c5859cb212ac9d696d1886cd4`) and repeated the UI download after the other session had closed, saving it directly to the unique Jet-log path above. The repeat contains this Sky run’s Jet events, so the earlier mismatch was a shared-file collision, not a product diagnostics defect. Both exports contain game identifiers/outcomes rather than names or story text, consistent with the UI export description.

## Scope boundary

This GO covers the specified narrow production Sky reward/persistence/replay checks on the exact deployment above. It does not attest to remaining 4.5/5 acceptance scenarios, the 24-run four-game matrix, Monster Math or other game fixes, physical audio quality, or provider-backed narration. No source files were edited and no deployment action was performed by this QA task.
