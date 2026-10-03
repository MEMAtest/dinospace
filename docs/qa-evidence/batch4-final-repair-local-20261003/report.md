# Batch 4 final repair: independent local browser QA

**Verdict: rendered gameplay mechanics pass for the tested final candidate. Packaged narration/listening and production acceptance remain pending.** This report does not certify the app for release.

## Candidate and isolation

- Frozen candidate source: 01e10f75d3658133db4b3a1ffd269f0ee34c7c35.
- Candidate URL: http://127.0.0.1:5227.
- Identity record: [batch4-final-repair-identity-20261003.json](../batch4-final-repair-identity-20261003.json). The four frozen JS/CSS asset hashes matched that record; source checks recorded there are 195/195 tests, full ESLint pass, production-config build pass.
- Browser profiles: fresh isolated Playwright desktop 1280×800 and mobile 390×844, initialized with /api/voice and /api/story guards returning 204 before app navigation. route-list confirmed both guards. No seed, progress, or local-storage injection was used. No paid provider call was made.
- Browser console at end: zero messages, errors, or warnings in either profile. The downloaded game log came through the Grown-ups troubleshooting control; it contains identifiers, timestamps, seeds, outcomes, and bounded counts, without names or response/story text.

## Coverage

Each listed full run used the visible mission, objects, options, and ordinary game controls. All three chapters/worlds had six questions. Correct explanations remained displayed until Next; chapter/world completions and their star awards were visible.

Across wrong-answer, hint, correct-answer, and replay flows, the visible question stayed in place until Next. Replays showed newly randomized prompts; this run did not assert that a queue survives a full browser reload unchanged.

| Game | Desktop 1280×800 | Mobile 390×844 | Replay and targeted checks |
|---|---|---|---|
| Addition Adventure | 3/3 chapters, 18/18 questions | 3/3 chapters, 18/18 questions | Full six-question Addition Stories replay at both widths. Wrong answer, count-on clue, refined hint, correction, and held feedback exercised. |
| Subtraction Station | 3/3 chapters, 18/18 questions | 3/3 chapters, 18/18 questions | Full six-question Take Away replay at both widths. Equality (5−5=0), removing zero, and the corrected zero-removal clue exercised. Desktop replay improved the best from 2★ to 3★ and added one global star; an equal-best replay added none. |
| Time Teller | 3/3 chapters, 18/18 missions | 3/3 chapters, 18/18 missions | Full six-mission Daily Routines replay at both widths. Clock Explorers wrong-hand feedback, hand hint, correction, and held explanation exercised. On both widths, 12:45 +15 → 1:00, then −15 → 12:45 was observed using the rendered controls. |
| Number Line Jump | 3/3 worlds, 18/18 missions | 3/3 worlds, 18/18 missions | Full six-mission Forward and Back replay at both widths. Hops were clicked one by one; the frog position and accepted-hop sequence updated after each hop. Missing-number questions and larger-endpoint/farther-distance modes were completed. Equal landing endpoints were correctly answered as Same. |

All replay completions reported the prior 3★ best. Equal-best replays did not increase the global star count. The desktop Subtraction replay’s observed 2★→3★ improvement increased the global total by one.

## Visual and navigation results

- Number Line at mobile width shows an illustrated frog above its current tick. The 0–10 line scrolls horizontally; measured ticks are 44 px wide with about 70 px center spacing, so visible ticks do not overlap. See [mobile frog screenshot](numberline-mobile-world1-frog.png).
- At desktop width, the 0–20 comparison line is visually legible with distinct tick circles and no overlap in the captured view; see [desktop comparison screenshot](numberline-desktop-world3.png).
- In the mobile same-position comparison (A: 10→20, B: 18→20), both markers were rendered together as A/B in a single tick label at 20. The answer explanation distinguished equal landing points from different travel distances.
- The child badge shelf showed 3/3 collected for Addition, Subtraction, Time Teller, and Number Line. Amari had 36 stars. The ordinary player picker switched to Askia, whose home showed 0 stars and whose sticker shelf did not show Amari’s Batch 4 badges. Switching back restored Amari at 36 stars and her four 3/3 shelves.
- A normal reload preserved local storage key amari_discovery_active_player with value amari, the #/home route, and Amari’s 36 visible stars. No browser initialization script changed storage on reload.
- From Curriculum Quest → Time Detectives → “Practise telling the time” → clock, Back opened the leave confirmation; Keep playing retained the game; reloading preserved #/play/timeteller; Back then returned to #/play/worldmap/time-detectives. A separate Maths Missions launch of Time Teller returned to #/world/maths after its Back/confirmed return flow.

## Scoring and diagnostics

The actual Grown-ups → Game troubleshooting → Download game log export was inspected. It states retention limits of 300 events and 100 run milestones. The export has a retention cap, so this is bounded evidence rather than a full event history. A late visible Addition recovery and Subtraction recovery each yielded an answer_attempt with correct:false, diagnosticOnly:false, followed by one successful answer_attempt with diagnosticOnly:true and one answer_correct credit. Time Teller’s earlier wrong hand choice also exported as correct:false; successful attempts were diagnostic-only and the corresponding answer_correct event supplied the credit. No prompt, answer text, or child name appeared in the exported event schema. The raw export is preserved as [amari-game-diagnostics.json](amari-game-diagnostics.json).

The visible dashboard kept stars/game plays separate from “What I am learning.” Equal-best replay had no additional star award; the desktop arithmetic best-star improvement added one global star. These UI observations do not establish a broader pedagogical efficacy claim.

## Gates still pending

- The Grown-ups narrator panel said the narration clip was unavailable. This run did not claim successful audio playback or listen-quality acceptance. Packaged narration coverage and any missing clips remain pending; no voice/story generation was attempted.
- No production deployment, canonical alias, device install/offline package, or physical-touch-device acceptance was performed. Browser emulation is not physical-device proof.
- Source tests, lint, and build are supporting checks only; this verdict is based on the exact frozen candidate and the rendered local browser journeys above.

## Evidence files

- [Desktop Number Line comparison](numberline-desktop-world3.png) — 1280×800.
- [Mobile Number Line frog](numberline-mobile-world1-frog.png) — 390×844.
- [Grown-ups bounded diagnostic export](amari-game-diagnostics.json).
