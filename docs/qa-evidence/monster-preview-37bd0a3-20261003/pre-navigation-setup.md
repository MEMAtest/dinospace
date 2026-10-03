# Preview QA setup

- Fresh isolated named Playwright contexts: `monster-preview-37bd-desktop-20261003` (1280×800) and `monster-preview-37bd-mobile-20261003` (390×844), opened at `about:blank`.
- Before first navigation in each context, installed page routes `**/api/voice**` and `**/api/story**` with abort handlers; set the viewport and a native media event observer. No provider/story request was allowed.
- The app constructs detached native `Audio` elements, which do not bubble media events to `document`. For subsequent visible replay/playback checks, used a pass-through `window.Audio` Proxy that calls the original browser constructor and only attaches listeners (`play`, `playing`, `pause`, `ended`, `loadeddata`, `error`, `volumechange`, `emptied`, `timeupdate`) to the returned native media object. It did not substitute audio or alter sources.
- Sound was left enabled by the visible control when checking packaged playback. No source, state, seed, answer, story or API content was injected. The two UI diagnostic downloads were triggered by the visible Download game log control and saved with Playwright `download.saveAs`.
