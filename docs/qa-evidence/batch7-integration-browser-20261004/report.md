# Batch 7 integration browser review — 2026-10-04

## Candidate and method

- Frozen local origin: `http://127.0.0.1:5372`
- Runtime source: `c4db1d4b3e469bf71409ec7d859a05a2c7fa9301`
- Builder evidence commit: `fd7de0ab6e9c7f5b3c07f2d137468f87ab6090e8`
- Candidate identity: [identity.json](../batch7-integration-20261004/identity.json)
- Viewports: desktop 1280×800 and mobile 390×844, in separate fresh Playwright contexts.
- At `about:blank`, before the first app navigation, installed and verified `/api/voice` and `/api/story` route guards returning 403. The guards remained active after navigation and reload. No API requests escaped the guards. The game-level Listen controls were not activated. No console messages, errors, or warnings were recorded in either context.
- Direct HTTP SHA-256 checks matched the candidate manifest for `index.html`, the main JS/CSS, shared web chunk, Solar System chunk, and Count the Stars chunk. All browser-requested assets returned 200. No audio-file request appeared in the static request list; this is not playback or listening evidence.

## Findings

### Memory Match (Amari)

At both viewports, the ordinary home → Thinking & Play → Memory Match path opened the 10-level Amari quest. Level 1, Forest Friends, showed the strategy tip and eight face-down cards (four pairs). I completed the board through normal card taps: four pairs were found, the held result awarded three stars, and the “Next level: Ocean Splash” action appeared. Selecting it showed Level 2, the changed Ocean Splash tip, sixteen cards (eight pairs), and later levels still locked. The 1/10 sticker progress persisted on the level screen. At both widths the next-level view was unobstructed by the daily tracker; the visible tip, board and controls remained in the viewport with no horizontal page overflow.

Evidence: [desktop completion](screenshots/memory-board-complete-desktop.png), [desktop next level](screenshots/memory-next-level-desktop.png), [mobile start](screenshots/memory-board-start-mobile.png), [mobile completion](screenshots/memory-board-complete-mobile.png), [mobile next level](screenshots/memory-next-level-mobile.png).

### Solar System (Amari)

At desktop and mobile, Explore & Languages → Solar System opened the ordinary Earth mission. On mobile, I selected the visible Discovery 6, tried “Blue paint” and received retry feedback, then selected “Its oceans” and got the held “Correct — mission complete!” state. Passport totals advanced to 1/54 discoveries and 1/9 challenges. After reload, those totals persisted and the already-earned challenge was marked as saved; the correct answer buttons were disabled. The visible header control returned directly from `/play/solar` to `#/world/explore` at both sizes. On mobile this was rechecked after reload; no leave dialog appeared. The earlier apparent return to the player picker came from a long, interrupted command sequence and is withdrawn as a defect observation. Root independently repeated a delayed-confirmation route through the leave dialog and also returned to Explore & Languages.

Earth Discovery 6 rendered: “Earth acts like a giant magnet. Its invisible magnetic field turns many tiny bits from the Sun away from Earth. The space around Earth that the field controls is called the magnetosphere.” This review records the actual rendered copy; it does not assess its teaching quality, which has a separate B7 candidate review.

Evidence: [desktop Earth](screenshots/solar-earth-before-discovery-desktop.png), [desktop held result](screenshots/solar-held-correct-desktop.png), [mobile Earth](screenshots/solar-earth-mobile-before.png), [mobile held result](screenshots/solar-held-correct-mobile.png). Mobile reload preserved the passport counts; desktop showed the previously saved 1/54 and 1/9 on re-entry.

### Askia legacy Memory and profile progress

Using the visible player picker, Askia’s home showed 0 stars while Amari’s home showed 4 stars after the ordinary Memory and Solar play in that profile. Askia’s “Play Memory Match” opened the legacy five-board route. Board 1, “Meet the Friends,” displayed six face-down cards (three pairs); only Board 1 was enabled. This remained the Askia flow at both 1280×800 and 390×844. Amari’s completed Memory route remained the separate ten-level quest with four pairs at Level 1 and eight at Level 2. The visible progress counters remained distinct across the ordinary profile switch.

Evidence: [Askia legacy desktop](screenshots/askia-memory-legacy-desktop.png) and [mobile](screenshots/askia-memory-legacy-mobile.png).

### Batch 3 entry and route preservation

From Amari’s Maths Missions, the visible Count the Stars card opened `#/play/counting`. Its Star Garden map showed Starter (six rounds, count 1–5) available, Growing (six rounds, count 1–10) and Challenge (six rounds, count 1–20) locked, plus the Constellation book control. This was an entry-route check only; no Count the Stars round was completed in this integration delta.

Evidence: [Count the Stars entry map](screenshots/count-stars-entry-mobile.png).

## Limits and disposition

The bounded B7 integration UI checks passed at both requested widths: Memory’s changed Amari chapter transition is reachable, the old Askia Memory route and progress remain separate, Solar discoveries/challenges persist and return to the correct parent, and the B3 Count the Stars entry remains available. This is not a full game regression matrix, formal 4.5 score, production release acceptance, or human audio-quality result. The source-bound consolidated inventory reports 183 Memory phrases (2 present, 181 missing) and 127 Solar phrases (111 present, 16 missing): 310 total with 113 present and 197 missing. “Present” reflects manifest/file readiness only; no clip is claimed as decoded, played, or heard here. See the [consolidated narration inventory](../consolidated-narration-inventory-20261004/report.md). The separate B7 copy/teaching review at origin `http://127.0.0.1:5369` (runtime SHA `b6976948cf61147491e3658a5ce2e249a91bca09`) is outside this report.
