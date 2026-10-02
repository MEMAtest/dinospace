# Batch 2 final independent QA (5284 / focused 5285)

## Scope and identities

Independent browser work uses isolated Playwright session `luna_batch2_final`; no app source was edited and no hidden state or answers were read. Results from 5283 remain in `batch2-repaired-independent-qa.md` and are not mixed with this report.

| Build | Identity | Scope |
|---|---|---|
| Frozen 5284 | `http://127.0.0.1:5284`; JS `index-DyU82Xpc.js`; CSS `index-Bwl2SrXA.css`; static `/tmp/dinospace-batch2-final-20261002/site` | Current independent checks |
| Follow-up 5285 | `http://127.0.0.1:5285`; JS `index-Bt4ua6Fb.js`; CSS `index-Bwl2SrXA.css`; static `/tmp/dinospace-batch2-nav-20261002/site` | Targeted sequential-navigation and Sky progress checks below |

5284 fresh browser loaded the stated route. The viewport was 390×844 for mobile runs and 1280×720 for desktop screenshots. Bundle resources, static requests, and browser console were checked below.

## 5284 actual UI evidence in progress

### Sky Shapes

- Fresh Amari profile, mobile 390×844. Opened Creative Lab → Sky Shapes. The visible guide offered touch/mouse drawing or keyboard controls; used visible keyboard guide by focusing the named tracing-board application, Enter, then Space. Completed a full Starter `Cloud Meadow` run: Round Sun → Mountain Peak → Kite → Window Cloud. Visible accuracy feedback was 94%, 99%, 99%, and 98% respectively; the flight progress advanced to 4/4 and explicit “starter sky complete” reward offered Sky map, Replay this sky, Fly Rainbow Ridge, and Back to world. Screenshot start `.playwright-cli/page-2026-10-02T06-10-51-797Z.png`; final-flight feedback `.playwright-cli/page-2026-10-02T06-11-34-195Z.png`.
- Returned from reward to Creative Lab and then home. Amari’s star count showed 6; Grown-ups summary showed Sky Shapes (5 plays) due pre-existing seeded local event history in the session, so no new numeric-seed claim is made from the on-screen “5 plays” indicator. Switched to Askia through the app’s player selector; Askia home showed 0 stars and separate game worlds. No Sky reward appeared in Askia. Switched back to Amari and her 6 stars remained. This is profile isolation evidence for Sky/overall star ledger.
- Earlier 5283 report retains mobile Growing/Challenge exports and three Starter desktop seeds. This 5284 Starter run was retained in the 5284 log export with seed `3889996579`, rounds 0–3, and `level_complete`; it is not a new three-run same-build matrix. Root independently reports separate 5284 pointer tracing tests; those are not represented as my checks.

### Monster Math

- Fresh-session Starter episode: opened Maths Missions → Monster Math → Start six questions; six visible counting prompts completed. On Q1 “How many shells can you see?” selected 2 incorrectly; UI retained the question and displayed “Not yet. Try the clue, then count the model again.” `Show me a clue` showed “Touch or point to each picture once. Keep a steady count.” Correct 4 advanced the visible count to 1/6 and revealed “There are 4 shells.” Five more visually counted questions completed through Next/Finish. Finished 6/6 with 5/6 first-try, 3/3 stars, and “New episode badge saved for this child.”
- Growing `Add and Take Away` completed 6/6, 6/6 first try. Visible examples: `11 − 3 = 8`, “3 counters moved away; 8 counters stay”; `2 + 16 = 18`, “2 counters and 16 more make 18 counters.” Counters were narrated correctly and answer models matched visible equations. Intermediate questions 3–5 were not fully transcribed in the eventual timeout of the helper call, but the final question and 6/6 completion were visible.
- Challenge `Monster Story Problems` completed all six via visible questions/number line and actual answer buttons. Verified `Start at 2, then jump back 1 step to 1.` and “Tess starts with 2 stars and gives 1 star away. One star is left.” The finite completion screen showed 6/6 first try, 3/3 stars, badge saved. Screenshots: Starter Q1 `.playwright-cli/page-2026-10-02T06-13-21-825Z.png`; Starter complete `.playwright-cli/page-2026-10-02T06-14-35-653Z.png`; Growing complete `.playwright-cli/page-2026-10-02T06-16-13-858Z.png`; Challenge Q6 `.playwright-cli/page-2026-10-02T06-17-49-716Z.png`.
- The exact requested 11+2 prompt was not encountered. The visible Growing prompts included 11−3 and 2+16; Challenge showed word problems such as 10+9, 5+9, 11+4, 19−17, 9−4, and 2−1. No claim about 11+2 repair is made yet.
- Returned to Maths Missions and home by Back to world / Back to home. Amari’s stars rose from 6 to 12 after Starter + Growing + Challenge, and Monster Math showed Played 3. Profile isolation was checked after the Monster run in the follow-up section below.

