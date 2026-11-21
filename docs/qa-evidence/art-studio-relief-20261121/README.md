# Creative Lab colouring, textures and 3D rehearsal · 21 November 2026

Sky Shapes and Colour Mixing Lab have 18 pictures with six animals, six shape pages and six vehicles. On a picture, brush paint follows the visible region where the stroke begins. Texture can be applied to a region and takes on that region's painted colour. Stamps add details to a picture region or a blank sheet. Texture and stamp edits participate in Undo and remain part of the saved sheet.

**View in 3D** builds a layered, turnable WebGL relief from the current picture. Its surface shows the painted artwork, linework, textures, brush marks and stamps. Dragging or using the turn buttons changes the view, and Back to colouring returns to editing the same page.

| Check | 390×740 live touch | 1440×900 live mouse | 320×740 candidate touch |
| --- | --- | --- | --- |
| 18 available pictures and legacy blank art retained | Pass | Pass | Pass |
| Brush remains inside the tiger face and leaves the overlapping eye clear | Pass | Pass | Pass |
| Fur and leaf stamp retained after reload | Pass | Pass | Pass |
| Painted tiger, mosaic and mixed-paint rocket render in WebGL | Pass | Pass | Pass |
| Turn buttons, drag rotation, reset and return to painting | Pass | Pass | Pass |

The brush check inspected actual ink pixels inside the face, beyond its edge and within the separate eye region. The 3D check compared WebGL frame captures before and after input. Phone runs used touch emulation in Chromium. The screenshot shows the painted tiger from the live run.

The in-app **Refresh games** update preserved all 118 synthetic storage records and the IndexedDB Storybook fixture. All 770 repository tests passed. The compiled worker stayed within the existing precache limits at 171 assets and 30.0 MiB. The immutable backend, Netlify draft and published site matched 8 local resource hashes. There were no unexpected HTTP errors, browser errors, or provider calls.

Runtime `a2cacd87a2b6604b4442e1d7e1ef8c19e384da20`, module `/assets/arcade--NhhozRQ.js` and worker cache `amari-discovery-v89`. Vercel deploy `dpl_9Sw99CmyzjKQdyJp5dfytfmqPVNT` and Netlify gateway `6b01ef40048a5e7a423ba0ea`.

[Sky Shapes](https://dinospace.netlify.app/#/play/jet) · [Colour Mixing Lab](https://dinospace.netlify.app/#/play/colormix) · [Live tiger preview](tiger-live.jpg) · [Structured results](production-summary.json)
