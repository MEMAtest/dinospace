# B4 service-worker media caching review

**Scope:** source/build behavior for eager installation, on-demand audio and story caching, range requests, and old-cache migration. This is not browser or listening acceptance.

## Result

The service worker now installs only the app shell and compiled application assets. Audio and story media remain in the production build and are cached after first use. A first visit to an unseen media URL still requires a network connection; the change does not claim an entire unused library is available offline.

The install path no longer fetches 10,741 English audio files, 79 German audio files, or 161 story files. In the frozen build, the 66 compiled assets total 24,650,377 bytes (23.51 MiB); the six shell files total 490,138 bytes, for 72 eager paths and 25,140,515 bytes (23.98 MiB). The build still ships all 10,741 English MP3s (303,269,823 bytes), 79 German MP3s (757,111 bytes), and 161 story files (30,536,248 bytes).

The worker uses a separate stable media cache. Successful full same-origin media responses are cached on demand, with the cache-write lifetime registered through `waitUntil`. A first single-range request fetches the full resource without the Range header, caches only the 200 response, and returns a synthesized 206. Cached full media can satisfy byte ranges, including suffix ranges; unsatisfiable ranges return 416. Network 206 responses are never cached. API and cross-origin requests bypass this handler.

On upgrade, old shell caches are pruned of app assets while retained media entries remain. Each old media item is copied into the stable media cache when requested. If migration storage fails, the old response remains available and the old cache is retained. This avoids a large activation-time migration and protects previously used offline media.

## Verification

- `npx eslint vite.config.js public/sw.js test/offlineServiceWorker.test.mjs` — passed.
- `node --test test/offlineServiceWorker.test.mjs` — passed 6 tests; the emitted-build audit is skipped without its environment variable.
- `PWA_BUILD_DIR=dist-on-demand-media-20261005-r5 node --test test/offlineServiceWorker.test.mjs` — passed 7/7, including emitted asset count/size, install request behavior, offline reuse, API exclusion, partial-response rejection, migration fallback, and first-range-online then offline range/full replay.
- Configured production build completed in `dist-on-demand-media-20261005-r5`; the test confirms every eager path is a compiled `/assets/` file and all authored audio/story files remain present.
- `git diff --check` — passed.

The worker tests execute service-worker events in a VM with a Cache API model that rejects 206 writes and enforces synchronous `waitUntil` registration. No browser session, provider call, or human listening test was used for this source/build review. Root will perform the independent review and browser delta separately.

## Evidence binding

Source base: `fd5509b792090c15477b85a16abae15646ce62e6` (the committed B4 media corpus/package). Exact changed-source hashes and frozen output identity are in the adjacent `identity.json`.
