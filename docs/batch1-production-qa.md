# Batch 1 production browser QA

Date: 1 October 2026. This is a bounded manual acceptance report for the rendered production site. It does not award a blanket 4.5/5 score.

## Release identity

- Canonical alias: https://dinospace-eight.vercel.app
- Immutable deployment: https://dinospace-knvfb7xse-memas-projects-23a0001d.vercel.app
- Vercel deployment: `dpl_3bjcdDvpeyPDYmhEzdydQHvVKTTU`
- Git SHA: `242a3f05e81fe1f9e9b2c5184659e1f232d9c4ee`
- Rendered JavaScript and CSS verified after a full reload: `assets/index-7loj9iFU.js`, `assets/index-rDO19aDV.css`
- Browser: Playwright Chromium, separate in-memory sessions. Letter Launch and German Garage were exercised at 390×844; Storybook at 1280×720. Curriculum has its own evidence report.

## Follow-up production check: Letter Launch Level 1

A later release was tested separately for the six-round correction; this does not replace the per-game evidence above.

- Canonical alias: https://dinospace-eight.vercel.app
- Immutable deployment: https://dinospace-8agznuylm-memas-projects-23a0001d.vercel.app
- Vercel deployment: `dpl_2EZ4WnumfgsGXC22WYWtVQq7Ak1X`
- Git SHA: `665bcd2d7edf231c70d9f64a8cf9661a8533ed3d`
- After full reload, rendered JavaScript `assets/index-BQjGggG1.js` and CSS `assets/index-rDO19aDV.css` returned HTTP 200.
- At 390×844, Level 1 showed six rounds and completed Octopus, Cat, Pig, Moon, Goat, and Net. Review showed 6/6 right first time and 3/3 stars. The sixth explanation remained visible through Finish level. A normal center click advanced from Next mission. Console: 0 errors, 0 warnings.
- The rendered diagnostic log recorded seed `3084514879`, question rounds 0–5, then `level_complete`. This is one production Level 1 run on the new release, not full multi-seed acceptance.

## Follow-up production check: Letter Launch repeat runs

On SHA `665bcd2d7edf231c70d9f64a8cf9661a8533ed3d`, I completed six-round Level 1 three times at 390×844 and three times at 1280×720, using Replay level between runs. Each run reached the normal Finish/review screen. At least one wrong answer per run gave the same prompt with sound-specific retry guidance; after the correct choice, the game showed the answer explanation before Next mission. Examples included Apple, Kite, Dog, Top, Moon, Pig, Cat, and Net. This closes the six-round Level 1 three-run-per-viewport check on this release only; Levels 2–4 were not replayed three times per viewport, and German has not had three seeded runs per viewport.

## Follow-up production check: Storybook mobile and tap targets

After a full reload of the next production release, I verified rendered JS `assets/index-B_ynxaXR.js` and CSS `assets/index-d000j113.css` both returned HTTP 200. This release is SHA `3e97df50a9e035023821065dee4c3371cebaf96f`, deployment `dpl_CZVgq9aXeCXnKKjHHbBnHLN9b7Cj`, immutable URL https://dinospace-bxg9hmbpm-memas-projects-23a0001d.vercel.app, on the canonical alias https://dinospace-eight.vercel.app.

- At 390×844, Storybook library controls, including Edit children, Characters & series, category tabs, favourite buttons, backup/restore, and New story series controls, measured at least 48 px high. Document `scrollWidth` was 390 px.
- The Edit children dialog used the full 390×844 viewport. Its close button, name field, age select, and Save changes action were 48 px high; Add child and Save profiles were 72 px high. The Characters & series dialog also fit the full viewport. Its close button, series name and style controls were 48 px high; character text areas were 68–88 px; Save series and Cancel were 52 px. The story creator had a 124 px textarea and 48 px selects; its action buttons were 52 px high. No dialog caused horizontal document overflow. I did not submit a new story or claim generation.
- After this full reload, I read all ten pages of *Luna and the Whispering Forest* and *Nia’s Great River Journey* at 390×844, then completed each book’s three shuffled comprehension questions using wrong answer → clue/retry → right answer → explanation. Nia’s session showed the in-app 30-minute break prompt; I chose its visible “5 More Minutes” action and completed the flow.
- *Rex and the Missing Moon Map* had already completed the same ten-page mobile reading and all-three-question flow in the earlier production session. The full desktop paths for all three books were completed on SHA `242a3f05…` as recorded below. The latest release adds Storybook sizing/layout evidence; I do not treat the earlier desktop runs as if they were rerun on `3e97df5`.
- The latest browser console had 0 errors and 0 warnings. On the latest release, the three shipped story manifests, covers, page illustrations, and narration assets returned successful HTTP 200 responses in the browser request log.

