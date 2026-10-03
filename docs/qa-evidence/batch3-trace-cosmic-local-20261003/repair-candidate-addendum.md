# Frozen browser-repair candidate: focused Trace checks

Date: 2026-10-03  
Candidate: `http://127.0.0.1:5215`  
Source: `569953595e89eabf628a5fdc6e2a43541e2b19f2`  
Identity: [`batch3-browser-repair-identity-20261003.json`](../batch3-browser-repair-identity-20261003.json)  
App JS SHA-256: `77ddf33cd6560841426eb80c4f8e03bfc2c912d1b1dff7bc790c5b183769cb2e`  
App CSS SHA-256: `aa083338878e3f69d88a4c06d125f13ffa209ca3e32629be90482227184b4a4d`

This is a separate browser identity from the historical 5213 candidate. The earlier 5213 evidence remains valid for that build and still records the clipped desktop M start. This addendum records only the changed, repaired-candidate checks; it is not a full Letter Trace or Cosmic Tic-Tac-Toe acceptance run.

## Setup and isolation

- Fresh Playwright sessions `b3fix-desktop` and `b3fix-mobile`; desktop viewport 1280×800, mobile viewport 390×844.
- Both `**/api/voice**` and `**/api/story**` routes were installed before the first app navigation, and both route lists confirmed. App sound was turned off through its visible control. No app API/provider requests were observed; request inventories showed 13 static requests per session. Console inventories were empty (0 errors, 0 warnings).
- No local storage, progress, seed, answer, or game state was injected. Trace actions below used actual visible UI and Playwright mouse pointer input.

## Repaired Trace geometry and mechanics

At 1280×800, the canvas clipping wrapper measured `(x=165, y=249, w=950, h=384; bottom=633)` and the canvas measured `(x=169, y=253, w=942, h=376; bottom=629)`. On the M guide, both green start and red end points were at approximately `y=572`, inside the canvas and wrapper. A deliberately wrong start left progress at 0% and gave “Begin this stroke at the green 1.” Following the visible M guide from green start to red end reached 100%. Screenshot: `desktop/repair-M-complete.png`.

The desktop A and C paths were also completed with visible controls and real pointer input; after Check shape, one “You followed the letter. Great tracing!” heading and one “The explanation stays here until you are ready.” paragraph remained visible with a single “Next letter” action. Screenshot `desktop/repair-C-initial.png` shows the guide and contained canvas; the captured A feedback snapshot is in the Playwright CLI history (the viewport file was not saved at that step).

At 390×844, canvas measured `(x=29, y=327, w=332, h=397; bottom=724)` within wrapper `(x=25, y=323, w=340, h=405; bottom=728)`. `scrollWidth` equalled viewport width 390. A wrong start left progress at 0%. Completing stroke 1 and lifting showed 66% with “Start at green 2”; an incorrect second start preserved 66%; correct stroke 2 reached 100%. Check shape showed the held completion explanation and one Next letter action. Screenshots: `mobile/repair-A-initial.png`, `mobile/repair-A-allstrokes.png`, `mobile/repair-A-feedback.png`.

All measured Trace buttons were at least 48px high; the fixed header navigation and sound controls were 48×48. At mobile size the action rows extend to the viewport bottom and the document is vertically scrollable (scroll height changed from 999px during active tracing to 1211px with completion feedback). No horizontal overflow was observed.

## Keyboard alternative

An initial unfocused Space/arrow sequence had no effect, as expected when the guide has not received focus. The visible “Use keyboard” control changed the instruction to focus the guide, start with Space, advance along the dots with arrow keys, and finish with Space. Ordinary Tab navigation reached the board; `document.activeElement` was the canvas and its `tabindex` was `0`. On desktop M, Space started the stroke, four ArrowRight presses advanced through its five guide dots, and Space finished it at 100%. Check shape then showed the same held success feedback and a single Next letter action. Keyboard input is therefore operable when the guide is focused. This check did not inspect an exported learning event or the mastered-letter collection after keyboard completion, so keyboard-vs-handwriting mastery separation remains unverified.

## Additional 5215 Trace progression and learning-state checks

The same desktop profile completed Starter and Growing using normal Trace UI. Starter finished all eight rounds and awarded a badge; the map showed Growing unlocked. Growing was then completed through all eight rounds and awarded its badge. A reload returned to the home screen; selecting Letter Trace again showed the saved chapter progress and Growing unlocked. The visible map displayed `1 chapters earned · 2 letters independently mastered` after Starter, and `2 chapters earned · 2 letters independently mastered` after Growing. The typed keyboard path did not add handwriting mastery in this UI state. The Trace mastery's exact export semantics are still unverified: no diagnostic download was captured in this 5215 run.

Growing displayed a capital/lowercase pair in the actual UI: round 1 `I/i` asked for the capital, and round 2 `D/d` asked for the lowercase. Round 3 displayed capital A with two visible stroke markers, while the initial accessible label said “Stroke 1 of 1.” Activating the ordinary “Show this stroke” button rerendered it as “Stroke 1 of 2.” This is a real initial announcement mismatch on 5215 and is retained as a failure for this identity; it is not proof of the later 5219 repair.

