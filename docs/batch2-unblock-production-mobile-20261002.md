# Batch 2 unblock — production mobile acceptance, 2 October 2026

## Released identity and gates

Canonical `https://dinospace-eight.vercel.app` is READY deployment `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz`, immutable `https://dinospace-2s265txn7-memas-projects-23a0001d.vercel.app`, SHA `d31239453edf438b5a88ab788db942f2dae76fea`. Vercel API confirmed alias, SHA and branch `codex/batch2-gameplay-repair-20261002`. Actual production JS is `index-Cp2ikb4I.js`, CSS `index-Bwl2SrXA.css`, cache v16. Local build used Vite 7.2.4; Vercel used locked Vite 7.3.1, so the production hash differs from the locally tested `index-CPLv0KU6.js`.

The narrow release fixes Monster Math's legacy callback unit conversion, quantity-neutral counting prompts, Sky pointer focus, Sky/Monster leave cancellation and bounded seed milestone retention. It excludes the incomplete packaged narration integration. Full candidate gate: 144 tests passed, lint/build passed, diff clean. Initial full test run caught a stale cache-version assertion (v15); it was aligned with the v16 release and the full suite rerun successfully.

## Root production control run

Isolated session `unblock-prod-mobile`, fresh Amari at 0, 390×844. Voice/story providers blocked before profile selection. No hidden state or answer pool was read; answers were counted from rendered counters and selected through real buttons.

- Maths Missions → Monster Math → Start six questions. Q1 flowers showed six counters. Wrong 9 left 0/6; Show me a clue displayed a counting strategy. Correct 6 advanced to 1/6; Leave → Keep playing preserved that same explanation/progress.
- Subsequent rendered questions: balloons 2, balloons 7, kites 8, crystals 10, stars 10. Each correct answer held an explanation for Next; final explanation held for Finish episode. No reset occurred across six questions.
- Completion displayed 5/6 right first try and 3/3 stars. Back to world returned Maths Missions. Home showed 3; full reload/reselect Amari retained 3. Switching to Askia showed 0.
- Visually inspected `output/playwright/batch2-unblock-production-monster-mobile-finish.png`. Document width 390, viewport 390, no broken rendered images; completion controls fit the viewport.
- Console zero errors/warnings; all 24 requests reviewed after reload returned 200 and included the correct production JS/CSS. One packaged profile prompt MP3 was requested; no provider API appeared. Physical audio was not assessed.
- A test locator initially assumed Six questions complete was a heading. It is a paragraph; the locator timed out after completion, then a fresh snapshot confirmed the successful result. This was an automation error, not an application failure.

Closed the disposable browser. No real child data was accessed or altered. Independent desktop Monster and mobile Sky production checks passed and are recorded in `batch2-reward-unblock-production-independent-qa-20261002.md`, including a real diagnostics download retaining matching start/completion seeds after reload.

## Remaining quality work

This release closes the reproduced gameplay repairs, not the overall Batch 2 4.5 acceptance. Packaged narration is generating in the main worktree with provider verification, physical file validation, resumable manifest checkpoints and rate limits. At 21:36 UTC, 81 clips had been generated from the 1,153 backlog and 1,072 remained. Worker PID 87713/session 26556; status `tmp/batch2-voice-generation-status.json`, log `tmp/batch2-narration-generation-2026-10-02.log`. Completed corpus readiness and actual audio QA remain required before releasing that integration. Monitoring now watches this worker for completion/failure while retaining quiet healthy checks.
