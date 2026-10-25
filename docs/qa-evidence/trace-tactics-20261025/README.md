# Letter Trace and Cosmic Tic-Tac-Toe — 25 October 2026

## Acceptance before implementation

Baseline: public Netlify runtime `f85db347ab536951be3a7e10ddbda839597b088e`, worker32. Reuse existing chapter IDs, taught-letter settings and all earned records. No paid generation, new browser resources, worktrees or dependency installations.

| Game | Targeted release acceptance |
|---|---|
| Letter Trace | One clear drawing task; an accurate visible stroke guide without a conflicting font glyph; a moving stroke demonstration that grants no drawing progress/mastery. Pointer/touch drawing, keyboard alternative, interrupted/wrong/reversed trace retry, and dot strokes work. Eight distinct letters in each of three bands, mixed-case teaching and decodable word transfer. Word selection is a separate clear step; wrong word retries without discarding the trace. Held/replayable packaged success audio. All completed letters contribute to recent practice history, while only unaided first-try pointer traces record handwriting mastery. Chapter completion saves on the final answer before Finish; normal unlock, direct next chapter, replay, reload and exact parent return pass at390/1440. |
| Cosmic Tic-Tac-Toe | One clear tactic and mark legend; wrong moves leave the same board available to try again. Three distinct seeded boards per chapter across win/block/fork. The solved visual highlights the actual winning line, blocked threat or two distinct fork paths, with replayable packaged explanation held until Next. Earned mission/badge persistence and replay award safety. Full-game play offers a beginner bot, a Captain that cannot be beaten from a legal empty start, and two-player mode. Legal moves/terminal stops, win/draw/loss recovery, reset, leave/cancel and saved free-game totals work. Native controls≥48px, keyboard/touch and no overflow at390/1440. |

Rehearse the built candidate and final public Netlify deployment. Verify Vercel API/source identity, pinned gateway, worker, entry/style bytes and old-alias307. Keep technical playback separate from human listening; no automatic catalogue-wide5/5 editorial assignment. Evidence includes compact JSON and representative renders only.

## Status

**Released and functionally accepted for this targeted scope.** One public site: **https://dinospace.netlify.app**.

- Runtime: `88b979ccff207a8b11d27e0dc241e04938f93555`.
- Immutable backend: `dpl_Ex2ttDUcu7FPtkbCs2vDC2RbNspi`, `https://dinospace-bxci4lt96-memas-projects-23a0001d.vercel.app`.
- Published Netlify gateway: `6add476ad9832e1b3bb2beb5`; worker **v34**.
- Loaded browser module: `/assets/arcade-mE5Uz1qP.js`.

The gateway preserves the Netlify origin and existing storage. The old public Vercel root/index remain redirect-only307 links to Netlify. Historical editorial acceptance remains4/26; this release does not assign new5/5 scores or certify the other24 games. Personal-story recovery is outside this release.

## Delivered

### Letter Trace

One numbered drawing task, accurate path-only guide, directional arrows and an animated stroke demonstration. The duplicate font glyph and permanent technical footer are removed. Retry/keyboard tools are expandable. Big/little letter pairing remains visible; the final chapter changes to a separate picture-and-word activity after tracing, with wrong-word retry preserving the finished trace.

All practice updates recent-letter history, including guided and keyboard work. Only an unaided first-try hand trace can record handwriting mastery. Switching back from keyboard cannot convert assisted work into mastery. Every new round resets input mode. Interrupted/cancelled strokes restart safely; a lowercase i dot is completed by a real tap. A final correct answer saves the chapter before Finish, and the completion screen offers the next chapter directly. Existing taught-letter settings, chapter IDs, per-child data and awards are retained.

### Cosmic Tic-Tac-Toe

Dino/Rocket artwork replaces emoji board marks, with a clear mark legend and one tactic instruction. Wrong answers leave the same board open for an immediate retry. A solved board changes to review wording and highlights the actual winning line, blocked threat or both fork paths; packaged explanation can replay while Next remains held.

The rehearsal found that some fork boards have two valid answers, while the old game accepted only its hint square. Answers now validate the tactic itself; every valid alternate fork is accepted and the explanation follows the chosen mark. All transformed layouts are covered by tests.

Three seeded boards per lesson, direct next-lesson action, saved lesson badges and the collected shelf remain. Optional full games offer Scout, Captain and two-player play. Captain uses complete game-tree analysis and cannot lose from an empty legal board. Free-game Dino/Rocket/draw totals persist across New board and reload; duplicate terminal effects cannot count a board twice. Bot movement pauses behind the leave confirmation and resumes only after Keep playing.

## Evidence and acceptance