The same profile entered Challenge normally and traced lower-case `t` to 100%, then saw shuffled word choices `PIN`, `TAP`, `CAT`. The wrong `CAT` choice gave a focused different-sound response; `TAP` displayed a single held success explanation and one Next action. One Challenge round was completed, not the full 8-round chapter. The parent Back action presented the shared “Leave the game?” confirmation; Keep playing retained the solved t→TAP state, and confirmed Back to world returned to the Read & Write world.

## Cosmic Tic-Tac-Toe: 5215 desktop and mobile UI checks

The desktop and mobile sessions entered Cosmic Tic-Tac-Toe through Thinking & Play with sound off and both API route guards already installed. No route was unguarded. No app requests beyond static assets were observed. Desktop console output remained empty; mobile console reported 0 errors and 0 warnings. Both contexts were isolated; no state or seed was injected.

At each viewport, all three tactic chapters were solved using actual board cells. Make a Line showed three separate numbered boards and completed 3/3. On the initial desktop run, board 1 was solved by completing a top row, board 2 by completing the first column, and board 3 by completing the top row. On desktop replay, three additional board layouts appeared; their visible board indices advanced 1/3, 2/3, 3/3 and the chapter completed again. The replay layouts differed from the first run, consistent with replay starting a new run seed. Thus the three boards in a run were exercised, but this did not prove same-seed board reproduction across reloads.

Block the Rocket completed 3/3 at both widths. Desktop included a direct correct block and a second board where Show hint visibly marked the winning blocking cell; choosing it produced one held explanation and Next tactic board. Find a Fork completed 3/3 at both widths; both visible direct play and the Show hint highlighted-target path were exercised. All completion screens showed a saved badge and unlock progression. On the mobile session, the ordinary chapter hints highlighted a board cell and the same cell accepted the move. Desktop intentionally selected the wrong Make a Line cell once; it disabled further board cells, showed “Not that square yet,” and exposed Retry this board. Retry restored a playable board.

Free play versus the Scout/Nova bot was sampled at both widths. After a real Dino move, the bot selected a legal Rocket square and play returned to Dino. On desktop, tapping header Leave game board showed “Leave this board?” with Keep playing and Leave board. Keep playing retained the exact cells. Tapping the internal Back to chapters control also showed this guard; Keep retained the same board and confirmed Leave board returned to the chapter map without a badge. This verifies visible cancel/leave handling, not every timer cancellation or terminal state.

At 390×844, the 3×3 grid cells measured approximately 98.39×98.39px, spanning x=39.4 to 350.6. All sampled control heights were at least 48px. `document.documentElement.scrollWidth` equalled `innerWidth` (390); vertical scrolling was needed for lower controls, which remained reachable. The mobile screenshots `mobile/cosmic-5215-board1.png`, `mobile/cosmic-5215-freeplay.png`, and `mobile/cosmic-5215-freeplay-top.png` preserve the board, active free play, and top-of-page control bounds.

Additional mobile free-play checks were made on the same 5215 profile. A terminal game ended with Nova Bot winning; after waiting two seconds the board and 0–1 score remained unchanged, with no extra move or reward. Reset during a pending bot response cleared the board and restored 0–0; after waiting 900ms there was no late bot move. In the app's ordinary profile switcher, Amari's Stickers view showed 12 stars and Cosmic Tic-Tac-Toe badges 3/3. Switching to Askia showed 0 stars and no Cosmic badge progress; reloading and switching back to Amari retained 12 stars and badges 3/3. This is evidence for the built-in profile switcher's separation and reload persistence, not a claim about arbitrary account isolation. Screenshots: `mobile/cosmic-5215-terminal.png`; the profile views and reset board were inspected in the same context but not separately saved.

This broad desktop/mobile run closes the ordinary-control chapter and badge flow for Cosmic at 5215. Same-seed board reproduction across reloads, diagnostic export, every bot difficulty, audio playback, and a separate-account isolation path were not inspected. The terminal wait, pending-response reset and built-in Amari/Askia profile separation are covered by the added observations above.

## Explicit remaining Trace scope

At 5215, desktop Starter and Growing were each completed 8/8 through ordinary UI, but Challenge was sampled only through its first `t`→`TAP` round (1/8). Mobile completed the corrected pointer interaction for one A round only; neither full Starter nor any later mobile Trace chapter was played. The one-round mobile trace covers geometry, wrong-start behavior, lift/retry preservation and held feedback, not chapter progression. Therefore full desktop Challenge and mobile chapter playthroughs remain pending. The separate 5219 identity below covers a full Starter run and only the first four Growing rounds; it does not close those gaps.

Keyboard tracing was operable after ordinary Tab focus and correctly completed the visible path. The UI's mastery count did not increase for the keyboard-path checks while the same desktop profile showed two independently mastered letters after the pointer-driven Starter/Growing work. This is only a visible-map observation: no diagnostic export was captured, so definitive keyboard-vs-handwriting event/reward exclusion remains unverified. The initial accessible stroke-count mismatch is a 5215-specific failure; the targeted correction is documented separately for 5219. No overall acceptance or numeric quality score is claimed.
