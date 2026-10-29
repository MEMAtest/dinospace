# Storybook storage and backup audit

## Invariants before implementation

1. A write is successful only after its IndexedDB transaction completes. An individual request's `success` event is not a committed write; a later transaction abort must be reported as failure.
2. A readable empty library is distinct from unavailable or unreadable storage. Compatibility APIs may retain their historical return shapes, but inventory/restore paths must preserve that distinction and must never infer that records were deleted.
3. A failed open is retryable. A database connection closes on `versionchange`, drops from the cached connection after close, and can be reopened by a later operation.
4. Upgrading schema version 1 to 2 creates only missing object stores. It never deletes, clears, or rewrites existing books, assets, profiles, or series.
5. Book, asset, profile, and series save/delete results reflect committed transactions. Multi-record restore is atomic across books and assets: malformed data, a missing asset, request failure, or abort leaves prior records unchanged.
6. A backup is accepted only when every included book is complete and every referenced picture/audio asset is present, non-empty, correctly typed, unique, and associated with that book. Restore retains the existing duplicate-book policy and does not overwrite another saved book.
7. Failed or partial data reads remain visible as unavailable/errors to callers that need recovery decisions. Existing raw profile/series metadata and valid unknown child/book progress fields survive read-normalize-save and backup round trips; unsafe prototype keys are excluded.
8. Local-storage profile mirrors are updated only after a successful IndexedDB commit, and a failed IndexedDB save must not return a truthy success object.

## Pre-edit findings

- `transaction()` currently returns the action/request promise. The request can resolve before the transaction's `complete` event and a later abort is therefore missed by `saveStoryBook`/`saveStoryAsset`.
- `openDatabase()` caches a promise that catches open failure to `null`, permanently turning a transient first failure into a permanent unavailable state. It has no `versionchange`/closed-connection invalidation.
- The upgrade handler already creates missing stores without clearing existing data; this non-destructive behavior must remain.
- `saveChildProfile()` returns the normalised profile when IndexedDB fails, while also changing the local-storage mirror. Profile normalization drops unknown fields. Series save spreads unknown fields, but save success is request-based.
- `getStoryLibraryInventory()` distinguishes empty from failed reads, but generic getters intentionally collapse failures to empty/null for compatibility. Keep those APIs compatible and use the explicit inventory/recovery APIs where availability matters.
- `importStorybookRecords()` already batches books and assets in one transaction and waits for transaction completion, but does not validate all input records/assets at its boundary. Restore must reject incomplete input before mutation and leave existing records untouched on abort.
- Backup export validates required book media and backup parsing checks referenced asset completeness. Progress normalization reconstructs a narrow schema and drops unknown child/book metadata.

## Scope and verification

Storage and UI edits are limited to `src/data/storybookStorage.js`, `src/data/storybookBackup.js`, `src/data/storybookHydration.js`, `src/components/games/StorybookStudio.jsx`, the profile/series modal save handling, and focused storage/backup/hydration tests. Shared shell, worker, database clear/delete, imports from family books, browser, provider call, build, and deployment remain out of scope. Tests will cover request-success-followed-by-abort, retry after open failure/connection close, non-destructive migration, unavailable versus empty inventory, profile/series metadata preservation, and malformed/incomplete backup/import atomicity.

## Focused verification after changes

- `node --test test/storybookStorage.test.mjs test/storybookBackup.test.mjs test/storybookInventory.test.mjs test/storybookProfiles.test.mjs test/storybookAssets.test.mjs` — 21 passed, 0 failed, 0 skipped at the storage-audit checkpoint; the later combined focused storage/backup/hydration run is recorded below.
- Scoped ESLint on `storybookStorage.js`, `storybookBackup.js`, and the changed storage/backup/inventory tests — clean.
- `git diff --check` on the owned source, tests, and audit — clean.

## UI acceptance extension (before StorybookStudio integration)

1. Library inventory loads bundled catalogue, saved books, profiles, and series independently. A failed source remains explicitly unavailable; it must not suppress other successful sources or be presented as an empty collection.
2. Personal saved books have a prominent count and entry point alongside included stories. Search covers saved and included metadata; the library renders at most eight cards per page and offers an explicit Show more action. Only visible cards' cover images may be hydrated; cover audio and page assets remain unread until requested.
3. The reader loads only its current cover/page image and audio, with at most one previous reader screen retained by the manager. Moving screens, switching child, closing the book, leaving Studio, or disposing the manager pauses audio and releases stale URLs. Stale async results cannot update a different selected book/child.
4. Reader states distinguish loading, storage unavailable, a known missing asset, and a valid asset. Retry re-reads stored media only; it never calls generation providers. Missing/unavailable media keeps readable story text and does not claim a completed ready book.
5. Save/delete profile and series UI reflects only committed storage writes; failed results remain visible with a retry path and do not close/clear the user's form.
6. A custom book is shown Ready only after all expected image/audio assets validate in storage and the complete book record saves. Any failure preserves the generating/paused draft and an explicit resume/retry state. Library hydration does not bulk-load saved media or rewrite metadata.
7. Backup/restore remains explicit and accessible from parent tools; loading the library never imports QA or backup fixtures into family storage. Progress, paused/incomplete books, other-child books, and unknown metadata remain intact through these UI flows.

