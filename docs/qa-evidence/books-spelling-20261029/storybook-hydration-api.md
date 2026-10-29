# Storybook hydration API

`src/data/storybookHydration.js` exports `createStorybookHydrator({ readAsset, createObjectURL, revokeObjectURL })`. `readAsset` is the availability-aware `getStoryAssetInventory(key)` function and returns `{ available: boolean, blob: Blob | null }`. URL functions are optional; production defaults use `URL.createObjectURL` and `URL.revokeObjectURL`.

The returned manager exposes:

- `loadCover(book) -> Promise<{ available, image, audio: null, missingKeys, stale? }>` reads only `book.coverAssetKey`. It never reads cover audio for a library card.
- `loadScreen(book, index = -1) -> Promise<{ available, image, audio, missingKeys, stale? }>` reads the cover picture/recording for index `-1`, or only the selected page picture/recording for a valid page index. It keeps at most the current and previous requested screen.
- `retainCovers(keys) -> void` sets the visible card cover-key set and revokes no-longer-visible cover URLs. Call it with the current page's cover keys before loading those cards; use `[]` when no covers should remain.
- `releaseReader() -> void` drops reader-screen references and revokes reader URLs no longer shared with visible covers.
- `invalidateAsset(key) -> void` drops the cached object URL and any reader-screen cache containing a just-repaired key so the next load reads the committed blob again.
- `dispose() -> void` is idempotent, releases every existing URL and makes pending reads stale; late completions create no URL.

`available: false` means the storage read was unavailable or failed. A key appears in `missingKeys` only when storage was available and returned no blob. A stale result is tagged with `stale: true`; the caller should ignore it. Stored IndexedDB blobs are never modified or deleted by hydration. URLs are shared by key, concurrent reads coalesce, unavailable/missing reads are not cached, and object URLs are revoked when no visible cover/current-or-previous reader screen retains them.

Typical library integration is: derive the cover keys for the eight currently displayed books, call `retainCovers(keys)`, then call `loadCover(book)` for only those books. Reader integration calls `loadScreen(book, pageIndex)` when the current page changes, `releaseReader()` when leaving the reader, and `dispose()` when the owning component is permanently removed.
