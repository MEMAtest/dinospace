# Production health — 2 October 2026, 21:46 UTC

## Release identity

Vercel inspection and deployment metadata confirmed the canonical alias https://dinospace-eight.vercel.app serves Ready production deployment `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz`, immutable URL `https://dinospace-2s265txn7-memas-projects-23a0001d.vercel.app`, source SHA `d31239453edf438b5a88ab788db942f2dae76fea` on `codex/batch2-gameplay-repair-20261002`. Rendered assets were `index-Cp2ikb4I.js` and `index-Bwl2SrXA.css`. This is the already accepted gameplay repair release.

## Rotating actual-control sample

Used isolated Playwright session `health-20261002-2146`, fresh Amari profile, desktop 1280×900 and mobile 390×844. Blocked `/api/voice` and `/api/story/**` before selecting the profile; no provider-generated stories or paid voice requests were made.

- Opened Explore & Languages and Curriculum Quest through the actual cards.
- Started the Starter geography path. Wrong Europe answer for Africa kept progress at 0/5 and supplied a clue. Correct Africa advanced to 1/5 and held the explanatory fact until Next.
- At 390px, Next reached South America, Round 2; correct answer advanced to 2/5 and held its Brazil/Peru fact. Leave → Keep playing preserved that progress and fact.
- Next reached Antarctica, Round 3. Correct answer reached 3/5 and held the fact about the cold continent and no countries. Switched sound on and replayed the authored explanation; packaged `/audio/en/65d0fc98-matilda.mp3` returned HTTP 200.
- Next reached Asia, Round 4 of 5, still 3/5: no reset after three questions.
- Back to learning world → Back to world returned to `#/world/explore`.
- Mobile measurement: viewport and document width both 390; no broken images. Visually inspected `output/playwright/health-20261002-2146-curriculum-mobile.png`.
- Final console: zero errors and zero warnings. Final request inventory: 17 requests, all HTTP 200, including illustrated map, geography backdrop and packaged explanation audio.

One test selector timed out because the explanation button's accessible name includes its full sentence. Refreshed the snapshot and clicked the observed button successfully. This was a test selector correction, not an application failure. Packaged audio delivery was verified; physical listening quality was not assessed in this check.

## Finite narration worker supervision

At 21:54 UTC, PID 87713 remained alive (`Ss`, elapsed 28:12). Status file updated at 21:53:40.551 UTC: run 6 completed with exit 0, 11 newly generated clips, 120 reused, 1,038 pending, `stoppedAt: null`, zero cooldown retries. The dated generation log agreed and recorded normal waiting for the request window until 21:56:28.462 UTC. Pending count decreased from 1,049 to 1,038 during the check. Worker was not restarted and no readiness or release action was taken while generation remained incomplete.

## Decision

Healthy unchanged production sample; narration generation making expected progress. No notification required. This health sample does not establish that all 26 games meet the 4.5 quality roadmap, or that unreleased narration is accepted.
