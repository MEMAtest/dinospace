# Production health — 2 October 2026, 04:09 heartbeat

Checked 04:09–04:12 UTC in isolated Playwright session `health-0409`.

## Deployment identity

Canonical alias `dinospace-eight.vercel.app` remains on READY Vercel deployment `dpl_7mvY5HPtQ6mMBvmEnPVddGumThyn`, SHA `aeea9e7167d9beb1c52e11e3b6643cb330975bc6`. Rendered JavaScript `index-D6fYZHfF.js` matches the unchanged production release.

## Actual Curriculum Quest controls

- Selected Amari, entered Explore & Languages and opened Continents & Oceans.
- Desktop: clicked Start this round. Choosing Asia for Africa showed a clue and retained 0/5. Choosing Africa increased progress to 1/5 and held the explorer fact about the Atlantic/Indian Oceans and Kenya/Egypt until explicit Next question.
- At 390 × 844, clicked Hear why and Next question. North America appeared at round 2 with progress retained at 1/5. Choosing North America increased progress to 2/5 and held the fact about Canada and Mexico.
- Back to learning world, followed by Back to world in the leave confirmation, returned to `#/world/explore`.

## Diagnostics

Mobile document width was 390 px; no incomplete or broken rendered images. Browser console: 0 errors, 0 warnings. All 17 observed requests succeeded (200/206), including the explorer explanation audio asset. A stale pre-start map reference caused one CLI lookup error; a fresh snapshot provided the actual active control and the UI journey then passed. This was an automation reference issue, not a game regression.

Only this isolated browser was closed. No real child data was accessed or changed, and no stories or paid voice calls were generated.

## Result and limits

Healthy and unchanged for the sampled map, held facts, retry, progression and parent-world controls; no notification required. Successful audio requests do not verify physical speaker output. This small health sample is not completion of every level or acceptance of all games against the 4.5 roadmap. Batch 2 remains separate local work.
