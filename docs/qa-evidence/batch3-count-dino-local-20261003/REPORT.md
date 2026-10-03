# Batch 3 Count the Stars and Dino Detective independent local QA

Date: 2026-10-03 (Europe/London)

## Candidate identity and scope

- Baseline tested: `http://127.0.0.1:5213`, source SHA `7c79f47154d97f877858bd3d5124c37cf23bb5e6`; served bundle hashes are recorded in [baseline identity](../batch3-reviewed-candidate-identity-20261003.json).
- Repair retested: `http://127.0.0.1:5215`, source SHA `569953595e89eabf628a5fdc6e2a43541e2b19f2`; served bundle hashes are recorded in [repair identity](../batch3-browser-repair-identity-20261003.json).
- Existing isolated Playwright profiles were used at 1280x800 and 390x844. On new app origins, `**/api/voice` and `**/api/story` were aborted before navigation. No provider calls, story generation, synthetic child data, progress injection, localStorage copying, or hidden unlock routes were used.
- No source code or deployed system was changed. Root's full 198-test, lint, and build baseline passed on the repair candidate.

## Count the Stars

On baseline 5213, I used the rendered UI to complete six rounds in Starter, Growing, and Challenge on both widths. I checked ordinary progression from Starter, the wrong-answer retry, one-use clue, held fact card and explicit Next, completion-only page/unlock, replay, collection shelf, keyboard controls, reload, and a sibling isolated browser profile. Wrong answers retained the same round/object queue. Completion advanced the page and unlocked the next band only at the end. The sticker shelf showed 3/3 earned after the ordinary band completions.

| Band | Desktop totals, six rounds | Mobile totals, six rounds | Progression/layout observation |
| --- | --- | --- | --- |
| Starter | 5, 4, 4, 3, 4, 3 | 2, 5, 3, 2, 3, 1 | Scattered layouts; counts remain approachable. |
| Growing | 10, 9, 7, 9, 3, 7 | 10, 8, 1, 8, 4, 9 | More organized row/array layouts and larger bounds, but occasional small totals still occur. |
| Challenge | 7, 18, 17, 17, 4, 14 | 19, 11, 15, 13, 19, 13 | Grouped two-array layouts were visible; the sampled totals skewed materially above Starter. |

Root’s subsequent source audit found reproducible randomized queues with weak count progression: Growing seed 36 yielded `[3,2,2,3,2,3]`, and Challenge seed 2577 yielded `[2,5,3,1,2,3]`. The bands differ in geometry, but the generator does not yet guarantee higher-count quotas. Treat the observations below as UI/layout evidence; the next frozen generator repair needs a new ordinary UI replay.

Repeated ordinary Growing replay used a different seed and question/count queue, confirmed in the UI-downloaded event diagnostic. Across the tested runs, motifs, object arrangement, bounds and groups varied. Count controls were 56x56 px (objects) and 64x64 px (answers); no object overlaps or horizontal overflow were seen. At 390 px, the baseline answer panel could sit below the fold after a tap. On 5215, the automatic reveal was observed in its immediate scrolling transition and after settling 1.2 seconds: the full 64 px answer control fit within the 844 px viewport at scrollY 130, with no horizontal overflow. The before/after captures are retained.

Evidence: [Starter mobile](count-stargarden-start-mobile.png), [Growing desktop](count-growing-start-desktop.png), [Challenge desktop](count-challenge-start-desktop.png), [mobile repair settled answer](count-repair-answer-after-scroll-mobile.png), [mobile repair completion](count-repair-completion-mobile.png), [shelf](count-sticker-shelf-desktop.png). UI-exported diagnostics from baseline and repair are in [downloads](downloads/).

## Dino Detective

### Baseline failure and repair

On a fresh profile at 5213, opening Dino Detective's Explore action crashed into a blank screen. The browser console reported `TypeError: Cannot read properties of undefined (reading 'length')` in the served `index-gociiuen.js`. The original blank-screen capture and console log are preserved as [failure evidence](dino-crash-blank-desktop.png) and [console text](dino-crash-console.log). On 5215, a fresh profile opened the map and first search scene normally with zero browser-console errors, confirming the reproduced crash was repaired.

### Full world progression and rewards

I completed all 12 worlds sequentially on both 1280x800 and fresh 390x844 UI profiles: four Starter, four Growing, four Challenge. Each world had five numbered hiding places; the featured species was named on each search card, and a distinct world fact appeared on the held fact card. I followed the normal map unlock order; each sticker appeared only after `Finish world` on find five. The mobile map showed all twelve Complete and `World stickers (12/12)`; all twelve named Finder stickers displayed Earned in its sticker book. Desktop independently reached the same 12/12 state.

For variety, the desktop run included visible-trail searches, a deliberate wrong spot and retry, one-use clue, repeated taps that did not advance the round, keyboard Enter, a Back-to-learning-world leave guard, Keep playing preserving the active search/round, then confirmed leave returning to the exact Explore & Languages parent. A River Run started before leaving earned no premature badge; replaying the world through the normal map later earned its badge only at completion. On mobile, I followed visible `Show a clue` and the revealed target button for every find, and confirmed all five finds and world completion on each world. After the first replay, an additional replay was opened only to capture Jungle Jive’s mobile start screenshot and exited through the normal game Back control before a find; the earned world stickers were unaffected. Thus mobile confirms complete band/reward progression but was hint-assisted throughout.

The first mobile replay of Jungle Jive completed normally without duplicate sticker; the diagnostic records a new run seed (`2226806775`) compared with the first run (`1078686247`). Its visible placement sequence was spots 3, 5, 4, 2, 1. The map and sticker book still showed 12/12. After a reload and normal UI navigation back into Dino Detective, all twelve Complete states remained present. Screenshots document first hint/fact and completion screens and start scenes for all 12 mobile worlds; first search-area buttons measured 56x56 px for Starter/Challenge and 62x62 px for Growing, all within the viewport with no overlaps. Desktop search buttons were at least 64x64 px. Scenes visibly varied in themed colour/art and motif; the species and fact card content varied with each world.

The UI diagnostic download from the mobile profile is retained as [dino-mobile-game-log-5215.json](downloads/dino-mobile-game-log-5215.json). It contains 300 bounded events across twelve sequential worlds and one replay; event keys contain game/event/time/level/round/seed/difficulty/hints/firstAttempt only, without names or story text. The log records all 13 starts and completions, and the distinct replay seed. Packaged rendered assets were served locally (including Dino park, character sticker sheets, and title graphic returned 200); no console errors were reported.

## Evidence inventory and limits

- The 5213 Count diagnostic downloads are `downloads/amari-game-diagnostics.json` and `downloads/amari-game-diagnostics-final.json`.
- Dino baseline crash evidence: `dino-crash-blank-desktop.png`, `dino-crash-console.log`.
- Count repair mobile reveal: `count-repair-answer-before-click-mobile.png`, `count-repair-answer-after-scroll-mobile.png`.
- Mobile Dino evidence follows `dino-mobile-{world}-{start,hint,fact,final-fact,completion}.png`; the mobile Ancient Shores start capture also caught the prior world's transient completion toast while the test advanced rapidly. Normal-play persistence of that toast was not asserted.
- The browser's development speech path and visual-only Dino Read clue are not packaged narration acceptance. This report is local independent UI evidence only; it does not certify the 4.5 audio requirement or production readiness.
