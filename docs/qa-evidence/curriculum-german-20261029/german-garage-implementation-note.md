# German Garage implementation contract

## Scope and learning flow

German Garage now owns its finite three-chapter session and phase reports. The
chapters are Colour Painter (five colour/garage rounds), Vehicle Workshop (six
vehicle/parts rounds), and Direction Driver (seven two-command routes). The
eleven vocabulary themes remain available as reward-free supplemental practice.
Correct vocabulary answers hold an English meaning and a Next action; incorrect
answers keep the same target. Chapter completion is saved before the final
explanation can be left. Replay and supplemental practice award no points.

Direction routes use a 4 by 4 garage grid. Forward moves toward the top,
Zurück toward the bottom, Langsam changes the next movement transition from
260 ms to 760 ms, and Halt stops at the destination. All six terms are taught
with English meanings before routes begin. During a route, actions use
English/icon controls while the exact packaged clips play; an optional German
word disclosure is recorded as assistance. A wrong command leaves the car and
step unchanged. Correct steps hold bilingual feedback until the learner
chooses Next. The phone route layout places the 220 px grid beside a two-column
action pad; the six-word teaching screen remains separate.

Word rotation keeps the existing per-player `*_german_recent_targets_v1` key.
Malformed or inaccessible rotation data is never overwritten. Valid unknown
metadata is merged forward, and a visible note allows practice to continue if
rotation cannot be saved; chapter completion uses its separate required store.

## Persistence and reward contract

- Canonical key: `playerStorageKey(playerId, 'german_chapter_progress_v1')`.
- Legacy read only: `playerStorageKey(playerId, 'game_levels_v1')`; the legacy
  map is never rewritten by this game.
- Canonical version 1 stores `unlockedChapterIndex`, named
  `completedChapterIds`, and at most one stable `{ transactionId, chapterId,
  rewardDelta: 1, parentClaimed }` receipt per chapter. Valid unknown root and
  receipt metadata are retained.
- A new chapter completion earns one actual parent point. The game calls the
  scaled parent callback with four callback units and a stable
  `rewardClaimToken('german', transactionId)`, then marks the local receipt
  claimed only after parent persistence confirms. Retry/reopen uses that same
  transaction id.
- Existing legacy German progress is treated conservatively: when a legacy
  record exists, its highest current/unlocked index is a no-reward ceiling.
  Legacy history can unlock old chapters but never generates a new receipt.
  Malformed or unreadable canonical/legacy data blocks writes and reward claims.

## Assets and verification boundary

The existing German Garage scenes, car art, and packaged German word clips are
reused. No new voice recordings or provider calls are part of this change.
Focused verification covers seeded route bounds/order, wrong-step retention,
slow/stop behavior, exact offline command clips, player isolation, legacy
preservation, read/write/readback failure, stable receipt recovery, and replay
deduplication. Build, native control, and live verification remain root-owned.
