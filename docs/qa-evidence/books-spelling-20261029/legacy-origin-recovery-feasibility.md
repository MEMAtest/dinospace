# Legacy-origin Storybook recovery feasibility

## Finding

A local-only export from the original Vercel origin is technically feasible, but no evidence currently establishes that the 8–9 personal stories exist in that origin's browser database. The existing production page at the old public alias redirects `/` and `/index.html` to Netlify (`vercel.json`); origin-scoped IndexedDB does not move with that redirect. Directly opening a separate static URL on `dinospace-eight.vercel.app` would still execute on the old origin and could read its local database, if the same browser profile/device still has it. A static rescue URL is not present or verified yet.

Current recovery evidence remains **zero personal books recovered**. Historical logs establish one API creation sequence but no title/text or proof of browser persistence; historical provider-history access returned 401 with zero items. Those facts neither prove the old browser database is empty nor show that any books were found. See `docs/qa-evidence/personal-story-recovery-20261024/README.md` and `personal-history-read.json`.

## Storage and backup compatibility

The original schema is IndexedDB `amari-storybooks` version 1 with `books` (`id` key path) and `assets` (`key` key path). Current version 2 retains those stores and adds `profiles` and `series`; the upgrade creates only missing stores. The book/asset structures and IDs therefore have a direct recovery path. IndexedDB remains isolated by origin, so Netlify cannot read the old Vercel database directly.

The existing `amari-storybooks` backup format version 1 is compatible for any custom book whose record validates and whose cover image/audio plus every page image/audio asset are all present and nonempty. The `status` value alone does not determine compatibility; completeness of every referenced asset does. A draft with missing or unfinished media fails the current backup validator, which requires every asset. The smallest rescue should export complete records through the existing format and clearly list incomplete drafts as **not yet importable**; do not label them recovered into the canonical app. Preserve incomplete raw records only through a separately labelled archival format if that scope is later approved.

The canonical importer uses a single IndexedDB read/write transaction for each backup's new books and their assets. It skips colliding book IDs rather than overwriting them and aborts if the 20-book limit would be exceeded. Reading progress is applied afterward in separate localStorage writes and only for child IDs already present in canonical profiles. Thus book/assets import is atomic and non-overwriting; progress/profile import is separate and can be incomplete. A retry can retain the already imported books, but an ID collision will not replace an existing partial canonical book with a fuller legacy copy.

## Smallest safe rescue page

After Pair 8 acceptance, add one small standalone static file at an unredirected path such as `/storybook-recovery.html` on the old Vercel origin, plus a visible parent-tools link in the canonical Storybook app that opens that exact URL in a new tab. The page must have no playable app shell, service-worker registration, API calls, uploads, or writes to IndexedDB/localStorage. It should explain that it checks only this browser's old-origin data and that an empty/unavailable read is not evidence of deletion.

On the user's explicit **Check this browser** action:

1. Use `indexedDB.databases()` to verify that `amari-storybooks` already exists before opening it. If database enumeration is unavailable, the page must stop without calling `indexedDB.open`, because an unversioned open on a missing database can create an empty database and falsely look like a successful check.
2. Open the existing database without a version argument, read `books` and `assets` only in read-only transactions, do not upgrade or modify stores, and close the connection. Report counts and per-book readiness only; do not send contents elsewhere.
3. Let the user download a separate version-1 compatible backup for each complete book. Keep export bounded to one book at a time, retain original IDs/records/assets and available progress, validate before download, and use a local `Blob` download. Show a clear incomplete-media warning for drafts that the current import format cannot represent.
4. Provide a return link to `https://dinospace.netlify.app/`. On the canonical site, the existing visible **Restore a story backup** flow performs the atomic, skip-on-ID-collision book/asset import. Report skipped IDs and the separate progress-import limitations; never silently overwrite or claim that progress was restored when no matching profile exists.

Before exposing the link, a deployment owner must verify that the static file is served directly from the old alias without the root redirect or SPA HTML fallback, and that opening the direct route cannot silently create a database. This feasibility review made no deployment, network request, browser inspection, IndexedDB read, profile change, or import. There is no personal story text or record in this artifact.
