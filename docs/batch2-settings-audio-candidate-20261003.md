# Batch 2 settings and gameplay candidate QA — 2026-10-03

## Scope and recommendation

This report covers a narrow independent browser check of the settings, Monster Math progression/rewards, and number-line correction candidate. It does not certify the broader four-game acceptance matrix, voice quality, or production availability.

**Recommendation: GO for the root-owned deployment of the frozen gameplay candidate.** The local-candidate checks below passed. Canonical production identity and the same controls still need verification after deployment. The separate 24-run gameplay matrix and audio acceptance remain open.

## Candidate identities

### Clean gameplay candidate — port 5194

- Source checkout: `/private/tmp/dinospace-batch2-gameplay-repair-20261002`
- Branch: `codex/batch2-reward-settings-repair-20261003`
- Source HEAD: `9cc4331dd9e9491284cb052f13a2804d484671cb`
- Checkout clean when inspected; no source edits were made during this QA.
- Local Vite preview: `http://127.0.0.1:5194`
- Browser requested `/assets/index-3o36Hdky.js` and `/assets/index-Bwl2SrXA.css`, both HTTP 200.
- JS SHA-256: `d94d128fe23d34bb3f62431dd1037d55d5cd9e46a8cec157edeb219f40f87fda`
- CSS SHA-256: `bc6a7190764e87d256bd93bba89acb258be80ef865646a1ba2d1b043816ce8e7`
- Root reported 148 tests, lint, and build passing for this candidate. No production deployment was observed.

### Separate partial-voice preview — port 5193

This is separate from the clean gameplay candidate and is not production evidence.

- Preview checkout: the shared workspace at `/Users/omosanya_main/Documents/Codex/2026-09-26/x20-time-detectives-now-uses-clearer/work/dinospace-game-editor-fixes`
- At inspection the checkout was on `codex/quest-game-editor-20260930`, HEAD `1e8ac5a89be77b5b4395ad118ef2d06f574f526a`.
- The checkout was dirty: `src/data/offlineVoiceManifest.js` was modified and many `public/audio/en/*-matilda.mp3` files were untracked while the narration worker was running. These files were not read, changed, or attributed to the clean candidate.
- Preview bundle: `index-BstHYKtk.js` (SHA-256 `258eb24066d220c7a049ab387face003c9edefa51963e4c43475eb0f07495d17`) and `index-Bwl2SrXA.css` (SHA-256 above).
- In the earlier 5193 browser run, local narration assets requested by Puzzle Pop, Spot Difference, and Sky Shapes returned HTTP 200; the run also showed working sound-toggle labels. This confirms local asset delivery and UI affordances only. It does not prove audible playback or physical speaker output.

## Narrow checks on the clean gameplay candidate

### Grown-ups settings at 390 × 844

After opening Grown-ups through the actual three-second press-and-hold control, the difficulty selectors for Puzzle Pop, Spot Difference, Sky Shapes, and Monster Math were absent. Addition Adventure, Subtraction Station, Time Teller, and the other active controls remained.

The page had `clientWidth=390` and `scrollWidth=390`. Each select itself measured 36 px high; its parent hit area measured 48 px. This meets the observed 48 px wrapper target while preserving the native select size.

Screenshot: `.playwright-cli/page-2026-10-03T00-24-01-380Z.png`.

### Monster Math completion, unlock, and reward improvement

All interaction used the visible game controls in a fresh Amari browser profile. Seeds were generated normally by the app; no PRNG or storage state was injected.

- **Starter / Count to 10:** began with the reward pill showing “1. Count to 10 not earned yet”, with episodes 2 and 3 locked. A wrong answer, clue, then correct answer left one feedback sentence in the primary feedback area alongside the distinct counted-model explanation. Finishing 5/6 right first try earned 3/3 stars and the new episode badge.
- **Growing / Add and Take Away:** finished 2/6 right first try and earned 1/3 stars. On replay, a fresh generated run finished 6/6 right first try and earned 3/3 stars. Home displayed 4 stars after the first Growing completion and 6 after the improved replay: the 1→3 improvement credited only the two-star difference.
- The Episode Map showed **Monster Story Problems enabled** after the one-star Growing completion. The map showed the saved 3★ best for Starter and Growing.
- The Growing feedback UI displayed equation, model explanation, and one matching primary answer sentence. The model/feedback reinforcement can repeat; the removed defect was duplicate paragraphs within the same feedback card.

