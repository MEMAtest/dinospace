# Rehearsal rework after usability feedback — 17 October 2026

The previous rehearsal established mechanical completion, but its first-visit experience was not good enough. This revision addresses the user's reported problems directly. It is a preview revision, not production promotion or a 4.5/5 sign-off.

## Planet inspection

- Starts on a large Earth close-up rather than a distant overhead diagram. Orbit-group rotation is cancelled during inspection so the selected globe retains its own orientation. The selection halo is hidden in close-up.
- One document scroll area replaces the fixed desktop viewport and nested facts scroller. Canvas width now shrinks with its container; its intrinsic render width cannot expand the mobile page.
- Scrolling is the default on the canvas. Wheel zoom is disabled. Touch uses pan-y by default. Explicit Drag to inspect enables free manipulation; Done moving restores scrolling. Always-visible turn, tilt, zoom and centre buttons support touch/keyboard without requiring a gesture lesson.
- Overview is an explicit choice with an angled camera. Small planets receive a proportional close-up/zoom range rather than being kept at the same minimum distance as Jupiter.
- Actual controls checked at 1440 and 390px: wheel over canvas moved the page; simulated native touch swipe moved the page after leaving drag mode; actual mouse drag visibly changed the rendered planet; turn/tilt/zoom/centre/overview used. Rendered before/after drag mean RGB pixel difference was 20.95. This is simulated Chromium touch, not a physical-device claim.
- Replayed all 54 discoveries, all nine Starter challenges including wrong/right attempts, duplicate fact protection, reload persistence and parent-world Back through the UI. Eight existing bounded model/passport/interpreter/storage/DOCX checks pass. Higher Solar bands were not re-audited.

## Code Cadets

- First visit introduces Pip with an illustrated rover, explains a program in plain language and offers one Start action.
- First mission exposes Forward only. A visible coach builds three numbered instruction slots with one Add one Forward button, then changes to Run my first program. The flag route is marked; the rover illustration makes its facing direction visible. Forward is no longer labelled with an always-upward arrow.
- Subsequent missions introduce turning/debugging, then repeats/collection. Completion shows a mission badge and Next mission. Program name/save controls are available in a drawer; advancing is held if save fails.
- Actual play: built the three-move route, ran it; ran the supplied incorrect route, inserted/reordered a move and repaired it; built Repeat/right/Repeat/Collect and recovered the sample. Named/saved and reopened the sample program through navigation. Desktop and 390px screenshots retained.

## Writing Desk

- First visit chooses Earth/Mars/Saturn with planet pictures and a postcard preview. One Make my postcard action starts the lesson.
- Four explicit stages: heading, message, decoration, save/share. Each stage names the next action. Empty page hints show where to type; advanced formatting and filename controls sit below the page in drawers.
- The child types their own words into the actual editor. The next stage selects the message paragraph; inserting a picture appends it after the message, preserving text. No generated child writing.
- Actual play: clicked the heading and typed it, entered a complete message, added Mars, selected Hello and applied Bold, Undo/Redo, saved, navigated away and reopened. Exact message checked after reopening. Actual DOCX download opened/rendered in LibreOffice; final document, PDF and rendered PNG retained. No Microsoft Word GUI or physical keyboard claim.
- Rehearsal caught and fixed image insertion at the current selection, an extra blank message paragraph, intrinsic canvas width overflow and globe orientation inherited from orbital placement. Failed automation attempts (whole-document fill replacing heading structure, an imprecise text selection, premature lazy-view assertions and a resource-timing assumption) are not counted as passes; scripts were corrected to use real clicks/typing and rendered-state waits.

## Boundaries

Same single contained headless Chromium context/tab; synthetic QA profiles only; provider voice/story guards; no paid generation; no monitoring restarted. Three coding missions and one writing workflow remain the scope. Full courses, project libraries/cloud backup, narration and child usability acceptance are separate work. Production and the 26-game acceptance ledger are unchanged. Large bundle warnings remain; no new all-game quality claims.

Hosted preview identity and final smoke results are recorded after deployment.

## Hosted acceptance replay

READY preview: https://dinospace-wczh2z4ss-memas-projects-23a0001d.vercel.app/rehearsal/index.html
Deployment: dpl_6tZEwynERi42GjHJNW6pv6hsDp1d
Runtime commit: 507e0b2592af70be658184392ec5e2efd225fee4

The hosted-playthrough script completed on this deployment: all three coding missions (including wrong-route repair), named program save/open, four postcard stages with manually typed heading/message, selected-word Bold/Undo/Redo, document save/navigation/reopen, exact message preservation and actual DOCX download. The same script followed the planet link through Amari selection, inspected Earth at 1440px and 390px, wheeled over the canvas, rotated/tilted/zoomed, enabled dragging and dragged, restored scrolling, performed a simulated native touch swipe, selected Saturn and opened the angled overview. No page errors were captured by the scripted checks. Screenshots were visually inspected. Browser identity/width/model checks are in amari-rework-served.log.

Scoped ESLint, eight existing bounded tests, production build and diff whitespace checks passed. Existing build chunk-size warnings and software WebGL screenshot performance warnings remain. The local all-54-discovery/nine-challenge replay supplements this hosted usability replay; it is not a claim that all higher bands or the other 26-game roadmap were accepted.
