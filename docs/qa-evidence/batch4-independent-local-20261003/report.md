# Batch 4 independent local browser QA — 3 October 2026

## Candidate and verdict

**Candidate:** frozen Batch 4 build `d96e5d7ad08483163e375a4ddbe358a346163922`, served from `http://127.0.0.1:5221` and `tmp/batch4-integrated-candidate-20261003`. Its identity file and the four frozen build asset digests are retained beside this report. The application entry bundle and stylesheet loaded with HTTP 200 in both browser sessions.

**Verdict: HOLD; this is partial local evidence, not Batch 4 acceptance.** Independent Playwright sessions covered 1280×800 and 390×844. Time Teller and Number Line each completed all three six-question chapters through ordinary visible controls, with an ordinary same-band replay. Addition Adventure and Subtraction Station were only sampled for two first-chapter questions apiece; their other chapters, full chapter rewards, and replay are not verified. Narration was not reviewed by a human listener; no production or canonical deployment was tested.

The roadmap/implementation-plan acceptance matrix is therefore incomplete. Source tests, lint, and build identity recorded in the candidate JSON do not substitute for the missing gameplay, voice, editorial, or production evidence.

## Setup and integrity

- Started separate fresh Playwright sessions at the requested desktop and mobile dimensions. Before the first app navigation in each, installed `**/api/voice**` and `**/api/story**` 204 route guards. No progress, seed, answer, or localStorage value was injected; progression was made via visible game controls.
- Console inventories: 0 messages, errors, or warnings in both sessions. Static requests returned HTTP 200. No voice/story/provider request reached the service. One actual “Hear mission” action on the desktop Time Teller requested local packaged `/audio/en/24f14aff-matilda.mp3`, HTTP 200. This proves resource delivery only; intelligibility, playback quality, cancellation, and full corpus coverage remain pending.
- The Grown-ups → Game troubleshooting → Download game log action generated both retained diagnostic JSON files. They contain generated run seeds and outcomes, not names or story text; access was through the visible grown-up export control.
- The player switch was exercised through the visible selector: Amari’s Number Line shelf showed 3/3 badges and 8 stars; Askia showed zero stars and no Amari badges; switching back to Amari preserved the 8-star shelf. This checks profile isolation for the tested browser profile pair, not cross-device account sync.

## Gameplay exercised

| Game | Viewport | Exercised | Coverage boundary |
|---|---:|---|---|
| Addition Adventure | 1280×800 | Chapter 1 Q1: visible 1+7 manipulatives, wrong response, clue, correct held feedback; Q2 exposed `0 (empty)` plus ten. | Two questions only; no chapter completion, stars, replay, or chapters 2–3. |
| Subtraction Station | 390×844 | Chapter 1 Q1 showed 9 apples with 3 visibly marked for removal and remaining tray; Q2 was 10−0 with an explicit empty zero group. Tested wrong, one-use hint, correct held explanation, and enabled Next. | Two questions only; no chapter completion, stars, replay, or chapters 2–3. On the zero question the unchanged hint said “Look at the marked objects. Count the ones that remain,” despite zero removal. |
| Time Teller | 1280×800 | Completed all 18 missions (6 each in Clock Explorers, Past and To, Daily Routines) and opened a normal Daily Routines replay. Clock choices agreed with visible rendered hand angles in sampled read cases; the chapter 3 hand-setting mission accepted 4:30 afternoon after visible Hour+/Minute+15 controls. A quarter-hour boundary defect was reproduced. | One replay question observed, not a full replay run. Human audio review pending. |
| Number Line Jump | 390×844 | Completed all 18 missions (Forward and Back, Missing Numbers, Compare Values and Distances), used visible hop controls including keyboard ArrowRight, earned 3/3/2 stars (8 total), reloaded, checked badge shelf and child-profile separation, then began an ordinary same-band replay with a different visible first prompt. | Full baseline is mobile only. Replay was sampled through one answered question; no desktop full-band run. Frog was represented as the text “Frog at 5,” not an illustration. |

For the tested completed games, wrong feedback and the worked explanation remained on screen until Next. Leave controls presented Keep playing and Back to world. No manual completion/progress edits were made.

## Functional and diagnostic findings