The Grown-ups **Download game log** control exported `.playwright-cli/amari-game-diagnostics.json`. Its `math` start/completion events identify:

| Run | Level / band | Seed | First-try result |
|---|---|---:|---:|
| Starter completion | 0 / starter | `1315459643` | 5/6; 3★ |
| Growing initial completion | 1 / growing | `3656411138` | 2/6; 1★ |
| Growing improved replay | 1 / growing | `4024646362` | 6/6; 3★ |
| Story mobile run | 2 / challenge | `2810543948` | q1 addition; incomplete |
| Story desktop run | 2 / challenge | `3611044182` | q1–2 addition; q3 subtraction; incomplete |

The first two Growing runs provide the requested actual-UI 1→3 reward evidence.

### Monster Story number line at mobile and desktop widths

The same ordinary generated Story run (`3611044182`) was first inspected at 1280 × 900, then resized to 390 × 844 before answering its subtraction question. This preserves one run across both viewport checks.

- At desktop, q3 asked “Max has 17 cookies. Max gives 5 cookies away. How many are left?” Before answering, the line showed 10 through 19, marked the starting point at 17, included the 12-to-17 path, and showed no answer-point highlight.
- At 390 × 844, the same pre-answer state showed 10 through 19, start 17, and the same unmarked target 12. The viewport had no horizontal overflow (`clientWidth=scrollWidth=390`); the line and prompt remained readable.
- Selecting 12 marked **Answer point** at 12, showed cookie markers at 13–16, and changed the instruction to “Start at 17, then jump back 5 steps to 12.” The primary feedback area contained one complete explanation sentence.
- The subtraction q3 snapshot at desktop was `.playwright-cli/page-2026-10-03T00-34-58-593Z.yml`; the mobile pre-answer image is `.playwright-cli/page-2026-10-03T00-35-43-868Z.png`. The mobile answer/landing snapshot is preserved in the browser transcript around `.playwright-cli/page-2026-10-03T00-35-56-879Z.yml`.

Separate addition checks covered both viewports: mobile q1 (3+7=10) and desktop q1 (12+1=13). Both showed the full visible range before answering and a correct landing marker after selection. Screenshots:

- Mobile pre-answer: `.playwright-cli/page-2026-10-03T00-32-59-025Z.png`
- Mobile correct landing: `.playwright-cli/page-2026-10-03T00-33-10-479Z.png`
- Desktop pre-answer: `.playwright-cli/page-2026-10-03T00-34-16-962Z.png`
- Desktop correct landing: `.playwright-cli/page-2026-10-03T00-34-34-516Z.png`

### Parent navigation

From an active Monster Story question, **Back to learning world** opened the “Leave the game?” confirmation. Choosing **Back to world** returned to the Maths Missions world. The same route was verified again on the 5194 candidate.

## Remaining acceptance boundaries

- The narrow 5194 candidate passed the checks in this report; it is not itself a deployment or production proof.
- Root owns release. After deployment, verify the canonical alias resolves to the intended source SHA and repeat the affected settings, Episode Map/reward, and Story subtraction controls there.
- The four-game shared matrix remains separate: 3 desktop plus 3 mobile completed runs per game (24 total across Puzzle Pop, Spot Difference, Sky Shapes, and Monster Math), one completed run per band and viewport, with the extra started-run replay-delta checks.
- Local audio request success is not an audibility or voice-quality certificate. The partial-voice 5193 evidence must remain separate from the clean 5194 gameplay candidate.
- Episode 3 was unlocked and its question path was exercised at both widths; the full six-question Story completion was not part of this narrow release gate.
