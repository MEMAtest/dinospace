# Batch 3 canonical media-event QA: Letter Trace and Cosmic Tic-Tac-Toe

Date: 2026-10-05 (Europe/London)

## Candidate and scope

- Tested alias: `https://dinospace-eight.vercel.app`
- Canonical deployment: `dpl_5cKFB6U489CLoEPucaY9pDarcHsp`
- Runtime source: `1accc99e89be303678ead99def6a3095ab1cb886`; the exact four-file identity from the promotion check is copied in `canonical-identity.json`.
- Browser: the existing isolated Playwright session `count-prod-scatter-qa-20261004`; synthetic Amari profile only. No other browser window/session was opened.
- `route-list` before and after these checks showed `/api/voice` and `/api/story` both returning HTTP 403 `QA guard`. No provider calls were made.
- A passive observer wrapped native `HTMLMediaElement.play()`/`pause()` while normal rendered controls were used. It recorded play/pause events, source URL, monotonic `performance.now()`, current time and duration. It was removed at the end; the native methods were restored. The app was left muted.
- This is a bounded event-level production check; it supplements retained full gameplay matrices and does not repeat them.

## Letter Trace

At 1280×800, the retained round-1 session showed the rendered “Follow the path” instruction, “Show this stroke” clue, and correct result after a visible keyboard trace. The UI held the correct feedback until Next. The prompt clip `7b4cce67-matilda.mp3` (“Follow the dotted path in order. Start at the green number and move toward the arrow.”) started and naturally ended at 5.108 seconds. A visible “Show this stroke” action played `7e216f14-matilda.mp3` (“Show me a stroke.”, 1.115 seconds); the visible correct result “You followed the letter. Great tracing!” played `435f52be-matilda.mp3` (2.322 seconds). Both ended naturally. At round 2, the same prompt replay naturally ended once; on a second replay the visible sound toggle paused playback at 0.074 seconds (pause event 0.148 seconds after play began). The round-1 feedback screenshot is retained.

At 390×844, an ordinary chapter start reached Trace L · Lion. The tester pressed the visible prompt replay and then the visible sound toggle. `7b4cce67-matilda.mp3` reached `playing`, and the toggle paused it at 0.023 seconds. The game remained muted. The document was 390px wide with no horizontal overflow. Header Back and sound controls measured 48×48px; the prompt replay measured 48×48px; visible exercise controls were at least 145×48px. Lower controls needed vertical scrolling.

Trace disclosure remains clear: keyboard practice can complete the chapter without recording handwriting mastery. This check makes no handwriting-mastery claim.

## Cosmic Tic-Tac-Toe

At 1280×800, ordinary entry to “Make a line” board 1 played the visible prompt `66dd46ca-matilda.mp3`: “Two Dino marks are waiting. Find the square that makes three in a row.” It naturally ended at 3.808 seconds. Clicking the visibly correct row 1, column 3 square produced the held result “Three Dino marks now make a line.” and played `e7e450d7-matilda.mp3` (1.997 seconds), which ended naturally. The tester used `Next tactic board`; board 2 appeared and the prompt played and ended again. `Show hint` visibly highlighted row 3, column 1 and displayed “Look where two Dino marks already share a line.” The prompt clip played and ended again. This covers a prompt, replay, one correct held result, Next, and a visible hint, not every tactic path.

At 390×844, the same earned chapter reached board 3. The visible correct column move produced the held result; `e7e450d7-matilda.mp3` began and the visible `Turn sound off` control paused it at 0.128 seconds. Sound remained off. The document stayed 390px wide with no horizontal overflow. Header Back and sound controls were 48×48px; Show hint was 136×48px; board squares were 98×98px. The held `Finish chapter` control sat below the initial viewport at y=858 and was reachable by vertical scroll. The tester used the visible leave confirmation (`Leave game board` → `Leave board`), which returned to Thinking & Play without a new board result. The world stayed muted.

## Event evidence and audio limits

`media-events.json` summarizes the event times, control actions, clip paths and durations; `media-event-log.jsonl` preserves the selected raw observer event records. The production decode inventory maps each clip path to its authored wording; the browser observed actual `play`, `playing`, `pause`, and `ended` events. Several cached resource entries had nonzero encoded body sizes; their `transferSize=0` is consistent with browser cache and is not treated as an HTTP response status.

This demonstrates that packaged local clips were attached to actual UI actions and that visible mute controls interrupted playback. It does not prove a person heard the clips or assess pronunciation, volume, timing quality, or child comprehension. Human listening remains pending.

## Limitations

The checks used one existing Chrome session at 1280×800 and 390×844 emulated viewport sizes. They are not physical-device tests or full gameplay reruns. Trace does not certify handwriting mastery. Cosmic does not cover every lesson, hint, retry, or wrong-answer path. No overall 4.5 acceptance is claimed.

Screenshots and a desktop held-feedback snapshot are in `screenshots/`.
