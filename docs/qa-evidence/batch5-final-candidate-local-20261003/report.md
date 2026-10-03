# Batch 5 independent local QA — original frozen candidate

Date: 2026-10-03 (Europe/London)  
Candidate: `http://127.0.0.1:5241`, source `9b079bc01d14e80df9ac2b9294effd70cdb792b0`  
Identity: [`batch5-final-candidate-identity-20261003.json`](../batch5-final-candidate-identity-20261003.json)

## Method and boundary

Used fresh isolated Playwright profiles with `/api/voice` and `/api/story` guarded to return 204 before opening each candidate. Verified the routes in the browser. No progress seeding, storage edits, answer extraction, fake audio, provider calls, or generated story calls. Profiles and progress were created through the rendered player/settings/game controls. Viewports were 1280×800 and 390×844.

This is local browser evidence for the named frozen build only. It does not establish production, packaged-media, or full narration/listening acceptance.

## Actual chapter coverage

| Game | Desktop 1280×800 | Mobile 390×844 | Result |
|---|---:|---:|---|
| Sound Safari | 3 chapters × 6 rounds | Chapter 1 × 6 rounds; Chapters 2–3 blocked | Desktop playable using visible authored clues. Mobile later blend/find rounds were not guessed: necessary pure phoneme recordings are missing and the visible clue is insufficient to determine the answer. |
| Spelling Studio | 3 × 6 | 3 × 6 | Completed all rounds using displayed picture/word clues and actual grapheme tiles. Phase 2 and later graphemes were enabled in Grown-ups settings through the UI. |
| Colour Mixing Lab | 3 × 6 | 3 × 6 | Completed all rounds, including visible recipes, named inputs and result colours. |
| Odd One Out | 3 × 6 | 3 × 6 | Completed all rounds, including named rule, selected item and reason controls. |

Wrong choices showed explanatory retry feedback and did not advance; correct choices provided held feedback and an explicit Next action. Hint controls were used in ordinary play. Representative desktop and mobile scenarios covered object and reason selection, sound blending/phoneme matching, grapheme construction, recipe selection/mixing and number/property classification. This is not a claim that every wrong/hint/correct permutation was repeated in every round.

## Findings

1. **Colour Mixing design mode duplicates an input.** On a selected Red + Yellow orange-sunset recipe, the screen showed the recipe graphic and a separate `Added Yellow` chip, visually presenting yellow twice. The same issue was visible in a mobile design brief. See `screenshots/5241-desktop-colormix-design-duplicate.png` and `screenshots/5241-mobile-colormix-duplicate-recipe-input.png`.
2. **The mobile daily challenge tracker covers game controls.** At 390×844, the floating `Complete 3 astronaut questions` widget overlaps the bottom-right hint area in Colour Mixing and Sound Safari. See `screenshots/5241-mobile-colormix-daily-tracker-overlap.png` and `screenshots/5241-mobile-soundsafari-hint-overlap.png`.
3. **Phoneme media is missing.** A real browser request to an authored pure-sound asset returned 404, and the game reports that the recording is not packaged yet. The Sound Safari mobile Ch.2/3 rounds therefore remain unverified. Desktop completion relied on visible authored clue text and must not be described as listening acceptance.

## Progress, parent controls, and diagnostics

- Normal UI progression earned badges and stars; the child home shelf showed the earned progress after returning from games. A same-profile reload on `#/play/oddoneout` retained the route and completed Odd One Out badges/best stars.
- The actual Back to learning world control showed `Leave the game?`; `Keep playing` retained the active game, and `Back to world` returned to the world screen.
- Grown-ups troubleshooting export was triggered with its visible `Download game log` control. The downloaded diagnostic was inspected locally and not committed. It contains bounded event identifiers/outcomes and safe boolean correctness fields; no answer text or child name/story content appeared in the exported event record. The UI describes the scope of retained log data.
- Exact best-star improvement credit on same-band replay at both viewports, sibling-profile isolation, and a reload in every game were not independently established in this run. Those are open QA items; do not infer them from chapter completion or the diagnostics export.

## Runtime and console

The `/api/voice` and `/api/story` guards were active in every tested context. Browser console/resource errors were the missing phoneme media requests (six on mobile and about 21 on desktop across the exercised phonics routes); no other repeatable UI/runtime failure was observed. Native listening, complete narration assets, packaged offline audio, and production behavior remain separate gates.

## Disposition

The 5241 candidate has confirmed mobile layout and Colour Mixing design defects, and a known missing-audio gate. Do not accept this candidate for release based on source tests/build or this local UI pass. A separate 5255 delta report records the repair candidate checks; its results do not change these findings for 5241.
