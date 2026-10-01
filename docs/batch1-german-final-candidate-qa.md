# German Garage Level 1 candidate QA

## Candidate and scope

- Candidate source SHA: `94d83ed3547e37cb30dd88abaa059a73366bb983`
- Browser URL: `http://127.0.0.1:5176/#/play/german`
- Served assets: `index-sEAfJotI.js` and `index-gL0RBHbW.css` (both HTTP 200).
- Browser session: isolated Playwright session `luna-german-final`.
- Tested only German Garage Level 1, using the existing Amari profile. No source code, provider endpoints, or custom-story data were changed.

## Observed pass evidence

- Completed a desktop Level 1 run across alternating paint and garage scenes. Correct answers were Weiß/white, Braun/brown, Blau/blue, Rot/red, and Lila/purple. The five German colour words were distinct.
- Deliberately chose red for the first Weiß question. The app stayed on round 1, showed gentle retry copy, and replayed `/audio/de/weiss.mp3` (HTTP 200). Choosing white then accepted and advanced only after the Next word action.
- Finish level showed 3/3 stars, `4 of 5 right first time`, and a new sticker. Back to learning world worked. After reload, Amari’s 11-star total remained visible and German Garage progress persisted.
- Re-entered Level 1 after reload. The first target was Orange, which had not been completed in the preceding run.
- Completed a fresh five-answer run at 390 × 844. Answers shown were Orange, Schwarz, Rosa, Grün, then Weiß. Finish level showed 3/3 stars and `5 of 5 right first time`.
- At 390px width, `document.documentElement.scrollWidth` and `document.body.scrollWidth` were both 390px. No horizontal overflow. The gameplay viewport screenshot is `.playwright-cli/page-2026-10-01T01-03-27-455Z.png`.
- At 1280px width, document and body widths both equalled 1280px. Browser console reported zero errors and zero warnings. Observed game images and German audio requests returned HTTP 200.

## Blocking failure on this candidate

Reloaded/repeated play exposed premature colour repetition. Across the completed answers, the app had seen nine distinct words: Weiß, Braun, Blau, Rot, Lila, Orange, Schwarz, Rosa, and Grün. Gelb had not appeared. On the next Level 1 entry the target was Weiß again, and the browser loaded `/audio/de/weiss.mp3`.

The persisted `amari_german_recent_targets_v1` colour history at that point contained only `Braun, Blau, Rot, Lila, Orange, Schwarz, Rosa, Grün`; the completed Weiß had fallen out while Gelb was still unseen. Thus the candidate fails the requirement to avoid completed colours until the vocabulary pool is exhausted. The mobile run completed that repeated Weiß answer, confirming the target was accepted as a normal Level 1 round.

This result applies only to SHA `94d83ed3547e37cb30dd88abaa059a73366bb983`. It is not final-candidate acceptance. A successor candidate needs a fresh full-cycle regression on desktop and 390px, including reload/re-entry, before acceptance.

## Additional visual issue

The deliberate wrong answer “red” painted the car red while the target remained Weiß and the UI asked the learner to try again. The retry message and audio were correct, but the false paint state made the illustration conflict with the question. This run did not change source; root owns any candidate correction and retest.

## Successor candidate re-test

- Candidate source SHA: `65e3cd6b37f9fecc52ef49e350bc05e0a43abddc`
- Browser URL: `http://127.0.0.1:5179/#/play/german`
- Served assets: `index-DrDDa7L2.js` and `index-BjKMFMwR.css` (HTTP 200).
- Playwright sessions: isolated desktop `luna-german-successor` and mobile `luna-german-successor-mobile`.

**Desktop, 1280px wide:** completed Level 1, chose Replay level, and completed all ten colour words without a repeat. First run: Rot, Schwarz, Braun, Rosa, Lila. Replay: Grün, Gelb, Blau, Weiß, Orange. After the tenth word, Finish level showed 3/3 stars and `5 of 5 right first time` on the clean replay. A deliberate wrong yellow answer on the initial Rot question left the car white, showed retry feedback, and replayed the Rot audio. The correct red choice then painted the car Rot. The answer stayed locked with Next word visible until advanced. All ten German audio files requested during the cycle returned HTTP 200.

**Mobile, 390 × 844:** completed Level 1 and Replay level for a second five-word run. First run: Rot, Lila, Grün, Gelb, Weiß. Replay: Schwarz, Orange, Blau, Braun, Rosa. These are all ten distinct colour words; no previous answer repeated before the pool was exhausted. The result showed 3/3 stars and `5 of 5 right first time`. Document and body scroll widths remained 390px throughout, with no horizontal overflow. Both scene and car images decoded successfully; audio and static asset requests returned HTTP 200. The browser console reported zero errors and zero warnings.

Reloaded each viewport after completing the ten-word cycle, reselected Amari, returned through German Garage, and re-entered Level 1. Both profiles retained 22 stars. The first target after full vocabulary exhaustion was Rot on both viewports, which is expected after all ten colours have been completed. Back to learning world worked in the desktop run.

**Outcome:** the successor candidate passes this German Level 1 desktop/mobile acceptance. The earlier SHA `94d83ed` repeat-before-exhaustion failure remains documented above as a superseded candidate result; it was not observed on SHA `65e3cd6`.
