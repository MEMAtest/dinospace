# Pair 7 audit — Dino Detective + Dino Hangman

**Audit date:** 29 October 2026  
**Pair:** Dino Detective (`dino`) + Dino Hangman (`hangman`)  
**Status:** implemented; final compiled controls and public release still pending. No new score or acceptance claimed.

## Route and source reconciliation

The catalogue's `dino` route has two child-specific implementations. Amari uses `src/components/games/DinoDetective.jsx` with its 12-world/three-band map and the dedicated `src/data/dinoDetectiveBatch3.js` plus `src/data/dinoDetectiveProgress.js`. `src/App.jsx` selects `src/components/little/games/LittleDinoDetective.jsx` for Askia, using the five-level Little game configuration and `LittleGameShell`. This audit covers both routes; it does not replace either with the other. The Askia route shares global shell/progression code with other Little games; those shared files remain root-owned.

Current visual assets are already present: `detective-{ankylo,bronto,stego,trex,trike}.webp`, `askia-detective.webp`, the existing dinosaur illustrations/icons, and the Amari search-scene background. No new asset or narration job is proposed.

## Evidence boundary

The newest dated prior functional evidence located is `docs/qa-evidence/targeted-puzzles-continents-20261020/production-detective-mobile.json` and `production-detective-desktop.json`, recorded on source `14f992a65ae01f2c0de5d21fcfa3ffb751b8dfbd` at `https://dinospace-eight.vercel.app`. It reports visible finds for Amari levels 1–5 (29 finds at 390px; 7 level-five finds at 1440px), with no page/provider errors. It does not exercise wrong-answer recovery, clue attribution, persistence failure/retry, rewards, or profile isolation. That historical alias/build is not evidence for the current source or current canonical host.

`docs/qa-evidence/batch3-configured-preview-independent-20261003/report.md` records bounded 390×844 and 1280×800 interactions on preview source `a6e1e675411a9a6d48b3f8e99fdbd5ad44ea44f4`: one Amari world and an Askia mobile wrong-cover/clue/find/held-fact/Next flow. It explicitly excludes full progression, sibling isolation, replay rewards, and complete world/round coverage.

Current source tests in `test/dinoDetectiveBatch3.test.mjs`, `test/dinoDetectiveProgress.test.mjs`, and `test/batch3Narration.test.mjs` cover 12-world assignments, five-position seeded permutations/recent-layout avoidance, sequential unlock/sticker normalization, and exact packaged narration inventory. They do not test storage read/write/readback failure, preserved malformed bytes, retries, duplicate Finish, or clue-assisted attribution. No new editorial/listening score is assigned.

## Existing design to retain

### Amari

- Twelve worlds are grouped into Starter, Growing, and Challenge bands, four worlds each. Each world has five distinct target positions in a seeded run; recent signatures avoid immediate layout repeats. The target dinosaur and world fact are fixed to each world, with a sequential map and twelve earned stickers.
- The bands already change trail density/contrast; the five named cover positions are keyboard-accessible buttons. Correct finds show a target fact and world fact in a held result panel with explicit Next/Finish. Preserve these worlds, species, factual content, five-find cadence, and sticker map.
- The SVG trail/path currently renders before hint use in all three bands. Starter has a bright direct trail; Challenge uses a faint one, but no stage controls when/how much evidence becomes visible. “Show a clue” reveals and labels the exact target immediately; “Read clue” displays a broad world clue but is not included in assisted/first-attempt event attribution.
- Completion currently transitions to the saved map/result and emits rewards even when the storage helper catches read/write errors. The localStorage default getter is evaluated outside its helper's try block; read/parse errors are turned into empty progress; writes are best-effort and have no readback. Repeated completion can race before React updates `phase`.

### Askia

- The five authored levels progress from five searches with two covers, to three-cover levels with 5, 6, 6, and 7 searches. Trail styles evolve from bright to marks/short/faint-short; dinosaur species and hiding place change by round/run. Preserve those level counts, art, clue flow, and accessibility.
- Wrong choices retain the round target and show a retry response. Inspecting the footprint is the required taught mechanic that reveals the baseline trail; it is not optional assistance. The completion payload counts wrong guesses only, and currently passes wrong-count as `hints`. Add a separate optional clearer-trail action and mark only that optional help as assisted. The current shell receives a 2.1-second completion delay; its shared auto-advance/storage/reward semantics are root-owned and will be reviewed there for this pair.

## Pair-specific acceptance contract

