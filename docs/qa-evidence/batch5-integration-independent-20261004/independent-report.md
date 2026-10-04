# Independent QA: Batch 5 Amari integration candidate 5368

Date: 2026-10-04  
Candidate: `http://127.0.0.1:5368/`  
Source: `b198dbf49a5023e1b50181a9ef2a3eabd4c80a35`  
Base source: `0d3ef056e569e3ef59763df388f26c3baa7783b8`  
Identity: [candidate identity](../batch5-integration-20261004/identity.json); all 5,879 served files matched its frozen build hashes.

This is a selective integration delta. Full Batch 5 game matrices and the separately tested 5367 copy candidate are retained in [the copy QA report](../batch5-spelling-copy-independent-20261004/independent-report.md) and prior game reports. No whole-app or audio acceptance is claimed here.

## Isolation and diagnostics

Used fresh Playwright profiles at desktop 1280×800 and mobile 390×844. Each started at `about:blank`; voice and story API routes returned 403 and were verified before the first app navigation. Sound settings were changed only with visible controls. The child profile was synthetic and progress/answers/browser state were not seeded. No provider calls, generated stories, or sound-provider jobs were made.

Both profiles had zero browser console errors/warnings, no broken images, and no horizontal overflow (document width matched viewport). Network summaries omitted only static requests (38 desktop, 30 mobile); no non-static request output appeared. API guards remained installed. The copy candidate and integrated source readiness inventories report 37 pure phoneme clips absent; this run did not infer answers from audio or make auditory claims.

## Shared settings and reload

- Mobile began with Phase 2 defaults at 23/23 sounds. Tapping `ff` changed the visible selected count to 22. After reloading, the grown-up gate required its normal press-and-hold; reopening settings still showed 22.
- Desktop likewise showed 23 at first use, changed to 22 after disabling `ff`, and reopened at 22 after reload and normal reentry.
- On mobile, the visible sound toggle was set to muted (`Turn sound on`), reloaded and remained muted. It was set to on (`Turn sound off`), reloaded and remained on. Desktop also showed muted after its first reload and on after the reverse toggle/reload.
- Each game-flow pass was explicitly returned to muted with the visible toggle before gameplay.

## Integrated game routes and rendered controls

### Sound Safari — Read & Write

Opened the Amari Sound Safari entry, saw the three chapter controls with later chapters locked, selected Chapter 1, and entered Question 1. The rendered instruction asks for a taught sound, but `Hear the pure sound` was disabled. I did not guess an answer or attempt to generate missing media. Back displayed the leave confirmation; confirmed Back to world returned to Read & Write.

### Spelling Studio — Read & Write

Opened Chapter 1 and its ordinary first word. A wrong visible tile produced “Not quite. Say the word slowly and listen again.” Following the rendered target and tiles completed CAN, with a held “Well done. You built the word.” and sound sequence. `Next word` moved to a new question. Back opened the leave dialog; Keep playing returned to the question, then confirmed Back to world returned to Read & Write. Mobile also completed visible SAP, exercised Next word, Keep playing, and confirmed return to the same parent world.

### Colour Mixing Lab — Creative Lab

Opened the three-chapter module; Chapters 2 and 3 were visibly gated. Chapter 1 Recipe 1 rendered the named red input, orange target and one-part recipe. Choosing yellow produced a mixed-orange result and the held fact “Red and yellow make orange in our colour lab.” Next recipe reset to a red + blue prompt. Choosing orange produced retry feedback; choosing purple then rendered the correct mixed-purple outcome and Next recipe. The leave dialog's confirmed Back to world returned to Creative Lab.

### Odd One Out — Thinking & Play

Opened the chapter selector and Chapter 1 Puzzle 1. The visible rule named three clothes; tree was the clear outlier. Selecting it advanced to the “Because…” choices. The matching reason produced held feedback that restated the named-group rule and exposed Next puzzle. The leave dialog's confirmed Back to world returned to Thinking & Play.

## Evidence

- [Mobile Spelling held correct screen](mobile-spelling-held-correct.png) and [snapshot](mobile-spelling-held-correct.yml)
- [Mobile saved 22-sound settings screen](mobile-saved-22-sounds.png)
- [Desktop Odd One Out held reason screen](desktop-odd-one-out-held.png) and [snapshot](desktop-odd-one-out-held.yml)
- [Desktop Spelling held success](desktop-spelling-held-correct.yml), [wrong-retry and correct-colour states](desktop-colour-wrong-retry.yml), [desktop Sound Safari disabled pure-sound control](desktop-sound-safari-first-question.yml)
- [Mobile 23-sound defaults](mobile-default-23-sounds.yml), [22-sound selection](mobile-saved-22-sounds.yml), and sound states [muted after reload](mobile-muted-after-reload.yml) / [unmuted after reload](mobile-unmuted-after-reload.yml)

## Remaining gate

Sound Safari's first question cannot be independently completed because its pure-sound control is disabled; the separate pure-phoneme package is known to be absent. This run therefore verifies integration, route ownership, guarded APIs, visible settings persistence and the available visual control flows only. It does not verify spoken instructions, phoneme recognition, pronunciation, human listening quality, or overall 4.5 acceptance.
