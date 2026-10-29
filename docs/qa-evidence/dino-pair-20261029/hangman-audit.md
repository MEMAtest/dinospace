# Dino Hangman — Pair7 source audit and acceptance

Date: 2026-10-29  
Scope owner: Hangman lane only. Root owns shared shell/reward/worker/browser/deployment and will bypass generic `GameSession` for Hangman. Detective is owned by the parallel lane.

## Current source findings

- `src/components/games/Hangman.jsx` has seeded shuffled queues, four word-length bands (3/4/5/6–7), visible meaning cues, one letter-reveal hint, six shield mistakes, physical keyboard input and a Dino/shield visual. Existing words are filtered through the selected taught grapheme set; that gate must remain intact.
- The component is currently mounted inside generic `GameSession`, emits a level-counting event for every solved word and also awards 6/8 stars per word. Replay can therefore farm rewards. The component itself has no child-scoped completion record, no owned level map and no final result save gate.
- The shared `SESSION_LEVELS.hangman` defines four stages with target rescue counts `3/3/6/4`. Existing shared `game_levels_v1` data may contain progress and must remain byte-for-byte unchanged; it can be read conservatively as migration/high-water evidence.
- The current word pools for 4-letter levels are narrow (three in the default profile). The existing general Hangman word bank has additional authored clue/category content, while grapheme support must be explicit to prevent untaught words from appearing.
- `speak(..., {premium:false})` still delegates narration behavior. Hangman should only offer/play an exact clip returned by the packaged offline manifest; missing recordings leave visible clues and instructions.
- Existing gradients, Dino icon, letter tiles, shields and word-picture cues are useful. Reuse those visuals and current packaged assets; no new image or voice generation is required.

## Agreed scope and reward semantics

Hangman owns its four named level menus, per-level round targets, held result, progress and completion flow. Root will add Hangman to the existing `ownsGameProgression` list so the generic `GameSession` no longer wraps it; the shared shell, reward core and App remain root-owned.

- Preserve levels First words (3 letters, 3 rescues), Four-letter rescue (3), Five-letter rescue (6), and Long-word rescue (6–7 letters, 4). Preserve selected-grapheme gating, enrich eligible queues with existing reviewed Hangman/spelling words, avoid repeats within a run and recent-boundary repeats where possible.
- Every wrong or solved word remains visible until an explicit New word / Next action. The last required rescue shows its explanation and a Finish level action. Durable completion is written and read back before any level reward; write failure holds the result and offers Retry with no reward.
- Per-child progress lives in `amari_hangman_progress_v1:<playerId>`. Completion is idempotent. Replays can update the best result, but award only the improvement delta; equal/lower results award zero. Legacy unlocked high-water levels are treated as already rewarded/practice so historical unlocks cannot be farmed. The legacy `*_game_levels_v1` object is only read, never mutated.
- Canonical version-1 known fields and legacy Hangman `current`/`unlocked` indexes are strictly validated. Malformed state stays untouched and allows only level-one practice. The legacy ceiling includes its highest unlocked level without falsely marking that level completed; unknown valid canonical metadata survives Hangman writes.
- Positive new canonical attempt receipts reconcile through the parent’s idempotent `hangman:<attemptId>` reward token on mount and level-map reentry. A failed parent reward confirmation keeps the saved result and a Retry action; legacy history without a new receipt is never auto-awarded.
- Remove per-word star rewards. A completed level earns its reward once after durable verification. Word events and learning attempts remain truthful; known-word practice does not claim spelling mastery.
- Use parent `onBack`, `onNextGame`, `onPhaseChange`, current `playerId`, and sound props. Do not edit App/shared session/reward/storage/worker or Detective files.

## Acceptance checks

1. Verify all four level menus, target counts, longer-word progression and pool variety for the selected graphemes. Every included word's explicit grapheme sequence must be taught; no word can bypass the sound selection.
2. Verify touch and physical keyboard letters, repeated letters, six-shield recovery, wrong-answer reveal, one-use letter hint and clue/audio controls. Wrong and correct explanations stay visible until the child acts.
3. Verify final rescue is held; Finish level first writes progress, reads it back and only then emits level completion/reward and shows Next. Force unavailable/throwing storage and confirm Retry, no completion claim and no reward.
4. Verify per-child isolation, preserving the raw legacy level-progress key, canonical completion, replay equal/lower reward delta zero, and only positive delta for an improved recorded best.
5. Verify exact packaged audio lookup only, cancellation on mute/leave/word switch, and readable cue when the recording is missing; zero provider/device fallback.
6. Run focused helper/component tests and scoped lint only. Root performs candidate build and live/native-control acceptance.

## Explicit limits

This is a functional gameplay uplift. It does not certify subjective audio quality, award spelling mastery, change shared reward/session/storage systems, or assign a fresh editorial score.
