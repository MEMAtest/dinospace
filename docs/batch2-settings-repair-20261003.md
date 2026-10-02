# Batch 2 settings correction — 3 October 2026

Root inspection found obsolete `SESSION_LEVELS` definitions for Monster Math (times tables), Sky Shapes (tolerance levels) and Spot the Difference (single-scene sessions). These games now own their chapter progression and sit outside `GameSession`. `ProgressDashboard` used the obsolete entries to offer fixed-difficulty selectors that these components did not consume. This was a misleading grown-up control.

Removed those three obsolete entries, leaving the games' own saved episode/chapter progression intact. Existing saved settings/data are retained. Monster Math's catalog description now says “Count, add and solve stories,” matching its three implemented episodes.

Source commit: `65657ec` on `codex/quest-game-editor-20260930`. Full repository tests pass 156/156; production build passes. A separate Luna candidate check is assigned to verify the actual grown-up controls at desktop/390px and the own-chapter screens. Production remains `d31239453edf438b5a88ab788db942f2dae76fea`; these changes are not deployed or accepted as 4.5 yet.

Narration worker PID 27199 was revalidated alive at elapsed 15:18. Its last successful batch recorded 747 pending clips, exit 0, no stopped reason and no cooldown retries. Independent full gameplay checks continue in separate browser sessions. The preceding goal turn made concrete progress by publishing the 26-game contract and fixing Spot diagnostics; this continuation adds the settings repair and full current test/build evidence.
