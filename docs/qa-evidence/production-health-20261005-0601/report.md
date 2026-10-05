# Canonical production healthcheck: Curriculum Quest and Storybook Studio

**Bounded result:** the sampled Curriculum Quest answer held its fact until an explicit Next question action, and confirmed Back returned to its parent Explore & Languages world. The curated Storybook reader opened a saved book, loaded its illustration and narration assets, exposed page controls, and returned to Read & Write through its confirmed parent action. No console errors/warnings, broken images, or horizontal overflow appeared at 1280×800 or 390×844.

This is a small production healthcheck, not full game, audio quality, or 26-game acceptance.

## Identity and guard boundary

- Canonical URL: `https://dinospace-eight.vercel.app/`
- Deployment: `dpl_5cKFB6U489CLoEPucaY9pDarcHsp`
- Runtime source: `1accc99e89be303678ead99def6a3095ab1cb886`
- Runtime archive: `22d805b67ced8b36f45d0f5c547bfe67c5dded88`
- The existing [canonical identity](../count-scatter-strategy-5396/canonical-identity.json) records HTTP 200 and matching SHA-256 for the canonical index, JS, CSS, and Count chunk.
- Reused the existing default Chrome tab only. Before navigation and again afterward, `/api/voice` and `/api/story` were routed to QA guards and returned 403. No provider calls, story creation, injected answers/progress, or real child data were used. The isolated synthetic Amari profile retained its earned state. Sound was left off.

## Curriculum Quest

Opened the existing Curriculum Quest from the home screen’s Recent section. At 1280×800, I started a visible Continents & Oceans round and answered “Find Africa on the map” by tapping the labelled Africa pin. The held result displayed: “Africa is between the Atlantic and Indian Oceans. Kenya and Egypt are in Africa.” The answer remained held until I tapped **Next question**, which displayed the next normal question. At 390×844, the held fact was fully visible in the fact card; the blue Next question button measured 156×48 and was reachable by ordinary scrolling. The page width remained 390px with no horizontal overflow. On both sizes, the round’s Hear controls were disabled while sound was off.

The map screen is long: 2,001px at desktop and 2,463px on mobile. After the normal **Back to learning world** action and confirmation, the app returned to **Explore & Languages**, the parent world from which the recent game opened.

## Storybook Studio

Opened the existing **Rex and the Missing Moon Map** story from the Storybook Studio library. The saved reader resumed at page 4 of 11. I used the visible page narration control once; `audio-page-04.mp3` loaded (11.84 seconds) and played. The reader then continued through subsequent page narration and illustrations, reaching the final story page; I did not select **Create a new story** or **Start story questions**. The page audio and illustration requests used the existing `/storybooks/rex-missing-moon-map/` assets and returned HTTP 200. This confirms browser playback mechanics only, not human listening quality.

At 390×844, the reader had no horizontal overflow and no broken image. The title is ellipsized in its narrow header (`Rex and the Missi…`) while the page title and body remain visible. At 1280×800 the full title and illustration fit. The header back, sound, and parent buttons are 48×48 on mobile. Normal **Back to learning world** plus confirmation returned to **Read & Write**.

One **Play narration** action advanced through later page clips. After using the visible Pause control and switching the global sound toggle off, later page narration still continued when moving to the next page. A follow-up passive media observation found the global mute sets the element's volume to `0` (`muted` remains `false`), so the continuation was silent; it matches the reader's auto-read behavior and is not an audible-playback defect. Browser media events show runtime playback state, not human listening quality.

## Evidence

- [Curriculum held fact and Next at 1280×800](./curriculum-held-1280.png)
- [Curriculum held fact and Next at 390×844](./curriculum-held-390.png)
- [Storybook final reader page at 1280×800](./storybook-final-1280.png)
- [Storybook final reader page at 390×844](./storybook-final-390.png)

Console inspection returned zero messages. At the inspected reader state, the page reported zero broken images. The observed routes and requests do not establish a full release or listening verdict.
