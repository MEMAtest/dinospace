# Sky Shapes production candidate: entry, leave, keep, and replay check

Date: 2026-10-04 (Europe/London)  
Candidate: `https://dinospace-51fgt6ny5-memas-projects-23a0001d.vercel.app`  
Deployment: `dpl_ACKz7A5eDD8DiCfUptevNEjP5xdV` (READY production candidate)  
Source archive: `4fcb80d34bb2e9cfdb587f40ec61f44a6ae75f55`  
Bound identity: [sky-spot-production-candidate-identity-20261004.json](../sky-spot-production-candidate-identity-20261004.json).

## Identity and guarded setup

I fetched each of the 16 paths in the bound candidate identity before browser gameplay. Every path returned HTTP 200 with the recorded byte count and SHA-256. The canonical `dinospace-eight.vercel.app` identity remains c478; this test used only the READY candidate above.

I opened a fresh Playwright profile at `about:blank`, installed `**/api/voice**` and `**/api/story**` routes returning 204 before navigation, set the viewport, then used `goto`. The route list still showed both after navigation. Sound was muted via the visible button. The profile and its learning progress were synthetic, and every mission was completed through visible app controls. Final traffic showed 13 static requests and no provider URL; console had zero messages, errors, or warnings. No paid or external API call was made.

## Mobile Start transition

At 390×844, the fresh Sky Shapes map showed Cloud Meadow with its Start button at x=32, y=1084, size 326×64px, below the initial fold. Starting at `scrollY=0`, I clicked “Start this sky” using its normal button locator and did not scroll manually afterwards. It opened Mountain Peak with `scrollY=0`; the header was x=8, y=8, 374×72px. Back and sound were both fully visible 48×48px targets at (20,20) and (322,20). Document and body widths both remained 390px. See [map before Start](mobile/map-before-start.png) and [active screen after Start](mobile/active-after-start.png).

## Back and Keep playing

While Mountain Peak was active at 0/1 parts, I clicked “Back to learning world”. The leave dialog appeared; its two large icon buttons measured approximately 88.3×88.3px and 73.6×73.6px. After choosing “Keep playing”, the same Mountain Peak route remained open with the same 0/1 part state, `scrollY=0`, and visible header. Evidence: [leave confirmation](mobile/leave-confirmation.png) and [active game after Keep playing](mobile/keep-playing.png). I also used “Restart this flight”; it kept the same mission and reset/retained the route at 0/1 parts with the start guidance.

## Desktop transition and earned replay

At 1280×800, “Start this sky” was visible at x=92, y=572, size 1096×64px. A normal click kept `scrollY=0`; the active header was x=64, y=16, 1152×76px, and Back/sound were 48×48px at y=30. Document and body widths were 1280px. See [desktop active screen](desktop/active-after-start.png).

To make the replay control reachable without injecting progress, I completed only Cloud Meadow’s four missions with the visible keyboard instructions (16, 15, 16, and 18 Space steps after Enter). Each completed normally; then I used the visible “Complete this sky” and “Sky map” actions. The completed map showed 4/4 saved missions and “Replay this sky”. Activating it opened a normal saved mission (Round Sun at desktop, Kite at mobile), with the 4/4 saved progress preserved and the active mission reset to 0/1 parts. Screenshots: [completed sky](mobile/sky-complete-before-replay.png), [desktop replay map](desktop/sky-map-before-replay.png), [desktop active replay](desktop/replay-active.png), and [mobile active replay](mobile/replay-active.png). No other sky was completed; this was not a 12-mission run.

## Result and limits

The production candidate passes the focused 390px below-fold Start transition, active Back → Keep playing state preservation, normal Restart, the desktop Start transition, and a naturally earned replay. Both viewport widths had no horizontal overflow, and all measured header/game/dialog controls met the 48px target floor. This is a focused functional regression check for this exact identity; it does not establish overall game acceptance, audio quality, or a 4.5 score.
