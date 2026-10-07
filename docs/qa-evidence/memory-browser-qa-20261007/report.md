# Memory Match browser QA — 2026-10-07

## Release identity

- Canonical production: https://dinospace-eight.vercel.app
- Vercel deployment: `dpl_HQNZMHJq3E3qynrJaHjUwNi4rp3b`
- Runtime source: `28f6c5980b9f60ad8848392b74d261b7a2d7c8c3`
- Browser: one contained headless Chromium session, one page/context, ordinary synthetic Amari profile selected in the UI. The existing Chrome profile was not touched. `/api/voice` and `/api/story` were guarded and returned 403 throughout; no paid provider calls were made.

## Production UI results

The entire ten-level route was played from visible cards at 1440px desktop and 390×844 mobile. Pair counts were 4, 8, 10, 12, 13, 14, 15, 16, 17, and 18 at each viewport. Every round completed with its fact visible, no face-down cards left, and mismatch locking observed. On mobile, every card was at least 82×82px and document width stayed 390px. Desktop L10 cards were at least 149×149px. The L4 completion fact, Next control, and inline daily challenge area did not overlap at either viewport.

At each viewport, Galaxy Challenge was started three times using ordinary Replay controls. All six runs completed; the first visible card labels differed between the desktop starts and between mobile base/replay starts. UI move totals for the base ten-level route were desktop 7, 13, 15, 20, 20, 24, 23, 25, 25, 29; mobile 6, 13, 15, 18, 21, 22, 25, 26, 28, 28. Replays were visible UI actions; no seed or board state was injected.

Progression persisted through completion and reload: after L5, Next opened L6, and reloading kept L6 rather than returning to L1. The refreshed L5+ strategy tip was visible after reload. The Memory sticker shelf showed 10/10 boards, with all ten named boards collected. Returning from an active final board displayed the leave confirmation; choosing Back to world returned to Thinking & Play and recorded a seeded `leave` event.

The production mobile packaged tip `12f889bc-matilda.mp3` played unmuted at volume 1 and emitted native `playing` and `ended` events at 6.59/6.59 seconds. Turning sound off prevented a repeat tip from starting. During a second active tip, Back to Thinking followed by Back to world paused playback at time 0 and returned to the parent world. The stored sound-off preference survived an ordinary reload in a separate check, then was restored to on.

The ordinary Grown-ups → Game troubleshooting → Download game log flow produced the raw export kept locally at `output/playwright/amari-memory-closeout/production-amari-game-diagnostics.json`. The sanitized, memory-only export is [production-diagnostics-sanitized.json](production-diagnostics-sanitized.json): 300 retained events and 62 run milestones, including seeded start/scene/answer/hint/complete/replay/leave records. The export records three Memory hint events during the final-board instruction repeat test (plus two from earlier UI repeats). The diagnostics ring is bounded, so it does not retain every individual answer from all 26 round completions; the full per-board UI outcomes are in [matrix-summary.json](matrix-summary.json) and the local screenshot folder.

The browser console reported zero errors and zero warnings at the final check. The only non-static network requests shown were the guarded `/api/voice` and `/api/story` requests, both 403. Loaded document images had `complete=true` and positive natural widths. The Memory cards themselves render without `<img>` elements.

## Preview evidence for the targeted HUD fix

The prior preview exposed an overlap between the daily challenge HUD and the L4 held fact/Next control at 390px. The frozen production build moves that HUD into Memory content flow. The production screenshots below show the fixed state at mobile completion and the sticker shelf; the earlier preview2 screenshot remains available at `output/playwright/amari-memory-closeout/preview2-level04-mobile-complete.png`.

## Evidence files

Committed representative screenshots:

- [L5 desktop start](production-l5-desktop-start.png)
- [L4 mobile completion with clear HUD spacing](production-l4-mobile-hud-clear.png)
- [L10 mobile completion](production-l10-mobile-complete.png)
- [10/10 sticker shelf](production-sticker-shelf-mobile.png)

The full start/feedback/completion screenshot set remains locally under `output/playwright/amari-memory-closeout/`; it is intentionally not added wholesale. Additional preview2 diagnostics are in [diagnostics-sanitized.json](diagnostics-sanitized.json).

## Provisional quality assessment

Scores below are provisional and do not constitute a 4.5 acceptance claim.

| Dimension | Provisional score | Evidence and remaining limit |
|---|---:|---|
| Age-6 teaching | 4.0 | Short board tips, repeat control, gentle mismatch lock, and held facts were visible. A human reviewer still needs to assess spoken clarity and age fit. |
| Meaningful progression | 4.0 | Ten increasingly large boards, saved completion, replay, updated L5 coaching, and all ten stickers verified in the UI. |
| Correctness and variation | 4.0 | All 10 pair counts completed on desktop and mobile; three L10 starts per viewport produced new visible first-card outcomes; seeded diagnostics were downloaded through the UI. |
| Feedback, audio, and visual design | 4.0 | Correct/mismatch feedback, completion panels, held facts, native audio end/mute/cancel behavior, and mobile HUD spacing passed. Subjective listening and voice-quality acceptance remain open. |
| Navigation, accessibility, and persistence | 4.0 | Parent-world navigation, leave confirmation, keyboard/reduced-motion checks in preview, ≥48px production tap targets, no mobile overflow, reload persistence, and sticker persistence were checked. |

**Verdict: functional browser QA passes for this production runtime; quality acceptance remains provisional pending human listening.** The specific remaining rubric gap is a human auditory review of pronunciation, pacing, level-to-level voice consistency, and age suitability. Native playback, completion, muting, and cancellation are technically verified; these checks do not replace listening acceptance.