### Puzzle Pop

- At 390×844, opened Creative Lab → Puzzle Pop → Picture Pioneers. Used visible Hint and actual piece/space buttons. Starter order began River Valley → Dino Park Picnic → Moon Camp → Robin’s Tree. First picture’s Hint named piece 2 and glowing space 2; correct actual placement gave “Great fit” and 1/4. Remaining hints directed piece/space placements; each completed with an educational fact shown before Next picture. Second picture included a visible correct actual placement sequence. Full 4/4 screen said Picture Pioneers complete, with Robin’s Tree fact, and offered Next chapter and Replay pictures. Screenshots: starter intro `.playwright-cli/page-2026-10-02T06-21-25-756Z.png`; River Valley completion `.playwright-cli/page-2026-10-02T06-19-11-883Z.png`; final chapter reward `.playwright-cli/page-2026-10-02T06-20-21-632Z.png`.
- Clicked 5284 Next chapter while only Starter had been unlocked; selection moved to Curious Constructors, as expected. 5285 targeted replay regression is recorded below; replaying Starter after unlocking Challenge correctly advanced to Growing.
- Parent navigation to Creative Lab and home worked. Puzzle persistence was checked after reload/player switch in the follow-up section below.

### Spot the Difference

- At 390×844 opened Thinking & Play → Spot the Difference → Bright-Eyed Beginners. On first pair Superhero City, clicked the visible “Search Picture B for a change” blank-area control; UI responded “Not that spot yet. Compare the same area in Picture A.” Magnifier reduced 2→1 and showed a middle-top clue. Tapping “Check middle top detail” advanced 0/3→1/3; two other visible hot-spot controls advanced to 3/3 and revealed the community-sharing fact. This is the first-pass snapshot; later 5284 follow-up below records full episode progression, persistence, reload, and profile isolation.

## Remaining checks and scope limits

- Complete-game persistence, reload, and Amari/Askia isolation were checked for all four games in the follow-up section below.
- Diagnostics export, numeric run seeds, static request responses, console state, and desktop screenshots were checked below.
- Exact Monster Math 11+2 prompt was not encountered. Puzzle Pop’s final Challenge reward label was not reached in the focused 5285 delta run. Physical speaker audibility was not tested.
- 5285 checks are local frozen-candidate evidence, not production release evidence. The 5284 and 5285 identities remain separately scoped.

## 5284 follow-up checks completed

