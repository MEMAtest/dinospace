# Batch 5 reliability delta — Colour Mixing Lab and Odd One Out

Date: 2026-10-04 (Europe/London)  
Candidate: `http://127.0.0.1:5255/`  
Frozen source: `99ed1955131bd53b9738264edcde4e2091ad6e5e`  
Identity: [`batch5-mobile-repair-identity-20261003.json`](../batch5-mobile-repair-identity-20261003.json)  
Scope: saved chapter progress/palette, same-band replay accounting, and child-switch isolation on the frozen 5255 candidate.

## Lineage and method

The complete three-chapter, six-round-per-chapter mechanics matrix for both games at 1280×800 and 390×844 remains the separate 5241 baseline: [`batch5-final-candidate-local-20261003/report.md`](../batch5-final-candidate-local-20261003/report.md), source `9b079bc01d14e80df9ac2b9294effd70cdb792b0`. The 5255 mobile repair delta is separately recorded in [`batch5-mobile-repair-local-20261003/report.md`](../batch5-mobile-repair-local-20261003/report.md). This report does not recast either run as fresh 5255 evidence or repeat those full matrices. It adds the reliability checks below against the exact frozen 5255 runtime.

Used two fresh Playwright sessions at 1280×800 and 390×844 with empty ordinary UI progress at session start. Each session began at `about:blank`; handlers for `/api/voice` and `/api/story` were installed before the first navigation and returned 204. Sound was muted through the visible control. No storage/progress/seed/answer injection, hidden-state reads, provider-generated stories, or provider calls were used. All chapter unlocks, answers, replays, and player changes used normal visible controls. The handlers were explicitly reinstalled immediately before the final reload in each session; earlier mobile reloads also produced only static network requests. The CLI reported no active route registrations after reload, so this report does not claim continuous interception after navigation. No voice/story UI was invoked and no dynamic API requests were observed.

All five served identity assets were freshly fetched from 5255 and SHA-256 matched the frozen identity: `sw.js`, `assets/web-C-RP8Nge.js`, `assets/SolarSystem-CKe_S6OO.js`, `assets/index-B6keyyuD.js`, and `assets/index-BP6YjlOz.css`. Browser console ended with zero messages/errors/warnings in both sessions. Network inspection showed only static requests and no voice/story requests.

## Findings

### Colour Mixing Lab — desktop 1280×800

- Completed Chapter 1 through the visible recipe choices. The run included wrong choices, retry feedback, and a hint. Its map showed Badge earned and `Best: ★`; the palette displayed Green and Purple.
- Reloaded the game route with the voice/story handlers installed. The saved palette (Green, Purple), Badge earned, `Best: ★`, and Chapter 2 unlock remained visible.
- Replayed Chapter 1 with a lower/equal-quality attempt: wrong choices were retried and the six recipes were completed. The palette added Orange, while the chapter stayed at `Best: ★` and the home total stayed at one star. This confirms the replay did not award another copy of the already-earned best.
- Replayed Chapter 1 again and answered the visible prompts correctly. The map increased to `Best: ★★★` and the Amari home total increased from one to three stars (+2). This is a real best-score improvement through ordinary UI, not a seeded score.
- On the chapter map, the selected chapter after reload was Chapter 2; Chapter 3 remained locked until further normal completion. The palette still showed the previously earned recipes.

### Colour Mixing Lab — mobile 390×844

- Fresh mobile profile completed the six visible Chapter 1 recipes: Yellow + Blue → Green; Find Red; Red + Yellow → Orange; Red plus Yellow to make Orange; Find Blue; Find Yellow.
- Completion showed the saved palette Green and Orange, Badge earned, `Best: ★★★`, and Chapter 2 unlocked. On reload, the palette recipe captions, badge, best score, and Chapter 2 unlock were still present; Chapter 2 was selected in the chapter map.
- This is mobile persistence/completion evidence only. A mobile same-band replay and a mobile positive score delta were not tested; the equal/lower and higher-score replay evidence above is desktop-only.

### Odd One Out — desktop 1280×800

- Completed Chapter 1 “Picture Groups” through normal controls. The first run included wrong item and reason choices, retries, and hints. The map showed Badge earned, `Best: ★`, and Chapter 2 unlocked.
- Replayed Chapter 1 with fresh visible puzzles, using hints and retries. The chapter still showed `Best: ★`; completing the replay did not increase the best or grant a duplicate chapter badge. This is desktop same-band no-extra-credit evidence. A later bounded follow-up below then improved this best through ordinary UI.
- Reloaded the Odd One Out route with handlers installed. Badge, `Best: ★`, Chapter 2 unlock, and selected Chapter 2 remained in the map. No claim is made that individual question answers or hint states are stored across reloads.
- The bounded follow-up below includes a higher-scoring desktop replay, improving the chapter best from ★ to ★★★. No claim is made about per-question history persisting across reloads.

### Odd One Out — mobile 390×844

- Completed Chapter 1 “Picture Groups” with visible semantic choices and reasons. Two rounds used the one-use hint; the resulting map showed Badge earned, `Best: ★★`, and Chapter 2 unlocked.
- Reload preserved the Badge, `Best: ★★`, and Chapter 2 unlock. This is a fresh mobile completion/persistence delta, not a full 3×6 matrix. A later mobile replay at the same profile's ★★★ cap kept that best unchanged; see below.

### Bounded follow-up, 4 October 2026

A separate fresh Playwright CLI session began at `about:blank`. `/api/voice` and `/api/story` route handlers were installed before the first app navigation, and `route-list` confirmed both handlers before and after navigation. Sound was muted through the visible control and remained muted for this session. This session did not reload the page.

