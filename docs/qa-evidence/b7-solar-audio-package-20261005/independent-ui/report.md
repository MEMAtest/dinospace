# Independent Solar native-audio UI delta

Date: 2026-10-05  
Frozen runtime source: `532e540da87b7f6a4197c84de39bb127f296fdef`  
Preview: `http://127.0.0.1:5403/`  
Build: `dist-solar-audio-20261005`, 6,015-file tree SHA-256 `276cd270c6b940189e281dd37c9c29037407f05dc8a16a48cf602facf6ea1a22`  
Served identity: [`served-identity.json`](../served-identity.json)

## Result

The targeted newly packaged Mercury discovery clip played through the app's native audio element and completed at both tested widths. Desktop mute and confirmed navigation each interrupted a replay. This is runtime playback evidence only; it does not establish that a person heard or approved the recording.

The exact target is Mercury Discovery 5, “Long cliffs formed as Mercury cooled and shrank.” On the normal discovery card I selected that visible fact and pressed **Listen**. The browser loaded `/audio/en/00567b7b-matilda.mp3` from the frozen preview, emitted `loadedmetadata`/`canplay`/`playing`, and ended at 2.879 seconds. The target file is HTTP 200 and SHA-256 `7942c9ecb36b91171bacf6af826c4fbdc8c9c07f0a49fe9598f21c60e3f198f1`, matching the served identity.

At 1280×800, clicking **Listen** and then the visible **Turn sound off** button produced a pause call at 1.208 seconds; the media paused and reset to 0. At 390×844, the same native clip loaded, played, and ended at 2.879 seconds. The mobile document had `scrollWidth=390` and `scrollHeight=2005`; the visible Back and sound controls each measured 48×48 px at x=12 and x=330, y=12. Desktop had no page overflow and the same controls measured 48×48 px at x=16 and x=1216, y=14.

At desktop width, starting the clip, choosing **Back to Explore and Languages**, then confirming **Back to world** produced a pause call at 0.043 seconds and navigated to `#/world/explore`. A prior attempt was delayed by the leave-confirmation dialog and let the clip finish first; that attempt is not counted as cancellation. The completed second attempt is the navigation-cancellation evidence.

Screenshots:

- [Solar at 1280×800](solar-desktop-1280.png) — SHA-256 `91dd15521123bda48cdf6b411a9f0e5047304f202d9dfb6eeec2393e3efda6b5`
- [Solar at 390×844](solar-mobile-390.png) — SHA-256 `2f1962695136a0d62191b66404cb436129bacf57c561f5df272dae6cbb4363e1`

## Guardrails and limits

- The existing Chrome `default` session and its existing tab were reused; no browser, tab, context, or window was created.
- Before app navigation, `/api/voice` and `/api/story` were guarded with HTTP 403 routes. The route list still showed both guards after the run. No provider or story request was made.
- Sound was muted again with the visible control. The tab was left on Explore & Languages.
- The passive `HTMLMediaElement.play`/`pause` observer delegated to the originals and recorded source, timing, and native media events. It was page-local and is gone when the page is next reloaded.
- The browser console reported zero errors and zero warnings. The preview requested the new MP3 and all observed requests were same-origin HTTP 200.
- No human-listening judgment is included. No 54-discovery or nine-challenge regression matrix was repeated; those are retained separately.
