# Curriculum Quest live QA

Date: 30 September 2026. Independent browser session: `luna_curriculum_live`.

## Release identity

- Canonical alias: https://dinospace-eight.vercel.app
- Immutable deployment: https://dinospace-knvfb7xse-memas-projects-23a0001d.vercel.app
- Deployment: `dpl_3bjcdDvpeyPDYmhEzdydQHvVKTTU`
- Git SHA: `242a3f05e81fe1f9e9b2c5184659e1f232d9c4ee`
- Rendered assets: `assets/index-7loj9iFU.js` and `assets/index-rDO19aDV.css`

## Run coverage

| Module / band | Actual UI run | Outcome |
|---|---|---|
| Time Detectives / Starter | Completed all 4 questions. Chronology sequence: handwritten letter → landline telephone → smartphone message. Evidence: old seaside holiday photograph; castle artefact; fire → candle → electric lightbulb. | Wrong/right feedback worked on the message sequence and photograph question. Correct answers exposed explanatory facts and a “Hear why” control. Finite completion said “You explored 4 questions”; Restart this level returned to Starter Round 1 with `0/4`. |
| Time Detectives / Growing / desktop | Completed all 5 questions (prior run): message sequence; old seaside photograph; dated school photos (1990/2010/2025); lights (fire/candle/electric lightbulb); what an old-house photo can show. | Wrong/right feedback, explanatory facts, completion text (“Growing path complete / You explored 5 questions”), and replay reset to Round 1 at `0/5` were observed. |
| Time Detectives / Challenge / desktop | Completed all 5 questions: message sequence; local-school evidence (old photos + interview); interview memory limits; fire/candle/electric-light chronology; castle artefact. | On the school evidence item, “Tomorrow’s weather” produced corrective feedback, then “Old photos and an interview” produced a durable explanation. Hear-why was exercised. Finite completion said “Challenge path complete / You explored 5 questions”. Parent-world leave confirmation and return to `#/world/explore` worked. Screenshot: [.playwright-cli/page-2026-09-30T22-27-19-521Z.png](../.playwright-cli/page-2026-09-30T22-27-19-521Z.png). |
| Time Detectives / Challenge / 390×844 | Completed all 5 questions: street change (old photo + modern map); shop-front photo limits; school photos (1990/2010/2025); old-house photo; compare sources when old photo and interview conflict. | Right answers exposed distinct explanations; “Hear why” replayed for the first fact. Finite completion said “Challenge path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-29-44-279Z.png](../.playwright-cli/page-2026-09-30T22-29-44-279Z.png). |
| Time Detectives / Growing / 390×844 | Completed all 5 questions: personal timeline (Baby → Child → Adult); castle artefact; old photos + interview; message methods (handwritten letter → landline → smartphone); seaside holiday photograph. | Each response exposed an explanation; finite completion said “Growing path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-34-42-700Z.png](../.playwright-cli/page-2026-09-30T22-34-42-700Z.png). |
| Nature Lab / Starter | Completed all 5 questions: identify a bird (Robin), identify an animal (Frog), choose a see-through window material (Clear glass), identify a plant (Oak tree), identify a mammal (Rabbit). | Wrong/right feedback worked on bird and animal questions. Correct answers exposed explanatory facts and “Hear why”. Finite completion said “You explored 5 questions”. |
| Nature Lab / Challenge / desktop | Completed all 5 questions: bird (Robin); clay shape change (Squash it); herbivore (Cow); seeing (Eyes); raincoat material (Plastic). | Wrong choice Cat showed feedback, then Robin produced an explanation. “Hear why” worked. Finite completion said “Challenge path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-31-42-713Z.png](../.playwright-cli/page-2026-09-30T22-31-42-713Z.png). |
| Nature Lab / Challenge / 390×844 | Completed all 5 questions: plant water uptake (Roots); animal (Frog); metal grouping (Spoon and key); hearing (Ears); plant (Oak tree). | Explanatory facts and “Hear why” appeared; finite completion said “Challenge path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-32-36-630Z.png](../.playwright-cli/page-2026-09-30T22-32-36-630Z.png). |
| Nature Lab / Growing / 390×844 | Completed all 5 questions: bird (Robin); material in “wooden chair” (Wood); plant water uptake (Roots); testable question (which paper absorbs more water); plant support/water transport (Stem). | Correct explanations appeared. Finite completion said “Growing path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-36-28-232Z.png](../.playwright-cli/page-2026-09-30T22-36-28-232Z.png). |
| Nature Lab / Growing / desktop | Completed all 5 questions: observe and record plant change; evergreen trees; spring buds; seedling water prediction and observed result; identify Oak tree as a plant. | The seedling item accepted an initial prediction, displayed a seven-day observation, then asked for a conclusion. Feedback explicitly distinguished prediction from evidence. Finite completion said “Growing path complete / You explored 5 questions”. Screenshot: [.playwright-cli/page-2026-09-30T22-38-27-347Z.png](../.playwright-cli/page-2026-09-30T22-38-27-347Z.png). |

