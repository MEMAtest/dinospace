# Monster Math canonical: bounded independent UI check

Date: 2026-10-04

## Canonical identity and scope

- Canonical URL: <https://dinospace-eight.vercel.app>
- Promoted deployment: `dpl_J3KZBY4qUa8CvBSGzKy3KmWmyiPB` (READY)
- Audited source/archive SHA: `484addf2e76be849845f508bdc9fc5e1325b51b7`
- Identity: [`monster-header-canonical-identity-20261004.json`](../monster-header-canonical-identity-20261004.json). I independently fetched all seven listed files from the canonical URL; each returned HTTP 200 and matched the expected SHA-256.
- The preceding immutable candidate report is retained at [`monster-header-production-candidate-20261004/report.md`](../monster-header-production-candidate-20261004/report.md). This report adds fresh canonical browser evidence; it does not claim full 4.5 acceptance or human audio review.

## Guarded browser setup

I used a fresh Playwright CLI session opened to `about:blank`, added `**/api/voice**` and `**/api/story**` routes with status 204, confirmed both routes in the route list, and only then navigated to the canonical app. I selected Amari through the visible profile picker and muted sound through the visible sound control. No provider API requests were present in the non-static request list. I did not inject storage, progress, answers, seed values, or hidden content.

A hard reload reset the visible sound preference to on. I reproduced this twice: with the control showing **Turn sound on** (muted), reload changed it to **Turn sound off** (sound enabled). I noticed the first reset after reload and muted again before later controls. The 204 API guards remained registered over reloads. The browser loaded packaged `audio/en/*.mp3` assets (HTTP 200); I did not assess whether audio was audible or listen for quality. No audio acceptance is claimed.

## Normal unlocks and saved rewards

At 1200×844, I completed Episode 1, **Count to 10**, through visible counting pictures and answers, 6/6 correct without a mistake or clue, for 3/3 stars. I used the ordinary **Next episode** control to start Episode 2, **Add and Take Away**, and completed its six visible sums/subtractions using the rendered ten-frame prompts, 6/6 without a mistake or clue, for 3/3 stars. Episode 3, **Monster Story Problems**, unlocked through that progression.

After a reload, the episode map still showed the completed Episode 1 and Episode 2 badges and 3-star rewards; Episode 3 remained available and unearned. This test did not complete the Challenge episode, so no Challenge badge is claimed. The saved map screenshot is [here](screenshots/sound-on-after-reload.png).

## Active episode titles and layout

I checked the full active titles at 1280×800 and 390×844 by replaying the normally unlocked episodes and starting Challenge from the map:

- Episode 1 · Count to 10
- Episode 2 · Add and Take Away
- Episode 3 · Monster Story Problems

Each title rendered without clipping or ellipsis in the screenshots. For Episode 3, the header text measured 743/743 CSS pixels at desktop and 335/335 at mobile. The full document scroll width measured 1280 at a 1280px viewport and 375 at a 390px viewport, so neither screen had horizontal overflow. At desktop, Back and sound controls measured 48×48px, Hear again 247×48px, answer buttons 172×64px, and clue control 357×48px. At mobile, Back and sound controls measured 48×48px, Hear again 247×48px, answer buttons 154×64px, and Try the jumps 319×48px.

Screenshots: [desktop Episode 1](screenshots/desktop-starter-header.png), [desktop Episode 2](screenshots/desktop-growing-header.png), [desktop Episode 3](screenshots/desktop-story-header.png), [mobile Episode 1](screenshots/mobile-starter-header.png), [mobile Episode 2](screenshots/mobile-growing-header.png), and [mobile Episode 3](screenshots/mobile-story-header.png).

## Wrong answer, clue, reset, correct answer, and Next

I exercised these controls on a visible first Challenge question at both desktop and mobile sizes. The queues were ordinary app selections and differed between runs.

At 1200×844, the visible question was “Nia has 12 gems. Nia finds 4 more.” The rendered model said start at 12 and jump forward 4. Answer 15 produced “Not yet. Try the clue, then count the model again.” **Try the jumps** showed the visible clue “Look for the words ‘more’ and ‘now.’ Put both groups together.” The clue control changed to disabled **Clue shown**. I made a visible forward jump, used **Start again**, and confirmed the marker returned to 12 with 4 jumps to go. I then completed the four displayed jumps, submitted 16, and saw the correct explanation held on screen with **Next question** enabled.

At 390×844, the visible question was “Bo has 7 balloons. Bo finds 3 more.” Answer 9 produced the same wrong-answer feedback; the one-use clue displayed and disabled. After one visible jump, **Start again** returned the marker to 7 with 3 jumps to go. Three visible jumps reached 10; submitting 10 showed the answer explanation and **Next question**. I clicked Next, and the app advanced to Question 2/6. A later bounded mobile replay again showed the correct fact held with Next available.

A separate mobile replay of “Kai has 3 oranges. Kai finds 7 more” also used the visible model and answer 10, then advanced from Question 1/6 to Question 2/6 after clicking Next. See [mobile held correct fact](screenshots/mobile-held-correct-fact.png) and [mobile next question](screenshots/mobile-next-question.png).

## Parent navigation, reload, and runtime checks

On mobile, Back from an active episode opened **Leave the game?**. Selecting **Back to world** returned to **Maths Missions**. The episode map retained Episode 1 and Episode 2 rewards after re-entering the game and after a full reload. Evidence of the active-game confirmation is [here](screenshots/mobile-leave-confirmation.png).

The guarded Playwright browser reported zero console messages, errors, or warnings. Non-static requests were empty. Static resources returned HTTP 200 in the browser; packaged audio files were fetched, but there was no human listening test. The guard routes remained listed after reload. The canonical identity confirms all seven runtime/index files match the frozen archive.

## Result and limits

The canonical deployment passed this bounded independent check of all active episode titles at 1280×800 and 390×844, ordinary progression and saved Starter/Growing rewards, Challenge wrong/clue/reset/correct-held behavior at desktop and mobile sizes, mobile Next advancement, and active-game Back confirmation. The two Starter/Growing episodes were fully completed at 1200×844; at 1280×800 and 390×844 the checks focused on active headers, with Challenge controls exercised at both desktop and mobile sizes. No exact `2 + 10` prompt was required or claimed. The reproducible sound-toggle reset is an observed product issue for root review; it does not change the bounded header/control findings. This report does not claim human audio quality, full narration acceptance, or complete 4.5 acceptance.

## Sound preference evidence

- [Muted state before reload](screenshots/muted-before-reload.png)
- [Sound enabled state after reload](screenshots/sound-on-after-reload.png)