## Letter Launch

Production profile, 390×844. I completed each visible level through the game UI:

| Level | Run | Evidence |
|---|---|---|
| 1 — Hear the letter | 5/5 | Grapheme/sound choices included D, S, A, K, I; review showed completion. |
| 2 — Find the first sound | 6/6 | MAP, TIN, KID, DOG, PAT, CAT. Selecting T for MAP gave a sound-specific retry clue, then M was accepted. Review showed 5/6 right first time, a new sticker, and the next level unlock. |
| 3 — Match big and little letters | 7/7 | Matched lowercase t, i, m, k, c, a, g to capitals; correct feedback named the upper/lowercase pair. |
| 4 — Blend a word | 8/8 rounds completed | CAT, SAT, KID, TAP, PAT, PIN, DOG, TIN. The CAT round included a wrong first tile and a clue naming /c/. After the first correct tile the prompt advanced to “Good. Now choose the next sound.” Completion gave 3/3 stars and a new sticker. |

I replayed Level 4 twice. After the first run the stored recent keys were `[CAT,SAT,KID,TAP,PAT,PIN,DOG,TIN]`; replay began with unseen `MAP`. That complete replay used MAP, CAT, SAT, KID, TAP, PAT, PIN, DOG and stored `[MAP,CAT,SAT,KID,TAP,PAT,PIN,DOG]`. The next replay began with unseen `TIN`, then selected `MAP`, the oldest retained key. This demonstrates unseen-first selection and the oldest-key fallback for the finite pool; it is not a claim that all eight old words can be avoided in an eight-round run.

The initial batch release checked in this report (SHA `242a3f05…`) had five Level 1 rounds and did not meet the six-round gate. The later live check above confirms six rounds on SHA `665bcd2…`; this closes the Level 1 count gate for that one tested run.

## German Garage

Production session at 390×844; all three gated bays were completed:

- **Colours:** five rounds; one wrong choice for Blau produced a retry, followed by the correct answer and a word replay. Review: 3/3 stars and 4/5 right first time.
- **Vehicles and parts:** six varied targets, including Fahrrad, Lenkrad, Flugzeug, Sitz, Bus, Licht. Review: 3/3 stars, 6/6 right first time, new sticker, next level unlocked.
- **Directions:** seven rounds, including langsam, geradeaus, rechts, zurück, stopp, links. A wrong direction for langsam produced an error clue, and the correct choice then worked. Review: 3/3 stars and 6/7 right first time.

German audio and picture assets observed in the session returned HTTP 200. The sound task played German audio while answer buttons supplied English translations. Browser console reported zero errors and zero warnings. This is one completed three-bay progression in one mobile-size session, not three seeded runs per viewport.

## Storybook Studio

A separate fresh production browser profile at 1280×720 contained the three shipped titles: *Rex and the Missing Moon Map*, *Luna and the Whispering Forest*, and *Nia’s Great River Journey*.

- Read all ten story pages in each book using visible Next controls. Auto-turn was disabled during these checks so pages could be counted.
- Completed all three comprehension questions in each book. Each question was exercised with a wrong answer, the clue/retry path, then a correct answer and explanation. Question and option order varied.
- For Rex, completed page 10, reloaded the browser, reopened the book, and resumed at page 10 of 11.
- Imported a clearly labeled synthetic one-page QA fixture through the visible Restore a story backup control. It reused a bundled moon-map asset and explicitly described itself as a local QA fixture; the cover showed “A 1-page adventure.” This does not establish historical browser recovery or story generation.
- Exported the fixture with “Back up saved stories,” then restored that downloaded JSON in a separate fresh production browser profile. The new profile showed “Restored 1 story”; opening it resumed the saved second page and displayed the fixture text and image. Bundled story JSON/cover assets returned HTTP 200; the restored blob image/audio returned HTTP 200/206.
- A backup containing one incoming story with the same ID but a changed title showed “Restored 0 stories; kept 1 existing story”; the original fixture title and content remained in the list. A crafted file with the same ID duplicated inside its own backup was rejected as an invalid saved story. Malformed JSON showed “This file is not a readable story backup.” The existing three books and original fixture remained visible after both rejections.
- At 390×844 on SHA `242a3f0`, the story library had no horizontal overflow (`scrollWidth` 390), but visible filter/tab and per-story controls were below 48 px: Edit children and Characters & series were 32 px high; category tabs were 32 px; Add favourite buttons were 40×32 px; series New story buttons were 36 px high. The newer release’s follow-up above remeasured these controls at or above 48 px.
- The catalog remains at three books, short of the roadmap’s seven-book requirement. Three mobile reading paths and three desktop paths are evidenced across the releases specifically stated above. This does not establish three seeded desktop and three mobile runs for every Storybook path, and does not verify the four additional books or historical browser recovery.

