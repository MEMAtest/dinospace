# B4 on-demand media: independent browser check

## Identity and scope

- Frozen source: `17bec08db5ad32e2c46ccdffaf40a5a757243e3c`.
- Local build: `dist-on-demand-media-20261005-r5`; identity manifest SHA-256 `4afdf9b48b36bd1d8ff4cf020c28cc730be063441b7d039a32c7a046009a6d45` (11,054 files).
- Browser origin: `http://127.0.0.1:5400/` in the existing dedicated Chrome/Playwright tab. No new browser, tab, profile or context was created.
- Before the first app navigation, `/api/voice` and `/api/story` returned the installed 403 guards. The browser route list remained in place throughout. No provider or story request was made.
- This is a bounded local browser check of service-worker install, first-use media caching, offline replay and cancellation across the four B4 games. It does not establish human listening quality or production acceptance.

## Observations

The service worker controlled the app after initial load. Immediately after fresh installation, the shell cache contained 72 paths and the media cache was empty; neither MP3 nor `/storybooks/` entries were present. After ordinary visible use, `amari-discovery-media-v1` held 25 entries. Time Teller's visible “Hear hand lesson” action caused its packaged clip to load; with the browser offline, replay of that used clip still emitted `loadedmetadata`, `canplay`, `playing`, resolved `play()`, and `ended`. This confirms offline replay for an already-used clip only. It does not imply that unseen media is available offline.

| Game | Visible interaction | Observed media behavior |
|---|---|---|
| Time Teller | At desktop and mobile widths, used “Hear hand lesson”, then used Back and confirmed “Back to world”. | `/audio/en/67fb9b78-matilda.mp3` loaded and played; on the mobile offline replay, confirmed navigation paused it at about 0.013 s of 7.384 s before returning to Maths. At desktop, `/audio/en/1ea0e4b5-matilda.mp3` was paused at about 0.023 s of 1.672 s before leaving. |
| Addition Adventure | At 390×844, prompt showed 1 apple plus 8 apples; selected visible answer 9 and saw “1 apple and 8 apples make 9 altogether.” Then used Hear question followed by Next question. | Local clips observed included `26b33fc6`, `8bc474ca`, and `158f1ea5` (Matilda voice). Next interrupted the current clip at about 0.075 s of 1.068 s and the next prompt began. |
| Subtraction Station | At 390×844, prompt showed 9 apples take away 9; selected visible answer 0 and saw “Start with 9. Take 9 away. 0 remain.” Then used Hear question and confirmed parent Back. | Local clips observed included `d1cddbe2`, `8294f4ee`, and `d8a2f3bc`. Parent navigation paused `d8a2f3bc` at about 0.079 s of 1.393 s before returning to Maths. |
| Number Line Jump | At 390×844, used one visible “Hop forward →” control for “Start at 0. Hop 1 forward. Where do you land?” The held result showed “0 + 1 = 1. The frog moved 1 hop and landed on 1.” Then used Hear mission and Next mission. | Local clips observed included `6f6f60e5`, `0dec0ecd`, and `b2c66ab4`. Next paused the playing clip at about 0.034 s of 1.022 s and began the next mission prompt. |

The browser request log contained local app assets and same-origin `/audio/en/*.mp3` range requests (206 responses), with no `/api/voice` or `/api/story` request. The current browser console had zero errors and zero warnings. These checks demonstrate runtime loading/playback events and interruption behavior; they do not judge pronunciation, pacing, suitability, or what a person hears.

## Limits

- The browser samples were bounded and do not replace the retained full gameplay matrices.
- No clip matching the separately supplied corrected-47 grammar set was naturally encountered in these samples. This report makes no claim about that subset.
- The offline check covered only media already fetched during online use.
- No production alias, child data, storage seeding, hidden answer access, paid endpoint or human listening was involved.

## Evidence

- Frozen source/build identity: adjacent [`identity.json`](../identity.json).
- Screenshots: [`Time Teller offline replay`](screenshots/time-teller-offline-mobile.png), [`Addition held answer`](screenshots/addition-held-correct-mobile.png), [`Subtraction held answer`](screenshots/subtraction-held-correct-mobile.png), [`Number Line held answer`](screenshots/number-line-held-correct-mobile.png).
- The final browser tab was left open at Number Line Jump, 390×844, online and sound muted.
