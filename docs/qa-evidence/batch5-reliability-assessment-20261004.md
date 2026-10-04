# Batch 5 reliability, navigation, and persistence assessment

Date: 2026-10-04 (Europe/London)  
Dimension assessed: reliability/navigation/persistence only  
Games: Colour Mixing Lab and Odd One Out

## Evidence lineage

- The retained full mechanics baseline is local candidate `9b079bc01d14e80df9ac2b9294effd70cdb792b0` at 5241. Its [three-chapter report](batch5-final-candidate-local-20261003/report.md) records all three six-round chapters at 1280×800 and 390×844, with ordinary UI progression and a same-profile Odd One Out reload.
- The mobile repair candidate is local source `99ed1955131bd53b9738264edcde4e2091ad6e5e` at 5255. Its [identity](batch5-mobile-repair-identity-20261003.json) binds five served assets. Relative to the full baseline, its only source changes are the Amari app's challenge-tracker exclusion for these games and the Colour Mixing design-display condition. The progress helpers and reasoning-game components are unchanged. The separate [mobile repair report](batch5-mobile-repair-local-20261003/report.md) verifies unobstructed controls and Colour Mixing feedback at 390×844.
- The [bounded reliability report](batch5-reliability-qa-20261004/report.md) combines the initial 5255 reload/replay observations with the 4 October follow-up. It records same-candidate serving hashes, replay screenshots, route guards, console/network observations, and limits for untested mobile replay outcomes.

## Scores

| Game | Reliability/navigation/persistence | Reason |
|---|---:|---|
| Colour Mixing Lab | **4/5** | The retained baseline and 5255 delta show earned palette, badge, best, and unlock state surviving reload through visible UI on desktop and mobile. Desktop replay evidence includes an equal/lower run with no extra best credit and a later improvement from ★ to ★★★; saved palette entries and chapter unlocks remained visible. The 5255 mobile repair removes the floating tracker from active controls, and normal Leave/Keep/Back navigation was exercised. The progress helper validates a complete six-mission canonical run, keeps the maximum best, persists palette entries only on completion, uses a per-player key and a per-game record, and reports storage failure distinctly. Mobile replay scoring and an explicit UI test of cross-game collection isolation remain unverified, so this is below full confidence.
| Odd One Out | **4/5** | Badge, best, and Chapter 2 unlock survived reload on both widths. Desktop replay first held at ★ without duplicate credit, then a clean replay improved the best to ★★★ (+2); a mobile replay at the same profile’s ★★★ cap remained at ★★★ after a visible wrong-choice retry. The chapter map and parent-world flow were exercised, and the 390px repair keeps active controls clear. The same completion helper applies canonical six-mission validation, monotonic bests, completion-gated rewards, and player/game namespacing. A mobile higher-best delta and UI-level cross-game isolation are not evidenced; they are not inferred from global stars.

## Basis and remaining limits

The progress source is [`batch5ReasoningProgress.js`](../../src/data/batch5ReasoningProgress.js). It stores each Amari game under the player's prefixed storage key and a distinct `colormix` or `oddoneout` entry. Completion rejects noncanonical, incomplete, locked, or malformed runs; rewards are based on the increase over the saved best. The focused [`batch5ReasoningProgress` tests](../../test/batch5ReasoningProgress.test.mjs) cover both games, complete-only saves, best-star deltas, Askia isolation, and explicit storage failure. This source evidence supports the visible re-entry findings; it does not substitute for observing every profile/game combination in UI.

Remaining limits are bounded: mobile Colour Mixing replay is untested; mobile Odd One Out higher-best replay was not attempted after the same profile reached the three-star cap; same-player cross-game palette/rule isolation has not been directly exercised in UI; and 5255 is a local candidate, not production. The 5255 sound preference reset after reload is retained as a candidate-local observation, though a later canonical fix was separately reported by root. These scores cover one of the roadmap's five dimensions only. They do not score teaching, progression, correctness/variation, feedback/audio/visual usability, nor do they establish human listening, production acceptance, or an overall 4.5 result.