## Curriculum Quest and related navigation

The independent Curriculum Quest browser report is [batch1-curriculum-live-qa.md](batch1-curriculum-live-qa.md). It records the final deployment identity, complete Geography Starter and Nature Lab Starter runs, partial Time Detectives Growing/Challenge runs, Time Teller entry/back, and the final 390 px navigation/tap-target measurements. It explicitly marks the broader three-desktop/three-mobile evidence gate incomplete.

## Diagnostic export

The root QA session exported [batch1-production-diagnostics.json](../output/playwright/batch1-production-diagnostics.json) after actual wrong/right geography gameplay. It contained five events (`start`, `question`, `answer_attempt`, `answer_correct`, `leave`) with game, round, seed, difficulty, timestamps, and first-attempt status. The JSON contained no player name, answer text, prompt text, or authored content. I inspected that existing export; I did not create it in my Letter session.

## Evidence limits and open gates

The checks above are actual production interactions on the stated SHAs, with scoped sessions. Letter Level 1 now has three complete runs at each viewport on SHA `665bcd2`; its higher levels and German bays do not have three seeded runs per viewport. Storybook has three shipped titles rather than seven; mobile reading and comprehension paths are complete for all three across the stated releases, and latest-release library controls meet the 48 px check. Four additional books and historical browser recovery remain unverified. Curriculum Time Detectives Growing and Challenge were partial in the independent report. Do not mark any of these games “verified 4.5” based on this evidence alone.

## Letter Launch chapter badge candidate verification

This follow-up is isolated from the production runs above. I used Playwright session `luna_german_seed_qa_static` with the immutable, uncommitted build at `http://127.0.0.1:5174` (`assets/index-e0VyN0Zq.js`, `assets/index-BEMHwIEo.css`). It is local candidate evidence, not canonical-release acceptance.

Using the visible home/profile/game controls, I completed all four Letter Launch stages for Amari: Letter sounds (6 questions), First sound explorer (6), Big and little letters (7), and Blend a word (8). The respective completion screens awarded Sound Scout, First Sound Finder, Letter Match Maker, and CVC Word Builder; the final screen and Sticker Shelf showed 4 of 4. Wrong answers showed retry guidance, and the visible target explanation helped resolve them. CVC sound tiles were selected in order; that stage completed 8/8 right first time. Earlier stages completed with lower first-try counts, which the review screen showed honestly.

I navigated back to the home world, reloaded the document, selected Amari again, and opened Stickers. Her 120 stars and all four earned chapter badges remained. I then switched through the visible player picker to Askia; Askia showed 0 stars and the separate sticker page showed only unearned star-tier stickers, with no Amari chapter collection. Returning to Amari, Letter Launch showed 4/4 in its intro. Clicking Play for Level 4 began Replay on a different visible CVC prompt (`SAT` after the completed run ended on `TIN`). Parent-world leave confirmation and Back to world worked.

This candidate check does not substitute for the roadmap’s seeded three-desktop/three-mobile total game gate, question/distractor balance, or event coverage. It does establish the four chapter-specific rewards, visible completion/replay, reload persistence, and profile separation on this local build. Screenshot of the Amari Sticker Shelf with 4/4 badges: [page-2026-10-01T00-41-57-520Z.png](../.playwright-cli/page-2026-10-01T00-41-57-520Z.png). Final replay entry: [page-2026-10-01T00-44-16-641Z.yml](../.playwright-cli/page-2026-10-01T00-44-16-641Z.yml).

