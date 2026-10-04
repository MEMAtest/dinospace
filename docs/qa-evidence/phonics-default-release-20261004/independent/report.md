# Shared Phase 2 default: bounded release-candidate UI regression

Date: 2026-10-04  
Candidate: frozen local `http://127.0.0.1:5365/`  
Source: `0d3ef056e569e3ef59763df388f26c3baa7783b8`  
Base production archive: `94d44d031d5835d0d9fa2128064ff83ba5880a62`  
Identity: [phonics-default-release-20261004/identity.json](../identity.json). The builder identity reports HTTP 200 and exact hashes for the served HTML, JS, and CSS. This is local candidate evidence; this candidate was not deployed.

## Guarded setup

Used a fresh Playwright CLI session `phonics-release-5365-20261004` opened at `about:blank`, installed `/api/voice` and `/api/story` HTTP 403 guards, and verified both before first app navigation. Viewport was 390×844. Sound was switched off before leaving the player chooser and Amari was selected through the normal profile card. No stored state, answers, or progress were injected.

## Default phase and restricted setting persistence

Opened Grown-ups through the visible home button and completed its three-second hold. The first settings view showed `Phase 2 · age 5-6`; the learning summary said `Recognises 0 of 23 selected sounds`. Expanded `Grown-up learning settings`: Phase 2 was selected and all 23 Phase 2 sound buttons were pressed.

As an ordinary settings change, tapped the visible `ff` sound button once. The learning summary immediately changed to `0 of 22 selected sounds`. Left Grown-ups, visited Letter Launch and Spelling Studio, returned home, and re-entered Grown-ups. The Phase 2 setting still showed 22 selected sounds and `ff` was visibly unpressed while the other displayed Phase 2 sounds remained pressed. This confirms both the fresh default and that an explicit restricted choice remains honored on subsequent navigation. Screenshot: [mobile Phase 2 settings with ff unselected](screenshots/mobile-settings-phase2-ff-unselected.png).

## Letter Launch, ordinary first level

Entered Read & Write → Letter Launch → Play Level 1. Invoked the visible `Hear the clue again` control with the app sound enabled for this packaged prompt; no claim is made about human listening quality. The first visible choice set was `I` and `T`. Selecting `I` produced the rendered retry feedback `Not quite. Listen for the first sound in Top again.` Selecting `T` produced held feedback `Well done! Top starts with the t sound.` and `Next mission`. Next mission replaced the prompt with a fresh visible `O`/`M` choice pair. The active round fit the mobile viewport; screenshot: [Letter Launch question](screenshots/mobile-letter-launch-first-question.png).

Used Back to learning world and the confirmation dialog's `Back to world`; it returned to Read & Write. No `/api/voice` or `/api/story` provider request escaped the installed guards. The audio interaction is not an acceptance of playback quality.

## Spelling Studio, one visible Copy word

Entered Spelling Studio through Read & Write. Its normal launch screen showed Level 1 of 3, `Copy the word`, then Play. The fresh displayed word was `SAT` with choices `t`, `s`, `a`. At the second word, the visible answer was `PAT`. Tapping `t` when the game expected `p` left the slots unchanged and displayed `The next letter is p`. Then selected `p`, `a`, `t` in order; the held result showed `Great job!` and `Next word` (2/5 skill-run progress). The active PAT prompt, wrong-tile cue, and held success are preserved in [the PAT prompt snapshot](snapshots/mobile-spelling-pat-current-word.yml), [the retry snapshot](snapshots/mobile-spelling-pat-wrong-tile.yml), and [the success snapshot](snapshots/mobile-spelling-pat-held-success.yml). This verifies the visible retry cue and success/Next behavior for the current spelling mode, rather than a Phase 2 chapter matrix.

Back to home opened the confirmation dialog; `Back to world` returned to Read & Write. Reentry through Home → Grown-ups confirmed the restricted `ff` choice remained off and the count stayed at 22.

## Diagnostics and scope

Playwright console reported 0 errors and 0 warnings. Network summary showed 33 static requests and no non-static requests; provider guards stayed installed before app navigation. Scope is one 390px candidate flow covering the Phase 2 default, one saved sound restriction and reentry, one Letter Launch wrong/correct held round, and a one-word Spelling Studio retry/success round. It is not a full game matrix, a human listening test, or an overall product acceptance.

## Desktop continuation, 1280 × 800

A separate new Playwright session, `phonics-release-5365-desktop-20261004`, began at `about:blank`; `/api/voice` and `/api/story` were blocked with HTTP 403 and verified in `route-list` before navigating to the candidate. Sound was switched off through the visible `Turn sound off` control. The session selected Amari normally and used the visible three-second Grown-ups hold.

Initial Grown-ups state showed `Phase 2 · age 5-6`, `0 of 23 selected sounds`, Phase 2 pressed, and all 23 Phase 2 sound buttons pressed. Tapping `ff` once visibly reduced the selected count to 22. After leaving settings, entering both games, and returning to Grown-ups, the count was still 22; Phase 2 remained selected and `ff` was visibly unpressed. Screenshot: [desktop Phase 2 settings with ff unselected](screenshots/desktop-settings-phase2-ff-unselected.png).

Letter Launch Level 1 showed a visible `L`/`N` pair. Choosing `L` produced retry feedback `Not quite. Listen for the first sound in Net again.` Choosing `N` held `Well done! Net starts with the n sound.` and `Next mission`; Next mission showed a new choice pair. Confirmed Back to world returned to Read & Write. In a second held-state capture, the visible word Ball was accepted by `B`, with `Super! Ball starts with the b sound.` Screenshot: [desktop Letter Launch held Ball](screenshots/desktop-letter-launch-held-ball.png).

Spelling Studio Level 1 showed the Copy mode and visible word `SAT`. On the visible `SAT` round, tapping `t` when `s` was expected left the slots unchanged and said `The next letter is s`. Selecting `s`, `a`, `t` produced held `Great job!` with Next word. Next word reset the prompt; confirmed Back to world returned to Read & Write.

Desktop console: 0 errors and 0 warnings. Network summary showed 25 static requests and no non-static requests; both provider guards remained installed. This continuation is local-only and does not establish human listening quality, provider audio, deployment, or full-game acceptance.