The questions were answered through visible UI controls after reading the on-screen prompt, learning text, or feedback clue. The browser session was isolated; no app-data injection, solver import, source edits, or real-family browser profile was used.

## Navigation, narration, and mobile layout

- Explore & Languages → Curriculum Quest opened the module selector. Time Detectives and Nature Lab were both selectable there.
- Time Teller was opened from the Maths Missions catalog at desktop size. Its clock-game intro showed “Level 1 of 3: O’clock”; “Back to learning world” returned to `#/world/maths`.
- “Back to learning world” from Curriculum Quest opened the leave confirmation; “Back to world” returned to `#/world/explore` at desktop and 390×844.
- Lesson narration was replayed twice through the visible “Hear lesson” control. The audio request `GET /audio/en/ae88ee5f-matilda.mp3` returned 200. The second tap replayed from the loaded resource; no additional request was needed. Other observed narration audio responses were 200 or 206 (range response).
- At 390×844, the final Curriculum Quest menu showed all three module buttons full width (354×58 px). Every rendered visible button measured at least 48 px high; the smallest measured height was 48 px. `document.documentElement.scrollWidth` was 390 px.
- Browser console: 0 errors, 0 warnings. Requests for the JS, CSS, and loaded game art returned 200; no failed asset requests were observed.

## Screenshots

- Start: [luna-start-desktop.png](../output/playwright/luna-start-desktop.png)
- Time Detectives fact / explanation: [luna-time-detectives-fact-explanation-desktop.png](../output/playwright/luna-time-detectives-fact-explanation-desktop.png)
- Time Detectives completion: [luna-time-detectives-completion-desktop.png](../output/playwright/luna-time-detectives-completion-desktop.png)
- Nature Lab fact / explanation: [luna-nature-lab-fact-explanation-desktop.png](../output/playwright/luna-nature-lab-fact-explanation-desktop.png)
- Nature Lab completion: [luna-nature-lab-completion-desktop.png](../output/playwright/luna-nature-lab-completion-desktop.png)
- 390 px final menu: [luna-curriculum-final-menu-390px.png](../output/playwright/luna-curriculum-final-menu-390px.png)

## Remaining QA scope

Complete finite runs now exceed the requested minimum: 6 desktop and 4 mobile runs (Time Detectives Starter, Growing and Challenge; Nature Lab Starter, Growing and Challenge; plus full 390×844 runs for Growing and Challenge in both modules). Growing and Challenge for both modules were completed on desktop and mobile. The desktop Nature Lab Challenge run explicitly included a wrong-then-right attempt; prior Starter runs also exercised wrong/right feedback. Replay reset was verified on the Time Detectives Starter run. Back-to-world was verified on Time Detectives Challenge desktop; audio voice replay and network status are documented above. Completion screens showed the finite completion message and level replay control; no separate reward display was visible in the captured completion states. Wrong/right feedback, voice replay, and back navigation were not individually repeated in every run, so those checks are reported only where observed.

## Starter geography reward persistence follow-up

This independent read-only production run used isolated browser session `luna_curriculum_reward_live` and a separate Amari profile created by selecting Age 6+ in that browser. It ran on the already loaded canonical document before the alias moved:

- Canonical alias: https://dinospace-eight.vercel.app
- Deployment: `dpl_CZVgq9aXeCXnKKjHHbBnHLN9b7Cj`
- Git SHA: `3e97df50a9e035023821065dee4c3371cebaf96f`
- Rendered assets: `assets/index-B_ynxaXR.js` and `assets/index-d000j113.css` (both HTTP 200)

Before play, Amari’s home showed 0 stars. I opened Explore & Languages → Curriculum Quest, left the band on Starter, and completed all five questions through the visible controls:

| Round | Prompt and answer | Feedback / fact shown |
|---|---|---|
| 1 | Find Africa on the map → Africa | Africa lies between the Atlantic and Indian Oceans; Kenya and Egypt are in Africa. |
| 2 | Find Antarctica → initially Africa (wrong), then Antarctica | Wrong feedback asked me to use land-shape outlines and position. Correct feedback: Antarctica is the cold continent at the bottom of the map and has no countries. |
| 3 | Which way is east on our map? → Right | With north at the top, east is to the right. |
| 4 | Find Europe → initially Asia (wrong), then Europe | Wrong feedback again directed attention to shape and position. Correct feedback: Europe is north of Africa; the United Kingdom and France are in Europe. |
| 5 | Find North America on the map → North America | Canada and Mexico are in North America. |

