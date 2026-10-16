# Solar Blender planet upgrade — 16 October 2026

## Delivery and release boundary

Preview runtime source: `8ebe5f113bd86e561ee90f30875a7a5dcf168701`.

Preview: https://dinospace-pmylqeeq2-memas-projects-23a0001d.vercel.app

Deployment: `dpl_5Y8ACK2Va8Wb9ZV2zR9KqJf6U5Fj`; provider reports READY, target preview, matching source metadata. Rendered module entry: `/assets/index-Dx9XWGZY.js`.

Production was reverified as Memory runtime `28f6c5980b9f60ad8848392b74d261b7a2d7c8c3`, deployment `dpl_HQNZMHJq3E3qynrJaHjUwNi4rp3b`, before this work. It has not been changed. This is a visual/function preview, not a new 4.5 editorial acceptance or a physical-device performance claim.

## Actual Blender work

Blender 4.5.3 LTS ran in background. Its Apple Silicon download matched the official SHA256 `73ea841053b55404bb3a71a9a22366f1f8821787fe5c899f8b55a7fff929d01b`. NASA reference GLBs were normalised, UV-seam vertices welded before subdivision, silhouettes smoothed and texture/mesh sizes bounded; PBR materials and rendered transparent picker images are exported locally. The editable nine `.blend` sources are retained in `assets-source/solar`. NASA source URL/hash provenance and Blue Marble attribution accompany the sources. These are adapted NASA reference models, not a claim of independently surveyed planetary surfaces.

Nine models total **2,836,952 bytes** (about 2.84 MB decimal); each is under 600kB and uses at most 10,256 triangles. All glTF buffers and textures are embedded; no NASA runtime fetches are needed. Surface texture edges are at most 1024px; picker images are 320×320. The app retains procedural fallback planets while GLBs load or fail. Published model directory `solar-v1` is immutable; later revisions require a new versioned URL for cache correctness.

The close-up camera now follows the selected world, isolates it from other orbits, accepts taps only on that visible world, and has an always-visible All planets control. Camera fill lighting keeps surfaces readable; body/ring geometry stays intact. Automatic rotation/pulsing respects reduced motion. Existing discoveries, questions, audio copy, passport and badges are preserved. Pluto remains explicitly a dwarf planet; the display states that size/distance/motion are simplified.

## Verification

- Production build passes. Existing Vite large-chunk/Browserslist warnings remain; no claim that this upgrade resolves the app's broader bundle size.
- Four focused tests pass: all nine GLB headers/hashes/embedded payloads, PNG dimensions and mobile asset budgets, plus the three existing discovery-passport/badge/seeded-choice tests.
- One contained headless Chromium session/context/tab, synthetic Amari profile; unrelated normal Chrome stays untouched. Provider voice/story endpoints were guarded before gameplay. No paid generation or real child data used.
- Local and deployed preview: every world selected normally at 1440×1000 and 390×844; all nine GLBs reported loaded, correct visible world heading, no horizontal document overflow, overview return and exact Explore parent Back pass. Representative actual screenshots are committed here; the complete local matrix remains in `output/playwright/amari-solar-blender`.
- Local actual controls: open facts, wrong/correct Earth challenge, saved passport reload, pause/resume, zoom in/out and overview controls pass. Final Earth Blue Marble close-up and ordinary centre/blank-area pointer clicks retain the selected Earth.
- Reduced-motion check: two actual canvas screenshots separated by 500ms match byte for byte without input.
- Injected network failure: block Mercury GLB only, then verify eight detailed models plus the Mercury procedural fallback and working fact control. Restore loading and re-enter: all nine models load. This expected blocked-request console error is isolated from normal preview acceptance.
- Delayed GLB responses while leaving the route: no page errors after unmount, and the parent-world route remains correct.
- Normal deployed preview console check after the 18-world viewport selection matrix: zero errors and warnings. Local software-WebGL screenshot runs produced four driver ReadPixels stall warnings. These do not establish physical Android/iPad frame rates.

## Research scope

The source-grounded proposal in `docs/research/amari-digital-skills-20261016.md` outlines 24 Code Cadets missions and six Writing Desk lessons, followed by free projects and a rover-to-report link. It is a proposal: neither new activity has been added to the app or the 26-game acceptance inventory.
