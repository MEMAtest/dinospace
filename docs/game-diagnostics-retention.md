# Bounded run milestone retention

## Why

Independent Batch 2 QA found that the recent 300-event window lost earlier start seeds during long multi-game play. Completion screenshots cannot reconstruct those lost records. Existing production exports remain version 1; this source change does not recover past evicted events.

## Change

Keep the existing latest 300 events and an additional latest 100 run milestones (`start`, `level_complete`, `replay`, `leave`) in separate device-local storage. A high volume of answers/scenes no longer evicts every milestone. Export version 2 retains the familiar `events` array and adds `runMilestones` and explicit retention limits. The grown-up troubleshooting copy states that older records are replaced. This is bounded diagnostic history, not a permanent archive or server logging service.

Both arrays use the same metadata allowlist: game/event identifiers, timestamp, numeric level/round/seed/page position, difficulty, first attempt and enumerated hint type. Export re-sanitizes stored records; names, story text, prompts and arbitrary date strings are omitted. Malformed or unavailable storage returns an empty export rather than breaking the game. Existing version 1 events remain readable.

## Evidence and release gate

Six diagnostic tests passed; scoped ESLint passed. Tests saturate the recent window with 350 gameplay events and retain the original start and completion seed in milestones; 105 further starts prove the milestone cap; legacy/corrupt storage is sanitized and handled safely.

This is unreleased source. Before release, independently complete a local real game, reload, unlock Grown-ups, download the log and confirm both arrays carry matching run seeds with only allowed fields. After release repeat that export path on the exact canonical production SHA. Historical version 1 production evidence remains separate.