- **Reload/profile isolation:** after finishing all four games, returned home, reloaded the tab, and selected Amari again. The home page restored 16 stars and all four games remained in Play again. Puzzle Pop chapter picker showed Picture Pioneers 4/4 and Growing unlocked; Spot picker showed Bright-Eyed Beginners 4/4 and Growing unlocked; Monster episode map showed all three episode badges and 3/3 stars each; Sky map showed Cloud Meadow 4/4, Growing unlocked, Challenge locked. Switched to Askia after the completions; her home still showed 0 stars and only her age-3 worlds. Switched back to Amari and her 16 stars remained. This verifies persisted visible completion progress and profile separation for all four titles within this isolated browser profile.
- **Privacy-safe UI export:** downloaded through Grown-ups → press and hold → Game troubleshooting → Download game log. Preserved uniquely as `output/playwright/batch2-5284-luna-final-log.json`. It contains 163 events across `jet` (22), `math` (44), `puzzle` (59), and `spot` (38); event groups include start/question/attempt/correct/hint/completion/leave. Keys are only `at`, `difficulty`, `event`, `firstAttempt`, `game`, `hintType`, `level`, `round`, and `seed`. No keys/text for names, prompt, story, fact, or answer. Sky’s four `learning_attempt` entries all include numeric seed `3889996579`, level `0`, rounds `0–3`, difficulty `starter`. Monster Math episode seeds exported: Starter `4173942305`, Growing `1531225980`, Challenge `3289498377`. Puzzle had 58 of 59 events seeded (seed `3747438023`); its one unseeded event was the generic leave event. Spot had 37 of 38 events seeded (seed `2923808820`); its one unseeded event was the generic leave event. Export was below the 300-event cap.
- **Network/console:** CLI recorded 82 static requests, all listed responses HTTP 200, including the exact JS/CSS bundles, scene images, app icons and narration MP3s. Browser console review returned 0 errors and 0 warnings. `requests` had no dynamic requests beyond static content.
- **Desktop screenshot:** current 1280×720 Puzzle Pop chapter picker screenshot `.playwright-cli/page-2026-10-02T06-24-36-446Z.png`; desktop Sky map `.playwright-cli/page-2026-10-02T06-26-20-729Z.png`. Mobile 390×844 gameplay and completion screenshots are referenced in the game subsections above.
- **Audio:** narration audio assets returned HTTP 200 and game UI exposes Hear Again/Hear clue controls. No physical speaker/audio output was captured or listened to, so playback audibility is not claimed.

## 5285 delta status

Root supplied 5285 identity with chapter navigation/reward label and Sky final percentage deltas. Root’s independent mouse/touch path is recorded separately by root; it is not credited as my interaction. The exact 11+2 Monster Math prompt was not present in the 5284 episode queues; the run verifies corrected singular wording and count models on other values.


## 5285 focused checks (independent actual UI)

- **Puzzle Pop sequential progression after replay:** in an isolated 390×844 session, completed Picture Pioneers (4/4), used Next chapter to unlock and complete Curious Constructors (4/4), then returned to Starter and completed Replay pictures. After replay, Next chapter selected Curious Constructors again, rather than skipping to the already-unlocked Challenge band. Starter replay used a visibly different order (Robin’s Tree → Moon Camp → Dino Park Picnic → River Valley). Screenshots: `.playwright-cli/page-2026-10-02T06-29-33-591Z.png`, `.playwright-cli/page-2026-10-02T06-30-20-457Z.png`, `.playwright-cli/page-2026-10-02T06-31-06-324Z.png`; post-navigation snapshot `.playwright-cli/page-2026-10-02T06-31-07-585Z.yml`.
- **Spot the Difference sequential progression after replay:** completed Bright-Eyed Beginners (4 pairs), advanced to and completed Curious Comparers (4 pairs), unlocked Challenge, then replayed Starter to completion. Next chapter after replay selected Curious Comparers (the next sequential band), not Challenge. Replay pair order differed from the initial run. The blank-area wrong selection left progress unchanged and showed retry/clue feedback; visible target selections completed each pair. Screenshots: `.playwright-cli/page-2026-10-02T06-32-01-611Z.png`, `.playwright-cli/page-2026-10-02T06-32-34-094Z.png`, `.playwright-cli/page-2026-10-02T06-33-23-776Z.png`; post-navigation snapshot `.playwright-cli/page-2026-10-02T06-33-24-969Z.yml`.
- **Sky Shapes final progress delta:** opened Kite at 390×844, focused the visible tracing board, pressed Enter and followed the visible keyboard guide with 40 Space presses. The outcome displayed flight progress `100%`, three earned stars, and “95% accurate.” The percentage display is complete and no longer off by one; the drawing itself was not a perfect trace, so the separately displayed accuracy correctly remained 95%. Screenshot/snapshot: `.playwright-cli/page-2026-10-02T06-35-24-931Z.yml`.
- Parent independently completed all three Sky bands by mobile touch on 5285 with 100% accuracy and 3 stars, plus 100% mission progress; that separate evidence is not represented as my run.
- **Scope left open:** Monster Math’s exact 11+2 question was not encountered in the UI; the builder has a separate model/unit-test fixture, not equivalent to an observed browser prompt. No physical speaker output was verified. These are local frozen-candidate checks only, not production release evidence.


