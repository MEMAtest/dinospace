# Batch 1 closeout status — 21 October 2026

## Current merged-source verification

- Merged source under closeout: `eba6561ecd67cddff445910b6fd573565e2d9230`.
- Fresh canonical Vercel identity verification still reports deployment `dpl_BUNZ6wCdpYGtWEh1TDvx4k9iTbwv`, runtime commit `14f992a65ae01f2c0de5d21fcfa3ffb751b8dfbd`. This confirms the current canonical runtime identity; it does not show that the merged `eba6561e` source is deployed there.
- Root's cumulative browser rehearsal of the merged source is in progress as of this update. It is not recorded as complete, and no game score or acceptance is assigned.
- Source review found no concrete remaining Storybook/API defect. Scoped test counts are reported separately: root reports 60 focused tests, this audit ran 40 Storybook tests, and other scopes report 25 and 15 tests with overlap. These counts must not be summed.
- Human listening remains pending. Browser playback, receipt matching, byte checks, and media decoding establish technical playback only; they do not establish intelligibility or agreement between spoken audio and story text.

## Historical candidate review — 19 October 2026

## Release state

The evidence below was collected against the 19 October candidate, including Storybook source `2e000d34833bc0d99a2ec98601e869c6f42144f8`, not the current canonical runtime. No game received a final editorial score from that candidate review.

## Repairs made and rehearsed

- **Storybook Studio:** child-first reading shelf; parent creation tools (including series creation and draft retries, now absent from the child shelf); readable text drafts; bounded client requests; cancellation, pause, missing-asset retry and sibling settlement; decoding validation before Ready and before backup import; compact generated reading illustration; introduction pause/resume. Keyboard favourites no longer trigger the containing book card. Root fixed a missing icon import exposed by actual draft reading. Later review connected server-side requests to client disconnects and one shared deadline, disabled fallback on cancellation, and made creation checklist states follow saved counts. Native click-to-busy acknowledgment measured 19.5ms and cancellation returned in 150ms with simulated providers. Mocked handler tests cover disconnect during body reading and fallback signal reuse. Provider-internal processing after disconnect remains outside our control.
- **Spelling Studio:** meaningful 5/6/7 stages with held feedback, larger decodable queues and explicit graphemes, no untaught-word fallback, separate optional practice and caption saves, and reviewed SAT/PAT/MAT/RAG artwork. Three ordinary restarts per band passed with distinct seeds, repeated-letter/digraph builds, and a restricted s/a profile correctly supplied no untaught words. Full stages passed using native touch and keyboard; the profile was restored through the parent UI. A further review removed written/accessible target-answer leakage from independent tasks; explicit meaning clues now prevent independent credit. Safe diagnostics retain the clue/replay identifiers without authored content.
- **Memory Match:** highest resume level survives an earlier-board replay; increasing boards through 18 pairs; visible mismatch strategy and 1.5-second viewing window; discoverable 48px level controls. All ten boards completed at 390px and 1440px, then L2 replay and reload retained L10. Final visual review added an optional mobile “Focus on cards” view: all 36 L10 cards fit between y=154 and y=755 at 390×844, with 71.6px targets and 12px labels. With visible mismatch feedback, its bottom remains at y=809 inside the 844px viewport. Mismatch guidance remains visible, keyboard works, exiting restores tools without resetting moves, and desktop retains its ordinary tools. The same optional focus view now works on desktop: 90px targets and the whole L10 board fits between y=191 and y=751. A separate ordinary-UI rehearsal retained ten distinct L1 seeds and visible layouts, exactly two copies of each label, and verified advanced coaching from the saved efficient result on a later visit.
- **Letter Trace:** ordered segment projection, fractional guide interpolation, endpoint rounding tolerance, standalone dot recognition, native pointer-cancel continuation, and a keyboard equivalent. All 48 Amari chapter rounds completed at the two sizes. An additional 24-round ordinary Amari chapter sample reached lowercase i and passed its own native touch dot handler. Separate little-route checks passed closed O, uppercase I cancellation/resume, keyboard tracing, and native touch i/j dots. The little-route wrapper now states its real four-letter target.
- **Navigation:** the grown-up dashboard’s “Back to home” now navigates Home; daily challenge clutter is removed from Memory and Spelling gameplay.

## Evidence boundaries

JSON reports in this directory record actual local browser controls. Story generation recovery uses explicitly simulated providers, not paid provider health evidence. The reading report covers all seven curated books, 154 screens and 42 comprehension questions at both sizes. Packaged recordings were played and decoded; this does not constitute human listening acceptance. Shelf entries used normal browser cache; they are fresh navigations, not cold network loads. One original 563ms command-level page navigation is retained; ten focused rechecks measured 6.4–8.1ms native click-to-rendered-counter and 56–118ms command wall time.

