# Batch 6 narration and clue repair — independent UI delta

Date: 3 October 2026
Scope: Pattern Parade, Chess Explorers, Astronaut Academy, and Dino Hangman. Targeted desktop 1280×800 and mobile 390×844 visible-UI checks only; the prior full local game matrix remains the gameplay baseline.

## Candidate identity and safety

Tested the immutable frozen candidate at `http://127.0.0.1:5275`, source `3a0da1b09ccdf82bf93313ad962d0d327f799496`, per [candidate identity](../batch6-narration-repair-identity-20261003.json). I independently fetched the five files in its identity manifest. Each returned HTTP 200 and its SHA-256 matched: `sw.js`, main JS, SolarSystem JS, CSS, and web JS. No candidate files were changed.

Two named Playwright sessions began at `about:blank`. In each, blocking handlers for `**/api/voice**` and `**/api/story**` were installed before the first app `goto`. I selected Amari and entered games through ordinary visible navigation; chapter access followed the displayed map and previously earned profile progress. No child data, stored progress, seed, answer, hidden question/path data, or provider-generated content was injected. Sound remained off. Browser request summaries showed static requests only (29 mobile, 24 desktop; dynamic requests omitted by the CLI summary), and both console summaries reported zero messages, errors, or warnings. The CLI `route-list` does not enumerate handlers registered within `run-code`, so the exact pre-navigation route-install code is the guard evidence; I do not treat that command’s “No active routes” as contrary evidence.

## Results by game

### Pattern Parade

The 5259 desktop mechanics report retains a real AAB clue failure: it called the first two terms the repeating unit. The subsequent 5265 UI repair displayed a three-term AAB clue. This new 5275 run rechecked the visible clue copy against actual shown sequences:

| Viewport | Visible sequence | Visible clue | Result |
|---|---|---|---|
| 1280×800 | AAB, eggs/volcano, then AAB dinosaur/dinosaur/egg | “Look at the first three places. They make the AAB repeating unit. Start that same unit again.” | Correct three-term unit; screenshots retained. |
| 1280×800 | ABB, lemon/kiwi/kiwi | “Look at the first three places. They make the ABB repeating unit. Start that same unit again.” | Correct three-term unit. |
| 1280×800 | AB, pear/orange alternating | “Look at the first two places. They make the AB repeating unit. Start that same unit again.” | Correct two-term unit. |
| 390×844 | AB, right/down-left arrows alternating | Same first-two-place AB clue | Correct two-term unit. |
| 390×844 | AAB, tennis balls/pool ball | Same first-three-place AAB clue | Correct three-term unit. |

Correct visible answers then produced matching “Why it works” descriptions for the observed patterns. I did not observe an ABB clue at 390px in this narrow pass. The current evidence therefore verifies all three pattern types at desktop and AB/AAB at mobile; the previous full 5265 mobile matrix remains separate. This is not another 18-question matrix.

Screenshots: [desktop AAB](pattern-aab-desktop-clue.png), [desktop ABB](pattern-abb-desktop-clue.png), [desktop AB](pattern-ab-desktop-clue.png), [mobile AB](pattern-ab-mobile-clue.png), [mobile AAB](pattern-aab-mobile-clue.png).

### Chess Explorers

| Viewport | Visible puzzle and clue | Recovery check | Result |
|---|---|---|---|
| 390×844 | King at d3; star at d2; clue: “Start with the king on d3. Trace its path to the star on d2, checking every square for a blocker.” | A one-square legal-but-wrong e3 destination showed “That is not the one-step goal. Green squares show legal moves; the star shows this puzzle’s goal.” Selecting the king and then d2 completed the move. The old error status cleared and the success explanation appeared. | Pass for clue coordinate alignment, legal-but-wrong feedback, and success recovery. |
| 1280×800 | Knight at b1; star at c3; clue: “Start with the knight on b1. Trace its path to the star on c3, checking every square for a blocker.” | The legal-but-wrong d2 destination showed the same goal-specific feedback while legal squares remained highlighted. Choosing c3 then held success; the error status disappeared. | Pass for the same narrow controls at desktop. |

The earlier full matrix remains the broader proof for blockers, friendly occupancy, capture handling, progression and question counts. This delta checks one visible coordinate-path puzzle at each width; it does not repeat that matrix.

Screenshots: [mobile clue](chess-king-clue-mobile.png), [mobile wrong destination](chess-king-wrong-mobile.png), [mobile success](chess-king-success-mobile.png), [desktop clue](chess-knight-clue-desktop.png), [desktop wrong destination](chess-knight-wrong-desktop.png), [desktop success](chess-knight-success-desktop.png).

