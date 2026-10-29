# Spelling Studio audit and acceptance contract

## Scope and current source findings

This audit covers only the Amari `WordBuilder` Spelling Studio route and its spelling data/helpers. Storybook Studio, `App`, `GameSession`, shared session storage and parent reward code remain root-owned.

The existing activity has useful, distinct copy, missing-sound and whole-word stages; free practice also offers tricky words and captions. Standard words are filtered by the learner's taught graphemes, prompts have meaning cues, feedback stays available until the learner advances, and spelling queues are seeded, unique within a queue, and defer recently used words. Keep the existing art, cues, keyboard/touch tile controls, undo, and all 56 approved spelling recordings. The prior October 21 evidence reported 58 ready clips including two reused clips; that is historical technical playback evidence, not human-listening acceptance.

The six generic session levels are Copy (5), Missing Sound (6), Whole Word (7), four-letter (3), five-letter (6), and six/seven-letter (4). The source queue is created in a one-time state initializer, but `App` keys the child by the parent's `run` counter and `GameSession.start` increments that counter before every level/replay. Thus the child remounts for a new stage and the queue is rebuilt from the new `sessionLevel`; the current source and queue tests show no stale-pool defect. Keep this lifecycle and validate the actual mode/pool mapping for every stage rather than changing working queue behavior.

The longer pool includes `ck` and `ss` graphemes and consonant clusters; all 13 entries are labelled `phase: 2`, while levels 4–6 describe increasing word length. A word having graphemes from a taught set does not by itself establish simple Phase 2 phoneme mastery. Preserve the distinction between practice difficulty and phonics mastery attribution: multi-letter graphemes/clusters and longer-word challenges must not inflate simple Phase 2 mastery. Required copy/meaning support, a missing-sound response, optional clues, and mistakes also remain non-independent evidence.

Progress is currently saved best-effort after every word under the legacy `amari_spelling_progress_v1` key; the return value is ignored, and the component proceeds with success feedback and rewards. Session mode additionally calls `onCelebrate` for each correct word while the parent session awards the completed level. This can grant a word reward before durable progress and then grant a second session reward. Preserve existing per-word rows and unknown valid metadata; do not let an unreadable record be treated as empty and overwritten. For session mode, word feedback remains local; durable level completion and its idempotent reward belong to the shared parent flow.

## Acceptance contract

- On each of the six levels, the actual word pool matches its declared length and taught-grapheme eligibility. A newly started stage/replay receives a stable queue, covers each eligible word at most once before cycling, and uses the correct pool/mode after the parent remounts the child.
- Copy, missing-sound and whole-word modes retain their existing instructions, useful word/clue audio where an exact packaged clip exists, held explanation, explicit Next/Finish action, and retry after an incorrect response. No new recordings or provider/device voice fallback are introduced; absent clips leave clear written guidance.
- Record learning attempts truthfully. An incorrectly solved or clue-assisted answer is not first-try independent. A difficult/long word or longer grapheme sequence is not reported as basic Phase 2 phoneme mastery solely because its graphemes are in the taught set.
- Preserve the legacy per-word progress key, rows and unknown metadata. A blocked, unreadable, malformed, or failed write must not be reported as saved or overwrite prior data. Retry must finish the same pending action once, with no duplicate per-word/session award. Replays do not farm rewards.
- Session mode does not issue a separate reward for each word. Root owns the shared session completion persistence and reward transaction. Root integration is needed for a durable/idempotent `words` session-level reward token and a visible Retry path if session-level storage or the reward claim fails; do not alter shared files in this lane.
- Focused tests exercise queue renewal across session levels, pool eligibility, durable-record preservation/failure behavior for owned storage logic, correct learning attribution, and exact packaged clip availability. Tests must exercise behavior rather than mirror source strings.

## Boundaries

This is a source audit/implementation contract, not acceptance of a rebuilt bundle, browser journey, hosted release, or human-listening review. No score is assigned. No new audio job, corpus copy, browser session, dependency install, or deployment is part of this lane.

## Native initial-practice repair

The first native matrix found a real optional Tricky Words defect before any main-stage response: the visible clue was for I, but initial tiles came from the unrelated regular-word queue (for example T/A/N), making the answer impossible unless the regular queue happened to contain I. The initializer now uses the actual displayed word's graphemes for every mode, including tricky, with the same distractor policy as later rounds. The actual visible-clue native protocol detects missing answer graphemes and must pass before release.