1. Keep both child routes distinct and verify both through their actual parent/world routes. Preserve Amari's twelve worlds, three bands, species/facts/stickers and Askia's five level configurations, age-floor behavior, art, and five-to-seven-round progression.
2. Make increasing search difficulty real and understandable. Keep the five reachable numbered cover controls, but stage optional guidance so the initial view does not expose every final answer equally across all bands. Make clues teach a usable spatial/dino-search strategy; preserve exact factual text and distinguish visual/text clue use from a blind first try.
3. Vary target position and species across ordinary replay while freezing each run/round through wrong retries. Keep each Amari run's five target positions unique and avoid recent layouts. Keep Askia's existing two-/three-cover transitions and round counts; add tests for stable target-on-retry and bounded run variation.
4. Hold wrong feedback with the same target and answer state until the child chooses a valid cover. Keep found-dinosaur and both fact explanations visible until explicit Next/Finish; prevent duplicate Next/Finish handling and duplicate rewards.
5. Report attribution truthfully. Askia's required footprint inspection is part of the baseline mechanic; only an optional clearer-trail action counts as a hint. For either child, using an optional clue before a correct find is assisted, even if the correct cover was the first guess. Keep wrong attempts and hints distinct where telemetry/stars expose them; do not redefine unrelated Little-game scoring.
6. Amari progress must fail closed. Safely acquire storage; only `null`/missing records mean new progress; preserve empty/malformed/unreadable existing bytes. Do not overwrite when a read fails. Commit completion and read it back before showing saved completion/unlock/sticker or awarding points. Hold the exact final result for Retry after a blocked write, guard duplicate Finish synchronously, keep a playable visit-only state when persistence is unavailable, and isolate player keys. Replay cannot re-award a sticker or repeat an already-earned star delta.
7. Keep narration exact-packaged-only. Reuse currently authored clips and exact text segments; any new coaching remains readable text unless an existing exact clip is proven. No new provider, device-voice, story, or image calls.
8. Add behavioral data/storage tests for all 12 worlds/bands, Askia level/round and clue attribution, stable wrong retry, recent-seed variation, invalid completion, getter/read/parse/set/readback failure, malformed/empty preservation, retry, idempotent completion and two-player isolation. Keep tests scoped to Dino data/components. Root owns shared shell/App/worker/storage-core changes, browser acquisition, compiled route matrix, public release, and final source/evidence commit.

## Proposed progress semantics (pre-implementation)

The pair-local Amari helper should expose a safe read status separately from normalized progress, distinguish missing from invalid/unavailable raw storage, and refuse writes unless the current raw record is successfully read and valid. A completion operation should return a committed-success result only after `setItem` and a parsed readback match the merged record; otherwise return a retryable failure without awards. Existing worlds/best stars/stickers must merge monotonically from a valid current record. Replay may improve best stars and award only the newly gained delta; a previously earned sticker stays idempotent. The map may allow world 0 in visit-only mode when storage is unavailable, but cannot claim durable completion or unlocks.

**Implementation, source gates, and compiled/public acceptance will be recorded after this contract is written.**

## Source implementation update — 29 October 2026

The Amari search bands now reveal evidence at different rates: Starter retains the bright taught trail, Growing starts with a partial trail, and Challenge starts without a visual trail but displays a baseline spatial word clue identifying the target row and left/middle/right region. A child can request a partial visual trail, then the full trail and exact direction; the exact spoken direction reuses the existing packaged clip. Optional clue use is recorded as assistance. Correct finds keep both facts held until Next/Finish, and duplicate advance/finish calls are synchronously guarded.

Amari completion now uses the dedicated progress helper's read status, fails closed on unavailable/unreadable/empty/malformed/unsupported records, preserves the existing `${playerId}_amari_dino_detective_batch3_v1` key shape and unknown valid record metadata, and requires a write plus readback before completing or celebrating. The final facts stay visible with Retry on failure. Its receipt ledger retains every possible positive star-improvement transaction (at most 36 across 12 worlds) and only the latest eight zero-delta replays, so later practice cannot evict a reward that still needs parent confirmation. It recovers the same transaction and star/sticker delta if a write succeeded but verification read failed; parent reward claims use the same stable receipt token, remain held for Retry when not confirmed, and reconcile quietly from positive receipts on map re-entry. Legacy completions without receipts are not replay-awarded. Rewards/unlock/sticker state are committed only once. The existing twelve-world/sticker content and incremental best-star rules remain.

