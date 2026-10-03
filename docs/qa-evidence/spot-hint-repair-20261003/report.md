# Spot the Difference hint repair — independent bounded QA

## Candidate and boundary

**Result: pass for the bounded hint/reset behavior at desktop 1280×800 and mobile 390×844.** Candidate `http://127.0.0.1:5204`, source `4cfaa789505758bd0b96114fcb609e293e8f746b`, frozen by root. Rendered JS `/assets/index-Dckzdv86.js` SHA-256 `4585129777a287697bf27be43e560159825723e295ac78bfe6928bce96f73c7c`; CSS `/assets/index-CU-OkS6z.css` SHA-256 `2613b85082a6ae658aaf50bd961b80106c8249c46da4366c7a7489d3052b9e7e`. Candidate voice flag is true.

Two fresh isolated Playwright contexts began at `about:blank`. Before the first app navigation, both installed 204 stubs for `**/api/voice**` and `**/api/story**`; sound was turned off through the app control. No state, seed, unlock or answer was injected. The only actions were normal profile/world/game selection, Magnifier, visible highlighted changed-detail buttons, Next picture, Replay chapter, and the visible grown-up diagnostic export. No provider call or audible review was made. Both consoles report zero messages, errors and warnings; request inventories show same-origin assets only. See `diagnostics/route-guards.txt`, `*-requests.txt`, and `*-console.txt`.

## Results

| Check | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| First Magnifier uses one of two tokens and displays amber pulse | Pass: `Check right top detail`; center (1139.6, 370.6); computed border `rgb(245, 158, 11)`, 2px; fill `rgba(253, 230, 138, 0.4)`; `animate-pulse`, z-index 20. | Pass: same accessible target; center (301.9, 718.1); same computed amber/fill/pulse styles. |
| Find the first hinted change, then use next Magnifier | Pass: actual highlighted target click moved progress to 1/3 and reduced token count 2→1. Next clue selected `Check middle top detail` at (954, 361.9), not the found target. Second use reduced 1→0. | Pass: visible target click moved to 1/3 and tokens 2→1. Second clue selected `Check middle top detail` at (195, 713.1), a different position from the found first target; 1→0. |
| Complete one pair and retain its fact until Next | Pass: completed Dino Park; UI fact was “Fossils are clues that help scientists learn about dinosaurs.” It remained on the completion screen until Next picture was selected. | Pass: same fact remained after a 1.4-second wait and through Next. **Editorial note:** the same sentence appears both in the top “Picture pair complete!” status and again under “Picture fact,” so completion copy is duplicated visually. Retain this observation for the next editorial pass; it is outside this hint-selector repair. |
| Next picture resets current pair controls | Pass: Pair 2 showed 0/3 and Magnifier 2 left. | Pass: Pair 2 showed 0/3 and Magnifier 2 left. |
| Replay chapter reset | Pass: after returning to the map at 1/4 earned, Replay chapter opened Pair 1 at 0/3 with two tokens. | Pass: same; earned progress remained 1/4, while replay started Pair 1 at 0/3 with two tokens. |
| Horizontal overflow | Full desktop view fit 1280px screenshot. | Measured document/body width 390px at 390px viewport. |

The first completed desktop/mobile pair and the chapter replay use actual UI-generated seeds recorded in the exports: desktop initial seed `1940058400` and replay seed `3697766741`; mobile initial seed `3892475542` and replay seed `1194911716`. The detailed hotspot coordinates, names, computed CSS and state resets are in [`hint-target-observations.json`](diagnostics/hint-target-observations.json). The actual troubleshooting downloads were saved by awaiting the browser download event and calling `download.saveAs`: [desktop export](diagnostics/desktop-game-log-ui-export.json) and [mobile export](diagnostics/mobile-game-log-ui-export.json).

## Evidence and scope

Screenshots include each viewport’s chapter map, pair start, first hint, first-hint-found state, second hint, pair completion, Next reset, and Replay chapter reset. Full artifacts are under `screenshots/`. This is a repair delta only; it does not repeat chapter bands or recertify gameplay, accessibility, canonical production, narration, audible output, or 4.5/5 editorial acceptance. No app source was edited by this QA.

## Additional regression: two consecutive hints without finding either target

This separately covers the selector regression case that the earlier “hint, find, hint” sequence did not isolate. Fresh contexts began at `about:blank`; before app navigation, each installed 204 stubs for `**/api/voice**` and `**/api/story**`. Sound was switched off via the UI. No answer, progress, seed, or unlock state was injected. From the visible Bright-Eyed Beginners chapter, I opened Pair 1 and pressed Magnifier twice without clicking either highlighted target.

| Viewport | First hint | Second hint (first target left unfinished) | Progress/tokens |
|---|---|---|---|
| Desktop 1280×800 | `Check left bottom detail`, center (780, 644.7) | `Check left middle detail`, center (791.6, 505.5) | 0/3 after each; 2→1→0; control reads `Magnifier 0 left` and is disabled |
| Mobile 390×844 | `Check left bottom detail`, center (94.8, 875.9) | `Check left middle detail`, center (101.5, 795.8) | 0/3 after each; 2→1→0; control reads `Magnifier 0 left` and is disabled |

At both steps and viewports the highlighted target had computed border `rgb(245, 158, 11)`, fill `rgba(253, 230, 138, 0.4)`, and `pulse` animation. Target labels and centers differ between hint one and hint two while found progress remains 0/3, so this directly demonstrates that an unrevealed hint target is excluded from the next hint selection. Third-use behavior was verified from the disabled UI state; no state change was induced. Mobile document horizontal width was 390px (viewport 390px); the highlighted hotspot is in the vertically scrollable game canvas and its measured center uses document coordinates.

Screenshots: [`desktop-no-find-hint1.png`](screenshots/desktop-no-find-hint1.png), [`desktop-no-find-hint2.png`](screenshots/desktop-no-find-hint2.png), [`desktop-no-find-third-disabled.png`](screenshots/desktop-no-find-third-disabled.png), plus the equivalent `mobile-no-find-*-390x844.png` files. Requests are same-origin local assets only; both new contexts logged zero console messages/errors/warnings. See the no-find diagnostics files. This is still bounded repair verification only, not a full-band re-run or 4.5 acceptance.

The additional case’s actual grown-up troubleshooting exports were saved with `download.saveAs` to [desktop export](diagnostics/desktop-no-find-game-log-ui-export.json) and [mobile export](diagnostics/mobile-no-find-game-log-ui-export.json). New request and console records are [desktop requests](diagnostics/desktop-no-find-requests.txt), [mobile requests](diagnostics/mobile-no-find-requests.txt), and [combined console record](diagnostics/no-find-console.txt); guard setup is recorded in [no-find-route-guards.txt](diagnostics/no-find-route-guards.txt).
