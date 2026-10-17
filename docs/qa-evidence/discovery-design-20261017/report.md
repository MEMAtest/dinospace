# Discovery HQ illustrated design and planet repair — 17 October 2026

## Delivered source

- Generated environment and transparent Pip character are actual live assets, not screenshots of UI. Original PNGs and provenance are in assets-source/discovery-v2; runtime WebP files total about 346KB. Existing Amari astronaut art is reused.
- Shared Discovery HQ navigation, illustrated scenery, white/cyan frames and tactile controls now wrap all 26 existing Amari catalogue games. The two new digital skills activities use the same design. Studio CSS is scoped so loading its editor cannot restyle other games. Session progress bars and dialogs are excluded from the outer-frame rules.
- Code Cadets and My Writing Desk are now entries in the main app's Creative Lab. Main-app links from Solar continue to those activities. Existing child-scoped draft keys are preserved. Unsaved drafts are guarded when using the new header navigation; a real Keep playing/cancel path was tested. These two new activities are outside the existing 26-game quality acceptance ledger.
- Code Cadets uses generated Pip on its board, hero and coach; existing Amari astronaut illustration, clear direction badges, illustrated palette and animated mascot (reduced-motion aware). The existing three functional missions remain sequence/debug/repeat. The free map-builder shown in the user's fifth reference is not implemented in this revision.
- Writing Desk shares the illustrated frame and Pip coach with the existing four-stage real editor/save/reopen/DOCX workflow. Planet images remain curated educational assets.

## Earth and Solar System

The colour texture had been substituted on the old model's atlas UVs. Rebuilt Earth in Blender as a 64-segment UV sphere with correct equirectangular mapping, NASA Blue Marble texture and matching new thumbnail. Sources, credit and hashes are in assets-source/solar/earth-v2.blend, scripts/solar/repair_earth_uv.py and public/models/solar-v2/provenance.json. The new GLB is about 293KB. A regression test checks every vertex's latitude against its texture V coordinate and the model budget.

Rotation is automatic unless reduced motion is preferred. Resume is an explicit override for reduced motion; Pause actually stops movement. Whole Solar System is a prominent tab and Show all planets together is available beside inspection controls. Direct mouse dragging works immediately. Vertical scrolling over the canvas remains enabled; touch turning uses two fingers. No old opt-in Drag to inspect mode is needed.

## Local checks completed

- Catalogue: all 28 entry screens, 1440px and 390px, 56 viewport checks; zero horizontal overflows, broken completed images or page errors in that audit. This is an entry-screen visual audit, not full gameplay acceptance for 28 games.
- Three Code Cadets missions played: sequence, wrong-route failure/repair, repeat/collect; named program saved. Four postcard stages played with actual typing, selected-word Bold/Undo/Redo, save/leave/reopen and DOCX download. Exact persisted text checked.
- Main app: Creative Lab → Code Cadets → unsaved Home attempt → Keep playing preserves program → save → parent Creative Lab → Writing Desk → open the same saved postcard. Desktop and 390px captured. Letter Launch was started through its real level control; its progress bar remained a small bar and did not cover the game.
- Solar: native wheel and simulated touch swipe scroll the page; native mouse drag changes the rendered globe; all-world and close-up controls used. Earth-only 200×200 render samples 1.2 seconds apart differ by mean RGB 26.03 while rotating; samples a second apart when paused differ by 0.00. Native drag renders differ by 12.13. Explicit Resume under emulated reduced motion was exercised.
- Nine bounded tests passed, including the Earth UV regression; scoped lint and production build passed. Existing bundle-size/software-WebGL capture warnings remain.

## Limits and release boundary

This is a shared visual-system rollout plus detailed work on Solar and the two new digital skills activities. Individual interiors/learning content of all 26 games have not been redesigned or re-certified 4.5/5 by this audit. Their existing acceptance scores are unchanged. Full coding/writing curricula, multiple-project library and the reference's free map builder remain separate work. No paid voice/story generation, child-data migration or monitoring restart. One existing contained Chromium session/tab and synthetic QA data were used. Production is not promoted by this work.

Hosted identity and acceptance evidence will follow below.
