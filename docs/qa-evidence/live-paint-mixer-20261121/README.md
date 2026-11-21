# Colour Mixing Lab live mixing rehearsal · 21 November 2026

On the preceding release at 390×740, the paint pots were hidden inside a collapsed control. Adding two scoops showed no preview. Opening the preview still left the brush on its original colour until the mix was explicitly applied.

The new mixer puts all five pots first and shows and selects the current mix on every scoop. **Go to canvas** focuses the painting area. **Fill background** applies the mix to the active sheet. **Undo scoop** lets a child try new proportions without changing artwork already on the page.

| Check | 390×740 live touch | 1440×900 live mouse and keyboard | 320×740 candidate touch |
| --- | --- | --- | --- |
| Five pots on first screen and live preview | Pass | Pass | Pass |
| Real strokes in mixed colour and undoable background fill | Pass | Pass | Pass |
| Mixed colour on a tiger region and independent palette | Pass | Pass | Pass |
| Blank drawing and tiger colour retained after reload | Pass | Pass | Pass |
| Guided Paint Mixer and Sky Shapes entry | Pass | Pass | Pass |

The tests used native touch events in Chromium phone-size emulation, mouse and keyboard at desktop size, and a synthetic profile. They read the rendered brush pixels and saved tiger region after applying orange made from red and yellow. They also checked that adding blue changed the mixture and that Undo scoop brought back the orange.

The **Refresh games** update preserved all 118 synthetic storage records and the IndexedDB Storybook fixture. All 769 repository tests passed. The immutable backend, Netlify draft and public site matched 7 local resource hashes. No unexpected HTTP or browser errors or provider calls were observed.

Runtime `a4f9cef1d7d9f677529fcd664dabc3db546867a3`, module `/assets/arcade-chVr-Pji.js` and worker cache `amari-discovery-v88`. Vercel deploy `dpl_HSJAk75wqsCQYHP7cQLt8o7fWcrs` and Netlify gateway `6b01e9f810d4d5123a90e306`.

[Colour Mixing Lab](https://dinospace.netlify.app/#/play/colormix) · [Phone screenshot](mixer-live.jpg) · [Structured results](production-summary.json)
