# Batch 5 colour and reasoning source foundation

## Implemented

- Odd One Out: three chapters with eight authored rules each. Runs select six distinct rules, prioritize unseen rules on replay, shuffle actual choices and reasons, and require both the odd item and a valid explanation of the named property. Canonical validation rejects altered prompts, item attributes, answers and reasons.
- Colour Lab: three chapters of eight authored tasks each. Discover Colour covers named primaries, secondary-colour predictions and missing ingredients; Light and Dark teaches white/tints and black/shades; Colour Designer applies recipes to named design briefs. Six-task queues prioritize unseen tasks and shuffle answers.
- Colour simulation is an explicitly authored classroom model, with named swatches and unsupported mixes returning no result. It does not claim that screen RGB averaging simulates real pigments.

## Source evidence

Six focused Node tests passed, including all odd rules across multiple seeds and 300 colour runs. Focused ESLint passed. These checks prove deterministic queues, authored answer integrity, unique correct choices, finite replay rules and safe validation. They do not prove browser interaction, visual quality, persistence, narration or production behaviour.

## Required next gates

Implement the two Amari game components with three chapter maps, visible held feedback and explicit Next, contextual facts, progress saved only for completed runs, wrong/hint/assisted diagnostics, child-scoped collection awards and best-star deltas. Use named colour labels, illustrated object choices and responsive controls. Freeze the exact runtime and finite narration inventory; run separate desktop/390px Playwright through every chapter and replay. Package/decode/listen to narration and exercise actual cancellation. Release only after the applicable gates, then reconcile Vercel identity and run production Playwright. No 4.5 score is assigned by this source foundation.
