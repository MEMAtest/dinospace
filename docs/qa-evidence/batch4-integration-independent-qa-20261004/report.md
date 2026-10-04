# Batch 4 integration candidate: independent bounded browser QA

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5360/`  
Frozen source: `8bb8d4bb5b3a28383fbf3ca4639553e8cb5b2cf2`  
Builder evidence commit: `bda5755b252e828e461719a974b0dd00950fd603`  
Identity and served-file manifest: [identity.json](identity.json), [served-assets-sha256.txt](served-assets-sha256.txt)

## Result

No integration blocker was reproduced in the assigned scope. The four games’ first chapters worked at 1280×800 and 390×844, the Maths and Time Detectives entry/return routes remained distinct across a reload, sound preference on/off survived reload, and the B3/B4 collection groups appeared together in Stickers. This is a bounded integration delta, not a fresh repeat of the full gameplay matrix or an overall acceptance decision.

## Candidate and safety checks

- Opened a fresh browser profile for each viewport. Before the first app navigation, registered routes for `/api/voice` and `/api/story` to return HTTP 204 and attached request logging. No voice/story request was observed during either session. The CLI route-list command did not enumerate routes installed from the Playwright callback after page reload; the report therefore relies on the actual pre-navigation callback and observed request list, not on route-list output.
- Used the visible Amari selector and ordinary game controls. No storage, progress, answer, child record, seed, or hidden state was injected. Sound was toggled only through its visible control and kept off during gameplay; no listening-quality claim is made.
- The frozen identity records a 5,879-file served manifest verification with zero HTTP errors and zero SHA-256 mismatches. I independently fetched and SHA-256 checked the served `index.html`, main JS, CSS, `AmariCountTheStars` JS, and `AmariLetterTrace` JS against that manifest; all five matched. The four B4 gameplay component source hashes in the identity match the unchanged files from the retained B4 baseline source commit `ac3b3ccaf03107749d865f8d79557e872a06c881`.
- Browser consoles reported zero errors, warnings, or messages. Playwright request summaries had no API requests; static requests returned without reported failures.

## Bounded gameplay and integration coverage

| Game / entry | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| Addition Adventure | Starter question: wrong answer, one hint, correct answer, held result tray/explanation and Next; Back opened leave confirmation; Keep playing retained the same solved question; Back to world returned to Maths Missions. | Starter question `4 + 3`: selected wrong `3`, used one hint, selected correct `7`; disabled choices, result tray, explanation and Next remained visible. Back/Keep retained the solved state, then Back to world returned to Maths Missions. |
| Subtraction Station | Starter first question: wrong answer, one-use hint, correct answer, held remaining tray/explanation and Next; leave confirmation and return to Maths Missions worked. | Starter `8 − 0`: selected wrong `6`, used one hint, selected correct `8`; remaining tray, explanation and Next remained visible. Back/Keep retained solved state and Back to world returned to Maths Missions. |
| Number Line Jump | Starter backward-hop mission: wrong-direction action gave corrective feedback; one hint; seven actual hop-button presses completed `7 − 7 = 0`; frog position, accepted hop sequence, held explanation and Next were visible; Back/Keep retained the result and parent return worked. | Starter `3 − 3`: wrong forward-direction action, one hint, then three actual backward-hop presses; frog reached 0, accepted hops `2, 1, 0`, held result and Next visible. Back/Keep retained the result and Back to world returned to Maths Missions. |
| Time Teller | Maths Missions entry: incorrect time choice, one hint, correct time, disabled choices, correct clock alt text/explanation and Next. Back returned to `#/world/maths`. Separately entered from Time Detectives, reloaded `#/play/timeteller`, and Back returned to `#/play/worldmap/time-detectives`. | Maths Missions entry: visible clock showed 4 o’clock; selected `5 o’clock` incorrectly, used one hint, then selected `4 o’clock`. Correct clock alt text, explanation and Next remained visible. |

On desktop the Time Detectives parent page’s visible “Practise telling the time” link opened `#/play/timeteller`. After reload, Back restored the Time Detectives module. In the ordinary Maths Missions entry, Back restored `#/world/maths`. These checks cover both parent routes; the Time Detectives route was tested on desktop only.

On desktop, visible sound control changed from “Turn sound off” to “Turn sound on” and back across reloads, confirming both persisted states. On mobile, sound was turned off via the visible control before gameplay. Stickers showed both retained B3 catalog groups (`Constellation pages`, `Letter Trace chapters`) and B4 groups (`Addition discoveries`, `Subtraction discoveries`, `Clock explorer badges`, `Number line journeys`). The isolated profile had zero stars and no earned badges; this proves the collections were present together, not that badges were awarded or retained after an earning event.

## Evidence

- Desktop: [held Addition answer](screenshots/desktop-addition-held.png), [combined B3/B4 sticker collections](screenshots/desktop-collections.png).
- Mobile: [Time Teller before answer](screenshots/mobile-time-teller-question.png), [held correct answer](screenshots/mobile-time-teller-held.png).
- Raw Playwright snapshots and recordings remain under `output/playwright/batch4-integration-independent-20261004/`.

## Lineage and limits

The retained B4 full local matrix is in `dinospace-batch4-quality/docs/qa-evidence/batch4-final-repair-local-20261003/report.md`; it covers all four games’ chapters and rounds at both target viewports. This candidate reuses that mechanics evidence because the four gameplay components are byte-identical to the retained baseline. The present run targets the integration delta: routing/parent provenance, shared app shell, sound preference, and coexisting B3/B4 collection surfaces. It samples only the first chapter of each game.

The candidate identity’s narration inventory is a file-presence audit: 65 of 5,246 phrases present and 5,181 pending. Voice was kept muted and no clip was played or listened to. Narration completeness, audible quality, a production walkthrough, later-chapter replays, earned badge persistence, and full 4.5 acceptance remain untested here. This local candidate is not a release approval.
