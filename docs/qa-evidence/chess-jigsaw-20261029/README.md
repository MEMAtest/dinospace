# Full Chess vs computer and Dino Jigsaw — Pair9

**Targeted functional acceptance passed, compiled and live.** The one public app is https://dinospace.netlify.app. Runtime `f23cdf260b3e97af0713025cf23ce9cfe68f2bef`, module `/assets/arcade-Bj2sEAsW.js`, worker `amari-discovery-v45`; backend deployment `dpl_2jebyooi9u6LzHmC3KCsv9W1D2CB`, Netlify gateway `6ae30bd15236dd6d24d144c7`. The old Vercel root/index remain redirect-only entry links.

## Delivered behavior

Chess Explorers now prominently offers **Play a full game vs computer** alongside its retained lessons. The standard8×8 board supports legal moves, castling, en passant, four promotion choices, checkmate and draw rules, with a bounded bundled computer worker, three difficulties, either player colour, move review, Undo, confirmed New Game and per-child saved matches. The completed board stays visible until Finish. Resume restores the saved side/difficulty even if setup options were edited. Pending completion receipts drain safely and retain Retry without marking an unfinished match complete. Rewards are earned once per difficulty; replay adds none.

Dino Jigsaw retains five legacy level indexes and its2→4→8→mixed8/12→12-piece progression, with six authored dinosaur targets. Harder levels use optional picture clues without automatic exact-placement hints. Assistance is recorded truthfully; wrong pieces stay available. The finished picture and spatial explanation stay held until Next/Finish. Strict per-child write/readback, Retry and idempotent parent claims preserve sibling games, legacy ceilings and earlier stickers. Compact start art cannot cover level buttons; desktop board/tray use separate grid columns; the12-piece phone board, tray and feedback fit together without scrolling.

## Acceptance evidence

`production-summary.json` is the final index; referenced JSON files include content hashes. `source-gates.json` binds613 passing source tests, zero skips, scoped lint and the production build to the runtime above. Rare chess rules are independent engine fixtures, not a claim that every special-rule UI path was naturally played.

`native-summary.json` and `production-matrix-summary.json` each require18 accepted cases on the exact entry: two Chess viewports plus16 Jigsaw cases (Askia L1–L5 and Amari L3–L5, each at390×740/1440×844). Each Jigsaw matrix completes64 puzzles. Each Chess viewport tests six normal openings with independently replayed legal histories, a full natural checkmate and zero-reward replay, wrong moves, local save/readback Retry, reload, edited-selector Resume, Undo, canceled replacement and stale computer-response cancellation. Canonical Chess also verified Retry after the naturally earned first Beginner reward.

Canonical Jigsaw verified all four naturally eligible failure/recovery paths: blocked progress write, committed progress readback, blocked parent reward write and committed parent reward readback. Retry keeps the transaction and pays once. One CDP-emulated touch sample proves cancel credits zero and release places one; this is not physical-device certification. Normal parent navigation, reload and same-level replay preserve progress with zero added reward. Exact packaged prompt playback and mute cancellation were observed. Final accepted runs report no provider attempts, resource failures, page errors or console errors. Representative live renders are hash-indexed in `render-manifest.json`; two Jigsaw filenames retain a legacy `native` helper prefix because the original production reports reference them.

`production-http.json`, `production-gateway-identity.json`, `immutable-identity.json`, `production-art.json` and `production-pair-assets.json` verify the public gateway, exact core bytes, six retained Shadow art hashes,39 catalogue asset availability checks, new Chess worker bytes and distributed chess.js license. Unchanged Storybook/Spelling inventories remain in Pair8 evidence; they were not downloaded again for this pair.

`cutover-retention.json` verifies actual **Refresh games** from the old open tab:76 localStorage hashes, all IndexedDB stores and14 QA story media blobs (3,729,264 bytes) remained identical. The first post-refresh snapshot preceded asynchronous worker activation; a later read-only snapshot confirmed activated worker45, no update notice and the same protected hashes. This was not a stale HTML or gameplay failure. QA story retention does not recover the family's unlocated personal books.

## Historical findings and limits

Original failures remain unchanged: uneven desktop Chess ranks; self-canceling pending-reward recovery; edited setup leaking into Resume; Jigsaw preview covering level controls; desktop feedback squeezing the board; and12-piece phone feedback below the viewport. All were repaired before this pair's canonical acceptance. Harness-only stops are recorded separately, including duplicate Home locators, a prior transaction correctly surviving a blocked repeat write, and normal reload restoring the game route. A loopback rebuild asset observation is not a public failure.

`reward-compatibility-review.json` documents reserved `dino:chess:`/`dino:jigsaw:` claim tokens that older open decoders retain, with actual game attribution unchanged. Reserved scope case is normalized; provisional native aliases normalize only at a legitimate commit. `unused-metadata-candidate.json` records an unpublished candidate whose release metadata was mistyped; the corrected deployment identity passed before the Netlify gateway changed.

No new paid narration, story or image calls were made. No blanket editorial/listening score, whole-catalogue acceptance, physical-device proof or historical personal-book recovery is claimed. Remaining pairs and final retained-game integration stay tracked in `docs/game-delivery-20261027/queue.json`. Monitoring remains deleted.

`resource-manifest.json` records reuse of the canonical checkout and single persistent synthetic profile, the one small pinned chess.js dependency, retained evidence and task-owned temporary cleanup. Original assets, historical failure evidence and other worktrees remain untouched.
