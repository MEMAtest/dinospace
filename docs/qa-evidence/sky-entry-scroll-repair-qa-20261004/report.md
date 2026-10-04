# Sky Shapes map-to-play scroll repair: independent browser regression check

Date: 2026-10-04 (Europe/London)  
Candidate: `http://127.0.0.1:5357`  
Frozen source identity: `4fcb80d34bb2e9cfdb587f40ec61f44a6ae75f55`; served identity record: [sky-entry-scroll-repair-identity-20261004.json](../sky-entry-scroll-repair-identity-20261004.json).

## Identity and isolation

Before navigating, I fetched all 16 paths in the candidate identity file. Each returned HTTP 200 with the exact listed byte count and SHA-256. This includes `index.html`, the app bundles, stylesheet, `sw.js`, and all listed images. A fresh Playwright profile was opened at `about:blank`; `**/api/voice**` and `**/api/story**` were routed to 204 before `goto`. The route list was checked after navigation and still showed both patterns. The browser stayed in a synthetic profile, and the only gameplay progress was earned through visible controls. The on-screen sound control was muted. The final request log showed 12 static requests and no provider URL; browser console reported zero messages, errors, and warnings.

## 390px natural Start click

At 390×844 on a fresh profile, the Sky Shapes map showed all three bands with Growing and Challenge locked. The Start button was below the initial fold at x=32, y=1084, 326×64px. From `scrollY=0`, Playwright performed a normal role-locator click on “Start this sky”; the test did not scroll manually after clicking. The active mission opened with `scrollY=0`, header bounds x=8, y=8, 374×72px, and both header controls fully inside the viewport at 48×48px (Back x=20, y=20; sound x=322, y=20). Document and body widths were both 390px. Screenshot: [active after natural Start click](mobile/active-after-natural-start.png).

This verifies the previously clipped c478 map-to-play transition on the exact frozen repair candidate. The actual map interaction remained a normal UI action: only the automatic scroll associated with clicking the below-fold Start target occurred.

## 1280px regression check

At 1280×800, the map Start button was visible at x=92, y=572, 1096×64px. A normal click entered the active mission with `scrollY=0`; header bounds were x=64, y=16, 1152×76px, and Back/sound were 48×48px at y=30. Document and body widths were 1280px. Screenshot: [desktop active after Start](desktop/active-after-start.png).

## Result and limits

The mobile below-fold entry and desktop entry both pass on this exact candidate, with no horizontal overflow. This is a focused regression check for the map-to-play scroll reset, not a full Sky mission replay, independent acceptance of the visual redesign, or an overall quality score. The earlier c478 report remains unchanged and documents the original reproduced failure.
