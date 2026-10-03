# Batch 6 independent local UI QA

Date: 2026-10-03  
Tester: independent Playwright UI pass  
Scope: Pattern Parade (`pattern`), Chess Explorers (`chess`), Dino Hangman (`hangman`), Astronaut Academy (`astro`). Amari chapters only. Local frozen candidates; no deployment or scoring acceptance.

## Result

The four games completed the assigned desktop and mobile UI gameplay scope across the candidate lineage below. Candidate-specific defects and their repair checks are kept separate. The 5265 mobile run exposed a real daily challenge overlay that blocked centered navigation controls after the challenge reached 3/3. Candidate 5267 suppresses the floating tracker in the tested gameplay shells; centered Next controls worked in Astronaut Academy, Pattern Parade, Chess Explorers and Dino Hangman after 3/3. This confirms a focused UI repair delta, not full release acceptance.

## Frozen candidates and identity

| Candidate | Source SHA | Identity evidence | UI scope |
|---|---|---|---|
| `http://127.0.0.1:5251` | `e7ec3f550177f937cb7a5d021dae8447aaf18d3b` | [`batch6-initial-candidate-identity-20261003.json`](../batch6-initial-candidate-identity-20261003.json) | Preserved initial Pattern routing failure only. The first browser's apparent bundle mismatch was later not reproduced by the root's direct HTTP fetch; do not treat it as confirmed server mutation. |
| `http://127.0.0.1:5253` | `75abaf74a66ed87bfed3c09de2ec020c059d875e` | [`batch6-route-repair-identity-20261003.json`](../batch6-route-repair-identity-20261003.json) | Full desktop baseline after correct Amari routing: Pattern 3×6, Chess 3×5, Hangman 3×6, Astronaut 3×6. Older mechanics/copy issues below were found and carried as candidate-specific defects. |
| `http://127.0.0.1:5259` | `555d7f0b59c21f550b44a82d2b59ba7599f0b6bd` | [`batch6-mechanics-repair-identity-20261003.json`](../batch6-mechanics-repair-identity-20261003.json) | Desktop targeted recheck of Pattern, Chess and Astronaut mechanics. |
| `http://127.0.0.1:5261` | `7d535a7` (prefix recorded by the frozen identity) | [`batch6-word-copy-final-identity-20261003.json`](../batch6-word-copy-final-identity-20261003.json) | Hangman visible clue/copy repair lineage; gameplay findings were then exercised on 5265. |
| `http://127.0.0.1:5265` | `62b462f725d3651ba96722b5640a0203253f18cc` | [`batch6-visible-clue-final-identity-20261003.json`](../batch6-visible-clue-final-identity-20261003.json) | Full mobile all-four-game matrix; revealed daily tracker overlay defect. |
| `http://127.0.0.1:5267` | `c8b76e8a868b43490c72ed8a54672c85e01f5bc2` | [`batch6-tracker-final-identity-20261003.json`](../batch6-tracker-final-identity-20261003.json) | Fresh guarded mobile confirmation of overlay suppression across all four game routes and centered navigation. |

For each browser-tested candidate, all five served static assets were independently fetched over HTTP and matched its identity manifest. The 5265 and 5267 checks included `sw.js`, `web` bundle, main `index` bundle, `SolarSystem` bundle and CSS. Root-reported test/lint/production build results are recorded in their identity manifests; this report is UI evidence, not a repeat of those gates.

## Guarded setup

Every fresh candidate browser context installed blocking route handlers for `/api/voice` and `/api/story` before the first app navigation (status 403). App setup used normal UI to select Amari and navigate to games. Sound remained off. No provider-generated data, paid call, hidden answer/guide state, storage injection, seed injection, or artificial progress update was used. All progress resulted from visible ordinary game actions. Profiles were isolated by candidate and Playwright session.

## Full desktop baseline on 5253

The route-repair candidate was exercised at desktop size through all three chapters and fresh same-band replays. Pattern Parade completed 3 chapters × 6 questions; Chess Explorers 3 × 5; Dino Hangman 3 × 6; Astronaut Academy 3 × 6. Chapter locks and unlocks followed completion. This is historical desktop coverage for unchanged game geometry and gameplay, not evidence that later changed copy or tracker UI was accepted on 5253.

The initial Pattern observations on 5251 are recorded separately in [`batch6-initial-pattern-qa-local-20261003/report.md`](../batch6-initial-pattern-qa-local-20261003/report.md). That candidate showed a five-question legacy flow with no explicit held Next and a sequence explanation mismatch. Root traced the route problem to the Amari wrapper selecting legacy Askia components; 5253 exercised the corrected six-question chapter flow.

## Mechanics repair delta on 5259 (desktop)