## 5285 Puzzle Pop Challenge completion

- In the existing isolated Amari session at 390×844, selected the already-unlocked `Detail Detectives` Challenge band and started its four 5×5 puzzles: World Explorer, Time Observatory, History Hall, and Nature Lab. For each of the 100 piece placements, requested the on-screen Hint, read the visible piece number, selected that accessible piece button, and selected its highlighted matching board space. The four picture facts appeared on completion before Next. Challenge finished with “Detail Detectives complete!” and “Leaves can have different shapes, but they all help plants use sunlight.”
- “See chapter reward” left the completion/reward view accessible; it did not trap navigation. “Replay pictures” started a fresh 5×5 puzzle board in the same chapter. Back to learning world presented the standard confirmation; confirming Back to world returned to Creative Lab. The parent world showed Puzzle Pop played count 4. Final completion snapshot: `.playwright-cli/page-2026-10-02T06-41-34-479Z.yml`; reward-button snapshot `.playwright-cli/page-2026-10-02T06-41-46-205Z.yml`; replay snapshot `.playwright-cli/page-2026-10-02T06-41-58-235Z.yml`; parent return `.playwright-cli/page-2026-10-02T06-42-18-986Z.yml`.

## Independent local editor scores

These are local editorial scores across the separately identified 5283, 5284 and 5285 candidates. They are not 4.5 acceptance or production scores: the full three-seeded-desktop plus three-seeded-mobile gate and all screenshots/interaction checks were not repeated on one final production identity. The earlier 5283 run matrix and 5284 persistence/export evidence remain useful, while 5285 closes the listed repair deltas.

| Game | Local score | Evidence-based reason | Remaining limit before 4.5 acceptance |
|---|---:|---|---|
| Puzzle Pop | **4.0/5** | Twelve scenes span 2×2, 3×3 and 5×5; previews, visible hint feedback, piece/space play, facts, rewards, replay order changes and sequential unlocks were exercised. 5285 completed the entire 5×5 Challenge via presented controls, checked See chapter reward, Replay pictures, and parent return. | Repeat the complete evidence gate on the final release identity, including three seeded desktop and three seeded mobile runs, full run logs/screenshots and asset/console review. No physical narration output claim. |
| Spot the Difference | **4.0/5** | Twelve paired scenes span 3/5/7 targets. A deliberate blank miss preserved progress and offered feedback; magnifier/clue, found counters, scene facts, full Starter and Growing rewards, changed replay order and 5285 sequential progression after replay were observed. 56px hotspot sizing is recorded in earlier candidate evidence. | Repeat the six-run gate and target-size/asset/console checks on the final release identity. Current focused 5285 delta did not complete the full Challenge band. |
| Sky Shapes | **4.0/5** | Twelve missions span three skies with simple and compound shapes. Keyboard tracing, mobile progress correction to 100%, reward/leave, and parent’s separate 5285 actual-touch runs across all three bands were observed; seed/queue rotation evidence exists on earlier local candidates. | Reconfirm the complete seeded viewport matrix, seed diagnostics, queue/reward persistence and all pointer methods on one final release identity. My 5285 Kite run showed 100% mission progress but 95% route accuracy; parent’s separate touch run showed 100% accuracy. |
| Monster Math | **4.0/5** | Three six-question episodes exercise counting, arithmetic and stories; visible retry/clue, answer explanations and episode rewards align on observed questions. Earlier local evidence has three seeded desktop runs and six seeded mobile episodes; latest 5284 export and gameplay are documented. | Full gate on final identity; exact 11+2 was not naturally shown in my browser run. Use the existing model tests as supporting evidence, not a substitute for a live prompt. No physical speaker output claim. |

All four remain **local/in progress** against the roadmap until the final immutable production build passes its own acceptance gate. No 4.5 score is awarded here.
