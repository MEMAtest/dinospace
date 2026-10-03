# Batch 5 narrow mobile repair delta — independent browser QA

Date: 2026-10-03 (Europe/London)  
Candidate: `http://127.0.0.1:5255`, source `99ed1955131bd53b9738264edcde4e2091ad6e5e`  
Identity: [`batch5-mobile-repair-identity-20261003.json`](../batch5-mobile-repair-identity-20261003.json)

This is a narrow 390×844 delta only. The full chapter matrix belongs to the separate frozen 5241 report and is not being transferred to this candidate.

## Method

Used a fresh isolated browser profile, guarded `/api/voice` and `/api/story` to return 204 before candidate navigation, then selected Amari and played through normal UI controls. No storage injection, hidden-state changes, answer extraction, fake audio, paid provider calls, or generated stories. The actual phoneme request was allowed to run and returned its normal 404.

## Results

- **Colour Mixing duplicate ingredient:** Started from a normal new profile, unlocked Chapters 2 and 3 by completing Chapters 1 and 2 through the UI, then selected the visible Red + Yellow recipe for the orange sunset design prompt. Rendered inputs showed only the Red + Yellow recipe with two swatches; the duplicate `Added Yellow` chip was absent. See `screenshots/5255-mobile-colormix-single-recipe-input.png`.
- **Colour Mixing wrong/hint/correct/Next:** In Chapter 3, an incorrect recipe showed `Try again` and no Next button. `Use one hint` displayed the authored yellow-and-blue/green clue and disabled the one-use hint. Selecting Yellow + Blue showed `Mixed Green` and enabled `Next recipe`.
- **Daily tracker overlap:** The floating `Complete 3 astronaut questions` tracker was absent from active gameplay screens for Colour Mixing, Sound Safari, Spelling Studio and Odd One Out. Their game controls and hint controls were visible within the 390×844 view. Screenshots: `screenshots/5255-mobile-soundsafari-control-layout.png`, `screenshots/5255-mobile-spellingstudio-control-layout.png`, `screenshots/5255-mobile-oddoneout-control-layout.png`; the Colour Mixing screenshot above also shows the active mobile layout.
- **Parent flow:** Colour Mixing and phonics Back controls opened `Leave the game?`. `Keep playing` left the game active; confirmed `Back to world` returned to the corresponding world screen.
- **Missing packaged audio remains:** On Sound Safari Chapter 1, `Use a hint` remained visible and usable. Clicking `Hear the pure sound` / hint requested `/audio/phonemes/en/t.mp3`, which returned 404; the visible status said `The recording for /t/ is not packaged yet.` I did not guess an answer or claim listening acceptance.

## Scope and disposition

The two targeted mobile control repairs pass this narrow actual-UI delta at 390×844. No 1280×800 repair-candidate delta, full chapter matrix, replay-star accounting, sibling isolation, or complete voice/listening validation was performed on 5255. The original candidate report remains separate. These results do not establish full Batch 5 acceptance, production acceptance, or native narration readiness.
