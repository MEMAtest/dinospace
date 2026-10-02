# Batch 2 reward-unblock independent QA — 2026-10-02

## Candidate verdict: scoped gate passed

Independent real-browser QA was performed against the candidate build served from `/tmp/dinospace-batch2-gameplay-repair-20261002` at `http://127.0.0.1:5291`. Candidate HEAD was `d31239453edf438b5a88ab788db942f2dae76fea`. No tracked source files were changed and no commit was created.

### Desktop, 1280×720

- Fresh Amari profile began at 0 stars. In Monster Math Starter, the tester deliberately selected a wrong answer, used the visible clue, then answered correctly. The visible counter and explanation were checked.
- All six questions were completed using the displayed counters. Results showed 5/6 first try and 3/3 stars. Home showed Amari at 3 stars; after reload and profile selection it remained 3. Askia remained at 0.
- Replaying Starter began at 0/6. Leaving and choosing **Keep playing** restored the same question and zero progress, with no award.

### Mobile, 390×844

- A fresh Amari completed all six Monster Math Starter questions through visible controls, including a deliberate wrong answer and clue. Results showed 3/3 stars; Home showed 3 after reload and profile selection.
- Sky Shapes keyboard-and-cancellation evidence is preserved in `candidate/mobile-sky-keep-playing.png`; the captured screen is Round Sun at 12%, with 0/4 saved after **Keep playing**. The earlier run notes named Mountain Peak/13%; the screenshot is the artifact of record, so this report does not claim that exact level or percentage for the candidate capture.

### Controls and limits

Before selecting a profile, browser fetches to `/api/voice` and `/api/story` were blocked and sound was muted. No voice/story generation was requested. No hidden state, injected answers, or solver import was used. This is scoped evidence for reward accounting, persistence, replay cancellation, and the named Sky interaction; it does not certify the wider Batch 2 / 4.5 matrix, audio, or higher-band coverage.

### Evidence

Screenshots and the production diagnostics export are preserved under `output/playwright/batch2-reward-unblock-qa-20261002/`. Candidate screenshots include `candidate/mobile-monster-result.png`, `candidate/mobile-home-after-reload.png`, and `candidate/mobile-sky-keep-playing.png`. The original candidate diagnostics download was superseded when the same browser download path was reused for the production export; candidate diagnostics are therefore not claimed in this report.

Root copied the production JSON export without rewriting it to tracked `docs/qa-evidence/batch2-unblock-production-diagnostics-20261002.json`; screenshots were preserved in the main worktree output directory.
