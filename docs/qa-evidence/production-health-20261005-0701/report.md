# Storybook Studio mute and auto-turn clarification

**Result:** The reader's global sound-off setting silences narration by setting media element volume to `0`. With auto-turn enabled, starting narration and advancing pages can still load/start the next clip, but that clip is silent. The visible Pause control paused the active clip immediately in the observed sample. This is runtime behavior evidence only; no human listening verdict is claimed.

## Identity and safety

- Canonical URL: `https://dinospace-eight.vercel.app/`
- Deployment: `dpl_5cKFB6U489CLoEPucaY9pDarcHsp`
- Runtime source: `1accc99e89be303678ead99def6a3095ab1cb886`
- Runtime archive: `22d805b67ced8b36f45d0f5c547bfe67c5dded88`
- Reused the existing isolated synthetic profile and guarded browser session. `/api/voice` and `/api/story` returned 403 before navigation and remained guarded. No story creation or provider calls were made.
- Opened the existing curated book **Rex and the Missing Moon Map**. Auto-turn was visibly enabled; no story or profile state was injected.

## Observed media behavior

Passive observation recorded media properties/events without changing playback. With the global sound control showing **Turn sound on** (sound off), the current page narration element had `volume: 0`, `muted: false`. The packaged page MP3 loaded and emitted playback events. Pause on page 7 produced a `pause` event at `currentTime=12.681802` of `duration=14.32`, with `paused=true` and `volume=0`.

With **Auto-turn pages after narration** enabled, a normal Next page action started the next page clip while the global sound setting remained off (`volume=0`, `muted=false`). This explains the prior 0601 observation of later clips continuing after mute: the media timeline can continue, but the audio is silent. Auto-turn itself is expected reader behavior. No claim about what a person would hear is made.

## Layout and limits

At 1280×800 and 390×844, the reader remained usable with no horizontal overflow or broken images in the captured screens. Screenshots:

- [Desktop reader](./storybook-1280.png)
- [Mobile reader](./storybook-390.png)

The dedicated QA CLI session had closed before a final parent-world return could be rechecked. The existing Chrome profile shown by the browser inventory contains unrelated user tabs, so it was left untouched. Parent navigation was verified in the earlier 0601 healthcheck; this follow-up adds only mute/auto-turn clarification and Pause media-state evidence.

This bounded sample does not assess all books, every page transition, or listening quality.