- **Desktop Odd One Out:** From the visible Amari UI, completed Chapter 1 with a wrong item/reason and retry plus a hint. The map showed `Best: ★`. Replayed using the visible “Replay with new puzzles” control and answered the visible challenges correctly. The chapter best rose to `Best: ★★★` (+2 best stars); Chapter 2 was unlocked and no duplicate badge appeared. Screenshots: [before replay](screenshots/desktop-oddoneout-low-best-before-replay-followup.png) and [after replay](screenshots/desktop-oddoneout-best-three-after-replay-followup.png).
- **Mobile Odd One Out, 390×844:** In the same profile, replayed the chapter after the desktop run had already reached the ★★★ cap. The first visible item was answered incorrectly, the game showed its retry guidance, and the correct visible choice was then selected; the remaining visible questions were completed through UI controls. The map remained `Best: ★★★`; home showed three global stars. This is an equal-best capped replay observation, not evidence of sibling isolation or a mobile positive best delta. Screenshot: [mobile result](screenshots/mobile-oddoneout-best-three-after-replay-followup.png).
- **Bounded scope:** A mobile higher-best Odd One Out replay was not attempted because this profile was already at the three-star maximum. Mobile Colour Mixing same-band/equal-or-lower/higher replay remains untested. No fresh profile was created to fill a viewport/replay cross-product.
- **Identity and runtime checks:** Frozen source remained `99ed1955131bd53b9738264edcde4e2091ad6e5e`; all five served identity assets returned 200 and matched their frozen SHA-256 values. Static request inspection showed 10 successful static requests and no dynamic API requests. The two route handlers remained listed after navigation. Browser console had zero messages, errors, or warnings.
- No hidden state, storage, seed, answer, or progress injection/read was used; no provider call, narration playback, or listening judgment was made.

### Sibling-profile isolation — limited observation

Via the visible player chooser, Amari showed three stars after the desktop Colour Mixing higher-score replay. Switching to Askia showed `0 stars` and Askia’s separate “My stickers” surface; switching back to Amari retained the three-star display. This confirms only the displayed global star totals were separated in that chooser flow. Askia’s UI does not expose these Amari Colour Mixing/Odd One Out collections, so this is not proof of per-game palette/rule collection separation between siblings.

## Candidate-local sound preference defect

On both desktop and mobile 5255 sessions, the visible control was muted (`Turn sound on`) before reload. After reload it changed to `Turn sound off`, indicating sound had reset to on; I turned it off again through the visible control. This is a reproducible local-candidate preference persistence defect. Do not characterize it as a current production regression: the root has separately verified a later canonical sound-preference fix. This finding must remain in the history for 5255.

No narration was played or judged. Existing missing packaged audio remains a separate open gate; successful visual/reliability behavior here does not establish audio readiness, listening quality, production acceptance, or a 4.5 score.

## Coverage and remaining gates

| Check | Result | Limit |
|---|---|---|
| 5255 served identity | Pass; 5/5 served assets match frozen identity | Exact local candidate only |
| Colour Mix Chapter 1 palette and badge reload | Pass at desktop and mobile | Chapters 2–3 reload not repeated; baseline mechanics retained |
| Colour Mix equal/lower replay no extra best | Pass desktop | Mobile replay untested |
| Colour Mix positive best-star delta | Pass desktop, ★→★★★ (+2) | Mobile delta untested |
| Odd One Out Badge/best/unlock reload | Pass desktop and mobile | Per-question history is not claimed persisted |
| Odd One Out equal/lower replay | Desktop first replay ★→★; follow-up replay ★→★★★ (+2); mobile capped replay remained ★★★ | Mobile higher-best delta not separately tested; no per-question persistence claim |
| Sibling separation | Visible Amari/Askia global star display remained 3 vs 0 | Does not establish B5 collection/palette/rule isolation |
| Voice/story safety and console | Earlier sessions: guards reinstalled before reload, no dynamic API requests. Follow-up: both guards installed before first navigation and remained listed; no dynamic API requests; zero console messages/errors/warnings | Earlier reload sessions do not claim continuous interception; the follow-up did not reload |
| Audio and 4.5 acceptance | Not accepted | Human listening and remaining mandatory audio evidence are still open |

This is a reliability delta, not full Batch 5 or 4.5 acceptance. Do not convert untested cells into passes.

## Evidence

- [`desktop-oddoneout-equal-replay-best-star.png`](screenshots/desktop-oddoneout-equal-replay-best-star.png) — completed replay map, Best remains one star.
- [`mobile-colour-palette-after-reload.png`](screenshots/mobile-colour-palette-after-reload.png) — saved recipes, chapter badge/best and next chapter visible after reload.
- [`mobile-oddoneout-progress-after-reload.png`](screenshots/mobile-oddoneout-progress-after-reload.png) — Badge, Best, and Chapter 2 unlock after reload.
- [`desktop-oddoneout-low-best-before-replay-followup.png`](screenshots/desktop-oddoneout-low-best-before-replay-followup.png) — desktop chapter at one-star best before the clean replay.
- [`desktop-oddoneout-best-three-after-replay-followup.png`](screenshots/desktop-oddoneout-best-three-after-replay-followup.png) — desktop best rises to three stars after replay.
- [`mobile-oddoneout-best-three-after-replay-followup.png`](screenshots/mobile-oddoneout-best-three-after-replay-followup.png) — mobile replay at the profile's three-star cap.
