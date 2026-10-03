# Batch 4 Time Teller and Number Line Jump builder report

Date: 3 October 2026  
Branch: `codex/amari-batch4-quality-20261003`  
Scope: Time Teller and Number Line Jump components, their seeded mission/progress modules, and focused property tests.

## Implemented

- Both games have three sequential named chapters/worlds with six seeded missions per run. Required taught modes are reserved in each queue (routine read/set, forward/back, each missing value, larger/farther comparison) before the remaining unique missions are selected and shuffled under the same seed. The run queue remains frozen through wrong answers, hints, and rerenders. Correct explanations remain visible until the child presses Next.
- Progress is stored by child and game. Unlocks derive from contiguous chapter completion, future/orphan awards are rejected, malformed recent IDs are discarded, chapter stars are awarded once, and a started queue enters the recent-question window even if the child leaves before finishing.
- Time Teller includes o’clock/half-past reading, quarter-past/quarter-to reading, read and set-hand missions, daily routine prompts with explicit morning/afternoon/evening/day context, a narrated hand lesson, and a continuous hour-hand angle (`hour * 30 + minute * 0.5`). Hand setting uses 15-minute and one-hour controls with keyboard-accessible buttons.
- Number Line Jump includes child-controlled forward/back hops to 10, missing start/hop/landing missions to 20, and separate larger-landing/farther-distance comparisons to 20. Accepted hops update the frog position one step at a time. Static models and seeded validation enforce equation/hop/landing agreement.
- The number line scrolls inside its labelled region, shows a scroll cue and marked task values, and keeps the document layout at the viewport width. Native vector clock and number-line models are used.
- Correct-answer diagnostics distinguish first attempt from independent performance. A hint is a separate one-use action. Chapter score counts are committed at answer time, so finishing does not count the sixth clean answer twice. Replay awards only a positive increase; celebration callback units equal `awardedStars * 4`.

## Packaged narration inventory

All speech calls use `{ premium: false, segments: [exactLine] }`. Runtime lines are finite, reusable, and contain no generated number combinations.

Time Teller:

1. “Look closely at the clock and think about the time.”
2. “The short red hand shows the hour. The long blue hand shows the minutes. The hour hand moves between numbers.”
3. “Use the short red hour hand and the long blue minute hand.”
4. “That is right. The hands show the time.”

Number Line Jump:

1. “Listen to the number line mission.”
2. “Use the number line to check one step at a time.”
3. “That is right. The number line shows each hop and landing.”

No paid voice, image, or story provider is called. This report inventories runtime strings; it does not certify that local audio files exist, decode, or sound acceptable.

## Focused checks

- `node --test test/timeLineAdventure.test.mjs`: 4/4 passing. This covers all 48 allowed hour/minute pairs and wrap labels, 50 seeded time runs per chapter, 80 seeded number-line runs per chapter, required mode coverage, model/answer agreement, option bounds and uniqueness, progress isolation, corrupted/future/orphan rejection, malformed models, and recent-question storage for abandoned runs.
- ESLint passed for the two game components, the two new data modules, and the focused test file.

## Pending acceptance gates

This is builder evidence only. No full test suite, full build, browser playthrough, 390px rendered overflow check, real Curriculum Time Detectives origin/return journey, native audio playback/listening, independent reviewer run, canonical deployment, or 4.5 score is claimed. Root integration and the separate fresh-session reviewer remain pending.
