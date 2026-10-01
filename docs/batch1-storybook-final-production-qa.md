# Storybook Studio final production QA

Date: 1 October 2026. This is a bounded manual browser report for the canonical production deployment. The comprehension-seed implementation is excluded from my scoring because I built it; an independent reviewer owns that acceptance.

## Release identity and browser

- Canonical URL: https://dinospace-eight.vercel.app
- Git SHA reported by the release owner: `86e3ecf08d658591c51dc1e394ba7ff32e53fbb1`
- Vercel deployment: `dpl_2azaKnhES6wXXjwPsHxhmwsnu9iQ`
- Full fresh load rendered `assets/index-Bjt4H7n4.js` and `assets/index-BjKMFMwR.css`.
- Playwright Chromium session: `luna-storybook-prod-final`, using an isolated context and explicit `serviceWorkers: "allow"` configuration.
- Full reads used the visible Storybook shelf, Start Reading/Next, Story Detective, answer and retry controls. No app state was injected; no custom story generation or paid calls were made.

## Complete title paths

I completed all seven bundled titles. Each showed “A 10-page adventure,” a cover plus ten story pages, and three comprehension questions. For every question I selected a wrong answer, read the clue/retry state, selected the correct answer, used the “Hear why the answer is right” control, and advanced with Next clue or Finish. Word help was opened for each book. The first page and later pages had story-specific image alt text; each page image rendered at 1600 px natural width and the matching narration element reached ready state with a finite duration.

| Viewport | Title | Read and comprehension path |
|---|---|---|
| 1280×720 desktop | Rex and the Missing Moon Map | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 1280×720 desktop | Bo and the Busy Bee Garden | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 1280×720 desktop | Mina’s Mountain Seed | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 390×844 mobile | Sami and the Night-Light Parade | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 390×844 mobile | Kai and the Lost Library Book | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 390×844 mobile | Luna and the Whispering Forest | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |
| 390×844 mobile | Nia’s Great River Journey | All 10 pages; all 3 questions through wrong → clue → correct → why → Next/Finish. |

The story copy and illustrations remained coherent across the full paths: Bo explains pollination and safe bee-watching; Mina follows seed care and patient growth; Sami’s evening sequence tracks the lantern, firefly, shadows and stars; Kai retraces a rainy-day route to return a library book; Nia’s river journey covers litter and clean water. Rex and Luna’s teamwork stories stayed consistent across page turns and their quiz clues. The seven covers also had distinct story-specific artwork visible in the shelf capture.

## Reading controls, resume and audio

- **Manual turn off:** On Bo, Mina, Sami, Kai, Luna, Nia, and the Rex replay, Auto-turn pages after narration was off; Start Reading/Start Again entered page 1 directly. I used the reader’s visible Next control for the page-by-page passes.
- **Automatic turn on:** On the completed Rex story, I enabled Auto-turn, clicked Start Again, and observed the 2.24-second cover narration followed by automatic entry to story page 1 with page narration playing.
- **Narration replay:** On Rex page 10, the visible Replay control started `audio-page-10.mp3` from the beginning; it was playing at currentTime 1.13 s in the check.
- **Saved position:** On Kai, I read through page 3 (“Three Stops”), reloaded the document, selected Amari again and reopened Kai. It resumed on page 3 of 11 with that page’s matching illustration. Completed books reopened on the cover with Start Again, as expected.
- **Word help:** Expanded on all seven books. The short definitions appeared beside terms from their respective stories (for example, blossom/nectar/pollen, alpine/sheltered/shoot, twilight/shadow/parade, retrace/sheltered/borrow, shallows/litter/ranger).

## Shelf, filters, layout and recovery controls

The shelf showed seven titles: Rex, Luna, Nia, Bo, Sami, Mina and Kai. I tested Bedtime (Luna, Nia, Sami), the Garden Discoveries series filter (Bo only), Favourites (Bo only after temporarily starring it), and the ages 5–6 filter. I removed the temporary favourite after checking it.

At 390×844, the shelf displayed all seven cards in a single column; document/body width was 390 px and no button measured below 48 px in either dimension. On the Storybook reader, document width was also 390 px with no overflow and no buttons below 48 px. At 1280×720, the seven cards used a three-column layout; document/body width was 1280 px and all controls were at least 48×48 px. Screenshots: [mobile shelf](../.playwright-cli/page-2026-10-01T01-54-41-762Z.png), [desktop shelf](../.playwright-cli/page-2026-10-01T01-54-52-380Z.png), and [mobile reader with word help](../.playwright-cli/page-2026-10-01T01-57-20-533Z.png).

A minor mobile presentation issue remains: the sticky reader header ellipsizes long book titles (for example, “Rex and the Missi…”). The full title appears on the cover and in the accessible heading; navigation remained clear and the layout did not overflow.

In this clean browser profile, Back up saved stories was disabled because no custom story records existed; Restore a story backup was available. The earlier fixture export/import/restore flow was verified on release SHA `242a3f05e81fe1f9e9b2c5184659e1f232d9c4ee`; the backup implementation is unchanged in this release. That older fixture evidence is not a new fixture round-trip on this release, and I did not import test data in this session.

## Service-worker offline acceptance