Implementation remains scoped to StorybookStudio plus the existing storage/hydration helpers and focused tests. Root owns candidate build, browser verification, shared shell, and release.


## UI integration verification checkpoint

- StorybookStudio now loads independent catalogue, saved-book, profile, and series inventories so one read failure does not hide successful sources. Saved story records remain metadata-only in the library; only the current eight cards request cover images. Search matches metadata across included and saved books, with eight-card previous/next pages.
- The reader requests only its current saved screen and previous screen, reports loading/unavailable/missing media distinctly, offers a storage-only retry, ignores stale book/page results, pauses audio on navigation, and releases URLs on leave/disposal.
- Profile and series saves/deletes now retain the form and show a retry error when storage returns false. Story generation still validates every expected stored asset before the Ready record is committed.
- `node --test test/storybookHydration.test.mjs test/storybookStorage.test.mjs test/storybookBackup.test.mjs test/storybookInventory.test.mjs test/storybookProfiles.test.mjs test/storybookAssets.test.mjs` — 34 passed, 0 failed, 0 skipped (includes the Dino owner’s strict story-progress and completion-receipt cases).
- Scoped ESLint on StorybookStudio, the profile/series modals, the hydrator, and focused Storybook tests — clean. `git diff --check` — clean.
- No browser/build/deployment was run; UI behavior still needs root candidate/native verification.

## Final review fixes: profile migration and reward receiver

- The profile inventory checks IndexedDB first and never consults the legacy mirror when that read is unavailable. Only a confirmed empty profile store can enter migration. Legacy JSON must be readable and valid; malformed, empty, duplicate-ID, or blocked data stays byte-for-byte untouched and is reported unavailable.
- Migration rechecks that the profile store is still empty inside one read/write transaction, adds every legacy/default profile atomically, then reads back and verifies every record. It does not rewrite the local-storage mirror. The compatibility getter uses this same availability-aware path rather than reporting unsaved fallback profiles.
- Completion receipts keep their original outer App player. New completions pass the `playerId` prop to `commitStoryCompletion`; receipt claims and quiet reconciliation run only when `receipt.rewardPlayerId` (or the historical reader child when absent) matches the current App player. Reopening a completed book under another player never transfers the reward or blocks reading.
- Added focused fake-IndexedDB coverage for fresh-default migration, multiple legacy readers and metadata, migration abort/rollback/retry, malformed/unreadable source preservation, database unavailability, and receipt receiver matching. Verification follows below.
- Final scoped verification: 41 Storybook tests passed (0 failed/skipped); scoped ESLint and `git diff --check` passed. No browser/build/deployment was run in this source-fix pass.

## Stored-media Retry repair

Root source review found that a decoded image/audio error could retain a cached object URL. Retry now pauses narration, invalidates only the current screen's stored image/audio keys, clears that image's error flag, refreshes visible cover hydration, and re-reads saved media. It never deletes or changes IndexedDB blobs and never calls a provider. Existing hydrator invalidation tests and a native cached-URL fault probe are required before acceptance.

## Native phone layout repair

Root's compiled Bad6 phone probe found the Next-page rectangle at y732–782 on a740px viewport. Computed styles showed the obsolete Tailwind minimum-height utility still forced a708px inner frame despite the compact reader rule; utility order also defeated single-class padding/gap rules. The frame now declares h-full/min-h-0, reader rules are scoped under the Storybook surface for sufficient specificity, and measured58px header+20px content padding are included in the78px chrome allowance. The actual failing computed-style record and screenshot are retained. A rebuilt reader geometry probe and full matrices are still required.

## Scrolled-library save failure

Desktop native QA found favourite-save Retry rendered above the current viewport. Root independently reproduced it at y−156 after scrolling486px, with the authoritative progress bytes unchanged. The three library save/reward warnings now share a sticky status group; the library uses overflow:clip (not an independent hidden scrolling container) so Retry remains anchored to the visible viewport. Reader warnings retain their fixed-height reader layout. Failure geometry and one screenshot are retained; patched Retry/hit-test plus a normal click must pass before release.
