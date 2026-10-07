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

## Quality assessment and acceptance status

Four roadmap dimensions receive scoped 4.5 assessments from the independent implementation review and production browser evidence. The combined feedback/audio/visual dimension remains unscored because technical playback cannot establish audible quality. No overall Memory Match score or `verified 4.5` status is assigned while that listening gate is open.

| Assessed dimension | Score | Evidence and scope |
|---|---:|---|
| Age-6 teaching and interaction | 4.5 | Concrete strategy tips, a repeat control, forgiving mismatch behavior, held facts, and mobile cards above the 48px target passed. This rates the visible teaching and interaction; spoken clarity and age suitability remain in the unscored narration gate. |
| Meaningful progression | 4.5 | Ten named themed boards preserve the 4→8→10→12→13 opening sequence and continue through 18 pairs; the full route, replay, stickers, saved progress, and next-session coaching passed. |
| Correctness and variation | 4.5 | Production desktop/mobile completed every pair count. Six ordinary L10 starts had varied visible first cards; the independent focused suite passed 18/18 and covers ten distinct seeded layouts per board with exactly two cards per picture. Seeded lifecycle records were downloaded from the production UI. |
| Feedback, audio and visual usability | **Unscored** | Match/mismatch feedback, completion facts, mobile targets, no overflow, and corrected L4 fact/Next/HUD spacing passed. All 183 packaged files match full technical-decode evidence; native production playback/end/mute/Back cancellation passed. Human pronunciation, pacing, voice consistency and age-suitability review remains open. |
| Navigation, accessibility, and persistence | 4.5 | Exact parent-world return and leave confirmation, keyboard/reduced-motion preview checks, reload/session progress, sound preference, and 10/10 sticker persistence were verified. |

**Verdict: production functional and visual acceptance passes; overall quality acceptance remains pending human listening.** The remaining action is a human review of the 183 packaged narration clips for pronunciation, pacing, consistency, and suitability for the intended age. Record any filenames needing correction and recheck their production playback after changes. The four-and-a-half scores above are scoped dimension assessments, not an overall 4.5 claim; no average is reported while narration is unscored.