- **Pattern Parade:** visible sequence choices included the expected next term; the AAB-repeat clue named the two-term unit. Wrong-answer feedback invited restarting the whole visible pattern without losing the question; the subsequently correct answer explained the rule. Twelve observed choices were unique within their question. The full baseline on 5253 already covered all 18 questions.
- **Chess Explorers:** a blocked knight move into a pawn-occupied square did not count as a legal destination. The clue highlighted legal squares. A wrong destination gave legal-move feedback; the correct destination cleared stale error state and held success. Safe capture visibly removed the captured piece. First chapter 5/5 completed.
- **Astronaut Academy:** the clue became a visible fact on the later candidate; correct retry cleared the prior wrong response and showed a single fact/source card. The question prompt concerned solar panels converting sunlight to electricity. The pill said “Mission engineering” while the chapter route was “Space science”; parent review established the pill refers to mission kind, so this is recorded as mixed labeling context, not a route/progression failure.

A screenshot of the 5259 visible chess legal-move board is included below.

## Full mobile matrix on 5265 (390×844)

### Pattern Parade

Completed all three chapters and all six questions per chapter (18/18). The visible AB-repeat clue described the first two positions as the repeat unit. Questions had usable, distinct answer choices in observed prompts; wrong and correct response paths were exercised. The completed-band replay used a different visible sequence from its earlier run, confirming replay variation. Chapter completion showed 2–3 stars and opened the next chapter normally.

### Chess Explorers

Completed all three chapters and all five questions per chapter (15/15). Piece moves, safe captures and mini-puzzles were exercised. The legal-move clue visibly marked destinations, blocked/friendly occupancy was respected in the desktop mechanics run, and correct moves advanced only after explicit Next. Chapters unlocked in order; each completed band showed three stars.

### Astronaut Academy

Completed all three chapters and all six questions per chapter (18/18). On the first chapter, the first visible question concerned a spacesuit; the next prompts included rover wheels and the Moon’s travel around Earth. A visible mission clue supplied a usable fact, and the correct retry cleared the previous error and displayed one NASA fact/source card. The desktop 5259 mechanics probe separately exercised an incorrect fan answer for a solar-panel question, then “Electricity”; that visible retry cleared the error and displayed one fact/source card. The passport retained six different fact cards for that chapter and 18 across all three chapters without duplicate question facts. The immediate replay changed the first question/concept. Chapters unlocked in order and completion stars were visible.

The mobile home showed the daily challenge “Complete 3 astronaut questions.” After this reached 3/3, the floating award badge overlaid the lower-right/central navigation area, intercepting centered Next/back button clicks. The 5265 screenshot is preserved. The run used the unobstructed left edge to continue; this workaround is evidence of the issue and is not a pass for the blocked target.

### Dino Hangman

Completed all three chapters and all six questions per chapter (18/18). Word-family rescue included a six-miss failure at zero supplies, neutral retry copy and “Try word again” restoring the supplies for the same prompt. Picture clues named the clue and explicitly revealed the first letter; one visible prompt was PEN. Independent rescue visibly used initial blends (`tr-`, `cr-`, `gr-`, `st-`, `sp-`, `cl-`). Wrong and correct letters were exercised; completed words held until Next. All chapters completed with visible stars. There were no provider calls.

## Daily tracker repair delta on 5267 (390×844)

On a fresh guarded profile, I completed three Astronaut Academy questions using the visible route, reaching daily challenge 3/3. The fixed floating tracker was absent from the gameplay snapshots. Centered “Next mission” advanced normally. The same no-overlay check and centered Next action passed on Pattern Parade and Chess Explorers. Dino Hangman showed the ordinary locked chapter map; after starting Word-family rescue, visible prompt “A metal container for food” resolved as TIN through ordinary letter buttons, showed held success and a one-fact explanation, and centered “Next word” advanced from question 1 to question 2. The tracker did not cover its map, prompt or action.

This candidate changes the shared App rendering for the tracker, so the 5267 result is a targeted fix delta. It does not replace the 5265 all-question matrix or establish other gameplay changes.

## Evidence screenshots

- [`5265-astronaut-daily-tracker-overlaps-navigation.png`](screenshots/5265-astronaut-daily-tracker-overlaps-navigation.png): reproduced 3/3 tracker covering lower navigation area.
- [`5267-hangman-no-overlay-success.png`](screenshots/5267-hangman-no-overlay-success.png): held TIN success after daily tracker completion, before centered Next advances.
- [`5259-chess-visible-legal-moves.png`](screenshots/5259-chess-visible-legal-moves.png): legal-destination clue on mechanics candidate.

## Limits and remaining gates

- Narration inventory and playability remain a separate gate. This QA kept sound off; no human listening, full audio acceptance, or 4.5 acceptance is claimed.
- No production URL, production data, provider service, paid voice/story call, final reward audit, Grown-ups export/privacy audit, or whole-app acceptance was performed here.
- The present work proves local behavior for the exact frozen candidates listed. All four Batch 6 games remain unscored pending the remaining release gates.
