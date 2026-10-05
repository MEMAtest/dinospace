# Batch 6 cumulative integration UI delta

Date: 5 October 2026

## Candidate and setup

- Frozen runtime source: `7c350f4bff66c1e9aff922cb5ee98e0fdd1d4ef8` on `codex/amari-batch6-cumulative-20261005`.
- Frozen build: the existing `dist/` directory bound by `docs/qa-evidence/batch6-cumulative-integration-20261005/identity.json` and `dist-sha256-manifest.json`; no rebuild was performed.
- Build identity: 5,879 manifest entries, 0 missing and 0 byte/hash mismatches. Compact manifest SHA-256: `fcdd380858803bb1bf97d6483136a424e81698b51079152c52a5a148f6558747`.
- Served locally from the frozen `dist/` at `http://127.0.0.1:5398/` in the existing Playwright `default` tab. No browser, window, context, or tab was launched.
- Before app navigation, installed `/api/voice` and `/api/story` 403 routes, verified both with guard probes, and confirmed both routes in `route-list`. The app emitted no voice/story API resources during this check. Sound was switched off using the visible control and remained off (`Turn sound on`) through both widths.
- Synthetic local profile showed Amari with 0 stars; no progress, seeds, answers, or storage were injected. The candidate remained local and undeployed.

## Actual UI paths

Each game was entered through its visible world card and first available chapter, at 390×844 and 1280×800. I exercised one prompt/move, viewed the response state, and used the normal Back/Leave flow to return to the parent world.

| Game | Visible entry path | 390×844 action and held state | 1280×800 action and held state |
|---|---|---|---|
| Pattern Parade | Thinking & Play → Pattern Parade → Repeat it | On a visible dog/cat AB pattern, selected dog. The held panel explained the AB rule and showed “Next pattern.” | On a visible dog/cat AB pattern, selected dog; the same rule explanation and Next control appeared. |
| Dino Hangman | Read & Write → Dino Hangman → Same word ending | With the visible “-ap” ending, guessed Z (supplies decreased from 6 to 5), then A appeared in the word. | With the visible “-at” ending, guessed A; A appeared in the word. |
| Chess Explorers | Thinking & Play → Chess Explorers → Piece moves | Followed the visible rook instruction from c1 to the star at a1. Held “Rook move solved” explanation and “Next puzzle” appeared. | Followed the visible rook instruction from b1 to b4. Held “Rook move solved” explanation and “Next puzzle” appeared. |
| Astronaut Academy | Explore & Languages → Astronaut Academy → Space science | Answered the rover-camera question with “See pictures of the place it explores.” Held response included the camera fact, science-source link, and “Next mission.” | Answered the spacesuit question. Held response included the air/safety fact, NASA link, and “Next mission.” |

All four games’ visible Back control opened a confirmation. Choosing Leave/Back to world returned to the game’s parent world; Back to home then returned to the main Amari home. I did not complete chapters or test scoring, replay, or long-term persistence. On the first Astronaut question, the displayed mission type was “Mission engineering” while the selected route title was “Space science”; the question and held fact were coherent. This sample does not assess mission-to-chapter editorial mapping.

Screenshots preserve one mobile and one desktop state for each game, plus mobile home:

- [Pattern mobile](screenshots/pattern-mobile-held.png), [Pattern desktop](screenshots/pattern-desktop-held.png)
- [Hangman mobile](screenshots/hangman-mobile-guess.png), [Hangman desktop](screenshots/hangman-desktop-guess.png)
- [Chess mobile](screenshots/chess-mobile-held.png), [Chess desktop](screenshots/chess-desktop-held.png)
- [Astronaut mobile](screenshots/astronaut-mobile-held.png), [Astronaut desktop](screenshots/astronaut-desktop-held.png)
- [Mobile home](screenshots/home-mobile.png)

## Layout, assets, and requests

At each active game prompt, rendered document width equaled viewport width, with no horizontal overflow and zero broken `<img>` elements:

| Game | 390px document width / height | 1280px document width / height |
|---|---:|---:|
| Pattern Parade | 390 / 844 | 1280 / 800 |
| Dino Hangman | 390 / 885 | 1280 / 1065 |
| Chess Explorers | 390 / 968 | 1280 / 1095 |
| Astronaut Academy | 390 / 844 | 1280 / 800 |

Hangman and Chess require vertical scrolling at both sizes; no horizontal clipping was measured. In the final app view, 59 browser resource entries were present, with no status ≥400, no broken images, and no `/api/*` resources. The final app console was empty (0 errors, 0 warnings). The two deliberate guard-probe navigations returned 403; one produced the expected browser console message because the 403 text response was opened as a document. This was separate from app navigation.

## Limits

This is a bounded UI routing and first-interaction check of the local cumulative build, not a full mechanics matrix. It does not verify complete chapters, all questions, scoring/replay, profile persistence across reloads, Askia separation, native playback, packaged narration readiness, human listening, production deployment, or a 4.5 acceptance. The retained game-specific matrices remain prior evidence and were not repeated here.
