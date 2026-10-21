# Shadow Match artwork — 21 October 2026

Runtime source: `6960c53fa157f69b67ca699b9b3f31c5a17022fd`.
Canonical deployment: `dpl_77Wh681qiAQg2UER5ygr2dccmU27`.

## Delivered artwork

All six species use rich transparent 3D illustrations: green T-rex, orange Triceratops, purple/pink Stegosaurus, blue Brachiosaurus, coral/gold Pterodactyl and golden Ankylosaurus. Five illustrations were made with built-in image generation; the app’s existing polished Brachiosaurus was reused. Two generated characters received cutout refinements. A request for a new Brachiosaurus was output-moderation rejected, so no further retry was made and the existing illustration was used.

Final runtime files: `public/art/shadow-match-v1/*.webp`. Exact original paths, full generation/edit prompts and source/runtime hashes are in `art-provenance.json` and `cutout-edits.json`. Original generated images remain once in the Codex generated-images directory; no duplicate PNG source collection was created in the repository. WebP encoding resized delivery images to 800 pixels wide while preserving alpha.

The new component is scoped to Shadow Match: intro, draggable dinosaur, answer cards, matched celebration and unlock preview all use the new art. Other games’ shared dinosaur drawings are unchanged. Every shadow uses the exact same image URL and alpha mask as its coloured dinosaur, with a flat black colour filter. The last level mirrors that image. Existing five-level progression and saved progress remain unchanged.

## Verification

Six images have real alpha, transparent corners, distinct species and recognizable outlines; combined optimized size is 438142 bytes (about 428 KiB). Every image was visually inspected. Local native-control rehearsal completed 23 rounds across all five levels at 390 px, including a wrong-choice recovery; then five mirrored rounds by mouse dragging at 1440 px. All six species appeared and decoded. No browser errors or voice/story API attempts.

Sixteen focused unit/regression checks, lint and build passed. A stale test assertion from the preceding six-level Spelling update was corrected to test increasing actual word lengths. An initial browser harness selected both the draggable and shadow sharing data-kind; the selector was scoped to shadow answer buttons and the complete rehearsal then passed. No product interaction change was needed.

Production acceptance is recorded separately in `production-result.json`; a deployment READY status alone is not gameplay evidence. No new editorial score or all-game 5/5 claim is assigned by this artwork release.

## Canonical production acceptance

Passed a native Amari match from the current big-explorer entry, all five Askia levels at 390 px (23 rounds), and five mirrored matches by desktop mouse dragging at 1440 px: 29 correct matches total, with wrong-choice recovery also exercised. All six species appeared and all six optimized images decoded. Shadow and coloured image sources matched exactly. No horizontal overflow, page errors or voice/story API attempts were observed. Served entry: `/assets/arcade-77oq1ZO_.js`; worker version v24 verified. The new intro and gameplay captures were visually inspected.

## Resource closeout

No new checkout or dependency installation. About 0.42 MiB of optimized runtime art and 1 MiB of QA evidence/harnesses retained. Seven generated original/refinement source images total 11.2 MiB and remain once at the canonical paths recorded in `resources.json`; no duplicate project source PNG collection. Task preview server stopped and single contained browser tab parked; no visible Chrome windows were opened. Runtime and evidence are committed on the existing branch.