1. **Time Teller minute-step wrap is wrong at the hour boundary (reproduced).** In the ordinary Chapter 3 setter replay, the visible clock was set to 12:45 using three Minute+15 taps. One more Minute+15 changed the display to 12:00; the expected forward 15-minute result is 1:00. Starting at 1:00, Minute−15 changed the display to 1:45; the expected result is 12:45. Evidence: the three `time-teller-*wrap*` screenshots. The 12:45/1:00 controls do not behave as “forward/back 15 minutes” at rollover.

2. **Number Line hides one same-position endpoint marker.** In Compare Values and Distances Q4, visible endpoint labels said A 11→20 and B 19→20. The tick at 20 displayed B, but not A; both landing values were 20. This weakens the side-by-side comparison exactly where both markers should meet. The question was still answerable from text and feedback.

3. **Number Line tick rings overlap at 0–20 width.** On 390px, the labelled scroll region measured about 760 CSS px wide; 21 tick circles measured 44px each with roughly 35px center spacing, so adjacent circles overlap by around 9px. The region exposed a scroll cue and the document itself did not horizontally overflow. This is a visual density issue rather than a page-level overflow.

4. **Number Line frog is text-only.** In Forward and Back, the child saw the line and a text status such as “Frog at 5”; no frog illustration appeared. The hop controls moved the numeric position correctly. Record as visual quality, separate from gameplay correctness.

5. **Attempt diagnostics omit the outcome boolean.** Real UI exports contain `answer_attempt` records for both wrong and correct choices, but none has a `correct` field (therefore no explicit `correct:false`). A later `answer_correct` event may let an investigator infer the transition; an unanswered wrong attempt is not self-describing. The exports retain game identifiers, first-attempt state, hint count, level/round and seed. Frozen candidate reports use `numberline` and `timeteller` attempt identifiers in exports; completed Number Line chapters affected the global game-count key as `math` (browser storage showed `amari_games_played={"math":3}` while recent-game history showed `numberline`). Grown-ups then reported Monster Math as the favourite at three plays. This corroborates the completion-metric misclassification for Number Line.

6. **Reload route behavior on the curriculum-linked clock.** Visible route: Explore & Languages → Curriculum Quest → Time Detectives → Practise telling the time (`#/play/timeteller`). On a running clock, Back opened the leave dialog; Keep playing retained the game. In the same mobile browser context, `amari_discovery_active_player` was `"amari"` immediately before and after ordinary page reload, but the URL reset to `#/` (HQ/player selector). Re-selecting Amari returned to home with the existing 8 stars. Separately, visible Back → Back to world from the clock entered through Time Detectives returned to `#/play/worldmap/time-detectives`; normal Maths entry from the Maths Missions world returned to `#/world/maths`. Thus the explicit confirmed-back origins worked, while reload did not preserve the active route. No localStorage edits or init scripts were used; setup only installed the two network guards before initial navigation.

7. **Star/replay accounting is not fully verified for arithmetic.** Number Line’s first completion awarded the visible 3/3/2 badges and 8 global stars; reload preserved these. Arithmetic had no completed chapter or replay in this partial pass, so better-star/equal-star/lower-star replay accounting remains untested on this frozen candidate.

## Evidence files

- `candidate-identity.json` and `served-asset-sha256.txt` — candidate identity and frozen asset digests.
- `diagnostics/desktop-game-log-ui-export.json` — UI-generated desktop log for Addition Adventure and Time Teller.
- `diagnostics/mobile-game-log-ui-export.json` — UI-generated mobile log for Number Line, Subtraction, and the linked Time Teller route.
- `diagnostics/*requests.txt`, `*console.txt` — browser request and console inventories.
- `screenshots/` — viewport captures supporting the findings and sampled controls.

## Out of scope / still required

- Finish all three chapters and same-band replay for Addition Adventure and Subtraction Station on both required viewports; test equality/zero/missing-term cases, chapter stars, best-star improvements, and no reward on equal/lower replay.
- Repeat full bands and run/replay diagnostics on the final changed candidate at both viewports; check all touch targets and randomized restart uniqueness.
- Verify the exact Time Teller clock origin through reload after the requested startup-route repair; check related return, Keep playing, confirmed Back, and Maths origin against the final identity.
- Review packaged narration through actual playback for coverage, intelligibility, cancellation, and lesson correctness. Do not substitute HTTP availability for listening.
- Complete required editorial review and canonical production identity/rendered checks before any Batch 4 acceptance claim.