After the fifth answer, the page showed “Starter path complete”, “You finished this discovery run!”, and “You explored 5 questions in Continents & Oceans.” Returning through the leave confirmation to Explore & Languages, then Back to home, showed Amari at 5 stars (up from 0). The Curriculum Quest catalog card showed “Played 5”.

I opened Sticker Shelf before and after the full-page reload and reselected the same Amari profile. The shelf showed 5 stars both times. The first threshold sticker, Bronze Rocket, unlocks at 10 stars; higher global thresholds followed at 25, 40, 60, and above. No per-path or Curriculum Quest badge/reward appeared in the completed screen, home card, or sticker shelf. The observed reward for this run was the 5-star increase; it persisted after reload, while no threshold sticker was unlocked at that count.

The full reload loaded the subsequently released German build. I kept that check separate from the completed Curriculum run:

- Deployment: `dpl_RSfE9gs3q9CLeZWGgUo5Jotj2Dq1`
- Git SHA: `c8a5155059ac0bdaf30cf75bf5416281e275fb5e`
- Rendered assets after reload: `assets/index-DnXwhuXc.js` and `assets/index-DLS0TiZ4.css` (both HTTP 200)
- Reselecting Amari showed 5 stars on home and 5 stars on Sticker Shelf.

Captures: baseline Amari home at [page-2026-09-30T23-37-22-993Z.png](../.playwright-cli/page-2026-09-30T23-37-22-993Z.png), zero-star sticker shelf [page-2026-09-30T23-37-40-530Z.png](../.playwright-cli/page-2026-09-30T23-37-40-530Z.png), completed Starter screen [page-2026-09-30T23-40-25-411Z.png](../.playwright-cli/page-2026-09-30T23-40-25-411Z.png), five-star home before reload [page-2026-09-30T23-41-02-851Z.png](../.playwright-cli/page-2026-09-30T23-41-02-851Z.png), five-star shelf after reload [page-2026-09-30T23-42-40-507Z.png](../.playwright-cli/page-2026-09-30T23-42-40-507Z.png), and five-star home after reload/reselect [page-2026-09-30T23-42-43-455Z.png](../.playwright-cli/page-2026-09-30T23-42-43-455Z.png).

## Immutable local candidate 5177 follow-up — 1 October 2026

This independent UI run used fresh isolated Playwright sessions `luna_curriculum_fixed_5177` and `luna_curriculum_fixed_5177_mobile`. This is a local immutable candidate, not a production deployment:

- Candidate source SHA: `d2f1cdd116e88b72ff1a38c73a518a8ad8820cfd`
- URL: `http://127.0.0.1:5177/`
- Rendered assets: `assets/index-BZkk3Yuu.js` and `assets/index-BjKMFMwR.css` (both HTTP 200)
- No app-data injection, solver imports, source edits, or real-family browser profile were used.

### Time Detectives / Starter, full runs

| View | Actual five-question order and outcome |
|---|---|
| Desktop 1280×800 | 1. Message methods (handwritten letter → landline telephone → smartphone message); 2. seaside-holiday photo as evidence; 3. castle artefact as source; 4. old-house photograph shows appearance, not every thought; 5. fire → candle → electric lightbulb. The first attempt chose Smartphone message too early, displayed “Not quite. Which clue is older? Try again.”, then the correct sequence succeeded. Every item showed its fact and a “Hear why” action; progression remained Starter `Round 1 of 5` through `Round 5 of 5`. The finite ending stated “You explored 5 questions”, displayed “Starter time detective” collected, and raised the Time Detectives module count to `1/3`. |
| Mobile 390×844 | 1. Message methods (handwritten letter → landline telephone → smartphone message); 2. fire → candle → electric lightbulb; 3. old-house photograph; 4. castle artefact; 5. seaside-holiday photo as evidence. Correct answers showed durable facts; “Hear why” was tapped on three of the facts. It ended with the same five-question completion screen and Starter badge. |

After the mobile run, I reloaded the same browser, reselected Amari through the profile UI, and opened Stickers. Home showed 7 stars; the shelf showed `1 / 9` Curriculum explorer badges and “Starter time detective: collected.” Opening the parent world and Curriculum Quest again mounted Time Detectives with Challenge selected automatically, while its new queue remained `Round 1 of 5`; the prior Starter queue had not reset or changed band during its five rounds. The Grown-ups progress view showed five skills “Practising” but no direct recommendation label.

### Targeted same-band replay observation

