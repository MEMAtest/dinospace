# Independent Astronaut Academy chapter-copy review

Date: 2026-10-05
Reviewed source: `3dafee7b31302cb1a7ab41f731fa51a5e7fcd2e0`
Frozen build: `dist-astronaut-route-copy-20261005/`
Local origin: `http://127.0.0.1:5399/` (served from the frozen output, not the older integration `dist`)
Browser: existing Playwright `default` Chrome session only

## Result

The chapter-map copy is readable at both requested widths. At 1280×800, the three map buttons display **Space discoveries**, **Mission planning**, and **Review missions**; the first chapter’s full description is visible in one line. Each button measures 720×82 px. At 390×844, all three titles remain legible and the unlocked first chapter’s full description wraps naturally across three lines inside its 370 px-wide, 107 px-high button. The two locked chapters retain the clear prerequisite message “Finish the chapter before this one.” The page has no horizontal overflow at the mobile width (`scrollWidth` 390, viewport width 390).

The titles match the pool scope reviewed for this change: the Starter combines space science with simple tools, the Growing chapter mixes space science and engineering, and the Challenge is a review. The screenshot and visible-label check are limited to the mission map; this was not a gameplay, content-fact, audio, or progression retest.

## Identity and safety checks

The frozen build report records 5,879 files and manifest SHA-256 `0847dcf00509ff4a4186864f7cd45d4af6fc0da7b1723ad15cbf9c804c4065ca`. The served index, main JS, and CSS matched the frozen output exactly:

- `index.html`: `eb29b461b6e9309d66247a75550464d50cf529a238152cdebd9f3305e129119b`
- `assets/index-CUuCtS9W.js`: `472254f7fa18dc4e86bdabeee5143f1443d41a1b18b2c141f63ea57e2c7b64bd`
- `assets/index-Ccs6j6LF.css`: `2411e413823eb43b354026da853a4fae30867a13a409ce0daf59351037e8acbf`

The existing tab had persistent `/api/voice` and `/api/story` routes installed, each returning the QA 403 guard, before I navigated to the local frozen build. The visible sound control read “Turn sound on” throughout, so sound remained off. The browser request filter showed no `/api/voice` or `/api/story` requests. The 13 listed static requests all returned HTTP 200, including the astronaut art, stylesheet, script, and app icons. Browser console reported zero errors and zero warnings.

Screenshots: [desktop 1280×800](independent-review/desktop-1280x800.png), [mobile 390×844](independent-review/mobile-390x844.png).

## Limits

This is a local browser check of the chapter map in the exact frozen build. It does not establish production deployment, narration readiness or quality, human listening, or overall game acceptance. No source, audio, or build files were changed for this review.