The service worker registered at `https://dinospace-eight.vercel.app/sw.js`, reached `activated`, and controlled the page. Cache storage contained `amari-discovery-v13`. After Storybook and its shipped media were available online, I set Playwright’s network offline and reloaded the document. The app shell and Amari profile picker loaded. I navigated through the UI to Storybook Studio and Kai, started the completed book again, and observed page 1’s 1600 px image and `audio-page-01.mp3` playing while `navigator.onLine === false`. This verifies a warmed v13-controlled production browser context; it is not a fresh-device or never-online-first-launch test.

## Asset and console results

All seven `book.json` manifests returned HTTP 200. The browser request log contained successful HTTP 200 image responses and HTTP 206 narration responses for all 11 unique images and 11 unique audio files per title (cover plus ten pages). Rex had several `ERR_ABORTED` requests during an initial rapid-navigation pass; I repeated it with each page image awaited, and the full set of unique Rex images and narration assets then had successful responses. No story asset remained missing in the completed run. Browser console: 0 errors, 0 warnings.

## Scoped ratings and remaining boundaries

- **Content and media: 4.5/5.** All seven delivered titles were read in the rendered UI, each with ten page illustrations and narration assets, plain word help and a three-step clue/explanation quiz. Page-by-page story, image alt, and quiz context stayed coherent in these paths. This is a bounded family-facing QA score, not an independent educational-content review.
- **Layout and controls: 4.5/5.** The seven-card shelf and reader fit both tested viewports, all observed controls met the 48 px target, and manual/automatic reading worked. The mobile sticky header’s long-title ellipsis is the small remaining presentation issue.
- This report does not accept the seeded-randomization implementation; independent review is pending. The clean-profile test did not re-run custom-story backup round-trip or prove recovery of historical browser data. The v13 offline proof was after online media access in this browser context. These results do not establish a blanket 4.5 rating for the overall product.

## Release 7d9d961 Storybook lifecycle delta

On 1 October 2026, I repeated a representative Storybook completion and diagnostics-export path on the newer canonical release, after a fresh browser load. The deployment owner identified SHA `7d9d96166f4bd4d2b283b761dcfbaae5dd3b0256` / `dpl_7guvWUZ3ocswiVGXcLbVrewzaEq8`; the rendered assets matched `assets/index-C0jdAtV8.js` and `assets/index-BH3dde_v.css`. Playwright session `luna-storybook-lifecycle-7d9d` selected Amari through the profile picker and used Kai’s visible shelf card and reader controls. This is a bounded release delta, not a repeat of the seven-title, viewport, or offline suite above.

- With automatic page turning off, Start Reading entered page 1 directly. Word help expanded. Back to storybooks followed by reopening Kai restored page 1. I then used Next through the cover and all ten story pages; the reader showed “Page 11 of 11” and the story-specific final illustration/heading before Story Detective.
- I answered the first shuffled question incorrectly, used its visible clue control and Try again, then selected the correct answer and used Hear why. I answered the other two questions correctly, used Hear why for each, and selected Finish. The library showed Kai as Completed. The diagnostic log records `level_complete` only after all three `comprehension_question_complete` events, followed by `comprehension_complete`.
- I backed out through the visible confirmation controls, opened Grown-ups, held Press and hold, expanded Game troubleshooting, and downloaded the log through Download game log. The preserved browser download is [storybook-lifecycle-7d9d-live-log.json](../.playwright-cli/storybook-lifecycle-7d9d-live-log.json). It contains 34 records from this isolated browser profile, including two starts (an earlier partial attempt and its resumed run), seeded page scenes, one wrong answer, clue/explanation hints, correct answers, one final `level_complete`, one `comprehension_complete`, and leave events. The quiz seed was `25238980`; this report does not judge seeded variation or seed choice because I implemented that change.
- The JSON has top-level `version` and `events`; observed event fields are limited to `at`, `event`, `firstAttempt`, `game`, `hintType`, `pageIndex`, `round`, and `seed`. A check for player names, title, and story-text fragments returned no matches. The browser console had zero errors and zero warnings.

This release delta supports the new seeded Storybook lifecycle and final-quiz completion timing in one actual production path. It does not replace independent acceptance of seed determinism, broader seven-title coverage, or the previously stated historical custom-story recovery boundary.

### Independent narration-replay event check on 7d9d961

The Storybook delta export above did not include a `replay` event. I ran a separate visible-control check on the same 7d9d961 release: selected Kai, started reading, used the page Replay narration button, advanced one page, and left through the confirmation dialog. The resulting Storybook records show a seeded `start`, seeded `scene` for the cover and each visited page, seeded `replay` on page 1, and seeded `leave` on page 2. The JSON keys are limited to `at`, `event`, `game`, `pageIndex`, `round`, and `seed`.

The unique UI export is [`output/playwright/batch1-storybook-replay-7d9-check.json`](../output/playwright/batch1-storybook-replay-7d9-check.json). It includes the prior German session events as well as this Storybook check; the Storybook-specific records are filtered by `game: storybooks`. It contains no story title, prompt, choice, answer, or player-name field. This confirms the replay handler on the current release without treating the earlier Storybook completion export as if it contained replay evidence.