## Local-only Letter Launch follow-up (not production evidence)

After the production pass, the current uncommitted local candidate at `http://localhost:5173` was reloaded and exercised through the visible Level 1 UI. The updated selector said “6 to finish”; the run presented six answerable prompts (Kite, Goat, Moon, Net, Cat, Apple) and displayed 1/6 through 6/6. A wrong C on Goat produced retry guidance without advancing the question; “Hear the clue again” left the 2/6 prompt and K/M options unchanged. The sixth correct explanation (“Apple starts with the a sound”) stayed visible with Finish level. Review showed “3 of 6 right first time,” a new sticker, and Next level. The center of Next mission worked with normal Playwright clicks after the decorative rocket stopped intercepting pointer events. Console errors: 0. This is historical local-candidate evidence only; the later production Level 1 follow-up is recorded above.

## Local-only Storybook Studio check for Bo and Sami (not production evidence)

On 1 October 2026, I used the separate Playwright browser session `codex_luna_batch1_local` against `http://127.0.0.1:5173`. This is local hot-reload evidence and does not establish which code is deployed. The live local library changed during the session from five to six bundled titles when *Mina’s Mountain Seed* appeared; the scoped deep-read below covers the requested new *Bo and the Busy Bee Garden* and *Sami and the Night-Light Parade* only.

- At 390×844, the Storybook reader and cover cards fit the viewport with no horizontal document overflow (`scrollWidth` 390). At 1280×720 the library also had no horizontal overflow (`scrollWidth` 1280). Current library buttons measured at least 48 px high at both widths. The mobile story header truncates long titles with an ellipsis (for example “Sami and the Nig…” and “Bo and the Busy…”), while the full title remains visible on the cover and in the accessible heading.
- I read all ten pages of Bo and Sami in the rendered reader. Page titles and text matched the two loaded local story manifests; each page had its corresponding numbered illustration and narration control. For both books, the cover said “A 10-page adventure” and the reader counted the cover separately as 1/11. Bo’s copy explains bees, nectar, pollen, fruit and staying on the path; Sami’s story keeps Dad close and follows the lantern/firefly/night-time sequence. I saw distinct story-specific cover art (Gran and Bo in an apple garden with blossoms and a bee; Sami and Dad carrying lanterns beside the grass at dusk). The age 5–6 wording was short and concrete.
- I completed all three shuffled comprehension questions for each book. For every question I chose a wrong option, read the clue and retry state, selected the correct option, read the explanation, and advanced with Next clue/Finish. Examples included Bo’s safety question (“Gran reminded Bo to leave bees alone”) and pollen/nectar questions; Sami’s firefly, evening-order and battery questions. Word help expanded for each story and showed the three plain-language definitions for blossom/nectar/pollen and twilight/shadow/parade.
- Bo’s saved reading position survived a full browser reload: after choosing Amari again and reopening Storybook Studio, Bo reopened at page 3 of 11 (story page 2, “Bea Arrives”), where it had been left. Completed Bo and Sami reopened on the cover with “Start Again.” After the local start-control hot reload, a completed Bo replay with auto-turn off went straight to page 1; an unread Mina smoke check did the same for Start Reading. With auto-turn on, Bo’s 2.4-second cover narration played and then advanced to page 1. Sami’s completed replay also returned to the cover and advanced to “Paper Lanterns” after the cover narration.
- At both 390×844 and 1280×720, Bedtime returned Luna, Nia and Sami; the Garden Discoveries series filter returned Bo; Favourites returned Bo and Sami while both had been temporarily starred. I removed those temporary favourites after the check. The results were usable at both widths, including desktop series/favourites filtering and mobile Bedtime/favourites filtering.
- Browser requests for both story manifests, covers, all ten page illustrations and cover/page narration succeeded: image/JSON assets returned HTTP 200 and audio returned HTTP 206 Partial Content. This confirms asset delivery; I did not independently listen to or transcribe the MP3 contents in this pass. The browser console had zero errors and zero warnings; its only info message was React’s development-tools suggestion.
- This pass did not verify backup import/export, offline reading, the final seven-title shelf, or historical browser recovery. The 42 fixed learning-audio clips are still pending generation and must be checked after they are available; the successful per-book narration MP3 responses above do not cover those clips. The six-title local staging shelf is also not production evidence.