| Gate | Result |
|---|---|
| Source | **370/370 tests passed, zero failures/skips** with `PWA_BUILD_DIR=dist`; ESLint passed; production-configured build passed. Includes every legal human continuation against Captain, all alternate fork orientations, outcome idempotency and child isolation, guided practice history and existing geometry/packaged-audio/PWA tests. See `source-gates.json`. |
| Local/built candidate | All24 letters across three chapters and nine tactic boards plus three full-game outcomes rehearsed at390px; compiled desktop counterpart also passed. `local-*.json` and `build-*.json` retain preliminary observations. |
| Final public production | **72 rounds/boards across390×900 and1440×900**:48 traced letters,18 tactic boards and six full-game outcomes. All three chapters for each game at each width; eight distinct trace letters and three distinct tactic layouts per chapter. Exact current entry and active worker34 checked in every final report. |
| Input | Native touch and mouse strokes, keyboard guide and board activation, off-path start, interrupted stroke and touch cancellation, moving demo with zero progress/reward, wrong-word retry, one-use hints, same-board tactic retry, legal/terminal full games, Scout turn and Captain leave/cancel pause passed. Six further natural practice letters reached lowercase i; its line was touch-drawn and its dot tapped successfully (`production-dot-390.json`). No fixtures or ledger resets were used. |
| Feedback/media | Actual packaged explanations started and advanced during all six lesson/chapter types at both widths; feedback remained until the explicit next action. Zero failed art/audio responses, page/console errors or provider API requests. Technical playback is evidence of delivery, not a fresh subjective pronunciation/listening assessment of unchanged recordings. |
| Persistence/rewards | Reload after the first chapter's final answer **before Finish** retained its earned record. Final earned chapters, tactic badges and free-game totals survived reload; replay retained existing badges. Both corresponding sticker-shelf collections showed **3/3 collected** after reload. Independent handwriting mastery stayed unchanged when keyboard practice was toggled back to pointer mode. |
| Layout/navigation | Visible main controls≥48px, no horizontal overflow or broken pictures at both widths. Read & Write and Thinking & Play parent returns passed. Six representative before/final renders retained and visually reviewed. |
| Release identity | Vercel API verified READY and exact source SHA; Netlify published deploy verified with legacy Git builds stopped. Gateway preview and final public HTML/worker match the immutable backend and local build. Both modules and both stylesheets match the build bytes. Voice and story-outline OPTIONS preflights passed without provider requests; legacy entry307s and final unchanged app bytes verified. `candidate-http.json`, `production-http.json` and `production-identity.json`. |

Final source-bound browser records: `production-trace-390.json`, `production-trace-1440.json`, `production-tactics-390.json`, `production-tactics-1440.json`. The single synthetic browser's earned records were preserved throughout.

## Rehearsal repairs and release history

`failure-observations.json` retains the fork-answer defect and harness corrections. The initial reward assertion ran before the preceding completion celebration settled; moving the snapshot after that transition confirmed the demonstration itself awarded nothing. An interrupted lesson correctly resumed just its remaining board; a full replay was then run after natural completion. The route selector was corrected to the actual `read-write` world. HTTP checks use the actual story-outline route rather than the nonexistent API directory root.

The first public candidate `9af818c3`/worker33 was superseded during final visual review: its solved-board header still requested a new move. Final review wording and worker34 were released and **all public chapters were rerun on the final module**. `superseded-release.json` preserves that cutover identity. The final gateway publication restores its explanatory comments while retaining the same pinned backend; final API/readback checks confirm the same application bytes.

## Representative views

| Game | Before390px | Final390px | Final1440px |
|---|---|---|---|
| Letter Trace | [before](baseline-trace-390.jpg) | [phone](trace-390.jpg) | [desktop](trace-1440.jpg) |
| Cosmic Tic-Tac-Toe | [before](baseline-tactics-390.jpg) | [phone](tactics-390.jpg) | [desktop](tactics-1440.jpg) |

## Resources and handoff

Reused the canonical checkout, compatible installed dependencies and the single persistent synthetic headless Chromium session/tab/profile. **No new worktrees, dependency installs, browser resources or paid generation.** Existing approved Dino/Rocket assets were reused. The build was rebuilt in place (about413MiB), with no project copies or duplicate corpora.

Six retained JPEGs occupy459,261bytes; all final evidence and scripts total about0.6MiB. Six redundant task images/raw harness-error files were removed after preserving the unique observations. Task Vite development/preview servers were stopped. Original unrelated untracked/ignored evidence and every saved browser record are retained. The persistent profile remains below256MiB; measured size and disk before/after are in `cleanup-manifest.json`.

Quiet monitoring has the new runtime/gateway/worker baseline and includes these games in its small-sample rotation. Browser ownership is released while leaving the one headless session running. The recovery manifest records the previous stable immutable runtime and gateway without making another project backup.
