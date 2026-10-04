# Batch 4 clock-route repair: independent browser delta

Date: 2026-10-04  
Candidate: frozen local build at `http://127.0.0.1:5383/`  
Runtime source: `aa1627216907ae1612e1bdbb309764000a995ae6`  
Integration source: `aa81a5602bfa6d941243d916177265a6fae32a38`  
Identity: [`batch4-clock-route-repair-identity-20261004.json`](../batch4-clock-route-repair-identity-20261004.json)

This is an independent, bounded UI regression delta for the clock lesson’s route preservation and the new shared Batch 4 badge shelf. It supplements the retained full three-band gameplay matrix on the earlier frozen 5227 build. It does not claim a new full matrix, audio/listening acceptance, or overall 4.5 acceptance.

## Isolation and candidate identity

I used separate fresh Playwright CLI sessions at 1280×800 and 390×844. Each session began at `about:blank`; before first app navigation I installed Playwright context routes returning HTTP 403 for `/api/voice` and `/api/story`, plus an init-script sentinel. Sound was turned off through the visible control. No progress, answers, local storage, or seed were injected. Only synthetic profiles earned through ordinary UI were used.

The candidate identity manifest records 5,879 served files, all HTTP 200 and SHA-256 matched to the frozen build. Browser request logs also showed only local 5383 static requests: desktop recorded 92 and mobile 32, all HTTP 200. No voice/story endpoint requests occurred. Desktop and mobile console logs each reported zero errors and zero warnings. The frozen runtime directory was not modified.

## Observed interactions

| Flow | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|
| Time Detectives route | Entered Explore → Curriculum Quest → Time Detectives → “Practise telling the time”; started Time Teller, answered a visible clock question, and reached held completion feedback. Reload retained `#/play/timeteller`; Start and Keep playing retained the lesson. Confirmed Back returned to the selected Time Detectives module. | Repeated the ordinary Time Detectives path. At 390 px the lesson and controls remained within the viewport (`scrollWidth` 390). Reload retained the clock lesson; Keep playing retained it; confirmed Back returned to the selected Time Detectives module. |
| Maths clock route | Entered Time Teller from Maths, answered the visible 9 o’clock question, saw the explanation and held Next. Confirmed Back returned to `#/world/maths` (“Maths Missions”). | Entered Time Teller from Maths, tried visible choices, used a hint, selected the visible half-past answer, and saw the explanation with Next held. Keep playing retained the lesson; confirmed Back returned to Maths Missions. |
| Addition Adventure | Completed Chapter 1 through the visible prompt and answer controls. Wrong answer feedback and clue were shown before the correct answer; correct feedback stayed visible until Next. The chapter awarded 3 stars. “Addition discoveries” showed `1 / 3 collected` and “Put Groups Together — Collected”; reload retained the award. | No new completion run; this collection flow is covered at desktop in this delta and retained game-owned chapter mechanics remain in the 5227 matrix. |
| Number Line Jump | Started the forward/back mission, used the visible hint, and tapped five visible “Hop back” controls from 5 to 0. The frog visibly moved to 0; correct feedback and “Next mission” remained held. Back opened the leave-game confirmation. | No separate new Number Line mission run in this bounded delta; mobile layout is outside this added route/badge check. |
| Subtraction Station | No new desktop round in this delta. | Chapter 1 “Take Away”: visible prompt was “There are 7 stars. Take away 1. How many are left?” Wrong Answer 3 showed clue feedback; Answer 6 showed 6 remaining and “Start with 7. Take 1 away. 6 remain.” Choices locked and Next remained available. Back opened confirmation; Keep playing retained the round; confirmed Back returned to Maths Missions. |

The clock-question screenshots preserve the visible clock and choices before answer selection; the mobile subtraction screenshot preserves held correct feedback. Other raw snapshots remain in the Playwright session output. On the Time Detectives flow, the selected module remained selected after returning; on the Maths flow, confirmed Back returned to Maths. This distinguishes the two lesson origins.

## Badge and sibling isolation

After Amari’s ordinary Addition Chapter 1 completion, the Amari badge shelf displayed 3 stars and `1 / 3` Addition discoveries with “Put Groups Together — Collected.” The same shelf state remained after page reload. I then switched to Askia through the visible player UI: Askia showed 0 stars and the generic 12-sticker shelf; it had no Addition discoveries section or Amari-only B4 chapter badge. The saved snapshots `desktop-amari-addition-shelf.yml`, `desktop-amari-shelf-after-reload.yml`, and `desktop-askia-shelf.yml` preserve those UI readings; `screenshots/askia-sticker-shelf.png` shows the sibling’s generic shelf.

## Limits

- The test covers a focused wrong/clue/correct/held-Next slice across all four Amari maths games and both-width clock-route checks. It does not repeat all 18 chapters or the full round matrix at both widths.
- This local candidate is not the production alias. The report establishes local browser behavior and candidate asset identity only.
- Voice and story APIs were guarded; no provider calls were made. No human listening assessment was performed, and packaged narration/audio quality remains a separate gate.
- The earlier retained full 5227 matrix remains the evidence for full chapter mechanics; this delta is limited to the route-state fix, representative controls, and the shared badge-shelf integration.

## Evidence files

- `screenshots/desktop-maths-clock-question.png`
- `screenshots/desktop-curriculum-clock-question.png`
- `screenshots/mobile-curriculum-clock-question-after-hint.png`
- `screenshots/mobile-subtraction-held-correct.png`
- `screenshots/amari-badge-shelf-persisted.png`
- `screenshots/askia-sticker-shelf.png`
- `desktop-amari-addition-shelf.yml`
- `desktop-askia-shelf.yml`
- `desktop-timedetectives-return.yml`
- `mobile-timedetectives-return.yml`
