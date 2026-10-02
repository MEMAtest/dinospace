# Production health — 2 October 2026, 22:47 UTC

## Canonical release

Fresh Vercel inspect and deployment API confirmed Ready production `dpl_H9rc2Rinyamg7bCf7WdcHeWDVFmz` at https://dinospace-eight.vercel.app, immutable deployment `dinospace-2s265txn7-memas-projects-23a0001d.vercel.app`, source SHA `d31239453edf438b5a88ab788db942f2dae76fea`, branch `codex/batch2-gameplay-repair-20261002`. Browser loaded `index-Cp2ikb4I.js` and `index-Bwl2SrXA.css`. Identity unchanged.

## Rotating control sample: Letter Launch

Fresh isolated session `health-20261002-2247`; blocked voice and story provider APIs before selecting Amari. Used actual Home → Read & Write → Letter Launch controls at 1280×900, then 390×844.

- Chapter screen showed Level 1 of 4, six missions and four unearned chapter badges.
- Started Level 1. Selecting P advanced 0/6 to 1/6, held Pig explanation and exposed Next mission.
- Resized to 390px, selected Next mission, replayed the clue. Selecting O for Goat gave a retry clue and preserved 1/6; selecting G advanced to 2/6 and held the explanation and Next button.
- Leave → Keep playing preserved 2/6 and the Goat feedback. Leave → Back to world returned to `#/world/read-write`.
- Mobile document width 390, no broken images. Visually inspected `output/playwright/health-20261002-2247-letter-mobile.png`: gameplay and feedback fit, with Next available below the viewport through normal vertical scrolling.
- Console: zero errors/warnings. All 21 observed requests successful (20 HTTP 200, one HTTP 206 audio range response). Packaged audio requests included `53a26f76-matilda.mp3` and `73a7d17b-matilda.mp3`. No paid voice or story generation requests were made. Physical listening quality was not assessed.

## Narration worker

PID 87713 alive (`Ss`, elapsed 1:21:31). Status and dated log agreed at 22:46:46 UTC: run 17 exited 0, generated 13, reused 253, pending 903, no stopped reason, zero cooldown retries. Waiting normally for the request window until 22:53:49 UTC. Pending decreased from the previous check's 1,038 to 903. No worker restart or paid call from monitoring; readiness/release acceptance remains pending completion.

## Decision

Healthy unchanged sample and expected worker progress: no notification. This is a rotating health check, not full acceptance of all 26 games or unreleased narration.