To inspect recent-question behaviour, I left to the parent world, reopened Curriculum Quest, and explicitly selected Starter on the same Amari profile and browser after reload. The next Starter run opened with “Put these ways to send a message from oldest to newest,” the same prompt as the first completed Starter run. The Starter History pool has exactly five prompts; the previous completed queue had already used all five, so a repeated prompt after pool exhaustion is expected and cannot be judged against an eight-distinct-item window. This follow-up remained partial and is not counted among the two completed runs. It does not verify how the exhausted five-item pool is reordered, or seeded selection. The parent identified a separate issue in which the entire five-item ordering can repeat after exhaustion and is preparing a seeded shuffle for targeted verification. Screenshot of the partial visible run: [.playwright-cli/page-2026-10-01T01-15-50-618Z.png](../.playwright-cli/page-2026-10-01T01-15-50-618Z.png); snapshot: [.playwright-cli/page-2026-10-01T01-15-50-618Z.yml](../.playwright-cli/page-2026-10-01T01-15-50-618Z.yml).

## Exhausted-pool replay verification on 5180

Independent isolated UI session `luna_curriculum_replay_5180`; local immutable candidate only, not production:

- URL: `http://127.0.0.1:5180/`
- Candidate SHA: `1909950d6b66015758bb84a65873405692cbd313`
- Rendered assets: `index-BBBmZNS1.js` and `index-BjKMFMwR.css`
- Viewport: 390×844

I completed a five-question Starter Time Detectives history run, reloaded the page, reselected the same Amari profile, opened Curriculum Quest through the home tile, explicitly selected Time Detectives and Starter, and completed a second five-question run through the UI. The first run order was: message methods chronology; old-house photograph; seaside-holiday photograph; fire/candle/electric-light chronology; castle artefact. The second run order was: fire/candle/electric-light chronology; castle artefact; old-house photograph; seaside-holiday photograph; message methods chronology. The replay had five questions, contained no within-run duplicate, and its full ordering changed after the pool was exhausted. Its first item also differed from the prior run's last item. The first question exposed the durable fact “People used fire before candles, and electric lightbulbs came later”; the final chronology sequence completed as handwritten letter → landline telephone → smartphone message. Completion stated “Starter path complete” and “You explored 5 questions,” with the Starter path badge shown collected.

This verifies rendered exhausted-pool reordering on local candidate 5180 after reload. The seed itself is not shown in the UI, so this is not evidence of a user-visible seed or event diagnostic. The candidate is not the production release identity; final seeded desktop/mobile release runs remain a separate gate. Completion screenshot: [.playwright-cli/page-2026-10-01T01-24-29-966Z.png](../.playwright-cli/page-2026-10-01T01-24-29-966Z.png). The first completed 5180 run screenshot is [.playwright-cli/page-2026-10-01T01-21-35-765Z.png](../.playwright-cli/page-2026-10-01T01-21-35-765Z.png).

### Visual, sizing, and resources

- At 1280×800, the detective guide bounding box was x=65–230, and the first timeline card began at x=248, leaving an 18px horizontal gap. No guide/card intersection was present.
- At 1280×800 Nature Lab, the owl guide was x=65–230 and the first specimen card began at x=248, also leaving an 18px gap. Specimen audio controls sat inside their cards and did not overlap the animal labels.
- At 390×844, the History decorative guide was hidden. Nature specimen cards and their “Hear choice” controls stayed within the viewport; visible controls measured at least 48×48. On both pages `document.documentElement.scrollWidth` was exactly 390. Desktop document width was exactly 1280; all measured visible controls were at least 48px in each view.
- Browser console was clear in both sessions: 0 errors and 0 warnings. The candidate JS, CSS, map/history/nature art, guide art, and observed narration audio assets returned HTTP 200.
- Full-page captures: History desktop lesson/start [page-2026-10-01T01-03-25-595Z.png](../.playwright-cli/page-2026-10-01T01-03-25-595Z.png), desktop answer fact [page-2026-10-01T01-14-13-759Z.png](../.playwright-cli/page-2026-10-01T01-14-13-759Z.png), and desktop completion [page-2026-10-01T01-05-21-612Z.png](../.playwright-cli/page-2026-10-01T01-05-21-612Z.png); History mobile started question [page-2026-10-01T01-06-31-087Z.png](../.playwright-cli/page-2026-10-01T01-06-31-087Z.png) and completion [page-2026-10-01T01-08-23-522Z.png](../.playwright-cli/page-2026-10-01T01-08-23-522Z.png); Nature desktop lesson [page-2026-10-01T01-09-27-187Z.png](../.playwright-cli/page-2026-10-01T01-09-27-187Z.png) and mobile lesson [page-2026-10-01T01-09-09-837Z.png](../.playwright-cli/page-2026-10-01T01-09-09-837Z.png).

The new full History runs independently confirm the five-question Starter queue and its path badge on this candidate. The repeated first item followed exhaustion of the five-prompt pool and is expected; the exhausted-pool ordering still needs the parent’s seeded-shuffle fix and targeted verification. The roadmap still requires three seeded desktop and three mobile runs on the exact release identity; these two candidate runs do not meet that gate, and no seed was exposed through the visible UI.
