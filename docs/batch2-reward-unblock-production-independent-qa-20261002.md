# Batch 2 reward-unblock production QA — 2026-10-02

## Scoped production verdict: passed

Checked the canonical alias [dinospace-eight.vercel.app](https://dinospace-eight.vercel.app), which resolved to deployment `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz`, source SHA `d31239453edf438b5a88ab788db942f2dae76fea`. The browser loaded `/assets/index-Cp2ikb4I.js` and `/assets/index-Bwl2SrXA.css`.

### Desktop Monster Math, 1280×720

A new Playwright browser session selected a fresh Amari profile at zero stars, then completed all six Starter questions through displayed controls. The first answer was intentionally wrong; the visible clue was used before correcting it. The one-item answer displayed the singular explanation **“There is 1 moon.”** The completion screen showed **5 of 6 right first try** and **3 of 3 stars**. Home showed Amari at 3 stars before reload and after reload/profile reselection.

Starter replay began at 0/6. **Back to learning world → Keep playing** restored the same unanswered question at 0/6; no reward or completion appeared.

### Mobile Sky Shapes, 390×844

A separate fresh production session used a pointer to start Mountain Peak, then Enter and Space to advance keyboard progress. After leaving at 13%, **Keep playing** restored the same board and 13% progress, with 0/4 saved and no completion reward.

The root reviewer independently reported a separate production 390×844 Monster Math run: all six questions, result 3 stars, Home 3 before and after reload, Askia 0, console clear, and all 24 requests returning 200. That is separate evidence from this subagent's desktop Monster run and mobile Sky run.

### Actual diagnostics export and provider/privacy boundary

After reload, the visible Grown-ups troubleshooting flow was opened and **Download game log** was clicked. The downloaded version 2 JSON contains 20 events and 5 run milestones (retention settings: 300 recent events and 100 run milestones). The Monster run's start and completion share seed `3980484337`; the subsequent incomplete replay uses seed `898709843`. Event keys are limited to `at`, `difficulty`, `event`, `firstAttempt`, `game`, `hintType`, `level`, `round`, and `seed`. Inspection found no keys for names, prompts, answer/response text, recordings, audio, body, or content. Export SHA-256: `206fcb3951661a73174c6363f70449478daf5293218f8b421d9e9075b9da903e`.

Before profile selection, page fetches to `/api/voice` and `/api/story` were blocked; sound was muted. No voice/story generation was requested. No hidden game state, injected answer, or solver import was used. Browser console had zero errors and warnings during the scoped runs.

### Evidence and scope

Screenshots and the actual downloaded JSON are preserved at `output/playwright/batch2-reward-unblock-qa-20261002/production/`. The diagnostics file is `amari-game-diagnostics.json`; screenshots include `desktop-monster-result.png`, `desktop-home-after-reload.png`, `desktop-replay-cancel.png`, `mobile-sky-pointer-focus.png`, and `mobile-sky-keep-playing.png`.

This is a scoped production acceptance for reward count/persistence, replay cancellation, diagnostics privacy, and Sky pointer/keyboard continuation. It does not claim acceptance of the complete Batch 2 / 4.5 game matrix, audio, or higher-band coverage.

Root copied the production JSON export without rewriting it to tracked `docs/qa-evidence/batch2-unblock-production-diagnostics-20261002.json`; screenshots were preserved in the main worktree output directory.