### Astronaut Academy

| Viewport | Visible question | Mission clue | Result |
|---|---|---|---|
| 390×844 | “What is the blanket of gases around Earth called?” | “Mission clue: Earth’s atmosphere is a layer of gases around our planet.” | Visible, relevant science fact that supports the answer; one-use clue control disabled after use. |
| 1280×800 | “Which shape is closest to Earth?” | “Mission clue: Earth is nearly spherical, a little wider around its middle.” | Visible, relevant science fact; one-use clue control disabled after use. |

This narrow pass did not submit answers or revisit the passport. The earlier full matrix retains the three-chapter, durable-fact and spaced-review evidence. These screenshots do not make audio claims.

Screenshots: [mobile mission clue](astronaut-mobile-clue.png), [desktop mission clue](astronaut-desktop-clue.png).

### Dino Hangman

At both widths, I started the ordinary Word-family rescue chapter, used the visible Letter clue once, and confirmed the Letter clue and Picture clue controls became disabled. The new copy gives a **letter name**, with no slash-style phoneme cue. Both ordinary questions matched their visible clue and family:

| Viewport | Prompt and family | Letter clue and visible completion | Result |
|---|---|---|---|
| 390×844 | “A happy time playing a game.”; `-un` | “Letter clue: find F. Tap that letter when you find it.” Guessed visible F, U, N; completed `FUN`. | Word is coherent with prompt/family. The held panel says “You rescued FUN! You used the letters to build the word.” and shows one fact plus Next word. |
| 1280×800 | “A picture that helps you find a place.”; `-ap` | “Letter clue: find M. Tap that letter when you find it.” Guessed visible M, A, P; completed `MAP`. | Word is coherent with prompt/family. The held panel says “You rescued MAP! You used the letters to build the word.” and shows one fact plus Next word. |

These UI states show one-use clue behavior and a completed clue-assisted word held until the child selects Next. I did not claim a separate diagnostic “assisted” classification field; no Grown-ups export was part of this narrow delta. The earlier 5265/5267 matrix retains full word-family/picture-clue/independent chapter coverage, retry-after-failure and Next navigation. No current clue-copy defect was reproduced.

Screenshots: [mobile Letter clue](hangman-mobile-letter-clue.png), [mobile held success](hangman-mobile-held-success.png), [desktop Letter clue](hangman-desktop-letter-clue.png), [desktop held success](hangman-desktop-held-success.png).

## Lineage, defects, and acceptance boundary

- **Pattern:** 5259’s incorrect AAB first-two-term clue remains a preserved failure. 5265 later showed the repaired first-three-term clue on mobile. The 5275 checks above add independent current-candidate evidence for AB/AAB/ABB on desktop and AB/AAB on mobile. They do not erase 5259 or complete a fresh mobile ABB check.
- **Chess:** 5259’s mechanics repair was separately exercised on a knight/pawn blocker scenario. This 5275 delta confirms coordinate-specific clue text, a legal-but-wrong response, and clearing that response on successful move at both widths. The prior full matrix remains the blocker/friendly-square and progression baseline.
- **Astronaut:** the 5259 solar-panel wrong-answer scenario and 5265 rocket-exhaust clue remain distinct historical prompts. This 5275 check used separate atmosphere/shape questions at each viewport; none of those prompts was conflated. Current displayed facts were on-topic.
- **Hangman:** the earlier 5265 picture-clue work is historical. The 5275 rendered “Letter clue” now says “find F/M”, not a phoneme slash string; ordinary visible guesses completed two held word/fact states at both widths.
- **Audio is pending:** the frozen narration inventory requests 435 phrases and reports 1 ready / 434 missing. No narration worker ran, no provider was called, and no clip was listened to. Native playback, full audio readiness, intelligibility/pronunciation/prosody, and human listening remain open. This report is not an audio pass.
- **Scoring/acceptance:** no score or 4.5 claim is assigned. This is a copy/clue UI delta only; the previous full gameplay matrix remains the baseline. All four games remain unaccepted pending the remaining shared/game-specific gates, full finite audio corpus, listening, and independent editorial review.

## Captured identity check

The all-five-file served-hash verification matched the identity manifest at 5275. The precise candidate SHA and hashes are in [the frozen identity file](../batch6-narration-repair-identity-20261003.json); this UI report does not infer anything about a later build or deployment.