Askia keeps footprint inspection as the required baseline trail lesson. On non-bright levels, the child can optionally request a clearer trail; only that optional action counts as assistance. The wrapper opts only Dino Detective into the existing pair-safe progress, compact start/done and held manual Next modes. Other Little-game defaults and shared shell behavior are unchanged by this component edit. No new spoken lines, biology facts, artwork, or paid calls were added.

Focused source checks: 17 Dino data/progress/Askia-clue/narration tests passed, zero skipped; scoped ESLint and `git diff --check` passed. This is source-level evidence only. Build identity, compiled controls, viewport review, persistence in the real app flow, and both-player native/public acceptance remain root-owned and pending.


## Shared integration contract — root, before candidate build

Hangman owns its four mission menus and bypasses the generic answer-count wrapper. The root-owned ownership test preserves the letters/German wrappers. Askia Dino opts into the existing five-game pair adapter; blocked read/write/readback, Retry/idempotency, replay, prior-map and legacy-ceiling behavior are exercised for`dino` as well as both rescue IDs. Its actual Little override now receives the unscaled Little callback, matching the adapter's8point first result. Amari's existing scaled callback remains unchanged.

A source review found that successful local completion plus failed readback could lose the external reward after Back/reload. The opt-in Pair7 parent API now accepts`rewardToken` only for`dino`/`hangman`. Claims and points share the authoritative per-child`rewards_v2` write/readback. Returning to an already-claimed token adds neither points nor plays; ordinary game awards retain claims. The return result includes`persisted`, `awardedPoints` and`recovered`, allowing held reward-confirmation Retry. A malformed/unreadable authoritative or legacy reward record is left untouched. The existing default award path remains available to other games.

Each game must reconcile positive **new-runtime receipts** quietly on reopening; legacy progress without receipts is not an award instruction. The root-owned Little shell restores its last positive Dino transaction and uses`dino:little:<transactionId>` both for the original finish and recovery. It does not trap Back. New starts pause only when an already-committed reward still cannot be confirmed, with an explicit retry action. Amari Detective and Hangman own their receipt reconciliation. Repeated recovery does not replay a reward celebration.

Claims are retained without an arbitrary hard-cap failure or pruning old proof. Present content has a natural bound: atmost3positive improvements per world/level, so even the conservative combined12worlds+5Littlelevels+4Hangmanmissions permit atmost63positive claims per child; ordinary replays create none. Root's10reward behavior tests include stale tabs, successful-write/readback-failure recovery, blocked writes, malformed preservation, child isolation, carry-through ordinary awards, mismatched tokens and300retained historical claims plus a new claim/retry. The independent source review preserves its original capacity finding and the resolution. These are source tests, not native acceptance.

Candidate worker is42; public remains the verified Pair6worker41 until this pair's source/build and real-control gates pass. No new provider job, profile, worktree or install is needed.


## Mobile release blocker and repair

The first compiled candidate `97849b93` / `arcade-DhIX2iKU.js` was **not released**. Its hardest mobile Hangman level exposed a real tap blocker: the floating daily mission panel covered the bottom keyboard row and intercepted the T key. The instrumented screenshot and partial report are retained in `hangman-native-keyboard-overlay-blocker-390-DhIX2iKU.jpg` and `native-hangman-amari-390-DhIX2iKU.json`. Earlier harness-selector, navigation, scope and bounded-diagnostics failures are separately retained; they are not app regressions. The first full mobile attempt exercised positive local-write/readback and parent-reward recovery before its diagnostics-only assertion failed.

Candidate `83aeda00` / `arcade-DVChNJa_.js` suppresses the floating mission tracker for Hangman, as already done for the other self-contained lesson screens, and compacts the mobile header/status row without reducing the 44px letter buttons. It passed the actual web build, 518 tests with zero skips, scoped lint and diff checks. A new native run must verify all 26 key centres are reachable with the clue and word visible, no horizontal or vertical keyboard clipping, then finish all four missions on phone and desktop. Public Pair7 acceptance remains pending until the corrected candidate passes the full six-journey matrix.

The next compiled fault rehearsal on `83aeda00` caught a second real layout blocker: an app-wide reward-save alert duplicated the game's held message and pushed `Retry reward` to y774–822 at390×740. The partial Detective report and failure screenshot remain retained. `a2d9d6e` / `arcade-CQIOM1Sm.js` keeps token-owning lesson failures beside their own held Retry action instead. The first final-candidate Amari mobile run completed all12worlds/60finds; local-save and parent-reward Retry bottoms were669.3px and the readback Retry bottom702.5px. The prior pending Jungle receipt recovered once on map re-entry (2points,1play), with no second award. Remaining final-source native journeys and public release are still pending.
