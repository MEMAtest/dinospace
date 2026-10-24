# Reward persistence repair — 24 October 2026

## Findings

The real in-app tab retained3 stars across reloads, but had no earned chapter badges. This does not establish where previously reported rewards were lost. Browser/device clarification was requested and remains unanswered. Saves are browser/origin local, with no account/cloud sync.

Two code defects were confirmed: PlayerSession saved stale star/sticker/play-count React snapshots in effects, so an older tab could replace newer totals. Addition, Subtraction and Counting saved completion only when the child pressed the final Finish chapter/Next after answering all six questions.

## Fix

Shared rewards now read/merge the latest saved record, synchronously commit stars/sticker IDs/play counts together before rendering, mirror legacy keys, and listen for storage/focus changes. No mount effect writes old reward snapshots. Existing higher legacy totals and earned sticker IDs are preserved. The record is a single synchronous localStorage write, not a cross-renderer database transaction; genuinely simultaneous writes are not claimed to have transactional isolation. A blocked authoritative reward write shows a warning with an explicit retry that does not award twice. Legacy mirror failure cannot erase the authoritative record.

The three maths games save completion immediately on the last correct answer, while holding the teaching explanation until the existing final button. Opening the shelf now explains device-local collections. No earned points or badges were invented for the real child.

## Verification

Runtime4a5313ceef1538e0df98df308b35d1931e1dbd75; deployment dpl_CmasMHH5Q3PqUeEirVEG73HXCvyZ; service-worker v29. Vercel metadata records the unambiguous short source prefix4a5313ce; served-production.json records the resolved full commit, entry, stylesheet availability and all six unchanged Shadow art hashes.

- Four focused tests cover sequential stale-tab awards, durable recovery when mirrors fail, blocked-write/retry without double award, and child-scoped legacy migration. Full suite357 passed / 1 existing skip / 0 failed. Scoped ESLint/build pass. Emitted PWA audit8 passed / 0 skips.
- Local, immutable candidate and canonical each exercised18 native questions at 390pxpx across Addition/Subtraction/Counting. Each finished chapter was reloaded before pressing its final button. Completed records, badges, stars and sticker IDs remained equal after reload; final canonical synthetic total17 stars and Bronze Rocket. No observed page/console errors or provider calls. These are targeted persistence checks, not a fresh whole-catalogue acceptance.
- Canonical and candidate use an explicitly prefixed synthetic storage namespace qa_rewards_20261024_, initialized with8 synthetic stars to cross a sticker threshold. Existing real and earlier QA keys are never cleared or overwritten. One reused headless browser/tab, no visible Chrome/incognito windows.
- Blocked-write UI tested locally with a synthetic quota failure. Warning visible; restoring storage and retry saved3 stars exactly once (17 to 20), then reload retained20.
- The actual user in-app tab was inspected without playing. Its3 stars and zero chapter collections remained unchanged after loading the new entry arcade-B_8Ynm9n.js. current-tab.png records that observation.

## Limits and remaining question

No cross-device/browser sync exists. This repair does not recover previously cleared/private-browser records, nor add partial in-progress run checkpoints throughout the catalogue. Most games retain completed levels/chapters; unfinished runs can still restart. The exact game/device and whether the loss occurs after a same-browser reload or device switch remains necessary to trace the user's full report. No claim that all26 games now meet5/5.

## Resource record

Reused canonical checkout/dependencies/build; no new worktree or dependency installation. One reopened contained headless session, retained for monitoring; task Vite server stopped at handoff. Compact reports, source rehearsal and one real-tab screenshot retained here; provider requests 0. Temporary full console logs remain task-owned in tmp for failure diagnosis, no corpus copied. Existing unrelated untracked evidence preserved.
