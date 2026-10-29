# Letter Launch source implementation note

## Scope and learning route

Letter Launch now owns its four finite chapters and held answer/result flow. The four established badge IDs remain `letters-sound-scout`, `letters-first-sound-finder`, `letters-letter-match-maker`, and `letters-cvc-blender`.

1. **Word sound finder**: hear a whole word, distinguish the spoken letter name from the starting sound, and select the starting letter.
2. **New word explorer**: transfer onset recognition to taught, decodable words; multi-letter graphemes are presented as teams when the first sound uses more than one letter.
3. **Big and little letters**: match lowercase and uppercase forms, with taught shape-confusable choices when available.
4. **Build and read a word**: order taught sound tiles to build CVC words; after three CVC rounds, four-letter decodable transfers such as FISH, CHIP, SHIP, RAIN, FEET, BOAT, and MOON are eligible when their graphemes are taught.

Amari reaches Letter Launch through Read & Write. Askia's existing picture-led catalogue does not include it; no new Askia route was added. Storage helpers remain player-keyed and preserve old Askia records.

Amari run targets remain 6/6/7/8. Direct little-mode clients use shorter 4/4/5/5 runs. Runs use a recorded uint32 seed and snapshot taught graphemes at chapter start. Wrong answers stay on the same target. Correct answers hold their explanation until the child presses Next; the final answer remains held through strict chapter, badge, and reward confirmation.

## Persistence and rewards

New canonical progress lives at `playerStorageKey(playerId, 'letter_launch_progress_v1')`, with version 1, unlocked chapter index, completed badge IDs, and one stable receipt per new chapter. Commits validate schema, write and read back the exact record, preserve unknown valid metadata, and fail closed on blocked or malformed canonical, legacy-level, or legacy-badge storage.

Legacy `game_levels_v1` is read for the unlocked high-water only; it does not by itself fabricate completed badges. Actual old earned badge IDs remain visible and open the following chapter. Unlocked legacy chapters below that high-water do not pay a second reward. A new completion first persists its receipt, then uses `saveChapterBadgeStrict`, then claims one actual parent point with `rewardClaimToken('letters', transactionId)` through the scaled callback. Failed local, badge, or parent confirmation holds the same result and transaction for Retry. Completed chapter replay pays zero. Correct individual answers do not award points.

The existing `*_letter_launch_recent_v1_*` key remains optional variety history; it is not treated as proof of completion or a reward receipt.

## Audio and art

The tested 115-line prompt corpus is exact-packaged narration. All replay calls use `premium: false` with exact segments, first check the offline manifest, and cancel previous narration. The repository includes six isolated phoneme files (`a`, `i`, `n`, `p`, `s`, `t`), not an A–Z letter-name recording set; spoken-word prompts are not described as letter-name audio. Whole-word clips are available for the four-letter transfer words listed above. Missing clips leave readable guidance and disable the associated replay control. The existing rocket and fuel-up background art remain in use.

## Native control contract

The active task exposes `data-letter-chapter`, `data-letter-phase`, and numeric `data-run-seed`. Menu controls use `Start chapter`, `Replay · no reward`, and `Play · no reward` for unbadged legacy high-water chapters; play exposes `Hear the clue again`, optional exact `Hear the whole word` / `Hear next sound`, wrong-answer retry, and held `Next mission`; final save failure exposes `Retry save`; confirmed results expose `Finish chapter`. Menu recovery uses `Retry progress check` or `Retry saved reward`.

Source checks run: scoped ESLint (0 errors; the CSS file is ignored by the configured ESLint) and the focused Letter Launch, chapter badge, reward, progression ownership, and voice suites (61 passing, 0 skipped). `git diff --check` passed. Browser/native and deployment acceptance remain root-owned gates and are not claimed here.
