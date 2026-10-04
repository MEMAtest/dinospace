# Guarded continuation — frozen vehicle candidate, 2026-10-04

This continuation supplements the original report without changing its harness-timing note.

## Pre-navigation guard evidence

A new unique CLI browser session, `vehicles-a59482a7-guarded-20261004`, was opened at `about:blank`. Before the first navigation to the app origin, both routes were installed and `route-list` confirmed:

- `/api/voice` → HTTP 403, body `blocked-by-independent-qa`
- `/api/story` → HTTP 403, body `blocked-by-independent-qa`

Only then did the session navigate to `http://127.0.0.1:5312`. Both guards remained present after gameplay and reload. The complete static request log had no `/api/voice` or `/api/story` entries. Sound was not enabled for the exercise.

## Fresh ordinary unlock and board checks

In this isolated context, selected Amari using the visible profile chooser, entered Thinking & Play → Memory Match, completed Levels 1–5 by visible card flips and visible Next level controls, then completed Level 6 the same way. The observed Level 6 result was “All Kinds of Vehicles,” 28 cards, 14 pairs. The card helper read labels only after the corresponding rendered card had visibly flipped face up; it did not read hidden card fronts or answer/deck state.

The desktop 1280×800 board completed with all 28 cards matched. Labels included two each of Aeroplane, Helicopter, Steam Train, and Passenger Train; corresponding images were rendered and loaded. At 390×844, the same visible Level 6 board completed with all 28 cards matched, the same four pairs, rendered images loaded, and document scroll width 390. Mobile card-front images rendered at 63.4×30.4 inside the 82×82 card controls. The face-down checks at both sizes showed 28 face-down card buttons and zero card-front image elements. All ten level selectors measured 48×48 desktop and 53.5×48 mobile; document scroll widths were exactly 1280 and 390 respectively.

After mobile completion, a page reload returned to a face-down “Yummy Feast” board while retaining the Amari profile and enabled Level 6 selector. Re-selecting Level 6 worked. This establishes profile and earned unlock persistence, not same-board in-progress persistence.

## Identity and runtime diagnostics

The four candidate illustration URLs returned HTTP 200. The streamed SHA-256 hashes matched the frozen identity exactly:

- Aeroplane `8f45a3c6795eaeeeb710f12d9ea8b11ad42dd0c182b69e807596329bb28042cb`
- Helicopter `5a7d33f9a8f67450e9d7e0837c8350da133db11ba6c1f65449bc0f2ea66305d8`
- Steam Train `ac3797f937eb9ff4b8ede0175755e345190b73e8e86d963670ffae804d7620b1`
- Passenger Train `d97ddbb06ce047755d7ce4dd41f1b30a48670ff5bb90d2b756aabde6457614e9`

Playwright console inspection after the guarded run reported zero errors and zero warnings. No voice or story provider request was observed; local static audio assets in the app are outside the guarded provider endpoints.

## Screenshots

- `vehicles-guarded-level6-desktop-facedown.png`
- `vehicles-guarded-level6-desktop-completed.png`
- `vehicles-guarded-level6-mobile-facedown.png`
- `vehicles-guarded-level6-mobile-completed.png`

This remains local frozen-candidate evidence. It does not claim production, listening, human-device, full-premium-art, or 4.5 acceptance.
