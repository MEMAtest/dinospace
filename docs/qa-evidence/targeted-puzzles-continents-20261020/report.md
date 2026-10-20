# Dinosaur, puzzle and continent fixes — production closeout

**Released and rehearsed on 20 October 2026.**

- Site: https://dinospace-eight.vercel.app
- Runtime source: `14f992a65ae01f2c0de5d21fcfa3ffb751b8dfbd`
- Canonical deployment: `dpl_BUNZ6wCdpYGtWEh1TDvx4k9iTbwv`
- Vercel's authenticated deployment metadata confirms that exact source SHA. The served entry bundle is `/assets/arcade-D28FPQ4a.js`, SHA256 `3b488ca2ae521b5e63c173f5b4bbf9b7a6e1827098bebd065290af46ef8426ee`.
- This closes the four targeted gameplay repairs below. It does **not** certify every catalogue game at 5/5 or release the separate unfinished programme.

## Reproduced defects and repairs

| Activity | Reproduced cause | Released change |
| --- | --- | --- |
| Askia Dino Jigsaw | First run had only three puzzles: 2 pieces, 2 pieces, 4 pieces; two unlocked pictures caused a repeat. Subsequent bands used 6 and 9 pieces rather than the requested steps. | Four different pictures per level, with 2 → 4 → 8 → 12-piece progression. The bridge level practises 8 then 12. Six picture choices become available. Visible piece/in-place counts; tray labels do not expose the matching slot. |
| Amari dinosaur jigsaw | Same small shared boards; older-child start was the former four/six-piece band. | Starts at 8 pieces, grows to 12, and uses a wider board and tray. Existing highest levels remain saved. |
| Askia Dino Detective | Three searches in the first run; remounting repeated the same run number and predictable opening. | Five searches initially, then 5/6/6/7, six dinosaur kinds, fresh visit/run variation, no adjacent repeated hiding place, and visible search progress. Wrong choices recover without erasing earned levels. |
| Amari Puzzle Pop | First two chapters were only 4 and 9 pieces. | 9/16/25 pieces across the existing twelve illustrated scenes. Child-specific unlocks and completed pictures remain saved. |
| Curriculum Quest | Africa was explicitly preferred whenever completion history was empty, and history was saved only after Next. The in-progress question, fact and chosen band were discarded on remount. | Seeded, varied Geography/Nature openings; five distinct questions per run; different explicit replay order; per-child/module/band session restore, including held facts, retries, route/sequence state and completed runs. First history runs retain teaching order; explicit history replays vary questions without changing the correct order of clues. |

The Learn screen asks only to explore/start. Play has one question. Correct feedback holds an Explorer fact and Next. A loading gate prevents a flash of the default Africa/Start screen during restore; a concise resume cue explains an interrupted run. Correct route steps now say Good move rather than Try again.

## Actual production rehearsal

One contained Chromium session and one tab; 1440×844 and 390×844. Provider routes were guarded before gameplay. No provider stories, voice generation or image generation were requested.

| Check | Canonical production result |
| --- | --- |
| Geography | 60 correct answers across all three bands and two runs per band at both sizes. Every run had five different prompts, and every explicit replay order differed. Correct facts survived reload before Next; all runs finished after exactly five questions. |
| Jigsaw | 36 completed picture rounds across both profiles and sizes; saved Askia test progress migrated from the pre-release level 2 into the new 4-piece band, then reached 8 and 12. Fresh Amari began with 8. Highest level 5 survived reload. |
| Puzzle Pop | All 12 pictures completed at each size: 24 boards total, with 9/16/25 pieces and held picture facts. Keyboard selection and exact piece inventories passed. |
| Dino Detective | 29 searches across all five levels at 390px, then 7 advanced searches at 1440px. Wrong-choice recovery and non-repeated adjacent hiding places passed. |
| Final native controls | At 390px, a wrong jigsaw slot was rejected and native CDP touch dragging placed the correct piece. The real Back-to-world menu, including its confirmation when applicable, preserved a correct geography fact; Next then displayed a different second question. |
| Media/rendering |A real Hear fact action played its packaged Matilda recording to ended at positive volume. Final controls had no broken images, failed illustrated/audio/script assets, horizontal overflow or page errors. This is technical playback, not a human listening claim. |
| Installed shell |Activated service worker and `amari-discovery-v18` shell cache observed. The separate media cache remains preserved. |

The local candidate rehearsal additionally completed all five fresh Askia jigsaw levels, Amari's larger stages, all 24 Puzzle Pop boards across both sizes, 29 dinosaur searches, 60 geography questions, and partial history-sequence/band and route/module/reload recovery. Local successful jigsaw reports retain 48 round records. An earlier mobile harness completed Askia's progression but failed when it looked for Amari's jigsaw in the wrong world; that log is preserved and excluded from the pass count.

## Tests, failures and evidence boundaries

- 44 focused tests passed, zero failures or skips, including the opt-in compiled-worker audit. Scoped ESLint, build and diff checks passed. Existing bundle-size warnings remain.
- The opt-in worker audit initially exposed an obsolete 100-asset cap. A read-only fetch of the prior immutable canonical worker confirmed 160 assets already shipped. This release also has 160; the reviewed cap is now 160 while the independent 40 MiB cap and exact asset/media inventory checks remain. Current eager assets total 29,101,861 bytes. The original failure and reconciliation are retained.
- Root corrected the saved-session initial-render flash found by browser QA. Other failed harness attempts used a hidden level selector after topic navigation, assumed history began with a sequence instead of evidence, or matched a voice button's visible caption instead of its full accessible name. Their logs are retained; corrected native journeys passed.
- Local and hosted bundles differ; the public build environment was not independently reconciled. Production identity is bound to authenticated Vercel metadata, a served-bundle hash and actual canonical gameplay, rather than claiming identical local binary output.
- `summary.json` and the `production-*.json` files contain the result rows and raw-log hashes. `deployment-source-binding.json`, `runtime-binding.json`, `source-manifest.json` and `worker-budget-reconciliation.json` provide source and deployment evidence.

## Scope and recovery

Reused the existing checkout and compatible dependencies; no clone, extra worktree or installation. The previously closed named browser was reopened once as contained headless Chromium; no visible Chrome/incognito windows or additional tabs were created. Real child data was untouched: only the isolated synthetic browser's built-in Amari/Askia profiles were used. No recurring monitor was restarted.

The older unreleased Storybook/Spelling/Memory/Trace programme remains preserved on `codex/solar-blender-planets-20261016` at `baf5b56f`. The current release branch is `codex/targeted-puzzles-continents-20261020`, based on the prior canonical `aaef3be4`. Merge this released work before resuming the older programme; do not deploy that older branch wholesale.

Unique native harnesses, failure logs and encoded captures remain under `output/playwright/targeted-puzzles-continents-20261020`. Final accepted renders are stored once in this evidence directory. `resource-recovery.json` records exact task-owned capture conversions and retained paths. The task preview server is stopped and the single QA tab is parked after acceptance. Three unrelated functional-release evidence files remain untouched.
