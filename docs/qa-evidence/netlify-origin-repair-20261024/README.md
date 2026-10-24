# Netlify origin repair — 24 October 2026

## Incident and cause

The user's phone screenshots show **https://dinospace.netlify.app**, not the Vercel URL previously monitored and deployed. Netlify's published deployment was **6abb06d64bc8ac000897eb8b**, source 52c9c0e53883f79a28abf988ae0496c376264e13, published 29 September 2026. It served old entry index-ClYrQrt8.js and worker v12; the canonical Vercel site served arcade-B_8Ynm9n.js and worker v29. The earlier assertion that the actual user tab showed current icons covered the desktop in-app Vercel tab, not this phone origin. Root missed that live-host distinction.

## Repair

The same Netlify site c9dcd11b-4029-44c0-910d-d40a13339eb8 now uses production gateway deployment **6adbfd835211194016579d30**, gateway source d48bff06. Its forced 200 server rewrite serves every path from the canonical Vercel app, preserving the Netlify browser origin (no301/302/location switch). It therefore preserves that origin's localStorage/IndexedDB and follows subsequent canonical releases without maintaining a second ageing app build. Only two tiny gateway files are published; no source/media corpus copied. netlify.toml now builds/publishes this gateway.

The old main-branch Netlify build pipeline is stopped so it cannot overwrite the gateway with September's source. Existing manual deploys remain possible; site-after.json verifies stop_builds=true and current deployment. Vercel runtime remains 4a5313ceef1538e0df98df308b35d1931e1dbd75, deployment dpl_CmasMHH5Q3PqUeEirVEG73HXCvyZ. No new provider calls, credentials, domains or child-account changes.

## Verification

- Candidate and production Netlify HTML, current JS/preload/stylesheets and service worker match Vercel byte for byte. Same Netlify address retained. Current cache v29.
- All 39catalogue world/game artwork files fetched once from the live Netlify address match canonical source SHA256 values. Both voice and Storybook session CORS preflights passed without paid generation. production-http.json contains exact results.
- Candidate then production: 18actual native questions each, three maths games at 390px, final correct answers persisted before final Finish/Next, reload retained chapter/sticker/star records; zero observed page/console errors or provider calls. Candidate used 8synthetic seed stars; canonical Netlify preserved 27prior synthetic stars and earned 9 more to 36, with rocket/dino stickers and earlier letters play count retained.
- The old Netlify page was opened before publishing and its old entry was confirmed. Synthetic legacy stars 27, rocket/dino stickers, letters play count 2 and favourite, plus one small IndexedDB sentinel, were recorded on that same origin. Final migration/reload retained all fields, 36 stars after the 9 actually earned test stars, no browser redirect. origin-migration.json records before/after. This is isolated synthetic evidence, not a read of the remote phone.
- Current worker activated. First migration attempt encountered an incomplete old v12worker install during the cutover and update rejected after that registration failed. QA explicitly re-registered the current worker with updateViaCache:none, with no site-data deletion; subsequent activation/reload passed. The first raw failure is retained in tmp/netlify-migration-native.log. A later world-image assertion initially ran before lazy images below the fold had decoded; scrolling/waiting produced five correct decoded v3world images. Neither discarded attempt is counted as clean final acceptance. The phone's already installed v12worker was not remotely inspected. Its navigation handler was verified network-first from the immutable old script; normal online reload obtains current HTML.
- Screenshots netlify-home-current.jpg and netlify-game-icons-current.jpg are from the existing isolated headless tab at phone width. Real in-app Vercel tab and the user's remote phone data were not modified. No claim that all 26 games meet editorial acceptance or historical missing rewards were recovered.

## Monitoring and rollback

The existing Amari heartbeat now checks **both** public origins, never infers Netlify health from Vercel, compares current entry/worker, and samples actual controls only in the existing synthetic headless tab. It retains quiet notifications for unchanged healthy state. New gateway failure or cross-origin/mismatched entry is actionable. No provider generation or site-data clearing permitted in monitoring.

Rollback reference: previous Netlify deployment6abb06d64bc8ac000897eb8b is still retained on the same site. An explicit Netlify restoreSiteDeploy of that id restores the previous site if a gateway failure requires rollback; it also restores the stale app, so root review is required. Re-enable Git builds only after reviewing the repository branch/configuration, never automatically. The canonical Vercel release was not changed by this repair.

## Resources

Reused one checkout and installed CLI/dependencies. No worktree, browser session/window/context/tab or media corpus copy. Existing one headless synthetic browser reused across origins. Two gateway files total under 1 KiB; final QA folder under 0.2 MiB. Raw provider/site inventory responses remain local ignored tmp files; retained reports whitelist IDs/statuses only. The old-worker install attempted its own cached media; no persistent corpus backup created and free space remained 91 GiB. No source originals, real progress or unrelated ignored data removed.

## Primary references

[Netlify rewrites retain the visitor URL](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/). [Stopped builds still allow manual CLI deploys](https://docs.netlify.com/build/configure-builds/stop-or-activate-builds/).