## Approved provider work — 19 October closeout

Both fixed approvals were exercised and are complete. The absence of further provider work is not an open gate. See `approved-provider-qa/` for receipts, inventories, candidate deployment identity, native audio controls, readiness and the recoverable one-book backup. Do not restart or duplicate either approved job.

- **Spelling:** exactly 56 newly generated recordings, no automatic retries; 58/58 words ready including two reused recordings. Every file passed ffmpeg decoding, receipt hash matching and Chromium playback to `ended`. Ten actual “Hear the word” actions passed through the game UI across 390px and 1440px, with zero provider requests and no page errors.
- **Storybook:** one six-page synthetic book, **Pip and the Sunflower**, reached saved Ready with seven illustrations and seven narrations. All 14 binary files match successful provider receipts. Actual generation made 15 upstream requests, with no fallback/retry. Counting the failed local placeholder POST and a read-only placeholder auth GET conservatively gives 17 provider HTTP requests against the approved cap of 23. The local failure was a Vercel Sensitive export marker, not a broken deployed credential; the subsequent deployed provider handlers succeeded. No second book was generated.
- **Latency:** successful outline handling took about 11.5 seconds; all media responses arrived about 3 minutes 19 seconds after Create. Ready was observed later; this is not an exact first-Ready timing. The actual readable draft was opened while the last assets were still arriving. A complete narrated illustrated book is not instant, although reading the existing shelf does not require provider generation.
- **Deployment (19 October snapshot):** candidate source `2e000d34833bc0d99a2ec98601e869c6f42144f8` is hosted at unaliased deployment `dpl_5fUEez42um6ucgqd7wuPGgtjnoup`. Its API handlers used the configured hosted secrets. The local reader rehearsal used the same committed source through a bounded authenticated proxy; it is not canonical production gameplay proof. At that time, canonical production was recorded as `dpl_AZMdxgc4m9pQdnt4uDdsGAB9fjuY`; the 21 October identity verification is listed above.

## Remaining acceptance gates

1. Human listening remains unverified, distinct from technical decoding and browser playback.
2. Root's cumulative browser rehearsal is still in progress. After it finishes, reconcile the tested source identity with canonical deployment before final scoring or moving to Batch 2. The current canonical deployment is still the separately identified runtime above.
3. Historical candidate-only gates that did pass include saved-book restore (all 14 assets validated, existing titles retained, no provider requests), fourteen generated-book cover/page screens at 390px and 1440px, mobile playback through all seven generated narrations, desktop play/pause, unfinished page-4 resume after reload, and completed-book replay. These do not replace the current merged-source rehearsal or human listening.

## Resources and recovery

No clone, worktree or dependency install was created. Reused the existing contained `amari-targeted-contained` Chromium context and synthetic profiles. A stale file-chooser left the original QA tab unusable; only that tab was replaced inside the existing context, preserving storage. No unrelated tabs or Chrome windows were used. Browser harnesses and unique local failure logs remain under `output/playwright/batch1-20261019`; do not treat them as disposable merely because ignored. Generated originals are retained once under the Codex generated-images directory, with committed project-asset provenance here. Candidate QA artifacts currently total about 5 MiB after encoding final captures as WebP. Removed only two verified derived base64 fault fixtures (3,260,209 bytes) and intermediate PNG captures (8,671,563 bytes); retained their hashes and reconstruction/encoding records. The canonical QA backup remains intact. Unrelated functional-release evidence is preserved. No recurring monitoring was restarted.

## Final local technical check

80 focused tests pass; the cumulative build and explicit no-undef lint pass. Existing large-bundle warnings remain recorded. Eight final desktop/mobile captures show no horizontal overflow or page errors. These results support the candidate, not production acceptance.

## Approved-job resource closeout

No checkout, dependency install, browser context or tab was created in this approved-provider turn. Retained one compressed, receipt-matched backup of the newly generated book (3,621,058 bytes), its visual review and small JSON reports. Removed 19,865,230 bytes of verified duplicate exports and derived PNGs after validating exact asset recovery against the two canonical backups; see `approved-provider-qa/closeout-resource-recovery.json`. Existing unique failure logs, original media, rate journal, synthetic browser storage and unrelated files remain. The local provider proxy was stopped after all requests settled. The final label amendment is local and is not included in the unaliased 2e000d34 deployment.
