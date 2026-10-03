# Batch 2 finish acceptance matrix — 3 October 2026

This is the remaining same-build manual acceptance gate for Puzzle Pop, Spot the Difference, Sky Shapes, and Monster Math. Run against one isolated candidate build, then bind release evidence to the immutable production identity. Fresh generated run seeds must come from ordinary UI starts and sanitized diagnostic exports; do not inject PRNG, answers, unlocks, or progress.

## Run matrix

Complete three runs per game at desktop (1280×800) and three at mobile (390×844): 24 completed runs total. Each viewport's three runs cover one completed run in each of the game's three bands. Use actual UI controls to unlock later bands within the profile. Keep a separate evidence folder per candidate identity.

For each run, record the generated numeric seed from the exported diagnostics. The seed is evidence of the real UI run, not an input to force. Across the three runs in each viewport, vary normal play by restarting/re-entering between runs, and retain run order and diagnostics. After one of the completed runs per game/viewport, start one additional replay run and verify its first scene/question/mission order differs from the immediately previous completed run. This is a bounded replay delta: record its new seed and initial queue, then leave; it is not an additional completed run and does not count toward the 24-run matrix.

| Game / band | Desktop run | Mobile run | Required gameplay coverage across the two band runs |
|---|---|---|---|
| Puzzle Pop — Picture Pioneers | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four 2×2 pictures; inspect preview, use hint, recover from a wrong space, place with touch/mouse and keyboard across the two runs, see each fact, finish and replay-order delta. |
| Puzzle Pop — Curious Constructors | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four 3×3 pictures; validate wrong-space recovery, hint, all placements, facts, chapter unlock, replay and Back. |
| Puzzle Pop — Detail Detectives | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four 5×5 pictures; check tray/board fit and 48px controls, finish all pictures, fact/reward, replay and Back. |
| Spot the Difference — Bright-Eyed Beginners | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four scenes with 3 targets each; blank miss and gentle feedback, magnifier, found count, reveal, facts, next and Back. |
| Spot the Difference — Curious Comparers | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four scenes with 5 targets each; target hit areas, wrong-tap guidance, hint limit, facts, unlock/replay and Back. |
| Spot the Difference — Super Spotters | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four scenes with 7 targets each; independently tappable hotspots, finish/reward, replay and Back. |
| Sky Shapes — Cloud Meadow | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four simple flights; mouse tracing on desktop, touch tracing on mobile, keyboard alternative, hint, route tolerance, accuracy/stars, save and Back. |
| Sky Shapes — Rainbow Ridge | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four compound flights; use each available input method across the two runs, restart a flight, finish, verify accuracy/stars and saved blueprint. |
| Sky Shapes — Aurora Station | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Four advanced compound flights; ordered parts, path tolerance, 100% mission progress, accuracy/stars, reward, replay and Back. |
| Monster Math — Count to 10 | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Six unique counting prompts; wrong answer, clue, replay prompt, model/result agreement, explanation until Next, finish and replay. |
| Monster Math — Add and Take Away | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Six unique operations to 20; ten-frame groups including sums where a first addend exceeds 10, singular wording, wrong guidance, animated answer and stars. |
| Monster Math — Monster Story Problems | Complete one ordinary UI-started run; record exported seed. | Complete one ordinary UI-started run; record exported seed. | Six short stories; number-line direction/start/landing, prompt/model/answer agreement, wrong answer/clue, explanation, completion and replay. |

## Per-run checklist

- Confirm candidate identity, selected player, viewport and band before starting. Save the visible start screenshot.
- Use visible controls only. Exercise correct and incorrect responses, a hint or replay clue, narration replay, and every scene/question in the run. Listen to at least one prompt and one explanation per game and viewport; an HTTP 200 alone does not prove audible playback.
- Complete the whole band. Keep each scene fact/explanation visible until Next; check the reward/unlock, replay, and Back to the exact parent world. Save feedback and completion screenshots.
- Check 48 CSS px minimum interactive targets and no clipped controls or unexplained horizontal scroll at 390px. Inspect Spot's 7-target band for overlapping hit areas.
- Export diagnostics after each run. Verify start, scene/question, answer attempt/correct, hint, completion, replay and leave events where exercised; each includes game, level, round and the generated seed. Confirm prompt text and child data are absent.
- Check console errors/warnings and failed requests. Any failed asset, console error, incorrect model/answer, lost progress, dead-end navigation, or inaccessible control is a run failure; retain a reproduction.

## Result record

Create one row per completed run with: candidate commit and bundle hashes; game; band; viewport; exported run seed; browser; screenshot paths; diagnostics path; console/network result; asset/audio result; progression/replay/back result; pass/fail; issue link or reproduction. Add a separate replay-delta record for each game/viewport with previous and new seeds and initial queue evidence. Acceptance requires 24 passing completed rows plus the bounded replay deltas on one candidate identity. Do not combine evidence from different candidate builds to fill missing rows.

## Current code audit note

The audit found and repaired Spot the Difference's first-miss diagnostic marker: the first wrong tap was incorrectly emitted with `firstAttempt: false`. The focused regression test now distinguishes first miss from subsequent retry. Subsequent actual production testing also reproduced Sky star-total mismatch, Monster available-episode labelling and duplicate feedback, and an incomplete pre-answer subtraction number line. These are tracked in `batch2-reward-model-repair-20261003.md`; the earlier source-only audit did not establish live correctness. The 24-run same-build matrix, replay deltas, and physical audio checks remain outstanding.
